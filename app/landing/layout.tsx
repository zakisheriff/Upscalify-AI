import type { Metadata } from 'next';
import './globals.css';
import './components.css';

export const metadata: Metadata = {
  title: 'Upscalify \u2014 local image and video upscaler',
  description: 'Sharpen and upscale images and video on your machine. Real-ESRGAN and SeedVR2. Nothing leaves your device.',
  openGraph: {
    title: 'Upscalify \u2014 local image and video upscaler',
    description: 'Sharpen and upscale images and video on your machine.',
    url: 'https://upscalify.theatom.lk',
    siteName: 'Upscalify',
    type: 'website',
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
