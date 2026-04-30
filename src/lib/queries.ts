import { createClient } from '@supabase/supabase-js';
import type { Vehicle } from '@/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getVehicles(): Promise<Vehicle[]> {
  const { data } = await supabase
    .from('vehicles')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  return data || [];
}

export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
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
  const { data } = await supabase
    .from('vehicles')
    .select('*')
    .eq('is_active', true)
    .eq('category', category)
    .order('sort_order');
  return data || [];
}
