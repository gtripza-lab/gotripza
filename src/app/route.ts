import { NextResponse } from "next/server";

const AGODA_VERIFICATION_META = '<meta name="agd-partner-manual-verification" />';

export function GET() {
  return new NextResponse(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    ${AGODA_VERIFICATION_META}
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="canonical" href="https://gotripza.com/ar" />
    <title>Rya by GoTripza</title>
  </head>
  <body>
    <main style="min-height:100vh;display:grid;place-items:center;background:#060A13;color:white;font-family:Arial,sans-serif;text-align:center">
      <div>
        <h1 style="margin:0 0 12px;font-size:32px">Rya by GoTripza</h1>
        <p style="margin:0 0 24px;color:#b8c0d8">Your smart travel companion.</p>
        <a href="/ar" style="display:inline-block;margin:6px;padding:12px 18px;border-radius:999px;background:#3B82F6;color:white;text-decoration:none">العربية</a>
        <a href="/en" style="display:inline-block;margin:6px;padding:12px 18px;border-radius:999px;background:#111827;color:white;text-decoration:none">English</a>
      </div>
    </main>
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
