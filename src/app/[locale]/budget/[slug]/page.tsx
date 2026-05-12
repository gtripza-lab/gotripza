import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink, TrendingUp, Wallet, AlertTriangle, CheckCircle2 } from "lucide-react";
import { isLocale, type Locale } from "@/i18n/config";
import {
  BUDGET_PAGES,
  getDestination,
  budgetVerdict,
  COMPARISON_PAGES,
} from "@/lib/seo-destinations";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/JsonLd";
import { InternalLinks, SeoBreadcrumb } from "@/components/seo/InternalLinks";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";
const MARKER = process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER ?? "522867";

interface Props { params: { locale: string; slug: string } }

export async function generateStaticParams() {
  return BUDGET_PAGES.flatMap((b) => [
    { locale: "ar", slug: b.slug },
    { locale: "en", slug: b.slug },
  ]);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const bp = BUDGET_PAGES.find((b) => b.slug === params.slug);
  if (!bp) return {};
  const dest = getDestination(bp.destination);
  if (!dest) return {};
  const isAr = params.locale === "ar";
  const name = isAr ? dest.nameAr : dest.nameEn;

  const title = isAr
    ? `هل ${bp.budgetUsd} دولار كافية لـ${name} (${bp.durationDays} أيام)؟ دليل الميزانية 2025`
    : `Is $${bp.budgetUsd} Enough for ${dest.nameEn} (${bp.durationDays} Days)? Budget Guide 2025`;
  const description = isAr
    ? `خطة ميزانية كاملة لرحلة ${name} بـ${bp.budgetUsd} دولار لمدة ${bp.durationDays} أيام: السكن، الطعام، المواصلات، الأنشطة، والتأمين.`
    : `Complete budget breakdown for ${dest.nameEn} with $${bp.budgetUsd} for ${bp.durationDays} days — stays, food, transport, activities, and insurance.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE}/${params.locale}/budget/${params.slug}`,
      languages: {
        en: `${BASE}/en/budget/${params.slug}`,
        ar: `${BASE}/ar/budget/${params.slug}`,
        "x-default": `${BASE}/en/budget/${params.slug}`,
      },
    },
    openGraph: { type: "website", title, description, siteName: "GoTripza" },
  };
}

const VERDICT_STYLES = {
  generous: { color: "emerald", icon: CheckCircle2, label: { en: "Generous budget", ar: "ميزانية وفيرة" } },
  comfortable: { color: "sky", icon: TrendingUp, label: { en: "Comfortable budget", ar: "ميزانية مريحة" } },
  tight: { color: "amber", icon: AlertTriangle, label: { en: "Tight but doable", ar: "ضيق لكن ممكن" } },
  impossible: { color: "rose", icon: AlertTriangle, label: { en: "Insufficient", ar: "غير كافٍ" } },
} as const;

