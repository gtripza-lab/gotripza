/**
 * Memory types — provider-agnostic, used by the orchestrator + UI.
 * Mirrors the columns in supabase migration 20260508000001.
 */

export type TravelStyle = "luxury" | "comfort" | "balanced" | "budget" | "backpacker";
export type BudgetTier = "budget" | "moderate" | "premium" | "luxury";
export type TripPace = "relaxed" | "balanced" | "packed";

export type TravelerPreferences = {
  user_id: string;
  travel_style: TravelStyle | null;
  budget_tier: BudgetTier | null;
  travels_with: string[];
  trip_pace: TripPace | null;
  interests: string[];
  dietary: string[];
  accessibility_needs: string[];
  preferred_airlines: string[];
  past_destinations: string[];
  notes: Record<string, unknown>;
};

export type Profile = {
  id: string;
  email: string | null;
  display_name: string | null;
  locale: "ar" | "en";
  currency: string;
  default_origin: string | null;
  marketing_opt_in: boolean;
};

export type Conversation = {
  id: string;
  user_id: string | null;
  session_id: string | null;
  locale: "ar" | "en";
  started_at: string;
  last_at: string;
  summary: string | null;
  message_count: number;
};

export type StoredMessage = {
  id: number;
  conversation_id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  mode: "clarify" | "search" | "advice" | "tool_result" | null;
  intent: Record<string, unknown> | null;
  tokens_in: number | null;
  tokens_out: number | null;
  model: string | null;
  created_at: string;
};
