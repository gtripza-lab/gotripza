import { DESTINATIONS } from "@/lib/destinations";
import { iataToCity, resolveIata } from "@/lib/iata";

export type PlannerTripType =
  | "balanced"
  | "family"
  | "honeymoon"
  | "budget"
  | "adventure"
  | "business";

export type TripPlanInput = {
  origin: string;
  destination: string;
  days: number;
  budget: number;
  travelers: number;
  tripType: PlannerTripType;
  locale: "ar" | "en";
  currency?: string;
};

export type TripPlanDay = {
  day: number;
  title: string;
  morning: string;
  afternoon: string;
  evening: string;
  tip: string;
};

export type TripPlan = {
  originCode: string | null;
  destinationCode: string | null;
  originName: string;
  destinationName: string;
  days: number;
  travelers: number;
  tripType: PlannerTripType;
  budget: number;
  currency: string;
  budgetLevel: "tight" | "balanced" | "comfortable";
  estimatedDailyBudget: number;
  summary: string;
  stayAdvice: string;
  flightAdvice: string;
  visaAdvice: string;
  packingAdvice: string[];
  costBreakdown: Array<{ label: string; amount: number }>;
  daysPlan: TripPlanDay[];
  nextSteps: string[];
};

const TRIP_TYPE_LABELS = {
  ar: {
    balanced: "متوازنة",
    family: "عائلية",
    honeymoon: "شهر عسل",
    budget: "اقتصادية",
    adventure: "مغامرات",
    business: "عمل",
  },
  en: {
    balanced: "balanced",
    family: "family",
    honeymoon: "honeymoon",
    budget: "budget",
    adventure: "adventure",
    business: "business",
  },
} satisfies Record<"ar" | "en", Record<PlannerTripType, string>>;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function formatDestinationName(code: string | null, raw: string, locale: "ar" | "en") {
  if (!code) return raw.trim();
  const profile = DESTINATIONS[code];
  if (profile) return locale === "ar" ? profile.nameAr : profile.nameEn;
  return iataToCity(code);
}

function budgetMultiplier(tripType: PlannerTripType) {
  if (tripType === "budget") return 0.8;
  if (tripType === "honeymoon") return 1.35;
  if (tripType === "business") return 1.25;
  if (tripType === "family") return 1.15;
  return 1;
}

function budgetLevel(input: TripPlanInput, dailyNeed: number) {
  const perTravelerPerDay = input.budget / Math.max(1, input.travelers) / Math.max(1, input.days);
  if (perTravelerPerDay < dailyNeed * 0.85) return "tight";
  if (perTravelerPerDay > dailyNeed * 1.45) return "comfortable";
  return "balanced";
}

function splitCosts(total: number, tripType: PlannerTripType, locale: "ar" | "en") {
  const hotelPct = tripType === "honeymoon" ? 0.45 : tripType === "budget" ? 0.32 : 0.38;
  const activitiesPct = tripType === "adventure" || tripType === "family" ? 0.28 : 0.22;
  const foodPct = tripType === "business" ? 0.22 : 0.24;
  const transportPct = Math.max(0.08, 1 - hotelPct - activitiesPct - foodPct);
  const labels =
    locale === "ar"
      ? ["الإقامة", "الأنشطة", "الأكل", "المواصلات"]
      : ["Stay", "Activities", "Food", "Transport"];
  return [
    { label: labels[0], amount: Math.round(total * hotelPct) },
    { label: labels[1], amount: Math.round(total * activitiesPct) },
    { label: labels[2], amount: Math.round(total * foodPct) },
    { label: labels[3], amount: Math.round(total * transportPct) },
  ];
}

function pickActivities(code: string | null, locale: "ar" | "en") {
  const profile = code ? DESTINATIONS[code] : null;
  const activities =
    locale === "ar"
      ? profile?.top_activities_ar
      : profile?.top_activities_en;
  return activities?.length
    ? activities
    : locale === "ar"
      ? ["جولة تعريفية في وسط المدينة", "تجربة طعام محلية", "زيارة أهم معلم سياحي", "وقت حر للتسوق"]
      : ["City orientation walk", "Local food experience", "Main landmark visit", "Free time for shopping"];
}

