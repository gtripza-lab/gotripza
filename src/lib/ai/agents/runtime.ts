import "server-only";
/**
 * Generic agent runtime — runs an AgentDefinition on OpenAI.
 *
 * Used by:
 *   • Ria (via the orchestrator's specialized path)
 *   • Marketing / SEO / Analytics agents (Phase 9 stubs)
 *
 * Falls back gracefully when OpenAI is unavailable (returns null) so
 * scheduled agents don't crash background jobs.
 */
import OpenAI from "openai";
import { HAS_OPENAI_KEY, MODEL_LITE, MODEL_PRIMARY } from "../config";
import type { AgentDefinition, AgentRunInput, AgentRunResult } from "./base";

let _client: OpenAI | null = null;
function client(): OpenAI {
  _client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _client;
}

export async function runAgent<T = unknown>(
  agent: AgentDefinition<T>,
  input: AgentRunInput,
): Promise<AgentRunResult<T> | null> {
  if (!HAS_OPENAI_KEY) {
    console.warn(`[agent/${agent.id}] OPENAI_API_KEY not set, skipping`);
    return null;
  }
  const t0 = Date.now();
  const model = agent.modelTier === "primary" ? MODEL_PRIMARY : MODEL_LITE;

  const userMessage = input.context
    ? `${input.user}\n\nContext:\n${JSON.stringify(input.context, null, 2)}`
    : input.user;

  const params = {
    model,
    temperature: agent.temperature ?? 0.4,
    max_tokens: agent.maxTokens ?? 1024,
    messages: [
      { role: "system" as const, content: agent.systemPrompt },
      { role: "user" as const, content: userMessage },
    ],
    stream: false as const,
    ...(agent.outputSchema
      ? { response_format: { type: "json_object" as const } }
      : {}),
    ...(agent.tools?.length ? { tools: agent.tools } : {}),
  };

  try {
    const res = await client().chat.completions.create(params);
    const text = res.choices[0]?.message?.content?.trim() ?? "";

    let output: T;
    if (agent.outputSchema) {
      const json = JSON.parse(text);
      output = agent.outputSchema.parse(json);
    } else {
      output = text as unknown as T;
    }

    return {
      output,
      raw: text,
      durationMs: Date.now() - t0,
      model,
    };
  } catch (err) {
    console.warn(
      `[agent/${agent.id}] error: ${(err as Error).message}`,
    );
    return null;
  }
}
