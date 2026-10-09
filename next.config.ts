import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://us-assets.i.posthog.com https://us.i.posthog.com https://app.posthog.com https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.supabase.co https://*.googleusercontent.com https://*.fbcdn.net https://platform-lookaside.fbsbx.com https://appleid.cdn-apple.com",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://us.i.posthog.com https://us-assets.i.posthog.com https://app.posthog.com https://notho.co.za https://www.notho.co.za https://wealthwithkwanele.co.za https://*.ingest.sentry.io https://*.ingest.de.sentry.io",
      "worker-src 'self' blob:",
      "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
      "frame-ancestors 'none'",
      "form-action 'self' https://formspree.io https://notho.co.za https://www.notho.co.za https://wealthwithkwanele.co.za",
      "base-uri 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
  {
    key: "Permissions-Policy",
    value: ["accelerometer=(self)", "camera=()", "microphone=()", "geolocation=()", "payment=()", "usb=()", "interest-cohort=()"].join(", "),
  },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  ...(process.env.VERCEL_DEPLOYMENT_ID && process.env.VERCEL_DEPLOYMENT_ID !== "undefined"
    ? { deploymentId: process.env.VERCEL_DEPLOYMENT_ID }
    : {}),
  serverExternalPackages: ["unpdf"],
  skipTrailingSlashRedirect: true,
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
      { source: "/(.*)", headers: securityHeaders },
    ];
  },
  async redirects() {
    return [
      { source: "/login", destination: "/", permanent: false },
      { source: "/signin", destination: "/", permanent: false },
      { source: "/signup", destination: "/", permanent: false },
      { source: "/register", destination: "/", permanent: false },
    ];
  },
  async rewrites() {
    return [
      { source: "/nk-in/static/:path*", destination: "https://us-assets.i.posthog.com/static/:path*" },
      { source: "/nk-in/array/:path*", destination: "https://us-assets.i.posthog.com/array/:path*" },
      { source: "/nk-in/:path*", destination: "https://us.i.posthog.com/:path*" },
    ];
  },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  disableLogger: true,
});
