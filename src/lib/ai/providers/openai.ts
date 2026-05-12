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
  buildClientMemoryBlock,
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
 * M14: usage telemetry returned alongside the parsed intelligence so the
 * caller (orchestrator) can persist tokens_in/out/model to messages table.
 */
export type IntelligenceWithUsage = {
  intelligence: TravelIntelligence;
  usage: {
    model: string;
    tokens_in: number | null;
    tokens_out: number | null;
    latency_ms: number;
    salvaged: boolean;
  };
};

/**
 * M3: Salvage path for partial Zod failures — keep the chat alive when the
 * LLM returns a slightly malformed response (one missing enum, etc).
 * Extracts only the fields we strictly need (mode, message, locale).
 */
function salvageIntelligence(
  raw: unknown,
  fallbackLocale: "ar" | "en",
): TravelIntelligence | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const message = typeof r.message === "string" ? r.message : null;
  if (!message || message.length < 1) return null;
  const mode = ["clarify", "search", "advice"].includes(r.mode as string)
    ? (r.mode as "clarify" | "search" | "advice")
    : "clarify";
  const locale = r.locale === "ar" || r.locale === "en" ? r.locale : fallbackLocale;
  return {
    locale,
    mode,
    message,
    wants: ["flights", "hotels"],
    followup: null,
    clarification_needed: mode === "clarify",
    clarification_question: null,
    intent: {
      origin: null,
      destination: null,
      departure_date: null,
      return_date: null,
      adults: 2,
      budget_usd: null,
      trip_type: null,
      cabin_class: null,
      notes: null,
    },
    budget_verdict: null,
    confidence: null,
    destination_intel: null,
  };
}

/**
 * Run Raya intelligence on a user query.
 *
 * Uses chat completions with JSON-object response mode + Zod validation.
 * On schema drift, attempts a salvage path (M3).
 * Returns usage telemetry for cost tracking (M14).
 *
 * M4: User content is wrapped in <user_message> delimiters so the model
 * cannot be hijacked by injected "ignore previous instructions"-style text.
 */
export async function getTravelIntelligenceOpenAI(
  query: string,
  history: ChatTurn[] = [],
  context: TravelContext,
  options: {
    userId?: string | null;
    sessionId?: string | null;
    summary?: string | null;
    clientMemory?: Parameters<typeof buildClientMemoryBlock>[0];
  } = {},
): Promise<TravelIntelligence> {
  const r = await getTravelIntelligenceWithUsage(query, history, context, options);
  return r.intelligence;
}

export async function getTravelIntelligenceWithUsage(
  query: string,
  history: ChatTurn[] = [],
  context: TravelContext,
  options: {
    userId?: string | null;
    sessionId?: string | null;
    summary?: string | null;
    clientMemory?: Parameters<typeof buildClientMemoryBlock>[0];
  } = {},
): Promise<IntelligenceWithUsage> {
  const t0 = Date.now();
  const system = buildSystemPrompt();
  const memoryBlock = await buildMemoryBlock(options.userId, options.sessionId);
  const summaryBlock = buildSummaryBlock(options.summary ?? null);
  const clientMemoryBlock = buildClientMemoryBlock(options.clientMemory ?? null);
  const ctxBlock = buildContextBlock(context);
  const historyBlock = buildHistoryBlock(history);

  // M4: Wrap user content in tagged delimiters. The system prompt instructs
  // the model to treat anything inside as untrusted data.
  const userPrompt = `${memoryBlock}${summaryBlock}${clientMemoryBlock}${ctxBlock}${historyBlock}\n\n<user_message>\n${query}\n</user_message>`;

  const fallbackLocale: "ar" | "en" = /[؀-ۿ]/.test(query) ? "ar" : "en";

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
  const usage = {
    model: res.model ?? MODEL_PRIMARY,
    tokens_in: res.usage?.prompt_tokens ?? null,
    tokens_out: res.usage?.completion_tokens ?? null,
    latency_ms: Date.now() - t0,
    salvaged: false,
  };
  if (!text) throw new Error("[openai] empty response");

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    throw new Error(
      `[openai] invalid JSON: ${(err as Error).message} | head=${text.slice(0, 120)}`,
    );
  }

  // M3: safeParse + salvage path. Schema drift no longer kills the turn.
  const result = TravelIntelligenceSchema.safeParse(parsed);
  if (result.success) {
    return { intelligence: result.data, usage };
  }
  console.warn("[openai] schema drift — salvaging:", result.error.issues.slice(0, 3));
  const salvaged = salvageIntelligence(parsed, fallbackLocale);
  if (salvaged) {
    return { intelligence: salvaged, usage: { ...usage, salvaged: true } };
  }
  // Salvage failed — surface so heuristic fallback runs
  throw new Error(`[openai] schema mismatch unrecoverable: ${result.error.issues[0]?.message}`);
}

/**
 * Lightweight tip line — used in search-mode results panel.
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
