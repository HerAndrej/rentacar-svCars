import { createServerSupabaseClient } from './supabase-server';
import type { Vehicle } from '@/types';

export async function getVehicles(): Promise<Vehicle[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('vehicles')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  return data || [];
}

export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('vehicles')
    .select('*')
    .eq('slug', slug)
    .single();
  return data;
}

export async function getFeaturedVehicles(limit = 4): Promise<Vehicle[]> {
  const all = await getVehicles();
  const featured = all.sort((a, b) => b.price_daily - a.price_daily);
  return featured.slice(0, limit);
}

export async function getVehiclesByCategory(category: string): Promise<Vehicle[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('vehicles')
    .select('*')
    .eq('is_active', true)
    .eq('category', category)
    .order('sort_order');
  return data || [];
}
