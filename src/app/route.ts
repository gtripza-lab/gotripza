import { NextResponse, type NextRequest } from "next/server";

const AGODA_VERIFICATION_META = '<meta name="agd-partner-manual-verification" />';

function preferredLocale(req: NextRequest) {
  const acceptLanguage = req.headers.get("accept-language")?.toLowerCase() ?? "";
  return acceptLanguage.startsWith("ar") ? "ar" : "en";
}

export function GET(req: NextRequest) {
  const locale = preferredLocale(req);
  const target = `/${locale}`;

  return new NextResponse(
    `<!doctype html>
<html lang="${locale}" dir="${locale === "ar" ? "rtl" : "ltr"}">
  <head>
    <meta charset="utf-8" />
    ${AGODA_VERIFICATION_META}
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, follow" />
    <link rel="canonical" href="https://gotripza.com${target}" />
    <meta http-equiv="refresh" content="0; url=${target}" />
    <script>location.replace(${JSON.stringify(target)});</script>
    <title>Rya by GoTripza</title>
  </head>
  <body>
    <a href="${target}">Continue to Rya by GoTripza</a>
  </body>
</html>`,
    {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=0, must-revalidate",
      },
    },
  );
}
