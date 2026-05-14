import "server-only";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { createSupabaseService } from "@/lib/supabase/service";

export type RateLimitMode = "fail-open" | "fail-closed";
export type RateLimitStoreName = "upstash" | "supabase" | "memory" | "none";

export type RateLimitOptions = {
  limit: number;
  windowSec?: number;
  burstLimit?: number;
  burstWindowSec?: number;
  failOpen?: boolean;
  route?: string;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
  store: RateLimitStoreName;
  state: "allowed" | "limited" | "storage_error";
  blockedReason?: "rate_limit" | "burst_limit" | "suspicious_ip" | "limiter_unavailable";
};

type StoreHitOptions = Required<Pick<RateLimitOptions, "limit" | "windowSec" | "burstLimit" | "burstWindowSec">> & {
  key: string;
  ipHash: string;
};

type StoreHitResult = {
  allowed: boolean;
  used: number;
  retryAfter: number;
  blockedReason?: RateLimitResult["blockedReason"];
  suspiciousScore?: number;
};

type RateLimitStore = {
  name: RateLimitStoreName;
  hit(opts: StoreHitOptions): Promise<StoreHitResult>;
};

const DEFAULT_WINDOW_SEC = 60;
const DEFAULT_BURST_WINDOW_SEC = 10;
const MEMORY_ONLY_DEV = process.env.NODE_ENV !== "production";
const memoryBuckets = new Map<string, { count: number; resetAt: number }>();
const suspiciousMemory = new Map<string, { count: number; resetAt: number }>();

function nowSeconds() {
  return Math.floor(Date.now() / 1000);
}

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function maskIp(ip: string) {
  if (!ip || ip === "unknown") return "unknown";
  if (ip.includes(":")) return `${ip.split(":").slice(0, 3).join(":")}:*`;
  const parts = ip.split(".");
  return parts.length === 4 ? `${parts[0]}.${parts[1]}.${parts[2]}.*` : ip;
}

