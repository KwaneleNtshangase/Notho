/**
 * Pure guards for the public error-report endpoint.
 *
 * Extracted from src/app/api/errors/report/route.ts so they can be tested
 * without standing up a request. Nothing here touches the network, the database
 * or the environment — which is the point: these are the parts that must be
 * right, and they are cheap to prove.
 *
 * The endpoint is deliberately unauthenticated (errors happen on logged-out
 * screens), so every value it receives is attacker-controlled and ends up in an
 * email the founder opens.
 */

/**
 * Escape the five characters that change meaning in HTML.
 *
 * `message`, `url` and `userAgent` arrive from an unauthenticated POST and are
 * interpolated into the alert email's markup. Without this, a crafted report
 * puts arbitrary HTML — or a script tag — into an inbox.
 *
 * Ampersand must be replaced first. Escaping it after `<` would rewrite the
 * `&` in an already-produced `&lt;`, yielding `&amp;lt;` and displaying the
 * literal text instead of the character.
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
 * Bots are not users, and reporting their errors is worse than useless: it
 * fills the inbox with failures nobody experienced, which is how real reports
 * get missed. The client filters these too, but that check ships in JS a bot
 * can ignore and the endpoint is public, so it is repeated server-side.
 *
 * Note the optional `bot` suffix on the vendor names. Writing this list as
 * plain `\b(...|ahrefs|semrush|...)\b` silently missed `AhrefsBot` and
 * `SemrushBot` — two of the most common commercial crawlers there are — because
 * in "AhrefsBot" the `s` is followed by `B`, both word characters, so `\b`
 * never matches. `\bbot\b` fails on the same boundary. `mj12bot`, `dotbot` and
 * `petalbot` happened to be listed with their suffixes and so worked, which is
 * why the gap went unnoticed. Caught by errorReportGuards.test.ts.
 */
export const AUTOMATED_UA =
  /\b(bot|crawler|spider|crawling|slurp|googlebot|bingbot|yandex|baidu|duckduckbot|facebookexternalhit|ia_archiver|(?:semrush|ahrefs|petal|dot|mj12|seznam|bytespider)(?:bot)?|headless|phantomjs|puppeteer|playwright|lighthouse|gtmetrix|pingdom|uptimerobot|curl|wget|python-requests|axios|node-fetch)\b/i;

/**
 * A Chrome build number of exactly N.0.0.0.
 *
 * Real Chrome ships a specific build like 109.0.5414.87. A version that
 * collapses to zeros is a simplified or spoofed string, which is what scraping
 * stacks send by default.
 */
export const SPOOFED_CHROME = /Chrome\/\d+\.0\.0\.0\b/;

/** True when the reported user agent looks like automation rather than a person. */
export function isAutomatedUserAgent(ua: string | null | undefined): boolean {
  if (!ua) return false;
  return AUTOMATED_UA.test(ua) || SPOOFED_CHROME.test(ua);
}
