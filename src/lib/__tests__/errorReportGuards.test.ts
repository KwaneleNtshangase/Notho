import { describe, it, expect } from "vitest";
import { escapeHtml, isAutomatedUserAgent } from "../errorReportGuards";

describe("escapeHtml", () => {
  it("neutralises a script tag", () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe(
      "&lt;script&gt;alert(1)&lt;/script&gt;"
    );
  });

  it("neutralises an event-handler injection breaking out of an attribute", () => {
    expect(escapeHtml('" onmouseover="alert(1)')).toBe(
      "&quot; onmouseover=&quot;alert(1)"
    );
    expect(escapeHtml("' onload='alert(1)")).toBe("&#39; onload=&#39;alert(1)");
  });

  it("escapes the ampersand first so entities are not double-escaped", () => {
    expect(escapeHtml("<")).toBe("&lt;");
    expect(escapeHtml("&lt;")).toBe("&amp;lt;");
    expect(escapeHtml("a & b < c")).toBe("a &amp; b &lt; c");
  });

  it("leaves ordinary error text untouched", () => {
    const msg = "Cannot read properties of undefined (reading 'balanceAfter')";
    expect(escapeHtml(msg)).toBe(
      "Cannot read properties of undefined (reading &#39;balanceAfter&#39;)"
    );
    expect(escapeHtml("TypeError: Failed to fetch")).toBe("TypeError: Failed to fetch");
  });

  it("handles empty input", () => {
    expect(escapeHtml("")).toBe("");
  });

  it("leaves no raw angle bracket or quote behind, whatever the input", () => {
    const nasty = `<img src=x onerror="fetch('//evil')">&<>'"`;
    const out = escapeHtml(nasty);
    expect(out).not.toMatch(/[<>]/);
    expect(out).not.toMatch(/["']/);
  });
});

describe("isAutomatedUserAgent", () => {
  it.each([
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Mozilla/5.0 (compatible; bingbot/2.0)",
    "curl/8.4.0",
    "python-requests/2.31.0",
    "Mozilla/5.0 HeadlessChrome/120.0.0.0",
    "UptimeRobot/2.0",
    "Mozilla/5.0 AhrefsBot/7.0",
    "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.7871.186 Mobile Safari/537.36 (compatible; AdsBot-Google-Mobile; +http://www.google.com/mobile/adsbot.html)",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.7922.173 Safari/537.36 PlayStore-Google",
    "Google",
  ])("flags %s", (ua) => {
    expect(isAutomatedUserAgent(ua)).toBe(true);
  });

  it.each([
    "Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)",
    "Mozilla/5.0 (compatible; SemrushBot/7~bl)",
    "Mozilla/5.0 (compatible; PetalBot;+https://aspiegel.com/petalbot)",
    "Mozilla/5.0 (compatible; DotBot/1.2)",
    "Mozilla/5.0 (compatible; MJ12bot/v1.4.8)",
    "Mozilla/5.0 (compatible; SeznamBot/4.0)",
    "Mozilla/5.0 (compatible; Bytespider)",
  ])("flags the <Vendor>Bot form: %s", (ua) => {
    expect(isAutomatedUserAgent(ua)).toBe(true);
  });

  it("flags a Chrome build that collapses to zeros", () => {
    expect(
      isAutomatedUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0 Safari/537.36"
      )
    ).toBe(true);
  });

  it("does not flag a real browser", () => {
    expect(
      isAutomatedUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.129 Safari/537.36"
      )
    ).toBe(false);
    expect(
      isAutomatedUserAgent(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1"
      )
    ).toBe(false);
  });

  it("does not flag words that merely contain a bot name", () => {
    expect(isAutomatedUserAgent("Mozilla/5.0 RobotVacuumBrowser/1.0")).toBe(false);
    expect(isAutomatedUserAgent("Mozilla/5.0 SpiderMonkeyApp/2.1")).toBe(false);
  });

  it("handles missing input", () => {
    expect(isAutomatedUserAgent(null)).toBe(false);
    expect(isAutomatedUserAgent(undefined)).toBe(false);
    expect(isAutomatedUserAgent("")).toBe(false);
  });
});
