-- ============================================================
-- Fix RLS policies and grants
-- Run this in the Supabase SQL Editor if anon INSERT is needed
-- ============================================================

-- 1. Schema-level access (required for PostgREST to work at all)
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- 2. Sequence usage (required for BIGSERIAL inserts)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ── events ───────────────────────────────────────────────────────────────────
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Drop any leftover policies
DROP POLICY IF EXISTS "anon_insert_events"          ON public.events;
DROP POLICY IF EXISTS "service_role_all_events"     ON public.events;
DROP POLICY IF EXISTS "allow_insert_events"         ON public.events;

-- Service role bypasses RLS automatically — no policy needed for it.
-- Allow anon / authenticated to INSERT analytics rows only.
CREATE POLICY "anon_insert_events"
  ON public.events
  AS PERMISSIVE FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Nobody (except service_role) may SELECT/UPDATE/DELETE analytics events.
REVOKE SELECT, UPDATE, DELETE ON public.events FROM anon, authenticated;
GRANT  INSERT                 ON public.events TO   anon, authenticated;

-- ── booking_clicks ────────────────────────────────────────────────────────────
ALTER TABLE public.booking_clicks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_booking_clicks"      ON public.booking_clicks;
DROP POLICY IF EXISTS "service_role_all_booking_clicks" ON public.booking_clicks;

CREATE POLICY "anon_insert_booking_clicks"
  ON public.booking_clicks
  AS PERMISSIVE FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

REVOKE SELECT, UPDATE, DELETE ON public.booking_clicks FROM anon, authenticated;
GRANT  INSERT                 ON public.booking_clicks TO   anon, authenticated;

-- ── search_history ────────────────────────────────────────────────────────────
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_search_history"      ON public.search_history;
DROP POLICY IF EXISTS "service_role_all_search_history" ON public.search_history;

-- Only authenticated users should read their own history
CREATE POLICY "users_own_search_history"
  ON public.search_history
  AS PERMISSIVE FOR ALL
  TO authenticated
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

REVOKE ALL ON public.search_history FROM anon;
GRANT SELECT, INSERT ON public.search_history TO authenticated;

-- ── users ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_own_row" ON public.users;

CREATE POLICY "users_own_row"
  ON public.users
  AS PERMISSIVE FOR ALL
  TO authenticated
  USING  (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

REVOKE ALL ON public.users FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;

-- ── saved_itineraries ─────────────────────────────────────────────────────────
ALTER TABLE public.saved_itineraries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_own_itineraries" ON public.saved_itineraries;

CREATE POLICY "users_own_itineraries"
  ON public.saved_itineraries
  AS PERMISSIVE FOR ALL
  TO authenticated
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

REVOKE ALL ON public.saved_itineraries FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_itineraries TO authenticated;
