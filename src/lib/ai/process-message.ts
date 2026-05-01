import { createClient } from '@supabase/supabase-js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// --- Supabase data functions ---

async function getVehicles() {
  const { data } = await supabase
    .from('vehicles')
    .select('id, slug, name, category, transmission, fuel, year, price_daily, price_weekly, is_active, specs, images')
    .eq('is_active', true)
    .order('sort_order');
  return data || [];
}

async function checkAvailability(vehicleId: string, pickupDate: string, returnDate: string) {
  const { data, error } = await supabase
    .from('reservations')
    .select('id, pickup_date, return_date, status')
    .eq('vehicle_id', vehicleId)
    .in('status', ['pending', 'confirmed'])
    .lte('pickup_date', returnDate)
    .gte('return_date', pickupDate);
  if (error) {
    console.error('checkAvailability error:', error);
    return false;
  }
  return data.length === 0;
}

async function createReservation(params: {
  vehicle_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  pickup_date: string;
  return_date: string;
  pickup_location: string;
  return_location: string;
  notes?: string;
  source: string;
}) {
  let totalPrice: number | null = null;
  if (params.vehicle_id) {
    const { data: vehicle } = await supabase
      .from('vehicles')
      .select('price_daily')
      .eq('id', params.vehicle_id)
      .single();
    if (vehicle?.price_daily) {
      const days = Math.max(1, Math.ceil(
        (new Date(params.return_date).getTime() - new Date(params.pickup_date).getTime()) / (1000 * 60 * 60 * 24)
      ));
      totalPrice = vehicle.price_daily * days;
    }
  }

  const { data, error } = await supabase
    .from('reservations')
    .insert({ ...params, total_price: totalPrice })
    .select('id')
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, id: data.id };
}

// --- Gemini tool definitions ---

const geminiTools = [{
  function_declarations: [
    {
      name: 'get_vehicles',
      description: 'Get all available vehicles with their details, prices, and specs. Call this when the user asks about vehicles, prices, fleet, what cars are available, etc.',
      parameters: { type: 'OBJECT' as const, properties: {} },
    },
    {
      name: 'check_availability',
      description: 'Check if a specific vehicle is available for the given dates.',
      parameters: {
        type: 'OBJECT' as const,
        properties: {
          vehicle_id: { type: 'STRING' as const, description: 'The vehicle UUID' },
          pickup_date: { type: 'STRING' as const, description: 'Pickup date in YYYY-MM-DD format' },
          return_date: { type: 'STRING' as const, description: 'Return date in YYYY-MM-DD format' },
        },
        required: ['vehicle_id', 'pickup_date', 'return_date'],
      },
    },
    {
      name: 'create_reservation',
      description: 'Create a new reservation. Only call this when the user has provided ALL required info: name, phone, vehicle, pickup date, return date, and pickup location.',
      parameters: {
        type: 'OBJECT' as const,
        properties: {
          vehicle_id: { type: 'STRING' as const, description: 'The vehicle UUID' },
          customer_name: { type: 'STRING' as const, description: 'Customer full name' },
          customer_phone: { type: 'STRING' as const, description: 'Customer phone number' },
          customer_email: { type: 'STRING' as const, description: 'Customer email (optional)' },
          pickup_date: { type: 'STRING' as const, description: 'Pickup date YYYY-MM-DD' },
          return_date: { type: 'STRING' as const, description: 'Return date YYYY-MM-DD' },
          pickup_location: { type: 'STRING' as const, description: 'Pickup location' },
          return_location: { type: 'STRING' as const, description: 'Return location (defaults to pickup location)' },
          notes: { type: 'STRING' as const, description: 'Additional notes' },
        },
        required: ['vehicle_id', 'customer_name', 'customer_phone', 'pickup_date', 'return_date', 'pickup_location'],
      },
    },
  ],
}];

const SYSTEM_PROMPT = `Ti si SV Cars AI asistent za rent-a-car kompaniju u Mostaru, Bosna i Hercegovina.

TVOJE INFORMACIJE O FIRMI:
- Ime: SV Cars
- Adresa: Vojno bb, 88000 Mostar, BiH
- Telefon: +387 63 09 09 08
- Email: info@sv-cars.ba
- Radno vrijeme: 08:00 - 20:00, svaki dan
- WhatsApp: +387 63 09 09 08
- Dostava vozila na adresu, aerodrom, hotel — u Mostaru besplatno, šire po dogovoru

PRAVILA:
- Odgovaraj na jeziku kojim ti se korisnik obraća (bosanski/hrvatski/srpski ili engleski)
- Budi ljubazan, koncizan i profesionalan
- Kada korisnik pita za vozila, UVIJEK pozovi get_vehicles da dobiješ aktuelne podatke iz baze
- Kada korisnik želi provjeriti dostupnost, pozovi check_availability
- Za rezervaciju, sakupi SVE potrebne podatke (ime, telefon, vozilo, datume, lokaciju) prije nego pozoveš create_reservation
- Cijene su u KM (konvertibilna marka). price_daily je dnevna cijena, price_weekly je sedmična cijena (popust za duži najam)
- Ako vozilo nema price_weekly, nema sedmičnog popusta
- Za najam treba: važeća lična karta/pasoš + vozačka dozvola
- Minimalna dob vozača: 21 godina za standardna vozila, 25 za premium
- Sva vozila su osigurana i redovno održavana
- Moguće preuzimanje van radnog vremena po dogovoru
- Besplatan GPS i dječja sjedalica na upit
- Kategorije: economy, compact, suv, premium, van, quad
- Današnji datum je: ${new Date().toISOString().split('T')[0]}

NIKADA ne izmišljaj vozila ili cijene — uvijek koristi get_vehicles za tačne podatke.
Ako nemaš dovoljno informacija za rezervaciju, pitaj korisnika za preostale podatke.`;

