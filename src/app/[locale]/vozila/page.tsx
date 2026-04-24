'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import VehicleCard from '@/components/VehicleCard';
import VehicleFilter from '@/components/VehicleFilter';
import { vehicles } from '@/data/vehicles';
import ScrollReveal from '@/components/motion/ScrollReveal';
import type { VehicleCategory } from '@/types';

export default function VehiclesPage() {
  const t = useTranslations('vehicles');
  const [activeCategory, setActiveCategory] = useState<VehicleCategory | 'all'>('all');

  const filtered = activeCategory === 'all'
    ? vehicles.filter(v => v.is_active)
    : vehicles.filter(v => v.is_active && v.category === activeCategory);

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollReveal>
          <div className="mb-12">
            <span className="text-accent font-[family-name:var(--font-montserrat)] font-bold text-sm tracking-wider">
              {t('title')}
            </span>
            <h1 className="font-[family-name:var(--font-montserrat)] font-black text-4xl sm:text-5xl mt-3 mb-4">
              {t('subtitle')}
            </h1>
          </div>
        </ScrollReveal>

        {/* Filters */}
        <ScrollReveal delay={0.1}>
          <div className="mb-10">
            <VehicleFilter
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </div>
        </ScrollReveal>

        {/* Vehicle Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((vehicle) => (
              <motion.div
                key={vehicle.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <VehicleCard vehicle={vehicle} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-20"
            >
              <p className="text-text-secondary text-lg">Nema vozila u ovoj kategoriji.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}