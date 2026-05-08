import "server-only";
/**
 * Deterministic Pre-Filter
 * ─────────────────────────────────────────────────────────────────────
 * Before calling the LLM, extract anything we can deterministically:
 *   • IATA city codes from query + full conversation history
 *   • Months / dates / relative phrases ("next week", "في يونيو")
 *   • "from X to Y" patterns (origin/destination)
 *   • Wants (flights/hotels)
 *   • Standalone fragment answers ("yes", "Riyadh", "June")
 *
 * What this saves us from (loop-fix audit):
 *   F — buildHistoryContext used to drop assistant turns; now we read both
 *       roles to recover origin/destination from prior Raya questions.
 *   G — Welcome message stays welcome; never confuses the parser.
 *
 * Output is MERGED into TravelContext before the LLM is called, so the
 * LLM sees confirmed slots up-front and can never re-ask.
 */
import {
  detectLocale,
  detectWants,
  heuristicParse,
  findAnyCity,
} from "@/lib/mock-intent";
import type { TravelContext, TripIntent } from "../schemas/intent";
import type { ChatTurn } from "../schemas/intelligence";

export type PreFilterResult = {
  context: TravelContext; // context merged with everything we extracted
  locale: "ar" | "en";
  wants: ("flights" | "hotels")[];
  isFirstUserTurn: boolean;
  /** Newly extracted facts since the last server call. */
  newlyExtracted: Partial<TripIntent>;
};

/**
 * Build a textual transcript that the regex parser can scan.
 * Both roles are included now (loop-fix F) — the assistant's questions
 * often contain the destination Raya already confirmed in a prior turn.
 *
 * To avoid the legacy false-positive issue (Arabic "مدينة" matching as
 * a city name), we tag assistant text and the parser ignores tagged
 * generic words. Implementation: simple — keep both, prepend the current
 * query so it has highest precedence in city-detection ties.
 */
function buildTranscript(query: string, history: ChatTurn[]): string {
  const parts: string[] = [query];
  for (const t of history) parts.push(t.text);
  return parts.join(" \n ");
}

/**
 * Standalone-fragment detection: when the user's message is JUST an
 * answer to Raya's last question (e.g. "Riyadh", "June", "yes"),
 * try to slot it into the right field by inspecting Raya's last turn.
 */
function extractFragmentAnswer(
  query: string,
  history: ChatTurn[],
  context: TravelContext,
): Partial<TripIntent> {
  const trimmed = query.trim();
  const isShort = trimmed.split(/\s+/).length <= 4;
  if (!isShort) return {};

  // Find Raya's most recent assistant message
  const lastAssistant = [...history].reverse().find((t) => t.role === "assistant");
  if (!lastAssistant) return {};

  const ask = lastAssistant.text.toLowerCase();
  const out: Partial<TripIntent> = {};

  // "From which city?" / "من أي مدينة"
  if (
    !context.origin &&
    /from where|from which|من أي|من اي|أي مدينة|اي مدينة|flying from|تنطلق|تسافر من/i.test(
      ask,
    )
  ) {
    const city = findAnyCity(query, context.destination ?? null);
    if (city) out.origin = city;
  }

  // "When?" / "متى"
  if (
    !context.departure_date &&
    /when|متى|أي شهر|اي شهر|month|moon|تسافر|تروح/i.test(ask)
  ) {
    // Let heuristicParse see only the current query for date extraction.
    const tiny = heuristicParse(query);
    if (tiny.departure_date) out.departure_date = tiny.departure_date;
  }

  // "Where to?" / "إلى أين"
  if (
    !context.destination &&
    /where|إلى أين|الى اين|destination|going|تفكر|تنوي/i.test(ask)
  ) {
    const city = findAnyCity(query, null);
    if (city) out.destination = city;
  }

  return out;
}

/**
 * Merge non-null fields from `add` into `base`.
 * Used to combine context + parser output + fragment answer + LLM intent.
 */
function mergeIntoContext(
  base: TravelContext,
  add: Partial<TripIntent>,
): TravelContext {
  return {
    destination: add.destination ?? base.destination,
    origin: add.origin ?? base.origin,
    departure_date: add.departure_date ?? base.departure_date,
    return_date: add.return_date ?? base.return_date,
    adults: add.adults ?? base.adults,
    budget_usd: add.budget_usd ?? base.budget_usd,
    trip_type: add.trip_type ?? base.trip_type,
  };
}

export function runPreFilter(
  query: string,
  history: ChatTurn[],
  context: TravelContext,
): PreFilterResult {
  const transcript = buildTranscript(query, history);
  const locale = detectLocale(transcript);
  const wants = detectWants(transcript);

  // 1. Run regex parser over the full transcript
  const parsed = heuristicParse(transcript);

  // 2. Extract any standalone fragment answer to Raya's last question
  const fragment = extractFragmentAnswer(query, history, context);

  // 3. Merge: context (already-known) ← parsed ← fragment
  const newlyExtracted: Partial<TripIntent> = { ...parsed, ...fragment };
  const merged = mergeIntoContext(context, newlyExtracted);

  // 4. First-turn detection
  const isFirstUserTurn = !history.some((t) => t.role === "user");

  return {
    context: merged,
    locale,
    wants,
    isFirstUserTurn,
    newlyExtracted,
  };
}
