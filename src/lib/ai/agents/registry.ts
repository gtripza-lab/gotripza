import "server-only";
/**
 * Agent registry — concrete agent definitions for future workflows.
 *
 * Each one is a thin AgentDefinition pointing at a system prompt + schema.
 * They're not wired into any UI yet — they exist as the foundation for
 * background workflows (Vercel Cron, Supabase Edge Functions, manual admin
 * triggers from the dashboard).
 */
import { z } from "zod";
import type { AgentDefinition } from "./base";

// ── Marketing copy agent ─────────────────────────────────────────────
export const marketingCopyAgent: AgentDefinition<{
  headline_ar: string;
  headline_en: string;
  subline_ar: string;
  subline_en: string;
  cta_ar: string;
  cta_en: string;
}> = {
  id: "marketing.copy",
  name: "Marketing Copy",
  modelTier: "lite",
  temperature: 0.7,
  systemPrompt: `You are Gotripza's marketing copywriter. Produce bilingual (Arabic Gulf dialect + English) ad copy for travel campaigns. Be concise, premium, and avoid clichés. Never use generic phrases like "amazing trip" or "unforgettable adventure". Output strict JSON: { headline_ar, headline_en, subline_ar, subline_en, cta_ar, cta_en }.`,
  outputSchema: z.object({
    headline_ar: z.string(),
    headline_en: z.string(),
    subline_ar: z.string(),
    subline_en: z.string(),
    cta_ar: z.string(),
    cta_en: z.string(),
  }),
};

// ── SEO meta-tag agent ───────────────────────────────────────────────
export const seoAgent: AgentDefinition<{
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  keywords: string[];
}> = {
  id: "seo.meta",
  name: "SEO Meta Tags",
  modelTier: "lite",
  temperature: 0.3,
  systemPrompt: `You are an SEO specialist for travel content. Given a destination + locale, produce optimized meta tags. Title ≤60 chars, description ≤160 chars. Output strict JSON: { title_ar, title_en, description_ar, description_en, keywords[] (5-10 items) }.`,
  outputSchema: z.object({
    title_ar: z.string().max(80),
    title_en: z.string().max(80),
    description_ar: z.string().max(220),
    description_en: z.string().max(220),
    keywords: z.array(z.string()).min(3).max(15),
  }),
};

// ── Analytics insight agent ──────────────────────────────────────────
export const analyticsAgent: AgentDefinition<{
  insight: string;
  recommended_actions: string[];
}> = {
  id: "analytics.insight",
  name: "Analytics Insight",
  modelTier: "primary",
  temperature: 0.4,
  systemPrompt: `You are a senior travel-business analyst. Given booking + chat metrics from the past period, identify the single most actionable insight. Be specific (numbers, percentages, destination/route names). Output strict JSON: { insight: string, recommended_actions: string[] (1-3 items) }.`,
  outputSchema: z.object({
    insight: z.string(),
    recommended_actions: z.array(z.string()).min(1).max(3),
  }),
};

// ── Content recommendation agent ─────────────────────────────────────
export const recommendationAgent: AgentDefinition<{
  destinations: Array<{ destination: string; reason_ar: string; reason_en: string }>;
}> = {
  id: "content.recommend_destinations",
  name: "Destination Recommender",
  modelTier: "lite",
  temperature: 0.65,
  systemPrompt: `Given a traveler profile (style, budget, interests, past destinations), recommend 5 destinations they haven't visited that match their profile. Output strict JSON: { destinations: [{ destination: IATA, reason_ar, reason_en }] }.`,
  outputSchema: z.object({
    destinations: z
      .array(
        z.object({
          destination: z.string(),
          reason_ar: z.string(),
          reason_en: z.string(),
        }),
      )
      .min(3)
      .max(8),
  }),
};

export const AGENT_REGISTRY = {
  [marketingCopyAgent.id]: marketingCopyAgent,
  [seoAgent.id]: seoAgent,
  [analyticsAgent.id]: analyticsAgent,
  [recommendationAgent.id]: recommendationAgent,
};
