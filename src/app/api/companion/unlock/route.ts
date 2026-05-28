import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { createSupabaseService } from "@/lib/supabase/service";

export const runtime = "nodejs";

const GUMROAD_TOKEN   = process.env.GUMROAD_ACCESS_TOKEN ?? "";
const GUMROAD_PRODUCT = "wnjwbp";   // Rya Companion product permalink
const ACCESS_DAYS     = 60;

// ── Gumroad verification ──────────────────────────────────────────────────────
async function verifyGumroadPurchase(email: string): Promise<boolean> {
  if (!GUMROAD_TOKEN) {
    return process.env.NODE_ENV !== "production";
  }
  try {
    const url = `https://api.gumroad.com/v2/sales?email=${encodeURIComponent(email)}&product_permalink=${GUMROAD_PRODUCT}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${GUMROAD_TOKEN}` },
      next: { revalidate: 0 },
    });
    if (!res.ok) return false;
    const data = (await res.json()) as {
      success: boolean;
      sales?: { product_permalink: string; email: string }[];
    };
    if (!data.success || !Array.isArray(data.sales)) return false;
    return data.sales.some(
      (s) =>
        s.product_permalink === GUMROAD_PRODUCT &&
        s.email.toLowerCase() === email.toLowerCase(),
    );
  } catch (err) {
    console.warn("[companion/unlock] Gumroad check failed:", err);
    return false;
  }
}

// ── Check existing active unlock ───────────────────────────────────────────────
async function getActiveUnlock(
  email: string,
): Promise<{ expires_at: string } | null> {
  try {
    const db = createSupabaseService();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (db as any)
      .from("companion_unlocks")
      .select("expires_at")
      .eq("email", email.toLowerCase())
      .gt("expires_at", new Date().toISOString())
      .order("expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return data ?? null;
  } catch (err) {
    console.warn("[companion/unlock] Could not read active unlock:", err);
    return null;
  }
}

// ── Create 60-day unlock record ────────────────────────────────────────────────
async function createUnlock(email: string): Promise<string> {
  const expiresAt = new Date(
    Date.now() + ACCESS_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();
  try {
    const db = createSupabaseService();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any)
      .from("companion_unlocks")
      .insert({ email: email.toLowerCase(), expires_at: expiresAt });
  } catch (err) {
    console.warn("[companion/unlock] Could not record unlock:", err);
  }
  return expiresAt;
}

// ── Route handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const rl = await rateLimit(req, "companion_unlock", {
    limit: 10,
    windowSec: 60,
    burstLimit: 3,
    burstWindowSec: 15,
    failOpen: false,
  });
  if (!rl.allowed) return rateLimitResponse(rl);

  try {
    const body = (await req.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase() ?? "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    }

    // 1. Check if already has active access — extend it instead of blocking
    const existing = await getActiveUnlock(email);
    if (existing) {
      return NextResponse.json({
        already_active: true,
        expiresAt: existing.expires_at,
        daysRemaining: Math.ceil(
          (new Date(existing.expires_at).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24),
        ),
      });
    }

    // 2. Verify Gumroad purchase
    const purchased = await verifyGumroadPurchase(email);
    if (!purchased) {
      return NextResponse.json({ error: "purchase_not_found" }, { status: 402 });
    }

    // 3. Create 60-day unlock record
    const expiresAt = await createUnlock(email);
    const daysRemaining = ACCESS_DAYS;

    return NextResponse.json({ success: true, expiresAt, daysRemaining });
  } catch (err) {
    console.error("[companion/unlock] error:", err);
    return NextResponse.json({ error: "unlock_failed" }, { status: 500 });
  }
}
