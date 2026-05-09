/**
 * /api/support — REST endpoint for creating + listing support tickets.
 *
 * POST: create a ticket (auth optional — anon users must provide email)
 * GET:  list the signed-in user's own tickets
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseService } from "@/lib/supabase/service";
import { getCurrentUser } from "@/lib/auth/session";
import { rateLimit } from "@/lib/security/rate-limit";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTable = any;

export const runtime = "nodejs";

const CreateBody = z.object({
  category: z.enum([
    "booking",
    "refund",
    "technical",
    "complaint",
    "question",
    "other",
  ]),
  subject: z.string().min(2).max(200),
  body: z.string().min(8).max(4000),
  contact_email: z.string().email().optional(),
  conversation_id: z.string().uuid().optional(),
  ai_summary: z.string().max(600).optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
});

export async function POST(req: NextRequest) {
  // B1: aggressive rate limit (5/min) — anti-spam for the open ticket form
  const rl = await rateLimit(req, "support", { limit: 5, windowSec: 60 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter || 60) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const parsed = CreateBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const user = await getCurrentUser();
  if (!user && !parsed.data.contact_email) {
    return NextResponse.json(
      { error: "contact_email_required_for_anon" },
      { status: 400 },
    );
  }

  const sb = createSupabaseService() as AnyTable;
  const { data, error } = await sb
    .from("support_requests")
    .insert({
      user_id: user?.id ?? null,
      conversation_id: parsed.data.conversation_id ?? null,
      category: parsed.data.category,
      subject: parsed.data.subject,
      body: parsed.data.body,
      contact_email: parsed.data.contact_email ?? user?.email ?? null,
      ai_summary: parsed.data.ai_summary ?? null,
      priority: parsed.data.priority ?? "normal",
    })
    .select("id, status, created_at")
    .single();

  if (error)
    return NextResponse.json(
      { error: "db_error", detail: error.message },
      { status: 500 },
    );

  return NextResponse.json({ ticket: data });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ tickets: [] });
  const sb = createSupabaseService() as AnyTable;
  const { data } = await sb
    .from("support_requests")
    .select("id, category, status, priority, subject, created_at, updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);
  return NextResponse.json({ tickets: data ?? [] });
}
