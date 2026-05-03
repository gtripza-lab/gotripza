/**
 * GoTripza Central Partner Registry
 * ─────────────────────────────────────────────────────────────────────────────
 * ALL affiliate traffic is routed through Travelpayouts using the TP marker.
 *
 * Link format:
 *   https://tp.media/click?shmarker={MARKER}&promo_id={PROMO}&source_type=customtab&type=click&custom_url={ENCODED_URL}
 *
 * PROMO IDs come from your Travelpayouts dashboard:
 *   https://www.travelpayouts.com/programs → Partner → Tools → "Get link"
 *
 * PARTNERS WITH KNOWN PROMO IDs (defaults provided):
 *   Booking.com  → 4338
 *   Trip.com     → 4064
 *
 * PARTNERS REQUIRING PROMO IDs FROM YOUR TP DASHBOARD:
 *   Set the corresponding NEXT_PUBLIC_TP_PROMO_* env var (see .env.example).
 *   Partners with missing/empty promo_id are silently hidden — never broken.
 */

// ── Core Travelpayouts marker ─────────────────────────────────────────────────
export const TP_MARKER = process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER ?? "522867";

// ── Travelpayouts promo_ids — one per partner program ────────────────────────
// Default values for well-known, universal TP promo_ids.
// All others MUST be filled from: TP Dashboard → Programs → [Partner] → Tools → Link
const TP_PROMO = {
  // Hotels (known universal promo_ids)
  booking:          process.env.NEXT_PUBLIC_TP_PROMO_BOOKING      ?? "4338",
  tripcom:          process.env.NEXT_PUBLIC_TP_PROMO_TRIPCOM      ?? "4064",
  // Everything else: set from your TP dashboard
  discovercars:     process.env.NEXT_PUBLIC_TP_PROMO_DISCOVERCARS ?? "",
  getyourguide:     process.env.NEXT_PUBLIC_TP_PROMO_GYG          ?? "",
  klook:            process.env.NEXT_PUBLIC_TP_PROMO_KLOOK        ?? "",
  kkday:            process.env.NEXT_PUBLIC_TP_PROMO_KKDAY        ?? "",
  gocity:           process.env.NEXT_PUBLIC_TP_PROMO_GOCITY       ?? "",
  kiwi:             process.env.NEXT_PUBLIC_TP_PROMO_KIWI         ?? "",
  cheapoair:        process.env.NEXT_PUBLIC_TP_PROMO_CHEAPOAIR    ?? "",
  airalo:           process.env.NEXT_PUBLIC_TP_PROMO_AIRALO       ?? "",
  yesim:            process.env.NEXT_PUBLIC_TP_PROMO_YESIM        ?? "",
  visitorscoverage: process.env.NEXT_PUBLIC_TP_PROMO_VC           ?? "",
  ekta:             process.env.NEXT_PUBLIC_TP_PROMO_EKTA         ?? "",
  airhelp:          process.env.NEXT_PUBLIC_TP_PROMO_AIRHELP      ?? "",
  raileurope:       process.env.NEXT_PUBLIC_TP_PROMO_RAILEUROPE   ?? "",
} as const;

export type PartnerId = keyof typeof TP_PROMO;

export type PartnerCategory =
  | "flights"
  | "hotels"
  | "car_rental"
  | "activities"
  | "insurance"
  | "esim"
  | "trains"
  | "compensation";

export type PartnerUrlParams = {
  destination?: string;
  origin?: string;
  departure_date?: string | null;
  return_date?: string | null;
  adults?: number;
  locale?: string;
  subid?: string;
};

export type Partner = {
  id: PartnerId;
  category: PartnerCategory;
  name: string;
  nameAr: string;
  tagline_en: string;
  tagline_ar: string;
  icon: string;
  accentColor: string;
  buildUrl: (params: PartnerUrlParams) => string | null;
  commissionRate: number;
  revenueModel: "cpa" | "cpc" | "rev_share";
};

// ── Core Travelpayouts deeplink builder ───────────────────────────────────────
/**
 * Wraps any partner URL in a Travelpayouts tracking redirect.
 * Returns null if promoId is not set (partner not connected in TP dashboard).
 */
