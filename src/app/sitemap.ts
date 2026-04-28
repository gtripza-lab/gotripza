import type { MetadataRoute } from "next";

const BASE_URL = "https://gotripza.com";
const locales = ["en", "ar"] as const;

const staticRoutes = [
  { path: "", priority: 1.0, changeFrequency: "daily" as const },
  { path: "/search", priority: 0.9, changeFrequency: "daily" as const },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/contact", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/disclosure", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/privacy", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/terms", priority: 0.5, changeFrequency: "monthly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const { path, priority, changeFrequency } of staticRoutes) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency,
        priority,
        alternates: {
          languages: {
            en: `${BASE_URL}/en${path}`,
            ar: `${BASE_URL}/ar${path}`,
            "x-default": `${BASE_URL}/en${path}`,
          },
        },
      });
    }
  }

  return entries;
}
