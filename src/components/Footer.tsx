'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Phone, Mail, MapPin, ArrowUp } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export default function Footer() {
  const t = useTranslations('footer');
  const nav = useTranslations('nav');

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-bg-secondary relative">
      <div className="gradient-divider" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/images/logo.jpg"
                alt="SV Cars"
                width={100}
                height={40}
                className="h-9 w-auto rounded-lg object-contain"
              />
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">
              {t('description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-[family-name:var(--font-montserrat)] font-bold text-sm tracking-wider mb-6 text-text-primary">
              {t('quickLinks')}
            </h3>
            <ul className="space-y-3">
              {[
                { href: '/', label: nav('home') },
                { href: '/vozila', label: nav('vehicles') },
                { href: '/usluge', label: nav('services') },
                { href: '/o-nama', label: nav('about') },
                { href: '/kontakt', label: nav('contact') },
              ].map((link) => (
                <li key={link.href}>
                  <motion.div whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                    <Link
                      href={link.href}
                      className="text-text-secondary text-sm hover:text-accent transition-colors"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-[family-name:var(--font-montserrat)] font-bold text-sm tracking-wider mb-6 text-text-primary">
              {t('contactInfo')}
            </h3>
            <ul className="space-y-4">
              <li>
                <a href="tel:+38763090908" className="flex items-center gap-3 text-text-secondary text-sm hover:text-accent transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Phone size={14} className="text-accent" />
                  </div>
                  +387 63 09 09 08
                </a>
              </li>
              <li>
                <a href="mailto:info@sv-cars.ba" className="flex items-center gap-3 text-text-secondary text-sm hover:text-accent transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Mail size={14} className="text-accent" />
                  </div>
                  info@sv-cars.ba
                </a>
              </li>
              <li>
                <div className="flex items-center gap-3 text-text-secondary text-sm">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <MapPin size={14} className="text-accent" />
                  </div>
                  Vojno bb, 88000 Mostar, BiH
                </div>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-[family-name:var(--font-montserrat)] font-bold text-sm tracking-wider mb-6 text-text-primary">
              {t('followUs')}
            </h3>
            <div className="flex items-center gap-3">
              <motion.a
                whileHover={{ scale: 1.1, borderColor: 'var(--accent)' }}
                whileTap={{ scale: 0.9 }}
                href="https://www.instagram.com/svcars.rentacar.mostar"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-border rounded-lg flex items-center justify-center text-text-secondary hover:text-accent transition-colors"
              >
                <InstagramIcon size={18} />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, borderColor: 'var(--accent)' }}
                whileTap={{ scale: 0.9 }}
                href="https://wa.me/38763090908"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-border rounded-lg flex items-center justify-center text-text-secondary hover:text-accent transition-colors"
              >
                <Phone size={18} />
              </motion.a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border/50 flex items-center justify-between">
          <p className="text-text-muted text-sm">
            &copy; {new Date().getFullYear()} SV Cars. {t('rights')}
          </p>
          <motion.button
            onClick={scrollToTop}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 rounded-lg border border-border flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent/50 transition-colors"
            aria-label="Back to top"
          >
            <ArrowUp size={16} />
          </motion.button>
        </div>
      </div>
    </footer>
  );
}
