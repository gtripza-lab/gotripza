import { locales, type Locale } from "@/i18n/config";
import {
  DESTINATIONS,
  formatBestMonths,
  type Destination,
} from "@/lib/seo-destinations";

export type GlobalSeoLocale = Exclude<Locale, "ar">;

export type OriginMarket = {
  slug: string;
  city: string;
  country: string;
  countryCode: string;
  airport: string;
  currency: string;
  language: GlobalSeoLocale;
  travelerContext: string;
};

export type PageFamily =
  | "trip-cost"
  | "destination-guide"
  | "airport-guide"
  | "family-travel"
  | "honeymoon"
  | "solo-travel"
  | "luxury-travel"
  | "budget-backpacking"
  | "digital-nomad"
  | "hidden-destinations"
  | "seasonal-travel"
  | "travel-safety"
  | "transportation"
  | "esim"
  | "travel-insurance"
  | "travel-scams";

export type CountryCostSubject = {
  slug: string;
  nameEn: string;
  nameAr: string;
  country: string;
  countryAr: string;
  iata: string;
  flag: string;
  currency: string;
  bestMonths: number[];
  budgetPerDay: { budget: number; mid: number; luxury: number };
  destinationSlugs: string[];
  isCountry: boolean;
};

export type TripCostSubject = Destination | CountryCostSubject;

export const GLOBAL_SEO_LOCALES = locales.filter((locale) => locale !== "ar") as GlobalSeoLocale[];

