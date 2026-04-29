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
  let query = "";
  try {
    const body = (await req.json()) as { query?: string };
    query = body.query?.trim() ?? "";
    if (!query || query.length < 2) {
      return NextResponse.json({ error: "Empty query" }, { status: 400 });
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
