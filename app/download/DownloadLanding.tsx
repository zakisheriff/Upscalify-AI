"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const REPO = "https://github.com/zakisheriff/Upscalify";
const RELEASES = `${REPO}/releases/latest`;

export function DownloadLanding() {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLElement>(null);

  // Smooth scrolling (Lenis), disabled when the user prefers reduced motion.
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
    const el = rootRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // Top bar hairline once you leave the hero.
      ScrollTrigger.create({
        start: "top -8",
        onUpdate: (self) => topRef.current?.classList.toggle("is-stuck", self.progress > 0 || self.scroll() > 8),
      });

      if (reduce) {
        gsap.set(".dl-reveal", { opacity: 1, y: 0 });
        return;
      }

      gsap.utils.toArray<HTMLElement>(".dl-reveal").forEach((node) => {
        gsap.fromTo(
          node,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: node, start: "top 86%", once: true },
          },
        );
      });
    }, el);

    return () => ctx.revert();
  }, [reduce]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
  }, []);

  const heroItem = {
    hidden: { opacity: 0, y: 20 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: reduce ? 0 : i * 0.08, ease: [0.16, 1, 0.3, 1] as const },
    }),
  };

  return (
    <div className="dl" ref={rootRef}>
      <header className="dl-top" ref={topRef}>
        <div className="dl-wrap dl-top__inner">
          <a className="dl-brand" href="/download">Upscalify</a>
          <nav className="dl-top__links">
            <a className="dl-top__link" href="#what">What it does</a>
            <a className="dl-top__link" href="#install">Install</a>
            <a className="dl-top__link" href="/">Web version</a>
            <a className="dl-btn dl-btn--primary dl-btn--sm" href={RELEASES}>Download</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="dl-hero">
          <div className="dl-wrap">
            <motion.h1
              className="dl-hero__mark"
              custom={0}
              variants={heroItem}
              initial="hidden"
              animate="show"
            >
              Upscalify<span> ai</span>
            </motion.h1>
            <motion.p className="dl-hero__head" custom={1} variants={heroItem} initial="hidden" animate="show">
              Sharper images, right on your Mac.
            </motion.p>
            <motion.p className="dl-hero__sub" custom={2} variants={heroItem} initial="hidden" animate="show">
              A free, on-device upscaler that rebuilds real detail in low-resolution photos.
              It runs entirely on your machine, so nothing you open ever leaves it.
            </motion.p>
            <motion.div className="dl-hero__cta" custom={3} variants={heroItem} initial="hidden" animate="show">
              <a className="dl-btn dl-btn--primary" href={RELEASES}>Download for Mac</a>
              <a className="dl-btn dl-btn--ghost" href="/">Use it in your browser</a>
            </motion.div>
            <motion.p className="dl-hero__note" custom={4} variants={heroItem} initial="hidden" animate="show">
              Free and open source. macOS, Apple Silicon or Intel.
            </motion.p>
          </div>
        </section>

        <section className="dl-section" id="what">
          <div className="dl-wrap">
            <h2 className="dl-section__head dl-reveal">What it does</h2>
            <p className="dl-section__lead dl-reveal">
              Upscalify reconstructs detail instead of smoothing the blur, and it does the whole job
              locally.
            </p>
            <div className="dl-grid">
              <div className="dl-cell dl-reveal">
                <h3 className="dl-cell__title">Real reconstruction</h3>
                <p className="dl-cell__body">
                  Powered by Real-ESRGAN, the same model behind Upscayl. It denoises and rebuilds
                  fine detail rather than just enlarging pixels.
                </p>
              </div>
              <div className="dl-cell dl-reveal">
                <h3 className="dl-cell__title">Runs on your machine</h3>
                <p className="dl-cell__body">
                  Everything happens on-device using your GPU. No uploads, no accounts, no queue to
                  wait in.
                </p>
              </div>
              <div className="dl-cell dl-reveal">
                <h3 className="dl-cell__title">Free and private</h3>
                <p className="dl-cell__body">
                  No cost and no sign-in. Your images stay with you, and the app works offline after
                  the first launch.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="dl-section" id="install">
          <div className="dl-wrap">
            <h2 className="dl-section__head dl-reveal">Getting started</h2>
            <p className="dl-section__lead dl-reveal">
              Two minutes from download to your first upscale.
            </p>
            <div className="dl-steps">
              <div className="dl-step dl-reveal">
                <h3 className="dl-step__title">Download and open</h3>
                <p className="dl-step__body">
                  Grab the disk image, then drag Upscalify into your Applications folder.
                </p>
              </div>
              <div className="dl-step dl-reveal">
                <h3 className="dl-step__title">Allow the first launch</h3>
                <p className="dl-step__body">
                  It is a new, unsigned build, so the first time you open it, right-click the app and
                  choose Open. You only do this once.
                </p>
              </div>
              <div className="dl-step dl-reveal">
                <h3 className="dl-step__title">Let it set up once</h3>
                <p className="dl-step__body">
                  On first run it downloads the upscaling model a single time, then works completely
                  offline.
                </p>
              </div>
            </div>
            <div className="dl-install__cta dl-reveal">
              <a className="dl-btn dl-btn--primary" href={RELEASES}>Download for Mac</a>
            </div>
          </div>
        </section>

        <footer className="dl-foot">
          <div className="dl-wrap dl-foot__inner">
            <span>An upscaler from <a href="https://theatom.lk" rel="noopener">The Atom</a>.</span>
            <span className="dl-foot__links">
              <a href={REPO} rel="noopener">GitHub</a>
              <a href="/">Web version</a>
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}
