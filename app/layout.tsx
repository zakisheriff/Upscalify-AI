import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { StructuredData } from "@/components/StructuredData";

// Display face carries an optical-size axis — used to make headlines "sharpen".
const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
  weight: ["400", "460", "500"],
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const SITE = "https://upscalify.theatom.lk";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Upscalify AI — reconstruct detail in images and video",
    template: "%s · Upscalify AI",
  },
  description:
    "Upscalify AI upscales low-resolution images and video locally, reconstructing real detail rather than smoothing it away. Upload a file, pick fast or high quality, and download a sharper result.",
  applicationName: "Upscalify AI",
  authors: [{ name: "Zaki", url: "https://theatom.lk" }],
  creator: "The Atom",
  publisher: "The Atom",
  keywords: [
    "image upscaler",
    "video upscaler",
    "AI upscaling",
    "increase resolution",
    "enhance image detail",
    "Real-ESRGAN",
    "The Atom",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE,
    siteName: "Upscalify AI",
    title: "Upscalify AI — reconstruct detail in images and video",
    description:
      "Upscale images and video locally. Reconstruct real detail, compare before and after, download the result.",
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: "Upscalify AI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Upscalify AI — reconstruct detail in images and video",
    description:
      "Upscale images and video locally. Reconstruct real detail, compare before and after, download the result.",
    images: ["/og.svg"],
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${plexSans.variable} ${plexMono.variable}`}
    >
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
        <StructuredData />
      </body>
    </html>
  );
}
