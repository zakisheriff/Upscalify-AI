'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

interface ScrollProgressProps {
  className?: string;
}

export default function ScrollProgress({ className = '' }: ScrollProgressProps) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      className={`scroll-progress ${className}`}
      style={{ scaleX, transformOrigin: '0%' }}
    />
  );
}