function getRequesterIp(req: NextRequest) {
  return (
    ((req as unknown as { ip?: string }).ip ?? "") ||
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

function getSessionHint(req: NextRequest) {
  return (
    req.cookies.get("gtz_sid")?.value ??
    req.cookies.get("admin_session")?.value?.slice(0, 16) ??
    req.cookies.get("sb-access-token")?.value?.slice(0, 16) ??
    "anon"
  );
}

export function rateLimitKey(req: NextRequest, bucket: string): string {
  const ip = getRequesterIp(req);
  return `${bucket}:${hash(`${ip}:${getSessionHint(req)}`).slice(0, 40)}`;
}

function logRateLimit(
  req: NextRequest,
  bucket: string,
  result: RateLimitResult,
  mode: RateLimitMode,
  error?: unknown,
) {
  const payload = {
    level: result.allowed ? "info" : "warn",
    event: "rate_limit",
    route: req.nextUrl?.pathname ?? bucket,
    bucket,
    ip: maskIp(getRequesterIp(req)),
    store: result.store,
    state: result.state,
    mode,
    allowed: result.allowed,
    blocked_reason: result.blockedReason ?? null,
    retry_after: result.retryAfter,
    timestamp: new Date().toISOString(),
    error: error instanceof Error ? error.message : undefined,
  };
  const line = JSON.stringify(payload);
  if (result.allowed) console.log(line);
  else console.warn(line);
}

function fixedWindowHit(key: string, limit: number, windowSec: number) {
  const now = nowSeconds();
  const windowStart = now - (now % windowSec);
  const mapKey = `${key}:${windowStart}`;
  const resetAt = windowStart + windowSec;
  const current = memoryBuckets.get(mapKey);
  const count = (current?.resetAt ?? 0) > now ? current!.count + 1 : 1;
  memoryBuckets.set(mapKey, { count, resetAt });

  for (const [oldKey, value] of memoryBuckets) {
    if (value.resetAt < now) memoryBuckets.delete(oldKey);
  }

  return {
    used: count,
    retryAfter: count > limit ? Math.max(1, resetAt - now) : 0,
  };
}

const memoryStore: RateLimitStore = {
  name: "memory",
  async hit(opts) {
    const primary = fixedWindowHit(opts.key, opts.limit, opts.windowSec);
    const burst = fixedWindowHit(`${opts.key}:burst`, opts.burstLimit, opts.burstWindowSec);
    const suspiciousKey = opts.ipHash;
    const now = nowSeconds();
    const suspicious = suspiciousMemory.get(suspiciousKey);
    const suspiciousCount =
      (suspicious?.resetAt ?? 0) > now ? suspicious!.count : 0;

    const blockedReason =
      suspiciousCount >= 25
        ? "suspicious_ip"
        : burst.used > opts.burstLimit
          ? "burst_limit"
          : primary.used > opts.limit
            ? "rate_limit"
            : undefined;

    if (blockedReason) {
      suspiciousMemory.set(suspiciousKey, {
        count: suspiciousCount + 1,
        resetAt: now + 900,
      });
    }

    return {
      allowed: !blockedReason,
      used: Math.max(primary.used, burst.used),
      retryAfter: Math.max(primary.retryAfter, burst.retryAfter),
      blockedReason,
      suspiciousScore: suspiciousCount,
    };
  },
};

function upstashConfigured() {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  );
}

const upstashStore: RateLimitStore = {
  name: "upstash",
  async hit(opts) {
    const url = process.env.UPSTASH_REDIS_REST_URL!.replace(/\/$/, "");
    const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
    const now = nowSeconds();
    const primaryKey = `rl:${opts.key}:${now - (now % opts.windowSec)}`;
    const burstKey = `rl:${opts.key}:b:${now - (now % opts.burstWindowSec)}`;
    const suspiciousKey = `rl:suspicious:${opts.ipHash}`;

    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", primaryKey],
        ["EXPIRE", primaryKey, opts.windowSec * 2],
        ["INCR", burstKey],
        ["EXPIRE", burstKey, opts.burstWindowSec * 2],
        ["GET", suspiciousKey],
      ]),
      signal: AbortSignal.timeout(1800),
    });
    if (!res.ok) throw new Error(`Upstash HTTP ${res.status}`);
    const data = (await res.json()) as Array<{ result?: unknown; error?: string }>;
    const used = Number(data[0]?.result ?? 0);
    const burstUsed = Number(data[2]?.result ?? 0);
    const suspiciousScore = Number(data[4]?.result ?? 0);

    const blockedReason =
      suspiciousScore >= 25
        ? "suspicious_ip"
        : burstUsed > opts.burstLimit
          ? "burst_limit"
          : used > opts.limit
            ? "rate_limit"
            : undefined;

    if (blockedReason) {
      await fetch(`${url}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", suspiciousKey],
          ["EXPIRE", suspiciousKey, 900],
        ]),
        signal: AbortSignal.timeout(1000),
      }).catch(() => undefined);
    }

    return {
      allowed: !blockedReason,
      used: Math.max(used, burstUsed),
      retryAfter: blockedReason === "burst_limit" ? opts.burstWindowSec : opts.windowSec,
      blockedReason,
      suspiciousScore,
    };
  },
};

const supabaseStore: RateLimitStore = {
  name: "supabase",
  async hit(opts) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = createSupabaseService() as any;
    const { data, error } = await sb.rpc("rate_limit_hit_v2", {
      p_key: opts.key,
      p_ip_hash: opts.ipHash,
      p_window_seconds: opts.windowSec,
      p_max: opts.limit,
      p_burst_window_seconds: opts.burstWindowSec,
      p_burst_max: opts.burstLimit,
    });

    if (!error && data) {
      const row = Array.isArray(data) ? data[0] : data;
      return {
        allowed: Boolean(row?.allowed),
        used: Number(row?.used ?? 0),
        retryAfter: Number(row?.retry_after_seconds ?? 0),
        blockedReason: row?.blocked_reason ?? undefined,
        suspiciousScore: Number(row?.suspicious_score ?? 0),
      };
    }

    // Backward-compatible fallback while the production migration is rolling out.
    const fallback = await sb.rpc("rate_limit_hit", {
      p_key: opts.key,
      p_window_seconds: opts.windowSec,
      p_max: opts.limit,
    });
    if (fallback.error || !fallback.data) {
      throw new Error(error?.message ?? fallback.error?.message ?? "Supabase limiter unavailable");
    }
    const row = Array.isArray(fallback.data) ? fallback.data[0] : fallback.data;
    const used = Number(row?.used ?? 0);
    const blockedReason = used > opts.limit ? "rate_limit" : undefined;
    return {
      allowed: !blockedReason,
      used,
      retryAfter: Number(row?.retry_after_seconds ?? opts.windowSec),
      blockedReason,
    };
  },
};

function storesForRuntime(): RateLimitStore[] {
  const stores: RateLimitStore[] = [];
  const remoteDisabled = process.env.RATE_LIMIT_DISABLE_REMOTE === "1";
  const memoryDisabled = process.env.RATE_LIMIT_DISABLE_MEMORY === "1";
  if (!remoteDisabled) {
    if (upstashConfigured()) stores.push(upstashStore);
    stores.push(supabaseStore);
  }
  if (MEMORY_ONLY_DEV && !memoryDisabled) stores.push(memoryStore);
  return stores;
}

export async function rateLimit(
  req: NextRequest,
  bucket: string,
  opts: RateLimitOptions,
): Promise<RateLimitResult> {
  const windowSec = opts.windowSec ?? DEFAULT_WINDOW_SEC;
  const burstWindowSec = opts.burstWindowSec ?? DEFAULT_BURST_WINDOW_SEC;
  const burstLimit = opts.burstLimit ?? Math.max(2, Math.ceil(opts.limit / 3));
  const failOpen = opts.failOpen ?? true;
  const mode: RateLimitMode = failOpen ? "fail-open" : "fail-closed";
  const key = rateLimitKey(req, bucket);
  const ipHash = hash(getRequesterIp(req));

  let lastError: unknown;
  for (const store of storesForRuntime()) {
    try {
      const hit = await store.hit({
        key,
        ipHash,
        limit: opts.limit,
        windowSec,
        burstLimit,
        burstWindowSec,
      });
      const result: RateLimitResult = {
        allowed: hit.allowed,
        remaining: Math.max(0, opts.limit - hit.used),
        retryAfter: hit.retryAfter,
        store: store.name,
        state: hit.allowed ? "allowed" : "limited",
        blockedReason: hit.blockedReason,
      };
      if (!result.allowed) logRateLimit(req, bucket, result, mode);
      return result;
    } catch (err) {
      lastError = err;
      console.warn(JSON.stringify({
        level: "warn",
        event: "rate_limit_store_error",
        route: req.nextUrl?.pathname ?? opts.route ?? bucket,
        bucket,
        ip: maskIp(getRequesterIp(req)),
        store: store.name,
        mode,
        timestamp: new Date().toISOString(),
        error: err instanceof Error ? err.message : String(err),
      }));
    }
  }

  const result: RateLimitResult = {
    allowed: failOpen,
    remaining: failOpen ? Math.max(0, opts.limit - 1) : 0,
    retryAfter: failOpen ? 0 : windowSec,
    store: "none",
    state: "storage_error",
    blockedReason: failOpen ? undefined : "limiter_unavailable",
  };
  logRateLimit(req, bucket, result, mode, lastError);
  return result;
}

export function rateLimitResponse(result: RateLimitResult) {
  const status = result.blockedReason === "limiter_unavailable" ? 503 : 429;
  return NextResponse.json(
    {
      error: result.blockedReason === "limiter_unavailable"
        ? "rate_limiter_unavailable"
        : "rate_limited",
    },
    {
      status,
      headers: {
        "Retry-After": String(result.retryAfter || 60),
        "Cache-Control": "no-store",
      },
    },
  );
}
