import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Currency = "USD" | "EUR" | "GBP" | "SAR" | "AED" | "TRY" | "EGP" | "MAD";

/** Map Vercel/Cloudflare ISO country code → display currency */
const COUNTRY_CURRENCY: Record<string, Currency> = {
  // Gulf
  SA: "SAR",
  AE: "AED",
  KW: "USD",
  QA: "USD",
  BH: "USD",
  OM: "USD",
  // Europe
  GB: "GBP",
  DE: "EUR", FR: "EUR", ES: "EUR", IT: "EUR", NL: "EUR",
  PT: "EUR", BE: "EUR", AT: "EUR", CH: "EUR", SE: "EUR",
  PL: "EUR", GR: "EUR", CZ: "EUR", RO: "EUR", DK: "EUR",
  // Turkey
  TR: "TRY",
  // Egypt
  EG: "EGP",
  // Morocco
  MA: "MAD",
  // Default — everything else in USD
};

/** Returns the best display currency for a given ISO country code. */
export function currencyForCountry(countryCode: string | null | undefined): Currency {
  if (!countryCode) return "USD";
  return COUNTRY_CURRENCY[countryCode.toUpperCase()] ?? "USD";
}

/** Legacy: kept for fallback when no country is available. */
export function currencyForLocale(locale: "ar" | "en" | string): Currency {
  return locale === "ar" ? "SAR" : "USD";
}

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  SAR: "SAR ",
  AED: "AED ",
  TRY: "₺",
  EGP: "EGP ",
  MAD: "MAD ",
};

/**
 * Renders prices with the correct symbol.
 * Always uses Latin digits + comma grouping for visual consistency.
 */
export function formatPrice(
  value: number,
  currency: Currency = "USD",
  _locale: "ar" | "en" | string = "en",
) {
  const n = Math.round(Number(value) || 0).toLocaleString("en-US");
  const symbol = CURRENCY_SYMBOLS[currency] ?? "$";
  // Prefix symbols (USD, EUR, GBP, TRY) vs suffix codes (SAR, AED, EGP, MAD)
  if (["USD", "EUR", "GBP", "TRY"].includes(currency)) {
    return `${symbol}${n}`;
  }
  return `${n} ${symbol.trim()}`;
}
