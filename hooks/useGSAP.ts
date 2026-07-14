'use client';

import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface UseGSAPOptions {
  trigger?: string | Element;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  pin?: boolean;
  markers?: boolean;
}

export function useGSAP(
  callback: (ctx: gsap.Context) => void,
  options: UseGSAPOptions = {}
) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      callback(ctx);
    }, containerRef);

    return () => ctx.revert();
  }, [callback, options.trigger, options.start, options.end, options.scrub, options.pin, options.markers]);

  return containerRef;
}

export function useScrollProgress() {
  const progressRef = useRef(0);

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      progressRef.current = docHeight > 0 ? scrollTop / docHeight : 0;
    };

    window.addEventListener('scroll', update, { passive: true });
    update();

    return () => window.removeEventListener('scroll', update);
  }, []);

  return progressRef;
}

export { gsap, ScrollTrigger };
