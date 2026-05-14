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
    ? "تنبيهات أمان السفر مع ريا | GoTripza"
    : "Travel Safety Guidance with Rya | GoTripza";
  const description = isAr
    ? "ريا تساعدك تفهم تنبيهات الأمان، الاحتيال السياحي، المواصلات، والمواقف اليومية أثناء السفر بنصائح هادئة وعملية."
    : "Rya helps you understand travel safety, tourist scams, transport risks, and everyday situations with calm practical guidance.";
  const url = `${BASE}/${params.locale}/travel-safety`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        ar: `${BASE}/ar/travel-safety`,
        en: `${BASE}/en/travel-safety`,
        "x-default": `${BASE}/en/travel-safety`,
      },
    },
    openGraph: { title, description, url, type: "website", siteName: "GoTripza" },
  };
}

const GUIDES = [
  {
    ar: "تنبيهات عملية قبل الوصول: مناطق يجب الانتباه لها، أوقات التنقل، وطريقة التعامل مع سيارات الأجرة.",
    en: "Practical pre-arrival alerts: areas to watch, transport timing, and taxi guidance.",
  },
  {
    ar: "شرح الاحتيال السياحي الشائع بدون تهويل، مع خطوات بسيطة لتجنبه.",
    en: "Common travel scams explained calmly, with simple ways to avoid them.",
  },
  {
    ar: "نصائح أثناء الرحلة عند حدوث موقف مربك في مطار، فندق، سوق، أو محطة.",
    en: "Help during confusing moments at an airport, hotel, market, or station.",
  },
];

export default async function TravelSafetyPage(props: { params: Promise<{ locale: string }> }) {
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
            {isAr ? "أمان السفر" : "Travel Safety"}
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight sm:text-6xl">
            {isAr ? "ريا تساعدك تسافر بثقة وهدوء." : "Rya helps you travel with calm confidence."}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/62">
            {isAr
              ? "بدل التخويف أو النصائح العامة، ريا تعطيك تنبيهات مفيدة حسب وجهتك وسياق رحلتك: ماذا تنتبه له، وماذا تفعل الآن."
              : "Instead of fear or generic tips, Rya gives useful alerts based on your destination and trip context: what to watch for and what to do next."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/${locale}/search`} className="btn-primary !rounded-xl !px-5">
              {isAr ? "اسأل ريا عن الأمان" : "Ask Rya about safety"}
            </Link>
            <Link
              href={`/${locale}/services`}
              className="inline-flex h-11 items-center rounded-xl border border-white/10 bg-white/[0.05] px-5 text-sm font-semibold text-white/80 hover:bg-white/[0.09]"
            >
              {isAr ? "خدمات السفر" : "Travel services"}
            </Link>
          </div>
        </section>

        <section className="border-y border-white/[0.06] bg-white/[0.025]">
          <div className="mx-auto grid max-w-6xl gap-3 px-6 py-14 md:grid-cols-3">
            {GUIDES.map((item, index) => (
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
