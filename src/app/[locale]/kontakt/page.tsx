'use client';

import { useTranslations } from 'next-intl';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import ContactForm from '@/components/ContactForm';
import ScrollReveal from '@/components/motion/ScrollReveal';
import { StaggerContainer, StaggerItem } from '@/components/motion/StaggerContainer';
import GradientOrb from '@/components/motion/GradientOrb';

export default function ContactPage() {
  const t = useTranslations('contact');

  return (
    <div className="pt-28 pb-20 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <GradientOrb size={400} color="rgba(232, 90, 43, 0.05)" className="right-[5%] top-[20%]" speed={10} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <ScrollReveal blur>
          <div className="mb-16">
            <h1 className="font-[family-name:var(--font-montserrat)] font-black mb-4" style={{ fontSize: 'var(--text-h1)' }}>
              {t('title')}
            </h1>
            <p className="text-text-secondary text-lg">
              {t('subtitle')}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info + Map */}
          <div>
            <StaggerContainer className="space-y-5 mb-10" staggerDelay={0.1}>
              {[
                { icon: Phone, label: 'Telefon', value: '+387 63 09 09 08', href: 'tel:+38763090908' },
                { icon: Mail, label: 'Email', value: 'info@sv-cars.ba', href: 'mailto:info@sv-cars.ba' },
                { icon: MapPin, label: 'Adresa', value: t('address') },
                { icon: Clock, label: 'Radno vrijeme', value: t('workingHours') },
              ].map((item, i) => {
                const Icon = item.icon;
                const Wrapper = item.href ? 'a' : 'div';
                return (
                  <StaggerItem key={i} direction="left">
                    <Wrapper {...(item.href ? { href: item.href } : {})} className="flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                        <Icon size={18} className="text-accent" />
                      </div>
                      <div className="relative pl-4 border-l border-border/50">
                        <p className="text-text-muted text-xs tracking-wider uppercase">{item.label}</p>
                        <p className="font-medium group-hover:text-accent transition-colors">{item.value}</p>
                      </div>
                    </Wrapper>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>

            {/* Google Maps Placeholder */}
            <ScrollReveal delay={0.3} blur>
              <div className="aspect-[4/3] bg-bg-card border border-border/50 rounded-xl flex items-center justify-center overflow-hidden">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
                    <MapPin size={24} className="text-accent" />
                  </div>
                  <p className="text-text-secondary text-sm font-medium">Google Maps</p>
                  <p className="text-text-muted text-xs mt-1">Vojno bb, 88000 Mostar</p>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Contact Form */}
          <ScrollReveal direction="right" delay={0.2} blur>
            <div>
              <ContactForm />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
