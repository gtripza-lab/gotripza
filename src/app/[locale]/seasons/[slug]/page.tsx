import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Calendar } from "lucide-react";
import { isLocale, type Locale } from "@/i18n/config";
import {
  DESTINATION_SLUGS,
  getDestination,
  formatBestMonths,
  MONTH_NAMES_EN,
  MONTH_NAMES_AR,
  BUDGET_PAGES,
  COMPARISON_PAGES,
} from "@/lib/seo-destinations";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { InternalLinks, SeoBreadcrumb } from "@/components/seo/InternalLinks";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";
const MARKER = process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER ?? "522867";

interface Props { params: { locale: string; slug: string } }

export async function generateStaticParams() {
  return DESTINATION_SLUGS.flatMap((slug) => [
    { locale: "ar", slug },
    { locale: "en", slug },
  ]);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const dest = getDestination(params.slug);
  if (!dest) return {};
  const isAr = params.locale === "ar";
  const name = isAr ? dest.nameAr : dest.nameEn;

  const title = isAr
    ? `أفضل وقت لزيارة ${name} — دليل المواسم 2025 | GoTripza`
    : `Best Time to Visit ${dest.nameEn} — Season Guide 2025 | GoTripza`;
  const description = isAr
    ? `اكتشف أفضل وقت لزيارة ${name}: الطقس شهراً بشهر، موسم الذروة، الأسعار، وما تتوقعه في كل فصل.`
    : `Find the best time to visit ${dest.nameEn}: month-by-month weather, peak season, prices, and what to expect each season.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE}/${params.locale}/seasons/${params.slug}`,
      languages: {
        en: `${BASE}/en/seasons/${params.slug}`,
        ar: `${BASE}/ar/seasons/${params.slug}`,
        "x-default": `${BASE}/en/seasons/${params.slug}`,
      },
    },
    openGraph: { type: "website", title, description, siteName: "GoTripza" },
  };
}

// Generate rough monthly scores based on best months
function monthScore(month: number, bestMonths: number[]): "peak" | "good" | "ok" | "avoid" {
  if (bestMonths.includes(month)) return "peak";
  // Adjacent months
  const adjacent = bestMonths.some((m) => Math.abs(m - month) === 1 || Math.abs(m - month) === 11);
  if (adjacent) return "good";
  // 2 months away
  const near = bestMonths.some((m) => Math.abs(m - month) === 2 || Math.abs(m - month) === 10);
  if (near) return "ok";
  return "avoid";
}

const SCORE_STYLES = {
  peak: { color: "emerald", bar: "bg-emerald-500", label: { en: "Peak", ar: "ذروة" } },
  good: { color: "sky", bar: "bg-sky-500", label: { en: "Good", ar: "جيد" } },
  ok: { color: "amber", bar: "bg-amber-500", label: { en: "OK", ar: "مقبول" } },
  avoid: { color: "red", bar: "bg-red-500/40", label: { en: "Avoid", ar: "تجنب" } },
};

