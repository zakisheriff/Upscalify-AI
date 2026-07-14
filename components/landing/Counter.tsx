'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

interface CounterProps {
  from?: number;
  to: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export default function Counter({
  from = 0,
  to,
  duration = 2,
  suffix = '',
  prefix = '',
  className = '',
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [current, setCurrent] = useState(from);

  useEffect(() => {
    if (!isInView) return;

    const startTime = performance.now();
    const diff = to - from;

    function step(timestamp: number) {
      const elapsed = (timestamp - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(from + diff * eased));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }, [isInView, from, to, duration]);

  return (
    <span ref={ref} className={`counter ${className}`}>
      {prefix}{current}{suffix}
    </span>
  );
}