export const ORIGIN_MARKETS: OriginMarket[] = [
  {
    slug: "new-york",
    city: "New York",
    country: "United States",
    countryCode: "US",
    airport: "JFK",
    currency: "USD",
    language: "en",
    travelerContext: "long-haul travelers comparing flight value, jet lag, and total trip cost",
  },
  {
    slug: "los-angeles",
    city: "Los Angeles",
    country: "United States",
    countryCode: "US",
    airport: "LAX",
    currency: "USD",
    language: "en",
    travelerContext: "West Coast travelers who often compare Asia-Pacific destinations and nonstop routes",
  },
  {
    slug: "toronto",
    city: "Toronto",
    country: "Canada",
    countryCode: "CA",
    airport: "YYZ",
    currency: "CAD",
    language: "en",
    travelerContext: "Canadian travelers watching exchange rates, insurance, and winter escape timing",
  },
  {
    slug: "vancouver",
    city: "Vancouver",
    country: "Canada",
    countryCode: "CA",
    airport: "YVR",
    currency: "CAD",
    language: "en",
    travelerContext: "Pacific Canada travelers comparing Asia, Australia, and winter sun trips",
  },
  {
    slug: "sydney",
    city: "Sydney",
    country: "Australia",
    countryCode: "AU",
    airport: "SYD",
    currency: "AUD",
    language: "en",
    travelerContext: "Australian travelers balancing school holidays, long flights, and stopover options",
  },
  {
    slug: "london",
    city: "London",
    country: "United Kingdom",
    countryCode: "GB",
    airport: "LHR",
    currency: "GBP",
    language: "en",
    travelerContext: "UK travelers comparing direct flights, shoulder seasons, and family holiday dates",
  },
  {
    slug: "berlin",
    city: "Berlin",
    country: "Germany",
    countryCode: "DE",
    airport: "BER",
    currency: "EUR",
    language: "de",
    travelerContext: "German travelers who value transport clarity, realistic budgets, and insurance detail",
  },
  {
    slug: "paris",
    city: "Paris",
    country: "France",
    countryCode: "FR",
    airport: "CDG",
    currency: "EUR",
    language: "fr",
    travelerContext: "French travelers comparing flight timing, holiday seasons, and value by neighborhood",
  },
  {
    slug: "zurich",
    city: "Zurich",
    country: "Switzerland",
    countryCode: "CH",
    airport: "ZRH",
    currency: "CHF",
    language: "de",
    travelerContext: "Swiss travelers sensitive to premium comfort, strong currencies, and efficient routing",
  },
  {
    slug: "amsterdam",
    city: "Amsterdam",
    country: "Netherlands",
    countryCode: "NL",
    airport: "AMS",
    currency: "EUR",
    language: "nl",
    travelerContext: "Dutch travelers comparing bike-friendly cities, direct routes, and practical daily costs",
  },
  {
    slug: "singapore",
    city: "Singapore",
    country: "Singapore",
    countryCode: "SG",
    airport: "SIN",
    currency: "SGD",
    language: "en",
    travelerContext: "Singapore-based travelers planning short breaks, premium escapes, and regional flights",
  },
  {
    slug: "seoul",
    city: "Seoul",
    country: "South Korea",
    countryCode: "KR",
    airport: "ICN",
    currency: "KRW",
    language: "ko",
    travelerContext: "Korean travelers comparing safety, shopping, family travel, and short international trips",
  },
  {
    slug: "tokyo",
    city: "Tokyo",
    country: "Japan",
    countryCode: "JP",
    airport: "HND",
    currency: "JPY",
    language: "ja",
    travelerContext: "Japanese travelers who need precise logistics, etiquette, payment, and seasonal planning",
  },
  {
    slug: "dubai",
    city: "Dubai",
    country: "United Arab Emirates",
    countryCode: "AE",
    airport: "DXB",
    currency: "AED",
    language: "en",
    travelerContext: "UAE international travelers comparing visas, premium stays, family comfort, and long weekends",
  },
  {
    slug: "madrid",
    city: "Madrid",
    country: "Spain",
    countryCode: "ES",
    airport: "MAD",
    currency: "EUR",
    language: "es",
    travelerContext: "Spanish travelers comparing European breaks, Latin America routes, and seasonal prices",
  },
  {
    slug: "rome",
    city: "Rome",
    country: "Italy",
    countryCode: "IT",
    airport: "FCO",
    currency: "EUR",
    language: "it",
    travelerContext: "Italian travelers comparing cultural trips, beach escapes, and family-friendly itineraries",
  },
  {
    slug: "lisbon",
    city: "Lisbon",
    country: "Portugal",
    countryCode: "PT",
    airport: "LIS",
    currency: "EUR",
    language: "pt",
    travelerContext: "Portuguese travelers comparing European value, islands, and long-haul trip timing",
  },
  {
    slug: "shanghai",
    city: "Shanghai",
    country: "China",
    countryCode: "CN",
    airport: "PVG",
    currency: "CNY",
    language: "zh",
    travelerContext: "Chinese travelers comparing visas, payments, shopping, family groups, and flight convenience",
  },
  {
    slug: "istanbul",
    city: "Istanbul",
    country: "Turkey",
    countryCode: "TR",
    airport: "IST",
    currency: "TRY",
    language: "tr",
    travelerContext: "Turkish travelers comparing Europe, Gulf, visa rules, family value, and direct flight convenience",
  },
  {
    slug: "delhi",
    city: "Delhi",
    country: "India",
    countryCode: "IN",
    airport: "DEL",
    currency: "INR",
    language: "hi",
    travelerContext: "Indian travelers balancing visas, family groups, long-haul value, and school-holiday timing",
  },
  {
    slug: "jakarta",
    city: "Jakarta",
    country: "Indonesia",
    countryCode: "ID",
    airport: "CGK",
    currency: "IDR",
    language: "id",
    travelerContext: "Indonesian travelers comparing halal comfort, regional flights, family pacing, and payment practicalities",
  },
  {
    slug: "moscow",
    city: "Moscow",
    country: "Russia",
    countryCode: "RU",
    airport: "SVO",
    currency: "RUB",
    language: "ru",
    travelerContext: "Russian-speaking travelers comparing seasonal weather, visa friction, payment access, and long-haul routes",
  },
  {
    slug: "warsaw",
    city: "Warsaw",
    country: "Poland",
    countryCode: "PL",
    airport: "WAW",
    currency: "PLN",
    language: "pl",
    travelerContext: "Polish travelers comparing European city breaks, family costs, airport access, and shoulder-season value",
  },
  {
    slug: "bangkok",
    city: "Bangkok",
    country: "Thailand",
    countryCode: "TH",
    airport: "BKK",
    currency: "THB",
    language: "th",
    travelerContext: "Thai travelers comparing regional escapes, family trips, visa simplicity, and short-haul value",
  },
  {
    slug: "ho-chi-minh-city",
    city: "Ho Chi Minh City",
    country: "Vietnam",
    countryCode: "VN",
    airport: "SGN",
    currency: "VND",
    language: "vi",
    travelerContext: "Vietnamese travelers comparing regional flights, visas, shopping routes, and practical daily budgets",
  },
  {
    slug: "kuala-lumpur",
    city: "Kuala Lumpur",
    country: "Malaysia",
    countryCode: "MY",
    airport: "KUL",
    currency: "MYR",
    language: "ms",
    travelerContext: "Malaysian travelers comparing halal-friendly escapes, family comfort, direct flights, and value hotels",
  },
  {
    slug: "stockholm",
    city: "Stockholm",
    country: "Sweden",
    countryCode: "SE",
    airport: "ARN",
    currency: "SEK",
    language: "sv",
    travelerContext: "Swedish travelers comparing winter sun, long weekends, sustainability, and clear transport planning",
  },
  {
    slug: "oslo",
    city: "Oslo",
    country: "Norway",
    countryCode: "NO",
    airport: "OSL",
    currency: "NOK",
    language: "no",
    travelerContext: "Norwegian travelers comparing winter sun, premium comfort, insurance, and weather-smart routing",
  },
  {
    slug: "copenhagen",
    city: "Copenhagen",
    country: "Denmark",
    countryCode: "DK",
    airport: "CPH",
    currency: "DKK",
    language: "da",
    travelerContext: "Danish travelers comparing city breaks, family value, bike-friendly destinations, and efficient routes",
  },
];

