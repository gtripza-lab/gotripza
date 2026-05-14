-- Rate limiting hardening: sliding window, burst protection, and suspicious IP tracking.
-- Server code falls back to the older rate_limit_hit() RPC while this migration rolls out.

create table if not exists public.rate_limit_events (
  key text not null,
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists rate_limit_events_key_created_idx
  on public.rate_limit_events (key, created_at desc);

create index if not exists rate_limit_events_ip_created_idx
  on public.rate_limit_events (ip_hash, created_at desc);

create table if not exists public.suspicious_rate_limit_ips (
  ip_hash text primary key,
  score integer not null default 0,
  updated_at timestamptz not null default now()
);

revoke all on public.rate_limit_events from anon, authenticated;
revoke all on public.suspicious_rate_limit_ips from anon, authenticated;

create or replace function public.rate_limit_hit_v2(
  p_key text,
  p_ip_hash text,
  p_window_seconds int,
  p_max int,
  p_burst_window_seconds int,
  p_burst_max int
) returns table (
  allowed boolean,
  used int,
  retry_after_seconds int,
  blocked_reason text,
  suspicious_score int
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_window_start timestamptz := v_now - (p_window_seconds || ' seconds')::interval;
  v_burst_start timestamptz := v_now - (p_burst_window_seconds || ' seconds')::interval;
  v_used int;
  v_burst_used int;
  v_score int;
  v_reason text;
begin
  delete from public.rate_limit_events
   where created_at < v_now - (greatest(p_window_seconds, 900) || ' seconds')::interval;

  insert into public.rate_limit_events (key, ip_hash, created_at)
  values (p_key, p_ip_hash, v_now);

  select count(*) into v_used
    from public.rate_limit_events
   where key = p_key and created_at >= v_window_start;

  select count(*) into v_burst_used
    from public.rate_limit_events
   where key = p_key and created_at >= v_burst_start;

  select coalesce(score, 0) into v_score
    from public.suspicious_rate_limit_ips
   where ip_hash = p_ip_hash;
  v_score := coalesce(v_score, 0);

  if v_score >= 25 then
    v_reason := 'suspicious_ip';
  elsif v_burst_used > p_burst_max then
    v_reason := 'burst_limit';
  elsif v_used > p_max then
    v_reason := 'rate_limit';
  end if;

  if v_reason is not null then
    insert into public.suspicious_rate_limit_ips (ip_hash, score, updated_at)
    values (p_ip_hash, 1, v_now)
    on conflict (ip_hash)
    do update set
      score = least(public.suspicious_rate_limit_ips.score + 1, 100),
      updated_at = excluded.updated_at
    returning score into v_score;
  end if;

  return query select
    v_reason is null,
    greatest(v_used, v_burst_used),
    case
      when v_reason = 'burst_limit' then p_burst_window_seconds
      when v_reason is not null then p_window_seconds
      else 0
    end,
    v_reason,
    v_score;
end;
$$;

revoke all on function public.rate_limit_hit_v2(text, text, int, int, int, int) from public, anon, authenticated;
grant execute on function public.rate_limit_hit_v2(text, text, int, int, int, int) to service_role;