// --- Tool execution ---

async function executeToolCall(name: string, args: Record<string, string>, source: string) {
  switch (name) {
    case 'get_vehicles': {
      const vehicles = await getVehicles();
      return JSON.stringify(vehicles.map(v => ({
        id: v.id,
        name: v.name,
        category: v.category,
        transmission: v.transmission === 'automatic' ? 'automatik' : 'manual',
        fuel: v.fuel === 'diesel' ? 'dizel' : v.fuel === 'petrol' ? 'benzin' : v.fuel,
        year: v.year,
        price_daily: `${v.price_daily} KM`,
        price_weekly: v.price_weekly ? `${v.price_weekly} KM/dan` : null,
        specs: v.specs,
      })));
    }
    case 'check_availability': {
      const available = await checkAvailability(args.vehicle_id, args.pickup_date, args.return_date);
      return JSON.stringify({ available, vehicle_id: args.vehicle_id, pickup_date: args.pickup_date, return_date: args.return_date });
    }
    case 'create_reservation': {
      const result = await createReservation({
        vehicle_id: args.vehicle_id,
        customer_name: args.customer_name,
        customer_phone: args.customer_phone,
        customer_email: args.customer_email,
        pickup_date: args.pickup_date,
        return_date: args.return_date,
        pickup_location: args.pickup_location,
        return_location: args.return_location || args.pickup_location,
        notes: args.notes,
        source,
      });

      if (result.success) {
        const { data: vehicle } = await supabase
          .from('vehicles')
          .select('name')
          .eq('id', args.vehicle_id)
          .single();

        import('../email/send-notification').then(({ notifyReservationCreated }) =>
          notifyReservationCreated({
            customerName: args.customer_name,
            customerPhone: args.customer_phone,
            customerEmail: args.customer_email || undefined,
            vehicleName: vehicle?.name || undefined,
            pickupDate: args.pickup_date,
            returnDate: args.return_date,
            pickupLocation: args.pickup_location,
            returnLocation: args.return_location || args.pickup_location,
            source,
          })
        ).catch(() => {});
      }

      return JSON.stringify(result);
    }
    default:
      return JSON.stringify({ error: 'Unknown function' });
  }
}

// --- Gemini types ---

interface GeminiPart {
  text?: string;
  functionCall?: { name: string; args: Record<string, string> };
  functionResponse?: { name: string; response: unknown };
  thoughtSignature?: string;
}

interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

// --- Main exported function ---

export interface MessageContext {
  platform: 'web' | 'instagram' | 'whatsapp';
  userId?: string;
}

export interface ProcessMessageInput {
  messages: { role: string; content: string }[];
  context: MessageContext;
}

export interface ProcessMessageResult {
  message: string;
}

export async function processMessage({ messages, context }: ProcessMessageInput): Promise<ProcessMessageResult> {
  const source = context.platform === 'instagram' ? 'instagram_dm'
    : context.platform === 'whatsapp' ? 'whatsapp'
    : 'website';

  const contents: GeminiContent[] = messages.map((m) => ({
    role: (m.role === 'assistant' ? 'model' : 'user') as 'user' | 'model',
    parts: [{ text: m.content }],
  }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const payload = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents,
    tools: geminiTools,
    tool_config: { function_calling_config: { mode: 'AUTO' } },
    generationConfig: { maxOutputTokens: 1024 },
  };

  let response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('Gemini API error:', err);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  let data = await response.json();
  let parts: GeminiPart[] = data.candidates?.[0]?.content?.parts || [];

  let iterations = 0;
  while (iterations < 5) {
    const functionCalls = parts.filter((p) => p.functionCall);
    if (functionCalls.length === 0) break;
    iterations++;

    const functionResponseParts: GeminiPart[] = [];
    for (const part of functionCalls) {
      const fc = part.functionCall!;
      const result = await executeToolCall(fc.name, fc.args, source);
      functionResponseParts.push({
        functionResponse: {
          name: fc.name,
          response: { result: JSON.parse(result) },
        },
      });
    }

    contents.push({ role: 'model', parts });
    contents.push({ role: 'user', parts: functionResponseParts });

    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, contents }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error on tool follow-up: ${response.status}`);
    }

    data = await response.json();
    parts = data.candidates?.[0]?.content?.parts || [];
  }

  const textParts = parts.filter((p) => p.text);
  const content = textParts.map((p) => p.text).join('\n') || 'Izvinite, došlo je do greške. Pokušajte ponovo.';

  return { message: content };
}
