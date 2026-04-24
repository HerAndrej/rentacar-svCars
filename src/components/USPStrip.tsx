'use client';

import { useTranslations } from 'next-intl';
import { ShieldCheck, CalendarDays, Headset, MapPin } from 'lucide-react';
import { StaggerContainer, StaggerItem } from './motion/StaggerContainer';

const uspItems = [
  { key: 'safety', icon: ShieldCheck },
  { key: 'flexibility', icon: CalendarDays },
  { key: 'partner', icon: Headset },
  { key: 'delivery', icon: MapPin },
] as const;

export default function USPStrip() {
  const t = useTranslations('usp');

  return (
    <section className="bg-bg-secondary border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border" staggerDelay={0.12}>
          {uspItems.map((item) => {
            const Icon = item.icon;
            return (
              <StaggerItem key={item.key}>
                <div className="flex items-start gap-4 py-8 sm:px-6 lg:px-8">
                  <div className="flex-shrink-0">
                    <Icon size={28} className="text-accent" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-[family-name:var(--font-montserrat)] font-bold text-sm tracking-wider text-text-primary mb-1">
                      {t(`${item.key}.title`)}
                    </h3>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {t(`${item.key}.description`)}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}