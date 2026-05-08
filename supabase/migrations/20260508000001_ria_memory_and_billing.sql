-- ─────────────────────────────────────────────────────────────────────
-- Ria Memory + Billing — Phase 4 + Phase 7 schema
-- ─────────────────────────────────────────────────────────────────────
-- Adds: profiles, conversations, messages, traveler_preferences,
--       destination_intel_cache, subscriptions, support_requests.
--
-- Coexists with the existing BIGSERIAL events/booking_clicks/search_history
-- tables. UUID-based legacy tables (schema.sql, 0001_events.sql,
-- 0002_booking_clicks.sql) should be considered deprecated; this migration
-- is the canonical source of truth for all per-user data.
-- ─────────────────────────────────────────────────────────────────────

-- ── Profiles ─────────────────────────────────────────────────────────
-- One row per Supabase auth user. Filled on first sign-in via /auth/callback.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  locale text default 'ar' check (locale in ('ar', 'en')),
  currency text default 'SAR',
  default_origin text,                -- IATA code, e.g. RUH
  marketing_opt_in boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Each user can read/update only their own profile.
drop policy if exists "profiles_self_read"   on public.profiles;
drop policy if exists "profiles_self_update" on public.profiles;
drop policy if exists "profiles_self_insert" on public.profiles;
create policy "profiles_self_read"   on public.profiles for select using (auth.uid() = id);
create policy "profiles_self_update" on public.profiles for update using (auth.uid() = id);
create policy "profiles_self_insert" on public.profiles for insert with check (auth.uid() = id);

-- ── Traveler Preferences ─────────────────────────────────────────────
-- Structured preference store. Updated by the AI extraction module after
-- conversations. Used by the orchestrator to personalize Raya's responses.
create table if not exists public.traveler_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  travel_style text check (travel_style in ('luxury','comfort','balanced','budget','backpacker')),
  budget_tier text check (budget_tier in ('budget','moderate','premium','luxury')),
  travels_with text[] default '{}',   -- ['family','partner','kids','solo','friends','business']
  trip_pace text check (trip_pace in ('relaxed','balanced','packed')),
  interests text[] default '{}',      -- ['beach','culture','food','nature','shopping','adventure',...]
  dietary text[] default '{}',        -- ['halal','vegetarian','vegan','gluten-free']
  accessibility_needs text[] default '{}',
  preferred_airlines text[] default '{}',
  past_destinations text[] default '{}',
  notes jsonb default '{}'::jsonb,    -- free-form: {seat_preference: "aisle", ...}
  updated_at timestamptz default now()
);

alter table public.traveler_preferences enable row level security;
drop policy if exists "prefs_self_all" on public.traveler_preferences;
create policy "prefs_self_all" on public.traveler_preferences for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Conversations ────────────────────────────────────────────────────
-- One row per chat session. session_id is for anonymous chats (cookie-bound).
-- user_id may be null until the user signs in mid-conversation.
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  session_id text,                    -- anon session cookie value
  locale text default 'ar',
  started_at timestamptz default now(),
  last_at timestamptz default now(),
  summary text,                       -- rolling summary (Phase 10)
  message_count int default 0,
  closed_at timestamptz
);
create index if not exists conversations_user_idx on public.conversations(user_id) where user_id is not null;
create index if not exists conversations_session_idx on public.conversations(session_id) where session_id is not null;

alter table public.conversations enable row level security;
drop policy if exists "conv_self_all" on public.conversations;
create policy "conv_self_all" on public.conversations for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Messages ─────────────────────────────────────────────────────────
-- One row per chat turn. Persisted by the parse route and the chat client.
create table if not exists public.messages (
  id bigserial primary key,
  conversation_id uuid references public.conversations(id) on delete cascade,
  role text not null check (role in ('user','assistant','system','tool')),
  content text not null,
  mode text check (mode in ('clarify','search','advice','tool_result',null)),
  intent jsonb,                       -- snapshot of TripIntent at this turn
  tokens_in int,
  tokens_out int,
  model text,                         -- which model produced this turn
  created_at timestamptz default now()
);
create index if not exists messages_conversation_idx on public.messages(conversation_id);

alter table public.messages enable row level security;
drop policy if exists "messages_self_all" on public.messages;
create policy "messages_self_all" on public.messages for all
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id and c.user_id = auth.uid()
    )
  );

-- ── Destination Intel Cache ──────────────────────────────────────────
-- Cost optimization: cache LLM-generated destination intel for 7 days
-- so repeated searches don't re-burn tokens.
create table if not exists public.destination_intel_cache (
  destination text not null,
  locale text not null check (locale in ('ar','en')),
  payload jsonb not null,
  created_at timestamptz default now(),
  expires_at timestamptz not null,
  primary key (destination, locale)
);

-- ── Subscriptions ────────────────────────────────────────────────────
-- Ria Plus billing. Currently free during launch — plan='launch_free'
-- gives users premium features without a Stripe customer.
create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'launch_free' check (plan in ('launch_free','free','plus','pro')),
  status text not null default 'active' check (status in ('active','past_due','canceled','incomplete','trialing')),
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_price_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  trial_ends_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.subscriptions enable row level security;
drop policy if exists "subs_self_read" on public.subscriptions;
create policy "subs_self_read" on public.subscriptions for select using (auth.uid() = user_id);
-- writes only via service role / webhook, no policy for anon/authenticated.

-- ── Support Requests ─────────────────────────────────────────────────
-- AI Support escalation (Phase 8). When Raya can't help, log a ticket.
create table if not exists public.support_requests (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete set null,
  conversation_id uuid references public.conversations(id) on delete set null,
  category text not null check (category in ('booking','refund','technical','complaint','question','other')),
  status text not null default 'open' check (status in ('open','in_progress','resolved','closed')),
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  subject text,
  body text,
  ai_summary text,
  contact_email text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.support_requests enable row level security;
drop policy if exists "support_self_read" on public.support_requests;
drop policy if exists "support_self_insert" on public.support_requests;
create policy "support_self_read" on public.support_requests for select using (auth.uid() = user_id);
create policy "support_self_insert" on public.support_requests for insert with check (auth.uid() = user_id or user_id is null);

-- ── Trigger: keep updated_at fresh on profiles/preferences/subs ──────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists prefs_touch on public.traveler_preferences;
create trigger prefs_touch before update on public.traveler_preferences
  for each row execute function public.touch_updated_at();

drop trigger if exists subs_touch on public.subscriptions;
create trigger subs_touch before update on public.subscriptions
  for each row execute function public.touch_updated_at();

drop trigger if exists support_touch on public.support_requests;
create trigger support_touch before update on public.support_requests
  for each row execute function public.touch_updated_at();
