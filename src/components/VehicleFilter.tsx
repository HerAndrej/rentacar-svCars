'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import type { VehicleCategory } from '@/types';

const categories: (VehicleCategory | 'all')[] = ['all', 'economy', 'compact', 'suv', 'premium', 'van', 'quad'];

interface VehicleFilterProps {
  activeCategory: VehicleCategory | 'all';
  onCategoryChange: (category: VehicleCategory | 'all') => void;
}

export default function VehicleFilter({ activeCategory, onCategoryChange }: VehicleFilterProps) {
  const t = useTranslations('vehicles.filter');

  return (
    <div className="flex flex-wrap gap-3">
      {categories.map((cat) => (
        <motion.button
          key={cat}
          onClick={() => onCategoryChange(cat)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className={`relative px-5 py-2.5 text-sm font-medium tracking-wider rounded-lg border transition-all duration-300 ${
            activeCategory === cat
              ? 'border-accent text-white'
              : 'border-border text-text-secondary hover:border-accent/50 hover:text-accent'
          }`}
        >
          {activeCategory === cat && (
            <motion.div
              layoutId="activeFilter"
              className="absolute inset-0 bg-accent rounded-lg -z-10"
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            />
          )}
          {t(cat)}
        </motion.button>
      ))}
    </div>
  );
}
