'use client';

import { useState, useCallback } from 'react';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import TechStack from '@/components/landing/TechStack';
import HowItWorks from '@/components/landing/HowItWorks';
import BeforeAfter from '@/components/landing/BeforeAfter';
import Download from '@/components/landing/Download';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';
import ScrollProgress from '@/components/landing/ScrollProgress';
import Preloader from '@/components/landing/Preloader';
import SmoothScroll from '@/components/landing/SmoothScroll';

export default function LandingPage() {
  const [loaded, setLoaded] = useState(false);

  const handlePreloaderComplete = useCallback(() => {
    setLoaded(true);
  }, []);

  return (
    <SmoothScroll>
      <Preloader onComplete={handlePreloaderComplete} />
      <ScrollProgress />
      <Navbar />
      <main className="landing">
        <Hero />
        <Features />
        <TechStack />
        <HowItWorks />
        <BeforeAfter />
        <Download />
        <CTA />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
