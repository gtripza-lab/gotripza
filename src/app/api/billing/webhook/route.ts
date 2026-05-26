/**
 * /api/billing/webhook — Stripe webhook handler.
 *
 * Listens for:
 *   • checkout.session.completed       → mark subscription active
 *   • customer.subscription.updated    → sync status/period_end
 *   • customer.subscription.deleted    → mark canceled
 *
 * Setup in Stripe Dashboard → Developers → Webhooks:
 *   Endpoint URL: https://gotripza.com/api/billing/webhook
 *   Events: the three above
 *   Set STRIPE_WEBHOOK_SECRET = the signing secret Stripe gives you.
 */
import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, STRIPE_CONFIGURED } from "@/lib/billing/stripe";
import { createSupabaseService } from "@/lib/supabase/service";
import { recordPartnerConversion } from "@/lib/partner-program";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTable = any;

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!STRIPE_CONFIGURED) {
    return NextResponse.json({ error: "stripe_not_configured" }, { status: 503 });
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "webhook_secret_missing" }, { status: 503 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "missing_signature" }, { status: 400 });

  // Stripe needs the raw body for signature verification
  const rawBody = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    return NextResponse.json(
      { error: "invalid_signature", detail: (err as Error).message },
      { status: 400 },
    );
  }

  const sb = createSupabaseService() as AnyTable;

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const sess = event.data.object as Stripe.Checkout.Session;
        const userId =
          sess.client_reference_id ?? (sess.metadata?.user_id as string | undefined);
        if (!userId) break;
        const subId = sess.subscription as string | null;
        let periodEnd: string | null = null;
        let priceId: string | null = null;
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          periodEnd = new Date(sub.items.data[0]?.current_period_end * 1000).toISOString();
          priceId = sub.items.data[0]?.price.id ?? null;
        }
        await sb.from("subscriptions").upsert(
          {
            user_id: userId,
            plan: (sess.metadata?.plan as string) || "plus",
            status: "active",
            stripe_customer_id: sess.customer as string | null,
            stripe_subscription_id: subId,
            stripe_price_id: priceId,
            current_period_end: periodEnd,
          },
          { onConflict: "user_id" },
        );
        if (sess.metadata?.partner_id) {
          await recordPartnerConversion({
            partnerId: sess.metadata.partner_id,
            clickId: sess.metadata.partner_click_id || null,
            userId,
            email: sess.customer_email ?? null,
            productType: "rya_companion",
            orderId: sess.id,
            metadata: {
              stripe_customer_id: sess.customer,
              stripe_subscription_id: subId,
              price_id: priceId,
            },
          });
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.user_id as string | undefined;
        if (!userId) break;
        const status = sub.status as string;
        const periodEnd = sub.items.data[0]?.current_period_end
          ? new Date(sub.items.data[0].current_period_end * 1000).toISOString()
          : null;
        const cancelAtPeriodEnd = !!sub.cancel_at_period_end;
        await sb
          .from("subscriptions")
          .update({
            status: event.type === "customer.subscription.deleted" ? "canceled" : status,
            current_period_end: periodEnd,
            cancel_at_period_end: cancelAtPeriodEnd,
          })
          .eq("user_id", userId);
        break;
      }

      default:
        // Ignore everything else.
        break;
    }
  } catch (err) {
    console.error("[stripe/webhook] handler error:", (err as Error).message);
    // Returning 200 on internal errors avoids retry storms; we already logged.
  }

  return NextResponse.json({ received: true });
}
