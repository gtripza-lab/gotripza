import { locales, type Locale } from "@/i18n/config";
import { DESTINATIONS, formatBestMonths, type Destination } from "@/lib/seo-destinations";

export type SeoGuideFamily =
  | "family-travel"
  | "honeymoon"
  | "solo-travel"
  | "luxury-travel"
  | "budget-travel"
  | "digital-nomad"
  | "hidden-destinations"
  | "seasonal-travel"
  | "travel-safety"
  | "transportation"
  | "esim"
  | "travel-insurance"
  | "travel-scams";

export type AirportGuide = {
  code: string;
  name: string;
  city: string;
  country: string;
  destinationSlug: string;
  transferModes: string[];
  arrivalTip: string;
};

export const SEO_GUIDE_FAMILIES: SeoGuideFamily[] = [
  "family-travel",
  "honeymoon",
  "solo-travel",
  "luxury-travel",
  "budget-travel",
  "digital-nomad",
  "hidden-destinations",
  "seasonal-travel",
  "travel-safety",
  "transportation",
  "esim",
  "travel-insurance",
  "travel-scams",
];

export const AIRPORT_GUIDES: AirportGuide[] = [
  { code: "NRT", name: "Tokyo Narita Airport", city: "Tokyo", country: "Japan", destinationSlug: "tokyo", transferModes: ["Narita Express", "Skyliner", "airport bus", "taxi"], arrivalTip: "Check your arrival terminal before buying train tickets; Narita transfers vary by line and neighborhood." },
  { code: "HND", name: "Tokyo Haneda Airport", city: "Tokyo", country: "Japan", destinationSlug: "tokyo", transferModes: ["Tokyo Monorail", "Keikyu Line", "airport bus", "taxi"], arrivalTip: "Haneda is easier for central Tokyo, especially late arrivals and short business trips." },
  { code: "ICN", name: "Seoul Incheon Airport", city: "Seoul", country: "South Korea", destinationSlug: "seoul", transferModes: ["AREX", "limousine bus", "taxi", "private transfer"], arrivalTip: "AREX is usually best for Seoul Station; buses are easier if your hotel is near a direct stop." },
  { code: "SIN", name: "Singapore Changi Airport", city: "Singapore", country: "Singapore", destinationSlug: "singapore", transferModes: ["MRT", "taxi", "Grab", "airport shuttle"], arrivalTip: "Changi is efficient, but families should leave time for baggage, eSIM setup, and terminal transfers." },
  { code: "DPS", name: "Bali Ngurah Rai Airport", city: "Bali", country: "Indonesia", destinationSlug: "bali", transferModes: ["hotel transfer", "Grab", "taxi", "private driver"], arrivalTip: "Pre-arrange your first transfer if arriving at night; traffic toward Canggu and Ubud can be slow." },
  { code: "BKK", name: "Bangkok Suvarnabhumi Airport", city: "Bangkok", country: "Thailand", destinationSlug: "bangkok", transferModes: ["Airport Rail Link", "taxi", "Grab", "private transfer"], arrivalTip: "Use the rail link for city traffic hours; use official taxi queues when carrying luggage." },
  { code: "IST", name: "Istanbul Airport", city: "Istanbul", country: "Turkey", destinationSlug: "istanbul", transferModes: ["metro", "Havaist bus", "taxi", "private transfer"], arrivalTip: "Istanbul is large; plan extra time for immigration, baggage, and the long ride into the city." },
  { code: "DXB", name: "Dubai International Airport", city: "Dubai", country: "United Arab Emirates", destinationSlug: "dubai", transferModes: ["metro", "taxi", "Careem", "private transfer"], arrivalTip: "Metro is efficient for light luggage; taxis are usually simplest for families and late-night arrivals." },
  { code: "MLE", name: "Velana International Airport", city: "Maldives", country: "Maldives", destinationSlug: "maldives", transferModes: ["speedboat", "seaplane", "domestic flight"], arrivalTip: "Your resort transfer matters more than the flight; confirm seaplane cut-off times before booking." },
  { code: "CDG", name: "Paris Charles de Gaulle Airport", city: "Paris", country: "France", destinationSlug: "paris", transferModes: ["RER B", "RoissyBus", "taxi", "private transfer"], arrivalTip: "RER is good value, but taxis can be worth it for families or heavy luggage." },
  { code: "FCO", name: "Rome Fiumicino Airport", city: "Rome", country: "Italy", destinationSlug: "rome", transferModes: ["Leonardo Express", "regional train", "taxi", "private transfer"], arrivalTip: "Leonardo Express is simple for Termini; fixed-fare taxis are better for some central hotels." },
  { code: "BCN", name: "Barcelona El Prat Airport", city: "Barcelona", country: "Spain", destinationSlug: "barcelona", transferModes: ["Aerobus", "metro", "train", "taxi"], arrivalTip: "Aerobus is often the easiest first-time option for central Barcelona." },
  { code: "LHR", name: "London Heathrow Airport", city: "London", country: "United Kingdom", destinationSlug: "london", transferModes: ["Elizabeth line", "Heathrow Express", "Underground", "taxi"], arrivalTip: "Choose based on your hotel area; the fastest train is not always the most convenient." },
  { code: "JFK", name: "New York JFK Airport", city: "New York", country: "United States", destinationSlug: "new-york", transferModes: ["AirTrain", "subway", "LIRR", "taxi", "rideshare"], arrivalTip: "AirTrain plus LIRR is often faster than traffic; taxis are simpler for first arrivals." },
  { code: "LAX", name: "Los Angeles International Airport", city: "Los Angeles", country: "United States", destinationSlug: "los-angeles", transferModes: ["FlyAway bus", "rideshare", "taxi", "rental car"], arrivalTip: "Plan the first night around traffic; LAX transfers can feel longer than the distance suggests." },
  { code: "YYZ", name: "Toronto Pearson Airport", city: "Toronto", country: "Canada", destinationSlug: "toronto", transferModes: ["UP Express", "taxi", "rideshare", "rental car"], arrivalTip: "UP Express is the simplest route downtown when your hotel is near Union Station." },
  { code: "YVR", name: "Vancouver International Airport", city: "Vancouver", country: "Canada", destinationSlug: "vancouver", transferModes: ["Canada Line", "taxi", "rideshare", "rental car"], arrivalTip: "Canada Line is reliable for downtown; check luggage space during commute hours." },
  { code: "SYD", name: "Sydney Airport", city: "Sydney", country: "Australia", destinationSlug: "sydney", transferModes: ["Airport Link", "taxi", "rideshare", "rental car"], arrivalTip: "The train is quick but has airport access fees; taxis can make sense for groups." },
  { code: "KEF", name: "Keflavik Airport", city: "Iceland", country: "Iceland", destinationSlug: "iceland", transferModes: ["Flybus", "rental car", "private transfer"], arrivalTip: "If you rent a car, build in daylight, weather, and road-condition checks before leaving the airport." },
  { code: "ZRH", name: "Zurich Airport", city: "Zurich", country: "Switzerland", destinationSlug: "switzerland", transferModes: ["train", "tram", "taxi", "rental car"], arrivalTip: "Swiss rail makes arrivals easy; buy the right pass before adding expensive point-to-point tickets." },
];

