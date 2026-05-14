import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const rl = await rateLimit(req, "csp-report", {
    limit: 60,
    windowSec: 60,
    burstLimit: 20,
    burstWindowSec: 10,
    failOpen: true,
  });
  if (!rl.allowed) {
    return new NextResponse(null, { status: 204 });
  }

  try {
    const body = await req.json();
    console.warn(JSON.stringify({
      level: "warn",
      event: "csp_violation",
      route: req.nextUrl.pathname,
      user_agent: req.headers.get("user-agent") ?? null,
      report: body,
      timestamp: new Date().toISOString(),
    }));
  } catch {
    // Browsers may send malformed or vendor-specific report payloads.
  }

  return new NextResponse(null, {
    status: 204,
    headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
  });
}
