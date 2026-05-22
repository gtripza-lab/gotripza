/**
 * Root layout — must exist for Next.js App Router but should be a thin
 * passthrough when a child layout (e.g. [locale]/layout.tsx) owns the
 * <html> and <body> elements.  Returning children directly avoids the
 * nested-html-body hydration mismatch that `beforeInteractive` scripts
 * used to cause here.
 *
 * NOTE: Do NOT set `metadata.other['agd-partner-manual-verification']` here —
 * Next.js Metadata API emits `content=""` (empty string), which Agoda's
 * verification bot interprets as malformed. The bare meta tag is injected
 * directly in app/route.ts (root) and [locale]/layout.tsx (locale pages).
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children as React.ReactElement;
}
