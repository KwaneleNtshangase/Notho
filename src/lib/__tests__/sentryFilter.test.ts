import { describe, it, expect } from "vitest";
import { sentryBeforeSend } from "../sentryFilter";

describe("sentryBeforeSend", () => {
  it("drops aborted service-worker registration", () => {
    const kept = sentryBeforeSend(
      {
        exception: {
          values: [
            {
              value:
                "Failed to register a ServiceWorker for scope ('https://www.notho.co.za/') with script ('https://www.notho.co.za/sw.js'): Operation has been aborted",
            },
          ],
        },
      },
      {}
    );
    expect(kept).toBeNull();
  });

  it("drops crawler user agents", () => {
    const kept = sentryBeforeSend(
      {
        message: "Cannot read properties of undefined (reading 'balanceAfter')",
        request: { headers: { "User-Agent": "Googlebot/2.1" } },
      },
      {}
    );
    expect(kept).toBeNull();
  });

  it("keeps a real crash and stamps severity", () => {
    const kept = sentryBeforeSend(
      {
        exception: {
          values: [
            {
              value: "Cannot read properties of undefined (reading 'balanceAfter')",
            },
          ],
        },
      },
      {}
    );
    expect(kept).not.toBeNull();
    expect(kept?.tags?.["notho.classification"]).toBe("actionable");
    expect(kept?.tags?.["notho.severity"]).toBe("P1");
    expect(kept?.fingerprint?.[0]).toContain("window.error:");
  });

  it("keeps chunk-load as transient instead of dropping it", () => {
    const kept = sentryBeforeSend(
      {
        message:
          "Failed to load chunk /_next/static/chunks/0xlqnim8ocq-p.js?dpl=dpl_AFTqd1GaiCUtbFhnJiNVS7YrKT63 from module 64893",
      },
      {}
    );
    expect(kept?.tags?.["notho.classification"]).toBe("transient");
    expect(kept?.tags?.["notho.area"]).toBe("chunk-load");
  });
});
