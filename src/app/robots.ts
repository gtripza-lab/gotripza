import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/ar/admin", "/en/admin"],
      },
    ],
    sitemap: "https://gotripza.com/sitemap.xml",
    host: "https://gotripza.com",
  };
}
