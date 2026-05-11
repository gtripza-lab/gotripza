-- Persist Rya's compact conversation state so returning users and anonymous
-- sessions do not lose known trip facts when the browser refreshes.

alter table public.conversations
  add column if not exists context jsonb default '{}'::jsonb,
  add column if not exists last_intent jsonb default '{}'::jsonb;

create index if not exists conversations_context_gin_idx
  on public.conversations using gin (context);
