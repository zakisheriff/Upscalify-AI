'use client';

import { ReactNode, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

interface SmoothScrollProps {
  children: ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  return <>{children}</>;
}