const FAMILY_TITLES: Record<SeoGuideFamily, string> = {
  "family-travel": "Family Travel",
  honeymoon: "Honeymoon",
  "solo-travel": "Solo Travel",
  "luxury-travel": "Luxury Travel",
  "budget-travel": "Budget Travel",
  "digital-nomad": "Digital Nomad",
  "hidden-destinations": "Hidden Destinations",
  "seasonal-travel": "Seasonal Travel",
  "travel-safety": "Travel Safety",
  transportation: "Transportation",
  esim: "eSIM",
  "travel-insurance": "Travel Insurance",
  "travel-scams": "Travel Scam Prevention",
};

const FAMILY_TITLES_LOCALIZED: Partial<Record<Locale, Record<SeoGuideFamily, string>>> = {
  ar: FAMILY_TITLES,
  en: FAMILY_TITLES,
  fr: {
    "family-travel": "Voyage en famille",
    honeymoon: "Voyage de noces",
    "solo-travel": "Voyage solo",
    "luxury-travel": "Voyage de luxe",
    "budget-travel": "Voyage économique",
    "digital-nomad": "Nomade digital",
    "hidden-destinations": "Destinations cachées",
    "seasonal-travel": "Voyage saisonnier",
    "travel-safety": "Sécurité voyage",
    transportation: "Transports",
    esim: "eSIM",
    "travel-insurance": "Assurance voyage",
    "travel-scams": "Arnaques voyage",
  },
  de: {
    "family-travel": "Familienreisen",
    honeymoon: "Flitterwochen",
    "solo-travel": "Alleinreisen",
    "luxury-travel": "Luxusreisen",
    "budget-travel": "Budgetreisen",
    "digital-nomad": "Digitale Nomaden",
    "hidden-destinations": "Versteckte Reiseziele",
    "seasonal-travel": "Saisonreisen",
    "travel-safety": "Reisesicherheit",
    transportation: "Transport",
    esim: "eSIM",
    "travel-insurance": "Reiseversicherung",
    "travel-scams": "Reisebetrug vermeiden",
  },
  es: {
    "family-travel": "Viajes en familia",
    honeymoon: "Luna de miel",
    "solo-travel": "Viajes solo",
    "luxury-travel": "Viajes de lujo",
    "budget-travel": "Viajes económicos",
    "digital-nomad": "Nómadas digitales",
    "hidden-destinations": "Destinos ocultos",
    "seasonal-travel": "Viajes por temporada",
    "travel-safety": "Seguridad de viaje",
    transportation: "Transporte",
    esim: "eSIM",
    "travel-insurance": "Seguro de viaje",
    "travel-scams": "Estafas de viaje",
  },
  it: {
    "family-travel": "Viaggi in famiglia",
    honeymoon: "Viaggio di nozze",
    "solo-travel": "Viaggi da soli",
    "luxury-travel": "Viaggi di lusso",
    "budget-travel": "Viaggi economici",
    "digital-nomad": "Nomadi digitali",
    "hidden-destinations": "Destinazioni nascoste",
    "seasonal-travel": "Viaggi stagionali",
    "travel-safety": "Sicurezza in viaggio",
    transportation: "Trasporti",
    esim: "eSIM",
    "travel-insurance": "Assicurazione viaggio",
    "travel-scams": "Truffe di viaggio",
  },
  pt: {
    "family-travel": "Viagem em família",
    honeymoon: "Lua de mel",
    "solo-travel": "Viagem solo",
    "luxury-travel": "Viagem de luxo",
    "budget-travel": "Viagem econômica",
    "digital-nomad": "Nômade digital",
    "hidden-destinations": "Destinos escondidos",
    "seasonal-travel": "Viagem sazonal",
    "travel-safety": "Segurança em viagem",
    transportation: "Transporte",
    esim: "eSIM",
    "travel-insurance": "Seguro viagem",
    "travel-scams": "Golpes em viagem",
  },
  ko: {
    "family-travel": "가족 여행",
    honeymoon: "허니문",
    "solo-travel": "혼자 여행",
    "luxury-travel": "럭셔리 여행",
    "budget-travel": "저예산 여행",
    "digital-nomad": "디지털 노마드",
    "hidden-destinations": "숨은 여행지",
    "seasonal-travel": "시즌 여행",
    "travel-safety": "여행 안전",
    transportation: "교통",
    esim: "eSIM",
    "travel-insurance": "여행 보험",
    "travel-scams": "여행 사기 예방",
  },
  ja: {
    "family-travel": "家族旅行",
    honeymoon: "ハネムーン",
    "solo-travel": "一人旅",
    "luxury-travel": "ラグジュアリー旅行",
    "budget-travel": "節約旅行",
    "digital-nomad": "デジタルノマド",
    "hidden-destinations": "穴場旅行先",
    "seasonal-travel": "季節の旅行",
    "travel-safety": "旅行安全",
    transportation: "交通",
    esim: "eSIM",
    "travel-insurance": "旅行保険",
    "travel-scams": "旅行詐欺対策",
  },
  zh: {
    "family-travel": "亲子旅行",
    honeymoon: "蜜月旅行",
    "solo-travel": "独自旅行",
    "luxury-travel": "奢华旅行",
    "budget-travel": "预算旅行",
    "digital-nomad": "数字游民",
    "hidden-destinations": "小众目的地",
    "seasonal-travel": "季节旅行",
    "travel-safety": "旅行安全",
    transportation: "交通",
    esim: "eSIM",
    "travel-insurance": "旅行保险",
    "travel-scams": "旅行防骗",
  },
  nl: {
    "family-travel": "Gezinsreizen",
    honeymoon: "Huwelijksreis",
    "solo-travel": "Soloreizen",
    "luxury-travel": "Luxereizen",
    "budget-travel": "Budgetreizen",
    "digital-nomad": "Digitale nomaden",
    "hidden-destinations": "Verborgen bestemmingen",
    "seasonal-travel": "Seizoensreizen",
    "travel-safety": "Reisveiligheid",
    transportation: "Vervoer",
    esim: "eSIM",
    "travel-insurance": "Reisverzekering",
    "travel-scams": "Reisfraude voorkomen",
  },
};

