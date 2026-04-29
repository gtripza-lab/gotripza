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
    const origin = resolveIata(intent.origin) ?? "JED";
    const destination = resolveIata(intent.destination) ?? intent.destination;
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

    // Build fallback search URLs — direct Travelpayouts partner links
    const flightSearchUrl = `https://www.aviasales.com/?marker=${MARKER}&subid=${subid}&origin=${origin}&destination=${destination}`;
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
