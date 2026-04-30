'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';
import VehicleCard from './VehicleCard';
import ScrollReveal from './motion/ScrollReveal';
import { StaggerContainer, StaggerItem } from './motion/StaggerContainer';
import type { Vehicle } from '@/types';

interface Props {
  vehicles: Vehicle[];
}

export default function FeaturedVehiclesClient({ vehicles }: Props) {
  const t = useTranslations('vehicles');

  return (
    <section className="py-24 lg:py-32 bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-14 gap-4">
            <div className="relative">
              <span className="text-accent font-[family-name:var(--font-montserrat)] font-bold text-xs tracking-[0.3em] uppercase">
                {t('title')}
              </span>
              <h2 className="font-[family-name:var(--font-montserrat)] font-black mt-3 leading-tight" style={{ fontSize: 'var(--text-h2)' }}>
                {t('subtitle')}
              </h2>
              <div className="hidden sm:block absolute -right-[200%] bottom-2 w-[200%] h-px bg-gradient-to-r from-accent/30 to-transparent" />
            </div>
            <Link
              href="/vozila"
              className="inline-flex items-center gap-3 border border-accent text-accent px-6 py-3 rounded-lg text-sm font-bold tracking-wider hover:bg-accent hover:text-white transition-all duration-300 group self-start"
            >
              {t('allVehicles')}
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </ScrollReveal>

        <StaggerContainer className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-8" staggerDelay={0.15}>
          {vehicles.map((vehicle) => (
            <StaggerItem key={vehicle.id}>
              <VehicleCard vehicle={vehicle} />
            </StaggerItem>
          ))}
        </StaggerContainer>

        <div className="sm:hidden -mx-4 px-4">
          <StaggerContainer className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide" staggerDelay={0.1}>
            {vehicles.map((vehicle) => (
              <StaggerItem key={vehicle.id} className="min-w-[280px] snap-start flex-shrink-0">
                <VehicleCard vehicle={vehicle} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}
