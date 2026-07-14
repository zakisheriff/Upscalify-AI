'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface DividerProps {
  className?: string;
  variant?: 'line' | 'gradient' | 'dots';
}

export default function Divider({ className = '', variant = 'line' }: DividerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });

  return (
    <motion.div
      ref={ref}
      className={`divider divider--${variant} ${className}`}
      initial={{ scaleX: 0, opacity: 0 }}
      animate={isInView ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    />
  );
}
