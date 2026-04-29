import type { FlightOffer, HotelOffer } from "@/lib/travelpayouts";

const APP_URL_TOP = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";

/** FAQ schema for destination / visa / budget pages */
export function FaqJsonLd({ items }: { items: { q: string; a: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** HowTo schema for visa application pages */
export function HowToJsonLd({
  name,
  description,
  steps,
}: {
  name: string;
  description: string;
  steps: string[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    step: steps.map((text, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      text,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Comparison page schema */
export function ComparisonJsonLd({
  nameA,
  nameB,
  pageUrl,
}: {
  nameA: string;
  nameB: string;
  pageUrl: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${nameA} vs ${nameB}`,
    url: pageUrl,
    publisher: { "@type": "Organization", name: "GoTripza", url: APP_URL_TOP },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: APP_URL_TOP },
        { "@type": "ListItem", position: 2, name: "Compare", item: `${APP_URL_TOP}/compare` },
        { "@type": "ListItem", position: 3, name: `${nameA} vs ${nameB}`, item: pageUrl },
      ],
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function ArticleJsonLd({
  title,
  description,
  datePublished,
  imageUrl,
  url,
}: {
  title: string;
  description: string;
  datePublished: string;
  imageUrl?: string;
  url: string;
}) {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished,
    author: { "@type": "Organization", name: "GoTripza", url: APP_URL },
    publisher: {
      "@type": "Organization",
      name: "GoTripza",
      logo: { "@type": "ImageObject", url: `${APP_URL}/logo.svg` },
    },
    url,
    ...(imageUrl ? { image: { "@type": "ImageObject", url: imageUrl } } : {}),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

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
      name: `${f.airline} ${f.origin} → ${f.destination}`,
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
    name: `Flights ${flights[0]?.origin ?? ""} → ${flights[0]?.destination ?? ""}`,
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
