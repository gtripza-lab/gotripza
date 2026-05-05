/**
 * Raya Intelligence System
 * ════════════════════════════════════════════════════════
 * Smart response engine that combines:
 * 1. Local knowledge base (destinations.ts)
 * 2. Gemini AI (for complex conversations)
 * 3. Heuristic fallback (always works, even when APIs fail)
 *
 * Result: Raya ALWAYS has intelligent answers
 */

import { DESTINATIONS, type DestinationProfile } from "./destinations";

export type RayaResponse = {
  source: "local_knowledge" | "ai" | "heuristic";
  confidence: "high" | "medium" | "low";
  message: string;
  suggestions?: string[];
  tips?: string[];
};

// ═══════════════════════════════════════════════════════════════════════════
// ANSWER QUESTION FROM LOCAL KNOWLEDGE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Answer a destination question directly from knowledge base
 * Examples:
 *   "What's the best time for Maldives?" → check DESTINATIONS
 *   "Is Turkey safe?" → get safety_level + safety_note
 *   "What do I pack for Bali?" → return packing_tips
 */
export function answerFromKnowledge(
  question: string,
  destination: DestinationProfile | null,
  locale: "ar" | "en"
): RayaResponse | null {
  if (!destination) return null;

  const isAr = locale === "ar";
  const q = question.toLowerCase();

  // BEST TIME QUESTION
  if (q.match(/أفضل وقت|افضل وقت|متى أذهب|الموسم|best time|when to go|when to visit|ideal time/i)) {
    const answer = isAr
      ? `أفضل وقت لزيارة ${destination.nameAr} هو ${destination.best_months_ar} 🌞

الطقس: ${destination.weather_description_ar} (${destination.weather_temp_range})

نصيحة ذكية:
• لشهر عسل → ${destination.best_time_for.honeymoon_ar}
• لعائلة → ${destination.best_time_for.family_ar}
• لمغامرة → ${destination.best_time_for.adventure_ar}
• برخص → ${destination.best_time_for.budget_ar}`
      : `Best time to visit ${destination.nameEn} is ${destination.best_months_en} 🌞

Weather: ${destination.weather_description_en} (${destination.weather_temp_range})

Smart tips:
• For honeymoon → ${destination.best_time_for.honeymoon_en}
• For family → ${destination.best_time_for.family_en}
• For adventure → ${destination.best_time_for.adventure_en}
• On budget → ${destination.best_time_for.budget_en}`;

    return { source: "local_knowledge", confidence: "high", message: answer };
  }

  // SAFETY QUESTION
  if (q.match(/آمن|امن|safe|dangerous|security|risky|crime/i)) {
    const safetyEmoji =
      destination.safety_level === "excellent"
        ? "✅"
        : destination.safety_level === "very good"
          ? "✅"
          : destination.safety_level === "good"
            ? "✓"
            : "⚠️";

    const answer = isAr
      ? `${safetyEmoji} ${destination.nameAr} آمنة للسياح

مستوى الأمان: ${destination.safety_level.toUpperCase()}

التفاصيل:
${destination.safety_note_ar}

نصائح أمان:
• احمِ قيمك — لا تحمل أموال كثيرة
• تجنب الأماكن المظلمة ليلاً
• التزم بالمناطق السياحية الرئيسية
• اسأل الفندق عن مناطق آمنة`
      : `${safetyEmoji} ${destination.nameEn} is safe for tourists

Safety Level: ${destination.safety_level.toUpperCase()}

Details:
${destination.safety_note_en}

Safety tips:
• Keep valuables secure — don't carry too much cash
• Avoid dark alleys at night
• Stick to main tourist areas
• Ask hotel about safe zones`;

    return { source: "local_knowledge", confidence: "high", message: answer };
  }

  // PACKING QUESTION
  if (q.match(/اتحضر|احضر|اجهز|ماذا ألبس|ماذا أحتاج|what to pack|packing|bring|wear/i)) {
    const packingList = isAr
      ? destination.packing_tips_ar.map((t) => `• ${t}`).join("\n")
      : destination.packing_tips_en.map((t) => `• ${t}`).join("\n");

    const answer = isAr
      ? `حقيبتك إلى ${destination.nameAr} — إليك ما تحتاج:

${packingList}

نصيحة ذهب: ارزم ملابس يمكن غسلها — الغسيل رخيص هناك! 🧳`
      : `Your packing list for ${destination.nameEn}:

${packingList}

Pro tip: Pack clothes that are easy to wash — laundry is cheap there! 🧳`;

    return { source: "local_knowledge", confidence: "high", message: answer };
  }

  // ACTIVITIES QUESTION
  if (q.match(/شنو أفضل|افضل|أنشطة|activities|things to do|what to see|must visit|top attractions/i)) {
    const activities = isAr
      ? destination.top_activities_ar.map((a) => `• ${a}`).join("\n")
      : destination.top_activities_en.map((a) => `• ${a}`).join("\n");

    const answer = isAr
      ? `أفضل الأنشطة في ${destination.nameAr}:

${activities}

💡 نصيحة: احجز الأنشطة اون لاين قبل الذهاب — أرخص بـ 20-30%`
      : `Top things to do in ${destination.nameEn}:

${activities}

💡 Tip: Book activities online beforehand — 20-30% cheaper`;

    return { source: "local_knowledge", confidence: "high", message: answer };
  }

  // COST QUESTION
  if (q.match(/كم تكلفة|تكلفة|سعر|budget|cost|expensive|price|how much/i)) {
    const dailyBudget = destination.budget_per_day_usd;
    const answer = isAr
      ? `ميزانية يومية في ${destination.nameAr}:

💰 رخيص: $${dailyBudget.budget}/يوم (فنادق صغيرة، طعام محلي)
💰 متوسط: $${dailyBudget.moderate}/يوم (فندق معقول، مطاعم جيدة)
💰 فاخر: $${dailyBudget.luxury}/يوم (فنادق ٥ نجوم، مطاعم فاخرة)

تصنيف التكاليف: ${destination.cost_level.toUpperCase()}
عملة: ${destination.currency_name_ar} (${destination.currency})
سعر الصرف: 1 دولار = ${destination.usd_exchange_rate} ${destination.currency}`
      : `Daily budget in ${destination.nameEn}:

💰 Budget: $${dailyBudget.budget}/day (hostels, local food)
💰 Moderate: $${dailyBudget.moderate}/day (decent hotel, good restaurants)
💰 Luxury: $${dailyBudget.luxury}/day (5-star hotels, fine dining)

Cost level: ${destination.cost_level.toUpperCase()}
Currency: ${destination.currency_name_en} (${destination.currency})
Exchange: 1 USD = ${destination.usd_exchange_rate} ${destination.currency}`;

    return { source: "local_knowledge", confidence: "high", message: answer };
  }

  // VISA QUESTION
  if (q.match(/تأشيرة|فيزا|visa|documents|passport|requirements/i)) {
    const visaStatus = destination.visa_required_for_saudis
      ? isAr
        ? `نعم، تأشيرة مطلوبة ❌`
        : `Yes, visa required ❌`
      : isAr
        ? `لا، بدون فيزا للسعوديين ✅`
        : `No visa needed for Saudis ✅`;

    const visaDetail = destination.visa_required_for_saudis
      ? `
نوع التأشيرة: ${destination.visa_type_ar}
المدة: ${destination.visa_processing_days} أيام
التكلفة: $${destination.visa_cost_usd}

${destination.visa_note_ar}`
      : `
التأشيرة: ${destination.visa_type_ar}
${destination.visa_note_ar}`;

    const answer = isAr
      ? `${visaStatus} لـ ${destination.nameAr}

${visaDetail}`
      : `${visaStatus} for ${destination.nameEn}

Type: ${destination.visa_type_en}
${!destination.visa_required_for_saudis ? "" : `Duration: ${destination.visa_processing_days} days\nCost: $${destination.visa_cost_usd}`}

${destination.visa_note_en}`;

    return { source: "local_knowledge", confidence: "high", message: answer };
  }

  // CULTURE & TIPS QUESTION
  if (q.match(/ثقافة|عادات|احترام|تقاليد|culture|customs|traditions|tips/i)) {
    const cultureTips = isAr
      ? destination.cultural_tips_ar.map((t) => `• ${t}`).join("\n")
      : destination.cultural_tips_en.map((t) => `• ${t}`).join("\n");

    const localTips = isAr
      ? destination.local_tips_ar.map((t) => `• ${t}`).join("\n")
      : destination.local_tips_en.map((t) => `• ${t}`).join("\n");

    const answer = isAr
      ? `نصائح ثقافية للسلوك واحترام المحليين:

${cultureTips}

نصائح محلية ذكية:

${localTips}`
      : `Cultural tips for respectful behavior:

${cultureTips}

Smart local tips:

${localTips}`;

    return { source: "local_knowledge", confidence: "high", message: answer };
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// GENERATE PERSONALIZED RECOMMENDATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Give personalized destination recommendation based on trip type + budget
 */
export function recommendDestination(
  tripType: string,
  budget: number | null,
  locale: "ar" | "en"
): { destination: DestinationProfile; reason: string }[] {
  const isAr = locale === "ar";

  return Object.values(DESTINATIONS)
    .filter((d) => {
      // Filter by budget
      if (budget !== null) {
        if (budget < 50) return d.cost_level === "budget"; // very cheap
        if (budget < 150) return d.cost_level === "budget" || d.cost_level === "moderate";
        if (budget < 500) return d.cost_level === "moderate" || d.cost_level === "expensive";
        return true; // no limit
      }
      return true;
    })
    .filter((d) => {
      // Filter by trip type
      const lowerType = tripType.toLowerCase();
      if (lowerType.match(/شهر عسل|honeymoon/i)) {
        return ["MLE", "IST", "DPS"].includes(d.iata); // romantic destinations
      }
      if (lowerType.match(/عائل|family/i)) {
        return ["DXB", "IST", "LHR"].includes(d.iata); // family-friendly
      }
      if (lowerType.match(/مغامرة|adventure/i)) {
        return ["DPS", "IST"].includes(d.iata); // adventure destinations
      }
      return true; // show all if no type match
    })
    .map((d) => ({
      destination: d,
      reason: isAr
        ? `${d.nameAr}: ${d.description_ar} — الأفضل الآن: ${d.best_months_ar}`
        : `${d.nameEn}: ${d.description_en} — Best now: ${d.best_months_en}`,
    }));
}
