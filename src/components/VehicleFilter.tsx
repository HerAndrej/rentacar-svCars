'use client';

import { useTranslations } from 'next-intl';
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
        <button
          key={cat}
          onClick={() => onCategoryChange(cat)}
          className={`px-5 py-2.5 text-sm font-medium tracking-wider border transition-all duration-300 ${
            activeCategory === cat
              ? 'bg-accent border-accent text-white'
              : 'border-border text-text-secondary hover:border-accent hover:text-accent'
          }`}
        >
          {t(cat)}
        </button>
      ))}
    </div>
  );
}
