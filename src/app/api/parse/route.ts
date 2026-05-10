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
import { resolveIata } from "@/lib/iata";
import { rateLimit } from "@/lib/security/rate-limit";
import { captureError } from "@/lib/observability/sentry";

function genAnonSid(): string {
  // 22-char URL-safe random id
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined") crypto.getRandomValues(bytes);
  else for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  return Buffer.from(bytes).toString("base64url");
}

export const runtime = "nodejs";

const MAX_QUERY_LENGTH = 600;
// B2: Per-message history cap. Stops 50KB×12 token bombs at the door.
const MAX_HISTORY_MSG_LEN = 1000;
// B2: Reject oversized bodies before req.json() pays the parsing cost.
const MAX_BODY_BYTES = 64 * 1024;

const CITY_COORDS: Record<string, { ar: string; en: string; lat: number; lon: number }> = {
  JED: { ar: "جدة", en: "Jeddah", lat: 21.5433, lon: 39.1728 },
  RUH: { ar: "الرياض", en: "Riyadh", lat: 24.7136, lon: 46.6753 },
  DMM: { ar: "الدمام", en: "Dammam", lat: 26.4207, lon: 50.0888 },
  MED: { ar: "المدينة", en: "Medina", lat: 24.5247, lon: 39.5692 },
  TIF: { ar: "الطائف", en: "Taif", lat: 21.4373, lon: 40.5127 },
  AHB: { ar: "أبها", en: "Abha", lat: 18.2465, lon: 42.5117 },
  TUU: { ar: "تبوك", en: "Tabuk", lat: 28.3838, lon: 36.5662 },
  ELQ: { ar: "القصيم", en: "Qassim", lat: 26.2078, lon: 43.4837 },
  GIZ: { ar: "جازان", en: "Jazan", lat: 16.8892, lon: 42.5511 },
  DXB: { ar: "دبي", en: "Dubai", lat: 25.2048, lon: 55.2708 },
  AUH: { ar: "أبوظبي", en: "Abu Dhabi", lat: 24.4539, lon: 54.3773 },
  DOH: { ar: "الدوحة", en: "Doha", lat: 25.2854, lon: 51.5310 },
  KWI: { ar: "الكويت", en: "Kuwait City", lat: 29.3759, lon: 47.9774 },
  BAH: { ar: "البحرين", en: "Bahrain", lat: 26.0667, lon: 50.5577 },
  MCT: { ar: "مسقط", en: "Muscat", lat: 23.5880, lon: 58.3829 },
  AMM: { ar: "عمّان", en: "Amman", lat: 31.9539, lon: 35.9106 },
  CAI: { ar: "القاهرة", en: "Cairo", lat: 30.0444, lon: 31.2357 },
};

function isProviderError(message: string) {
  return /API_KEY_INVALID|API key not valid|PERMISSION_DENIED|UNAUTHENTICATED|RESOURCE_EXHAUSTED|quota|rate.?limit|429|404|fetch|network|json|zod|parse|invalid|openai/i.test(
    message,
  );
}

function distanceKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const earthKm = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return Math.round(earthKm * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)));
}

function extractRouteQuestion(query: string): { origin: string; destination: string } | null {
  const cleaned = query.trim();
  const routeMatch =
    cleaned.match(/(?:من|from)\s+(.+?)\s+(?:إلى|الى|لـ|ل|to)\s+(.+?)(?:[؟?!.]|$)/i) ??
    cleaned.match(/between\s+(.+?)\s+and\s+(.+?)(?:[؟?!.]|$)/i) ??
    cleaned.match(/بين\s+(.+?)\s+و\s*(.+?)(?:[؟?!.]|$)/i);
  if (!routeMatch) return null;
  const origin = resolveIata(routeMatch[1]);
  const destination = resolveIata(routeMatch[2]);
  if (!origin || !destination || origin === destination) return null;
  if (!CITY_COORDS[origin] || !CITY_COORDS[destination]) return null;
  return { origin, destination };
}

