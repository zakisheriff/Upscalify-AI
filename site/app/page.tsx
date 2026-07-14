import { Landing } from "./Landing";
import "./landing.css";

const SITE = "https://upscalify.theatom.lk";

// Machine-readable description for search and AI answer engines (AEO/GEO).
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://theatom.lk/#organization",
      name: "The Atom",
      url: "https://theatom.lk",
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE}/#app`,
      name: "Upscalify AI",
      operatingSystem: "macOS",
      applicationCategory: "MultimediaApplication",
      url: SITE,
      downloadUrl: "https://github.com/zakisheriff/Upscalify-AI/releases/latest",
      softwareVersion: "0.1.0",
      description:
        "Upscalify AI is a free, open-source macOS app that upscales low-resolution images and video by reconstructing real detail with Real-ESRGAN. It runs entirely on-device and never uploads files.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      isAccessibleForFree: true,
      author: { "@type": "Organization", name: "The Atom", url: "https://theatom.lk" },
      featureList: [
        "On-device image upscaling with Real-ESRGAN",
        "Video upscaling with preserved audio",
        "Fast 2x and high-quality 4x modes",
        "Before and after comparison",
        "Works offline after first launch",
        "No account, no upload, no cost",
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE}/#faq`,
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
          name: "Do my files get uploaded anywhere?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. All processing happens on your own Mac. Your images and video never leave your machine, and the app works offline after the first launch.",
          },
        },
        {
          "@type": "Question",
          name: "What Macs does it run on?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Upscalify AI runs on macOS with Apple Silicon (M1 and later). The first launch downloads the upscaling model once, then it runs locally.",
          },
        },
        {
          "@type": "Question",
          name: "How is it different from Upscayl?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Upscalify AI uses the same Real-ESRGAN models as Upscayl, so image results are comparable, and it also handles video while keeping the original audio.",
          },
        },
      ],
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Landing />
    </>
  );
}
