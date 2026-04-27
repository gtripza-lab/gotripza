import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";

const TOP_DESTINATIONS = [
  "dubai", "istanbul", "cairo", "london", "paris",
  "new-york", "bangkok", "singapore", "kuala-lumpur", "amsterdam",
  "riyadh-to-dubai", "jeddah-to-istanbul", "riyadh-to-london",
  "dubai-hotels", "istanbul-hotels", "cairo-hotels",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const statics: MetadataRoute.Sitemap = [
    { url: `${BASE}/ar`,       lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE}/en`,       lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE}/ar/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/en/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/ar/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/en/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  const trips: MetadataRoute.Sitemap = TOP_DESTINATIONS.flatMap((slug) => [
    { url: `${BASE}/ar/trip/${slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${BASE}/en/trip/${slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 },
  ]);

  return [...statics, ...trips];
}
