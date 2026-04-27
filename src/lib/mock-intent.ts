import "server-only";
import type { TripIntent } from "./gemini";

const CITY_TO_IATA: Record<string, string> = {
  // Arabic
  "جدة": "JED",
  "الرياض": "RUH",
  "دبي": "DXB",
  "أبوظبي": "AUH",
  "ابوظبي": "AUH",
  "الدوحة": "DOH",
  "القاهرة": "CAI",
  "الإسكندرية": "ALY",
  "اسطنبول": "IST",
  "إسطنبول": "IST",
  "باريس": "PAR",
  "لندن": "LON",
  "روما": "ROM",
  "مدريد": "MAD",
  "برشلونة": "BCN",
  "طوكيو": "TYO",
  "بانكوك": "BKK",
  "بالي": "DPS",
  "كوالالمبور": "KUL",
  "سنغافورة": "SIN",
  "المالديف": "MLE",
  "الملديف": "MLE",
  "نيويورك": "NYC",
  "لوس انجلوس": "LAX",
  "سانتوريني": "JTR",
  "أنطاليا": "AYT",
  "انطاليا": "AYT",
  // English (lowercase keys)
  jeddah: "JED",
  riyadh: "RUH",
  dubai: "DXB",
  "abu dhabi": "AUH",
  doha: "DOH",
  cairo: "CAI",
  alexandria: "ALY",
  istanbul: "IST",
  paris: "PAR",
  london: "LON",
  rome: "ROM",
  madrid: "MAD",
  barcelona: "BCN",
  tokyo: "TYO",
  bangkok: "BKK",
  bali: "DPS",
  "kuala lumpur": "KUL",
  singapore: "SIN",
  maldives: "MLE",
  "new york": "NYC",
  "los angeles": "LAX",
  santorini: "JTR",
  antalya: "AYT",
};

const AR_MONTHS: Record<string, number> = {
  "يناير": 1,
  "فبراير": 2,
  "مارس": 3,
  "أبريل": 4,
  "ابريل": 4,
  "مايو": 5,
  "يونيو": 6,
  "يوليو": 7,
  "أغسطس": 8,
  "اغسطس": 8,
  "سبتمبر": 9,
  "أكتوبر": 10,
  "اكتوبر": 10,
  "نوفمبر": 11,
  "ديسمبر": 12,
};

const EN_MONTHS: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

function findCity(query: string, after: string[]): string | null {
  const lower = query.toLowerCase();
  for (const cue of after) {
    const idx = lower.indexOf(cue);
    if (idx === -1) continue;
    const tail = query.slice(idx + cue.length).trim();
    for (const [name, code] of Object.entries(CITY_TO_IATA)) {
      const re = new RegExp(`^[\\s,،]*${name}`, "i");
      if (re.test(tail)) return code;
    }
  }
  return null;
}

function findAnyCity(query: string): string | null {
  const lower = query.toLowerCase();
  for (const [name, code] of Object.entries(CITY_TO_IATA)) {
    if (lower.includes(name.toLowerCase())) return code;
  }
  return null;
}

function findMonth(query: string): { y: number; m: number } | null {
  const lower = query.toLowerCase();
  for (const [name, m] of Object.entries({ ...AR_MONTHS, ...EN_MONTHS })) {
    if (lower.includes(name.toLowerCase())) {
      const today = new Date();
      const y = m < today.getMonth() + 1 ? today.getFullYear() + 1 : today.getFullYear();
      return { y, m };
    }
  }
  if (/الشهر القادم|next month/i.test(query)) {
    const t = new Date();
    t.setMonth(t.getMonth() + 1);
    return { y: t.getFullYear(), m: t.getMonth() + 1 };
  }
  return null;
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function detectLocale(query: string): "ar" | "en" {
  return /[\u0600-\u06FF]/.test(query) ? "ar" : "en";
}

export function welcomeMessage(locale: "ar" | "en"): string {
  return locale === "ar"
    ? "مساعد GoTripza الرقمي — جارٍ تحضير خيارات سفر فاخرة لرحلتك."
    : "GoTripza Digital Assistant — curating premium options for your itinerary.";
}

export type Wants = ("flights" | "hotels")[];

export function detectWants(query: string): Wants {
  const wantsFlights = /(طيران|رحلة جوية|رحلات الطيران|تذاكر طيران|flight|flights)/i.test(query);
  const wantsHotels = /(فندق|فنادق|إقامة|سكن|hotel|hotels|stay|stays|accommodation)/i.test(query);
  if (wantsFlights && !wantsHotels) return ["flights"];
  if (wantsHotels && !wantsFlights) return ["hotels"];
  return ["flights", "hotels"];
}

export function followupMessage(
  locale: "ar" | "en",
  wants: Wants,
): string | null {
  if (wants.length >= 2) return null;
  if (!wants.includes("hotels")) {
    return locale === "ar"
      ? "هل تودون استعراض خيارات الفنادق المتاحة لهذه الوجهة أيضاً؟"
      : "Would you also like to view the available hotel options for this destination?";
  }
  if (!wants.includes("flights")) {
    return locale === "ar"
      ? "هل تودون استعراض رحلات الطيران المتاحة إلى هذه الوجهة؟"
      : "Would you also like to view flight options to this destination?";
  }
  return null;
}

/**
 * Best-effort heuristic parser used when Gemini key is invalid.
 * Lets the demo flow work end-to-end without a live LLM.
 */
export function heuristicParse(query: string): TripIntent {
  const origin =
    findCity(query, ["من", "from"]) ?? null;
  const destination =
    findCity(query, ["إلى", "الى", "لـ", "ل ", "to"]) ??
    findAnyCity(query) ??
    "DXB";

  const month = findMonth(query);
  let departure_date: string | null = null;
  let return_date: string | null = null;
  if (month) {
    departure_date = `${month.y}-${pad(month.m)}-15`;
    const ret = new Date(month.y, month.m - 1, 20);
    return_date = `${ret.getFullYear()}-${pad(ret.getMonth() + 1)}-${pad(ret.getDate())}`;
  }

  const cheap = /(رخيص|cheap|أرخص|ارخص|cheapest)/i.test(query);
  const moderate = /(متوسطة|متوسط|moderate|mid-?range)/i.test(query);
  const luxury = /(فاخرة|فاخر|luxury|premium)/i.test(query);
  const honeymoon = /(شهر عسل|honeymoon)/i.test(query);
  const family = /(عائل|family)/i.test(query);
  const adventure = /(مغامرة|adventure)/i.test(query);
  const weekend = /(نهاية الأسبوع|weekend)/i.test(query);
  const business = /(عمل|business)/i.test(query);

  const trip_type: TripIntent["trip_type"] = honeymoon
    ? "honeymoon"
    : family
      ? "family"
      : adventure
        ? "adventure"
        : weekend
          ? "weekend"
          : business
            ? "business"
            : "leisure";

  return {
    origin: origin === destination ? null : origin,
    destination,
    departure_date,
    return_date,
    adults: 2,
    budget_usd: cheap ? 800 : moderate ? 1500 : luxury ? 4000 : null,
    trip_type,
    notes: cheap ? "cheap" : moderate ? "moderate" : luxury ? "luxury" : null,
  };
}
