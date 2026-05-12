import Link from "next/link";
import { MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import type { Locale } from "@/i18n/config";

const EXAMPLES = [
  {
    ar: {
      user: "أبغى أسافر إسطنبول 7 أيام بس متردد من الزحمة.",
      rya: "خلّينا نختار توقيت أهدأ ونبني جدول خفيف: يومان للسلطان أحمد، يوم للبسفور، ويوم مفتوح للتسوق. إذا ميزانيتك متوسطة، كاراكوي أو شيشلي أسهل من تقسيم.",
      cta: "خططي لي إسطنبول",
    },
    en: {
      user: "I want Istanbul for 7 days, but I’m worried about crowds.",
      rya: "Let’s choose a calmer timing and a lighter rhythm: two days for Sultanahmet, one Bosphorus day, and one flexible shopping day. For mid-range comfort, Karakoy or Sisli may feel easier than Taksim.",
      cta: "Plan Istanbul",
    },
    promptAr: "خططي لي رحلة إسطنبول 7 أيام بدون زحمة، بميزانية متوسطة",
    promptEn: "Plan Istanbul for 7 days with fewer crowds and a mid-range budget",
  },
  {
    ar: {
      user: "أوصل المطار 2 الليل ومعي عائلة، وش الأفضل؟",
      rya: "في هذا التوقيت لا أخاطر بالمواصلات العشوائية. الأفضل انتقال رسمي أو تطبيق موثوق، وفندق قريب من المنطقة الأولى. جهز شريحة eSIM قبل الوصول حتى لا تتعطل بالخرائط.",
      cta: "ساعديني في الوصول",
    },
    en: {
      user: "I land at 2 AM with family. What should I do?",
      rya: "At that hour, avoid random transport. Use an official transfer or trusted app, stay close to your first area, and prepare an eSIM before arrival so maps work immediately.",
      cta: "Help with arrival",
    },
    promptAr: "أصل المطار الساعة 2 الليل ومعي عائلة، ساعديني أخطط الوصول بأمان",
    promptEn: "I land at 2 AM with family. Help me plan arrival safely",
  },
  {
    ar: {
      user: "هل أحتاج تأمين وشريحة في اليابان؟",
      rya: "لليابان الشريحة مفيدة جداً للخرائط والترجمة والقطارات. التأمين أنصح به إذا الرحلة طويلة أو فيها أطفال أو حجوزات غالية. لا أفتح لك روابط إلا إذا قررت أنها مناسبة لك.",
      cta: "راجعي تجهيزاتي",
    },
    en: {
      user: "Do I need insurance and eSIM for Japan?",
      rya: "For Japan, an eSIM is very useful for maps, translation, and trains. Insurance is worth it for longer trips, kids, or expensive bookings. I’ll only bring links if they fit your trip.",
      cta: "Check my prep",
    },
    promptAr: "راجعي تجهيزاتي لليابان: تأمين، شريحة، ميزانية، وتنبيهات مهمة",
    promptEn: "Review my Japan prep: insurance, eSIM, budget, and important alerts",
  },
];

export function RyaConversationExamples({ locale }: { locale: Locale }) {
  const isAr = locale === "ar";

  return (
    <section className="border-y border-white/[0.06] bg-ink-950" dir={isAr ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 max-w-3xl">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-mint/70">
            {isAr ? "لحظات ريا" : "Rya moments"}
          </p>
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            {isAr ? "ليست إجابات عامة، بل قرارات سفر أوضح" : "Not generic answers, clearer travel decisions"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-white/55">
            {isAr
              ? "ريا تفهم القلق والميزانية والرفقة والتوقيت، ثم تقترح الخطوة التالية بدون دفع روابط حجز مبكرة."
              : "Rya understands concerns, budget, companions, and timing, then suggests the next step without pushing booking links too early."}
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          {EXAMPLES.map((example) => {
            const text = isAr ? example.ar : example.en;
            const prompt = isAr ? example.promptAr : example.promptEn;
            return (
              <article
                key={text.user}
                className="flex min-h-[22rem] flex-col rounded-2xl border border-white/[0.07] bg-white/[0.035] p-5"
              >
                <div className="mb-5 flex items-center gap-2 text-xs font-semibold text-white/35">
                  <MessageCircle className="h-4 w-4 text-brand-primary" />
                  {isAr ? "مثال محادثة" : "Conversation example"}
                </div>
                <div className="space-y-3">
                  <div className="rounded-2xl rounded-br-sm bg-brand-primary px-4 py-3 text-sm leading-7 text-white">
                    {text.user}
                  </div>
                  <div className="rounded-2xl rounded-bl-sm border border-white/[0.10] bg-white/[0.06] px-4 py-3 text-sm leading-7 text-white/75">
                    <span className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-mint">
                      <Sparkles className="h-3.5 w-3.5" />
                      {isAr ? "ريا" : "Rya"}
                    </span>
                    <p>{text.rya}</p>
                  </div>
                </div>
                <Link
                  href={`/${locale}/search?q=${encodeURIComponent(prompt)}`}
                  className="mt-auto inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 text-sm font-semibold text-white/78 transition hover:bg-white/[0.09] hover:text-white"
                >
                  <ShieldCheck className="h-4 w-4 text-brand-mint" />
                  {text.cta}
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

