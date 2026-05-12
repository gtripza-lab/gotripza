import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Calendar } from "lucide-react";
import { isLocale, type Locale } from "@/i18n/config";
import {
  DESTINATION_SLUGS,
  getDestination,
  formatBestMonths,
  MONTH_NAMES_EN,
  MONTH_NAMES_AR,
  BUDGET_PAGES,
  COMPARISON_PAGES,
} from "@/lib/seo-destinations";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/JsonLd";
import { InternalLinks, SeoBreadcrumb } from "@/components/seo/InternalLinks";
import type { Destination } from "@/lib/seo-destinations";

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
  const year = "2026";
  const bestMonths = formatBestMonths(dest.bestMonths, params.locale as Locale);

  const title = isAr
    ? `أفضل وقت لزيارة ${name} ${year} — أفضل الشهور والطقس`
    : `Best Time to Visit ${dest.nameEn} ${year} — Best Months & Weather`;
  const description = isAr
    ? `إجابة مباشرة عن أفضل وقت لزيارة ${name}: أفضل الشهور ${bestMonths}، الطقس، موسم الذروة، الأسعار، ومتى تطلب من ريا تخطيط الرحلة.`
    : `Direct answer for the best time to visit ${dest.nameEn}: best months ${bestMonths}, weather, peak season, prices, and when to ask Rya to plan.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE}/${params.locale}/seasons/${params.slug}`,
      languages: {
        en: `${BASE}/en/seasons/${params.slug}`,
        ar: `${BASE}/ar/seasons/${params.slug}`,
        "x-default": `${BASE}/en/seasons/${params.slug}`,
      },
    },
    keywords: isAr
      ? `أفضل وقت لزيارة ${name}, مواسم ${name}, طقس ${name}, أرخص شهر للسفر إلى ${name}`
      : `best time to visit ${dest.nameEn}, best month to travel to ${dest.nameEn}, ${dest.nameEn} seasons, ${dest.nameEn} weather`,
    openGraph: { type: "website", title, description, siteName: "GoTripza" },
  };
}

// Generate rough monthly scores based on best months
function monthScore(month: number, bestMonths: number[]): "peak" | "good" | "ok" | "avoid" {
  if (bestMonths.includes(month)) return "peak";
  // Adjacent months
  const adjacent = bestMonths.some((m) => Math.abs(m - month) === 1 || Math.abs(m - month) === 11);
  if (adjacent) return "good";
  // 2 months away
  const near = bestMonths.some((m) => Math.abs(m - month) === 2 || Math.abs(m - month) === 10);
  if (near) return "ok";
  return "avoid";
}

const SCORE_STYLES = {
  peak: { color: "emerald", bar: "bg-emerald-500", label: { en: "Peak", ar: "ذروة" } },
  good: { color: "sky", bar: "bg-sky-500", label: { en: "Good", ar: "جيد" } },
  ok: { color: "amber", bar: "bg-amber-500", label: { en: "OK", ar: "مقبول" } },
  avoid: { color: "red", bar: "bg-red-500/40", label: { en: "Avoid", ar: "تجنب" } },
};

function seasonSearchQueries(dest: Destination, isAr: boolean) {
  if (isAr) {
    return [
      `أفضل وقت لزيارة ${dest.nameAr}`,
      `مواسم ${dest.nameAr}`,
      `طقس ${dest.nameAr}`,
      `أرخص شهر للسفر إلى ${dest.nameAr}`,
    ];
  }
  return [
    `best time to visit ${dest.nameEn}`,
    `best month to travel to ${dest.nameEn}`,
    `best months to visit ${dest.nameEn}`,
    `${dest.nameEn.toLowerCase()} seasons`,
  ];
}

