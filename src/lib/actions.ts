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
  totalPrice?: number;
  source?: string;
  status?: string;
  createdByStaff?: string;
}

interface ContactData {
  name: string;
  email?: string;
  phone?: string;
  message: string;
}

export async function createReservation(data: ReservationData) {
  const supabase = await createServerSupabaseClient();

  let totalPrice = data.totalPrice || null;
  if (!totalPrice && data.vehicleId) {
    const { data: vehicle } = await supabase
      .from('vehicles')
      .select('price_daily')
      .eq('id', data.vehicleId)
      .single();
    if (vehicle?.price_daily) {
      const days = Math.max(1, Math.ceil(
        (new Date(data.returnDate).getTime() - new Date(data.pickupDate).getTime()) / (1000 * 60 * 60 * 24)
      ));
      totalPrice = vehicle.price_daily * days;
    }
  }

  const { data: inserted, error } = await supabase
    .from('reservations')
    .insert({
      vehicle_id: data.vehicleId || null,
      customer_name: data.customerName,
      customer_phone: data.customerPhone,
      customer_email: data.customerEmail,
      pickup_date: data.pickupDate,
      return_date: data.returnDate,
      pickup_location: data.pickupLocation,
      return_location: data.returnLocation,
      notes: data.notes,
      source: data.source || 'website',
      total_price: totalPrice,
      status: data.status || 'pending',
      created_by_staff: data.createdByStaff || null,
    })
    .select('*, vehicle:vehicles(name)')
    .single();

  if (error) {
    return { success: false, message: 'Greška pri slanju rezervacije. Pokušajte ponovo.' };
  }

  import('./email/send-notification').then(({ notifyReservationCreated }) =>
    notifyReservationCreated({
      customerName: inserted.customer_name,
      customerPhone: inserted.customer_phone,
      customerEmail: inserted.customer_email || undefined,
      vehicleName: inserted.vehicle?.name || undefined,
      pickupDate: inserted.pickup_date,
      returnDate: inserted.return_date,
      pickupLocation: inserted.pickup_location,
      returnLocation: inserted.return_location,
      totalPrice: inserted.total_price || undefined,
      source: inserted.source,
    })
  ).catch(() => {});

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

  import('./email/send-notification').then(({ notifyContactMessage }) =>
    notifyContactMessage({
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
    })
  ).catch(() => {});

  return { success: true, message: 'Poruka uspješno poslana!' };
}

export async function updateReservationStatus(id: string, status: string) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('reservations')
    .update({ status })
    .eq('id', id);

  if (error) {
    return { success: false, message: 'Greška pri ažuriranju statusa.' };
  }

  const { data: reservation } = await supabase
    .from('reservations')
    .select('*, vehicle:vehicles(name)')
    .eq('id', id)
    .single();

  if (reservation?.customer_email) {
    import('./email/send-notification').then(({ notifyStatusChange }) =>
      notifyStatusChange({
        customerName: reservation.customer_name,
        customerPhone: reservation.customer_phone,
        customerEmail: reservation.customer_email,
        vehicleName: reservation.vehicle?.name || undefined,
        pickupDate: reservation.pickup_date,
        returnDate: reservation.return_date,
        pickupLocation: reservation.pickup_location,
        returnLocation: reservation.return_location,
        totalPrice: reservation.total_price || undefined,
      }, status)
    ).catch(() => {});
  }

  return { success: true };
}
