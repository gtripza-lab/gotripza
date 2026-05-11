-- Track who clicked affiliate services so Rya Companion can apply the
-- booked-through-GoTripza discount without creating a separate system.

alter table public.booking_clicks
  add column if not exists user_id uuid references auth.users(id) on delete set null;

alter table public.booking_clicks
  add column if not exists session_id text;

create index if not exists booking_clicks_user_id_created_idx
  on public.booking_clicks(user_id, created_at desc)
  where user_id is not null;

create index if not exists booking_clicks_session_id_created_idx
  on public.booking_clicks(session_id, created_at desc)
  where session_id is not null;
