/**
 * GoTripza Smart Partner Orchestration Engine
 * ────────────────────────────────────────────
 * Decides WHICH partners to recommend and WHY, based on the user's
 * real travel intent. This is NOT random affiliate pushing.
 *
 * Rules:
 *  - Only configured partners are returned (no broken links)
 *  - Max 6 recommendations per context
 *  - Each recommendation has a human-readable reason
 *  - Partners are ordered by relevance, then by commission rate
 */

import {
  PARTNERS,
  buildPartnerUrl,
  type Partner,
  type PartnerId,
  type PartnerUrlParams,
} from "./partners";
import type { TripIntent } from "./gemini";

export type PartnerRec = {
  partner: Partner;
  url: string;
  reason_en: string;
  reason_ar: string;
  priority: number; // lower = higher priority
};

// ── European country/region detector ────────────────────────────────────────
const EUROPEAN_DESTINATIONS = new Set([
  "paris","france","london","uk","england","rome","italy","madrid","spain",
  "berlin","germany","amsterdam","netherlands","vienna","austria","zurich",
  "switzerland","prague","czech","budapest","hungary","warsaw","poland",
  "lisbon","portugal","athens","greece","brussels","belgium","stockholm",
  "sweden","oslo","norway","copenhagen","denmark","helsinki","finland",
  "dublin","ireland","edinburgh","scotland","barcelona","milan","florence",
  "venice","munich","frankfurt","hamburg","cologne","lyon","marseille",
  "cdg","lhr","ams","fra","mad","bcn","fco","mxp","muc","vie","zrh",
  "bru","prg","bud","waw","lis","ath","arn","osl","cph","hel",
  "raileurope","eurorail",
]);

// ── Asian destination detector ───────────────────────────────────────────────
const ASIAN_DESTINATIONS = new Set([
  "bali","jakarta","indonesia","dps","cgk",
  "bangkok","thailand","bkk","phuket","chiang mai",
  "tokyo","japan","nrt","hnd","osaka","kyoto",
  "singapore","sin","hong kong","hkg",
  "kuala lumpur","malaysia","kul",
  "seoul","korea","icn",
  "taipei","taiwan","tpe",
  "manila","philippines","mnl",
  "hanoi","ho chi minh","vietnam","han","sgn",
  "mumbai","delhi","india","bom","del",
  "colombo","sri lanka","cmb",
  "maldives","male","mle",
  "dubai","abu dhabi","uae","dxb","auh",
  "doha","qatar","doh",
  "riyadh","jeddah","saudi","ruh","jed",
]);

function isEuropean(dest: string): boolean {
  return EUROPEAN_DESTINATIONS.has(dest.toLowerCase().trim());
}

function isAsian(dest: string): boolean {
  return ASIAN_DESTINATIONS.has(dest.toLowerCase().trim());
}

function isInternational(intent: TripIntent): boolean {
  if (!intent.origin || !intent.destination) return true; // assume international
  const same = intent.origin.slice(0, 2).toUpperCase() === intent.destination.slice(0, 2).toUpperCase();
  return !same;
}

