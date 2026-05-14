import "server-only";
/**
 * Ria Core Orchestrator
 * ─────────────────────────────────────────────────────────────────────
 * The single entry point that the parse route calls.
 *
 *   pre-filter  →  LLM (OpenAI)  →  post-process  →  result
 *
 * Persists telemetry (M14, M15) and rolls forward conversation summary
 * (M7) so long sessions stay coherent.
 */
import { runPreFilter } from "./pre-filter";
import { postProcess } from "./post-process";
import { getTravelIntelligenceWithUsage } from "../providers/openai";
import type { TravelIntelligence, ChatTurn, DestinationIntel } from "../schemas/intelligence";
import type { TravelContext } from "../schemas/intent";
import {
  appendMessage,
  getOrCreateConversation,
  getCachedDestinationIntel,
  getConversationSummary,
  getConversationState,
  setConversationSummary,
  setConversationState,
  appendAiTrace,
} from "../memory/store";
import { extractAndUpdate, extractAndUpdateAnon } from "../memory/extract";
import { maybeSummarize } from "../memory/summarize";
import { mergeLifecycleStage } from "../trip-lifecycle";
import { HAS_OPENAI_KEY } from "../config";
import { captureError } from "@/lib/observability/sentry";

export type OrchestratorOptions = {
  /** Optional user id for memory injection. */
  userId?: string | null;
  /** Optional anonymous session id for cross-turn continuity without auth. */
  sessionId?: string | null;
  /** Short-lived client-side conversation memory, used before DB summary catches up. */
  clientMemory?: {
    summary?: string | null;
    knownFacts?: string[];
    askedSlots?: string[];
    turnCount?: number;
    lastUserIntent?: string | null;
  };
};

