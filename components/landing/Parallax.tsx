'use client';

import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
  direction?: 'up' | 'down';
}

export default function Parallax({
  children,
  speed = 0.5,
  className = '',
  direction = 'up',
}: ParallaxProps) {
  const { scrollYProgress } = useScroll();
  const factor = direction === 'up' ? -1 : 1;
  const y = useTransform(scrollYProgress, [0, 1], [factor * speed * 100, factor * -speed * 100]);

  return (
    <motion.div className={`parallax ${className}`} style={{ y }}>
      {children}
    </motion.div>
  );
}
