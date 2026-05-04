import { NextRequest, NextResponse } from "next/server";
import { getTravelIntelligence, type TravelIntelligence, type ChatTurn } from "@/lib/gemini";
import {
  heuristicParse,
  detectLocale,
  detectWants,
} from "@/lib/mock-intent";

export const runtime = "nodejs";

// ── In-memory rate limiter: 15 AI requests/min per IP ─────────────────────
const _parseCounters = new Map<string, { count: number; resetAt: number }>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const rec = _parseCounters.get(ip);
  if (!rec || now > rec.resetAt) {
    _parseCounters.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  rec.count++;
  return rec.count > 15;
}

const MAX_QUERY_LENGTH = 600;

function isGeminiError(message: string) {
  return /API_KEY_INVALID|API key not valid|PERMISSION_DENIED|UNAUTHENTICATED|RESOURCE_EXHAUSTED|quota|rate.?limit|429|404|fetch|network|json|zod|parse|invalid/i.test(
    message,
  );
}

/**
 * SERVER-SIDE CONVERSATION ENFORCEMENT
 * ─────────────────────────────────────
 * Regardless of what Gemini returns, we never trigger a search unless
 * the minimum required context is present. This is the safety net that
 * prevents "dumb" behaviour when the model ignores prompt instructions.
 *
 * Rules:
 *  1. No departure date  → clarify (ask when)
 *  2. Wants flights but no origin city → clarify (ask from where)
 *  3. First message AND destination is vague (country-level) → clarify
 */
function enforceConversationalMode(
  intel: TravelIntelligence,
  _history: ChatTurn[],
): TravelIntelligence {
  // Advice mode is always appropriate — never override it
  if (intel.mode === "advice") return intel;
  // Already clarifying — respect that
  if (intel.mode === "clarify") return intel;

  const isAr = intel.locale === "ar";
  const dest = intel.intent.destination ?? (isAr ? "وجهتك" : "your destination");
  const wantsFlights = intel.wants.includes("flights");
  const hasDate = !!intel.intent.departure_date;
  const hasOrigin = !!intel.intent.origin;

  // Rule 1: No dates → ask when
  if (!hasDate) {
    intel.mode = "clarify";
    intel.message = isAr
      ? `${dest} — اختيار ممتاز! 🌍 متى تفكر تسافر؟ حتى لو مجرد شهر تقريبي يكفي.`
      : `${dest} sounds amazing! 🌍 When are you thinking of going? Even a rough month helps me search better.`;
    return intel;
  }

  // Rule 2: Wants flights but no origin → ask from where
  if (wantsFlights && !hasOrigin) {
    intel.mode = "clarify";
    intel.message = isAr
      ? `ممتاز! من أي مدينة أو مطار ستسافر؟`
      : `Great! Which city or airport are you flying from?`;
    return intel;
  }

  // All good — search is appropriate
  return intel;
}

// Destination name lookup for heuristic fallback responses
const IATA_TO_NAME_AR: Record<string, string> = {
  MLE: "المالديف", DXB: "دبي", IST: "إسطنبول", AYT: "أنطاليا",
  DPS: "بالي", LHR: "لندن", CDG: "باريس", NRT: "طوكيو",
  BKK: "بانكوك", SIN: "سنغافورة", RUH: "الرياض", JED: "جدة",
  DOH: "الدوحة", AUH: "أبوظبي", CAI: "القاهرة", AMM: "عمّان",
  FCO: "روما", BCN: "برشلونة", ATH: "أثينا", VIE: "فيينا",
  RAK: "مراكش", TBS: "تبليسي", GYD: "باكو", JFK: "نيويورك",
  CMB: "سريلانكا", DEL: "دلهي", ICN: "سيول", MCT: "مسقط",
};
const IATA_TO_NAME_EN: Record<string, string> = {
  MLE: "the Maldives", DXB: "Dubai", IST: "Istanbul", AYT: "Antalya",
  DPS: "Bali", LHR: "London", CDG: "Paris", NRT: "Tokyo",
  BKK: "Bangkok", SIN: "Singapore", RUH: "Riyadh", JED: "Jeddah",
  DOH: "Doha", AUH: "Abu Dhabi", CAI: "Cairo", AMM: "Amman",
  FCO: "Rome", BCN: "Barcelona", ATH: "Athens", VIE: "Vienna",
  RAK: "Marrakech", TBS: "Tbilisi", GYD: "Baku", JFK: "New York",
  CMB: "Sri Lanka", DEL: "Delhi", ICN: "Seoul", MCT: "Muscat",
};

