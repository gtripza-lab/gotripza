import { headers } from "next/headers";
import { currencyForCountry, type Currency } from "@/lib/utils";

export type Region = "gulf" | "europe" | "asia" | "americas" | "mena" | "world";

// GCC countries treated as "gulf" region for payment method display
const GULF_COUNTRIES = new Set(["SA", "AE", "KW", "QA", "BH", "OM"]);

export interface GeoContext {
  country: string | null;   // ISO 3166-1 alpha-2
  region: Region;
  currency: Currency;
}

/**
 * Detects the visitor's geo context from edge/CDN headers.
 * Works on Vercel (x-vercel-ip-country) and Cloudflare (cf-ipcountry).
 * Returns safe defaults when headers are unavailable (e.g. local dev).
 */
export function detectGeo(): GeoContext {
  try {
    const h = headers();
    const raw =
      h.get("x-vercel-ip-country") ??
      h.get("cf-ipcountry") ??
      h.get("x-country") ??
      null;
    const country = raw ? raw.toUpperCase() : null;
    const region = resolveRegion(country);
    const currency = currencyForCountry(country);
    return { country, region, currency };
  } catch {
    return { country: null, region: "world", currency: "USD" };
  }
}

/** Legacy alias — kept for PaymentMethods compatibility */
export function detectRegion(): Region {
  return detectGeo().region;
}

function resolveRegion(country: string | null): Region {
  if (!country) return "world";
  if (GULF_COUNTRIES.has(country)) return "gulf";

  const EUROPE = new Set([
    "GB","DE","FR","ES","IT","NL","PT","BE","AT","CH","SE","NO","DK","FI",
    "PL","CZ","HU","RO","GR","IE","HR","SK","BG","LT","LV","EE","SI",
    "LU","MT","CY","IS","LI",
  ]);
  const ASIA = new Set([
    "TR","IN","ID","MY","TH","SG","PH","VN","JP","CN","KR","HK","TW",
    "BD","LK","NP","PK","AZ","GE","AM","UZ","KZ",
  ]);
  const MENA = new Set([
    "EG","MA","TN","DZ","LY","JO","LB","SY","IQ","YE","IR","PS",
  ]);
  const AMERICAS = new Set([
    "US","CA","MX","BR","AR","CO","CL","PE","VE","EC",
  ]);

  if (EUROPE.has(country)) return "europe";
  if (ASIA.has(country)) return "asia";
  if (MENA.has(country)) return "mena";
  if (AMERICAS.has(country)) return "americas";
  return "world";
}
