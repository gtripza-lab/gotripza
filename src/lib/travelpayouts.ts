import "server-only";

const MARKER = process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER ?? "522867";
const TOKEN  = process.env.TRAVELPAYOUTS_TOKEN ?? "";

// ── Startup check ────────────────────────────────────────────────────────────
// If TOKEN is missing, all cached-price API calls will return empty.
// Action: add TRAVELPAYOUTS_TOKEN=<your-token> in Vercel → Settings → Env Vars
if (!TOKEN && process.env.NODE_ENV !== "test") {
  console.warn(
    "[GoTripza] TRAVELPAYOUTS_TOKEN is not set. " +
    "Flight and hotel price APIs will return empty results. " +
    "Set this variable in your Vercel environment settings.",
  );
}

export type FlightOffer = {
  origin: string;
  destination: string;
  departure_at: string;
  return_at?: string;
  price: number;
  airline: string;
  flight_number: string;
  duration?: number;
  link: string;
};

export type HotelOffer = {
  hotelId: number;
  hotelName: string;
  stars?: number;
  priceFrom: number;
  location: { name: string; country: string };
  link: string;
};

const BASE = "https://api.travelpayouts.com";

/** Always inject the affiliate marker — never let it be lost. */
function forceSetMarker(url: URL, subid?: string): URL {
  url.searchParams.set("marker", MARKER);
  if (subid) url.searchParams.set("subid", subid);
  return url;
}

function affiliateLink(path: string, subid?: string) {
  const url = new URL(path, "https://www.aviasales.com");
  return forceSetMarker(url, subid).toString();
}

async function fetchFlightPage(
  origin: string,
  destination: string,
  departureAt: string | null,
  returnAt: string | null,
  currency: string,
  subid?: string,
): Promise<FlightOffer[]> {
  const u = new URL(`${BASE}/aviasales/v3/prices_for_dates`);
  u.searchParams.set("origin", origin);
  u.searchParams.set("destination", destination);
  // Only pass dates when they are within the next 9 months (cached API has limited range)
  if (departureAt) {
    const daysOut = (new Date(departureAt).getTime() - Date.now()) / 86400_000;
    if (daysOut >= 0 && daysOut <= 270) u.searchParams.set("departure_at", departureAt);
  }
  if (returnAt) {
    const daysOut = (new Date(returnAt).getTime() - Date.now()) / 86400_000;
    if (daysOut >= 0 && daysOut <= 270) u.searchParams.set("return_at", returnAt);
  }
  u.searchParams.set("currency", currency);
  u.searchParams.set("sorting", "price");
  u.searchParams.set("limit", "10");
  u.searchParams.set("token", TOKEN);

  const res = await fetch(u.toString(), {
    next: { revalidate: 300 },
    headers: { "Accept": "application/json" },
  });
  if (!res.ok) {
    console.warn(`[GoTripza] Flights API error ${res.status} for ${origin}→${destination}`);
    return [];
  }
  let json: { data?: Array<Record<string, unknown>>; success?: boolean; error?: string };
  try { json = await res.json() as typeof json; } catch { return []; }
  if (json.success === false) {
    console.warn(`[GoTripza] Flights API success=false: ${json.error ?? "unknown"} (TOKEN may be missing)`);
    return [];
  }

  return (json.data ?? []).map((d): FlightOffer => ({
    origin: String(d.origin ?? origin),
    destination: String(d.destination ?? destination),
    departure_at: String(d.departure_at ?? ""),
    return_at: d.return_at ? String(d.return_at) : undefined,
    price: Number(d.price ?? 0),
    airline: String(d.airline ?? ""),
    flight_number: String(d.flight_number ?? ""),
    duration: d.duration ? Number(d.duration) : undefined,
    link: affiliateLink(String(d.link ?? "/"), subid),
  }));
}

export async function searchFlights(params: {
  origin?: string | null;
  destination: string;
  departure_date?: string | null;
  return_date?: string | null;
  currency?: string;
  subid?: string;
}): Promise<FlightOffer[]> {
  const currency = params.currency ?? "usd";
  // If no origin specified, skip flight search (can't query without origin)
  if (!params.origin) return [];

  // First attempt: with dates (if provided and in range)
  const results = await fetchFlightPage(
    params.origin,
    params.destination,
    params.departure_date ?? null,
    params.return_date ?? null,
    currency,
    params.subid,
  );
  if (results.length > 0) return results;

  // Second attempt: without specific dates (broader cache hit)
  const fallback = await fetchFlightPage(
    params.origin!,
    params.destination,
    null,
    null,
    currency,
    params.subid,
  );
  return fallback;
}

