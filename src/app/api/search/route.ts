import { NextRequest, NextResponse } from "next/server";
import { searchFlights, searchHotels } from "@/lib/travelpayouts";
import { TripIntentSchema } from "@/lib/ai/schemas/intent";
import type { Currency } from "@/lib/utils";
import { resolveIata, iataToCity } from "@/lib/iata";
import { buildHotelUrl, buildAviasalesUrl } from "@/lib/partners";
import { rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { captureError } from "@/lib/observability/sentry";
import { z } from "zod";

const MARKER = process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER ?? "522867";

const SearchRequestSchema = z.object({
  intent: TripIntentSchema,
  currency: z.enum(["SAR", "USD"]).optional(),
  source: z.enum(["chat", "trip_page", "whitelabel"]).optional(),
});

export const runtime = "nodejs";

function inferOriginFromCurrency(currency: string): string {
  if (currency === "SAR") return "RUH";
  if (currency === "AED") return "DXB";
  if (currency === "KWD") return "KWI";
  if (currency === "QAR") return "DOH";
  if (currency === "BHD") return "BAH";
  if (currency === "OMR") return "MCT";
  if (currency === "EGP") return "CAI";
  return "DXB";
}

function normCurrency(input: string | undefined): Currency {
  return input === "SAR" ? "SAR" : "USD";
}

export async function POST(req: NextRequest) {
  // B1: Production rate limit
  const rl = await rateLimit(req, "search", {
    limit: 30,
    windowSec: 60,
    burstLimit: 8,
    burstWindowSec: 10,
    failOpen: false,
  });
  if (!rl.allowed) {
    return rateLimitResponse(rl);
  }

  try {
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    const parsed = SearchRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ error: "destination_required" }, { status: 400 });
    }
    const { intent, currency: rawCurrency, source } = parsed.data;
    // M5: clamp adults
    if (typeof intent.adults === "number") {
      intent.adults = Math.min(9, Math.max(1, Math.round(intent.adults)));
    } else {
      intent.adults = 2;
    }
    const currency = normCurrency(rawCurrency);
    const subid =
      source === "trip_page"
        ? "trip_page"
        : source === "whitelabel"
          ? "whitelabel"
          : "ai_chat";

    const destination = resolveIata(intent.destination ?? "") ?? (intent.destination ?? "");
    const rawOrigin = resolveIata(intent.origin);
    const rawCurrencyStr = (rawCurrency ?? "USD") as string;
    const origin = rawOrigin ?? inferOriginFromCurrency(rawCurrencyStr);
    const hotelCity = iataToCity(destination);

    const [flightsRes, hotelsRes] = await Promise.allSettled([
      searchFlights({
        origin,
        destination,
        departure_date: intent.departure_date,
        return_date: intent.return_date,
        currency: currency.toLowerCase(),
        subid,
        cabin_class: intent.cabin_class, // B4: thread cabin_class through
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

    // M11 + B4: use buildAviasalesUrl which preserves cabin_class, return_date, adults.
    const flightSearchUrl = origin
      ? buildAviasalesUrl({
          origin,
          destination,
          departure_date: intent.departure_date,
          return_date: intent.return_date,
          adults: intent.adults,
          cabin_class: intent.cabin_class,
          subid,
        })
      : `https://www.aviasales.com/?marker=${MARKER}&subid=${subid}&destination=${destination}`;

    const hotelSearchUrl = buildHotelUrl({
      destination: hotelCity,
      departure_date: intent.departure_date,
      return_date: intent.return_date,
      adults: intent.adults,
      subid,
      fallbackHotellookUrl: `https://www.hotellook.com/search?destination=${encodeURIComponent(hotelCity)}&lang=en&marker=${MARKER}&subid=${subid}`,
    });

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
    void captureError(err, { route: "search" });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
