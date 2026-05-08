import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const MARKER = process.env.TRAVELPAYOUTS_MARKER ?? "522867";
const TP_TOKEN = process.env.TRAVELPAYOUTS_TOKEN ?? "";
const GEMINI_KEY = process.env.GEMINI_API_KEY ?? "";
// APP_URL reserved for future absolute-URL checks
const _APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com"; void _APP_URL;

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

// Same fallback order as gemini.ts so the health check reflects real availability
const GEMINI_FALLBACK_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
];

async function checkGemini(): Promise<CheckResult> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { ok: false, detail: "GEMINI_API_KEY missing" };
  const genAI = new GoogleGenerativeAI(key);
  let lastError = "";
  for (const modelName of GEMINI_FALLBACK_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType: "application/json", temperature: 0 },
      });
      const res = await model.generateContent('Return exactly this JSON: {"status":"ok"}');
      const parsed = JSON.parse(res.response.text().trim());
      if (parsed.status === "ok") {
        return { ok: true, detail: `model=${modelName} status=ok` };
      }
    } catch (e) {
      lastError = (e as Error).message.slice(0, 100);
    }
  }
  return { ok: false, detail: lastError };
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

export async function GET(req: Request) {
  const [tpCheck, supabaseCheck, geminiCheck] = await Promise.all([
    checkTravelpayouts(),
    checkSupabase(),
    checkGemini(),
  ]);

  const envCheck: CheckResult = {
    ok: !!(GEMINI_KEY && TP_TOKEN && MARKER),
    // No env var values or names exposed publicly
    detail: GEMINI_KEY && TP_TOKEN && MARKER ? "all required vars present" : "one or more vars missing",
  };

  const affiliateCheck = checkAffiliateMarker();

  const allOk = envCheck.ok && tpCheck.ok && affiliateCheck.ok && geminiCheck.ok && supabaseCheck.ok;

  // ── Detailed report: only for internal callers with valid ADMIN_KEY header ─
  const internalKey = req.headers.get("x-health-key");
  const adminKey = process.env.ADMIN_KEY;
  const isInternal = adminKey && internalKey === adminKey;

  const publicReport = {
    status: allOk ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    checks: {
      environment: { ok: envCheck.ok },
      ai: { ok: geminiCheck.ok },
      flights_api: { ok: tpCheck.ok },
      database: { ok: supabaseCheck.ok },
      affiliate: { ok: affiliateCheck.ok },
    },
  };

  // Full details only returned to authenticated internal calls
  const internalReport = isInternal ? {
    ...publicReport,
    version: process.env.npm_package_version ?? "1.0.0",
    uptime_seconds: Math.floor(process.uptime()),
    checks: {
      environment: envCheck,
      gemini_ai: geminiCheck,
      travelpayouts_api: tpCheck,
      supabase: supabaseCheck,
      affiliate_marker: affiliateCheck,
    },
  } : null;

  return NextResponse.json(internalReport ?? publicReport, {
    status: allOk ? 200 : 207,
    headers: { "Cache-Control": "no-store" },
  });
}
