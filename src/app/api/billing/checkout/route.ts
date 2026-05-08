/**
 * /api/billing/checkout — Create a Stripe Checkout Session for Ria Plus.
 *
 * NOT WIRED into the UI yet. Activate when ready to start charging by:
 *   1. Setting STRIPE_SECRET_KEY + STRIPE_PRICE_RIA_PLUS_MONTHLY in env
 *   2. Setting RIA_PLUS_GATING_ENABLED=true (in entitlements check)
 *   3. Wiring a "Upgrade" button that POSTs to this endpoint
 */
import { NextRequest, NextResponse } from "next/server";
import { getStripe, STRIPE_CONFIGURED, RIA_PLUS_PRICES } from "@/lib/billing/stripe";
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
  const priceId = RIA_PLUS_PRICES[interval];
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
      customer_email: user.email ?? undefined,
      client_reference_id: user.id,
      success_url: `${origin}/${locale}?upgrade=success`,
      cancel_url: `${origin}/${locale}?upgrade=cancel`,
      metadata: { user_id: user.id, plan: "plus", interval },
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