function localizedFamilyTitle(locale: Locale, family: SeoGuideFamily) {
  return FAMILY_TITLES_LOCALIZED[locale]?.[family] ?? FAMILY_TITLES[family];
}

const FAMILY_INTENT: Record<SeoGuideFamily, string> = {
  "family-travel": "where to stay, how to pace the trip, transport choices, kid-friendly areas, and avoidable stress points",
  honeymoon: "romantic areas, privacy, splurge-worthy experiences, best months, and calm itinerary design",
  "solo-travel": "safe areas, social neighborhoods, transport, late-night movement, and confidence for first-time solo visitors",
  "luxury-travel": "premium hotels, private transfers, fine dining, seasonal comfort, and high-value luxury decisions",
  "budget-travel": "daily costs, cheap meals, hostels or value hotels, free sights, and transport savings",
  "digital-nomad": "internet, monthly cost, neighborhoods, work-friendly cafes, and long-stay practicality",
  "hidden-destinations": "underrated places, quieter areas, local experiences, and who should choose them",
  "seasonal-travel": "weather, crowds, prices, events, and the best month for each travel style",
  "travel-safety": "safe areas, common risks, emergency planning, family and solo notes, and calm movement",
  transportation: "airport transfers, public transport, ride apps, taxis, rental cars, and city-to-city movement",
  esim: "data needs, activation timing, coverage checks, maps, translation, and arrival connectivity",
  "travel-insurance": "medical cover, delays, baggage, cancellation, visa requirements, and exclusions to check",
  "travel-scams": "common scams, payment traps, taxi issues, tourist areas, and what to do if something feels wrong",
};

