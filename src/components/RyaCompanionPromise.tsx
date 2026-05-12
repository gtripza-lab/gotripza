import Link from "next/link";
import {
  Brain,
  Camera,
  Languages,
  LifeBuoy,
  Map,
  ShieldCheck,
} from "lucide-react";
import type { Locale } from "@/i18n/config";

const ITEMS = [
  {
    icon: Brain,
    titleAr: "تفهم سياقك",
    titleEn: "Understands context",
    descAr: "ريا تتذكر الوجهة والميزانية ونوع الرحلة بدل أن تعيد نفس الأسئلة.",
    descEn: "Rya remembers destination, budget, and travel style instead of repeating questions.",
  },
  {
    icon: Map,
    titleAr: "تخطط بهدوء",
    titleEn: "Plans calmly",
    descAr: "تبدأ بالاستيعاب، ثم تبني خطة تناسب توقيتك ومخاوفك وطريقة سفرك.",
    descEn: "She listens first, then builds a plan around timing, concerns, and how you travel.",
  },
  {
    icon: ShieldCheck,
    titleAr: "تنبهك للمخاطر",
    titleEn: "Keeps you alert",
    descAr: "نصائح أمان، احتيال سياحي، مطارات، وتأمين عندما يصبح مفيداً فعلاً.",
    descEn: "Safety, travel scams, airport guidance, and insurance when it actually helps.",
  },
  {
    icon: Languages,
    titleAr: "تساعد في الترجمة",
    titleEn: "Helps with language",
    descAr: "عبارات جاهزة ومساعدة في المواقف اليومية داخل الرحلة.",
    descEn: "Practical phrases and help for everyday moments during the trip.",
  },
  {
    icon: Camera,
    titleAr: "تفهم صور السفر",
    titleEn: "Understands travel images",
    descAr: "قوائم طعام، لافتات، تذاكر، وشاشات مطار تتحول إلى خطوة واضحة أثناء الرحلة.",
    descEn: "Menus, signs, tickets, and airport screens become clear next steps during the trip.",
  },
  {
    icon: LifeBuoy,
    titleAr: "ترشح الخدمات في وقتها",
    titleEn: "Recommends naturally",
    descAr: "طيران، تأمين، شرائح، أنشطة، وسيارات تظهر داخل الحوار عندما تكون جاهزاً.",
    descEn: "Flights, insurance, eSIMs, activities, and cars appear when the conversation is ready.",
  },
];

export function RyaCompanionPromise({ locale }: { locale: Locale }) {
  const isAr = locale === "ar";

  return (
    <section className="border-y border-white/[0.06] bg-ink-950" dir={isAr ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-mint/70">
              {isAr ? "ريا هي المنتج" : "Rya First"}
            </p>
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              {isAr ? "رفيقة سفر تفهم الرحلة، لا مجرد شات" : "A travel companion, not just a chat box"}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/55">
              {isAr
                ? "GoTripza أصبح مبنياً حول ريا: محادثة طبيعية تبدأ بالفهم، ثم تقترح الخطة والخدمات المناسبة بدون إزعاج أو بطاقات حجز مبكرة."
                : "GoTripza now centers on Rya: a natural conversation that starts with understanding, then brings in the right plan and services without noisy booking spam."}
            </p>
          </div>
          <Link
            href={`/${locale}/travel-companion`}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] px-4 text-sm font-semibold text-white/80 transition hover:bg-white/[0.09] hover:text-white"
          >
            {isAr ? "تعرف على ريا" : "Meet Rya"}
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item) => (
            <div
              key={item.titleEn}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-5"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary/12 text-brand-mint">
                <item.icon className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <h3 className="font-semibold text-white/90">{isAr ? item.titleAr : item.titleEn}</h3>
              <p className="mt-2 text-sm leading-6 text-white/48">{isAr ? item.descAr : item.descEn}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
