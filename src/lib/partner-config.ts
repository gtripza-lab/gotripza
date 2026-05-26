import { CHECKOUT_LINKS } from "@/lib/checkout-links";

export const PARTNER_COOKIE_DAYS = 60;
export const PARTNER_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * PARTNER_COOKIE_DAYS;

export const PARTNER_PRODUCTS = {
  rya_companion: {
    key: "rya_companion",
    name: "Rya Companion",
    arabicName: "ريا مستشارة السفر",
    priceUsd: 19.99,
    commissionRate: 0.25,
    checkoutUrl: CHECKOUT_LINKS.ryaCompanion,
    description: "مرافقة سفر ذكية قبل الرحلة وأثناءها، مع ذاكرة سفر وتوجيه عملي للمواقف اليومية.",
  },
  plan_my_trip: {
    key: "plan_my_trip",
    name: "Plan My Trip",
    arabicName: "خطط رحلتي",
    priceUsd: 9.99,
    commissionRate: 0.4,
    checkoutUrl: CHECKOUT_LINKS.planMyTrip,
    description: "خطة رحلة مختصرة وعملية تشمل الأيام، المناطق، التنقل، التكلفة، ونصائح الوجهة.",
  },
} as const;

export type PartnerProductKey = keyof typeof PARTNER_PRODUCTS;

export const PARTNER_PROGRAM_SETTINGS = {
  programName: "Rya Partners",
  arabicProgramName: "شركاء ريا",
  approvalMode: "manual",
  currency: "USD",
  cookieDays: PARTNER_COOKIE_DAYS,
  minimumPayoutUsd: 100,
  payoutMethods: ["PayPal", "تحويل يدوي لاحقاً"],
  defaultStatus: "pending",
  attributionSources: ["referral_link", "referral_code", "utm_campaign", "gumroad_purchase"],
  products: Object.values(PARTNER_PRODUCTS),
} as const;

export function formatPartnerUsd(value: number) {
  return `$${value.toFixed(2)}`;
}

export function formatPartnerCommission(rate: number) {
  return `${Math.round(rate * 100)}%`;
}

export function calculatePartnerCommission(priceUsd: number, commissionRate: number) {
  return Number((priceUsd * commissionRate).toFixed(2));
}
