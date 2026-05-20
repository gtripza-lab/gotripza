# Rya Global SEO System

This document describes the programmatic SEO system for Rya by GoTripza.

## Scope

The system is designed to generate useful travel pages at global scale without doorway pages or thin duplicate content.

Current generated families:

- Trip cost pages: `/[locale]/trip-cost/[destination-or-country]/from-[origin]`
- Airport guides: `/[locale]/airports/[iata-code]`
- Traveler and prep guides: `/[locale]/[seoFamily]/[destination]`

Supported traveler/prep families:

- `family-travel`
- `honeymoon`
- `solo-travel`
- `luxury-travel`
- `budget-travel`
- `digital-nomad`
- `hidden-destinations`
- `seasonal-travel`
- `travel-safety`
- `transportation`
- `esim`
- `travel-insurance`
- `travel-scams`

## Quality Rules

Every page must include:

- A clear answer block near the top.
- Destination or country-specific budget context.
- Internal links to related planning pages.
- FAQ schema where the page answers traveler questions.
- WebPage, Article, Dataset, or Airport structured data where relevant.
- A Rya planning prompt that turns static content into a conversational travel plan.

Do not publish pages that only swap city names. A valid page must contain at least one of:

- Origin-market context.
- Destination-specific budget, currency, airport, season, or neighborhood data.
- Traveler-type intent, such as family, honeymoon, solo, luxury, budget, nomad, safety, transport, eSIM, insurance, or scams.
- Arrival-specific airport utility.

## Data Sources

Core source files:

- `src/lib/seo-destinations.ts`
- `src/lib/global-seo-system.ts`
- `src/lib/global-travel-guides.ts`
- `src/lib/seo-quality.ts`
- `src/lib/seo-inventory.ts`
- `src/lib/seo-publish-policy.ts`

Generated route files:

- `src/app/[locale]/trip-cost/page.tsx`
- `src/app/[locale]/trip-cost/[destination]/page.tsx`
- `src/app/[locale]/trip-cost/[destination]/[origin]/page.tsx`
- `src/app/[locale]/airports/page.tsx`
- `src/app/[locale]/airports/[code]/page.tsx`
- `src/app/[locale]/[seoFamily]/page.tsx`
- `src/app/[locale]/[seoFamily]/[destination]/page.tsx`

Discovery:

- `src/app/sitemap.ts`
- `public/llms.txt`
- `src/app/api/internal/seo-inventory/route.ts`
- `src/app/api/internal/seo-quality/route.ts`

## AI Search Design

Pages are built for AI retrieval with:

- Short direct answers.
- Consistent entity names.
- Tables or scannable cards.
- FAQ schema.
- Dataset schema for trip cost estimates.
- Airport schema for airport pages.
- Internal links that make related context easy to crawl.

## Current Scale

The production build currently prerenders more than 28,000 pages, exceeding the 20,000-page target while keeping the system data-driven and internally linked.

Future improvements should prioritize:

- More localized copy per non-English language.
- Fresh price data feeds.
- Human review for the highest-traffic destinations.
- Search Console pruning for pages with no impressions after 90 days.
- More airport transfer details and local safety notes.

Operational rollout lives in `docs/SEO_ROLLOUT_PLAYBOOK.md`.

## Publishing Control

Use `src/lib/seo-quality.ts` before expanding crawl exposure further. Pages scoring below the publishable threshold should be improved, noindexed, or held from sitemap expansion until they have enough unique utility.

Sitemap exposure can be staged with:

- `SEO_TRIP_COST_SUBJECT_LIMIT`
- `SEO_GUIDE_DESTINATION_LIMIT`
- `SEO_AIRPORT_LIMIT`

Development defaults expose all pages. Production defaults are intentionally staged unless overridden.
