import { locales } from "@/i18n/config";
import { DESTINATIONS } from "@/lib/seo-destinations";
import { AIRPORT_GUIDES, SEO_GUIDE_FAMILIES } from "@/lib/global-travel-guides";
import { getCountryCostSubjects, ORIGIN_MARKETS } from "@/lib/global-seo-system";

export type SeoInventory = {
  locales: number;
  destinations: number;
  countries: number;
  originMarkets: number;
  airports: number;
  guideFamilies: number;
  tripCostPages: number;
  guidePages: number;
  airportPages: number;
  hubPages: number;
  tripCostSubjectHubs: number;
  totalProgrammaticPages: number;
};

export function getSeoInventory(): SeoInventory {
  const languageCount = locales.length;
  const destinations = DESTINATIONS.length;
  const countries = getCountryCostSubjects().length;
  const originMarkets = ORIGIN_MARKETS.length;
  const airports = AIRPORT_GUIDES.length;
  const guideFamilies = SEO_GUIDE_FAMILIES.length;
  const tripCostPages = (destinations + countries) * originMarkets * (languageCount - 1);
  const guidePages = destinations * guideFamilies * languageCount;
  const airportPages = airports * languageCount;
  const tripCostSubjectHubs = (destinations + countries) * languageCount;
  const hubPages = (2 + guideFamilies) * languageCount;

  return {
    locales: languageCount,
    destinations,
    countries,
    originMarkets,
    airports,
    guideFamilies,
    tripCostPages,
    guidePages,
    airportPages,
    hubPages,
    tripCostSubjectHubs,
    totalProgrammaticPages: tripCostPages + guidePages + airportPages + hubPages + tripCostSubjectHubs,
  };
}
