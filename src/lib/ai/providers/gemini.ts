import "server-only";
/**
 * Gemini provider wrapper — adapts the legacy `src/lib/gemini.ts` module
 * to the provider-agnostic AI module contract.
 *
 * This file exists for the strangler period. Once OpenAI is stable
 * (Phase 11), delete this file and `src/lib/gemini.ts`.
 */
import {
  getTravelIntelligence as legacyGetTravelIntelligence,
  getLiveTips as legacyGetLiveTips,
  generateDestinationDescription as legacyGenerateDescription,
  type ChatTurn as LegacyChatTurn,
} from "@/lib/gemini";
import type { TravelIntelligence, ChatTurn } from "../schemas/intelligence";
import type { TravelContext } from "../schemas/intent";

/**
 * Adapt new ChatTurn (role: "assistant") to legacy ChatTurn (role: "model").
 */
function toLegacyHistory(history: ChatTurn[]): LegacyChatTurn[] {
  return history.map((t) => ({
    role: t.role === "assistant" ? "model" : "user",
    text: t.text,
  }));
}

export async function getTravelIntelligenceGemini(
  query: string,
  history: ChatTurn[],
  context: TravelContext,
): Promise<TravelIntelligence> {
  // Legacy module's TravelContext shape matches ours (mirror types).
  const result = await legacyGetTravelIntelligence(
    query,
    toLegacyHistory(history),
    context,
  );
  // The legacy schema is a structural superset — cast is safe.
  return result as unknown as TravelIntelligence;
}

export async function getLiveTipsGemini(
  destination: string,
  locale: "ar" | "en",
): Promise<string | null> {
  return legacyGetLiveTips(destination, locale);
}

export async function generateDestinationDescriptionGemini(
  destination: string,
  locale: "ar" | "en",
): Promise<string | null> {
  return legacyGenerateDescription(destination, locale);
}
