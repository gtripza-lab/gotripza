import { headers } from "next/headers";
import Link from "next/link";

function detectLocale(): "ar" | "en" {
  try {
    const h = headers();
    // Next.js sets x-url (full URL) or x-invoke-path on server
    const url =
      h.get("x-url") ??
      h.get("x-invoke-path") ??
      h.get("referer") ??
      "";
    return url.includes("/en") ? "en" : "ar";
  } catch {
    return "ar";
  }
}

export default function GlobalNotFound() {
  const locale = detectLocale();
  const isAr = locale === "ar";

  return (
    <html lang={locale} dir={isAr ? "rtl" : "ltr"}>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#0a0a14",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: isAr
            ? "'Cairo', 'Segoe UI', system-ui, sans-serif"
            : "system-ui, sans-serif",
          padding: "1.5rem",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <p
            style={{
              fontSize: "5rem",
              fontWeight: 800,
              color: "rgba(90,108,255,0.25)",
              margin: 0,
            }}
          >
            404
          </p>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              margin: "0.5rem 0 0.75rem",
            }}
          >
            {isAr ? "الصفحة غير موجودة" : "Page Not Found"}
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.5)",
              marginBottom: "2rem",
              lineHeight: 1.6,
            }}
          >
            {isAr
              ? "الصفحة التي تبحث عنها غير موجودة أو تم نقلها."
              : "The page you're looking for doesn't exist or has been moved."}
          </p>
          <Link
            href={`/${locale}`}
            style={{
              display: "inline-block",
              background: "#5a6cff",
              color: "#fff",
              padding: "0.65rem 1.5rem",
              borderRadius: "9999px",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "0.9rem",
            }}
          >
            {isAr ? "→ العودة للرئيسية" : "← Back to GoTripza"}
          </Link>
        </div>
      </body>
    </html>
  );
}
