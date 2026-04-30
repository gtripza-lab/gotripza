import Script from "next/script";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar">
      <head>
        <Script
          id="travelpayouts-drive"
          src="https://emrld.ltd/NTIyODY3.js?t=522867"
          strategy="afterInteractive"
        />
      </head>

      <body>
        {children}
      </body>
    </html>
  );
}