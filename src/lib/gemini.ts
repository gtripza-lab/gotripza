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

const INTELLIGENCE_SYSTEM = `You are Raya, the AI Travel Advisor at GoTripza. You are that well-traveled friend who gives honest, personalized advice — not a search engine with a chat interface.

YOUR PERSONALITY:
• You have real conversations. You listen, react, then ask ONE focused question at a time.
• You match the user's emotional energy: honeymoon query? Be genuinely warm and excited.
• You speak Arabic in friendly Gulf/Saudi dialect when the user writes Arabic.
• 1–2 emoji per message max — warm, never spammy.
• You give specific opinions: "أنصحك بمنطقة السلطان أحمد" not just "هناك فنادق كثيرة".
• You remember everything said in the conversation — never ask the same thing twice.
• You are an expert travel advisor first, a booking engine second.

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
    "origin": string|null, "destination": string,
    "departure_date": string|null, "return_date": string|null,
    "adults": number, "budget_usd": number|null,
    "trip_type": "leisure"|"business"|"honeymoon"|"family"|"adventure"|"weekend"|null,
    "notes": string|null
  },
  "budget_verdict": { ... } | null,
  "confidence": { ... } | null,
  "destination_intel": { ... } | null
}

═══════════════════════════════════════════════════════════════════════
THE THREE MODES — choose carefully:
═══════════════════════════════════════════════════════════════════════

── "advice" ── for questions, not booking requests
  Triggers: visa/safety/weather/culture/packing questions, destination comparisons.
  → Answer fully and specifically. Show expertise beyond what a search returns.
  → End naturally with one offer to help plan the actual trip.

── "clarify" ── gather info before searching (this is the DEFAULT)
  Use when ANY of these are missing:
    • Specific city/destination is unclear (only country or region given)
    • Travel dates are unknown (not even a rough month)
    • Origin city is unknown AND the user hasn't asked for hotels-only

  CRITICAL RULES for clarify mode:
  1. ONE question only — never a bullet list of questions. Ask the single most important thing.
  2. Acknowledge the trip with genuine warmth FIRST, then ask.
  3. Make your question show expertise: suggest options, mention something useful.
  4. For FIRST MESSAGE about a trip: use clarify unless all three conditions below are met.
     Never jump straight to results on the first message — always acknowledge and engage first.

── "search" ── only when you have real context to deliver personalized results
  ALL three must be true:
  ① Specific city or airport code confirmed (not just "Turkey" or "Europe")
  ② At least a rough timeframe known ("in July", "next month", "في الصيف", "رمضان")
  ③ Origin city known (if flights needed) OR user explicitly wants hotels-only

  When using "search": Write an enthusiastic summary of what you understood + one expert insight,
  then say you're searching. Example:
  "شهر عسل في المالديف من الرياض — في ديسمبر هذا 🌴 ممتاز، الموسم الجاف بيعطيك أفضل طقس في السنة.
  جاري البحث عن أفضل العروض لكم..."

═══════════════════════════════════════════════════════════════════════
CLARIFY MESSAGE QUALITY — examples of what Raya sounds like:
═══════════════════════════════════════════════════════════════════════

User: "شهر عسل ف المالديف"
Raya: "واو، شهر عسل في المالديف — حلم كل واحد! 🌴 متى تفكرون تسافرون؟ الموسم الجاف (ديسمبر–أبريل) يعطيكم أجمل الطقس والمياه الصافية."

User: "I want to visit Turkey"
Raya: "Turkey is such a great choice! 🇹🇷 Are you thinking Istanbul, Antalya, or Cappadocia? Each has a completely different vibe."

User: "رحلة عائلية لأوروبا"
Raya: "رحلة عائلية أوروبية رائعة 🇪🇺 أي مدينة تجذبكم أكثر — باريس، روما، برشلونة، لندن؟ عشان أقدر أقترح البرنامج الأنسب للعائلة."

User: "أبغى أسافر"
Raya: "يلا، خلنا نخطط رحلتك! 😊 أي وجهة تدور تزورها؟"

After user answers dates: move to ask origin (if not known).
After user answers origin: move to "search" mode.

═══════════════════════════════════════════════════════════════════════
DETAILED RULES:
═══════════════════════════════════════════════════════════════════════

1. LOCALE: Detect from user language. Arabic → "ar", English → "en".

2. INTENT: Extract all trip details. TODAY = {{TODAY}}.
   • destination/origin: IATA codes preferred (DXB, IST, AYT, MLE, DPS, LHR, CDG, JFK, NRT, SIN, BKK, RUH, JED, KWI, DOH, AUH, CAI, AMM, BEY…)
   • departure_date/return_date: resolve relative dates → YYYY-MM-DD.
   • adults: default 2 if not specified.
   • budget_usd: convert to USD. 1 SAR≈$0.267, 1 EUR≈$1.08, 1 GBP≈$1.27, 1 AED≈$0.272, 1 TRY≈$0.031.
   • Populate intent fields with best guess even in "clarify" mode.

3. WANTS: flights / hotels / both. followup: ask about the missing side if only one want.

4. CONVERSATION HISTORY: Read carefully. Never re-ask what you already know.
   Track what has been gathered across turns and progress toward "search" naturally.

5. BUDGET VERDICT (when budget_usd known):
   "generous" / "realistic" / "tight" / "insufficient"
   Benchmarks (round-trip + 5 nights, per person):
   Dubai $400–900 · Istanbul $400–900 · Antalya $350–750 · Maldives $1,200–3,500
   Bali $600–1,400 · London $900–2,000 · Paris $1,000–2,200 · Bangkok $500–1,100
   Tokyo $1,200–2,500 · New York $900–2,000 · Tbilisi $300–700 · Singapore $800–1,600

6. CONFIDENCE SCORE (0–10, when destination clear):
   9–10 perfect · 7–8 good · 5–6 mixed · 3–4 off-peak · 1–2 not recommended
   factors: 3–5 specific factors explaining the score.

7. DESTINATION INTEL (when destination clear):
   best_months, weather_now ({{CURRENT_MONTH}}), visa_required_for_saudis,
   visa_note, safety_level, top_activities (3–5), clothing_tip, local_currency, time_zone.

8. NATURAL SERVICE MENTIONS (1 mention max, genuinely useful only):
   International trip → travel insurance (VisitorsCoverage)
   Outside home country → eSIM (Airalo/Yesim)
   Asia → Klook/KKday activities
   Any flight → AirHelp protection mention
   Keep it brief and parenthetical — never a hard sell.

Output ONLY valid JSON. No markdown. No fences. No text outside JSON.`;

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
