import { describe, expect, it } from "vitest";
import {
  EXISTING_EMAIL_SIGNUP_MESSAGE,
  signupEmailAlreadyTaken,
} from "./signupEmailAlreadyTaken";

describe("signupEmailAlreadyTaken", () => {
  it("flags already-registered errors", () => {
    expect(signupEmailAlreadyTaken("User already registered", null)).toBe(true);
    expect(signupEmailAlreadyTaken("Email address is already in use", null)).toBe(true);
    expect(signupEmailAlreadyTaken("An account already exists", null)).toBe(true);
  });

  it("flags the empty-identities confirm obfuscation", () => {
    expect(signupEmailAlreadyTaken(undefined, { identities: [] })).toBe(true);
  });

  it("does not flag a real new user", () => {
    expect(signupEmailAlreadyTaken(undefined, { identities: [{ id: "1" }] })).toBe(false);
    expect(signupEmailAlreadyTaken("Invalid login credentials", { identities: [{ id: "1" }] })).toBe(false);
  });

  it("exports a user-facing message", () => {
    expect(EXISTING_EMAIL_SIGNUP_MESSAGE.toLowerCase()).toContain("already exists");
  });
});
