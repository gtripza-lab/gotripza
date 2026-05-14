import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;
  const isAr = params.locale === "ar";
  const title = isAr
    ? "تخطيط سفر ذكي مع ريا | GoTripza"
    : "Smart Travel Planning with Rya | GoTripza";
  const description = isAr
    ? "خطط رحلتك مع ريا بطريقة محادثة طبيعية: ميزانية، أيام، وجهة، أمان، خدمات سفر، وخطة يومية قابلة للحفظ."
    : "Plan your trip with Rya through natural conversation: budget, days, destination, safety, travel services, and a saveable daily plan.";
  const url = `${BASE}/${params.locale}/smart-travel-planning`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        ar: `${BASE}/ar/smart-travel-planning`,
        en: `${BASE}/en/smart-travel-planning`,
        "x-default": `${BASE}/en/smart-travel-planning`,
      },
    },
    openGraph: { title, description, url, type: "website", siteName: "GoTripza" },
  };
}

const STEPS = [
  {
    titleAr: "تبدأ بالنية",
    titleEn: "Starts with intent",
    descAr: "هل أنت تستكشف؟ تخطط؟ جاهز للحجز؟ تحتاج دعم؟ ريا تفرق بين هذه الحالات.",
    descEn: "Are you browsing, planning, ready to book, or looking for support? Rya separates those moments.",
  },
  {
    titleAr: "تبني السياق",
    titleEn: "Builds context",
    descAr: "تجمع الوجهة والميزانية ونوع الرحلة والمخاوف وتفضيلات الفندق بدون نموذج طويل.",
    descEn: "Collects destination, budget, travel style, concerns, and stay preferences without a long form.",
  },
  {
    titleAr: "تقترح الرحلة",
    titleEn: "Suggests the trip",
    descAr: "تقدم جدولاً عملياً، تقدير تكلفة، مناطق مناسبة، وتنبيهات مهمة قبل السفر.",
    descEn: "Provides a practical itinerary, cost estimate, suitable areas, and important pre-trip warnings.",
  },
  {
    titleAr: "تضيف الخدمات برفق",
    titleEn: "Adds services gently",
    descAr: "عندما تصبح جاهزاً، تظهر روابط الطيران والتأمين والشرائح والأنشطة ضمن المحادثة.",
    descEn: "When you are ready, flights, insurance, eSIMs, and activities appear inside the conversation.",
  },
];

export default async function SmartTravelPlanningPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);
  const isAr = locale === "ar";

  return (
    <>
      <Navbar dict={dict} locale={locale} />
      <main className="min-h-screen bg-ink-950 text-white" dir={isAr ? "rtl" : "ltr"}>
        <section className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-primary/70">
            {isAr ? "تخطيط سفر ذكي" : "Smart Travel Planning"}
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight sm:text-6xl">
            {isAr ? "خطة سفر تبدأ من محادثة واحدة" : "A trip plan that starts with one conversation"}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/60">
            {isAr
              ? "ريا لا تطلب منك تعبئة كل شيء دفعة واحدة. تبدأ من كلامك، تفهم المرحلة التي أنت فيها، ثم تحول الفكرة إلى خطة سفر واضحة وقابلة للتنفيذ."
              : "Rya does not ask you to fill everything at once. She starts from your words, understands the stage you are in, and turns the idea into a clear, usable travel plan."}
          </p>
          <Link href={`/${locale}/search`} className="btn-primary mt-8 inline-flex !rounded-xl !px-5">
            {isAr ? "خطط رحلتي مع ريا" : "Plan my trip with Rya"}
          </Link>
        </section>

        <section className="border-t border-white/[0.06]">
          <div className="mx-auto grid max-w-6xl gap-4 px-6 py-14 md:grid-cols-4">
            {STEPS.map((step, index) => (
              <div key={step.titleEn} className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-5">
                <span className="text-xs font-semibold text-brand-mint">0{index + 1}</span>
                <h2 className="mt-4 font-display text-xl font-bold">{isAr ? step.titleAr : step.titleEn}</h2>
                <p className="mt-3 text-sm leading-7 text-white/55">{isAr ? step.descAr : step.descEn}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer dict={dict} locale={locale} />
    </>
  );
}
