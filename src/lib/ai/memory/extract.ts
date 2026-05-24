import "server-only";
/**
 * Preference extraction — runs after a successful conversation turn to
 * extract durable traveler facts and merge them into traveler_preferences.
 *
 * Cheap version (no LLM call): pattern-match common signals from the
 * recent exchange. Phase 10 may add an LLM-based extractor for richer
 * preference learning.
 */
import {
  getPreferences,
  updatePreferences,
  getAnonPreferences,
  updateAnonPreferences,
  type AnonPreferences,
} from "./store";
import type { TripIntent } from "../schemas/intent";
import type { TravelContext } from "../schemas/intent";
import type { TravelerPreferences } from "./types";

function uniq(arr: string[]): string[] {
  return Array.from(new Set(arr.filter(Boolean)));
}

/**
 * Map TripIntent.budget_usd into a budget tier preference.
 */
function budgetTierFromUsd(
  budget: number | null,
): TravelerPreferences["budget_tier"] {
  if (!budget || budget <= 0) return null;
  if (budget < 1000) return "budget";
  if (budget < 3000) return "moderate";
  if (budget < 8000) return "premium";
  return "luxury";
}

function travelsWithFromTripType(
  tripType: TripIntent["trip_type"],
): string | null {
  if (!tripType) return null;
  if (tripType === "honeymoon") return "partner";
  if (tripType === "family") return "family";
  if (tripType === "business") return "business";
  return null;
}

function travelStyleFromText(text: string): TravelerPreferences["travel_style"] | null {
  if (/فخم|رفاهية|luxury|5\s*star|five star|vip/i.test(text)) return "luxury";
  if (/مريح|راحة|comfort|comfortable/i.test(text)) return "comfort";
  if (/اقتصادي|رخيص|أوفر|budget|cheap|low cost/i.test(text)) return "budget";
  if (/شنطة|باك باك|backpack|hostel/i.test(text)) return "backpacker";
  return null;
}

function tripPaceFromText(text: string): TravelerPreferences["trip_pace"] | null {
  if (/هادئ|راحة|استرخاء|relaxed|slow/i.test(text)) return "relaxed";
  if (/مليان|كل يوم|نشاطات كثيرة|packed|busy/i.test(text)) return "packed";
  return null;
}

function appendNote(
  notes: Record<string, unknown>,
  key: string,
  values: string[],
): Record<string, unknown> {
  const current = Array.isArray(notes[key]) ? (notes[key] as string[]) : [];
  const merged = uniq([...current, ...values]).slice(-12);
  return { ...notes, [key]: merged };
}

function travelerSignals(text: string, context?: TravelContext): string[] {
  const signals: string[] = [];
  const hasKids = /أطفال|اطفال|kids|children|طفل/i.test(text);
  const hasFamily = /عائلة|عائلي|family/i.test(text) || context?.traveler_type === "family";
  if (hasKids) signals.push("kids");
  if (hasFamily || hasKids) signals.push("family");
  if (!hasKids && (/زوج|زوجة|couple|partner|honeymoon|شهر عسل/i.test(text) || context?.traveler_type === "couple")) signals.push("partner");
  if (/أصدقاء|friends/i.test(text) || context?.traveler_type === "friends") signals.push("friends");
  if (/لوحدي|solo|alone/i.test(text) || context?.traveler_type === "solo") signals.push("solo");
  if (/(?:^|[\s،,.؟?])(عمل|دوام|مؤتمر)(?=$|[\s،,.؟?])|business|conference/i.test(text) || context?.traveler_type === "business") signals.push("business");
  return uniq(signals);
}

function dietarySignals(text: string): string[] {
  const signals: string[] = [];
  if (/حلال|halal/i.test(text)) signals.push("halal");
  if (/vegetarian|نباتي/i.test(text)) signals.push("vegetarian");
  if (/vegan|نباتي صارم/i.test(text)) signals.push("vegan");
  if (/gluten|جلوتين/i.test(text)) signals.push("gluten-free");
  return signals;
}

function serviceSignals(text: string, context?: TravelContext): string[] {
  const signals = [...(context?.service_interests ?? [])];
  if (/تأمين|insurance/i.test(text)) signals.push("insurance");
  if (/esim|eSIM|شريحة|انترنت|إنترنت/i.test(text)) signals.push("esim");
  if (/نشاط|جولة|tour|activity|activities/i.test(text)) signals.push("activities");
  if (/سيارة|car rental|rent.*car|تأجير/i.test(text)) signals.push("cars");
  if (/تعويض|compensation|delay|تأخير/i.test(text)) signals.push("compensation");
  return uniq(signals);
}

/**
 * Update preferences after a successful turn.
 *
 * Fires fire-and-forget from the parse route — never awaited, never blocks.
 */
