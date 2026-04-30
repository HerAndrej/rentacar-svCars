'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface VehicleDetailClientProps {
  images: string[];
  name: string;
  category: string;
}

export default function VehicleDetailClient({ images, name, category }: VehicleDetailClientProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images.length) {
    return (
      <div className="aspect-[4/3] bg-bg-card rounded-xl border border-border/30 flex items-center justify-center">
        <p className="text-text-muted text-sm">{name}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-[4/3] bg-bg-card rounded-xl border border-border/30 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <Image
              src={images[activeIndex]}
              alt={`${name} - ${activeIndex + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 60vw"
              priority={activeIndex === 0}
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-accent/90 text-white text-xs font-bold tracking-wider uppercase px-4 py-1.5 rounded-md backdrop-blur-sm">
            {category}
          </span>
        </div>
        {/* Bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${
                i === activeIndex ? 'border-accent' : 'border-border/30 hover:border-border opacity-70 hover:opacity-100'
              }`}
            >
              <Image
                src={img}
                alt={`${name} - ${i + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 25vw, 15vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
