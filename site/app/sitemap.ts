import type { MetadataRoute } from "next";

const SITE = "https://upscalify.theatom.lk";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${SITE}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 }];
}
