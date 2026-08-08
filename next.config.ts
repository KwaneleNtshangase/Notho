import type { NextConfig } from "next";

// Security headers — OWASP top-10 mitigation + POPIA hardening.
// These apply to every response served by the Next.js app.
//
// CSP note: we intentionally allow `'unsafe-inline'` for scripts because the
// current codebase relies on Next.js inline bootstrapping, inline event
// handlers from some legacy widgets, and PostHog's inline init script.
// Upgrading to strict-dynamic with nonces would require a broader refactor.
// Style needs 'unsafe-inline' for the large amount of style={{...}} JSX.
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Scripts: self + PostHog + CDN. notho.co.za is the canonical domain;
      // fundiapp.co.za 301-redirects to it via vercel.json.
      "script-src 'self' 'unsafe-inline' https://us-assets.i.posthog.com https://us.i.posthog.com https://app.posthog.com https://cdn.jsdelivr.net",
      // Styles: self + inline (JSX style={{}}) + Google Fonts
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      // Images: self + data URIs (emojis, canvas exports) + OAuth avatars
      "img-src 'self' data: blob: https://*.supabase.co https://*.googleusercontent.com https://*.fbcdn.net https://platform-lookaside.fbsbx.com",
      // XHR / fetch / websocket
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://us.i.posthog.com https://us-assets.i.posthog.com https://app.posthog.com https://notho.co.za https://www.notho.co.za https://wealthwithkwanele.co.za",
      // Service worker scope
      "worker-src 'self' blob:",
      // Frames: deny embedding us; allow YouTube for lessons if needed
      "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
      "frame-ancestors 'none'",
      "form-action 'self' https://formspree.io https://notho.co.za https://www.notho.co.za https://wealthwithkwanele.co.za",
      "base-uri 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
  // Clickjacking
  { key: "X-Frame-Options", value: "DENY" },
  // MIME-sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Referrer privacy
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Force HTTPS for one year (production only — harmless on localhost)
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  // Feature access — deny powerful APIs we do not use
  {
    key: "Permissions-Policy",
    value: [
      "accelerometer=()",
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "payment=()",
      "usb=()",
      "interest-cohort=()",
    ].join(", "),
  },
  // Legacy XSS filter (ignored by modern browsers but harmless)
  { key: "X-XSS-Protection", value: "1; mode=block" },
  // Opener isolation
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  // Version skew protection.
  //
  // A deploy lands while someone has the app open. Their tab is still running
  // the old build; the next client-side navigation asks the new deployment for
  // a route chunk that build no longer serves, the fetch 404s, and the whole
  // tree unmounts into the error boundary. That is what happened on
  // /course/re5-exam-prep on 3 Aug 2026 — a crash in a page whose code never
  // ran.
  //
  // With a deployment id set, Next stamps `?dpl=` onto asset URLs and sends
  // `x-deployment-id` on navigations. When the id it holds disagrees with the
  // one the server reports, it falls back to a full page load instead of a
  // client-side navigation — so the tab quietly picks up the new build rather
  // than reaching for a chunk that is gone.
  //
  // This works on any Vercel plan: the mismatch check is Next's own, done
  // against the x-nextjs-deployment-id response header. Vercel's paid Skew
  // Protection adds a second layer we deliberately do not depend on — it keeps
  // the *old* deployment's assets reachable, so a stale tab can carry on
  // uninterrupted rather than reloading. We are happy to reload.
  //
  // What we do not get, then, is protection for a chunk requested before the
  // mismatch is noticed; that one still 404s. ErrorBoundary catches it and
  // reloads (see src/lib/chunkErrors.ts), which is the same outcome a beat
  // later.
  //
  // Only VERCEL_DEPLOYMENT_ID belongs here. A git SHA would look equivalent and
  // is a trap: if Skew Protection is ever switched on, `?dpl=` starts routing
  // to a deployment of that id, no deployment has one, and every asset 404s.
  // Undefined off-Vercel, which leaves behaviour unchanged.
  deploymentId: process.env.VERCEL_DEPLOYMENT_ID,
  // unpdf ships a serverless PDF.js build (no separate worker file) — keep it external so Vercel bundles it correctly for the import parse route.
  serverExternalPackages: ["unpdf"],
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  // Common auth URLs people type or that external links/password managers
  // generate. Auth lives on the root page, so send them there instead of a 404.
  async redirects() {
    return [
      { source: "/login", destination: "/", permanent: false },
      { source: "/signin", destination: "/", permanent: false },
      { source: "/signup", destination: "/", permanent: false },
      { source: "/register", destination: "/", permanent: false },
    ];
  },
  // PostHog + OAuth callback redirects occasionally hit old paths; allow
  // Next to follow them without logging a warning in the build output.
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
