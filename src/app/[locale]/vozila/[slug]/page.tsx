import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowRight, Fuel, Settings, Users, Briefcase, Wind, Bluetooth, Navigation, Armchair } from 'lucide-react';
import { vehicles } from '@/data/vehicles';

export function generateStaticParams() {
  return vehicles.map((v) => ({ slug: v.slug }));
}

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug } = await params;
  const vehicle = vehicles.find(v => v.slug === slug);

  if (!vehicle) {
    notFound();
  }

  const transmissionLabel = vehicle.transmission === 'automatic' ? 'Automatik' : 'Rucni';
  const fuelLabel = vehicle.fuel === 'diesel' ? 'Dizel' : vehicle.fuel === 'petrol' ? 'Benzin' : 'Hybrid';

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Image */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] bg-bg-secondary rounded-lg border border-border overflow-hidden">
              {vehicle.images[0] ? (
                <Image
                  src={vehicle.images[0]}
                  alt={vehicle.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-text-muted text-sm">{vehicle.name}</p>
                </div>
              )}
              <div className="absolute top-4 left-4">
                <span className="bg-accent text-white text-xs font-bold tracking-wider uppercase px-4 py-1.5 rounded-sm">
                  {vehicle.category}
                </span>
              </div>
            </div>

            {/* Additional images */}
            {vehicle.images.length > 1 && (
              <div className="grid grid-cols-3 gap-3">
                {vehicle.images.slice(1).map((img, i) => (
                  <div key={i} className="relative aspect-[4/3] bg-bg-secondary rounded-lg border border-border overflow-hidden">
                    <Image
                      src={img}
                      alt={`${vehicle.name} - ${i + 2}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 33vw, 16vw"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div>
            <h1 className="font-[family-name:var(--font-montserrat)] font-black text-3xl sm:text-4xl mb-2">
              {vehicle.name}
            </h1>
            <p className="text-text-secondary text-sm mb-8">{vehicle.year} | {transmissionLabel} | {fuelLabel}</p>

            {/* Pricing */}
            <div className="bg-bg-card border border-border rounded-lg p-6 mb-8">
              <h2 className="font-[family-name:var(--font-montserrat)] font-bold text-sm tracking-wider mb-4">CIJENA NAJMA</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-bg-secondary rounded-lg p-4 text-center">
                  <p className="text-text-secondary text-xs mb-1">Po danu</p>
                  <p className="text-accent font-[family-name:var(--font-montserrat)] font-bold text-2xl">
                    {vehicle.price_daily} <span className="text-sm text-text-secondary">KM</span>
                  </p>
                </div>
                {vehicle.price_weekly && (
                  <div className="bg-bg-secondary rounded-lg p-4 text-center">
                    <p className="text-text-secondary text-xs mb-1">7+ dana</p>
                    <p className="text-accent font-[family-name:var(--font-montserrat)] font-bold text-2xl">
                      {vehicle.price_weekly} <span className="text-sm text-text-secondary">KM/dan</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Specs */}
            <div className="bg-bg-card border border-border rounded-lg p-6 mb-8">
              <h2 className="font-[family-name:var(--font-montserrat)] font-bold text-sm tracking-wider mb-4">SPECIFIKACIJE</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {vehicle.specs.seats && (
                  <div className="flex items-center gap-3">
                    <Users size={18} className="text-accent" />
                    <div>
                      <p className="text-xs text-text-secondary">Sjedista</p>
                      <p className="text-sm font-medium">{vehicle.specs.seats}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Settings size={18} className="text-accent" />
                  <div>
                    <p className="text-xs text-text-secondary">Mjenjac</p>
                    <p className="text-sm font-medium">{transmissionLabel}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Fuel size={18} className="text-accent" />
                  <div>
                    <p className="text-xs text-text-secondary">Gorivo</p>
                    <p className="text-sm font-medium">{fuelLabel}</p>
                  </div>
                </div>
                {vehicle.specs.doors && (
                  <div className="flex items-center gap-3">
                    <Briefcase size={18} className="text-accent" />
                    <div>
                      <p className="text-xs text-text-secondary">Vrata</p>
                      <p className="text-sm font-medium">{vehicle.specs.doors}</p>
                    </div>
                  </div>
                )}
                {vehicle.specs.ac && (
                  <div className="flex items-center gap-3">
                    <Wind size={18} className="text-accent" />
                    <div>
                      <p className="text-xs text-text-secondary">Klima</p>
                      <p className="text-sm font-medium">Da</p>
                    </div>
                  </div>
                )}
                {vehicle.specs.bluetooth && (
                  <div className="flex items-center gap-3">
                    <Bluetooth size={18} className="text-accent" />
                    <div>
                      <p className="text-xs text-text-secondary">Bluetooth</p>
                      <p className="text-sm font-medium">Da</p>
                    </div>
                  </div>
                )}
                {vehicle.specs.gps && (
                  <div className="flex items-center gap-3">
                    <Navigation size={18} className="text-accent" />
                    <div>
                      <p className="text-xs text-text-secondary">GPS</p>
                      <p className="text-sm font-medium">Da</p>
                    </div>
                  </div>
                )}
                {vehicle.specs.leather && (
                  <div className="flex items-center gap-3">
                    <Armchair size={18} className="text-accent" />
                    <div>
                      <p className="text-xs text-text-secondary">Koza</p>
                      <p className="text-sm font-medium">Da</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={`https://wa.me/38763090908?text=${encodeURIComponent(`Zdravo! Zanima me vozilo ${vehicle.name}. Da li je dostupno?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-3 bg-accent text-white px-8 py-4 text-sm font-bold tracking-wider hover:bg-accent-hover transition-all duration-300"
              >
                REZERVISI ODMAH
                <ArrowRight size={16} />
              </a>
              <a
                href="tel:+38763090908"
                className="flex-1 flex items-center justify-center gap-3 border border-accent text-accent px-8 py-4 text-sm font-bold tracking-wider hover:bg-accent hover:text-white transition-all duration-300"
              >
                NAZOVITE NAS
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
