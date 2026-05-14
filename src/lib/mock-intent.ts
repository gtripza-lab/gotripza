import "server-only";
import type { TripIntent } from "./ai/schemas/intent";

const CITY_TO_IATA: Record<string, string> = {
  // ── Saudi Arabia ──────────────────────────────────────────
  "جدة": "JED", "مكة": "JED", "مكة المكرمة": "JED", "مكه": "JED",
  "الرياض": "RUH", "رياض": "RUH",
  "الدمام": "DMM", "دمام": "DMM",
  "المدينة": "MED", "المدينة المنورة": "MED", "مدينة": "MED",
  "الطائف": "TIF", "طائف": "TIF",
  "أبها": "AHB", "ابها": "AHB",
  "تبوك": "TUU",
  "الجوف": "AJF",
  "جيزان": "GIZ",
  "نجران": "EAM",
  "حائل": "HAS",
  "القصيم": "ELQ", "بريدة": "ELQ",
  // ── UAE / Gulf ────────────────────────────────────────────
  "دبي": "DXB",
  "أبوظبي": "AUH", "ابوظبي": "AUH", "أبو ظبي": "AUH", "ابو ظبي": "AUH",
  "الشارقة": "SHJ", "شارقة": "SHJ",
  "الكويت": "KWI", "كويت": "KWI",
  "البحرين": "BAH", "بحرين": "BAH",
  "الدوحة": "DOH", "دوحة": "DOH", "قطر": "DOH",
  "مسقط": "MCT", "عمان": "MCT",
  // ── Middle East ────────────────────────────────────────────
  "القاهرة": "CAI", "مصر": "CAI",
  "الإسكندرية": "ALY",
  "بيروت": "BEY", "لبنان": "BEY",
  "عمّان": "AMM", "الأردن": "AMM",
  "بغداد": "BGW",
  "دمشق": "DAM",
  // ── Europe ────────────────────────────────────────────────
  "لندن": "LHR",
  "باريس": "CDG",
  "روما": "FCO",
  "مدريد": "MAD",
  "برشلونة": "BCN",
  "برلين": "BER",
  "أمستردام": "AMS",
  "إسطنبول": "IST", "اسطنبول": "IST",
  "أنطاليا": "AYT", "انطاليا": "AYT",
  "كابادوكيا": "NAV", "كبادوكيا": "NAV", "نوشهر": "NAV",
  "سانتوريني": "JTR",
  "فيينا": "VIE",
  "زيورخ": "ZRH",
  "أثينا": "ATH",
  // ── Asia ──────────────────────────────────────────────────
  "بانكوك": "BKK", "تايلاند": "BKK",
  "سنغافورة": "SIN",
  "كوالالمبور": "KUL", "ماليزيا": "KUL",
  "بالي": "DPS",
  "طوكيو": "NRT", "اليابان": "NRT",
  "سيول": "ICN",
  "المالديف": "MLE", "الملديف": "MLE", "مالديف": "MLE",
  "تبليسي": "TBS", "جورجيا": "TBS",
  "باكو": "GYD", "أذربيجان": "GYD",
  "دلهي": "DEL", "الهند": "DEL",
  "كولومبو": "CMB", "سريلانكا": "CMB",
  "هونغ كونغ": "HKG",
  // ── Africa ────────────────────────────────────────────────
  "مراكش": "RAK",
  "الدار البيضاء": "CMN", "المغرب": "CMN",
  // ── Americas ──────────────────────────────────────────────
  "نيويورك": "JFK",
  "لوس أنجلوس": "LAX", "لوس انجلوس": "LAX",
  "ميامي": "MIA",
  // ── English (lowercase) ────────────────────────────────────
  jeddah: "JED", mecca: "JED",
  riyadh: "RUH",
  dammam: "DMM",
  medina: "MED", madinah: "MED",
  taif: "TIF",
  dubai: "DXB",
  "abu dhabi": "AUH",
  sharjah: "SHJ",
  kuwait: "KWI",
  bahrain: "BAH",
  doha: "DOH",
  muscat: "MCT",
  cairo: "CAI",
  alexandria: "ALY",
  istanbul: "IST",
  cappadocia: "NAV", nevsehir: "NAV",
  paris: "CDG",
  london: "LHR",
  rome: "FCO",
  madrid: "MAD",
  barcelona: "BCN",
  tokyo: "NRT",
  bangkok: "BKK",
  bali: "DPS",
  "kuala lumpur": "KUL",
  singapore: "SIN",
  maldives: "MLE",
  "new york": "JFK",
  "los angeles": "LAX",
  miami: "MIA",
  santorini: "JTR",
  antalya: "AYT",
  tbilisi: "TBS",
  baku: "GYD",
  marrakech: "RAK",
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
  // C3: Arabic season words → representative month
  "الصيف": 7,  "صيف": 7,
  "الشتاء": 1, "شتاء": 1,
  "الربيع": 4, "ربيع": 4,
  "الخريف": 10, "خريف": 10,
};

