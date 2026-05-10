import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { TripPlanner } from "@/components/TripPlanner";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const isAr = params.locale === "ar";
  const title = isAr
    ? "خطط رحلتي — محرك تخطيط السفر الذكي من GoTripza"
    : "Trip Planner — GoTripza AI Travel Planning Engine";
  const description = isAr
    ? "ابن خطة سفر يومية مع تقدير الميزانية ونصائح السكن والطيران والتأشيرة، ثم احفظها أو اطبعها PDF."
    : "Build a daily trip plan with budget estimates, stay advice, flight guidance, visa notes, then save or print as PDF.";

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE}/${params.locale}/plan`,
      languages: {
        ar: `${BASE}/ar/plan`,
        en: `${BASE}/en/plan`,
        "x-default": `${BASE}/en/plan`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${BASE}/${params.locale}/plan`,
      siteName: "GoTripza",
      type: "website",
      locale: isAr ? "ar_SA" : "en_US",
    },
  };
}

export default async function PlanPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);

  return (
    <>
      <Navbar dict={dict} locale={locale} />
      <main className="min-h-screen bg-ink-950 pb-24" dir={locale === "ar" ? "rtl" : "ltr"}>
        <TripPlanner locale={locale} />
      </main>
      <Footer dict={dict} locale={locale} />
    </>
  );
}
