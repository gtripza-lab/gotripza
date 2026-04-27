export const locales = ["ar", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ar";

export const localeMeta: Record<Locale, { dir: "ltr" | "rtl"; label: string }> = {
  ar: { dir: "rtl", label: "العربية" },
  en: { dir: "ltr", label: "English" },
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
