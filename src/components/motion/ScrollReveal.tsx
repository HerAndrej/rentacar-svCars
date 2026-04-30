'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import type { ReactNode } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface ScrollRevealProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
  once?: boolean;
  blur?: boolean;
  scale?: boolean;
}

const getInitial = (direction: Direction, distance: number, blur: boolean, scale: boolean) => {
  const base: Record<string, number | string> = { opacity: 0 };

  switch (direction) {
    case 'up': base.y = distance; break;
    case 'down': base.y = -distance; break;
    case 'left': base.x = distance; break;
    case 'right': base.x = -distance; break;
  }

  if (blur) base.filter = 'blur(8px)';
  if (scale) base.scale = 0.95;

  return base;
};

const getAnimate = (blur: boolean, scale: boolean) => {
  const base: Record<string, number | string> = { opacity: 1, x: 0, y: 0 };
  if (blur) base.filter = 'blur(0px)';
  if (scale) base.scale = 1;
  return base;
};

export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  distance = 40,
  className,
  once = true,
  blur = false,
  scale = false,
}: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: '-50px' });

  const initial = getInitial(direction, distance, blur, scale);
  const animate = getAnimate(blur, scale);

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={isInView ? animate : initial}
      transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
