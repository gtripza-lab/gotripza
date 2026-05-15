import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, locales } from "@/i18n/config";

// ── B7: CSRF allowlist ─────────────────────────────────────────────────────
// State-changing POSTs from a browser must originate from one of these hosts.
// Webhooks are excluded (they use HMAC signatures instead).
const CSRF_ALLOWED_HOSTS = new Set([
  "gotripza.com",
  "www.gotripza.com",
  // Vercel production alias
  "gotripza-nu.vercel.app",
]);

function envCsrfHosts(): Set<string> {
  const set = new Set(CSRF_ALLOWED_HOSTS);
  // Include local dev origins
  set.add("localhost:3000");
  set.add("localhost:3001");
  set.add("127.0.0.1:3000");
  // Vercel deployment URLs (auto-injected per build)
  if (process.env.VERCEL_URL) set.add(process.env.VERCEL_URL);
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) set.add(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  if (process.env.NEXT_PUBLIC_APP_URL) {
    try {
      set.add(new URL(process.env.NEXT_PUBLIC_APP_URL).host);
    } catch {
      /* ignore */
    }
  }
  return set;
}

function isAllowedDevHost(host: string): boolean {
  if (process.env.NODE_ENV !== "development") return false;
  return /^localhost:\d+$/.test(host) || /^127\.0\.0\.1:\d+$/.test(host);
}

// Routes that handle external webhooks — exempt from CSRF (signature-verified)
const WEBHOOK_ROUTES = ["/api/webhook/", "/api/billing/webhook"];
const CSRF_EXEMPT_ROUTES = ["/api/csp-report"];

function isWebhookRoute(pathname: string): boolean {
  return WEBHOOK_ROUTES.some((p) => pathname.startsWith(p));
}

function isCsrfExemptRoute(pathname: string): boolean {
  return CSRF_EXEMPT_ROUTES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function makeNonce() {
  return crypto.randomUUID().replace(/-/g, "");
}

function makeCsp(nonce: string) {
  const isDev = process.env.NODE_ENV !== "production";
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'self'",
    `script-src 'self' 'nonce-${nonce}'${isDev ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://www.google-analytics.com https://tp.media https://*.travelpayouts.com https://*.jetradar.com https://*.aviasales.com https://emrld.ltd`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://images.unsplash.com https://*.tp.media https://*.travelpayouts.com https://photo.hotellook.com https://*.hotellook.com https://emrld.ltd https://*.emrld.ltd https://www.google-analytics.com https://www.googletagmanager.com",
    "frame-src 'self' https://search.gotripza.com https://*.tp.media https://*.travelpayouts.com https://*.jetradar.com https://hotellook.com https://*.hotellook.com https://www.aviasales.com https://www.googletagmanager.com",
    "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://*.travelpayouts.com https://tp.media https://api.travelpayouts.com https://hotellook.com https://engine.hotellook.com https://*.supabase.co https://api.openai.com https://emrld.ltd https://*.emrld.ltd",
    "font-src 'self' data:",
    "form-action 'self' https://search.gotripza.com https://hotellook.com",
    "report-uri /api/csp-report",
  ].join("; ");
}

function attachSecurityHeaders(res: NextResponse, nonce: string) {
  res.headers.set("Content-Security-Policy", makeCsp(nonce));
  res.headers.set("X-Nonce", nonce);
  return res;
}

function csrfReject(req: NextRequest): NextResponse | null {
  // Only enforce on state-changing methods
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) return null;
  // Skip non-API paths and webhooks
  if (!req.nextUrl.pathname.startsWith("/api/")) return null;
  if (isWebhookRoute(req.nextUrl.pathname)) return null;
  if (isCsrfExemptRoute(req.nextUrl.pathname)) return null;

  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const allowed = envCsrfHosts();

  // Browsers always set Origin on cross-origin POST. Reject if both missing.
  if (!origin && !referer) {
    return NextResponse.json({ error: "csrf_missing_origin" }, { status: 403 });
  }

  const candidate = origin ?? referer ?? "";
  try {
    const host = new URL(candidate).host;
    if (!allowed.has(host) && !isAllowedDevHost(host)) {
      return NextResponse.json(
        { error: "csrf_origin_rejected" },
        { status: 403 },
      );
    }
  } catch {
    return NextResponse.json(
      { error: "csrf_malformed_origin" },
      { status: 403 },
    );
  }
  return null;
}

function pickLocale(req: NextRequest): string {
  const accept = req.headers.get("accept-language") ?? "";
  const preferred = accept.split(",").map((s) => s.split(";")[0].trim().toLowerCase());
  for (const tag of preferred) {
    const base = tag.split("-")[0];
    if ((locales as readonly string[]).includes(base)) return base;
  }
  return defaultLocale;
}

function redirectToCleanLocaleHome(req: NextRequest, locale: string) {
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}`;
  url.search = "";
  return NextResponse.redirect(url, 308);
}

export function proxy(req: NextRequest) {
  const nonce = makeNonce();
  const requestHeaders = new Headers(req.headers);
  const csp = makeCsp(nonce);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  // ── B7: CSRF check (API POSTs only) ──────────────────────────────────────
  const csrfRes = csrfReject(req);
  if (csrfRes) return attachSecurityHeaders(csrfRes, nonce);

  const { pathname } = req.nextUrl;
  const locale = pickLocale(req);

  // Google picked up the old WebSite SearchAction template as a literal URL:
  // /?q={search_term_string}. Keep it out of the index by canonicalizing it.
  const q = req.nextUrl.searchParams.get("q");
  if (q === "{search_term_string}") {
    return attachSecurityHeaders(redirectToCleanLocaleHome(req, locale), nonce);
  }

  // Defensive canonicalization for malformed absolute URLs requested as paths,
  // e.g. /https://gotripza.com or Vercel-normalized /https:/gotripza.com.
  if (/^\/https?:\/+/.test(pathname)) {
    return attachSecurityHeaders(redirectToCleanLocaleHome(req, locale), nonce);
  }

  // ── Main domain locale redirect ────────────────────────────────────────────
  const hasLocale = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (hasLocale) {
    return attachSecurityHeaders(NextResponse.next({ request: { headers: requestHeaders } }), nonce);
  }

  // Skip rewrites for /api/* and /admin/* (standalone routes, no locale prefix)
  if (pathname.startsWith("/api/")) {
    return attachSecurityHeaders(NextResponse.next({ request: { headers: requestHeaders } }), nonce);
  }
  if (pathname.startsWith("/admin")) {
    return attachSecurityHeaders(NextResponse.next({ request: { headers: requestHeaders } }), nonce);
  }

  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return attachSecurityHeaders(NextResponse.redirect(url), nonce);
}

export const config = {
  matcher: [
    // Run on /api/* (for CSRF) and on locale routes (for redirect)
    "/api/:path*",
    "/((?!_next|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|txt|xml|webmanifest|woff|woff2)$).*)",
  ],
};
