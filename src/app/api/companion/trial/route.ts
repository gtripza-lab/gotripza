import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createSupabaseService } from "@/lib/supabase/service";
import { getTrialState, RYA_TRIAL_COOKIE, RYA_TRIAL_DAYS } from "@/lib/companion/trial";

export const runtime = "nodejs";

function sessionId(req: NextRequest) {
  return req.cookies.get("gtz_sid")?.value ?? crypto.randomUUID();
}

async function logTrialEvent(req: NextRequest, name: string, startedAt: string, sid: string) {
  try {
    const user = await getCurrentUser();
    const db = createSupabaseService();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any).from("events").insert({
      name,
      payload: {
        user_id: user?.id ?? null,
        user_email: user?.email ?? null,
        session_id: sid,
        started_at: startedAt,
        trial_days: RYA_TRIAL_DAYS,
        user_agent: req.headers.get("user-agent") ?? null,
      },
      locale: req.headers.get("accept-language")?.split(",")[0] ?? null,
      path: req.nextUrl.pathname,
    });
  } catch {
    // Analytics must never block trial activation.
  }
}

export async function GET(req: NextRequest) {
  const state = getTrialState(req.cookies.get(RYA_TRIAL_COOKIE)?.value);
  return NextResponse.json({ ...state, trialDays: RYA_TRIAL_DAYS });
}

export async function POST(req: NextRequest) {
  const existing = req.cookies.get(RYA_TRIAL_COOKIE)?.value;
  const startedAt = existing && getTrialState(existing).startedAt
    ? getTrialState(existing).startedAt!
    : new Date().toISOString();
  const sid = sessionId(req);
  const state = getTrialState(startedAt);
  const res = NextResponse.json({ ...state, trialDays: RYA_TRIAL_DAYS });
  res.cookies.set(RYA_TRIAL_COOKIE, startedAt, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: RYA_TRIAL_DAYS * 86_400,
  });
  res.cookies.set("gtz_sid", sid, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  if (!existing) void logTrialEvent(req, "companion_trial_started", startedAt, sid);
  return res;
}
