/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { webpackBuildWorker: false },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "source.unsplash.com" },
      { protocol: "https", hostname: "photo.hotellook.com" },
      { protocol: "https", hostname: "*.hotellook.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(self), geolocation=(self)",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://tp.media https://*.travelpayouts.com https://*.jetradar.com https://*.aviasales.com https://emrld.ltd",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https: https://images.unsplash.com https://*.tp.media https://*.travelpayouts.com https://photo.hotellook.com https://*.hotellook.com https://emrld.ltd https://*.emrld.ltd",
              "frame-src 'self' https://search.gotripza.com https://*.tp.media https://*.travelpayouts.com https://*.jetradar.com https://hotellook.com https://*.hotellook.com https://www.googletagmanager.com",
              "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://*.travelpayouts.com https://tp.media https://api.travelpayouts.com https://hotellook.com https://engine.hotellook.com https://*.supabase.co https://emrld.ltd https://*.emrld.ltd",
              "font-src 'self' data:",
              "form-action 'self' https://search.gotripza.com https://hotellook.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
