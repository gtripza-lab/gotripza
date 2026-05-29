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
      ? "✨ تخيّل أن تكون ريا رفيقتك الشخصية في كل رحلة — تعرفك، تتذكرك، وتكون بين يديك دائماً. جرّب Rya Companion ←"
      : msgCount === 6
      ? "🌍 مستشارة سفر خاصة بك تماماً — لا تبدأ من الصفر في كل رحلة، ريا تعرف ذوقك وتاريخك. اكتشفها ←"
      : "🤝 مع Rya Companion ريا تكون معك من لحظة التخطيط حتى تعود للبيت — في المطار، الفندق، والمطعم. جرّبها ←";
  }

  return msgCount === 3
    ? "✨ Imagine having Rya as your personal travel companion — she knows you, remembers you, and is always by your side. Try Rya Companion ←"
    : msgCount === 6
    ? "🌍 Your own private travel advisor — never start from scratch again, Rya knows your taste and travel history. Discover her ←"
    : "🤝 With Rya Companion she's with you from planning to landing home — airport, hotel, restaurant and beyond. Try her ←";
}
