import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, locales } from "@/i18n/config";

// ── B7: CSRF allowlist ─────────────────────────────────────────────────────
// State-changing POSTs from a browser must originate from one of these hosts.
// Webhooks are excluded (they use HMAC signatures instead).
const CSRF_ALLOWED_HOSTS = new Set([
  "gotripza.com",
  "www.gotripza.com",
  "search.gotripza.com",
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

// Routes that handle external webhooks — exempt from CSRF (signature-verified)
const WEBHOOK_ROUTES = ["/api/webhook/", "/api/billing/webhook"];

function isWebhookRoute(pathname: string): boolean {
  return WEBHOOK_ROUTES.some((p) => pathname.startsWith(p));
}

function csrfReject(req: NextRequest): NextResponse | null {
  // Only enforce on state-changing methods
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) return null;
  // Skip non-API paths and webhooks
  if (!req.nextUrl.pathname.startsWith("/api/")) return null;
  if (isWebhookRoute(req.nextUrl.pathname)) return null;

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
    if (!allowed.has(host)) {
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

export function middleware(req: NextRequest) {
  // ── B7: CSRF check (API POSTs only) ──────────────────────────────────────
  const csrfRes = csrfReject(req);
  if (csrfRes) return csrfRes;

  const { pathname } = req.nextUrl;
  const host = req.headers.get("host") ?? "";

  // ── Subdomain routing ──────────────────────────────────────────────────────
  // search.gotripza.com → always serve the /[locale]/search page
  if (host.startsWith("search.")) {
    const locale = pickLocale(req);
    const isLocalised = locales.some(
      (l) => pathname === `/${l}/search` || pathname.startsWith(`/${l}/search`),
    );
    if (isLocalised) return NextResponse.next();

    const url = req.nextUrl.clone();
    url.pathname = `/${locale}/search`;
    return NextResponse.redirect(url);
  }

  // ── Main domain locale redirect ────────────────────────────────────────────
  const hasLocale = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (hasLocale) return NextResponse.next();

  // Skip rewrites for /api/* and /admin/* (standalone routes, no locale prefix)
  if (pathname.startsWith("/api/")) return NextResponse.next();
  if (pathname.startsWith("/admin")) return NextResponse.next();

  const locale = pickLocale(req);
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    // Run on /api/* (for CSRF) and on locale routes (for redirect)
    "/api/:path*",
    "/((?!_next|favicon.ico|.*\\..*).*)",
  ],
};
