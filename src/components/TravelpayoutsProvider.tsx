"use client";

/**
 * TravelpayoutsProvider
 * ─────────────────────
 * Solves the SPA navigation problem: after Next.js client-side routing,
 * `window.load` and `DOMContentLoaded` never re-fire, so the Travelpayouts
 * Drive script (emrld.ltd) never re-initialises widgets or sends pageview
 * beacons on subsequent pages.
 *
 * Fix: watch `usePathname()` — on every route change, dispatch a synthetic
 * `popstate` event (which Travelpayouts listens to internally) and call
 * the script's public re-init API if it's already been attached to `window`.
 *
 * Placement: inside `app/[locale]/layout.tsx` body — renders nothing,
 * is purely a side-effect hook.
 */

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Extend Window to acknowledge the Travelpayouts Drive globals
declare global {
  interface Window {
    TpDrive?: {
      /** Re-scans the DOM for new widgets after a route change */
      init?: () => void;
    };
    /** Legacy marker used by some Drive widget versions */
    tpWidgetVersion?: string;
  }
}

export function TravelpayoutsProvider() {
  const pathname = usePathname();
  // Skip the very first render — the beforeInteractive script already ran
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // ── 1. Dispatch synthetic navigation event ──────────────────────────────
    // Travelpayouts Drive listens to `popstate` to detect SPA page changes.
    try {
      window.dispatchEvent(new PopStateEvent("popstate", { state: null }));
    } catch {
      // Older browsers — fall back to a generic Event
      window.dispatchEvent(new Event("popstate"));
    }

    // ── 2. Call Drive's public re-init if available ─────────────────────────
    // The script attaches itself to window.TpDrive after first load.
    if (typeof window.TpDrive?.init === "function") {
      try {
        window.TpDrive.init();
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[TravelpayoutsProvider] TpDrive.init() threw:", err);
        }
      }
    }

    // ── 3. Dispatch a synthetic page_view for GA + TP analytics ────────────
    // Some versions of the script also listen to a custom tp:pageview event.
    window.dispatchEvent(
      new CustomEvent("tp:pageview", {
        detail: { path: pathname },
        bubbles: false,
      }),
    );
  }, [pathname]);

  // Renders nothing — purely side-effects
  return null;
}
