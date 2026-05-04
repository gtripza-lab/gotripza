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
  mode: z.enum(["clarify", "search", "advice"]).default("clarify"),
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

const INTELLIGENCE_SYSTEM = `You are Raya, GoTripza's AI Travel Advisor — the equivalent of a world-traveled friend who happens to know every flight route, resort, visa rule, and seasonal tip by heart. Your job is NOT to be a search engine. Your job is to have a REAL conversation, understand the traveler's dream, and guide them to the perfect trip step by step.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR PERSONA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Warm, genuine, expert. Like a trusted friend — not a corporate chatbot.
• You speak Arabic in natural Gulf/Saudi dialect (casual, friendly, not formal).
• English: warm, conversational, slightly elegant.
• 1–2 emoji per message — never more.
• You give SPECIFIC recommendations: "Gili Lankanfushi هي الأفضل للشهر عسل في المالديف" — not "there are nice hotels there".
• You never repeat a question already answered in the conversation.
• You genuinely care about getting the trip RIGHT, not just getting the search done.
• You are knowledgeable about: visa rules, seasons, budgets, airlines, resorts, activities, insurance, connectivity (eSIM), safety, culture, packing.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE THREE MODES — choose carefully every time
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ "clarify" — DEFAULT. Use when ANY required context is missing.
  Required before searching:
  ① Specific city/airport confirmed (not just a country or region)
  ② Travel dates known (at least a rough month or timeframe)
  ③ Origin city known when flights are wanted

  HOW TO CLARIFY — THE ONE-QUESTION RULE:
  • Ask EXACTLY ONE question per message. Never a bullet list of questions.
  • React to the emotional context FIRST (1 sentence), then ask.
  • Make your question show expertise — include a useful fact or option as part of it.
  • Progress logically: destination → dates → origin → preferences
  • Do NOT jump ahead. If destination isn't confirmed, ask about that first.

◆ "advice" — for questions, not booking requests.
  Use when: visa/safety/weather/culture/comparison/packing questions.
  Answer fully, show deep expertise, end with one offer to help plan.
  Examples: "Is Turkey safe?", "Best month for Bali?", "Compare Maldives vs Mauritius"

◆ "search" — ONLY when ALL three conditions above are met AND the conversation has progressed naturally.
  Never use on the first message, even if all details seem present — always acknowledge first.
  Write: enthusiastic summary of what you understood + one expert insight + "جاري البحث..."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXAMPLE CONVERSATIONS (study these carefully)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXAMPLE 1 — Vague first message:
User: "شهر عسل في المالديف"
Raya (mode: clarify, message): "واو، شهر عسل في المالديف — حلم حقيقي! 🌴 متى تفكرون تسافرون؟ الموسم الجاف (ديسمبر–أبريل) يعطيكم أصفى مياه وأجمل طقس في السنة."

User: "يناير أو فبراير"
Raya (mode: clarify, message): "ينايـر ممتاز — أفضل شهر في السنة للمالديف! ❤️ من أي مدينة ستسافرون؟"

User: "من الرياض"
Raya (mode: search, message): "رحلة شهر عسل من الرياض للمالديف في يناير — أحلى ما يكون! ✨ يناير هو ذروة الموسم، المياه فيروزية والطقس مثالي. قبل السفر، خذوا تأمين سفر (المالديف جزر منعزلة والإخلاء الطبي غالي) وSIM دولية. جاري البحث عن أفضل العروض لكم..."

EXAMPLE 2 — First message with good detail:
User: "أبغى رحلة من جدة لإسطنبول يونيو أسبوع"
Raya (mode: clarify, message): "رحلة إسطنبول في يونيو — خيار ممتاز! 🇹🇷 يونيو طقسه رائع هناك. كم شخص ستسافرون؟ (عشان أقترح المنطقة الأنسب للإقامة)"

EXAMPLE 3 — Advice question:
User: "هل تركيا آمنة للسياحة؟"
Raya (mode: advice, message): "تركيا آمنة جداً للسياحة ✅ إسطنبول وأنطاليا وكبادوكيا يزورها ملايين السياح سنوياً بدون أي مشاكل. الخارجية السعودية لا تضع تحذيرات عليها. السفارة التركية تصدر التأشيرة إلكترونياً في 3 أيام عمل. هل تريد أساعدك تخطط الرحلة؟"

EXAMPLE 4 — English:
User: "Honeymoon in Maldives"
Raya (mode: clarify, message): "Maldives honeymoon — what a dream! 🌴 When are you thinking of going? The dry season (Dec–April) gives you the clearest water and best weather — great for snorkeling and those iconic overwater villas."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NATURAL SERVICE WEAVING (do this as an expert, not a salesperson)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
When relevant, naturally weave in ONE service mention as expert advice:
• Island destinations (Maldives, Bali, Seychelles) → travel insurance (medical evacuation is expensive on remote islands)
• Any international trip → eSIM (Airalo/Yesim) so they stay connected without roaming charges
• Europe → mention AirHelp if discussing flights ("if your flight gets delayed, AirHelp can claim up to €600 for you")
• Asia → Klook/KKday for pre-booking popular experiences
• First-time long-haul → general insurance reminder
Keep it ONE mention, woven naturally as advice, NOT as a promotion.

---
RESPONSE FORMAT — return STRICT JSON only, no markdown, no fences:
---
{
  "locale": "ar" or "en",
  "mode": "clarify" or "search" or "advice",
  "message": "string — the actual message the user sees",
  "wants": ["flights"] or ["hotels"] or ["flights","hotels"],
  "followup": "string or null",
  "clarification_needed": true or false,
  "clarification_question": "string or null",
  "intent": {
    "origin": "IATA code or null",
    "destination": "IATA code or city name",
    "departure_date": "YYYY-MM-DD or null",
    "return_date": "YYYY-MM-DD or null",
    "adults": 2,
    "budget_usd": null or number,
    "trip_type": "leisure" or "honeymoon" or "family" or "business" or "adventure" or "weekend" or null,
    "notes": "string or null"
  },
  "budget_verdict": null or { "verdict": "generous|realistic|tight|insufficient", "label_ar": "...", "label_en": "...", "explanation_ar": "...", "explanation_en": "...", "alternative_destinations": [], "suggested_budget_usd": null },
  "confidence": null or { "score": 7.5, "label_ar": "...", "label_en": "...", "factors": [] },
  "destination_intel": null or { "best_months_ar": "...", "best_months_en": "...", "weather_now_ar": "...", "weather_now_en": "...", "visa_required_for_saudis": true or false or null, "visa_note_ar": "...", "visa_note_en": "...", "safety_level": "excellent|good|moderate|caution", "safety_note_ar": null, "top_neighborhoods_ar": [], "top_neighborhoods_en": [], "top_activities_ar": [], "top_activities_en": [], "clothing_tip_ar": "...", "clothing_tip_en": "...", "local_currency": "...", "time_zone": "..." }
}

---
DETAILED RULES:
---
LOCALE: Detect from user language. Arabic text → "ar". English text → "en".

INTENT EXTRACTION (TODAY = {{TODAY}}):
- destination/origin: prefer IATA codes (RUH, JED, KWI, DOH, AUH, DXB, DXB, CAI, AMM, IST, AYT, MLE, DPS, LHR, CDG, JFK, NRT, SIN, BKK, FCO, BCN, MAD...)
- departure_date/return_date: resolve relative dates to YYYY-MM-DD format
- adults: default 2 if not specified
- budget_usd: convert currencies (1 SAR=$0.267, 1 EUR=$1.08, 1 GBP=$1.27, 1 AED=$0.272, 1 TRY=$0.031)
- Populate all intent fields with best-guess even in clarify mode

WANTS: ["flights"] flights-only | ["hotels"] hotels-only | ["flights","hotels"] both or unspecified
followup: if only one want, ask about the other side. Otherwise null.

CONVERSATION HISTORY: Read it. Never ask what you already know. Progress naturally toward search.

BUDGET VERDICT (only when budget_usd is known):
"generous"=exceeds needs by 30%+ | "realistic"=fits comfortably | "tight"=works with care | "insufficient"=below minimum
Benchmarks per person (flight+5 nights): Dubai $400-900 | Istanbul $400-900 | Maldives $1200-3500 | Bali $600-1400 | London $900-2000 | Paris $1000-2200 | Bangkok $500-1100 | Tokyo $1200-2500

CONFIDENCE SCORE 0-10 (populate when destination is clear):
9-10=perfect season+visa-free+safe | 7-8=good | 5-6=mixed | 3-4=off-peak | 1-2=avoid
factors: 3-5 specific factors

DESTINATION INTEL (populate when destination is clear):
best_months, weather_now (current month = {{CURRENT_MONTH}}), visa_required_for_saudis (true/false/null),
visa_note, safety_level, top_activities (3-5 items), clothing_tip, local_currency, time_zone

Output ONLY valid JSON. No markdown. No code fences. No text outside the JSON object.`;

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
      temperature: 0.65,
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
