import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";

export function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Metadata {
  const isAr = params.locale === "ar";
  const title = isAr
    ? "أول مساعد سفر ذكي مجاني | GoTripza"
    : "First Free AI Travel Assistant | GoTripza";
  const description = isAr
    ? "ريا هي مساعدة السفر الذكية المجانية التي تفهم رحلتك، تسألك الأسئلة الصحيحة، وتقدم لك نتائج مخصصة — لا مجرد بحث."
    : "Raya is the first free AI travel assistant that understands your trip, asks the right questions, and delivers personalized results — not just search.";
  const url = `${BASE}/${params.locale}/ai-travel-assistant`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        ar: `${BASE}/ar/ai-travel-assistant`,
        en: `${BASE}/en/ai-travel-assistant`,
        "x-default": `${BASE}/en/ai-travel-assistant`,
      },
    },
    openGraph: {
      type: "website",
      title,
      description,
      url,
      siteName: "GoTripza",
    },
  };
}

// ── How Raya works steps ──────────────────────────────────────────────────────
const HOW_IT_WORKS = [
  {
    step: "01",
    icon: "💬",
    title_ar: "أخبر ريا عن رحلتك",
    title_en: "Tell Raya about your trip",
    desc_ar:
      "اكتب ما تريده بكلامك العادي: \"أريد شهر عسل رومانسي بميزانية معقولة\" أو \"رحلة عائلية مع أطفال للصيف\".",
    desc_en:
      'Type naturally: "I want a romantic honeymoon on a reasonable budget" or "a family trip with kids this summer".',
  },
  {
    step: "02",
    icon: "🎯",
    title_ar: "ريا تسأل الأسئلة الصحيحة",
    title_en: "Raya asks the right questions",
    desc_ar:
      "بدلاً من قوائم لا نهاية لها، ريا تسألك عما يهم فعلاً: الميزانية، الأشخاص، التأشيرة، والتفضيلات.",
    desc_en:
      "Instead of endless forms, Raya pinpoints what matters: budget, travelers, visa situation, and your preferences.",
  },
  {
    step: "03",
    icon: "✨",
    title_ar: "نتائج مخصصة لك تماماً",
    title_en: "Results tailored just for you",
    desc_ar:
      "تحصل على وجهات، فنادق، رحلات طيران، تأمين، وشرائح إنترنت — كل شيء منسق لرحلتك أنت.",
    desc_en:
      "You get destinations, hotels, flights, insurance, and eSIMs — everything curated for your specific trip.",
  },
];

// ── What Raya can do ──────────────────────────────────────────────────────────
const CAPABILITIES = [
  { icon: "💍", label_ar: "تخطيط شهر العسل", label_en: "Plan your honeymoon" },
  { icon: "👨‍👩‍👧‍👦", label_ar: "رحلات عائلية", label_en: "Family trips" },
  { icon: "💰", label_ar: "السفر بميزانية محدودة", label_en: "Budget travel" },
  { icon: "🛂", label_ar: "نصائح التأشيرة", label_en: "Visa advice" },
  { icon: "🌦️", label_ar: "أفضل المواسم للسفر", label_en: "Best travel seasons" },
  { icon: "⚖️", label_ar: "مقارنة الوجهات", label_en: "Compare destinations" },
  { icon: "🛡️", label_ar: "اختيار تأمين السفر", label_en: "Find travel insurance" },
  { icon: "📡", label_ar: "شراء شريحة إنترنت", label_en: "Find the best eSIM" },
];

// ── Why not just Google ───────────────────────────────────────────────────────
const COMPARISON_ROWS = [
  {
    criterion_ar: "طريقة التفاعل",
    criterion_en: "Interaction style",
    google_ar: "بحث نصي، أنت تصيغ السؤال",
    google_en: "Keyword search — you do the heavy lifting",
    raya_ar: "محادثة طبيعية، ريا تفهم قصدك",
    raya_en: "Natural conversation — Raya understands intent",
  },
  {
    criterion_ar: "التخصيص",
    criterion_en: "Personalization",
    google_ar: "نتائج عامة لملايين الأشخاص",
    google_en: "Generic results for millions",
    raya_ar: "نتائج لرحلتك وميزانيتك أنت",
    raya_en: "Results for your trip and budget",
  },
  {
    criterion_ar: "التأشيرة والجنسية",
    criterion_en: "Visa & nationality",
    google_ar: "لا يعرف جنسيتك أو وضع تأشيرتك",
    google_en: "Doesn't know your nationality or visa status",
    raya_ar: "تأخذ جنسيتك بعين الاعتبار تلقائياً",
    raya_en: "Factors in your nationality automatically",
  },
  {
    criterion_ar: "مقارنة الخيارات",
    criterion_en: "Comparing options",
    google_ar: "عليك فتح عشرات المواقع",
    google_en: "You open dozens of tabs yourself",
    raya_ar: "ريا تقارن وتوصي في مكان واحد",
    raya_en: "Raya compares and recommends in one place",
  },
  {
    criterion_ar: "التكلفة",
    criterion_en: "Cost",
    google_ar: "مجاني",
    google_en: "Free",
    raya_ar: "مجاني تماماً على GoTripza",
    raya_en: "Completely free on GoTripza",
  },
];

