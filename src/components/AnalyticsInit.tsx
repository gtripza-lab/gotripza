"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function AnalyticsInit({ gaId }: { gaId: string }) {
  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
    window.gtag("js", new Date());
    window.gtag("config", gaId, {
      page_path: window.location.pathname,
      cookie_flags: "SameSite=None;Secure",
    });
  }, [gaId]);

  return null;
}
