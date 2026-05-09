import "server-only";
/**
 * Memory store — Supabase reads/writes for Ria's persistent memory.
 *
 * All writes go through the service-role client (bypasses RLS).
 * Reads also use service-role since the parse route is server-only and
 * we've already authenticated the user via cookie.
 */
import { createSupabaseService } from "@/lib/supabase/service";
import type {
  Profile,
  TravelerPreferences,
  Conversation,
  StoredMessage,
} from "./types";

// Tables defined in 20260508000001 migration aren't in the auto-generated
// Supabase types yet; cast at the boundary. Once `supabase gen types` is
// run after the migration deploys, these casts can be removed.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTable = any;

const EMPTY_PREFS = (userId: string): TravelerPreferences => ({
  user_id: userId,
  travel_style: null,
  budget_tier: null,
  travels_with: [],
  trip_pace: null,
  interests: [],
  dietary: [],
  accessibility_needs: [],
  preferred_airlines: [],
  past_destinations: [],
  notes: {},
});

// ── Profiles ─────────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<Profile | null> {
  const sb = createSupabaseService() as AnyTable;
  const { data, error } = await sb
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    console.warn("[memory] getProfile error:", error.message);
    return null;
  }
  return (data as Profile | null) ?? null;
}

export async function upsertProfile(
  userId: string,
  patch: Partial<Profile>,
): Promise<void> {
  const sb = createSupabaseService() as AnyTable;
  const { error } = await sb
    .from("profiles")
    .upsert({ id: userId, ...patch }, { onConflict: "id" });
  if (error) console.warn("[memory] upsertProfile error:", error.message);
}

// ── Preferences ──────────────────────────────────────────────────────

export async function getPreferences(
  userId: string,
): Promise<TravelerPreferences> {
  const sb = createSupabaseService() as AnyTable;
  const { data, error } = await sb
    .from("traveler_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.warn("[memory] getPreferences error:", error.message);
    return EMPTY_PREFS(userId);
  }
  return (data as TravelerPreferences | null) ?? EMPTY_PREFS(userId);
}

export async function updatePreferences(
  userId: string,
  patch: Partial<TravelerPreferences>,
): Promise<void> {
  const sb = createSupabaseService() as AnyTable;
  const { error } = await sb
    .from("traveler_preferences")
    .upsert({ user_id: userId, ...patch }, { onConflict: "user_id" });
  if (error) console.warn("[memory] updatePreferences error:", error.message);
}

// ── Conversations ────────────────────────────────────────────────────

export async function getOrCreateConversation(opts: {
  userId?: string | null;
  sessionId?: string | null;
  locale: "ar" | "en";
}): Promise<Conversation | null> {
  const sb = createSupabaseService() as AnyTable;
  const { userId, sessionId, locale } = opts;

  // N3 + M10: Window = last_at within 4h AND started_at within 8h.
  // Prevents resurrecting morning-Bali planning when user opens lunch-Tokyo chat.
  const cutoff = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
  const startedCap = new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString();
  let q = sb
    .from("conversations")
    .select("*")
    .gte("last_at", cutoff)
    .gte("started_at", startedCap)
    .is("closed_at", null)
    .order("last_at", { ascending: false })
    .limit(1);
  if (userId) q = q.eq("user_id", userId);
  else if (sessionId) q = q.eq("session_id", sessionId);
  else return null; // no identity, can't track conversation

  const { data: existing } = await q.maybeSingle();
  if (existing) return existing as Conversation;

  const { data: created, error } = await sb
    .from("conversations")
    .insert({
      user_id: userId ?? null,
      session_id: sessionId ?? null,
      locale,
    })
    .select()
    .single();
  if (error) {
    console.warn("[memory] create conversation error:", error.message);
    return null;
  }
  return created as Conversation;
}

export async function appendMessage(opts: {
  conversationId: string;
  role: StoredMessage["role"];
  content: string;
  mode?: StoredMessage["mode"];
  intent?: Record<string, unknown> | null;
  tokensIn?: number | null;
  tokensOut?: number | null;
  model?: string | null;
  latencyMs?: number | null;
  provider?: string | null;
}): Promise<void> {
  const sb = createSupabaseService() as AnyTable;
  const {
    conversationId,
    role,
    content,
    mode = null,
    intent = null,
    tokensIn = null,
    tokensOut = null,
    model = null,
    latencyMs = null,
    provider = null,
  } = opts;

  const { error: insertError } = await sb.from("messages").insert({
    conversation_id: conversationId,
    role,
    content,
    mode,
    intent,
    tokens_in: tokensIn,
    tokens_out: tokensOut,
    model,
    latency_ms: latencyMs,
    provider,
  });
  if (insertError)
    console.warn("[memory] appendMessage error:", insertError.message);

  // B3 + N6: Touch last_at AND increment message_count atomically via RPC.
  const { error: rpcError } = await sb.rpc("increment_conversation", {
    conv_id: conversationId,
  });
  if (rpcError) {
    // Soft fallback if migration isn't deployed yet.
    await sb
      .from("conversations")
      .update({ last_at: new Date().toISOString() })
      .eq("id", conversationId);
  }
}