async function fetchHotelPage(
  location: string,
  checkIn: string | null,
  checkOut: string | null,
  adults: number,
  currency: string,
  subid?: string,
  _checkInOrig?: string | null,
  _checkOutOrig?: string | null,
): Promise<HotelOffer[]> {
  const u = new URL("https://engine.hotellook.com/api/v2/cache.json");
  u.searchParams.set("location", location);
  if (checkIn) {
    const daysOut = (new Date(checkIn).getTime() - Date.now()) / 86400_000;
    if (daysOut >= 0 && daysOut <= 270) u.searchParams.set("checkIn", checkIn);
  }
  if (checkOut) {
    const daysOut = (new Date(checkOut).getTime() - Date.now()) / 86400_000;
    if (daysOut >= 0 && daysOut <= 270) u.searchParams.set("checkOut", checkOut);
  }
  u.searchParams.set("adults", String(adults));
  u.searchParams.set("limit", "10");
  u.searchParams.set("currency", currency);
  u.searchParams.set("token", TOKEN);

  const res = await fetch(u.toString(), {
    next: { revalidate: 300 },
    headers: { "Accept": "application/json" },
  });
  if (!res.ok) {
    console.warn(`[GoTripza] Hotels API error ${res.status} for location="${location}"`);
    return [];
  }
  let json: unknown;
  try { json = await res.json(); } catch { return []; }

  return (Array.isArray(json) ? json as Record<string, unknown>[] : []).map((h): HotelOffer => ({
    hotelId: Number(h.hotelId ?? 0),
    hotelName: String(h.hotelName ?? ""),
    stars: h.stars ? Number(h.stars) : undefined,
    priceFrom: Number(h.priceFrom ?? 0),
    location: {
      name: String((h.location as { name?: string })?.name ?? location),
      country: String((h.location as { country?: string })?.country ?? ""),
    },
    // Route booking clicks to Booking.com (via TP media or direct affiliate)
    link: hotelDeepLink(Number(h.hotelId ?? 0), location, subid, checkIn, checkOut, adults),
  }));
}

export async function searchHotels(params: {
  location: string;
  checkIn?: string | null;
  checkOut?: string | null;
  adults?: number;
  currency?: string;
  subid?: string;
}): Promise<HotelOffer[]> {
  const currency = params.currency ?? "usd";
  const adults = params.adults ?? 1;

  // First attempt: with dates if in range
  const results = await fetchHotelPage(
    params.location,
    params.checkIn ?? null,
    params.checkOut ?? null,
    adults,
    currency,
    params.subid,
  );
  if (results.length > 0) return results;

  // Second attempt: without dates for broader cache coverage
  const fallback = await fetchHotelPage(
    params.location,
    null,
    null,
    adults,
    currency,
    params.subid,
  );
  return fallback;
}

/**
 * Build the hotel booking deep-link.
 *
 * Priority:
 *  1. Booking.com direct (if NEXT_PUBLIC_BOOKING_AID is set)
 *  2. Booking.com via Travelpayouts media (uses TP marker — always tracks)
 *  3. Trip.com via Travelpayouts media (fallback)
 *
 * We pass the hotel's cached price data but route the booking
 * click to Booking.com search (destination-level), which has
 * far higher conversion than Hotellook individual hotel pages.
 */
function hotelDeepLink(
  _hotelId: number,
  location: string,
  subid?: string,
  checkIn?: string | null,
  checkOut?: string | null,
  adults?: number,
): string {
  const bookingAid = process.env.NEXT_PUBLIC_BOOKING_AID ?? "";

  // Option 1: Direct Booking.com affiliate link (higher commission)
  if (bookingAid) {
    const u = new URL("https://www.booking.com/searchresults.html");
    u.searchParams.set("ss", location);
    u.searchParams.set("aid", bookingAid);
    u.searchParams.set("label", `gotripza-${MARKER}`);
    if (checkIn) u.searchParams.set("checkin", checkIn);
    if (checkOut) u.searchParams.set("checkout", checkOut);
    u.searchParams.set("group_adults", String(adults ?? 2));
    u.searchParams.set("no_rooms", "1");
    if (subid) u.searchParams.set("source", subid);
    return u.toString();
  }

  // Option 2: Booking.com via Travelpayouts media link (promo_id=4338)
  const dest = encodeURIComponent(location);
  const checkinParam  = checkIn  ? `&checkin=${checkIn}`   : "";
  const checkoutParam = checkOut ? `&checkout=${checkOut}` : "";
  const adultsParam   = `&group_adults=${adults ?? 2}&no_rooms=1`;
  const customUrl = encodeURIComponent(
    `https://www.booking.com/searchresults.html?ss=${dest}${checkinParam}${checkoutParam}${adultsParam}`
  );
  const subidParam = subid ? `&subid=${encodeURIComponent(subid)}` : "";
  return `https://tp.media/click?shmarker=${MARKER}&promo_id=4338&source_type=customtab&type=click${subidParam}&custom_url=${customUrl}`;
}
