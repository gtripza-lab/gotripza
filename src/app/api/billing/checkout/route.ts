/**
 * /api/billing/checkout — Create a Checkout Session for Rya Companion.
 *
 * Activate paid plans by:
 *   1. Setting STRIPE_SECRET_KEY + STRIPE_PRICE_RYA_COMPANION_MONTHLY in env
 *      Optional discount price: STRIPE_PRICE_RYA_COMPANION_DISCOUNT_MONTHLY
 *   2. Setting RIA_PLUS_GATING_ENABLED=true (in entitlements check)
 *
 * Rya Companion is travel help during the trip, not an AI subscription.
 */
import { NextRequest, NextResponse } from "next/server";
import { getStripe, STRIPE_CONFIGURED, RIA_PLUS_PRICES } from "@/lib/billing/stripe";
import { hasGoTripzaAffiliateBookingSignal } from "@/lib/billing/entitlements";
import { getCurrentUser } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!STRIPE_CONFIGURED) {
    return NextResponse.json(
      { error: "stripe_not_configured" },
      { status: 503 },
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }

  let body: { interval?: "monthly" | "yearly"; locale?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* allow empty body */
  }
  const interval = body.interval === "yearly" ? "yearly" : "monthly";
  const hasDiscount = await hasGoTripzaAffiliateBookingSignal(user.id);
  const priceId = hasDiscount && interval === "monthly" && RIA_PLUS_PRICES.discountedMonthly
    ? RIA_PLUS_PRICES.discountedMonthly
    : RIA_PLUS_PRICES[interval];
  if (!priceId) {
    return NextResponse.json(
      { error: `price_not_configured: ${interval}` },
      { status: 400 },
    );
  }

  const origin = req.headers.get("origin") ?? new URL(req.url).origin;
  const locale = body.locale === "ar" || body.locale === "en" ? body.locale : "ar";

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        metadata: { user_id: user.id, plan: "companion", interval, discounted: String(hasDiscount) },
      },
      customer_email: user.email ?? undefined,
      client_reference_id: user.id,
      success_url: `${origin}/${locale}/plus?companion=success`,
      cancel_url: `${origin}/${locale}/plus?companion=cancel`,
      metadata: { user_id: user.id, plan: "companion", interval, discounted: String(hasDiscount) },
      allow_promotion_codes: true,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[billing/checkout] stripe error:", (err as Error).message);
    return NextResponse.json(
      { error: "stripe_error", detail: (err as Error).message },
      { status: 502 },
    );
  }
}
