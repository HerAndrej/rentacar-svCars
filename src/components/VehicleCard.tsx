import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ArrowRight, Fuel, Settings, Users } from 'lucide-react';
import type { Vehicle } from '@/types';

interface VehicleCardProps {
  vehicle: Vehicle;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const t = useTranslations('vehicles');

  const transmissionLabel = vehicle.transmission === 'automatic' ? 'Auto' : 'Manual';
  const fuelLabel = vehicle.fuel === 'diesel' ? 'Dizel' : vehicle.fuel === 'petrol' ? 'Benzin' : 'Hybrid';

  return (
    <div className="group bg-bg-card border border-border rounded-lg overflow-hidden hover:border-accent/50 transition-all duration-300 card-lift">
      {/* Image */}
      <Link href={`/vozila/${vehicle.slug}`} className="relative block aspect-[16/10] bg-bg-secondary overflow-hidden">
        {vehicle.images[0] ? (
          <Image
            src={vehicle.images[0]}
            alt={vehicle.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-text-muted text-xs">{vehicle.name}</p>
          </div>
        )}
        {/* Category badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-accent/90 text-white text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-sm">
            {vehicle.category}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-[family-name:var(--font-montserrat)] font-bold text-lg mb-3 group-hover:text-accent transition-colors">
          {vehicle.name}
        </h3>

        {/* Specs Row */}
        <div className="flex items-center gap-4 mb-4 text-text-secondary text-sm">
          {vehicle.specs.seats && (
            <span className="flex items-center gap-1.5">
              <Users size={14} className="text-accent" />
              {vehicle.specs.seats}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Settings size={14} className="text-accent" />
            {transmissionLabel}
          </span>
          <span className="flex items-center gap-1.5">
            <Fuel size={14} className="text-accent" />
            {fuelLabel}
          </span>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <span className="text-text-secondary text-xs">{t('priceFrom')}</span>
            <p className="text-accent font-[family-name:var(--font-montserrat)] font-bold text-xl">
              {vehicle.price_daily} <span className="text-sm font-normal text-text-secondary">{t('perDay')}</span>
            </p>
          </div>
          <Link
            href={`/vozila/${vehicle.slug}`}
            className="flex items-center gap-2 text-accent text-sm font-bold tracking-wider hover:gap-3 transition-all"
          >
            {t('viewDetails')}
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
