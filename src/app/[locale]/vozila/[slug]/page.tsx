import { notFound } from 'next/navigation';
import { getVehicleBySlug } from '@/lib/queries';
import { createClient } from '@supabase/supabase-js';

export async function generateStaticParams() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase.from('vehicles').select('slug').eq('is_active', true);
  return (data || []).map((v) => ({ slug: v.slug }));
}

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);

  if (!vehicle) {
    notFound();
  }

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold">{vehicle.name}</h1>
        <p>{vehicle.price_daily} KM/dan</p>
        <p>DEBUG: Page rendered successfully</p>
      </div>
    </div>
  );
}
