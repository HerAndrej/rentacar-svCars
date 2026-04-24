'use client';

import { useTranslations } from 'next-intl';
import { Car, Bike, Truck, CalendarClock } from 'lucide-react';
import ScrollReveal from '@/components/motion/ScrollReveal';
import { StaggerContainer, StaggerItem } from '@/components/motion/StaggerContainer';

const services = [
  { key: 'personal', icon: Car },
  { key: 'quad', icon: Bike },
  { key: 'delivery', icon: Truck },
  { key: 'longTerm', icon: CalendarClock },
] as const;

export default function ServicesPage() {
  const t = useTranslations('services');

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-16">
            <span className="text-accent font-[family-name:var(--font-montserrat)] font-bold text-sm tracking-wider">
              {t('title')}
            </span>
            <h1 className="font-[family-name:var(--font-montserrat)] font-black text-4xl sm:text-5xl mt-3 mb-4">
              {t('subtitle')}
            </h1>
          </div>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8" staggerDelay={0.15}>
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <StaggerItem key={service.key} direction="scale">
                <div className="bg-bg-card border border-border rounded-lg p-8 hover:border-accent/50 transition-all duration-300 group">
                  <div className="w-14 h-14 rounded-full border-2 border-accent flex items-center justify-center mb-6 group-hover:bg-accent/10 transition-colors">
                    <Icon size={24} className="text-accent" strokeWidth={1.5} />
                  </div>
                  <h2 className="font-[family-name:var(--font-montserrat)] font-bold text-xl mb-3">
                    {t(`${service.key}.title`)}
                  </h2>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {t(`${service.key}.description`)}
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </div>
  );
}