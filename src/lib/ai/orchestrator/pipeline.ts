import "server-only";
/**
 * Ria Core Orchestrator
 * ─────────────────────────────────────────────────────────────────────
 * The single entry point that the parse route calls.
 *
 *   pre-filter  →  LLM (provider-agnostic)  →  post-process  →  result
 *
 * Pre-filter merges deterministically-extracted slots INTO context so the
 * LLM never re-asks. Post-process sanity-checks the LLM output without
 * clobbering its message.
 *
 * Memory injection (Phase 4) plugs in here: when `userId` is provided,
 * we pull `traveler_preferences` and inject into the prompt context block
 * so Raya can personalize.
 */
import { getTravelIntelligence as providerGetIntelligence } from "../providers/selector";
import { runPreFilter } from "./pre-filter";
import { postProcess } from "./post-process";
import type { TravelIntelligence, ChatTurn } from "../schemas/intelligence";
import type { TravelContext } from "../schemas/intent";
import {
  appendMessage,
  getOrCreateConversation,
  getCachedDestinationIntel,
} from "../memory/store";
import { extractAndUpdate } from "../memory/extract";
import { maybeSummarize } from "../memory/summarize";
import type { DestinationIntel } from "../schemas/intelligence";

export type OrchestratorOptions = {
  /** Optional user id for memory injection. */
  userId?: string | null;
  /** Optional anonymous session id for cross-turn continuity without auth. */
  sessionId?: string | null;
};

export type OrchestratorResult = {
  intelligence: TravelIntelligence;
  /** Merged context after both pre-filter and LLM extraction. Send back to client. */
  mergedContext: TravelContext;
  /** Hints surfaced for telemetry — which path produced the answer. */
  telemetry: {
    preFilterExtracted: string[];
    finalMode: "clarify" | "search" | "advice";
    durationMs: number;
  };
};

export async function runRayaOrchestrator(
  query: string,
  history: ChatTurn[],
  context: TravelContext,
  options: OrchestratorOptions = {},
): Promise<OrchestratorResult> {
  const t0 = Date.now();
  const { userId = null, sessionId = null } = options;

  // 1. Pre-filter — deterministic slot extraction merged into context
  const pre = runPreFilter(query, history, context);
  const enrichedContext = pre.context;
  const extractedKeys = Object.keys(pre.newlyExtracted).filter(
    (k) =>
      pre.newlyExtracted[k as keyof typeof pre.newlyExtracted] !== null &&
      pre.newlyExtracted[k as keyof typeof pre.newlyExtracted] !== undefined,
  );

  // 2. Memory + summary preparation (Phase 4 + Phase 10).
  //    Conversation tracking happens fire-and-forget; chat works even if DB fails.
  const conversationPromise =
    userId || sessionId
      ? getOrCreateConversation({ userId, sessionId, locale: pre.locale }).catch(
          () => null,
        )
      : Promise.resolve(null);

  // Compress old history when very long to keep token cost bounded.
  const { summary, truncatedHistory } = await maybeSummarize(history, null);

  // 3. LLM call (provider selector handles OpenAI → Gemini fallback)
  let intel: TravelIntelligence;
  try {
    intel = await providerGetIntelligence(
      query,
      truncatedHistory,
      enrichedContext,
      { userId, summary },
    );
  } catch (err) {
    // Re-throw so the parse route's heuristic fallback path runs.
    throw err;
  }

  // 4. Post-process — verify slots, never clobber a good message
  const { intel: finalIntel, mergedContext } = postProcess(
    intel,
    history,
    enrichedContext,
  );

  // 5. Persist + extract preferences fire-and-forget
  conversationPromise
    .then((conv) => {
      if (!conv) return;
      void appendMessage({
        conversationId: conv.id,
        role: "user",
        content: query,
      });
      void appendMessage({
        conversationId: conv.id,
        role: "assistant",
        content: finalIntel.message,
        mode: finalIntel.mode,
        intent: finalIntel.intent as unknown as Record<string, unknown>,
      });
    })
    .catch(() => null);

  if (userId) {
    void extractAndUpdate(userId, finalIntel.intent, query);
  }

  // N4: Populate destination_intel in advice mode when LLM left it null.
  // Advice answers about "is Dubai safe?" / "best time for Istanbul?" deserve
  // the side-panel intel card, not a blank. Read from cache (free, fast).
  if (
    finalIntel.mode === "advice" &&
    !finalIntel.destination_intel &&
    (finalIntel.intent.destination || mergedContext.destination)
  ) {
    const dest =
      (finalIntel.intent.destination || mergedContext.destination) ?? "";
    const locale = finalIntel.locale;
    const cached = await getCachedDestinationIntel<DestinationIntel>(
      dest,
      locale,
    ).catch(() => null);
    if (cached) finalIntel.destination_intel = cached;
  }

  // 4. Mirror merged context back into the response intent so the client
  //    has a single source of truth for what's known.
  finalIntel.intent = {
    ...finalIntel.intent,
    destination: finalIntel.intent.destination ?? mergedContext.destination,
    origin: finalIntel.intent.origin ?? mergedContext.origin,
    departure_date:
      finalIntel.intent.departure_date ?? mergedContext.departure_date,
    return_date: finalIntel.intent.return_date ?? mergedContext.return_date,
  };

  return {
    intelligence: finalIntel,
    mergedContext,
    telemetry: {
      preFilterExtracted: extractedKeys,
      finalMode: finalIntel.mode,
      durationMs: Date.now() - t0,
    },
  };
}
