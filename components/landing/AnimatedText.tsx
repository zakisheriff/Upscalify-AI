'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  tag?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  splitBy?: 'words' | 'chars' | 'lines';
}

function CharSpan({ char, index, delay }: { char: string; index: number; delay: number }) {
  return (
    <motion.span
      className="animated-char"
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.6,
        delay: delay + index * 0.02,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{ display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : undefined }}
    >
      {char}
    </motion.span>
  );
}

function WordSpan({ word, index, delay }: { word: string; index: number; delay: number }) {
  return (
    <motion.span
      className="animated-word"
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.5,
        delay: delay + index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{ display: 'inline-block', marginRight: '0.3em' }}
    >
      {word}
    </motion.span>
  );
}

export default function AnimatedText({
  text,
  className = '',
  delay = 0,
  tag = 'p',
  splitBy = 'chars',
}: AnimatedTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  if (!isInView) {
    const hiddenProps = { className, style: { opacity: 0 } as React.CSSProperties };
    if (tag === 'h1') return <h1 {...hiddenProps}>{text}</h1>;
    if (tag === 'h2') return <h2 {...hiddenProps}>{text}</h2>;
    if (tag === 'h3') return <h3 {...hiddenProps}>{text}</h3>;
    if (tag === 'span') return <span {...hiddenProps}>{text}</span>;
    return <p {...hiddenProps}>{text}</p>;
  }

  if (splitBy === 'chars') {
    const content = text.split('').map((char, i) => (
      <CharSpan key={`${char}-${i}`} char={char} index={i} delay={delay} />
    ));

    if (tag === 'h1') return <h1 ref={ref} className={className}>{content}</h1>;
    if (tag === 'h2') return <h2 ref={ref} className={className}>{content}</h2>;
    if (tag === 'h3') return <h3 ref={ref} className={className}>{content}</h3>;
    if (tag === 'span') return <span ref={ref} className={className}>{content}</span>;
    return <p ref={ref} className={className}>{content}</p>;
  }

  if (splitBy === 'words') {
    const content = text.split(' ').map((word, i) => (
      <WordSpan key={`${word}-${i}`} word={word} index={i} delay={delay} />
    ));

    if (tag === 'h1') return <h1 ref={ref} className={className}>{content}</h1>;
    if (tag === 'h2') return <h2 ref={ref} className={className}>{content}</h2>;
    if (tag === 'h3') return <h3 ref={ref} className={className}>{content}</h3>;
    if (tag === 'span') return <span ref={ref} className={className}>{content}</span>;
    return <p ref={ref} className={className}>{content}</p>;
  }

  const Wrapper = tag === 'h1' ? 'h1' : tag === 'h2' ? 'h2' : tag === 'h3' ? 'h3' : tag === 'span' ? 'span' : 'p';

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <Wrapper>{text}</Wrapper>
    </motion.div>
  );
}
