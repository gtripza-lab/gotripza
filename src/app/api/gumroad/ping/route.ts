import { NextRequest, NextResponse } from "next/server";
import { createSupabaseService } from "@/lib/supabase/service";

export const runtime = "nodejs";

// ── Products ──────────────────────────────────────────────────────────────────
const COMPANION_PERMALINK = "wnjwbp"; // Rya Companion — 60-day access
const PLANS_PERMALINK     = "bbpsip"; // Trip Plans — 3 plan credits
const COMPANION_DAYS      = 60;
const PLANS_CREDITS       = 3;

const EXPECTED_SELLER_ID = process.env.GUMROAD_SELLER_ID ?? "N0ju-GlyA69hCUsGZwxulg==";

// ── Companion: grant 60-day access ────────────────────────────────────────────
async function grantCompanionAccess(email: string, orderId: string): Promise<void> {
  const expiresAt = new Date(Date.now() + COMPANION_DAYS * 864e5).toISOString();
  const db = createSupabaseService();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (db as any)
    .from("companion_unlocks")
    .upsert(
      { email: email.toLowerCase(), expires_at: expiresAt, order_id: orderId },
      { onConflict: "order_id", ignoreDuplicates: true },
    );
  if (error) throw new Error(`companion_unlocks upsert: ${error.message}`);
  console.log(`[gumroad/ping] ✅ Companion granted → ${email} until ${expiresAt}`);
}

async function revokeCompanionAccess(orderId: string): Promise<void> {
  const db = createSupabaseService();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (db as any).from("companion_unlocks").delete().eq("order_id", orderId);
  console.log(`[gumroad/ping] 🔴 Companion revoked for order ${orderId}`);
}

// ── Plans: add 3 credits ──────────────────────────────────────────────────────
async function grantPlanCredits(email: string, orderId: string): Promise<void> {
  const db = createSupabaseService();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (db as any)
    .from("plan_credits")
    .upsert(
      {
        email: email.toLowerCase(),
        order_id: orderId,
        credits_total: PLANS_CREDITS,
        credits_used: 0,
      },
      { onConflict: "order_id", ignoreDuplicates: true },
    );
  if (error) throw new Error(`plan_credits upsert: ${error.message}`);
  console.log(`[gumroad/ping] ✅ Plan credits (${PLANS_CREDITS}) granted → ${email}`);
}

async function revokePlanCredits(orderId: string): Promise<void> {
  const db = createSupabaseService();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (db as any).from("plan_credits").delete().eq("order_id", orderId);
  console.log(`[gumroad/ping] 🔴 Plan credits revoked for order ${orderId}`);
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    let fields: Record<string, string> = {};

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await req.text();
      fields = Object.fromEntries(new URLSearchParams(text));
    } else {
      try { fields = await req.json(); }
      catch { return NextResponse.json({ error: "invalid_body" }, { status: 400 }); }
    }

    const { seller_id, product_permalink, email, sale_id, refunded, dispute, test } = fields;

    // 1. Verify seller
    if (seller_id !== EXPECTED_SELLER_ID) {
      console.warn("[gumroad/ping] seller_id mismatch:", seller_id);
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // 2. Only handle our products
    if (product_permalink !== COMPANION_PERMALINK && product_permalink !== PLANS_PERMALINK) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    // 3. Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.warn("[gumroad/ping] invalid email:", email);
      return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    }

    const orderId = sale_id ?? "";
    const isRefund = refunded === "true" || dispute === "true";
    const isTest   = test === "true";

    // 4. Skip test pings in production
    if (isTest && process.env.NODE_ENV === "production") {
      return NextResponse.json({ ok: true, action: "test_ignored" });
    }

    // 5. Route by product
    if (product_permalink === COMPANION_PERMALINK) {
      if (isRefund) {
        await revokeCompanionAccess(orderId);
        return NextResponse.json({ ok: true, action: "companion_revoked" });
      }
      await grantCompanionAccess(email, orderId);
      return NextResponse.json({ ok: true, action: "companion_granted" });
    }

    if (product_permalink === PLANS_PERMALINK) {
      if (isRefund) {
        await revokePlanCredits(orderId);
        return NextResponse.json({ ok: true, action: "plans_revoked" });
      }
      await grantPlanCredits(email, orderId);
      return NextResponse.json({ ok: true, action: "plans_granted" });
    }

    return NextResponse.json({ ok: true, ignored: true });
  } catch (err) {
    console.error("[gumroad/ping] unhandled error:", err);
    return NextResponse.json({ ok: false, error: "internal" }, { status: 200 });
  }
}
