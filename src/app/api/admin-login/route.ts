import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

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
  let key = "";
  try {
    const body = (await req.json()) as { key?: string };
    key = body.key?.trim() ?? "";
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const adminKey = process.env.ADMIN_KEY;

  // Refuse all access if ADMIN_KEY env var is not configured
  if (!adminKey) {
    console.error("[admin] ADMIN_KEY env var is not set — denying all access");
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  // Constant-time comparison — prevents timing side-channel attacks
  if (!key || !safeEqual(key, adminKey)) {
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
