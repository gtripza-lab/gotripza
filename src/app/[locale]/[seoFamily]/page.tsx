import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Sparkles } from "lucide-react";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { DESTINATIONS } from "@/lib/seo-destinations";
import {
  guideDescription,
  guideFamilyTitle,
  guideTitle,
  isSeoGuideFamily,
} from "@/lib/global-travel-guides";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";

type Props = { params: Promise<{ locale: string; seoFamily: string }> };

const seoFamilies = [
  "family-travel",
  "honeymoon",
  "solo-travel",
  "luxury-travel",
  "budget-travel",
  "digital-nomad",
  "hidden-destinations",
  "seasonal-travel",
  "travel-safety",
  "transportation",
  "esim",
  "travel-insurance",
  "travel-scams",
] as const;

export function generateStaticParams() {
  return locales.flatMap((locale) => seoFamilies.map((seoFamily) => ({ locale, seoFamily })));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  if (!isLocale(params.locale) || !isSeoGuideFamily(params.seoFamily)) return {};
  const title = `${guideFamilyTitle(params.seoFamily)} Guides by Destination`;
  return {
    title,
    description: `Explore ${guideFamilyTitle(params.seoFamily).toLowerCase()} guides by destination with Rya by GoTripza.`,
    alternates: {
      canonical: `${BASE}/${params.locale}/${params.seoFamily}`,
      languages: Object.fromEntries([
        ...locales.map((locale) => [locale, `${BASE}/${locale}/${params.seoFamily}`]),
        ["x-default", `${BASE}/en/${params.seoFamily}`],
      ]),
    },
  };
}

export default async function SeoFamilyHubPage(props: Props) {
  const params = await props.params;
  if (!isLocale(params.locale) || !isSeoGuideFamily(params.seoFamily)) notFound();
  const locale = params.locale as Locale;
  const isAr = locale === "ar";
  const destinations = DESTINATIONS.slice(0, 48);
  const seoFamily = params.seoFamily;
  const familyTitle = guideFamilyTitle(seoFamily);

  return (
    <main className="min-h-screen bg-ink-950 pb-20 text-white" dir={isAr ? "rtl" : "ltr"}>
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60">
          <Sparkles className="h-3.5 w-3.5 text-brand-primary" />
          {isAr ? "مركز أدلة السفر" : "Travel guide hub"}
        </div>
        <h1 className="mt-5 max-w-3xl font-display text-3xl font-bold md:text-5xl">
          {familyTitle} Guides by Destination
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/65 md:text-base">
          Choose a destination to get a concise, AI-search-ready guide with budget, safety, timing, planning links, and Rya prompts.
        </p>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {destinations.map((destination) => (
            <Link
              key={destination.slug}
              href={`/${locale}/${seoFamily}/${destination.slug}`}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-brand-primary/35 hover:bg-brand-primary/10"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{destination.flag}</span>
                <h2 className="font-display text-lg font-semibold">
                  {guideTitle(seoFamily, destination, locale)}
                </h2>
              </div>
              <p className="mt-4 line-clamp-3 text-sm leading-6 text-white/58">
                {guideDescription(seoFamily, destination, locale)}
              </p>
            </Link>
          ))}
        </section>
      </section>
    </main>
  );
}
