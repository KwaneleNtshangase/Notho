/**
 * Pure guards for the public error-report endpoint.
 */

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Declared crawlers and headless automation.
 *
 * Extra names that do not contain a word-boundary `bot`:
 *   adsbot          — AdsBot-Google-Mobile (7 Aug 2026)
 *   playstore-google — Play Store preview crawler (2 Sep 2026 wave)
 * Bare UA "Google" is also a crawler fingerprint from that wave.
 */
export const AUTOMATED_UA =
  /\b(bot|crawler|spider|crawling|slurp|googlebot|adsbot|playstore-google|bingbot|yandex|baidu|duckduckbot|facebookexternalhit|ia_archiver|(?:semrush|ahrefs|petal|dot|mj12|seznam|bytespider)(?:bot)?|headless|phantomjs|puppeteer|playwright|lighthouse|gtmetrix|pingdom|uptimerobot|curl|wget|python-requests|axios|node-fetch)\b/i;

export const SPOOFED_CHROME = /Chrome\/\d+\.0\.0\.0\b/;

const BARE_GOOGLE_UA = /^google$/i;

export function isAutomatedUserAgent(ua: string | null | undefined): boolean {
  if (!ua) return false;
  const trimmed = ua.trim();
  return AUTOMATED_UA.test(trimmed) || SPOOFED_CHROME.test(trimmed) || BARE_GOOGLE_UA.test(trimmed);
}
