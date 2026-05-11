import "server-only";

import { createSupabaseService } from "@/lib/supabase/service";
import type { TripPlan } from "@/lib/trip-planner";

// Generated Supabase types do not include trip_plans yet.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTable = any;

export class TripPlansSetupError extends Error {
  constructor(message = "trip_plans table is not available") {
    super(message);
    this.name = "TripPlansSetupError";
  }
}

export type SavedTripPlanRow = {
  id: string;
  user_id: string;
  title: string;
  locale: "ar" | "en";
  origin: string | null;
  destination: string;
  days: number;
  travelers: number;
  budget: number | null;
  currency: string;
  trip_type: string | null;
  plan: TripPlan;
  created_at: string;
  updated_at: string;
};

function isMissingTripPlansTable(error: { code?: string; message?: string } | null | undefined) {
  if (!error) return false;
  return (
    error.code === "PGRST205" ||
    /trip_plans/i.test(error.message ?? "") && /not find|does not exist|schema cache/i.test(error.message ?? "")
  );
}

export async function saveTripPlan(userId: string, plan: TripPlan) {
  const db = createSupabaseService() as AnyTable;
  const { data, error } = await db
    .from("trip_plans")
    .insert({
      user_id: userId,
      title: `${plan.destinationName} · ${plan.days} days`,
      locale: plan.currency === "SAR" ? "ar" : "en",
      origin: plan.originCode ?? plan.originName,
      destination: plan.destinationCode ?? plan.destinationName,
      days: plan.days,
      travelers: plan.travelers,
      budget: plan.budget,
      currency: plan.currency,
      trip_type: plan.tripType,
      plan,
    })
    .select("id")
    .single();

  if (isMissingTripPlansTable(error)) throw new TripPlansSetupError();
  if (error) throw new Error(error.message);
  return (data as { id: string }).id;
}

export async function getTripPlans(userId: string, limit = 30): Promise<SavedTripPlanRow[]> {
  const db = createSupabaseService() as AnyTable;
  const { data, error } = await db
    .from("trip_plans")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (isMissingTripPlansTable(error)) throw new TripPlansSetupError();
  if (error) return [];
  return (data ?? []) as SavedTripPlanRow[];
}

export async function deleteTripPlan(userId: string, planId: string) {
  const db = createSupabaseService() as AnyTable;
  const { error } = await db
    .from("trip_plans")
    .delete()
    .eq("id", planId)
    .eq("user_id", userId);
  if (isMissingTripPlansTable(error)) throw new TripPlansSetupError();
  if (error) throw new Error(error.message);
}
