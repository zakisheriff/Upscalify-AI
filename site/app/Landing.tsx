"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const REPO = "https://github.com/zakisheriff/Upscalify";
// Direct download of the latest release's asset — GitHub serves it as an
// attachment, so the browser downloads it straight away (no repo detour).
// The filename must match the asset attached to the latest release exactly.
const DOWNLOAD = `${REPO}/releases/latest/download/Upscalify-0.1.0-arm64.dmg`;

export function Landing() {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLElement>(null);

  // Smooth scrolling (Lenis), off when the user prefers reduced motion.
  useEffect(() => {
    if (reduce) return;
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
    let id = 0;
    const raf = (t: number) => {
      lenis.raf(t);
      id = requestAnimationFrame(raf);
    };
    id = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(id);
      lenis.destroy();
    };
  }, [reduce]);

  // Scroll-in reveals (GSAP) + sticky-bar hairline.
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = rootRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        start: "top -8",
        onUpdate: (self) =>
          topRef.current?.classList.toggle("is-stuck", self.scroll() > 8),
      });

      if (reduce) {
        gsap.set(".reveal", { opacity: 1, y: 0 });
        return;
      }
      gsap.utils.toArray<HTMLElement>(".reveal").forEach((node) => {
        gsap.fromTo(
          node,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: node, start: "top 88%", once: true },
          },
        );
      });
    }, el);

    return () => ctx.revert();
  }, [reduce]);

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: reduce ? 0 : i * 0.08, ease: [0.16, 1, 0.3, 1] as const },
    }),
  };

  return (
    <div ref={rootRef}>
      <header className="top" ref={topRef}>
        <div className="wrap top__inner">
          <a className="brand" href="/">Upscalify ai</a>
          <nav className="top__links">
            <a className="top__link" href="#install">Install</a>
            <a className="top__link" href={REPO} rel="noopener">GitHub</a>
            <a className="btn btn--primary btn--sm" href={DOWNLOAD}>Download</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="wrap">
            <motion.p className="hero__mark" custom={1} variants={item} initial="hidden" animate="show">
              Sharper images and video, right on your Mac.
            </motion.p>
            <motion.div className="hero__cta" custom={3} variants={item} initial="hidden" animate="show">
              <a className="btn btn--primary" href={DOWNLOAD}>Download for Mac</a>
              <a className="btn btn--ghost" href={REPO} rel="noopener">View on GitHub</a>
            </motion.div>
            <motion.p className="hero__note" custom={4} variants={item} initial="hidden" animate="show">
              Free and open source. Requires an Apple Silicon Mac (M1 or later).
            </motion.p>
          </div>
        </section>

        <section className="section" id="what">
          <div className="wrap">
            <h2 className="section__head reveal">What it does</h2>
            <p className="section__lead reveal">
              Upscalify reconstructs detail instead of smoothing the blur, and it does the whole job
              on your own machine.
            </p>
            <div className="grid">
              <div className="reveal">
                <h3 className="cell__title">Real reconstruction</h3>
                <p className="cell__body">
                  Powered by Real-ESRGAN, the same model behind Upscayl. It denoises and rebuilds fine
                  detail rather than just enlarging pixels.
                </p>
              </div>
              <div className="reveal">
                <h3 className="cell__title">Images and video</h3>
                <p className="cell__body">
                  Upscale photos, then compare before and after. Video is handled too, with the original
                  audio kept intact.
                </p>
              </div>
              <div className="reveal">
                <h3 className="cell__title">Private and free</h3>
                <p className="cell__body">
                  No cost, no sign-in, no upload. Your files stay with you, and the app works offline
                  after the first launch.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="install">
          <div className="wrap">
            <h2 className="section__head reveal">Getting started</h2>
            <p className="section__lead reveal">
              A couple of minutes from download to your first upscale.
            </p>
            <div className="steps">
              <div className="reveal">
                <h3 className="step__title">Download and open</h3>
                <p className="step__body">
                  Grab the disk image, then drag Upscalify into your Applications folder.
                </p>
              </div>
              <div className="reveal">
                <h3 className="step__title">Allow the first launch</h3>
                <p className="step__body">
                  It is a new, unsigned build, so the first time you open it, right-click the app and
                  choose Open. You only do this once.
                </p>
              </div>
              <div className="reveal">
                <h3 className="step__title">Let it set up once</h3>
                <p className="step__body">
                  On first run it downloads the upscaling model a single time, about 42 MB, then works
                  completely offline.
                </p>
              </div>
            </div>
            <div className="install__cta reveal">
              <a className="btn btn--primary" href={DOWNLOAD}>Download for Mac</a>
            </div>
          </div>
        </section>

        <footer className="foot">
          <div className="wrap foot__inner">
            <span>Upscalify AI by <a href="https://theatom.lk" rel="noopener">The Atom</a>.</span>
            <span className="foot__links">
              <a href={REPO} rel="noopener">GitHub</a>
              <a href={DOWNLOAD} rel="noopener">Download</a>
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}
