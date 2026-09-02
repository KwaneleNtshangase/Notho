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
 * `adsbot` is listed by name because AdsBot-Google-Mobile has no word boundary
 * before `bot` (the s is a word character), so `\\bbot\\b` misses it. That UA is
 * what filed the 7 Aug 2026 sw-registration "Rejected" report.
 */
export const AUTOMATED_UA =
  /\b(bot|crawler|spider|crawling|slurp|googlebot|adsbot|bingbot|yandex|baidu|duckduckbot|facebookexternalhit|ia_archiver|(?:semrush|ahrefs|petal|dot|mj12|seznam|bytespider)(?:bot)?|headless|phantomjs|puppeteer|playwright|lighthouse|gtmetrix|pingdom|uptimerobot|curl|wget|python-requests|axios|node-fetch)\b/i;

export const SPOOFED_CHROME = /Chrome\/\d+\.0\.0\.0\b/;

export function isAutomatedUserAgent(ua: string | null | undefined): boolean {
  if (!ua) return false;
  return AUTOMATED_UA.test(ua) || SPOOFED_CHROME.test(ua);
}
