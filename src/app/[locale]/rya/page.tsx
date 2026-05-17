/**
 * /[locale]/rya - Dedicated Google Ads Landing Page
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { isLocale, type Locale } from "@/i18n/config";
import { RyaAdsAuthTrigger } from "@/components/RyaAdsAuthTrigger";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";

export async function generateMetadata(
  props: { params: Promise<{ locale: string }> }
): Promise<Metadata> {
  const params = await props.params;
  const isAr = params.locale === "ar";
  const title = isAr ? "ريا — رفيقة سفرك الذكية | جربها مجاناً" : "Rya — Your AI Travel Companion | Try Free";
  const description = isAr
    ? "ريا تخطط رحلتك، تساعدك في المطار، وتكون معك أثناء السفر. مجاني 100%."
    : "Rya plans your trip, guides you at the airport, and stays with you during travel. 100% free.";
  return {
    title, description,
    robots: { index: false, follow: false },
    openGraph: { title, description, url: `${BASE}/${params.locale}/rya`, type: "website" },
  };
}

export default async function RyaAdsLandingPage(
  props: { params: Promise<{ locale: string }> }
) {
  const params = await props.params;
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const isAr = locale === "ar";
  return (
    <div className="min-h-screen bg-[#060A13] text-white" dir={isAr ? "rtl" : "ltr"}>
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#060A13]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
          <Link href={`/${locale}`}>
            <span className="text-lg font-black text-white">Rya <span className="text-[#00D4B3]">by GoTripza</span></span>
          </Link>
          <RyaAdsAuthTrigger locale={locale} variant="header" />
        </div>
      </header>
      <main>
        <section className="px-5 pb-20 pt-16 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#00D4B3]/20 bg-[#00D4B3]/10 px-4 py-1.5 text-xs font-semibold text-[#00D4B3]">
              {isAr ? "مجاني 100٪ — لا بطاقة ائتمان" : "100% Free — No Credit Card"}
            </div>
            <h1 className="text-4xl font-black text-white sm:text-6xl">
              {isAr
                ? <><span>رفيقة سفرك الذكية</span><br /><span className="text-[#00D4B3]">قبل الرحلة وأثناءها</span></>
                : <><span>Travel smarter</span><br /><span className="text-[#00D4B3]">with Rya</span></>}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-white/60 sm:text-lg">
              {isAr
                ? "ريا تخطط رحلتك، تساعدك في المطار، وتبقى معك أثناء السفر."
                : "Rya plans your trip, guides you at the airport, and stays with you during travel."}
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <RyaAdsAuthTrigger locale={locale} variant="primary" />
              <Link
                href={`/${locale}/search`}
                className="rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white/80 hover:bg-white/10"
              >
                {isAr ? "جرب ريا بدون تسجيل ←" : "Try Rya without signing up →"}
              </Link>
            </div>
            <p className="mt-3 text-xs text-white/30">
              {isAr ? "لا بطاقة ائتمان • مجاني دائماً" : "No credit card • Always free"}
            </p>
          </div>
        </section>
      </main>
      <footer className="border-t border-white/[0.06] px-5 py-6 text-center text-xs text-white/25">
        © 2026 GoTripza ·{" "}
        <Link href={`/${locale}/privacy`}>{isAr ? "الخصوصية" : "Privacy"}</Link>
        {" "}·{" "}
        <Link href={`/${locale}/terms`}>{isAr ? "الشروط" : "Terms"}</Link>
      </footer>
    </div>
  );
}
