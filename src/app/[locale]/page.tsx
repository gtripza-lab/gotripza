import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { StatsBar } from "@/components/StatsBar";
import { BrandStory } from "@/components/BrandStory";
import { DestinationsGrid } from "@/components/DestinationsGrid";
import { Footer } from "@/components/Footer";
import { RyaCompanionPromise } from "@/components/RyaCompanionPromise";
import { TravelerServicesSection } from "@/components/TravelerServicesSection";
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
    a: "GoTripza هو مساعد سفر ذكاء اصطناعي مجاني. مساعدتك الذكية ريا تساعدك في البحث عن أرخص تذاكر الطيران، اختيار منطقة السكن المناسبة، وتخطيط رحلتك كاملاً.",
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
    a: "يغطي GoTripza أكثر من 50 وجهة سياحية حول العالم بما فيها دبي ومكة المكرمة ولندن وباريس وطوكيو، مع أدلة سكن مؤقتة إلى أن يكتمل ربط عروض الفنادق المباشرة.",
  },
  {
    q: "ما الخدمات الأخرى غير الطيران؟",
    a: "GoTripza يرشح خدمات مكملة للرحلة مثل تأمين السفر، شرائح eSIM، الأنشطة والجولات، تأجير السيارات، وتعويض الرحلات المتأخرة.",
  },
  {
    q: "كيف أحجز فندقاً عبر GoTripza؟",
    a: "حالياً اطلب من ريا أفضل مناطق السكن في وجهتك ونصائح اختيار الفندق. عروض الفنادق المباشرة ستظهر بعد اكتمال ربط مزود الفنادق.",
  },
];

const FAQ_EN = [
  {
    q: "What is GoTripza?",
    a: "GoTripza is built around Rya, a travel companion that helps you plan, prepare, and choose useful trip services at the right moment.",
  },
  {
    q: "How do I find the cheapest flights?",
    a: "Start a conversation with Rya, share your destination and dates, and she will bring in flight options when you are ready to compare.",
  },
  {
    q: "Is GoTripza completely free?",
    a: "Yes, GoTripza is 100% free — no hidden fees, no commissions charged to you, no subscriptions. We earn a referral fee from travel partners when you complete a booking with them.",
  },
  {
    q: "Which cities and hotels does GoTripza cover?",
    a: "GoTripza covers 50+ top destinations worldwide including Dubai, Mecca, London, Paris, Tokyo, and more, with stay guides while direct hotel offers are being connected.",
  },
  {
    q: "What else does GoTripza help with besides flights?",
    a: "GoTripza recommends trip essentials such as travel insurance, eSIM data, activities and tours, car rental, and flight compensation.",
  },
  {
    q: "How do I book a hotel through GoTripza?",
    a: "For now, ask Rya for the best areas to stay and hotel-picking tips. Direct hotel offers will appear after the provider integration is complete.",
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
    ? "GoTripza — ريا رفيقة السفر الذكية"
    : "GoTripza — Rya AI Travel Companion";

  const description = isAr
    ? "تحدث مع ريا كرفيقة سفر تفهم رحلتك، تتذكر تفضيلاتك، وتساعدك في التخطيط والميزانية والترجمة والأمان وخدمات السفر عند الحاجة."
    : "Talk to Rya like a travel companion who understands your trip, remembers your preferences, and helps with planning, budgeting, translation, safety, and travel services when needed.";

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
        <RyaCompanionPromise locale={locale as Locale} />
        <StatsBar dict={dict} />
        <BrandStory dict={dict} locale={locale} />
        <TravelerServicesSection locale={locale as Locale} />

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
