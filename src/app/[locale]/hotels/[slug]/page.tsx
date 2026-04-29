import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Star, BedDouble } from "lucide-react";
import { isLocale, type Locale } from "@/i18n/config";
import { DESTINATION_SLUGS, getDestination, BUDGET_PAGES, COMPARISON_PAGES } from "@/lib/seo-destinations";
import { searchHotels } from "@/lib/travelpayouts";
import { iataToCity } from "@/lib/iata";
import { formatPrice } from "@/lib/utils";
import { BreadcrumbJsonLd, HotelRichSnippet } from "@/components/JsonLd";
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
    ? `أفضل فنادق ${name} 2025 — مقارنة أسعار وحجز فوري | GoTripza`
    : `Best Hotels in ${dest.nameEn} 2025 — Price Comparison & Instant Booking | GoTripza`;
  const description = isAr
    ? `اكتشف أفضل فنادق ${name} لكل الميزانيات: فنادق فاخرة، متوسطة، واقتصادية. مقارنة فورية وأسعار مضمونة.`
    : `Discover the best hotels in ${dest.nameEn} for every budget — luxury, mid-range, and budget. Instant price comparison and guaranteed best rates.`;

  return {
    title,
    description,
    keywords: isAr
      ? `فنادق ${name}, أفضل فنادق ${name}, حجز فندق ${name}`
      : `${dest.nameEn} hotels, best hotels ${dest.nameEn}, hotel booking ${dest.nameEn}`,
    alternates: {
      canonical: `${BASE}/${params.locale}/hotels/${params.slug}`,
      languages: {
        en: `${BASE}/en/hotels/${params.slug}`,
        ar: `${BASE}/ar/hotels/${params.slug}`,
        "x-default": `${BASE}/en/hotels/${params.slug}`,
      },
    },
    openGraph: { type: "website", title, description, siteName: "GoTripza" },
  };
}

export default async function HotelsPage({ params }: Props) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const isAr = locale === "ar";

  const dest = getDestination(params.slug);
  if (!dest) notFound();

  const name = isAr ? dest.nameAr : dest.nameEn;
  const cityName = iataToCity(dest.iata);
  const currency = "USD";

  const hotelsResult = await searchHotels({ location: cityName, currency }).catch(() => []);
  const hotels = hotelsResult.slice(0, 12);
  const minPrice = hotels.length ? Math.min(...hotels.map((h) => h.priceFrom)) : undefined;

  const hotelSearchUrl = `https://www.hotellook.com/search?destination=${encodeURIComponent(cityName)}&lang=${isAr ? "ar" : "en"}&marker=${MARKER}&subid=hotels_page`;

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
      href: `/${locale}/seasons/${params.slug}`,
      label: isAr ? `أفضل وقت لزيارة ${name}` : `Best time to visit ${dest.nameEn}`,
      icon: "📅",
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
    { name: isAr ? "أفضل الفنادق" : "Best Hotels", url: `${BASE}/${locale}/hotels` },
    { name: isAr ? `فنادق ${name}` : `Hotels in ${dest.nameEn}`, url: `${BASE}/${locale}/hotels/${params.slug}` },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      {hotels.length > 0 && (
        <HotelRichSnippet hotels={hotels.slice(0, 5)} currency={currency} destination={dest.nameEn} />
      )}

      <main className="min-h-screen bg-ink-950 text-white" dir={isAr ? "rtl" : "ltr"}>
        <div className="container mx-auto max-w-4xl px-4 py-12">
          <SeoBreadcrumb
            items={[
              { label: isAr ? "الرئيسية" : "Home", href: `/${locale}` },
              { label: isAr ? "الفنادق" : "Hotels" },
            ]}
            locale={locale}
          />

          <div className="mt-4 flex items-center gap-3">
            <span className="text-4xl">{dest.flag}</span>
            <div>
              <h1 className="font-display text-2xl font-bold md:text-3xl">
                {isAr ? `أفضل فنادق ${name}` : `Best Hotels in ${dest.nameEn}`}
              </h1>
              {minPrice && (
                <p className="mt-1 text-sm text-white/50">
                  {isAr ? `الأسعار تبدأ من $${minPrice}/ليلة` : `Prices from $${minPrice}/night`}
                </p>
              )}
            </div>
          </div>

          {/* Hotel categories */}
          <div className="mt-5 flex flex-wrap gap-2">
            {dest.hotelCategories.map((cat) => (
              <span
                key={cat.slug}
                className="rounded-full border border-brand-mint/20 bg-brand-mint/5 px-3 py-1 text-xs text-brand-mint"
              >
                {isAr ? cat.ar : cat.en}
              </span>
            ))}
          </div>

          {/* Hotels list */}
          <section className="mt-6">
            {hotels.length > 0 ? (
              <div className="space-y-3">
                {hotels.map((h, i) => (
                  <div
                    key={h.hotelId}
                    className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition hover:border-brand-mint/20 hover:bg-brand-mint/5"
                  >
                    {/* Rank badge */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-xs font-bold text-white/40">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">{h.hotelName}</div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-white/50">
                        {h.stars ? (
                          <span className="inline-flex items-center gap-0.5 text-amber-400">
                            {Array.from({ length: h.stars }).map((_, j) => (
                              <Star key={j} className="h-3 w-3 fill-current" />
                            ))}
                          </span>
                        ) : null}
                        <span>{h.location.name}</span>
                      </div>
                    </div>
                    <div className="shrink-0 text-end">
                      <div className="text-xs text-white/40">
                        {isAr ? "من" : "from"}
                      </div>
                      <div className="font-bold text-white">{formatPrice(h.priceFrom, currency)}</div>
                      <div className="text-xs text-white/40">
                        {isAr ? "/ليلة" : "/night"}
                      </div>
                    </div>
                    <a
                      href={h.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-brand-mint to-brand-deep text-white shadow transition hover:opacity-90"
                      aria-label="Book hotel"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-brand-mint/20 bg-brand-mint/5 p-10 text-center">
                <BedDouble className="h-10 w-10 text-brand-mint/60" />
                <div>
                  <p className="font-medium text-white/80">
                    {isAr ? `ابحث عن فنادق ${name}` : `Search ${dest.nameEn} hotels`}
                  </p>
                  <p className="mt-1 text-sm text-white/45">
                    {isAr ? "آلاف الخيارات بأسعار مضمونة" : "Thousands of options with guaranteed rates"}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Search all hotels CTA */}
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={hotelSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-mint to-brand-deep px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02]"
            >
              {isAr ? `ابحث عن كل فنادق ${name}` : `Search all ${dest.nameEn} hotels`}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <Link
              href={`/${locale}/search?q=${encodeURIComponent(isAr ? `فنادق ${dest.nameAr}` : `hotels in ${dest.nameEn}`)}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm text-white/70 transition hover:border-white/40 hover:text-white"
            >
              {isAr ? "استخدم الذكاء الاصطناعي" : "Use AI Search"}
            </Link>
          </div>

          {/* Neighbourhood tips */}
          <section className="mt-8 glass rounded-2xl p-6">
            <h2 className="mb-4 font-display text-lg font-bold">
              {isAr ? `أفضل أحياء ${name} للإقامة` : `Best Neighbourhoods to Stay in ${dest.nameEn}`}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {dest.neighborhoods.map((n) => (
                <div key={n.name} className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                  <div className="font-semibold text-sm">{isAr ? n.nameAr : n.name}</div>
                  <div className="mt-1 text-xs text-white/45 capitalize">{n.type}</div>
                </div>
              ))}
            </div>
          </section>

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
