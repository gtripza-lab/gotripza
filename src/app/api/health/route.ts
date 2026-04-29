import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
  // Use service-role key (server-only) to bypass RLS; fall back to anon key
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return { ok: false, detail: "SUPABASE env vars missing" };
  try {
    // Query the events table (SELECT 0 rows) — fastest non-privileged check
    const res = await fetch(`${url}/rest/v1/events?select=id&limit=1`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Accept": "application/json",
      },
      signal: AbortSignal.timeout(4000),
    });
    return { ok: res.ok, detail: `HTTP ${res.status}` };
  } catch (e) {
    return { ok: false, detail: (e as Error).message };
  }
}

async function checkGemini(): Promise<CheckResult> {
  const key = process.env.GEMINI_API_KEY ?? process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!key) return { ok: false, detail: "GEMINI_API_KEY missing" };
  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const res = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: 'Reply with only the word "ok"' }] }],
      generationConfig: { maxOutputTokens: 4, temperature: 0 },
    });
    const text = res.response.text().trim().toLowerCase();
    return { ok: text.includes("ok"), detail: `model=gemini-2.5-flash response="${text}"` };
  } catch (e) {
    return { ok: false, detail: (e as Error).message.slice(0, 120) };
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
  const [tpCheck, supabaseCheck, geminiCheck] = await Promise.all([
    checkTravelpayouts(),
    checkSupabase(),
    checkGemini(),
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

  const allOk = envCheck.ok && tpCheck.ok && affiliateCheck.ok && geminiCheck.ok && supabaseCheck.ok;

  const report = {
    status: allOk ? "healthy" : "degraded",
    version: process.env.npm_package_version ?? "1.0.0",
    uptime_seconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    checks: {
      environment: envCheck,
      gemini_ai: geminiCheck,
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
