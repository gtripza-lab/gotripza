import "server-only";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const apiKey =
  process.env.GEMINI_API_KEY ?? process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!apiKey) {
  console.warn("[gemini] GEMINI_API_KEY is not set");
}

const genAI = new GoogleGenerativeAI(apiKey ?? "");

// Primary model: gemini-2.5-flash-preview-05-20 — latest, best reasoning
const MODEL_INTELLIGENCE = "gemini-2.5-flash-preview-05-20";
// Lite model: for simple tasks (tips, descriptions)
const MODEL_LITE = "gemini-2.0-flash-lite";

/* ══════════════════════════════════════════════════════════════════════════
   SCHEMAS
══════════════════════════════════════════════════════════════════════════ */

export const TripIntentSchema = z.object({
  origin: z.string().nullable(),
  destination: z.string(),
  departure_date: z.string().nullable(),
  return_date: z.string().nullable(),
  adults: z.number().int().min(1).max(9).default(2),
  budget_usd: z.number().int().nullable().default(null),
  trip_type: z
    .enum(["leisure", "business", "honeymoon", "family", "adventure", "weekend"])
    .nullable()
    .default(null),
  notes: z.string().nullable().default(null),
});
export type TripIntent = z.infer<typeof TripIntentSchema>;

export const WantsSchema = z
  .array(z.enum(["flights", "hotels"]))
  .min(1)
  .default(["flights", "hotels"]);

// Budget evaluation result
export const BudgetVerdictSchema = z.object({
  verdict: z.enum(["generous", "realistic", "tight", "insufficient"]),
  label_ar: z.string(),
  label_en: z.string(),
  explanation_ar: z.string(),
  explanation_en: z.string(),
  alternative_destinations: z.array(z.string()).default([]),
  suggested_budget_usd: z.number().nullable().default(null),
});
export type BudgetVerdict = z.infer<typeof BudgetVerdictSchema>;

// Travel Confidence Score
export const ConfidenceScoreSchema = z.object({
  score: z.number().min(0).max(10),
  label_ar: z.string(),
  label_en: z.string(),
  factors: z.array(z.object({
    factor_ar: z.string(),
    factor_en: z.string(),
    impact: z.enum(["positive", "neutral", "negative"]),
  })).default([]),
});
export type ConfidenceScore = z.infer<typeof ConfidenceScoreSchema>;

// Destination intelligence
export const DestinationIntelSchema = z.object({
  best_months_ar: z.string(),
  best_months_en: z.string(),
  weather_now_ar: z.string(),
  weather_now_en: z.string(),
  visa_required_for_saudis: z.boolean().nullable().default(null),
  visa_note_ar: z.string().nullable().default(null),
  visa_note_en: z.string().nullable().default(null),
  safety_level: z.enum(["excellent", "good", "moderate", "caution"]).default("good"),
  safety_note_ar: z.string().nullable().default(null),
  top_neighborhoods_ar: z.array(z.string()).default([]),
  top_neighborhoods_en: z.array(z.string()).default([]),
  top_activities_ar: z.array(z.string()).default([]),
  top_activities_en: z.array(z.string()).default([]),
  clothing_tip_ar: z.string().nullable().default(null),
  clothing_tip_en: z.string().nullable().default(null),
  local_currency: z.string().nullable().default(null),
  time_zone: z.string().nullable().default(null),
});
export type DestinationIntel = z.infer<typeof DestinationIntelSchema>;

// Full intelligence response
export const TravelIntelligenceSchema = z.object({
  locale: z.enum(["ar", "en"]),
  /**
   * mode controls what the chat does after receiving this response:
   *  "clarify"  → show message only, wait for user reply (no search API call)
   *  "search"   → call flight+hotel search APIs and show results
   *  "advice"   → show message only (answers a travel question, no search needed)
   */
  mode: z.enum(["clarify", "search", "advice"]).default("search"),
  message: z.string(),
  wants: WantsSchema,
  followup: z.string().nullable().default(null),
  clarification_needed: z.boolean().default(false),
  clarification_question: z.string().nullable().default(null),
  intent: TripIntentSchema,
  budget_verdict: BudgetVerdictSchema.nullable().default(null),
  confidence: ConfidenceScoreSchema.nullable().default(null),
  destination_intel: DestinationIntelSchema.nullable().default(null),
});
export type TravelIntelligence = z.infer<typeof TravelIntelligenceSchema>;
export type ChatMode = "clarify" | "search" | "advice";

// Legacy compat
export const TripParseSchema = z.object({
  locale: z.enum(["ar", "en"]),
  message: z.string(),
  wants: WantsSchema,
  followup: z.string().nullable().default(null),
  intent: TripIntentSchema,
});
export type TripParseResult = z.infer<typeof TripParseSchema>;

