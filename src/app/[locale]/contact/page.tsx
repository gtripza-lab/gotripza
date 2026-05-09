import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ContactForm } from "@/components/ContactForm";

const BASE = "https://gotripza.com";

export function generateMetadata({ params }: { params: { locale: string } }) {
  const locale = params.locale;
  const canonical = `${BASE}/${locale}/contact`;
  return {
    title:
      locale === "ar"
        ? "تواصل معنا"
        : "Contact Us",
    description:
      locale === "ar"
        ? "تواصل مع فريق GoTripza للاستفسارات والشراكات والدعم."
        : "Get in touch with the GoTripza team for enquiries, partnerships, and support.",
    alternates: {
      canonical,
      languages: {
        ar: `${BASE}/ar/contact`,
        en: `${BASE}/en/contact`,
        "x-default": `${BASE}/en/contact`,
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

  return (
    <>
      <Navbar dict={dict} locale={locale as Locale} />
      <main className="mx-auto max-w-2xl px-6 py-20 pb-20 md:pb-0">

        {/* Header */}
        <div className="mb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-primary/70">
            {isAr ? "تواصل معنا" : "Contact"}
          </p>
          <h1 className="font-display text-4xl font-bold sm:text-5xl">
            {isAr ? "نحن هنا للمساعدة" : "We're Here to Help"}
          </h1>
          <p className="mt-4 text-lg text-white/60">
            {isAr
              ? "أرسل لنا رسالة وسنرد عليك في أقرب وقت ممكن."
              : "Send us a message and we'll get back to you as soon as possible."}
          </p>
        </div>

        {/* Contact form */}
        <div className="mb-10 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 sm:p-8">
          <ContactForm locale={locale as Locale} />
        </div>

        {/* Response time notice */}
        <div className="mb-10 rounded-2xl border border-brand-mint/20 bg-brand-mint/5 p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⏱️</span>
            <div>
              <div className="font-semibold text-white/90">
                {isAr ? "وقت الاستجابة" : "Response Time"}
              </div>
              <p className="mt-1 text-sm text-white/60">
                {isAr
                  ? "نسعى للرد على جميع الاستفسارات خلال 1-2 يوم عمل."
                  : "We aim to respond to all enquiries within 1-2 business days."}
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
