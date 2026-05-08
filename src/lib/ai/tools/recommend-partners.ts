import "server-only";
import { getPartnerRecommendations } from "@/lib/orchestration";
import type { TripIntent } from "../schemas/intent";
import type { ToolDef } from "./index";

type Input = {
  destination: string;
  origin?: string | null;
  trip_type?: TripIntent["trip_type"];
  departure_date?: string | null;
  return_date?: string | null;
  adults?: number;
  limit?: number;
};

export const recommendPartnersTool: ToolDef<Input, unknown> = {
  name: "recommend_partners",
  description:
    "Recommend relevant travel partners (eSIM, insurance, activities, car rental, train, flight compensation) tailored to the trip type and destination. Returns affiliate-tracked links Raya can weave naturally into advice.",
  parameters: {
    type: "object",
    properties: {
      destination: { type: "string", description: "IATA or city name" },
      origin: { type: ["string", "null"] },
      trip_type: {
        type: ["string", "null"],
        enum: [
          "leisure",
          "business",
          "honeymoon",
          "family",
          "adventure",
          "weekend",
          null,
        ],
      },
      departure_date: { type: ["string", "null"] },
      return_date: { type: ["string", "null"] },
      adults: { type: "integer", default: 2 },
      limit: { type: "integer", default: 6, maximum: 12 },
    },
    required: ["destination"],
  },
  async execute(input, _ctx) {
    const intent: TripIntent = {
      origin: input.origin ?? null,
      destination: input.destination,
      departure_date: input.departure_date ?? null,
      return_date: input.return_date ?? null,
      adults: input.adults ?? 2,
      budget_usd: null,
      trip_type: input.trip_type ?? null,
      cabin_class: null,
      notes: null,
    };
    const recs = getPartnerRecommendations(
      intent,
      {
        destination: input.destination,
        origin: input.origin ?? undefined,
        departure_date: input.departure_date ?? null,
        return_date: input.return_date ?? null,
        adults: input.adults ?? 2,
        subid: "ai_tool",
      },
      input.limit ?? 6,
    );
    return {
      recommendations: recs.map((r) => ({
        id: r.partner.id,
        name: r.partner.name,
        category: r.partner.category,
        url: r.url,
        reason_en: r.reason_en,
        reason_ar: r.reason_ar,
      })),
    };
  },
};
