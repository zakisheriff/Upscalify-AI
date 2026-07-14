"use client";

import { useEffect, useRef, type ReactNode, type ElementType } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Scroll-triggered reveal — a quiet echo of the hero's "resolve" idea: content
 * lifts and un-blurs as it enters. GSAP owns scroll here; Framer Motion is left
 * for interaction elsewhere, so the two never animate the same element.
 */
export function Reveal({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "li";
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 22, filter: "blur(6px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 82%", once: true },
        },
      );
    });
    return () => ctx.revert();
  }, []);

  const Component = Tag as ElementType;
  const attrs = { ref, className } as Record<string, unknown>;
  return <Component {...attrs}>{children}</Component>;
}
