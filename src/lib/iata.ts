/**
 * IATA Airport Code Mapper
 * Maps Arabic and English city/country names to IATA airport codes.
 * Used to resolve user intent before calling TravelPayouts APIs.
 */

const IATA_MAP: Record<string, string> = {
  // ── Saudi Arabia ──────────────────────────────────────────────────────────
  "جدة": "JED",
  "مكة": "JED",
  "مكة المكرمة": "JED",
  "مكه": "JED",
  "الرياض": "RUH",
  "رياض": "RUH",
  "الدمام": "DMM",
  "دمام": "DMM",
  "المدينة": "MED",
  "المدينة المنورة": "MED",
  "مدينة": "MED",
  "الطائف": "TIF",
  "طائف": "TIF",
  "أبها": "AHB",
  "ابها": "AHB",
  "تبوك": "TUU",
  "الجوف": "AJF",
  "جيزان": "GIZ",
  "نجران": "EAM",
  "حائل": "HAS",
  "القصيم": "ELQ",
  "بريدة": "ELQ",

  // ── UAE ───────────────────────────────────────────────────────────────────
  "دبي": "DXB",
  "dubai": "DXB",
  "أبوظبي": "AUH",
  "ابوظبي": "AUH",
  "أبو ظبي": "AUH",
  "ابو ظبي": "AUH",
  "الشارقة": "SHJ",
  "شارقة": "SHJ",
  "رأس الخيمة": "RKT",

  // ── Middle East ──────────────────────────────────────────────────────────
  "الكويت": "KWI",
  "كويت": "KWI",
  "البحرين": "BAH",
  "بحرين": "BAH",
  "الدوحة": "DOH",
  "دوحة": "DOH",
  "قطر": "DOH",
  "مسقط": "MCT",
  "عمان": "MCT",
  "بيروت": "BEY",
  "لبنان": "BEY",
  "عمّان": "AMM",
  "الأردن": "AMM",
  "القاهرة": "CAI",
  "مصر": "CAI",
  "بغداد": "BGW",
  "العراق": "BGW",
  "دمشق": "DAM",
  "سوريا": "DAM",
  "صنعاء": "SAH",
  "اليمن": "SAH",
  "الخرطوم": "KRT",
  "السودان": "KRT",

  // ── Europe ────────────────────────────────────────────────────────────────
  "لندن": "LHR",
  "london": "LHR",
  "باريس": "CDG",
  "paris": "CDG",
  "روما": "FCO",
  "rome": "FCO",
  "إيطاليا": "FCO",
  "ميلانو": "MXP",
  "مدريد": "MAD",
  "برشلونة": "BCN",
  "إسبانيا": "MAD",
  "برلين": "BER",
  "ألمانيا": "FRA",
  "فرانكفورت": "FRA",
  "أمستردام": "AMS",
  "هولندا": "AMS",
  "بروكسل": "BRU",
  "بلجيكا": "BRU",
  "فيينا": "VIE",
  "النمسا": "VIE",
  "زيورخ": "ZRH",
  "سويسرا": "ZRH",
  "جنيف": "GVA",
  "فارسوفيا": "WAW",
  "بولندا": "WAW",
  "براغ": "PRG",
  "تشيكيا": "PRG",
  "بودابست": "BUD",
  "المجر": "BUD",
  "أثينا": "ATH",
  "اليونان": "ATH",
  "إسطنبول": "IST",
  "اسطنبول": "IST",
  "istanbul": "IST",
  "تركيا": "IST",
  "أنطاليا": "AYT",
  "انطاليا": "AYT",
  "antalya": "AYT",
  "ليسبون": "LIS",
  "البرتغال": "LIS",
  "دبلن": "DUB",
  "ايرلندا": "DUB",
  "ستوكهولم": "ARN",
  "السويد": "ARN",
  "أوسلو": "OSL",
  "النرويج": "OSL",
  "كوبنهاغن": "CPH",
  "الدنمارك": "CPH",
  "هلسنكي": "HEL",
  "فنلندا": "HEL",

  // ── Asia ──────────────────────────────────────────────────────────────────
  "بانكوك": "BKK",
  "تايلاند": "BKK",
  "سنغافورة": "SIN",
  "كوالالمبور": "KUL",
  "ماليزيا": "KUL",
  "جاكرتا": "CGK",
  "اندونيسيا": "CGK",
  "بالي": "DPS",
  "مانيلا": "MNL",
  "الفلبين": "MNL",
  "هونغ كونغ": "HKG",
  "هونج كونج": "HKG",
  "طوكيو": "NRT",
  "اليابان": "NRT",
  "سيول": "ICN",
  "كوريا": "ICN",
  "بكين": "PEK",
  "الصين": "PEK",
  "شنغهاي": "PVG",
  "دلهي": "DEL",
  "الهند": "DEL",
  "مومباي": "BOM",
  "كولومبو": "CMB",
  "سريلانكا": "CMB",
  "المالديف": "MLE",
  "مالديف": "MLE",
  "maldives": "MLE",
  "كراتشي": "KHI",
  "باكستان": "KHI",
  "لاهور": "LHE",
  "تبليسي": "TBS",
  "جورجيا": "TBS",
  "باكو": "GYD",
  "أذربيجان": "GYD",

  // ── Africa ────────────────────────────────────────────────────────────────
  "نيروبي": "NBO",
  "كينيا": "NBO",
  "كيب تاون": "CPT",
  "جوهانسبرغ": "JNB",
  "جنوب أفريقيا": "JNB",
  "أديس أبابا": "ADD",
  "إثيوبيا": "ADD",
  "دار السلام": "DAR",
  "تنزانيا": "DAR",
  "مراكش": "RAK",
  "الرباط": "CMN",
  "المغرب": "CMN",
  "تونس": "TUN",
  "الجزائر": "ALG",
  "الدار البيضاء": "CMN",

  // ── Americas ──────────────────────────────────────────────────────────────
  "نيويورك": "JFK",
  "new york": "JFK",
  "لوس أنجلوس": "LAX",
  "los angeles": "LAX",
  "ميامي": "MIA",
  "شيكاغو": "ORD",
  "سان فرانسيسكو": "SFO",
  "واشنطن": "IAD",
  "بوسطن": "BOS",
  "تورونتو": "YYZ",
  "كندا": "YYZ",
  "فانكوفر": "YVR",
  "مكسيكو سيتي": "MEX",
  "المكسيك": "MEX",
  "ساو باولو": "GRU",
  "البرازيل": "GRU",
  "بوينس آيرس": "EZE",
  "الأرجنتين": "EZE",

  // ── Oceania ───────────────────────────────────────────────────────────────
  "سيدني": "SYD",
  "استراليا": "SYD",
  "أستراليا": "SYD",
  "ملبورن": "MEL",
  "أوكلاند": "AKL",
  "نيوزيلندا": "AKL",
};

