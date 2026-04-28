-- GoTripza: booking_clicks + conversions tables
-- Run in Supabase SQL editor or via `supabase db push`

-- ── booking_clicks ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.booking_clicks (
  id            uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id    text,
  locale        text,
  result_type   text          CHECK (result_type IN ('flight', 'hotel')),
  provider      text,
  origin        text,
  destination   text,
  price         numeric,
  currency      text          DEFAULT 'USD',
  affiliate_url text,
  clicked_at    timestamptz   DEFAULT now()
);

CREATE INDEX IF NOT EXISTS booking_clicks_clicked_at_idx ON public.booking_clicks (clicked_at DESC);
CREATE INDEX IF NOT EXISTS booking_clicks_result_type_idx ON public.booking_clicks (result_type);
CREATE INDEX IF NOT EXISTS booking_clicks_destination_idx ON public.booking_clicks (destination);

ALTER TABLE public.booking_clicks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_booking_clicks" ON public.booking_clicks;
CREATE POLICY "anon_insert_booking_clicks"
  ON public.booking_clicks FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ── conversions ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.conversions (
  id             uuid         DEFAULT gen_random_uuid() PRIMARY KEY,
  click_id       uuid         REFERENCES public.booking_clicks(id) ON DELETE SET NULL,
  provider       text,
  commission_usd numeric,
  confirmed_at   timestamptz  DEFAULT now()
);

ALTER TABLE public.conversions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_conversions" ON public.conversions;
CREATE POLICY "service_role_conversions"
  ON public.conversions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ── search_events extra index (if table exists) ───────────────────────────────
CREATE INDEX IF NOT EXISTS search_events_created_at_idx
  ON public.events (created_at DESC);
