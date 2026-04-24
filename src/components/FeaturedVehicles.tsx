'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';
import VehicleCard from './VehicleCard';
import { vehicles } from '@/data/vehicles';
import ScrollReveal from './motion/ScrollReveal';
import { StaggerContainer, StaggerItem } from './motion/StaggerContainer';

export default function FeaturedVehicles() {
  const t = useTranslations('vehicles');

  const featuredSlugs = ['porsche-macan-turbo', 'peugeot-5008-1-5-hdi', 'golf-gtd-2017-automatik-panorama', 'peugeot-3008-1-5-hdi'];
  const featured = featuredSlugs
    .map(slug => vehicles.find(v => v.slug === slug))
    .filter(Boolean) as typeof vehicles;

  return (
    <section className="py-20 bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4">
            <div>
              <span className="text-accent font-[family-name:var(--font-montserrat)] font-bold text-sm tracking-wider">
                {t('title')}
              </span>
              <h2 className="font-[family-name:var(--font-montserrat)] font-black text-3xl sm:text-4xl mt-3">
                {t('subtitle')}
              </h2>
            </div>
            <Link
              href="/vozila"
              className="inline-flex items-center gap-3 border border-accent text-accent px-6 py-3 text-sm font-bold tracking-wider hover:bg-accent hover:text-white transition-all duration-300 group self-start"
            >
              {t('allVehicles')}
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.15}>
          {featured.map((vehicle) => (
            <StaggerItem key={vehicle.id}>
              <VehicleCard vehicle={vehicle} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}