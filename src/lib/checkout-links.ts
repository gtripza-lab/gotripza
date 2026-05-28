export const CHECKOUT_LINKS = {
  ryaCompanion: "https://tripza.gumroad.com/l/wnjwbp",
  planMyTrip: "https://tripza.gumroad.com/l/bbpsip",
} as const;

export type PlanTierId = "starter" | "standard" | "premium";

export interface PlanTier {
  id: PlanTierId;
  nameAr: string;
  nameEn: string;
  price: number;
  maxDays: number;
  gumroadUrl: string;
  featuresAr: string[];
  featuresEn: string[];
  badge?: { ar: string; en: string };
}

export const PLAN_TIERS: PlanTier[] = [
  {
    id: "starter",
    nameAr: "رحلة قصيرة",
    nameEn: "Short trip",
    price: 9.99,
    maxDays: 4,
    gumroadUrl: "https://tripza.gumroad.com/l/bbpsip",
    featuresAr: [
      "جدول حتى 4 أيام كاملة",
      "توزيع الميزانية",
      "أفضل مناطق السكن",
      "أي مدينة في العالم",
    ],
    featuresEn: [
      "Up to 4-day full itinerary",
      "Budget breakdown",
      "Best stay areas",
      "Any city worldwide",
    ],
  },
  {
    id: "standard",
    nameAr: "رحلة أسبوع",
    nameEn: "Week trip",
    price: 9.99,
    maxDays: 7,
    gumroadUrl: "https://tripza.gumroad.com/l/bbpsip",
    featuresAr: [
      "جدول حتى 7 أيام تفصيلي",
      "توزيع ميزانية دقيق",
      "نصائح التأشيرة والطيران",
      "قائمة التجهيزات",
      "الخطوات التالية",
    ],
    featuresEn: [
      "Up to 7-day detailed itinerary",
      "Precise budget split",
      "Visa & flight advice",
      "Packing list",
      "Next steps",
    ],
    badge: { ar: "الأكثر طلباً", en: "Most popular" },
  },
  {
    id: "premium",
    nameAr: "رحلة ممتدة",
    nameEn: "Extended trip",
    price: 9.99,
    maxDays: 14,
    gumroadUrl: "https://tripza.gumroad.com/l/bbpsip",
    featuresAr: [
      "جدول حتى 14 يوم مفصل",
      "كل مزايا خطة الأسبوع",
      "توصيات فاخرة مخصصة",
      "تحليل يومي عميق مع ريا",
    ],
    featuresEn: [
      "Up to 14-day detailed itinerary",
      "Everything in Week trip",
      "Luxury & premium tips",
      "Deep Rya day analysis",
    ],
  },
];
