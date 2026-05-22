import type { MetadataRoute } from "next";
import { buildSitemapSection, SITEMAP_SECTIONS, type SitemapSection } from "@/lib/sitemap-builder";

export const dynamic = "force-static";
export const revalidate = 86400;

function escapeXml(value: string | number | Date) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function isSitemapSection(value: string): value is SitemapSection {
  return (SITEMAP_SECTIONS as readonly string[]).includes(value);
}

function renderEntry(entry: MetadataRoute.Sitemap[number]) {
  const lastmod = entry.lastModified ? `\n    <lastmod>${escapeXml(new Date(entry.lastModified).toISOString())}</lastmod>` : "";
  const changefreq = entry.changeFrequency ? `\n    <changefreq>${escapeXml(entry.changeFrequency)}</changefreq>` : "";
  const priority = typeof entry.priority === "number" ? `\n    <priority>${escapeXml(entry.priority.toFixed(2))}</priority>` : "";
  const alternates = entry.alternates?.languages
    ? Object.entries(entry.alternates.languages)
        .filter((alternate): alternate is [string, string] => typeof alternate[1] === "string")
        .map(
          ([lang, href]) =>
            `\n    <xhtml:link rel="alternate" hreflang="${escapeXml(lang)}" href="${escapeXml(href)}" />`,
        )
        .join("")
    : "";

  return `  <url>
    <loc>${escapeXml(entry.url)}</loc>${lastmod}${changefreq}${priority}${alternates}
  </url>`;
}

export async function GET(_request: Request, { params }: { params: Promise<{ section: string }> }) {
  const { section: rawSection } = await params;
  const section = rawSection.replace(/\.xml$/, "");

  if (!isSitemapSection(section)) {
    return new Response("Sitemap section not found", { status: 404 });
  }

  const entries = buildSitemapSection(section);
  const body = entries.map(renderEntry).join("\n");

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>
`, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}
