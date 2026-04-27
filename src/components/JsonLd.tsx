import type { FlightOffer, HotelOffer } from "@/lib/travelpayouts";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GoTripza",
    url: APP_URL,
    logo: `${APP_URL}/logo.svg`,
    sameAs: [
      "https://www.instagram.com/gotripza",
      "https://twitter.com/gotripza",
    ],
    description:
      "AI-powered travel companion. Smart planning, seamless booking, unforgettable journeys.",
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebsiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "GoTripza",
    url: APP_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${APP_URL}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OffersJsonLd({
  flights,
  hotels,
  currency,
}: {
  flights: FlightOffer[];
  hotels: HotelOffer[];
  currency: string;
}) {
  const offers = [
    ...flights.slice(0, 5).map((f) => ({
      "@type": "Offer",
      name: `${f.airline} ${f.origin}→${f.destination}`,
      price: f.price,
      priceCurrency: currency,
      url: f.link,
      category: "Flight",
    })),
    ...hotels.slice(0, 5).map((h) => ({
      "@type": "Offer",
      name: h.hotelName,
      price: h.priceFrom,
      priceCurrency: currency,
      url: h.link,
      category: "Lodging",
    })),
  ];
  if (!offers.length) return null;
  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: offers.map((o, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: o,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
