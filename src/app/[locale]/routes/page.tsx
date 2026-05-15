import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Plane, Search, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { ROUTE_PAIRS } from "@/lib/route-pairs";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale } = await props.params;
  if (!isLocale(locale)) return {};
  const isAr = locale === "ar";
  const title = isAr
    ? "أدلة خطوط الطيران والأسعار | GoTripza"
    : "Flight Route Guides and Fare Insights | GoTripza";
  const description = isAr
    ? "استكشف أشهر خطوط الطيران من الخليج والعالم: مدة الرحلة، متوسط الأسعار، أفضل وقت للسفر، ونصائح ريا قبل الحجز."
    : "Explore popular flight routes with flight times, average fares, best seasons, visa reminders, and Rya's practical travel planning tips.";

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE}/${locale}/routes`,
      languages: {
        en: `${BASE}/en/routes`,
        ar: `${BASE}/ar/routes`,
        "x-default": `${BASE}/en/routes`,
      },
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: `${BASE}/${locale}/routes`,
      siteName: "GoTripza",
    },
  };
}

export default async function RoutesIndexPage(props: Props) {
  const { locale } = await props.params;
  if (!isLocale(locale)) notFound();
  const isAr = locale === "ar";

  const featured = ROUTE_PAIRS.slice(0, 18);
  const grouped = featured.reduce<Record<string, typeof ROUTE_PAIRS>>((acc, route) => {
    const key = isAr ? route.fromNameAr : route.fromNameEn;
    acc[key] = acc[key] ?? [];
    acc[key].push(route);
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-[#06111e] px-4 py-12 text-white" dir={isAr ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-6xl">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
        >
          {isAr ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
          {isAr ? "العودة للرئيسية" : "Back home"}
        </Link>

        <section className="pt-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/25 bg-brand-primary/10 px-4 py-2 text-sm text-brand-primary">
            <Plane className="h-4 w-4" />
            {isAr ? "أدلة رحلات مبنية للقرار السريع" : "Route guides built for quick decisions"}
          </div>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-tight md:text-6xl">
            {isAr ? "اختر خط رحلتك قبل أن تبحث عن السعر" : "Understand the route before you chase the fare"}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/65">
            {isAr
              ? "كل صفحة تجمع مدة الرحلة، متوسط السعر، شركات الطيران، أفضل موسم، وملاحظات عملية من ريا حتى لا يكون قرار الحجز مبنياً على السعر فقط."
              : "Each guide brings together flight time, average fares, airlines, seasonality, and practical Rya notes so booking is not just a price decision."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/${locale}/search#flights`}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-brand-primary px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02]"
            >
              <Search className="h-4 w-4" />
              {isAr ? "ابحث عن رحلة مع ريا" : "Search with Rya"}
            </Link>
            <Link
              href={`/${locale}/plan`}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-6 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/[0.10]"
            >
              <Sparkles className="h-4 w-4" />
              {isAr ? "حوّلها إلى خطة سفر" : "Turn it into a trip plan"}
            </Link>
          </div>
        </section>

        <section className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Object.entries(grouped).flatMap(([from, routes]) =>
            routes.map((route) => (
              <Link
                key={route.slug}
                href={`/${locale}/routes/${route.slug}`}
                className="group rounded-2xl border border-white/10 bg-white/[0.045] p-5 transition hover:border-brand-primary/40 hover:bg-white/[0.07]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-white/45">{from}</p>
                    <h2 className="mt-2 text-xl font-semibold text-white">
                      {isAr
                        ? `${route.fromNameAr} إلى ${route.toNameAr}`
                        : `${route.fromNameEn} to ${route.toNameEn}`}
                    </h2>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-white/55">
                    {route.fromIata}-{route.toIata}
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-black/18 p-3">
                    <p className="text-white/40">{isAr ? "متوسط السعر" : "Avg. fare"}</p>
                    <p className="mt-1 font-semibold text-white">${route.avgPriceUsd}</p>
                  </div>
                  <div className="rounded-xl bg-black/18 p-3">
                    <p className="text-white/40">{isAr ? "مدة الرحلة" : "Flight time"}</p>
                    <p className="mt-1 font-semibold text-white">{route.durationHours}h</p>
                  </div>
                </div>
                <p className="mt-4 line-clamp-2 text-sm leading-6 text-white/55">
                  {isAr ? route.tipsAr : route.tipsEn}
                </p>
              </Link>
            )),
          )}
        </section>
      </div>
    </main>
  );
}
