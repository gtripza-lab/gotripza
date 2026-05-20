import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CarTaxiFront, Clock, Plane, Route, Smartphone } from "lucide-react";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/JsonLd";
import { SeoBreadcrumb } from "@/components/seo/InternalLinks";
import { getDestination } from "@/lib/seo-destinations";
import {
  getAirportGuide,
  getAirportStaticParams,
} from "@/lib/global-travel-guides";
import { seoCopy } from "@/lib/seo-localization";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";

type Props = { params: Promise<{ locale: string; code: string }> };

function airportAlternates(code: string) {
  return Object.fromEntries([
    ...locales.map((locale) => [locale, `${BASE}/${locale}/airports/${code.toLowerCase()}`]),
    ["x-default", `${BASE}/en/airports/${code.toLowerCase()}`],
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
  return getAirportStaticParams();
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  if (!isLocale(params.locale)) return {};
  const airport = getAirportGuide(params.code);
  if (!airport) return {};
  const title = `${airport.name} (${airport.code}) Guide: Transfers, eSIM, Hotels & Arrival Tips`;
  const description = `Arriving at ${airport.name}? Compare transfer options, arrival timing, eSIM setup, taxi tips, and links to plan ${airport.city} with Rya.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE}/${params.locale}/airports/${airport.code.toLowerCase()}`,
      languages: airportAlternates(airport.code),
    },
    openGraph: {
      type: "article",
      title,
      description,
      siteName: "Rya by GoTripza",
      url: `${BASE}/${params.locale}/airports/${airport.code.toLowerCase()}`,
    },
  };
}

export default async function AirportGuidePage(props: Props) {
  const params = await props.params;
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const isAr = locale === "ar";
  const copy = seoCopy(locale);
  const airport = getAirportGuide(params.code);
  if (!airport) notFound();
  const destination = getDestination(airport.destinationSlug);
  if (!destination) notFound();

  const pageUrl = `${BASE}/${locale}/airports/${airport.code.toLowerCase()}`;
  const title = `${airport.name} (${airport.code}) Guide`;
  const faqs = [
    {
      q: `What is the best way from ${airport.code} to ${airport.city}?`,
      a: `The best option depends on your hotel area, luggage, arrival time, and group size. Common choices include ${airport.transferModes.join(", ")}.`,
    },
    {
      q: `Should I buy an eSIM at ${airport.name}?`,
      a: "An eSIM is useful before leaving arrivals if you need maps, translation, ride apps, or hotel messaging immediately.",
    },
    {
      q: `Is ${airport.name} easy for families?`,
      a: "Families should prioritize simple transfers, enough time for baggage, and a clear route to the first hotel rather than the cheapest option.",
    },
  ];

  const breadcrumbs = [
    { name: isAr ? "الرئيسية" : "Home", url: `${BASE}/${locale}` },
    { name: isAr ? "المطارات" : "Airports", url: `${BASE}/${locale}/airports/${airport.code.toLowerCase()}` },
    { name: title, url: pageUrl },
  ];

  const airportJsonLd = {
    "@context": "https://schema.org",
    "@type": "Airport",
    name: airport.name,
    iataCode: airport.code,
    address: {
      "@type": "PostalAddress",
      addressLocality: airport.city,
      addressCountry: airport.country,
    },
    url: pageUrl,
  };

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <FaqJsonLd items={faqs} />
      <JsonLdScript data={airportJsonLd} />

      <main className="min-h-screen bg-ink-950 pb-20 text-white" dir={isAr ? "rtl" : "ltr"}>
        <section className="mx-auto max-w-5xl px-5 py-12">
          <SeoBreadcrumb
            items={[
              { label: isAr ? "الرئيسية" : "Home", href: `/${locale}` },
              { label: isAr ? "المطارات" : "Airports" },
            ]}
            locale={locale}
          />

          <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60">
            <Plane className="h-3.5 w-3.5 text-brand-primary" />
            {copy.airportArrivalGuide}
          </div>

          <h1 className="mt-5 max-w-3xl font-display text-3xl font-bold leading-tight md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68 md:text-base">
            {airport.arrivalTip} Use this guide to choose transfers, set up data, and avoid arrival friction before planning the rest of {airport.city}.
          </p>

          <section className="mt-10 grid gap-4 md:grid-cols-4">
            {[
              { icon: Route, title: copy.transferOptions, body: airport.transferModes.join(", ") },
              { icon: Clock, title: copy.lateArrival, body: "Prioritize direct hotel access, official taxis, or pre-booked transfers." },
              { icon: Smartphone, title: copy.esimWifi, body: "Activate data before leaving arrivals for maps, translation, and ride apps." },
              { icon: CarTaxiFront, title: copy.taxiCaution, body: "Use official queues, app rides, or verified hotel transfers when unsure." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <Icon className="mb-4 h-5 w-5 text-brand-primary" />
                  <h2 className="font-display text-base font-semibold">{item.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-white/62">{item.body}</p>
                </article>
              );
            })}
          </section>

          <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="font-display text-lg font-semibold">Plan the rest of the trip</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                [`/${locale}/destinations/${destination.slug}`, `${destination.nameEn} travel guide`],
                [`/${locale}/trip-cost/${destination.slug}/from-london`, `${destination.nameEn} trip cost`],
                [`/${locale}/transportation/${destination.slug}`, `${destination.nameEn} transportation guide`],
                [`/${locale}/esim/${destination.slug}`, `${destination.nameEn} eSIM guide`],
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
            <h2 className="font-display text-lg font-semibold">{copy.faq}</h2>
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
