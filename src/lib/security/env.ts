import "server-only";

const SERVER_SECRETS = [
  "OPENAI_API_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ADMIN_KEY",
  "TRAVELPAYOUTS_TOKEN",
] as const;

const PUBLIC_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_TRAVELPAYOUTS_MARKER",
] as const;

export function validateProductionEnvironment() {
  if (process.env.NODE_ENV !== "production") return;

  const missingServer = SERVER_SECRETS.filter((key) => !process.env[key]?.trim());
  const missingPublic = PUBLIC_KEYS.filter((key) => !process.env[key]?.trim());
  const hasServerSecretLeaked = Object.keys(process.env).some(
    (key) =>
      key.startsWith("NEXT_PUBLIC_") &&
      /(SECRET|SERVICE_ROLE|OPENAI|ADMIN_KEY|TOKEN|WEBHOOK)/i.test(key),
  );

  if (missingServer.length || missingPublic.length || hasServerSecretLeaked) {
    console.warn(JSON.stringify({
      level: "warn",
      event: "environment_validation",
      missing_server: missingServer,
      missing_public: missingPublic,
      public_secret_name_detected: hasServerSecretLeaked,
      timestamp: new Date().toISOString(),
    }));
  }

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn(JSON.stringify({
      level: "warn",
      event: "rate_limit_upstash_not_configured",
      message: "Production will use Supabase rate limiting unless Upstash Redis REST env vars are configured.",
      timestamp: new Date().toISOString(),
    }));
  }
}
