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
    <section className="py-20 bg-bg-primary">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="text-accent font-[family-name:var(--font-montserrat)] font-bold text-sm tracking-wider">
              {t('label')}
            </span>
            <h2 className="font-[family-name:var(--font-montserrat)] font-black text-3xl sm:text-4xl mt-3">
              {t('title')}
            </h2>
          </div>
        </ScrollReveal>

        <StaggerContainer className="space-y-3" staggerDelay={0.08}>
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <StaggerItem key={index}>
                <div className="border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-bg-card transition-colors"
                  >
                    <span className="font-medium text-sm sm:text-base pr-4">
                      {item.question}
                    </span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
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
                        <div className="px-6 pb-5">
                          <p className="text-text-secondary text-sm leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
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