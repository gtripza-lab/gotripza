/**
 * Chat Service Recommendations
 * Maps detected user intent → service cards shown in chat
 * Used by the free chat to monetize via affiliate links
 */

import { buildAviasalesUrl, buildPartnerUrl } from "@/lib/partners";

export type ServiceCard = {
  id: string;
  icon: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  url: string;
  color: string; // tailwind accent color
};

type RecommendInput = {
  serviceInterests: string[];
  destination?: string | null;
  origin?: string | null;
  locale: "ar" | "en";
};

// ── Build cards based on detected service interests ────────────────────────────
export function buildServiceCards(input: RecommendInput): ServiceCard[] {
  const cards: ServiceCard[] = [];
  const { serviceInterests, destination, origin } = input;

  // Flights
  if (serviceInterests.some((s) => ["flights", "airport_help", "transport"].includes(s))) {
    const url = buildAviasalesUrl({
      origin: origin ?? undefined,
      destination: destination ?? undefined,
    }) ?? "https://www.aviasales.com/";
    cards.push({
      id: "flights",
      icon: "✈️",
      titleAr: "ابحث عن أرخص رحلة",
      titleEn: "Find cheapest flight",
      descAr: "قارن أسعار الطيران من مئات الخطوط",
      descEn: "Compare fares across hundreds of airlines",
      url,
      color: "blue",
    });
  }

  // eSIM
  if (serviceInterests.some((s) => ["esim", "data", "roaming"].includes(s))) {
    const url = buildPartnerUrl("airalo", { destination: destination ?? undefined })
      ?? "https://www.airalo.com/";
    cards.push({
      id: "esim",
      icon: "📡",
      titleAr: "شريحة eSIM للسفر",
      titleEn: "Travel eSIM",
      descAr: "إنترنت في أي مكان بدون روامينغ",
      descEn: "Stay connected worldwide, no roaming",
      url,
      color: "violet",
    });
  }

  // Insurance
  if (serviceInterests.some((s) => ["insurance", "medical"].includes(s))) {
    cards.push({
      id: "insurance",
      icon: "🛡️",
      titleAr: "تأمين السفر",
      titleEn: "Travel Insurance",
      descAr: "تغطية طبية وإلغاء الرحلات",
      descEn: "Medical & trip cancellation coverage",
      url: "https://www.heymondo.com/?utm_source=gotripza",
      color: "emerald",
    });
  }

  // Activities / Tours
  if (serviceInterests.some((s) => ["activities", "tours", "sightseeing"].includes(s))) {
    const url = buildPartnerUrl("getyourguide", { destination: destination ?? undefined })
      ?? "https://www.getyourguide.com/";
    cards.push({
      id: "activities",
      icon: "🎟️",
      titleAr: "جولات وأنشطة",
      titleEn: "Tours & Activities",
      descAr: "احجز تجارب موثوقة في وجهتك",
      descEn: "Book top-rated experiences",
      url,
      color: "amber",
    });
  }

  // Car rental
  if (serviceInterests.some((s) => ["car_rental", "transport", "driving"].includes(s))) {
    const url = buildPartnerUrl("discovercars", { destination: destination ?? undefined })
      ?? "https://www.discovercars.com/";
    cards.push({
      id: "car_rental",
      icon: "🚗",
      titleAr: "إيجار سيارة",
      titleEn: "Car Rental",
      descAr: "قارن أسعار السيارات في وجهتك",
      descEn: "Compare car rental prices",
      url,
      color: "orange",
    });
  }

  // Return max 2 cards to keep UI clean on mobile
  return cards.slice(0, 2);
}

// ── Companion upsell message ───────────────────────────────────────────────────
export function getUpsellMessage(locale: "ar" | "en", msgCount: number): string | null {
  // Show at messages 3, 6, 9
  if (![3, 6, 9].includes(msgCount)) return null;

  if (locale === "ar") {
    return msgCount === 3
      ? "💡 ريا المستشارة تُخطط رحلتك الكاملة وتُرافقك خلالها — بذاكرة شخصية وتحليل صور. جرّبها بـ $19.99 ←"
      : msgCount === 6
      ? "✨ هل تعلم؟ ريا المستشارة تتذكر رحلاتك السابقة وتُوصي بناءً على تفضيلاتك. اكتشفها ←"
      : "📸 مع ريا المستشارة: صوّر أي قائمة أو لافحة أو تذكرة وستُفسّرها لك فوراً. جرّبها ←";
  }

  return msgCount === 3
    ? "💡 Rya Companion plans your full trip and stays with you — personal memory & photo analysis. Try it for $19.99 ←"
    : msgCount === 6
    ? "✨ Rya Companion remembers your past trips and recommends based on your preferences. Discover it ←"
    : "📸 With Rya Companion: photograph any menu, sign or ticket and she'll explain it instantly. Try it ←";
}
