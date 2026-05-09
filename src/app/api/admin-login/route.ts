import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { rateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

// 4-hour session duration
const SESSION_MAX_AGE = 60 * 60 * 4;

/**
 * Derive a session token from the ADMIN_KEY using HMAC-SHA256.
 * The raw key is NEVER stored in the cookie — only this derived token.
 */
function deriveSessionToken(adminKey: string): string {
  return createHmac("sha256", adminKey)
    .update("gotripza-admin-session-v1")
    .digest("hex");
}

/**
 * Constant-time comparison to prevent timing attacks on key checks.
 */
function safeEqual(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  // B1: brute-force protection — 5 attempts per 15 minutes per IP+sid
  const rl = await rateLimit(req, "admin-login", { limit: 5, windowSec: 900 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter || 900) } },
    );
  }

  let key = "";
  try {
    const body = (await req.json()) as { key?: string };
    key = body.key?.trim() ?? "";
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const adminKey = process.env.ADMIN_KEY;
  // Always run safeEqual against a fixed-length string so failed-because-unset
  // and failed-because-wrong are timing-indistinguishable.
  const target = adminKey ?? "x".repeat(64);
  const matches = !!key && safeEqual(key, target);
  if (!adminKey || !matches) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Valid key — store a DERIVED token (HMAC), never the raw key
  const sessionToken = deriveSessionToken(adminKey);
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  return res;
}

export async function DELETE() {
  // Logout — clear the cookie
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });
  return res;
}