export default async function BudgetPage({ params }: Props) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const isAr = locale === "ar";

  const bp = BUDGET_PAGES.find((b) => b.slug === params.slug);
  if (!bp) notFound();
  const dest = getDestination(bp.destination);
  if (!dest) notFound();

  const verdict = budgetVerdict(dest, bp.budgetUsd, bp.durationDays);
  const style = VERDICT_STYLES[verdict.verdict];
  const Icon = style.icon;
  const name = isAr ? dest.nameAr : dest.nameEn;
  const daily = Math.round(bp.budgetUsd / bp.durationDays);

  const flightUrl = `https://www.aviasales.com/?marker=${MARKER}&destination=${dest.iata}&subid=budget_page`;
  const hotelUrl = `https://www.hotellook.com/search?destination=${encodeURIComponent(dest.nameEn)}&lang=${isAr ? "ar" : "en"}&marker=${MARKER}&subid=budget_page`;

  // Budget breakdown estimate
  const hotelNightlyEst = verdict.recommended === "budget"
    ? dest.budgetPerDay.budget * 0.5
    : verdict.recommended === "mid"
    ? dest.budgetPerDay.mid * 0.5
    : dest.budgetPerDay.luxury * 0.4;

  const foodDailyEst = verdict.recommended === "budget"
    ? dest.budgetPerDay.budget * 0.25
    : verdict.recommended === "mid"
    ? dest.budgetPerDay.mid * 0.2
    : dest.budgetPerDay.luxury * 0.2;

  const transportEst = verdict.recommended === "budget" ? 10 : verdict.recommended === "mid" ? 20 : 50;
  const activitiesEst = Math.round(daily * 0.15);

  const breakdown = [
    {
      label: { en: "Hotel / night", ar: "فندق / ليلة" },
      amount: `~$${Math.round(hotelNightlyEst)}`,
      sub: { en: verdict.recommended + " category", ar: "فئة " + (verdict.recommended === "budget" ? "اقتصادية" : verdict.recommended === "mid" ? "متوسطة" : "فاخرة") },
    },
    {
      label: { en: "Food / day", ar: "طعام / يوم" },
      amount: `~$${Math.round(foodDailyEst)}`,
      sub: { en: "local dining + 1 restaurant", ar: "أكل محلي + مطعم واحد" },
    },
    {
      label: { en: "Transport / day", ar: "مواصلات / يوم" },
      amount: `~$${transportEst}`,
      sub: { en: dest.carRental ? "taxi + metro" : "metro + walking", ar: dest.carRental ? "تاكسي + مترو" : "مترو + مشي" },
    },
    {
      label: { en: "Activities budget", ar: "ميزانية الأنشطة" },
      amount: `~$${activitiesEst * bp.durationDays}`,
      sub: { en: "total for trip", ar: "إجمالي الرحلة" },
    },
  ];

  const comparisons = COMPARISON_PAGES.filter(
    (c) => c.destA === bp.destination || c.destB === bp.destination,
  );

  const internalLinks = [
    {
      href: `/${locale}/destinations/${bp.destination}`,
      label: isAr ? `دليل ${name} الشامل` : `Complete ${dest.nameEn} guide`,
      icon: dest.flag,
    },
    {
      href: `/${locale}/hotels/${bp.destination}`,
      label: isAr ? `أفضل فنادق ${name}` : `Best hotels in ${dest.nameEn}`,
      icon: "🏨",
    },
    {
      href: `/${locale}/seasons/${bp.destination}`,
      label: isAr ? `أفضل وقت لزيارة ${name}` : `Best time to visit ${dest.nameEn}`,
      icon: "📅",
    },
    ...comparisons.slice(0, 2).map((c) => ({
      href: `/${locale}/compare/${c.slug}`,
      label: isAr ? c.intentAr : c.intentEn,
      icon: "⚖️",
    })),
  ];

  const breadcrumbs = [
    { name: isAr ? "الرئيسية" : "Home", url: `${BASE}/${locale}` },
    { name: isAr ? "ميزانية الرحلة" : "Trip Budget", url: `${BASE}/${locale}/budget` },
    {
      name: isAr
        ? `${name} — ${bp.budgetUsd}$ / ${bp.durationDays} أيام`
        : `${dest.nameEn} — $${bp.budgetUsd} / ${bp.durationDays} days`,
      url: `${BASE}/${locale}/budget/${params.slug}`,
    },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <FaqJsonLd
        items={[
          {
            q: isAr
              ? `هل ${bp.budgetUsd} دولار كافية لـ${name} (${bp.durationDays} أيام)؟`
              : `Is $${bp.budgetUsd} enough for ${dest.nameEn} (${bp.durationDays} days)?`,
            a: isAr
              ? verdict.message.ar
              : verdict.message.en,
          },
          {
            q: isAr ? `ما أرخص وقت لزيارة ${name}؟` : `What is the cheapest time to visit ${dest.nameEn}?`,
            a: isAr
              ? `أفضل أشهر لزيارة ${name} من حيث السعر والطقس هي: ${dest.bestMonths.join("، ")}.`
              : `The best and most affordable months to visit ${dest.nameEn} are: ${dest.bestMonths.join(", ")}.`,
          },
          {
            q: isAr ? `ما متوسط سعر الفندق في ${name} في الليلة الواحدة؟` : `How much does a hotel cost per night in ${dest.nameEn}?`,
            a: isAr
              ? `تتراوح أسعار الفنادق في ${name} بين $${dest.budgetPerDay.budget} (اقتصادي) و$${dest.budgetPerDay.mid} (متوسط) و$${dest.budgetPerDay.luxury} (فاخر) في الليلة.`
              : `Hotel prices in ${dest.nameEn} range from $${dest.budgetPerDay.budget}/night (budget) to $${dest.budgetPerDay.mid}/night (mid-range) and $${dest.budgetPerDay.luxury}/night (luxury).`,
          },
          {
            q: isAr ? `كم يجب أن أخصص للطعام في ${name}؟` : `How much should I budget for food in ${dest.nameEn}?`,
            a: isAr
              ? `تتراوح تكلفة الطعام اليومية في ${name} بين $${Math.round(dest.budgetPerDay.budget * 0.25)} (محلي) و$${Math.round(dest.budgetPerDay.mid * 0.2)} (مطاعم متوسطة).`
              : `Daily food costs in ${dest.nameEn} range from $${Math.round(dest.budgetPerDay.budget * 0.25)} (local dining) to $${Math.round(dest.budgetPerDay.mid * 0.2)} (mid-range restaurants).`,
          },
        ]}
      />

      <main className="min-h-screen bg-ink-950 text-white pb-20 md:pb-0" dir={isAr ? "rtl" : "ltr"}>
        <div className="container mx-auto max-w-3xl px-4 py-12">
          <SeoBreadcrumb
            items={[
              { label: isAr ? "الرئيسية" : "Home", href: `/${locale}` },
              { label: isAr ? "الميزانية" : "Budget" },
            ]}
            locale={locale}
          />

          <div className="mt-4 flex items-center gap-3">
            <span className="text-3xl">{dest.flag}</span>
            <h1 className="font-display text-2xl font-bold md:text-3xl">
              {isAr
                ? `هل ${bp.budgetUsd}$ كافية لـ${name}؟ (${bp.durationDays} أيام)`
                : `Is $${bp.budgetUsd} Enough for ${dest.nameEn}? (${bp.durationDays} Days)`}
            </h1>
          </div>

          {/* Verdict banner */}
          <div className={`mt-6 flex items-start gap-4 rounded-2xl border border-${style.color}-500/20 bg-${style.color}-500/10 p-5`}>
            <Icon className={`h-6 w-6 mt-0.5 shrink-0 text-${style.color}-400`} />
            <div>
              <div className={`font-bold text-${style.color}-300 mb-1`}>
                {isAr ? style.label.ar : style.label.en}
              </div>
              <p className="text-sm text-white/75">
                {isAr ? verdict.message.ar : verdict.message.en}
              </p>
            </div>
          </div>

          {/* Daily budget */}
          <div className="mt-6 glass rounded-2xl p-5">
            <h2 className="mb-4 font-display text-lg font-bold">
              {isAr ? "توزيع الميزانية اليومية" : "Daily Budget Breakdown"}
            </h2>
            <div className="mb-3 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-brand-primary" />
              <span className="text-sm text-white/60">
                {isAr
                  ? `${bp.budgetUsd}$ ÷ ${bp.durationDays} أيام = ${daily}$ يومياً`
                  : `$${bp.budgetUsd} ÷ ${bp.durationDays} days = $${daily}/day`}
              </span>
            </div>
            <div className="space-y-3">
              {breakdown.map((item, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
                  <div>
                    <div className="text-sm font-medium">
                      {isAr ? item.label.ar : item.label.en}
                    </div>
                    <div className="text-xs text-white/40 mt-0.5">
                      {isAr ? item.sub.ar : item.sub.en}
                    </div>
                  </div>
                  <div className="font-bold text-brand-primary">{item.amount}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Money-saving tips */}
          <section className="mt-6 glass rounded-2xl p-5">
            <h2 className="mb-4 font-display text-lg font-bold">
              {isAr ? `💡 نصائح لتوفير المال في ${name}` : `💡 Money-Saving Tips for ${dest.nameEn}`}
            </h2>
            <ul className="space-y-2 text-sm text-white/70">
              {dest.activities.slice(0, 3).map((a) => (
                <li key={a.en} className="flex items-start gap-2">
                  <span className="mt-0.5">{a.icon}</span>
                  <span>
                    {isAr
                      ? `${a.ar} — من أبرز تجارب ${name} بتكلفة معقولة`
                      : `${a.en} — one of ${dest.nameEn}'s top experiences at reasonable cost`}
                  </span>
                </li>
              ))}
              <li className="flex items-start gap-2">
                <span>🏨</span>
                <span>
                  {isAr
                    ? `احجز فندقك مسبقاً للحصول على أفضل الأسعار في ${name}`
                    : `Book your hotel early to get the best rates in ${dest.nameEn}`}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span>✈️</span>
                <span>
                  {isAr
                    ? "استخدم GoTripza للمقارنة بين شركات الطيران وتوفير الرحلة"
                    : "Use GoTripza to compare airlines and save on your flight"}
                </span>
              </li>
            </ul>
          </section>

          {/* CTA */}
          <section className="mt-6 flex flex-wrap gap-3">
            <a
              href={flightUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-primary to-brand-deep px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02]"
            >
              {isAr ? `ابحث عن أرخص طيران إلى ${name}` : `Find cheapest flights to ${dest.nameEn}`}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <a
              href={hotelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-brand-mint/30 bg-brand-mint/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-mint/20"
            >
              {isAr ? `فنادق ${name}` : `Hotels in ${dest.nameEn}`}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </section>

          {/* Ask Raya CTA */}
          <div className="mt-10 rounded-3xl bg-gradient-to-br from-violet-600/20 to-blue-600/20 border border-violet-500/30 p-8 text-center">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="text-xl font-bold text-white mb-2">
              {isAr ? `ريا تخطط رحلتك ضمن ميزانيتك` : `Raya will plan your trip within your budget`}
            </h3>
            <p className="text-white/60 mb-5 text-sm">
              {isAr ? "أخبري ريا بميزانيتك وهي تساعدك في الطيران ومناطق السكن المناسبة" : "Tell Rya your budget and she will help with flights and the right stay areas"}
            </p>
            <a
              href={`/${locale}/search?q=${encodeURIComponent(isAr ? `رحلة لـ${dest.nameAr} ميزانية ${bp.budgetUsd} دولار ${bp.durationDays} أيام` : `trip to ${dest.nameEn} budget $${bp.budgetUsd} ${bp.durationDays} days`)}`}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-8 py-3 text-sm font-bold text-white shadow-lg hover:opacity-90 transition-opacity"
            >
              {isAr ? "خططي رحلتي مع ريا" : "Plan My Trip with Raya"}
            </a>
          </div>

          <InternalLinks
            title={isAr ? "روابط مفيدة" : "Helpful Links"}
            links={internalLinks}
            locale={locale}
          />
        </div>
      </main>
    </>
  );
}