export function getAirportGuide(code: string): AirportGuide | undefined {
  return AIRPORT_GUIDES.find((airport) => airport.code.toLowerCase() === code.toLowerCase());
}

export function isSeoGuideFamily(value: string): value is SeoGuideFamily {
  return (SEO_GUIDE_FAMILIES as readonly string[]).includes(value);
}

export function getGuideStaticParams() {
  return locales.flatMap((locale) =>
    SEO_GUIDE_FAMILIES.flatMap((seoFamily) =>
      DESTINATIONS.map((destination) => ({
        locale,
        seoFamily,
        destination: destination.slug,
      })),
    ),
  );
}

export function getAirportStaticParams() {
  return locales.flatMap((locale) =>
    AIRPORT_GUIDES.map((airport) => ({ locale, code: airport.code.toLowerCase() })),
  );
}

export function guideFamilyTitle(family: SeoGuideFamily) {
  return FAMILY_TITLES[family];
}

export function guideTitle(family: SeoGuideFamily, destination: Destination, locale: Locale) {
  const localized = localizedFamilyTitle(locale, family);
  if (locale === "ar") {
    if (family === "travel-insurance") return `تأمين السفر إلى ${destination.nameAr}: متى تحتاجه وما الذي يغطيه`;
    if (family === "esim") return `أفضل شريحة eSIM في ${destination.nameAr}: الإنترنت والخرائط أثناء السفر`;
    if (family === "transportation") return `التنقل في ${destination.nameAr}: المطار، الأحياء، والمواصلات`;
    if (family === "travel-safety") return `الأمان في ${destination.nameAr}: نصائح مهمة قبل وأثناء الرحلة`;
    return `${destination.nameAr}: ${FAMILY_TITLES[family]}`;
  }
  if (family === "travel-insurance") return `${destination.nameEn} Travel Insurance: What It Covers and When You Need It`;
  if (family === "esim") return `Best eSIM for ${destination.nameEn}: Data, Maps and Travel Setup`;
  if (family === "transportation") return `${destination.nameEn} Transportation Guide: Airport, Areas and Getting Around`;
  if (family === "travel-safety") return `${destination.nameEn} Travel Safety Guide: Practical Tips Before You Go`;
  return `${destination.nameEn} ${localized} Guide`;
}

