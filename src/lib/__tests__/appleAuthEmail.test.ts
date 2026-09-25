import { describe, expect, it } from "vitest";
import {
  appleSessionMissingEmail,
  isAppleAuthUser,
  sessionHasUsableEmail,
} from "../appleAuthEmail";

describe("apple auth email", () => {
  it("treats Apple + empty email as missing", () => {
    const session = {
      user: {
        email: "",
        app_metadata: { provider: "apple" },
        identities: [{ provider: "apple", identity_data: {} }],
      },
    };
    expect(isAppleAuthUser(session.user)).toBe(true);
    expect(sessionHasUsableEmail(session)).toBe(false);
    expect(appleSessionMissingEmail(session)).toBe(true);
  });

  it("accepts Apple Hide My Email relay addresses", () => {
    const session = {
      user: {
        email: "abc123@privaterelay.appleid.com",
        app_metadata: { provider: "apple" },
      },
    };
    expect(appleSessionMissingEmail(session)).toBe(false);
  });

  it("accepts email sitting only on the Apple identity payload", () => {
    const session = {
      user: {
        email: null,
        app_metadata: { provider: "apple", providers: ["apple"] },
        identities: [
          { provider: "apple", identity_data: { email: "thandi@icloud.com" } },
        ],
      },
    };
    expect(appleSessionMissingEmail(session)).toBe(false);
  });

  it("does not reject Google or email sessions without an Apple identity", () => {
    expect(
      appleSessionMissingEmail({
        user: { email: "user@gmail.com", app_metadata: { provider: "google" } },
      }),
    ).toBe(false);
    expect(appleSessionMissingEmail(null)).toBe(false);
    expect(appleSessionMissingEmail({ user: { email: "" } })).toBe(false);
  });
});
