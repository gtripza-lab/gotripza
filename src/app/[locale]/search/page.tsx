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
    // Outer wrapper fills the mobile viewport and never grows wider than it.
    <div className="chat-viewport-lock flex h-[100dvh] min-h-[100svh] w-[100dvw] max-w-[100dvw] flex-col bg-[#06111e]">
      <Navbar dict={dict} locale={locale as Locale} />
      {/*
        flex-1 + min-h-0 → fills remaining height after Navbar (works on all devices).
        The mobile BottomNav is intentionally hidden on /search so Raya has the
        full visual viewport, especially when the iOS keyboard is open.
      */}
      <main className="chat-viewport-lock min-h-0 min-w-0 flex-1">
        <ChatProvider locale={locale as Locale} initialCurrency={currency} initialMessage={initialMessage}>
          <ChatInterface dict={dict} />
        </ChatProvider>
      </main>
    </div>
  );
}
