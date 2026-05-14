import "server-only";
/**
 * Entitlement checks — the ONE function the rest of the app calls to ask
 * "is this user allowed to use the premium feature?".
 *
 * Launch policy (RIA_PLUS_GATING_ENABLED=false):
 *   • Every signed-in user gets premium via the launch_free plan.
 *   • Anonymous users get a generous free experience.
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
import { cookies } from "next/headers";
import { getTrialState, RYA_TRIAL_COOKIE } from "@/lib/companion/trial";

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
): Promise<Entitlement> {
  if (!userId) {
    const trial = getTrialState((await cookies()).get(RYA_TRIAL_COOKIE)?.value);
    if (trial.active) {
      return { isPremium: true, plan: "mobile_trial", reason: "mobile_trial" };
    }
    return { isPremium: false, plan: null, reason: "anonymous" };
  }

  // Launch mode: signed-in is enough. Provision the launch_free row so
  // when gating flips on, the user stays premium without manual migration.
  if (!GATING_ON) {
    void ensureLaunchFreeSubscription(userId);
    return { isPremium: true, plan: "launch_free", reason: "launch_default" };
  }

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

export async function ensurePremium(userId: string | null | undefined) {
  const ent = await getEntitlement(userId);
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
