import Link from "next/link";

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ink-950 text-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <p className="text-8xl font-display font-bold text-brand-primary/30 mb-4">
            404
          </p>
          <h1 className="font-display text-3xl font-bold mb-3">
            Page Not Found
          </h1>
          <p className="text-white/55 mb-8 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <Link
            href="/en"
            className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-primary/90"
          >
            ← Back to GoTripza
          </Link>
        </div>
      </body>
    </html>
  );
}
