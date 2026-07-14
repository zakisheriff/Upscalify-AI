'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

interface UseLenisOptions {
  duration?: number;
  easing?: (t: number) => number;
  orientation?: 'vertical' | 'horizontal';
  gestureOrientation?: 'vertical' | 'horizontal' | 'both';
  smoothWheel?: boolean;
  wheelMultiplier?: number;
  touchMultiplier?: number;
  infinite?: boolean;
}

export function useLenis(options: UseLenisOptions = {}) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: options.duration ?? 1.2,
      easing: options.easing ?? (t => Math.min(1, 1.001 - Math.pow(2, -10 * t))),
      orientation: options.orientation ?? 'vertical',
      gestureOrientation: options.gestureOrientation ?? 'vertical',
      smoothWheel: options.smoothWheel ?? true,
      wheelMultiplier: options.wheelMultiplier ?? 1,
      touchMultiplier: options.touchMultiplier ?? 2,
      infinite: options.infinite ?? false,
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [
    options.duration,
    options.easing,
    options.orientation,
    options.gestureOrientation,
    options.smoothWheel,
    options.wheelMultiplier,
    options.touchMultiplier,
    options.infinite,
  ]);

  return lenisRef;
}
