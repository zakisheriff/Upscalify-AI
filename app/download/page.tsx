import type { Metadata } from "next";
import { DownloadLanding } from "./DownloadLanding";
import "./download.css";

const SITE = "https://upscalify.theatom.lk";
const URL = `${SITE}/download`;

export const metadata: Metadata = {
  title: "Download Upscalify AI for Mac — free on-device image upscaler",
  description:
    "Upscalify AI is a free, open-source image upscaler for macOS. It reconstructs real detail with Real-ESRGAN, runs entirely on your machine, and never uploads your images. Download for Apple Silicon or Intel.",
  keywords: [
    "image upscaler mac",
    "free upscaler",
    "on-device upscaler",
    "Real-ESRGAN mac app",
    "upscayl alternative",
    "AI image upscaler",
    "offline photo enhancer",
    "download upscalify",
  ],
  alternates: { canonical: URL },
  openGraph: {
    type: "website",
    url: URL,
    siteName: "Upscalify AI",
    title: "Download Upscalify AI for Mac",
    description:
      "A free, on-device image upscaler for macOS. Reconstructs real detail with Real-ESRGAN, runs locally, uploads nothing.",
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: "Upscalify AI for Mac" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Download Upscalify AI for Mac",
    description:
      "A free, on-device image upscaler for macOS. Reconstructs real detail with Real-ESRGAN, runs locally, uploads nothing.",
    images: ["/og.svg"],
  },
};

// Machine-readable description for search and AI answer engines (AEO/GEO):
// the app itself, plus the questions people actually ask before downloading.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": `${URL}#app`,
      name: "Upscalify AI",
      operatingSystem: "macOS",
      applicationCategory: "MultimediaApplication",
      downloadUrl: "https://github.com/zakisheriff/Upscalify-AI/releases/latest",
      softwareVersion: "0.1.0",
      description:
        "Upscalify AI is a free, open-source macOS app that upscales low-resolution images by reconstructing real detail with Real-ESRGAN. It runs entirely on-device using the GPU and never uploads images.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      isAccessibleForFree: true,
      author: { "@type": "Organization", name: "The Atom", url: "https://theatom.lk" },
      featureList: [
        "On-device image upscaling with Real-ESRGAN",
        "Fast 2x and high-quality 4x modes",
        "Before and after comparison",
        "Works offline after first launch",
        "No account, no upload, no cost",
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${URL}#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "Is Upscalify AI free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Upscalify AI is completely free and open source. There is no cost, no subscription, and no account.",
          },
        },
        {
          "@type": "Question",
          name: "Do my images get uploaded anywhere?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. All processing happens on your own Mac using its GPU. Your images never leave your machine, and the app works offline after the first launch.",
          },
        },
        {
          "@type": "Question",
          name: "What Macs does it run on?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Upscalify AI runs on macOS with both Apple Silicon and Intel Macs. The first launch downloads the upscaling model once, then it runs locally.",
          },
        },
        {
          "@type": "Question",
          name: "How is it different from Upscayl?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Upscalify AI uses the same Real-ESRGAN models as Upscayl, so results are comparable. It is a lightweight, focused app that pairs with a browser-based version of the same tool.",
          },
        },
      ],
    },
  ],
};

export default function DownloadPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DownloadLanding />
    </>
  );
}
