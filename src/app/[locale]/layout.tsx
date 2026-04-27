import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Cairo } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { isLocale, localeMeta, locales, type Locale } from "@/i18n/config";
import { OrganizationJsonLd, WebsiteJsonLd } from "@/components/JsonLd";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const arabic = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GoTripza — AI Travel Companion",
  description:
    "AI-powered travel booking. Smart planning, seamless booking, unforgettable journeys.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;
  if (!isLocale(locale)) notFound();
  const dir = localeMeta[locale as Locale].dir;

  return (
    <html lang={locale} dir={dir} className="dark">
      <body
        className={`${sans.variable} ${display.variable} ${arabic.variable} antialiased font-sans`}
      >
        <OrganizationJsonLd />
        <WebsiteJsonLd />
        {children}
      </body>
    </html>
  );
}
