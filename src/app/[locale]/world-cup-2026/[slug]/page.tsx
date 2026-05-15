import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Hotel,
  MapPinned,
  MessageCircle,
  Plane,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/JsonLd";
import { SeoBreadcrumb } from "@/components/seo/InternalLinks";
import { isLocale, type Locale } from "@/i18n/config";
import {
  WORLD_CUP_PAGES,
  getWorldCupCity,
  getWorldCupPage,
  localizedWorldCupCity,
  localizedWorldCupPage,
  worldCupFaq,
} from "@/lib/world-cup-2026";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  return WORLD_CUP_PAGES.flatMap((page) => [
    { locale: "ar", slug: page.slug },
    { locale: "en", slug: page.slug },
  ]);
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  if (!isLocale(params.locale)) return {};
  const page = getWorldCupPage(params.slug);
  if (!page) return {};
  const locale = params.locale as Locale;
  const local = localizedWorldCupPage(page, locale);
  const title = local.title;

  return {
    title,
    description: local.description,
    alternates: {
      canonical: `${BASE}/${locale}/world-cup-2026/${page.slug}`,
      languages: {
        ar: `${BASE}/ar/world-cup-2026/${page.slug}`,
        en: `${BASE}/en/world-cup-2026/${page.slug}`,
        "x-default": `${BASE}/en/world-cup-2026/${page.slug}`,
      },
    },
    openGraph: {
      type: "article",
      title,
      description: local.description,
      url: `${BASE}/${locale}/world-cup-2026/${page.slug}`,
      siteName: "Rya by GoTripza",
    },
  };
}

function labels(locale: Locale) {
  const isAr = locale === "ar";
  return {
    home: isAr ? "الرئيسية" : "Home",
    hub: isAr ? "كأس العالم 2026" : "World Cup 2026",
    answer: isAr ? "إجابة سريعة" : "Quick answer",
    planWithRya: isAr ? "خطط هذا مع ريا" : "Plan this with Rya",
    practical: isAr ? "خطة عملية" : "Practical plan",
    services: isAr ? "الخدمات التي قد تحتاجها" : "Services you may need",
    cityContext: isAr ? "سياق المدينة" : "City context",
    related: isAr ? "أدلة مرتبطة" : "Related guides",
    faq: isAr ? "أسئلة شائعة" : "Frequently asked questions",
    note: isAr ? "تنبيه مهم" : "Important note",
    noTicket: isAr
      ? "Rya لا تبيع تذاكر ولا تقدم أخبار رياضية. تركيزها على تجربة السفر حول البطولة."
      : "Rya does not sell tickets or publish sports news. Her focus is the travel experience around the tournament.",
  };
}

function serviceCards(locale: Locale) {
  const isAr = locale === "ar";
  return [
    {
      icon: Smartphone,
      title: isAr ? "eSIM وبيانات" : "eSIM and data",
      text: isAr ? "للخرائط والترجمة والتنقل والمراسلات عند الوصول." : "For maps, translation, transport, and arrival messages.",
    },
    {
      icon: ShieldCheck,
      title: isAr ? "تأمين السفر" : "Travel insurance",
      text: isAr ? "مفيد للرحلات الطويلة، العائلات، وفوات الرحلات أو الأمتعة." : "Useful for long trips, families, missed flights, and luggage risk.",
    },
    {
      icon: Plane,
      title: isAr ? "تنقلات ومطارات" : "Transfers and airports",
      text: isAr ? "ريا تساعدك تختار مساراً أو خدمة عندما تكون مناسبة فعلاً." : "Rya helps choose a route or service when it genuinely fits.",
    },
  ];
}

function cityNearbyLinks(locale: Locale, currentSlug?: string) {
  return WORLD_CUP_PAGES.filter((page) => page.kind === "city" && page.citySlug !== currentSlug).slice(0, 6);
}

