import { NextRequest, NextResponse } from "next/server";
import { createSupabaseService } from "@/lib/supabase/service";

export const runtime = "nodejs";

// ── Constants ─────────────────────────────────────────────────────────────────
const COMPANION_PERMALINK = "wnjwbp";  // Rya Companion product permalink
const ACCESS_DAYS         = 60;

// Seller ID from Gumroad settings → Advanced (used to verify ping authenticity)
const EXPECTED_SELLER_ID  = process.env.GUMROAD_SELLER_ID ?? "N0ju-GlyA69hCUsGZwxulg==";

// ── Helper: insert companion unlock ─────────────────────────────────────────
async function grantAccess(email: string, orderId: string): Promise<void> {
  const expiresAt = new Date(
    Date.now() + ACCESS_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  const db = createSupabaseService();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (db as any)
    .from("companion_unlocks")
    .upsert(
      { email: email.toLowerCase(), expires_at: expiresAt, order_id: orderId },
      { onConflict: "order_id", ignoreDuplicates: true },
    );

  if (error) {
    console.error("[gumroad/ping] DB insert failed:", error.message);
    throw error;
  }

  console.log(`[gumroad/ping] ✅ Access granted → ${email} until ${expiresAt}`);
}

// ── Helper: revoke access on refund ─────────────────────────────────────────
async function revokeAccess(orderId: string): Promise<void> {
  const db = createSupabaseService();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (db as any)
    .from("companion_unlocks")
    .delete()
    .eq("order_id", orderId);

  console.log(`[gumroad/ping] 🔴 Access revoked for order ${orderId}`);
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // Gumroad sends application/x-www-form-urlencoded
    const contentType = req.headers.get("content-type") ?? "";
    let fields: Record<string, string> = {};

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await req.text();
      fields = Object.fromEntries(new URLSearchParams(text));
    } else {
      // Fallback: try JSON (test pings)
      try {
        fields = await req.json();
      } catch {
        return NextResponse.json({ error: "invalid_body" }, { status: 400 });
      }
    }

    const {
      seller_id,
      product_permalink,
      email,
      sale_id,
      refunded,
      dispute,
      test,
    } = fields;

    // ── 1. Verify seller identity ─────────────────────────────────────────────
    if (seller_id !== EXPECTED_SELLER_ID) {
      console.warn("[gumroad/ping] seller_id mismatch:", seller_id);
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // ── 2. Only handle companion product ──────────────────────────────────────
    if (product_permalink !== COMPANION_PERMALINK) {
      // Different product — acknowledge but do nothing
      return NextResponse.json({ ok: true, ignored: true });
    }

    // ── 3. Validate email ─────────────────────────────────────────────────────
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.warn("[gumroad/ping] invalid email:", email);
      return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    }

    const orderId = sale_id ?? "";

    // ── 4. Handle refund / dispute ────────────────────────────────────────────
    if (refunded === "true" || dispute === "true") {
      await revokeAccess(orderId);
      return NextResponse.json({ ok: true, action: "revoked" });
    }

    // ── 5. Skip test pings in production ─────────────────────────────────────
    if (test === "true" && process.env.NODE_ENV === "production") {
      console.log("[gumroad/ping] test ping ignored in production");
      return NextResponse.json({ ok: true, action: "test_ignored" });
    }

    // ── 6. Grant access ───────────────────────────────────────────────────────
    await grantAccess(email, orderId);

    return NextResponse.json({ ok: true, action: "granted" });
  } catch (err) {
    console.error("[gumroad/ping] unhandled error:", err);
    // Always return 200 to Gumroad so it doesn't retry endlessly
    return NextResponse.json({ ok: false, error: "internal" }, { status: 200 });
  }
}
