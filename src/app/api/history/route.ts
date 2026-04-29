import { NextRequest, NextResponse } from "next/server";
import { createSupabaseService } from "@/lib/supabase/service";
import { z } from "zod";

export const runtime = "nodejs";

// GET is intentionally NOT exposed — history is write-only to protect user privacy.
// Individual users retrieve their history via localStorage (client-side), not this API.

const HistoryPayloadSchema = z.object({
  query: z.string().min(1).max(500),
  destination: z.string().max(100).optional(),
  locale: z.enum(["ar", "en"]).optional(),
});

// Simple in-memory rate limiter (best-effort; resets per serverless cold start)
const ipCounters = new Map<string, { count: number; resetAt: number }>();
function isRateLimited(ip: string, limit = 30, windowMs = 60_000): boolean {
  const now = Date.now();
  const rec = ipCounters.get(ip);
  if (!rec || now > rec.resetAt) {
    ipCounters.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }
  rec.count++;
  return rec.count > limit;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting — 30 saves per minute per IP
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json({ ok: true }); // Silent — don't reveal rate limit details
    }

    let rawBody: unknown;
    try { rawBody = await request.json(); } catch { return NextResponse.json({ ok: true }); }

    const parsed = HistoryPayloadSchema.safeParse(rawBody);
    if (!parsed.success) return NextResponse.json({ ok: true }); // Best-effort: ignore invalid

    const { query, destination, locale } = parsed.data;

    const supabase = createSupabaseService();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("search_history") as any).insert({
      query,
      destination: destination ?? null,
      locale: locale ?? null,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("[history POST] Supabase error:", error.message);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[history POST] Unexpected error:", err);
    return NextResponse.json({ ok: true });
  }
}
