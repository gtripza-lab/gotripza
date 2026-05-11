import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, Crown, Sparkles } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { PlusCheckoutButton } from "@/components/PlusCheckoutButton";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const isAr = params.locale === "ar";
  const title = isAr ? "Rya Companion — رفيقك الذكي أثناء السفر" : "Rya Companion — Your Smart Travel Companion";
  const description = isAr
    ? "مساعدة سفر مستمرة أثناء رحلتك: ترجمة، فهم صور، ميزانية، أمان، مطارات، واقتراحات ذكية طوال الرحلة."
    : "Trip-long travel help: translation, image help, budgeting, safety guidance, airport support, and smarter suggestions throughout your trip.";
  return {
    title,
    description,
    alternates: {
      canonical: `${BASE}/${params.locale}/plus`,
      languages: {
        ar: `${BASE}/ar/plus`,
        en: `${BASE}/en/plus`,
        "x-default": `${BASE}/en/plus`,
      },
    },
  };
}

const FEATURES_AR = [
  "مساعدة مستمرة طوال الرحلة",
  "ذاكرة سفر تحفظ خطتك وتفضيلاتك",
  "فهم صور القوائم واللوحات والتذاكر",
  "ترجمة مباشرة للمواقف اليومية",
  "تنبيهات ميزانية ونصائح أمان وتجنب الاحتيال",
  "مساعدة المطار والتنقلات والأنشطة",
];

const FEATURES_EN = [
  "Help throughout your actual trip",
  "Travel memory for your plan and preferences",
  "Image help for menus, signs, and tickets",
  "Live translation for everyday moments",
  "Budget nudges, safety tips, and scam guidance",
  "Airport, transport, and activity assistance",
];

export default async function PlusPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);
  const isAr = locale === "ar";
  const features = isAr ? FEATURES_AR : FEATURES_EN;

  return (
    <>
      <Navbar dict={dict} locale={locale} />
      <main className="min-h-screen bg-ink-950 px-4 pb-24 pt-10" dir={isAr ? "rtl" : "ltr"}>
        <section className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-primary/[0.08] px-4 py-2 text-sm text-brand-primary">
              <Crown className="h-4 w-4" />
              {isAr ? "رفيق سفر ذكي، وليس اشتراك ذكاء اصطناعي" : "A travel companion, not an AI subscription"}
            </p>
            <h1 className="mt-5 font-display text-3xl font-bold text-white sm:text-5xl">
              {isAr ? "Rya Companion معك أثناء الرحلة" : "Rya Companion Travels With You"}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/50 sm:text-base">
              {isAr
                ? "قبل السفر وأثناءه، ريا تتذكر خطتك وتساعدك في المواقف اليومية: من المطار، إلى الترجمة، إلى الميزانية، إلى تجنب الأخطاء السياحية."
                : "Before and during your trip, Rya remembers your plan and helps with real travel moments: airports, translation, budgeting, and avoiding tourist traps."}
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {isAr ? "Rya Companion" : "Rya Companion"}
                  </h2>
                  <p className="mt-1 text-sm text-white/40">
                    {isAr ? "مساعدة سفر طوال الرحلة" : "Travel help throughout the trip"}
                  </p>
                </div>
                <Sparkles className="h-8 w-8 text-brand-primary" />
              </div>
              <div className="mt-6">
                <span className="text-4xl font-bold text-white">$49.99</span>
                <span className="ms-2 text-sm text-white/35">{isAr ? "للرحلة" : "per trip"}</span>
                <p className="mt-2 text-sm text-white/40">
                  {isAr ? "أو $29.99 إذا حجزت أي خدمة عبر GoTripza: طيران، تأمين، شريحة، أنشطة، أو غيرها." : "Or $29.99 if you book any service through GoTripza: flights, insurance, eSIM, activities, or more."}
                </p>
              </div>
              <ul className="mt-6 space-y-3">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-white/60">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-mint" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <PlusCheckoutButton locale={locale} interval="monthly" />
              </div>
            </div>

            <div className="rounded-2xl border border-brand-mint/20 bg-brand-mint/[0.06] p-6">
              <h2 className="text-xl font-semibold text-white">
                {isAr ? "متى تحصل على الخصم؟" : "How the discount works"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/55">
                {isAr
                  ? "إذا ضغطت أو حجزت أي خدمة عبر روابط GoTripza مثل الطيران أو التأمين أو eSIM أو الأنشطة، يتم تفعيل سعر $29.99 عند الدفع بدلاً من $49.99."
                  : "If you click or book any service through GoTripza links such as flights, insurance, eSIMs, or activities, checkout uses the $29.99 price instead of $49.99."}
              </p>
              <div className="mt-5 rounded-xl bg-black/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-mint">
                  {isAr ? "مصمم للمواقف الحقيقية" : "Built for real travel moments"}
                </p>
                <div className="mt-3 space-y-2 text-sm text-white/55">
                  <p>{isAr ? "افهم قائمة طعام أو لوحة في الشارع بصورة" : "Understand a menu, sign, or ticket from an image"}</p>
                  <p>{isAr ? "اسأل عن منطقة، احتيال شائع، أو موقف في المطار" : "Ask about an area, common scam, or airport situation"}</p>
                  <p>{isAr ? "احصل على توصيات هادئة حسب خطتك وميزانيتك" : "Get calm suggestions based on your plan and budget"}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer dict={dict} locale={locale} />
    </>
  );
}
