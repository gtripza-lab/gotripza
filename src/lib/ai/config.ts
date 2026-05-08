/**
 * AI Provider Configuration — OpenAI only.
 *
 * Gemini support removed. Set OPENAI_API_KEY in your environment.
 * This module is server-only (do NOT import from client components).
 */
import "server-only";

/**
 * Model tiers — map to concrete OpenAI model names.
 *
 *   primary → main intelligence (intent extraction, mode decision, advice)
 *   lite    → cheap auxiliary calls (tips, descriptions, summaries)
 */
export const MODEL_PRIMARY = process.env.AI_MODEL_PRIMARY ?? "gpt-4o";
export const MODEL_LITE = process.env.AI_MODEL_LITE ?? "gpt-4o-mini";

export const HAS_OPENAI_KEY = !!process.env.OPENAI_API_KEY;

export const AI_TIMEOUT_MS = 25_000;
export const AI_MAX_RETRIES = 2;
