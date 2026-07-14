'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import SectionReveal from './SectionReveal';

const FEATURES = [
  {
    id: 'real-esrgan',
    title: 'Real-ESRGAN engine',
    description: 'The same neural network that powers Upscayl. Reconstructs detail that simple interpolation destroys.',
    icon: '01',
  },
  {
    id: 'seedvr2',
    title: 'SeedVR2 for video',
    description: 'Frame-by-frame video upscaling with temporal coherence. Audio stays intact.',
    icon: '02',
  },
  {
    id: 'local',
    title: 'runs locally',
    description: 'your files never leave your machine. no accounts, no cloud processing, no surprises.',
    icon: '03',
  },
  {
    id: 'quality',
    title: 'two quality tiers',
    description: 'Fast 2x for quick results. High quality 4x when you need the best.',
    icon: '04',
  },
];

function FeatureCard({ feature, index }: { feature: typeof FEATURES[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      className="feature-card"
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{
        duration: 0.6,
        delay: index * 0.12,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <div className="feature-card__icon">{feature.icon}</div>
      <h3 className="feature-card__title">{feature.title}</h3>
      <p className="feature-card__description">{feature.description}</p>
    </motion.div>
  );
}

export default function Features() {
  return (
    <section className="features" id="features">
      <div className="container">
        <SectionReveal>
          <div className="features__header">
            <span className="section-label">capabilities</span>
            <h2 className="features__title">
              what it does
            </h2>
            <p className="features__subtitle">
              built on research-grade models, wrapped in a tool that stays out of your way.
            </p>
          </div>
        </SectionReveal>

        <div className="features__grid">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.id} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
