'use client';

import { useRef, useEffect, useState } from 'react';

interface MarqueeProps {
  text: string;
  speed?: number;
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
}

export default function Marquee({
  text,
  speed = 50,
  className = '',
  reverse = false,
  pauseOnHover = true,
}: MarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const repeatedText = Array(8).fill(text).join(' \u00A0\u00A0\u00A0\u00A0 ');

  return (
    <div
      ref={containerRef}
      className={`marquee ${className} ${isPaused ? 'marquee--paused' : ''}`}
      onMouseEnter={pauseOnHover ? () => setIsPaused(true) : undefined}
      onMouseLeave={pauseOnHover ? () => setIsPaused(false) : undefined}
    >
      <div
        className="marquee__track"
        style={{
          animationDuration: `${100 / speed}s`,
          animationDirection: reverse ? 'reverse' : 'normal',
        }}
      >
        <span className="marquee__text">{repeatedText}</span>
        <span className="marquee__text" aria-hidden="true">{repeatedText}</span>
      </div>
    </div>
  );
}
