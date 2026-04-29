import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { DESTINATIONS } from "@/lib/seo-destinations";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";

interface Props { params: { locale: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const isAr = params.locale === "ar";
  const title = isAr
    ? "دليل الوجهات السياحية — أفضل 50 وجهة في العالم | GoTripza"
    : "Destination Travel Guides — World's Best 50 Destinations | GoTripza";
  const description = isAr
    ? "استكشف أفضل الوجهات السياحية في العالم: دليل شامل للطيران والفنادق والميزانية والتأشيرة وأفضل وقت للزيارة."
    : "Explore the world's best travel destinations with complete guides: flights, hotels, budget planning, visa requirements, and the best time to visit.";
  return {
    title,
    description,
    alternates: {
      canonical: `${BASE}/${params.locale}/destinations`,
      languages: {
        en: `${BASE}/en/destinations`,
        ar: `${BASE}/ar/destinations`,
      },
    },
  };
}

const REGIONS: Record<string, { en: string; ar: string }> = {
  middleeast: { en: "Middle East", ar: "الشرق الأوسط" },
  europe: { en: "Europe", ar: "أوروبا" },
  asia: { en: "Asia & Pacific", ar: "آسيا والمحيط الهادئ" },
  africa: { en: "Africa", ar: "أفريقيا" },
  americas: { en: "Americas", ar: "الأمريكتان" },
  oceania: { en: "أوقيانوسيا", ar: "أوقيانوسيا" },
};

export default async function DestinationsIndexPage({ params }: Props) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const isAr = locale === "ar";

  const grouped = DESTINATIONS.reduce<Record<string, typeof DESTINATIONS>>((acc, d) => {
    if (!acc[d.region]) acc[d.region] = [];
    acc[d.region].push(d);
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-ink-950 text-white" dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto max-w-5xl px-4 py-16">
        <h1 className="font-display text-3xl font-bold md:text-4xl mb-3">
          {isAr ? "🌍 استكشف وجهات العالم" : "🌍 Explore World Destinations"}
        </h1>
        <p className="text-white/60 mb-12 max-w-2xl">
          {isAr
            ? "أدلة سفر شاملة لأكثر من 50 وجهة: طيران، فنادق، ميزانية، تأشيرة وأكثر."
            : "Complete travel guides for 50+ destinations: flights, hotels, budget, visa requirements and more."}
        </p>

        {Object.entries(grouped).map(([region, dests]) => {
          const regionLabel = REGIONS[region];
          if (!regionLabel) return null;
          return (
            <section key={region} className="mb-12">
              <h2 className="mb-4 font-display text-xl font-semibold text-white/70">
                {isAr ? regionLabel.ar : regionLabel.en}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {dests.map((d) => (
                  <Link
                    key={d.slug}
                    href={`/${locale}/destinations/${d.slug}`}
                    className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-brand-primary/30 hover:bg-brand-primary/5"
                  >
                    <span className="text-3xl">{d.flag}</span>
                    <div className="min-w-0">
                      <div className="font-semibold truncate">
                        {isAr ? d.nameAr : d.nameEn}
                      </div>
                      <div className="text-xs text-white/45 mt-0.5">
                        {isAr ? d.taglineAr : d.taglineEn}
                      </div>
                      <div className="mt-1 text-xs text-white/30">
                        {isAr ? "من" : "from"} ${d.budgetPerDay.budget}/
                        {isAr ? "يوم" : "day"}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        <section className="mt-8 rounded-2xl border border-brand-primary/20 bg-gradient-to-br from-brand-primary/10 to-brand-deep/10 p-6 text-center">
          <p className="text-sm text-white/60 mb-3">
            {isAr
              ? "لا تجد وجهتك؟ اسأل ذكاءنا الاصطناعي — يخطط لأي رحلة في ثوانٍ"
              : "Can't find your destination? Ask our AI — it plans any trip in seconds"}
          </p>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-brand-deep px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
          >
            {isAr ? "ابدأ التخطيط الآن" : "Start Planning Now"}
          </Link>
        </section>
      </div>
    </main>
  );
}
