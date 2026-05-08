# Gotripza AI Platform Migration — Architecture & Plan

**Status:** Phase 2 in progress (OpenAI integration)
**Strategy:** Strangler Pattern — Gemini stays online behind a feature flag until OpenAI is stable.

---

## 1. Current System Map (from Phase 1 audit)

### Gemini surface
- `src/lib/gemini.ts` — primary intelligence, schemas, prompts, plus 3 unused exports (legacy compat).
- `src/app/api/health/route.ts` — duplicate Gemini client for the health probe.
- `src/app/[locale]/trip/[slug]/page.tsx` — calls `generateDestinationDescription`.
- `src/lib/raya-intelligence.ts` — **dead code** (zero imports). To be deleted or activated as memory-backed knowledge.

### Request lifecycle (today)
```
ChatInterface → ChatContext.sendMessage
              → POST /api/parse  { query, history, context }
                  → getTravelIntelligence (Gemini, 4-model fallback)
                  → enforceConversationalMode (server-side override layer)
                  → getLiveTips (Gemini + googleSearch grounding) [search mode only]
                  → on error: heuristicFallback (regex parser + canned messages)
              → if mode==="search" → POST /api/search { intent, currency }
                                    → searchFlights + searchHotels (parallel)
              → fire-and-forget POST /api/history (write-only log)
```

### State boundaries (today)
- **Conversation history**: client-only (`ChatContext.messages`). Lost on refresh.
- **TravelContext** (slot-fill): client-only. Sent on every request, merged via `mergeContext`.
- **Server**: stateless. Has no session or user context.
- **DB writes**: analytics events, affiliate clicks, conversion webhook, query log — none are tied to a `user_id`.

### Identified loop / "stupidity" causes
| ID | Cause | Source |
|---|---|---|
| A | Echoed `intent.destination` only updates `context` AFTER request returns | `ChatContext.tsx:235` |
| B | `enforceConversationalMode` overrides Gemini's good answer with canned text | `parse/route.ts:62-77` |
| C | Heuristic fallback ignores prior `mode==="advice"` | `parse/route.ts:140-142` |
| D | `destination` defaults to `""` — produces "your destination" fallback | `gemini.ts:28`, `route.ts:56` |
| E | Assistant `mode` not forwarded in history — model can't see its own state | `ChatContext.tsx:188-194` |
| F | `buildHistoryContext` excludes assistant turns — heuristic loses follow-up context | `parse/route.ts:108-116` |
| G | Welcome message synthesized client-side, never tied to extracted intent | `ChatContext.tsx:127-132` |
| H | Prompt's "all three required" rule fires even for hotels-only requests | `gemini.ts:194-198`, `route.ts:71` |

### Schema fragility
- `TravelIntelligenceSchema.mode` is the single most load-bearing string (drives all client branching). Treat as stable contract.
- `ChatTurn.role === "model"` leaks Gemini terminology — rename to `"assistant"` for OpenAI parity.
- `TripIntent.destination: ""` default vs nullable rest — inconsistency contributes to loop B/D.

### Data layer gaps
- Magic-link OTP UI exists but has no `/auth/callback`, no middleware enforcement, no session reading.
- Two parallel schema sources (UUID `schema.sql` vs BIGSERIAL migrations) — code matches BIGSERIAL.
- `users`, `saved_itineraries`, `affiliate_clicks`, `conversions` tables declared but never written.
- No conversation persistence. No user preferences. No memory.
- Stripe / billing / subscriptions: zero code (greenfield).

### Tool-readiness
| Integration | Wrap-as-tool today? | Gap |
|---|---|---|
| Travelpayouts flights | ✅ ready | surface 404 as `tool_error` |
| Travelpayouts hotels | ⚠️ partial | hotel-level deep links missing |
| 12 affiliate partners | ⚠️ URL-only | no live API; reframe as `recommend_link` tool |
| Stripe / Ria Plus | ❌ greenfield | full stack to build |
| Memory recall | ❌ no read path | server `getUserMemory(userId)` to add |

---

