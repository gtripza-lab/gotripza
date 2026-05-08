import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans, Cairo } from "next/font/google";
import { notFound } from "next/navigation";
import Script from "next/script";
import "../globals.css";
import { isLocale, localeMeta, locales, type Locale } from "@/i18n/config";
import { OrganizationJsonLd, WebsiteJsonLd } from "@/components/JsonLd";
import { BottomNav } from "@/components/BottomNav";
import { TravelpayoutsProvider } from "@/components/TravelpayoutsProvider";
import { CookieConsent } from "@/components/CookieConsent";

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
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-arabic",
  display: "swap",
  preload: true,
});

const BASE = "https://gotripza.com";
const GSC_VERIFY = process.env.NEXT_PUBLIC_GSC_VERIFICATION
  ?? "pfI1Dg7jVz9s_y0IHGvW78r-IDgc3MDh0RT6rqoYJDQ";

export function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Metadata {
  const isAr = params.locale === "ar";

  const title = isAr
    ? "GoTripza — رفيقك الذكي للسفر | AI Travel Companion"
    : "GoTripza — Your AI Travel Companion | Flights & Hotels";

  const description = isAr
    ? "احجز أرخص تذاكر الطيران وأفضل فنادق مكة، دبي، لندن، وباريس. عروض طيران ناس وطيران أديل وسواها. حجز فنادق بأفضل الأسعار من السعودية."
    : "Book cheap flights and top-rated hotels in Dubai, London, Paris, and beyond. Compare 180+ airlines and thousands of hotels with GoTripza's free AI travel advisor.";

  const keywords: string[] = isAr
    ? [
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
        "GoTripza",
      ]
    : [
        "cheap flights",
        "book flights online",
        "hotel deals",
        "AI travel advisor",
        "flight search",
        "compare flights",
        "Dubai hotels",
        "Mecca hotels",
        "Riyadh to London flights",
        "cheap flights from Saudi Arabia",
        "travel booking",
        "GoTripza",
        "free travel planner",
        "best flight prices",
        "flight deals",
      ];

  const ogTitle = isAr
    ? "GoTripza — أرخص طيران وفنادق | AI Travel Companion"
    : "GoTripza — Cheap Flights & Hotels | AI Travel Companion";

  const ogDescription = isAr
    ? "احجز أرخص تذاكر الطيران وأفضل الفنادق. عروض طيران ناس وأديل من السعودية."
    : "Find cheap flights and great hotels worldwide. Powered by AI — completely free.";

  return {
    title: {
      default: title,
      template: "%s | GoTripza",
    },
    description,
    keywords,
    metadataBase: new URL(BASE),
    ...(GSC_VERIFY && {
      verification: { google: GSC_VERIFY },
    }),
    openGraph: {
      type: "website",
      siteName: "GoTripza",
      title: ogTitle,
      description: ogDescription,
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
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
    // NOTE: Do NOT set alternates.canonical here.
    // Setting a static canonical in the layout applies the HOMEPAGE canonical
    // to every child page, which tells Google all pages are duplicates of the
    // homepage → 38+ pages de-indexed. Each page sets its own canonical via
    // its own generateMetadata(). The homepage sets it through app/[locale]/page
    // metadata or the locale root redirect.
    category: "travel",
    creator: "GoTripza",
    publisher: "GoTripza",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "GoTripza",
    },
    formatDetection: {
      telephone: false,
    },
  };
}

export const viewport: Viewport = {
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
    <html lang={locale} dir={dir} className="dark" suppressHydrationWarning>
      <head>
        {/* Resource hints — speed up connections to critical external origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://api.travelpayouts.com" />
        <link rel="dns-prefetch" href="https://tp.media" />
      </head>
      <body
        className={`${sans.variable} ${display.variable} ${arabic.variable} antialiased font-sans`}
        suppressHydrationWarning
      >
        <OrganizationJsonLd />
        <WebsiteJsonLd />
        {/* Re-fires Travelpayouts tracking on every client-side navigation */}
        <TravelpayoutsProvider />
        {children}
        <BottomNav locale={locale as Locale} />
        <CookieConsent locale={locale as Locale} />

        {/* Travelpayouts Drive — affiliate tracking, loaded after hydration */}
        <Script
          id="travelpayouts-drive"
          src="https://emrld.ltd/NTIyODY3.js?t=522867"
          strategy="afterInteractive"
        />

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
