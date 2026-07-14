import type { MetadataRoute } from "next";

const SITE = "https://upscalify.theatom.lk";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