/* ══════════════════════════════════════════════════════════════════════════
   MASTER INTELLIGENCE PROMPT
══════════════════════════════════════════════════════════════════════════ */

const INTELLIGENCE_SYSTEM = `You are Raya, the GoTripza AI Travel Advisor — warm, intelligent, and deeply knowledgeable about travel. You speak Arabic (using friendly Gulf/Modern dialect in casual conversations) and formal English fluently. You adapt to the user's style.

YOUR PERSONALITY:
• You genuinely care about giving the right recommendation, not just the fastest one
• You ask focused questions when you need more context — never dump generic results
• You mention insurance, eSIM, or activities naturally when relevant — never pushy
• You use light emoji occasionally in Arabic responses to feel warm, not robotic
• When you have enough context, you acknowledge the trip enthusiastically then search

═══════════════════════════════════════════════════════════════════════
RESPONSE FORMAT — Return STRICT JSON only, no markdown, no fences:
═══════════════════════════════════════════════════════════════════════

{
  "locale": "ar" | "en",
  "mode": "clarify" | "search" | "advice",
  "message": string,
  "wants": ("flights"|"hotels")[],
  "followup": string|null,
  "clarification_needed": boolean,
  "clarification_question": string|null,
  "intent": {
    "origin": string|null,
    "destination": string,
    "departure_date": string|null,
    "return_date": string|null,
    "adults": number,
    "budget_usd": number|null,
    "trip_type": "leisure"|"business"|"honeymoon"|"family"|"adventure"|"weekend"|null,
    "notes": string|null
  },
  "budget_verdict": { ... } | null,
  "confidence": { ... } | null,
  "destination_intel": { ... } | null
}

═══════════════════════════════════════════════════════════════════════
MODE RULES — this controls whether search APIs are called:
═══════════════════════════════════════════════════════════════════════

"clarify": Use when you need more information before you can give useful results.
  Triggers: only a country/region mentioned (no specific city), no dates at all, no group size.
  → Ask 2–3 specific focused questions in a friendly way.
  → Do NOT trigger search. Just gather info.

"search": Use when you have enough context to find real results.
  Minimum requirements: specific city or airport code AND at least a month/timeframe.
  → Acknowledge the trip briefly, say you're searching.
  → Trigger flight + hotel search.

"advice": Use when the user asks a travel question, not a booking request.
  Examples: "هل تركيا آمنة؟", "ما أفضل وقت لزيارة باريس؟", "هل أحتاج تأشيرة؟", packing questions, destination comparisons.
  → Answer directly and helpfully. No search needed.

═══════════════════════════════════════════════════════════════════════
MESSAGE — the actual reply the user sees:
═══════════════════════════════════════════════════════════════════════

For "clarify" mode (Arabic example):
  "يسعدني أساعدك في رحلتك إلى تركيا! 🌍 بس محتاج أعرف شوي أكثر:
  - أي مدينة تفكر فيها؟ إسطنبول؟ أنطاليا؟ كبادوكيا؟
  - متى ناوي تسافر تقريباً؟
  - كم عدد المسافرين؟"

For "clarify" mode (English example):
  "I'd love to help you plan your Turkey trip! 🌍 Just a few quick questions:
  - Which city are you thinking? Istanbul, Antalya, or Cappadocia?
  - When are you planning to go?
  - How many travelers?"

For "search" mode (Arabic example):
  "ممتاز! رحلة عائلية لإسطنبول في أغسطس — خيار رائع 🇹🇷 جاري البحث عن أفضل الخيارات لكم..."

For "search" mode (English example):
  "Great choice! Family trip to Istanbul in August 🇹🇷 Searching for the best options..."

For "advice" mode (Arabic example):
  "تركيا آمنة جداً للسياحة ✅ إسطنبول وأنطاليا تحديداً من أكثر الوجهات أماناً وترحيباً. الخارجية السعودية لا تضع قيوداً عليها حالياً. هل تريد أساعدك تخطط رحلتك هناك؟"

═══════════════════════════════════════════════════════════════════════
DETAILED RULES:
═══════════════════════════════════════════════════════════════════════

1. LOCALE: Detect from user's language. Arabic → "ar", English → "en".

2. INTENT: Extract all trip parameters. TODAY = {{TODAY}}.
   • destination/origin: prefer IATA codes (DXB, IST, AYT, MLE, DPS, LHR, CDG, JFK, NRT, SIN, BKK, etc.)
   • departure_date/return_date: resolve relative dates against TODAY → YYYY-MM-DD format.
   • adults: default 2 if not specified.
   • budget_usd: convert any currency to USD. Rates: 1 SAR≈$0.267, 1 EUR≈$1.08, 1 GBP≈$1.27, 1 AED≈$0.272, 1 TRY≈$0.031.
   • origin: if user doesn't specify, leave null.
   • Even in "clarify" mode, populate intent with best guess from available info.

3. WANTS:
   • Flights only → ["flights"]
   • Hotels only → ["hotels"]
   • Full trip / both / unspecified → ["flights","hotels"]
   • followup: if only one want, ask about the other. Otherwise null.

4. CONVERSATION HISTORY: If history is provided, read it to understand context already gathered.
   • Do not ask questions you already have answers to from previous turns.
   • If the user is answering a clarifying question you asked, move toward "search" mode.
   • Progress naturally: clarify → search → present results.

5. BUDGET VERDICT (populate when budget_usd is provided OR budget level implied):
   • "generous": exceeds typical cost by 30%+
   • "realistic": fits within normal variance
   • "tight": can work but requires careful choices
   • "insufficient": significantly below realistic minimum
   • explanation: 1–2 sentences on what budget covers
   • alternative_destinations: 2–3 affordable alternatives when tight/insufficient
   • suggested_budget_usd: recommended budget when tight/insufficient

   Budget benchmarks (round-trip + 5 nights, per person):
   Dubai $400–900 · Istanbul $400–900 · Antalya $350–750 · Maldives $1,200–3,500
   Bali $600–1,400 · London $900–2,000 · Paris $1,000–2,200 · Bangkok $500–1,100
   Tokyo $1,200–2,500 · New York $900–2,000 · Tbilisi $300–700 · Singapore $800–1,600
   Morocco $500–1,000 · Barcelona $800–1,800

6. CONFIDENCE SCORE (0–10, populate when destination is clear):
   • 9–10: Perfect season, visa-free, competitive prices, safe
   • 7–8: Good conditions, minor considerations
   • 5–6: Mixed — some planning needed
   • 3–4: Off-peak or challenging
   • 1–2: Not recommended
   • factors: 3–5 factors explaining the score

7. DESTINATION INTEL (populate when destination is clear):
   • best_months: ideal visit timing
   • weather_now: current month's weather (month = {{CURRENT_MONTH}})
   • visa_required_for_saudis: for Gulf/Arab travelers. null if uncertain.
   • visa_note: general visa info (e-visa, visa-on-arrival availability)
   • safety_level: excellent|good|moderate|caution
   • top_neighborhoods: 2–3 best areas to stay
   • top_activities: 3–5 key experiences
   • clothing_tip: dress advice for destination/season
   • local_currency: currency name + code
   • time_zone: e.g. "UTC+3 (Turkey Time)"

8. SMART SERVICE MENTIONS: In the message, naturally mention relevant services when appropriate:
   • International trip → mention travel insurance (VisitorsCoverage/EKTA)
   • Long-haul / outside home country → mention eSIM (Airalo/Yesim)
   • Asia destination → mention Klook/KKday activities
   • Europe → mention Rail Europe for inter-city travel
   • Flight heavy trip → mention AirHelp for flight protection
   Keep it very brief and natural — ONE mention max per message, and only when genuinely useful.

Output ONLY valid JSON. No markdown. No fences. No commentary outside the JSON.`;

