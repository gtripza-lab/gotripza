# SEO Rollout Playbook

Use this after deploying the global SEO system.

## Phase 1: Controlled Launch

Recommended production env values:

```env
SEO_TRIP_COST_SUBJECT_LIMIT=50
SEO_GUIDE_DESTINATION_LIMIT=35
SEO_AIRPORT_LIMIT=20
```

This keeps sitemap exposure controlled while all pages remain available by direct URL.

## Phase 2: Search Console Review

After 14-21 days, review:

- Indexed pages by path family.
- Pages discovered but not indexed.
- Duplicate without user-selected canonical.
- Crawled but currently not indexed.
- Query impressions by family.
- Countries/languages gaining impressions.

Recommended groupings:

- `/trip-cost/`
- `/airports/`
- `/family-travel/`
- `/travel-safety/`
- `/travel-scams/`
- `/esim/`
- `/travel-insurance/`

## Phase 3: Expand

If impressions and indexation are healthy:

```env
SEO_TRIP_COST_SUBJECT_LIMIT=100
SEO_GUIDE_DESTINATION_LIMIT=60
SEO_AIRPORT_LIMIT=40
```

If many pages are crawled but not indexed, do not expand. Improve destination data and internal links first.

## Phase 4: Prune or Improve

After 60-90 days:

- Improve pages with impressions but weak CTR.
- Strengthen pages with rankings around positions 8-20.
- Remove low-utility pages from sitemap by lowering rollout limits or adding a future noindex rule.
- Keep pages that support user navigation even if they are not direct SEO winners.

## Safety Pages

For `travel-safety`, `travel-scams`, `travel-insurance`, `transportation`, and `esim`, avoid absolute promises. Keep editorial notes visible and confirm critical details with official providers.
