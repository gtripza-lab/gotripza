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
  "tr",
  "hi",
  "id",
  "ru",
  "pl",
  "th",
  "vi",
  "ms",
  "sv",
  "no",
  "da",
] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ar";

// Only locales with fully reviewed, index-quality content should be sent to
// search engines. Other locales can remain usable for UX experiments, but they
// should not create duplicate index pressure until their content is localized.
export const indexableLocales = ["ar", "en"] as const satisfies readonly Locale[];
export type IndexableLocale = (typeof indexableLocales)[number];

export function isIndexableLocale(value: string): value is IndexableLocale {
  return (indexableLocales as readonly string[]).includes(value);
}

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
  tr: { dir: "ltr", label: "Türkçe" },
  hi: { dir: "ltr", label: "हिन्दी" },
  id: { dir: "ltr", label: "Bahasa Indonesia" },
  ru: { dir: "ltr", label: "Русский" },
  pl: { dir: "ltr", label: "Polski" },
  th: { dir: "ltr", label: "ไทย" },
  vi: { dir: "ltr", label: "Tiếng Việt" },
  ms: { dir: "ltr", label: "Bahasa Melayu" },
  sv: { dir: "ltr", label: "Svenska" },
  no: { dir: "ltr", label: "Norsk" },
  da: { dir: "ltr", label: "Dansk" },
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function contentLocale(locale: Locale | string): "ar" | "en" {
  return locale === "ar" ? "ar" : "en";
}
