import { NextRequest, NextResponse } from "next/server";
import { buildTripPlan, type PlannerTripType } from "@/lib/trip-planner";
import { rateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

const TRIP_TYPES: PlannerTripType[] = [
  "balanced",
  "family",
  "honeymoon",
  "budget",
  "adventure",
  "business",
];

export async function POST(req: NextRequest) {
  const rl = await rateLimit(req, "plan", { limit: 30, windowSec: 60 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter || 60) } },
    );
  }

  try {
    const body = (await req.json()) as {
      origin?: string;
      destination?: string;
      days?: number;
      budget?: number;
      travelers?: number;
      tripType?: PlannerTripType;
      locale?: "ar" | "en";
      currency?: string;
    };

    const origin = body.origin?.trim() ?? "";
    const destination = body.destination?.trim() ?? "";
    if (origin.length < 2 || destination.length < 2) {
      return NextResponse.json({ error: "missing_route" }, { status: 400 });
    }

    const tripType = TRIP_TYPES.includes(body.tripType as PlannerTripType)
      ? (body.tripType as PlannerTripType)
      : "balanced";

    const plan = buildTripPlan({
      origin,
      destination,
      days: Number(body.days) || 5,
      budget: Number(body.budget) || 0,
      travelers: Number(body.travelers) || 2,
      tripType,
      locale: body.locale === "en" ? "en" : "ar",
      currency: body.currency?.trim().slice(0, 5) || undefined,
    });

    return NextResponse.json({ plan });
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
