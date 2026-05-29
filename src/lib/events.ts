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
  | "rya_consultant_started"
  | "companion_try_clicked"
  | "companion_signup_started"
  | "companion_checkout_clicked"
  | "plan_my_trip_checkout_clicked"
  | "login_success"
  | "travel_service_interest"
  | "companion_trial_started"
  | "pwa_install_cta_clicked"
  | "pwa_install_cta_shown"
  | "pwa_app_installed"
  | "pwa_ios_install_instructions_shown"
  | "pwa_standalone_opened"
  | "ria_quick_action_clicked"
  | "ria_lifecycle_action_clicked"
  | "ria_mode_selected"
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
  | "signin_complete"
  | "plan_paywall_purchase_clicked"
  | "trip_plan_unlocked"
  | "companion_purchase_clicked"
  | "companion_unlocked"
  | "service_card_clicked"
  | "companion_upsell_clicked";

export type EventPayload = Record<string, unknown>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    twq?: (...args: unknown[]) => void;
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

function toXEventName(name: EventName): string | null {
  if (
    name === "signup_complete" ||
    name === "signin_complete" ||
    name === "login_success" ||
    name === "companion_trial_started"
  ) {
    return "CompleteRegistration";
  }

  if (name === "auth_initiated" || name === "companion_try_clicked" || name === "companion_signup_started") {
    return "Lead";
  }

  if (
    name === "search_submitted" ||
    name === "chat_message_sent" ||
    name === "rya_consultant_started" ||
    name === "trip_plan_generated"
  ) {
    return "Search";
  }

  if (
    name === "book_clicked" ||
    name === "affiliate_upsell_clicked" ||
    name === "traveler_service_clicked" ||
    name === "travel_service_interest" ||
    name === "companion_checkout_clicked" ||
    name === "plan_my_trip_checkout_clicked" ||
    name === "pwa_install_cta_clicked" ||
    name === "pwa_app_installed"
  ) {
    return "ViewContent";
  }

  return null;
}

/** Fire-and-forget event log. Never throws, never blocks UI. */
export function logEvent(name: EventName, payload: EventPayload = {}): void {
  if (typeof window === "undefined") return;
  try {
    const analyticsPayload = toAnalyticsPayload(payload);

    if (typeof window.gtag === "function") {
      window.gtag("event", name, {
        ...analyticsPayload,
        event_category: "gotripza",
        page_path: window.location.pathname,
      });
    }

    const xEventName = toXEventName(name);
    if (xEventName && typeof window.twq === "function") {
      window.twq("track", xEventName, {
        ...analyticsPayload,
        event_name: name,
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
