import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans, Cairo } from "next/font/google";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Script from "next/script";
import "../globals.css";
import { isLocale, localeMeta, locales, type Locale } from "@/i18n/config";
import { OrganizationJsonLd, WebsiteJsonLd } from "@/components/JsonLd";
import { BottomNav } from "@/components/BottomNav";
import { TravelpayoutsProvider } from "@/components/TravelpayoutsProvider";
import { CookieConsent } from "@/components/CookieConsent";
import { AnalyticsInit } from "@/components/AnalyticsInit";
import { GA_MEASUREMENT_ID, GOOGLE_ADS_ID } from "@/lib/analytics/google";
import { X_PIXEL_ID } from "@/lib/analytics/x";

const GOOGLE_TAG_ID = GA_MEASUREMENT_ID || GOOGLE_ADS_ID;

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

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const isAr = params.locale === "ar";

  const title = isAr
    ? "Rya by GoTripza — رفيقة السفر الذكية"
    : "Rya by GoTripza — AI Travel Companion";

  const description = isAr
    ? "ريا رفيقة سفر ذكية تساعدك قبل الرحلة وأثناءها: تخطيط، ميزانية، ترجمة، مطارات، أمان، وخدمات سفر في الوقت المناسب."
    : "Rya is your AI travel companion before and during the trip: planning, budget, translation, airports, safety, and useful travel services at the right moment.";

  const keywords: string[] = isAr
    ? [
        "أرخص طيران",
        "أرخص طيران بتمارا",
        "دليل سكن مكة",
        "عروض طيران ناس",
        "رحلات طيران رخيصة من السعودية",
        "حجز طيران من الرياض",
        "حجز طيران من جدة",
        "مناطق السكن في دبي",
        "تذاكر طيران مكة",
        "عروض سفر السعودية",
        "أسعار تذاكر الطيران",
        "طيران أديل",
        "طيران ناس",
        "السعودية للطيران",
        "فلاي ناس",
        "دليل اختيار الفندق",
        "GoTripza",
        "Rya by GoTripza",
        "ريا رفيقة السفر",
      ]
    : [
        "cheap flights",
        "book flights online",
        "hotel area guide",
        "AI travel companion",
        "smart travel planning",
        "AI trip planner",
        "flight search",
        "compare flights",
        "Dubai stay guide",
        "Mecca stay guide",
        "Riyadh to London flights",
        "cheap flights from Saudi Arabia",
        "travel booking",
        "GoTripza",
        "Rya by GoTripza",
        "Rya travel companion",
        "free travel planner",
        "best flight prices",
        "flight deals",
      ];

  const ogTitle = isAr
    ? "Rya by GoTripza — رفيقة السفر الذكية"
    : "Rya by GoTripza — AI Travel Companion";

  const ogDescription = isAr
    ? "سافر بذكاء مع ريا: تخطيط، ترجمة، مطارات، أمان، وخدمات سفر وقت الحاجة."
    : "Travel smarter with Rya: planning, translation, airports, safety, and trip services when useful.";

  return {
    title: {
      default: title,
      template: "%s | Rya by GoTripza",
    },
    description,
    keywords,
    metadataBase: new URL(BASE),
    ...(GSC_VERIFY && {
      verification: { google: GSC_VERIFY },
    }),
    openGraph: {
      type: "website",
      siteName: "Rya by GoTripza",
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
      title: "Rya",
    },
    formatDetection: {
      telephone: false,
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#060A13" },
    { media: "(prefers-color-scheme: light)", color: "#3B82F6" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout(
  props: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
  }
) {
  const params = await props.params;

  const {
    children
  } = props;

  const { locale } = params;
  if (!isLocale(locale)) notFound();
  const dir = localeMeta[locale as Locale].dir;
  const nonce = (await headers()).get("x-nonce") ?? undefined;

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
          nonce={nonce}
        />

        {GOOGLE_TAG_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_TAG_ID}`}
              strategy="afterInteractive"
              nonce={nonce}
            />
            <Script id="google-analytics-init" strategy="afterInteractive" nonce={nonce}>
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = window.gtag || gtag;
                gtag('js', new Date());
                ${GA_MEASUREMENT_ID ? `gtag('config', '${GA_MEASUREMENT_ID}', {
                  send_page_view: false,
                  cookie_flags: 'SameSite=None;Secure'
                });` : ""}
                ${GOOGLE_ADS_ID ? `gtag('config', '${GOOGLE_ADS_ID}', {
                  cookie_flags: 'SameSite=None;Secure'
                });` : ""}
              `}
            </Script>
            {GA_MEASUREMENT_ID && <AnalyticsInit gaId={GA_MEASUREMENT_ID} />}
          </>
         )}
        {X_PIXEL_ID && (
          <Script id="x-ads-pixel" strategy="afterInteractive" nonce={nonce}>
            {`
              !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
              },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
              a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
              twq('config','${X_PIXEL_ID}');
            `}
          </Script>
        )}
      </body>
    </html>
  );
}
