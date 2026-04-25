import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function getVehicles() {
  const { data } = await supabase
    .from('vehicles')
    .select('id, slug, name, category, transmission, fuel, year, price_daily, price_weekly, is_active, specs, images')
    .eq('is_active', true)
    .order('sort_order');
  return data || [];
}

async function checkAvailability(vehicleId: string, pickupDate: string, returnDate: string) {
  const { data } = await supabase
    .from('reservations')
    .select('id, pickup_date, return_date, status')
    .eq('vehicle_id', vehicleId)
    .in('status', ['pending', 'confirmed'])
    .or(`and(pickup_date.lte.${returnDate},return_date.gte.${pickupDate})`);
  return (data || []).length === 0;
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
}) {
  const { data, error } = await supabase
    .from('reservations')
    .insert({ ...params, source: 'website' })
    .select('id')
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, id: data.id };
}

const geminiTools = [{
  function_declarations: [
    {
      name: 'get_vehicles',
      description: 'Get all available vehicles with their details, prices, and specs. Call this when the user asks about vehicles, prices, fleet, what cars are available, etc.',
      parameters: { type: 'OBJECT', properties: {} },
    },
    {
      name: 'check_availability',
      description: 'Check if a specific vehicle is available for the given dates.',
      parameters: {
        type: 'OBJECT',
        properties: {
          vehicle_id: { type: 'STRING', description: 'The vehicle UUID' },
          pickup_date: { type: 'STRING', description: 'Pickup date in YYYY-MM-DD format' },
          return_date: { type: 'STRING', description: 'Return date in YYYY-MM-DD format' },
        },
        required: ['vehicle_id', 'pickup_date', 'return_date'],
      },
    },
    {
      name: 'create_reservation',
      description: 'Create a new reservation. Only call this when the user has provided ALL required info: name, phone, vehicle, pickup date, return date, and pickup location.',
      parameters: {
        type: 'OBJECT',
        properties: {
          vehicle_id: { type: 'STRING', description: 'The vehicle UUID' },
          customer_name: { type: 'STRING', description: 'Customer full name' },
          customer_phone: { type: 'STRING', description: 'Customer phone number' },
          customer_email: { type: 'STRING', description: 'Customer email (optional)' },
          pickup_date: { type: 'STRING', description: 'Pickup date YYYY-MM-DD' },
          return_date: { type: 'STRING', description: 'Return date YYYY-MM-DD' },
          pickup_location: { type: 'STRING', description: 'Pickup location' },
          return_location: { type: 'STRING', description: 'Return location (defaults to pickup location)' },
          notes: { type: 'STRING', description: 'Additional notes' },
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

async function executeToolCall(name: string, args: Record<string, string>) {
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
      });
      return JSON.stringify(result);
    }
    default:
      return JSON.stringify({ error: 'Unknown function' });
  }
}

interface GeminiPart {
  text?: string;
  functionCall?: { name: string; args: Record<string, string> };
  functionResponse?: { name: string; response: unknown };
}

interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const contents: GeminiContent[] = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    let response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        tools: geminiTools,
        tool_config: { function_calling_config: { mode: 'AUTO' } },
        generationConfig: { maxOutputTokens: 1024 },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Gemini API error:', err);
      return NextResponse.json({ error: 'AI service error' }, { status: 500 });
    }

    let data = await response.json();
    let parts: GeminiPart[] = data.candidates?.[0]?.content?.parts || [];

    let iterations = 0;
    while (iterations < 5) {
      const functionCalls = parts.filter((p: GeminiPart) => p.functionCall);
      if (functionCalls.length === 0) break;
      iterations++;

      const functionResponses: GeminiPart[] = [];
      for (const part of functionCalls) {
        const fc = part.functionCall!;
        const result = await executeToolCall(fc.name, fc.args);
        functionResponses.push({
          functionResponse: {
            name: fc.name,
            response: JSON.parse(result),
          },
        });
      }

      contents.push({ role: 'model', parts });
      contents.push({ role: 'user', parts: functionResponses });

      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          tools: geminiTools,
          tool_config: { function_calling_config: { mode: 'AUTO' } },
          generationConfig: { maxOutputTokens: 1024 },
        }),
      });

      if (!response.ok) {
        return NextResponse.json({ message: 'Izvinite, AI servis je trenutno nedostupan. Kontaktirajte nas na +387 63 09 09 08.' });
      }

      data = await response.json();
      parts = data.candidates?.[0]?.content?.parts || [];
    }

    const textParts = parts.filter((p: GeminiPart) => p.text);
    const content = textParts.map((p: GeminiPart) => p.text).join('\n') || 'Izvinite, došlo je do greške. Pokušajte ponovo.';
    return NextResponse.json({ message: content });
  } catch (e) {
    console.error('Chat API error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
