'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import SectionReveal from './SectionReveal';

const STEPS = [
  {
    id: 1,
    title: 'drop your file',
    description: 'drag an image or video onto the app. or click to browse. supports jpg, png, webp, mp4, and more.',
  },
  {
    id: 2,
    title: 'pick quality',
    description: 'choose fast 2x for speed or high quality 4x for maximum detail. the model runs on your gpu.',
  },
  {
    id: 3,
    title: 'download result',
    description: 'compare before and after with the built-in slider. download the upscaled version when ready.',
  },
];

function StepCard({ step, index }: { step: typeof STEPS[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      className="step-card"
      initial={{ opacity: 0, x: -40 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
      transition={{
        duration: 0.6,
        delay: index * 0.2,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <div className="step-card__number">
        <span>{String(step.id).padStart(2, '0')}</span>
      </div>
      <div className="step-card__content">
        <h3 className="step-card__title">{step.title}</h3>
        <p className="step-card__description">{step.description}</p>
      </div>
    </motion.div>
  );
}

export default function HowItWorks() {
  return (
    <section className="how-it-works" id="how-it-works">
      <div className="container">
        <SectionReveal>
          <div className="how-it-works__header">
            <span className="section-label">process</span>
            <h2 className="how-it-works__title">
              three steps
            </h2>
            <p className="how-it-works__subtitle">
              no configuration, no accounts, no learning curve.
            </p>
          </div>
        </SectionReveal>

        <div className="how-it-works__steps">
          {STEPS.map((step, i) => (
            <StepCard key={step.id} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
