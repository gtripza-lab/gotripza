/**
 * AI Provider Configuration
 * ─────────────────────────────────────────────────────────────────────
 * Single source of truth for which LLM provider Raya uses.
 *
 * AI_PROVIDER values:
 *   "openai" — use OpenAI (recommended)
 *   "gemini" — use Google Gemini (legacy)
 *   "auto"   — try OpenAI, fall back to Gemini, then heuristic
 *
 * This module is server-only (do NOT import from client components).
 */
import "server-only";

export type AIProvider = "openai" | "gemini" | "auto";

function resolveProvider(): AIProvider {
  const raw = (process.env.AI_PROVIDER ?? "auto").toLowerCase();
  if (raw === "openai" || raw === "gemini" || raw === "auto") return raw;
  return "auto";
}

export const AI_PROVIDER: AIProvider = resolveProvider();

/**
 * Model tiers — providers map these to their concrete model names.
 *
 *   primary → main intelligence (intent extraction, mode decision, advice)
 *   lite    → cheap auxiliary calls (tips, descriptions, summaries)
 */
export const MODEL_PRIMARY = process.env.AI_MODEL_PRIMARY ?? "gpt-4o";
export const MODEL_LITE = process.env.AI_MODEL_LITE ?? "gpt-4o-mini";

export const HAS_OPENAI_KEY = !!process.env.OPENAI_API_KEY;
export const HAS_GEMINI_KEY = !!process.env.GEMINI_API_KEY;

/**
 * Effective provider after considering which API keys are actually set.
 * If user asked for "openai" but no key exists, fall back to gemini-or-heuristic
 * so the chat still works rather than 500-ing.
 */
export function effectiveProvider(): "openai" | "gemini" | "none" {
  if (AI_PROVIDER === "openai") return HAS_OPENAI_KEY ? "openai" : "none";
  if (AI_PROVIDER === "gemini") return HAS_GEMINI_KEY ? "gemini" : "none";
  // auto
  if (HAS_OPENAI_KEY) return "openai";
  if (HAS_GEMINI_KEY) return "gemini";
  return "none";
}

export const AI_TIMEOUT_MS = 25_000;
export const AI_MAX_RETRIES = 2;
