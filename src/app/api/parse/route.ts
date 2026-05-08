import { NextRequest, NextResponse } from "next/server";
import {
  getLiveTips,
  type TravelContext,
  type ChatTurn,
} from "@/lib/ai";
import { runRayaOrchestrator } from "@/lib/ai/orchestrator/pipeline";
import { getCurrentUser } from "@/lib/auth/session";
import {
  heuristicParse,
  detectLocale,
  detectWants,
  findAnyCity,
} from "@/lib/mock-intent";

function genAnonSid(): string {
  // 22-char URL-safe random id
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined") crypto.getRandomValues(bytes);
  else for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  return Buffer.from(bytes).toString("base64url");
}

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

function isProviderError(message: string) {
  return /API_KEY_INVALID|API key not valid|PERMISSION_DENIED|UNAUTHENTICATED|RESOURCE_EXHAUSTED|quota|rate.?limit|429|404|fetch|network|json|zod|parse|invalid|openai|gemini/i.test(
    message,
  );
}

// NOTE: The legacy enforceConversationalMode override has been replaced by
// the Ria orchestrator's post-process step (see src/lib/ai/orchestrator/).

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
 * Build a unified context string from full conversation history + current query.
 * This lets the heuristic parser extract destination/dates/origin even when the
 * current message alone is just "June" or "from Riyadh".
 */
function buildHistoryContext(query: string, history: ChatTurn[]): string {
  // Only include USER messages — assistant messages often contain generic
  // words like "مدينة" (city) that falsely match city names in the parser.
  const allTexts = [
    ...history.filter((t) => t.role === "user").map((t) => t.text),
    query,
  ];
  return allTexts.join(" \n ");
}

/**
 * Determine if this is the first user turn or a follow-up.
 * Used to pick warmer "first impression" messages vs. progressive ones.
 */
function isFirstUserTurn(history: ChatTurn[]): boolean {
  return !history.some((t) => t.role === "user");
}

/**
 * Context-aware heuristic fallback when Gemini is unavailable.
 * Now reads the full conversation history so context accumulates across turns:
 *   Turn 1 user "London"  →  Raya: "When?"
 *   Turn 2 user "June"    →  Raya extracts London+June from full context, asks origin
 *   Turn 3 user "Riyadh"  →  Raya has all three → search-ready
 */
function filterNulls(ctx: TravelContext): Partial<TravelContext> {
  return Object.fromEntries(
    Object.entries(ctx).filter(([, v]) => v !== null && v !== undefined)
  ) as Partial<TravelContext>;
}

/** Detect whether the query is an advice/question (not a booking request). */
function isAdviceQuery(query: string): boolean {
  return /هل\s|كيف\s|ما\s+أفضل|متى\s+أفضل|أيها\s+أفضل|ايهما|أيهما|مقارنة|قارن|الفرق\s+بين|أفضل\s+وقت|تأشيرة|فيزا|آمن|امن\s|الطقس|الجو\s+في|ماذا\s+ألبس|ماذا\s+نلبس|هل\s+يحتاج|هل\s+تحتاج|نصائح|توصي|اقترح|ماذا\s+أفعل|ما\s+رأيك|تنصحني\s+بـ|is\s+it\s+safe|is\s+\w+\s+safe|how\s+|what\s+is\s+|when\s+is\s+best|best\s+time|compare\s+|which\s+is\s+better|visa\s+|do\s+i\s+need\s+|tips\s+for|should\s+i\s+|weather\s+in|what\s+should\s+i/i.test(query);
}

