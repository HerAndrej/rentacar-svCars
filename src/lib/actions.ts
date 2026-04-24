'use server';

// Server Actions for form submissions
// For now these log to console. When Supabase is connected, they insert into the database.

interface ReservationData {
  vehicleId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  returnLocation: string;
  notes?: string;
}

interface ContactData {
  name: string;
  email?: string;
  phone?: string;
  message: string;
}

export async function createReservation(data: ReservationData) {
  // TODO: Replace with Supabase insert when connected
  // const supabase = await createServerSupabaseClient();
  // const { data: reservation, error } = await supabase
  //   .from('reservations')
  //   .insert({
  //     vehicle_id: data.vehicleId,
  //     customer_name: data.customerName,
  //     customer_phone: data.customerPhone,
  //     customer_email: data.customerEmail,
  //     pickup_date: data.pickupDate,
  //     return_date: data.returnDate,
  //     pickup_location: data.pickupLocation,
  //     return_location: data.returnLocation,
  //     notes: data.notes,
  //     source: 'website',
  //   })
  //   .select()
  //   .single();

  console.log('New reservation:', data);
  return { success: true, message: 'Rezervacija uspjesno poslana!' };
}

export async function sendContactMessage(data: ContactData) {
  // TODO: Replace with Supabase insert when connected
  // const supabase = await createServerSupabaseClient();
  // const { error } = await supabase
  //   .from('contact_messages')
  //   .insert({
  //     name: data.name,
  //     email: data.email,
  //     phone: data.phone,
  //     message: data.message,
  //   });

  console.log('New contact message:', data);
  return { success: true, message: 'Poruka uspjesno poslana!' };
}
