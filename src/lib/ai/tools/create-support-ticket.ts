import "server-only";
import { createSupabaseService } from "@/lib/supabase/service";
import type { ToolDef } from "./index";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTable = any;

type Input = {
  category:
    | "booking"
    | "refund"
    | "technical"
    | "complaint"
    | "question"
    | "other";
  subject: string;
  body: string;
  ai_summary?: string;
  contact_email?: string;
  priority?: "low" | "normal" | "high" | "urgent";
};

export const createSupportTicketTool: ToolDef<Input, unknown> = {
  name: "create_support_ticket",
  description:
    "Escalate to human support. Use ONLY when Raya genuinely cannot help (refund disputes, account issues, complaints requiring human judgment). Always confirm the user wants to escalate before calling this. Returns the ticket ID.",
  parameters: {
    type: "object",
    properties: {
      category: {
        type: "string",
        enum: ["booking", "refund", "technical", "complaint", "question", "other"],
      },
      subject: { type: "string", maxLength: 200 },
      body: { type: "string", maxLength: 4000 },
      ai_summary: {
        type: "string",
        description: "1-2 sentence Raya-generated summary of the issue.",
      },
      contact_email: {
        type: "string",
        description: "Required for anonymous users; optional if signed in.",
      },
      priority: {
        type: "string",
        enum: ["low", "normal", "high", "urgent"],
        default: "normal",
      },
    },
    required: ["category", "subject", "body"],
  },
  async execute(input, ctx) {
    const sb = createSupabaseService() as AnyTable;
    const { data, error } = await sb
      .from("support_requests")
      .insert({
        user_id: ctx.userId,
        category: input.category,
        subject: input.subject,
        body: input.body,
        ai_summary: input.ai_summary ?? null,
        contact_email: input.contact_email ?? null,
        priority: input.priority ?? "normal",
        metadata: { session_id: ctx.sessionId, locale: ctx.locale },
      })
      .select("id")
      .single();
    if (error) return { error: error.message };
    return { ticket_id: data?.id, status: "open" };
  },
};
