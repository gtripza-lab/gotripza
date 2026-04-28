import { ReactNode } from 'react';
import Script from 'next/script';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* كود Travelpayouts Drive المطور */}
      <Script id="travelpayouts-drive" strategy="afterInteractive">
        {`
          (function () {
              var script = document.createElement("script");
              script.async = 1;
              script.src = 'https://emrld.ltd/NTIyODY3.js?t=522867';
              document.head.appendChild(script);
          })();
        `}
      </Script>
      
      {children}
    </>
  );
}