// C4: Arabic number words for adult/passenger count
const AR_NUMBERS: Record<string, number> = {
  "اثنين": 2, "اثنان": 2,
  "ثلاثة": 3, "ثلاث": 3,
  "أربعة": 4, "اربعة": 4,
  "خمسة": 5,
  "ستة": 6,
  "سبعة": 7,
  "ثمانية": 8,
  "تسعة": 9,
  "عشرة": 10,
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

/**
 * Set of canonical Arabic city names — used to validate prefix stripping.
 * Built lazily from CITY_TO_IATA on first use.
 */
let _ARABIC_CITY_SET: Set<string> | null = null;
function arabicCitySet(): Set<string> {
  if (_ARABIC_CITY_SET) return _ARABIC_CITY_SET;
  const s = new Set<string>();
  for (const name of Object.keys(CITY_TO_IATA)) {
    if (/[؀-ۿ]/.test(name)) s.add(name);
  }
  _ARABIC_CITY_SET = s;
  return s;
}

/**
 * C2 + M1: Strip Arabic prepositional prefixes that attach directly to city names.
 * Covers: ل (to), ب (in/by), ف (so/in), و (and), لل (to the), فال/بال/وال (in/by the).
 *
 * Safety guards (M1):
 *   • Only strip if the result is itself a known Arabic city name.
 *   • Try longer prefixes first (لل > ل) to avoid greedy under-stripping.
 *   • Never alter input that is already a known city ("لندن", "بانكوك" stay intact).
 *
 * Examples:
 *   "لإسطنبول" → "إسطنبول"  (إسطنبول is a city → strip)
 *   "فالمالديف" → "المالديف"  (المالديف is a city → strip)
 *   "بدبي"     → "دبي"        (دبي is a city → strip)
 *   "لندن"     → "لندن"       (لندن itself is a city → DO NOT strip)
 *   "بانكوك"   → "بانكوك"     (بانكوك itself is a city → DO NOT strip)
 */
function stripArabicPrepositions(text: string): string {
  const t = text.trim();
  if (!t) return text;
  const cities = arabicCitySet();

  // Already a known city — leave it alone (prevents لندن→ندن, بانكوك→انكوك)
  if (cities.has(t)) return text;

  // Longest-first to avoid stripping only one of "لل"
  const prefixes = ["لل", "فال", "بال", "وال", "لـ", "ل", "ب", "ف", "و"];
  for (const p of prefixes) {
    if (t.startsWith(p) && t.length > p.length) {
      const rest = t.slice(p.length);
      if (cities.has(rest)) return rest;
    }
  }
  return text;
}

/**
 * Find a city IATA code after a directional keyword (e.g. "from", "to").
 * Tries ALL occurrences of the cue (not just the first), so "want to fly
 * from Riyadh to London" correctly finds "London" after the second "to".
 * Also tries stripping a leading Arabic prepositional prefix (C2 fix).
 */
function findCity(query: string, after: string[]): string | null {
  const lower = query.toLowerCase();
  for (const cue of after) {
    // Try every occurrence of this cue word
    let searchFrom = 0;
    while (searchFrom < lower.length) {
      const idx = lower.indexOf(cue, searchFrom);
      if (idx === -1) break;
      // Require word boundary before cue (space, start, punctuation)
      const prevChar = idx > 0 ? lower[idx - 1] : " ";
      const nextChar = lower[idx + cue.length] ?? " ";
      if (/\w/.test(prevChar) || (/\w/.test(nextChar) && !/\s/.test(nextChar))) {
        searchFrom = idx + 1;
        continue; // cue is part of a larger word — skip
      }
      const tail = query.slice(idx + cue.length).trim();
      // Try both the raw tail and a prefix-stripped variant (C2)
      const tails = [tail, stripArabicPrepositions(tail)];
      for (const t of tails) {
        for (const [name, code] of Object.entries(CITY_TO_IATA)) {
          // Use lookahead instead of \b — \b is ASCII-only and fails on Arabic text
          const re = new RegExp(`^[\\s,،]*${name}(?=[\\s,،.!؟؛]|$)`, "i");
          if (re.test(t)) return code;
        }
      }
      searchFrom = idx + 1;
    }
  }
  return null;
}

/**
 * Parse "from ORIGIN to DESTINATION" (and Arabic equivalents) as a unit,
 * so both cities are extracted in one pass without cue-collision.
 */
function parseFromTo(query: string): { origin: string | null; destination: string | null } {
  // English: "from <ORIGIN> to <DEST>"
  const enMatch = query.match(/\bfrom\s+([\w\s]+?)\s+to\s+([\w\s]+?)(?:\s+in\b|\s+\d|,|\.|\band\b|$)/i);
  if (enMatch) {
    const originCode = lookupName(enMatch[1].trim());
    const destCode   = lookupName(enMatch[2].trim());
    if (originCode || destCode) return { origin: originCode, destination: destCode };
  }
  // Arabic formal: "من <ORIGIN> إلى/الى/لـ/ل <DEST>" (space before destination)
  const arMatch = query.match(/من\s+([؀-ۿ\s\w]+?)\s+(?:إلى|الى|لـ|ل\s)([؀-ۿ\s\w]+?)(?:\s+في|\s+\d|،|$)/);
  if (arMatch) {
    const originCode = lookupName(arMatch[1].trim());
    const destCode   = lookupName(arMatch[2].trim());
    if (originCode || destCode) return { origin: originCode, destination: destCode };
  }
  // Arabic contracted: "من <ORIGIN> ل<DEST>" or "من <ORIGIN> لل<DEST>" (ل/لل glued to city)
  // e.g. "من الرياض لاسطنبول", "من جدة للمالديف" (لل = ل + ال definite article)
  for (const [destName, destCode] of Object.entries(CITY_TO_IATA)) {
    // Try both "ل<name>" and "لل<name>" (for cities starting with ال like "المالديف" → "للمالديف")
    const variants = [`ل${destName}`, `لل${destName.replace(/^ال/, "")}`];
    for (const prefix of variants) {
      const pattern = new RegExp(`من\\s+([؀-ۿ\\s\\w]+?)\\s+${prefix}(?=[\\s,،.!؟؛]|$)`, "i");
      const m = query.match(pattern);
      if (m) {
        const originCode = lookupName(m[1].trim());
        return { origin: originCode, destination: destCode };
      }
    }
  }
  return { origin: null, destination: null };
}

function lookupName(text: string): string | null {
  const raw = text.toLowerCase().trim();
  // Also try stripping an Arabic prepositional prefix (C2)
  const stripped = stripArabicPrepositions(raw);
  for (const t of raw === stripped ? [raw] : [raw, stripped]) {
    for (const [name, code] of Object.entries(CITY_TO_IATA)) {
      if (t === name.toLowerCase() || t.startsWith(name.toLowerCase())) return code;
    }
  }
  return null;
}

/** Find any city in query, optionally excluding a known IATA code. */
export function findAnyCity(query: string, exclude?: string | null): string | null {
  const lower = query.toLowerCase();
  // Split into words and also check prefix-stripped forms (C2)
  const words = lower.split(/[\s,،.!؟؛]+/).filter(Boolean);
  const normalised = [lower, ...words.map(stripArabicPrepositions)].join(" ");
  for (const [name, code] of Object.entries(CITY_TO_IATA)) {
    if (code === exclude) continue;
    if (normalised.includes(name.toLowerCase())) return code;
  }
  return null;
}

function normalizeDigits(value: string): string {
  return value
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function monthYear(monthNumber: number): number {
  const today = new Date();
  return monthNumber < today.getMonth() + 1 ? today.getFullYear() + 1 : today.getFullYear();
}

function findMonth(query: string): { y: number; m: number; name?: string } | null {
  const lower = normalizeDigits(query).toLowerCase();
  for (const [name, m] of Object.entries({ ...AR_MONTHS, ...EN_MONTHS })) {
    if (lower.includes(name.toLowerCase())) {
      return { y: monthYear(m), m, name };
    }
  }
  if (/الشهر القادم|next month/i.test(lower)) {
    const t = new Date();
    t.setMonth(t.getMonth() + 1);
    return { y: t.getFullYear(), m: t.getMonth() + 1 };
  }
  return null;
}

function findExplicitDayForMonth(query: string, monthName: string | undefined): number | null {
  if (!monthName) return null;
  const q = normalizeDigits(query).toLowerCase();
  const m = escapeRegExp(monthName.toLowerCase());
  const durationUnit = String.raw`(?:أيام|ايام|يوم|ليال|ليالي|ليلة|days?|nights?)`;
  const candidates: Array<{ day: number; index: number; correction: boolean; negated: boolean }> = [];
  const pushCandidate = (day: number, index: number) => {
    if (day < 1 || day > 31) return;
    const before = q.slice(Math.max(0, index - 40), index);
    const correction = /(?:^|[\s،,.])(أقصد|اقصد|اعني|أعني|mean|meant)\s*$/i.test(before);
    const negated =
      /(?:لا|مو|not)\s+(?:أقصد|اقصد|اعني|أعني|mean|meant)\s*$/i.test(before) ||
      /(?:لا|مو|not)\s+$/i.test(before) ||
      /(?:لا|مو)\s+(?:تغير|تغيّر|تحول|تحوّل|تبدل|تبدّل|تجعله|تخليه)[\s\S]*$/i.test(before) ||
      /(?:do not|don't|dont|not)\s+(?:change|set|turn|make)[\s\S]*$/i.test(before);
    candidates.push({ day, index, correction, negated });
  };

  // "June 5", "يونيو 5", "يونيو يوم 5" => day 5.
  const monthThenDayRe = new RegExp(`${m}\\s*(?:-|/|،|,)?\\s*(?:يوم\\s+|day\\s+)?(\\d{1,2})(?!\\s*${durationUnit})`, "gi");
  for (const match of q.matchAll(monthThenDayRe)) {
    pushCandidate(Number(match[1]), match.index ?? 0);
  }

  // "5 June", "5 يونيو" => day 5. The negative look-behind by pattern
  // avoids "لمدة 5 أيام في يونيو" being misread as June 5.
  const dayThenMonthRe = new RegExp(`(?:^|[\\s,،])(?:يوم\\s+|day\\s+)?(\\d{1,2})\\s*(?:-|/|،|,)?\\s*${m}`, "gi");
  for (const match of q.matchAll(dayThenMonthRe)) {
    pushCandidate(Number(match[1]), match.index ?? 0);
  }

  if (!candidates.length) return null;
  const valid = candidates.filter((candidate) => !candidate.negated);
  const pool = valid.length ? valid : candidates;
  const corrected = pool.filter((candidate) => candidate.correction);
  const chosen = (corrected.length ? corrected : pool).sort((a, b) => b.index - a.index)[0];
  return chosen.day;
}

function findTripDurationDays(query: string): number | null {
  const q = normalizeDigits(query);
  const match = q.match(/(?:لمدة|مدة|for)?\s*(\d{1,2})\s*(ليال|ليالي|ليلة|أيام|ايام|يوم|days?|nights?)/i);
  if (!match) return null;
  const days = Number(match[1]);
  return days >= 1 && days <= 45 ? days : null;
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function relativePhraseDates(query: string): { departure_date: string; return_date: string } | null {
  const q = normalizeDigits(query).toLowerCase();
  const today = new Date();
  const duration = findTripDurationDays(q) ?? 5;

  if (/نهاية\s+الشهر\s+القادم|end\s+of\s+next\s+month/i.test(q)) {
    const start = new Date(today.getFullYear(), today.getMonth() + 2, 0);
    start.setDate(Math.max(1, start.getDate() - 2));
    return { departure_date: formatDate(start), return_date: formatDate(addDays(start, duration)) };
  }

  if (/نهاية\s+الشهر|آخر\s+الشهر|اخر\s+الشهر|end\s+of\s+the\s+month/i.test(q)) {
    const targetMonthOffset = today.getDate() >= 25 ? 1 : 0;
    const start = new Date(today.getFullYear(), today.getMonth() + targetMonthOffset + 1, 0);
    start.setDate(Math.max(1, start.getDate() - 2));
    return { departure_date: formatDate(start), return_date: formatDate(addDays(start, duration)) };
  }

  if (/بداية\s+الشهر\s+القادم|اول\s+الشهر\s+القادم|أول\s+الشهر\s+القادم|start\s+of\s+next\s+month/i.test(q)) {
    const start = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    return { departure_date: formatDate(start), return_date: formatDate(addDays(start, duration)) };
  }

  if (/منتصف\s+الشهر|mid\s+month|middle\s+of\s+the\s+month/i.test(q)) {
    const start = new Date(today.getFullYear(), today.getDate() > 15 ? today.getMonth() + 1 : today.getMonth(), 15);
    return { departure_date: formatDate(start), return_date: formatDate(addDays(start, duration)) };
  }

  if (/الويكند\s+القادم|نهاية\s+الأسبوع\s+القادم|نهاية\s+الاسبوع\s+القادم|next\s+weekend/i.test(q)) {
    const start = new Date(today);
    const day = start.getDay();
    const daysUntilFriday = (5 - day + 7) % 7 || 7;
    start.setDate(start.getDate() + daysUntilFriday);
    return { departure_date: formatDate(start), return_date: formatDate(addDays(start, Math.max(2, Math.min(duration, 3)))) };
  }

  if (/بعد\s+العيد|بعد\s+عيد|after\s+eid/i.test(q)) {
    const eids = [
      "2026-05-31",
      "2027-03-12",
      "2027-05-21",
      "2028-03-01",
      "2028-05-09",
    ].map((value) => new Date(`${value}T12:00:00`));
    const start = eids.find((date) => date >= today) ?? addDays(today, 14);
    return { departure_date: formatDate(start), return_date: formatDate(addDays(start, duration)) };
  }

  return null;
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
  // ── 1. Try "from ORIGIN to DESTINATION" pattern first (most reliable) ──
  const fromTo = parseFromTo(query);

  // ── 2. Fall back to individual directional cue searches ──────────────
  const origin =
    fromTo.origin ??
    findCity(query, ["من", "from"]) ??
    null;

  const destination =
    fromTo.destination ??
    findCity(query, ["إلى", "الى", "لـ", "ل ", "to", "in", "for"]) ??
    findAnyCity(query, origin) ??  // exclude origin to avoid returning same city
    "";

  const relativeDates = relativePhraseDates(query);
  const month = findMonth(query);
  let departure_date: string | null = null;
  let return_date: string | null = null;
  if (relativeDates) {
    departure_date = relativeDates.departure_date;
    return_date = relativeDates.return_date;
  } else if (month) {
    const explicitDay = findExplicitDayForMonth(query, month.name);
    const startDay = explicitDay ?? 15;
    const durationDays = findTripDurationDays(query) ?? 5;
    departure_date = `${month.y}-${pad(month.m)}-${pad(startDay)}`;
    const ret = new Date(month.y, month.m - 1, startDay + durationDays);
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

  // C4: Parse adult/passenger count — digit first, then Arabic number words
  let adults = 2;
  const digitMatch = query.match(/(\d+)\s*(?:شخص|أشخاص|اشخاص|بالغ|بالغين|نفر|افراد|أفراد|persons?|adults?|people|travelers?|passengers?)/i);
  if (digitMatch) {
    adults = Math.min(9, Math.max(1, parseInt(digitMatch[1], 10)));
  } else {
    for (const [word, num] of Object.entries(AR_NUMBERS)) {
      if (query.includes(word)) { adults = num; break; }
    }
  }

  return {
    origin: origin === destination ? null : origin,
    destination,
    departure_date,
    return_date,
    adults,
    budget_usd: cheap ? 800 : moderate ? 1500 : luxury ? 4000 : null,
    trip_type,
    cabin_class: null,
    notes: cheap ? "cheap" : moderate ? "moderate" : luxury ? "luxury" : null,
  };
}
