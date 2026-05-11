import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { TravelServiceLanding } from "@/components/TravelServiceLanding";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const isAr = params.locale === "ar";
  const title = isAr ? "أنشطة وتجارب السفر مع ريا | GoTripza" : "Travel Activities with Rya | GoTripza";
  const description = isAr
    ? "ريا تساعدك تختار أنشطة وتجارب تناسب وقتك وميزانيتك وطبيعة الرحلة بدون إغراقك بروابط كثيرة."
    : "Rya helps you choose activities that fit your time, budget, and travel style without flooding you with links.";
  const url = `${BASE}/${params.locale}/travel-activities`;
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: { ar: `${BASE}/ar/travel-activities`, en: `${BASE}/en/travel-activities`, "x-default": `${BASE}/en/travel-activities` },
    },
    openGraph: { title, description, url, type: "website", siteName: "GoTripza" },
  };
}

export default async function TravelActivitiesPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);

  return (
    <>
      <Navbar dict={dict} locale={locale} />
      <TravelServiceLanding
        locale={locale}
        eyebrowAr="أنشطة وتجارب"
        eyebrowEn="Activities & Experiences"
        titleAr="ريا تقترح التجربة المناسبة، لا قائمة عشوائية."
        titleEn="Rya suggests the right experience, not a random list."
        bodyAr="بدل عشرات الخيارات، ريا تسأل عن نوع رحلتك: عائلة، شهر عسل، اقتصادي، ثقافي، أو مغامرة، ثم تقترح أنشطة منطقية في الوقت المناسب."
        bodyEn="Instead of dozens of options, Rya understands your trip style: family, honeymoon, budget, culture, or adventure, then suggests sensible activities at the right moment."
        benefits={[
          { ar: "اقتراحات حسب مدة الرحلة واهتمامات المسافر.", en: "Suggestions based on trip length and traveler interests." },
          { ar: "تنبيه عندما يجب الحجز مسبقاً لتجنب الطوابير أو نفاد التذاكر.", en: "A heads-up when advance booking helps avoid queues or sold-out tickets." },
          { ar: "روابط تظهر بعد فهم السياق، وليس في أول رسالة.", en: "Links appear after context is clear, not in the first message." },
        ]}
      />
      <Footer dict={dict} locale={locale} />
    </>
  );
}
