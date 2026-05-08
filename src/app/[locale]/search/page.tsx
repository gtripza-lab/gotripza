import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { Navbar } from "@/components/Navbar";
import { getDictionary } from "@/i18n/get-dictionary";
import { ChatProvider } from "@/components/chat/ChatContext";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { detectGeo } from "@/lib/geo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}) {
  const isAr = params.locale === "ar";
  return {
    title: isAr
      ? "ريا — مستشارة السفر الذكية"
      : "Raya — AI Travel Advisor",
    description: isAr
      ? "تحدث مع ريا، أول مساعد سفر ذكي مجاني يفهمك ويخطط رحلتك معك خطوة بخطوة. طيران · فنادق · تأمين · أنشطة."
      : "Chat with Raya, the first free AI travel assistant that actually understands your trip and plans it step by step.",
    alternates: {
      canonical: isAr
        ? "https://gotripza.com/ar/search"
        : "https://gotripza.com/en/search",
      languages: {
        ar: "https://gotripza.com/ar/search",
        en: "https://gotripza.com/en/search",
        "x-default": "https://gotripza.com/en/search",
      },
    },
  };
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams?: { q?: string };
}) {
  const { locale } = params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale as Locale);
  const { currency } = detectGeo();
  // Read ?q= from URL (e.g. from homepage suggestion chips or blog CTAs)
  const initialMessage = searchParams?.q?.trim() || undefined;

  return (
    <>
      <Navbar dict={dict} locale={locale as Locale} />
      <main
        className="overflow-hidden bg-[#06111e] h-[calc(100dvh-128px)] md:h-[calc(100dvh-64px)]"
      >
        <ChatProvider locale={locale as Locale} initialCurrency={currency} initialMessage={initialMessage}>
          <ChatInterface dict={dict} />
        </ChatProvider>
      </main>
    </>
  );
}
