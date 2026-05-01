'use client';

import { useTranslations } from 'next-intl';
import { ShieldCheck, CalendarDays, Headset, MapPin } from 'lucide-react';
import ScrollReveal from '@/components/motion/ScrollReveal';
import { StaggerContainer, StaggerItem } from '@/components/motion/StaggerContainer';
import AnimatedCounter from '@/components/motion/AnimatedCounter';
import GradientOrb from '@/components/motion/GradientOrb';

const stats = [
  { value: 10, suffix: '+', labelKey: 'statVehicles' },
  { value: 5, suffix: '+', labelKey: 'statYears' },
  { value: 1000, suffix: '+', labelKey: 'statClients' },
];

export default function AboutPage() {
  const t = useTranslations('about');
  const usp = useTranslations('usp');

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="relative overflow-hidden mb-20">
          <div className="absolute inset-0 pointer-events-none">
            <GradientOrb size={400} color="rgba(232, 90, 43, 0.06)" className="right-0 -top-20" speed={10} />
          </div>
          <ScrollReveal blur>
            <div>
              <span className="text-accent font-[family-name:var(--font-montserrat)] font-bold text-xs tracking-[0.3em] uppercase">
                {t('label')}
              </span>
              <h1 className="font-[family-name:var(--font-montserrat)] font-black mt-3 mb-8 max-w-3xl leading-[1.05]" style={{ fontSize: 'var(--text-h1)' }}>
                {t('title')}
              </h1>
              <p className="text-text-secondary text-lg leading-[1.7] max-w-2xl">
                {t('description')}
              </p>
            </div>
          </ScrollReveal>
        </div>

        {/* Stats */}
        <ScrollReveal delay={0.2} blur>
          <div className="grid grid-cols-3 gap-6 mb-20">
            {stats.map((stat, i) => (
              <div key={i} className="text-center p-8 rounded-xl bg-bg-card border border-border/50 hover:border-accent/30 transition-colors">
                <div className="font-[family-name:var(--font-montserrat)] font-black text-4xl sm:text-5xl text-accent mb-3">
                  <AnimatedCounter to={stat.value} suffix={stat.suffix} duration={2 + i * 0.3} />
                </div>
                <p className="text-text-secondary text-sm tracking-wider uppercase">
                  {t(stat.labelKey)}
                </p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Values */}
        <ScrollReveal blur>
          <div className="mb-12">
            <span className="text-accent font-[family-name:var(--font-montserrat)] font-bold text-xs tracking-[0.3em] uppercase">
              {t('valuesLabel') ?? 'Nase vrijednosti'}
            </span>
            <h2 className="font-[family-name:var(--font-montserrat)] font-black mt-3" style={{ fontSize: 'var(--text-h2)' }}>
              {t('valuesTitle') ?? 'Zasto nas klijenti biraju'}
            </h2>
          </div>
        </ScrollReveal>

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
                <div className="gradient-border p-8 hover:bg-bg-card-hover transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                    <Icon size={24} className="text-accent" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-[family-name:var(--font-montserrat)] font-bold text-lg mb-2">
                    {usp(`${item.key}.title`)}
                  </h3>
                  <p className="text-text-secondary text-sm leading-[1.7]">
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
