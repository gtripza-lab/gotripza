import "server-only";
/**
 * Ria Tools — OpenAI function-calling registry.
 * ─────────────────────────────────────────────────────────────────────
 * Each tool is exposed to the LLM via a JSON-schema definition (`spec`)
 * and an `execute` function the orchestrator calls when the model emits
 * a `tool_calls` block.
 *
 * Tools are server-only and run with the same security context as the
 * orchestrator (service-role Supabase access, user identity, etc.).
 *
 * Currently registered:
 *   • search_flights        — Travelpayouts flight search
 *   • search_hotels         — Hotellook cached hotel search
 *   • recommend_partners    — Partner upsell recommendations (eSIM,
 *                              insurance, activities) based on intent
 *   • get_user_memory       — Read traveler preferences (auth required)
 *   • create_support_ticket — Escalate to human support (Phase 8)
 *
 * Future:
 *   • web_search (via OpenAI Responses API) replaces Gemini googleSearch
 *   • get_destination_intel (cached via destination_intel_cache table)
 */
import type { ChatCompletionTool } from "openai/resources/chat/completions";
import { searchFlightsTool } from "./search-flights";
import { searchHotelsTool } from "./search-hotels";
import { recommendPartnersTool } from "./recommend-partners";
import { getUserMemoryTool } from "./get-user-memory";
import { createSupportTicketTool } from "./create-support-ticket";

export type ToolContext = {
  userId: string | null;
  sessionId: string | null;
  locale: "ar" | "en";
};

export type ToolDef<TInput = unknown, TOutput = unknown> = {
  name: string;
  description: string;
  parameters: Record<string, unknown>; // JSON schema
  execute: (input: TInput, ctx: ToolContext) => Promise<TOutput>;
};

const REGISTRY: Record<string, ToolDef> = {
  [searchFlightsTool.name]: searchFlightsTool as ToolDef,
  [searchHotelsTool.name]: searchHotelsTool as ToolDef,
  [recommendPartnersTool.name]: recommendPartnersTool as ToolDef,
  [getUserMemoryTool.name]: getUserMemoryTool as ToolDef,
  [createSupportTicketTool.name]: createSupportTicketTool as ToolDef,
};

/**
 * OpenAI tool spec list — pass directly to chat.completions.create.
 */
export function getToolSpecs(): ChatCompletionTool[] {
  return Object.values(REGISTRY).map((t) => ({
    type: "function" as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    },
  }));
}

/**
 * Dispatch a tool call. Returns a JSON-stringifiable result, or an
 * { error } object on failure (we never throw — the LLM should see the
 * error and react gracefully).
 */
export async function dispatchTool(
  name: string,
  rawArgs: string,
  ctx: ToolContext,
): Promise<unknown> {
  const tool = REGISTRY[name];
  if (!tool) return { error: `unknown_tool: ${name}` };
  let args: unknown;
  try {
    args = rawArgs ? JSON.parse(rawArgs) : {};
  } catch {
    return { error: "invalid_tool_args_json" };
  }
  try {
    return await tool.execute(args, ctx);
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export {
  searchFlightsTool,
  searchHotelsTool,
  recommendPartnersTool,
  getUserMemoryTool,
  createSupportTicketTool,
};
