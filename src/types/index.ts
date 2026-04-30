// SV Cars — TypeScript Types
// These types mirror the Supabase database schema

export interface Vehicle {
  id: string;
  slug: string;
  name: string;
  category: VehicleCategory;
  transmission: 'manual' | 'automatic';
  fuel: 'diesel' | 'petrol' | 'hybrid';
  year: number;
  price_daily: number;
  price_weekly: number | null;
  images: string[];
  specs: VehicleSpecs;
  description_hr?: string;
  description_en?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type VehicleCategory = 'economy' | 'compact' | 'suv' | 'premium' | 'van' | 'quad';

export interface VehicleSpecs {
  seats?: number;
  doors?: number;
  luggage?: number;
  ac?: boolean;
  bluetooth?: boolean;
  gps?: boolean;
  leather?: boolean;
  panorama?: boolean;
  helmet_included?: boolean;
  type?: string;
}

export interface Reservation {
  id: string;
  vehicle_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  pickup_date: string;
  return_date: string;
  pickup_location: string;
  return_location: string;
  status: ReservationStatus;
  notes?: string;
  source: ReservationSource;
  total_price?: number;
  created_at: string;
  updated_at: string;
  created_by_staff?: string;
  handled_by_staff?: string;
  // Joined data
  vehicle?: Vehicle;
  staff_profile?: Pick<StaffProfile, 'display_name'> | null;
}

export type ReservationStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type ReservationSource = 'website' | 'instagram_dm' | 'whatsapp' | 'phone';

export interface ContactMessage {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export type UserRole = 'admin' | 'radnik';

export interface StaffProfile {
  id: string;
  username: string;
  display_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}
