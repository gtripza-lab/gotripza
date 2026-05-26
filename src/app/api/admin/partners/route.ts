import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { createSupabaseService } from "@/lib/supabase/service";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTable = any;

export const runtime = "nodejs";

const UpdateBody = z.object({
  partnerId: z.string().uuid(),
  status: z.enum(["pending", "approved", "rejected", "suspended"]).optional(),
  commissionRateCompanion: z.number().min(0).max(1).optional(),
  commissionRatePlan: z.number().min(0).max(1).optional(),
  notes: z.string().max(1200).optional(),
});

export async function PATCH(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const parsed = UpdateBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const update: Record<string, unknown> = {};
  if (parsed.data.status) {
    update.status = parsed.data.status;
    update.approved_at = parsed.data.status === "approved" ? new Date().toISOString() : null;
  }
  if (typeof parsed.data.commissionRateCompanion === "number") {
    update.commission_rate_companion = parsed.data.commissionRateCompanion;
  }
  if (typeof parsed.data.commissionRatePlan === "number") {
    update.commission_rate_plan = parsed.data.commissionRatePlan;
  }
  if (typeof parsed.data.notes === "string") {
    update.notes = parsed.data.notes;
  }

  const db = createSupabaseService() as AnyTable;
  const { data: partner, error } = await db
    .from("partners")
    .update(update)
    .eq("id", parsed.data.partnerId)
    .select("id, status")
    .single();

  if (error) {
    return NextResponse.json({ error: "db_error", detail: error.message }, { status: 500 });
  }

  if (parsed.data.status) {
    await db
      .from("referral_codes")
      .update({ active: parsed.data.status === "approved" })
      .eq("partner_id", parsed.data.partnerId);

    if (parsed.data.status === "approved") {
      await db.from("partner_notifications").insert({
        partner_id: parsed.data.partnerId,
        kind: "approval",
        title: "تم قبولك في Rya Partners",
        body: "تم تفعيل رابط الإحالة الخاص بك. يمكنك الآن مشاركة ريا مستشارة السفر مع جمهورك.",
      });
    }
  }

  return NextResponse.json({ partner });
}