export type OrchestratorResult = {
  /** Persisted conversation row, when the request has a user/session identity. */
  conversationId: string | null;
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

function mergeStoredContext(
  stored: Partial<TravelContext> | null | undefined,
  current: TravelContext,
): TravelContext {
  const s = stored ?? {};
  return {
    destination: current.destination ?? s.destination ?? null,
    origin: current.origin ?? s.origin ?? null,
    departure_date: current.departure_date ?? s.departure_date ?? null,
    return_date: current.return_date ?? s.return_date ?? null,
    adults: current.adults ?? s.adults ?? 2,
    budget_usd: current.budget_usd ?? s.budget_usd ?? null,
    trip_type: current.trip_type ?? s.trip_type ?? null,
    cabin_class: current.cabin_class ?? s.cabin_class ?? null,
    traveler_type: current.traveler_type ?? s.traveler_type ?? null,
    hotel_preferences: Array.from(
      new Set([...(s.hotel_preferences ?? []), ...(current.hotel_preferences ?? [])]),
    ).slice(-8),
    service_interests: Array.from(
      new Set([...(s.service_interests ?? []), ...(current.service_interests ?? [])]),
    ).slice(-8) as TravelContext["service_interests"],
    booking_stage: mergeLifecycleStage(s.booking_stage ?? null, current.booking_stage ?? null),
    concerns: Array.from(new Set([...(s.concerns ?? []), ...(current.concerns ?? [])])).slice(-10),
  };
}

export async function runRayaOrchestrator(
  query: string,
  history: ChatTurn[],
  context: TravelContext,
  options: OrchestratorOptions = {},
): Promise<OrchestratorResult> {
  const t0 = Date.now();
  const { userId = null, sessionId = null, clientMemory = null } = options;

  if (!HAS_OPENAI_KEY) throw new Error("[orchestrator] OPENAI_API_KEY not set");

  // 1. Pre-filter — deterministic slot extraction merged into context
  let pre = runPreFilter(query, history, context);
  const enrichedContext = pre.context;
  let extractedKeys = Object.keys(pre.newlyExtracted).filter(
    (k) =>
      pre.newlyExtracted[k as keyof typeof pre.newlyExtracted] !== null &&
      pre.newlyExtracted[k as keyof typeof pre.newlyExtracted] !== undefined,
  );

  // 2. Conversation lookup runs in parallel so we can load the rolling
  //    summary BEFORE the LLM call (M7).
  const conversationPromise =
    userId || sessionId
      ? getOrCreateConversation({ userId, sessionId, locale: pre.locale }).catch(
          () => null,
        )
      : Promise.resolve(null);

  // M7: Load existing rolling summary from DB so long conversations
  // stay coherent across days.
  const conv = await conversationPromise;
  const existingSummary = conv ? await getConversationSummary(conv.id).catch(() => null) : null;
  const storedState = conv ? await getConversationState(conv.id).catch(() => ({ context: null, lastIntent: null })) : null;
  const durableContext = mergeStoredContext(storedState?.context, enrichedContext);
  if (storedState?.context) {
    pre = runPreFilter(query, history, durableContext);
    extractedKeys = Array.from(
      new Set([
        ...extractedKeys,
        ...Object.keys(pre.newlyExtracted).filter(
          (k) =>
            pre.newlyExtracted[k as keyof typeof pre.newlyExtracted] !== null &&
            pre.newlyExtracted[k as keyof typeof pre.newlyExtracted] !== undefined,
        ),
      ]),
    );
  }

  // Compress old history when very long, feeding back the prior summary.
  const { summary, truncatedHistory } = await maybeSummarize(history, existingSummary);

  // M7: Persist the new summary if it changed (fire-and-forget).
  if (conv && summary && summary !== existingSummary) {
    void setConversationSummary(conv.id, summary);
  }

  // 3. LLM call (OpenAI provider). Returns usage telemetry (M14).
  let intelligence: TravelIntelligence;
  let usage: Awaited<ReturnType<typeof getTravelIntelligenceWithUsage>>["usage"] | null = null;
  try {
    const r = await getTravelIntelligenceWithUsage(
      query,
      truncatedHistory,
      pre.context,
      { userId, sessionId, summary, clientMemory },
    );
    intelligence = r.intelligence;
    usage = r.usage;
  } catch (err) {
    // M15: persist failure trace — await so Vercel lambda doesn't exit before the write
    await appendAiTrace({
      conversationId: conv?.id ?? null,
      userId,
      sessionId,
      mode: null,
      preFilter: extractedKeys,
      durationMs: Date.now() - t0,
      model: null,
      tokensIn: null,
      tokensOut: null,
      status: "error",
      errorKind: "llm",
      errorMessage: (err as Error).message.slice(0, 500),
    }).catch(() => { /* trace failure must not swallow the real error */ });
    void captureError(err, { route: "orchestrator", phase: "llm" });
    throw err;
  }

  // 4. Post-process — verify slots, never clobber a good message
  const { intel: finalIntel, mergedContext } = postProcess(
    intelligence,
    history,
    pre.context,
  );

  // N4: populate destination_intel in advice mode from cache.
  if (
    finalIntel.mode === "advice" &&
    !finalIntel.destination_intel &&
    (finalIntel.intent.destination || mergedContext.destination)
  ) {
    const dest =
      (finalIntel.intent.destination || mergedContext.destination) ?? "";
    const cached = await getCachedDestinationIntel<DestinationIntel>(
      dest,
      finalIntel.locale,
    ).catch(() => null);
    if (cached) finalIntel.destination_intel = cached;
  }

  // 5. Persist messages WITH usage telemetry (M14) — fire-and-forget.
  if (conv) {
    void (async () => {
      try {
        await setConversationState(conv.id, mergedContext, finalIntel.intent);
        await appendMessage({
          conversationId: conv.id,
          role: "user",
          content: query,
        });
        await appendMessage({
          conversationId: conv.id,
          role: "assistant",
          content: finalIntel.message,
          mode: finalIntel.mode,
          intent: finalIntel.intent as unknown as Record<string, unknown>,
          tokensIn: usage?.tokens_in ?? null,
          tokensOut: usage?.tokens_out ?? null,
          model: usage?.model ?? null,
          latencyMs: usage?.latency_ms ?? null,
          provider: "openai",
        });
      } catch (e) {
        void captureError(e, { route: "orchestrator", phase: "appendMessage" });
      }
    })();
  }

  // Persist preference signals from every successful turn. Rya can learn
  // durable preferences from planning/advice messages before booking intent.
  if (userId) {
    void extractAndUpdate(userId, finalIntel.intent, query, mergedContext);
  } else if (sessionId) {
    // M6: Anonymous memory — keyed by gtz_sid cookie.
    void extractAndUpdateAnon(sessionId, finalIntel.intent, query, mergedContext);
  }

  // M15: persist successful trace — await so Vercel lambda doesn't exit before the write
  await appendAiTrace({
    conversationId: conv?.id ?? null,
    userId,
    sessionId,
    mode: finalIntel.mode,
    preFilter: extractedKeys,
    durationMs: Date.now() - t0,
    model: usage?.model ?? null,
    tokensIn: usage?.tokens_in ?? null,
    tokensOut: usage?.tokens_out ?? null,
    status: usage?.salvaged ? "salvaged" : "ok",
    errorKind: null,
    errorMessage: null,
  }).catch(() => { /* never let trace errors affect the user response */ });

  // Mirror merged context back into the response intent so the client
  // has a single source of truth for what's known.
  finalIntel.intent = {
    ...finalIntel.intent,
    destination: mergedContext.destination ?? finalIntel.intent.destination,
    origin: mergedContext.origin ?? finalIntel.intent.origin,
    departure_date: mergedContext.departure_date ?? finalIntel.intent.departure_date,
    return_date: mergedContext.return_date ?? finalIntel.intent.return_date,
    adults: mergedContext.adults ?? finalIntel.intent.adults ?? 2,
    budget_usd: mergedContext.budget_usd ?? finalIntel.intent.budget_usd ?? null,
    trip_type: mergedContext.trip_type ?? finalIntel.intent.trip_type ?? null,
    cabin_class: mergedContext.cabin_class ?? finalIntel.intent.cabin_class ?? null,
  };

  return {
    conversationId: conv?.id ?? null,
    intelligence: finalIntel,
    mergedContext,
    telemetry: {
      preFilterExtracted: extractedKeys,
      finalMode: finalIntel.mode,
      durationMs: Date.now() - t0,
    },
  };
}
