import Script from "next/script";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar">
      <body>
        {children}

        {/*
         * Travelpayouts Drive — marker 522867
         * strategy="beforeInteractive" → injected into the initial server-rendered HTML
         * before any hydration. Must live in the ROOT layout (not locale layout) and
         * must NOT be placed inside <head> (App Router constraint).
         */}
        <Script
          id="travelpayouts-drive"
          src="https://emrld.ltd/NTIyODY3.js?t=522867"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}
