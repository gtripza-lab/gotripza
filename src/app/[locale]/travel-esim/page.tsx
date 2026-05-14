import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { TravelServiceLanding } from "@/components/TravelServiceLanding";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;
  const isAr = params.locale === "ar";
  const title = isAr ? "شرائح eSIM للسفر مع ريا | GoTripza" : "Travel eSIM Help with Rya | GoTripza";
  const description = isAr
    ? "ريا تساعدك تختار شريحة إلكترونية مناسبة قبل السفر حتى تصل متصلاً بدون رسوم تجوال."
    : "Rya helps you choose a practical travel eSIM before you fly so you land connected without roaming surprises.";
  const url = `${BASE}/${params.locale}/travel-esim`;
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: { ar: `${BASE}/ar/travel-esim`, en: `${BASE}/en/travel-esim`, "x-default": `${BASE}/en/travel-esim` },
    },
    openGraph: { title, description, url, type: "website", siteName: "GoTripza" },
  };
}

export default async function TravelEsimPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);

  return (
    <>
      <Navbar dict={dict} locale={locale} />
      <TravelServiceLanding
        locale={locale}
        eyebrowAr="شريحة إلكترونية"
        eyebrowEn="Travel eSIM"
        titleAr="ريا تذكّرك بالإنترنت قبل أن تصل."
        titleEn="Rya reminds you about data before you land."
        bodyAr="الشريحة الإلكترونية ليست إعلاناً داخل الرحلة. هي احتياج عملي عند الوصول. ريا تقترحها فقط عندما تفهم وجهتك ومدة السفر وطريقة استخدامك للإنترنت."
        bodyEn="An eSIM is not a travel ad. It is a practical arrival need. Rya suggests it only when destination, duration, and data needs make sense."
        benefits={[
          { ar: "تجنب رسوم التجوال والبحث عن شريحة محلية بعد الوصول.", en: "Avoid roaming charges and hunting for a local SIM after arrival." },
          { ar: "مناسبة للمطارات، الخرائط، الترجمة، وطلب المواصلات.", en: "Useful for airports, maps, translation, and ride-hailing." },
          { ar: "تظهر داخل ريا كخطوة تحضيرية عند وضوح الوجهة.", en: "Appears in Rya as a preparation step when the destination is clear." },
        ]}
      />
      <Footer dict={dict} locale={locale} />
    </>
  );
}
