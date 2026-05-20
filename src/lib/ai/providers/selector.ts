import "server-only";
/**
 * Provider Selector — OpenAI only.
 *
 * OpenAI is the only external AI provider. Throws on missing key so the
 * parse route's smart local fallback kicks in cleanly.
 */
import type { TravelIntelligence, ChatTurn } from "../schemas/intelligence";
import type { TravelContext } from "../schemas/intent";
import {
  getTravelIntelligenceOpenAI,
  getLiveTipsOpenAI,
  generateDestinationDescriptionOpenAI,
} from "./openai";
import { HAS_OPENAI_KEY } from "../config";

export type IntelligenceOptions = {
  userId?: string | null;
  summary?: string | null;
};

export async function getTravelIntelligence(
  query: string,
  history: ChatTurn[],
  context: TravelContext,
  options: IntelligenceOptions = {},
): Promise<TravelIntelligence> {
  if (!HAS_OPENAI_KEY) {
    throw new Error("[ai/selector] OPENAI_API_KEY not configured");
  }
  console.log("[ai/selector] attempting provider=openai");
  const t0 = Date.now();
  const res = await getTravelIntelligenceOpenAI(query, history, context, options);
  console.log(`[ai/selector] success provider=openai mode=${res.mode} ms=${Date.now() - t0}`);
  return res;
}

export async function getLiveTips(
  destination: string,
  locale: "ar" | "en",
): Promise<string | null> {
  return getLiveTipsOpenAI(destination, locale).catch(() => null);
}

export async function generateDestinationDescription(
  destination: string,
  locale: "ar" | "en",
): Promise<string | null> {
  return generateDestinationDescriptionOpenAI(destination, locale).catch(() => null);
}
