import "server-only";
/**
 * Backward-compat shim — all types and functions re-exported/delegated to
 * the OpenAI provider. The @google/generative-ai package is no longer used.
 *
 * Existing imports from "@/lib/gemini" continue to work unchanged.
 */

// ── Types (re-exported from canonical schema files) ───────────────────────
export {
  TripIntentSchema,
  WantsSchema,
  type TripIntent,
  type TravelContext,
} from "./ai/schemas/intent";

export {
  BudgetVerdictSchema,
  ConfidenceScoreSchema,
  DestinationIntelSchema,
  TravelIntelligenceSchema,
  type BudgetVerdict,
  type ConfidenceScore,
  type DestinationIntel,
  type TravelIntelligence,
  type ChatMode,
  type ChatTurn,
} from "./ai/schemas/intelligence";

// Legacy compat types
import type { TripIntent } from "./ai/schemas/intent";
import type { TravelIntelligence } from "./ai/schemas/intelligence";
import { z } from "zod";
import { TripIntentSchema } from "./ai/schemas/intent";

export const TripParseSchema = z.object({
  locale: z.enum(["ar", "en"]),
  message: z.string(),
  wants: z
    .array(z.enum(["flights", "hotels"]))
    .default(["flights", "hotels"])
    .transform((arr) => (arr.length === 0 ? ["flights", "hotels"] : arr)),
  followup: z.string().nullable().default(null),
  intent: TripIntentSchema,
});
export type TripParseResult = z.infer<typeof TripParseSchema>;

// ── Functions delegated to OpenAI provider ────────────────────────────────
export {
  getLiveTipsOpenAI as getLiveTips,
  generateDestinationDescriptionOpenAI as generateDestinationDescription,
} from "./ai/providers/openai";

import {
  getTravelIntelligenceOpenAI,
} from "./ai/providers/openai";
import type { TravelContext } from "./ai/schemas/intent";

/** @deprecated Use the Ria orchestrator pipeline instead. */
export async function getTravelIntelligence(
  query: string,
  history: Array<{ role: "user" | "model"; text: string }> = [],
  context?: TravelContext,
): Promise<TravelIntelligence> {
  // Adapt legacy "model" role to "assistant"
  const adapted = history.map((t) => ({
    role: (t.role === "model" ? "assistant" : t.role) as "user" | "assistant",
    text: t.text,
  }));
  return getTravelIntelligenceOpenAI(
    query,
    adapted,
    context ?? {
      destination: null,
      origin: null,
      departure_date: null,
      return_date: null,
      adults: 2,
      budget_usd: null,
      trip_type: null,
      cabin_class: null,
    },
  );
}

/** @deprecated */
export async function parseTripQuery(
  query: string,
  history: Array<{ role: "user" | "model"; text: string }> = [],
): Promise<TripParseResult> {
  const intel = await getTravelIntelligence(query, history);
  return {
    locale: intel.locale,
    message: intel.message,
    wants: intel.wants,
    followup: intel.followup,
    intent: intel.intent,
  };
}

/** @deprecated */
export async function parseTripIntent(query: string): Promise<TripIntent> {
  return (await parseTripQuery(query)).intent;
}
