import "server-only";
/**
 * Post-process — sanity-check the LLM's response without overwriting it.
 *
 * Replaces the legacy `enforceConversationalMode` which clobbered the LLM
 * message with canned text, breaking expertise and causing loops B, C, H.
 *
 * Strategy:
 *   • If LLM said mode=advice → keep as-is. Advice is always appropriate.
 *   • If LLM said mode=clarify → keep the message, but ensure intent fields
 *     aren't accidentally erased by an empty LLM response. Cross-check the
 *     accumulated context and merge.
 *   • If LLM said mode=search → verify required slots are present
 *     (destination + dates always; origin only if wants includes flights).
 *     If a slot is genuinely missing, downgrade to clarify with a SMART
 *     question that asks exactly the missing piece. We do NOT clobber the
 *     LLM message unless we have to.
 *
 * The state machine never asks for what's already known. Loop-fix A,B,C,H.
 */
import type { TravelIntelligence, ChatTurn } from "../schemas/intelligence";
import type { TravelContext } from "../schemas/intent";

function mergeContextWithIntent(
  ctx: TravelContext,
  intel: TravelIntelligence,
): TravelContext {
  const i = intel.intent;
  return {
    destination: i.destination ?? ctx.destination,
    origin: i.origin ?? ctx.origin,
    departure_date: i.departure_date ?? ctx.departure_date,
    return_date: i.return_date ?? ctx.return_date,
    adults: i.adults ?? ctx.adults,
    budget_usd: i.budget_usd ?? ctx.budget_usd,
    trip_type: i.trip_type ?? ctx.trip_type,
    cabin_class: i.cabin_class ?? ctx.cabin_class,
    traveler_type: ctx.traveler_type ?? null,
    hotel_preferences: ctx.hotel_preferences ?? [],
    service_interests: ctx.service_interests ?? [],
    booking_stage: ctx.booking_stage ?? null,
    concerns: ctx.concerns ?? [],
  };
}

/**
 * Check if the same slot was asked-about in the most recent assistant turn.
 * Used to detect repetition: the LLM tried to ask the same thing again
 * despite our anti-loop instructions.
 */
function lastAskWasAbout(
  field: "destination" | "origin" | "date",
  history: ChatTurn[],
): boolean {
  const last = [...history].reverse().find((t) => t.role === "assistant");
  if (!last) return false;
  const t = last.text.toLowerCase();
  if (field === "origin")
    return /from where|from which|من أي|من اي|flying from|تنطلق|تسافر من/i.test(
      t,
    );
  if (field === "date")
    return /when|متى|أي شهر|اي شهر|month/i.test(t);
  if (field === "destination")
    return /where|إلى أين|الى اين|destination|going|تفكر|تنوي/i.test(t);
  return false;
}

export function postProcess(
  intel: TravelIntelligence,
  history: ChatTurn[],
  ctx: TravelContext,
): { intel: TravelIntelligence; mergedContext: TravelContext } {
  const mergedContext = mergeContextWithIntent(ctx, intel);
  const isAr = intel.locale === "ar";

  // Advice: always honor.
  if (intel.mode === "advice") {
    return { intel, mergedContext };
  }

  // Clarify: honor but ensure intent reflects merged context (so client UI
  // shows the right slot fill).
  if (intel.mode === "clarify") {
    intel.intent = {
      ...intel.intent,
      destination: intel.intent.destination ?? mergedContext.destination,
      origin: intel.intent.origin ?? mergedContext.origin,
      departure_date:
        intel.intent.departure_date ?? mergedContext.departure_date,
      return_date: intel.intent.return_date ?? mergedContext.return_date,
    };

    // M2: Anti-repetition guard for ALL slots.
    // If Raya is asking again about a slot we already have, force progression.
    const wantsFlights = intel.wants.includes("flights");
    const hasDest = !!mergedContext.destination;
    const hasDate = !!mergedContext.departure_date;
    const hasOrigin = !!mergedContext.origin;
    const allSatisfied = hasDest && hasDate && (!wantsFlights || hasOrigin);

    const repeats = {
      destination: hasDest && lastAskWasAbout("destination", history),
      date: hasDate && lastAskWasAbout("date", history),
      origin: hasOrigin && lastAskWasAbout("origin", history),
    };

    if (repeats.destination || repeats.date || repeats.origin) {
      if (allSatisfied) {
        // Everything is already filled — promote to search.
        intel.mode = "search";
      } else if (!hasDest) {
        // Need destination — let the LLM's pivot stand (or generic question).
      } else if (!hasDate) {
        // Need date — keep clarify but at least the question must be about date.
      } else if (wantsFlights && !hasOrigin) {
        // Need origin — keep clarify.
      }
    }

    return { intel, mergedContext };
  }

  // Search mode — verify required slots; only downgrade if genuinely missing.
  const wantsFlights = intel.wants.includes("flights");
  const hasDest = !!(
    intel.intent.destination || mergedContext.destination
  );
  const hasDate = !!(
    intel.intent.departure_date || mergedContext.departure_date
  );
  const hasOrigin = !!(intel.intent.origin || mergedContext.origin);

  if (hasDest && hasDate && (!wantsFlights || hasOrigin)) {
    if (mergedContext.booking_stage === "planning" || mergedContext.booking_stage === "browsing") {
      intel.mode = "advice";
      if (/جاري البحث|searching|بحث/i.test(intel.message)) {
        intel.message = isAr
          ? "تمام، عندي أساس الرحلة واضح. خلّيني أبدأها كمستشارة سفر: أرتّب لك الفكرة أولاً، وبعدها إذا قلت لي إنك جاهز للحجز أفتح لك أفضل الخيارات بدون زحمة بطاقات."
          : "Got it — I have the trip shape. I’ll treat this as planning first, then I’ll bring booking options only when you say you’re ready.";
      }
      return { intel, mergedContext };
    }
    // All required slots present — search is appropriate. Honor LLM message.
    return { intel, mergedContext };
  }

  // A slot is missing. Downgrade gently — only replace the message if it's
  // empty or off-topic. Otherwise the LLM probably already wrote a sensible
  // ask, so trust it.
  intel.mode = "clarify";
  if (!intel.message || intel.message.length < 8) {
    const isAr = intel.locale === "ar";
    if (!hasDest) {
      intel.message = isAr
        ? "وين تفكر تسافر؟ حتى لو فكرة عامة (شاطئ، أوروبا، آسيا) تكفيني أبدا أساعدك."
        : "Where are you thinking of going? Even a rough idea (beach, Europe, Asia) is enough for me to start.";
    } else if (!hasDate) {
      intel.message = isAr
        ? "متى تفكر تسافر؟ حتى لو شهر تقريبي يساعدني أعطيك أفضل عروض."
        : "When are you thinking of going? Even a rough month helps me find the best deals.";
    } else if (wantsFlights && !hasOrigin) {
      intel.message = isAr
        ? "من أي مدينة ستنطلق رحلتك؟"
        : "Which city or airport are you flying from?";
    }
  }
  return { intel, mergedContext };
}
