/**
 * /[locale]/rya — Dedicated Google Ads landing page.
 * Conversion-focused, mobile-first, and intentionally noindex.
 */
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  CheckCircle2,
  CircleDollarSign,
  Languages,
  MapPinned,
  Plane,
  Route,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TicketCheck,
} from "lucide-react";
import { isLocale, type Locale } from "@/i18n/config";
import { RyaAdsAuthTrigger } from "@/components/RyaAdsAuthTrigger";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";

export async function generateMetadata(
  props: { params: Promise<{ locale: string }> },
): Promise<Metadata> {
  const params = await props.params;
  const isAr = params.locale === "ar";
  const title = isAr
    ? "ريا — رفيقة السفر الذكية | ابدأ التجربة مجاناً"
    : "Rya — AI Travel Companion | Start Free";
  const description = isAr
    ? "خطط رحلتك مع ريا: طيران، مناطق سكن، ميزانية، مطار، ترجمة، تأمين، eSIM، وأنشطة سفر في محادثة واحدة."
    : "Plan with Rya: flights, stay areas, budget, airports, translation, insurance, eSIM, and travel activities in one conversation.";

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      url: `${BASE}/${params.locale}/rya`,
      type: "website",
      images: [{ url: "/brand/rya/og-image-rya.svg", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/brand/rya/og-image-rya.svg"],
    },
  };
}

const SERVICES = [
  {
    icon: Plane,
    ar: {
      title: "رحلات الطيران",
      body: "ريا تساعدك تقارن التوقيت، مدة التوقف، الميزانية، وتفتح لك خيارات الحجز المناسبة عندما تكون مستعداً.",
    },
    en: {
      title: "Flight booking help",
      body: "Rya helps compare timing, layovers, budget, and booking options when you are ready to choose.",
    },
  },
  {
    icon: MapPinned,
    ar: {
      title: "مناطق السكن",
      body: "قبل اختيار الفندق، ريا تقترح أفضل الأحياء حسب الأمان، التنقل، العائلة، والميزانية.",
    },
    en: {
      title: "Stay-area guidance",
      body: "Before you choose a hotel, Rya recommends areas by safety, transport, family needs, and budget.",
    },
  },
  {
    icon: Smartphone,
    ar: {
      title: "الشريحة الإلكترونية eSIM",
      body: "تخبرك متى تحتاج الإنترنت، كم بيانات يكفيك، وكيف تتجنب تعطل الخرائط والترجمة عند الوصول.",
    },
    en: {
      title: "eSIM travel data",
      body: "Rya explains when you need data, how much is enough, and how to keep maps and translation working.",
    },
  },
  {
    icon: ShieldCheck,
    ar: {
      title: "تأمين السفر",
      body: "ريا لا تقترح التأمين عشوائياً؛ تربطه بالفيزا، الأطفال، مدة الرحلة، وقيمة الحجوزات.",
    },
    en: {
      title: "Travel insurance",
      body: "Rya suggests insurance only when it fits visas, kids, trip length, or the value of your bookings.",
    },
  },
  {
    icon: TicketCheck,
    ar: {
      title: "الأنشطة والتجارب",
      body: "بدل عشرات الخيارات، ريا تختار أنشطة تناسب وقتك ونوع رحلتك: عائلية، رومانسية، اقتصادية، أو مغامرة.",
    },
    en: {
      title: "Activities and tours",
      body: "Instead of endless lists, Rya suggests activities that fit your time and trip style.",
    },
  },
  {
    icon: Languages,
    ar: {
      title: "ترجمة المواقف",
      body: "اكتب الموقف أو العبارة، وريا تعطيك ترجمة طبيعية وما تقوله في المطعم أو المطار أو الفندق.",
    },
    en: {
      title: "Travel translation",
      body: "Type the situation or phrase, and Rya gives you natural wording for restaurants, airports, and hotels.",
    },
  },
  {
    icon: Camera,
    ar: {
      title: "فهم الصور أثناء السفر",
      body: "استخدم ريا لفهم قائمة طعام، لافتة، تذكرة، أو تعليمات محلية عندما تكون في مكان جديد.",
    },
    en: {
      title: "Image help on the trip",
      body: "Use Rya to understand menus, signs, tickets, and local instructions in unfamiliar places.",
    },
  },
  {
    icon: CircleDollarSign,
    ar: {
      title: "إدارة الميزانية",
      body: "ريا تقسم ميزانيتك بين الطيران، السكن، الطعام، التنقل، والأنشطة حتى لا تتفاجأ أثناء الرحلة.",
    },
    en: {
      title: "Budget guidance",
      body: "Rya splits your budget across flights, stay, food, transport, and activities so the trip feels under control.",
    },
  },
];

