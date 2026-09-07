import { describe, expect, it } from "vitest";
import { parseNativeAuthCallback } from "../nativeAuthCallback";

describe("parseNativeAuthCallback", () => {
  it("parses an implicit-flow session from the URL fragment", () => {
    expect(
      parseNativeAuthCallback(
        "za.co.notho.app://auth/callback#access_token=access-value&refresh_token=refresh-value"
      )
    ).toMatchObject({
      accessToken: "access-value",
      refreshToken: "refresh-value",
      code: null,
      errorDescription: null,
    });
  });

  it("parses a PKCE authorization code from the query string", () => {
    expect(
      parseNativeAuthCallback("za.co.notho.app://auth/callback?code=code-value")
    ).toMatchObject({
      code: "code-value",
      accessToken: null,
      refreshToken: null,
      errorDescription: null,
    });
  });

  it("parses provider errors from either callback section", () => {
    expect(
      parseNativeAuthCallback(
        "za.co.notho.app://auth/callback#error=access_denied&error_description=Cancelled"
      ).errorDescription
    ).toBe("Cancelled");
  });
});
