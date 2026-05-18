import type { MetadataRoute } from "next";
import { getPostSlugs } from "@/lib/blog";
import {
  DESTINATION_SLUGS,
  COMPARISON_PAGES,
  BUDGET_PAGES,
} from "@/lib/seo-destinations";
import { ROUTE_SLUGS } from "@/lib/route-pairs";
import { getSeoIntentPages } from "@/lib/seo-intent-pages";
import { READY_TRIP_PLAN_SLUGS } from "@/lib/ready-trip-plans";
import { WORLD_CUP_PAGES } from "@/lib/world-cup-2026";

const BASE_URL = "https://gotripza.com";
const locales = ["en", "ar"] as const;

const staticRoutes = [
  { path: "", priority: 1.0, changeFrequency: "daily" as const },
  { path: "/search", priority: 1.0, changeFrequency: "daily" as const },
  { path: "/plan", priority: 0.95, changeFrequency: "weekly" as const },
  { path: "/plus", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/ai-travel-assistant", priority: 0.95, changeFrequency: "monthly" as const },
  { path: "/travel-companion", priority: 0.95, changeFrequency: "monthly" as const },
  { path: "/world-cup-2026", priority: 0.98, changeFrequency: "weekly" as const },
  { path: "/travel-translation", priority: 0.88, changeFrequency: "monthly" as const },
  { path: "/travel-safety", priority: 0.88, changeFrequency: "monthly" as const },
  { path: "/travel-insurance", priority: 0.86, changeFrequency: "monthly" as const },
  { path: "/travel-esim", priority: 0.86, changeFrequency: "monthly" as const },
  { path: "/travel-activities", priority: 0.86, changeFrequency: "monthly" as const },
  { path: "/smart-travel-planning", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/destinations", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/routes", priority: 0.88, changeFrequency: "weekly" as const },
  { path: "/hotels", priority: 0.86, changeFrequency: "weekly" as const },
  { path: "/visa", priority: 0.86, changeFrequency: "weekly" as const },
  { path: "/services", priority: 0.85, changeFrequency: "monthly" as const },
  { path: "/blog", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/contact", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/disclosure", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/privacy", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/terms", priority: 0.5, changeFrequency: "monthly" as const },
];

function makeEntry(
  path: string,
  priority: number,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  localeOverride?: (typeof locales)[number],
): MetadataRoute.Sitemap[number][] {
  const entries: MetadataRoute.Sitemap = [];
  const langs = localeOverride ? [localeOverride] : locales;
  for (const locale of langs) {
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
  return entries;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Static routes
  for (const { path, priority, changeFrequency } of staticRoutes) {
    entries.push(...makeEntry(path, priority, changeFrequency));
  }

  // Destination hubs (highest priority SEO pages)
  for (const slug of DESTINATION_SLUGS) {
    entries.push(...makeEntry(`/destinations/${slug}`, 0.95, "weekly"));
  }

  // Comparison pages
  for (const cp of COMPARISON_PAGES) {
    entries.push(...makeEntry(`/compare/${cp.slug}`, 0.85, "monthly"));
  }

  // Budget pages
  for (const bp of BUDGET_PAGES) {
    entries.push(...makeEntry(`/budget/${bp.slug}`, 0.8, "monthly"));
  }

  // Seasonal pages (one per destination)
  for (const slug of DESTINATION_SLUGS) {
    entries.push(...makeEntry(`/seasons/${slug}`, 0.8, "monthly"));
  }

  // Visa pages (one per destination)
  for (const slug of DESTINATION_SLUGS) {
    entries.push(...makeEntry(`/visa/${slug}`, 0.8, "monthly"));
  }

  // Hotel intent pages (one per destination)
  for (const slug of DESTINATION_SLUGS) {
    entries.push(...makeEntry(`/hotels/${slug}`, 0.85, "weekly"));
  }

  // Flight route pages (highest-volume search intent in travel)
  for (const slug of ROUTE_SLUGS) {
    entries.push(...makeEntry(`/routes/${slug}`, 0.9, "monthly"));
  }

  // AI-search/GEO intent guides: companion-first planning pages.
  for (const page of getSeoIntentPages()) {
    entries.push(...makeEntry(`/guides/${page.slug}`, 0.86, "monthly"));
  }

  // Ready itinerary pages for high-intent trip planning searches.
  for (const slug of READY_TRIP_PLAN_SLUGS) {
    entries.push(...makeEntry(`/trip-plans/${slug}`, 0.88, "monthly"));
  }

  // FIFA World Cup 2026 travel companion cluster.
  for (const page of WORLD_CUP_PAGES) {
    const priority = page.kind === "city" ? 0.9 : page.kind === "stadium" ? 0.87 : 0.84;
    entries.push(...makeEntry(`/world-cup-2026/${page.slug}`, priority, "weekly"));
  }

  // Blog posts
  for (const locale of locales) {
    const slugs = getPostSlugs(locale);
    for (const slug of slugs) {
      entries.push({
        url: `${BASE_URL}/${locale}/blog/${slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.75,
        alternates: {
          languages: {
            [locale]: `${BASE_URL}/${locale}/blog/${slug}`,
          },
        },
      });
    }
  }

  return entries;
}
