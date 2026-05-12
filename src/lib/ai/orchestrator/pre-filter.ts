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
  inferred?: Partial<TravelContext>,
): TravelContext {
  return {
    destination: add.destination ?? base.destination,
    origin: add.origin ?? base.origin,
    departure_date: add.departure_date ?? base.departure_date,
    return_date: add.return_date ?? base.return_date,
    adults: add.adults ?? base.adults,
    budget_usd: add.budget_usd ?? base.budget_usd,
    trip_type: add.trip_type ?? base.trip_type,
    cabin_class: add.cabin_class ?? base.cabin_class,
    traveler_type: inferred?.traveler_type ?? base.traveler_type ?? null,
    hotel_preferences: Array.from(new Set([
      ...(base.hotel_preferences ?? []),
      ...(inferred?.hotel_preferences ?? []),
    ])).slice(0, 8),
    service_interests: Array.from(new Set([
      ...(base.service_interests ?? []),
      ...(inferred?.service_interests ?? []),
    ])) as TravelContext["service_interests"],
    booking_stage: inferred?.booking_stage ?? base.booking_stage ?? null,
    concerns: Array.from(new Set([
      ...(base.concerns ?? []),
      ...(inferred?.concerns ?? []),
    ])).slice(0, 8),
  };
}

function inferCompanionContext(query: string, transcript: string): Partial<TravelContext> {
  const q = query.toLowerCase();
  const all = transcript.toLowerCase();
  const service_interests: NonNullable<TravelContext["service_interests"]> = [];
  const hotel_preferences: string[] = [];
  const concerns: string[] = [];

  if (/تأمين|insurance|medical cover|شنغن/i.test(all)) service_interests.push("insurance");
  if (/esim|e-sim|شريحة|شرائح|انترنت|إنترنت|airalo|yesim/i.test(all)) service_interests.push("esim");
  if (/أنشطة|نشاط|جولات|تذاكر|activities|tours|tickets|klook|tiqets|kkday/i.test(all)) service_interests.push("activities");
  if (/سيارة|تأجير|car rental|rent a car|drive/i.test(all)) service_interests.push("cars");
  if (/قطار|قطارات|train|rail/i.test(all)) service_interests.push("trains");
  if (/تعويض|تأخرت الرحلة|تأخير رحلة|flight compensation|airhelp|delayed flight/i.test(all)) service_interests.push("compensation");

  if (/عائلة|أطفال|اطفال|kids|children|family/i.test(all)) {
    concerns.push("family-friendly");
  }
  if (/زوج|زوجتي|زوجي|شهر عسل|honeymoon|couple|romantic/i.test(all)) {
    concerns.push("romantic");
  }
  if (/لوحدي|solo|alone|وحدي/i.test(all)) concerns.push("solo-comfort");
  if (/آمن|أمان|safe|safety|scam|نصب|احتيال/i.test(all)) concerns.push("safety");
  if (/ميزانية|رخيص|اقتصادي|budget|cheap|affordable/i.test(all)) concerns.push("budget");
  if (/فيزا|تأشيرة|visa|entry requirement/i.test(all)) concerns.push("visa");
  if (/طقس|حر|برد|مطر|weather|rain|hot|cold/i.test(all)) concerns.push("weather");
  if (/لغة|ترجم|ترجمة|translation|translate|menu|sign|ticket|منيو|لافتة|تذكرة/i.test(all)) concerns.push("language-help");
  if (/مطار|ترانزيت|بوابة|airport|terminal|gate|layover|connection/i.test(all)) concerns.push("airport-help");
  if (/متردد|محتار|مو متأكد|unsure|confused|hesitant|not sure/i.test(all)) concerns.push("uncertain");

  if (/قريب من|near|قريب|وسط|center|downtown/i.test(all)) hotel_preferences.push("central");
  if (/مترو|metro|subway|underground|train station|محطة/i.test(all)) hotel_preferences.push("near-transit");
  if (/بحر|شاطئ|beach|sea view|اطلالة/i.test(all)) hotel_preferences.push("beach");
  if (/عائلة|أطفال|اطفال|kids|children|family/i.test(all)) hotel_preferences.push("family-friendly");
  if (/هادئ|quiet|calm/i.test(all)) hotel_preferences.push("quiet");
  if (/فخم|luxury|5 نجوم|five star/i.test(all)) hotel_preferences.push("luxury");
  if (/اقتصادي|budget|cheap|رخيص/i.test(all)) hotel_preferences.push("budget");

  const traveler_type: TravelContext["traveler_type"] =
    /business|عمل|دوام|مؤتمر/i.test(all) ? "business" :
    /عائلة|أطفال|اطفال|kids|children|family/i.test(all) ? "family" :
    /شهر عسل|زوج|زوجتي|زوجي|honeymoon|couple|romantic/i.test(all) ? "couple" :
    /اصدقاء|أصدقاء|friends/i.test(all) ? "friends" :
    /لوحدي|solo|alone|وحدي/i.test(all) ? "solo" :
    null;

  const booking_stage: TravelContext["booking_stage"] =
    /دعم|مشكلة|شكوى|support|refund|not working/i.test(q) ? "support" :
    /احجز|احجزلي|ابحث|أرخص|سعر|عروض|تذاكر|book|booking|search|deal|price|ready/i.test(q) ? "ready_to_book" :
    /خطة|خطط|برنامج|جدول|itinerary|plan|schedule|budget/i.test(q) ? "planning" :
    /أفضل|هل|كيف|متى|قارن|compare|best|should|what|when|how|is it/i.test(q) ? "browsing" :
    null;

  return {
    traveler_type,
    hotel_preferences,
    service_interests,
    booking_stage,
    concerns,
  };
}

export function runPreFilter(
  query: string,
  history: ChatTurn[],
  context: TravelContext,
): PreFilterResult {
  const transcript = buildTranscript(query, history);
  // M5: Locale follows the CURRENT user turn so mixed-language flows
  // respond in the language the user just typed.
  const locale = detectLocale(query) || detectLocale(transcript);
  const wants = detectWants(transcript);

  // 1. M5: Parse current query FIRST so contradictions ("from Riyadh"
  //    then "actually from Jeddah") are honoured. Only fall back to
  //    transcript-wide parsing for slots the current turn left blank.
  const fromCurrent = heuristicParse(query);
  const fromTranscript = heuristicParse(transcript);
  const parsed: Partial<TripIntent> = {
    ...fromTranscript,
    // Current-turn values override transcript-wide values when present
    ...Object.fromEntries(
      Object.entries(fromCurrent).filter(([, v]) => v !== null && v !== "" && v !== undefined),
    ),
  };

  // 2. Extract any standalone fragment answer to Raya's last question
  const fragment = extractFragmentAnswer(query, history, context);

  // 3. Merge: context (already-known) ← parsed ← fragment.
  //    Current-turn extractions outrank stored context for contradictable
  //    slots (origin/destination) so corrections propagate.
  const newlyExtracted: Partial<TripIntent> = { ...parsed, ...fragment };
  const inferred = inferCompanionContext(query, transcript);
  const merged = mergeIntoContext(context, newlyExtracted, inferred);

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
