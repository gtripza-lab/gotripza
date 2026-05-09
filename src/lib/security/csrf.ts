import "server-only";
/**
 * CSRF defence: Origin/Referer allow-list.
 *
 * Lightweight protection for state-changing POST routes. Combined with
 * SameSite=lax cookies + JSON-only POSTs, this defeats classic CSRF
 * (form-submission from attacker.com) without requiring a per-session token.
 *
 * Webhook routes (Stripe, Travelpayouts) MUST NOT use this — they are
 * called by external services and rely on signature verification instead.
 */
import { NextRequest, NextResponse } from "next/server";

const STATIC_ALLOWED = new Set([
  "gotripza.com",
  "www.gotripza.com",
  "search.gotripza.com",
  "localhost:3000",
  "localhost:3001",
]);

function envOrigins(): Set<string> {
  const extras = new Set(STATIC_ALLOWED);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    try {
      extras.add(new URL(appUrl).host);
    } catch {
      /* ignore malformed env */
    }
  }
  // Vercel preview deployments
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) extras.add(vercelUrl);
  return extras;
}

/**
 * Validates Origin or Referer against the allow-list. Returns:
 *   • null     — request is OK, continue
 *   • Response — 403 if rejected
 */
export function checkCsrf(req: NextRequest): NextResponse | null {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const allowed = envOrigins();

  // Browsers always send Origin on cross-origin POST. If it's missing AND
  // referer is missing, this is suspicious — reject.
  if (!origin && !referer) {
    return NextResponse.json(
      { error: "csrf_missing_origin" },
      { status: 403 },
    );
  }

  const candidate = origin ?? referer ?? "";
  try {
    const host = new URL(candidate).host;
    if (!allowed.has(host)) {
      return NextResponse.json(
        { error: "csrf_origin_rejected" },
        { status: 403 },
      );
    }
  } catch {
    return NextResponse.json(
      { error: "csrf_malformed_origin" },
      { status: 403 },
    );
  }
  return null;
}
