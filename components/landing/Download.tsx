'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import SectionReveal from './SectionReveal';
import MagneticButton from './MagneticButton';
import Counter from './Counter';

const PLATFORMS = [
  {
    name: 'macOS',
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z',
    url: '#',
    size: '45 MB',
    version: 'v1.0.0',
  },
  {
    name: 'windows',
    icon: 'M3 12V6.75l6-1.32v6.48L3 12zm7-.18V6.94l7-1.54v6.8l-7 1.54zm1 8.18l-7-1.55V13.5l7 1.56v6.5zm1-7.59l7-1.55V9.16l-7 1.64v5.27zm1-8.38L5 3.21v6.26l7 1.32V3.86zm8.31 3.65L13 11.22V6.4l5.31 1.11zM13 18.4l5.31-1.11V13.6L13 14.7v3.7z',
    url: '#',
    size: '52 MB',
    version: 'v1.0.0',
  },
  {
    name: 'linux',
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-6h4v2h-4v-2z',
    url: '#',
    size: '48 MB',
    version: 'v1.0.0',
  },
];

function PlatformCard({ platform, index }: { platform: typeof PLATFORMS[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      className="platform-card"
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <div className="platform-card__icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
          <path d={platform.icon} />
        </svg>
      </div>
      <div className="platform-card__info">
        <h3 className="platform-card__name">{platform.name}</h3>
        <span className="platform-card__meta">{platform.version} &middot; {platform.size}</span>
      </div>
      <MagneticButton href={platform.url} strength={0.15}>
        <span className="btn btn--primary btn--small">download</span>
      </MagneticButton>
    </motion.div>
  );
}

export default function Download() {
  return (
    <section className="download" id="download">
      <div className="container">
        <SectionReveal>
          <div className="download__header">
            <span className="section-label">download</span>
            <h2 className="download__title">
              get upscalify
            </h2>
            <p className="download__subtitle">
              free and open source. runs on your machine, not our servers.
            </p>
          </div>
        </SectionReveal>

        <div className="download__platforms">
          {PLATFORMS.map((platform, i) => (
            <PlatformCard key={platform.name} platform={platform} index={i} />
          ))}
        </div>

        <motion.div
          className="download__note"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p>requires a gpu with vulkan support for real-esrgan. cpu fallback available.</p>
        </motion.div>
      </div>
    </section>
  );
}
