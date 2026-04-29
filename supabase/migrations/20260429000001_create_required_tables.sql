-- GoTripza — Required tables migration
-- Run via: npx supabase db push  OR paste into Supabase SQL Editor

-- ── Events table (analytics) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.events (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  payload     JSONB DEFAULT '{}',
  locale      TEXT,
  path        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Booking clicks (revenue tracking) ────────────────────────
CREATE TABLE IF NOT EXISTS public.booking_clicks (
  id           BIGSERIAL PRIMARY KEY,
  event_type   TEXT DEFAULT 'click',
  result_type  TEXT,
  provider     TEXT,
  origin       TEXT,
  destination  TEXT,
  price        NUMERIC,
  currency     TEXT DEFAULT 'USD',
  revenue      NUMERIC,
  affiliate_url TEXT,
  locale       TEXT,
  marker       TEXT,
  sub_marker   TEXT,
  product_type TEXT,
  click_id     TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Search history (personalization) ─────────────────────────
-- (Drop and recreate if the existing one has incompatible schema)
DO $$
BEGIN
  -- Add missing columns to search_history if it already exists with old schema
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'search_history'
  ) THEN
    -- Add 'name' column if not present (for analytics compat)
    IF NOT EXISTS (
      SELECT FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'search_history' AND column_name = 'name'
    ) THEN
      -- table exists but might have different schema – leave it alone
      NULL;
    END IF;
  ELSE
    -- Create fresh
    CREATE TABLE public.search_history (
      id          BIGSERIAL PRIMARY KEY,
      query       TEXT,
      destination TEXT,
      locale      TEXT,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- ── Row Level Security ────────────────────────────────────────
ALTER TABLE public.events         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

-- Service role full access
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'events' AND policyname = 'service_role_all_events'
  ) THEN
    CREATE POLICY "service_role_all_events"
      ON public.events FOR ALL USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'booking_clicks' AND policyname = 'service_role_all_booking_clicks'
  ) THEN
    CREATE POLICY "service_role_all_booking_clicks"
      ON public.booking_clicks FOR ALL USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'search_history' AND policyname = 'service_role_all_search_history'
  ) THEN
    CREATE POLICY "service_role_all_search_history"
      ON public.search_history FOR ALL USING (true);
  END IF;
END $$;

-- Anon write-only on search_history
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'search_history' AND policyname = 'anon_insert_search_history'
  ) THEN
    CREATE POLICY "anon_insert_search_history"
      ON public.search_history FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_events_created_at         ON public.events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_name               ON public.events(name);
CREATE INDEX IF NOT EXISTS idx_booking_clicks_created_at ON public.booking_clicks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_booking_clicks_destination ON public.booking_clicks(destination);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON public.search_history(created_at DESC);
