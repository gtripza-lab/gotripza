import "server-only";
/**
 * Provider Selector — the strangler routing layer.
 *
 * Resolves AI_PROVIDER + key availability, then dispatches to the right
 * provider with a single retry-fallback chain.
 *
 *   "openai" → OpenAI; throws if no key or hard failure.
 *   "gemini" → Gemini; throws if no key or hard failure.
 *   "auto"   → OpenAI (if key) → Gemini (if key) → throw.
 *
 * Throwing here is intentional — the parse route catches and falls back to
 * the deterministic heuristic, which is the absolute last line of defense.
 */
import { effectiveProvider } from "../config";
import type { TravelIntelligence, ChatTurn } from "../schemas/intelligence";
import type { TravelContext } from "../schemas/intent";
import {
  getTravelIntelligenceOpenAI,
  getLiveTipsOpenAI,
  generateDestinationDescriptionOpenAI,
} from "./openai";
import {
  getTravelIntelligenceGemini,
  getLiveTipsGemini,
  generateDestinationDescriptionGemini,
} from "./gemini";
import { HAS_GEMINI_KEY, HAS_OPENAI_KEY } from "../config";

export async function getTravelIntelligence(
  query: string,
  history: ChatTurn[],
  context: TravelContext,
): Promise<TravelIntelligence> {
  const primary = effectiveProvider();

  if (primary === "none") {
    throw new Error(
      "[ai/selector] no AI provider configured (set OPENAI_API_KEY or GEMINI_API_KEY)",
    );
  }

  // Try primary, then the other provider as a soft fallback when AI_PROVIDER=auto.
  const tryOrder: Array<"openai" | "gemini"> = (() => {
    if (primary === "openai") return HAS_GEMINI_KEY ? ["openai", "gemini"] : ["openai"];
    if (primary === "gemini") return HAS_OPENAI_KEY ? ["gemini", "openai"] : ["gemini"];
    return ["openai", "gemini"];
  })();

  let lastErr: unknown = null;
  for (const p of tryOrder) {
    try {
      console.log(`[ai/selector] attempting provider=${p}`);
      const t0 = Date.now();
      const res =
        p === "openai"
          ? await getTravelIntelligenceOpenAI(query, history, context)
          : await getTravelIntelligenceGemini(query, history, context);
      console.log(
        `[ai/selector] success provider=${p} mode=${res.mode} ms=${Date.now() - t0}`,
      );
      return res;
    } catch (err) {
      lastErr = err;
      console.warn(
        `[ai/selector] provider=${p} failed: ${(err as Error).message}`,
      );
    }
  }
  throw lastErr instanceof Error
    ? lastErr
    : new Error("[ai/selector] all providers exhausted");
}

export async function getLiveTips(
  destination: string,
  locale: "ar" | "en",
): Promise<string | null> {
  const primary = effectiveProvider();
  if (primary === "openai")
    return getLiveTipsOpenAI(destination, locale).catch(() => null);
  if (primary === "gemini")
    return getLiveTipsGemini(destination, locale).catch(() => null);
  return null;
}

export async function generateDestinationDescription(
  destination: string,
  locale: "ar" | "en",
): Promise<string | null> {
  const primary = effectiveProvider();
  if (primary === "openai")
    return generateDestinationDescriptionOpenAI(destination, locale).catch(
      () => null,
    );
  if (primary === "gemini")
    return generateDestinationDescriptionGemini(destination, locale).catch(
      () => null,
    );
  return null;
}
