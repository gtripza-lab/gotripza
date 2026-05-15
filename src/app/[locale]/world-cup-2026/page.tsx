import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  Globe2,
  MapPin,
  Plane,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/JsonLd";
import { SeoBreadcrumb } from "@/components/seo/InternalLinks";
import { isLocale, type Locale } from "@/i18n/config";
import {
  WORLD_CUP_CITIES,
  WORLD_CUP_EVENT,
  WORLD_CUP_PAGES,
  localizedWorldCupCity,
  worldCupFaq,
} from "@/lib/world-cup-2026";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  if (!isLocale(params.locale)) return {};
  const isAr = params.locale === "ar";
  const title = isAr
    ? "Rya لكأس العالم 2026 — رفيقة السفر الذكية في أمريكا"
    : "Rya for World Cup 2026 — AI Travel Companion for USA Travelers";
  const description = isAr
    ? "خطط رحلة كأس العالم 2026 في أمريكا مع Rya by GoTripza: المدن، الملاعب، المطارات، التأشيرة، الميزانية، eSIM، التأمين، والأمان."
    : "Plan your World Cup 2026 USA trip with Rya by GoTripza: host cities, stadiums, airports, visa planning, budget, eSIM, insurance, and safety.";

  return {
    title,
    description,
    keywords: isAr
      ? "كأس العالم 2026, السفر إلى أمريكا, ريا, GoTripza, تخطيط كأس العالم, eSIM أمريكا, تأمين السفر"
      : "World Cup 2026 travel, USA World Cup travel, AI travel companion, Rya, GoTripza, eSIM USA, travel insurance",
    alternates: {
      canonical: `${BASE}/${params.locale}/world-cup-2026`,
      languages: {
        ar: `${BASE}/ar/world-cup-2026`,
        en: `${BASE}/en/world-cup-2026`,
        "x-default": `${BASE}/en/world-cup-2026`,
      },
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: `${BASE}/${params.locale}/world-cup-2026`,
      siteName: "Rya by GoTripza",
    },
  };
}

function sectionTitle(locale: Locale, en: string, ar: string) {
  return locale === "ar" ? ar : en;
}