export function tpLink(promoId: string, partnerUrl: string, subid?: string): string | null {
  if (!promoId || !promoId.trim()) return null;
  const customUrl = encodeURIComponent(partnerUrl);
  const subidParam = subid ? `&subid=${encodeURIComponent(subid)}` : "";
  return (
    `https://tp.media/click` +
    `?shmarker=${TP_MARKER}` +
    `&promo_id=${promoId}` +
    `&source_type=customtab` +
    `&type=click` +
    subidParam +
    `&custom_url=${customUrl}`
  );
}

/** Build a Booking.com search results URL */
function bookingSearchUrl(destination: string, checkIn?: string | null, checkOut?: string | null, adults = 2): string {
  const u = new URL("https://www.booking.com/searchresults.html");
  u.searchParams.set("ss", destination);
  u.searchParams.set("group_adults", String(adults));
  u.searchParams.set("no_rooms", "1");
  if (checkIn)  u.searchParams.set("checkin",  checkIn);
  if (checkOut) u.searchParams.set("checkout", checkOut);
  return u.toString();
}

// ── Partner Definitions ────────────────────────────────────────────────────────
export const PARTNERS: Record<PartnerId, Partner> = {

  // ─────────────────────────────────────────────────────────────── HOTELS ──

  booking: {
    id: "booking",
    category: "hotels",
    name: "Booking.com",
    nameAr: "Booking.com",
    tagline_en: "World's largest hotel platform — best price guarantee",
    tagline_ar: "أكبر منصة فنادق في العالم — ضمان أفضل سعر",
    icon: "🏨",
    accentColor: "blue",
    commissionRate: 0.04,
    revenueModel: "cpa",
    buildUrl: ({ destination, departure_date, return_date, adults, subid }) => {
      if (!destination) return null;
      const partnerUrl = bookingSearchUrl(destination, departure_date, return_date, adults ?? 2);
      return tpLink(TP_PROMO.booking, partnerUrl, subid);
    },
  },

  tripcom: {
    id: "tripcom",
    category: "hotels",
    name: "Trip.com",
    nameAr: "Trip.com",
    tagline_en: "Hotels, flights & packages — great deals for Asia & Middle East",
    tagline_ar: "فنادق ورحلات وحزم مميزة — عروض رائعة لآسيا والشرق الأوسط",
    icon: "🌏",
    accentColor: "teal",
    commissionRate: 0.04,
    revenueModel: "cpa",
    buildUrl: ({ destination, departure_date, return_date, adults, subid }) => {
      if (!destination) return null;
      const u = new URL("https://www.trip.com/hotels/list");
      u.searchParams.set("city", destination);
      if (departure_date) u.searchParams.set("checkin", departure_date);
      if (return_date)    u.searchParams.set("checkout", return_date);
      if (adults)         u.searchParams.set("adult", String(adults));
      return tpLink(TP_PROMO.tripcom, u.toString(), subid);
    },
  },

  // ──────────────────────────────────────────────────────────── CAR RENTAL ──

  discovercars: {
    id: "discovercars",
    category: "car_rental",
    name: "DiscoverCars",
    nameAr: "DiscoverCars",
    tagline_en: "Compare 900+ car rental companies worldwide",
    tagline_ar: "قارن أكثر من ٩٠٠ شركة تأجير سيارات حول العالم",
    icon: "🚗",
    accentColor: "sky",
    commissionRate: 0.07,
    revenueModel: "cpa",
    buildUrl: ({ destination, departure_date, return_date, subid }) => {
      const u = new URL("https://www.discovercars.com/");
      if (destination)    u.searchParams.set("destination", destination);
      if (departure_date) u.searchParams.set("from_date", departure_date);
      if (return_date)    u.searchParams.set("to_date", return_date);
      return tpLink(TP_PROMO.discovercars, u.toString(), subid);
    },
  },

  // ─────────────────────────────────────────────────────────── ACTIVITIES ──

  getyourguide: {
    id: "getyourguide",
    category: "activities",
    name: "GetYourGuide",
    nameAr: "GetYourGuide",
    tagline_en: "Verified tours & experiences — 50,000+ activities",
    tagline_ar: "جولات وتجارب موثّقة — أكثر من ٥٠,٠٠٠ نشاط",
    icon: "🎟️",
    accentColor: "emerald",
    commissionRate: 0.08,
    revenueModel: "cpa",
    buildUrl: ({ destination, subid }) => {
      const u = new URL("https://www.getyourguide.com/s/");
      if (destination) u.searchParams.set("q", destination);
      return tpLink(TP_PROMO.getyourguide, u.toString(), subid);
    },
  },

  klook: {
    id: "klook",
    category: "activities",
    name: "Klook",
    nameAr: "Klook",
    tagline_en: "Activities, day trips & experiences across Asia",
    tagline_ar: "أنشطة ورحلات يومية وتجارب في آسيا والعالم",
    icon: "🎡",
    accentColor: "rose",
    commissionRate: 0.06,
    revenueModel: "cpa",
    buildUrl: ({ destination, subid }) => {
      const u = new URL("https://www.klook.com/search/");
      if (destination) u.searchParams.set("query", destination);
      return tpLink(TP_PROMO.klook, u.toString(), subid);
    },
  },

  kkday: {
    id: "kkday",
    category: "activities",
    name: "KKday",
    nameAr: "KKday",
    tagline_en: "Local culture tours & unique experiences",
    tagline_ar: "جولات ثقافية محلية وتجارب فريدة",
    icon: "🏮",
    accentColor: "orange",
    commissionRate: 0.06,
    revenueModel: "cpa",
    buildUrl: ({ destination, subid }) => {
      const u = new URL("https://www.kkday.com/en-us/search");
      if (destination) u.searchParams.set("keyword", destination);
      return tpLink(TP_PROMO.kkday, u.toString(), subid);
    },
  },

  gocity: {
    id: "gocity",
    category: "activities",
    name: "Go City",
    nameAr: "Go City",
    tagline_en: "All-in-one attraction passes — save up to 40%",
    tagline_ar: "بطاقات المعالم الشاملة — وفّر حتى ٤٠٪",
    icon: "🏙️",
    accentColor: "violet",
    commissionRate: 0.08,
    revenueModel: "cpa",
    buildUrl: ({ destination, subid }) => {
      const slug = destination?.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z-]/g, "") ?? "";
      const base = slug ? `https://gocity.com/${slug}` : "https://gocity.com/";
      return tpLink(TP_PROMO.gocity, base, subid);
    },
  },

  // ──────────────────────────────────────────────────────── CHEAP FLIGHTS ──

  kiwi: {
    id: "kiwi",
    category: "flights",
    name: "Kiwi.com",
    nameAr: "Kiwi.com",
    tagline_en: "Find hidden-gem cheap flights & unique multi-city routes",
    tagline_ar: "رحلات رخيصة ومسارات متعددة المدن حول العالم",
    icon: "🥝",
    accentColor: "teal",
    commissionRate: 0.04,
    revenueModel: "cpa",
    buildUrl: ({ origin, destination, departure_date, return_date, adults, subid }) => {
      const u = new URL("https://www.kiwi.com/deep");
      if (origin)         u.searchParams.set("from", origin);
      if (destination)    u.searchParams.set("to", destination);
      if (departure_date) u.searchParams.set("departure", departure_date);
      if (return_date)    u.searchParams.set("return", return_date);
      if (adults)         u.searchParams.set("adults", String(adults));
      return tpLink(TP_PROMO.kiwi, u.toString(), subid);
    },
  },

  cheapoair: {
    id: "cheapoair",
    category: "flights",
    name: "CheapOair",
    nameAr: "CheapOair",
    tagline_en: "Discount airfares & last-minute flight deals",
    tagline_ar: "تذاكر طيران مخفّضة وعروض اللحظة الأخيرة",
    icon: "✈️",
    accentColor: "blue",
    commissionRate: 0.03,
    revenueModel: "cpc",
    buildUrl: ({ origin, destination, departure_date, return_date, adults, subid }) => {
      const u = new URL("https://www.cheapoair.com/flights/cheap-flights");
      if (origin)         u.searchParams.set("from", origin);
      if (destination)    u.searchParams.set("to", destination);
      if (departure_date) u.searchParams.set("departure", departure_date);
      if (return_date)    u.searchParams.set("return", return_date);
      if (adults)         u.searchParams.set("adults", String(adults));
      return tpLink(TP_PROMO.cheapoair, u.toString(), subid);
    },
  },

  // ──────────────────────────────────────────────────────────────── eSIM ──

  airalo: {
    id: "airalo",
    category: "esim",
    name: "Airalo",
    nameAr: "Airalo",
    tagline_en: "eSIM for 200+ countries — stay connected from $5",
    tagline_ar: "شريحة إلكترونية في أكثر من ٢٠٠ دولة — ابتداءً من ٥ دولارات",
    icon: "📡",
    accentColor: "indigo",
    commissionRate: 0.10,
    revenueModel: "cpa",
    buildUrl: ({ destination, subid }) => {
      const u = new URL("https://www.airalo.com/");
      if (destination) u.searchParams.set("destination", destination);
      return tpLink(TP_PROMO.airalo, u.toString(), subid);
    },
  },

  yesim: {
    id: "yesim",
    category: "esim",
    name: "Yesim",
    nameAr: "Yesim",
    tagline_en: "Global eSIM with free VPN — no roaming charges",
    tagline_ar: "شريحة إلكترونية عالمية مع VPN مجاني — لا رسوم تجوال",
    icon: "🌐",
    accentColor: "cyan",
    commissionRate: 0.15,
    revenueModel: "cpa",
    buildUrl: ({ subid }) =>
      tpLink(TP_PROMO.yesim, "https://yesim.app/", subid),
  },

  // ──────────────────────────────────────────────────── TRAVEL INSURANCE ──

  visitorscoverage: {
    id: "visitorscoverage",
    category: "insurance",
    name: "VisitorsCoverage",
    nameAr: "VisitorsCoverage",
    tagline_en: "Travel insurance for international trips — from $1/day",
    tagline_ar: "تأمين سفر دولي — ابتداءً من دولار واحد في اليوم",
    icon: "🛡️",
    accentColor: "blue",
    commissionRate: 0.12,
    revenueModel: "cpa",
    buildUrl: ({ subid }) =>
      tpLink(TP_PROMO.visitorscoverage, "https://www.visitorscoverage.com/", subid),
  },

  ekta: {
    id: "ekta",
    category: "insurance",
    name: "EKTA",
    nameAr: "EKTA",
    tagline_en: "Flexible travel insurance — instant policy, worldwide cover",
    tagline_ar: "تأمين سفر مرن — وثيقة فورية وتغطية عالمية",
    icon: "🔒",
    accentColor: "purple",
    commissionRate: 0.12,
    revenueModel: "cpa",
    buildUrl: ({ subid }) =>
      tpLink(TP_PROMO.ekta, "https://ekta.insurance/", subid),
  },

  // ───────────────────────────────────────────────── FLIGHT COMPENSATION ──

  airhelp: {
    id: "airhelp",
    category: "compensation",
    name: "AirHelp",
    nameAr: "AirHelp",
    tagline_en: "Claim up to €600 compensation for delayed/cancelled flights",
    tagline_ar: "استرجع حتى ٦٠٠ يورو تعويضاً عن تأخير رحلتك أو إلغائها",
    icon: "⚖️",
    accentColor: "amber",
    commissionRate: 0.25,
    revenueModel: "cpa",
    buildUrl: ({ subid }) =>
      tpLink(TP_PROMO.airhelp, "https://www.airhelp.com/en/check-your-flight/", subid),
  },

  // ────────────────────────────────────────────────────────────── TRAINS ──

  raileurope: {
    id: "raileurope",
    category: "trains",
    name: "Rail Europe",
    nameAr: "Rail Europe",
    tagline_en: "Europe train passes & point-to-point tickets",
    tagline_ar: "تذاكر القطارات الأوروبية وبطاقات السفر",
    icon: "🚄",
    accentColor: "red",
    commissionRate: 0.05,
    revenueModel: "cpa",
    buildUrl: ({ origin, destination, departure_date, subid }) => {
      const u = new URL("https://www.raileurope.com/en/search-results/");
      if (origin)         u.searchParams.set("origin", origin);
      if (destination)    u.searchParams.set("destination", destination);
      if (departure_date) u.searchParams.set("departureDate", departure_date);
      return tpLink(TP_PROMO.raileurope, u.toString(), subid);
    },
  },
};

