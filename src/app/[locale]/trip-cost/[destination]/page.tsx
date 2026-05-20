import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calculator, MapPin } from "lucide-react";
import { isLocale, locales, type Locale } from "@/i18n/config";
import {
  dailyBudgetRows,
  getTripCostStaticParams,
  getTripCostSubject,
  ORIGIN_MARKETS,
  tripCostPath,
} from "@/lib/global-seo-system";
import { seoCopy } from "@/lib/seo-localization";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";

type Props = { params: Promise<{ locale: string; destination: string }> };

const SUBJECT_SLUGS = [...new Set(getTripCostStaticParams(80).map((page) => page.destination))];

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    SUBJECT_SLUGS.map((destination) => ({ locale, destination })),
  );
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  if (!isLocale(params.locale)) return {};
  const subject = getTripCostSubject(params.destination);
  if (!subject) return {};

  const title = `${subject.nameEn} Trip Cost Guides by Origin City`;
  const description = `Compare ${subject.nameEn} trip costs from major origin markets, including daily budgets, currencies, seasons, and Rya planning links.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE}/${params.locale}/trip-cost/${subject.slug}`,
      languages: Object.fromEntries([
        ...locales.map((locale) => [locale, `${BASE}/${locale}/trip-cost/${subject.slug}`]),
        ["x-default", `${BASE}/en/trip-cost/${subject.slug}`],
      ]),
    },
  };
}

export default async function TripCostSubjectHubPage(props: Props) {
  const params = await props.params;
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const isAr = locale === "ar";
  const copy = seoCopy(locale);
  const subject = getTripCostSubject(params.destination);
  if (!subject) notFound();

  const rows = dailyBudgetRows(subject);

  return (
    <main className="min-h-screen bg-ink-950 pb-20 text-white" dir={isAr ? "rtl" : "ltr"}>
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60">
          <Calculator className="h-3.5 w-3.5 text-brand-primary" />
          {isAr ? "مركز تكلفة الوجهة" : "Destination trip cost hub"}
        </div>

        <h1 className="mt-5 max-w-3xl font-display text-3xl font-bold md:text-5xl">
          {subject.nameEn} Trip Cost Guides
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/65 md:text-base">
          Compare realistic {subject.nameEn} travel budgets from major origin markets. Each guide includes daily spending bands, seasonal context, currency notes, and Rya planning prompts.
        </p>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {rows.map((row) => (
            <article key={row.style} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <h2 className="font-display text-lg font-semibold">{row.style}</h2>
              <p className="mt-2 text-3xl font-bold">${row.amount}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-white/38">{copy.perPersonDay}</p>
              <p className="mt-4 text-sm leading-6 text-white/62">{row.notes}</p>
            </article>
          ))}
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">
            {isAr ? "اختر مدينة الانطلاق" : "Choose your origin city"}
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {ORIGIN_MARKETS.map((origin) => (
              <Link
                key={origin.slug}
                href={tripCostPath(locale, subject.slug, origin.slug)}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-brand-primary/35 hover:bg-brand-primary/10"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-brand-primary" />
                  <h3 className="font-semibold">{origin.city}</h3>
                </div>
                <p className="mt-2 text-xs text-white/42">
                  {origin.country} · {origin.airport} · {origin.currency}
                </p>
                <p className="mt-4 line-clamp-2 text-sm leading-6 text-white/58">
                  {origin.travelerContext}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
