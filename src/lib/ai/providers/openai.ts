import "server-only";
import OpenAI from "openai";
import {
  TravelIntelligenceSchema,
  type TravelIntelligence,
  type ChatTurn,
} from "../schemas/intelligence";
import type { TravelContext } from "../schemas/intent";
import {
  buildContextBlock,
  buildHistoryBlock,
  buildSummaryBlock,
  buildSystemPrompt,
} from "../prompts/raya-system";
import {
  AI_MAX_RETRIES,
  AI_TIMEOUT_MS,
  HAS_OPENAI_KEY,
  MODEL_LITE,
  MODEL_PRIMARY,
} from "../config";
import { buildMemoryBlock } from "../memory/inject";

let _client: OpenAI | null = null;
function client(): OpenAI {
  if (!HAS_OPENAI_KEY) {
    throw new Error("[openai] OPENAI_API_KEY not set");
  }
  _client ??= new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: AI_TIMEOUT_MS,
    maxRetries: AI_MAX_RETRIES,
  });
  return _client;
}

/**
 * Run Raya intelligence on a user query.
 *
 * Uses chat completions with JSON-object response mode. Structured outputs
 * (response_format with JSON schema) is also supported on gpt-4o models —
 * we validate with Zod regardless to stay robust across model versions.
 */
export async function getTravelIntelligenceOpenAI(
  query: string,
  history: ChatTurn[] = [],
  context: TravelContext,
  options: { userId?: string | null; summary?: string | null } = {},
): Promise<TravelIntelligence> {
  const system = buildSystemPrompt();
  const memoryBlock = await buildMemoryBlock(options.userId);
  const summaryBlock = buildSummaryBlock(options.summary ?? null);
  const ctxBlock = buildContextBlock(context);
  const historyBlock = buildHistoryBlock(history);

  const userPrompt = `${memoryBlock}${summaryBlock}${ctxBlock}${historyBlock}\n\nNew user message:\n${query}`;

  const res = await client().chat.completions.create({
    model: MODEL_PRIMARY,
    temperature: 0.65,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: userPrompt },
    ],
  });

  const text = res.choices[0]?.message?.content?.trim() ?? "";
  if (!text) throw new Error("[openai] empty response");

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    throw new Error(
      `[openai] invalid JSON: ${(err as Error).message} | head=${text.slice(0, 120)}`,
    );
  }

  return TravelIntelligenceSchema.parse(parsed);
}

/**
 * Lightweight tip line — used in search-mode results panel.
 *
 * NOTE: OpenAI doesn't ship a Gemini-style googleSearch grounding tool by
 * default. We use the lite model with cached destination knowledge baked
 * into the prompt. Real-time web grounding can be added via the
 * `web_search` tool on the Responses API later.
 */
export async function getLiveTipsOpenAI(
  destination: string,
  locale: "ar" | "en",
): Promise<string | null> {
  if (!destination) return null;
  const today = new Date().toISOString().slice(0, 10);
  const directive =
    locale === "ar"
      ? `اليوم ${today}. قدّم جملة عربية واحدة فقط (≤25 كلمة) بأسلوب رسمي عن أحدث ظروف الطقس أو نصيحة سفر جوهرية للوجهة "${destination}". إذا ذكرت مبلغاً اذكره بالريال. بدون مقدمات ولا رموز تعبيرية.`
      : `Today is ${today}. Give exactly ONE formal English sentence (≤25 words) about current travel conditions, weather, or an essential tip for "${destination}". No preface, no emoji.`;

  try {
    const r = await client().chat.completions.create({
      model: MODEL_LITE,
      temperature: 0.3,
      messages: [{ role: "user", content: directive }],
    });
    const text = r.choices[0]?.message?.content?.trim() ?? "";
    return text.slice(0, 280) || null;
  } catch (err) {
    console.warn("[openai] tips unavailable:", (err as Error).message);
    return null;
  }
}

/**
 * Destination description for SEO pages.
 */
export async function generateDestinationDescriptionOpenAI(
  destination: string,
  locale: "ar" | "en",
): Promise<string | null> {
  if (!destination) return null;
  const directive =
    locale === "ar"
      ? `اكتب فقرة حصرية من ٢-٣ جمل (بأسلوب فاخر، عربية فصحى) عن الوجهة "${destination}". تشمل: أبرز المعالم، أفضل وقت للزيارة، ولماذا تختارها عبر GoTripza. بدون مقدمة، بدون اقتباسات.`
      : `Write an exclusive 2-3 sentence paragraph (formal, luxurious tone) about "${destination}". Include: top highlights, best time to visit, why travelers choose GoTripza. No preface, no quotes.`;

  try {
    const r = await client().chat.completions.create({
      model: MODEL_LITE,
      temperature: 0.7,
      messages: [{ role: "user", content: directive }],
    });
    return r.choices[0]?.message?.content?.trim().slice(0, 600) || null;
  } catch (err) {
    console.warn("[openai] description unavailable:", (err as Error).message);
    return null;
  }
}
