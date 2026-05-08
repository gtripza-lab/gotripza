import "server-only";
/**
 * Base Agent — the abstract pattern every future Gotripza AI agent
 * implements (Marketing, SEO, Ads, Content, Analytics, Recommendation).
 *
 * Each concrete agent gets:
 *   • system prompt
 *   • a curated set of tools
 *   • model tier (primary vs lite)
 *   • Supabase access via service role
 *   • structured output schema
 *
 * Ria (the chat consultant) is itself one of these agents, just with a
 * specialized orchestrator wrapping it. New agents don't need their own
 * orchestrator — they should be thin wrappers around runAgent().
 */
import type { ChatCompletionTool } from "openai/resources/chat/completions";
import type { z } from "zod";

export type AgentDefinition<TOutput = unknown> = {
  /** Stable identifier — used in logs and for telemetry. */
  id: string;
  /** Human label — used in admin UI. */
  name: string;
  /** System prompt — Sonnet should be enough for most agents. */
  systemPrompt: string;
  /** Whether to use the primary or lite model tier. */
  modelTier: "primary" | "lite";
  /** Optional output schema for structured-output mode. */
  outputSchema?: z.ZodType<TOutput>;
  /** Tools the agent may call. Empty array = pure prompt agent. */
  tools?: ChatCompletionTool[];
  /** Soft cap on output tokens (default 1024). */
  maxTokens?: number;
  /** Default temperature (default 0.4 for analytical, 0.65 for creative). */
  temperature?: number;
};

export type AgentRunInput = {
  user: string; // the message / brief / task
  context?: Record<string, unknown>;
};

export type AgentRunResult<T = unknown> = {
  output: T;
  raw: string;
  durationMs: number;
  model: string;
};