function heuristicFallback(query: string, notice: string, history: ChatTurn[], context?: TravelContext) {
  // Detect locale from the most recent user input (most reliable)
  const locale = detectLocale(query);
  const isAr = locale === "ar";

  // Advice questions (visa, safety, weather, tips) → answer briefly and offer to plan
  if (isAdviceQuery(query)) {
    return NextResponse.json({
      intent: { origin: null, destination: "", departure_date: null, return_date: null, adults: 2, budget_usd: null, trip_type: null, notes: null },
      locale,
      mode: "advice",
      message: isAr
        ? "سؤال ممتاز! 🌍 للأسف خدمة الذكاء الاصطناعي مشغولة الآن، لكن يمكنني مساعدتك بتخطيط الرحلة مباشرة. أخبرني الوجهة والتاريخ وأبحث لك عن أفضل العروض."
        : "Great question! 🌍 Our AI is a bit busy right now, but I can still help you plan your trip. Tell me your destination and dates and I'll search the best deals for you.",
      wants: ["flights", "hotels"],
      followup: null,
      tips: null,
      budget_verdict: null,
      confidence: null,
      destination_intel: null,
      clarification_needed: false,
      clarification_question: null,
      mock: true,
      notice,
    });
  }

  // Parse intent from FULL conversation context, not just current message
  const fullContext = buildHistoryContext(query, history);
  const intent = { ...heuristicParse(fullContext), ...(context ? filterNulls(context) : {}) };
  const wants = detectWants(fullContext);

  const destIata = intent.destination;
  const destNameAr = (destIata && IATA_TO_NAME_AR[destIata]) || null;
  const destNameEn = (destIata && IATA_TO_NAME_EN[destIata]) || null;
  const isHoneymoon = intent.trip_type === "honeymoon";
  const isFamily = intent.trip_type === "family";
  const hasDate = !!intent.departure_date;
  let hasOrigin = !!intent.origin;
  const isFirst = isFirstUserTurn(history);

  // ── Standalone origin detection ──────────────────────────────────────────
  // When destination + date are known but origin is missing, the current user
  // message might simply BE the origin city (answering "from where?").
  // Check the CURRENT query only — not the full history context.
  if (!hasOrigin && hasDate && (destNameAr || destNameEn)) {
    const cityFromQuery = findAnyCity(query, destIata || null);
    if (cityFromQuery) {
      intent.origin = cityFromQuery;
      hasOrigin = true;
    }
  }

  let message: string;
  let mode: "clarify" | "search" = "clarify";

  // Decision tree based on what's still missing:
  //   ① destination unknown      → ask where
  //   ② destination known, no date → ask when
  //   ③ destination + date, no origin (and wants flights) → ask from where
  //   ④ all present → search
  if (isAr) {
    if (!destNameAr) {
      message = isFirst
        ? "أهلاً! 👋 أنا ريا. إلى أين تفكر تسافر؟ سواء وجهة معينة أو حتى فكرة عامة (شاطئ، تسوق، طبيعة) أساعدك."
        : "ممكن تخبرني الوجهة اللي تفكر فيها؟ حتى لو فكرة عامة (شاطئ، أوروبا، آسيا) تكفي.";
    } else if (!hasDate) {
      const opener = isHoneymoon
        ? `شهر عسل في ${destNameAr} — حلم حقيقي! 🌴`
        : isFamily
          ? `رحلة عائلية إلى ${destNameAr} — خيار ممتاز! 🌍`
          : `${destNameAr} — اختيار رائع! ✨`;
      message = `${opener} متى تفكر تسافر؟ حتى لو مجرد شهر تقريبي يكفي.`;
    } else if (wants.includes("flights") && !hasOrigin) {
      message = `ممتاز! 🛫 من أي مدينة ستنطلق رحلتك إلى ${destNameAr}؟`;
    } else {
      // All key context present — let the client search
      mode = "search";
      message = `ممتاز! ✨ ${destNameAr}${hasOrigin ? ` من ${IATA_TO_NAME_AR[intent.origin!] ?? intent.origin}` : ""} — جاري البحث عن أفضل العروض لك...`;
    }
  } else {
    if (!destNameEn) {
      message = isFirst
        ? "Hi! 👋 I'm Raya. Where are you thinking of going? Could be a specific city or just an idea (beach, mountains, Europe) — I'll help."
        : "Tell me the destination you have in mind — even a general idea (beach, Asia, Europe) works.";
    } else if (!hasDate) {
      const opener = isHoneymoon
        ? `${destNameEn} honeymoon — what a dream! 🌴`
        : isFamily
          ? `A family trip to ${destNameEn} — great choice! 🌍`
          : `${destNameEn} — excellent pick! ✨`;
      message = `${opener} When are you thinking of going? Even a rough month helps me find the best deals.`;
    } else if (wants.includes("flights") && !hasOrigin) {
      message = `Great! 🛫 Which city will you be flying from? (to ${destNameEn})`;
    } else {
      mode = "search";
      message = `Perfect! ✨ ${destNameEn}${hasOrigin ? ` from ${IATA_TO_NAME_EN[intent.origin!] ?? intent.origin}` : ""} — searching the best deals for you now...`;
    }
  }

  return NextResponse.json({
    intent,
    locale,
    mode,
    message,
    wants,
    followup: null,
    tips: null,
    budget_verdict: null,
    confidence: null,
    destination_intel: null,
    clarification_needed: mode === "clarify",
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
  let context: TravelContext | undefined;
  try {
    // Accept legacy { role: "model" } from older clients; normalize to "assistant".
    type IncomingTurn = { role?: string; text?: string; mode?: string };
    const body = (await req.json()) as {
      query?: string;
      history?: IncomingTurn[];
      context?: TravelContext;
    };
    query = body.query?.trim() ?? "";
    history = Array.isArray(body.history)
      ? body.history.slice(-12).flatMap((t): ChatTurn[] => {
          if (typeof t?.text !== "string") return [];
          const role: ChatTurn["role"] =
            t.role === "user" ? "user" : "assistant";
          const mode =
            t.mode === "clarify" || t.mode === "search" || t.mode === "advice"
              ? (t.mode as ChatTurn["mode"])
              : undefined;
          return [{ role, text: t.text, mode }];
        })
      : [];
    context = body.context;
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
    // Default to empty context if client didn't send one (older client builds).
    const ctx: TravelContext = context ?? {
      destination: null,
      origin: null,
      departure_date: null,
      return_date: null,
      adults: 2,
      budget_usd: null,
      trip_type: null,
    };

    // Identity: signed-in user (for memory) + anon session id (for cross-turn
    // tracking when not signed in). `gtz_sid` cookie is set on the response if
    // a new one was minted.
    const user = await getCurrentUser();
    let anonSid = req.cookies.get("gtz_sid")?.value ?? null;
    let mintedSid: string | null = null;
    if (!user && !anonSid) {
      mintedSid = genAnonSid();
      anonSid = mintedSid;
    }

    // Ria orchestrator: pre-filter + LLM + post-process (Phase 3 + 4).
    // Replaces the legacy enforceConversationalMode override layer.
    const { intelligence: intel, mergedContext, telemetry } =
      await runRayaOrchestrator(query, history, ctx, {
        userId: user?.id ?? null,
        sessionId: anonSid,
      });

    console.log(
      `[parse] orch mode=${telemetry.finalMode} prefilter=${telemetry.preFilterExtracted.join(",") || "none"} ms=${telemetry.durationMs}`,
    );

    // Live tips: fire-and-forget with a 2s timeout so they never block the response (M1).
    // Client will receive tips: null immediately; a future streaming endpoint can push them.
    const tipsPromise =
      intel.mode === "search" && intel.intent.destination
        ? Promise.race([
            getLiveTips(intel.intent.destination, intel.locale).catch(() => null),
            new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000)),
          ])
        : Promise.resolve(null);
    const tips = await tipsPromise;

    const response = NextResponse.json({
      intent: intel.intent,
      // Echo back the merged context so the client can update its store
      // from the server's authoritative view (instead of merging client-side).
      context: mergedContext,
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

    if (mintedSid) {
      response.cookies.set("gtz_sid", mintedSid, {
        httpOnly: true,
        sameSite: "strict",        // M6: was "lax" — strict prevents CSRF misuse
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30, // M6: was 1 year — 30 days is sufficient for session continuity
        path: "/",
      });
    }

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      "[parse] AI engine error, falling back to heuristic:",
      message,
    );
    return heuristicFallback(
      query,
      isProviderError(message)
        ? "ai_error_using_heuristic"
        : "unknown_error_using_heuristic",
      history,
      context,
    );
  }
}
