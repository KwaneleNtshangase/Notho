import { describe, it, expect, beforeAll } from "vitest";
import {
  makeUnsubscribeToken,
  verifyUnsubscribeToken,
  userRef,
  unsubscribeUrl,
} from "../unsubscribeToken";

/**
 * These tests exist because both failure modes here are silent and expensive.
 *
 * If verification is too strict, every unsubscribe link in every email dead-ends
 * and people hit "report spam" instead - which damages the sending domain for
 * every other user, and we would only find out from a deliverability drop weeks
 * later.
 *
 * If it is too loose, one person can unsubscribe another, or flip somebody
 * else's exit record. Neither throws an error anywhere.
 */

const UID = "3f8a1c22-9b41-4d7e-8a55-0c1e2b3d4f60";
const OTHER = "aa11bb22-cc33-4d44-8e55-ff6677889900";

beforeAll(() => {
  process.env.UNSUBSCRIBE_SECRET = "test-secret-value";
  process.env.EXIT_FEEDBACK_PEPPER = "test-pepper";
});

describe("unsubscribe tokens", () => {
  it("round-trips a user id", () => {
    expect(verifyUnsubscribeToken(makeUnsubscribeToken(UID))).toBe(UID);
  });

  it("rejects a token whose signature belongs to a different user", () => {
    // The exact attack the HMAC exists to stop: swap the id, keep the signature.
    const sig = makeUnsubscribeToken(UID).split(".").pop()!;
    expect(verifyUnsubscribeToken(`${OTHER}.${sig}`)).toBeNull();
  });

  it("rejects a bare user id with no signature", () => {
    expect(verifyUnsubscribeToken(UID)).toBeNull();
  });

  it("rejects tampered signatures without throwing", () => {
    const t = makeUnsubscribeToken(UID);
    // timingSafeEqual throws on length mismatch, so both a truncated and a
    // same-length-but-wrong signature have to be handled.
    expect(verifyUnsubscribeToken(t.slice(0, -4))).toBeNull();
    expect(verifyUnsubscribeToken(t.slice(0, -1) + (t.endsWith("A") ? "B" : "A"))).toBeNull();
  });

  it("rejects empty and malformed input", () => {
    expect(verifyUnsubscribeToken(null)).toBeNull();
    expect(verifyUnsubscribeToken("")).toBeNull();
    expect(verifyUnsubscribeToken(".")).toBeNull();
    expect(verifyUnsubscribeToken(".abc")).toBeNull();
  });

  it("stops honouring old links when the secret is rotated", () => {
    const old = makeUnsubscribeToken(UID);
    process.env.UNSUBSCRIBE_SECRET = "rotated";
    expect(verifyUnsubscribeToken(old)).toBeNull();
    process.env.UNSUBSCRIBE_SECRET = "test-secret-value";
    expect(verifyUnsubscribeToken(old)).toBe(UID);
  });

  it("survives a user id containing dots, since the split is on the LAST one", () => {
    // Supabase ids are uuids today, but a lastIndexOf-based parse costs nothing
    // and means this never becomes a mystery bug if that ever changes.
    const odd = "some.id.with.dots";
    expect(verifyUnsubscribeToken(makeUnsubscribeToken(odd))).toBe(odd);
  });

  it("builds a URL-safe link", () => {
    const url = unsubscribeUrl(UID, "https://www.notho.co.za");
    expect(url.startsWith("https://www.notho.co.za/unsubscribe?t=")).toBe(true);
    expect(new URL(url).searchParams.get("t")).toBe(makeUnsubscribeToken(UID));
  });
});

describe("userRef", () => {
  it("is stable for the same user, so exits can be deduped", () => {
    expect(userRef(UID)).toBe(userRef(UID));
  });

  it("differs between users", () => {
    expect(userRef(UID)).not.toBe(userRef(OTHER));
  });

  it("does not contain the user id, because it outlives the account", () => {
    // exit_feedback rows survive deletion. If the id were recoverable from this
    // hash, the table would be personal data we keep after being asked not to.
    const ref = userRef(UID);
    expect(ref).not.toContain(UID);
    expect(ref).not.toContain(UID.split("-")[0]);
    expect(ref).toMatch(/^[0-9a-f]{32}$/);
  });

  it("changes when the pepper changes, so a leaked table cannot be reversed by guessing ids", () => {
    const before = userRef(UID);
    process.env.EXIT_FEEDBACK_PEPPER = "different-pepper";
    expect(userRef(UID)).not.toBe(before);
    process.env.EXIT_FEEDBACK_PEPPER = "test-pepper";
  });
});
