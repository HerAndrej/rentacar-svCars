import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Fuel, Settings, Users, Briefcase, Wind, Bluetooth, Navigation, Armchair } from 'lucide-react';
import { getVehicleBySlug } from '@/lib/queries';
import { createClient } from '@supabase/supabase-js';
import VehicleDetailClient from '@/components/VehicleDetailClient';
import VehicleReservation from '@/components/VehicleReservation';
import { withFallbackImages } from '@/lib/vehicle-images';

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

  const v = withFallbackImages(vehicle);
  const images = v.images;

  const transmissionLabel = vehicle.transmission === 'automatic' ? 'Automatik' : 'Rucni';
  const fuelLabel = vehicle.fuel === 'diesel' ? 'Dizel' : vehicle.fuel === 'petrol' ? 'Benzin' : 'Hybrid';

  const specs = [
    vehicle.specs.seats ? { icon: 'users', label: 'Sjedista', value: String(vehicle.specs.seats) } : null,
    { icon: 'settings', label: 'Mjenjac', value: transmissionLabel },
    { icon: 'fuel', label: 'Gorivo', value: fuelLabel },
    vehicle.specs.doors ? { icon: 'briefcase', label: 'Vrata', value: String(vehicle.specs.doors) } : null,
    vehicle.specs.ac ? { icon: 'wind', label: 'Klima', value: 'Da' } : null,
    vehicle.specs.bluetooth ? { icon: 'bluetooth', label: 'Bluetooth', value: 'Da' } : null,
    vehicle.specs.gps ? { icon: 'navigation', label: 'GPS', value: 'Da' } : null,
    vehicle.specs.leather ? { icon: 'armchair', label: 'Koza', value: 'Da' } : null,
  ].filter(Boolean) as { icon: string; label: string; value: string }[];

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-text-muted">
          <span className="hover:text-accent transition-colors">Pocetna</span>
          <span className="mx-2">/</span>
          <span className="hover:text-accent transition-colors">Vozila</span>
          <span className="mx-2">/</span>
          <span className="text-text-primary">{vehicle.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Left: Image Gallery + Specs (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            <VehicleDetailClient images={images} name={vehicle.name} category={vehicle.category} />

            {/* Specs */}
            <div className="glass rounded-xl border border-border/30 p-6">
              <h2 className="font-[family-name:var(--font-montserrat)] font-bold text-sm tracking-wider mb-5">SPECIFIKACIJE</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                {specs.map((spec) => {
                  const IconMap: Record<string, React.ComponentType<{ size: number; className: string }>> = {
                    users: Users, settings: Settings, fuel: Fuel, briefcase: Briefcase,
                    wind: Wind, bluetooth: Bluetooth, navigation: Navigation, armchair: Armchair,
                  };
                  const Icon = IconMap[spec.icon];
                  return (
                    <div key={spec.label} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <Icon size={16} className="text-accent" />
                      </div>
                      <div>
                        <p className="text-xs text-text-muted">{spec.label}</p>
                        <p className="text-sm font-medium">{spec.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Info + Reservation (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vehicle name + price */}
            <div>
              <h1 className="font-[family-name:var(--font-montserrat)] font-black text-3xl sm:text-4xl mb-2">
                {vehicle.name}
              </h1>
              <p className="text-text-secondary text-sm mb-6">{vehicle.year} | {transmissionLabel} | {fuelLabel}</p>

              <div className="glass rounded-xl border border-border/30 p-6 mb-6">
                <h2 className="font-[family-name:var(--font-montserrat)] font-bold text-sm tracking-wider mb-4">CIJENA NAJMA</h2>
                <div className={`grid gap-4 ${vehicle.price_weekly ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  <div className="bg-bg-primary/60 rounded-lg p-4 text-center">
                    <p className="text-text-muted text-xs mb-1">Po danu</p>
                    <p className="text-accent font-[family-name:var(--font-montserrat)] font-bold text-2xl" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {vehicle.price_daily} <span className="text-sm text-text-secondary">KM</span>
                    </p>
                  </div>
                  {vehicle.price_weekly && (
                    <div className="bg-bg-primary/60 rounded-lg p-4 text-center">
                      <p className="text-text-muted text-xs mb-1">7+ dana</p>
                      <p className="text-accent font-[family-name:var(--font-montserrat)] font-bold text-2xl" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {vehicle.price_weekly} <span className="text-sm text-text-secondary">KM/dan</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Reservation Calendar + Form */}
            <VehicleReservation
              vehicleId={vehicle.id}
              vehicleName={vehicle.name}
              priceDaily={vehicle.price_daily}
              priceWeekly={vehicle.price_weekly}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
