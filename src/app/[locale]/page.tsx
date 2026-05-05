import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { BrandStory } from "@/components/BrandStory";
import { MobileMockups } from "@/components/MobileMockups";
import { ValuesGrid } from "@/components/ValuesGrid";
import { OurValues } from "@/components/OurValues";
import { DestinationsGrid } from "@/components/DestinationsGrid";
import { Footer } from "@/components/Footer";
import { SearchProvider } from "@/components/search/SearchContext";
import { SearchResults } from "@/components/SearchResults";
import { SocialProof } from "@/components/SocialProof";
import { StatsBar } from "@/components/StatsBar";
import { TrustSection } from "@/components/TrustSection";
import { detectGeo } from "@/lib/geo";

const BASE = "https://gotripza.com";

export function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Metadata {
  const locale = params.locale;
  const isAr = locale === "ar";

  const title = isAr
    ? "GoTripza — أول مساعد سفر ذكي مجاني في العالم | رحلات وفنادق"
    : "GoTripza — The World's First Free AI Travel Advisor | Flights & Hotels";

  const description = isAr
    ? "ريا مستشارتك الذكية للسفر. احصل على أسعار الطيران والفنادق وتوصيات مخصصة لوجهتك مجاناً. أكثر من 180 شركة طيران وآلاف الفنادق."
    : "Raya is your personal AI travel advisor. Get flight & hotel prices plus personalised recommendations for your trip — completely free. 180+ airlines, thousands of hotels.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE}/${locale}`,
      siteName: "GoTripza",
      type: "website",
      locale: isAr ? "ar_SA" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `${BASE}/${locale}`,
      languages: {
        ar: `${BASE}/ar`,
        en: `${BASE}/en`,
        "x-default": `${BASE}/ar`,
      },
    },
  };
}

export default async function LandingPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale as Locale);
  const { currency } = detectGeo();
  const isAr = locale === "ar";

  return (
    <SearchProvider initialLocale={locale as Locale} initialCurrency={currency}>
      <Navbar dict={dict} locale={locale as Locale} />
      <main>
        <Hero dict={dict} />
        <SearchResults dict={dict} />
        <StatsBar dict={dict} />
        <BrandStory dict={dict} />
        <MobileMockups dict={dict} />
        <ValuesGrid dict={dict} isAr={isAr} />
        <OurValues dict={dict} isAr={isAr} />
        <DestinationsGrid dict={dict} />
        <TrustSection dict={dict} locale={locale as Locale} />
      </main>
      <SocialProof locale={locale as Locale} />
      <Footer dict={dict} locale={locale as Locale} />
    </SearchProvider>
  );
}
