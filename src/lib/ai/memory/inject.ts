import "server-only";
/**
 * Memory injection — converts stored preferences + profile into a compact
 * prompt block that gets prepended to Raya's system context.
 *
 * Goal: Raya knows her user. ~50-150 tokens, never floods context.
 */
import { getPreferences, getProfile } from "./store";
import type { TravelerPreferences, Profile } from "./types";

function buildBlock(profile: Profile | null, prefs: TravelerPreferences): string {
  const lines: string[] = [];
  if (profile?.display_name) lines.push(`• Name: ${profile.display_name}`);
  if (profile?.default_origin) lines.push(`• Usual origin: ${profile.default_origin}`);
  if (prefs.travel_style) lines.push(`• Travel style: ${prefs.travel_style}`);
  if (prefs.budget_tier) lines.push(`• Budget tier: ${prefs.budget_tier}`);
  if (prefs.trip_pace) lines.push(`• Pace: ${prefs.trip_pace}`);
  if (prefs.travels_with.length)
    lines.push(`• Travels with: ${prefs.travels_with.slice(0, 4).join(", ")}`);
  if (prefs.interests.length)
    lines.push(`• Interests: ${prefs.interests.slice(0, 6).join(", ")}`);
  if (prefs.dietary.length)
    lines.push(`• Dietary: ${prefs.dietary.join(", ")}`);
  if (prefs.accessibility_needs.length)
    lines.push(`• Accessibility: ${prefs.accessibility_needs.join(", ")}`);
  if (prefs.preferred_airlines.length)
    lines.push(
      `• Preferred airlines: ${prefs.preferred_airlines.slice(0, 3).join(", ")}`,
    );
  if (prefs.past_destinations.length)
    lines.push(
      `• Past destinations: ${prefs.past_destinations.slice(-5).join(", ")}`,
    );

  if (lines.length === 0) return "";
  return (
    `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `TRAVELER MEMORY (use to personalize, NEVER ask about these — already known):\n` +
    lines.join("\n") +
    `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
  );
}

/**
 * Compose a memory block for the prompt. Returns "" when no userId is
 * given (anonymous users) or when the user has no stored preferences yet.
 *
 * Wrap with try/catch — memory should never break the chat.
 */
export async function buildMemoryBlock(
  userId: string | null | undefined,
): Promise<string> {
  if (!userId) return "";
  try {
    const [profile, prefs] = await Promise.all([
      getProfile(userId),
      getPreferences(userId),
    ]);
    return buildBlock(profile, prefs);
  } catch (err) {
    console.warn("[memory] buildMemoryBlock failed:", (err as Error).message);
    return "";
  }
}
