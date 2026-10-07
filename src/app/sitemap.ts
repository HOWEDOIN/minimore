import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/products/", "/about/", "/faq/", "/contact/"].map((path, index) => ({
    url: `https://minimore.my${path}`,
    changeFrequency: index < 2 ? "daily" as const : "monthly" as const,
    priority: index === 0 ? 1 : index === 1 ? 0.9 : 0.6,
  }));
}