function seasonIntentAnswer(dest: Destination, bestMonthsText: string, isAr: boolean) {
  if (dest.slug === "maldives") {
    return isAr
      ? `أفضل وقت للمالديف غالباً من ${bestMonthsText}. هذه الفترة هي الموسم الجاف: بحر أهدأ، شمس أكثر، وتجربة أفضل للمنتجعات والرحلات البحرية.`
      : `The best time to visit the Maldives is usually ${bestMonthsText}. This is the dry season, with calmer seas, more sunshine, and the strongest resort and boat-transfer experience.`;
  }
  if (dest.slug === "dubai") {
    return isAr
      ? `أفضل وقت لزيارة دبي من ${bestMonthsText}. هذه هي أشهر الطقس اللطيف للأنشطة الخارجية، المولات، الشواطئ، والصحراء.`
      : `The best time to visit Dubai is ${bestMonthsText}. These months bring comfortable weather for outdoor attractions, beaches, desert trips, and walking-heavy days.`;
  }
  if (dest.slug === "kuala-lumpur") {
    return isAr
      ? `كوالالمبور مناسبة طوال السنة تقريباً، لكن ${bestMonthsText} غالباً أفضل للتنقل اليومي لأن الأمطار تكون أسهل في التخطيط حولها.`
      : `Kuala Lumpur works almost year-round, but ${bestMonthsText} is usually easier for daily sightseeing because showers are shorter and simpler to plan around.`;
  }
  return isAr
    ? `أفضل أشهر زيارة ${dest.nameAr}: ${bestMonthsText}. استخدم هذه الفترة إذا كنت تريد توازناً جيداً بين الطقس والتكلفة والأنشطة.`
    : `The best months to visit ${dest.nameEn}: ${bestMonthsText}. Use this window for the best balance of weather, cost, and activities.`;
}

function monthPlanningTips(dest: Destination, isAr: boolean) {
  if (dest.slug === "maldives") {
    return isAr
      ? ["احجز المنتجع والنقل البحري أو الطائرة المائية معاً.", "نوفمبر إلى أبريل أغلى غالباً لكنه الأفضل للطقس.", "مايو إلى أكتوبر أرخص غالباً، لكنه قد يشهد أمطاراً قصيرة وفرص غوص جيدة."]
      : ["Book resort and speedboat or seaplane transfer together.", "November to April is usually pricier but best for weather.", "May to October is often cheaper, with short rains and strong diving conditions."];
  }
  if (dest.slug === "dubai") {
    return isAr
      ? ["تجنب المشي الطويل في الصيف وخطط للأنشطة الداخلية.", "نوفمبر إلى مارس أفضل للشاطئ والصحراء.", "احجز مبكراً في رأس السنة والمعارض الكبيرة."]
      : ["Avoid long outdoor walks in summer and plan indoor activities.", "November to March is best for beaches and desert trips.", "Book early around New Year and major events."];
  }
  if (dest.slug === "kuala-lumpur") {
    return isAr
      ? ["ضع نشاطاً داخلياً بديلاً في كل يوم بسبب الأمطار السريعة.", "احمل مظلة خفيفة حتى في أفضل الشهور.", "المولات والمطاعم تجعل المدينة سهلة حتى وقت المطر."]
      : ["Keep one indoor backup activity each day for quick showers.", "Carry a light umbrella even in better months.", "Malls and food areas make KL easy during rain."];
  }
  return isAr
    ? ["احجز الأنشطة المهمة في أفضل الشهور مبكراً.", "راجع الطقس قبل الرحلة بأسبوع.", "اطلب من ريا تعديل الجدول حسب الموسم."]
    : ["Book key activities early in the best months.", "Recheck weather one week before travel.", "Ask Rya to tune the itinerary by season."];
}

