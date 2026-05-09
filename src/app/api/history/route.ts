import { NextRequest, NextResponse } from "next/server";
import { createSupabaseService } from "@/lib/supabase/service";
import { rateLimit } from "@/lib/security/rate-limit";
import { z } from "zod";

export const runtime = "nodejs";

// GET is intentionally NOT exposed — history is write-only to protect user privacy.
// Individual users retrieve their history via localStorage (client-side), not this API.

const HistoryPayloadSchema = z.object({
  query: z.string().min(1).max(500),
  destination: z.string().max(100).optional(),
  locale: z.enum(["ar", "en"]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // B1: production rate limit (30/min)
    const rl = await rateLimit(request, "history", { limit: 30, windowSec: 60 });
    if (!rl.allowed) {
      return NextResponse.json({ ok: true });
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
