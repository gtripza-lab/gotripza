import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Bell, BedDouble, CheckCircle2, MapPin, MessageCircle, Sparkles } from "lucide-react";
import { isLocale, type Locale } from "@/i18n/config";
import { DESTINATION_SLUGS, getDestination, BUDGET_PAGES, COMPARISON_PAGES } from "@/lib/seo-destinations";
import { iataToCity } from "@/lib/iata";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { InternalLinks, SeoBreadcrumb } from "@/components/seo/InternalLinks";
import type { Destination } from "@/lib/seo-destinations";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";

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
  const year = "2026";

  const title = isAr
    ? `أفضل مناطق السكن والفنادق في ${name} ${year} — دليل عملي`
    : `Best Hotels & Areas to Stay in ${dest.nameEn} ${year} — Practical Guide`;
  const description = isAr
    ? `دليل صادق لاختيار أفضل منطقة سكن في ${name}: الأحياء المناسبة، أنواع الفنادق، نصائح قبل الحجز، ومساعدة ريا إلى أن يكتمل ربط عروض الفنادق المباشرة.`
    : `An honest guide to choosing where to stay in ${dest.nameEn}: best areas, hotel types, booking tips, and Rya's help while live hotel offers are being connected.`;

  return {
    title,
    description,
    keywords: isAr
      ? `فنادق ${name}, أفضل فنادق ${name}, حجز فندق ${name}`
      : `best hotels in ${dest.nameEn}, ${dest.nameEn} hotels, where to stay in ${dest.nameEn}, hotel areas ${dest.nameEn}`,
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

function hotelSearchQueries(dest: Destination, isAr: boolean) {
  if (isAr) {
    return [
      `فنادق ${dest.nameAr}`,
      `أفضل فنادق ${dest.nameAr}`,
      `أفضل منطقة للسكن في ${dest.nameAr}`,
      `فنادق ${dest.nameAr} للعوائل`,
    ];
  }
  return [
    `best hotels in ${dest.nameEn}`,
    `where to stay in ${dest.nameEn}`,
    `${dest.nameEn} hotel areas`,
    `best ${dest.nameEn} hotels for families`,
  ];
}

function hotelIntentBrief(dest: Destination, isAr: boolean) {
  if (dest.slug === "amman") {
    return isAr
      ? "للبحث عن فنادق عمان، ابدأ بجبل عمان إذا تريد مطاعم ومشي وتجربة محلية، عبدون إذا تريد منطقة أرقى وهادئة، ووسط البلد إذا تريد قرب الأسواق والآثار بتكلفة أقل."
      : "For Amman hotels, start with Jabal Amman for food and walkability, Abdoun for a quieter upscale stay, and Downtown if you want markets and Roman sites at a lower cost.";
  }
  if (dest.slug === "antalya") {
    return isAr
      ? "لأنطاليا، اختر لارا أو بيليك للمنتجعات، كونيالتي للشاطئ مع مدينة، وكاليتشي إذا تريد أجواء تاريخية ومشي."
      : "For Antalya, choose Lara or Belek for resorts, Konyaalti for beach plus city access, and Kaleici for historic walkability.";
  }
  if (dest.slug === "dubai") {
    return isAr
      ? "في دبي، اختر وسط دبي لأول زيارة، مارينا/JBR للشاطئ والحياة اليومية، وديرة إذا تريد ميزانية أقل وقرب الأسواق."
      : "In Dubai, choose Downtown for a first visit, Marina/JBR for beach and lifestyle, and Deira for lower budgets and souks.";
  }
  return isAr
    ? `أفضل منطقة للسكن في ${dest.nameAr} تعتمد على هدف الرحلة: قرب المعالم، الهدوء، الميزانية، أو سهولة التنقل. ريا تساعدك تختار بناءً على برنامجك.`
    : `The best area to stay in ${dest.nameEn} depends on your trip goal: attractions, calm, budget, or transport. Rya can help choose based on your itinerary.`;
}

export default async function HotelsPage({ params }: Props) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const isAr = locale === "ar";

  const dest = getDestination(params.slug);
  if (!dest) notFound();

  const name = isAr ? dest.nameAr : dest.nameEn;
  const cityName = iataToCity(dest.iata);
  const searchQueries = hotelSearchQueries(dest, isAr);
  const intentBrief = hotelIntentBrief(dest, isAr);

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

      <main className="min-h-screen bg-ink-950 text-white pb-20 md:pb-0" dir={isAr ? "rtl" : "ltr"}>
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
                {isAr ? `أفضل مناطق السكن والفنادق في ${name}` : `Best Hotels and Areas to Stay in ${dest.nameEn}`}
              </h1>
              <p className="mt-1 text-sm text-white/50">
                {isAr
                  ? "نجهز ربط عروض الفنادق المباشرة. إلى ذلك الوقت، هذا دليل عملي لاختيار منطقة السكن الصحيحة."
                  : "Live hotel inventory is being connected. Until then, use this practical guide to choose the right area."}
              </p>
            </div>
          </div>

          <section className="mt-6 rounded-2xl border border-brand-mint/20 bg-brand-mint/[0.08] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-mint/80">
              {isAr ? "مختصر مفيد" : "Short answer"}
            </p>
            <h2 className="mt-2 font-display text-xl font-semibold">
              {isAr ? `أين تسكن في ${name}؟` : `Where should you stay in ${dest.nameEn}?`}
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/68">{intentBrief}</p>
          </section>

          <section className="mt-6 glass rounded-2xl p-6">
            <h2 className="font-display text-lg font-bold">
              {isAr ? "إجابات يبحث عنها المسافرون" : "Search questions answered here"}
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {searchQueries.map((query) => (
                <span key={query} className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs text-white/58">
                  {query}
                </span>
              ))}
            </div>
          </section>

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

          <section className="mt-6 overflow-hidden rounded-2xl border border-brand-mint/20 bg-brand-mint/5">
            <div className="grid gap-0 md:grid-cols-[1.1fr_0.9fr]">
              <div className="p-6 md:p-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-brand-mint/20 bg-brand-mint/10 px-3 py-1 text-xs font-semibold text-brand-mint">
                  <Bell className="h-3.5 w-3.5" />
                  {isAr ? "قريباً: عروض الفنادق المباشرة" : "Coming soon: live hotel offers"}
                </div>
                <h2 className="mt-4 font-display text-xl font-semibold text-white">
                  {isAr ? "لن نعرض أسعاراً ناقصة قبل اكتمال الربط" : "We will not show incomplete prices before the connection is ready"}
                </h2>
                <p className="mt-3 text-sm leading-7 text-white/55">
                  {isAr
                    ? "مزود الفنادق لم يفعّل الربط معنا بعد، لذلك جعلنا الصفحة واضحة ومفيدة: دليل مناطق السكن، نصائح اختيار الفندق، ورابط مباشر لريا كي تساعدك بخطة الإقامة."
                    : "Our hotel provider has not activated the integration yet, so this page stays honest and useful: area guidance, hotel-picking tips, and a direct path to Raya for stay planning."}
                </p>
              </div>
              <div className="border-t border-white/[0.06] p-6 md:border-l md:border-t-0 md:p-8">
                <div className="flex items-center gap-3">
                  <BedDouble className="h-9 w-9 text-brand-mint" />
                  <div>
                    <p className="text-sm font-semibold text-white/80">
                      {isAr ? "ما المتوفر الآن؟" : "What is available now?"}
                    </p>
                    <p className="text-xs text-white/40">{cityName}</p>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  {[
                    isAr ? "أفضل مناطق السكن حسب نوع الرحلة" : "Best stay areas by trip type",
                    isAr ? "نصائح اختيار الفندق قبل الحجز" : "Hotel selection tips before booking",
                    isAr ? "مساعدة ريا في بناء خطة الإقامة" : "Raya can help shape your stay plan",
                  ].map((text) => (
                    <div key={text} className="flex items-center gap-2 text-sm text-white/60">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-mint" />
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/${locale}/search?q=${encodeURIComponent(isAr ? `ساعديني أختار منطقة سكن في ${dest.nameAr}` : `Help me choose where to stay in ${dest.nameEn}`)}`}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-mint to-brand-deep px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02]"
            >
              <MessageCircle className="h-4 w-4" />
              {isAr ? "اسأل ريا عن السكن" : "Ask Raya about stays"}
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm text-white/70 transition hover:border-white/40 hover:text-white"
            >
              <Bell className="h-4 w-4" />
              {isAr ? "تواصل معنا للتحديثات" : "Contact us for updates"}
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
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <MapPin className="h-3.5 w-3.5 text-brand-mint" />
                    {isAr ? n.nameAr : n.name}
                  </div>
                  <div className="mt-1 text-xs text-white/45 capitalize">{n.type}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
            <h2 className="font-display text-lg font-bold">
              {isAr ? "نصائح ريا لاختيار الفندق" : "Raya's Hotel-Picking Tips"}
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {(isAr
                ? [
                    "اختر منطقة قريبة من نشاطك الأساسي، وليس الأرخص فقط.",
                    "راجع سياسة الإلغاء قبل الدفع، خصوصاً في المواسم.",
                    "للعوائل: تحقق من مساحة الغرفة والمواصلات قبل التقييم.",
                  ]
                : [
                    "Choose the area closest to your main activities, not only the cheapest.",
                    "Check cancellation rules before paying, especially in peak seasons.",
                    "For families, verify room size and transport before trusting ratings.",
                  ]
              ).map((tip) => (
                <div key={tip} className="rounded-xl border border-white/[0.06] bg-black/20 p-3 text-sm leading-6 text-white/55">
                  <Sparkles className="mb-2 h-4 w-4 text-brand-mint" />
                  {tip}
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
