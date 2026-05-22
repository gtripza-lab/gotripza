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
    ? "Rya by GoTripza — رفيقة السفر الذكية"
    : "Rya by GoTripza — AI Travel Companion";
  const description = isAr
    ? "تعرف على ريا: رفيقة سفر ذكية تساعدك قبل الرحلة وأثناءها في التخطيط، الترجمة، الميزانية، الأمان، وخدمات السفر المناسبة."
    : "Meet Rya, the AI travel companion that helps before and during your trip with planning, translation, budgeting, safety, and useful travel services.";
  const url = `${BASE}/${params.locale}/travel-companion`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        ar: `${BASE}/ar/travel-companion`,
        en: `${BASE}/en/travel-companion`,
        "x-default": `${BASE}/en/travel-companion`,
      },
    },
    openGraph: { title, description, url, type: "website", siteName: "Rya by GoTripza" },
  };
}

const FEATURES = [
  {
    ar: "تتذكر سياق رحلتك: الوجهة، الميزانية، نوع المسافرين، وما تفضله في السكن والتنقل.",
    en: "Remembers trip context: destination, budget, traveler type, and stay or transport preferences.",
  },
  {
    ar: "تسأل أسئلة قليلة وذكية، ثم تبني خطة مفهومة بدل أن تغرقك بروابط مبكرة.",
    en: "Asks fewer, smarter questions, then builds a clear plan instead of flooding you with links.",
  },
  {
    ar: "تساعدك في مواقف السفر اليومية: مطارات، ترجمة، ميزانية، أمان، واحتيال سياحي.",
    en: "Helps with real travel moments: airports, translation, budgeting, safety, and common scams.",
  },
  {
    ar: "ترشح الطيران والتأمين والشرائح والأنشطة والسيارات فقط عندما يصبح ذلك مناسباً للسياق.",
    en: "Recommends flights, insurance, eSIMs, activities, and cars only when the context is right.",
  },
];

export default async function TravelCompanionPage(props: { params: Promise<{ locale: string }> }) {
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
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-mint/70">
            {isAr ? "رفيقة السفر الذكية" : "AI Travel Companion"}
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight sm:text-6xl">
            {isAr ? "ريا مستشارة السفر التي ترافقك قبل الرحلة وأثناءها." : "Rya is not a travel chat. Rya travels with you."}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/60">
            {isAr
              ? "الفكرة بسيطة: أنت لا تحتاج عشرات الصفحات وقت التخطيط أو أثناء السفر. تحتاج جهة هادئة تفهم السؤال، تتذكر السياق، وتقترح الخطوة الصحيحة في الوقت الصحيح."
              : "The idea is simple: you do not need dozens of pages while planning or traveling. You need calm guidance that understands the question, remembers the context, and suggests the right next step at the right time."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/${locale}/search`} className="btn-primary !rounded-xl !px-5">
              {isAr ? "ابدأ محادثة مع ريا" : "Start talking to Rya"}
            </Link>
            <Link
              href={`/${locale}/plus`}
              className="inline-flex h-11 items-center rounded-xl border border-white/10 bg-white/[0.05] px-5 text-sm font-semibold text-white/80 hover:bg-white/[0.09]"
            >
              {isAr ? "تعرف على Rya Companion" : "Explore Rya Companion"}
            </Link>
          </div>
        </section>

        <section className="border-y border-white/[0.06] bg-white/[0.025]">
          <div className="mx-auto grid max-w-6xl gap-3 px-6 py-14 md:grid-cols-2">
            {FEATURES.map((feature, index) => (
              <div key={index} className="rounded-2xl border border-white/[0.07] bg-black/20 p-6">
                <span className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary/15 text-sm font-bold text-brand-mint">
                  {index + 1}
                </span>
                <p className="text-base leading-8 text-white/72">{isAr ? feature.ar : feature.en}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer dict={dict} locale={locale} />
    </>
  );
}
