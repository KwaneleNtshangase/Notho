import { describe, it, expect } from "vitest";
import {
  classifyClientError,
  errorFingerprint,
  isBenignClientNoise,
  summariseUserAgent,
} from "../errorNoise";

describe("classifyClientError", () => {
  it("treats aborted SW registration as noise", () => {
    const c = classifyClientError(
      "sw-registration",
      "Failed to register a ServiceWorker for scope ('https://www.notho.co.za/') with script ('https://www.notho.co.za/sw.js'): Operation has been aborted"
    );
    expect(c.classification).toBe("noise");
    expect(c.severity).toBe("P4");
    expect(isBenignClientNoise("sw-registration", c.fingerprint && "Operation has been aborted")).toBe(
      true
    );
  });

  it("treats a bare Rejected SW registration as noise", () => {
    expect(classifyClientError("sw-registration", "Rejected").classification).toBe(
      "noise"
    );
  });

  it("classifies chunk-load as transient, not a crash", () => {
    const c = classifyClientError(
      "chunk-load",
      "Failed to load chunk /_next/static/chunks/0xlqnim8ocq-p.js?dpl=dpl_AFTqd1GaiCUtbFhnJiNVS7YrKT63 from module 64893"
    );
    expect(c.classification).toBe("transient");
    expect(c.severity).toBe("P3");
  });

  it("drops generic network unhandledrejections", () => {
    expect(
      classifyClientError("unhandledrejection", "A network error occurred.").classification
    ).toBe("noise");
  });

  it("keeps a real app crash actionable", () => {
    const c = classifyClientError(
      "app-crash",
      "Cannot read properties of undefined (reading 'balanceAfter')"
    );
    expect(c.classification).toBe("actionable");
    expect(c.severity).toBe("P1");
  });
});

describe("errorFingerprint", () => {
  it("collapses deployment ids and chunk hashes so repeats group", () => {
    const a = errorFingerprint(
      "chunk-load",
      "Failed to load chunk /_next/static/chunks/aaa.js?dpl=dpl_ONE from module 1"
    );
    const b = errorFingerprint(
      "chunk-load",
      "Failed to load chunk /_next/static/chunks/bbb.js?dpl=dpl_TWO from module 99"
    );
    expect(a).toBe(b);
  });
});

describe("summariseUserAgent", () => {
  it("reads the Chrome 117 Windows report", () => {
    expect(
      summariseUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.5938.132 Safari/537.36"
      )
    ).toBe("Chrome 117.0.5938.132 on Windows");
  });
});
