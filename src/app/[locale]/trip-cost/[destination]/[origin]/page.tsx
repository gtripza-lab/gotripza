import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calculator, Calendar, Globe2, Plane, ShieldCheck, Wallet } from "lucide-react";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/JsonLd";
import { SeoBreadcrumb } from "@/components/seo/InternalLinks";
import {
  dailyBudgetRows,
  getOriginMarket,
  getTripCostStaticParams,
  getTripCostSubject,
  localizedTripCostDescription,
  localizedTripCostTitle,
  tripCostFaq,
  tripCostPath,
} from "@/lib/global-seo-system";
import { seoCopy } from "@/lib/seo-localization";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";

type Props = {
  params: Promise<{ locale: string; destination: string; origin: string }>;
};

function normalizeOrigin(value: string) {
  return value.replace(/^from-/, "");
}

function languageAlternates(destination: string, origin: string) {
  return Object.fromEntries([
    ...locales.map((locale) => [
      locale,
      `${BASE}${tripCostPath(locale, destination, normalizeOrigin(origin))}`,
    ]),
    ["x-default", `${BASE}${tripCostPath("en", destination, normalizeOrigin(origin))}`],
  ]);
}

function JsonLdScript({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export async function generateStaticParams() {
  return getTripCostStaticParams(60);
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  if (!isLocale(params.locale)) return {};

  const destination = getTripCostSubject(params.destination);
  const origin = getOriginMarket(normalizeOrigin(params.origin));
  if (!destination || !origin) return {};

  const locale = params.locale as Locale;
  const title = localizedTripCostTitle(destination, origin, locale);
  const description = localizedTripCostDescription(destination, origin, locale);

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE}${tripCostPath(locale, destination.slug, origin.slug)}`,
      languages: languageAlternates(destination.slug, origin.slug),
    },
    openGraph: {
      type: "article",
      title,
      description,
      siteName: "Rya by GoTripza",
      url: `${BASE}${tripCostPath(locale, destination.slug, origin.slug)}`,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function TripCostPage(props: Props) {
  const params = await props.params;
  if (!isLocale(params.locale)) notFound();

  const locale = params.locale as Locale;
  const isAr = locale === "ar";
  const copy = seoCopy(locale);
  const destination = getTripCostSubject(params.destination);
  const origin = getOriginMarket(normalizeOrigin(params.origin));
  if (!destination || !origin) notFound();

  const title = localizedTripCostTitle(destination, origin, locale);
  const description = localizedTripCostDescription(destination, origin, locale);
  const pageUrl = `${BASE}${tripCostPath(locale, destination.slug, origin.slug)}`;
  const faqs = tripCostFaq(destination, origin, locale);
  const rows = dailyBudgetRows(destination);
  const relatedDestinationSlug =
    "destinationSlugs" in destination ? destination.destinationSlugs[0] : destination.slug;
  const sevenDayMid = destination.budgetPerDay.mid * 7;
  const tenDayMid = destination.budgetPerDay.mid * 10;
  const fourteenDayMid = destination.budgetPerDay.mid * 14;

  const breadcrumbs = [
    { name: isAr ? "الرئيسية" : "Home", url: `${BASE}/${locale}` },
    { name: isAr ? "تكلفة الرحلات" : "Trip Cost", url: `${BASE}/${locale}/trip-cost` },
    { name: title, url: pageUrl },
  ];

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: pageUrl,
    inLanguage: locale,
    isPartOf: { "@type": "WebSite", name: "Rya by GoTripza", url: BASE },
    about: [
      { "@type": "TouristDestination", name: destination.nameEn },
      { "@type": "Place", name: origin.city },
    ],
  };

  const datasetJsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `Rya ${destination.nameEn} Trip Cost Index from ${origin.city}`,
    description: `Estimated ${destination.nameEn} trip cost bands by travel style for travelers departing ${origin.city}.`,
    creator: { "@type": "Organization", name: "Rya by GoTripza", url: BASE },
    spatialCoverage: destination.country,
    temporalCoverage: "2026",
    variableMeasured: rows.map((row) => ({
      "@type": "PropertyValue",
      name: `${row.style} daily budget`,
      value: row.amount,
      unitText: "USD per traveler per day",
    })),
  };

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <FaqJsonLd items={faqs} />
      <JsonLdScript data={webPageJsonLd} />
      <JsonLdScript data={datasetJsonLd} />

      <main className="min-h-screen bg-ink-950 pb-20 text-white" dir={isAr ? "rtl" : "ltr"}>
        <section className="mx-auto max-w-5xl px-5 py-12">
          <SeoBreadcrumb
            items={[
              { label: isAr ? "الرئيسية" : "Home", href: `/${locale}` },
              { label: isAr ? "تكلفة الرحلات" : "Trip cost" },
            ]}
            locale={locale}
          />

          <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60">
            <Calculator className="h-3.5 w-3.5 text-brand-primary" />
            {isAr ? "صفحة تكلفة مبنية للبحث الذكي" : "AI-search ready cost guide"}
          </div>

          <div className="mt-5 grid gap-8 lg:grid-cols-[1.45fr_0.9fr] lg:items-start">
            <div>
              <h1 className="max-w-3xl font-display text-3xl font-bold leading-tight md:text-5xl">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68 md:text-base">
                {description}
              </p>

              <div className="mt-6 rounded-2xl border border-brand-primary/25 bg-brand-primary/10 p-5">
                <p className="text-sm font-semibold text-brand-primary">
                  {copy.shortAnswer}
                </p>
                <p className="mt-2 text-sm leading-7 text-white/76">
                  {isAr
                    ? `رحلة ${destination.nameAr} من ${origin.city} تحتاج عادة إلى ميزانية يومية داخل الوجهة بين ${destination.budgetPerDay.budget} و${destination.budgetPerDay.mid} دولار للمسافر العملي، وقد تصل إلى ${destination.budgetPerDay.luxury}+ دولار لرحلة فاخرة، قبل إضافة تذاكر الطيران.`
                    : `A ${destination.nameEn} trip from ${origin.city} usually needs an in-destination daily budget of about $${destination.budgetPerDay.budget}-$${destination.budgetPerDay.mid} for practical travelers, rising to $${destination.budgetPerDay.luxury}+ for luxury trips, before international flights.`}
                </p>
              </div>
            </div>

            <aside className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <h2 className="font-display text-lg font-semibold">
                {copy.quickSnapshot}
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-white/50">{copy.from}</dt>
                  <dd className="font-medium">{origin.city} ({origin.airport})</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-white/50">{copy.to}</dt>
                  <dd className="font-medium">{destination.nameEn} ({destination.iata})</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-white/50">{copy.localCurrency}</dt>
                  <dd className="font-medium">{destination.currency}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-white/50">{copy.originCurrency}</dt>
                  <dd className="font-medium">{origin.currency}</dd>
                </div>
              </dl>
            </aside>
          </div>

          <section className="mt-10 grid gap-4 md:grid-cols-3">
            {rows.map((row) => (
              <div key={row.style} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <Wallet className="mb-4 h-5 w-5 text-brand-primary" />
                <h2 className="font-display text-lg font-semibold">{row.style}</h2>
                <p className="mt-2 text-3xl font-bold">${row.amount}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-white/38">
                  {copy.perPersonDay}
                </p>
                <p className="mt-4 text-sm leading-6 text-white/62">{row.notes}</p>
              </div>
            ))}
          </section>

          <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="font-display text-xl font-semibold">
              {isAr ? "ميزانية نموذجية حسب مدة الرحلة" : "Sample mid-range budgets by trip length"}
            </h2>
            <div className="mt-5 overflow-hidden rounded-xl border border-white/10">
              <table className="w-full text-sm">
                <thead className="bg-white/[0.06] text-white/60">
                  <tr>
                    <th className="px-4 py-3 text-start">{copy.tripLength}</th>
                    <th className="px-4 py-3 text-start">{copy.inDestinationBudget}</th>
                    <th className="px-4 py-3 text-start">{copy.bestFor}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {[
                    ["7 days", `$${sevenDayMid}`, "fast first-time trip"],
                    ["10 days", `$${tenDayMid}`, "balanced sightseeing and rest"],
                    ["14 days", `$${fourteenDayMid}`, "slower route with day trips"],
                  ].map(([length, amount, fit]) => (
                    <tr key={length}>
                      <td className="px-4 py-3 font-medium">{length}</td>
                      <td className="px-4 py-3 text-brand-primary">{amount}</td>
                      <td className="px-4 py-3 text-white/62">{fit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <Plane className="mb-3 h-5 w-5 text-sky-300" />
              <h2 className="font-display text-lg font-semibold">
                {isAr ? "سياق الطيران" : "Flight context"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/64">
                {origin.travelerContext}. {isAr ? "قارن السعر مع مدة التوقف وليس السعر فقط." : "Compare price against stopover time, arrival hour, and baggage rules, not the fare alone."}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <Calendar className="mb-3 h-5 w-5 text-emerald-300" />
              <h2 className="font-display text-lg font-semibold">
                {isAr ? "أفضل توقيت" : "Best timing"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/64">
                {isAr
                  ? `الأشهر الأقوى عادة: ${destination.bestMonths.join("، ")}.`
                  : `The strongest balance of weather and value is usually around ${destination.bestMonths.join(", ")}.`}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <ShieldCheck className="mb-3 h-5 w-5 text-amber-300" />
              <h2 className="font-display text-lg font-semibold">
                {isAr ? "تجنب الهدر" : "Avoid budget leaks"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/64">
                {isAr
                  ? "اترك هامشاً للمطار، الإنترنت، التأمين، ورسوم الأنشطة التي لا تظهر في تكلفة الفندق."
                  : "Leave margin for airport transfers, mobile data, insurance, card fees, and attractions that are not visible in the hotel price."}
              </p>
            </div>
          </section>

          <section className="mt-10 rounded-2xl border border-brand-primary/20 bg-brand-primary/10 p-6">
            <div className="flex items-center gap-2 text-brand-primary">
              <Globe2 className="h-4 w-4" />
              <h2 className="font-display text-xl font-semibold">
                {isAr ? "حوّل الميزانية إلى خطة مع ريا" : "Turn this budget into a Rya plan"}
              </h2>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/72">
              {isAr
                ? `اكتب لريا عدد الأيام ومن يسافر معك وأسلوبك، وستحوّل تكلفة ${destination.nameAr} من ${origin.city} إلى خطة عملية.`
                : `Tell Rya your dates, companions, hotel style, and comfort level, and she will turn this ${destination.nameEn} cost estimate from ${origin.city} into a practical itinerary.`}
            </p>
            <Link
              href={`/${locale}/search?q=${encodeURIComponent(`Plan ${destination.nameEn} from ${origin.city} with this budget`)}`}
              className="mt-5 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink-950 transition hover:bg-white/90"
            >
              {copy.planWithRya}
            </Link>
          </section>

          <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="font-display text-lg font-semibold">
              {copy.relatedPlanningLinks}
            </h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                [`/${locale}/destinations/${relatedDestinationSlug}`, isAr ? `دليل ${destination.nameAr}` : `${destination.nameEn} travel guide`],
                [`/${locale}/seasons/${relatedDestinationSlug}`, isAr ? "أفضل وقت للزيارة" : "Best time to visit"],
                [`/${locale}/hotels/${relatedDestinationSlug}`, isAr ? "أفضل مناطق السكن" : "Best stay areas"],
                [`/${locale}/visa/${relatedDestinationSlug}`, isAr ? "متطلبات التأشيرة" : "Visa requirements"],
              ].map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-xl border border-white/[0.07] bg-black/15 px-4 py-3 text-sm text-white/68 transition hover:border-brand-primary/35 hover:bg-brand-primary/10 hover:text-white"
                >
                  {label}
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="font-display text-lg font-semibold">
              {copy.faq}
            </h2>
            <div className="mt-4 space-y-3">
              {faqs.map((faq) => (
                <div key={faq.q} className="rounded-xl bg-black/15 p-4">
                  <h3 className="text-sm font-semibold text-white/86">{faq.q}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/62">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        </section>
      </main>
    </>
  );
}
