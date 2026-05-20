import type { Destination } from "@/lib/seo-destinations";
import type { OriginMarket, TripCostSubject } from "@/lib/global-seo-system";
import type { SeoGuideFamily } from "@/lib/global-travel-guides";

export type SeoQualityResult = {
  score: number;
  publishable: boolean;
  checks: Array<{ name: string; passed: boolean; weight: number }>;
};

function total(checks: SeoQualityResult["checks"]) {
  return checks.reduce((score, check) => score + (check.passed ? check.weight : 0), 0);
}

export function scoreTripCostPage(subject: TripCostSubject, origin: OriginMarket): SeoQualityResult {
  const checks = [
    { name: "has destination budget bands", passed: subject.budgetPerDay.budget > 0 && subject.budgetPerDay.mid > 0, weight: 20 },
    { name: "has origin-market context", passed: origin.travelerContext.length > 40, weight: 20 },
    { name: "has currency context", passed: Boolean(subject.currency && origin.currency), weight: 15 },
    { name: "has seasonal guidance", passed: subject.bestMonths.length >= 3, weight: 15 },
    { name: "has airport/city code", passed: subject.iata.length === 3 && origin.airport.length === 3, weight: 10 },
    { name: "has localized country context", passed: Boolean(subject.country && subject.countryAr), weight: 10 },
    { name: "has strong spread between travel styles", passed: subject.budgetPerDay.luxury > subject.budgetPerDay.mid, weight: 10 },
  ];
  const score = total(checks);
  return { score, publishable: score >= 80, checks };
}

export function scoreGuidePage(destination: Destination, family: SeoGuideFamily): SeoQualityResult {
  const checks = [
    { name: "has destination description", passed: destination.descriptionEn.length > 80, weight: 15 },
    { name: "has budget bands", passed: destination.budgetPerDay.budget > 0 && destination.budgetPerDay.mid > 0, weight: 15 },
    { name: "has best months", passed: destination.bestMonths.length >= 3, weight: 15 },
    { name: "has neighborhoods", passed: destination.neighborhoods.length >= 3, weight: 15 },
    { name: "has activities", passed: destination.activities.length >= 4, weight: 15 },
    { name: "has visa notes", passed: destination.visaNotes.en.length > 40, weight: 10 },
    { name: "has family-specific route family", passed: Boolean(family), weight: 5 },
    { name: "has internal link targets", passed: destination.iata.length === 3, weight: 10 },
  ];
  const score = total(checks);
  return { score, publishable: score >= 75, checks };
}
