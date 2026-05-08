import "server-only";
import { searchFlights } from "@/lib/travelpayouts";
import { buildAviasalesUrl } from "@/lib/partners";
import type { ToolDef } from "./index";

type Input = {
  origin: string;
  destination: string;
  departure_date?: string | null;
  return_date?: string | null;
  adults?: number;
  currency?: string;
};

export const searchFlightsTool: ToolDef<Input, unknown> = {
  name: "search_flights",
  description:
    "Search live flight prices between two IATA airport codes for a given date range. Returns up to 3 representative options (cheapest, fastest, best-value) plus a deep-link to the full results.",
  parameters: {
    type: "object",
    properties: {
      origin: {
        type: "string",
        description: "Origin IATA code (3 letters), e.g. RUH, JED, DXB.",
      },
      destination: {
        type: "string",
        description: "Destination IATA code (3 letters).",
      },
      departure_date: {
        type: ["string", "null"],
        description: "YYYY-MM-DD, optional.",
      },
      return_date: {
        type: ["string", "null"],
        description: "YYYY-MM-DD for round-trip; omit for one-way.",
      },
      adults: { type: "integer", default: 2 },
      currency: { type: "string", default: "USD" },
    },
    required: ["origin", "destination"],
  },
  async execute(input, ctx) {
    const flights = await searchFlights({
      origin: input.origin,
      destination: input.destination,
      departure_date: input.departure_date ?? null,
      return_date: input.return_date ?? null,
      currency: (input.currency ?? "usd").toLowerCase(),
      subid: "ai_tool",
    });
    return {
      flights: flights.slice(0, 3).map((f) => ({
        origin: f.origin,
        destination: f.destination,
        airline: f.airline,
        flight_number: f.flight_number,
        departure_at: f.departure_at,
        return_at: f.return_at,
        price: f.price,
        duration_minutes: f.duration ?? null,
        link: f.link,
      })),
      total_results: flights.length,
      search_url: buildAviasalesUrl({
        locale: ctx.locale,
        subid: "ai_tool",
      }),
    };
  },
};