/**
 * Context-aware heuristic fallback when Gemini is unavailable.
 * Uses the extracted intent to craft a relevant response instead of generic text.
 */
function heuristicFallback(query: string, notice: string) {
  const locale = detectLocale(query);
  const intent = heuristicParse(query);
  const wants = detectWants(query);
  const isAr = locale === "ar";

  const destIata = intent.destination;
  const destNameAr = (destIata && IATA_TO_NAME_AR[destIata]) || null;
  const destNameEn = (destIata && IATA_TO_NAME_EN[destIata]) || null;
  const isHoneymoon = intent.trip_type === "honeymoon";
  const isFamily = intent.trip_type === "family";
  const hasDate = !!intent.departure_date;
  const hasOrigin = !!intent.origin;

  let message: string;

  if (isAr) {
    if (destNameAr && !hasDate) {
      const opener = isHoneymoon
        ? `شهر عسل في ${destNameAr} — حلم حقيقي! 🌴`
        : isFamily
          ? `رحلة عائلية إلى ${destNameAr} — خيار ممتاز! 🌍`
          : `${destNameAr} — وجهة رائعة! 🌍`;
      message = `${opener} متى تفكرون في السفر؟ حتى لو شهر تقريبي يكفي لأبحث لك.`;
    } else if (destNameAr && hasDate && !hasOrigin) {
      message = `ممتاز! من أي مدينة أو مطار ستنطلق رحلتك إلى ${destNameAr}؟`;
    } else if (!destNameAr) {
      message = "يسعدني أساعدك في تخطيط رحلتك! 😊 إلى أين تفكر في السفر؟";
    } else {
      message = `ممتاز! سأساعدك في تخطيط رحلتك إلى ${destNameAr}. كم عدد المسافرين؟`;
    }
  } else {
    if (destNameEn && !hasDate) {
      const opener = isHoneymoon
        ? `${destNameEn} honeymoon — what a dream! 🌴`
        : isFamily
          ? `A family trip to ${destNameEn} — great choice! 🌍`
          : `${destNameEn} — amazing choice! 🌍`;
      message = `${opener} When are you thinking of going? Even a rough month helps me find the best deals.`;
    } else if (destNameEn && hasDate && !hasOrigin) {
      message = `Great! Which city or airport will you be flying from to ${destNameEn}?`;
    } else if (!destNameEn) {
      message = "I'd love to help plan your trip! 😊 Where are you thinking of going?";
    } else {
      message = `Great choice! I'll help you plan your ${destNameEn} trip. How many travelers?`;
    }
  }

  return NextResponse.json({
    intent,
    locale,
    mode: "clarify",
    message,
    wants,
    followup: null,
    tips: null,
    budget_verdict: null,
    confidence: null,
    destination_intel: null,
    clarification_needed: true,
    clarification_question: null,
    mock: true,
    notice,
  });
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  let query = "";
  let history: ChatTurn[] = [];
  try {
    const body = (await req.json()) as { query?: string; history?: ChatTurn[] };
    query = body.query?.trim() ?? "";
    history = Array.isArray(body.history) ? body.history.slice(-12) : [];
    if (!query || query.length < 2) {
      return NextResponse.json({ error: "Empty query" }, { status: 400 });
    }
    if (query.length > MAX_QUERY_LENGTH) {
      query = query.slice(0, MAX_QUERY_LENGTH);
    }
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  try {
    let intel = await getTravelIntelligence(query, history);

    // ── Safety net: enforce conversational mode ───────────────────────────
    intel = enforceConversationalMode(intel, history);

    // Live tips only worth fetching in confirmed search mode
    const { getLiveTips } = await import("@/lib/gemini");
    const tips = intel.mode === "search"
      ? await getLiveTips(intel.intent.destination, intel.locale).catch(() => null)
      : null;

    return NextResponse.json({
      intent: intel.intent,
      locale: intel.locale,
      mode: intel.mode,
      message: intel.message,
      wants: intel.wants,
      followup: intel.followup,
      tips,
      budget_verdict: intel.budget_verdict ?? null,
      confidence: intel.confidence ?? null,
      destination_intel: intel.destination_intel ?? null,
      clarification_needed: intel.clarification_needed ?? false,
      clarification_question: intel.clarification_question ?? null,
      mock: false,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[parse] Intelligence engine error, using heuristic fallback:", message);
    return heuristicFallback(
      query,
      isGeminiError(message) ? "gemini_error_using_heuristic" : "unknown_error_using_heuristic",
    );
  }
}