function buildDays(input: TripPlanInput, destinationCode: string | null, destinationName: string): TripPlanDay[] {
  const isAr = input.locale === "ar";
  const activities = pickActivities(destinationCode, input.locale);
  const profile = destinationCode ? DESTINATIONS[destinationCode] : null;
  const localTips = isAr ? profile?.local_tips_ar ?? [] : profile?.local_tips_en ?? [];
  const days = clamp(input.days, 1, 21);

  return Array.from({ length: days }, (_, index) => {
    const day = index + 1;
    const a = activities[index % activities.length];
    const b = activities[(index + 1) % activities.length];
    const c = activities[(index + 2) % activities.length];
    const tip = localTips[index % Math.max(1, localTips.length)] ?? (
      isAr
        ? "اترك هامش وقت بين الأنشطة حتى لا تتحول الرحلة إلى جدول مرهق."
        : "Leave breathing room between activities so the trip does not become exhausting."
    );

    if (day === 1) {
      return {
        day,
        title: isAr ? `الوصول إلى ${destinationName}` : `Arrival in ${destinationName}`,
        morning: isAr ? "الوصول، إنهاء إجراءات الدخول، والانتقال لمنطقة السكن." : "Arrive, clear entry formalities, and transfer to your stay area.",
        afternoon: isAr ? "تمشية خفيفة حول الفندق للتعرف على المنطقة والمطاعم القريبة." : "Take a light walk around the hotel area and nearby restaurants.",
        evening: isAr ? "عشاء بسيط ونوم مبكر لتبدأ الرحلة بنشاط." : "Easy dinner and early rest so the trip starts well.",
        tip,
      };
    }

    if (day === days) {
      return {
        day,
        title: isAr ? "المغادرة واللمسات الأخيرة" : "Departure and final touches",
        morning: isAr ? "إفطار هادئ وتجهيز الحقائب." : "Slow breakfast and packing.",
        afternoon: isAr ? "وقت قصير للتسوق أو زيارة قريبة حسب موعد الرحلة." : "Short shopping stop or nearby visit depending on flight time.",
        evening: isAr ? "التوجه للمطار قبل الرحلة بوقت كاف." : "Head to the airport with enough buffer time.",
        tip,
      };
    }

    return {
      day,
      title: isAr ? `يوم ${day}: ${a}` : `Day ${day}: ${a}`,
      morning: isAr ? `ابدأ اليوم بـ ${a}.` : `Start the day with ${a}.`,
      afternoon: isAr ? `بعد الغداء، اجعل النشاط الرئيسي ${b}.` : `After lunch, make ${b} the main activity.`,
      evening: isAr ? `اختم اليوم بـ ${c} أو عشاء في منطقة حيوية.` : `End with ${c} or dinner in a lively area.`,
      tip,
    };
  });
}

export function buildTripPlan(input: TripPlanInput): TripPlan {
  const locale = input.locale;
  const isAr = locale === "ar";
  const originCode = resolveIata(input.origin);
  const destinationCode = resolveIata(input.destination);
  const profile = destinationCode ? DESTINATIONS[destinationCode] : null;
  const days = clamp(Number(input.days) || 5, 1, 21);
  const travelers = clamp(Number(input.travelers) || 2, 1, 12);
  const budget = Math.max(0, Math.round(Number(input.budget) || 0));
  const currency = input.currency || (isAr ? "SAR" : "USD");
  const dailyBase =
    (profile?.budget_per_day_usd.moderate ?? 120) * budgetMultiplier(input.tripType);
  const level = budgetLevel({ ...input, days, travelers, budget }, dailyBase);
  const destinationName = formatDestinationName(destinationCode, input.destination, locale);
  const originName = formatDestinationName(originCode, input.origin, locale);
  const daily = Math.round(budget / Math.max(1, travelers) / Math.max(1, days));

  const stayArea =
    profile && (isAr ? profile.local_tips_ar[0] : profile.local_tips_en[0])
      ? (isAr ? profile.local_tips_ar[0] : profile.local_tips_en[0])
      : isAr
        ? "اختر منطقة قريبة من نشاطك الأساسي، خصوصا إذا كانت الرحلة قصيرة."
        : "Choose a stay area close to your main activities, especially for short trips.";

  return {
    originCode,
    destinationCode,
    originName,
    destinationName,
    days,
    travelers,
    tripType: input.tripType,
    budget,
    currency,
    budgetLevel: level,
    estimatedDailyBudget: daily,
    summary: isAr
      ? `خطة ${TRIP_TYPE_LABELS.ar[input.tripType]} من ${originName} إلى ${destinationName} لمدة ${days} أيام، بميزانية ${budget.toLocaleString("ar-SA")} ${currency} لعدد ${travelers} مسافرين.`
      : `A ${TRIP_TYPE_LABELS.en[input.tripType]} plan from ${originName} to ${destinationName} for ${days} days, with a ${budget.toLocaleString("en-US")} ${currency} budget for ${travelers} travelers.`,
    stayAdvice: stayArea,
    flightAdvice: isAr
      ? `راقب رحلات ${originCode ?? originName} إلى ${destinationCode ?? destinationName} مبكرا، وخل عندك مرونة يوم أو يومين إذا الميزانية ${level === "tight" ? "مشدودة" : "مناسبة"}.`
      : `Track ${originCode ?? originName} to ${destinationCode ?? destinationName} early, and keep 1-2 days of flexibility if the budget is ${level === "tight" ? "tight" : "reasonable"}.`,
    visaAdvice: isAr
      ? profile?.visa_note_ar ?? "تحقق من متطلبات التأشيرة حسب جنسيتك قبل الحجز النهائي."
      : profile?.visa_note_en ?? "Check visa requirements for your nationality before final booking.",
    packingAdvice:
      (isAr ? profile?.packing_tips_ar : profile?.packing_tips_en)?.slice(0, 4) ??
      (isAr
        ? ["جواز سفر ساري", "تأمين سفر", "شاحن متنقل", "ملابس مناسبة للموسم"]
        : ["Valid passport", "Travel insurance", "Power bank", "Season-appropriate clothes"]),
    costBreakdown: splitCosts(budget, input.tripType, locale),
    daysPlan: buildDays({ ...input, days, travelers, budget }, destinationCode, destinationName),
    nextSteps: isAr
      ? [
          "اسأل ريا عن أفضل منطقة سكن حسب جدولك.",
          "افتح صفحة الطيران للمقارنة قبل الحجز.",
          "احفظ الخطة أو اطبعها PDF من المتصفح.",
        ]
      : [
          "Ask Raya for the best stay area based on your itinerary.",
          "Open flight search before booking.",
          "Save the plan or print it as a PDF from your browser.",
        ],
  };
}
