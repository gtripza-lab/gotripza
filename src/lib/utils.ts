import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Currency = "USD" | "SAR";

export function currencyForLocale(locale: "ar" | "en" | string): Currency {
  return locale === "ar" ? "SAR" : "USD";
}

/**
 * Renders prices as `$400` for USD and `1,500 SAR` for SAR.
 * Latin digits + comma grouping in both locales for consistent design.
 */
export function formatPrice(
  value: number,
  currency: Currency = "USD",
  _locale: "ar" | "en" | string = "en",
) {
  const n = Math.round(Number(value) || 0).toLocaleString("en-US");
  return currency === "USD" ? `$${n}` : `${n} SAR`;
}