export function guideDescription(family: SeoGuideFamily, destination: Destination, locale: Locale) {
  if (locale === "ar") {
    if (family === "travel-insurance") {
      return `دليل عملي لتأمين السفر إلى ${destination.nameAr}: الحالات التي تحتاجه فيها، ما الذي يغطيه، وما الذي تسأل عنه ريا قبل الشراء.`;
    }
    if (family === "esim") {
      return `دليل شريحة eSIM في ${destination.nameAr}: حجم البيانات المناسب، التفعيل، الخرائط، والترجمة أثناء السفر.`;
    }
    return `دليل عملي عن ${destination.nameAr}: مناطق مناسبة، ميزانية، توقيت، أمان، وربط ذكي مع ريا حسب سياق رحلتك.`;
  }
  if (family === "travel-insurance") {
    return `${destination.nameEn} travel insurance guide: when it matters, what to check, common exclusions, and how Rya helps you decide calmly before the trip.`;
  }
  if (family === "esim") {
    return `Best eSIM setup for ${destination.nameEn}: data size, activation timing, maps, translation, and how Rya helps you stay connected.`;
  }
  const localized = localizedFamilyTitle(locale, family);
  return `${destination.nameEn} ${localized}: practical planning guidance covering ${FAMILY_INTENT[family]}, with Rya-ready answers for AI search.`;
}

export function guideAnswer(family: SeoGuideFamily, destination: Destination, locale: Locale) {
  const months = formatBestMonths(destination.bestMonths, locale);
  if (locale === "ar") {
    return `${destination.nameAr} مناسبة عندما تختار المنطقة الصحيحة وتخطط حسب الموسم والميزانية. أفضل أشهر غالباً: ${months}. استخدم ريا لتحويل الدليل إلى خطة حسب عدد الأيام ومن يسافر معك.`;
  }
  return `${destination.nameEn} works best when you match the area, season, transport, and daily budget to your travel style. The strongest months are usually ${months}. Use Rya to turn this guide into a plan for your dates, companions, and comfort level.`;
}

