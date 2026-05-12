import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPinned, MessageCircle, Route, Sparkles, WalletCards } from "lucide-react";
import { isLocale, type Locale } from "@/i18n/config";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/JsonLd";
import { SeoBreadcrumb } from "@/components/seo/InternalLinks";
import { buildTripPlan } from "@/lib/trip-planner";
import {
  getReadyTripPlan,
  READY_TRIP_PLANS,
  readyTripPlanInput,
} from "@/lib/ready-trip-plans";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";

type Props = { params: { locale: string; slug: string } };

export async function generateStaticParams() {
  return READY_TRIP_PLANS.flatMap((page) => [
    { locale: "ar", slug: page.slug },
    { locale: "en", slug: page.slug },
  ]);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const page = getReadyTripPlan(params.slug);
  if (!page) return {};
  const locale = params.locale as Locale;
  const isAr = locale === "ar";
  const title = `${page.title[locale]} | GoTripza`;
  const description = page.description[locale];

  return {
    title,
    description,
    keywords: isAr
      ? `خطة سفر ${page.destination.ar}, ${page.days} أيام في ${page.destination.ar}, ريا, مساعد سفر ذكي`
      : `${page.destination.en} itinerary, ${page.days} days in ${page.destination.en}, Rya travel companion, AI trip planner`,
    alternates: {
      canonical: `${BASE}/${locale}/trip-plans/${page.slug}`,
      languages: {
        en: `${BASE}/en/trip-plans/${page.slug}`,
        ar: `${BASE}/ar/trip-plans/${page.slug}`,
        "x-default": `${BASE}/en/trip-plans/${page.slug}`,
      },
    },
    openGraph: {
      type: "article",
      title,
      description,
      siteName: "GoTripza",
    },
  };
}

