import { NextRequest, NextResponse } from "next/server";
import { buildTripPlan, type PlannerTripType } from "@/lib/trip-planner";
import { generateAITripPlan } from "@/lib/ai/plan-generator";
import { HAS_OPENAI_KEY } from "@/lib/ai/config";
import { rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;

const VALID_TRIP_TYPES: PlannerTripType[] = [
  "balanced",
  "family",
  "honeymoon",
  "budget",
  "adventure",
  "business",
];

const VALID_INTERESTS = ["nature", "kids", "shopping", "food", "culture", "relax"] as const;

export async function POST(req: NextRequest) {
  const rl = await rateLimit(req, "plan", {
    limit: 20,
    windowSec: 60,
    burstLimit: 5,
    burstWindowSec: 15,
    failOpen: false,
  });
  if (!rl.allowed) return rateLimitResponse(rl);

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
      interests?: string[];
    };

    const origin = body.origin?.trim() ?? "";
    const destination = body.destination?.trim() ?? "";
    if (origin.length < 2 || destination.length < 2) {
      return NextResponse.json({ error: "missing_route" }, { status: 400 });
    }

    const tripType = VALID_TRIP_TYPES.includes(body.tripType as PlannerTripType)
      ? (body.tripType as PlannerTripType)
      : "balanced";

    const locale: "ar" | "en" = body.locale === "en" ? "en" : "ar";
    const interests = Array.isArray(body.interests)
      ? (body.interests.filter((v) =>
          VALID_INTERESTS.includes(v as (typeof VALID_INTERESTS)[number]),
        ) as (typeof VALID_INTERESTS)[number][])
      : undefined;

    const input = {
      origin,
      destination,
      days: Math.min(Math.max(Number(body.days) || 5, 1), 14), // max 14 — GPT-4o JSON limit
      budget: Math.max(Number(body.budget) || 0, 0),
      travelers: Math.min(Math.max(Number(body.travelers) || 2, 1), 12),
      tripType,
      locale,
      currency: body.currency?.trim().slice(0, 5) || undefined,
      interests,
    };

    // ── Use GPT-4o for the preview when API key is available ──────────────
    // This ensures any city worldwide gets a real AI-generated Day 1,
    // not a generic template fallback.
    if (HAS_OPENAI_KEY) {
      try {
        // Generate just 1 day for the free preview (faster + cheaper)
        const aiPlan = await generateAITripPlan({ ...input, days: 1 });

        // Restore the user's requested days count in the metadata so the
        // paywall can show the correct "X more days locked" message.
        const previewPlan = {
          ...aiPlan,
          days: input.days,
          daysPlan: aiPlan.daysPlan.slice(0, 1),
        };
        return NextResponse.json({ plan: previewPlan, isPreview: true });
      } catch (err) {
        console.warn("[plan/preview] AI generation failed, falling back to template:", err);
        // fall through to template
      }
    }

    // ── Template fallback (no API key, or AI call failed) ────────────────
    const fullPlan = buildTripPlan(input);
    const previewPlan = {
      ...fullPlan,
      daysPlan: fullPlan.daysPlan.slice(0, 1),
    };
    return NextResponse.json({ plan: previewPlan, isPreview: true });
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