## 2. Executive Decisions (made now to unblock work)

1. **API choice: OpenAI Responses API** — native `web_search`, structured outputs via JSON schema, function calling. Replaces Gemini grounding.
2. **Orchestration: custom lightweight state machine** — not LangGraph. Smaller surface, clearer for a focused travel agent.
3. **Memory: structured records first, pgvector later** — preferences (budget tier, travel style, dietary, etc.) are structured; semantic recall added when needed.
4. **Schema: BIGSERIAL canonical** — delete `schema.sql`, `0001_events.sql`, `0002_booking_clicks.sql`. New migration adds `profiles`, `conversations`, `messages`, `traveler_preferences`, `subscriptions`.
5. **Migration: Strangler with `AI_PROVIDER` flag** — `openai|gemini|auto`. Production traffic moves only after parity tests pass.
6. **Auth: complete the magic-link callback now** — anonymous users keep working via `session_id` cookies; signed-in users get persistent memory.
7. **Heuristic fallback: keep, refactor as pre-filter** — extracts obvious slots before LLM call (token savings + safety net when LLM is down).

---

## 3. Module Layout (target)

```
src/lib/ai/
├── index.ts                    # public API: getTravelIntelligence, etc.
├── types.ts                    # TS types (provider-agnostic)
├── config.ts                   # AI_PROVIDER flag, model selection
├── schemas/
│   ├── intent.ts               # Zod: TripIntent, TravelContext
│   ├── intelligence.ts         # Zod: TravelIntelligence (the response contract)
│   ├── memory.ts               # Zod: TravelerPreferences, ConversationSummary
│   └── tools.ts                # Zod: tool input/output schemas
├── prompts/
│   ├── raya-system.ts          # Master Raya persona + rules (provider-agnostic)
│   ├── memory-injection.ts     # Compact memory blocks for prompt
│   └── fragments.ts            # Reusable: origin/dest disambiguation, mode rules
├── providers/
│   ├── openai.ts               # Responses API client + structured outputs
│   ├── gemini.ts               # Existing wrapper (kept until cutover)
│   └── selector.ts             # Provider routing per AI_PROVIDER flag
├── tools/
│   ├── search-flights.ts       # OpenAI tool: wraps searchFlights
│   ├── search-hotels.ts        # OpenAI tool: wraps searchHotels
│   ├── recommend-partners.ts   # OpenAI tool: wraps getPartnerRecommendations
│   ├── get-destination-intel.ts# OpenAI tool: structured destination knowledge
│   └── get-user-memory.ts      # OpenAI tool: pulls preferences from Supabase
├── memory/
│   ├── store.ts                # Supabase reads/writes for conversations/preferences
│   ├── summarize.ts            # rolling summary to keep context window lean
│   └── extract.ts              # extract preferences from conversation
├── orchestrator/
│   ├── state.ts                # ConversationState machine (clarify/search/advice/...)
│   ├── pre-filter.ts           # deterministic slot extraction (refactored heuristic)
│   ├── pipeline.ts             # main run-loop: pre-filter → LLM → post-process → tools
│   └── post-process.ts         # mode enforcement, but smarter than current
└── deterministic/
    └── parser.ts               # ex-mock-intent.ts, refactored
```

### Old files (managed for the strangler period)
- `src/lib/gemini.ts` — kept, called only via `providers/gemini.ts`. Deleted in Phase 11.
- `src/lib/mock-intent.ts` — moved to `ai/deterministic/parser.ts` (re-exported during transition).
- `src/lib/raya-intelligence.ts` — deleted (dead code; activate replacement inside `ai/memory/`).

---

## 4. Phased Execution Plan

