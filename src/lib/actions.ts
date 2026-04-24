'use server';

import { createServerSupabaseClient } from './supabase-server';

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
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from('reservations')
    .insert({
      vehicle_id: data.vehicleId,
      customer_name: data.customerName,
      customer_phone: data.customerPhone,
      customer_email: data.customerEmail,
      pickup_date: data.pickupDate,
      return_date: data.returnDate,
      pickup_location: data.pickupLocation,
      return_location: data.returnLocation,
      notes: data.notes,
      source: 'website',
    });

  if (error) {
    return { success: false, message: 'Greška pri slanju rezervacije. Pokušajte ponovo.' };
  }
  return { success: true, message: 'Rezervacija uspješno poslana!' };
}

export async function sendContactMessage(data: ContactData) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from('contact_messages')
    .insert({
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
    });

  if (error) {
    return { success: false, message: 'Greška pri slanju poruke. Pokušajte ponovo.' };
  }
  return { success: true, message: 'Poruka uspješno poslana!' };
}
