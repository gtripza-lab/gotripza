import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getTripPlans, saveTripPlan } from "@/lib/trip-plans/store";
import type { TripPlan } from "@/lib/trip-planner";
import { rateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "auth_required" }, { status: 401 });
  const plans = await getTripPlans(user.id);
  return NextResponse.json({ plans });
}

export async function POST(req: NextRequest) {
  const rl = await rateLimit(req, "trip-plans", { limit: 30, windowSec: 60 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "auth_required" }, { status: 401 });

  try {
    const body = (await req.json()) as { plan?: TripPlan };
    if (!body.plan?.destinationName || !body.plan.daysPlan?.length) {
      return NextResponse.json({ error: "invalid_plan" }, { status: 400 });
    }
    const id = await saveTripPlan(user.id, body.plan);
    return NextResponse.json({ ok: true, id });
  } catch (err) {
    return NextResponse.json(
      { error: "save_failed", detail: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
