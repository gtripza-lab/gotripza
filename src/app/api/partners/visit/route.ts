import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { recordReferralVisit, setReferralCookies } from "@/lib/partner-program";
import { rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

const VisitBody = z.object({
  code: z.string().min(2).max(80),
  path: z.string().min(1).max(500).optional(),
  source: z.string().max(80).optional(),
  campaign: z.string().max(120).optional(),
});

export async function POST(req: NextRequest) {
  const rl = await rateLimit(req, "partner_visit", {
    limit: 80,
    windowSec: 60,
    burstLimit: 20,
    burstWindowSec: 10,
    failOpen: true,
  });
  if (!rl.allowed) return rateLimitResponse(rl);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const parsed = VisitBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation" }, { status: 400 });
  }

  const attribution = await recordReferralVisit(req, parsed.data.code, parsed.data.path ?? "/", {
    source: parsed.data.source ?? "url_ref",
    campaign: parsed.data.campaign ?? "partners",
  });

  const res = NextResponse.json({ ok: Boolean(attribution) });
  if (attribution) setReferralCookies(res, attribution);
  return res;
}
