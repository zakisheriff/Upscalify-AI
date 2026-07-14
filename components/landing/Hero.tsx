'use client';

import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import AnimatedText from './AnimatedText';
import MagneticButton from './MagneticButton';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const scale = useTransform(scrollYProgress, [0, 0.8], [1, 0.95]);

  return (
    <section ref={containerRef} className="hero" id="hero">
      <motion.div className="hero__content" style={{ opacity, y, scale }}>
        <div className="hero__badge">
          <span className="hero__badge-dot" />
          local-first image and video upscaler
        </div>

        <h1 className="hero__title">
          <AnimatedText text="upscale" tag="span" splitBy="chars" className="hero__title-line" />
          <AnimatedText text="anything" tag="span" splitBy="chars" className="hero__title-line hero__title-line--accent" delay={0.3} />
        </h1>

        <AnimatedText
          text="sharper, higher-resolution images and video. nothing leaves your machine."
          tag="p"
          splitBy="words"
          className="hero__subtitle"
          delay={0.6}
        />

        <motion.div
          className="hero__actions"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <MagneticButton href="#download" strength={0.2}>
            <span className="btn btn--primary btn--large">download for mac</span>
          </MagneticButton>
          <MagneticButton href="#features" strength={0.2}>
            <span className="btn btn--ghost btn--large">learn more</span>
          </MagneticButton>
        </motion.div>

        <motion.div
          className="hero__stats"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <div className="hero__stat">
            <span className="hero__stat-value">4x</span>
            <span className="hero__stat-label">resolution boost</span>
          </div>
          <div className="hero__stat-divider" />
          <div className="hero__stat">
            <span className="hero__stat-value">0</span>
            <span className="hero__stat-label">data sent to cloud</span>
          </div>
          <div className="hero__stat-divider" />
          <div className="hero__stat">
            <span className="hero__stat-value">2</span>
            <span className="hero__stat-label">quality modes</span>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="hero__scroll-indicator"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        <motion.div
          className="hero__scroll-line"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  );
}
