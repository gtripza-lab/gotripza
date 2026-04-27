import { NextRequest, NextResponse } from "next/server";
import { searchFlights, searchHotels } from "@/lib/travelpayouts";
import { mockFlights, mockHotels } from "@/lib/mock-offers";
import type { TripIntent } from "@/lib/gemini";
import type { Currency } from "@/lib/utils";
import { resolveIata } from "@/lib/iata";

export const runtime = "nodejs";

function normCurrency(input: unknown): Currency {
  return input === "SAR" ? "SAR" : "USD";
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      intent: TripIntent;
      currency?: string;
    };
    const intent = body.intent;
    const currency = normCurrency(body.currency);
    if (!intent?.destination) {
      return NextResponse.json({ error: "destination_required" }, { status: 400 });
    }

    // Resolve Arabic/English city names â IATA codes
    const origin = resolveIata(intent.origin);
    const destination = resolveIata(intent.destination) ?? intent.destination;

    const [flightsRes, hotelsRes] = await Promise.allSettled([
      origin
        ? searchFlights({
            origin,
            destination,
            departure_date: intent.departure_date,
            return_date: intent.return_date,
            currency: currency.toLowerCase(),
          })
        : Promise.resolve([]),
      searchHotels({
        location: destination,
        checkIn: intent.departure_date,
        checkOut: intent.return_date,
        adults: intent.adults,
        currency: currency.toLowerCase(),
      }),
    ]);

    let flights = flightsRes.status === "fulfilled" ? flightsRes.value : [];
    let hotels = hotelsRes.status === "fulfilled" ? hotelsRes.value : [];

    let mock = false;
    if (flights.length === 0) {
      flights = mockFlights(intent, currency);
      mock = true;
    }
    if (hotels.length === 0) {
      hotels = mockHotels(intent, currency);
      mock = true;
    }

    return NextResponse.json({ flights, hotels, mock, currency });
  } catch (err) {
    const message = err instanceof Error ? err.message : "search_failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
