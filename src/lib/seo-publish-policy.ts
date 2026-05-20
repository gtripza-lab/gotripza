export type SeoPublishPolicy = {
  tripCostSubjectLimit: number;
  guideDestinationLimit: number;
  airportLimit: number;
  includeAllWhenUnset: boolean;
};

function intEnv(name: string, fallback: number) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getSeoPublishPolicy(): SeoPublishPolicy {
  const includeAllWhenUnset = process.env.NODE_ENV !== "production";
  const unlimited = 100_000;
  return {
    includeAllWhenUnset,
    tripCostSubjectLimit: intEnv("SEO_TRIP_COST_SUBJECT_LIMIT", includeAllWhenUnset ? unlimited : 120),
    guideDestinationLimit: intEnv("SEO_GUIDE_DESTINATION_LIMIT", includeAllWhenUnset ? unlimited : 80),
    airportLimit: intEnv("SEO_AIRPORT_LIMIT", includeAllWhenUnset ? unlimited : 40),
  };
}