export const PAGE_FAMILIES: Array<{
  family: PageFamily;
  priority: number;
  minimumUtility: string[];
}> = [
  {
    family: "trip-cost",
    priority: 1,
    minimumUtility: ["origin-specific flight context", "daily budget bands", "seasonal price advice", "traveler-style budget table"],
  },
  {
    family: "destination-guide",
    priority: 2,
    minimumUtility: ["best areas", "first-time itinerary", "budget context", "safety notes"],
  },
  {
    family: "airport-guide",
    priority: 3,
    minimumUtility: ["transfer options", "late arrival advice", "SIM/eSIM guidance", "family arrival notes"],
  },
  {
    family: "travel-safety",
    priority: 4,
    minimumUtility: ["area guidance", "scam prevention", "solo/family notes", "emergency planning"],
  },
  {
    family: "esim",
    priority: 5,
    minimumUtility: ["data sizing", "activation timing", "coverage caution", "arrival use cases"],
  },
  {
    family: "travel-insurance",
    priority: 6,
    minimumUtility: ["risk scenarios", "coverage checklist", "family notes", "exclusion warnings"],
  },
  {
    family: "transportation",
    priority: 7,
    minimumUtility: ["airport transfer", "public transport", "taxi apps", "cost bands"],
  },
  {
    family: "family-travel",
    priority: 8,
    minimumUtility: ["area fit", "pace", "hotel needs", "kid-friendly planning"],
  },
  {
    family: "honeymoon",
    priority: 9,
    minimumUtility: ["romantic areas", "privacy", "season", "splurge/save choices"],
  },
  {
    family: "solo-travel",
    priority: 10,
    minimumUtility: ["safety", "social areas", "transport", "night movement"],
  },
  {
    family: "luxury-travel",
    priority: 11,
    minimumUtility: ["premium areas", "private transfers", "fine dining", "best season"],
  },
  {
    family: "budget-backpacking",
    priority: 12,
    minimumUtility: ["hostels", "cheap meals", "transport passes", "free attractions"],
  },
  {
    family: "digital-nomad",
    priority: 13,
    minimumUtility: ["internet", "monthly cost", "work areas", "visa caution"],
  },
  {
    family: "seasonal-travel",
    priority: 14,
    minimumUtility: ["weather", "crowds", "prices", "events"],
  },
  {
    family: "travel-scams",
    priority: 15,
    minimumUtility: ["common scams", "safe payment", "transport caution", "what to do"],
  },
  {
    family: "hidden-destinations",
    priority: 16,
    minimumUtility: ["why it is underrated", "who it suits", "access", "cost"],
  },
];

