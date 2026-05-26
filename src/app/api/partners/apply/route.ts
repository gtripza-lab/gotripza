import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseService } from "@/lib/supabase/service";
import { getCurrentUser } from "@/lib/auth/session";
import { ensureUniquePartnerCodes } from "@/lib/partner-program";
import { rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTable = any;

export const runtime = "nodejs";

const ApplyBody = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email().max(180),
  country: z.string().min(2).max(80),
  socialLinks: z.array(z.string().url()).min(1).max(8),
  mainPlatform: z.string().min(2).max(60),
  audienceSize: z.number().int().min(0).max(100_000_000),
  whyJoin: z.string().min(20).max(1600),
});

export async function POST(req: NextRequest) {
  const rl = await rateLimit(req, "partner_apply", {
    limit: 4,
    windowSec: 60 * 60,
    burstLimit: 2,
    burstWindowSec: 60,
    failOpen: false,
  });
  if (!rl.allowed) return rateLimitResponse(rl);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const parsed = ApplyBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const user = await getCurrentUser();
  const db = createSupabaseService() as AnyTable;
  const email = parsed.data.email.trim().toLowerCase();

  const { data: existing } = await db
    .from("partners")
    .select("id, status, referral_slug, referral_code")
    .ilike("email", email)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({
      partner: existing,
      existing: true,
      message: "application_already_exists",
    });
  }

  const { slug, code } = await ensureUniquePartnerCodes(parsed.data.fullName, email);
  const { data: partner, error } = await db
    .from("partners")
    .insert({
      user_id: user?.id ?? null,
      full_name: parsed.data.fullName.trim(),
      email,
      country: parsed.data.country.trim(),
      social_links: parsed.data.socialLinks,
      main_platform: parsed.data.mainPlatform.trim(),
      audience_size: parsed.data.audienceSize,
      why_join: parsed.data.whyJoin.trim(),
      status: "pending",
      referral_slug: slug,
      referral_code: code,
      commission_rate_companion: 0.25,
      commission_rate_plan: 0.4,
    })
    .select("id, status, referral_slug, referral_code")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "db_error", detail: error.message },
      { status: 500 },
    );
  }

  await db.from("referral_codes").insert({
    partner_id: partner.id,
    code,
    slug,
    active: false,
  });

  return NextResponse.json({ partner, existing: false });
}
