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
import { isPostBookingLifecycle, labelTripLifecycle } from "../trip-lifecycle";

function mergeContextWithIntent(
  ctx: TravelContext,
  intel: TravelIntelligence,
): TravelContext {
  const i = intel.intent;
  return {
    destination: ctx.destination ?? i.destination,
    origin: ctx.origin ?? i.origin,
    departure_date: ctx.departure_date ?? i.departure_date,
    return_date: ctx.return_date ?? i.return_date,
    adults: ctx.adults ?? i.adults,
    budget_usd: ctx.budget_usd ?? i.budget_usd,
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

type ClarifyField = "destination" | "origin" | "date" | "budget" | "traveler_type" | null;

function askedFieldFromText(text: string): ClarifyField {
  const t = text.toLowerCase();
  if (/from where|from which|which city|flying from|من أي|من اي|تنطلق|تسافر من/i.test(t)) {
    return "origin";
  }
  if (/when|which month|dates|متى|أي شهر|اي شهر|التواريخ|تاريخ/i.test(t)) {
    return "date";
  }
  if (/where|destination|going|إلى أين|الى اين|وجهة|تفكر تسافر/i.test(t)) {
    return "destination";
  }
  if (/budget|spend|ميزانية|كم ميزانيتك|كم تبغى/i.test(t)) {
    return "budget";
  }
  if (/family|couple|solo|business|عائلة|زوج|لوحدك|عمل|مين مسافر/i.test(t)) {
    return "traveler_type";
  }
  return null;
}

function missingBookingField(ctx: TravelContext, wantsFlights: boolean): "destination" | "date" | "origin" | null {
  if (!ctx.destination) return "destination";
  if (!ctx.departure_date) return "date";
  if (wantsFlights && !ctx.origin) return "origin";
  return null;
}

function hasKnownField(ctx: TravelContext, field: ClarifyField): boolean {
  if (field === "destination") return !!ctx.destination;
  if (field === "origin") return !!ctx.origin;
  if (field === "date") return !!ctx.departure_date;
  if (field === "budget") return !!ctx.budget_usd;
  if (field === "traveler_type") return !!ctx.traveler_type;
  return false;
}

function clarifyFor(field: "destination" | "date" | "origin", isAr: boolean): string {
  if (field === "destination") {
    return isAr
      ? "أعطني الوجهة التي في بالك، حتى لو كانت مدينة واحدة أو خيارين محتار بينهم، وأرتّب لك القرار بهدوء."
      : "Tell me the destination you have in mind, even if it is just one city or two options, and I’ll help narrow it down calmly.";
  }
  if (field === "date") {
    return isAr
      ? "متى تقريباً تفكر تسافر؟ الشهر يكفيني كبداية حتى أوازن لك بين الطقس والسعر والزحمة."
      : "Roughly when are you thinking of traveling? A month is enough to balance weather, price, and crowds.";
  }
  return isAr
    ? "من أي مدينة ستنطلق؟ بعدها أقدر أرتّب لك الخيارات بدون ما أعيد نفس الأسئلة."
    : "Which city are you flying from? After that I can move forward without repeating the same questions.";
}

function companionPhaseMessage(ctx: TravelContext, isAr: boolean): string {
  const destination = ctx.destination ?? (isAr ? "رحلتك" : "your trip");
  const stage = ctx.booking_stage;
  if (stage === "booked" || stage === "pre_trip") {
    return isAr
      ? `تمام، بما أن الرحلة إلى ${destination} أصبحت بعد الحجز، لن أرجع أعرض لك خيارات حجز كل مرة. خلينا نجهز الرحلة نفسها: الوصول، الشريحة، التأمين، الطقس، والشنطة.`
      : `Got it. Since ${destination} is now post-booking, I will not keep showing booking options. Let’s prepare the actual trip: arrival, mobile data, insurance, weather, and packing.`;
  }
  if (stage === "in_trip") {
    return isAr
      ? `أنا معك الآن أثناء الرحلة في ${destination}. سأركز على خطوات قصيرة ومباشرة: ترجمة، تنقل، أمان، ميزانية، وما تحتاجه الآن.`
      : `I’m with you during the trip in ${destination}. I’ll focus on short, direct help: translation, transport, safety, budget, and what you need now.`;
  }
  if (stage === "post_trip") {
    return isAr
      ? `نحن الآن بعد الرحلة إلى ${destination}. أقدر أراجع التجربة، أحفظ تفضيلاتك للرحلة القادمة، وأساعدك إذا كان هناك تعويض أو مشكلة.`
      : `We are now after the ${destination} trip. I can review what worked, remember your preferences for next time, and help with compensation or issues.`;
  }
  const label = labelTripLifecycle(stage, isAr ? "ar" : "en");
  return isAr
    ? `فهمت مرحلة الرحلة: ${label}. سأكمل معك حسب هذه المرحلة بدون تكرار نفس الأسئلة.`
    : `I understand the trip stage: ${label}. I’ll continue from there without repeating the same questions.`;
}

export function postProcess(
  intel: TravelIntelligence,
  history: ChatTurn[],
  ctx: TravelContext,
): { intel: TravelIntelligence; mergedContext: TravelContext } {
  const mergedContext = mergeContextWithIntent(ctx, intel);
  const isAr = intel.locale === "ar";
  const postBooking = isPostBookingLifecycle(mergedContext.booking_stage);

  // After booking, Rya becomes a companion, not a booking-results surface.
  // This prevents repeated cards and keeps the flow useful during real trips.
  if (postBooking && intel.mode === "search") {
    intel.mode = "advice";
    if (/جاري البحث|searching|بحث|book|booking|عروض|تذاكر/i.test(intel.message) || intel.message.length < 24) {
      intel.message = companionPhaseMessage(mergedContext, isAr);
    }
    return { intel, mergedContext };
  }

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
    const askedNow = askedFieldFromText(intel.message);
    const repeatedKnownSlot = askedNow && hasKnownField(mergedContext, askedNow);

    const repeats = {
      destination: hasDest && lastAskWasAbout("destination", history),
      date: hasDate && lastAskWasAbout("date", history),
      origin: hasOrigin && lastAskWasAbout("origin", history),
    };

    if (repeatedKnownSlot || repeats.destination || repeats.date || repeats.origin) {
      if (allSatisfied) {
        intel.mode = mergedContext.booking_stage === "ready_to_book" ? "search" : "advice";
        if (intel.mode === "advice") {
          intel.message = isAr
            ? "واضح عندي أساس الرحلة. خلّيني أكمّل معك كمستشارة سفر: أعطيك الآن أفضل خطوة عملية بناءً على اللي قلتَه، وبعدها إذا أصبحت جاهزاً للحجز أظهر لك الخيارات المناسبة بدون إزعاج."
            : "I have the trip shape now. I’ll move forward as your travel advisor: first the best practical next step, then booking options only when you’re ready.";
        }
      } else {
        const missing = missingBookingField(mergedContext, wantsFlights);
        if (missing) intel.message = clarifyFor(missing, isAr);
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
