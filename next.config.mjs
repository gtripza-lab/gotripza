/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "source.unsplash.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Scripts — our code + analytics + TP widgets
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://tp.media https://*.travelpayouts.com https://*.jetradar.com https://*.aviasales.com",
              // Styles
              "style-src 'self' 'unsafe-inline'",
              // Images from Unsplash + TP CDN
              "img-src 'self' data: blob: https: https://images.unsplash.com https://*.tp.media https://*.travelpayouts.com",
              // Frames — allow our WL + Travelpayouts widget CDN
              "frame-src 'self' https://search.gotripza.com https://*.tp.media https://*.travelpayouts.com https://*.jetradar.com https://hotellook.com https://*.hotellook.com https://www.googletagmanager.com",
              // Connections — API + analytics + TP
              "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://*.travelpayouts.com https://tp.media https://api.travelpayouts.com https://hotellook.com",
              // Fonts
              "font-src 'self' data:",
              // Form submissions
              "form-action 'self' https://search.gotripza.com https://hotellook.com",
            ].join("; "),
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
