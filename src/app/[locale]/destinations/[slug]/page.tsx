import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Plane, BedDouble, ExternalLink, MapPin, Thermometer,
  Calendar, Star, Shield,
} from "lucide-react";
import { isLocale, type Locale } from "@/i18n/config";
import { fetchPhoto } from "@/lib/unsplash";
import { searchHotels } from "@/lib/travelpayouts";
import { formatPrice } from "@/lib/utils";
import { iataToCity } from "@/lib/iata";
import {
  getDestination,
  DESTINATION_SLUGS,
  formatBestMonths,
  getDestinations,
  COMPARISON_PAGES,
  BUDGET_PAGES,
} from "@/lib/seo-destinations";
import { BreadcrumbJsonLd, TripDestinationJsonLd } from "@/components/JsonLd";
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
  const country = isAr ? dest.countryAr : dest.country;

  const title = isAr
    ? `${name} ${dest.flag} — دليل السفر الشامل، أفضل الفنادق والطيران | GoTripza`
    : `${name} ${dest.flag} Travel Guide — Flights, Hotels & Tips | GoTripza`;

  const description = isAr
    ? `دليل ${name} الشامل: أرخص تذاكر الطيران، أفضل الفنادق، ميزانية الرحلة، أفضل وقت للزيارة، ومتطلبات التأشيرة. احجز الآن عبر GoTripza.`
    : `Complete ${name} travel guide: cheap flights, best hotels, budget planning, best time to visit, and visa requirements. Book your ${name} trip on GoTripza.`;

  const pageUrl = `${BASE}/${params.locale}/destinations/${params.slug}`;

  return {
    title,
    description,
    keywords: isAr
      ? `${name}, سفر ${name}, فنادق ${name}, طيران ${name}, ${country}, دليل السفر`
      : `${name} travel, ${name} hotels, flights to ${name}, ${country} tourism, ${name} guide`,
    alternates: {
      canonical: pageUrl,
      languages: {
        en: `${BASE}/en/destinations/${params.slug}`,
        ar: `${BASE}/ar/destinations/${params.slug}`,
        "x-default": `${BASE}/en/destinations/${params.slug}`,
      },
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: pageUrl,
      siteName: "GoTripza",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function DestinationHubPage({ params }: Props) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const isAr = locale === "ar";
  const dest = getDestination(params.slug);
  if (!dest) notFound();

  const currency = "USD";
  const pageUrl = `${BASE}/${locale}/destinations/${params.slug}`;
  const cityName = iataToCity(dest.iata);

  // Fetch in parallel
  const [photoResult, hotelsResult] = await Promise.allSettled([
    fetchPhoto(dest.heroKeyword, "landscape"),
    searchHotels({ location: cityName, currency }),
  ]);

  const photo = photoResult.status === "fulfilled" ? photoResult.value : null;
  const hotels = hotelsResult.status === "fulfilled" ? hotelsResult.value.slice(0, 6) : [];
  const minHotelPrice = hotels.length ? Math.min(...hotels.map((h) => h.priceFrom)) : undefined;

  const name = isAr ? dest.nameAr : dest.nameEn;
  const bestMonths = formatBestMonths(dest.bestMonths, locale);

  // Affiliate URLs
  const flightUrl = `https://www.aviasales.com/?marker=${MARKER}&destination=${dest.iata}&subid=destination_hub`;
  const hotelUrl = `https://www.hotellook.com/search?destination=${encodeURIComponent(cityName)}&lang=${isAr ? "ar" : "en"}&marker=${MARKER}&subid=destination_hub`;
  const carUrl = `https://www.discovercars.com/?a_aid=${MARKER}&destination=${encodeURIComponent(cityName)}`;
  const activitiesUrl = `https://www.getyourguide.com/s/?q=${encodeURIComponent(cityName)}&partner_id=${MARKER}`;

  // Related comparison pages
  const comparisons = COMPARISON_PAGES.filter(
    (c) => c.destA === params.slug || c.destB === params.slug,
  );
  // Related budget pages
  const budgetPages = BUDGET_PAGES.filter((b) => b.destination === params.slug);
  // Nearby destinations
  const nearby = getDestinations(dest.nearbySlug);

  // Breadcrumbs
  const breadcrumbs = [
    { name: isAr ? "الرئيسية" : "Home", url: `${BASE}/${locale}` },
    { name: isAr ? "الوجهات" : "Destinations", url: `${BASE}/${locale}/destinations` },
    { name, url: pageUrl },
  ];

  // Internal links
  const internalLinks = [
    ...comparisons.map((c) => ({
      href: `/${locale}/compare/${c.slug}`,
      label: isAr ? c.intentAr : c.intentEn,
      icon: "⚖️",
    })),
    ...budgetPages.map((b) => ({
      href: `/${locale}/budget/${b.slug}`,
      label: isAr
        ? `هل ${b.budgetUsd} دولار كافية لـ ${name} (${b.durationDays} أيام)?`
        : `Is $${b.budgetUsd} enough for ${dest.nameEn} (${b.durationDays} days)?`,
      icon: "💰",
    })),
    {
      href: `/${locale}/seasons/${params.slug}`,
      label: isAr ? `أفضل وقت لزيارة ${name}` : `Best time to visit ${dest.nameEn}`,
      icon: "📅",
    },
    {
      href: `/${locale}/visa/${params.slug}`,
      label: isAr ? `متطلبات تأشيرة ${name}` : `${dest.nameEn} visa requirements`,
      icon: "🛂",
    },
    {
      href: `/${locale}/hotels/${params.slug}`,
      label: isAr ? `أفضل فنادق ${name}` : `Best hotels in ${dest.nameEn}`,
      icon: "🏨",
    },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <TripDestinationJsonLd
        destination={dest.nameEn}
        description={isAr ? dest.descriptionAr : dest.descriptionEn}
        imageUrl={photo?.url}
        minHotelPrice={minHotelPrice}
        currency="USD"
        pageUrl={pageUrl}
      />

      <main className="min-h-screen bg-ink-950 text-white" dir={isAr ? "rtl" : "ltr"}>
        {/* HERO */}
        <section className="relative">
          {photo?.url ? (
            <div className="relative h-72 w-full md:h-96">
              <Image
                src={photo.url}
                alt={`${dest.nameEn} travel`}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-ink-950" />
              {photo.photographer && (
                <a
                  href={photo.photographerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-2 end-3 text-[10px] text-white/30 hover:text-white/60"
                >
                  Photo: {photo.photographer} / Unsplash
                </a>
              )}
            </div>
          ) : (
            <div className="h-40 bg-gradient-to-b from-brand-primary/20 to-ink-950" />
          )}

          <div className="container relative mx-auto max-w-5xl px-4 pb-8 pt-4">
            <SeoBreadcrumb
              items={[
                { label: isAr ? "الرئيسية" : "Home", href: `/${locale}` },
                { label: isAr ? "الوجهات" : "Destinations", href: `/${locale}/destinations` },
                { label: name },
              ]}
              locale={locale}
            />

            <div className="mt-4 flex items-start gap-4">
              <span className="text-4xl">{dest.flag}</span>
              <div>
                <h1 className="font-display text-3xl font-bold md:text-4xl">
                  {name}
                </h1>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-white/50">
                  <MapPin className="h-3.5 w-3.5" />
                  {isAr ? dest.countryAr : dest.country}
                </p>
              </div>
            </div>

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
              {isAr ? dest.taglineAr : dest.taglineEn}
            </p>

            {/* CTA buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={flightUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-primary to-brand-deep px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02]"
              >
                <Plane className="h-4 w-4" />
                {isAr ? `طيران إلى ${name}` : `Flights to ${dest.nameEn}`}
                <ExternalLink className="h-3.5 w-3.5 opacity-70" />
              </a>
              <a
                href={hotelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-brand-mint/20 border border-brand-mint/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-mint/30"
              >
                <BedDouble className="h-4 w-4 text-brand-mint" />
                {isAr ? `فنادق ${name}` : `Hotels in ${dest.nameEn}`}
                <ExternalLink className="h-3.5 w-3.5 opacity-70" />
              </a>
            </div>
          </div>
        </section>

        <div className="container mx-auto max-w-5xl px-4 pb-20">
          {/* DESCRIPTION */}
          <section className="glass rounded-2xl p-6 mb-6">
            <h2 className="mb-3 font-display text-xl font-bold">
              {isAr ? `لماذا تزور ${name}؟` : `Why visit ${dest.nameEn}?`}
            </h2>
            <p className="text-sm leading-relaxed text-white/70">
              {isAr ? dest.descriptionAr : dest.descriptionEn}
            </p>
          </section>

          {/* QUICK FACTS GRID */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Budget */}
            <div className="glass rounded-2xl p-4">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                💰
              </div>
              <div className="text-xs text-white/50 mb-1">
                {isAr ? "الميزانية اليومية" : "Daily Budget"}
              </div>
              <div className="space-y-0.5 text-sm">
                <div><span className="text-white/40">{isAr ? "اقتصادي:" : "Budget:"}</span> ${dest.budgetPerDay.budget}</div>
                <div><span className="text-white/40">{isAr ? "متوسط:" : "Mid-range:"}</span> ${dest.budgetPerDay.mid}</div>
                <div><span className="text-white/40">{isAr ? "فاخر:" : "Luxury:"}</span> ${dest.budgetPerDay.luxury}+</div>
              </div>
            </div>

            {/* Best time */}
            <div className="glass rounded-2xl p-4">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="text-xs text-white/50 mb-1">
                {isAr ? "أفضل وقت للزيارة" : "Best Time to Visit"}
              </div>
              <p className="text-sm text-white/80">{bestMonths}</p>
            </div>

            {/* Climate */}
            <div className="glass rounded-2xl p-4">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                <Thermometer className="h-4 w-4" />
              </div>
              <div className="text-xs text-white/50 mb-1">
                {isAr ? "المناخ" : "Climate"}
              </div>
              <p className="text-xs leading-relaxed text-white/70 line-clamp-4">
                {isAr ? dest.climate.ar : dest.climate.en}
              </p>
            </div>

            {/* Visa */}
            <div className="glass rounded-2xl p-4">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400">
                <Shield className="h-4 w-4" />
              </div>
              <div className="text-xs text-white/50 mb-1">
                {isAr ? "التأشيرة" : "Visa"}
              </div>
              <p className="text-xs leading-relaxed text-white/70 line-clamp-4">
                {isAr ? dest.visaNotes.ar : dest.visaNotes.en}
              </p>
              <Link
                href={`/${locale}/visa/${params.slug}`}
                className="mt-2 text-xs text-brand-primary hover:underline"
              >
                {isAr ? "تفاصيل التأشيرة ←" : "Full visa guide →"}
              </Link>
            </div>
          </div>

          {/* ACTIVITIES */}
          <section className="glass rounded-2xl p-6 mb-6">
            <h2 className="mb-4 font-display text-xl font-bold">
              {isAr ? `ماذا تفعل في ${name}؟` : `Top Things to Do in ${dest.nameEn}`}
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {dest.activities.map((act) => (
                <li
                  key={act.en}
                  className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3"
                >
                  <span className="text-xl">{act.icon}</span>
                  <span className="text-sm text-white/75">
                    {isAr ? act.ar : act.en}
                  </span>
                </li>
              ))}
            </ul>
            <a
              href={activitiesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm text-brand-primary hover:underline"
            >
              {isAr ? `احجز تجارب في ${name}` : `Book experiences in ${dest.nameEn}`}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </section>

          {/* NEIGHBOURHOODS */}
          <section className="glass rounded-2xl p-6 mb-6">
            <h2 className="mb-4 font-display text-xl font-bold">
              {isAr ? `أفضل أحياء ${name}` : `Best Neighbourhoods in ${dest.nameEn}`}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {dest.neighborhoods.map((n) => (
                <div
                  key={n.name}
                  className="rounded-xl border border-white/5 bg-white/[0.03] p-3"
                >
                  <div className="font-semibold text-sm">
                    {isAr ? n.nameAr : n.name}
                  </div>
                  <div className="mt-1 text-xs text-white/45 capitalize">{n.type}</div>
                </div>
              ))}
            </div>
          </section>

          {/* HOTELS */}
          <section className="glass rounded-2xl p-6 mb-6">
            <h2 className="mb-4 font-display text-xl font-bold">
              {isAr ? `أفضل فنادق ${name}` : `Top Hotels in ${dest.nameEn}`}
            </h2>

            {/* Hotel categories */}
            <div className="mb-4 flex flex-wrap gap-2">
              {dest.hotelCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/${locale}/hotels/${params.slug}?type=${cat.slug}`}
                  className="rounded-full border border-brand-mint/20 bg-brand-mint/5 px-3 py-1 text-xs text-brand-mint transition hover:bg-brand-mint/10"
                >
                  {isAr ? cat.ar : cat.en}
                </Link>
              ))}
            </div>

            {hotels.length > 0 ? (
              <ul className="space-y-3">
                {hotels.map((h) => (
                  <li
                    key={h.hotelId}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] p-3 transition hover:bg-white/[0.06]"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{h.hotelName}</div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-white/50">
                        {h.stars ? (
                          <span className="inline-flex items-center gap-0.5 text-amber-400">
                            <Star className="h-3 w-3 fill-current" />
                            {h.stars}
                          </span>
                        ) : null}
                        <span>{h.location.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-end">
                        <div className="text-xs text-white/40">
                          {isAr ? "من" : "from"}
                        </div>
                        <div className="font-bold">{formatPrice(h.priceFrom, currency)}</div>
                      </div>
                      <a
                        href={h.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-r from-brand-mint to-brand-deep text-white"
                        aria-label="Book hotel"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <a
                href={hotelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-brand-mint/20 bg-brand-mint/5 p-5 text-sm font-medium text-white/70 transition hover:bg-brand-mint/10"
              >
                <BedDouble className="h-5 w-5 text-brand-mint" />
                {isAr ? `ابحث عن فنادق ${name}` : `Search hotels in ${dest.nameEn}`}
                <ExternalLink className="h-4 w-4" />
              </a>
            )}

            <div className="mt-4 flex justify-end">
              <a
                href={hotelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-brand-mint hover:underline inline-flex items-center gap-1"
              >
                {isAr ? `عرض كل فنادق ${name}` : `See all ${dest.nameEn} hotels`}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </section>

          {/* CLOTHING */}
          <section className="glass rounded-2xl p-6 mb-6">
            <h2 className="mb-3 font-display text-xl font-bold">
              {isAr ? `ماذا تلبس في ${name}؟` : `What to Wear in ${dest.nameEn}`}
            </h2>
            <p className="text-sm leading-relaxed text-white/70">
              {isAr ? dest.clothing.ar : dest.clothing.en}
            </p>
          </section>

          {/* AFFILIATE UPSELL ROW */}
          {(dest.carRental || dest.activities_partner) && (
            <section className="mb-6 grid gap-4 sm:grid-cols-2">
              {dest.carRental && (
                <a
                  href={carUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-brand-primary/30 hover:bg-brand-primary/5"
                >
                  <span className="text-3xl">🚗</span>
                  <div>
                    <div className="font-semibold text-sm">
                      {isAr ? `استأجر سيارة في ${name}` : `Rent a Car in ${dest.nameEn}`}
                    </div>
                    <div className="text-xs text-white/45 mt-0.5">
                      {isAr ? "أسعار مضمونة — مقارنة فورية" : "Best rates guaranteed — instant comparison"}
                    </div>
                  </div>
                  <ExternalLink className="ms-auto h-4 w-4 shrink-0 text-white/30" />
                </a>
              )}
              {dest.activities_partner && (
                <a
                  href={activitiesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-brand-mint/30 hover:bg-brand-mint/5"
                >
                  <span className="text-3xl">🎟️</span>
                  <div>
                    <div className="font-semibold text-sm">
                      {isAr ? `تجارب وجولات في ${name}` : `Tours & Experiences in ${dest.nameEn}`}
                    </div>
                    <div className="text-xs text-white/45 mt-0.5">
                      {isAr ? "آلاف التجارب بأفضل الأسعار" : "Thousands of experiences — best prices"}
                    </div>
                  </div>
                  <ExternalLink className="ms-auto h-4 w-4 shrink-0 text-white/30" />
                </a>
              )}
            </section>
          )}

          {/* NEARBY DESTINATIONS */}
          {nearby.length > 0 && (
            <section className="mb-6">
              <h2 className="mb-4 font-display text-xl font-bold">
                {isAr ? "وجهات قريبة" : "Nearby Destinations"}
              </h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {nearby.map((n) => (
                  <Link
                    key={n.slug}
                    href={`/${locale}/destinations/${n.slug}`}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-brand-primary/20 hover:bg-brand-primary/5"
                  >
                    <span className="text-2xl">{n.flag}</span>
                    <div>
                      <div className="font-semibold text-sm">
                        {isAr ? n.nameAr : n.nameEn}
                      </div>
                      <div className="text-xs text-white/45">
                        {isAr ? n.countryAr : n.country}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* INTERNAL LINKS */}
          <InternalLinks
            title={isAr ? "استكشف المزيد" : "Explore More"}
            links={internalLinks}
            locale={locale}
          />

          {/* AI SEARCH CTA */}
          <section className="mt-8 rounded-2xl border border-brand-primary/20 bg-gradient-to-br from-brand-primary/10 to-brand-deep/10 p-6 text-center">
            <p className="text-sm text-white/60 mb-3">
              {isAr
                ? `هل أنت مستعد لحجز رحلتك إلى ${name}؟ دعنا نعثر على أفضل الأسعار بالذكاء الاصطناعي.`
                : `Ready to book your ${dest.nameEn} trip? Let our AI find the best deals for you.`}
            </p>
            <Link
              href={`/${locale}/search?q=${encodeURIComponent(isAr ? `رحلة إلى ${dest.nameAr}` : `trip to ${dest.nameEn}`)}`}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-brand-deep px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
            >
              {isAr ? `ابحث عن رحلتي إلى ${name}` : `Plan My ${dest.nameEn} Trip`}
            </Link>
          </section>
        </div>
      </main>
    </>
  );
}
