import { NextRequest, NextResponse } from "next/server";
import { recordReferralVisit, setReferralCookies } from "@/lib/partner-program";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ code: string }> },
) {
  const { code } = await props.params;
  const origin = new URL(req.url).origin;
  const next = req.nextUrl.searchParams.get("next");
  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : "/ar/plus";
  const target = new URL(safeNext, origin);
  target.searchParams.set("ref", code);
  target.searchParams.set("utm_source", "rya_partner");
  target.searchParams.set("utm_medium", "referral");
  target.searchParams.set("utm_campaign", "partners");

  const attribution = await recordReferralVisit(req, code, target.pathname + target.search, {
    source: "referral_link",
    campaign: "partners",
  });

  const res = NextResponse.redirect(target, 302);
  if (attribution) setReferralCookies(res, attribution);
  return res;
}
