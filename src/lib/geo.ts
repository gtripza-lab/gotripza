import { headers } from "next/headers";

const GULF_COUNTRIES = new Set(["SA", "AE", "KW", "QA", "BH", "OM"]);
const GULF_LANG_HINTS = ["ar-sa", "ar-ae", "ar-kw", "ar-qa", "ar-bh", "ar-om", "ar"];

export type Region = "gulf" | "world";

/**
 * Best-effort region detection from edge headers.
 * Returns "gulf" when Vercel/CDN reports a GCC country or the
 * browser's preferred language is Arabic; otherwise "world".
 */
export function detectRegion(): Region {
  try {
    const h = headers();
    const country =
      h.get("x-vercel-ip-country") ??
      h.get("cf-ipcountry") ??
      h.get("x-country") ??
      "";
    if (country && GULF_COUNTRIES.has(country.toUpperCase())) return "gulf";
    const lang = (h.get("accept-language") ?? "").toLowerCase();
    if (GULF_LANG_HINTS.some((p) => lang.startsWith(p))) return "gulf";
    return "world";
  } catch {
    return "world";
  }
}
