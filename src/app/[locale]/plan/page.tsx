import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { TripPlanner } from "@/components/TripPlanner";
import { contentLocale, isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { READY_TRIP_PLANS } from "@/lib/ready-trip-plans";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;
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

export default async function PlanPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const copyLocale = contentLocale(locale);
  const dict = await getDictionary(locale);

  return (
    <>
      <Navbar dict={dict} locale={locale} />
      <main className="min-h-screen bg-ink-950 pb-24" dir={locale === "ar" ? "rtl" : "ltr"}>
        <TripPlanner locale={locale} />
        <section className="mx-auto max-w-7xl px-4 pb-12">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5">
            <h2 className="font-display text-xl font-semibold text-white">
              {locale === "ar" ? "خطط جاهزة للتعديل" : "Ready plans to customize"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/45">
              {locale === "ar"
                ? "ابدأ من خطة جاهزة ثم عدلها مع ريا حسب تاريخك وميزانيتك."
                : "Start from a ready itinerary, then tune it with Rya for your dates and budget."}
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {READY_TRIP_PLANS.map((page) => (
                <Link
                  key={page.slug}
                  href={`/${locale}/trip-plans/${page.slug}`}
                  className="rounded-xl border border-white/[0.07] bg-black/20 p-4 transition hover:border-brand-primary/35 hover:bg-brand-primary/[0.08]"
                >
                  <p className="text-sm font-semibold text-white/85">{page.title[copyLocale]}</p>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/45">{page.description[copyLocale]}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer dict={dict} locale={locale} />
    </>
  );
}
