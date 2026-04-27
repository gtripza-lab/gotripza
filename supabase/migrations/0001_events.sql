-- GoTripza analytics events
-- Run once in the Supabase SQL editor (or via `supabase db push`).

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  payload jsonb not null default '{}'::jsonb,
  locale text,
  path text,
  created_at timestamptz not null default now()
);

create index if not exists events_name_created_idx
  on public.events (name, created_at desc);

alter table public.events enable row level security;

-- Allow anonymous (browser) inserts, deny everything else.
drop policy if exists "anon_insert_events" on public.events;
create policy "anon_insert_events"
  on public.events
  for insert
  to anon, authenticated
  with check (true);

-- Service role can read/write freely (default), no select policy = no public reads.
