import "server-only";
/**
 * Entitlement checks — the ONE function the rest of the app calls to ask
 * "is this user allowed to use the premium feature?".
 *
 * Launch policy (RIA_PLUS_GATING_ENABLED=false):
 *   • Every signed-in user gets premium via the launch_free plan.
 *   • Anonymous users can browse, but premium Companion tools require sign-in.
 *
 * Paid policy (RIA_PLUS_GATING_ENABLED=true):
 *   • Premium = subscription.status in (active, trialing) AND plan in
 *     (plus, pro, launch_free).
 *
 * The DB column subscriptions.plan='launch_free' is the bridge: when we
 * flip gating on, we can keep launch users premium without changing rows.
 */
import { getSubscription, ensureLaunchFreeSubscription } from "@/lib/ai/memory/store";
import { createSupabaseService } from "@/lib/supabase/service";

const GATING_ON = process.env.RIA_PLUS_GATING_ENABLED === "true";

const PREMIUM_PLANS = new Set(["launch_free", "plus", "pro"]);
const ACTIVE_STATUSES = new Set(["active", "trialing"]);

export type Entitlement = {
  isPremium: boolean;
  plan: string | null;
  reason:
    | "anonymous"
    | "mobile_trial"
    | "launch_default"
    | "subscription_active"
    | "subscription_inactive"
    | "no_subscription";
};

export async function getEntitlement(
  userId: string | null | undefined,
  userEmail?: string | null,
): Promise<Entitlement> {
  if (!userId) {
    return { isPremium: false, plan: null, reason: "anonymous" };
  }

  // Launch mode: signed-in is enough. Provision the launch_free row so
  // when gating flips on, the user stays premium without manual migration.
  if (!GATING_ON) {
    void ensureLaunchFreeSubscription(userId);
    return { isPremium: true, plan: "launch_free", reason: "launch_default" };
  }

  // Gumroad-based 60-day companion access (checked by email)
  if (userEmail) {
    try {
      const db = createSupabaseService();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: unlock } = await (db as any)
        .from("companion_unlocks")
        .select("expires_at")
        .eq("email", userEmail.toLowerCase())
        .gt("expires_at", new Date().toISOString())
        .order("expires_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (unlock) {
        return { isPremium: true, plan: "companion_60d", reason: "subscription_active" };
      }
    } catch {
      // fail open — don't block premium users if DB is unreachable
    }
  }

  // Stripe-based subscription check
  const sub = await getSubscription(userId);
  if (!sub) {
    return { isPremium: false, plan: null, reason: "no_subscription" };
  }
  const planOk = PREMIUM_PLANS.has(sub.plan as string);
  const statusOk = ACTIVE_STATUSES.has(sub.status as string);
  return {
    isPremium: planOk && statusOk,
    plan: sub.plan as string,
    reason: planOk && statusOk ? "subscription_active" : "subscription_inactive",
  };
}

export async function ensurePremium(
  userId: string | null | undefined,
  userEmail?: string | null,
) {
  const ent = await getEntitlement(userId, userEmail);
  if (!ent.isPremium) {
    throw new Error(`payment_required: ${ent.reason}`);
  }
  return ent;
}

export async function hasGoTripzaAffiliateBookingSignal(userId: string | null | undefined) {
  if (!userId) return false;
  try {
    const db = createSupabaseService();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count } = await (db as any)
      .from("booking_clicks")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .in("result_type", ["flight", "hotel", "insurance", "esim", "activities", "car_rental", "trains", "compensation", "partner"]);
    return (count ?? 0) > 0;
  } catch {
    return false;
  }
}