// ── Convenience exports ────────────────────────────────────────────────────────

export const ALL_PARTNER_IDS = Object.keys(PARTNERS) as PartnerId[];

/** Build a Travelpayouts-tracked URL for a partner — null if promo_id not set */
export function buildPartnerUrl(id: PartnerId, params: PartnerUrlParams): string | null {
  return PARTNERS[id]?.buildUrl(params) ?? null;
}

/** Returns true if the partner has a configured TP promo_id */
export function isPartnerConfigured(id: PartnerId): boolean {
  return buildPartnerUrl(id, {}) !== null;
}

/** Returns all partners with a configured TP promo_id */
export function getConfiguredPartners(): Partner[] {
  return ALL_PARTNER_IDS
    .map((id) => PARTNERS[id])
    .filter((p) => isPartnerConfigured(p.id));
}

/**
 * Build the best hotel booking URL for a destination.
 * Always goes through Travelpayouts (promo_id=4338 for Booking.com).
 * Falls back to Trip.com (promo_id=4064), then Hotellook (plain TP marker).
 */
export function buildHotelUrl(params: PartnerUrlParams & { fallbackHotellookUrl?: string }): string {
  const bookingUrl = buildPartnerUrl("booking", params);
  if (bookingUrl) return bookingUrl;
  const tripUrl = buildPartnerUrl("tripcom", params);
  if (tripUrl) return tripUrl;
  // Hard fallback: Hotellook via TP marker (always tracked)
  return params.fallbackHotellookUrl
    ?? `https://tp.media/click?shmarker=${TP_MARKER}&promo_id=4299&source_type=customtab&type=click&custom_url=${encodeURIComponent(`https://www.hotellook.com/search?destination=${encodeURIComponent(params.destination ?? "")}&lang=en`)}`;
}

