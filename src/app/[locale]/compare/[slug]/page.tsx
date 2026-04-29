import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { isLocale, type Locale } from "@/i18n/config";
import {
  COMPARISON_PAGES,
  getDestination,
  formatBestMonths,
} from "@/lib/seo-destinations";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { InternalLinks, SeoBreadcrumb } from "@/components/seo/InternalLinks";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";
const MARKER = process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER ?? "522867";

interface Props { params: { locale: string; slug: string } }

export async function generateStaticParams() {
  return COMPARISON_PAGES.flatMap((c) => [
    { locale: "ar", slug: c.slug },
    { locale: "en", slug: c.slug },
  ]);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const page = COMPARISON_PAGES.find((c) => c.slug === params.slug);
  if (!page) return {};
  const isAr = params.locale === "ar";
  const destA = getDestination(page.destA);
  const destB = getDestination(page.destB);
  if (!destA || !destB) return {};

  const nameA = isAr ? destA.nameAr : destA.nameEn;
  const nameB = isAr ? destB.nameAr : destB.nameEn;

  const title = isAr
    ? `${nameA} أم ${nameB}؟ مقارنة شاملة 2025 | GoTripza`
    : `${destA.nameEn} vs ${destB.nameEn} — Full Comparison 2025 | GoTripza`;
  const description = isAr
    ? `مقارنة شاملة بين ${nameA} و${nameB}: التكاليف، الطقس، التأشيرة، الفنادق، الأنشطة. اختر الوجهة المثالية لرحلتك.`
    : `${destA.nameEn} vs ${destB.nameEn}: full comparison of costs, weather, visa, hotels, and activities. Find out which destination is right for your trip.`;

  const pageUrl = `${BASE}/${params.locale}/compare/${params.slug}`;
  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
      languages: {
        en: `${BASE}/en/compare/${params.slug}`,
        ar: `${BASE}/ar/compare/${params.slug}`,
        "x-default": `${BASE}/en/compare/${params.slug}`,
      },
    },
    openGraph: { type: "website", title, description, url: pageUrl, siteName: "GoTripza" },
  };
}

