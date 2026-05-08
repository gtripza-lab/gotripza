import { z } from "zod";
import { TripIntentSchema, WantsSchema } from "./intent";

/**
 * BudgetVerdict — Raya's evaluation of whether the budget fits the destination.
 */
export const BudgetVerdictSchema = z.object({
  verdict: z.enum(["generous", "realistic", "tight", "insufficient"]),
  label_ar: z.string(),
  label_en: z.string(),
  explanation_ar: z.string(),
  explanation_en: z.string(),
  alternative_destinations: z.array(z.string()).default([]),
  suggested_budget_usd: z.number().nullable().default(null),
});
export type BudgetVerdict = z.infer<typeof BudgetVerdictSchema>;

/**
 * ConfidenceScore — 0-10 likelihood the trip will be a great experience.
 */
export const ConfidenceScoreSchema = z.object({
  score: z.number().min(0).max(10),
  label_ar: z.string(),
  label_en: z.string(),
  factors: z
    .array(
      z.object({
        factor_ar: z.string(),
        factor_en: z.string(),
        impact: z.enum(["positive", "neutral", "negative"]),
      }),
    )
    .default([]),
});
export type ConfidenceScore = z.infer<typeof ConfidenceScoreSchema>;

/**
 * DestinationIntel — bilingual destination knowledge for the side panel.
 */
export const DestinationIntelSchema = z.object({
  best_months_ar: z.string(),
  best_months_en: z.string(),
  weather_now_ar: z.string(),
  weather_now_en: z.string(),
  visa_required_for_saudis: z.boolean().nullable().default(null),
  visa_note_ar: z.string().nullable().default(null),
  visa_note_en: z.string().nullable().default(null),
  safety_level: z
    .enum(["excellent", "good", "moderate", "caution"])
    .default("good"),
  safety_note_ar: z.string().nullable().default(null),
  top_neighborhoods_ar: z.array(z.string()).default([]),
  top_neighborhoods_en: z.array(z.string()).default([]),
  top_activities_ar: z.array(z.string()).default([]),
  top_activities_en: z.array(z.string()).default([]),
  clothing_tip_ar: z.string().nullable().default(null),
  clothing_tip_en: z.string().nullable().default(null),
  local_currency: z.string().nullable().default(null),
  time_zone: z.string().nullable().default(null),
});
export type DestinationIntel = z.infer<typeof DestinationIntelSchema>;

/**
 * ChatMode — drives all client branching in ChatContext.
 *   clarify → show message only, wait for user
 *   search  → call /api/search and render results
 *   advice  → answer a travel question (no search)
 *
 * This contract is LOAD-BEARING. Changing values breaks the chat.
 */
export const ChatModeSchema = z.enum(["clarify", "search", "advice"]);
export type ChatMode = z.infer<typeof ChatModeSchema>;

/**
 * Full Raya response — the contract every AI provider must satisfy.
 */
export const TravelIntelligenceSchema = z.object({
  locale: z.enum(["ar", "en"]),
  mode: ChatModeSchema.default("clarify"),
  message: z.string(),
  wants: WantsSchema,
  followup: z.string().nullable().default(null),
  clarification_needed: z.boolean().default(false),
  clarification_question: z.string().nullable().default(null),
  intent: TripIntentSchema,
  budget_verdict: BudgetVerdictSchema.nullable().default(null),
  confidence: ConfidenceScoreSchema.nullable().default(null),
  destination_intel: DestinationIntelSchema.nullable().default(null),
});
export type TravelIntelligence = z.infer<typeof TravelIntelligenceSchema>;

/**
 * ChatTurn — provider-agnostic conversation history record.
 *
 * NOTE (loop-fix E): role uses "assistant" (not "model") so OpenAI native
 * formats slot in directly. Includes `mode` so the LLM can see its own
 * prior decisions and never re-clarifies after searching.
 */
export const ChatTurnSchema = z.object({
  role: z.enum(["user", "assistant"]),
  text: z.string(),
  mode: ChatModeSchema.optional(),
});
export type ChatTurn = z.infer<typeof ChatTurnSchema>;
