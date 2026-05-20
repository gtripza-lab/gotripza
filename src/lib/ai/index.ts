import "server-only";
/**
 * Gotripza AI Module — public API
 * ─────────────────────────────────────────────────────────────────────
 * This is the only module the rest of the app should import from for
 * AI/Raya intelligence. Internals (providers, prompts, schemas) are
 * implementation detail.
 *
 * Provider status: OpenAI only. Smart local fallback is owned by the parse route.
 */

export {
  getTravelIntelligence,
  getLiveTips,
  generateDestinationDescription,
} from "./providers/selector";

export {
  TravelIntelligenceSchema,
  ChatTurnSchema,
  ChatModeSchema,
  type TravelIntelligence,
  type ChatTurn,
  type ChatMode,
  type BudgetVerdict,
  type ConfidenceScore,
  type DestinationIntel,
} from "./schemas/intelligence";

export {
  TripIntentSchema,
  WantsSchema,
  EMPTY_TRAVEL_CONTEXT,
  type TripIntent,
  type Wants,
  type TravelContext,
} from "./schemas/intent";

export {
  MODEL_PRIMARY,
  MODEL_LITE,
} from "./config";