const MOMENTS = [
  {
    ar: "قبل السفر: اسأل ريا عن أفضل وقت، تكلفة تقريبية، وخطة أيام واقعية.",
    en: "Before travel: ask Rya for timing, rough cost, and a realistic daily plan.",
  },
  {
    ar: "وقت الحجز: ريا تساعدك تفهم خيارات الطيران والخدمات المفيدة بدون ضغط.",
    en: "When booking: Rya helps you understand flights and useful services without pressure.",
  },
  {
    ar: "أثناء الرحلة: مطار، ترجمة، أمان، ميزانية، ومواقف يومية في محادثة واحدة.",
    en: "During the trip: airport, translation, safety, budget, and daily situations in one chat.",
  },
];

const CHAT = {
  ar: [
    { role: "traveler", text: "أبغى أسافر إسطنبول 7 أيام مع العائلة وميزانيتي متوسطة." },
    { role: "rya", text: "تمام. سأرتب لك خطة هادئة: أفضل أحياء السكن للعائلة، ميزانية يومية، وقت مناسب للطيران، ومتى تحتاج eSIM أو تأمين." },
    { role: "traveler", text: "هل أبدأ بالطيران أو الفندق؟" },
    { role: "rya", text: "ابدأ بالطيران إذا التاريخ ثابت. بعدها نختار منطقة السكن حسب الوصول والتنقل، وليس فقط السعر." },
  ],
  en: [
    { role: "traveler", text: "I want Istanbul for 7 days with my family on a mid-range budget." },
    { role: "rya", text: "Got it. I’ll help with family-friendly areas, a daily budget, flight timing, and when eSIM or insurance makes sense." },
    { role: "traveler", text: "Should I start with flights or hotel?" },
    { role: "rya", text: "Start with flights if your dates are fixed. Then choose the stay area by arrival time and transport, not price alone." },
  ],
};

