import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { enablePlanSharing, getSharedPlan } from "@/lib/trip-plans/store";
import { rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

// POST /api/trip-plans/share — enable sharing for a plan, returns share_id
export async function POST(req: NextRequest) {
  const rl = await rateLimit(req, "plan-share", { limit: 20, windowSec: 60, burstLimit: 5, burstWindowSec: 15, failOpen: false });
  if (!rl.allowed) return rateLimitResponse(rl);

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "auth_required" }, { status: 401 });

  try {
    const { planId } = (await req.json()) as { planId?: string };
    if (!planId) return NextResponse.json({ error: "plan_id_required" }, { status: 400 });

    const shareId = await enablePlanSharing(user.id, planId);
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com"}/share/plan/${shareId}`;

    return NextResponse.json({ ok: true, shareId, shareUrl });
  } catch (err) {
    return NextResponse.json({ error: "share_failed", detail: err instanceof Error ? err.message : "unknown" }, { status: 500 });
  }
}

// GET /api/trip-plans/share?id=xxx — fetch a shared plan publicly (no auth)
export async function GET(req: NextRequest) {
  const shareId = req.nextUrl.searchParams.get("id")?.trim();
  if (!shareId) return NextResponse.json({ error: "id_required" }, { status: 400 });

  const plan = await getSharedPlan(shareId);
  if (!plan) return NextResponse.json({ error: "not_found" }, { status: 404 });

  // Return only the plan data — no user_id
  const { user_id: _uid, ...publicPlan } = plan;
  return NextResponse.json({ plan: publicPlan });
}
