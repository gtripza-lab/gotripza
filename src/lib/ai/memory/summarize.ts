import "server-only";
/**
 * Rolling conversation summary — Phase 10 cost optimization.
 *
 * When a conversation grows beyond 12 turns, we replace the oldest 8 turns
 * with a single 200-token summary and keep the recent 4 verbatim. This
 * caps token usage on long sessions while preserving recent nuance.
 */
import OpenAI from "openai";
import type { ChatTurn } from "../schemas/intelligence";
import { HAS_OPENAI_KEY, MODEL_LITE } from "../config";

const SUMMARY_AFTER = 12; // turns
const KEEP_RECENT = 4; // turns

let _client: OpenAI | null = null;
function client(): OpenAI {
  _client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _client;
}

export type SummarizeResult = {
  summary: string | null;
  truncatedHistory: ChatTurn[];
};

/**
 * If history is short, return as-is.
 * If long, summarize older turns and return the recent slice.
 */
export async function maybeSummarize(
  history: ChatTurn[],
  existingSummary: string | null = null,
): Promise<SummarizeResult> {
  if (history.length <= SUMMARY_AFTER) {
    return { summary: existingSummary, truncatedHistory: history };
  }

  const olderSlice = history.slice(0, history.length - KEEP_RECENT);
  const recent = history.slice(history.length - KEEP_RECENT);

  if (!HAS_OPENAI_KEY) {
    // Without OpenAI we just drop the old turns rather than burn tokens
    // on a non-critical optimization.
    return { summary: existingSummary, truncatedHistory: recent };
  }

  const transcript = olderSlice
    .map((t) => `${t.role === "user" ? "U" : "A"}: ${t.text}`)
    .join("\n");

  const directive = `Summarize this travel chat in ≤180 tokens. Capture: destination(s), dates, origin, traveler count, budget if mentioned, key preferences, and any commitments Raya made. Plain prose, no headers.${existingSummary ? `\n\nPrior summary:\n${existingSummary}` : ""}\n\nTranscript:\n${transcript}`;

  try {
    const r = await client().chat.completions.create({
      model: MODEL_LITE,
      temperature: 0.3,
      messages: [{ role: "user", content: directive }],
      max_tokens: 220,
    });
    const summary =
      r.choices[0]?.message?.content?.trim() ?? existingSummary;
    return { summary, truncatedHistory: recent };
  } catch (err) {
    console.warn("[memory] summarize failed:", (err as Error).message);
    return { summary: existingSummary, truncatedHistory: recent };
  }
}
