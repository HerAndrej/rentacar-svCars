'use client';

import { useTranslations } from 'next-intl';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import ContactForm from '@/components/ContactForm';
import ScrollReveal from '@/components/motion/ScrollReveal';
import { StaggerContainer, StaggerItem } from '@/components/motion/StaggerContainer';

export default function ContactPage() {
  const t = useTranslations('contact');

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-16">
            <h1 className="font-[family-name:var(--font-montserrat)] font-black text-4xl sm:text-5xl mb-4">
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
            <StaggerContainer className="space-y-6 mb-10" staggerDelay={0.1}>
              <StaggerItem direction="left">
                <a href="tel:+38763090908" className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center group-hover:border-accent group-hover:bg-accent/10 transition-all duration-300">
                    <Phone size={18} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-text-secondary text-xs">Telefon</p>
                    <p className="font-medium group-hover:text-accent transition-colors">+387 63 09 09 08</p>
                  </div>
                </a>
              </StaggerItem>

              <StaggerItem direction="left">
                <a href="mailto:info@sv-cars.ba" className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center group-hover:border-accent group-hover:bg-accent/10 transition-all duration-300">
                    <Mail size={18} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-text-secondary text-xs">Email</p>
                    <p className="font-medium group-hover:text-accent transition-colors">info@sv-cars.ba</p>
                  </div>
                </a>
              </StaggerItem>

              <StaggerItem direction="left">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center">
                    <MapPin size={18} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-text-secondary text-xs">Adresa</p>
                    <p className="font-medium">{t('address')}</p>
                  </div>
                </div>
              </StaggerItem>

              <StaggerItem direction="left">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center">
                    <Clock size={18} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-text-secondary text-xs">Radno vrijeme</p>
                    <p className="font-medium">{t('workingHours')}</p>
                  </div>
                </div>
              </StaggerItem>
            </StaggerContainer>

            {/* Google Maps Placeholder */}
            <ScrollReveal delay={0.3}>
              <div className="aspect-[4/3] bg-bg-card border border-border rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin size={32} className="text-accent mx-auto mb-2" />
                  <p className="text-text-muted text-sm">Google Maps</p>
                  <p className="text-text-muted text-xs">Vojno bb, 88000 Mostar</p>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Contact Form */}
          <ScrollReveal direction="right" delay={0.2}>
            <div>
              <ContactForm />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}