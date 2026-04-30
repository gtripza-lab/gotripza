import { NextRequest, NextResponse } from "next/server";
import { searchFlights, searchHotels } from "@/lib/travelpayouts";
import { TripIntentSchema } from "@/lib/gemini";
import type { Currency } from "@/lib/utils";
import { resolveIata, iataToCity } from "@/lib/iata";
import { z } from "zod";

const MARKER = process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER ?? "522867";

const SearchRequestSchema = z.object({
  intent: TripIntentSchema,
  currency: z.enum(["SAR", "USD"]).optional(),
  source: z.enum(["chat", "trip_page", "whitelabel"]).optional(),
});

// Rate limiting: 20 searches/min per IP
const _searchCounters = new Map<string, { count: number; resetAt: number }>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const rec = _searchCounters.get(ip);
  if (!rec || now > rec.resetAt) {
    _searchCounters.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  rec.count++;
  return rec.count > 20;
}

export const runtime = "nodejs";

/**
 * Infer the most likely departure airport from the user's currency.
 * This is used only when the user doesn't specify an origin city.
 * Gives Arabic-speaking users real flight results out of the box.
 */
function inferOriginFromCurrency(currency: string): string {
  if (currency === "SAR") return "RUH"; // Saudi Riyal → Riyadh
  if (currency === "AED") return "DXB"; // Dirham     → Dubai
  if (currency === "KWD") return "KWI"; // Kuwaiti D  → Kuwait City
  if (currency === "QAR") return "DOH"; // Qatari R   → Doha
  if (currency === "BHD") return "BAH"; // Bahraini D → Manama
  if (currency === "OMR") return "MCT"; // Omani R    → Muscat
  if (currency === "EGP") return "CAI"; // Egyptian P → Cairo
  // Default — Dubai is the best-connected Middle-East hub for English users
  return "DXB";
}

function normCurrency(input: string | undefined): Currency {
  return input === "SAR" ? "SAR" : "USD";
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": "60" } });
  }

  try {
    let rawBody: unknown;
    try { rawBody = await req.json(); } catch {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    const parsed = SearchRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ error: "destination_required" }, { status: 400 });
    }
    const { intent, currency: rawCurrency, source } = parsed.data;
    const currency = normCurrency(rawCurrency);
    const subid = source === "trip_page" ? "trip_page"
      : source === "whitelabel" ? "whitelabel"
      : "ai_chat";

    // Resolve Arabic/English city names → IATA codes (for flights)
    const destination = resolveIata(intent.destination) ?? intent.destination;

    // Smart origin fallback — when user doesn't specify a departure city,
    // infer from currency so Arabic-speaking users get relevant results.
    // Without origin the flights API returns nothing.
    const rawOrigin = resolveIata(intent.origin);
    // Pass the raw currency string (not the normalised Currency type) so the
    // multi-currency inference (AED, KWD, etc.) works correctly.
    const rawCurrencyStr = (rawCurrency ?? "USD") as string;
    const origin = rawOrigin ?? inferOriginFromCurrency(rawCurrencyStr);
    // Hotellook API needs readable English city name, NOT IATA code
    const hotelCity = iataToCity(destination);

    const [flightsRes, hotelsRes] = await Promise.allSettled([
      searchFlights({
        origin,
        destination,
        departure_date: intent.departure_date,
        return_date: intent.return_date,
        currency: currency.toLowerCase(),
        subid,
      }),
      searchHotels({
        location: hotelCity,
        checkIn: intent.departure_date,
        checkOut: intent.return_date,
        adults: intent.adults,
        currency: currency.toLowerCase(),
        subid,
      }),
    ]);

    const flights = flightsRes.status === "fulfilled" ? flightsRes.value : [];
    const hotels = hotelsRes.status === "fulfilled" ? hotelsRes.value : [];

    // Build Aviasales deep-link search URLs.
    // Format: /search/{ORIGIN}{DAYS_OUT}{DEST}1  → pre-fills the form
    // e.g.  /search/RUH1001DPS1 = Riyadh → Bali, depart in 100 days, 1 adult
    const daysOut = intent.departure_date
      ? Math.max(1, Math.round((new Date(intent.departure_date).getTime() - Date.now()) / 86_400_000))
      : 30;

    const flightSearchUrl = origin
      ? `https://www.aviasales.com/search/${origin}${daysOut}${destination}${intent.adults ?? 1}?marker=${MARKER}&subid=${subid}`
      : `https://www.aviasales.com/?marker=${MARKER}&subid=${subid}&destination=${destination}`;

    const hotelSearchUrl = `https://www.hotellook.com/search?destination=${encodeURIComponent(hotelCity)}&lang=en&marker=${MARKER}&subid=${subid}`;

    return NextResponse.json({
      flights,
      hotels,
      mock: false,
      currency,
      flightSearchUrl,
      hotelSearchUrl,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "search_failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
