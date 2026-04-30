'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Car, CalendarCheck, MapPinCheck } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import ScrollReveal from './motion/ScrollReveal';
import { StaggerContainer, StaggerItem } from './motion/StaggerContainer';

const steps = [
  { key: 'step1', icon: Car, number: '01' },
  { key: 'step2', icon: CalendarCheck, number: '02' },
  { key: 'step3', icon: MapPinCheck, number: '03' },
] as const;

export default function HowItWorks() {
  const t = useTranslations('howItWorks');
  const lineRef = useRef(null);
  const lineInView = useInView(lineRef, { once: true, margin: '-100px' });

  return (
    <section className="py-24 lg:py-32 bg-bg-secondary relative overflow-hidden">
      {/* Subtle radial gradient background */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(232,90,43,0.04) 0%, transparent 70%)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <ScrollReveal blur>
          <div className="text-center mb-16">
            <span className="text-accent font-[family-name:var(--font-montserrat)] font-bold text-xs tracking-[0.3em] uppercase">
              {t('label')}
            </span>
            <h2 className="font-[family-name:var(--font-montserrat)] font-black mt-3" style={{ fontSize: 'var(--text-h2)' }}>
              {t('title')}
            </h2>
          </div>
        </ScrollReveal>

        <div className="relative" ref={lineRef}>
          {/* Connecting line between steps (desktop only) */}
          <div className="hidden md:block absolute top-10 left-[16.67%] right-[16.67%] h-px z-0">
            <motion.div
              className="h-full bg-gradient-to-r from-accent/40 via-accent/20 to-accent/40"
              initial={{ scaleX: 0 }}
              animate={lineInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{ transformOrigin: 'left' }}
            />
          </div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10" staggerDelay={0.2}>
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <StaggerItem key={step.key} direction="scale">
                  <div className="text-center">
                    <motion.div
                      className="relative inline-flex items-center justify-center w-20 h-20 rounded-full border-2 border-accent/50 mb-6 bg-bg-secondary"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: parseInt(step.number) * 0.5 }}
                    >
                      <Icon size={32} className="text-accent" strokeWidth={1.5} />
                      <span className="absolute -top-2 -right-2 bg-accent text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-lg shadow-accent/20">
                        {step.number}
                      </span>
                    </motion.div>
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
      </div>
    </section>
  );
}
