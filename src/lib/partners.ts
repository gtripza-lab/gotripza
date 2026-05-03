/**
 * GoTripza Central Partner Registry
 * ─────────────────────────────────
 * Single source of truth for ALL affiliate partners, URLs, and tracking.
 *
 * TO ACTIVATE A PARTNER:
 *  1. Sign up at their affiliate program (signup URLs listed per partner).
 *  2. Add your affiliate ID to .env.local (and Vercel → Settings → Env Vars).
 *  3. That partner will automatically appear in recommendations UI.
 *
 * Partners with an empty/missing ID are silently hidden — never broken links.
 */

// ── Core Travelpayouts marker ─────────────────────────────────────────────
export const TP_MARKER = process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER ?? "522867";

// ── Per-partner affiliate IDs ─────────────────────────────────────────────
const IDS = {
  // ── Hotels ─────────────────────────────────────────────────────────────
  // Booking.com: https://partnerhelp.booking.com (get your AID there)
  // Fallback: TP media link keeps commission via Travelpayouts marker
  booking:          process.env.NEXT_PUBLIC_BOOKING_AID             ?? "",
  // Trip.com:  https://www.trip.com/affiliate (get your AID)
  tripcom:          process.env.NEXT_PUBLIC_TRIPCOM_AID             ?? "",

  // ── Car Rental ─────────────────────────────────────────────────────────
  // DiscoverCars: https://www.discovercars.com/affiliate (uses same TP marker by default)
  discovercars:     process.env.NEXT_PUBLIC_DISCOVERCARS_AID        ?? TP_MARKER,

  // ── Activities ─────────────────────────────────────────────────────────
  // GetYourGuide: https://partner.getyourguide.com
  getyourguide:     process.env.NEXT_PUBLIC_GYG_PARTNER_ID          ?? TP_MARKER,
  // Klook:       https://affiliate.klook.com
  klook:            process.env.NEXT_PUBLIC_KLOOK_AID               ?? "",
  // KKday:       https://affiliate.kkday.com
  kkday:            process.env.NEXT_PUBLIC_KKDAY_CID               ?? "",
  // Go City:     https://gocity.com/affiliates
  gocity:           process.env.NEXT_PUBLIC_GOCITY_AID              ?? "",

  // ── Cheap Flights ───────────────────────────────────────────────────────
  // Kiwi.com:   https://www.kiwi.com/us/pages/affiliates
  kiwi:             process.env.NEXT_PUBLIC_KIWI_AFFILID            ?? "",
  // CheapOair:  https://www.cheapoair.com/affiliate
  cheapoair:        process.env.NEXT_PUBLIC_CHEAPOAIR_AFFID         ?? "",

  // ── eSIM ────────────────────────────────────────────────────────────────
  // Airalo:      https://www.airalo.com/affiliate
  airalo:           process.env.NEXT_PUBLIC_AIRALO_PARTNER          ?? "",
  // Yesim:       https://yesim.app/affiliate
  yesim:            process.env.NEXT_PUBLIC_YESIM_REF               ?? "",

  // ── Travel Insurance ────────────────────────────────────────────────────
  // VisitorsCoverage: https://www.visitorscoverage.com/affiliates
  visitorscoverage: process.env.NEXT_PUBLIC_VC_AGENT                ?? "",
  // EKTA:        https://ekta.insurance/partners
  ekta:             process.env.NEXT_PUBLIC_EKTA_REF                ?? "",

  // ── Flight Compensation ─────────────────────────────────────────────────
  // AirHelp:    https://www.airhelp.com/en/affiliate-program
  airhelp:          process.env.NEXT_PUBLIC_AIRHELP_PARTNER         ?? "",

  // ── Trains ──────────────────────────────────────────────────────────────
  // Rail Europe: https://www.raileurope.com/en/affiliate
  raileurope:       process.env.NEXT_PUBLIC_RAILEUROPE_AID          ?? "",
} as const;

export type PartnerId = keyof typeof IDS;

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

// ── Helper ─────────────────────────────────────────────────────────────────
function ok(id: string): string | null {
  return id && id.trim().length > 0 ? id : null;
}

// Booking.com via Travelpayouts media (always works with TP marker)
function bookingViaTP(destination: string, checkIn?: string | null, checkOut?: string | null, adults = 2): string {
  const dest = encodeURIComponent(destination);
  const checkin = checkIn ? `&checkin=${checkIn}` : "";
  const checkout = checkOut ? `&checkout=${checkOut}` : "";
  const custom = encodeURIComponent(
    `https://www.booking.com/searchresults.html?ss=${dest}&group_adults=${adults}&no_rooms=1${checkin}${checkout}`
  );
  return `https://tp.media/click?shmarker=${TP_MARKER}&promo_id=4338&source_type=customtab&type=click&custom_url=${custom}`;
}

