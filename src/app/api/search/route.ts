import { NextRequest, NextResponse } from "next/server";
import { searchFlights, searchHotels } from "@/lib/travelpayouts";
import type { TripIntent } from "@/lib/gemini";
import type { Currency } from "@/lib/utils";
import { resolveIata, iataToCity } from "@/lib/iata";

export const runtime = "nodejs";

function normCurrency(input: unknown): Currency {
  return input === "SAR" ? "SAR" : "USD";
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      intent: TripIntent;
      currency?: string;
      source?: string;   // "chat" | "trip_page" | "whitelabel"
    };
    const intent = body.intent;
    const currency = normCurrency(body.currency);
    // Map source to affiliate subid for revenue tracking
    const subid = body.source === "trip_page" ? "trip_page"
      : body.source === "whitelabel" ? "whitelabel"
      : "ai_chat";
    if (!intent?.destination) {
      return NextResponse.json({ error: "destination_required" }, { status: 400 });
    }

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
    const flightSearchUrl = `https://www.aviasales.com/?marker=522867&subid=${subid}&origin=${origin}&destination=${destination}`;
    const hotelSearchUrl = `https://www.hotellook.com/search?destination=${encodeURIComponent(hotelCity)}&lang=en&marker=522867&subid=${subid}`;

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
