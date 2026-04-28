import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getDictionary } from "@/i18n/get-dictionary";
import { TravelpayoutsSearch } from "@/components/TravelpayoutsSearch";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}) {
  const isAr = params.locale === "ar";
  return {
    title: isAr
      ? "بحث متقدم عن رحلات الطيران والفنادق | GoTripza"
      : "Advanced Flight & Hotel Search | GoTripza",
    description: isAr
      ? "ابحث عن أرخص تذاكر الطيران والفنادق من السعودية. مقارنة فورية لمئات الشركات."
      : "Search cheap flights and hotels from Saudi Arabia. Instant comparison of hundreds of providers.",
  };
}

export default async function SearchPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale as Locale);

  return (
    <>
      <Navbar dict={dict} locale={locale as Locale} />
      <main className="min-h-screen bg-ink-950 pt-8 pb-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 text-center">
            <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
              {locale === "ar"
                ? "البحث المتقدم عن رحلات الطيران والفنادق"
                : "Advanced Flight & Hotel Search"}
            </h1>
            <p className="mt-3 text-white/55">
              {locale === "ar"
                ? "قارن بين مئات شركات الطيران والفنادق في ثوانٍ"
                : "Compare hundreds of airlines and hotels in seconds"}
            </p>
          </div>

          <TravelpayoutsSearch locale={locale as Locale} />
        </div>
      </main>
      <Footer dict={dict} locale={locale as Locale} />
    </>
  );
}
