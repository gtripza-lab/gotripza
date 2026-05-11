import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import {
  getAgentWorkflow,
  getWorkflowId,
  type AgentWorkflowKey,
} from "@/lib/openai/agent-workflows";
import { rateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PUBLIC_RAYA_WORKFLOWS = new Set<AgentWorkflowKey>([
  "travel_research",
  "support_draft",
]);

function getFallbackUserId(req: NextRequest) {
  const sid = req.cookies.get("gtz_sid")?.value;
  if (sid) return `gotripza-session-${sid.slice(0, 48)}`;
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || "anon";
  return `gotripza-anon-${ip.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 48)}`;
}

function pickWorkflow(input: string): AgentWorkflowKey {
  const normalized = input.trim() as AgentWorkflowKey;
  if (PUBLIC_RAYA_WORKFLOWS.has(normalized)) return normalized;
  return "travel_research";
}

export async function POST(req: NextRequest) {
  const rl = await rateLimit(req, "raya-agent-session", { limit: 20, windowSec: 60 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let key: AgentWorkflowKey = "travel_research";
  try {
    const body = (await req.json().catch(() => ({}))) as { key?: string };
    key = pickWorkflow(body.key ?? "");
  } catch {
    key = "travel_research";
  }

  const workflow = getAgentWorkflow(key);
  if (!workflow) return NextResponse.json({ error: "unknown_agent" }, { status: 400 });

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return NextResponse.json({ error: "openai_key_missing" }, { status: 503 });

  const workflowId = getWorkflowId(workflow.key as AgentWorkflowKey);
  if (!workflowId) {
    return NextResponse.json(
      { error: "workflow_id_missing", envVar: workflow.envVar },
      { status: 503 },
    );
  }

  const user = await getCurrentUser();
  const userId = user?.id ? `gotripza-user-${user.id}` : getFallbackUserId(req);

  const res = await fetch("https://api.openai.com/v1/chatkit/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "OpenAI-Beta": "chatkit_beta=v1",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      workflow: { id: workflowId },
      user: userId,
    }),
    signal: AbortSignal.timeout(12_000),
  });

  const json = (await res.json().catch(() => null)) as
    | { client_secret?: string; expires_at?: number; error?: { message?: string } }
    | null;

  if (!res.ok || !json?.client_secret) {
    return NextResponse.json(
      {
        error: "chatkit_session_failed",
        detail: json?.error?.message ?? `OpenAI HTTP ${res.status}`,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    agent: workflow.key,
    name: workflow.name,
    client_secret: json.client_secret,
    expires_at: json.expires_at ?? null,
  });
}
