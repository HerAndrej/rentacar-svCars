'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  const t = useTranslations('hero');

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-bg-primary">
      {/* Orange ambient glow effect */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute right-[10%] top-1/2 -translate-y-1/2 w-[300px] h-[400px] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div className="z-10">
            <motion.h1
              className="font-[family-name:var(--font-montserrat)] text-6xl sm:text-7xl lg:text-8xl font-black leading-[0.9] mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="block text-text-primary">{t('title1')}</span>
              <span className="block text-text-primary">{t('title2')}</span>
            </motion.h1>

            <motion.p
              className="font-[family-name:var(--font-montserrat)] text-sm sm:text-base tracking-[0.3em] text-accent font-semibold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {t('tagline')}
            </motion.p>

            <motion.p
              className="text-text-secondary text-base sm:text-lg max-w-md mb-10 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {t('subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link
                href="/vozila"
                className="inline-flex items-center gap-3 border border-accent text-accent px-8 py-4 text-sm font-bold tracking-wider hover:bg-accent hover:text-white transition-all duration-300 group"
              >
                {t('cta')}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* Right: Car Image — Porsche Macan */}
          <motion.div
            className="relative flex items-center justify-center lg:justify-end"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative w-full max-w-2xl aspect-[16/10]">
              <Image
                src="/images/hero.webp"
                alt="SV Cars — Premium Rent a Car Mostar"
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {/* Orange glow behind car */}
              <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-[200px] h-[300px] bg-accent/30 rounded-full blur-[80px] -z-10" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