const LOCALE_LABELS: Record<GlobalSeoLocale, { tripCost: string; from: string; titleSuffix: string }> = {
  en: { tripCost: "Trip Cost", from: "from", titleSuffix: "Budget Guide" },
  fr: { tripCost: "Budget voyage", from: "depuis", titleSuffix: "guide budget" },
  de: { tripCost: "Reisekosten", from: "ab", titleSuffix: "Budgetguide" },
  es: { tripCost: "Costo del viaje", from: "desde", titleSuffix: "guía de presupuesto" },
  it: { tripCost: "Costo del viaggio", from: "da", titleSuffix: "guida budget" },
  pt: { tripCost: "Custo da viagem", from: "de", titleSuffix: "guia de orçamento" },
  ko: { tripCost: "여행 비용", from: "출발", titleSuffix: "예산 가이드" },
  ja: { tripCost: "旅行費用", from: "発", titleSuffix: "予算ガイド" },
  zh: { tripCost: "旅行费用", from: "从", titleSuffix: "预算指南" },
  nl: { tripCost: "Reiskosten", from: "vanaf", titleSuffix: "budgetgids" },
  tr: { tripCost: "Seyahat maliyeti", from: "çıkışlı", titleSuffix: "bütçe rehberi" },
  hi: { tripCost: "यात्रा लागत", from: "से", titleSuffix: "बजट गाइड" },
  id: { tripCost: "Biaya perjalanan", from: "dari", titleSuffix: "panduan anggaran" },
  ru: { tripCost: "Стоимость поездки", from: "из", titleSuffix: "бюджетный гид" },
  pl: { tripCost: "Koszt podróży", from: "z", titleSuffix: "przewodnik budżetowy" },
  th: { tripCost: "ค่าใช้จ่ายทริป", from: "จาก", titleSuffix: "คู่มืองบประมาณ" },
  vi: { tripCost: "Chi phí chuyến đi", from: "từ", titleSuffix: "hướng dẫn ngân sách" },
  ms: { tripCost: "Kos perjalanan", from: "dari", titleSuffix: "panduan bajet" },
  sv: { tripCost: "Resekostnad", from: "från", titleSuffix: "budgetguide" },
  no: { tripCost: "Reisekostnad", from: "fra", titleSuffix: "budsjettguide" },
  da: { tripCost: "Rejsepris", from: "fra", titleSuffix: "budgetguide" },
};