export default async function AITravelAssistantPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);
  const isAr = locale === "ar";
  const dir = isAr ? "rtl" : "ltr";

  const chatHref = `/${locale}/search`;

  // JSON-LD FAQ schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: isAr ? "ما هي ريا؟" : "What is Raya?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isAr
            ? "ريا هي مساعدة السفر الذكية على GoTripza. تستطيع تخطيط رحلتك كاملة من الاقتراح حتى الحجز."
            : "Raya is GoTripza's AI travel assistant. She can plan your entire trip from suggestions to booking.",
        },
      },
      {
        "@type": "Question",
        name: isAr ? "هل ريا مجانية؟" : "Is Raya free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isAr
            ? "نعم، ريا مجانية تماماً. لا اشتراك ولا رسوم خفية."
            : "Yes, Raya is completely free. No subscription, no hidden fees.",
        },
      },
      {
        "@type": "Question",
        name: isAr
          ? "ما الذي يميز ريا عن Google؟"
          : "What makes Raya different from Google?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isAr
            ? "ريا تفهم سياق رحلتك وجنسيتك وميزانيتك وتقدم توصيات مخصصة، بينما يقدم Google نتائج عامة."
            : "Raya understands your trip context, nationality, and budget to deliver personalized recommendations, while Google returns generic results.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Navbar dict={dict} locale={locale} />

      <main className="min-h-screen bg-white" dir={dir}>

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-ink-950 via-[#1a1040] to-ink-950 px-4 py-20 sm:py-28">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-primary/30 bg-brand-primary/10 px-4 py-2 text-sm font-medium text-brand-primary backdrop-blur-sm">
              <span>✨</span>
              <span>
                {isAr ? "مجاني · بدون تسجيل" : "Free · No sign-up needed"}
              </span>
            </div>

            <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              {isAr ? (
                <>
                  أول مساعد سفر{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-mint">
                    ذكي مجاني
                  </span>
                </>
              ) : (
                <>
                  The first{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-mint">
                    free AI
                  </span>{" "}
                  travel assistant
                </>
              )}
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/60">
              {isAr
                ? "ريا لا تبحث فقط — بل تفهم رحلتك. أخبرها عن حلمك وهي تخطط لكل التفاصيل بناءً على ميزانيتك وجنسيتك وتفضيلاتك."
                : "Raya doesn't just search — she understands your trip. Tell her your dream and she'll plan every detail based on your budget, nationality, and preferences."}
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <a
                href={chatHref}
                className="inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-brand-primary to-brand-mint px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:scale-[1.03] hover:shadow-brand-primary/25 hover:shadow-xl"
              >
                <span>🤖</span>
                <span>
                  {isAr ? "ابدأ المحادثة مع ريا" : "Start chatting with Raya"}
                </span>
              </a>
              <p className="text-sm text-white/40">
                {isAr
                  ? "لا حساب مطلوب · مجاني تماماً"
                  : "No account required · completely free"}
              </p>
            </div>
          </div>
        </section>

        {/* ── How Raya Works ───────────────────────────────────────────── */}
        <section className="bg-gray-50 px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold text-ink-950 sm:text-4xl">
                {isAr ? "كيف تعمل ريا؟" : "How Raya works"}
              </h2>
              <p className="mt-3 text-gray-500">
                {isAr
                  ? "ثلاث خطوات بسيطة للوصول إلى رحلتك المثالية"
                  : "Three simple steps to your perfect trip"}
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              {HOW_IT_WORKS.map((step) => (
                <div
                  key={step.step}
                  className="relative flex flex-col rounded-2xl border border-gray-100 bg-white p-7 shadow-sm"
                >
                  <span className="absolute -top-3 start-6 rounded-full bg-ink-950 px-3 py-1 text-xs font-bold text-white/60">
                    {step.step}
                  </span>
                  <span className="mb-4 text-4xl">{step.icon}</span>
                  <h3 className="text-lg font-bold text-ink-950">
                    {isAr ? step.title_ar : step.title_en}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">
                    {isAr ? step.desc_ar : step.desc_en}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── What Raya Can Do ─────────────────────────────────────────── */}
        <section className="bg-white px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold text-ink-950 sm:text-4xl">
                {isAr ? "ماذا تستطيع ريا أن تفعل؟" : "What Raya can do for you"}
              </h2>
              <p className="mt-3 text-gray-500">
                {isAr
                  ? "ريا مدربة على كل جوانب السفر"
                  : "Raya is trained on every aspect of travel planning"}
              </p>
            </div>

            <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
              {CAPABILITIES.map((cap) => (
                <div
                  key={cap.label_en}
                  className="flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-6 text-center transition hover:border-brand-primary/30 hover:bg-brand-primary/5"
                >
                  <span className="text-3xl">{cap.icon}</span>
                  <span className="text-sm font-semibold text-ink-950 leading-snug">
                    {isAr ? cap.label_ar : cap.label_en}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why Not Just Google ──────────────────────────────────────── */}
        <section className="bg-gray-50 px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold text-ink-950 sm:text-4xl">
                {isAr ? "لماذا لا تستخدم Google فقط؟" : "Why not just Google it?"}
              </h2>
              <p className="mt-3 text-gray-500">
                {isAr
                  ? "الفرق بين البحث العادي والمساعد الذكي الحقيقي"
                  : "The difference between a search engine and a real AI assistant"}
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
              {/* Table header */}
              <div className="grid grid-cols-3 bg-ink-950 px-4 py-3 text-sm font-semibold text-white/70">
                <span>{isAr ? "المعيار" : "Criterion"}</span>
                <span className="text-center">Google</span>
                <span className="text-center text-brand-mint">
                  {isAr ? "ريا (GoTripza)" : "Raya (GoTripza)"}
                </span>
              </div>

              {COMPARISON_ROWS.map((row, i) => (
                <div
                  key={row.criterion_en}
                  className={`grid grid-cols-3 gap-2 px-4 py-4 text-sm ${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <span className="font-medium text-ink-950">
                    {isAr ? row.criterion_ar : row.criterion_en}
                  </span>
                  <span className="text-center text-gray-400">
                    {isAr ? row.google_ar : row.google_en}
                  </span>
                  <span className="text-center font-medium text-ink-950">
                    {isAr ? row.raya_ar : row.raya_en}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────────────── */}
        <section className="bg-white px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-3xl font-bold text-ink-950 mb-8 text-center sm:text-4xl">
              {isAr ? "أسئلة شائعة" : "Frequently asked questions"}
            </h2>

            <div className="space-y-4">
              {[
                {
                  q_ar: "هل ريا مجانية؟",
                  q_en: "Is Raya free?",
                  a_ar: "نعم، ريا مجانية تماماً. لا اشتراك ولا رسوم خفية.",
                  a_en: "Yes, Raya is completely free. No subscription, no hidden fees.",
                },
                {
                  q_ar: "هل أحتاج إلى إنشاء حساب؟",
                  q_en: "Do I need to create an account?",
                  a_ar: "لا، تستطيع البدء فوراً بدون تسجيل.",
                  a_en: "No, you can start right away with no sign-up required.",
                },
                {
                  q_ar: "ما اللغات التي تدعمها ريا؟",
                  q_en: "What languages does Raya support?",
                  a_ar: "ريا تتحدث العربية والإنجليزية بطلاقة.",
                  a_en: "Raya speaks both Arabic and English fluently.",
                },
                {
                  q_ar: "هل يمكن لريا مساعدتي في التأشيرة؟",
                  q_en: "Can Raya help me with visa requirements?",
                  a_ar: "نعم، ريا تعرف متطلبات التأشيرة لأغلب الجنسيات والوجهات.",
                  a_en: "Yes, Raya knows visa requirements for most nationalities and destinations.",
                },
              ].map((faq, i) => (
                <details
                  key={i}
                  className="group rounded-2xl border border-gray-100 bg-gray-50 px-6 py-4 transition open:bg-white open:shadow-sm"
                >
                  <summary className="cursor-pointer list-none font-semibold text-ink-950 flex items-center justify-between">
                    <span>{isAr ? faq.q_ar : faq.q_en}</span>
                    <span className="text-brand-primary transition-transform group-open:rotate-180">
                      ↓
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-gray-500">
                    {isAr ? faq.a_ar : faq.a_en}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Strong CTA ───────────────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-ink-950 via-[#1a1040] to-ink-950 px-4 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 text-5xl">🤖</div>
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              {isAr
                ? "جاهز لتخطيط رحلتك المثالية؟"
                : "Ready to plan your perfect trip?"}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/55">
              {isAr
                ? "ريا تنتظرك. ابدأ المحادثة الآن وخطط لرحلة لن تنساها."
                : "Raya is waiting. Start the conversation now and plan a trip you'll never forget."}
            </p>
            <a
              href={chatHref}
              className="mt-8 inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-brand-primary to-brand-mint px-10 py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-[1.03] hover:shadow-brand-primary/30 hover:shadow-xl"
            >
              <span>✨</span>
              <span>
                {isAr
                  ? "ابدأ التخطيط مع ريا"
                  : "Start planning with Raya"}
              </span>
            </a>
            <p className="mt-4 text-sm text-white/35">
              {isAr
                ? "مجاني · بدون تسجيل · يعمل فوراً"
                : "Free · No sign-up · Works instantly"}
            </p>
          </div>
        </section>
      </main>

      <Footer dict={dict} locale={locale} />
    </>
  );
}
