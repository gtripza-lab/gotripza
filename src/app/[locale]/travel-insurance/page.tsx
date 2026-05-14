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
  const title = isAr ? "تأمين السفر مع ريا | GoTripza" : "Travel Insurance with Rya | GoTripza";
  const description = isAr
    ? "ريا تساعدك تعرف متى تحتاج تأمين سفر، وما الذي تنتبه له قبل شراء التغطية."
    : "Rya helps you understand when travel insurance matters and what to check before buying coverage.";
  const url = `${BASE}/${params.locale}/travel-insurance`;
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: { ar: `${BASE}/ar/travel-insurance`, en: `${BASE}/en/travel-insurance`, "x-default": `${BASE}/en/travel-insurance` },
    },
    openGraph: { title, description, url, type: "website", siteName: "GoTripza" },
  };
}

export default async function TravelInsurancePage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);

  return (
    <>
      <Navbar dict={dict} locale={locale} />
      <TravelServiceLanding
        locale={locale}
        eyebrowAr="تأمين السفر"
        eyebrowEn="Travel Insurance"
        titleAr="ريا تساعدك تختار التأمين عندما يكون مفيداً فعلاً."
        titleEn="Rya helps you choose insurance when it actually helps."
        bodyAr="ليست كل رحلة تحتاج نفس التغطية. ريا تفهم الوجهة، مدة السفر، نوع المسافرين، والمتطلبات مثل الفيزا، ثم تقترح عليك ما يجب الانتباه له بهدوء."
        bodyEn="Not every trip needs the same coverage. Rya understands destination, duration, traveler type, and visa needs, then explains what to watch for calmly."
        benefits={[
          { ar: "متى يكون التأمين ضرورياً: فيزا، عائلة، رحلات طويلة، أو وجهات بعيدة.", en: "Know when insurance is essential: visas, families, long trips, or distant destinations." },
          { ar: "أسئلة عملية قبل الشراء: التغطية الطبية، التأخير، الأمتعة، والإلغاء.", en: "Practical checks before buying: medical cover, delays, baggage, and cancellation." },
          { ar: "توصية هادئة داخل المحادثة عندما تصبح تواريخ الرحلة واضحة.", en: "A calm recommendation inside the conversation when trip dates are clear." },
        ]}
      />
      <Footer dict={dict} locale={locale} />
    </>
  );
}
