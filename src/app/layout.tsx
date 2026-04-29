import Script from "next/script";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar">
      <head>
        <Script id="travelpayouts-drive" strategy="afterInteractive">
          {`
            (function () {
              var script = document.createElement("script");
              script.async = 1;
              script.src = "https://emrld.ltd/NTIyODY3.js?t=522867";
              document.head.appendChild(script);
            })();
          `}
        </Script>
      </head>

      <body>
        {children}
      </body>
    </html>
  );
}