function buildIntelligencePrompt(query: string, history: ChatTurn[] = []): string {
  const today = new Date().toISOString().slice(0, 10);
  const currentMonth = new Date().toLocaleString("en", { month: "long" });
  const base = INTELLIGENCE_SYSTEM
    .replace(/{{TODAY}}/g, today)
    .replace(/{{CURRENT_MONTH}}/g, currentMonth);

  if (history.length === 0) {
    return base + `\n\nUser message:\n${query}`;
  }

  const historyText = history
    .map((t) => `${t.role === "user" ? "User" : "Raya"}: ${t.text}`)
    .join("\n");

  return (
    base +
    `\n\nConversation history (most recent last):\n${historyText}` +
    `\n\nNew user message:\n${query}`
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN INTELLIGENCE FUNCTION
══════════════════════════════════════════════════════════════════════════ */

export async function getTravelIntelligence(
  query: string,
  history: ChatTurn[] = [],
): Promise<TravelIntelligence> {
  const model = genAI.getGenerativeModel({
    model: MODEL_INTELLIGENCE,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.4,
    },
  });
  const res = await model.generateContent(buildIntelligencePrompt(query, history));
  const text = res.response.text();
  const parsed = JSON.parse(text);
  return TravelIntelligenceSchema.parse(parsed);
}

/* ══════════════════════════════════════════════════════════════════════════
   LEGACY COMPAT — kept for any existing callers
══════════════════════════════════════════════════════════════════════════ */

export async function parseTripQuery(query: string, history: ChatTurn[] = []): Promise<TripParseResult> {
  const intel = await getTravelIntelligence(query, history);
  return {
    locale: intel.locale,
    message: intel.message,
    wants: intel.wants,
    followup: intel.followup,
    intent: intel.intent,
  };
}

export async function parseTripIntent(query: string): Promise<TripIntent> {
  return (await parseTripQuery(query)).intent;
}

/* ══════════════════════════════════════════════════════════════════════════
   LIVE TIPS (Google Search grounding)
══════════════════════════════════════════════════════════════════════════ */

export async function getLiveTips(
  destination: string,
  locale: "ar" | "en",
): Promise<string | null> {
  if (!destination) return null;
  try {
    const model = genAI.getGenerativeModel({
      model: MODEL_INTELLIGENCE,
      tools: [{ googleSearch: {} } as never],
      generationConfig: { temperature: 0.3 },
    });
    const today = new Date().toISOString().slice(0, 10);
    const directive =
      locale === "ar"
        ? `اليوم هو ${today}. قدّم جملة واحدة فقط (٢٥ كلمة كحد أقصى) بالعربية الفصحى الرسمية حول أحدث معلومات عن الطقس أو الموسم السياحي أو نصيحة سفر جوهرية للوجهة "${destination}". إذا ذكرت مبلغاً اذكره بالريال. بدون مقدمات ولا رموز تعبيرية.`
        : `Today is ${today}. Provide exactly ONE sentence (≤ 25 words) in formal English about current travel conditions, weather, or an essential tip for "${destination}". No preface, no emoji.`;
    const r = await model.generateContent(directive);
    const text = r.response.text().trim().replace(/^["'`]+|["'`]+$/g, "");
    return text.slice(0, 280) || null;
  } catch (err) {
    console.warn("[gemini] live tips unavailable:", (err as Error).message);
    return null;
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   CHAT FOLLOW-UP RESPONSE
   Used when user sends a follow-up in the chat conversation.
   Provides a short, conversational AI response acknowledging context.
══════════════════════════════════════════════════════════════════════════ */

export type ChatTurn = { role: "user" | "model"; text: string };

export async function getChatFollowup(
  history: ChatTurn[],
  newMessage: string,
  locale: "ar" | "en",
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({
      model: MODEL_LITE,
      generationConfig: { temperature: 0.5 },
    });

    const context = history
      .slice(-6) // Last 6 turns for context
      .map((t) => `${t.role === "user" ? "User" : "Assistant"}: ${t.text}`)
      .join("\n");

    const directive =
      locale === "ar"
        ? `أنت مستشار سفر من GoTripza. سياق المحادثة:\n${context}\n\nرسالة المستخدم: "${newMessage}"\n\nرُد بجملة واحدة أو جملتين فقط (بالعربية الفصحى، بأسلوب رسمي). لا تسأل أكثر من سؤال واحد إن احتجت. لا تستخدم رموز تعبيرية.`
        : `You are a GoTripza travel advisor. Conversation context:\n${context}\n\nUser message: "${newMessage}"\n\nRespond in 1–2 sentences (formal English). Ask at most one follow-up if needed. No emoji.`;

    const r = await model.generateContent(directive);
    return r.response.text().trim().slice(0, 400) || (
      locale === "ar" ? "كيف يمكنني مساعدتك في رحلتك؟" : "How can I help you plan your trip?"
    );
  } catch {
    return locale === "ar"
      ? "دعني أساعدك في تخطيط رحلتك. ما وجهتك المفضلة؟"
      : "Let me help you plan your trip. What destination interests you?";
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   DESTINATION DESCRIPTION (for SEO / destination pages)
══════════════════════════════════════════════════════════════════════════ */

export async function generateDestinationDescription(
  destination: string,
  locale: "ar" | "en",
): Promise<string | null> {
  if (!destination) return null;
  try {
    const model = genAI.getGenerativeModel({
      model: MODEL_LITE,
      generationConfig: { temperature: 0.7 },
    });
    const directive =
      locale === "ar"
        ? `اكتب فقرة حصرية من ٢–٣ جمل (بأسلوب رسمي فاخر، بالعربية الفصحى) عن الوجهة السياحية "${destination}". تشمل: أبرز المعالم، أفضل وقت للزيارة، ولماذا تختارها عبر GoTripza. بدون مقدمة، بدون اقتباسات.`
        : `Write an exclusive 2–3 sentence paragraph (formal, luxurious tone) about "${destination}". Include: top highlights, best time to visit, why travelers choose GoTripza for this trip. No preface, no quotes.`;
    const r = await model.generateContent(directive);
    return r.response.text().trim().slice(0, 600) || null;
  } catch (err) {
    console.warn("[gemini] destination description unavailable:", (err as Error).message);
    return null;
  }
}
