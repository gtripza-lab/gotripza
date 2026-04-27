-- ============================================================
-- GoTripza — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. Users ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT UNIQUE,
  display_name  TEXT,
  locale        TEXT NOT NULL DEFAULT 'ar' CHECK (locale IN ('ar', 'en')),
  currency      TEXT NOT NULL DEFAULT 'SAR' CHECK (currency IN ('SAR', 'USD', 'AED', 'KWD')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. Search History ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.search_history (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES public.users(id) ON DELETE CASCADE,
  session_id      TEXT,                          -- anonymous session identifier
  query           TEXT NOT NULL,                 -- raw user query
  locale          TEXT NOT NULL DEFAULT 'ar',
  origin          TEXT,                          -- IATA code
  destination     TEXT NOT NULL,                 -- IATA code
  departure_date  DATE,
  return_date     DATE,
  adults          INT NOT NULL DEFAULT 2,
  trip_type       TEXT,
  budget_usd      INT,
  wants           TEXT[] DEFAULT ARRAY['flights','hotels'],
  source          TEXT DEFAULT 'chat' CHECK (source IN ('chat', 'whitelabel', 'trip_page')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 3. Saved Itineraries ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.saved_itineraries (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  locale          TEXT NOT NULL DEFAULT 'ar',
  origin          TEXT,
  destination     TEXT NOT NULL,
  departure_date  DATE,
  return_date     DATE,
  adults          INT NOT NULL DEFAULT 2,
  currency        TEXT NOT NULL DEFAULT 'SAR',
  -- Snapshot of best flight found
  flight_airline        TEXT,
  flight_number         TEXT,
  flight_price          NUMERIC(10,2),
  flight_departure_at   TIMESTAMPTZ,
  flight_link           TEXT,
  -- Snapshot of best hotel found
  hotel_name        TEXT,
  hotel_stars       INT,
  hotel_price_from  NUMERIC(10,2),
  hotel_link        TEXT,
  -- AI description at time of saving
  ai_description    TEXT,
  -- Notes
  notes             TEXT,
  is_favorite       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 4. Affiliate Click Tracking ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES public.users(id) ON DELETE SET NULL,
  session_id    TEXT,
  click_type    TEXT NOT NULL CHECK (click_type IN ('flight', 'hotel')),
  source        TEXT NOT NULL DEFAULT 'chat' CHECK (source IN ('chat', 'whitelabel', 'trip_page')),
  subid         TEXT,                            -- e.g. "ai_chat", "trip_page"
  destination   TEXT,
  marker        TEXT NOT NULL DEFAULT '522867',
  url           TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_search_history_user_id    ON public.search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_destination ON public.search_history(destination);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at  ON public.search_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_itineraries_user_id  ON public.saved_itineraries(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_created_at ON public.affiliate_clicks(created_at DESC);

-- ── Auto-update updated_at ────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER saved_itineraries_updated_at
  BEFORE UPDATE ON public.saved_itineraries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Row-Level Security (RLS) ──────────────────────────────────
ALTER TABLE public.users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_itineraries  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_clicks   ENABLE ROW LEVEL SECURITY;

-- Users: can only read/update their own row
CREATE POLICY users_self ON public.users
  USING (auth.uid() = id);

-- Search history: service role has full access; users see only their own
CREATE POLICY search_history_own ON public.search_history
  USING (user_id = auth.uid() OR user_id IS NULL);

-- Saved itineraries: users see only their own
CREATE POLICY saved_itineraries_own ON public.saved_itineraries
  USING (user_id = auth.uid());

-- Affiliate clicks: insert-only for everyone; service role reads all
CREATE POLICY affiliate_clicks_insert ON public.affiliate_clicks
  FOR INSERT WITH CHECK (true);
