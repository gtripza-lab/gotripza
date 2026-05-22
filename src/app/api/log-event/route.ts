import { NextRequest, NextResponse } from "next/server";
import { createSupabaseService } from "@/lib/supabase/service";
import { rateLimit } from "@/lib/security/rate-limit";
import { getCurrentUser } from "@/lib/auth/session";

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
  "companion_image_analyzed",
  "rya_consultant_started",
  "companion_try_clicked",
  "companion_signup_started",
  "login_success",
  "travel_service_interest",
  "companion_trial_started",
  "pwa_install_cta_clicked",
  "pwa_install_cta_shown",
  "pwa_app_installed",
  "pwa_ios_install_instructions_shown",
  "pwa_standalone_opened",
  "ria_quick_action_clicked",
  "ria_lifecycle_action_clicked",
  "ria_trip_phase_detected",
  "ria_companion_hub_viewed",
  "traveler_service_clicked",
  "ria_response_feedback",
  "trip_plan_generated",
  "trip_plan_feedback",
  "trip_plan_rya_followup_clicked",
  "trip_plan_day_removed",
  "trip_plan_day_swapped",
  "trip_plan_day_lightened",
  "auth_initiated",
  "signup_complete",
  "signin_complete",
]);

export async function POST(req: NextRequest) {
  // B1: rate limit at 120/min — analytics is high-volume but not infinite
  const rl = await rateLimit(req, "log-event", {
    limit: 120,
    windowSec: 60,
    burstLimit: 30,
    burstWindowSec: 10,
    failOpen: true,
  });
  if (!rl.allowed) {
    return NextResponse.json({ ok: true }); // silent drop
  }
  // Always respond 200 — analytics must never error-block the UI
  try {
    const body = await req.json() as Record<string, unknown>;
    const { name, payload, locale, path } = body;

    if (typeof name !== "string" || !ALLOWED_EVENTS.has(name)) {
      return NextResponse.json({ ok: false, error: "unknown_event" }, { status: 400 });
    }

    const user = await getCurrentUser();
    const sessionId = req.cookies.get("gtz_sid")?.value ?? null;
    const enrichedPayload = {
      ...(typeof payload === "object" && payload !== null ? payload : {}),
      user_id: user?.id ?? null,
      user_email: user?.email ?? null,
      session_id: sessionId,
      user_agent: req.headers.get("user-agent") ?? null,
    };
    const sb = createSupabaseService();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (sb as any).from("events").insert({
      name,
      payload: enrichedPayload,
      locale:  typeof locale === "string" ? locale : null,
      path:    typeof path   === "string" ? path   : null,
    });
  } catch {
    // swallow — fire-and-forget
  }

  return NextResponse.json({ ok: true });
}
