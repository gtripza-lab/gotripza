import Link from "next/link";
import { ArrowUpRight, BadgeDollarSign, BarChart3, CheckCircle2, Copy, Crown, ShieldCheck, Sparkles, Users } from "lucide-react";
import { PartnerApplicationForm } from "@/components/partners/PartnerApplicationForm";
import { PARTNER_PRODUCTS, calculatePartnerCommission, formatPartnerCommission, formatPartnerUsd } from "@/lib/partner-config";

const ar = {
  badge: "Rya Partners",
  title: "حوّل تأثيرك في السفر إلى دخل مستمر مع ريا",
  subtitle:
    "برنامج شركاء حديث لصناع المحتوى، صفحات السفر، والمجتمعات التي تريد تقديم ريا مستشارة السفر لجمهورها بطريقة موثوقة ومربحة.",
  cta: "Become a Rya Partner",
  dashboard: "لوحة الشريك",
  sections: {
    what: "ما هو Rya Partners؟",
    how: "كيف تعمل العمولات؟",
    why: "لماذا تنضم؟",
    examples: "أمثلة عمولات",
    faq: "الأسئلة الشائعة",
  },
};

const en = {
  badge: "Rya Partners",
  title: "Turn your travel influence into recurring growth with Rya",
  subtitle:
    "A modern partner program for creators, travel pages, and communities introducing Rya travel advisor to their audience in a trusted, premium way.",
  cta: "Become a Rya Partner",
  dashboard: "Partner dashboard",
  sections: {
    what: "What is Rya Partners?",
    how: "How commissions work",
    why: "Why join",
    examples: "Commission examples",
    faq: "FAQ",
  },
};

