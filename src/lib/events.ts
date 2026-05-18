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
  | "companion_image_analyzed"
  | "companion_trial_started"
  | "pwa_install_cta_clicked"
  | "pwa_install_cta_shown"
  | "pwa_app_installed"
  | "pwa_ios_install_instructions_shown"
  | "pwa_standalone_opened"
  | "ria_quick_action_clicked"
  | "ria_lifecycle_action_clicked"
  | "ria_trip_phase_detected"
  | "ria_companion_hub_viewed"
  | "traveler_service_clicked"
  | "ria_response_feedback"
  | "trip_plan_generated"
  | "trip_plan_feedback"
  | "trip_plan_rya_followup_clicked"
  | "trip_plan_day_removed"
  | "trip_plan_day_swapped"
  | "trip_plan_day_lightened"
  | "auth_initiated"
  | "signup_complete"
  | "signin_complete";

export type EventPayload = Record<string, unknown>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function toAnalyticsPayload(payload: EventPayload): EventPayload {
  const safePayload: EventPayload = {};

  for (const [key, value] of Object.entries(payload)) {
    if (value === null || value === undefined) continue;
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      safePayload[key] = value;
    }
  }

  return safePayload;
}

/** Fire-and-forget event log. Never throws, never blocks UI. */
export function logEvent(name: EventName, payload: EventPayload = {}): void {
  if (typeof window === "undefined") return;
  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", name, {
        ...toAnalyticsPayload(payload),
        event_category: "gotripza",
        page_path: window.location.pathname,
      });
    }

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