export default async function WorldCupHubPage(props: Props) {
  const params = await props.params;
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const isAr = locale === "ar";
  const faq = worldCupFaq(locale);
  const cityPages = WORLD_CUP_PAGES.filter((page) => page.kind === "city");
  const airportPages = WORLD_CUP_PAGES.filter((page) => page.kind === "airport").slice(0, 6);
  const problemPages = WORLD_CUP_PAGES.filter((page) => page.kind === "problem" || page.kind === "audience");

  const breadcrumbs = [
    { name: isAr ? "الرئيسية" : "Home", url: `${BASE}/${locale}` },
    { name: isAr ? "كأس العالم 2026" : "World Cup 2026", url: `${BASE}/${locale}/world-cup-2026` },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <FaqJsonLd items={faq} />
      <main className="min-h-screen bg-ink-950 text-white" dir={isAr ? "rtl" : "ltr"}>
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(59,130,246,0.24),transparent_34%),radial-gradient(circle_at_80%_5%,rgba(0,212,179,0.12),transparent_32%),linear-gradient(135deg,#050816_0%,#09111f_55%,#050816_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-primary/60 to-transparent" />

          <div className="relative mx-auto max-w-6xl px-5 py-14 md:py-20">
            <SeoBreadcrumb
              items={[
                { label: isAr ? "الرئيسية" : "Home", href: `/${locale}` },
                { label: isAr ? "كأس العالم 2026" : "World Cup 2026" },
              ]}
              locale={locale}
            />

            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-brand-primary/25 bg-brand-primary/10 px-4 py-2 text-xs font-semibold text-brand-mint">
              <Trophy className="h-4 w-4" />
              {isAr ? "Rya by GoTripza لمسافري كأس العالم" : "Rya by GoTripza for World Cup travelers"}
            </div>

            <div className="mt-7 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
              <div>
                <h1 className="max-w-4xl font-display text-4xl font-bold leading-tight md:text-6xl">
                  {isAr
                    ? "رفيقة السفر الذكية لكأس العالم 2026 في أمريكا"
                    : "Your AI travel companion for World Cup 2026 in the USA"}
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-white/70 md:text-lg">
                  {isAr
                    ? "ريا تساعدك قبل السفر وأثناء البطولة: التأشيرة، المطارات، المدن، الملاعب، الميزانية، eSIM، التأمين، الأمان، والترجمة. ليست بائع تذاكر، بل رفيقة سفر تفهم رحلتك."
                    : "Rya helps before and during the tournament: visas, airports, cities, stadiums, budget, eSIM, insurance, safety, and translation. Not a ticket reseller. A travel companion that understands your trip."}
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href={`/${locale}/search?q=${encodeURIComponent(isAr ? "خططي رحلة كأس العالم 2026 في أمريكا" : "Plan my World Cup 2026 trip in the USA")}`}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-ink-950 transition hover:bg-white/90"
                  >
                    <Sparkles className="h-4 w-4" />
                    {isAr ? "خطط مع ريا" : "Plan with Rya"}
                  </Link>
                  <Link
                    href={`/${locale}/plus`}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/12"
                  >
                    {isAr ? "Rya Companion للرحلة" : "Rya Companion for the trip"}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-brand-primary/10 backdrop-blur">
                <div className="grid gap-3">
                  {[
                    {
                      icon: CalendarDays,
                      label: isAr ? "تاريخ البطولة" : "Tournament dates",
                      value: isAr ? WORLD_CUP_EVENT.datesAr : WORLD_CUP_EVENT.dates,
                    },
                    {
                      icon: Globe2,
                      label: isAr ? "النطاق" : "Region",
                      value: isAr ? WORLD_CUP_EVENT.regionAr : WORLD_CUP_EVENT.region,
                    },
                    {
                      icon: MapPin,
                      label: isAr ? "تركيز المحتوى" : "Content focus",
                      value: isAr ? "المدن الأمريكية، الملاعب، المطارات، ومشاكل السفر" : "US cities, stadiums, airports, and real travel problems",
                    },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-black/18 p-4">
                      <item.icon className="mb-3 h-5 w-5 text-brand-mint" />
                      <p className="text-xs text-white/45">{item.label}</p>
                      <p className="mt-1 text-sm font-semibold leading-6 text-white/85">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-12">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Plane,
                title: sectionTitle(locale, "From airport to stadium", "من المطار إلى الملعب"),
                text: sectionTitle(locale, "Arrival plans, transfers, data, and first-hour decisions.", "خطط الوصول، التنقل، البيانات، وقرارات أول ساعة."),
              },
              {
                icon: ShieldCheck,
                title: sectionTitle(locale, "Safety without fear", "أمان بدون تهويل"),
                text: sectionTitle(locale, "Scam awareness, safer areas, and calm decisions during crowds.", "وعي بالاحتيال، مناطق أهدأ، وقرارات هادئة وسط الزحام."),
              },
              {
                icon: Sparkles,
                title: sectionTitle(locale, "Rya remembers the trip", "ريا تتذكر الرحلة"),
                text: sectionTitle(locale, "Cities, budget, companions, preferences, and travel concerns stay in context.", "المدن، الميزانية، المرافقون، التفضيلات، والمخاوف تبقى في السياق."),
              },
            ].map((item) => (
              <div key={item.title} className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
                <item.icon className="mb-4 h-5 w-5 text-brand-primary" />
                <h2 className="font-display text-xl font-semibold">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-white/62">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-12">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-mint">
                {isAr ? "مدن ومناطق" : "Cities and routes"}
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold md:text-3xl">
                {isAr ? "ابدأ من المدينة التي ستصل إليها" : "Start with the city you will arrive in"}
              </h2>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {cityPages.map((page) => {
              const city = WORLD_CUP_CITIES.find((item) => item.slug === page.citySlug);
              if (!city) return null;
              const local = localizedWorldCupCity(city, locale);
              return (
                <Link
                  key={page.slug}
                  href={`/${locale}/world-cup-2026/${page.slug}`}
                  className="group rounded-3xl border border-white/10 bg-white/[0.035] p-5 transition hover:border-brand-primary/35 hover:bg-brand-primary/10"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg font-semibold text-white group-hover:text-brand-mint">
                        {local.marketName}
                      </h3>
                      <p className="mt-2 text-xs leading-6 text-white/55">{local.angle}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-white/35 group-hover:text-brand-mint" />
                  </div>
                  <p className="mt-4 text-xs text-white/40">
                    {city.stadium ? city.stadium : isAr ? "رحلة جانبية وليست مدينة ملعب" : "Side-trip, not a stadium host"}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="border-y border-white/10 bg-white/[0.025]">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-mint">
                {isAr ? "مشاكل السفر الحقيقية" : "Real travel problems"}
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold md:text-3xl">
                {isAr ? "صفحات مصممة لما يقلق المسافر فعلاً" : "Pages built around what travelers actually worry about"}
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/62">
                {isAr
                  ? "هذا القسم لا يطارد كلمات مفتاحية فقط. كل صفحة تجيب عن موقف حقيقي: تأشيرة، ميزانية، مطار، أمان، eSIM، عائلة، أو أول زيارة لأمريكا."
                  : "This section is not keyword stuffing. Every page answers a real travel moment: visa, budget, airport, safety, eSIM, family travel, or first-time USA arrival."}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {problemPages.map((page) => (
                <Link
                  key={page.slug}
                  href={`/${locale}/world-cup-2026/${page.slug}`}
                  className="rounded-2xl border border-white/10 bg-black/18 p-4 transition hover:border-brand-mint/30 hover:bg-brand-mint/10"
                >
                  <p className="text-xs text-brand-mint">{isAr ? page.intentAr : page.intent}</p>
                  <h3 className="mt-2 text-sm font-semibold leading-6 text-white/86">
                    {isAr ? page.titleAr : page.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-12">
          <h2 className="font-display text-2xl font-bold md:text-3xl">
            {isAr ? "أدلة المطارات" : "Airport arrival guides"}
          </h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {airportPages.map((page) => (
              <Link
                key={page.slug}
                href={`/${locale}/world-cup-2026/${page.slug}`}
                className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-white/72 transition hover:border-brand-primary/35 hover:text-white"
              >
                {isAr ? page.titleAr : page.title}
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