// ── Main orchestration function ───────────────────────────────────────────────
export function getPartnerRecommendations(
  intent: TripIntent,
  urlParams: PartnerUrlParams,
  maxResults = 6,
): PartnerRec[] {
  const recs: PartnerRec[] = [];
  const dest = intent.destination ?? "";
  const tripType = intent.trip_type;
  const isIntl = isInternational(intent);
  const isEU = isEuropean(dest);
  const isAS = isAsian(dest);

  // Helper: add rec if partner is configured
  function add(
    id: PartnerId,
    priority: number,
    reason_en: string,
    reason_ar: string,
  ) {
    const url = buildPartnerUrl(id, urlParams);
    if (!url) return; // partner not configured — skip silently
    // Don't add duplicates
    if (recs.some((r) => r.partner.id === id)) return;
    recs.push({ partner: PARTNERS[id], url, reason_en, reason_ar, priority });
  }

  // ── Always add hotel partners first if destination is known ──────────────
  if (dest) {
    add("booking", 1,
      `Book hotels in ${dest} — best price guarantee on Booking.com`,
      `احجز فنادق في ${dest} — ضمان أفضل سعر على Booking.com`
    );
    add("tripcom", 2,
      `Hotels + packages for ${dest} on Trip.com`,
      `فنادق وحزم سفر إلى ${dest} عبر Trip.com`
    );
  }

  // ── TRIP TYPE: Family ────────────────────────────────────────────────────
  if (tripType === "family") {
    add("visitorscoverage", 5,
      "Family travel insurance — essential for international trips with kids",
      "تأمين سفر عائلي — ضروري للرحلات الدولية مع الأطفال"
    );
    add("ekta", 6,
      "Comprehensive family insurance with instant policy issuance",
      "تأمين عائلي شامل مع إصدار وثيقة فورية"
    );
    if (isEU) {
      add("gocity", 8,
        `Go City pass — one price for all top family attractions in ${dest}`,
        `بطاقة Go City — سعر واحد لجميع معالم ${dest} العائلية`
      );
    }
    add("getyourguide", 9,
      `Family-friendly activities & tours in ${dest}`,
      `أنشطة وجولات عائلية في ${dest}`
    );
    if (isAS) {
      add("klook", 10,
        `Theme parks, attractions & family tours in ${dest} via Klook`,
        `مدن الملاهي والمعالم والجولات العائلية في ${dest} عبر Klook`
      );
    }
    add("discovercars", 15,
      `Rent a family car in ${dest} — compare 900+ companies`,
      `استئجار سيارة عائلية في ${dest} — قارن أكثر من ٩٠٠ شركة`
    );
  }

  // ── TRIP TYPE: Honeymoon ─────────────────────────────────────────────────
  else if (tripType === "honeymoon") {
    add("getyourguide", 5,
      `Romantic experiences & private tours in ${dest}`,
      `تجارب رومانسية وجولات خاصة في ${dest}`
    );
    add("klook", 6,
      `Luxury packages & sunset cruises in ${dest}`,
      `باقات فاخرة ورحلات بحرية في ${dest}`
    );
    add("visitorscoverage", 7,
      "Travel insurance for your honeymoon — peace of mind guaranteed",
      "تأمين سفر لشهر العسل — راحة بال مضمونة"
    );
    if (isEU) {
      add("gocity", 9,
        `All-access passes for ${dest}'s most romantic sights`,
        `بطاقات دخول شاملة لأجمل معالم ${dest}`
      );
    }
    if (isAS) {
      add("kkday", 10,
        `Unique couple experiences & culinary tours in ${dest}`,
        `تجارب فريدة للأزواج وجولات طعام في ${dest}`
      );
    }
    add("airalo", 12,
      "eSIM to stay connected during your honeymoon — no roaming fees",
      "شريحة إلكترونية للبقاء متصلاً خلال شهر العسل — بلا رسوم تجوال"
    );
  }

  // ── TRIP TYPE: Business ──────────────────────────────────────────────────
  else if (tripType === "business") {
    add("airhelp", 4,
      "Protect your business travel — claim up to €600 for disruptions",
      "احمِ سفرك التجاري — استرجع حتى ٦٠٠ يورو عن أي اضطراب"
    );
    add("airalo", 5,
      "Business eSIM — fast data in 200+ countries, no roaming bills",
      "شريحة عمل إلكترونية — إنترنت سريع في أكثر من ٢٠٠ دولة بلا فواتير تجوال"
    );
    add("yesim", 6,
      "eSIM + built-in VPN — secure connectivity for business travelers",
      "شريحة إلكترونية + VPN مدمج — اتصال آمن لرجال الأعمال"
    );
    add("discovercars", 7,
      `Business car rental in ${dest} — corporate rates available`,
      `تأجير سيارة للأعمال في ${dest} — أسعار شركات متاحة`
    );
    add("visitorscoverage", 9,
      "Business travel insurance with emergency evacuation coverage",
      "تأمين سفر للأعمال يشمل تغطية الإخلاء الطارئ"
    );
  }

  // ── TRIP TYPE: Adventure ─────────────────────────────────────────────────
  else if (tripType === "adventure") {
    add("klook", 5,
      `Extreme sports, hiking & adventure tours in ${dest}`,
      `رياضات مغامرة ومشي وجولات في ${dest}`
    );
    add("getyourguide", 6,
      `Guided adventure experiences in ${dest}`,
      `تجارب مغامرة بصحبة مرشدين في ${dest}`
    );
    add("visitorscoverage", 7,
      "Adventure travel insurance — covers extreme sports & emergencies",
      "تأمين سفر مغامرات — يشمل الرياضات المتطرفة والطوارئ"
    );
    add("airalo", 8,
      "eSIM for remote destinations — stay connected off the beaten path",
      "شريحة إلكترونية للوجهات النائية — ابقَ متصلاً بعيداً عن المدن"
    );
    add("discovercars", 10,
      `4WD & off-road vehicle rentals in ${dest}`,
      `استئجار سيارات دفع رباعي في ${dest}`
    );
  }

  // ── TRIP TYPE: Weekend ────────────────────────────────────────────────────
  else if (tripType === "weekend") {
    add("getyourguide", 5,
      `Best things to do in ${dest} this weekend`,
      `أفضل ما يمكن فعله في ${dest} هذا الأسبوع`
    );
    if (isEU) {
      add("gocity", 6,
        `Weekend pass for ${dest} — unlimited attractions access`,
        `بطاقة عطلة نهاية أسبوع في ${dest} — دخول غير محدود للمعالم`
      );
    }
    add("discovercars", 8,
      `Weekend car rental in ${dest} — no hidden fees`,
      `تأجير سيارة لعطلة نهاية الأسبوع في ${dest} — بلا رسوم خفية`
    );
    add("airalo", 10,
      "Quick eSIM for your weekend trip — activate in minutes",
      "شريحة إلكترونية سريعة لعطلتك — تفعيل خلال دقائق"
    );
  }

  // ── Default / Leisure / Unknown ──────────────────────────────────────────
  else {
    add("getyourguide", 5,
      `Top-rated tours & activities in ${dest}`,
      `أفضل الجولات والأنشطة في ${dest}`
    );
    add("discovercars", 7,
      `Compare car rental prices in ${dest}`,
      `قارن أسعار تأجير السيارات في ${dest}`
    );
    if (isAS) {
      add("klook", 8,
        `Activities & experiences in ${dest} — Asia's #1 booking platform`,
        `أنشطة وتجارب في ${dest} — المنصة الأولى في آسيا`
      );
    }
    add("visitorscoverage", 9,
      "Travel insurance — affordable coverage for any trip",
      "تأمين سفر — تغطية ميسورة لأي رحلة"
    );
  }

  // ── Destination-specific extras ──────────────────────────────────────────

  // European rail travel
  if (isEU) {
    add("raileurope", 20,
      `Train travel in Europe — point-to-point tickets & rail passes`,
      `السفر بالقطار في أوروبا — تذاكر مباشرة وبطاقات السكة الحديد`
    );
  }

  // Long-haul / international extras
  if (isIntl) {
    if (!recs.some((r) => r.partner.id === "airalo")) {
      add("airalo", 25,
        "eSIM for your international trip — connect instantly on arrival",
        "شريحة إلكترونية لرحلتك الدولية — اتصل فور وصولك"
      );
    }
    if (!recs.some((r) => r.partner.id === "airhelp")) {
      add("airhelp", 26,
        "Flight delay protection — claim compensation automatically",
        "حماية من تأخير الرحلات — استرجع تعويضك تلقائياً"
      );
    }
    if (!recs.some((r) => r.partner.category === "insurance")) {
      add("visitorscoverage", 27,
        "Travel insurance for peace of mind abroad",
        "تأمين سفر لراحة البال في الخارج"
      );
    }
  }

  // Cheap flights extras
  if (intent.notes?.includes("cheap") || intent.notes?.includes("budget") ||
      intent.notes?.includes("رخيص") || intent.notes?.includes("اقتصادي")) {
    add("kiwi", 3,
      "Find the cheapest flight with Kiwi.com's unique routing algorithm",
      "ابحث عن أرخص رحلة مع خوارزمية Kiwi.com الفريدة"
    );
    add("cheapoair", 4,
      "Last-minute & discounted airfares on CheapOair",
      "تذاكر اللحظة الأخيرة والرحلات المخفّضة على CheapOair"
    );
  }

  // Asia extras
  if (isAS && !recs.some((r) => r.partner.id === "kkday")) {
    add("kkday", 18,
      `Cultural experiences & local tours in ${dest}`,
      `تجارب ثقافية وجولات محلية في ${dest}`
    );
  }

  // Sort by priority, return top N
  return recs
    .sort((a, b) => a.priority - b.priority)
    .slice(0, maxResults);
}

/** Returns partner recs in category groups for display */
export function getPartnerRecsByCategory(
  intent: TripIntent,
  urlParams: PartnerUrlParams,
): Map<string, PartnerRec[]> {
  const recs = getPartnerRecommendations(intent, urlParams, 12);
  const map = new Map<string, PartnerRec[]>();
  for (const rec of recs) {
    const cat = rec.partner.category;
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat)!.push(rec);
  }
  return map;
}
