import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // Always use production domain
  const base = "https://gotripza.com";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/api/admin/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
