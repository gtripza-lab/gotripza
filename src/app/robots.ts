import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/admin", "/ar/admin", "/en/admin"],
      },
      {
        userAgent: ["GPTBot", "ChatGPT-User", "OAI-SearchBot", "PerplexityBot", "ClaudeBot"],
        allow: ["/", "/llms.txt", "/sitemap.xml"],
        disallow: ["/api/", "/admin", "/ar/admin", "/en/admin"],
      },
    ],
    sitemap: "https://gotripza.com/sitemap.xml",
    host: "https://gotripza.com",
  };
}