// Trip.com via Travelpayouts media
function tripcomViaTP(destination: string): string {
  const custom = encodeURIComponent(
    `https://www.trip.com/hotels/list?city=${encodeURIComponent(destination)}`
  );
  return `https://tp.media/click?shmarker=${TP_MARKER}&promo_id=4064&source_type=customtab&type=click&custom_url=${custom}`;
}

// ── Partner Definitions ────────────────────────────────────────────────────
export const PARTNERS: Record<PartnerId, Partner> = {

  // ────────────────────────────────────────────────────────── HOTELS ─────

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
      // If direct affiliate ID is set → use it (higher commission)
      const directId = ok(IDS.booking);
      if (directId) {
        const u = new URL("https://www.booking.com/searchresults.html");
        u.searchParams.set("ss", destination);
        u.searchParams.set("aid", directId);
        u.searchParams.set("label", `gotripza-${TP_MARKER}`);
        if (departure_date) u.searchParams.set("checkin", departure_date);
        if (return_date) u.searchParams.set("checkout", return_date);
        u.searchParams.set("group_adults", String(adults ?? 2));
        u.searchParams.set("no_rooms", "1");
        if (subid) u.searchParams.set("aid2", subid);
        return u.toString();
      }
      // Fallback: Travelpayouts media link (always tracks via TP marker)
      return bookingViaTP(destination, departure_date, return_date, adults);
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
      const directId = ok(IDS.tripcom);
      if (directId) {
        const u = new URL("https://www.trip.com/hotels/list");
        u.searchParams.set("city", destination);
        u.searchParams.set("aid", directId);
        if (departure_date) u.searchParams.set("checkin", departure_date);
        if (return_date) u.searchParams.set("checkout", return_date);
        if (adults) u.searchParams.set("adult", String(adults));
        if (subid) u.searchParams.set("utm_campaign", subid);
        return u.toString();
      }
      // Fallback: via TP media
      return tripcomViaTP(destination);
    },
  },

  // ───────────────────────────────────────────────────────── CAR RENTAL ──

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
    buildUrl: ({ destination, departure_date, return_date, adults, subid }) => {
      const id = ok(IDS.discovercars);
      if (!id) return null;
      const u = new URL("https://www.discovercars.com/");
      u.searchParams.set("a_aid", id);
      u.searchParams.set("a_bid", "cars");          // campaign — consistent everywhere
      if (destination) u.searchParams.set("destination", destination);
      if (departure_date) u.searchParams.set("from_date", departure_date);
      if (return_date) u.searchParams.set("to_date", return_date);
      if (adults) u.searchParams.set("drivers_age", "30");
      if (subid) u.searchParams.set("a_cid", subid);
      return u.toString();
    },
  },

  // ──────────────────────────────────────────────────────── ACTIVITIES ───

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
      const id = ok(IDS.getyourguide);
      if (!id) return null;
      const u = new URL("https://www.getyourguide.com/s/");
      if (destination) u.searchParams.set("q", destination);
      u.searchParams.set("partner_id", id);
      if (subid) u.searchParams.set("cmp", subid);
      return u.toString();
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
      const id = ok(IDS.klook);
      if (!id) return null;
      const u = new URL("https://www.klook.com/search/");
      if (destination) u.searchParams.set("query", destination);
      u.searchParams.set("aid", id);
      if (subid) u.searchParams.set("spm", subid);
      return u.toString();
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
      const id = ok(IDS.kkday);
      if (!id) return null;
      const u = new URL("https://www.kkday.com/en-us/search");
      if (destination) u.searchParams.set("keyword", destination);
      u.searchParams.set("cid", id);
      if (subid) u.searchParams.set("source", subid);
      return u.toString();
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
      const id = ok(IDS.gocity);
      if (!id) return null;
      const slug = destination?.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z-]/g, "") ?? "";
      const base = slug ? `https://gocity.com/${slug}` : "https://gocity.com/";
      const u = new URL(base);
      u.searchParams.set("aid", id);
      if (subid) u.searchParams.set("cmp", subid);
      return u.toString();
    },
  },

  // ──────────────────────────────────────────────────── CHEAP FLIGHTS ────

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
      const id = ok(IDS.kiwi);
      if (!id) return null;
      const u = new URL("https://www.kiwi.com/deep");
      u.searchParams.set("affilid", id);
      if (origin) u.searchParams.set("from", origin);
      if (destination) u.searchParams.set("to", destination);
      if (departure_date) u.searchParams.set("departure", departure_date);
      if (return_date) u.searchParams.set("return", return_date);
      if (adults) u.searchParams.set("adults", String(adults));
      if (subid) u.searchParams.set("source", subid);
      return u.toString();
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
    buildUrl: ({ destination, origin, departure_date, return_date, adults, subid }) => {
      const id = ok(IDS.cheapoair);
      if (!id) return null;
      const u = new URL("https://www.cheapoair.com/flights/cheap-flights");
      u.searchParams.set("AFFID", id);
      if (origin) u.searchParams.set("from", origin);
      if (destination) u.searchParams.set("to", destination);
      if (departure_date) u.searchParams.set("departure", departure_date);
      if (return_date) u.searchParams.set("return", return_date);
      if (adults) u.searchParams.set("adults", String(adults));
      if (subid) u.searchParams.set("SubID", subid);
      return u.toString();
    },
  },

  // ──────────────────────────────────────────────────────────── eSIM ─────

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
      const id = ok(IDS.airalo);
      if (!id) return null;
      const u = new URL("https://www.airalo.com/");
      u.searchParams.set("partner", id);
      if (destination) u.searchParams.set("destination", destination);
      if (subid) u.searchParams.set("utm_campaign", subid);
      return u.toString();
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
    buildUrl: ({ subid }) => {
      const id = ok(IDS.yesim);
      if (!id) return null;
      const u = new URL("https://yesim.app/");
      u.searchParams.set("ref", id);
      if (subid) u.searchParams.set("campaign", subid);
      return u.toString();
    },
  },

  // ───────────────────────────────────────────────── TRAVEL INSURANCE ────

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
    buildUrl: ({ subid }) => {
      const id = ok(IDS.visitorscoverage);
      if (!id) return null;
      const u = new URL("https://www.visitorscoverage.com/");
      u.searchParams.set("agent_code", id);
      if (subid) u.searchParams.set("utm_campaign", subid);
      return u.toString();
    },
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
    buildUrl: ({ subid }) => {
      const id = ok(IDS.ekta);
      if (!id) return null;
      const u = new URL("https://ekta.insurance/");
      u.searchParams.set("ref", id);
      if (subid) u.searchParams.set("campaign", subid);
      return u.toString();
    },
  },

  // ─────────────────────────────────────────────── FLIGHT COMPENSATION ───

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
    buildUrl: ({ subid }) => {
      const id = ok(IDS.airhelp);
      if (!id) return null;
      const u = new URL("https://www.airhelp.com/en/check-your-flight/");
      u.searchParams.set("partner", id);
      if (subid) u.searchParams.set("utm_campaign", subid);
      return u.toString();
    },
  },

  // ────────────────────────────────────────────────────────── TRAINS ─────

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
      const id = ok(IDS.raileurope);
      if (!id) return null;
      const u = new URL("https://www.raileurope.com/en/search-results/");
      if (origin) u.searchParams.set("origin", origin);
      if (destination) u.searchParams.set("destination", destination);
      if (departure_date) u.searchParams.set("departureDate", departure_date);
      u.searchParams.set("a_aid", id);
      if (subid) u.searchParams.set("a_bid", subid);
      return u.toString();
    },
  },
};

