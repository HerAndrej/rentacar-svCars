// Supabase query functions
// For now, these use static data. When Supabase is connected, switch to real queries.

import { vehicles } from '@/data/vehicles';
import type { Vehicle } from '@/types';

// === VEHICLES ===

export async function getVehicles(): Promise<Vehicle[]> {
  // TODO: Replace with Supabase query when connected
  // const supabase = await createServerSupabaseClient();
  // const { data } = await supabase.from('vehicles').select('*').eq('is_active', true).order('sort_order');
  // return data || [];
  return vehicles.filter(v => v.is_active);
}

export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
  // TODO: Replace with Supabase query when connected
  // const supabase = await createServerSupabaseClient();
  // const { data } = await supabase.from('vehicles').select('*').eq('slug', slug).single();
  // return data;
  return vehicles.find(v => v.slug === slug) || null;
}

export async function getFeaturedVehicles(limit = 4): Promise<Vehicle[]> {
  // Show premium/interesting vehicles first
  const all = await getVehicles();
  const featured = all.sort((a, b) => b.price_daily - a.price_daily);
  return featured.slice(0, limit);
}

export async function getVehiclesByCategory(category: string): Promise<Vehicle[]> {
  const all = await getVehicles();
  return all.filter(v => v.category === category);
}
