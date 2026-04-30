'use client';

import { useTranslations } from 'next-intl';
import { Car, Bike, Truck, CalendarClock, ArrowRight } from 'lucide-react';
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
        <ScrollReveal blur>
          <div className="mb-16">
            <span className="text-accent font-[family-name:var(--font-montserrat)] font-bold text-xs tracking-[0.3em] uppercase">
              {t('title')}
            </span>
            <h1 className="font-[family-name:var(--font-montserrat)] font-black mt-3 mb-4" style={{ fontSize: 'var(--text-h1)' }}>
              {t('subtitle')}
            </h1>
          </div>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16" staggerDelay={0.15}>
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <StaggerItem key={service.key} direction="scale">
                <div className="gradient-border p-8 hover:bg-bg-card-hover transition-colors group">
                  <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                    <Icon size={28} className="text-accent" strokeWidth={1.5} />
                  </div>
                  <h2 className="font-[family-name:var(--font-montserrat)] font-bold text-xl mb-3">
                    {t(`${service.key}.title`)}
                  </h2>
                  <p className="text-text-secondary text-sm leading-[1.7]">
                    {t(`${service.key}.description`)}
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* CTA Section */}
        <ScrollReveal blur delay={0.3}>
          <div className="text-center py-16 px-8 rounded-2xl bg-bg-card border border-border/50 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(232,90,43,0.05) 0%, transparent 70%)' }} />
            <div className="relative">
              <h3 className="font-[family-name:var(--font-montserrat)] font-black text-2xl sm:text-3xl mb-4">
                {t('ctaTitle') ?? 'Zainteresovani?'}
              </h3>
              <p className="text-text-secondary mb-8 max-w-md mx-auto">
                {t('ctaDescription') ?? 'Kontaktirajte nas za vise informacija ili rezervisite vozilo odmah.'}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="https://wa.me/38763090908"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-accent text-white px-8 py-4 rounded-lg text-sm font-bold tracking-wider hover:bg-accent-hover transition-colors group"
                >
                  WhatsApp
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="tel:+38763090908"
                  className="inline-flex items-center gap-3 border border-accent text-accent px-8 py-4 rounded-lg text-sm font-bold tracking-wider hover:bg-accent hover:text-white transition-all"
                >
                  +387 63 09 09 08
                </a>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