// ── Convenience exports ────────────────────────────────────────────────────

export const ALL_PARTNER_IDS = Object.keys(PARTNERS) as PartnerId[];

/** Build a URL — returns null if partner not configured */
export function buildPartnerUrl(id: PartnerId, params: PartnerUrlParams): string | null {
  return PARTNERS[id]?.buildUrl(params) ?? null;
}

/** Returns true if the partner has a configured affiliate ID */
export function isPartnerConfigured(id: PartnerId): boolean {
  return buildPartnerUrl(id, {}) !== null;
}

/** Returns all configured partners */
export function getConfiguredPartners(): Partner[] {
  return ALL_PARTNER_IDS
    .map((id) => PARTNERS[id])
    .filter((p) => isPartnerConfigured(p.id));
}

/** Build the best hotel booking URL for a destination.
 *  Priority: Booking.com direct → Trip.com → Hotellook fallback */
export function buildHotelUrl(params: PartnerUrlParams & { fallbackHotellookUrl?: string }): string {
  const bookingUrl = buildPartnerUrl("booking", params);
  if (bookingUrl) return bookingUrl;
  const tripUrl = buildPartnerUrl("tripcom", params);
  if (tripUrl) return tripUrl;
  // Final fallback: Hotellook (always works via TP marker)
  return params.fallbackHotellookUrl
    ?? `https://www.hotellook.com/search?destination=${encodeURIComponent(params.destination ?? "")}&lang=en&marker=${TP_MARKER}`;
}

// ── Category config (re-export for convenience) ───────────────────────────

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
