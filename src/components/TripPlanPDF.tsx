"use client";

/**
 * TripPlanPDF — Branded PDF export for GoTripza trip plans.
 * Uses @react-pdf/renderer (client-side, no server route needed).
 *
 * Brand colors (Rya by GoTripza):
 *   Orbit Black:      #060A13
 *   Deep Navy:        #0B1020
 *   Signal Teal:      #00D4B3
 *   Global Blue:      #3B82F6
 *   Companion Violet: #8B5CF6
 */

import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { TripPlan, TripPlanDay } from "@/lib/trip-planner";

// ── Fonts ─────────────────────────────────────────────────────────────────────
// Use built-in Helvetica (no extra download) — works with Arabic via unicode fallback
Font.registerHyphenationCallback((w) => [w]);

// ── Brand palette ─────────────────────────────────────────────────────────────
const C = {
  bg:      "#060A13",
  navy:    "#0B1020",
  card:    "#111827",
  teal:    "#00D4B3",
  blue:    "#3B82F6",
  violet:  "#8B5CF6",
  white:   "#FFFFFF",
  white80: "#CCCCCC",
  white50: "#808080",
  white20: "#333333",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: C.bg,
    fontFamily: "Helvetica",
    paddingBottom: 40,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    backgroundColor: C.navy,
    paddingHorizontal: 32,
    paddingVertical: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#1a2035",
  },
  logo: { width: 120, height: 32, objectFit: "contain" },
  headerRight: { alignItems: "flex-end" },
  headerTag: { fontSize: 8, color: C.teal, letterSpacing: 1.5, marginBottom: 2 },
  headerDate: { fontSize: 7, color: C.white50 },

  // ── Hero section ────────────────────────────────────────────────────────────
  hero: {
    paddingHorizontal: 32,
    paddingVertical: 28,
    borderBottomWidth: 1,
    borderBottomColor: "#1a2035",
  },
  destination: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: C.white,
    marginBottom: 6,
  },
  summary: {
    fontSize: 10,
    color: C.white80,
    lineHeight: 1.6,
    maxWidth: 400,
    marginBottom: 16,
  },
  pills: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  pill: {
    backgroundColor: "#1a2035",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#2a3050",
  },
  pillText: { fontSize: 8, color: C.white80 },
  tealPill: { backgroundColor: "#002f2a", borderColor: C.teal },
  tealPillText: { fontSize: 8, color: C.teal },

  // ── Section ─────────────────────────────────────────────────────────────────
  section: { paddingHorizontal: 32, paddingTop: 24 },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: C.teal,
    letterSpacing: 1.5,
    marginBottom: 12,
    textTransform: "uppercase",
  },

  // ── Day card ────────────────────────────────────────────────────────────────
  dayCard: {
    backgroundColor: C.card,
    borderRadius: 10,
    marginBottom: 12,
    overflow: "hidden",
  },
  dayHeader: {
    backgroundColor: "#1a2540",
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dayBadge: {
    backgroundColor: C.teal,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  dayBadgeText: { fontSize: 8, fontFamily: "Helvetica-Bold", color: C.bg },
  dayTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", color: C.white, flex: 1 },
  dayArea: { fontSize: 8, color: C.teal },
  dayBody: { padding: 14 },
  timeRow: { flexDirection: "row", marginBottom: 8 },
  timeLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: C.blue,
    width: 56,
    marginTop: 1,
  },
  timeText: { fontSize: 9, color: C.white80, flex: 1, lineHeight: 1.5 },
  tipRow: {
    backgroundColor: "#0a1525",
    borderRadius: 6,
    padding: 8,
    marginTop: 4,
    flexDirection: "row",
    gap: 6,
  },
  tipIcon: { fontSize: 8, color: C.violet },
  tipText: { fontSize: 8, color: C.white50, flex: 1, lineHeight: 1.5 },

  // ── Info grid ────────────────────────────────────────────────────────────────
  infoGrid: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  infoCard: {
    backgroundColor: C.card,
    borderRadius: 8,
    padding: 12,
    flex: 1,
    minWidth: "45%",
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: C.teal,
    marginBottom: 5,
    letterSpacing: 0.8,
  },
  infoText: { fontSize: 9, color: C.white80, lineHeight: 1.5 },

  // ── Cost table ───────────────────────────────────────────────────────────────
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: "#1a2035",
  },
  costLabel: { fontSize: 9, color: C.white80 },
  costAmount: { fontSize: 9, fontFamily: "Helvetica-Bold", color: C.teal },
  costTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
    marginTop: 4,
  },
  costTotalLabel: { fontSize: 10, fontFamily: "Helvetica-Bold", color: C.white },
  costTotalAmount: { fontSize: 10, fontFamily: "Helvetica-Bold", color: C.teal },

  // ── Footer ───────────────────────────────────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.navy,
    paddingHorizontal: 32,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#1a2035",
  },
  footerLeft: { fontSize: 7, color: C.white50 },
  footerRight: { fontSize: 7, color: C.teal },

  divider: { height: 1, backgroundColor: "#1a2035", marginBottom: 16 },
});

// ── Helper ────────────────────────────────────────────────────────────────────
function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

function tripTypeLabel(type: string, isAr: boolean): string {
  const map: Record<string, [string, string]> = {
    family:     ["عائلية",    "Family"],
    couple:     ["رومانسية",  "Couple"],
    solo:       ["فردية",     "Solo"],
    friends:    ["أصدقاء",   "Friends"],
    business:   ["عمل",      "Business"],
    backpacker: ["ميزانية",  "Budget"],
  };
  const [ar, en] = map[type] ?? ["سياحية", "Tourism"];
  return isAr ? ar : en;
}

// ── Component ─────────────────────────────────────────────────────────────────
interface Props { plan: TripPlan; isAr: boolean }

