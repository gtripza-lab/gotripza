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
  const title = isAr ? "ريا مستشارة السفر — تجربة مجانية 3 أشهر" : "Raya Travel Advisor — 3-Month Free Trial";
  const description = isAr
    ? "جرّب ريا مستشارة السفر مجاناً لمدة 3 أشهر: خطط سفر مفصلة، حفظ الرحلات، ومساعدة سفر ذكية."
    : "Try Raya Travel Advisor free for 3 months: detailed itineraries, saved trips, and smarter travel assistance.";
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
  "خطط سفر مفصلة حسب الميزانية",
  "حفظ الرحلات والمحادثات المهمة",
  "توصيات أعمق للفنادق عند اكتمال الربط",
  "متابعة تكلفة الرحلة وتنبيهات ذكية",
  "أولوية في الدعم والردود",
];

const FEATURES_EN = [
  "Detailed trip plans by budget",
  "Saved trips and important conversations",
  "Deeper hotel recommendations when inventory is connected",
  "Trip cost tracking and smart alerts",
  "Priority support and responses",
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
              {isAr ? "عرض الإطلاق: 3 أشهر مجاناً" : "Launch offer: 3 months free"}
            </p>
            <h1 className="mt-5 font-display text-3xl font-bold text-white sm:text-5xl">
              {isAr ? "جرّب ريا مستشارة السفر مجاناً" : "Try Raya Travel Advisor free"}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/50 sm:text-base">
              {isAr
                ? "احصل على تجربة مجانية لمدة 3 أشهر تشمل تخطيط رحلات أعمق، حفظ الخطط، ومزايا ريا المتقدمة. لا يتم تحصيل أي مبلغ خلال فترة التجربة."
                : "Get a 3-month free trial with deeper trip planning, saved plans, and advanced Raya features. No charge during the trial period."}
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {isAr ? "ريا مستشارة السفر" : "Raya Travel Advisor"}
                  </h2>
                  <p className="mt-1 text-sm text-white/40">
                    {isAr ? "للخطط المفصلة والمتابعة" : "For detailed planning and follow-up"}
                  </p>
                </div>
                <Sparkles className="h-8 w-8 text-brand-primary" />
              </div>
              <div className="mt-6">
                <span className="text-4xl font-bold text-white">{isAr ? "3 أشهر مجاناً" : "3 months free"}</span>
                <p className="mt-2 text-sm text-white/40">
                  {isAr ? "بعد انتهاء التجربة، تستطيع الاستمرار على الباقة المدفوعة أو إلغاؤها." : "After the trial, you can continue on the paid plan or cancel."}
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
                {isAr ? "ماذا يحصل بعد 3 أشهر؟" : "What happens after 3 months?"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/55">
                {isAr
                  ? "قبل نهاية التجربة نذكّرك. تستطيع الإلغاء، أو الاستمرار مع ريا مستشارة السفر للحصول على خطط مفصلة وحفظ رحلات ومزايا أولوية."
                  : "Before the trial ends, we remind you. You can cancel or continue with Raya Travel Advisor for detailed plans, saved trips, and priority features."}
              </p>
              <div className="mt-5 rounded-xl bg-black/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-mint">
                  {isAr ? "يشمل العرض" : "Included in the offer"}
                </p>
                <div className="mt-3 space-y-2 text-sm text-white/55">
                  <p>{isAr ? "تجربة مجانية لمدة 90 يوماً" : "90-day free trial"}</p>
                  <p>{isAr ? "إلغاء في أي وقت" : "Cancel anytime"}</p>
                  <p>{isAr ? "مزايا الإطلاق للمستخدمين الأوائل" : "Launch benefits for early users"}</p>
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
