'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';
import ScrollReveal from './motion/ScrollReveal';
import AnimatedCounter from './motion/AnimatedCounter';

const stats = [
  { value: 10, suffix: '+', labelKey: 'statVehicles' },
  { value: 5, suffix: '+', labelKey: 'statYears' },
  { value: 1000, suffix: '+', labelKey: 'statClients' },
];

export default function AboutSection() {
  const t = useTranslations('about');

  return (
    <section className="py-24 lg:py-32 bg-bg-primary relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 font-[family-name:var(--font-montserrat)] font-black text-[14rem] lg:text-[20rem] text-accent/[0.03] leading-none pointer-events-none select-none">
        &ldquo;
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <ScrollReveal direction="left" blur>
            <div>
              <span className="text-accent font-[family-name:var(--font-montserrat)] font-bold text-xs tracking-[0.3em] uppercase">
                {t('label')}
              </span>
              <h2 className="font-[family-name:var(--font-montserrat)] font-black mt-3 mb-6 leading-[1.05]" style={{ fontSize: 'var(--text-h2)' }}>
                {t('title')}
              </h2>
              <p className="text-text-secondary text-base leading-[1.7] max-w-lg mb-8">
                {t('description')}
              </p>
              <Link
                href="/o-nama"
                className="inline-flex items-center gap-3 border border-accent text-accent px-8 py-4 rounded-lg text-sm font-bold tracking-wider hover:bg-accent hover:text-white transition-all duration-300 group"
              >
                {t('cta')}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.2} blur>
            <div className="grid grid-cols-3 gap-3 sm:gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="text-center p-3 sm:p-6 rounded-xl bg-bg-card border border-border/50 hover:border-accent/30 transition-colors">
                  <div className="font-[family-name:var(--font-montserrat)] font-black text-2xl sm:text-4xl text-accent mb-1 sm:mb-2">
                    <AnimatedCounter to={stat.value} suffix={stat.suffix} duration={2 + i * 0.3} />
                  </div>
                  <p className="text-text-secondary text-[10px] sm:text-xs tracking-wider uppercase leading-tight">
                    {t(stat.labelKey)}
                  </p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
