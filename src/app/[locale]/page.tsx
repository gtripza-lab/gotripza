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

export default async function LandingPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale as Locale);

  return (
    <SearchProvider initialLocale={locale as Locale}>
      <Navbar dict={dict} locale={locale as Locale} />
      <main>
        <Hero dict={dict} />
        <SearchResults dict={dict} />
        <BrandStory dict={dict} />
        <MobileMockups dict={dict} />
        <ValuesGrid dict={dict} />
        <OurValues dict={dict} />
        <DestinationsGrid dict={dict} />
      </main>
      <SocialProof locale={locale as Locale} />
      <Footer dict={dict} locale={locale as Locale} />
    </SearchProvider>
  );
}
