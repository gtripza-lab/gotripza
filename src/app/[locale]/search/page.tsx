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
      ? "ريا — مستشارة السفر الذكية | GoTripza"
      : "Raya — AI Travel Advisor | GoTripza",
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
        "x-default": "https://gotripza.com/ar/search",
      },
    },
  };
}

export default async function SearchPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale as Locale);
  const { currency } = detectGeo();

  return (
    <>
      <Navbar dict={dict} locale={locale as Locale} />
      {/*
        Full-viewport chat — clean, focused, no distractions.
        Raya handles everything inside the conversation:
        flights, hotels, insurance, eSIM, activities, visa info.
      */}
      <main
        className="overflow-hidden bg-[#06111e]"
        style={{ height: "calc(100dvh - 64px)" }}
      >
        <ChatProvider locale={locale as Locale} initialCurrency={currency}>
          <ChatInterface dict={dict} />
        </ChatProvider>
      </main>
    </>
  );
}
