import { describe, it, expect } from "vitest";
import {
  POSTHOG_PROXY_PATH,
  identifyProperties,
  isDeskPath,
  pageviewPath,
} from "../posthogClient";

describe("posthogClient", () => {
  it("keeps the proxy path off the obvious blocker list", () => {
    expect(POSTHOG_PROXY_PATH.startsWith("/")).toBe(true);
    expect(POSTHOG_PROXY_PATH.toLowerCase()).not.toContain("posthog");
    expect(POSTHOG_PROXY_PATH.toLowerCase()).not.toContain("analytics");
    expect(POSTHOG_PROXY_PATH.toLowerCase()).not.toContain("telemetry");
  });

  it("drops desk, api and empty paths from pageviews", () => {
    expect(pageviewPath("/learn")).toBe("/learn");
    expect(pageviewPath("/budget?tab=import")).toBe("/budget");
    expect(pageviewPath("/admin")).toBeNull();
    expect(pageviewPath("/admin/analytics")).toBeNull();
    expect(pageviewPath("/api/errors/report")).toBeNull();
    expect(pageviewPath(null)).toBeNull();
  });

  it("treats /admin and nested desk routes as operator surfaces", () => {
    expect(isDeskPath("/admin")).toBe(true);
    expect(isDeskPath("/admin/bugs")).toBe(true);
    expect(isDeskPath("/learn")).toBe(false);
  });

  it("identifies by user id only and strips emails from username", () => {
    expect(
      identifyProperties({
        userId: "abc",
        username: "kwanele",
        platform: "web",
      })
    ).toEqual({ username: "kwanele", platform: "web" });
    expect(
      identifyProperties({
        userId: "abc",
        username: "hello@notho.co.za",
      })
    ).toEqual({});
  });
});