export function PartnersLanding({ locale = "ar" }: { locale?: string }) {
  const isAr = locale === "ar";
  const t = isAr ? ar : en;
  const dir = isAr ? "rtl" : "ltr";
  const companion = PARTNER_PRODUCTS.rya_companion;
  const plan = PARTNER_PRODUCTS.plan_my_trip;
  const companionCommission = calculatePartnerCommission(companion.priceUsd, companion.commissionRate);
  const planCommission = calculatePartnerCommission(plan.priceUsd, plan.commissionRate);
  const monthlyExampleCommission = companionCommission * 50 + planCommission * 80;

  const features = isAr
    ? [
        ["روابط وكود إحالة", "يحصل كل شريك معتمد على رابط وكود قابل للمشاركة في الفيديوهات، البايو، القصص، والمجتمعات."],
        ["لوحة أداء حديثة", "نقرات، تسجيلات، تحويلات، عمولات، مصادر الزيارات، ومحتوى يحقق أفضل أداء."],
        ["أصول تسويقية جاهزة", "شعارات، عبارات، قوالب فيديو، ومرشد محتوى يساعدك تبدأ بسرعة."],
        ["منصة قابلة للنمو", "جاهزة لمستويات سفراء، حملات موسمية، مسابقات، مكافآت، وعمولات متقدمة لاحقاً."],
      ]
    : [
        ["Referral link and code", "Every approved partner receives a trackable link and code for videos, bios, stories, and communities."],
        ["Modern performance dashboard", "Clicks, signups, conversions, commissions, traffic sources, and best-performing content."],
        ["Ready marketing assets", "Logos, captions, video templates, and creator guides to help you launch quickly."],
        ["Built for scale", "Ready for ambassador tiers, seasonal campaigns, contests, rewards, and advanced commissions."],
      ];

  const faqs = isAr
    ? [
        ["متى يبدأ الرابط بالعمل؟", "بعد مراجعة الطلب والموافقة عليه من لوحة الإدارة، يتم تفعيل رابطك وكودك تلقائياً."],
        [
          "كم العمولة؟",
          `${companion.arabicName} سعرها ${formatPartnerUsd(companion.priceUsd)} وعمولتها ${formatPartnerCommission(companion.commissionRate)}. خدمة ${plan.arabicName} سعرها ${formatPartnerUsd(plan.priceUsd)} وعمولتها ${formatPartnerCommission(plan.commissionRate)}.`,
        ],
        ["هل أحتاج موقعاً؟", "لا. يمكنك استخدام TikTok أو Instagram أو X أو YouTube أو أي مجتمع سفر لديك."],
        ["كيف يتم الدفع؟", "تظهر العمولات أولاً كرصيد معلق، ثم تعتمد وتدفع حسب دورة الدفع التي يحددها GoTripza."],
      ]
    : [
        ["When does my link work?", "After manual approval in the admin dashboard, your referral link and code become active."],
        [
          "What are the commissions?",
          `${companion.name} is ${formatPartnerUsd(companion.priceUsd)} with ${formatPartnerCommission(companion.commissionRate)} commission. ${plan.name} is ${formatPartnerUsd(plan.priceUsd)} with ${formatPartnerCommission(plan.commissionRate)} commission.`,
        ],
        ["Do I need a website?", "No. You can use TikTok, Instagram, X, YouTube, or any travel community."],
        ["How do payouts work?", "Commissions start as pending, then get approved and paid through GoTripza's payout cycle."],
      ];

  return (
    <main dir={dir} className="min-h-screen overflow-hidden bg-[#060A13] text-white">
      <section className="relative overflow-x-hidden border-b border-white/10 px-5 py-20 md:px-10 md:py-28">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,0.28),transparent_34%),radial-gradient(circle_at_85%_20%,rgba(139,92,246,0.22),transparent_30%),linear-gradient(180deg,rgba(0,212,179,0.06),transparent_45%)]"
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-[#00D4B3]">
              <Crown className="h-3.5 w-3.5" />
              {t.badge}
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
              {t.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/58 md:text-lg">
              {t.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#apply" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#060A13] transition hover:bg-white/90">
                {t.cta}
                <ArrowUpRight className="h-4 w-4 shrink-0" />
              </a>
              <Link href="/partner/dashboard" className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-white/80 transition hover:bg-white/[0.08]">
                {t.dashboard}
              </Link>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <div className="rounded-[24px] border border-white/10 bg-[#0B1020] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/35">{isAr ? "مثال أداء شهري" : "Monthly example"}</p>
                  <p className="mt-1 text-xl font-bold">Rya Creator Dashboard</p>
                </div>
                <Sparkles className="h-6 w-6 text-[#8B5CF6]" />
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  [isAr ? "النقرات" : "Clicks", "12,480"],
                  [isAr ? "التسجيلات" : "Signups", "864"],
                  [isAr ? "التحويلات" : "Conversions", "96"],
                  [isAr ? "عمولة متوقعة" : "Commission", formatPartnerUsd(monthlyExampleCommission)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-xs text-white/35">{label}</p>
                    <p className="mt-1 text-2xl font-black">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-2xl border border-[#00D4B3]/20 bg-[#00D4B3]/10 p-4 text-sm leading-7 text-[#BFFCF3]">
                {isAr
                  ? "كل رابط يحفظ المصدر، الحملة، الزيارات، التسجيلات، والتحويلات حتى تعرف أي محتوى يحقق أفضل عائد."
                  : "Every link tracks source, campaign, visits, signups, and conversions so you know what content performs."}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 md:px-10">
        <div className="grid gap-4 md:grid-cols-4">
          {features.map(([title, body], index) => {
            const icons = [Copy, BarChart3, Sparkles, Users];
            const Icon = icons[index] ?? CheckCircle2;
            return (
              <article key={title} className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
                <Icon className="h-6 w-6 text-[#3B82F6]" />
                <h2 className="mt-5 text-lg font-bold">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-white/48">{body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-10 md:grid-cols-3 md:px-10">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <BadgeDollarSign className="h-7 w-7 text-[#00D4B3]" />
          <h2 className="mt-5 text-2xl font-black">{t.sections.examples}</h2>
          <p className="mt-3 text-sm leading-7 text-white/50">
            {isAr
              ? `إذا باع شريك 50 اشتراك ${companion.arabicName} و80 خطة رحلة، يمكن أن تصل عمولته إلى ${formatPartnerUsd(monthlyExampleCommission)} من محتوى واحد ناجح.`
              : `If a partner sells 50 ${companion.name} activations and 80 trip plans, commission can reach ${formatPartnerUsd(monthlyExampleCommission)} from one strong content cycle.`}
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:col-span-2">
          <ShieldCheck className="h-7 w-7 text-[#8B5CF6]" />
          <h2 className="mt-5 text-2xl font-black">{t.sections.how}</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[
              isAr ? "قدّم طلب الانضمام" : "Apply",
              isAr ? "نراجع الحساب والجمهور" : "Manual review",
              isAr ? "شارك رابطك واكسب" : "Share and earn",
            ].map((item, index) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs text-white/30">0{index + 1}</p>
                <p className="mt-2 font-bold">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="apply" className="mx-auto grid max-w-6xl gap-8 px-5 py-16 md:px-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-sm font-bold text-[#00D4B3]">{t.cta}</p>
          <h2 className="mt-3 text-3xl font-black md:text-4xl">
            {isAr ? "ابدأ كشريك ريا" : "Apply to become a Rya Partner"}
          </h2>
          <p className="mt-4 text-sm leading-7 text-white/50">
            {isAr
              ? "نبحث عن شركاء يقدمون قيمة حقيقية للمسافرين، وليس مجرد روابط. أخبرنا عن جمهورك وكيف ستقدم ريا لهم."
              : "We look for partners who help travelers, not just post links. Tell us about your audience and how you will introduce Rya."}
          </p>
          <div className="mt-6 space-y-3">
            {[
              isAr ? "مراجعة يدوية لحماية جودة البرنامج" : "Manual approval to protect program quality",
              isAr ? "رابط وكود خاص بعد القبول" : "Unique link and code after approval",
              isAr ? "عمولات جاهزة للتوسع مع منتجات السفر" : "Commissions ready to scale with travel products",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-white/62">
                <CheckCircle2 className="h-4 w-4 text-[#00D4B3]" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <PartnerApplicationForm locale={locale} />
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20 md:px-10">
        <h2 className="text-2xl font-black">{t.sections.faq}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {faqs.map(([q, a]) => (
            <div key={q} className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
              <h3 className="font-bold">{q}</h3>
              <p className="mt-2 text-sm leading-7 text-white/48">{a}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
