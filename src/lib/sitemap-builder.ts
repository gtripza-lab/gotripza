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
import { getTripCostStaticParams } from "@/lib/global-seo-system";
import {
  getAirportStaticParams,
  getGuideStaticParams,
} from "@/lib/global-travel-guides";
import { getSeoPublishPolicy } from "@/lib/seo-publish-policy";
import { indexableLocales } from "@/i18n/config";

export const BASE_URL = "https://gotripza.com";

export const SITEMAP_SECTIONS = [
  "static",
  "destinations",
  "compare",
  "budget",
  "trip-cost",
  "guides",
  "airports",
  "seasons",
  "visa",
  "hotels",
  "routes",
  "intent-guides",
  "trip-plans",
  "world-cup-2026",
  "blog",
] as const;

export type SitemapSection = (typeof SITEMAP_SECTIONS)[number];

const staticRoutes = [
  { path: "", priority: 1.0, changeFrequency: "daily" as const },
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
  { path: "/trip-cost", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/airports", priority: 0.84, changeFrequency: "weekly" as const },
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
  localeOverride?: (typeof indexableLocales)[number],
  includeAlternates = true,
): MetadataRoute.Sitemap[number][] {
  const entries: MetadataRoute.Sitemap = [];
  const langs = localeOverride ? [localeOverride] : indexableLocales;
  for (const locale of langs) {
    entries.push({
      url: `${BASE_URL}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
      ...(includeAlternates
        ? {
            alternates: {
              languages: {
                ...Object.fromEntries(indexableLocales.map((lang) => [lang, `${BASE_URL}/${lang}${path}`])),
                "x-default": `${BASE_URL}/en${path}`,
              },
            },
          }
        : {}),
    });
  }
  return entries;
}

function publishPolicy() {
  const rawPolicy = getSeoPublishPolicy();
  return {
    ...rawPolicy,
    tripCostSubjectLimit: Math.min(rawPolicy.tripCostSubjectLimit, 20),
    guideDestinationLimit: Math.min(rawPolicy.guideDestinationLimit, 35),
    airportLimit: Math.min(rawPolicy.airportLimit, 20),
  };
}

export function buildSitemapSection(section: SitemapSection): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  if (section === "static") {
    for (const { path, priority, changeFrequency } of staticRoutes) {
      entries.push(...makeEntry(path, priority, changeFrequency));
    }
  }

  if (section === "destinations") {
    for (const slug of DESTINATION_SLUGS) {
      entries.push(...makeEntry(`/destinations/${slug}`, 0.95, "weekly"));
    }
  }

  if (section === "compare") {
    for (const cp of COMPARISON_PAGES) {
      entries.push(...makeEntry(`/compare/${cp.slug}`, 0.85, "monthly"));
    }
  }

  if (section === "budget") {
    for (const bp of BUDGET_PAGES) {
      entries.push(...makeEntry(`/budget/${bp.slug}`, 0.8, "monthly"));
    }
  }

  if (section === "trip-cost") {
    const policy = publishPolicy();
    const tripCostSubjects = new Set<string>();
    const tripCostParams = getTripCostStaticParams(60).filter((item) =>
      (indexableLocales as readonly string[]).includes(item.locale),
    );
    const allowedTripCostSubjects = new Set(
      [...new Set(tripCostParams.map((entry) => entry.destination))].slice(0, policy.tripCostSubjectLimit),
    );
    for (const page of tripCostParams.filter((item) => allowedTripCostSubjects.has(item.destination))) {
      if (!tripCostSubjects.has(page.destination)) {
        tripCostSubjects.add(page.destination);
        entries.push(
          ...makeEntry(
            `/trip-cost/${page.destination}`,
            0.88,
            "weekly",
            page.locale as (typeof indexableLocales)[number],
            false,
          ),
        );
      }
      entries.push(
        ...makeEntry(
          `/trip-cost/${page.destination}/${page.origin}`,
          0.9,
          "monthly",
          page.locale as (typeof indexableLocales)[number],
          false,
        ),
      );
    }
  }

  if (section === "guides") {
    const policy = publishPolicy();
    const guideFamilyHubs = new Set<string>();
    const guideParams = getGuideStaticParams().filter((item) =>
      (indexableLocales as readonly string[]).includes(item.locale),
    );
    const allowedGuideDestinations = new Set(
      [...new Set(guideParams.map((entry) => entry.destination))].slice(0, policy.guideDestinationLimit),
    );
    for (const page of guideParams.filter((item) => allowedGuideDestinations.has(item.destination))) {
      if (!guideFamilyHubs.has(page.seoFamily)) {
        guideFamilyHubs.add(page.seoFamily);
        entries.push(
          ...makeEntry(
            `/${page.seoFamily}`,
            0.84,
            "weekly",
            page.locale as (typeof indexableLocales)[number],
            false,
          ),
        );
      }
      entries.push(
        ...makeEntry(
          `/${page.seoFamily}/${page.destination}`,
          0.82,
          "monthly",
          page.locale as (typeof indexableLocales)[number],
          false,
        ),
      );
    }
  }

  if (section === "airports") {
    const policy = publishPolicy();
    for (const page of getAirportStaticParams()
      .filter((item): item is { locale: (typeof indexableLocales)[number]; code: string } =>
        (indexableLocales as readonly string[]).includes(item.locale),
      )
      .slice(0, policy.airportLimit * indexableLocales.length)) {
      entries.push(...makeEntry(`/airports/${page.code}`, 0.84, "monthly", page.locale, false));
    }
  }

  if (section === "seasons") {
    for (const slug of DESTINATION_SLUGS) {
      entries.push(...makeEntry(`/seasons/${slug}`, 0.8, "monthly"));
    }
  }

  if (section === "visa") {
    for (const slug of DESTINATION_SLUGS) {
      entries.push(...makeEntry(`/visa/${slug}`, 0.8, "monthly"));
    }
  }

  if (section === "hotels") {
    for (const slug of DESTINATION_SLUGS) {
      entries.push(...makeEntry(`/hotels/${slug}`, 0.85, "weekly"));
    }
  }

  if (section === "routes") {
    for (const slug of ROUTE_SLUGS) {
      entries.push(...makeEntry(`/routes/${slug}`, 0.9, "monthly"));
    }
  }

  if (section === "intent-guides") {
    for (const page of getSeoIntentPages()) {
      entries.push(...makeEntry(`/guides/${page.slug}`, 0.86, "monthly"));
    }
  }

  if (section === "trip-plans") {
    for (const slug of READY_TRIP_PLAN_SLUGS) {
      entries.push(...makeEntry(`/trip-plans/${slug}`, 0.88, "monthly"));
    }
  }

  if (section === "world-cup-2026") {
    for (const page of WORLD_CUP_PAGES) {
      const priority = page.kind === "city" ? 0.9 : page.kind === "stadium" ? 0.87 : 0.84;
      entries.push(...makeEntry(`/world-cup-2026/${page.slug}`, priority, "weekly"));
    }
  }

  if (section === "blog") {
    for (const locale of indexableLocales) {
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
  }

  return entries;
}
