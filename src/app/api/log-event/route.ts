import { NextRequest, NextResponse } from "next/server";
import { createSupabaseService } from "@/lib/supabase/service";

export const runtime = "nodejs";

const ALLOWED_EVENTS = new Set([
  "search_submitted",
  "results_rendered",
  "book_clicked",
  "followup_revealed",
  "followup_dismissed",
  "affiliate_upsell_clicked",
  "chat_message_sent",
  "chat_results_ready",
  "chat_followup_revealed",
]);

export async function POST(req: NextRequest) {
  // Always respond 200 — analytics must never error-block the UI
  try {
    const body = await req.json() as Record<string, unknown>;
    const { name, payload, locale, path } = body;

    if (typeof name !== "string" || !ALLOWED_EVENTS.has(name)) {
      return NextResponse.json({ ok: false, error: "unknown_event" }, { status: 400 });
    }

    const sb = createSupabaseService();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (sb as any).from("events").insert({
      name,
      payload: typeof payload === "object" && payload !== null ? payload : {},
      locale:  typeof locale === "string" ? locale : null,
      path:    typeof path   === "string" ? path   : null,
    });
  } catch {
    // swallow — fire-and-forget
  }

  return NextResponse.json({ ok: true });
}
