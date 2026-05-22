import type { Metadata } from "next";

/**
 * Root layout — must exist for Next.js App Router but should be a thin
 * passthrough when a child layout (e.g. [locale]/layout.tsx) owns the
 * <html> and <body> elements.  Returning children directly avoids the
 * nested-html-body hydration mismatch that `beforeInteractive` scripts
 * used to cause here.
 */

export const metadata: Metadata = {
  other: {
    "agd-partner-manual-verification": "",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children as React.ReactElement;
}