export function TripPlanDocument({ plan, isAr }: Props) {
  const totalCost = plan.costBreakdown.reduce((s, i) => s + i.amount, 0);
  const logoUrl = `${typeof window !== "undefined" ? window.location.origin : "https://gotripza.com"}/brand/rya/rya-logo-horizontal-light.png`;

  return (
    <Document
      title={`GoTripza — ${plan.destinationName}`}
      author="GoTripza / Rya"
      subject={isAr ? "خطة رحلة مخصصة" : "Personalized Trip Plan"}
      creator="Rya by GoTripza"
    >
      <Page size="A4" style={styles.page}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <Image src={logoUrl} style={styles.logo} />
          <View style={styles.headerRight}>
            <Text style={styles.headerTag}>{isAr ? "خطة رحلة شخصية" : "PERSONALIZED TRIP PLAN"}</Text>
            <Text style={styles.headerDate}>{formatDate()}</Text>
          </View>
        </View>

        {/* ── Hero ── */}
        <View style={styles.hero}>
          <Text style={styles.destination}>{plan.destinationName}</Text>
          <Text style={styles.summary}>{plan.summary}</Text>
          <View style={styles.pills}>
            <View style={[styles.pill, styles.tealPill]}>
              <Text style={styles.tealPillText}>
                {isAr ? `${plan.days} أيام` : `${plan.days} days`}
              </Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>
                {isAr ? `${plan.travelers} مسافر` : `${plan.travelers} travelers`}
              </Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>{tripTypeLabel(plan.tripType, isAr)}</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>
                {plan.budget.toLocaleString()} {plan.currency}
              </Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>
                {isAr ? `من ${plan.originName}` : `from ${plan.originName}`}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Daily Itinerary ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isAr ? "البرنامج اليومي" : "Daily Itinerary"}
          </Text>
          {plan.daysPlan.map((day: TripPlanDay) => (
            <View key={day.day} style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <View style={styles.dayBadge}>
                  <Text style={styles.dayBadgeText}>
                    {isAr ? `يوم ${day.day}` : `Day ${day.day}`}
                  </Text>
                </View>
                <Text style={styles.dayTitle}>{day.title}</Text>
                <Text style={styles.dayArea}>{day.area}</Text>
              </View>
              <View style={styles.dayBody}>
                <View style={styles.timeRow}>
                  <Text style={styles.timeLabel}>{isAr ? "الصباح" : "Morning"}</Text>
                  <Text style={styles.timeText}>{day.morning}</Text>
                </View>
                <View style={styles.timeRow}>
                  <Text style={styles.timeLabel}>{isAr ? "العصر" : "Afternoon"}</Text>
                  <Text style={styles.timeText}>{day.afternoon}</Text>
                </View>
                <View style={styles.timeRow}>
                  <Text style={styles.timeLabel}>{isAr ? "المساء" : "Evening"}</Text>
                  <Text style={styles.timeText}>{day.evening}</Text>
                </View>
                <View style={styles.tipRow}>
                  <Text style={styles.tipIcon}>✦</Text>
                  <Text style={styles.tipText}>{day.tip}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* ── Budget breakdown ── */}
        <View style={[styles.section, { marginTop: 8 }]}>
          <Text style={styles.sectionTitle}>
            {isAr ? "توزيع الميزانية" : "Budget Breakdown"}
          </Text>
          <View style={{ backgroundColor: C.card, borderRadius: 10, padding: 14 }}>
            {plan.costBreakdown.map((item) => (
              <View key={item.label} style={styles.costRow}>
                <Text style={styles.costLabel}>{item.label}</Text>
                <Text style={styles.costAmount}>
                  {item.amount.toLocaleString()} {plan.currency}
                </Text>
              </View>
            ))}
            <View style={styles.costTotal}>
              <Text style={styles.costTotalLabel}>
                {isAr ? "الإجمالي اليومي" : "Daily Total"}
              </Text>
              <Text style={styles.costTotalAmount}>
                {totalCost.toLocaleString()} {plan.currency}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Key Info grid ── */}
        <View style={[styles.section, { marginTop: 8, paddingBottom: 60 }]}>
          <Text style={styles.sectionTitle}>
            {isAr ? "معلومات مهمة" : "Key Information"}
          </Text>
          <View style={styles.infoGrid}>
            {plan.visaAdvice && (
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>{isAr ? "التأشيرة" : "Visa"}</Text>
                <Text style={styles.infoText}>{plan.visaAdvice}</Text>
              </View>
            )}
            {plan.flightAdvice && (
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>{isAr ? "الطيران" : "Flights"}</Text>
                <Text style={styles.infoText}>{plan.flightAdvice}</Text>
              </View>
            )}
            {plan.localTransportAdvice && (
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>{isAr ? "التنقل" : "Transport"}</Text>
                <Text style={styles.infoText}>{plan.localTransportAdvice}</Text>
              </View>
            )}
            {plan.weatherAdvice && (
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>{isAr ? "الطقس" : "Weather"}</Text>
                <Text style={styles.infoText}>{plan.weatherAdvice}</Text>
              </View>
            )}
            {plan.bestStayAreas.length > 0 && (
              <View style={[styles.infoCard, { minWidth: "95%" }]}>
                <Text style={styles.infoLabel}>
                  {isAr ? "أفضل مناطق السكن" : "Best Stay Areas"}
                </Text>
                <Text style={styles.infoText}>{plan.bestStayAreas.join("  ·  ")}</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerLeft}>gotripza.com · Rya AI Travel Companion</Text>
          <Text style={styles.footerRight}>
            {isAr ? "خطتك الشخصية — لا تُشارك" : "Your personal plan — do not distribute"}
          </Text>
        </View>

      </Page>
    </Document>
  );
}
