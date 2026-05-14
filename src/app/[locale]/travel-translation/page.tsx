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
    ? "مساعدة ترجمة السفر مع ريا | GoTripza"
    : "Travel Translation Help with Rya | GoTripza";
  const description = isAr
    ? "استخدم ريا لترجمة مواقف السفر اليومية: قوائم الطعام، اللافتات، التذاكر، المحادثات القصيرة، والأسئلة المهمة أثناء الرحلة."
    : "Use Rya for practical travel translation: menus, signs, tickets, short conversations, and important questions during your trip.";
  const url = `${BASE}/${params.locale}/travel-translation`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        ar: `${BASE}/ar/travel-translation`,
        en: `${BASE}/en/travel-translation`,
        "x-default": `${BASE}/en/travel-translation`,
      },
    },
    openGraph: { title, description, url, type: "website", siteName: "GoTripza" },
  };
}

const USE_CASES = [
  {
    ar: "ترجمة لافتة أو رسالة بطريقة مفهومة ثم شرح ما تعنيه للمسافر.",
    en: "Translate a sign or message clearly, then explain what it means for a traveler.",
  },
  {
    ar: "صياغة سؤال طبيعي للفندق، المطار، المطعم، أو السائق.",
    en: "Write a natural question for a hotel, airport, restaurant, or driver.",
  },
  {
    ar: "فهم قوائم الطعام، التذاكر، التنبيهات، والتعليمات القصيرة.",
    en: "Understand menus, tickets, alerts, and short instructions.",
  },
];

export default async function TravelTranslationPage(props: { params: Promise<{ locale: string }> }) {
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
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-mint/70">
            {isAr ? "ترجمة أثناء السفر" : "Travel Translation"}
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight sm:text-6xl">
            {isAr ? "ريا تساعدك تفهم الموقف، لا تترجم الكلمات فقط." : "Rya helps you understand the moment, not just the words."}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/62">
            {isAr
              ? "في السفر لا تكفي الترجمة الحرفية. ريا تساعدك تعرف ماذا تقول، متى تقوله، وما التصرف الأنسب في المطار، الفندق، المطعم، أو الشارع."
              : "Travel translation is not only literal words. Rya helps you know what to say, when to say it, and what to do at the airport, hotel, restaurant, or street."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/${locale}/search`} className="btn-primary !rounded-xl !px-5">
              {isAr ? "اسأل ريا الآن" : "Ask Rya now"}
            </Link>
            <Link
              href={`/${locale}/travel-companion`}
              className="inline-flex h-11 items-center rounded-xl border border-white/10 bg-white/[0.05] px-5 text-sm font-semibold text-white/80 hover:bg-white/[0.09]"
            >
              {isAr ? "تعرف على ريا" : "Meet Rya"}
            </Link>
          </div>
        </section>

        <section className="border-y border-white/[0.06] bg-white/[0.025]">
          <div className="mx-auto grid max-w-6xl gap-3 px-6 py-14 md:grid-cols-3">
            {USE_CASES.map((item, index) => (
              <div key={index} className="rounded-2xl border border-white/[0.07] bg-black/20 p-6">
                <span className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary/15 text-sm font-bold text-brand-mint">
                  {index + 1}
                </span>
                <p className="text-base leading-8 text-white/72">{isAr ? item.ar : item.en}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer dict={dict} locale={locale} />
    </>
  );
}
