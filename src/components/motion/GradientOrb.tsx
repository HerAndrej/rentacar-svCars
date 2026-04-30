'use client';

import { motion } from 'framer-motion';

interface GradientOrbProps {
  size?: number;
  color?: string;
  className?: string;
  speed?: number;
}

export default function GradientOrb({ size = 400, color = 'var(--accent)', className = '', speed = 6 }: GradientOrbProps) {
  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: `blur(${size / 3}px)`,
      }}
      animate={{
        x: [0, 30, -20, 0],
        y: [0, -25, 15, 0],
        scale: [1, 1.1, 0.95, 1],
      }}
      transition={{
        duration: speed,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}
