import "server-only";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const apiKey =
  process.env.GEMINI_API_KEY ?? process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!apiKey) {
  console.warn("[gemini] GEMINI_API_KEY is not set");
}

const genAI = new GoogleGenerativeAI(apiKey ?? "");
const MODEL_ID = "gemini-1.5-flash";

export const TripIntentSchema = z.object({
  origin: z.string().nullable(),
  destination: z.string(),
  departure_date: z.string().nullable(),
  return_date: z.string().nullable(),
  adults: z.number().int().min(1).max(9).default(1),
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

export const TripParseSchema = z.object({
  locale: z.enum(["ar", "en"]),
  message: z.string(),
  wants: WantsSchema,
  followup: z.string().nullable().default(null),
  intent: TripIntentSchema,
});

export type TripParseResult = z.infer<typeof TripParseSchema>;

const SYSTEM_PROMPT = `You are the official "GoTripza Digital Assistant". You are formal, minimalist, and luxurious. You never adopt a personal name; you always speak as the GoTripza Digital Assistant.

Given the user's natural-language travel request (Arabic or English), reply with STRICT JSON only:

{
  "locale": "ar" | "en",
  "message": string,
  "wants": ("flights" | "hotels")[],
  "followup": string | null,
  "intent": {
    "origin": string|null,
    "destination": string,
    "departure_date": string|null,
    "return_date": string|null,
    "adults": number,
    "budget_usd": number|null,
    "trip_type": "leisure"|"business"|"honeymoon"|"family"|"adventure"|"weekend"|null,
    "notes": string|null
  }
}

Rules:
- Detect the user's language and set "locale" accordingly.
- "message": ONE professional sentence (â¤ 18 words) in the same language as the user. No emoji, no greetings like "hello", no first-person introductions, no personal name. Examples:
  Â· EN â "GoTripza Digital Assistant â curating premium options for your itinerary."
  Â· AR â "ÙØ³Ø§Ø¶â¢ GoTripza Ø§ÙØ±ÙÙÙ ââ¢ Ø¬Ø§Ø± ØªØ­Ø¶ØØ± Ø®ÙØ§Ø±Ø§Øª Ø³ÙØ± ÙØ§Ø®Ø±Ù ÙØ±Ø­ÙØªÙ."
- "intent.origin" / "intent.destination": prefer 3-letter IATA codes (JED, RUH, DXB, AYT for Antalya, MLE for Maldives, PAR for Paris, IST for Istanbul). Origin may be null.
- "intent.departure_date" / "intent.return_date": YYYY-MM-DD. Resolve relative dates ("next month", "Ø§ÙØ´ÙØ± Ø§ÙÙØ§Ø¯Ù", "ÙÙÙ 10 Ø§ÙØ´ÙØ± Ø§ÙÙØ§Ø¯Ù") against TODAY = {{TODAY}}.
- "intent.adults": default 2 if unspecified.
- "intent.budget_usd": numeric USD if a budget level is mentioned (low â 800, moderate/ÙØªÙØ³Ø·Ø© â 1500, luxury â 4000). Null otherwise.
- "intent.notes": short tag â  "cheap" | "moderate" | "luxury" | "beach" | "ski" | "honeymoon" | etc.
- "wants": detect what the user explicitly asked for.
  Â· If they mention only flights / "Ø·ÙØ±Ø§Ù" / "Ø±Ø­ÙØ© Ø¬ÙÙØ©" / "ØªØ°Ø§ÙØ± Ø·ÙØ±Ø§Ù" â ["flights"].
  Â· If they mention only hotels / "ÙÙØ¯Ù" / "ÙÙØ§Ø¯Ù" / "Ø¥ÙØ§ÙØ©" / "stay" / "accommodation" â ["hotels"].
  Â· Otherwise (full trip planning, no explicit narrowing) â ["flights","hotels"].
- "followup": SHORT formal question in the same language asking if they want to see the OTHER side. Required when "wants" has only one item, otherwise null.
  Â· AR (hotels missing): "ÙÙ ØªÙØ¯ÙÙ Ø§Ø³ØªØ¹Ø±Ø§Ø¶ Ø®ÙØ§Ø±Ø§Øª Ø§ÙÙÙØ§Ø¯Ù Ø§ÙÙØªØ§Ø­Ø© ÙÙØ°Ù Ø§ÙÙØ¬ÙØ© Ø£ÙØ¶Ø§ÙØ"
  Â· EN (hotels missing): "Would you also like to view the available hotel options for this destination?"
  Â· AR (flights missing): "ÙÙ ØªÙØ¯ÙÙ Ø§Ø³ØªØ¹Ø±Ø§Ø¶ Ø±Ø­ÙØ§Øª Ø§ÙØ·ÙØ±Ø§Ù Ø§ÙÙØªØ§Ø­Ø© Ø¥ÙÙ ÙØ°Ù Ø§ÙÙØ¬ÙØ©Ø"
  Â· EN (flights missing): "Would you also like to view flight options to this destination?"
- Currency convention â whenever you mention any monetary amount in "message" or "followup":
  Â· If "locale" = "en" â quote in USD (e.g. "$1,200").
  Â· If "locale" = "ar" â quote in SAR (e.g. "4,500 Ø±ÙØ§Ù" or "SAR 4,500").
  Â· "intent.budget_usd" remains the canonical USD value regardless of locale (convert if user spoke in another currency, e.g. 5,625 SAR â 1,500 USD).

Output ONLY the JSON. No markdown fences. No commentary.`;

function buildPrompt(query: string) {
  const today = new Date().toISOString().slice(0, 10);
  return `${SYSTEM_PROMPT.replace("{{TODAY}}", today)}\n\nUser query:\n${query}`;
}

export async function parseTripQuery(query: string): Promise<TripParseResult> {
  const model = genAI.getGenerativeModel({
    model: MODEL_ID,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });
  const res = await model.generateContent(buildPrompt(query));
  const text = res.response.text();
  return TripParseSchema.parse(JSON.parse(text));
}

/**
 * Live travel insight via Google Search grounding.
 * Returns ONE formal sentence (â¤ 25 words) about current weather / season /
 * local timing tips for the destination, in the requested locale.
 * Best-effort: returns null on any failure so the search flow stays robust.
 */
export async function getLiveTips(
  destination: string,
  locale: "ar" | "en",
): Promise<string | null> {
  if (!destination) return null;
  try {
    const model = genAI.getGenerativeModel({
      model: MODEL_ID,
      // Google Search grounding (Gemini 2.x)
      tools: [{ googleSearch: {} } as never],
      generationConfig: { temperature: 0.4 },
    });
    const lang = locale === "ar" ? "Ø§ÙØ¹Ø±Ø¨ÙØ© Ø§ÙÙØµØ­Ù" : "formal English";
    const directive =
      locale === "ar"
        ? `ÙØ¯ÙÙ Ø¬ÙÙØ© ÙØ§Ø­Ø¯Ø© ÙÙØ· (Ù¢Ù¥ ÙÙÙØ© ÙØ­Ø¯ Ø£ÙØµÙ) Ø¨Ù${lang} Ø­ÙÙ Ø­Ø§ÙØ© Ø§ÙØ·ÙØ³ Ø§ÙØ­Ø§ÙÙØ© Ø£Ù Ø§ÙÙÙØ³Ù Ø§ÙØ³ÙØ§Ø­Ù Ø£Ù ÙØµÙØ­Ø© Ø³ÙØ± Ø¬ÙÙØ±ÙØ© ÙÙÙØ¬ÙØ© "${destination}". Ø¥Ø°Ø§ Ø°ÙØ±Øª Ø£Ù ÙØ¨ÙØº ÙØ§ÙÙ Ø§Ø°ÙØ±Ù Ø¨Ø§ÙØ±ÙØ§Ù Ø§ÙØ³Ø¹ÙØ¯Ù. Ø¨Ø¯ÙÙ ÙÙØ¯ÙØ©Ø Ø¨Ø¯ÙÙ Ø§ÙØªØ¨Ø§Ø³Ø§ØªØ Ø¨Ø¯ÙÙ Ø±ÙÙØ² ØªØ¹Ø¨ÙØ±ÙØ©.`
        : `Provide exactly ONE sentence (â 25 words) in ${lang} about current weather, peak/off-peak season, or an essential travel tip for "${destination}". If you mention any monetary value, quote it in USD ($). No preface, no quotes, no emoji.`;

    const r = await model.generateContent(directive);
    const text = r.response.text().trim();
    return text.replace(/^["'`]+|["'`]+$/g, "").slice(0, 240) || null;
  } catch (err) {
    console.warn("[gemini] live tips unavailable:", (err as Error).message);
    return null;
  }
}

// Backward-compat for any caller that imports parseTripIntent.
export async function parseTripIntent(query: string): Promise<TripIntent> {
  return (await parseTripQuery(query)).intent;
}

/**
 * Generate a unique, SEO-optimised destination description.
 * Returns a 2â3 sentence paragraph in the requested locale.
 * Best-effort: returns null on any failure.
 */
export async function generateDestinationDescription(
  destination: string,
  locale: "ar" | "en",
): Promise<string | null> {
  if (!destination) return null;
  try {
    const model = genAI.getGenerativeModel({
      model: MODEL_ID,
      generationConfig: { temperature: 0.7 },
    });
    const directive =
      locale === "ar"
        ? `Ø§ÙØªØ¨ ÙÙØ±Ù Ø­ØµØ±ÙØ© ÙÙ ÙâÙ£ Ø¬ÙÙ (Ø¨Ø£Ø³ÙÙØ¨ Ø±Ø³ÙÙ ÙØ§Ø®Ø±Ø Ø¨Ø§ÙØ¹Ø±Ø¨ÙØ©) Ø¹Ù Ø§ÙÙØ¬ÙØ© Ø§ÙØ³ÙØ§Ø­ÙØ© "${destination}". ØªØ´ÙÙ: Ø£Ø¨Ø±Ø² Ø§ÙÙØ¹Ø§ÙÙØ Ø£ÙØ¶Ù ÙÙØª ÙÙØ²ÙØ§Ø±Ø©Ø ÙÙÙØ§Ø°Ø§ ØªØ®ØªØ§Ø±Ù Ø§Ø¹Ø¨Ø± GoTripza. Ø¨Ø¯ÙÙ ÙÙØ¯ÙØ©Ø Ø¨Ø¯ÙÙ Ø§ÙØªØ¨Ø§Ø³Ø§ØªØ Ø¨Ø¯ÙÙ Ø±ÙÙØ² ØªØ¹Ø¨ÙØ±ÙØ©.`
        : `Write an exclusive 2â3 sentence paragraph (formal, luxurious tone) about the travel destination "${destination}". Include: top highlights, best time to visit, and why travelers choose GoTripza for this trip. No preface, no quotes, no emoji.`;
    const r = await model.generateContent(directive);
    return r.response.text().trim().slice(0, 600) || null;
  } catch (err) {
    console.warn("[gemini] destination description unavailable:", (err as Error).message);
    return null;
  }
}
