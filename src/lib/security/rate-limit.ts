import "server-only";
/**
 * Production rate limiter — Supabase-backed sliding window.
 *
 * Uses the existing Supabase service client (no new infra required).
 * Atomic-increment via Postgres function `rate_limit_hit(key, window_seconds, max)`.
 *
 * Design:
 *   • One row per (bucket, key) where bucket = sliding-window epoch
 *   • Composite key: req.ip + session cookie
 *   • Self-cleaning: expired rows removed by the SQL function each call
 *   • Soft-fail: if Supabase is down, allow the request rather than block users
 *
 * Each route picks a `limit` (calls/min) and `bucket` (logical name).
 */
import { createSupabaseService } from "@/lib/supabase/service";
import type { NextRequest } from "next/server";

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfter: number; // seconds
};

/**
 * Build a stable identifier per requester. We trust the leftmost
 * x-forwarded-for entry that Vercel sets, but ALSO fold in the session
 * cookie so spoofing IP alone is insufficient.
 *
 * Note: `req.ip` (Vercel-injected) is preferred when available because
 * Vercel cleans/validates it. Spoofed `x-forwarded-for` is only a last resort.
 */
export function rateLimitKey(req: NextRequest, bucket: string): string {
  // Prefer Vercel-validated IP, then leftmost XFF, then "unknown"
  const ip =
    // req.ip exists at runtime on Vercel; types vary across Next versions
    ((req as unknown as { ip?: string }).ip ?? "") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  const sid =
    req.cookies.get("gtz_sid")?.value ??
    req.cookies.get("sb-access-token")?.value?.slice(0, 16) ??
    "anon";
  return `${bucket}:${ip}:${sid}`;
}

/**
 * Atomic check-and-increment via Supabase RPC.
 * Falls back to allow-on-error so DB outages don't lock everyone out.
 */
export async function rateLimit(
  req: NextRequest,
  bucket: string,
  opts: { limit: number; windowSec?: number } = { limit: 60 },
): Promise<RateLimitResult> {
  const key = rateLimitKey(req, bucket);
  const windowSec = opts.windowSec ?? 60;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = createSupabaseService() as any;
    const { data, error } = await sb.rpc("rate_limit_hit", {
      p_key: key,
      p_window_seconds: windowSec,
      p_max: opts.limit,
    });
    if (error || !data) {
      // Fail-open on backend errors (logged for visibility)
      console.warn("[ratelimit] backend error:", error?.message ?? "no-data");
      return { allowed: true, remaining: opts.limit - 1, retryAfter: 0 };
    }
    const row = Array.isArray(data) ? data[0] : data;
    const used = Number(row?.used ?? 0);
    const remaining = Math.max(0, opts.limit - used);
    return {
      allowed: used <= opts.limit,
      remaining,
      retryAfter: used > opts.limit ? Number(row?.retry_after_seconds ?? windowSec) : 0,
    };
  } catch (err) {
    console.warn("[ratelimit] exception:", (err as Error).message);
    return { allowed: true, remaining: opts.limit - 1, retryAfter: 0 };
  }
}
