import Script from 'next/script';

export const metadata = {
  title: 'Gotripza',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          id="travelpayouts-drive"
          src="https://emrld.ltd/NTIyODY3.js?t=522867"
          strategy="beforeInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}