export async function extractAndUpdate(
  userId: string,
  intent: TripIntent,
  userMessage: string,
  context?: TravelContext,
): Promise<void> {
  if (!userId) return;
  try {
    const current = await getPreferences(userId);
    const patch: Partial<TravelerPreferences> = {};

    // Budget tier
    const tier = budgetTierFromUsd(intent.budget_usd);
    if (tier && tier !== current.budget_tier) patch.budget_tier = tier;

    // Travels-with
    const text = userMessage.toLowerCase();
    const tw = travelsWithFromTripType(intent.trip_type);
    const travelers = uniq([...(tw ? [tw] : []), ...travelerSignals(text, context)]);
    const newTravelers = travelers.filter((t) => !current.travels_with.includes(t));
    if (newTravelers.length) {
      patch.travels_with = uniq([...current.travels_with, ...newTravelers]);
    }

    // Past destinations — append IATA when search succeeded
    if (intent.destination && !current.past_destinations.includes(intent.destination)) {
      patch.past_destinations = uniq([
        ...current.past_destinations,
        intent.destination,
      ]).slice(-20); // cap to last 20
    }

    const style = travelStyleFromText(text);
    if (style && style !== current.travel_style) patch.travel_style = style;
    const pace = tripPaceFromText(text);
    const contextPace = context?.booking_stage === "planning" && /هادئ|relaxed|slow/i.test(text) ? "relaxed" : null;
    if ((pace ?? contextPace) && (pace ?? contextPace) !== current.trip_pace) {
      patch.trip_pace = pace ?? contextPace;
    }

    const interestMap: Array<[RegExp, string]> = [
      [/beach|شاطئ|بحر/, "beach"],
      [/culture|متاحف|تاريخ/, "culture"],
      [/food|أكل|مطاعم/, "food"],
      [/nature|طبيعة|جبال|غابات/, "nature"],
      [/shopping|تسوق|أسواق/, "shopping"],
      [/adventure|مغامرة|trekking|ski/, "adventure"],
      [/honeymoon|شهر عسل/, "romance"],
      [/diving|غوص|snorkel/, "diving"],
    ];
    const newInterests: string[] = [];
    for (const [re, tag] of interestMap) {
      if (re.test(text) && !current.interests.includes(tag))
        newInterests.push(tag);
    }
    if (newInterests.length) {
      patch.interests = uniq([...current.interests, ...newInterests]);
    }

    const dietary = dietarySignals(text).filter((d) => !current.dietary.includes(d));
    if (dietary.length) patch.dietary = uniq([...current.dietary, ...dietary]);

    const notes = current.notes ?? {};
    const services = serviceSignals(text, context);
    const hotelPrefs = context?.hotel_preferences ?? [];
    const concerns = context?.concerns ?? [];
    let nextNotes = notes;
    if (services.length) nextNotes = appendNote(nextNotes, "service_interests", services);
    if (hotelPrefs.length) nextNotes = appendNote(nextNotes, "hotel_preferences", hotelPrefs);
    if (concerns.length) nextNotes = appendNote(nextNotes, "travel_concerns", concerns);
    if (JSON.stringify(nextNotes) !== JSON.stringify(notes)) patch.notes = nextNotes;

    if (Object.keys(patch).length === 0) return;
    await updatePreferences(userId, patch);
  } catch (err) {
    console.warn("[memory] extractAndUpdate failed:", (err as Error).message);
  }
}

/**
 * M6: Anonymous-session variant — same logic, persisted to session_preferences.
 * Keyed by gtz_sid cookie so anonymous users build a lightweight profile too.
 */
export async function extractAndUpdateAnon(
  sessionId: string,
  intent: TripIntent,
  userMessage: string,
  context?: TravelContext,
): Promise<void> {
  if (!sessionId) return;
  try {
    const current = await getAnonPreferences(sessionId);
    const patch: Partial<AnonPreferences> = {};

    const tier = budgetTierFromUsd(intent.budget_usd);
    if (tier && tier !== current.budget_tier) patch.budget_tier = tier;

    const text = userMessage.toLowerCase();
    const tw = travelsWithFromTripType(intent.trip_type);
    const travelers = uniq([...(tw ? [tw] : []), ...travelerSignals(text, context)]);
    const newTravelers = travelers.filter((t) => !current.travels_with.includes(t));
    if (newTravelers.length) {
      patch.travels_with = uniq([...current.travels_with, ...newTravelers]);
    }

    if (
      intent.destination &&
      !current.past_destinations.includes(intent.destination)
    ) {
      patch.past_destinations = uniq([
        ...current.past_destinations,
        intent.destination,
      ]).slice(-20);
    }

    const style = travelStyleFromText(text);
    if (style && style !== current.travel_style) patch.travel_style = style;
    const pace = tripPaceFromText(text);
    if (pace && pace !== current.trip_pace) patch.trip_pace = pace;

    const interestMap: Array<[RegExp, string]> = [
      [/beach|شاطئ|بحر/, "beach"],
      [/culture|متاحف|تاريخ/, "culture"],
      [/food|أكل|مطاعم/, "food"],
      [/nature|طبيعة|جبال|غابات/, "nature"],
      [/shopping|تسوق|أسواق/, "shopping"],
      [/adventure|مغامرة|trekking|ski/, "adventure"],
      [/honeymoon|شهر عسل/, "romance"],
      [/diving|غوص|snorkel/, "diving"],
    ];
    const newInterests: string[] = [];
    for (const [re, tag] of interestMap) {
      if (re.test(text) && !current.interests.includes(tag))
        newInterests.push(tag);
    }
    if (newInterests.length) {
      patch.interests = uniq([...current.interests, ...newInterests]).slice(-12);
    }

    const notes = current.notes ?? {};
    const services = serviceSignals(text, context);
    const hotelPrefs = context?.hotel_preferences ?? [];
    const concerns = context?.concerns ?? [];
    let nextNotes = notes;
    if (services.length) nextNotes = appendNote(nextNotes, "service_interests", services);
    if (hotelPrefs.length) nextNotes = appendNote(nextNotes, "hotel_preferences", hotelPrefs);
    if (concerns.length) nextNotes = appendNote(nextNotes, "travel_concerns", concerns);
    if (JSON.stringify(nextNotes) !== JSON.stringify(notes)) patch.notes = nextNotes;

    if (Object.keys(patch).length === 0) return;
    await updateAnonPreferences(sessionId, patch);
  } catch (err) {
    console.warn("[memory] extractAndUpdateAnon failed:", (err as Error).message);
  }
}
