/**
 * True when this page is running inside the Notho native shell webview (iOS
 * or Android), detected from the custom user agent Capacitor appends -
 * `ios.appendUserAgent` / `android.appendUserAgent` in capacitor.config.ts.
 *
 * This is deliberately NOT the same check as isNativePlatform() in
 * capacitorPlatform.ts. That one asks "is @capacitor/core loaded and does it
 * think we're native" (async, requires the package). This one is a plain
 * synchronous regex against navigator.userAgent - it works even on a page
 * that never imports @capacitor/core, and is what the server-side change
 * documented in store-launch/06-capacitor-setup.md calls for: hide anything
 * that makes no sense inside the app shell (the "add to home screen" prompt,
 * install banners, web-only footers).
 *
 * Returns false during SSR (no navigator) and on ordinary web/PWA - only the
 * two native shells append this user agent.
 */
export function isNativeShell(): boolean {
  if (typeof navigator === "undefined") return false;
  return /NothoApp\/(iOS|Android)/.test(navigator.userAgent);
}
