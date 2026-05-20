import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calculator, Globe2 } from "lucide-react";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { DESTINATIONS } from "@/lib/seo-destinations";
import { ORIGIN_MARKETS, tripCostPath } from "@/lib/global-seo-system";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  if (!isLocale(params.locale)) return {};
  return {
    title: "Trip Cost Guides by Destination and Origin",
    description: "Compare realistic travel budgets by destination, origin city, travel style, season, and daily spending with Rya by GoTripza.",
    alternates: {
      canonical: `${BASE}/${params.locale}/trip-cost`,
      languages: Object.fromEntries([
        ...locales.map((locale) => [locale, `${BASE}/${locale}/trip-cost`]),
        ["x-default", `${BASE}/en/trip-cost`],
      ]),
    },
  };
}

export default async function TripCostHubPage(props: Props) {
  const params = await props.params;
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const isAr = locale === "ar";
  const destinations = DESTINATIONS.slice(0, 36);
  const origins = ORIGIN_MARKETS.slice(0, 8);

  return (
    <main className="min-h-screen bg-ink-950 pb-20 text-white" dir={isAr ? "rtl" : "ltr"}>
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60">
          <Calculator className="h-3.5 w-3.5 text-brand-primary" />
          {isAr ? "مركز ميزانيات السفر" : "Global trip cost hub"}
        </div>
        <h1 className="mt-5 max-w-3xl font-display text-3xl font-bold md:text-5xl">
          {isAr ? "تكلفة الرحلات حسب الوجهة ومدينة الانطلاق" : "Trip Cost Guides by Destination and Origin"}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/65 md:text-base">
          {isAr
            ? "ابدأ من الوجهة ومدينة الانطلاق لتحصل على ميزانية يومية، موسم مناسب، وروابط تخطيط مع ريا."
            : "Start with a destination and origin city to estimate daily budget, seasonal value, and Rya-ready planning links."}
        </p>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {destinations.map((destination) => (
            <article key={destination.slug} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{destination.flag}</span>
                <h2 className="font-display text-lg font-semibold">{destination.nameEn}</h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/55">
                ${destination.budgetPerDay.budget}-${destination.budgetPerDay.mid}/day practical range.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/${locale}/trip-cost/${destination.slug}`}
                  className="rounded-full border border-brand-primary/30 bg-brand-primary/10 px-3 py-1.5 text-xs text-brand-primary hover:bg-brand-primary/15"
                >
                  all origins
                </Link>
                {origins.slice(0, 3).map((origin) => (
                  <Link
                    key={origin.slug}
                    href={tripCostPath(locale, destination.slug, origin.slug)}
                    className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-white/65 hover:border-brand-primary/40 hover:text-white"
                  >
                    from {origin.city}
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-2xl border border-brand-primary/20 bg-brand-primary/10 p-6">
          <div className="flex items-center gap-2 text-brand-primary">
            <Globe2 className="h-4 w-4" />
            <h2 className="font-display text-xl font-semibold">Rya cost intelligence</h2>
          </div>
          <p className="mt-3 text-sm leading-7 text-white/70">
            Trip cost pages combine origin-market context, destination budgets, seasonality, insurance, eSIM, airport, and traveler-style guidance.
          </p>
        </section>
      </section>
    </main>
  );
}
