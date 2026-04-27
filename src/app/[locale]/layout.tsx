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
  title: {
    default: "GoTripza â Ø±ÙÙÙÙ Ø§ÙØ°ÙÙ ÙÙØ³ÙØ± | AI Travel Companion",
    template: "%s | GoTripza",
  },
  description:
    "Ø§Ø­Ø¬Ø² Ø£Ø±Ø®Øµ ØªØ°Ø§ÙØ± Ø§ÙØ·ÙØ±Ø§Ù ÙØ£ÙØ¶Ù ÙÙØ§Ø¯Ù ÙÙØ©Ø Ø¯Ø¨ÙØ ÙÙØ¯ÙØ ÙØ¨Ø§Ø±ÙØ³. Ø¹Ø±ÙØ¶ Ø·ÙØ±Ø§Ù ÙØ§Ø³ ÙØ·ÙØ±Ø§Ù Ø£Ø¯ÙÙ ÙØ³ÙØ§ÙØ§. Ø­Ø¬Ø² ÙÙØ§Ø¯Ù Ø¨Ø£ÙØ¶Ù Ø§ÙØ£Ø³Ø¹Ø§Ø± ÙÙ Ø§ÙØ³Ø¹ÙØ¯ÙØ©. GoTripza â AI-powered travel booking from Saudi Arabia.",
  keywords: [
    // Arabic SEO keywords
    "Ø£Ø±Ø®Øµ Ø·ÙØ±Ø§Ù",
    "Ø£Ø±Ø®Øµ Ø·ÙØ±Ø§Ù Ø¨ØªÙØ§Ø±Ø§",
    "Ø­Ø¬Ø² ÙÙØ§Ø¯Ù ÙÙØ©",
    "Ø¹Ø±ÙØ¶ Ø·ÙØ±Ø§Ù ÙØ§Ö³",
    "Ø±Ø­ÙØ§Øª Ø·ÙØ±Ø§Ù Ø±Ø®ÙØµØ© ÙÙ Ø§ÙØ³Ø¹ÙØ¯ÙØ©",
    "Ø­Ø¬Ø² Ø·ÙØ±Ø§Ù ÙÙ Ø§ÙØ±ÙØ§Ø¶",
    "Ø­Ø¬Ø² Ø·ÙØ±Ø§Ù ÙÙ Ø¬Ø¯Ø©",
    "ÙÙØ§Ø¯Ù Ø¯Ø¨Ù Ø±Ø®ÙØµØ©",
    "ØªØ°Ø§ÙØ± Ø·ÙØ±Ø§Ù ÙÙØ©",
    "Ø¹Ø±ÙØ¶ Ø³ÙØ± Ø§ÙØ³Ø¹ÙØ¯ÙØ©",
    "Ø£Ø³Ø¹Ø§Ø± ØªØ°Ø§ÙØ± Ø§ÙØ·ÙØ±Ø§Ù",
    "Ø·ÙØ±Ø§Ù Ø£Ø¯ÙÙ",
    "Ø·ÙØ±Ø§Ù ÙØ§Ø³",
    "Ø§ÙØ³Ø¹ÙØ¯ÙØ© ÙÙØ·ÙØ±Ø§Ù",
    "ÙÙØ§Ù ÙØ§Ø³",
    "Ø­Ø¬Ø² ÙÙØ¯Ù Ø¨Ø§ÙØªÙØ³ÙØ·",
    // English SEO keywords
    "cheap flights from Saudi Arabia",
    "book flights Saudi Arabia",
    "Riyadh to London flights",
    "Dubai hotels deals",
    "AI travel booking",
    "GoTripza",
    "travel Saudi Arabia",
    "Mecca hotels",
    "flight deals KSA",
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    type: "website",
    siteName: "GoTripza",
    title: "GoTripza â Ø£Ø±Ø®Øµ Ø·ÙØ±Ø§Ù ÙÙÙØ§Ø¯Ù | AI Travel Companion",
    description:
      "Ø§Ø­Ø¬Ø² Ø£Ø±Ø®Øµ ØªØ°Ø§ÙØ± Ø§ÙØ·ÙØ±Ø§Ù ÙØ£ÙØ¶Ù Ø§ÙÙÙØ§Ø¯Ù. Ø¹Ø±ÙØ¶ Ø·ÙØ±Ø§Ù ÙØ§Ö³ ÙØ£Ø¯ÙÙ ÙÙ Ø§ÙØ³Ø¹ÙØ¯ÙØ©. Book cheap flights & hotels with AI.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GoTripza â Ø£Ø±Ø®Øµ Ø·ÙØ±Ø§Ù ÙÙÙØ§Ø¯Ù | AI Travel Companion",
    description:
      "Ø£Ø±Ø®Øµ Ø·ÙØ±Ø§Ù ÙÙÙØ§Ø¯Ù ÙÙ Ø§ÙØ³Ø¹ÙØ¯ÙØ©. Cheap flights & hotels powered by AI.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com",
    languages: {
      "ar-SA": `${process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com"}/ar`,
      "en-US": `${process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com"}/en`,
    },
  },
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
