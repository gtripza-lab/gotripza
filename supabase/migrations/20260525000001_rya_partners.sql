-- Rya Partners: creator/referral growth system.
-- Public schema tables are protected with RLS; app writes go through service-role API routes.

create extension if not exists pgcrypto;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  email text not null,
  country text not null,
  social_links jsonb not null default '[]'::jsonb,
  main_platform text not null,
  audience_size integer not null default 0 check (audience_size >= 0),
  why_join text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'suspended')),
  referral_slug text unique,
  referral_code text unique,
  commission_rate_companion numeric(5,4) not null default 0.25 check (commission_rate_companion >= 0 and commission_rate_companion <= 1),
  commission_rate_plan numeric(5,4) not null default 0.40 check (commission_rate_plan >= 0 and commission_rate_plan <= 1),
  payout_email text,
  notes text,
  fraud_score integer not null default 0 check (fraud_score >= 0),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists partners_email_lower_uidx on public.partners (lower(email));
create index if not exists partners_status_idx on public.partners (status);
create index if not exists partners_user_id_idx on public.partners (user_id);

drop trigger if exists partners_touch_updated_at on public.partners;
create trigger partners_touch_updated_at
before update on public.partners
for each row execute function public.touch_updated_at();

create table if not exists public.referral_codes (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  code text not null unique,
  slug text not null unique,
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists referral_codes_partner_id_idx on public.referral_codes (partner_id);
create index if not exists referral_codes_active_idx on public.referral_codes (active);

drop trigger if exists referral_codes_touch_updated_at on public.referral_codes;
create trigger referral_codes_touch_updated_at
before update on public.referral_codes
for each row execute function public.touch_updated_at();

create table if not exists public.partner_clicks (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  referral_code_id uuid references public.referral_codes(id) on delete set null,
  visitor_id text,
  session_id text,
  ip_hash text,
  user_agent text,
  referrer text,
  landing_path text,
  source text,
  campaign text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists partner_clicks_partner_created_idx on public.partner_clicks (partner_id, created_at desc);
create index if not exists partner_clicks_ip_created_idx on public.partner_clicks (ip_hash, created_at desc);

create table if not exists public.referral_visits (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  click_id uuid references public.partner_clicks(id) on delete set null,
  visitor_id text,
  first_path text,
  last_path text,
  expires_at timestamptz not null default (now() + interval '60 days'),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists referral_visits_partner_created_idx on public.referral_visits (partner_id, created_at desc);
create index if not exists referral_visits_visitor_idx on public.referral_visits (visitor_id);

drop trigger if exists referral_visits_touch_updated_at on public.referral_visits;
create trigger referral_visits_touch_updated_at
before update on public.referral_visits
for each row execute function public.touch_updated_at();

create table if not exists public.partner_signups (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  click_id uuid references public.partner_clicks(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  email text,
  source text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists partner_signups_partner_user_uidx
  on public.partner_signups (partner_id, user_id)
  where user_id is not null;
create index if not exists partner_signups_partner_created_idx on public.partner_signups (partner_id, created_at desc);

create table if not exists public.partner_conversions (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  click_id uuid references public.partner_clicks(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  email text,
  product_type text not null check (product_type in ('rya_companion', 'plan_my_trip', 'future_service')),
  product_name text not null,
  amount_usd numeric(10,2) not null check (amount_usd >= 0),
  commission_rate numeric(5,4) not null check (commission_rate >= 0 and commission_rate <= 1),
  commission_usd numeric(10,2) not null check (commission_usd >= 0),
  order_id text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'refunded', 'void')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists partner_conversions_order_uidx
  on public.partner_conversions (order_id)
  where order_id is not null;
create index if not exists partner_conversions_partner_created_idx on public.partner_conversions (partner_id, created_at desc);
create index if not exists partner_conversions_status_idx on public.partner_conversions (status);

drop trigger if exists partner_conversions_touch_updated_at on public.partner_conversions;
create trigger partner_conversions_touch_updated_at
before update on public.partner_conversions
for each row execute function public.touch_updated_at();

create table if not exists public.commissions (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  conversion_id uuid references public.partner_conversions(id) on delete set null,
  product_type text not null,
  amount_usd numeric(10,2) not null check (amount_usd >= 0),
  status text not null default 'pending' check (status in ('pending', 'approved', 'paid', 'rejected', 'refunded')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists commissions_partner_status_idx on public.commissions (partner_id, status);
create index if not exists commissions_created_idx on public.commissions (created_at desc);

drop trigger if exists commissions_touch_updated_at on public.commissions;
create trigger commissions_touch_updated_at
before update on public.commissions
for each row execute function public.touch_updated_at();

create table if not exists public.payouts (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  amount_usd numeric(10,2) not null check (amount_usd >= 0),
  status text not null default 'requested' check (status in ('requested', 'approved', 'paid', 'rejected')),
  payout_method text,
  payout_reference text,
  notes text,
  requested_at timestamptz not null default now(),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payouts_partner_status_idx on public.payouts (partner_id, status);

drop trigger if exists payouts_touch_updated_at on public.payouts;
create trigger payouts_touch_updated_at
before update on public.payouts
for each row execute function public.touch_updated_at();

create table if not exists public.partner_assets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  asset_type text not null check (asset_type in ('logo', 'caption', 'video_template', 'guide', 'image', 'other')),
  locale text not null default 'ar',
  url text,
  content text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists partner_assets_active_idx on public.partner_assets (active, locale);

create table if not exists public.partner_notifications (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  title text not null,
  body text not null,
  kind text not null default 'info' check (kind in ('info', 'approval', 'payout', 'milestone', 'campaign')),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists partner_notifications_partner_created_idx on public.partner_notifications (partner_id, created_at desc);

create table if not exists public.partner_content_signals (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references public.partners(id) on delete set null,
  platform text,
  hook text,
  cta text,
  content_url text,
  clicks integer not null default 0 check (clicks >= 0),
  conversions integer not null default 0 check (conversions >= 0),
  revenue_usd numeric(10,2) not null default 0 check (revenue_usd >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists partner_content_signals_performance_idx
  on public.partner_content_signals (conversions desc, clicks desc);

create table if not exists public.partner_fraud_flags (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  reason text not null,
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high')),
  metadata jsonb not null default '{}'::jsonb,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists partner_fraud_flags_partner_created_idx on public.partner_fraud_flags (partner_id, created_at desc);

alter table public.partners enable row level security;
alter table public.referral_codes enable row level security;
alter table public.partner_clicks enable row level security;
alter table public.referral_visits enable row level security;
alter table public.partner_signups enable row level security;
alter table public.partner_conversions enable row level security;
alter table public.commissions enable row level security;
alter table public.payouts enable row level security;
alter table public.partner_assets enable row level security;
alter table public.partner_notifications enable row level security;
alter table public.partner_content_signals enable row level security;
alter table public.partner_fraud_flags enable row level security;

drop policy if exists partners_select_own on public.partners;
create policy partners_select_own
on public.partners for select
to authenticated
using (auth.uid() = user_id or lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

drop policy if exists referral_codes_select_own on public.referral_codes;
create policy referral_codes_select_own
on public.referral_codes for select
to authenticated
using (
  exists (
    select 1 from public.partners p
    where p.id = referral_codes.partner_id
      and (p.user_id = auth.uid() or lower(p.email) = lower(coalesce(auth.jwt() ->> 'email', '')))
  )
);

drop policy if exists partner_metrics_select_own on public.partner_clicks;
create policy partner_metrics_select_own
on public.partner_clicks for select
to authenticated
using (
  exists (
    select 1 from public.partners p
    where p.id = partner_clicks.partner_id
      and (p.user_id = auth.uid() or lower(p.email) = lower(coalesce(auth.jwt() ->> 'email', '')))
  )
);

drop policy if exists partner_signups_select_own on public.partner_signups;
create policy partner_signups_select_own
on public.partner_signups for select
to authenticated
using (
  exists (
    select 1 from public.partners p
    where p.id = partner_signups.partner_id
      and (p.user_id = auth.uid() or lower(p.email) = lower(coalesce(auth.jwt() ->> 'email', '')))
  )
);

drop policy if exists partner_conversions_select_own on public.partner_conversions;
create policy partner_conversions_select_own
on public.partner_conversions for select
to authenticated
using (
  exists (
    select 1 from public.partners p
    where p.id = partner_conversions.partner_id
      and (p.user_id = auth.uid() or lower(p.email) = lower(coalesce(auth.jwt() ->> 'email', '')))
  )
);

drop policy if exists commissions_select_own on public.commissions;
create policy commissions_select_own
on public.commissions for select
to authenticated
using (
  exists (
    select 1 from public.partners p
    where p.id = commissions.partner_id
      and (p.user_id = auth.uid() or lower(p.email) = lower(coalesce(auth.jwt() ->> 'email', '')))
  )
);

drop policy if exists payouts_select_own on public.payouts;
create policy payouts_select_own
on public.payouts for select
to authenticated
using (
  exists (
    select 1 from public.partners p
    where p.id = payouts.partner_id
      and (p.user_id = auth.uid() or lower(p.email) = lower(coalesce(auth.jwt() ->> 'email', '')))
  )
);

drop policy if exists partner_assets_select_active on public.partner_assets;
create policy partner_assets_select_active
on public.partner_assets for select
to authenticated
using (active = true);

drop policy if exists partner_notifications_select_own on public.partner_notifications;
create policy partner_notifications_select_own
on public.partner_notifications for select
to authenticated
using (
  exists (
    select 1 from public.partners p
    where p.id = partner_notifications.partner_id
      and (p.user_id = auth.uid() or lower(p.email) = lower(coalesce(auth.jwt() ->> 'email', '')))
  )
);

drop policy if exists partner_fraud_flags_select_own on public.partner_fraud_flags;
create policy partner_fraud_flags_select_own
on public.partner_fraud_flags for select
to authenticated
using (
  exists (
    select 1 from public.partners p
    where p.id = partner_fraud_flags.partner_id
      and (p.user_id = auth.uid() or lower(p.email) = lower(coalesce(auth.jwt() ->> 'email', '')))
  )
);

-- RLS policies for tables missing them
drop policy if exists referral_visits_select_own on public.referral_visits;
create policy referral_visits_select_own
on public.referral_visits for select
to authenticated
using (
  exists (
    select 1 from public.partners p
    where p.id = referral_visits.partner_id
      and (p.user_id = auth.uid() or lower(p.email) = lower(coalesce(auth.jwt() ->> 'email', '')))
  )
);

drop policy if exists partner_content_signals_select_own on public.partner_content_signals;
create policy partner_content_signals_select_own
on public.partner_content_signals for select
to authenticated
using (
  partner_id is null
  or exists (
    select 1 from public.partners p
    where p.id = partner_content_signals.partner_id
      and (p.user_id = auth.uid() or lower(p.email) = lower(coalesce(auth.jwt() ->> 'email', '')))
  )
);

grant usage on schema public to anon, authenticated;
grant select on public.partner_assets to authenticated;
grant select on public.partners, public.referral_codes, public.partner_clicks, public.partner_signups,
  public.partner_conversions, public.commissions, public.payouts, public.partner_notifications,
  public.partner_fraud_flags, public.referral_visits, public.partner_content_signals to authenticated;

insert into public.partner_assets (title, asset_type, locale, content)
values
  ('Rya launch caption - Arabic', 'caption', 'ar', 'ريا مستشارة السفر تساعدك قبل الرحلة وأثناءها: تخطيط، مطارات، أحياء مناسبة، ميزانية، ونصائح ذكية في كل خطوة.'),
  ('Rya launch caption - English', 'caption', 'en', 'Rya is your travel advisor before and during the trip: planning, airports, neighborhoods, budget, and calm guidance when it matters.'),
  ('Partner starter guide', 'guide', 'ar', 'ابدأ بمحتوى عملي: مشكلة سفر حقيقية، كيف تساعد ريا، ثم دعوة هادئة لتجربتها عبر رابطك.')
on conflict do nothing;
