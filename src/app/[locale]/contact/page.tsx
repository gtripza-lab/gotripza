import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const BASE = "https://gotripza.com";

export function generateMetadata({ params }: { params: { locale: string } }) {
  const locale = params.locale;
  const canonical = `${BASE}/${locale}/contact`;
  return {
    title:
      locale === "ar"
        ? "تواصل معنا — GoTripza"
        : "Contact Us — GoTripza",
    description:
      locale === "ar"
        ? "تواصل مع فريق GoTripza للاستفسارات والشراكات والدعم."
        : "Get in touch with the GoTripza team for enquiries, partnerships, and support.",
    alternates: {
      canonical,
      languages: {
        ar: `${BASE}/ar/contact`,
        en: `${BASE}/en/contact`,
        "x-default": `${BASE}/ar/contact`,
      },
    },
  };
}

export default async function ContactPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale as Locale);
  const isAr = locale === "ar";

  const contacts = isAr
    ? [
        {
          icon: "✉️",
          title: "الاستفسارات العامة",
          value: "hello@gotripza.com",
          href: "mailto:hello@gotripza.com",
          desc: "للأسئلة العامة والاقتراحات",
        },
        {
          icon: "🤝",
          title: "الشراكات والتعاون",
          value: "partners@gotripza.com",
          href: "mailto:partners@gotripza.com",
          desc: "للشركات والجهات المهتمة بالتعاون",
        },
        {
          icon: "🔒",
          title: "الخصوصية والبيانات",
          value: "privacy@gotripza.com",
          href: "mailto:privacy@gotripza.com",
          desc: "لطلبات حماية البيانات والخصوصية",
        },
        {
          icon: "⚖️",
          title: "الشؤون القانونية",
          value: "legal@gotripza.com",
          href: "mailto:legal@gotripza.com",
          desc: "للاستفسارات القانونية والامتثال",
        },
      ]
    : [
        {
          icon: "✉️",
          title: "General Enquiries",
          value: "hello@gotripza.com",
          href: "mailto:hello@gotripza.com",
          desc: "For general questions and suggestions",
        },
        {
          icon: "🤝",
          title: "Partnerships",
          value: "partners@gotripza.com",
          href: "mailto:partners@gotripza.com",
          desc: "For companies interested in collaboration",
        },
        {
          icon: "🔒",
          title: "Privacy & Data",
          value: "privacy@gotripza.com",
          href: "mailto:privacy@gotripza.com",
          desc: "For data protection and privacy requests",
        },
        {
          icon: "⚖️",
          title: "Legal",
          value: "legal@gotripza.com",
          href: "mailto:legal@gotripza.com",
          desc: "For legal and compliance enquiries",
        },
      ];

  return (
    <>
      <Navbar dict={dict} locale={locale as Locale} />
      <main className="mx-auto max-w-3xl px-6 py-20">

        <div className="mb-12">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-primary/70">
            {isAr ? "تواصل معنا" : "Contact"}
          </p>
          <h1 className="font-display text-4xl font-bold sm:text-5xl">
            {isAr ? "نحن هنا للمساعدة" : "We're Here to Help"}
          </h1>
          <p className="mt-4 text-lg text-white/60">
            {isAr
              ? "لأي استفسار أو اقتراح أو فكرة تعاون، لا تتردد في التواصل معنا."
              : "For any enquiry, suggestion, or collaboration idea, don't hesitate to reach out."}
          </p>
        </div>

        {/* Contact cards */}
        <div className="mb-12 grid gap-4 sm:grid-cols-2">
          {contacts.map((c) => (
            <a
              key={c.title}
              href={c.href}
              className="group flex flex-col gap-2 rounded-2xl border border-white/8 bg-white/[0.03] p-5 transition hover:border-brand-primary/30 hover:bg-brand-primary/5"
            >
              <div className="text-2xl">{c.icon}</div>
              <div className="font-semibold text-white/90 group-hover:text-white">
                {c.title}
              </div>
              <div className="text-sm font-medium text-brand-primary">{c.value}</div>
              <div className="text-xs text-white/45">{c.desc}</div>
            </a>
          ))}
        </div>

        {/* Response time notice */}
        <div className="mb-12 rounded-2xl border border-brand-mint/20 bg-brand-mint/5 p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⏱️</span>
            <div>
              <div className="font-semibold text-white/90">
                {isAr ? "وقت الاستجابة" : "Response Time"}
              </div>
              <p className="mt-1 text-sm text-white/60">
                {isAr
                  ? "نسعى للرد على جميع الاستفسارات خلال 1-2 يوم عمل. للحالات العاجلة يرجى الإشارة إلى ذلك في عنوان الرسالة."
                  : "We aim to respond to all enquiries within 1-2 business days. For urgent matters, please indicate that in the subject line."}
              </p>
            </div>
          </div>
        </div>

        {/* About section link */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <p className="mb-1 text-sm text-white/50">
            {isAr ? "تريد معرفة المزيد عنا؟" : "Want to learn more about us?"}
          </p>
          <a
            href={`/${locale}/about`}
            className="font-semibold text-brand-primary hover:underline"
          >
            {isAr ? "اقرأ صفحة من نحن ←" : "Read our About page →"}
          </a>
        </div>

      </main>
      <Footer dict={dict} locale={locale as Locale} />
    </>
  );
}
