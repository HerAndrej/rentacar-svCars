'use client';

import { useTranslations } from 'next-intl';
import { Car, CalendarCheck, MapPinCheck } from 'lucide-react';
import ScrollReveal from './motion/ScrollReveal';
import { StaggerContainer, StaggerItem } from './motion/StaggerContainer';

const steps = [
  { key: 'step1', icon: Car, number: '01' },
  { key: 'step2', icon: CalendarCheck, number: '02' },
  { key: 'step3', icon: MapPinCheck, number: '03' },
] as const;

export default function HowItWorks() {
  const t = useTranslations('howItWorks');

  return (
    <section className="py-20 bg-bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-accent font-[family-name:var(--font-montserrat)] font-bold text-sm tracking-wider">
              {t('label')}
            </span>
            <h2 className="font-[family-name:var(--font-montserrat)] font-black text-3xl sm:text-4xl mt-3">
              {t('title')}
            </h2>
          </div>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8" staggerDelay={0.2}>
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <StaggerItem key={step.key} direction="scale">
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full border-2 border-accent mb-6 how-it-works-icon">
                    <Icon size={32} className="text-accent" strokeWidth={1.5} />
                    <span className="absolute -top-2 -right-2 bg-accent text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="font-[family-name:var(--font-montserrat)] font-bold text-base tracking-wider mb-3">
                    {t(`${step.key}.title`)}
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed max-w-xs mx-auto">
                    {t(`${step.key}.description`)}
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}