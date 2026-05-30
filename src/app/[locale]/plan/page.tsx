import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  Globe,
  Sparkles,
  Star,
  WalletCards,
  X,
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { TripPlanner } from "@/components/TripPlanner";
import { contentLocale, isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { PLAN_TIERS } from "@/lib/checkout-links";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";

export async function generateMetadata(
  props: { params: Promise<{ locale: string }> },
): Promise<Metadata> {
  const params = await props.params;
  const isAr = params.locale === "ar";
  const title = isAr
    ? "خطط رحلتي — محرك تخطيط السفر الذكي من GoTripza"
    : "Trip Planner — GoTripza AI Travel Planning Engine";
  const description = isAr
    ? "خطة سفر يومية مخصصة بالذكاء الاصطناعي لأي مدينة في العالم — ميزانية، سكن، تأشيرة، وتجهيزات. مقابل $9.99 فقط."
    : "AI-generated daily trip plan for any city — budget, stay, visa, and packing. Just $9.99.";

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

export default async function PlanPage(
  props: { params: Promise<{ locale: string }> },
) {
  const params = await props.params;
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const copyLocale = contentLocale(locale);
  const dict = await getDictionary(locale);
  const isAr = locale === "ar";

  return (
    <>
      <Navbar dict={dict} locale={locale} />
      <main
        className="min-h-screen bg-ink-950"
        style={{ paddingBottom: "calc(6rem + env(safe-area-inset-bottom, 0px))" }}
        dir={isAr ? "rtl" : "ltr"}
      >

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-4xl px-4 pb-8 pt-16 text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-primary/[0.08] px-4 py-1.5 text-xs font-semibold text-brand-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {isAr ? "مخطط رحلات بالذكاء الاصطناعي" : "AI Trip Planner"}
          </p>

          <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
            {isAr ? (
              <>
                خطة سفر كاملة لأي مدينة
                <br />
                <span className="text-brand-primary">في العالم — بـ $9.99</span>
              </>
            ) : (
              <>
                A complete trip plan for any city
                <br />
                <span className="text-brand-primary">in the world — just $9.99</span>
              </>
            )}
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/55">
            {isAr
              ? "أدخل وجهتك وميزانيتك — ريا تبني لك جدولاً يومياً تفصيلياً، توزيع ميزانية، نصائح تأشيرة، وقائمة تجهيزات. أي مدينة في العالم."
              : "Enter your destination and budget — Rya builds a detailed daily itinerary, budget split, visa notes, and packing list. Any city in the world."}
          </p>

          {/* Social proof stats */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-8">
            {(isAr
              ? [
                  { value: "+500", label: "خطة منجزة" },
                  { value: "+50", label: "وجهة حول العالم" },
                  { value: "AI", label: "مخصص بالذكاء الاصطناعي" },
                ]
              : [
                  { value: "500+", label: "plans delivered" },
                  { value: "50+", label: "destinations worldwide" },
                  { value: "AI", label: "personalized plans" },
                ]
            ).map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-2xl font-bold text-white">{stat.value}</p>
                <p className="mt-1 text-xs text-white/40">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Stars */}
          <div className="mt-6 flex items-center justify-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
            <span className="ms-2 text-xs text-white/45">
              {isAr ? "تقييم العملاء" : "customer rating"}
            </span>
          </div>
        </section>

        {/* ── Main planner ─────────────────────────────────────────────────── */}
        <TripPlanner locale={locale} />

        {/* ── Comparison table ─────────────────────────────────────────────── */}
        <section className="mx-auto max-w-4xl px-4 pb-16">
          <h2 className="mb-8 text-center font-display text-2xl font-bold text-white">
            {isAr ? "بدون خطة مقابل بخطة ريا" : "Without a plan vs. with Rya"}
          </h2>
          <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.03]">
                  <th className="px-5 py-4 text-start font-medium text-white/45">
                    {isAr ? "الجانب" : "Aspect"}
                  </th>
                  <th className="px-5 py-4 text-center font-medium text-white/45">
                    {isAr ? "بدون خطة" : "No plan"}
                  </th>
                  <th className="px-5 py-4 text-center font-semibold text-brand-primary">
                    {isAr ? "خطة ريا — $9.99" : "Rya plan — $9.99"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {(isAr
                  ? [
                      ["الوقت اللازم للتخطيط", "ساعات من البحث", "دقيقة واحدة"],
                      ["تغطية المدن", "مقيد بما تعرفه", "أي مدينة في العالم"],
                      ["الميزانية", "تخمين", "توزيع دقيق حسب نوع الرحلة"],
                      ["التأشيرة", "تبحث بنفسك", "نصيحة مباشرة للسعوديين"],
                      ["البرنامج اليومي", "عام وغير مخصص", "أماكن محددة بالاسم"],
                      ["التجهيزات", "ناقصة أو منسية", "قائمة مخصصة للوجهة"],
                    ]
                  : [
                      ["Planning time", "Hours of research", "Under one minute"],
                      ["City coverage", "Limited to what you know", "Any city worldwide"],
                      ["Budget", "Rough guessing", "Precise split by trip type"],
                      ["Visa", "Search on your own", "Direct advice for your passport"],
                      ["Daily itinerary", "Generic and vague", "Specific named places"],
                      ["Packing", "Incomplete or forgotten", "Destination-specific list"],
                    ]
                ).map(([aspect, without, withRya]) => (
                  <tr key={aspect} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-4 text-white/65">{aspect}</td>
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 text-white/35">
                        <X className="h-3.5 w-3.5 text-rose-400/70" />
                        {without}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 text-brand-mint">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {withRya}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 text-center">
            <a
              href={PLAN_TIERS[1].gumroadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-violet-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg transition hover:scale-[1.02]"
            >
              <Sparkles className="h-4 w-4" />
              {isAr ? "ابدأ الآن — $9.99" : "Start now — $9.99"}
            </a>
            <p className="mt-3 text-xs text-white/35">
              {isAr
                ? "دفع آمن عبر Gumroad · Visa · Mastercard · Apple Pay"
                : "Secure payment via Gumroad · Visa · Mastercard · Apple Pay"}
            </p>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-4xl px-4 pb-16">
          <h2 className="mb-8 text-center font-display text-2xl font-bold text-white">
            {isAr ? "كيف يعمل" : "How it works"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {(isAr
              ? [
                  { step: "١", title: "أدخل تفاصيل رحلتك", body: "الوجهة، الأيام (حتى 14 يوم)، الميزانية، ونوع الرحلة." },
                  { step: "٢", title: "اختر مدة رحلتك واشترِ", body: "3 خيارات للمدة: قصيرة (4 أيام)، أسبوع (7 أيام)، أو ممتدة (14 يوم) — جميعها بـ $9.99." },
                  { step: "٣", title: "افتح خطتك فوراً", body: "سجّل الدخول عبر Google، ادفع، ثم افتح الخطة بنقرة واحدة." },
                ]
              : [
                  { step: "1", title: "Enter your trip details", body: "Destination, days (up to 14), budget, and trip type." },
                  { step: "2", title: "Choose your duration & buy", body: "3 options: Short (4 days), Week (7 days), or Extended (14 days) — all at $9.99." },
                  { step: "3", title: "Unlock instantly", body: "Sign in with Google, pay, then open your full plan in one click." },
                ]
            ).map(({ step, title, body }) => (
              <div
                key={step}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-6"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/20 font-display text-lg font-bold text-brand-primary">
                  {step}
                </div>
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/45">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── What's included ──────────────────────────────────────────────── */}
        <section className="mx-auto max-w-4xl px-4 pb-16">
          <div className="rounded-2xl border border-brand-primary/15 bg-brand-primary/[0.04] p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/20">
                <Globe className="h-5 w-5 text-brand-primary" />
              </div>
              <h2 className="font-display text-xl font-bold text-white">
                {isAr ? "ماذا تحصل في الخطة الكاملة؟" : "What's in your full plan?"}
              </h2>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {(isAr
                ? [
                    "جدول يومي تفصيلي بأماكن محددة بالاسم",
                    "توزيع ميزانية دقيق حسب نوع الرحلة",
                    "أفضل مناطق السكن ولماذا",
                    "نصائح الطيران ومتى تحجز",
                    "متطلبات التأشيرة لحامل الجواز السعودي",
                    "نصائح التنقل المحلي (مترو، تاكسي، عبّارة)",
                    "الطقس وتوقيت الأنشطة",
                    "قائمة تجهيزات مخصصة للوجهة",
                    "خدمات مفيدة للرحلة (eSIM، تأمين)",
                    "الخطوات التالية خطوة بخطوة",
                  ]
                : [
                    "Detailed daily itinerary with named places",
                    "Precise budget split by trip type",
                    "Best stay areas and why",
                    "Flight advice and when to book",
                    "Visa requirements for your passport",
                    "Local transport tips (metro, taxi, ferry)",
                    "Weather and activity timing",
                    "Destination-specific packing list",
                    "Useful trip services (eSIM, insurance)",
                    "Step-by-step next steps",
                  ]
              ).map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-mint" />
                  <span className="text-sm leading-6 text-white/65">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-2xl font-bold text-white">$9.99</p>
                <p className="text-xs text-white/40">
                  {isAr
                    ? "لأي من الخطط الثلاث · دفع لمرة واحدة"
                    : "for any of the 3 plans · one-time payment"}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(isAr
                    ? ["رحلة قصيرة — 4 أيام", "رحلة أسبوع — 7 أيام", "رحلة ممتدة — 14 يوم"]
                    : ["Short trip — 4 days", "Week trip — 7 days", "Extended — 14 days"]
                  ).map((label) => (
                    <span key={label} className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] text-white/50">
                      {label}
                    </span>
                  ))}
                </div>
              </div>
              <a
                href={PLAN_TIERS[1].gumroadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-violet-600 px-6 py-3 text-sm font-bold text-white transition hover:scale-[1.02]"
              >
                <WalletCards className="h-4 w-4" />
                {isAr ? "احصل على خطتك الآن" : "Get your plan now"}
              </a>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-3xl px-4 pb-16">
          <h2 className="mb-8 text-center font-display text-2xl font-bold text-white">
            {isAr ? "أسئلة شائعة" : "Frequently asked questions"}
          </h2>
          <div className="space-y-3">
            {(isAr
              ? [
                  {
                    q: "كيف أستلم الخطة الكاملة بعد الشراء؟",
                    a: "بعد الشراء في Gumroad، عد إلى هذه الصفحة وأدخل البريد الإلكتروني الذي استخدمته في الدفع — ستظهر خطتك فوراً.",
                  },
                  {
                    q: "هل تعمل الخطة لأي مدينة في العالم؟",
                    a: "نعم، الذكاء الاصطناعي يغطي أي وجهة في العالم، ليس فقط المدن المتاحة في المعاينة المجانية.",
                  },
                  {
                    q: "هل يمكنني طلب تعديل على الخطة؟",
                    a: "الخطة مبنية بالذكاء الاصطناعي وتعتمد على بياناتك. يمكنك تعديل أي يوم مباشرة في الصفحة، أو استخدام ريا لتخصيص أي تفصيلة.",
                  },
                  {
                    q: "ما وسائل الدفع المتاحة؟",
                    a: "الدفع عبر Gumroad يدعم Visa وMastercard وPayPal وApple Pay.",
                  },
                ]
              : [
                  {
                    q: "How do I receive my full plan after purchase?",
                    a: "After purchasing on Gumroad, return to this page and enter the email you used — your plan will appear immediately.",
                  },
                  {
                    q: "Does it work for any city worldwide?",
                    a: "Yes, the AI covers any destination, not just the cities shown in the free preview.",
                  },
                  {
                    q: "Can I request changes to my plan?",
                    a: "You can adjust any day directly on the page, or use Rya to tune any detail.",
                  },
                  {
                    q: "What payment methods are accepted?",
                    a: "Gumroad supports Visa, Mastercard, PayPal, and Apple Pay.",
                  },
                ]
            ).map(({ q, a }) => (
              <div
                key={q}
                className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-5"
              >
                <p className="font-medium text-white/85">{q}</p>
                <p className="mt-2 text-sm leading-6 text-white/50">{a}</p>
              </div>
            ))}
          </div>
        </section>

      </main>
      <Footer dict={dict} locale={locale} />
    </>
  );
}
