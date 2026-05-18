"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getGoogleAdsConversionTarget } from "@/lib/analytics/google";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function fireAdsConversionOnce() {
  try {
    const conversionTarget = getGoogleAdsConversionTarget();
    if (typeof window.gtag === "function" && conversionTarget) {
      window.gtag("event", "conversion", {
        send_to: conversionTarget,
        value: 5.0,
        currency: "USD",
      });
    }
    if (typeof window.gtag === "function") {
      window.gtag("event", "sign_up", { method: "oauth_callback" });
    }
  } catch {
    /* never block */
  }
}

export function AnalyticsInit({ gaId }: { gaId: string }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag !== "function") {
      window.gtag = function gtag(...args: unknown[]) {
        window.dataLayer?.push(args);
      };
    }
  }, []);

  // Detect successful auth callback (_signup=1) and fire conversion once
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("_signup") === "1") {
      fireAdsConversionOnce();
      // Clean the param from the URL without a full reload
      params.delete("_signup");
      const newSearch = params.toString();
      const cleanUrl = window.location.pathname + (newSearch ? `?${newSearch}` : "");
      router.replace(cleanUrl, { scroll: false });
    }
  }, [pathname, router]);

  useEffect(() => {
    if (!gaId || typeof window.gtag !== "function") return;

    const query = window.location.search.replace(/^\?/, "");
    const pagePath = query ? `${pathname}?${query}` : pathname;

    window.gtag("event", "page_view", {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
      send_to: gaId,
    });
  }, [gaId, pathname]);

  return null;
}
