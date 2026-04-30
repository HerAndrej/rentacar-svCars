'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import GradientOrb from './motion/GradientOrb';
import FloatingElement from './motion/FloatingElement';

const floatingDots = [
  { x: '75%', y: '20%', size: 4, delay: 0, amplitude: 15, duration: 5 },
  { x: '85%', y: '45%', size: 3, delay: 0.5, amplitude: 10, duration: 4 },
  { x: '65%', y: '70%', size: 5, delay: 1, amplitude: 12, duration: 6 },
  { x: '90%', y: '65%', size: 3, delay: 1.5, amplitude: 8, duration: 3.5 },
  { x: '55%', y: '30%', size: 4, delay: 0.8, amplitude: 14, duration: 5.5 },
  { x: '80%', y: '80%', size: 2, delay: 2, amplitude: 10, duration: 4.5 },
];

export default function HeroSection() {
  const t = useTranslations('hero');

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Multi-layer background */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1210 50%, #0a0a0a 100%)' }}
      />

      {/* Gradient orbs */}
      <GradientOrb
        size={600}
        color="rgba(232, 90, 43, 0.12)"
        className="right-[10%] top-[20%]"
        speed={8}
      />
      <GradientOrb
        size={400}
        color="rgba(232, 90, 43, 0.08)"
        className="right-[30%] bottom-[10%]"
        speed={10}
      />

      {/* Left gradient fade for text readability */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{ background: 'linear-gradient(90deg, rgba(10,10,10,0.97) 0%, rgba(10,10,10,0.85) 30%, rgba(10,10,10,0.4) 55%, transparent 75%)' }}
      />

      {/* Floating accent dots */}
      {floatingDots.map((dot, i) => (
        <FloatingElement key={i} amplitude={dot.amplitude} duration={dot.duration} delay={dot.delay} className="absolute pointer-events-none" >
          <div
            className="rounded-full bg-accent/40"
            style={{
              width: dot.size,
              height: dot.size,
              position: 'absolute',
              left: dot.x,
              top: dot.y,
            }}
          />
        </FloatingElement>
      ))}

      {/* Car image — large, cinematic, spanning viewport */}
      <motion.div
        className="absolute inset-0 flex items-end lg:items-center justify-center lg:justify-end"
        initial={{ opacity: 0, x: 80, scale: 1.05 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="relative w-full h-[50vh] sm:h-[60vh] lg:h-screen">
          <Image
            src="/images/hero.png"
            alt="SV Cars — Premium Rent a Car Mostar"
            fill
            className="object-contain object-bottom lg:object-right-bottom drop-shadow-[0_0_80px_rgba(232,90,43,0.3)]"
            sizes="100vw"
            priority
          />
        </div>
      </motion.div>

      {/* Radial glow behind car */}
      <div className="absolute right-[15%] top-[30%] w-[500px] h-[500px] bg-accent/15 rounded-full blur-[150px] pointer-events-none" />

      {/* Text content — overlaid on left */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20 min-h-screen flex items-center">
        <div className="max-w-xl lg:max-w-lg xl:max-w-xl pb-32 lg:pb-0">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <h1
              className="font-[family-name:var(--font-montserrat)] font-black leading-[0.95] mb-6 tracking-tight"
              style={{ fontSize: 'var(--text-hero)' }}
            >
              <motion.span
                className="block text-gradient"
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, type: 'spring', stiffness: 100, damping: 20 }}
              >
                {t('title1')}
              </motion.span>
              <motion.span
                className="block text-gradient"
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, type: 'spring', stiffness: 100, damping: 20 }}
              >
                {t('title2')}
              </motion.span>
            </h1>
          </motion.div>

          <motion.p
            className="font-[family-name:var(--font-montserrat)] text-sm sm:text-base tracking-[0.3em] text-accent font-semibold mb-6"
            initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
            animate={{ opacity: 1, clipPath: 'inset(0 0% 0 0)' }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {t('tagline')}
          </motion.p>

          <motion.p
            className="text-text-secondary text-base sm:text-lg max-w-md mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {t('subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8, type: 'spring', stiffness: 200, damping: 15 }}
          >
            <Link
              href="/vozila"
              className="inline-flex items-center gap-3 bg-accent text-white px-8 py-4 rounded-lg text-sm font-bold tracking-wider hover:bg-accent-hover transition-all duration-300 group"
            >
              {t('cta')}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        <span className="text-text-muted text-xs tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={20} className="text-accent" />
        </motion.div>
      </motion.div>
    </section>
  );
}
