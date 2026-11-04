import { describe, expect, it } from "vitest";
import { readSentryDsn } from "../sentryOptions";

describe("readSentryDsn", () => {
  it("is unset when neither env var is present", () => {
    expect(readSentryDsn({})).toBeUndefined();
  });

  it("treats blank values as unset", () => {
    expect(
      readSentryDsn({
        NEXT_PUBLIC_SENTRY_DSN: "  ",
        SENTRY_DSN: "\n",
      })
    ).toBeUndefined();
  });

  it("reads the public DSN", () => {
    expect(
      readSentryDsn({
        NEXT_PUBLIC_SENTRY_DSN: " public-dsn ",
      })
    ).toBe("public-dsn");
  });

  it("falls back to the server DSN", () => {
    expect(
      readSentryDsn({
        SENTRY_DSN: "server-dsn",
      })
    ).toBe("server-dsn");
  });

  it("prefers the public DSN when both are set", () => {
    expect(
      readSentryDsn({
        NEXT_PUBLIC_SENTRY_DSN: "public-dsn",
        SENTRY_DSN: "server-dsn",
      })
    ).toBe("public-dsn");
  });
});
