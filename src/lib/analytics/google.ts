export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-SYD1GBC1LZ";

export const GOOGLE_ADS_ID =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "AW-18132778368";

export const GOOGLE_ADS_CONVERSION_LABEL =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_CONV_LABEL || "dKO-CJzP264cEID7sMZD";

export function getGoogleAdsConversionTarget() {
  if (!GOOGLE_ADS_ID || !GOOGLE_ADS_CONVERSION_LABEL) return "";
  return `${GOOGLE_ADS_ID}/${GOOGLE_ADS_CONVERSION_LABEL}`;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function fireGoogleAdsConversion(
  eventName: string,
  payload: Record<string, string | number | boolean> = {},
) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  const conversionTarget = getGoogleAdsConversionTarget();
  if (!conversionTarget) return;

  window.gtag("event", "conversion", {
    send_to: conversionTarget,
    event_category: "google_ads",
    event_label: eventName,
    ...payload,
  });
}
