import { NextRequest, NextResponse } from "next/server";
import { getTravelIntelligence } from "@/lib/gemini";
import {
  heuristicParse,
  detectLocale,
  welcomeMessage,
  detectWants,
  followupMessage,
} from "@/lib/mock-intent";

export const runtime = "nodejs";

// ── In-memory rate limiter: 10 AI requests/min per IP ──────────────────────
const _parseCounters = new Map<string, { count: number; resetAt: number }>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const rec = _parseCounters.get(ip);
  if (!rec || now > rec.resetAt) {
    _parseCounters.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  rec.count++;
  return rec.count > 10;
}

const MAX_QUERY_LENGTH = 500;

function isGeminiError(message: string) {
  return /API_KEY_INVALID|API key not valid|PERMISSION_DENIED|UNAUTHENTICATED|RESOURCE_EXHAUSTED|quota|rate.?limit|429|404|fetch|network|json|zod|parse|invalid/i.test(
    message,
  );
}

function heuristicFallback(query: string, notice: string) {
  const locale = detectLocale(query);
  const intent = heuristicParse(query);
  const wants = detectWants(query);
  return NextResponse.json({
    intent,
    locale,
    message: welcomeMessage(locale),
    wants,
    followup: followupMessage(locale, wants),
    tips: null,
    // Intelligence fields — null in fallback mode
    budget_verdict: null,
    confidence: null,
    destination_intel: null,
    clarification_needed: false,
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
  try {
    const body = (await req.json()) as { query?: string };
    query = body.query?.trim() ?? "";
    if (!query || query.length < 2) {
      return NextResponse.json({ error: "Empty query" }, { status: 400 });
    }
    // Cap length to prevent token exhaustion attacks on the Gemini API
    if (query.length > MAX_QUERY_LENGTH) {
      query = query.slice(0, MAX_QUERY_LENGTH);
    }
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  try {
    const intel = await getTravelIntelligence(query);

    // Live tips: run in parallel — best effort, never blocks
    const { getLiveTips } = await import("@/lib/gemini");
    const tips = await getLiveTips(intel.intent.destination, intel.locale).catch(() => null);

    return NextResponse.json({
      intent: intel.intent,
      locale: intel.locale,
      message: intel.message,
      wants: intel.wants,
      followup: intel.followup,
      tips,
      // Full intelligence fields
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
