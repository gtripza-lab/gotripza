import { BASE_URL, SITEMAP_SECTIONS } from "@/lib/sitemap-builder";

export const dynamic = "force-static";
export const revalidate = 86400;

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function GET() {
  const lastmod = new Date().toISOString();
  const items = SITEMAP_SECTIONS.map(
    (section) => `  <sitemap>
    <loc>${escapeXml(`${BASE_URL}/sitemaps/${section}.xml`)}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`,
  ).join("\n");

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</sitemapindex>
`, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}
