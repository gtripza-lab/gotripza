"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { fireGoogleAdsConversion, getGoogleAdsConversionTarget } from "@/lib/analytics/google";
import { trackXEvent, trackXPageView } from "@/lib/analytics/x";
import { logEvent } from "@/lib/events";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function isGooglePaidVisit(params: URLSearchParams) {
  const source = params.get("utm_source")?.toLowerCase();
  return Boolean(
    params.get("gclid") ||
      params.get("gbraid") ||
      params.get("wbraid") ||
      params.get("gad_source") ||
      source === "google" ||
      source === "google_ads",
  );
}

function shouldTrackAdsLanding(pathname: string) {
  return /\/(rya|plus|search|plan)(\/)?$/.test(pathname);
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
    logEvent("login_success", { method: "oauth_callback" });
    trackXEvent("CompleteRegistration", { method: "oauth_callback" });
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
    const params = new URLSearchParams(window.location.search);
    if (!isGooglePaidVisit(params) || !shouldTrackAdsLanding(pathname)) return;

    const key = `gotripza_ads_landing_${pathname}`;
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, "1");

    fireGoogleAdsConversion("ads_landing_view", {
      value: 1.0,
      currency: "USD",
      page_path: pathname,
    });
  }, [pathname]);

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
    trackXPageView({
      page_path: pagePath,
      page_location: window.location.href,
    });
  }, [gaId, pathname]);

  return null;
}
