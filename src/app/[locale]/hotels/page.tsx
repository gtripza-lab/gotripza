import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BedDouble, CheckCircle2, MapPin, MessageCircle, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";
import { isLocale, type Locale, locales } from "@/i18n/config";
import { DESTINATION_SLUGS, getDestination } from "@/lib/seo-destinations";
import { BreadcrumbJsonLd } from "@/components/JsonLd";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";

interface Props {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale } = await props.params;
  if (!isLocale(locale)) return {};
  const isAr = locale === "ar";
  const title = isAr
    ? "دليل الفنادق ومناطق السكن | Rya by GoTripza"
    : "Hotel Areas and Stay Guides | Rya by GoTripza";
  const description = isAr
    ? "اختر أفضل منطقة للسكن قبل الحجز: أدلة فنادق حسب المدينة، مناطق مناسبة للعوائل والميزانيات، ونصائح ريا إلى أن تكتمل عروض الفنادق المباشرة."
    : "Choose the right area before booking: city hotel guides, family and budget stay advice, and Rya's practical guidance while live hotel offers are being connected.";

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE}/${locale}/hotels`,
      languages: {
        en: `${BASE}/en/hotels`,
        ar: `${BASE}/ar/hotels`,
        "x-default": `${BASE}/en/hotels`,
      },
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: `${BASE}/${locale}/hotels`,
      siteName: "GoTripza",
    },
  };
}

function hotelIntro(isAr: boolean) {
  return isAr
    ? "مزود الفنادق لم يفعّل الربط المباشر بعد، لذلك لا نعرض أسعاراً ناقصة. هذه الصفحة تساعدك تختار منطقة السكن الصحيحة، ثم ريا تكمل معك القرار داخل المحادثة."
    : "Live hotel inventory is not fully connected yet, so we do not show incomplete prices. This hub helps you choose the right area first, then Rya helps refine the decision in conversation.";
}

export default async function HotelsIndexPage(props: Props) {
  const { locale } = await props.params;
  if (!isLocale(locale)) notFound();
  const isAr = locale === "ar";
  const typedLocale = locale as Locale;
  const destinations = DESTINATION_SLUGS.map((slug) => getDestination(slug)).filter(Boolean);

  const breadcrumbs = [
    { name: isAr ? "الرئيسية" : "Home", url: `${BASE}/${locale}` },
    { name: isAr ? "الفنادق" : "Hotels", url: `${BASE}/${locale}/hotels` },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <main className="min-h-screen bg-ink-950 px-4 py-12 text-white" dir={isAr ? "rtl" : "ltr"}>
        <div className="mx-auto max-w-6xl">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
          >
            {isAr ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            {isAr ? "العودة للرئيسية" : "Back home"}
          </Link>

          <section className="pt-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-mint/25 bg-brand-mint/10 px-4 py-2 text-sm text-brand-mint">
              <BedDouble className="h-4 w-4" />
              {isAr ? "دليل سكن صادق قبل الحجز" : "Honest stay guidance before booking"}
            </div>
            <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-tight md:text-6xl">
              {isAr ? "اختر منطقة السكن قبل أن تختار الفندق" : "Choose the stay area before the hotel"}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/65">{hotelIntro(isAr)}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/${locale}/search?q=${encodeURIComponent(isAr ? "ساعديني أختار منطقة سكن مناسبة" : "Help me choose the right area to stay")}`}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-mint to-brand-deep px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02]"
              >
                <MessageCircle className="h-4 w-4" />
                {isAr ? "اسأل ريا عن السكن" : "Ask Rya about stays"}
              </Link>
              <Link
                href={`/${locale}/plan`}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-6 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/[0.10]"
              >
                <Sparkles className="h-4 w-4" />
                {isAr ? "ابنِ خطة الرحلة" : "Build a trip plan"}
              </Link>
            </div>
          </section>

          <section className="mt-12 grid gap-4 rounded-2xl border border-brand-mint/20 bg-brand-mint/[0.07] p-5 md:grid-cols-3">
            {[
              isAr ? "لا نعرض أسعاراً غير مكتملة قبل الربط" : "No incomplete prices before integration",
              isAr ? "نشرح أفضل أحياء السكن لكل مدينة" : "Best stay areas by city",
              isAr ? "ريا تساعدك حسب الميزانية ونوع الرحلة" : "Rya adapts by budget and trip style",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl bg-black/15 p-4 text-sm text-white/70">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-mint" />
                {item}
              </div>
            ))}
          </section>

          <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {destinations.map((dest) => {
              if (!dest) return null;
              const name = isAr ? dest.nameAr : dest.nameEn;
              const neighborhoods = dest.neighborhoods.slice(0, 3);
              return (
                <Link
                  key={dest.slug}
                  href={`/${typedLocale}/hotels/${dest.slug}`}
                  className="group rounded-2xl border border-white/10 bg-white/[0.045] p-5 transition hover:border-brand-mint/40 hover:bg-white/[0.07]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-3xl">{dest.flag}</p>
                      <h2 className="mt-3 text-xl font-semibold text-white">
                        {isAr ? `فنادق ${name}` : `Hotels in ${dest.nameEn}`}
                      </h2>
                      <p className="mt-1 text-sm text-white/45">
                        {isAr ? dest.countryAr : dest.country}
                      </p>
                    </div>
                    <BedDouble className="h-6 w-6 text-brand-mint/70 transition group-hover:text-brand-mint" />
                  </div>
                  <div className="mt-5 space-y-2">
                    {neighborhoods.map((area) => (
                      <div key={area.name} className="flex items-center gap-2 text-sm text-white/55">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-mint/70" />
                        <span>{isAr ? area.nameAr : area.name}</span>
                        <span className="text-white/30">-</span>
                        <span className="capitalize text-white/35">{area.type}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-white/50">
                    {isAr ? dest.taglineAr : dest.taglineEn}
                  </p>
                </Link>
              );
            })}
          </section>
        </div>
      </main>
    </>
  );
}
