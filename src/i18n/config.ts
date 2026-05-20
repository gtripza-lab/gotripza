export const locales = [
  "ar",
  "en",
  "fr",
  "de",
  "es",
  "it",
  "pt",
  "ko",
  "ja",
  "zh",
  "nl",
] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ar";

export const localeMeta: Record<Locale, { dir: "ltr" | "rtl"; label: string }> = {
  ar: { dir: "rtl", label: "العربية" },
  en: { dir: "ltr", label: "English" },
  fr: { dir: "ltr", label: "Français" },
  de: { dir: "ltr", label: "Deutsch" },
  es: { dir: "ltr", label: "Español" },
  it: { dir: "ltr", label: "Italiano" },
  pt: { dir: "ltr", label: "Português" },
  ko: { dir: "ltr", label: "한국어" },
  ja: { dir: "ltr", label: "日本語" },
  zh: { dir: "ltr", label: "中文" },
  nl: { dir: "ltr", label: "Nederlands" },
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function contentLocale(locale: Locale | string): "ar" | "en" {
  return locale === "ar" ? "ar" : "en";
}