export default async function ComparisonPage({ params }: Props) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const isAr = locale === "ar";

  const page = COMPARISON_PAGES.find((c) => c.slug === params.slug);
  if (!page) notFound();

  const destA = getDestination(page.destA);
  const destB = getDestination(page.destB);
  if (!destA || !destB) notFound();

  const nameA = isAr ? destA.nameAr : destA.nameEn;
  const nameB = isAr ? destB.nameAr : destB.nameEn;

  const flightA = `https://www.aviasales.com/?marker=${MARKER}&destination=${destA.iata}&subid=compare`;
  const flightB = `https://www.aviasales.com/?marker=${MARKER}&destination=${destB.iata}&subid=compare`;

  const breadcrumbs = [
    { name: isAr ? "الرئيسية" : "Home", url: `${BASE}/${locale}` },
    { name: isAr ? "مقارنات" : "Comparisons", url: `${BASE}/${locale}/compare` },
    { name: isAr ? page.intentAr : page.intentEn, url: `${BASE}/${locale}/compare/${params.slug}` },
  ];

  const rows = [
    {
      label: { en: "Daily budget (budget traveller)", ar: "الميزانية اليومية (اقتصادي)" },
      a: `$${destA.budgetPerDay.budget}`,
      b: `$${destB.budgetPerDay.budget}`,
      winner: destA.budgetPerDay.budget <= destB.budgetPerDay.budget ? "a" : "b",
      wLabel: { en: "Cheaper", ar: "أرخص" },
    },
    {
      label: { en: "Daily budget (mid-range)", ar: "الميزانية اليومية (متوسط)" },
      a: `$${destA.budgetPerDay.mid}`,
      b: `$${destB.budgetPerDay.mid}`,
      winner: destA.budgetPerDay.mid <= destB.budgetPerDay.mid ? "a" : "b",
      wLabel: { en: "More affordable", ar: "أكثر توفيراً" },
    },
    {
      label: { en: "Best months", ar: "أفضل أشهر الزيارة" },
      a: formatBestMonths(destA.bestMonths, locale),
      b: formatBestMonths(destB.bestMonths, locale),
      winner: null,
      wLabel: { en: "", ar: "" },
    },
    {
      label: { en: "e-Visa available", ar: "تأشيرة إلكترونية" },
      a: destA.eVisa ? "✅" : "❌",
      b: destB.eVisa ? "✅" : "❌",
      winner: null,
      wLabel: { en: "", ar: "" },
    },
    {
      label: { en: "Visa-free for GCC nationals", ar: "بدون تأشيرة لدول الخليج" },
      a: destA.visaFree.some((c) => ["SA", "AE", "KW", "QA", "BH", "OM"].includes(c)) || !destA.visaFree.length && destA.visaOnArrival.includes("ALL") ? "✅" : "❌",
      b: destB.visaFree.some((c) => ["SA", "AE", "KW", "QA", "BH", "OM"].includes(c)) || !destB.visaFree.length && destB.visaOnArrival.includes("ALL") ? "✅" : "❌",
      winner: null,
      wLabel: { en: "", ar: "" },
    },
    {
      label: { en: "Car rental recommended", ar: "إيجار سيارة موصى به" },
      a: destA.carRental ? "✅" : "❌",
      b: destB.carRental ? "✅" : "❌",
      winner: null,
      wLabel: { en: "", ar: "" },
    },
  ];

  const internalLinks = [
    {
      href: `/${locale}/destinations/${page.destA}`,
      label: isAr ? `دليل ${nameA} الشامل` : `Complete ${destA.nameEn} guide`,
      icon: destA.flag,
    },
    {
      href: `/${locale}/destinations/${page.destB}`,
      label: isAr ? `دليل ${nameB} الشامل` : `Complete ${destB.nameEn} guide`,
      icon: destB.flag,
    },
    {
      href: `/${locale}/seasons/${page.destA}`,
      label: isAr ? `أفضل وقت لزيارة ${nameA}` : `Best time to visit ${destA.nameEn}`,
      icon: "📅",
    },
    {
      href: `/${locale}/seasons/${page.destB}`,
      label: isAr ? `أفضل وقت لزيارة ${nameB}` : `Best time to visit ${destB.nameEn}`,
      icon: "📅",
    },
    {
      href: `/${locale}/visa/${page.destA}`,
      label: isAr ? `تأشيرة ${nameA}` : `${destA.nameEn} visa guide`,
      icon: "🛂",
    },
    {
      href: `/${locale}/visa/${page.destB}`,
      label: isAr ? `تأشيرة ${nameB}` : `${destB.nameEn} visa guide`,
      icon: "🛂",
    },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />

      <main className="min-h-screen bg-ink-950 text-white" dir={isAr ? "rtl" : "ltr"}>
        <div className="container mx-auto max-w-4xl px-4 py-12">
          <SeoBreadcrumb
            items={[
              { label: isAr ? "الرئيسية" : "Home", href: `/${locale}` },
              { label: isAr ? "مقارنات" : "Comparisons" },
            ]}
            locale={locale}
          />

          <h1 className="mt-4 font-display text-3xl font-bold md:text-4xl">
            {isAr
              ? `${nameA} ${destA.flag} أم ${nameB} ${destB.flag}؟`
              : `${destA.nameEn} ${destA.flag} vs ${destB.nameEn} ${destB.flag}`}
          </h1>
          <p className="mt-2 text-white/60 max-w-2xl">
            {isAr ? page.intentAr : page.intentEn}
          </p>

          {/* Snapshot cards */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[destA, destB].map((d) => (
              <div key={d.slug} className="glass rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{d.flag}</span>
                  <div>
                    <div className="font-bold">{isAr ? d.nameAr : d.nameEn}</div>
                    <div className="text-xs text-white/45">{isAr ? d.countryAr : d.country}</div>
                  </div>
                </div>
                <p className="text-xs text-white/60 leading-relaxed mb-3 line-clamp-3">
                  {isAr ? d.descriptionAr : d.descriptionEn}
                </p>
                <a
                  href={d.slug === page.destA ? flightA : flightB}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary/20 border border-brand-primary/30 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-primary/30"
                >
                  {isAr ? `طيران إلى ${isAr ? d.nameAr : d.nameEn}` : `Flights to ${d.nameEn}`}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ))}
          </div>

          {/* Comparison table */}
          <section className="mt-8 glass rounded-2xl overflow-hidden">
            <h2 className="px-6 py-4 font-display text-lg font-bold border-b border-white/10">
              {isAr ? "مقارنة جنباً إلى جنب" : "Side-by-Side Comparison"}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-white/50">
                    <th className="px-4 py-3 text-start font-medium">
                      {isAr ? "المعيار" : "Criterion"}
                    </th>
                    <th className="px-4 py-3 text-center font-medium">{nameA}</th>
                    <th className="px-4 py-3 text-center font-medium">{nameB}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-white/60">
                        {isAr ? row.label.ar : row.label.en}
                      </td>
                      <td className={`px-4 py-3 text-center font-medium ${row.winner === "a" ? "text-emerald-400" : ""}`}>
                        {row.a}
                        {row.winner === "a" && (
                          <span className="ms-1 text-xs text-emerald-400">
                            ✓
                          </span>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-center font-medium ${row.winner === "b" ? "text-emerald-400" : ""}`}>
                        {row.b}
                        {row.winner === "b" && (
                          <span className="ms-1 text-xs text-emerald-400">
                            ✓
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Activities comparison */}
          <section className="mt-6 glass rounded-2xl p-6">
            <h2 className="mb-4 font-display text-lg font-bold">
              {isAr ? "الأنشطة والتجارب" : "Activities & Experiences"}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {[destA, destB].map((d) => (
                <div key={d.slug}>
                  <h3 className="mb-2 text-sm font-semibold text-white/70">
                    {isAr ? d.nameAr : d.nameEn}
                  </h3>
                  <ul className="space-y-1.5">
                    {d.activities.map((a) => (
                      <li key={a.en} className="flex items-center gap-2 text-sm text-white/60">
                        <span>{a.icon}</span>
                        {isAr ? a.ar : a.en}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Verdict */}
          <section className="mt-6 rounded-2xl border border-brand-primary/20 bg-gradient-to-br from-brand-primary/10 to-brand-deep/10 p-6">
            <h2 className="mb-3 font-display text-lg font-bold">
              {isAr ? "📊 الحكم النهائي" : "📊 Final Verdict"}
            </h2>
            {isAr ? (
              <p className="text-sm leading-relaxed text-white/70">
                <strong className="text-white">{nameA}</strong> هي الأفضل إذا كنت تبحث عن{" "}
                {destA.taglineAr.split("—")[1]?.trim() ?? destA.taglineAr}.
                أما <strong className="text-white">{nameB}</strong> فهي الخيار الأمثل لمن يريد{" "}
                {destB.taglineAr.split("—")[1]?.trim() ?? destB.taglineAr}. كلتاهما وجهتان استثنائيتان — والاختيار يعتمد على ما تبحث عنه في رحلتك.
              </p>
            ) : (
              <p className="text-sm leading-relaxed text-white/70">
                <strong className="text-white">{destA.nameEn}</strong> is the better choice if you want{" "}
                {destA.taglineEn.split("—")[1]?.trim() ?? destA.taglineEn}.{" "}
                <strong className="text-white">{destB.nameEn}</strong> wins if you&apos;re after{" "}
                {destB.taglineEn.split("—")[1]?.trim() ?? destB.taglineEn}.
                Both are exceptional — the right choice depends on what matters most to you.
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={flightA}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-brand-primary/20 border border-brand-primary/30 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary/30"
              >
                {isAr ? `طيران إلى ${nameA}` : `Fly to ${destA.nameEn}`}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <a
                href={flightB}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-brand-mint/20 border border-brand-mint/30 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-mint/30"
              >
                {isAr ? `طيران إلى ${nameB}` : `Fly to ${destB.nameEn}`}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </section>

          <InternalLinks
            title={isAr ? "ادرس كل وجهة على حدة" : "Explore Each Destination"}
            links={internalLinks}
            locale={locale}
          />
        </div>
      </main>
    </>
  );
}
