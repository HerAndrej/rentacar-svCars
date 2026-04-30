'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { Phone, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const navLinks = [
  { href: '/', key: 'home' },
  { href: '/vozila', key: 'vehicles' },
  { href: '/o-nama', key: 'about' },
  { href: '/usluge', key: 'services' },
  { href: '/uslovi', key: 'terms' },
  { href: '/kontakt', key: 'contact' },
] as const;

export default function Navbar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const currentLocale = pathname.startsWith('/en') ? 'en' : 'hr';

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed top-0 left-0 right-0 z-50 border-b transition-all duration-500"
      style={{
        backdropFilter: scrolled ? 'blur(20px)' : 'blur(8px)',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'blur(8px)',
        backgroundColor: scrolled ? 'rgba(10, 10, 10, 0.95)' : 'rgba(10, 10, 10, 0.8)',
        borderColor: scrolled ? 'rgba(37, 37, 37, 0.5)' : 'rgba(37, 37, 37, 0.2)',
        boxShadow: scrolled ? '0 4px 30px rgba(0, 0, 0, 0.3)' : 'none',
      }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="flex items-center justify-between"
          animate={{ height: scrolled ? 64 : 80 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <Image
                src="/images/logo.jpg"
                alt="SV Cars"
                width={120}
                height={48}
                className="h-10 w-auto rounded-lg object-contain"
                priority
              />
            </motion.div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className={`relative text-sm font-medium tracking-wider transition-colors hover:text-accent ${
                  pathname === link.href ? 'text-accent' : 'text-text-primary'
                }`}
              >
                {t(link.key)}
                {pathname === link.href && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent rounded-full"
                    style={{ boxShadow: '0 2px 8px rgba(232, 90, 43, 0.4)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right Side: Language + Phone + CTA */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-1 text-sm">
              <Link
                href={pathname}
                locale="hr"
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  currentLocale === 'hr'
                    ? 'bg-accent/10 text-accent'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                BHS
              </Link>
              <Link
                href={pathname}
                locale="en"
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  currentLocale === 'en'
                    ? 'bg-accent/10 text-accent'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                EN
              </Link>
            </div>

            <a
              href="tel:+38763090908"
              className="flex items-center gap-2 text-text-primary hover:text-accent transition-colors"
            >
              <Phone size={16} />
              <span className="text-sm font-medium">+387 63 09 09 08</span>
            </a>

            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href="https://wa.me/38763090908"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-accent text-white px-6 py-2.5 rounded-lg text-sm font-bold tracking-wider hover:bg-accent-hover transition-colors duration-300"
            >
              {t('bookNow')}
            </motion.a>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-text-primary hover:text-accent transition-colors"
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <X size={24} />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Menu size={24} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 top-[64px] bg-black/60 backdrop-blur-sm lg:hidden -z-10"
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="lg:hidden border-t border-border/30 overflow-hidden"
              >
                <motion.div
                  initial={{ y: -10 }}
                  animate={{ y: 0 }}
                  className="flex flex-col gap-4 py-6"
                >
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.key}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`text-sm font-medium tracking-wider transition-colors hover:text-accent ${
                          pathname === link.href ? 'text-accent' : 'text-text-primary'
                        }`}
                      >
                        {t(link.key)}
                      </Link>
                    </motion.div>
                  ))}
                  <div className="flex items-center gap-2 pt-4 border-t border-border/30">
                    <Link
                      href={pathname}
                      locale="hr"
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        currentLocale === 'hr' ? 'bg-accent/10 text-accent' : 'text-text-secondary'
                      }`}
                    >
                      BHS
                    </Link>
                    <Link
                      href={pathname}
                      locale="en"
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        currentLocale === 'en' ? 'bg-accent/10 text-accent' : 'text-text-secondary'
                      }`}
                    >
                      EN
                    </Link>
                  </div>
                  <a
                    href="tel:+38763090908"
                    className="flex items-center gap-2 text-text-primary"
                  >
                    <Phone size={16} />
                    <span className="text-sm">+387 63 09 09 08</span>
                  </a>
                  <a
                    href="https://wa.me/38763090908"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-accent text-white px-6 py-2.5 rounded-lg text-sm font-bold tracking-wider text-center hover:bg-accent-hover transition-colors"
                  >
                    {t('bookNow')}
                  </a>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}
