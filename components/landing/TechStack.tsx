'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import SectionReveal from './SectionReveal';
import Marquee from './Marquee';

const TECH = [
  'Real-ESRGAN',
  'SeedVR2',
  'ffmpeg',
  'sharp',
  'Next.js',
  'TypeScript',
  'WebGPU',
  'Vulkan',
];

const TOOLS = [
  { name: 'images', count: '8 formats' },
  { name: 'video', count: '6 formats' },
  { name: 'max file size', count: '500 MB' },
  { name: 'scale factor', count: 'up to 4x' },
];

export default function TechStack() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="tech-stack" ref={ref}>
      <Marquee text="Real-ESRGAN \u00B7 SeedVR2 \u00B7 ffmpeg \u00B7 sharp \u00B7 Next.js \u00B7 TypeScript \u00B7 Vulkan" speed={30} className="tech-stack__marquee" />

      <div className="container">
        <SectionReveal>
          <div className="tech-stack__content">
            <span className="section-label">built with</span>
            <h2 className="tech-stack__title">
              under the hood
            </h2>
          </div>
        </SectionReveal>

        <div className="tech-stack__grid">
          {TOOLS.map((tool, i) => (
            <motion.div
              key={tool.name}
              className="tech-stack__item"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{
                duration: 0.5,
                delay: i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <span className="tech-stack__item-name">{tool.name}</span>
              <span className="tech-stack__item-count">{tool.count}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
