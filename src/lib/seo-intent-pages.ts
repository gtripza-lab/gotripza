import {
  TOP_DESTINATIONS,
  formatBestMonths,
  type Destination,
} from "@/lib/seo-destinations";
import type { Locale } from "@/i18n/config";

export type SeoIntentKind =
  | "best-time"
  | "cheapest-month"
  | "country-budget"
  | "best-esim"
  | "safe-areas"
  | "honeymoon"
  | "digital-nomad";

export type SeoIntentPage = {
  slug: string;
  kind: SeoIntentKind;
  destination: Destination;
  countryScoped: boolean;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function countrySlug(dest: Destination): string {
  return slugify(dest.country);
}

export function getSeoIntentPages(): SeoIntentPage[] {
  const pages: SeoIntentPage[] = [];
  const countries = new Set<string>();

  for (const destination of TOP_DESTINATIONS) {
    pages.push(
      {
        slug: `best-time-to-visit-${destination.slug}`,
        kind: "best-time",
        destination,
        countryScoped: false,
      },
      {
        slug: `cheapest-month-to-fly-to-${destination.slug}`,
        kind: "cheapest-month",
        destination,
        countryScoped: false,
      },
      {
        slug: `safest-areas-in-${destination.slug}`,
        kind: "safe-areas",
        destination,
        countryScoped: false,
      },
      {
        slug: `honeymoon-in-${destination.slug}`,
        kind: "honeymoon",
        destination,
        countryScoped: false,
      },
    );

    const cSlug = countrySlug(destination);
    if (!countries.has(cSlug)) {
      countries.add(cSlug);
      pages.push(
        {
          slug: `${cSlug}-travel-budget`,
          kind: "country-budget",
          destination,
          countryScoped: true,
        },
        {
          slug: `best-esim-for-${cSlug}`,
          kind: "best-esim",
          destination,
          countryScoped: true,
        },
        {
          slug: `digital-nomad-in-${cSlug}`,
          kind: "digital-nomad",
          destination,
          countryScoped: true,
        },
      );
    }
  }

  return pages;
}

export function getSeoIntentPage(slug: string): SeoIntentPage | undefined {
  return getSeoIntentPages().find((page) => page.slug === slug);
}

export function pageSubject(page: SeoIntentPage, locale: Locale): string {
  const isAr = locale === "ar";
  if (!page.countryScoped) return isAr ? page.destination.nameAr : page.destination.nameEn;
  return isAr ? page.destination.countryAr : page.destination.country;
}

export function intentTitle(page: SeoIntentPage, locale: Locale): string {
  const subject = pageSubject(page, locale);
  const isAr = locale === "ar";
  switch (page.kind) {
    case "best-time":
      return isAr ? `أفضل وقت لزيارة ${subject}` : `Best Time to Visit ${subject}`;
    case "cheapest-month":
      return isAr ? `أرخص شهر للسفر إلى ${subject}` : `Cheapest Month to Fly to ${subject}`;
    case "country-budget":
      return isAr ? `ميزانية السفر إلى ${subject}` : `${subject} Travel Budget Guide`;
    case "best-esim":
      return isAr ? `أفضل شريحة eSIM في ${subject}` : `Best eSIM for ${subject}`;
    case "safe-areas":
      return isAr ? `أكثر المناطق أماناً في ${subject}` : `Safest Areas in ${subject}`;
    case "honeymoon":
      return isAr ? `شهر العسل في ${subject}` : `Honeymoon in ${subject}`;
    case "digital-nomad":
      return isAr ? `العمل عن بعد في ${subject}` : `Digital Nomad Guide to ${subject}`;
  }
}

export function intentDescription(page: SeoIntentPage, locale: Locale): string {
  const subject = pageSubject(page, locale);
  const dest = page.destination;
  const isAr = locale === "ar";
  const months = formatBestMonths(dest.bestMonths, locale);
  switch (page.kind) {
    case "best-time":
      return isAr
        ? `دليل عملي لاختيار أفضل وقت لزيارة ${subject}: الطقس، الزحام، الأسعار، وكيف تساعدك ريا في التخطيط.`
        : `A practical guide to the best time to visit ${subject}: weather, crowds, prices, and how Rya helps plan smarter.`;
    case "cheapest-month":
      return isAr
        ? `تعرف على الأشهر الأنسب لتقليل تكلفة السفر إلى ${subject} ومتى تطلب من ريا مقارنة الخيارات.`
        : `Learn when flights to ${subject} are typically cheaper and when to ask Rya to compare options.`;
    case "country-budget":
      return isAr
        ? `تقدير ميزانية السفر إلى ${subject}: اقتصادي، متوسط، وفاخر مع نصائح ريا لتجنب الهدر.`
        : `Estimate your ${subject} travel budget: budget, mid-range, and luxury, with Rya's smarter spending guidance.`;
    case "best-esim":
      return isAr
        ? `متى تحتاج eSIM في ${subject} وكيف تختار باقة مناسبة للملاحة والترجمة ومشاركة الرحلة.`
        : `When you need an eSIM in ${subject} and how to choose data for navigation, translation, and trip sharing.`;
    case "safe-areas":
      return isAr
        ? `تعرف على مناطق السكن والتنقل الأكثر راحة في ${subject} مع نصائح أمان عملية من ريا.`
        : `Understand the most comfortable areas to stay and move around in ${subject}, with practical safety guidance from Rya.`;
    case "honeymoon":
      return isAr
        ? `هل ${subject} مناسبة لشهر العسل؟ أفضل الأوقات هي ${months}، مع أفكار إقامة وتجارب رومانسية.`
        : `Is ${subject} good for a honeymoon? The best months are ${months}, with stay areas and romantic experience ideas.`;
    case "digital-nomad":
      return isAr
        ? `دليل العمل عن بعد في ${subject}: الإنترنت، المناطق المناسبة، الميزانية، وأسلوب الحياة.`
        : `A digital nomad guide to ${subject}: internet, areas to stay, budget, and daily travel lifestyle.`;
  }
}

export function intentFaq(page: SeoIntentPage, locale: Locale): { q: string; a: string }[] {
  const subject = pageSubject(page, locale);
  const dest = page.destination;
  const isAr = locale === "ar";
  const months = formatBestMonths(dest.bestMonths, locale);
  return [
    {
      q: isAr ? `كيف تساعدني ريا في ${subject}؟` : `How can Rya help me with ${subject}?`,
      a: isAr
        ? `ريا تحفظ سياق رحلتك وتساعدك في التخطيط والميزانية والأمان والخدمات المناسبة داخل المحادثة.`
        : `Rya keeps your trip context in mind and helps with planning, budget, safety, and useful travel services inside the conversation.`,
    },
    {
      q: isAr ? `ما أفضل أشهر السفر؟` : `What are the best travel months?`,
      a: isAr ? `الأشهر الأفضل غالباً: ${months}.` : `The strongest months are usually: ${months}.`,
    },
    {
      q: isAr ? `هل ستظهر لي روابط حجز مباشرة؟` : `Will I see booking links immediately?`,
      a: isAr
        ? `لا. ريا تعرض خدمات مثل الطيران أو التأمين أو eSIM فقط عندما تكون مناسبة لسياق رحلتك.`
        : `No. Rya recommends flights, insurance, eSIMs, or other services only when they fit your trip context.`,
    },
  ];
}