function maybeDistanceAdvice(query: string) {
  const asksDistance =
    /كم\s+(?:تبعد|يبعد|المسافة)|المسافة\s+(?:بين|من)|كم\s+ساعة|كم\s+ساعه|how\s+far|distance\s+(?:between|from)|how\s+long/i.test(
      query,
    );
  if (!asksDistance) return null;
  const route = extractRouteQuestion(query);
  if (!route) return null;
  const locale = detectLocale(query);
  const isAr = locale === "ar";
  const from = CITY_COORDS[route.origin];
  const to = CITY_COORDS[route.destination];
  const airKm = distanceKm(from, to);
  const roadKm = Math.round(airKm * 1.12);
  const driveMin = Math.round((roadKm / 100) * 60);
  const driveHours = Math.max(1, Math.round(driveMin / 60));
  const driveRangeAr = `${driveHours.toLocaleString("ar-SA")}-${(driveHours + 1).toLocaleString("ar-SA")}`;
  const driveRangeEn = `${driveHours.toLocaleString("en-US")}-${(driveHours + 1).toLocaleString("en-US")}`;
  const flightMinutes = airKm > 700 ? "ساعة و40 دقيقة إلى ساعتين" : "ساعة تقريباً";
  const message = isAr
    ? `المسافة بين ${from.ar} و${to.ar} تقريباً ${roadKm.toLocaleString("ar-SA")} كم بالسيارة، وغالباً تستغرق حوالي ${driveRangeAr} ساعات حسب الطريق والتوقفات. بالطيران المسافة الجوية حوالي ${airKm.toLocaleString("ar-SA")} كم، والرحلة عادة ${flightMinutes}. 🚗✈️`
    : `The road distance from ${from.en} to ${to.en} is roughly ${roadKm.toLocaleString("en-US")} km, usually about ${driveRangeEn} hours by car depending on stops and traffic. The direct air distance is about ${airKm.toLocaleString("en-US")} km. 🚗✈️`;

  return NextResponse.json({
    intent: {
      origin: route.origin,
      destination: route.destination,
      departure_date: null,
      return_date: null,
      adults: 2,
      budget_usd: null,
      trip_type: null,
      cabin_class: null,
      notes: null,
    },
    context: {
      origin: route.origin,
      destination: route.destination,
      departure_date: null,
      return_date: null,
      adults: 2,
      budget_usd: null,
      trip_type: null,
      cabin_class: null,
    },
    locale,
    mode: "advice",
    message,
    wants: ["flights", "hotels"],
    followup: null,
    tips: null,
    budget_verdict: null,
    confidence: null,
    destination_intel: null,
    clarification_needed: false,
    clarification_question: null,
    mock: false,
  });
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
      intent: { origin: null, destination: "", departure_date: null, return_date: null, adults: 2, budget_usd: null, trip_type: null, cabin_class: null, notes: null },
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
  // B2: Reject oversized payloads before parsing.
  const cl = Number(req.headers.get("content-length") ?? "0");
  if (cl > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
  }

  // B1: Production rate limit — Supabase-backed sliding window, composite key
  const rl = await rateLimit(req, "parse", { limit: 20, windowSec: 60 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter || 60) } },
    );
  }

  let query = "";
  let history: ChatTurn[] = [];
  let context: TravelContext | undefined;
  try {
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
          // B2: clamp every history message length
          return [{ role, text: t.text.slice(0, MAX_HISTORY_MSG_LEN), mode }];
        })
      : [];
    context = body.context;
    if (!query || query.length < 2) {
      return NextResponse.json({ error: "Empty query" }, { status: 400 });
    }
    if (query.length > MAX_QUERY_LENGTH) {
      query = query.slice(0, MAX_QUERY_LENGTH);
    }
    // B2: strip control / zero-width / direction-override chars
    query = query.replace(/[​-‏‪-‮\x00-\x1f]/g, "");
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  try {
    const distanceAdvice = maybeDistanceAdvice(query);
    if (distanceAdvice) return distanceAdvice;

    // Default to empty context if client didn't send one (older client builds).
    const ctx: TravelContext = context ?? {
      destination: null,
      origin: null,
      departure_date: null,
      return_date: null,
      adults: 2,
      budget_usd: null,
      trip_type: null,
      cabin_class: null,
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
      // M8: sameSite=lax preserves SEO cross-site landings (Google → gotripza.com),
      // and our middleware-level Origin allowlist provides CSRF defence (B7).
      response.cookies.set("gtz_sid", mintedSid, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30, // 30 days
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
    void captureError(err, { route: "parse", phase: "orchestrator" });
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
