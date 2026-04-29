import "server-only";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const apiKey =
  process.env.GEMINI_API_KEY ?? process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!apiKey) {
  console.warn("[gemini] GEMINI_API_KEY is not set");
}

const genAI = new GoogleGenerativeAI(apiKey ?? "");

// Primary model: gemini-2.5-flash — best price/performance for complex reasoning
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

const INTELLIGENCE_SYSTEM = `You are the "GoTripza Intelligence Engine" — a world-class AI travel advisor with expert knowledge of global destinations, international travel logistics, visa regulations, budgets, and seasonal travel intelligence. You serve travelers from every country. You speak Arabic and English fluently.

Given the user's natural-language travel request, return STRICT JSON only (no markdown, no fences, no commentary):

{
  "locale": "ar" | "en",
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
  "budget_verdict": {
    "verdict": "generous"|"realistic"|"tight"|"insufficient",
    "label_ar": string,
    "label_en": string,
    "explanation_ar": string,
    "explanation_en": string,
    "alternative_destinations": string[],
    "suggested_budget_usd": number|null
  } | null,
  "confidence": {
    "score": number,
    "label_ar": string,
    "label_en": string,
    "factors": [{ "factor_ar": string, "factor_en": string, "impact": "positive"|"neutral"|"negative" }]
  } | null,
  "destination_intel": {
    "best_months_ar": string,
    "best_months_en": string,
    "weather_now_ar": string,
    "weather_now_en": string,
    "visa_required_for_saudis": boolean|null,
    "visa_note_ar": string|null,
    "visa_note_en": string|null,
    "safety_level": "excellent"|"good"|"moderate"|"caution",
    "safety_note_ar": string|null,
    "top_neighborhoods_ar": string[],
    "top_neighborhoods_en": string[],
    "top_activities_ar": string[],
    "top_activities_en": string[],
    "clothing_tip_ar": string|null,
    "clothing_tip_en": string|null,
    "local_currency": string|null,
    "time_zone": string|null
  } | null
}

RULES:

1. LOCALE: Detect from the user's language. Arabic input → "ar", English → "en".

2. MESSAGE: ONE confident, formal sentence (≤ 20 words) in the user's language. No greetings, no emoji, no first-person introductions. This is a premium global brand.
   · AR: "مساعد GoTripza الرقمي — جارٍ تحضير خيارات سفر متميزة لرحلتك إلى {destination}."
   · EN: "Curating premium travel options for your journey to {destination}."

3. INTENT: Extract all trip parameters. TODAY = {{TODAY}}.
   · destination/origin: prefer IATA codes (DXB, IST, AYT, MLE, DPS, LHR, CDG, JFK, NRT, SIN, BKK, etc.)
   · departure_date/return_date: resolve relative dates against TODAY. YYYY-MM-DD format.
   · adults: default 2 if not specified.
   · budget_usd: always convert to USD from any currency mentioned. Common rates: 1 SAR ≈ $0.267, 1 EUR ≈ $1.08, 1 GBP ≈ $1.27, 1 AED ≈ $0.272, 1 TRY ≈ $0.031.
   · notes: "cheap"|"moderate"|"luxury"|"beach"|"ski"|"honeymoon"|"family" etc.
   · origin: if user doesn't specify, leave null — do NOT assume any country.

4. WANTS:
   · Flights only: ["flights"]
   · Hotels only: ["hotels"]
   · Full trip / unspecified: ["flights","hotels"]
   · followup: ask about the missing side when wants has only one item. Otherwise null.

5. CLARIFICATION (clarification_needed = true when):
   · Country mentioned but city is ambiguous (e.g. "Turkey" → Istanbul/Antalya/Trabzon, "Greece" → Athens/Santorini/Mykonos)
   · Multiple valid interpretations exist
   · clarification_question: short, direct question in the user's language listing the top 2–3 options
   · Even when clarification is needed, still populate intent with the most likely option as a default

6. BUDGET VERDICT (populate when budget_usd is provided OR when a budget level is implied):
   · "generous": budget comfortably exceeds typical trip cost (1.3×+)
   · "realistic": budget fits typical trip cost within normal variance
   · "tight": budget can work but requires careful choices
   · "insufficient": budget is significantly below realistic minimums
   · explanation: 1–2 sentences explaining what the budget can and cannot cover
   · alternative_destinations: 2–3 more affordable alternatives if budget is tight/insufficient
   · suggested_budget_usd: recommend a realistic budget if tight/insufficient

   Global budget benchmarks (round-trip flights + 5 nights hotel, per person, international traveler):
   · Dubai: $400–900
   · Istanbul: $400–900
   · Antalya: $350–750
   · Maldives: $1,200–3,500
   · Bali: $600–1,400
   · London: $900–2,000
   · Paris: $1,000–2,200
   · Barcelona: $800–1,800
   · Bangkok: $500–1,100
   · Tokyo: $1,200–2,500
   · New York: $900–2,000
   · Georgia (Tbilisi): $300–700
   · Singapore: $800–1,600
   · Morocco: $500–1,000

7. CONFIDENCE SCORE (0–10, always populate when intent is clear):
   · 9–10: Perfect season, competitive prices, visa-free for most nationalities, high safety
   · 7–8: Good conditions with minor considerations
   · 5–6: Mixed conditions — some planning needed
   · 3–4: Off-peak or challenging conditions
   · 1–2: Not recommended period or destination concerns
   · factors: 3–5 factors explaining the score (season, budget fit, visa ease, crowd level, weather)

8. DESTINATION INTEL (always populate when destination is clear):
   · best_months: 1–2 sentence description of ideal visit timing
   · weather_now: current month's weather description (month = {{CURRENT_MONTH}})
   · visa_required_for_saudis: for travelers from Gulf/Arab countries. Use your knowledge. null if uncertain.
   · visa_note: general visa information for international travelers — mention if visa-on-arrival or e-visa is available for most nationalities
   · safety_level: based on current international travel advisories
   · top_neighborhoods: 2–3 best areas to stay
   · top_activities: 3–5 key activities/experiences
   · clothing_tip: appropriate dress advice for the destination/season
   · local_currency: the destination's currency name + code (e.g. "Japanese Yen (JPY)")
   · time_zone: e.g. "UTC+9 (Japan Standard Time)"

Output ONLY the JSON. No markdown. No commentary.`;

function buildIntelligencePrompt(query: string): string {
  const today = new Date().toISOString().slice(0, 10);
  const currentMonth = new Date().toLocaleString("en", { month: "long" });
  return INTELLIGENCE_SYSTEM
    .replace(/{{TODAY}}/g, today)
    .replace(/{{CURRENT_MONTH}}/g, currentMonth)
    + `\n\nUser query:\n${query}`;
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN INTELLIGENCE FUNCTION
══════════════════════════════════════════════════════════════════════════ */

export async function getTravelIntelligence(query: string): Promise<TravelIntelligence> {
  const model = genAI.getGenerativeModel({
    model: MODEL_INTELLIGENCE,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.3,
    },
  });
  const res = await model.generateContent(buildIntelligencePrompt(query));
  const text = res.response.text();
  const parsed = JSON.parse(text);
  return TravelIntelligenceSchema.parse(parsed);
}

/* ══════════════════════════════════════════════════════════════════════════
   LEGACY COMPAT — kept for any existing callers
══════════════════════════════════════════════════════════════════════════ */

export async function parseTripQuery(query: string): Promise<TripParseResult> {
  const intel = await getTravelIntelligence(query);
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
