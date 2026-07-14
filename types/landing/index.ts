export type AnimationDirection = 'up' | 'down' | 'left' | 'right';

export type ScrollAxis = 'vertical' | 'horizontal';

export type EasingPreset = 'smooth' | 'snappy' | 'bounce' | 'linear';

export interface SectionProps {
  className?: string;
  children: React.ReactNode;
  id?: string;
}

export interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  tag?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  splitBy?: 'words' | 'chars' | 'lines';
}

export interface ParallaxProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
  direction?: AnimationDirection;
}

export interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  href?: string;
  onClick?: () => void;
}

export interface CounterProps {
  from?: number;
  to: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export interface MarqueeProps {
  text: string;
  speed?: number;
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Step {
  id: number;
  title: string;
  description: string;
}

export interface Platform {
  name: string;
  icon: string;
  url: string;
  size?: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export type PreloaderStatus = 'loading' | 'complete';

export interface ScrollProgressProps {
  className?: string;
}

export interface SectionRevealProps {
  children: React.ReactNode;
  className?: string;
  direction?: AnimationDirection;
  delay?: number;
  duration?: number;
}

export interface CursorProps {
  className?: string;
}

export interface PageTransitionProps {
  children: React.ReactNode;
}