/**
 * Aviasales deep-link — always tracked via TP marker.
 * (Aviasales IS Travelpayouts; ?marker= is the standard attribution method.)
 */
export function buildAviasalesUrl(params: {
  origin?: string | null;
  destination?: string | null;
  departure_date?: string | null;
  return_date?: string | null;
  locale?: string;
  subid?: string;
}): string {
  const u = new URL("https://www.aviasales.com/");
  u.searchParams.set("marker", TP_MARKER);
  if (params.locale) u.searchParams.set("locale", params.locale === "ar" ? "ar" : "en");
  if (params.origin)        u.searchParams.set("origin",      params.origin);
  if (params.destination)   u.searchParams.set("destination", params.destination);
  if (params.departure_date) u.searchParams.set("departure_date", params.departure_date);
  if (params.return_date)   u.searchParams.set("return_date",   params.return_date);
  if (params.subid)         u.searchParams.set("subid",         params.subid);
  return u.toString();
}

// ── Category config ────────────────────────────────────────────────────────────

export const CATEGORY_META: Record<PartnerCategory, { label_en: string; label_ar: string; icon: string }> = {
  flights:      { label_en: "Cheap Flights",       label_ar: "طيران رخيص",        icon: "✈️" },
  hotels:       { label_en: "Hotels",              label_ar: "فنادق",             icon: "🏨" },
  car_rental:   { label_en: "Car Rental",          label_ar: "تأجير سيارات",      icon: "🚗" },
  activities:   { label_en: "Activities & Tours",  label_ar: "أنشطة وجولات",      icon: "🎟️" },
  insurance:    { label_en: "Travel Insurance",    label_ar: "تأمين السفر",        icon: "🛡️" },
  esim:         { label_en: "eSIM / Data",         label_ar: "شريحة إلكترونية",   icon: "📡" },
  trains:       { label_en: "Train Tickets",       label_ar: "تذاكر القطارات",    icon: "🚄" },
  compensation: { label_en: "Flight Compensation", label_ar: "تعويض الرحلات",     icon: "⚖️" },
};
