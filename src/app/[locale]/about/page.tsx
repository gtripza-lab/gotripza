import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export function generateMetadata({ params }: { params: { locale: string } }) {
  return {
    title:
      params.locale === "ar"
        ? "من نحن — GoTripza"
        : "About Us — GoTripza",
    description:
      params.locale === "ar"
        ? "تعرّف على GoTripza، منصة البحث الذكي عن السفر التي تساعدك في إيجاد أفضل رحلاتك وفنادقك بسهولة."
        : "Learn about GoTripza, the AI-powered travel search platform helping you find the best flights and hotels effortlessly.",
  };
}

export default async function AboutPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale as Locale);
  const isAr = locale === "ar";

  return (
    <>
      <Navbar dict={dict} locale={locale as Locale} />
      <main className="mx-auto max-w-3xl px-6 py-20">

        {/* Hero */}
        <div className="mb-14">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-primary/70">
            {isAr ? "من نحن" : "About"}
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
            {isAr
              ? "نُعيد تعريف تجربة البحث عن السفر"
              : "Redefining How You Search for Travel"}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-white/65">
            {isAr
              ? "GoTripza هي منصة سفر مدعومة بالذكاء الاصطناعي، تتيح لك البحث عن رحلتك بكلماتك الطبيعية والحصول على أفضل الخيارات في ثوانٍ."
              : "GoTripza is an AI-powered travel platform that lets you search for trips in natural language and get the best options in seconds."}
          </p>
        </div>

        {/* Mission */}
        <div className="mb-12 rounded-3xl border border-brand-primary/20 bg-gradient-to-br from-brand-primary/10 to-brand-deep/5 p-8">
          <h2 className="mb-4 font-display text-2xl font-bold text-white">
            {isAr ? "مهمتنا" : "Our Mission"}
          </h2>
          <p className="leading-relaxed text-white/75">
            {isAr
              ? "نؤمن بأن التخطيط للسفر يجب أن يكون ممتعاً وسهلاً، لا مرهقاً ومعقداً. مهمتنا هي تحويل فكرة الرحلة من مجرد خاطرة في رأسك إلى خيارات واضحة وأسعار حقيقية — باستخدام قوة الذكاء الاصطناعي والشراكات مع كبرى منصات السفر العالمية."
              : "We believe planning travel should be enjoyable and effortless, not stressful and complicated. Our mission is to transform a trip idea from a thought in your head into clear options and real prices — using the power of AI and partnerships with the world's leading travel platforms."}
          </p>
        </div>

        {/* How it works */}
        <div className="mb-12">
          <h2 className="mb-6 font-display text-2xl font-bold text-white">
            {isAr ? "كيف يعمل GoTripza؟" : "How GoTripza Works"}
          </h2>
          <div className="space-y-5">
            {(isAr
              ? [
                  { step: "١", title: "صف رحلتك بكلماتك", desc: 'اكتب ما تريد بالعربية أو الإنجليزية — مثل "رحلة لعائلتي إلى إسطنبول في يوليو بميزانية معقولة"' },
                  { step: "٢", title: "يحلل الذكاء الاصطناعي طلبك", desc: "يفهم نموذج Gemini AI نيتك ويستخرج الوجهة والتواريخ وعدد المسافرين وتفضيلاتك." },
                  { step: "٣", title: "نبحث في مئات المصادر", desc: "نستعلم من شركاء Travelpayouts عن أفضل أسعار الطيران والفنادق في الوقت الفعلي." },
                  { step: "٤", title: "تحصل على 3 خيارات مُختارة", desc: "نعرض لك أفضل قيمة + الأرخص + الأريح — لا فوضى، لا إرهاق من الخيارات." },
                  { step: "٥", title: "احجز مباشرة مع الشريك", desc: "عند النقر على الحجز، يتم توجيهك مباشرة لموقع الشريك الموثوق لإتمام الحجز بأمان." },
                ]
              : [
                  { step: "1", title: "Describe your trip naturally", desc: 'Write what you want in English or Arabic — like "family trip to Istanbul in July with a reasonable budget"' },
                  { step: "2", title: "AI analyses your request", desc: "Our Gemini AI model understands your intent and extracts destination, dates, traveller count, and preferences." },
                  { step: "3", title: "We search hundreds of sources", desc: "We query Travelpayouts partners for real-time best prices on flights and hotels." },
                  { step: "4", title: "You get 3 curated options", desc: "We show you Best Value + Cheapest + Most Comfortable — no clutter, no decision fatigue." },
                  { step: "5", title: "Book directly with the partner", desc: "When you click book, you're taken straight to the trusted partner site to complete your booking securely." },
                ]
            ).map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-primary/20 font-display text-sm font-bold text-brand-primary">
                  {item.step}
                </div>
                <div>
                  <div className="font-semibold text-white/90">{item.title}</div>
                  <div className="mt-0.5 text-sm leading-relaxed text-white/55">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why trust us */}
        <div className="mb-12">
          <h2 className="mb-6 font-display text-2xl font-bold text-white">
            {isAr ? "لماذا GoTripza؟" : "Why GoTripza?"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {(isAr
              ? [
                  { icon: "🤖", title: "بحث بالذكاء الاصطناعي", desc: "لا نماذج معقدة. فقط صف رحلتك كما تتحدث." },
                  { icon: "💰", title: "بدون رسوم إضافية", desc: "أسعار مماثلة تماماً لما تجده على مواقع الحجز المباشر." },
                  { icon: "🔍", title: "مقارنة مئات المصادر", desc: "نبحث في آلاف الرحلات والفنادق لنقدم لك الأفضل." },
                  { icon: "🛡️", title: "شفافية تامة", desc: "نُفصح عن علاقاتنا التجارية بوضوح. نحن نعمل لصالحك." },
                  { icon: "🌍", title: "ثنائي اللغة", desc: "واجهة كاملة بالعربية والإنجليزية مع دعم العملات المحلية." },
                  { icon: "⚡", title: "نتائج فورية", desc: "نتائج دقيقة في ثوانٍ، لا دقائق." },
                ]
              : [
                  { icon: "🤖", title: "AI-powered search", desc: "No complex forms. Just describe your trip the way you talk." },
                  { icon: "💰", title: "No extra fees", desc: "Prices identical to what you'd find booking directly." },
                  { icon: "🔍", title: "Hundreds of sources compared", desc: "We search thousands of flights and hotels to surface the best." },
                  { icon: "🛡️", title: "Full transparency", desc: "We clearly disclose our commercial relationships. We work for you." },
                  { icon: "🌍", title: "Bilingual", desc: "Full Arabic and English interface with local currency support." },
                  { icon: "⚡", title: "Instant results", desc: "Accurate results in seconds, not minutes." },
                ]
            ).map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                <div className="mb-2 text-2xl">{item.icon}</div>
                <div className="font-semibold text-white/90">{item.title}</div>
                <div className="mt-1 text-sm text-white/55">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Partners */}
        <div className="mb-12">
          <h2 className="mb-4 font-display text-2xl font-bold text-white">
            {isAr ? "شركاؤنا" : "Our Partners"}
          </h2>
          <p className="mb-5 text-sm leading-relaxed text-white/65">
            {isAr
              ? "نشارك مع منصة Travelpayouts الرائدة للتحالف السياحي، والتي تضم أكثر من 100 شريك من كبرى شركات الطيران ومنصات الفنادق حول العالم."
              : "We partner with Travelpayouts, a leading travel affiliate network featuring over 100 partners including major airlines and hotel platforms worldwide."}
          </p>
          <div className="flex flex-wrap gap-3">
            {["Aviasales", "Hotellook", "DiscoverCars", "GetYourGuide", "Kiwitaxi", "Omio"].map(
              (partner) => (
                <span
                  key={partner}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm text-white/70"
                >
                  {partner}
                </span>
              ),
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <h2 className="mb-2 font-display text-2xl font-bold text-white">
            {isAr ? "هل لديك سؤال؟" : "Have a question?"}
          </h2>
          <p className="mb-5 text-sm text-white/60">
            {isAr
              ? "يسعدنا الاستماع إليك. تواصل مع فريق GoTripza."
              : "We'd love to hear from you. Reach out to the GoTripza team."}
          </p>
          <a
            href={`/${locale}/contact`}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-primary to-brand-deep px-6 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02]"
          >
            {isAr ? "تواصل معنا" : "Contact Us"}
          </a>
        </div>

      </main>
      <Footer dict={dict} locale={locale as Locale} />
    </>
  );
}
