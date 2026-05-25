import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { Navbar } from "@/components/Navbar";
import { getDictionary } from "@/i18n/get-dictionary";
import { ChatProvider } from "@/components/chat/ChatContext";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { detectGeo } from "@/lib/geo";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string }>;
  }
) {
  const params = await props.params;
  const isAr = params.locale === "ar";
  return {
    title: isAr
      ? "ريا — رفيقة السفر الذكية"
      : "Rya — Travel Companion",
    description: isAr
      ? "تحدث مع ريا، مساعد السفر الذكي الذي يفهمك ويخطط رحلتك خطوة بخطوة. طيران · مناطق سكن · تأمين · أنشطة."
      : "Chat with Rya, the travel companion that understands your trip, remembers context, and helps you plan step by step.",
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
    robots: {
      index: false,
      follow: true,
      googleBot: {
        index: false,
        follow: true,
      },
    },
  };
}

export default async function SearchPage(
  props: {
    params: Promise<{ locale: string }>;
    searchParams?: Promise<{ q?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const { locale } = params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale as Locale);
  const { currency } = await detectGeo();
  // Read ?q= from URL (e.g. from homepage suggestion chips or blog CTAs)
  const initialMessage = searchParams?.q?.trim() || undefined;

  return (
    // Outer wrapper fills the mobile viewport and never grows wider than it.
    <div className="chat-viewport-lock rya-chat-shell fixed inset-0 flex w-[100dvw] max-w-[100dvw] flex-col bg-[#06111e]">
      <Navbar dict={dict} locale={locale as Locale} />
      {/*
        flex-1 + min-h-0 → fills remaining height after Navbar (works on all devices).
        The mobile BottomNav is intentionally hidden on /search so Rya has the
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