export default async function RyaAdsLandingPage(
  props: { params: Promise<{ locale: string }> },
) {
  const params = await props.params;
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const isAr = locale === "ar";
  const chat = isAr ? CHAT.ar : CHAT.en;

  return (
    <div className="min-h-screen overflow-hidden bg-[#060A13] text-white" dir={isAr ? "rtl" : "ltr"}>
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#060A13]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href={`/${locale}`} className="flex items-center gap-3" aria-label="Rya by GoTripza">
            <Image
              src="/brand/rya/rya-symbol.svg"
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 rounded-xl border border-white/10 bg-white/[0.04] p-2"
            />
            <span className="text-base font-black tracking-tight text-white sm:text-lg">
              Rya <span className="text-[#00D4B3]">by GoTripza</span>
            </span>
          </Link>
          <RyaAdsAuthTrigger locale={locale} variant="header" />
        </div>
      </header>

      <main>
        <section className="relative px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-16">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 h-[520px] w-[780px] -translate-x-1/2 rounded-full bg-[#3B82F6]/12 blur-[130px]" />
            <div className="absolute end-[-120px] top-40 h-[420px] w-[420px] rounded-full bg-[#00D4B3]/10 blur-[110px]" />
          </div>

          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.02fr_0.98fr]">
            <div className="text-center lg:text-start">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#00D4B3]/25 bg-[#00D4B3]/10 px-4 py-2 text-xs font-semibold text-[#00D4B3]">
                <Sparkles className="h-3.5 w-3.5" />
                {isAr ? "جرّب ريا مجاناً، بدون بطاقة ائتمان" : "Try Rya free, no credit card required"}
              </div>

              <h1
                aria-label={
                  isAr
                    ? "رفيقة سفر تفهم رحلتك من أول سؤال إلى يوم العودة"
                    : "A travel companion that understands your trip from first question to return day"
                }
                className="text-balance text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl"
              >
                {isAr ? (
                  <>
                    رفيقة سفر تفهم رحلتك
                    <span className="mt-2 block bg-gradient-to-r from-[#3B82F6] via-[#8B5CF6] to-[#00D4B3] bg-clip-text text-transparent">
                      من أول سؤال إلى يوم العودة
                    </span>
                  </>
                ) : (
                  <>
                    A travel companion that understands your trip
                    <span className="mt-2 block bg-gradient-to-r from-[#3B82F6] via-[#8B5CF6] to-[#00D4B3] bg-clip-text text-transparent">
                      from first question to return day
                    </span>
                  </>
                )}
              </h1>

              <p className="mx-auto mt-5 max-w-2xl text-balance text-base leading-8 text-white/62 sm:text-lg lg:mx-0">
                {isAr
                  ? "ريا تساعدك تخطط، تقارن خيارات الطيران، تختار منطقة السكن، تضبط الميزانية، وتستخدم خدمات السفر المناسبة في وقتها: eSIM، تأمين، أنشطة، ترجمة، ومساعدة المطار."
                  : "Rya helps you plan, compare flight options, choose stay areas, manage budget, and use the right travel services at the right time: eSIM, insurance, activities, translation, and airport help."}
              </p>

              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
                <RyaAdsAuthTrigger locale={locale} variant="primary" />
                <Link
                  href={`/${locale}/search`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-6 py-3.5 text-sm font-semibold text-white/80 transition hover:bg-white/[0.09] sm:w-auto"
                >
                  {isAr ? "افتح ريا أولاً" : "Open chat first"}
                  <ArrowRight className={`h-4 w-4 ${isAr ? "rotate-180" : ""}`} />
                </Link>
              </div>

              <div className="mt-5 flex flex-wrap justify-center gap-3 text-xs text-white/42 lg:justify-start">
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[#00D4B3]" />{isAr ? "عربي وإنجليزي" : "Arabic and English"}</span>
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[#00D4B3]" />{isAr ? "بدون بطاقة ائتمان" : "No credit card"}</span>
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[#00D4B3]" />{isAr ? "محادثة واحدة لكل الرحلة" : "One chat for the whole trip"}</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md rounded-[2rem] border border-white/[0.10] bg-white/[0.045] p-4 shadow-2xl shadow-black/30">
              <div className="mb-4 flex items-center justify-between border-b border-white/[0.07] pb-3">
                <div>
                  <p className="text-sm font-bold text-white">{isAr ? "محادثة حقيقية مع ريا" : "A real Rya moment"}</p>
                  <p className="text-xs text-white/40">{isAr ? "تخطيط وخدمات بدون إزعاج" : "Planning and services without noise"}</p>
                </div>
                <BadgeCheck className="h-6 w-6 text-[#00D4B3]" />
              </div>
              <div className="space-y-3">
                {chat.map((message, index) => {
                  const isRya = message.role === "rya";
                  return (
                    <div key={`${message.role}-${index}`} className={`flex ${isRya ? "justify-start" : "justify-end"}`}>
                      <div className={`max-w-[86%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                        isRya
                          ? "border border-[#00D4B3]/20 bg-[#00D4B3]/10 text-white/82"
                          : "bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] text-white"
                      }`}>
                        {message.text}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/[0.06] bg-white/[0.025] px-4 py-5 sm:px-6">
          <div className="mx-auto grid max-w-6xl gap-3 text-center text-xs font-semibold text-white/55 sm:grid-cols-3">
            {(isAr
              ? ["توصيات حسب سياق رحلتك", "لا روابط حجز مبكرة", "مساعدة قبل السفر وأثناءه"]
              : ["Recommendations based on your trip", "No early booking spam", "Help before and during travel"]
            ).map((item) => <span key={item}>{item}</span>)}
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-[#00D4B3]/80">
                {isAr ? "الخدمات داخل ريا" : "Services inside Rya"}
              </p>
              <h2 className="text-3xl font-black text-white sm:text-4xl">
                {isAr ? "كل خدمة تظهر عندما تحتاجها فعلاً" : "Every service appears when it actually helps"}
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/52">
                {isAr
                  ? "ريا ليست صفحة روابط. هي تفهم وجهتك وميزانيتك ومرحلة رحلتك، ثم تقترح الخدمة المناسبة بهدوء."
                  : "Rya is not a page of links. She understands your destination, budget, and trip stage, then calmly suggests what fits."}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {SERVICES.map((service) => {
                const Icon = service.icon;
                const content = isAr ? service.ar : service.en;
                return (
                  <article key={service.en.title} className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00D4B3]/10 text-[#00D4B3]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mb-2 text-base font-bold text-white">{content.title}</h3>
                    <p className="text-sm leading-6 text-white/52">{content.body}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-white/[0.025] px-4 py-16 sm:px-6">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-[#00D4B3]/80">
                {isAr ? "لماذا ريا مختلفة؟" : "Why Rya feels different"}
              </p>
              <h2 className="text-3xl font-black text-white sm:text-4xl">
                {isAr ? "ليست محرك حجز. ريا رفيقة قرار." : "Not a booking engine. Rya is a decision companion."}
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/55">
                {isAr
                  ? "بدل أن ترمي عليك عشرات الخيارات، ريا تسأل أقل، تتذكر أكثر، وتشرح لك ماذا تختار ولماذا."
                  : "Instead of throwing endless options at you, Rya asks less, remembers more, and explains what to choose and why."}
              </p>
            </div>
            <div className="grid gap-4">
              {MOMENTS.map((moment) => (
                <div key={moment.en} className="flex gap-4 rounded-2xl border border-white/[0.08] bg-[#060A13]/65 p-5">
                  <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3B82F6]/15 text-[#8FB7FF]">
                    <Route className="h-4 w-4" />
                  </div>
                  <p className="text-sm leading-7 text-white/68">{isAr ? moment.ar : moment.en}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 text-center sm:px-6 sm:py-24">
          <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/[0.10] bg-gradient-to-br from-white/[0.07] to-white/[0.025] p-6 sm:p-10">
            <Plane className="mx-auto mb-5 h-9 w-9 text-[#00D4B3]" />
            <h2 className="text-3xl font-black text-white sm:text-4xl">
              {isAr ? "ابدأ رحلتك مع ريا الآن" : "Start your trip with Rya now"}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/56">
              {isAr
                ? "اكتب وجهتك، ميزانيتك، ومن يسافر معك. ريا تحولها إلى خطة وخيارات وخطوات واضحة."
                : "Tell Rya your destination, budget, and companions. She turns it into a plan, options, and clear next steps."}
            </p>
            <div className="mt-7">
              <RyaAdsAuthTrigger locale={locale} variant="large" />
            </div>
            <p className="mt-4 text-xs text-white/32">
              {isAr
                ? "التجربة المجانية لا تتطلب بطاقة ائتمان."
                : "The free trial does not require a credit card."}
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06] px-5 py-7 text-center text-xs text-white/28">
        <span>© 2026 GoTripza</span>
        <span className="mx-2">·</span>
        <Link href={`/${locale}/privacy`} className="hover:text-white/55">
          {isAr ? "الخصوصية" : "Privacy"}
        </Link>
        <span className="mx-2">·</span>
        <Link href={`/${locale}/terms`} className="hover:text-white/55">
          {isAr ? "الشروط" : "Terms"}
        </Link>
      </footer>
    </div>
  );
}
