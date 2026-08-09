import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor config for the Notho native apps.
 *
 * WHY server.url INSTEAD OF A BUNDLED BUILD
 * Notho has 21 Next.js API routes and uses server components, so it cannot be
 * statically exported with `output: "export"`. The native shell therefore loads
 * the live production site, and the app updates whenever you deploy to Vercel -
 * no store review needed for content changes.
 *
 * The trade-off is Apple guideline 4.2 (Minimum Functionality): a shell that
 * only renders a website gets rejected. See store-launch/06-capacitor-setup.md
 * for the native capabilities that have to ship alongside this.
 */
const config: CapacitorConfig = {
  appId: "za.co.notho.app",
  appName: "Notho",

  // Not used while server.url is set, but the CLI requires a valid path.
  webDir: "public",

  server: {
    url: "https://www.notho.co.za",
    androidScheme: "https",
    iosScheme: "https",
    cleartext: false,
    // Everything else opens in the system browser rather than inside the
    // shell. Critical for OAuth: Google refuses to complete sign-in inside an
    // embedded webview and returns disallowed_useragent.
    allowNavigation: ["www.notho.co.za", "notho.co.za"],
  },

  ios: {
    contentInset: "always",
    backgroundColor: "#0a0a0a",
    // Identifies the shell in your server logs and lets you branch on native.
    appendUserAgent: "NothoApp/iOS",
    limitsNavigationsToAppBoundDomains: false,
  },

  android: {
    backgroundColor: "#0a0a0a",
    appendUserAgent: "NothoApp/Android",
    allowMixedContent: false,
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#0a0a0a",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
  },
};

export default config;