export function getOriginMarket(slug: string): OriginMarket | undefined {
  return ORIGIN_MARKETS.find((market) => market.slug === slug);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getCountryCostSubjects(): CountryCostSubject[] {
  const byCountry = new Map<string, Destination[]>();
  for (const destination of DESTINATIONS) {
    const slug = slugify(destination.country);
    byCountry.set(slug, [...(byCountry.get(slug) ?? []), destination]);
  }

  return [...byCountry.entries()].map(([slug, destinations]) => {
    const primary = destinations[0];
    const average = (key: keyof Destination["budgetPerDay"]) =>
      Math.round(destinations.reduce((sum, destination) => sum + destination.budgetPerDay[key], 0) / destinations.length);
    const monthCounts = new Map<number, number>();
    for (const destination of destinations) {
      for (const month of destination.bestMonths) {
        monthCounts.set(month, (monthCounts.get(month) ?? 0) + 1);
      }
    }
    const bestMonths = [...monthCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([month]) => month);

    return {
      slug,
      nameEn: primary.country,
      nameAr: primary.countryAr,
      country: primary.country,
      countryAr: primary.countryAr,
      iata: primary.iata,
      flag: primary.flag,
      currency: primary.currency,
      bestMonths,
      budgetPerDay: {
        budget: average("budget"),
        mid: average("mid"),
        luxury: average("luxury"),
      },
      destinationSlugs: destinations.map((destination) => destination.slug),
      isCountry: true,
    };
  });
}

export function getTripCostSubject(slug: string): TripCostSubject | undefined {
  return DESTINATIONS.find((destination) => destination.slug === slug) ?? getCountryCostSubjects().find((country) => country.slug === slug);
}

export function getPriorityDestinations(limit = 60): Destination[] {
  return DESTINATIONS.slice(0, limit);
}

export function getTripCostStaticParams(limit = 60) {
  const destinations = getPriorityDestinations(limit);
  const countries = getCountryCostSubjects();
  const subjects = [...destinations, ...countries];
  return GLOBAL_SEO_LOCALES.flatMap((locale) =>
    subjects.flatMap((destination) =>
      ORIGIN_MARKETS.map((origin) => ({
        locale,
        destination: destination.slug,
        origin: `from-${origin.slug}`,
      })),
    ),
  );
}

export function tripCostPath(locale: Locale, destinationSlug: string, originSlug: string) {
  return `/${locale}/trip-cost/${destinationSlug}/from-${originSlug}`;
}

export function localizedTripCostTitle(destination: TripCostSubject, origin: OriginMarket, locale: Locale) {
  const labels = LOCALE_LABELS[locale === "ar" ? "en" : locale];
  if (locale === "ar") {
    return `كم تكلفة رحلة ${destination.nameAr} من ${origin.city}؟ دليل الميزانية`;
  }
  return `${destination.nameEn} ${labels.tripCost} ${labels.from} ${origin.city}: ${labels.titleSuffix}`;
}

export function localizedTripCostDescription(destination: TripCostSubject, origin: OriginMarket, locale: Locale) {
  if (locale === "ar") {
    return `تقدير عملي لتكلفة رحلة ${destination.nameAr} من ${origin.city}: الطيران، السكن، الطعام، المواصلات، الأنشطة، وأفضل أشهر السفر.`;
  }
  return `Estimate a ${destination.nameEn} trip from ${origin.city}: flights, hotels, daily spending, transport, activities, seasonal timing, and budget ranges by travel style.`;
}

export function dailyBudgetRows(destination: TripCostSubject) {
  return [
    {
      style: "Budget",
      amount: destination.budgetPerDay.budget,
      notes: "Hostels or simple hotels, public transport, local meals, free sights.",
    },
    {
      style: "Mid-range",
      amount: destination.budgetPerDay.mid,
      notes: "Comfortable hotels, paid attractions, restaurants, airport transfer flexibility.",
    },
    {
      style: "Luxury",
      amount: destination.budgetPerDay.luxury,
      notes: "Premium hotels, private transfers, guided experiences, fine dining.",
    },
  ];
}

export function tripCostFaq(destination: TripCostSubject, origin: OriginMarket, locale: Locale) {
  const isAr = locale === "ar";
  const bestMonths = formatBestMonths(destination.bestMonths, locale);
  return [
    {
      q: isAr
        ? `كم تكلفة رحلة ${destination.nameAr} من ${origin.city}؟`
        : `How much does a ${destination.nameEn} trip from ${origin.city} cost?`,
      a: isAr
        ? `تعتمد التكلفة على الموسم وأسلوب السفر، لكن الميزانية اليومية داخل الوجهة تبدأ تقريباً من ${destination.budgetPerDay.budget} دولار للمسافر الاقتصادي، و${destination.budgetPerDay.mid} دولار للمتوسط، و${destination.budgetPerDay.luxury} دولار للفخم، قبل احتساب الطيران.`
        : `Costs vary by season and travel style, but daily in-destination budgets start around $${destination.budgetPerDay.budget} for budget travel, $${destination.budgetPerDay.mid} for mid-range travel, and $${destination.budgetPerDay.luxury} for luxury travel before flights.`,
    },
    {
      q: isAr ? `ما أفضل وقت لتقليل تكلفة ${destination.nameAr}؟` : `When is ${destination.nameEn} usually better value?`,
      a: isAr
        ? `الأشهر الأقوى للتوازن بين الطقس والقيمة غالباً: ${bestMonths}. تجنب ذروة العطلات إذا كانت الميزانية أهم من الفعاليات.`
        : `The strongest months for balancing weather and value are usually: ${bestMonths}. Avoid peak holiday periods when budget matters more than events.`,
    },
    {
      q: isAr ? `هل أحتاج تأمين سفر أو eSIM؟` : `Do I need travel insurance or an eSIM?`,
      a: isAr
        ? `لرحلات المسافات الطويلة أو العائلية، التأمين مفيد جداً. و eSIM تساعدك عند الوصول في الخرائط، الترجمة، ومشاركة الموقع.`
        : `For long-haul, family, or higher-cost trips, insurance is strongly worth comparing. An eSIM is useful on arrival for maps, translation, ride apps, and sharing your location.`,
    },
    {
      q: isAr ? `كيف تساعد ريا في هذه الميزانية؟` : `How does Rya help with this budget?`,
      a: isAr
        ? `ريا تحول الميزانية إلى خطة يومية حسب عدد الأيام، من يسافر معك، أسلوب الفندق، والطعام والأنشطة التي تهمك.`
        : `Rya turns the budget into a day-by-day plan based on trip length, companions, hotel style, food preferences, and the experiences that matter to you.`,
    },
  ];
}