// ── M7: Conversation summary persistence ────────────────────────────
export async function getConversationSummary(
  conversationId: string,
): Promise<string | null> {
  const sb = createSupabaseService() as AnyTable;
  const { data } = await sb
    .from("conversations")
    .select("summary")
    .eq("id", conversationId)
    .maybeSingle();
  return (data as { summary: string | null } | null)?.summary ?? null;
}

export async function setConversationSummary(
  conversationId: string,
  summary: string,
): Promise<void> {
  const sb = createSupabaseService() as AnyTable;
  // Cap at 1500 chars to prevent unbounded growth across resummarizations
  const capped = summary.slice(0, 1500);
  await sb
    .from("conversations")
    .update({ summary: capped })
    .eq("id", conversationId);
}

// ── M15: AI trace persistence ───────────────────────────────────────
export async function appendAiTrace(t: {
  conversationId: string | null;
  userId: string | null;
  sessionId: string | null;
  mode: "clarify" | "search" | "advice" | null;
  preFilter: string[];
  durationMs: number;
  model: string | null;
  tokensIn: number | null;
  tokensOut: number | null;
  status: "ok" | "salvaged" | "error";
  errorKind: string | null;
  errorMessage: string | null;
}): Promise<void> {
  const sb = createSupabaseService() as AnyTable;
  await sb.from("ai_traces").insert({
    conversation_id: t.conversationId,
    user_id: t.userId,
    session_id: t.sessionId,
    mode: t.mode,
    pre_filter: t.preFilter,
    duration_ms: t.durationMs,
    model: t.model,
    tokens_in: t.tokensIn,
    tokens_out: t.tokensOut,
    status: t.status,
    error_kind: t.errorKind,
    error_message: t.errorMessage,
  });
}

// ── M6: Anonymous session preferences ──────────────────────────────
export type AnonPreferences = {
  travel_style: string | null;
  budget_tier: string | null;
  trip_pace: string | null;
  travels_with: string[];
  interests: string[];
  preferred_airlines: string[];
  past_destinations: string[];
};

export async function getAnonPreferences(
  sessionId: string,
): Promise<AnonPreferences> {
  const sb = createSupabaseService() as AnyTable;
  const { data } = await sb
    .from("session_preferences")
    .select("*")
    .eq("session_id", sessionId)
    .maybeSingle();
  return (
    (data as AnonPreferences | null) ?? {
      travel_style: null,
      budget_tier: null,
      trip_pace: null,
      travels_with: [],
      interests: [],
      preferred_airlines: [],
      past_destinations: [],
    }
  );
}

export async function updateAnonPreferences(
  sessionId: string,
  patch: Partial<AnonPreferences>,
): Promise<void> {
  const sb = createSupabaseService() as AnyTable;
  await sb.from("session_preferences").upsert(
    { session_id: sessionId, ...patch, updated_at: new Date().toISOString() },
    { onConflict: "session_id" },
  );
}

export async function getRecentMessages(
  conversationId: string,
  limit = 12,
): Promise<StoredMessage[]> {
  const sb = createSupabaseService() as AnyTable;
  const { data, error } = await sb
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.warn("[memory] getRecentMessages error:", error.message);
    return [];
  }
  return ((data as StoredMessage[]) ?? []).reverse();
}

// ── Destination Intel Cache ──────────────────────────────────────────

export async function getCachedDestinationIntel<T = unknown>(
  destination: string,
  locale: "ar" | "en",
): Promise<T | null> {
  if (!destination) return null;
  const sb = createSupabaseService() as AnyTable;
  const { data, error } = await sb
    .from("destination_intel_cache")
    .select("payload, expires_at")
    .eq("destination", destination)
    .eq("locale", locale)
    .maybeSingle();
  if (error) return null;
  if (!data) return null;
  if (new Date((data as { expires_at: string }).expires_at) < new Date())
    return null;
  return (data as { payload: T }).payload;
}

export async function setCachedDestinationIntel(
  destination: string,
  locale: "ar" | "en",
  payload: unknown,
  ttlDays = 7,
): Promise<void> {
  if (!destination) return;
  const sb = createSupabaseService() as AnyTable;
  const expires = new Date(Date.now() + ttlDays * 86_400_000).toISOString();
  await sb.from("destination_intel_cache").upsert(
    {
      destination,
      locale,
      payload,
      expires_at: expires,
    },
    { onConflict: "destination,locale" },
  );
}

// ── Subscriptions / entitlements ─────────────────────────────────────

export async function getSubscription(userId: string) {
  const sb = createSupabaseService() as AnyTable;
  const { data } = await sb
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

export async function ensureLaunchFreeSubscription(userId: string) {
  const sb = createSupabaseService() as AnyTable;
  await sb
    .from("subscriptions")
    .upsert(
      { user_id: userId, plan: "launch_free", status: "active" },
      { onConflict: "user_id", ignoreDuplicates: true },
    );
}
