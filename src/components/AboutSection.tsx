'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';
import ScrollReveal from './motion/ScrollReveal';

export default function AboutSection() {
  const t = useTranslations('about');

  return (
    <section className="py-20 bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <ScrollReveal direction="left">
            <div>
              <span className="text-accent font-[family-name:var(--font-montserrat)] font-bold text-sm tracking-wider">
                {t('label')}
              </span>
              <h2 className="font-[family-name:var(--font-montserrat)] font-black text-3xl sm:text-4xl lg:text-5xl mt-3 mb-6 leading-tight">
                {t('title')}
              </h2>
              <p className="text-text-secondary text-base leading-relaxed max-w-lg">
                {t('description')}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.2}>
            <div className="flex lg:justify-end">
              <Link
                href="/o-nama"
                className="inline-flex items-center gap-3 border border-accent text-accent px-8 py-4 text-sm font-bold tracking-wider hover:bg-accent hover:text-white transition-all duration-300 group"
              >
                {t('cta')}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}