import { NextRequest, NextResponse } from "next/server";
import { createSupabaseService } from "@/lib/supabase/service";
import { getCurrentUser } from "@/lib/auth/session";
import {
  appendMessage,
  getOrCreateConversation,
  setConversationState,
  setConversationSummary,
} from "@/lib/ai/memory/store";
import { rateLimit } from "@/lib/security/rate-limit";
import { z } from "zod";

export const runtime = "nodejs";

// GET is intentionally NOT exposed — history is write-only to protect user privacy.
// Individual users retrieve their history via localStorage (client-side), not this API.

const HistoryPayloadSchema = z.object({
  query: z.string().min(1).max(1000),
  response: z.string().max(5000).optional(),
  destination: z.string().max(100).optional(),
  locale: z.enum(["ar", "en"]).optional(),
  mode: z.enum(["clarify", "search", "advice"]).optional(),
  intent: z.record(z.string(), z.unknown()).optional(),
  context: z.record(z.string(), z.unknown()).optional(),
  persistConversation: z.boolean().optional(),
});

function genAnonSid(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString("base64url");
}

function buildSummary(query: string, response?: string): string {
  return [query, response].filter(Boolean).join(" → ").replace(/\s+/g, " ").slice(0, 650);
}

export async function POST(request: NextRequest) {
  try {
    // B1: production rate limit (30/min)
    const rl = await rateLimit(request, "history", { limit: 30, windowSec: 60 });
    if (!rl.allowed) {
      return NextResponse.json({ ok: true });
    }

    let rawBody: unknown;
    try { rawBody = await request.json(); } catch { return NextResponse.json({ ok: true }); }

    const parsed = HistoryPayloadSchema.safeParse(rawBody);
    if (!parsed.success) return NextResponse.json({ ok: true }); // Best-effort: ignore invalid

    const { query, response, destination, locale, mode, intent, context, persistConversation } = parsed.data;

    const supabase = createSupabaseService();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("search_history") as any).insert({
      query,
      destination: destination ?? "unknown",
      locale: locale ?? null,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("[history POST] Supabase error:", error.message);
    }

    let conversationId: string | null = null;
    let mintedSid: string | null = null;

    if (persistConversation && response?.trim()) {
      const user = await getCurrentUser();
      let sessionId = request.cookies.get("gtz_sid")?.value ?? null;
      if (!user && !sessionId) {
        sessionId = genAnonSid();
        mintedSid = sessionId;
      }

      const conversation = await getOrCreateConversation({
        userId: user?.id ?? null,
        sessionId,
        locale: locale ?? "ar",
      });

      if (conversation) {
        conversationId = conversation.id;
        await setConversationSummary(conversation.id, buildSummary(query, response));
        if (context && intent) {
          await setConversationState(
            conversation.id,
            context as Parameters<typeof setConversationState>[1],
            intent as Parameters<typeof setConversationState>[2],
          );
        }
        await appendMessage({
          conversationId: conversation.id,
          role: "user",
          content: query,
        });
        await appendMessage({
          conversationId: conversation.id,
          role: "assistant",
          content: response,
          mode: mode ?? "advice",
          intent: intent ?? null,
          provider: "local",
        });
      }
    }

    const apiResponse = NextResponse.json({ ok: true, conversationId });
    if (mintedSid) {
      apiResponse.cookies.set("gtz_sid", mintedSid, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
    }

    return apiResponse;
  } catch (err) {
    console.error("[history POST] Unexpected error:", err);
    return NextResponse.json({ ok: true });
  }
}