export function guideSections(family: SeoGuideFamily, destination: Destination, locale: Locale) {
  const isAr = locale === "ar";
  const name = isAr ? destination.nameAr : destination.nameEn;
  if (locale !== "ar" && locale !== "en") {
    const localizedLead: Partial<Record<Exclude<Locale, "ar" | "en">, string>> = {
      fr: `Pour ${name}, commencez par le quartier, le budget quotidien et la saison avant de réserver.`,
      de: `Für ${name} sollten zuerst Lage, Tagesbudget und Reisezeit geprüft werden.`,
      es: `Para ${name}, empieza por la zona, el presupuesto diario y la temporada antes de reservar.`,
      it: `Per ${name}, parti dalla zona, dal budget giornaliero e dalla stagione prima di prenotare.`,
      pt: `Para ${name}, comece pela região, orçamento diário e temporada antes de reservar.`,
      ko: `${name} 여행은 숙소 지역, 1일 예산, 계절을 먼저 맞추는 것이 좋습니다.`,
      ja: `${name}では、宿泊エリア、1日の予算、季節を先に決めると計画しやすくなります。`,
      zh: `规划 ${name} 时，先确认住宿区域、每日预算和旅行季节。`,
      nl: `Voor ${name} begin je met de wijk, het dagbudget en het seizoen voordat je boekt.`,
    };
    return [
      {
        title: "Planning focus",
        body: localizedLead[locale] ?? `For ${name}, start with the right area, daily budget, and season before booking.`,
      },
      {
        title: "Daily budget",
        body: `${name}: budget travelers can start around $${destination.budgetPerDay.budget}/day, mid-range travelers around $${destination.budgetPerDay.mid}/day, and luxury travelers around $${destination.budgetPerDay.luxury}+/day.`,
      },
      {
        title: "Risk and comfort",
        body: "Check airport arrival, local payments, mobile data, late transport, and neighborhood fit before committing to non-refundable bookings.",
      },
      {
        title: "Rya next step",
        body: `Use Rya to adapt this ${guideFamilyTitle(family).toLowerCase()} guide to your dates, companions, pace, and comfort level.`,
      },
    ];
  }
  return [
    {
      title: isAr ? "أين تقيم" : "Where to stay",
      body: isAr
        ? `ابدأ بالمناطق المركزية أو القريبة من المواصلات في ${name}. اختر الحي حسب أسلوب الرحلة لا حسب السعر فقط.`
        : `Start with central or well-connected areas in ${name}. Choose the neighborhood by travel style, not price alone.`,
    },
    {
      title: isAr ? "الميزانية اليومية" : "Daily budget",
      body: isAr
        ? `خطط تقريبياً بين $${destination.budgetPerDay.budget} للمسافر الاقتصادي و$${destination.budgetPerDay.mid} للمتوسط و$${destination.budgetPerDay.luxury}+ للفخم.`
        : `Plan roughly $${destination.budgetPerDay.budget}/day for budget travel, $${destination.budgetPerDay.mid}/day for mid-range, and $${destination.budgetPerDay.luxury}+/day for luxury.`,
    },
    {
      title: isAr ? "الأمان والأخطاء الشائعة" : "Safety and common mistakes",
      body: isAr
        ? "راجع الوصول من المطار، ساعات التنقل، الدفع، والإنترنت قبل السفر حتى لا تضيع ميزانيتك في قرارات لحظية."
        : "Check airport arrival, late movement, payments, mobile data, and common tourist friction before the trip.",
    },
    {
      title: isAr ? "كيف تستخدم ريا" : "How to use Rya",
      body: isAr
        ? `أخبر ريا بتاريخك، عدد الأيام، الميزانية، ومن يسافر معك لتحويل دليل ${name} إلى خطة عملية.`
        : `Tell Rya your dates, days, budget, and companions to turn this ${name} guide into a practical plan.`,
    },
  ];
}

export function guideFaq(family: SeoGuideFamily, destination: Destination, locale: Locale) {
  const isAr = locale === "ar";
  const name = isAr ? destination.nameAr : destination.nameEn;
  const months = formatBestMonths(destination.bestMonths, locale);
  return [
    {
      q: isAr ? `هل ${name} مناسبة لهذا النوع من السفر؟` : `Is ${name} good for ${FAMILY_TITLES[family].toLowerCase()}?`,
      a: guideAnswer(family, destination, locale),
    },
    {
      q: isAr ? `ما أفضل وقت لزيارة ${name}؟` : `What is the best time to visit ${name}?`,
      a: isAr ? `الأشهر الأقوى غالباً: ${months}.` : `The strongest months are usually: ${months}.`,
    },
    {
      q: isAr ? `كم أحتاج يومياً في ${name}؟` : `How much do I need per day in ${name}?`,
      a: isAr
        ? `ابدأ من $${destination.budgetPerDay.budget} اقتصادياً، $${destination.budgetPerDay.mid} متوسطاً، و$${destination.budgetPerDay.luxury}+ للفخامة.`
        : `Start around $${destination.budgetPerDay.budget} for budget travel, $${destination.budgetPerDay.mid} for mid-range, and $${destination.budgetPerDay.luxury}+ for luxury.`,
    },
  ];
}
