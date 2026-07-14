"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ReconstructionFront } from "./ReconstructionFront";

export function Hero() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const supportingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const heading = headingRef.current;
    const supporting = supportingRef.current;
    if (!heading || !supporting) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      heading.style.filter = "none";
      heading.style.fontVariationSettings = '"opsz" 144, "SOFT" 0';
      gsap.set([heading, ...Array.from(supporting.children)], { opacity: 1, y: 0 });
      return;
    }

    // The headline resolves: optical size climbs and blur clears — the type
    // itself performs the product. GSAP owns this element exclusively.
    const proxy = { opsz: 12, soft: 60, blur: 9 };
    const tl = gsap.timeline({ delay: 0.15 });
    gsap.set(heading, { opacity: 0, y: 14 });
    gsap.set(Array.from(supporting.children), { opacity: 0, y: 16 });

    tl.to(heading, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" })
      .to(
        proxy,
        {
          opsz: 144,
          soft: 0,
          blur: 0,
          duration: 1.5,
          ease: "power3.out",
          onUpdate: () => {
            heading.style.fontVariationSettings = `"opsz" ${proxy.opsz.toFixed(1)}, "SOFT" ${proxy.soft.toFixed(1)}`;
            heading.style.filter = `blur(${proxy.blur.toFixed(2)}px)`;
          },
        },
        "<",
      )
      .to(
        Array.from(supporting.children),
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "power2.out" },
        "-=0.9",
      );

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <section className="hero" aria-label="Introduction">
      <div className="hero__canvas">
        <ReconstructionFront className="hero__front" />
        <div className="hero__scrim" aria-hidden="true" />
      </div>
      <div className="container hero__content">
        <h1 ref={headingRef} className="hero__title">
          Reconstruct the detail
          <br />a low-resolution file lost.
        </h1>
        <div ref={supportingRef} className="hero__supporting">
          <p className="lead hero__lead">
            Upscalify enlarges images and video by rebuilding real detail — crisp edges, legible
            texture, steady motion — instead of smoothing the blur away. Upload a file and watch it
            resolve.
          </p>
          <div className="hero__actions">
            <a className="btn btn--primary" href="#tool">
              Upscale a file
            </a>
            <a className="btn btn--ghost" href="#how">
              See how it works
            </a>
          </div>
          <p className="mono hero__caption">
            Above: the same skyline, unresolved on the left, reconstructed on the right.
          </p>
        </div>
      </div>
    </section>
  );
}
