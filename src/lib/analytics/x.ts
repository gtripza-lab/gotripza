export const X_PIXEL_ID = process.env.NEXT_PUBLIC_X_PIXEL_ID || "rci2t";

type XEventPayload = Record<string, string | number | boolean>;

declare global {
  interface Window {
    twq?: (...args: unknown[]) => void;
  }
}

function cleanPayload(payload: Record<string, unknown> = {}): XEventPayload {
  const safe: XEventPayload = {};

  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      safe[key] = value;
    }
  }

  return safe;
}

export function trackXEvent(name: string, payload: Record<string, unknown> = {}): void {
  if (typeof window === "undefined" || typeof window.twq !== "function") return;

  try {
    window.twq("track", name, cleanPayload(payload));
  } catch {
    /* never block user flows */
  }
}

export function trackXPageView(payload: Record<string, unknown> = {}): void {
  trackXEvent("PageView", payload);
}
