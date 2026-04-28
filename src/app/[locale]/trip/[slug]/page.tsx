import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Plane, Hotel as HotelIcon, Star, ExternalLink, ArrowLeft } from "lucide-react";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { generateDestinationDescription } from "@/lib/gemini";
import { searchFlights, searchHotels } from "@/lib/travelpayouts";
import { fetchPhoto } from "@/lib/unsplash";
import { resolveIata, iataToCity } from "@/lib/iata";
import { formatPrice } from "@/lib/utils";
import {
  BreadcrumbJsonLd,
  TripDestinationJsonLd,
  FlightRichSnippet,
  HotelRichSnippet,
} from "@/components/JsonLd";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";

interface PageProps {
  params: { locale: string; slug: string };
}

/**
 * Parse slug like "riyadh-to-london" or "dubai-hotels" or "paris"
 * into { origin, destination, type }
 */
function parseSlug(slug: string): {
  origin: string | null;
  destination: string;
  type: "flight" | "hotel" | "trip";
} {
  const decoded = decodeURIComponent(slug).toLowerCase();

  // e.g. "riyadh-to-london" or "من-الرياض-إلى-لندن"
  const toMatch = decoded.match(/^(.+?)(?:-to-|-إلى-)(.+)$/);
  if (toMatch) {
    return { origin: toMatch[1].replace(/-/g, " "), destination: toMatch[2].replace(/-/g, " "), type: "flight" };
  }

  // e.g. "dubai-hotels"
  const hotelMatch = decoded.match(/^(.+?)-hotels?$/);
  if (hotelMatch) {
    return { origin: null, destination: hotelMatch[1].replace(/-/g, " "), type: "hotel" };
  }

  // e.g. "london" or "paris"
  return { origin: null, destination: decoded.replace(/-/g, " "), type: "trip" };
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const locale = params.locale as Locale;
  const { destination, origin, type } = parseSlug(params.slug);
  const dest = capitalize(destination);
  const orig = origin ? capitalize(origin) : null;

  const isAr = locale === "ar";

  let title: string;
  let description: string;

  if (type === "flight" && orig) {
    title = isAr
      ? `أرخص طيران من ${orig} إلى ${dest} | GoTripza`
      : `Cheap Flights from ${orig} to ${dest} | GoTripza`;
    description = isAr
      ? `احجز أرخص تذاكر الطيران من ${orig} إلى ${dest}. أسعار حصرية، دفع بتمارا وتابي، أفضل عروض الطيران عبر GoTripza.`
      : `Book the cheapest flights from ${orig} to ${dest}. Exclusive fares, instant booking, best deals on GoTripza.`;
  } else if (type === "hotel") {
    title = isAr
      ? `أفضل فنادق ${dest} بأرخص الأسعار | GoTripza`
      : `Best Hotels in ${dest} — Best Price Guaranteed | GoTripza`;
    description = isAr
      ? `احجز أفضل فنادق ${dest} بأسعار لا تقبل المنافسة. دفع بتمارا وتابي وأبل باي عبر GoTripza.`
      : `Discover the best hotels in ${dest} with guaranteed lowest prices. Book instantly on GoTripza.`;
  } else {
    title = isAr
      ? `سفر إلى ${dest} — طيران وفنادق بأفضل الأسعار | GoTripza`
      : `${dest} Travel — Flights & Hotels | GoTripza`;
    description = isAr
      ? `احجز رحلتك إلى ${dest}: أرخص طيران وأفضل فنادق. عروض حصرية من GoTripza للمسافرين من السعودية.`
      : `Plan your trip to ${dest}: cheap flights and top-rated hotels. Exclusive deals on GoTripza.`;
  }

  const pageUrl = `${APP_URL}/${locale}/trip/${params.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
      languages: {
        "ar-SA": `${APP_URL}/ar/trip/${params.slug}`,
        "en-US": `${APP_URL}/en/trip/${params.slug}`,
      },
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: pageUrl,
      siteName: "GoTripza",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function TripPage({ params }: PageProps) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const isAr = locale === "ar";
  const currency = isAr ? "SAR" : "USD";

  const dict = await getDictionary(locale);

  const { destination, origin, type } = parseSlug(params.slug);
  const dest = capitalize(destination);
  const orig = origin ? capitalize(origin) : null;

  const MARKER = process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER ?? "522867";
  const iataOrigin = resolveIata(origin);
  const iataDestination = resolveIata(destination) ?? destination;
  const hotelCityName = iataToCity(iataDestination);

  // Build search fallback URLs — direct Travelpayouts partner links
  const flightSearchUrl = iataOrigin
    ? `https://www.aviasales.com/?marker=${MARKER}&subid=trip_page&origin=${iataOrigin}&destination=${iataDestination}`
    : `https://www.aviasales.com/?marker=${MARKER}&subid=trip_page&destination=${iataDestination}`;
  const hotelSearchUrl = `https://www.hotellook.com/search?destination=${encodeURIComponent(hotelCityName)}&lang=en&marker=${MARKER}&subid=trip_page`;

  // Fetch in parallel: description, photo, flights, hotels
  const [description, photo, flightsRes, hotelsRes] = await Promise.allSettled([
    generateDestinationDescription(dest, locale),
    fetchPhoto(`${dest} travel city`, "landscape"),
    iataOrigin
      ? searchFlights({ origin: iataOrigin, destination: iataDestination, currency: currency.toLowerCase() })
      : Promise.resolve([]),
    searchHotels({ location: hotelCityName, currency: currency.toLowerCase() }),
  ]);

  const aiDescription =
    description.status === "fulfilled" && description.value ? description.value : null;
  const heroPhoto = photo.status === "fulfilled" ? photo.value : null;

  const flights = flightsRes.status === "fulfilled" ? flightsRes.value : [];
  const hotels = hotelsRes.status === "fulfilled" ? hotelsRes.value : [];

  const minFlight = flights.length ? Math.min(...flights.map((f) => f.price)) : undefined;
  const minHotel = hotels.length ? Math.min(...hotels.map((h) => h.priceFrom)) : undefined;
  const pageUrl = `${APP_URL}/${locale}/trip/${params.slug}`;

  // Breadcrumb items
  const breadcrumbs = [
    { name: isAr ? "الرئيسية" : "Home", url: `${APP_URL}/${locale}` },
    { name: isAr ? "وجهات" : "Destinations", url: `${APP_URL}/${locale}` },
    {
      name: type === "flight" && orig
        ? (isAr ? `طيران ${orig} ← ${dest}` : `Flights ${orig} → ${dest}`)
        : (isAr ? `${dest}` : dest),
      url: pageUrl,
    },
  ];

  const pageTitle =
    type === "flight" && orig
      ? (isAr ? `أرخص طيران من ${orig} إلى ${dest}` : `Cheap Flights from ${orig} to ${dest}`)
      : type === "hotel"
      ? (isAr ? `أفضل فنادق ${dest}` : `Best Hotels in ${dest}`)
      : (isAr ? `رحلات إلى ${dest}` : `Travel to ${dest}`);

  return (
    <>
      {/* JSON-LD Rich Snippets */}
      <BreadcrumbJsonLd items={breadcrumbs} />
      <TripDestinationJsonLd
        destination={dest}
        description={aiDescription ?? pageTitle}
        imageUrl={heroPhoto?.url}
        minFlightPrice={minFlight}
        minHotelPrice={minHotel}
        currency={currency}
        pageUrl={pageUrl}
      />
      {type !== "hotel" && (
        <FlightRichSnippet flights={flights.slice(0, 5)} currency={currency} />
      )}
      {type !== "flight" && (
        <HotelRichSnippet hotels={hotels.slice(0, 5)} currency={currency} destination={dest} />
      )}

      <main className="min-h-screen bg-ink-950 text-white" dir={isAr ? "rtl" : "ltr"}>
        {/* Back link */}
        <div className="container mx-auto max-w-5xl px-4 pt-6">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {isAr ? "العودة للرئيسية" : "Back to Home"}
          </Link>
        </div>

        {/* Hero */}
        <section className="relative overflow-hidden">
          {heroPhoto?.url ? (
            <div className="relative h-64 w-full md:h-80">
              <Image
                src={heroPhoto.url}
                alt={heroPhoto.alt || dest}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink-950/40 to-ink-950" />
              {heroPhoto.photographer && (
                <a
                  href={heroPhoto.photographerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-2 end-3 text-[10px] text-white/30 hover:text-white/60"
                >
                  Photo: {heroPhoto.photographer} / Unsplash
                </a>
              )}
            </div>
          ) : (
            <div className="h-32 bg-gradient-to-b from-brand-primary/20 to-ink-950" />
          )}

          <div className="container relative mx-auto max-w-5xl px-4 pb-8 pt-4">
            {/* Breadcrumb */}
            <nav className="mb-4 flex flex-wrap items-center gap-1 text-xs text-white/40">
              {breadcrumbs.map((b, i) => (
                <span key={b.url} className="flex items-center gap-1">
                  {i > 0 && <span>/</span>}
                  {i < breadcrumbs.length - 1 ? (
                    <Link href={b.url} className="hover:text-white/70">{b.name}</Link>
                  ) : (
                    <span className="text-white/70">{b.name}</span>
                  )}
                </span>
              ))}
            </nav>

            <h1 className="font-display text-3xl font-bold md:text-4xl">{pageTitle}</h1>

            {/* Price teasers */}
            {(minFlight || minHotel) && (
              <div className="mt-3 flex flex-wrap gap-4">
                {minFlight && (type !== "hotel") && (
                  <div className="flex items-center gap-2">
                    <Plane className="h-4 w-4 text-brand-primary" />
                    <span className="text-sm text-white/60">
                      {isAr ? "من " : "From "}
                      <strong className="text-white">{formatPrice(minFlight, currency)}</strong>
                    </span>
                  </div>
                )}
                {minHotel && (type !== "flight") && (
                  <div className="flex items-center gap-2">
                    <HotelIcon className="h-4 w-4 text-brand-mint" />
                    <span className="text-sm text-white/60">
                      {isAr ? "من " : "From "}
                      <strong className="text-white">{formatPrice(minHotel, currency)}</strong>
                      {isAr ? "/ليلة" : "/night"}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* AI description */}
            {aiDescription && (
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70">
                {aiDescription}
              </p>
            )}
          </div>
        </section>

        {/* Results grid */}
        <section className="container mx-auto max-w-5xl px-4 pb-16">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Flights */}
            {type !== "hotel" && (
              <div className="glass rounded-2xl p-5">
                <header className="mb-4 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/15 text-brand-primary">
                    <Plane className="h-4 w-4" />
                  </div>
                  <h2 className="font-semibold">
                    {isAr ? "أفضل عروض الطيران" : "Top Flight Deals"}
                  </h2>
                  {orig && (
                    <span className="ms-auto text-xs text-white/50">
                      {orig} → {dest}
                    </span>
                  )}
                </header>
                {flights.length === 0 ? (
                  <div className="flex flex-col items-center gap-4 rounded-xl border border-brand-primary/20 bg-brand-primary/5 p-6 text-center">
                    <Plane className="h-8 w-8 text-brand-primary/60" />
                    <div>
                      <p className="text-sm font-medium text-white/80">
                        {isAr ? "ابحث عن أرخص تذكرة" : "Find the cheapest ticket"}
                      </p>
                      <p className="mt-1 text-xs text-white/45">
                        {isAr
                          ? `نقارن مئات شركات الطيران إلى ${dest}`
                          : `We compare hundreds of airlines to ${dest}`}
                      </p>
                    </div>
                    <a
                      href={flightSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-primary to-brand-deep px-5 py-2 text-sm font-semibold text-white transition hover:scale-[1.02]"
                    >
                      {isAr ? "ابحث الآن" : "Search Flights"}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {flights.slice(0, 6).map((f, i) => (
                      <li
                        key={`${f.flight_number}-${i}`}
                        className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] p-3 transition hover:bg-white/[0.06]"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-sm text-white">
                            <span className="font-semibold">{f.airline || "—"}</span>
                            <span className="text-white/50">·</span>
                            <span className="text-white/70">{f.flight_number}</span>
                          </div>
                          <div className="mt-1 text-xs text-white/50">
                            {f.departure_at?.slice(0, 10)} · {f.origin} → {f.destination}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-display text-lg font-bold">
                            {formatPrice(f.price, currency)}
                          </span>
                          <a
                            href={f.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-brand text-white"
                            aria-label={dict.results.bookNow}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Hotels */}
            {type !== "flight" && (
              <div className="glass rounded-2xl p-5">
                <header className="mb-4 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-mint/15 text-brand-mint">
                    <HotelIcon className="h-4 w-4" />
                  </div>
                  <h2 className="font-semibold">
                    {isAr ? "أفضل الفنادق" : "Top Hotels"}
                  </h2>
                  <span className="ms-auto text-xs text-white/50">{dest}</span>
                </header>
                {hotels.length === 0 ? (
                  <div className="flex flex-col items-center gap-4 rounded-xl border border-brand-mint/20 bg-brand-mint/5 p-6 text-center">
                    <HotelIcon className="h-8 w-8 text-brand-mint/60" />
                    <div>
                      <p className="text-sm font-medium text-white/80">
                        {isAr ? "ابحث عن أفضل فندق" : "Find the best hotel"}
                      </p>
                      <p className="mt-1 text-xs text-white/45">
                        {isAr
                          ? `آلاف الفنادق في ${dest} بأسعار مضمونة`
                          : `Thousands of hotels in ${dest} with guaranteed prices`}
                      </p>
                    </div>
                    <a
                      href={hotelSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-mint to-brand-deep px-5 py-2 text-sm font-semibold text-white transition hover:scale-[1.02]"
                    >
                      {isAr ? "ابحث الآن" : "Search Hotels"}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {hotels.slice(0, 6).map((h) => (
                      <li
                        key={h.hotelId}
                        className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] p-3 transition hover:bg-white/[0.06]"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">{h.hotelName}</div>
                          <div className="mt-1 flex items-center gap-2 text-xs text-white/50">
                            {h.stars ? (
                              <span className="inline-flex items-center gap-0.5 text-amber-500">
                                <Star className="h-3 w-3 fill-current" />
                                {h.stars}
                              </span>
                            ) : null}
                            <span>{h.location.name}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-display text-lg font-bold">
                            {formatPrice(h.priceFrom, currency)}
                          </span>
                          <a
                            href={h.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-brand text-white"
                            aria-label={dict.results.bookNow}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* CTA back to search */}
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
            <p className="mb-3 text-sm text-white/60">
              {isAr
                ? "هل تريد البحث عن رحلة مخصصة؟ دعنا نساعدك"
                : "Looking for a personalised trip? Let our AI plan it for you."}
            </p>
            <Link
              href={`/${locale}`}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
            >
              {isAr ? "ابدأ البحث الآن" : "Start Planning Now"}
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