| Phase | Scope | Owner | Status |
|---|---|---|---|
| 1 | Audit + architecture map | Opus | ✅ done |
| 2 | OpenAI module + Strangler flag | Opus | ✅ done |
| 3 | Ria Core: pre-filter + state machine + post-process | Opus | ✅ done |
| 4 | Memory: profiles, conversations, preferences (Supabase) | Opus | ✅ done |
| 5 | Auth completion (magic-link callback + middleware) | Sonnet | ✅ done |
| 6 | Tool/function calling: flights, hotels, partners, memory | Opus | ✅ done |
| 7 | Subscription scaffolding (Stripe + entitlements, free for now) | Sonnet | ✅ done |
| 8 | AI Support workflows + escalation | Opus | ✅ done |
| 9 | Future-agent foundation (marketing/SEO/analytics agent shells) | Opus | ✅ done |
| 10 | Cost optimization (rolling summaries, model tiering, caching) | Opus | ✅ done |
| 11 | Cutover: delete Gemini code, flip default flag | Opus | pending (after OpenAI billing live) |

## Phase 11 Cutover Checklist

Once `OPENAI_API_KEY` is funded and stable for ~7 days:

1. Set `AI_PROVIDER=openai` (no fallback) in production env.
2. Monitor `[ai/selector]` logs for errors for 48h.
3. Run `npm run build` and verify no Gemini calls in flame graph.
4. Delete `src/lib/gemini.ts`, `src/lib/ai/providers/gemini.ts`.
5. Remove the Gemini health-check branch in `src/app/api/health/route.ts`.
6. Delete `GEMINI_API_KEY` from `.env.local` and Vercel env.
7. Delete `@google/generative-ai` from `package.json`.

## Operator Setup Checklist (post-deploy)

Things you (operator) must do in external dashboards:

**OpenAI** — [platform.openai.com](https://platform.openai.com)
- [ ] Add billing credits ($10+ recommended for first 30 days)
- [ ] Rotate API key (the one shared in chat is exposed)

**Supabase** — [supabase.com/dashboard](https://supabase.com/dashboard)
- [ ] Run migration `supabase/migrations/20260508000001_ria_memory_and_billing.sql`
- [ ] (Optional) `supabase gen types typescript` to drop the `as any` casts in `src/lib/ai/memory/store.ts`

**Stripe** — [dashboard.stripe.com](https://dashboard.stripe.com) (only when ready to charge)
- [ ] Create product "Ria Plus" with monthly + yearly prices
- [ ] Copy price IDs into `STRIPE_PRICE_RIA_PLUS_MONTHLY` / `_YEARLY`
- [ ] Add webhook endpoint: `https://gotripza.com/api/billing/webhook` listening to:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- [ ] Copy webhook signing secret into `STRIPE_WEBHOOK_SECRET`
- [ ] Set `RIA_PLUS_GATING_ENABLED=true` only when you want to start charging

---

## 5. Loop Fixes (mapped from audit IDs to Phase work)

| Bug | Fix | Phase |
|---|---|---|
| A | Pre-filter merges new intent INTO context BEFORE LLM call (server-side merge replaces client merge) | 3 |
| B | Replace `enforceConversationalMode` with `post-process` that nudges, never overwrites the LLM message | 3 |
| C | Heuristic uses full conversation context including assistant mode/intent | 3 |
| D | `TripIntent.destination: z.string().nullable()` (no empty default) | 2 |
| E | History includes `assistant_mode` per turn | 3 |
| F | `buildHistoryContext` includes both roles, marked clearly | 3 |
| G | Welcome message generated by orchestrator (warmer, locale-aware, intent-empty) | 3 |
| H | "Required slots" computed from `wants` — hotels-only skips origin | 3 |

---

## 6. Cost Discipline (Phase 10 preview)

- **Tiered model selection**: `gpt-4o` for clarify/advice/search-decision (`AI_MODEL_PRIMARY`), `gpt-4o-mini` for tips/descriptions/summaries (`AI_MODEL_LITE`).
- **Pre-filter saves a Tier-1 call** when intent is fully extractable deterministically.
- **Rolling summary** at >12 turns: replace older history with a 200-token summary.
- **Cache destination intel** (Supabase, TTL 7d) — same destination doesn't re-query for weather/visa basics.
- **No streaming for parse calls** (we need full structured output before any client action). Stream only for "advice" answers where text-by-text helps UX.

---

*This document is the source of truth for the migration. Updated each phase.*
