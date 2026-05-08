import "server-only";
import { searchHotels } from "@/lib/travelpayouts";
import { buildHotelUrl } from "@/lib/partners";
import type { ToolDef } from "./index";

type Input = {
  city: string; // city name or IATA-resolvable
  check_in?: string | null;
  check_out?: string | null;
  adults?: number;
  currency?: string;
};

export const searchHotelsTool: ToolDef<Input, unknown> = {
  name: "search_hotels",
  description:
    "Search live hotel prices in a city. Returns up to 3 options (cheapest, best-value, most-luxurious) plus a deep-link to Booking.com search results. NOTE: Travelpayouts cache returns aggregate prices; per-hotel deep-links are city-level, not room-specific.",
  parameters: {
    type: "object",
    properties: {
      city: {
        type: "string",
        description: "City name in English, e.g. 'Istanbul', 'Dubai', 'Bali'.",
      },
      check_in: {
        type: ["string", "null"],
        description: "YYYY-MM-DD; omit for cached aggregate prices.",
      },
      check_out: { type: ["string", "null"], description: "YYYY-MM-DD" },
      adults: { type: "integer", default: 2 },
      currency: { type: "string", default: "USD" },
    },
    required: ["city"],
  },
  async execute(input, _ctx) {
    const hotels = await searchHotels({
      location: input.city,
      checkIn: input.check_in ?? null,
      checkOut: input.check_out ?? null,
      adults: input.adults ?? 2,
      currency: (input.currency ?? "usd").toLowerCase(),
      subid: "ai_tool",
    });
    return {
      hotels: hotels.slice(0, 3).map((h) => ({
        hotel_id: h.hotelId,
        name: h.hotelName,
        stars: h.stars ?? null,
        price_from: h.priceFrom,
        location: h.location,
        link: h.link,
      })),
      total_results: hotels.length,
      search_url: buildHotelUrl({ subid: "ai_tool" }),
    };
  },
};