/** Normalize: lowercase + strip diacritics for robust matching */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[\u064B-\u065F]/g, "") // strip Arabic diacritics
    .trim();
}

/** Reverse map: IATA code → English city name for APIs that need a readable name (e.g. Hotellook) */
const IATA_TO_CITY: Record<string, string> = {
  // Saudi Arabia
  JED: "Jeddah", RUH: "Riyadh", DMM: "Dammam", MED: "Medina",
  TIF: "Taif", AHB: "Abha", TUU: "Tabuk", AJF: "Al-Jouf",
  GIZ: "Jizan", EAM: "Najran", HAS: "Hail", ELQ: "Buraidah",
  // UAE / Gulf
  DXB: "Dubai", AUH: "Abu Dhabi", SHJ: "Sharjah", RKT: "Ras Al Khaimah",
  DOH: "Doha", KWI: "Kuwait City", BAH: "Manama", MCT: "Muscat",
  // Middle East
  AMM: "Amman", BEY: "Beirut", CAI: "Cairo", BGW: "Baghdad",
  DAM: "Damascus", SAH: "Sanaa", KRT: "Khartoum",
  // Europe
  LHR: "London", CDG: "Paris", FCO: "Rome", MAD: "Madrid",
  BCN: "Barcelona", FRA: "Frankfurt", AMS: "Amsterdam", BRU: "Brussels",
  VIE: "Vienna", ZRH: "Zurich", GVA: "Geneva", WAW: "Warsaw",
  PRG: "Prague", BUD: "Budapest", ATH: "Athens", IST: "Istanbul",
  AYT: "Antalya", LIS: "Lisbon", DUB: "Dublin", ARN: "Stockholm",
  OSL: "Oslo", CPH: "Copenhagen", HEL: "Helsinki", BER: "Berlin",
  MXP: "Milan",
  // Asia
  BKK: "Bangkok", SIN: "Singapore", KUL: "Kuala Lumpur", CGK: "Jakarta",
  DPS: "Bali", MNL: "Manila", HKG: "Hong Kong", NRT: "Tokyo",
  ICN: "Seoul", PEK: "Beijing", PVG: "Shanghai", DEL: "New Delhi",
  BOM: "Mumbai", CMB: "Colombo", MLE: "Maldives", KHI: "Karachi",
  LHE: "Lahore", TBS: "Tbilisi", GYD: "Baku",
  // Africa
  NBO: "Nairobi", CPT: "Cape Town", JNB: "Johannesburg",
  ADD: "Addis Ababa", DAR: "Dar es Salaam", RAK: "Marrakech",
  CMN: "Casablanca", TUN: "Tunis", ALG: "Algiers",
  // Americas
  JFK: "New York", LAX: "Los Angeles", MIA: "Miami", ORD: "Chicago",
  SFO: "San Francisco", IAD: "Washington", BOS: "Boston",
  YYZ: "Toronto", YVR: "Vancouver", MEX: "Mexico City",
  GRU: "Sao Paulo", EZE: "Buenos Aires",
  // Oceania
  SYD: "Sydney", MEL: "Melbourne", AKL: "Auckland",
};

/**
 * Convert an IATA airport code to a readable English city name.
 * Used when calling APIs like Hotellook that expect city names, not codes.
 */
export function iataToCity(code: string): string {
  return IATA_TO_CITY[code.toUpperCase()] ?? code;
}

/**
 * Resolve a city/country name (Arabic or English) to its IATA code.
 * Returns the input unchanged if it is already a 3-letter IATA code
 * or if no mapping is found.
 */
export function resolveIata(input: string | null | undefined): string | null {
  if (!input) return null;
  const s = input.trim();

  // Already looks like an IATA code (3 uppercase letters)
  if (/^[A-Z]{3}$/.test(s)) return s;

  const key = normalize(s);

  // Direct lookup
  for (const [name, code] of Object.entries(IATA_MAP)) {
    if (normalize(name) === key) return code;
  }

  // Partial match – city name is contained in the input
  for (const [name, code] of Object.entries(IATA_MAP)) {
    if (key.includes(normalize(name)) || normalize(name).includes(key)) {
      return code;
    }
  }

  return s; // return as-is; let the API try
}
