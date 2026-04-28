import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans, Cairo } from "next/font/google";
import { notFound } from "next/navigation";
import Script from "next/script";
import "../globals.css";
import { isLocale, localeMeta, locales, type Locale } from "@/i18n/config";
import { OrganizationJsonLd, WebsiteJsonLd } from "@/components/JsonLd";

// GA4 Measurement ID (public — safe to hardcode)
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-SYD1GBC1LZ";

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

const BASE = "https://gotripza.com";
// Google Search Console verification (public token — safe to hardcode)
const GSC_VERIFY = process.env.NEXT_PUBLIC_GSC_VERIFICATION
  ?? "pfI1Dg7jVz9s_y0IHGvW78r-IDgc3MDh0RT6rqoYJDQ";

export const metadata: Metadata = {
  title: {
    default: "GoTripza — رفيقك الذكي للسفر | AI Travel Companion",
    template: "%s | GoTripza",
  },
  description:
    "احجز أرخص تذاكر الطيران وأفضل فنادق مكة، دبي، لندن، وباريس. عروض طيران ناس وطيران أديل وسواها. حجز فنادق بأفضل الأسعار من السعودية. GoTripza — AI-powered travel booking from Saudi Arabia.",
  keywords: [
    // Arabic SEO keywords
    "أرخص طيران",
    "أرخص طيران بتمارا",
    "حجز فنادق مكة",
    "عروض طيران ناس",
    "رحلات طيران رخيصة من السعودية",
    "حجز طيران من الرياض",
    "حجز طيران من جدة",
    "فنادق دبي رخيصة",
    "تذاكر طيران مكة",
    "عروض سفر السعودية",
    "أسعار تذاكر الطيران",
    "طيران أديل",
    "طيران ناس",
    "السعودية للطيران",
    "فلاي ناس",
    "حجز فندق بالتقسيط",
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
  metadataBase: new URL(BASE),
  ...(GSC_VERIFY && {
    verification: { google: GSC_VERIFY },
  }),
  openGraph: {
    type: "website",
    siteName: "GoTripza",
    title: "GoTripza — أرخص طيران وفنادق | AI Travel Companion",
    description:
      "احجز أرخص تذاكر الطيران وأفضل الفنادق. عروض طيران ناس وأديل من السعودية. Book cheap flights & hotels with AI.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GoTripza — أرخص طيران وفنادق | AI Travel Companion",
    description:
      "أرخص طيران وفنادق من السعودية. Cheap flights & hotels powered by AI.",
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
    canonical: BASE,
    languages: {
      "ar-SA": `${BASE}/ar`,
      "en-US": `${BASE}/en`,
      "x-default": `${BASE}/ar`,
    },
  },
  category: "travel",
  creator: "GoTripza",
  publisher: "GoTripza",
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a14" },
    { media: "(prefers-color-scheme: light)", color: "#5a6cff" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
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

        {/* Google Analytics GA4 */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', {
                  page_path: window.location.pathname,
                  cookie_flags: 'SameSite=None;Secure',
                });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
