import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-ui", display: "swap" });

// Ndot55 — Nothing's dot-matrix typeface, used for the wordmark only.
const ndot = localFont({
  src: "./fonts/Ndot55-Regular.otf",
  variable: "--font-dot",
  display: "swap",
});

const SITE = "https://upscalify.theatom.lk";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Upscalify AI — free on-device image and video upscaler for Mac",
  description:
    "Upscalify AI is a free, open-source upscaler for macOS on Apple Silicon. It reconstructs real detail with Real-ESRGAN, runs entirely on your machine, and never uploads your files.",
  keywords: [
    "image upscaler mac",
    "free upscaler",
    "on-device upscaler",
    "Real-ESRGAN mac app",
    "upscayl alternative",
    "AI image upscaler",
    "video upscaler mac",
    "offline photo enhancer",
    "download upscalify",
  ],
  applicationName: "Upscalify AI",
  authors: [{ name: "Zaki Sheriff" }, { name: "The Atom", url: "https://theatom.lk" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE,
    siteName: "Upscalify AI",
    title: "Upscalify AI — free on-device upscaler for Mac",
    description:
      "Reconstructs real detail with Real-ESRGAN. Runs locally on your Mac, uploads nothing. Free and open source.",
    images: [{ url: "/logo-upscalify.png", width: 1200, height: 1200, alt: "Upscalify AI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Upscalify AI — free on-device upscaler for Mac",
    description:
      "Reconstructs real detail with Real-ESRGAN. Runs locally on your Mac, uploads nothing. Free and open source.",
    images: ["/logo-upscalify.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${ndot.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
