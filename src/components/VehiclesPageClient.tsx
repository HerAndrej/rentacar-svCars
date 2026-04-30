'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import VehicleCard from '@/components/VehicleCard';
import VehicleFilter from '@/components/VehicleFilter';
import ScrollReveal from '@/components/motion/ScrollReveal';
import type { Vehicle, VehicleCategory } from '@/types';

interface Props {
  vehicles: Vehicle[];
}

export default function VehiclesPageClient({ vehicles }: Props) {
  const t = useTranslations('vehicles');
  const [activeCategory, setActiveCategory] = useState<VehicleCategory | 'all'>('all');

  const filtered = activeCategory === 'all'
    ? vehicles
    : vehicles.filter(v => v.category === activeCategory);

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal delay={0.1}>
          <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <VehicleFilter
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
            <motion.span
              key={filtered.length}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-text-muted text-sm"
            >
              {filtered.length} {filtered.length === 1 ? 'vozilo' : 'vozila'}
            </motion.span>
          </div>
        </ScrollReveal>

        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filtered.map((vehicle) => (
              <motion.div
                key={vehicle.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
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
    </>
  );
}
