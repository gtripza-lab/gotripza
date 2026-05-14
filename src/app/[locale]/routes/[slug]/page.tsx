import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Plane, Clock, Calendar, ExternalLink, Sparkles, ChevronDown } from "lucide-react";
import { isLocale, type Locale } from "@/i18n/config";
import { getRoutePair, ROUTE_SLUGS } from "@/lib/route-pairs";
import { DESTINATIONS } from "@/lib/seo-destinations";
import type { RoutePair } from "@/lib/route-pairs";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/JsonLd";
import { InternalLinks, SeoBreadcrumb } from "@/components/seo/InternalLinks";

const MONTH_NAMES_EN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTH_NAMES_AR = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];

function bestMonthsLabel(destSlug: string, isAr: boolean): string {
  const dest = DESTINATIONS.find((d) => d.slug === destSlug);
  if (!dest?.bestMonths?.length) return isAr ? "طوال العام" : "Year-round";
  const names = isAr ? MONTH_NAMES_AR : MONTH_NAMES_EN;
  const months = dest.bestMonths.map((m) => names[m - 1]);
  if (months.length === 1) return months[0];
  return `${months[0]} – ${months[months.length - 1]}`;
}

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";
const MARKER = process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER ?? "522867";

interface Props { params: Promise<{ locale: string; slug: string }> }

