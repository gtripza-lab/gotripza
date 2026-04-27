import { NextRequest, NextResponse } from "next/server";
import { parseTripQuery, getLiveTips } from "@/lib/gemini";
import {
  heuristicParse,
  detectLocale,
  welcomeMessage,
  detectWants,
  followupMessage,
} from "@/lib/mock-intent";

export const runtime = "nodejs";

function looksLikeKeyError(message: string) {
  return /API_KEY_INVALID|API key not valid|PERMISSION_DENIED|UNAUTHENTICATED/i.test(
    message,
  );
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
    const result = await parseTripQuery(query);
    const tips = await getLiveTips(result.intent.destination, result.locale);
    // Defensive: if Gemini omitted followup but wants is narrow, synthesize one.
    const followup =
      result.followup ?? followupMessage(result.locale, result.wants);
    return NextResponse.json({
      intent: result.intent,
      locale: result.locale,
      message: result.message,
      wants: result.wants,
      followup,
      tips,
      mock: false,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "parse_failed";
    if (looksLikeKeyError(message)) {
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
        mock: true,
        notice: "gemini_key_invalid_using_heuristic",
      });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
