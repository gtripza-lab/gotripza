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

/**
 * Update preferences after a successful turn.
 *
 * Fires fire-and-forget from the parse route — never awaited, never blocks.
 */
export async function extractAndUpdate(
  userId: string,
  intent: TripIntent,
  userMessage: string,
): Promise<void> {
  if (!userId) return;
  try {
    const current = await getPreferences(userId);
    const patch: Partial<TravelerPreferences> = {};

    // Budget tier
    const tier = budgetTierFromUsd(intent.budget_usd);
    if (tier && tier !== current.budget_tier) patch.budget_tier = tier;

    // Travels-with
    const tw = travelsWithFromTripType(intent.trip_type);
    if (tw && !current.travels_with.includes(tw)) {
      patch.travels_with = uniq([...current.travels_with, tw]);
    }

    // Past destinations — append IATA when search succeeded
    if (intent.destination && !current.past_destinations.includes(intent.destination)) {
      patch.past_destinations = uniq([
        ...current.past_destinations,
        intent.destination,
      ]).slice(-20); // cap to last 20
    }

    // Interest signals from message text (cheap regex scan)
    const text = userMessage.toLowerCase();
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
      patch.interests = uniq([...current.interests, ...newInterests]);
    }

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
): Promise<void> {
  if (!sessionId) return;
  try {
    const current = await getAnonPreferences(sessionId);
    const patch: Partial<AnonPreferences> = {};

    const tier = budgetTierFromUsd(intent.budget_usd);
    if (tier && tier !== current.budget_tier) patch.budget_tier = tier;

    const tw = travelsWithFromTripType(intent.trip_type);
    if (tw && !current.travels_with.includes(tw)) {
      patch.travels_with = uniq([...current.travels_with, tw]);
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

    const text = userMessage.toLowerCase();
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

    if (Object.keys(patch).length === 0) return;
    await updateAnonPreferences(sessionId, patch);
  } catch (err) {
    console.warn("[memory] extractAndUpdateAnon failed:", (err as Error).message);
  }
}
