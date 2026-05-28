import { NextRequest, NextResponse } from "next/server";
import { generateAITripPlan } from "@/lib/ai/plan-generator";
import type { PlannerTripType } from "@/lib/trip-planner";
import { rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { createSupabaseService } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const maxDuration = 60;

const GUMROAD_TOKEN    = process.env.GUMROAD_ACCESS_TOKEN ?? "";
const GUMROAD_PRODUCT  = "bbpsip";
const PLANS_PER_PURCHASE = 3;

// ── Gumroad purchase verification ─────────────────────────────────────────────
async function verifyGumroadPurchase(email: string): Promise<boolean> {
  if (!GUMROAD_TOKEN) {
    // No token configured — allow in dev, block in prod
    return process.env.NODE_ENV !== "production";
  }
  try {
    const url = `https://api.gumroad.com/v2/sales?email=${encodeURIComponent(email)}&product_permalink=${GUMROAD_PRODUCT}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${GUMROAD_TOKEN}` },
      next: { revalidate: 0 },
    });
    if (!res.ok) return false;
    const data = (await res.json()) as {
      success: boolean;
      sales?: { product_permalink: string; email: string }[];
    };
    if (!data.success || !Array.isArray(data.sales)) return false;
    return data.sales.some(
      (s) =>
        s.product_permalink === GUMROAD_PRODUCT &&
        s.email.toLowerCase() === email.toLowerCase(),
    );
  } catch (err) {
    console.warn("[plan/unlock] Gumroad check failed:", err);
    return false;
  }
}

// ── Track usage in Supabase ────────────────────────────────────────────────────
async function getPlansUsed(email: string): Promise<number> {
  try {
    const supabase = createSupabaseService();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count, error } = await (supabase as any)
      .from("plan_unlocks")
      .select("*", { count: "exact", head: true })
      .eq("email", email);
    if (error) throw error;
    return (count as number | null) ?? 0;
  } catch (err) {
    console.warn("[plan/unlock] Could not read usage count:", err);
    return 0; // fail open — don't block the user if DB is unreachable
  }
}

async function recordPlanUsed(
  email: string,
  origin: string,
  destination: string,
  days: number,
): Promise<void> {
  try {
    const supabase = createSupabaseService();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("plan_unlocks").insert({ email, origin, destination, days });
  } catch (err) {
    console.warn("[plan/unlock] Could not record usage:", err);
    // non-fatal — plan is still returned to the user
  }
}

// ── Route handler ──────────────────────────────────────────────────────────────
const VALID_TRIP_TYPES: PlannerTripType[] = [
  "balanced", "family", "honeymoon", "budget", "adventure", "business",
];
const VALID_INTERESTS = ["nature", "kids", "shopping", "food", "culture", "relax"] as const;

export async function POST(req: NextRequest) {
  const rl = await rateLimit(req, "plan_unlock", {
    limit: 10,
    windowSec: 60,
    burstLimit: 3,
    burstWindowSec: 15,
    failOpen: false,
  });
  if (!rl.allowed) return rateLimitResponse(rl);

  try {
    const body = (await req.json()) as {
      email?: string;
      origin?: string;
      destination?: string;
      days?: number;
      budget?: number;
      travelers?: number;
      tripType?: string;
      locale?: string;
      currency?: string;
      interests?: string[];
    };

    const email = body.email?.trim().toLowerCase() ?? "";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    }

    const origin      = body.origin?.trim() ?? "";
    const destination = body.destination?.trim() ?? "";
    if (origin.length < 2 || destination.length < 2) {
      return NextResponse.json({ error: "missing_route" }, { status: 400 });
    }

    // 1. Verify Gumroad purchase
    const purchased = await verifyGumroadPurchase(email);
    if (!purchased) {
      return NextResponse.json({ error: "purchase_not_found" }, { status: 402 });
    }

    // 2. Check usage limit — 3 plans per purchase
    const used = await getPlansUsed(email);
    if (used >= PLANS_PER_PURCHASE) {
      return NextResponse.json(
        {
          error: "limit_reached",
          used,
          limit: PLANS_PER_PURCHASE,
        },
        { status: 403 },
      );
    }

    // 3. Generate the AI plan
    const tripType = VALID_TRIP_TYPES.includes(body.tripType as PlannerTripType)
      ? (body.tripType as PlannerTripType)
      : "balanced";

    const locale: "ar" | "en" = body.locale === "en" ? "en" : "ar";
    const days = Math.min(Math.max(Number(body.days) || 5, 1), 14); // max 14 — GPT-4o JSON limit

    const plan = await generateAITripPlan({
      origin,
      destination,
      days,
      budget: Math.max(Number(body.budget) || 0, 0),
      travelers: Math.min(Math.max(Number(body.travelers) || 2, 1), 12),
      tripType,
      locale,
      currency: body.currency?.trim().slice(0, 5) || undefined,
      interests: Array.isArray(body.interests)
        ? (body.interests.filter((v) =>
            VALID_INTERESTS.includes(v as (typeof VALID_INTERESTS)[number]),
          ) as (typeof VALID_INTERESTS)[number][])
        : undefined,
    });

    // 4. Record usage (after successful generation)
    await recordPlanUsed(email, origin, destination, days);

    const remaining = PLANS_PER_PURCHASE - (used + 1);

    return NextResponse.json({ plan, remaining });
  } catch (err) {
    console.error("[plan/unlock] generation error:", err);
    return NextResponse.json({ error: "generation_failed" }, { status: 500 });
  }
}
