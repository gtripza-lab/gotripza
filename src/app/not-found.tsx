import Link from "next/link";

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#0a0a14",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          padding: "1.5rem",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <p style={{ fontSize: "5rem", fontWeight: 800, color: "rgba(90,108,255,0.25)", margin: 0 }}>
            404
          </p>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, margin: "0.5rem 0 0.75rem" }}>
            Page Not Found
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: "2rem", lineHeight: 1.6 }}>
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <Link
            href="/en"
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
            ← Back to GoTripza
          </Link>
        </div>
      </body>
    </html>
  );
}
