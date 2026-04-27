import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const PROJECT_REF = "ejtkmljxjqlgsyauzruo";
const ADMIN_SECRET = "gotripza-migrate-2026";

// Full schema SQL split into individual statements
const SCHEMA_STATEMENTS = [
  `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,

  `CREATE TABLE IF NOT EXISTS public.users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email         TEXT UNIQUE,
    display_name  TEXT,
    locale        TEXT NOT NULL DEFAULT 'ar' CHECK (locale IN ('ar', 'en')),
    currency      TEXT NOT NULL DEFAULT 'SAR' CHECK (currency IN ('SAR', 'USD', 'AED', 'KWD')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS public.search_history (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES public.users(id) ON DELETE CASCADE,
    session_id      TEXT,
    query           TEXT NOT NULL,
    locale          TEXT NOT NULL DEFAULT 'ar',
    origin          TEXT,
    destination     TEXT NOT NULL,
    departure_date  DATE,
    return_date     DATE,
    adults          INT NOT NULL DEFAULT 2,
    trip_type       TEXT,
    budget_usd      INT,
    wants           TEXT[] DEFAULT ARRAY['flights','hotels'],
    source          TEXT DEFAULT 'chat' CHECK (source IN ('chat', 'whitelabel', 'trip_page')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS public.saved_itineraries (
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
    flight_airline        TEXT,
    flight_number         TEXT,
    flight_price          NUMERIC(10,2),
    flight_departure_at   TIMESTAMPTZ,
    flight_link           TEXT,
    hotel_name        TEXT,
    hotel_stars       INT,
    hotel_price_from  NUMERIC(10,2),
    hotel_link        TEXT,
    ai_description    TEXT,
    notes             TEXT,
    is_favorite       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID REFERENCES public.users(id) ON DELETE SET NULL,
    session_id    TEXT,
    click_type    TEXT NOT NULL CHECK (click_type IN ('flight', 'hotel')),
    source        TEXT NOT NULL DEFAULT 'chat' CHECK (source IN ('chat', 'whitelabel', 'trip_page')),
    subid         TEXT,
    destination   TEXT,
    marker        TEXT NOT NULL DEFAULT '522867',
    url           TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  `CREATE INDEX IF NOT EXISTS idx_search_history_user_id    ON public.search_history(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_search_history_destination ON public.search_history(destination)`,
  `CREATE INDEX IF NOT EXISTS idx_search_history_created_at  ON public.search_history(created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_saved_itineraries_user_id  ON public.saved_itineraries(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_created_at ON public.affiliate_clicks(created_at DESC)`,

  `CREATE OR REPLACE FUNCTION update_updated_at_column()
   RETURNS TRIGGER AS $$
   BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
   $$ LANGUAGE plpgsql`,

  `DROP TRIGGER IF EXISTS users_updated_at ON public.users`,
  `CREATE TRIGGER users_updated_at
     BEFORE UPDATE ON public.users
     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,

  `DROP TRIGGER IF EXISTS saved_itineraries_updated_at ON public.saved_itineraries`,
  `CREATE TRIGGER saved_itineraries_updated_at
     BEFORE UPDATE ON public.saved_itineraries
     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,

  `ALTER TABLE public.users             ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.search_history    ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.saved_itineraries ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.affiliate_clicks  ENABLE ROW LEVEL SECURITY`,

  `DO $$ BEGIN
     IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='users' AND policyname='users_self') THEN
       CREATE POLICY users_self ON public.users USING (auth.uid() = id);
     END IF;
   END $$`,

  `DO $$ BEGIN
     IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='search_history' AND policyname='search_history_own') THEN
       CREATE POLICY search_history_own ON public.search_history
         USING (user_id = auth.uid() OR user_id IS NULL);
     END IF;
   END $$`,

  `DO $$ BEGIN
     IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='saved_itineraries' AND policyname='saved_itineraries_own') THEN
       CREATE POLICY saved_itineraries_own ON public.saved_itineraries USING (user_id = auth.uid());
     END IF;
   END $$`,

  `DO $$ BEGIN
     IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='affiliate_clicks' AND policyname='affiliate_clicks_insert') THEN
       CREATE POLICY affiliate_clicks_insert ON public.affiliate_clicks FOR INSERT WITH CHECK (true);
     END IF;
   END $$`,
];

export async function POST(req: NextRequest) {
  // Validate admin secret
  const secret = req.headers.get("x-admin-secret");
  if (secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Get Supabase PAT from header or env
  const pat = req.headers.get("x-supabase-pat") || process.env.SUPABASE_PAT;
  if (!pat) {
    return NextResponse.json(
      { error: "Missing x-supabase-pat header (your Supabase personal access token)" },
      { status: 400 }
    );
  }

  const results: Array<{ sql: string; ok: boolean; error?: string }> = [];

  for (const sql of SCHEMA_STATEMENTS) {
    try {
      const res = await fetch(
        `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${pat}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: sql }),
        }
      );

      const text = await res.text();
      let data: unknown;
      try { data = JSON.parse(text); } catch { data = text; }

      if (!res.ok) {
        results.push({ sql: sql.slice(0, 60), ok: false, error: String(data) });
      } else {
        results.push({ sql: sql.slice(0, 60), ok: true });
      }
    } catch (e) {
      results.push({ sql: sql.slice(0, 60), ok: false, error: (e as Error).message });
    }
  }

  const allOk = results.every(r => r.ok);
  return NextResponse.json(
    { success: allOk, results, message: allOk ? "✅ Schema applied successfully!" : "⚠️ Some statements failed" },
    { status: allOk ? 200 : 207 }
  );
}

// GET: quick check to confirm endpoint is live
export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret") || new URL(req.url).searchParams.get("secret");
  if (secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    status: "ready",
    project: PROJECT_REF,
    statements: SCHEMA_STATEMENTS.length,
    instructions: "POST to this URL with headers: x-admin-secret + x-supabase-pat"
  });
}
