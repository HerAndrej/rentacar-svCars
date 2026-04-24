'use client';

import { useTranslations } from 'next-intl';
import { ShieldCheck, CalendarDays, Headset, MapPin } from 'lucide-react';
import ScrollReveal from '@/components/motion/ScrollReveal';
import { StaggerContainer, StaggerItem } from '@/components/motion/StaggerContainer';

export default function AboutPage() {
  const t = useTranslations('about');
  const usp = useTranslations('usp');

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <ScrollReveal>
          <div className="mb-20">
            <span className="text-accent font-[family-name:var(--font-montserrat)] font-bold text-sm tracking-wider">
              {t('label')}
            </span>
            <h1 className="font-[family-name:var(--font-montserrat)] font-black text-4xl sm:text-5xl lg:text-6xl mt-3 mb-8 max-w-3xl leading-tight">
              {t('title')}
            </h1>
            <p className="text-text-secondary text-lg leading-relaxed max-w-2xl">
              {t('description')}
            </p>
          </div>
        </ScrollReveal>

        {/* Values */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8" staggerDelay={0.15}>
          {[
            { icon: ShieldCheck, key: 'safety' },
            { icon: CalendarDays, key: 'flexibility' },
            { icon: Headset, key: 'partner' },
            { icon: MapPin, key: 'delivery' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <StaggerItem key={item.key} direction="scale">
                <div className="bg-bg-card border border-border rounded-lg p-8 hover:border-accent/50 transition-all duration-300">
                  <Icon size={32} className="text-accent mb-4" strokeWidth={1.5} />
                  <h3 className="font-[family-name:var(--font-montserrat)] font-bold text-lg mb-2">
                    {usp(`${item.key}.title`)}
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {usp(`${item.key}.description`)}
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