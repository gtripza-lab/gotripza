import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import {
  getAgentWorkflow,
  getWorkflowId,
  type AgentWorkflowKey,
} from "@/lib/openai/agent-workflows";
import { rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

function getUserId(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || "admin";
  return `gotripza-admin-${ip.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 48)}`;
}

export async function POST(req: NextRequest) {
  const rl = await rateLimit(req, "admin-agent-session", {
    limit: 12,
    windowSec: 60,
    burstLimit: 3,
    burstWindowSec: 10,
    failOpen: false,
  });
  if (!rl.allowed) return rateLimitResponse(rl);

  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let key = "";
  try {
    const body = (await req.json()) as { key?: string };
    key = body.key?.trim() ?? "";
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const workflow = getAgentWorkflow(key);
  if (!workflow) {
    return NextResponse.json({ error: "unknown_agent" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ error: "openai_key_missing" }, { status: 503 });
  }

  const workflowId = getWorkflowId(workflow.key as AgentWorkflowKey);
  if (!workflowId) {
    return NextResponse.json(
      { error: "workflow_id_missing", envVar: workflow.envVar },
      { status: 400 },
    );
  }

  const res = await fetch("https://api.openai.com/v1/chatkit/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "OpenAI-Beta": "chatkit_beta=v1",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      workflow: { id: workflowId },
      user: getUserId(req),
    }),
    signal: AbortSignal.timeout(12_000),
  });

  const json = (await res.json().catch(() => null)) as
    | { client_secret?: string; error?: { message?: string } }
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
    workflowId,
    client_secret: json.client_secret,
  });
}
