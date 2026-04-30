import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getDictionary } from "@/i18n/get-dictionary";
import { SearchProvider } from "@/components/search/SearchContext";
import { SearchPageClient } from "@/components/SearchPageClient";
import { detectGeo } from "@/lib/geo";

export const dynamic = "force-dynamic"; // always read fresh searchParams

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}) {
  const isAr = params.locale === "ar";
  return {
    title: isAr
      ? "بحث ذكي عن رحلات الطيران والفنادق | GoTripza"
      : "AI Flight & Hotel Search | GoTripza",
    description: isAr
      ? "ابحث عن أرخص تذاكر الطيران والفنادق حول العالم. ذكاء اصطناعي يفهمك ويقارن مئات الشركات فوراً بعملتك."
      : "Search flights and hotels worldwide with AI. Compare hundreds of providers instantly and get the best price in your currency.",
    alternates: {
      canonical: isAr
        ? "https://gotripza.com/ar/search"
        : "https://gotripza.com/en/search",
    },
  };
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams?: { q?: string; locale?: string };
}) {
  const { locale } = params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale as Locale);
  const { currency } = detectGeo();

  // Read the query forwarded from the homepage redirect
  const initialQuery = (searchParams?.q ?? "").trim();

  return (
    <SearchProvider initialLocale={locale as Locale} initialCurrency={currency}>
      <Navbar dict={dict} locale={locale as Locale} />

      <main className="min-h-screen bg-ink-950 pb-24 pt-10">
        {/* Page header */}
        <div className="mx-auto mb-8 max-w-7xl px-4 sm:px-6">
          <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
            {locale === "ar"
              ? "🔍 ابحث عن رحلتك المثالية"
              : "🔍 Find Your Perfect Trip"}
          </h1>
          <p className="mt-2 text-sm text-white/50">
            {locale === "ar"
              ? "ذكاء اصطناعي + أسعار مباشرة من مئات شركات الطيران والفنادق"
              : "AI-powered search + live prices from hundreds of airlines & hotels"}
          </p>
        </div>

        {/* Main search + results + live widgets — all with marker 522867 */}
        <SearchPageClient
          initialQuery={initialQuery}
          dict={dict}
          locale={locale as Locale}
          currency={currency}
        />
      </main>

      <Footer dict={dict} locale={locale as Locale} />
    </SearchProvider>
  );
}
