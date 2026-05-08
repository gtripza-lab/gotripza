import "server-only";
import { getPreferences, getProfile } from "../memory/store";
import type { ToolDef } from "./index";

type Input = Record<string, never>; // no input — uses ctx.userId

export const getUserMemoryTool: ToolDef<Input, unknown> = {
  name: "get_user_memory",
  description:
    "Retrieve the signed-in user's stored travel preferences (style, budget tier, interests, dietary needs, past destinations) and profile (locale, currency, default origin). Use ONLY when needed for personalization. Returns { authenticated: false } if the user is anonymous.",
  parameters: {
    type: "object",
    properties: {},
    additionalProperties: false,
  },
  async execute(_input, ctx) {
    if (!ctx.userId) return { authenticated: false };
    const [profile, prefs] = await Promise.all([
      getProfile(ctx.userId),
      getPreferences(ctx.userId),
    ]);
    return {
      authenticated: true,
      profile: {
        display_name: profile?.display_name ?? null,
        locale: profile?.locale ?? "ar",
        currency: profile?.currency ?? "SAR",
        default_origin: profile?.default_origin ?? null,
      },
      preferences: {
        travel_style: prefs.travel_style,
        budget_tier: prefs.budget_tier,
        trip_pace: prefs.trip_pace,
        travels_with: prefs.travels_with,
        interests: prefs.interests,
        dietary: prefs.dietary,
        accessibility_needs: prefs.accessibility_needs,
        preferred_airlines: prefs.preferred_airlines,
        past_destinations: prefs.past_destinations.slice(-10),
      },
    };
  },
};
