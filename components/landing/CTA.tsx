'use client';

import { motion } from 'framer-motion';
import SectionReveal from './SectionReveal';
import MagneticButton from './MagneticButton';
import AnimatedText from './AnimatedText';

export default function CTA() {
  return (
    <section className="cta">
      <div className="container">
        <SectionReveal>
          <div className="cta__content">
            <AnimatedText
              text="ready to upscale?"
              tag="h2"
              splitBy="words"
              className="cta__title"
            />
            <p className="cta__subtitle">
              download upscalify and start rebuilding your images and video at higher resolution.
            </p>
            <MagneticButton href="#download" strength={0.2}>
              <span className="btn btn--primary btn--large">get started</span>
            </MagneticButton>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