export default function ReadyTripPlanPage({ params }: Props) {
  if (!isLocale(params.locale)) notFound();
  const page = getReadyTripPlan(params.slug);
  if (!page) notFound();
  const locale = params.locale as Locale;
  const isAr = locale === "ar";
  const plan = buildTripPlan(readyTripPlanInput(page, locale));
  const title = page.title[locale];
  const description = page.description[locale];
  const faq = [
    {
      q: isAr ? `هل هذه خطة نهائية لـ ${plan.destinationName}؟` : `Is this a final ${plan.destinationName} plan?`,
      a: isAr
        ? "هي بداية عملية ومحددة. الأفضل أن تعدلها مع ريا حسب تاريخ السفر، الطقس، ومن يسافر معك."
        : "It is a practical starting plan. Tune it with Rya by travel dates, weather, and companions.",
    },
    {
      q: isAr ? "هل الفنادق مربوطة مباشرة؟" : "Are hotels directly connected?",
      a: isAr
        ? "حالياً تعرض الخطة مناطق السكن المناسبة بوضوح إلى أن يكتمل ربط عروض الفنادق."
        : "For now, the plan gives clear stay-area guidance until direct hotel offers are connected.",
    },
    {
      q: isAr ? "هل أستطيع تغيير الأيام؟" : "Can I change the days?",
      a: isAr
        ? "نعم. افتح محرك خطط رحلتي أو تحدث مع ريا واطلب تعديل عدد الأيام أو الميزانية أو أسلوب الرحلة."
        : "Yes. Open the trip planner or ask Rya to adjust days, budget, or travel style.",
    },
  ];
  const breadcrumbs = [
    { name: isAr ? "الرئيسية" : "Home", url: `${BASE}/${locale}` },
    { name: isAr ? "خطط رحلات جاهزة" : "Ready trip plans", url: `${BASE}/${locale}/trip-plans/${page.slug}` },
    { name: title, url: `${BASE}/${locale}/trip-plans/${page.slug}` },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <FaqJsonLd items={faq} />
      <main className="min-h-screen bg-ink-950 pb-20 text-white" dir={isAr ? "rtl" : "ltr"}>
        <section className="mx-auto max-w-5xl px-5 py-12">
          <SeoBreadcrumb
            locale={locale}
            items={[
              { label: isAr ? "الرئيسية" : "Home", href: `/${locale}` },
              { label: isAr ? "خطط رحلات جاهزة" : "Ready trip plans" },
            ]}
          />

          <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-brand-primary/25 bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {isAr ? "خطة جاهزة قابلة للتعديل مع ريا" : "Ready plan, tunable with Rya"}
          </div>
          <h1 className="mt-5 max-w-3xl font-display text-3xl font-bold leading-tight md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65 md:text-base">
            {description}
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <Metric icon={<CalendarDays className="h-4 w-4" />} label={isAr ? "الأيام" : "Days"} value={`${plan.days}`} />
            <Metric icon={<MapPinned className="h-4 w-4" />} label={isAr ? "الوجهة" : "Destination"} value={plan.destinationName} />
            <Metric icon={<WalletCards className="h-4 w-4" />} label={isAr ? "الميزانية" : "Budget"} value={`${plan.budget.toLocaleString()} ${plan.currency}`} />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/${locale}/search?q=${encodeURIComponent(isAr ? `عدلي لي خطة ${plan.destinationName} ${plan.days} أيام حسب ميزانيتي` : `Tune my ${plan.destinationName} ${plan.days}-day plan for my budget`)}`}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink-950 transition hover:bg-white/90"
            >
              <MessageCircle className="h-4 w-4" />
              {isAr ? "عدّلها مع ريا" : "Tune with Rya"}
            </Link>
            <Link
              href={`/${locale}/plan`}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/[0.06]"
            >
              <Route className="h-4 w-4" />
              {isAr ? "افتح محرك الخطط" : "Open planner"}
            </Link>
          </div>

          <section className="mt-10 grid gap-4 md:grid-cols-2">
            <Info title={isAr ? "مناطق السكن" : "Stay areas"} items={plan.bestStayAreas.length ? plan.bestStayAreas : [plan.stayAdvice]} />
            <Info title={isAr ? "نصائح مهمة" : "Important notes"} items={[plan.localTransportAdvice, plan.weatherAdvice, plan.hotelDisclosure]} />
          </section>

          <section className="mt-10">
            <h2 className="font-display text-2xl font-semibold">
              {isAr ? "الجدول اليومي" : "Daily itinerary"}
            </h2>
            <div className="mt-5 space-y-4">
              {plan.daysPlan.map((day) => (
                <article key={day.day} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{day.title}</h3>
                      <p className="mt-1 text-sm text-white/42">{day.area} · {day.focus}</p>
                    </div>
                    <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-white/55">
                      {day.estimatedCost.toLocaleString()} {plan.currency}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                    <Step label={isAr ? "الصباح" : "Morning"} value={day.morning} />
                    <Step label={isAr ? "العصر" : "Afternoon"} value={day.afternoon} />
                    <Step label={isAr ? "المساء" : "Evening"} value={day.evening} />
                  </div>
                  <p className="mt-4 rounded-xl bg-brand-primary/[0.08] px-3 py-2 text-sm leading-6 text-white/58">
                    {day.tip}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-10 grid gap-4 md:grid-cols-2">
            <Info title={isAr ? "خدمات قد تفيدك" : "Useful services"} items={plan.serviceAdvice} />
            <Info title={isAr ? "أسئلة شائعة" : "FAQ"} items={faq.map((item) => `${item.q} — ${item.a}`)} />
          </section>
        </section>
      </main>
    </>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center gap-2 text-brand-primary">{icon}<span className="text-xs font-medium">{label}</span></div>
      <p className="mt-2 font-semibold text-white">{value}</p>
    </div>
  );
}

function Step({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-brand-primary">{label}</p>
      <p className="mt-1 leading-6 text-white/60">{value}</p>
    </div>
  );
}

function Info({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="text-sm leading-7 text-white/62">{item}</li>
        ))}
      </ul>
    </div>
  );
}
