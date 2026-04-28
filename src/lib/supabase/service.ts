import "server-only";
import { createClient } from "@supabase/supabase-js";

let _client: ReturnType<typeof createClient> | null = null;

/** Singleton service-role client — server-only, never exposed to the browser. */
export function createSupabaseService() {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("[supabase/service] SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  _client = createClient(url, key, { auth: { persistSession: false } });
  return _client;
}