export default async function SeasonsPage({ params }: Props) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const isAr = locale === "ar";

  const dest = getDestination(params.slug);
  if (!dest) notFound();

  const name = isAr ? dest.nameAr : dest.nameEn;
  const bestMonthsText = formatBestMonths(dest.bestMonths, locale);
  const flightUrl = `https://www.aviasales.com/?marker=${MARKER}&destination=${dest.iata}&subid=seasons`;
  const queryChips = seasonSearchQueries(dest, isAr);
  const quickAnswer = seasonIntentAnswer(dest, bestMonthsText, isAr);
  const planningTips = monthPlanningTips(dest, isAr);

  // Categorise all 12 months
  const months = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const score = monthScore(m, dest.bestMonths);
    return { month: m, score, nameEn: MONTH_NAMES_EN[i], nameAr: MONTH_NAMES_AR[i] };
  });

  const seasons = [
    {
      name: { en: "Spring", ar: "الربيع" },
      months: "3-5",
      monthNums: [3, 4, 5],
      icon: "🌸",
    },
    {
      name: { en: "Summer", ar: "الصيف" },
      months: "6-8",
      monthNums: [6, 7, 8],
      icon: "☀️",
    },
    {
      name: { en: "Autumn / Fall", ar: "الخريف" },
      months: "9-11",
      monthNums: [9, 10, 11],
      icon: "🍂",
    },
    {
      name: { en: "Winter", ar: "الشتاء" },
      months: "12-2",
      monthNums: [12, 1, 2],
      icon: "❄️",
    },
  ];

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
      href: `/${locale}/visa/${params.slug}`,
      label: isAr ? `تأشيرة ${name}` : `${dest.nameEn} visa requirements`,
      icon: "🛂",
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
    { name: isAr ? "المواسم وأفضل وقت للسفر" : "Best Time to Visit", url: `${BASE}/${locale}/seasons` },
    { name, url: `${BASE}/${locale}/seasons/${params.slug}` },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <FaqJsonLd
        items={[
          {
            q: isAr ? `ما أفضل وقت لزيارة ${name}؟` : `What is the best time to visit ${dest.nameEn}?`,
            a: quickAnswer,
          },
          {
            q: isAr ? `ما أفضل شهر للسفر إلى ${name}؟` : `What is the best month to travel to ${dest.nameEn}?`,
            a: isAr
              ? `ابدأ بالأشهر التالية: ${bestMonthsText}. اختر الشهر حسب ميزانيتك وتفضيلك للزحام أو الهدوء.`
              : `Start with these months: ${bestMonthsText}. Pick the exact month by budget and whether you prefer fewer crowds or peak conditions.`,
          },
          {
            q: isAr ? `هل ${name} مناسبة للزيارة في الصيف؟` : `Is ${dest.nameEn} good to visit in summer?`,
            a: isAr
              ? months.filter((m) => [6, 7, 8].includes(m.month)).some((m) => m.score === "peak" || m.score === "good")
                ? `نعم، الصيف موسم جيد لزيارة ${name}. ${dest.climate.ar}`
                : `الصيف ليس أفضل وقت لزيارة ${name}. ${dest.climate.ar}`
              : months.filter((m) => [6, 7, 8].includes(m.month)).some((m) => m.score === "peak" || m.score === "good")
              ? `Yes, summer is a good time to visit ${dest.nameEn}. ${dest.climate.en}`
              : `Summer is not the best time to visit ${dest.nameEn}. ${dest.climate.en}`,
          },
          {
            q: isAr ? `ما الطقس في ${name} في الشتاء؟` : `What is the weather like in ${dest.nameEn} in winter?`,
            a: isAr
              ? months.filter((m) => [12, 1, 2].includes(m.month)).some((m) => m.score === "peak" || m.score === "good")
                ? `الشتاء موسم ممتاز لزيارة ${name}. ${dest.climate.ar}`
                : `الشتاء في ${name}: ${dest.climate.ar}`
              : months.filter((m) => [12, 1, 2].includes(m.month)).some((m) => m.score === "peak" || m.score === "good")
              ? `Winter is an excellent time to visit ${dest.nameEn}. ${dest.climate.en}`
              : `Winter in ${dest.nameEn}: ${dest.climate.en}`,
          },
          {
            q: isAr ? `هل الأسعار ترتفع في موسم الذروة في ${name}؟` : `Do prices go up during peak season in ${dest.nameEn}?`,
            a: isAr
              ? `نعم، أسعار الفنادق والطيران ترتفع في الموسم المرتفع. يُنصح بالحجز المبكر لضمان أفضل الأسعار.`
              : `Yes, hotel and flight prices typically increase during peak season. We recommend booking early to secure the best rates.`,
          },
        ]}
      />

      <main className="min-h-screen bg-ink-950 text-white pb-20 md:pb-0" dir={isAr ? "rtl" : "ltr"}>
        <div className="container mx-auto max-w-3xl px-4 py-12">
          <SeoBreadcrumb
            items={[
              { label: isAr ? "الرئيسية" : "Home", href: `/${locale}` },
              { label: isAr ? "أفضل وقت للسفر" : "Best Time to Visit" },
            ]}
            locale={locale}
          />

          <div className="mt-4 flex items-center gap-3">
            <span className="text-4xl">{dest.flag}</span>
            <h1 className="font-display text-2xl font-bold md:text-3xl">
              {isAr
                ? `أفضل وقت لزيارة ${name}`
                : `Best Time to Visit ${dest.nameEn}`}
            </h1>
          </div>

          {/* Quick answer */}
          <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-emerald-400" />
              <span className="font-semibold text-emerald-300 text-sm">
                {isAr ? "أفضل أشهر الزيارة" : "Best Months"}
              </span>
            </div>
            <p className="text-sm text-white/75">{bestMonthsText}</p>
            <p className="mt-3 text-sm leading-7 text-white/65">{quickAnswer}</p>
          </div>

          <section className="mt-6 glass rounded-2xl p-6">
            <h2 className="font-display text-lg font-bold">
              {isAr ? "إجابات يبحث عنها المسافرون" : "Search questions answered here"}
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {queryChips.map((query) => (
                <span key={query} className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs text-white/58">
                  {query}
                </span>
              ))}
            </div>
          </section>

          {/* Climate overview */}
          <section className="mt-6 glass rounded-2xl p-6">
            <h2 className="mb-3 font-display text-lg font-bold">
              {isAr ? "نظرة عامة على المناخ" : "Climate Overview"}
            </h2>
            <p className="text-sm leading-relaxed text-white/70">
              {isAr ? dest.climate.ar : dest.climate.en}
            </p>
          </section>

          {/* Month-by-month calendar */}
          <section className="mt-6 glass rounded-2xl p-6">
            <h2 className="mb-5 font-display text-lg font-bold">
              {isAr ? "التقويم الشهري" : "Month-by-Month Calendar"}
            </h2>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {months.map(({ month, score, nameEn, nameAr }) => {
                const s = SCORE_STYLES[score];
                return (
                  <div
                    key={month}
                    className={`rounded-xl border border-${s.color}-500/20 bg-${s.color}-500/10 p-2.5 text-center`}
                  >
                    <div className="text-xs text-white/60">{isAr ? nameAr : nameEn}</div>
                    <div className={`mt-1 text-xs font-semibold text-${s.color}-400`}>
                      {isAr ? s.label.ar : s.label.en}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(SCORE_STYLES).map(([key, val]) => (
                <span key={key} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs border border-${val.color}-500/20 bg-${val.color}-500/10 text-${val.color}-400`}>
                  {isAr ? val.label.ar : val.label.en}
                </span>
              ))}
            </div>
          </section>

          {/* Seasons breakdown */}
          <section className="mt-6 space-y-4">
            <h2 className="font-display text-lg font-bold">
              {isAr ? "الفصول الأربعة" : "The Four Seasons"}
            </h2>
            {seasons.map((s) => {
              const seasonScore = s.monthNums.map((m) => monthScore(m, dest.bestMonths));
              const best = seasonScore.includes("peak");
              const decent = seasonScore.includes("good");
              return (
                <div key={s.months} className="glass rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{s.icon}</span>
                    <div>
                      <div className="font-semibold">{isAr ? s.name.ar : s.name.en}</div>
                      <div className="text-xs text-white/40">{s.months}</div>
                    </div>
                    {best && (
                      <span className="ms-auto text-xs rounded-full bg-emerald-500/20 text-emerald-400 px-2 py-0.5">
                        {isAr ? "مثالي" : "Ideal"}
                      </span>
                    )}
                    {!best && decent && (
                      <span className="ms-auto text-xs rounded-full bg-sky-500/20 text-sky-400 px-2 py-0.5">
                        {isAr ? "جيد" : "Good"}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/55 leading-relaxed">
                    {isAr
                      ? best
                        ? `${s.name.ar} هو أفضل وقت لزيارة ${name}. ${dest.climate.ar}`
                        : `${s.name.ar} في ${name}: ${dest.climate.ar}`
                      : best
                      ? `${s.name.en} is prime time for ${dest.nameEn}. ${dest.climate.en}`
                      : `${s.name.en} in ${dest.nameEn}: ${dest.climate.en}`}
                  </p>
                </div>
              );
            })}
          </section>

          {/* Clothing tips */}
          <section className="mt-6 glass rounded-2xl p-5">
            <h2 className="mb-3 font-display text-lg font-bold">
              {isAr ? "ماذا تلبس؟" : "What to Pack?"}
            </h2>
            <p className="text-sm leading-relaxed text-white/70">
              {isAr ? dest.clothing.ar : dest.clothing.en}
            </p>
          </section>

          <section className="mt-6 glass rounded-2xl p-5">
            <h2 className="mb-3 font-display text-lg font-bold">
              {isAr ? "نصائح عملية حسب الموسم" : "Practical seasonal tips"}
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {planningTips.map((tip) => (
                <div key={tip} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-sm leading-6 text-white/60">
                  {tip}
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={flightUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-primary to-brand-deep px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02]"
            >
              {isAr ? `احجز طيرانك إلى ${name}` : `Book flights to ${dest.nameEn}`}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <Link
              href={`/${locale}/search?q=${encodeURIComponent(isAr ? `رحلة إلى ${dest.nameAr}` : `trip to ${dest.nameEn}`)}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm text-white/70 transition hover:border-white/40 hover:text-white"
            >
              {isAr ? "خطط رحلتي بالذكاء الاصطناعي" : "Plan with AI"}
            </Link>
          </div>

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
