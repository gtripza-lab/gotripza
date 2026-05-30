import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { DESTINATIONS } from "@/lib/seo-destinations";
import { fetchPhotos, type UnsplashPhoto } from "@/lib/unsplash";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";

interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const isAr = params.locale === "ar";
  const title = isAr
    ? "دليل الوجهات السياحية — أفضل 50 وجهة في العالم"
    : "Destination Travel Guides — World's Best 50 Destinations";
  const description = isAr
    ? "استكشف أفضل الوجهات السياحية في العالم: دليل شامل للطيران، مناطق السكن، الميزانية، التأشيرة، وأفضل وقت للزيارة."
    : "Explore the world's best travel destinations with complete guides: flights, stay areas, budget planning, visa requirements, and the best time to visit.";
  return {
    title,
    description,
    alternates: {
      canonical: `${BASE}/${params.locale}/destinations`,
      languages: {
        en: `${BASE}/en/destinations`,
        ar: `${BASE}/ar/destinations`,
        "x-default": `${BASE}/en/destinations`,
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
  oceania: { en: "Oceania", ar: "أوقيانوسيا" },
};

// Top destinations featured with photos — slugs must match DESTINATIONS slugs
const FEATURED_SLUGS = [
  "dubai", "istanbul", "london", "paris", "bali",
  "tokyo", "bangkok", "singapore", "maldives", "antalya",
  "rome", "barcelona",
];

// Fallback gradient per destination (shown when photo fails to load)
const DEST_GRADIENT: Record<string, string> = {
  dubai:     "from-amber-600/50 to-orange-800/60",
  istanbul:  "from-red-700/50 to-rose-900/60",
  london:    "from-slate-600/50 to-blue-900/60",
  paris:     "from-indigo-600/50 to-violet-900/60",
  bali:      "from-emerald-600/50 to-teal-900/60",
  tokyo:     "from-pink-600/50 to-rose-800/60",
  bangkok:   "from-yellow-600/50 to-orange-900/60",
  singapore: "from-cyan-600/50 to-blue-900/60",
  maldives:  "from-sky-500/50 to-cyan-900/60",
  antalya:   "from-blue-500/50 to-teal-800/60",
  rome:      "from-orange-600/50 to-amber-900/60",
  barcelona: "from-red-500/50 to-orange-800/60",
};

// Cache photo fetches for 24 hours — survives dev-mode hot reloads
const fetchFeaturedPhotos = unstable_cache(
  async (keywords: string[]) => fetchPhotos(keywords),
  ["destinations-featured-photos"],
  { revalidate: 86400 },
);

export default async function DestinationsIndexPage(props: Props) {
  const params = await props.params;
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const isAr = locale === "ar";

  // Fetch photos only for featured destinations (cached 24h — survives hot reloads)
  const featuredDests = DESTINATIONS.filter((d) => FEATURED_SLUGS.includes(d.slug));
  const photos = await fetchFeaturedPhotos(featuredDests.map((d) => d.heroKeyword));
  const photoMap: Record<string, UnsplashPhoto> = {};
  featuredDests.forEach((d, i) => { photoMap[d.slug] = photos[i]; });

  const grouped = DESTINATIONS.reduce<Record<string, typeof DESTINATIONS>>((acc, d) => {
    if (!acc[d.region]) acc[d.region] = [];
    acc[d.region].push(d);
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-ink-950 text-white pb-20 md:pb-0" dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto max-w-5xl px-4 py-16">
        <h1 className="font-display text-3xl font-bold md:text-4xl mb-3">
          {isAr ? "🌍 استكشف وجهات العالم" : "🌍 Explore World Destinations"}
        </h1>
        <p className="text-white/60 mb-10 max-w-2xl">
          {isAr
            ? "أدلة سفر شاملة لأكثر من 50 وجهة: طيران، مناطق سكن، ميزانية، تأشيرة وأكثر."
            : "Complete travel guides for 50+ destinations: flights, stay areas, budget, visa requirements and more."}
        </p>

        {/* ── Featured Destinations Photo Grid ─────────────────────── */}
        <section className="mb-14">
          <h2 className="mb-5 font-display text-xl font-semibold text-white/70">
            {isAr ? "⭐ الوجهات الأكثر شعبية" : "⭐ Most Popular Destinations"}
          </h2>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {featuredDests.map((d) => {
              const photo = photoMap[d.slug];
              return (
                <Link
                  key={d.slug}
                  href={`/${locale}/destinations/${d.slug}`}
                  className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10"
                >
                  {photo?.url ? (
                    <Image
                      src={photo.url}
                      alt={d.nameEn}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${DEST_GRADIENT[d.slug] ?? "from-brand-primary/30 to-brand-deep/40"}`} />
                  )}
                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute inset-x-3 bottom-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg leading-none">{d.flag}</span>
                      <span className="font-semibold text-sm text-white leading-tight">
                        {isAr ? d.nameAr : d.nameEn}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-white/55">
                      {isAr ? "من" : "from"} ${d.budgetPerDay.budget}/{isAr ? "يوم" : "day"}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── Full Destinations List by Region ─────────────────────── */}
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
