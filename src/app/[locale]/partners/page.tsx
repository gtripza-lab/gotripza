import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { PartnersLanding } from "@/components/partners/PartnersLanding";

export const dynamic = "force-static";

export async function generateMetadata(
  props: { params: Promise<{ locale: string }> },
): Promise<Metadata> {
  const { locale } = await props.params;
  const isAr = locale === "ar";
  return {
    title: isAr ? "Rya Partners — برنامج شركاء ريا" : "Rya Partners — Creator Partner Program",
    description: isAr
      ? "انضم إلى Rya Partners واربح عمولات من الترويج لريا مستشارة السفر وخدمات تخطيط الرحلات."
      : "Join Rya Partners and earn commissions by promoting Rya travel advisor and trip planning services.",
    alternates: {
      canonical: `https://gotripza.com/${locale}/partners`,
      languages: {
        ar: "https://gotripza.com/ar/partners",
        en: "https://gotripza.com/en/partners",
        "x-default": "https://gotripza.com/en/partners",
      },
    },
  };
}

export default async function LocalizedPartnersPage(
  props: { params: Promise<{ locale: string }> },
) {
  const { locale } = await props.params;
  if (!isLocale(locale)) notFound();
  return <PartnersLanding locale={locale as Locale} />;
}
