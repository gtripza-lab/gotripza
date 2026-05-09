-- ============================================================================
-- Production Hardening Migration (2026-05-09)
-- ----------------------------------------------------------------------------
-- B3: increment_conversation RPC (was missing → message_count never bumped)
-- B1: rate_limits table + atomic rate_limit_hit() function
-- M6: session_preferences for anonymous users (keyed by gtz_sid cookie)
-- M7: conversations.summary persisted column already exists — verified
-- M14: messages.tokens_in/out/model/latency_ms/provider columns
-- M15: ai_traces table for orchestrator telemetry
-- ============================================================================

-- ── B3: increment_conversation RPC ─────────────────────────────────────────
-- Atomically bumps last_at and message_count in one round-trip.
create or replace function public.increment_conversation(conv_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.conversations
     set last_at = now(),
         message_count = coalesce(message_count, 0) + 1
   where id = conv_id;
$$;
grant execute on function public.increment_conversation(uuid) to service_role;

-- ── B1: rate_limits + rate_limit_hit ───────────────────────────────────────
-- One row per (key, window_start). Atomic upsert + read in a single call.
create table if not exists public.rate_limits (
  key            text        not null,
  window_start   timestamptz not null,
  count          integer     not null default 0,
  primary key (key, window_start)
);

create index if not exists rate_limits_window_idx
  on public.rate_limits (window_start);

-- Atomic check-and-increment. Returns used count and retry_after.
create or replace function public.rate_limit_hit(
  p_key text,
  p_window_seconds int,
  p_max int
) returns table (used int, retry_after_seconds int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_window_start timestamptz := date_trunc('second', v_now)
                                 - (extract(epoch from v_now)::bigint % p_window_seconds) * interval '1 second';
  v_count int;
begin
  -- Garbage-collect rows older than 2 windows (best-effort, fast)
  delete from public.rate_limits
   where window_start < v_now - (p_window_seconds * 2 || ' seconds')::interval;

  -- Atomic upsert + return new count
  insert into public.rate_limits (key, window_start, count)
       values (p_key, v_window_start, 1)
  on conflict (key, window_start)
       do update set count = public.rate_limits.count + 1
       returning count into v_count;

  return query select v_count,
    case when v_count > p_max
      then p_window_seconds - extract(epoch from (v_now - v_window_start))::int
      else 0
    end;
end;
$$;
grant execute on function public.rate_limit_hit(text, int, int) to service_role;

-- ── M6: session_preferences (anonymous memory) ─────────────────────────────
create table if not exists public.session_preferences (
  session_id          text        primary key,
  travel_style        text,
  budget_tier         text,
  trip_pace           text,
  travels_with        text[]      default '{}',
  interests           text[]      default '{}',
  preferred_airlines  text[]      default '{}',
  past_destinations   text[]      default '{}',
  notes               jsonb       default '{}'::jsonb,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);
-- No RLS exposure: only service-role writes (server-only routes).
revoke all on public.session_preferences from anon, authenticated;

-- ── M14: token usage columns on messages ───────────────────────────────────
do $$
begin
  if not exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'messages' and column_name = 'latency_ms'
  ) then
    alter table public.messages
      add column if not exists latency_ms int,
      add column if not exists provider   text;
  end if;
end$$;

-- ── M15: ai_traces table ───────────────────────────────────────────────────
create table if not exists public.ai_traces (
  id              uuid          primary key default gen_random_uuid(),
  conversation_id uuid          references public.conversations(id) on delete set null,
  user_id         uuid,
  session_id      text,
  mode            text,
  pre_filter      text[],
  duration_ms     int,
  model           text,
  tokens_in       int,
  tokens_out      int,
  status          text          default 'ok',
  error_kind      text,
  error_message   text,
  created_at      timestamptz   default now()
);
create index if not exists ai_traces_created_idx on public.ai_traces (created_at desc);
create index if not exists ai_traces_conversation_idx on public.ai_traces (conversation_id);
revoke all on public.ai_traces from anon, authenticated;