export default async function WorldCupDetailPage(props: Props) {
  const params = await props.params;
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const isAr = locale === "ar";
  const page = getWorldCupPage(params.slug);
  if (!page) notFound();

  const local = localizedWorldCupPage(page, locale);
  const city = page.citySlug ? getWorldCupCity(page.citySlug) : undefined;
  const cityLocal = city ? localizedWorldCupCity(city, locale) : undefined;
  const t = labels(locale);
  const faq = worldCupFaq(locale, page);
  const breadcrumbs = [
    { name: t.home, url: `${BASE}/${locale}` },
    { name: t.hub, url: `${BASE}/${locale}/world-cup-2026` },
    { name: local.title, url: `${BASE}/${locale}/world-cup-2026/${page.slug}` },
  ];

  const related = [
    ...WORLD_CUP_PAGES.filter((item) => item.citySlug && item.citySlug === page.citySlug && item.slug !== page.slug).slice(0, 4),
    ...WORLD_CUP_PAGES.filter((item) => (item.kind === "problem" || item.kind === "audience") && item.slug !== page.slug).slice(0, 4),
  ].slice(0, 6);

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <FaqJsonLd items={faq} />
      <main className="min-h-screen bg-ink-950 pb-20 text-white" dir={isAr ? "rtl" : "ltr"}>
        <section className="border-b border-white/10 bg-[linear-gradient(135deg,#050816_0%,#0a1020_55%,#06131f_100%)]">
          <div className="mx-auto max-w-5xl px-5 py-12 md:py-16">
            <SeoBreadcrumb
              items={[
                { label: t.home, href: `/${locale}` },
                { label: t.hub, href: `/${locale}/world-cup-2026` },
                { label: local.intent },
              ]}
              locale={locale}
            />

            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-brand-mint">
              <Sparkles className="h-4 w-4" />
              {isAr ? "دليل سفر مع Rya" : "Travel guide with Rya"}
            </div>
            <h1 className="mt-5 max-w-4xl font-display text-3xl font-bold leading-tight md:text-5xl">
              {local.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-white/68">
              {local.description}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={`/${locale}/search?q=${encodeURIComponent(local.primaryCta)}`}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-ink-950 transition hover:bg-white/90"
              >
                <MessageCircle className="h-4 w-4" />
                {local.primaryCta}
              </Link>
              <Link
                href={`/${locale}/world-cup-2026`}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/12"
              >
                {isAr ? "كل أدلة كأس العالم" : "All World Cup guides"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl gap-5 px-5 py-10 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="space-y-5">
            <div className="rounded-3xl border border-brand-primary/20 bg-brand-primary/10 p-6">
              <div className="flex items-center gap-2 text-brand-mint">
                <BadgeCheck className="h-5 w-5" />
                <h2 className="font-display text-xl font-semibold">{t.answer}</h2>
              </div>
              <p className="mt-4 text-sm leading-8 text-white/72">
                {isAr
                  ? `إذا كنت تخطط لـ ${local.title}، ابدأ بثلاثة قرارات: المدينة أو المطار، مكان السكن، وخطة يوم المباراة. بعد ذلك تضبط ريا التفاصيل حسب ميزانيتك ومن يسافر معك ومستوى راحتك.`
                  : `If you are planning ${local.title}, start with three decisions: city or airport, stay area, and match-day movement. Rya then adjusts the details around your budget, companions, and comfort level.`}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-brand-primary" />
                <h2 className="font-display text-xl font-semibold">{t.practical}</h2>
              </div>
              <div className="mt-5 grid gap-3">
                {local.focus.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-black/18 p-4">
                    <p className="text-sm leading-7 text-white/72">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {city && cityLocal ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
                <div className="flex items-center gap-2">
                  <MapPinned className="h-5 w-5 text-brand-mint" />
                  <h2 className="font-display text-xl font-semibold">{t.cityContext}</h2>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl bg-black/18 p-4">
                    <p className="text-xs text-white/42">{isAr ? "المطار" : "Airport"}</p>
                    <p className="mt-1 text-sm font-semibold text-white/82">{cityLocal.airport}</p>
                  </div>
                  {city.stadium ? (
                    <div className="rounded-2xl bg-black/18 p-4">
                      <p className="text-xs text-white/42">{isAr ? "الملعب" : "Stadium"}</p>
                      <p className="mt-1 text-sm font-semibold text-white/82">{city.stadium}</p>
                    </div>
                  ) : null}
                  <div className="rounded-2xl bg-black/18 p-4 md:col-span-2">
                    <p className="text-xs text-white/42">{isAr ? "مناطق سكن للمقارنة" : "Stay areas to compare"}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {cityLocal.stayAreas.map((area) => (
                        <span key={area} className="rounded-full bg-white/8 px-3 py-1.5 text-xs text-white/70">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-black/18 p-4">
                    <p className="text-xs text-white/42">{isAr ? "التنقل" : "Transport"}</p>
                    <p className="mt-2 text-sm leading-7 text-white/68">{cityLocal.transport}</p>
                  </div>
                  <div className="rounded-2xl bg-black/18 p-4">
                    <p className="text-xs text-white/42">{isAr ? "الطقس" : "Weather"}</p>
                    <p className="mt-2 text-sm leading-7 text-white/68">{cityLocal.weather}</p>
                  </div>
                </div>
                {cityLocal.note ? (
                  <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
                    <p className="text-xs font-semibold text-amber-200">{t.note}</p>
                    <p className="mt-2 text-sm leading-7 text-white/70">{cityLocal.note}</p>
                  </div>
                ) : null}
              </div>
            ) : null}
          </article>

          <aside className="space-y-5 lg:sticky lg:top-5 lg:self-start">
            <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
              <h2 className="font-display text-lg font-semibold">{t.services}</h2>
              <div className="mt-4 space-y-3">
                {serviceCards(locale).map((card) => (
                  <div key={card.title} className="rounded-2xl bg-black/18 p-4">
                    <card.icon className="mb-3 h-5 w-5 text-brand-mint" />
                    <h3 className="text-sm font-semibold text-white/86">{card.title}</h3>
                    <p className="mt-2 text-xs leading-6 text-white/55">{card.text}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-xs leading-6 text-white/56">
                {t.noTicket}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
              <div className="flex items-center gap-2">
                <Hotel className="h-5 w-5 text-brand-primary" />
                <h2 className="font-display text-lg font-semibold">{t.related}</h2>
              </div>
              <div className="mt-4 space-y-2">
                {related.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/${locale}/world-cup-2026/${item.slug}`}
                    className="block rounded-2xl border border-white/10 bg-black/16 p-3 text-sm leading-6 text-white/68 transition hover:border-brand-primary/35 hover:text-white"
                  >
                    {isAr ? item.titleAr : item.title}
                  </Link>
                ))}
                {cityNearbyLinks(locale, page.citySlug).slice(0, related.length ? 2 : 6).map((item) => (
                  <Link
                    key={item.slug}
                    href={`/${locale}/world-cup-2026/${item.slug}`}
                    className="block rounded-2xl border border-white/10 bg-black/16 p-3 text-sm leading-6 text-white/68 transition hover:border-brand-primary/35 hover:text-white"
                  >
                    {isAr ? item.titleAr : item.title}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="mx-auto max-w-5xl px-5 pb-16">
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
            <h2 className="font-display text-xl font-semibold">{t.faq}</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {faq.map((item) => (
                <div key={item.q} className="rounded-2xl bg-black/18 p-4">
                  <h3 className="text-sm font-semibold text-white/86">{item.q}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/60">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
