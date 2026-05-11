import { z } from "zod";

/**
 * TripIntent — slot-fill state of what we know about the traveler's trip.
 *
 * NOTE (loop-fix D): destination is now nullable (was z.string().default("")).
 * The empty-string default caused "your destination" to bleed into messages
 * and made the override layer trip on edge cases.
 */
export const TripIntentSchema = z.object({
  origin: z.string().nullable(),
  destination: z.string().nullable(),
  departure_date: z.string().nullable(),
  return_date: z.string().nullable(),
  adults: z.number().int().min(1).max(9).default(2),
  budget_usd: z.number().int().nullable().default(null),
  trip_type: z
    .enum(["leisure", "business", "honeymoon", "family", "adventure", "weekend"])
    .nullable()
    .default(null),
  // N1: Cabin class — enables Raya to pass user preference to flight search
  cabin_class: z
    .enum(["economy", "premium_economy", "business", "first"])
    .nullable()
    .default(null),
  notes: z.string().nullable().default(null),
});
export type TripIntent = z.infer<typeof TripIntentSchema>;

/**
 * What sides the user wants — ["flights"], ["hotels"], or both.
 * Tolerant: empty array → both.
 */
export const WantsSchema = z
  .array(z.enum(["flights", "hotels"]))
  .default(["flights", "hotels"])
  .transform((arr) => (arr.length === 0 ? ["flights", "hotels"] : arr));
export type Wants = z.infer<typeof WantsSchema>;

/**
 * Accumulated travel context — server-side merged across turns.
 * Mirrors TripIntent but represents *confirmed* known facts.
 */
export type TravelContext = {
  destination: string | null;
  origin: string | null;
  departure_date: string | null;
  return_date: string | null;
  adults: number;
  budget_usd: number | null;
  trip_type: TripIntent["trip_type"];
  cabin_class: TripIntent["cabin_class"];
  traveler_type?: "solo" | "couple" | "family" | "friends" | "business" | null;
  hotel_preferences?: string[];
  service_interests?: Array<"insurance" | "esim" | "activities" | "cars" | "trains" | "compensation">;
  booking_stage?: "browsing" | "planning" | "ready_to_book" | "support" | null;
  concerns?: string[];
};

export const EMPTY_TRAVEL_CONTEXT: TravelContext = {
  destination: null,
  origin: null,
  departure_date: null,
  return_date: null,
  adults: 2,
  budget_usd: null,
  trip_type: null,
  cabin_class: null,
  traveler_type: null,
  hotel_preferences: [],
  service_interests: [],
  booking_stage: null,
  concerns: [],
};