export default async function SeasonsPage({ params }: Props) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const isAr = locale === "ar";

  const dest = getDestination(params.slug);
  if (!dest) notFound();

  const name = isAr ? dest.nameAr : dest.nameEn;
  const bestMonthsText = formatBestMonths(dest.bestMonths, locale);
  const flightUrl = `https://www.aviasales.com/?marker=${MARKER}&destination=${dest.iata}&subid=seasons`;

  // Categorise all 12 months
  const months = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const score = monthScore(m, dest.bestMonths);
    return { month: m, score, nameEn: MONTH_NAMES_EN[i], nameAr: MONTH_NAMES_AR[i] };
  });

  const seasons = [
    {
      name: { en: "Spring", ar: "الربيع" },
      months: "3-5",
      monthNums: [3, 4, 5],
      icon: "🌸",
    },
    {
      name: { en: "Summer", ar: "الصيف" },
      months: "6-8",
      monthNums: [6, 7, 8],
      icon: "☀️",
    },
    {
      name: { en: "Autumn / Fall", ar: "الخريف" },
      months: "9-11",
      monthNums: [9, 10, 11],
      icon: "🍂",
    },
    {
      name: { en: "Winter", ar: "الشتاء" },
      months: "12-2",
      monthNums: [12, 1, 2],
      icon: "❄️",
    },
  ];

  const budgetPages = BUDGET_PAGES.filter((b) => b.destination === params.slug);
  const comparisons = COMPARISON_PAGES.filter(
    (c) => c.destA === params.slug || c.destB === params.slug,
  );

  const internalLinks = [
    {
      href: `/${locale}/destinations/${params.slug}`,
      label: isAr ? `دليل ${name} الشامل` : `Complete ${dest.nameEn} guide`,
      icon: dest.flag,
    },
    {
      href: `/${locale}/visa/${params.slug}`,
      label: isAr ? `تأشيرة ${name}` : `${dest.nameEn} visa requirements`,
      icon: "🛂",
    },
    ...budgetPages.slice(0, 2).map((b) => ({
      href: `/${locale}/budget/${b.slug}`,
      label: isAr
        ? `هل ${b.budgetUsd}$ كافية لـ${name}؟`
        : `Is $${b.budgetUsd} enough for ${dest.nameEn}?`,
      icon: "💰",
    })),
    ...comparisons.slice(0, 1).map((c) => ({
      href: `/${locale}/compare/${c.slug}`,
      label: isAr ? c.intentAr : c.intentEn,
      icon: "⚖️",
    })),
  ];

  const breadcrumbs = [
    { name: isAr ? "الرئيسية" : "Home", url: `${BASE}/${locale}` },
    { name: isAr ? "المواسم وأفضل وقت للسفر" : "Best Time to Visit", url: `${BASE}/${locale}/seasons` },
    { name, url: `${BASE}/${locale}/seasons/${params.slug}` },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />

      <main className="min-h-screen bg-ink-950 text-white" dir={isAr ? "rtl" : "ltr"}>
        <div className="container mx-auto max-w-3xl px-4 py-12">
          <SeoBreadcrumb
            items={[
              { label: isAr ? "الرئيسية" : "Home", href: `/${locale}` },
              { label: isAr ? "أفضل وقت للسفر" : "Best Time to Visit" },
            ]}
            locale={locale}
          />

          <div className="mt-4 flex items-center gap-3">
            <span className="text-4xl">{dest.flag}</span>
            <h1 className="font-display text-2xl font-bold md:text-3xl">
              {isAr
                ? `أفضل وقت لزيارة ${name}`
                : `Best Time to Visit ${dest.nameEn}`}
            </h1>
          </div>

          {/* Quick answer */}
          <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-emerald-400" />
              <span className="font-semibold text-emerald-300 text-sm">
                {isAr ? "أفضل أشهر الزيارة" : "Best Months"}
              </span>
            </div>
            <p className="text-sm text-white/75">{bestMonthsText}</p>
          </div>

          {/* Climate overview */}
          <section className="mt-6 glass rounded-2xl p-6">
            <h2 className="mb-3 font-display text-lg font-bold">
              {isAr ? "نظرة عامة على المناخ" : "Climate Overview"}
            </h2>
            <p className="text-sm leading-relaxed text-white/70">
              {isAr ? dest.climate.ar : dest.climate.en}
            </p>
          </section>

          {/* Month-by-month calendar */}
          <section className="mt-6 glass rounded-2xl p-6">
            <h2 className="mb-5 font-display text-lg font-bold">
              {isAr ? "التقويم الشهري" : "Month-by-Month Calendar"}
            </h2>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {months.map(({ month, score, nameEn, nameAr }) => {
                const s = SCORE_STYLES[score];
                return (
                  <div
                    key={month}
                    className={`rounded-xl border border-${s.color}-500/20 bg-${s.color}-500/10 p-2.5 text-center`}
                  >
                    <div className="text-xs text-white/60">{isAr ? nameAr : nameEn}</div>
                    <div className={`mt-1 text-xs font-semibold text-${s.color}-400`}>
                      {isAr ? s.label.ar : s.label.en}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(SCORE_STYLES).map(([key, val]) => (
                <span key={key} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs border border-${val.color}-500/20 bg-${val.color}-500/10 text-${val.color}-400`}>
                  {isAr ? val.label.ar : val.label.en}
                </span>
              ))}
            </div>
          </section>

          {/* Seasons breakdown */}
          <section className="mt-6 space-y-4">
            <h2 className="font-display text-lg font-bold">
              {isAr ? "الفصول الأربعة" : "The Four Seasons"}
            </h2>
            {seasons.map((s) => {
              const seasonScore = s.monthNums.map((m) => monthScore(m, dest.bestMonths));
              const best = seasonScore.includes("peak");
              const decent = seasonScore.includes("good");
              return (
                <div key={s.months} className="glass rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{s.icon}</span>
                    <div>
                      <div className="font-semibold">{isAr ? s.name.ar : s.name.en}</div>
                      <div className="text-xs text-white/40">{s.months}</div>
                    </div>
                    {best && (
                      <span className="ms-auto text-xs rounded-full bg-emerald-500/20 text-emerald-400 px-2 py-0.5">
                        {isAr ? "مثالي" : "Ideal"}
                      </span>
                    )}
                    {!best && decent && (
                      <span className="ms-auto text-xs rounded-full bg-sky-500/20 text-sky-400 px-2 py-0.5">
                        {isAr ? "جيد" : "Good"}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/55 leading-relaxed">
                    {isAr
                      ? best
                        ? `${s.name.ar} هو أفضل وقت لزيارة ${name}. ${dest.climate.ar}`
                        : `${s.name.ar} في ${name}: ${dest.climate.ar}`
                      : best
                      ? `${s.name.en} is prime time for ${dest.nameEn}. ${dest.climate.en}`
                      : `${s.name.en} in ${dest.nameEn}: ${dest.climate.en}`}
                  </p>
                </div>
              );
            })}
          </section>

          {/* Clothing tips */}
          <section className="mt-6 glass rounded-2xl p-5">
            <h2 className="mb-3 font-display text-lg font-bold">
              {isAr ? "ماذا تلبس؟" : "What to Pack?"}
            </h2>
            <p className="text-sm leading-relaxed text-white/70">
              {isAr ? dest.clothing.ar : dest.clothing.en}
            </p>
          </section>

          {/* CTA */}
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={flightUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-primary to-brand-deep px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02]"
            >
              {isAr ? `احجز طيرانك إلى ${name}` : `Book flights to ${dest.nameEn}`}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <Link
              href={`/${locale}/search?q=${encodeURIComponent(isAr ? `رحلة إلى ${dest.nameAr}` : `trip to ${dest.nameEn}`)}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm text-white/70 transition hover:border-white/40 hover:text-white"
            >
              {isAr ? "خطط رحلتي بالذكاء الاصطناعي" : "Plan with AI"}
            </Link>
          </div>

          <InternalLinks
            title={isAr ? "روابط ذات صلة" : "Related Guides"}
            links={internalLinks}
            locale={locale}
          />
        </div>
      </main>
    </>
  );
}