export async function generateStaticParams() {
  return ROUTE_SLUGS.flatMap((slug) => [
    { locale: "ar", slug },
    { locale: "en", slug },
  ]);
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  if (!isLocale(params.locale)) return {};
  const route = getRoutePair(params.slug);
  if (!route) return {};

  const isAr = params.locale === "ar";
  const currentYear = new Date().getFullYear();
  const airlinesList = route.airlines.join(", ");
  const routeIntent = route.slug === "dubai-to-maldives";

  const title = isAr
    ? routeIntent
      ? `دبي إلى المالديف ${currentYear} — الطيران، التأشيرة، أفضل وقت وتكلفة الرحلة`
      : `رحلات من ${route.fromNameAr} إلى ${route.toNameAr} ${currentYear} — الأسعار والمدة`
    : routeIntent
      ? `Dubai to Maldives ${currentYear} — Flights, Visa, Best Time & Trip Cost`
      : `${route.fromNameEn} to ${route.toNameEn} ${currentYear} — Flights, Time & Cost`;

  const description = isAr
    ? routeIntent
      ? `دليل عملي للسفر من دبي إلى المالديف: مدة الرحلة، شركات الطيران، التأشيرة عند الوصول، أفضل الشهور، النقل للمنتجع، وتخطيط ريا.`
      : `اعرف مدة الرحلة من ${route.fromNameAr} إلى ${route.toNameAr}، متوسط السعر من $${route.avgPriceUsd}، شركات الطيران ${airlinesList}، ونصائح ريا قبل الحجز.`
    : routeIntent
      ? `A practical Dubai to Maldives guide: flight time, airlines, visa on arrival, best months, resort transfers, trip cost, and planning with Rya.`
      : `Learn flight time from ${route.fromNameEn} to ${route.toNameEn}, average fares from $${route.avgPriceUsd}, airlines ${airlinesList}, and Rya's planning tips.`;

  const pageUrl = `${BASE}/${params.locale}/routes/${params.slug}`;

  return {
    title,
    description,
    keywords: isAr
      ? `طيران ${route.fromNameAr} ${route.toNameAr}, رحلات رخيصة, ${airlinesList}, ${route.fromCountryAr}, ${route.toCountryAr}`
      : `${route.fromNameEn.toLowerCase()} to ${route.toNameEn.toLowerCase()}, cheap flights ${route.fromNameEn} ${route.toNameEn}, ${route.fromCountryEn} to ${route.toCountryEn}, flight time, visa, best time`,
    alternates: {
      canonical: pageUrl,
      languages: {
        en: `${BASE}/en/routes/${params.slug}`,
        ar: `${BASE}/ar/routes/${params.slug}`,
        "x-default": `${BASE}/en/routes/${params.slug}`,
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

function routeSearchQuestions(route: RoutePair, isAr: boolean) {
  if (route.slug === "dubai-to-maldives") {
    return isAr
      ? ["دبي إلى المالديف", "كم ساعة من دبي إلى المالديف؟", "هل المالديف تحتاج فيزا؟", "أفضل وقت للمالديف", "تكلفة رحلة المالديف من دبي"]
      : ["Dubai to Maldives", "Dubai to Maldives flight time", "Do I need a visa for Maldives?", "Best time to visit Maldives", "Dubai to Maldives trip cost"];
  }
  return isAr
    ? [`${route.fromNameAr} إلى ${route.toNameAr}`, `مدة الرحلة إلى ${route.toNameAr}`, `تأشيرة ${route.toCountryAr}`, `أفضل وقت للسفر إلى ${route.toNameAr}`]
    : [`${route.fromNameEn} to ${route.toNameEn}`, `${route.toNameEn} flight time`, `${route.toCountryEn} visa requirements`, `best time to visit ${route.toNameEn}`];
}

function routePlanningBrief(route: RoutePair, isAr: boolean) {
  if (route.slug === "dubai-to-maldives") {
    return isAr
      ? {
          title: "إجابة سريعة: دبي إلى المالديف",
          body: "رحلة دبي إلى المالديف قصيرة نسبياً، حوالي 4 ساعات طيران مباشر إلى ماليه. أغلب المسافرين يحصلون على تأشيرة مجانية عند الوصول لمدة 30 يوماً، لكن المهم هو تنسيق المنتجع مع النقل البحري أو الطائرة المائية بعد الوصول.",
          bullets: ["أفضل الشهور غالباً من نوفمبر إلى أبريل.", "احسب تكلفة المنتجع والنقل للجزيرة، وليس الطيران فقط.", "احجز الوصول نهاراً إن كان منتجعك يحتاج طائرة مائية."],
        }
      : {
          title: "Quick answer: Dubai to Maldives",
          body: "Dubai to Maldives is a short international trip, roughly 4 hours by direct flight to Male. Most travellers get a free 30-day visa on arrival, but the key planning detail is resort transfer by speedboat or seaplane after landing.",
          bullets: ["Best months are usually November to April.", "Budget for resort and island transfer, not only flights.", "Arrive during daylight if your resort needs a seaplane."],
        };
  }
  return isAr
    ? {
        title: `إجابة سريعة: ${route.fromNameAr} إلى ${route.toNameAr}`,
        body: `تستغرق الرحلة تقريباً ${route.durationHours} ساعة، ومتوسط السعر من $${route.avgPriceUsd}. راجع التأشيرة والطقس قبل الحجز، ثم اطلب من ريا مقارنة التواريخ المناسبة.`,
        bullets: ["قارن عدة تواريخ قبل الحجز.", "راجع الأمتعة والترانزيت.", "اطلب من ريا خطة ميزانية للرحلة."],
      }
    : {
        title: `Quick answer: ${route.fromNameEn} to ${route.toNameEn}`,
        body: `The flight takes about ${route.durationHours} hours, with average fares from $${route.avgPriceUsd}. Check visa and season before booking, then ask Rya to compare practical travel dates.`,
        bullets: ["Compare several dates before booking.", "Check baggage and transit rules.", "Ask Rya for a trip budget plan."],
      };
}

export default async function RoutePage(props: Props) {
  const params = await props.params;
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const isAr = locale === "ar";

  const route = getRoutePair(params.slug);
  if (!route) notFound();

  const currentYear = new Date().getFullYear();
  const pageUrl = `${BASE}/${locale}/routes/${params.slug}`;

  const fromCity = isAr ? route.fromNameAr : route.fromNameEn;
  const toCity = isAr ? route.toNameAr : route.toNameEn;
  const fromCountry = isAr ? route.fromCountryAr : route.fromCountryEn;
  const toCountry = isAr ? route.toCountryAr : route.toCountryEn;
  const airlinesList = route.airlines.join(", ");
  const tips = isAr ? route.tipsAr : route.tipsEn;
  const searchQuestions = routeSearchQuestions(route, isAr);
  const planningBrief = routePlanningBrief(route, isAr);

  const durationH = Math.floor(route.durationHours);
  const durationMin = Math.round((route.durationHours - durationH) * 60);

  // Affiliate URLs
  const aviasalesUrl = `https://www.aviasales.com/?marker=${MARKER}&origin=${route.fromIata}&destination=${route.toIata}&one_way=0&subid=routes`;
  const searchQuery = isAr
    ? `رحلات من ${route.fromNameAr} إلى ${route.toNameAr}`
    : `flights from ${route.fromNameEn} to ${route.toNameEn}`;
  const rayaSearchUrl = `/${locale}/search?q=${encodeURIComponent(searchQuery)}`;

  // Breadcrumbs
  const breadcrumbs = [
    { name: isAr ? "الرئيسية" : "Home", url: `${BASE}/${locale}` },
    { name: isAr ? "الرحلات" : "Routes", url: `${BASE}/${locale}/routes` },
    {
      name: isAr
        ? `من ${route.fromNameAr} إلى ${route.toNameAr}`
        : `${route.fromNameEn} to ${route.toNameEn}`,
      url: pageUrl,
    },
  ];

  // Flight JSON-LD schema
  const flightSchema = {
    "@context": "https://schema.org",
    "@type": "Flight",
    departureAirport: {
      "@type": "Airport",
      iataCode: route.fromIata,
      name: route.fromNameEn,
    },
    arrivalAirport: {
      "@type": "Airport",
      iataCode: route.toIata,
      name: route.toNameEn,
    },
    offers: {
      "@type": "AggregateOffer",
      lowPrice: route.avgPriceUsd,
      priceCurrency: "USD",
      offerCount: route.airlines.length * 4,
      url: `${BASE}/en/routes/${route.slug}`,
    },
  };

  // FAQ items
  const faqItems = isAr
    ? [
        {
          q: `ما هو أرخص شهر للسفر من ${route.fromNameAr} إلى ${route.toNameAr}؟`,
          a: `عادةً تكون أسعار الطيران من ${route.fromNameAr} إلى ${route.toNameAr} أقل في أشهر يناير وفبراير ونوفمبر. تجنب المواسم والعطلات للحصول على أفضل الأسعار.`,
        },
        {
          q: `كم تستغرق رحلة الطيران من ${route.fromNameAr} إلى ${route.toNameAr}؟`,
          a: `تستغرق الرحلة المباشرة من ${route.fromNameAr} إلى ${route.toNameAr} حوالي ${durationH} ساعة${durationMin > 0 ? ` و${durationMin} دقيقة` : ""}. قد تختلف أوقات الرحلات مع التوقف.`,
        },
        {
          q: `ما هي شركات الطيران التي تسير رحلات من ${route.fromNameAr} إلى ${route.toNameAr}؟`,
          a: `تشمل شركات الطيران التي تخدم هذا الخط: ${airlinesList}. يمكنك مقارنة الأسعار بينها عبر GoTripza.`,
        },
        {
          q: `هل أحتاج تأشيرة للسفر من ${route.fromNameAr} إلى ${route.toNameAr}؟`,
          a: `تتوقف متطلبات التأشيرة على جنسيتك. يُنصح بمراجعة سفارة ${route.toCountryAr} أو الموقع الرسمي للحكومة قبل السفر لمعرفة المستجدات.`,
        },
        {
          q: `كم قبل الموعد يجب حجز تذاكر الطيران من ${route.fromNameAr} إلى ${route.toNameAr}؟`,
          a: `للحصول على أفضل الأسعار، يُنصح بالحجز قبل 6 إلى 8 أسابيع من تاريخ السفر. للرحلات في المواسم المزدحمة، احجز قبل 3 أشهر على الأقل.`,
        },
      ]
    : [
        {
          q: `What is the cheapest month to fly from ${route.fromNameEn} to ${route.toNameEn}?`,
          a: `Flights from ${route.fromNameEn} to ${route.toNameEn} are typically cheapest in January, February, and November. Avoid peak holiday seasons for the best fares.`,
        },
        {
          q: `How long is the flight from ${route.fromNameEn} to ${route.toNameEn}?`,
          a: `A direct flight from ${route.fromNameEn} to ${route.toNameEn} takes approximately ${durationH}h${durationMin > 0 ? ` ${durationMin}m` : ""}. Connecting flights may take longer depending on the layover.`,
        },
        {
          q: `Which airlines fly from ${route.fromNameEn} to ${route.toNameEn}?`,
          a: `Airlines serving this route include ${airlinesList}. You can compare live prices across all carriers on GoTripza.`,
        },
          {
            q: `Do I need a visa to travel from ${route.fromNameEn} to ${route.toNameEn}?`,
          a: `Visa requirements depend on your nationality. Always check the official ${route.toCountryEn} government or embassy website for the latest entry requirements before booking.`,
        },
        ...(route.slug === "dubai-to-maldives" ? [{
          q: "Is Dubai to Maldives a good short trip?",
          a: "Yes. It is one of the easiest premium beach escapes from Dubai: short flight, visa on arrival for most travellers, and strong resort options. The main thing to plan is island transfer timing.",
        }] : []),
        {
          q: `How far in advance should I book flights from ${route.fromNameEn} to ${route.toNameEn}?`,
          a: `For the best prices, book 6–8 weeks in advance. For peak seasons and holidays, aim to book at least 3 months ahead to lock in competitive fares.`,
        },
      ];

  // Internal links
  const internalLinks = [
    ...(route.toDestSlug
      ? [
          {
            href: `/${locale}/destinations/${route.toDestSlug}`,
            label: isAr
              ? `دليل السفر الشامل إلى ${toCity}`
              : `Complete Travel Guide to ${route.toNameEn}`,
            icon: "🗺️",
          },
        ]
      : []),
    {
      href: rayaSearchUrl,
      label: isAr
        ? `ابحث عن رحلات من ${fromCity} إلى ${toCity} مع ريا`
        : `Search ${route.fromNameEn} to ${route.toNameEn} flights with Raya`,
      icon: "✨",
    },
    {
      href: `/${locale}/search`,
      label: isAr ? "استكشف وجهات أخرى" : "Explore other destinations",
      icon: "🌍",
    },
  ];

  // Generic route tips
  const genericTips = isAr
    ? [
        "احرص على مقارنة الأسعار بين عدة شركات طيران قبل الحجز للحصول على أفضل صفقة.",
        "احمل وثائق السفر الأساسية معك دائماً وتأكد من صلاحية جواز سفرك.",
        "تحقق من سياسة الأمتعة لكل شركة طيران لتجنب رسوم إضافية في المطار.",
      ]
    : [
        "Always compare prices across multiple airlines before booking to secure the best deal.",
        "Carry essential travel documents and ensure your passport is valid for at least 6 months.",
        "Check each airline's baggage policy before booking to avoid unexpected fees at the airport.",
      ];

  return (
    <>
      {/* Schema.org JSON-LD */}
      <BreadcrumbJsonLd items={breadcrumbs} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(flightSchema) }}
      />
      <FaqJsonLd items={faqItems} />

      <main className="min-h-screen bg-[#06111e] text-white pb-20 md:pb-0" dir={isAr ? "rtl" : "ltr"}>

        {/* ── HERO ── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-brand-primary/20 via-[#06111e]/80 to-[#06111e] pb-12 pt-10">
          {/* Decorative glow blobs */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-brand-primary/10 blur-3xl" />
            <div className="absolute -right-32 top-0 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
          </div>

          <div className="container relative mx-auto max-w-5xl px-4">
            <SeoBreadcrumb
              items={[
                { label: isAr ? "الرئيسية" : "Home", href: `/${locale}` },
                { label: isAr ? "الرحلات" : "Routes", href: `/${locale}/routes` },
                {
                  label: isAr
                    ? `${fromCity} ← ${toCity}`
                    : `${route.fromNameEn} → ${route.toNameEn}`,
                },
              ]}
              locale={locale}
            />

            {/* Route badge */}
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand-primary/30 bg-brand-primary/10 px-4 py-1.5 text-xs font-medium text-brand-primary">
              <Plane className="h-3.5 w-3.5" />
              {isAr
                ? `${fromCountry} ← ${toCountry}`
                : `${fromCountry} → ${toCountry}`}
            </div>

            <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-white md:text-5xl">
              {isAr
                ? `رحلات رخيصة من ${fromCity} إلى ${toCity}`
                : `Cheap Flights from ${route.fromNameEn} to ${route.toNameEn}`}
            </h1>

            <p className="mt-4 text-base text-white/60 md:text-lg">
              {isAr
                ? `قارن ${airlinesList} والمزيد · متوسط السعر من $${route.avgPriceUsd} · رحلة ${durationH}h${durationMin > 0 ? ` ${durationMin}m` : ""}`
                : `Compare ${airlinesList} and more · Avg. price from $${route.avgPriceUsd} · ${durationH}h${durationMin > 0 ? ` ${durationMin}m` : ""} flight`}
            </p>

            {/* CTA buttons */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={rayaSearchUrl}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-brand-primary px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02] hover:opacity-95"
              >
                <Sparkles className="h-4 w-4" />
                {isAr ? "ابحث عن رحلات مع ريا ←" : "Search Flights with Raya →"}
              </Link>
              <a
                href={aviasalesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-6 py-3 text-sm font-semibold text-white/80 backdrop-blur-sm transition hover:border-white/30 hover:bg-white/[0.10]"
              >
                <Plane className="h-4 w-4" />
                {isAr
                  ? `قارن الأسعار على Aviasales`
                  : `Compare prices on Aviasales`}
                <ExternalLink className="h-3.5 w-3.5 opacity-60" />
              </a>
            </div>
          </div>
        </section>

        <div className="container mx-auto max-w-5xl px-4 pb-24">

          {/* ── QUICK FACTS STRIP ── */}
          <section className="mb-8 -mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Avg price */}
            <div className="flex flex-col gap-2 rounded-2xl border border-white/[0.10] bg-white/[0.06] p-5 backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-xl">
                ✈️
              </div>
              <div className="text-xs text-white/50">
                {isAr ? "متوسط السعر ذهاباً وإياباً" : "Avg. price round-trip"}
              </div>
              <div className="text-xl font-bold text-white">
                ${route.avgPriceUsd}
              </div>
            </div>

            {/* Flight time */}
            <div className="flex flex-col gap-2 rounded-2xl border border-white/[0.10] bg-white/[0.06] p-5 backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15">
                <Clock className="h-5 w-5 text-sky-400" />
              </div>
              <div className="text-xs text-white/50">
                {isAr ? "مدة الرحلة" : "Flight time"}
              </div>
              <div className="text-xl font-bold text-white">
                {durationH}h{durationMin > 0 ? ` ${durationMin}m` : ""}
              </div>
            </div>

            {/* Airlines */}
            <div className="flex flex-col gap-2 rounded-2xl border border-white/[0.10] bg-white/[0.06] p-5 backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-xl">
                🛫
              </div>
              <div className="text-xs text-white/50">
                {isAr ? "شركات الطيران" : "Airlines"}
              </div>
              <div className="text-sm font-semibold text-white/90 leading-snug">
                {route.airlines.slice(0, 2).join(", ")}
                {route.airlines.length > 2 && (
                  <span className="text-white/40">
                    {" "}+{route.airlines.length - 2}
                  </span>
                )}
              </div>
            </div>

            {/* Best time */}
            <div className="flex flex-col gap-2 rounded-2xl border border-white/[0.10] bg-white/[0.06] p-5 backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15">
                <Calendar className="h-5 w-5 text-amber-400" />
              </div>
              <div className="text-xs text-white/50">
                {isAr ? "أفضل وقت للسفر" : "Best time to fly"}
              </div>
              <div className="text-sm font-semibold text-white/90">
                {bestMonthsLabel(route.toDestSlug, isAr)}
              </div>
            </div>
          </section>

          <section className="mb-8 rounded-2xl border border-brand-primary/20 bg-brand-primary/[0.08] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary/80">
              {isAr ? "مختصر مفيد" : "Short answer"}
            </p>
            <h2 className="mt-2 font-display text-xl font-bold">{planningBrief.title}</h2>
            <p className="mt-3 text-sm leading-7 text-white/68">{planningBrief.body}</p>
            <div className="mt-4 grid gap-2 md:grid-cols-3">
              {planningBrief.bullets.map((item) => (
                <div key={item} className="rounded-xl border border-white/[0.06] bg-black/20 p-3 text-sm leading-6 text-white/58">
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="mb-8 rounded-2xl border border-white/[0.10] bg-white/[0.04] p-5">
            <h2 className="font-display text-lg font-bold">
              {isAr ? "أسئلة بحث تغطيها هذه الصفحة" : "Search questions answered here"}
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {searchQuestions.map((query) => (
                <span key={query} className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs text-white/58">
                  {query}
                </span>
              ))}
            </div>
          </section>

          {/* ── WHY RAYA ── */}
          <section className="mb-8 rounded-2xl border border-brand-primary/20 bg-gradient-to-br from-brand-primary/10 to-violet-600/5 p-6 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-brand-primary text-xl shadow-glow">
                ✨
              </div>
              <div className="flex-1">
                <h2 className="font-display text-xl font-bold">
                  {isAr
                    ? `دعي ريا تجد لك أفضل صفقة`
                    : `Let Raya find you the best deal`}
                </h2>
                <p className="mt-1 text-sm text-white/60">
                  {isAr
                    ? `مساعدتك الذكية في GoTripza تحلل مئات الأسعار في ثوانٍ`
                    : `GoTripza's AI advisor analyses hundreds of fares in seconds`}
                </p>

                <ul className="mt-4 space-y-2.5">
                  {(isAr
                    ? [
                        "مقارنة فورية لأسعار جميع شركات الطيران على هذا الخط",
                        "تنبيهات السعر — ريا تعلمك حين ينخفض السعر",
                        "توصيات مخصصة بناءً على ميزانيتك ووقت سفرك",
                      ]
                    : [
                        "Instant price comparison across all airlines on this route",
                        "Price alerts — Raya notifies you when fares drop",
                        "Personalised picks based on your budget and travel dates",
                      ]
                  ).map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-sm text-white/75">
                      <span className="mt-0.5 text-brand-primary">✓</span>
                      {point}
                    </li>
                  ))}
                </ul>

                <Link
                  href={rayaSearchUrl}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-brand-primary px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
                >
                  <Sparkles className="h-4 w-4" />
                  {isAr
                    ? `ابحث مع ريا — مجاناً`
                    : `Search with Raya — it's free`}
                </Link>
              </div>
            </div>
          </section>

          {/* ── TIPS & EXPERT ADVICE ── */}
          <section className="mb-8 rounded-2xl border border-white/[0.10] bg-white/[0.06] p-6 backdrop-blur-sm">
            <h2 className="mb-5 font-display text-xl font-bold">
              {isAr
                ? `نصائح الخبراء — ${fromCity} إلى ${toCity}`
                : `Expert Tips — ${route.fromNameEn} to ${route.toNameEn}`}
            </h2>

            {/* Route-specific tips from data */}
            {tips && (
              <div className="mb-4 rounded-xl border border-brand-primary/15 bg-brand-primary/5 p-4">
                <p className="text-sm leading-relaxed text-white/80">{tips}</p>
              </div>
            )}

            {/* Generic tips */}
            <ul className="space-y-3">
              {genericTips.map((tip, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-4"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-primary/20 text-xs font-bold text-brand-primary">
                    {i + 1}
                  </span>
                  <span className="text-sm text-white/75">{tip}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* ── FAQ ── */}
          <section className="mb-8">
            <h2 className="mb-5 font-display text-xl font-bold">
              {isAr
                ? `أسئلة شائعة — رحلات ${fromCity} ${toCity}`
                : `FAQ — ${route.fromNameEn} to ${route.toNameEn} Flights`}
            </h2>

            <div className="space-y-3">
              {faqItems.map((item, i) => (
                <details
                  key={i}
                  className="group rounded-2xl border border-white/[0.10] bg-white/[0.06] backdrop-blur-sm"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold text-sm text-white/90 marker:hidden [&::-webkit-details-marker]:hidden">
                    <span>{item.q}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-white/40 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-5 pb-5 pt-0">
                    <p className="text-sm leading-relaxed text-white/65">{item.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* ── AFFILIATE CTA BANNER ── */}
          <section className="mb-8 flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-sm sm:flex-row sm:text-start">
            <div className="flex-1">
              <p className="font-semibold text-white/90">
                {isAr
                  ? `جاهز للحجز؟ قارن الأسعار الآن`
                  : `Ready to book? Compare prices now`}
              </p>
              <p className="mt-1 text-sm text-white/50">
                {isAr
                  ? `${route.fromIata} ← ${route.toIata} · من $${route.avgPriceUsd} · ${route.airlines.length} شركة طيران`
                  : `${route.fromIata} → ${route.toIata} · from $${route.avgPriceUsd} · ${route.airlines.length} airlines`}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={rayaSearchUrl}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
              >
                <Sparkles className="h-4 w-4" />
                {isAr ? "ابحث مع ريا" : "Search with Raya"}
              </Link>
              <a
                href={aviasalesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/[0.05] px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/[0.10]"
              >
                <Plane className="h-4 w-4" />
                Aviasales
                <ExternalLink className="h-3.5 w-3.5 opacity-60" />
              </a>
            </div>
          </section>

          {/* ── INTERNAL LINKS ── */}
          <InternalLinks
            title={isAr ? "استكشف المزيد" : "Explore More"}
            links={internalLinks}
            locale={locale}
          />

          {/* ── YEAR NOTE ── */}
          <p className="mt-8 text-center text-xs text-white/25">
            {isAr
              ? `آخر تحديث: ${currentYear} — الأسعار تقريبية وقد تتغير`
              : `Last updated: ${currentYear} — Prices are approximate and subject to change`}
          </p>
        </div>
      </main>
    </>
  );
}
