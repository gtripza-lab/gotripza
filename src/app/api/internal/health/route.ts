import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { timingSafeEqual } from "crypto";
import { rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MARKER = process.env.TRAVELPAYOUTS_MARKER ?? "522867";
const TP_TOKEN = process.env.TRAVELPAYOUTS_TOKEN ?? "";
const OPENAI_KEY = process.env.OPENAI_API_KEY ?? "";

interface CheckResult {
  ok: boolean;
  detail?: string;
}

let cached:
  | {
      expiresAt: number;
      status: number;
      body: unknown;
    }
  | null = null;

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

function auditFailedHealth(req: NextRequest, reason: string) {
  console.warn(JSON.stringify({
    level: "warn",
    event: "internal_health_access_denied",
    route: req.nextUrl.pathname,
    reason,
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown",
    timestamp: new Date().toISOString(),
  }));
}

async function checkTravelpayouts(): Promise<CheckResult> {
  if (!TP_TOKEN) return { ok: false, detail: "TRAVELPAYOUTS_TOKEN missing" };
  try {
    const url = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?origin=JED&destination=DXB&departure_at=${new Date().toISOString().slice(0, 7)}-15&token=${TP_TOKEN}&limit=1&currency=usd`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return { ok: false, detail: `HTTP ${res.status}` };
    const json = await res.json();
    return { ok: json.success !== false, detail: `data items: ${json.data?.length ?? 0}` };
  } catch (e) {
    return { ok: false, detail: (e as Error).message };
  }
}

async function checkSupabase(): Promise<CheckResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return { ok: false, detail: "SUPABASE env vars missing" };
  try {
    const res = await fetch(`${url}/rest/v1/events?select=id&limit=1`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(4000),
    });
    return { ok: res.ok, detail: `HTTP ${res.status}` };
  } catch (e) {
    return { ok: false, detail: (e as Error).message };
  }
}

async function checkOpenAI(): Promise<CheckResult> {
  if (!OPENAI_KEY) return { ok: false, detail: "OPENAI_API_KEY missing" };
  try {
    const client = new OpenAI({ apiKey: OPENAI_KEY, timeout: 8000, maxRetries: 0 });
    const res = await client.chat.completions.create({
      model: process.env.AI_MODEL_LITE ?? "gpt-4o-mini",
      temperature: 0,
      max_tokens: 5,
      messages: [{ role: "user", content: 'Reply with the single word "ok".' }],
    });
    const text = res.choices[0]?.message?.content?.toLowerCase().trim() ?? "";
    return { ok: text.includes("ok"), detail: `model=${res.model} reply="${text}"` };
  } catch (e) {
    return { ok: false, detail: (e as Error).message.slice(0, 120) };
  }
}

function checkAffiliateMarker(): CheckResult {
  const testUrl = new URL("https://www.aviasales.com/");
  testUrl.searchParams.set("marker", MARKER);
  testUrl.searchParams.set("subid", "ai_chat");
  return {
    ok: testUrl.searchParams.get("marker") === MARKER,
    detail: `marker=${MARKER}, subid=ai_chat`,
  };
}

export async function GET(req: NextRequest) {
  const rl = await rateLimit(req, "internal-health", {
    limit: 6,
    windowSec: 60,
    burstLimit: 2,
    burstWindowSec: 10,
    failOpen: false,
  });
  if (!rl.allowed) return rateLimitResponse(rl);

  const configured = process.env.ADMIN_KEY;
  const provided = req.headers.get("x-health-key") ?? "";
  if (!configured || !provided || !safeEqual(provided, configured)) {
    auditFailedHealth(req, configured ? "invalid_key" : "missing_admin_key");
    return NextResponse.json({ error: "unauthorized" }, {
      status: 401,
      headers: {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  }

  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.body, {
      status: cached.status,
      headers: {
        "Cache-Control": "private, max-age=15",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  }

  const [tpCheck, supabaseCheck, openaiCheck] = await Promise.all([
    checkTravelpayouts(),
    checkSupabase(),
    checkOpenAI(),
  ]);
  const envCheck: CheckResult = {
    ok: !!(OPENAI_KEY && TP_TOKEN && MARKER),
    detail: OPENAI_KEY && TP_TOKEN && MARKER
      ? "all required vars present"
      : "one or more vars missing",
  };
  const affiliateCheck = checkAffiliateMarker();
  const allOk = envCheck.ok && tpCheck.ok && affiliateCheck.ok && openaiCheck.ok && supabaseCheck.ok;
  const body = {
    status: allOk ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "0.1.0",
    uptime_seconds: Math.floor(process.uptime()),
    checks: {
      environment: envCheck,
      openai: openaiCheck,
      travelpayouts_api: tpCheck,
      supabase: supabaseCheck,
      affiliate_marker: affiliateCheck,
    },
  };
  cached = { expiresAt: Date.now() + 15_000, status: allOk ? 200 : 207, body };
  return NextResponse.json(body, {
    status: allOk ? 200 : 207,
    headers: {
      "Cache-Control": "private, max-age=15",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
