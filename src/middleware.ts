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
