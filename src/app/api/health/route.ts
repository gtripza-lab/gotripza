import { NextResponse } from "next/server";

const MARKER = process.env.TRAVELPAYOUTS_MARKER ?? "522867";
const TP_TOKEN = process.env.TRAVELPAYOUTS_TOKEN ?? "";
const GEMINI_KEY = process.env.GEMINI_API_KEY ?? process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";

interface CheckResult {
  ok: boolean;
  detail?: string;
}

async function checkTravelpayouts(): Promise<CheckResult> {
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
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return { ok: false, detail: "SUPABASE env vars missing" };
  try {
    const res = await fetch(`${url}/rest/v1/`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(4000),
    });
    return { ok: res.ok, detail: `HTTP ${res.status}` };
  } catch (e) {
    return { ok: false, detail: (e as Error).message };
  }
}

function checkAffiliateMarker(): CheckResult {
  const testUrl = new URL("https://www.aviasales.com/");
  testUrl.searchParams.set("marker", MARKER);
  testUrl.searchParams.set("subid", "ai_chat");
  const hasMarker = testUrl.searchParams.get("marker") === MARKER;
  const hasSubid = testUrl.searchParams.get("subid") === "ai_chat";
  return {
    ok: hasMarker && hasSubid,
    detail: `marker=${MARKER}, subid=ai_chat, url=${testUrl.toString().slice(0, 80)}`,
  };
}

export async function GET() {
  const [tpCheck, supabaseCheck] = await Promise.all([
    checkTravelpayouts(),
    checkSupabase(),
  ]);

  const envCheck: CheckResult = {
    ok: !!(GEMINI_KEY && TP_TOKEN && MARKER),
    detail: [
      `GEMINI_API_KEY: ${GEMINI_KEY ? "✅" : "❌ missing"}`,
      `TRAVELPAYOUTS_TOKEN: ${TP_TOKEN ? "✅" : "❌ missing"}`,
      `TRAVELPAYOUTS_MARKER: ${MARKER || "❌ missing"}`,
      `APP_URL: ${APP_URL}`,
    ].join(" | "),
  };

  const affiliateCheck = checkAffiliateMarker();

  const allOk = envCheck.ok && tpCheck.ok && affiliateCheck.ok;

  const report = {
    status: allOk ? "healthy" : "degraded",
    version: process.env.npm_package_version ?? "1.0.0",
    uptime_seconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    checks: {
      environment: envCheck,
      travelpayouts_api: tpCheck,
      supabase: supabaseCheck,
      affiliate_marker: affiliateCheck,
    },
    summary: {
      marker: MARKER,
      subid_chat: "ai_chat",
      flights_partner: "https://www.aviasales.com",
      hotels_partner: "https://www.hotellook.com",
      app_url: APP_URL,
    },
  };

  return NextResponse.json(report, {
    status: allOk ? 200 : 207,
    headers: { "Cache-Control": "no-store" },
  });
}
