import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Phone, Mail, MapPin } from 'lucide-react';

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

  return (
    <footer className="bg-bg-secondary border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                <span className="text-white font-[family-name:var(--font-montserrat)] font-black text-[10px] leading-tight text-center">
                  SV<br />CARS
                </span>
              </div>
              <span className="font-[family-name:var(--font-montserrat)] font-bold text-lg">SV CARS</span>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">
              {t('description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-[family-name:var(--font-montserrat)] font-bold text-sm tracking-wider mb-4">
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
                  <Link
                    href={link.href}
                    className="text-text-secondary text-sm hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-[family-name:var(--font-montserrat)] font-bold text-sm tracking-wider mb-4">
              {t('contactInfo')}
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="tel:+38763090908" className="flex items-center gap-3 text-text-secondary text-sm hover:text-accent transition-colors">
                  <Phone size={14} className="text-accent flex-shrink-0" />
                  +387 63 09 09 08
                </a>
              </li>
              <li>
                <a href="mailto:info@sv-cars.ba" className="flex items-center gap-3 text-text-secondary text-sm hover:text-accent transition-colors">
                  <Mail size={14} className="text-accent flex-shrink-0" />
                  info@sv-cars.ba
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-text-secondary text-sm">
                  <MapPin size={14} className="text-accent flex-shrink-0 mt-0.5" />
                  Vojno bb, 88000 Mostar, BiH
                </div>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-[family-name:var(--font-montserrat)] font-bold text-sm tracking-wider mb-4">
              {t('followUs')}
            </h3>
            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/svcars.rentacar.mostar"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-border rounded-full flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent transition-all"
              >
                <InstagramIcon size={18} />
              </a>
              <a
                href="https://wa.me/38763090908"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-border rounded-full flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent transition-all"
              >
                <Phone size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-text-muted text-sm text-center">
            &copy; {new Date().getFullYear()} SV Cars. {t('rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
