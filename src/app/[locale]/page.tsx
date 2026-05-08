import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { SearchResults } from "@/components/SearchResults";
import { StatsBar } from "@/components/StatsBar";
import { BrandStory } from "@/components/BrandStory";
import { DestinationsGrid } from "@/components/DestinationsGrid";
import { Footer } from "@/components/Footer";
import { SearchProvider } from "@/components/search/SearchContext";
import { FaqJsonLd } from "@/components/JsonLd";
import { detectGeo } from "@/lib/geo";

// Below-fold client components — deferred to reduce initial JS parse time
const MobileMockups = dynamic(
  () => import("@/components/MobileMockups").then((m) => m.MobileMockups),
  { ssr: false, loading: () => <div className="h-64" /> },
);
const ValuesGrid = dynamic(
  () => import("@/components/ValuesGrid").then((m) => m.ValuesGrid),
  { ssr: false, loading: () => <div className="h-40" /> },
);
const OurValues = dynamic(
  () => import("@/components/OurValues").then((m) => m.OurValues),
  { ssr: false, loading: () => <div className="h-40" /> },
);
const TrustSection = dynamic(
  () => import("@/components/TrustSection").then((m) => m.TrustSection),
  { ssr: false, loading: () => <div className="h-40" /> },
);
// SocialProof is a floating toast — never needs SSR
const SocialProof = dynamic(
  () => import("@/components/SocialProof").then((m) => m.SocialProof),
  { ssr: false },
);

const BASE = "https://gotripza.com";

const FAQ_AR = [
  {
    q: "ما هو GoTripza؟",
    a: "GoTripza هو أول مساعد سفر ذكاء اصطناعي مجاني في العالم. مساعدتك الذكية ريا تساعدك في البحث عن أرخص تذاكر الطيران وأفضل الفنادق وتخطيط رحلتك كاملاً.",
  },
  {
    q: "كيف أبحث عن أرخص رحلات الطيران؟",
    a: "اكتب وجهتك وتواريخك في مربع البحث واضغط على ابدأ مع ريا. ريا تقارن أسعار أكثر من 180 شركة طيران في الوقت الفعلي وتعطيك أفضل الخيارات بالسعر والوقت.",
  },
  {
    q: "هل GoTripza مجاني تماماً؟",
    a: "نعم، GoTripza مجاني بالكامل. لا رسوم خفية، لا عمولات، لا اشتراكات. نكسب عمولة من شركاء السفر عند إكمال الحجز معهم مباشرة.",
  },
  {
    q: "ما هي الفنادق والمدن التي يغطيها GoTripza؟",
    a: "يغطي GoTripza أكثر من 50 وجهة سياحية حول العالم بما فيها دبي ومكة المكرمة ولندن وباريس وطوكيو وغيرها، مع آلاف الفنادق في كل مدينة.",
  },
  {
    q: "كيف أحجز فندقاً عبر GoTripza؟",
    a: "اطلب من ريا خيارات الفنادق في وجهتك وستعرض لك أفضل الأسعار. عند اختيارك، ستنقلك إلى موقع الشريك لإتمام الحجز مباشرة.",
  },
];

const FAQ_EN = [
  {
    q: "What is GoTripza?",
    a: "GoTripza is the world's first free AI travel advisor. Raya, your AI assistant, helps you find the cheapest flights, best hotels, and plan your entire trip in seconds.",
  },
  {
    q: "How do I find the cheapest flights?",
    a: "Type your destination and dates in the search bar and tap 'Start with Raya'. Raya compares prices across 180+ airlines in real time and shows you the best options by price and travel time.",
  },
  {
    q: "Is GoTripza completely free?",
    a: "Yes, GoTripza is 100% free — no hidden fees, no commissions charged to you, no subscriptions. We earn a referral fee from travel partners when you complete a booking with them.",
  },
  {
    q: "Which cities and hotels does GoTripza cover?",
    a: "GoTripza covers 50+ top destinations worldwide including Dubai, Mecca, London, Paris, Tokyo, and more, with thousands of hotels in each city.",
  },
  {
    q: "How do I book a hotel through GoTripza?",
    a: "Ask Raya for hotel options at your destination and she'll present the best prices. When you choose one, she directs you to the partner site to complete your booking directly.",
  },
];

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
        "x-default": `${BASE}/en`,
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
  const faqItems = isAr ? FAQ_AR : FAQ_EN;

  return (
    <SearchProvider initialLocale={locale as Locale} initialCurrency={currency}>
      {/* FAQPage schema — enables Google rich results */}
      <FaqJsonLd items={faqItems} />

      <Navbar dict={dict} locale={locale as Locale} />
      <main>
        <Hero dict={dict} />
        <SearchResults dict={dict} />
        <StatsBar dict={dict} />
        <BrandStory dict={dict} locale={locale} />

        {/* Below-fold sections — deferred for faster initial load */}
        <MobileMockups dict={dict} />
        <ValuesGrid dict={dict} isAr={isAr} />
        <OurValues dict={dict} isAr={isAr} />
        <Suspense fallback={<div className="h-96" />}>
          <DestinationsGrid dict={dict} />
        </Suspense>
        <TrustSection dict={dict} locale={locale as Locale} />
      </main>
      <SocialProof locale={locale as Locale} />
      <Footer dict={dict} locale={locale as Locale} />
    </SearchProvider>
  );
}
