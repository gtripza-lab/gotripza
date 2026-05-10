"use client";

export type EventName =
  | "search_submitted"
  | "results_rendered"
  | "book_clicked"
  | "followup_revealed"
  | "followup_dismissed"
  | "affiliate_upsell_clicked"
  | "chat_message_sent"
  | "chat_results_ready"
  | "chat_followup_revealed"
  | "ria_response_feedback";

export type EventPayload = Record<string, unknown>;

/** Fire-and-forget event log. Never throws, never blocks UI. */
export function logEvent(name: EventName, payload: EventPayload = {}): void {
  if (typeof window === "undefined") return;
  try {
    void fetch("/api/log-event", {
      method: "POST",
      headers: { "content-type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        name,
        payload,
        locale: document.documentElement.lang || null,
        path:   window.location.pathname,
      }),
    }).catch(() => undefined);
  } catch {
    /* swallow */
  }
}
