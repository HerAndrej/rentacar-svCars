'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { faqItemsHr, faqItemsEn } from '@/data/faq';
import ScrollReveal from './motion/ScrollReveal';
import { StaggerContainer, StaggerItem } from './motion/StaggerContainer';

export default function FAQAccordion() {
  const t = useTranslations('faq');
  const locale = useLocale();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const items = locale === 'hr' ? faqItemsHr : faqItemsEn;

  return (
    <section className="py-24 lg:py-32 bg-bg-primary">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal blur>
          <div className="text-center mb-14">
            <span className="text-accent font-[family-name:var(--font-montserrat)] font-bold text-xs tracking-[0.3em] uppercase">
              {t('label')}
            </span>
            <h2 className="font-[family-name:var(--font-montserrat)] font-black mt-3" style={{ fontSize: 'var(--text-h2)' }}>
              {t('title')}
            </h2>
          </div>
        </ScrollReveal>

        <StaggerContainer className="space-y-3" staggerDelay={0.08}>
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <StaggerItem key={index}>
                <div className={`border rounded-xl overflow-hidden transition-all duration-300 ${
                  isOpen ? 'border-accent/30 bg-accent/[0.03]' : 'border-border hover:border-border-light'
                }`}>
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-bg-card/50 transition-colors"
                  >
                    <span className="font-[family-name:var(--font-montserrat)] font-bold text-accent/30 text-sm flex-shrink-0">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="font-medium text-sm sm:text-base flex-1 pr-4">
                      {item.question}
                    </span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <ChevronDown size={18} className="text-accent flex-shrink-0" />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="overflow-hidden"
                      >
                        <motion.div
                          initial={{ filter: 'blur(4px)' }}
                          animate={{ filter: 'blur(0px)' }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                          className="px-6 pb-5 pl-16"
                        >
                          <p className="text-text-secondary text-sm leading-[1.7]">
                            {item.answer}
                          </p>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
