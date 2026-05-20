import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Plane } from "lucide-react";
import { isLocale, locales } from "@/i18n/config";
import { AIRPORT_GUIDES } from "@/lib/global-travel-guides";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  if (!isLocale(params.locale)) return {};
  return {
    title: "Airport Guides: Transfers, eSIM, Taxis and Arrival Tips",
    description: "Plan airport arrivals with transfer options, late-night guidance, eSIM setup, taxi caution, and destination links from Rya by GoTripza.",
    alternates: {
      canonical: `${BASE}/${params.locale}/airports`,
      languages: Object.fromEntries([
        ...locales.map((locale) => [locale, `${BASE}/${locale}/airports`]),
        ["x-default", `${BASE}/en/airports`],
      ]),
    },
  };
}

export default async function AirportsHubPage(props: Props) {
  const params = await props.params;
  if (!isLocale(params.locale)) notFound();
  const isAr = params.locale === "ar";

  return (
    <main className="min-h-screen bg-ink-950 pb-20 text-white" dir={isAr ? "rtl" : "ltr"}>
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60">
          <Plane className="h-3.5 w-3.5 text-brand-primary" />
          {isAr ? "أدلة المطارات" : "Airport arrival guides"}
        </div>
        <h1 className="mt-5 max-w-3xl font-display text-3xl font-bold md:text-5xl">
          {isAr ? "أدلة المطارات والوصول" : "Airport Guides for Smoother Arrivals"}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/65 md:text-base">
          {isAr
            ? "خطط الوصول، المواصلات، eSIM، التاكسي، وأول انتقال للفندق قبل أن تهبط."
            : "Plan transfers, eSIM setup, taxi choices, late arrivals, and the first move to your hotel before you land."}
        </p>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {AIRPORT_GUIDES.map((airport) => (
            <Link
              key={airport.code}
              href={`/${params.locale}/airports/${airport.code.toLowerCase()}`}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-brand-primary/35 hover:bg-brand-primary/10"
            >
              <p className="text-xs font-semibold text-brand-primary">{airport.code}</p>
              <h2 className="mt-2 font-display text-lg font-semibold">{airport.name}</h2>
              <p className="mt-2 text-sm text-white/45">{airport.city}, {airport.country}</p>
              <p className="mt-4 line-clamp-3 text-sm leading-6 text-white/58">{airport.arrivalTip}</p>
            </Link>
          ))}
        </section>
      </section>
    </main>
  );
}
