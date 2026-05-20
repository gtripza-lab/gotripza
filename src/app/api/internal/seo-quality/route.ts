import { NextResponse } from "next/server";
import { DESTINATIONS } from "@/lib/seo-destinations";
import {
  getCountryCostSubjects,
  ORIGIN_MARKETS,
} from "@/lib/global-seo-system";
import { SEO_GUIDE_FAMILIES } from "@/lib/global-travel-guides";
import { scoreGuidePage, scoreTripCostPage } from "@/lib/seo-quality";

export function GET() {
  const subjects = [...DESTINATIONS, ...getCountryCostSubjects()];
  const tripCostScores = subjects.flatMap((subject) =>
    ORIGIN_MARKETS.slice(0, 6).map((origin) => ({
      slug: `${subject.slug}/from-${origin.slug}`,
      score: scoreTripCostPage(subject, origin).score,
    })),
  );
  const guideScores = DESTINATIONS.flatMap((destination) =>
    SEO_GUIDE_FAMILIES.map((family) => ({
      slug: `${family}/${destination.slug}`,
      score: scoreGuidePage(destination, family).score,
    })),
  );
  const lowTripCost = tripCostScores.filter((item) => item.score < 80);
  const lowGuides = guideScores.filter((item) => item.score < 75);

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    thresholds: {
      tripCost: 80,
      guide: 75,
    },
    sampled: {
      tripCost: tripCostScores.length,
      guides: guideScores.length,
    },
    lowScoreCounts: {
      tripCost: lowTripCost.length,
      guides: lowGuides.length,
    },
    examplesToImprove: {
      tripCost: lowTripCost.slice(0, 20),
      guides: lowGuides.slice(0, 20),
    },
  });
}
