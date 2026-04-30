'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import type { ReactNode } from 'react';
import type { Variants } from 'framer-motion';

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  once?: boolean;
  viewportMargin?: string;
  delayOffset?: number;
}

export function StaggerContainer({ children, className, staggerDelay = 0.1, once = true, viewportMargin = '-50px', delayOffset = 0 }: StaggerContainerProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: viewportMargin as `${number}px` });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay, delayChildren: delayOffset } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'left' | 'right' | 'scale';
}

const ease = [0.25, 0.46, 0.45, 0.94] as const;

const itemVariants: Record<string, Variants> = {
  up: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
  },
  left: {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease } },
  },
  right: {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease } },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.85, filter: 'blur(4px)' },
    visible: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.6, ease } },
  },
};

export function StaggerItem({ children, className, direction = 'up' }: StaggerItemProps) {
  return (
    <motion.div variants={itemVariants[direction]} className={className}>
      {children}
    </motion.div>
  );
}
