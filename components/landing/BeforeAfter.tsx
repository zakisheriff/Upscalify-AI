'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import SectionReveal from './SectionReveal';

export default function BeforeAfter() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [position, setPosition] = useState(50);

  const handleMove = (clientX: number) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(percent);
  };

  const handleMouseDown = () => {
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  return (
    <section className="before-after" id="showcase">
      <div className="container">
        <SectionReveal>
          <div className="before-after__header">
            <span className="section-label">comparison</span>
            <h2 className="before-after__title">
              see the difference
            </h2>
          </div>
        </SectionReveal>

        <motion.div
          ref={ref}
          className="before-after__comparison"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          onMouseDown={handleMouseDown}
          onTouchMove={handleTouchMove}
          role="slider"
          aria-label="before and after comparison"
          aria-valuenow={Math.round(position)}
          aria-valuemin={0}
          aria-valuemax={100}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') setPosition((p) => Math.max(0, p - 2));
            if (e.key === 'ArrowRight') setPosition((p) => Math.min(100, p + 2));
          }}
        >
          <div className="before-after__placeholder">
            <div className="before-after__placeholder-inner">
              <span className="before-after__placeholder-text">upload an image in the app to compare</span>
            </div>
          </div>

          <div
            className="before-after__overlay"
            style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
          >
            <div className="before-after__placeholder before-after__placeholder--after">
              <div className="before-after__placeholder-inner">
                <span className="before-after__placeholder-text">upscaled result</span>
              </div>
            </div>
          </div>

          <div
            className="before-after__handle"
            style={{ left: `${position}%` }}
          >
            <div className="before-after__handle-line" />
            <div className="before-after__handle-grip">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M8 6L4 12L8 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 6L20 12L16 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <span className="before-after__label before-after__label--before">original</span>
          <span className="before-after__label before-after__label--after">upscaled</span>
        </motion.div>
      </div>
    </section>
  );
}
