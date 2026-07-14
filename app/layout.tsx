import type { Metadata } from "next";
import { Inter, Caveat } from "next/font/google";
import "./globals.css";
import "./components.css";
import { StructuredData } from "@/components/StructuredData";

// System / Apple fonts first; Inter as the cross-platform fallback.
const inter = Inter({
  variable: "--font-ui",
  subsets: ["latin"],
  display: "swap",
});

// One characterful script, used only for the accent word in the title.
const caveat = Caveat({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

const SITE = "https://upscalify.theatom.lk";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Upscalify AI — upscale images and video",
  description:
    "Upscalify AI upscales low-resolution images and video, reconstructing real detail. Drop a file and download a sharper result. Runs locally.",
  applicationName: "Upscalify AI",
  authors: [{ name: "Zaki", url: "https://theatom.lk" }],
  creator: "The Atom",
  keywords: ["image upscaler", "video upscaler", "AI upscaling", "increase resolution", "The Atom"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE,
    siteName: "Upscalify AI",
    title: "Upscalify AI — upscale images and video",
    description: "Drop a file and download a sharper result. Runs locally.",
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: "Upscalify AI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Upscalify AI — upscale images and video",
    description: "Drop a file and download a sharper result. Runs locally.",
    images: ["/og.svg"],
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${caveat.variable}`}>
      <body>
        {children}
        <StructuredData />
      </body>
    </html>
  );
}
