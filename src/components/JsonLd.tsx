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
      name: `${f.airline} ${f.origin}â${f.destination}`,
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

/** Rich Snippet: Flight offers with price, airline, departure/arrival */
export function FlightRichSnippet({
  flights,
  currency,
}: {
  flights: FlightOffer[];
  currency: string;
}) {
  if (!flights.length) return null;

  const items = flights.slice(0, 5).map((f, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Flight",
      name: `${f.airline} ${f.origin} â ${f.destination}`,
      departureAirport: {
        "@type": "Airport",
        iataCode: f.origin,
      },
      arrivalAirport: {
        "@type": "Airport",
        iataCode: f.destination,
      },
      departureTime: f.departure_at,
      ...(f.return_at ? { returnTime: f.return_at } : {}),
      provider: {
        "@type": "Airline",
        name: f.airline,
        iataCode: f.airline,
      },
      offers: {
        "@type": "Offer",
        price: f.price,
        priceCurrency: currency,
        url: f.link,
        availability: "https://schema.org/InStock",
      },
    },
  }));

  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Flights ${flights[0]?.origin ?? ""} â ${flights[0]?.destination ?? ""}`,
    itemListElement: items,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Rich Snippet: Hotel offers with star ratings and prices */
export function HotelRichSnippet({
  hotels,
  currency,
  destination,
}: {
  hotels: HotelOffer[];
  currency: string;
  destination: string;
}) {
  if (!hotels.length) return null;

  const items = hotels.slice(0, 5).map((h, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "LodgingBusiness",
      name: h.hotelName,
      address: {
        "@type": "PostalAddress",
        addressLocality: h.location.name,
        addressCountry: h.location.country,
      },
      ...(h.stars
        ? {
            starRating: {
              "@type": "Rating",
              ratingValue: h.stars,
              bestRating: 5,
            },
          }
        : {}),
      priceRange: `${currency === "SAR" ? "SAR" : "$"}${h.priceFrom}+`,
      url: h.link,
      offers: {
        "@type": "Offer",
        price: h.priceFrom,
        priceCurrency: currency,
        url: h.link,
        availability: "https://schema.org/InStock",
      },
    },
  }));

  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Hotels in ${destination}`,
    itemListElement: items,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Rich Snippet: Trip landing page BreadcrumbList */
export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Rich Snippet for a specific trip destination page */
export function TripDestinationJsonLd({
  destination,
  description,
  imageUrl,
  minFlightPrice,
  minHotelPrice,
  currency,
  pageUrl,
}: {
  destination: string;
  description: string;
  imageUrl?: string;
  minFlightPrice?: number;
  minHotelPrice?: number;
  currency: string;
  pageUrl: string;
}) {
  const offers = [];
  if (minFlightPrice) {
    offers.push({
      "@type": "Offer",
      name: `Flights to ${destination}`,
      price: minFlightPrice,
      priceCurrency: currency,
      url: pageUrl,
      category: "Flight",
    });
  }
  if (minHotelPrice) {
    offers.push({
      "@type": "Offer",
      name: `Hotels in ${destination}`,
      price: minHotelPrice,
      priceCurrency: currency,
      url: pageUrl,
      category: "Lodging",
    });
  }

  const data = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: destination,
    description,
    url: pageUrl,
    ...(imageUrl
      ? {
          image: {
            "@type": "ImageObject",
            url: imageUrl,
          },
        }
      : {}),
    ...(offers.length
      ? {
          offers: {
            "@type": "AggregateOffer",
            lowPrice: Math.min(...offers.map((o) => Number(o.price))),
            priceCurrency: currency,
            offers,
          },
        }
      : {}),
    touristType: [
      { "@type": "Audience", audienceType: "leisure traveler" },
      { "@type": "Audience", audienceType: "business traveler" },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
