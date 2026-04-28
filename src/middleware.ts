import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, locales } from "@/i18n/config";

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
  const { pathname } = req.nextUrl;
  const host = req.headers.get("host") ?? "";

  // ── Subdomain routing ──────────────────────────────────────────────────────
  // search.gotripza.com → always serve the /[locale]/search page
  if (host.startsWith("search.")) {
    const locale = pickLocale(req);
    // If already on a localised search path, let it through
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

  const locale = pickLocale(req);
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next|api|favicon.ico|.*\\..*).*)",
  ],
};
