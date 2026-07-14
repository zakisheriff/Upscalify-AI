const SITE = "https://upscalify.theatom.lk";

// JSON-LD for traditional search and AI answer engines. Kept in one place so
// the product's machine-readable description stays consistent with the copy.
const graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://theatom.lk/#organization",
      name: "The Atom",
      url: "https://theatom.lk",
      description:
        "The Atom builds focused software products. Upscalify AI is part of its product family.",
    },
    {
      "@type": "WebApplication",
      "@id": `${SITE}/#app`,
      name: "Upscalify AI",
      url: SITE,
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Web",
      browserRequirements: "Requires a modern browser.",
      description:
        "Upscalify AI upscales low-resolution images and video by reconstructing real detail. Images are upscaled in a single pass; video is processed frame by frame with temporal-consistency handling and the original audio preserved.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "Image upscaling",
        "Video upscaling with preserved audio",
        "Before and after comparison",
        "Fast and high-quality reconstruction paths",
      ],
      publisher: { "@id": "https://theatom.lk/#organization" },
      creator: { "@type": "Person", name: "Zaki" },
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "What does Upscalify do?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "It takes a low-resolution or low-quality image or video and reconstructs a sharper, higher-resolution version, adding plausible detail rather than only smoothing edges.",
          },
        },
        {
          "@type": "Question",
          name: "Does it keep the audio in a video?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Video is reconstructed frame by frame and reassembled with the original audio track intact.",
          },
        },
        {
          "@type": "Question",
          name: "What is the difference between the fast and high-quality options?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The fast option roughly doubles resolution and returns quickly. The high-quality option reconstructs more aggressively at a higher scale and takes longer.",
          },
        },
        {
          "@type": "Question",
          name: "Where does processing happen?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "In v1 everything runs locally on your own machine. Files are not uploaded to a third-party service.",
          },
        },
      ],
    },
  ],
};

export function StructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
