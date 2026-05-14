import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AccountPlans } from "@/components/AccountPlans";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export const metadata: Metadata = {
  title: "My Account",
  robots: "noindex,nofollow",
};

export default async function AccountPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);
  const isAr = locale === "ar";

  return (
    <>
      <Navbar dict={dict} locale={locale} />
      <main className="min-h-screen bg-ink-950 px-4 pb-24 pt-10" dir={isAr ? "rtl" : "ltr"}>
        <section className="mx-auto max-w-6xl">
          <div className="mb-8">
            <p className="text-sm text-brand-primary">
              {isAr ? "حساب GoTripza" : "GoTripza Account"}
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold text-white">
              {isAr ? "خططي المحفوظة" : "My Saved Plans"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
              {isAr
                ? "هنا تظهر الخطط التي تحفظها من محرك خطط رحلتي. سجل دخولك ليتم حفظها ومراجعتها من أي جهاز."
                : "Plans saved from the trip planner appear here. Sign in to keep them available across devices."}
            </p>
          </div>
          <AccountPlans locale={locale} />
        </section>
      </main>
      <Footer dict={dict} locale={locale} />
    </>
  );
}
