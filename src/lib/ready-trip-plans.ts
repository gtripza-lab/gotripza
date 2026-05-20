import { contentLocale, type Locale } from "@/i18n/config";
import type { PlannerTripType, TripPlanInput } from "@/lib/trip-planner";

export type ReadyTripPlanPage = {
  slug: string;
  origin: { ar: string; en: string };
  destination: { ar: string; en: string };
  days: number;
  budget: { ar: number; en: number };
  travelers: number;
  tripType: PlannerTripType;
  interests: NonNullable<TripPlanInput["interests"]>;
  title: { ar: string; en: string };
  description: { ar: string; en: string };
};

export const READY_TRIP_PLANS: ReadyTripPlanPage[] = [
  {
    slug: "dubai-3-days",
    origin: { ar: "الرياض", en: "Riyadh" },
    destination: { ar: "دبي", en: "Dubai" },
    days: 3,
    budget: { ar: 4500, en: 1200 },
    travelers: 2,
    tripType: "balanced",
    interests: ["shopping", "food", "culture"],
    title: { ar: "خطة دبي 3 أيام مع ريا", en: "3 Days in Dubai with Rya" },
    description: {
      ar: "خطة قصيرة وواقعية لدبي تشمل وسط دبي، دبي القديمة، الشاطئ أو تجربة موسمية، مع مناطق السكن والتنقل والميزانية.",
      en: "A realistic short Dubai plan covering Downtown, Old Dubai, beach or seasonal experiences, with stay areas, transport, and budget guidance.",
    },
  },
  {
    slug: "istanbul-7-days",
    origin: { ar: "جدة", en: "Jeddah" },
    destination: { ar: "إسطنبول", en: "Istanbul" },
    days: 7,
    budget: { ar: 9000, en: 2400 },
    travelers: 2,
    tripType: "balanced",
    interests: ["culture", "food", "shopping"],
    title: { ar: "خطة إسطنبول 7 أيام مع ريا", en: "7 Days in Istanbul with Rya" },
    description: {
      ar: "برنامج أسبوع في إسطنبول بوتيرة مريحة: السلطان أحمد، البوسفور، البازار، كاديكوي، ومناطق السكن المناسبة.",
      en: "A comfortable week in Istanbul: Sultanahmet, Bosphorus, bazaars, Kadikoy, and practical stay-area guidance.",
    },
  },
  {
    slug: "abha-4-days",
    origin: { ar: "جدة", en: "Jeddah" },
    destination: { ar: "أبها", en: "Abha" },
    days: 4,
    budget: { ar: 4000, en: 1050 },
    travelers: 2,
    tripType: "balanced",
    interests: ["nature", "relax", "culture"],
    title: { ar: "خطة أبها 4 أيام مع ريا", en: "4 Days in Abha with Rya" },
    description: {
      ar: "خطة أبها العملية: الوصول، السودة، رجال ألمع، ومغادرة هادئة مع نصائح الطرق والطقس ومناطق السكن.",
      en: "A practical Abha itinerary: arrival, Al Soudah, Rijal Almaa, and a calm departure with road, weather, and stay-area guidance.",
    },
  },
];

export const READY_TRIP_PLAN_SLUGS = READY_TRIP_PLANS.map((page) => page.slug);

export function getReadyTripPlan(slug: string): ReadyTripPlanPage | undefined {
  return READY_TRIP_PLANS.find((page) => page.slug === slug);
}

export function readyTripPlanInput(page: ReadyTripPlanPage, locale: Locale): TripPlanInput {
  const copyLocale = contentLocale(locale);
  const isAr = copyLocale === "ar";
  return {
    origin: isAr ? page.origin.ar : page.origin.en,
    destination: isAr ? page.destination.ar : page.destination.en,
    days: page.days,
    budget: isAr ? page.budget.ar : page.budget.en,
    travelers: page.travelers,
    tripType: page.tripType,
    locale: copyLocale,
    currency: isAr ? "SAR" : "USD",
    interests: page.interests,
  };
}
