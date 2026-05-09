export const metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-[#08080d] px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-semibold tracking-tight">Analytics &amp; SEO</h1>
        <p className="text-white/40 text-sm mt-1">Traffic, search performance, and measurement configuration</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Google Analytics 4 */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-white/60">
              Google Analytics 4
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
              Client-side
            </span>
          </div>

          <p className="text-white/50 text-sm leading-relaxed">
            GA4 tracking is injected via the{" "}
            <code className="text-white/70 bg-white/[0.06] px-1.5 py-0.5 rounded text-xs">
              GoogleAnalytics
            </code>{" "}
            component in your root layout. To enable tracking, set the following environment variable:
          </p>

          <div className="rounded-lg bg-black/40 border border-white/[0.06] px-4 py-3 font-mono text-xs text-amber-300">
            NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-white/40">Current ID:</span>
            <span className="text-white/70 font-medium">(configured via env)</span>
          </div>

          <a
            href="https://analytics.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Open Google Analytics
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        {/* Search Console */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-white/60">
              Google Search Console
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
              SEO
            </span>
          </div>

          <p className="text-white/50 text-sm leading-relaxed">
            Monitor your site&apos;s search performance, indexing status, and Core Web Vitals directly in Google Search Console.
          </p>

          <div className="rounded-lg bg-black/40 border border-white/[0.06] px-4 py-3 space-y-2">
            <p className="text-white/60 text-xs font-medium uppercase tracking-wider">Site Verification Steps</p>
            <ol className="space-y-1.5 text-sm text-white/50 list-decimal list-inside">
              <li>Open Search Console and add your property URL</li>
              <li>
                Choose{" "}
                <span className="text-white/70 font-medium">HTML tag</span> verification method
              </li>
              <li>
                Add the meta tag to{" "}
                <code className="text-white/70 bg-white/[0.06] px-1 rounded text-xs">
                  app/layout.tsx
                </code>{" "}
                metadata
              </li>
              <li>Click Verify in Search Console</li>
            </ol>
          </div>

          <a
            href="https://search.google.com/search-console"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Open Search Console
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      {/* Note */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] px-5 py-4">
        <p className="text-amber-400/80 text-sm">
          <span className="font-semibold text-amber-400">Note:</span> GA4 data is collected client-side. This dashboard shows affiliate/AI data from Supabase.
        </p>
      </div>
    </div>
  );
}
