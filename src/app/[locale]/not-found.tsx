import Link from "next/link";

export default function LocaleNotFound() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="text-8xl font-display font-bold text-brand-primary/20 mb-4 select-none">
          404
        </p>
        <h1 className="font-display text-3xl font-bold mb-3 text-white">
          Page Not Found
        </h1>
        <p className="text-white/55 mb-8 leading-relaxed text-sm">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Try searching for your trip instead.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/en/search"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-primary/90"
          >
            🔍 Search for Trips
          </Link>
          <Link
            href="/en"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white/70 transition hover:border-white/30 hover:text-white"
          >
            ← Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
