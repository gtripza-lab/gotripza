"use client";
import { createSupabaseBrowser } from "./supabase/client";

export type EventName =
  | "search_submitted"
  | "results_rendered"
  | "book_clicked"
  | "followup_revealed"
  | "followup_dismissed"
  | "affiliate_upsell_clicked";

export type EventPayload = Record<string, unknown>;

let supabase: ReturnType<typeof createSupabaseBrowser> | null = null;
function client() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  if (!supabase) {
    try {
      supabase = createSupabaseBrowser();
    } catch {
      supabase = null;
    }
  }
  return supabase;
}

/** Fire-and-forget event log. Never throws, never blocks UI. */
export function logEvent(name: EventName, payload: EventPayload = {}): void {
  try {
    const sb = client();
    if (!sb) return;
    const row = {
      name,
      payload,
      locale: typeof document !== "undefined" ? document.documentElement.lang || null : null,
      path: typeof window !== "undefined" ? window.location.pathname : null,
      created_at: new Date().toISOString(),
    };
    void sb.from("events").insert(row).then(
      () => undefined,
      () => undefined,
    );
  } catch {
    /* swallow */
  }
}
