import { describe, it, expect } from "vitest";
import { canSend } from "../suppression";

/**
 * The rule this file protects: if somebody has asked us to stop, we stop.
 *
 * Every branch below is a way that promise gets quietly broken in production -
 * a stale pause date, a granular flag that the global switch should have
 * overridden, a "weekly" preference that nothing actually checks. None of them
 * throw. The only way they surface is a person receiving mail they opted out
 * of, and by then the damage (a spam complaint against the sending domain) is
 * already done.
 */

const base = {
  unsubscribed_all: false,
  lifecycle_emails: true,
  product_emails: true,
  frequency: "normal",
  paused_until: null,
};

describe("canSend", () => {
  it("sends to a person with no preferences row - opt-out, not opt-in", () => {
    expect(canSend("lifecycle", undefined)).toBe(true);
    expect(canSend("product", undefined)).toBe(true);
    expect(canSend("winback", undefined)).toBe(true);
  });

  it("sends normally when nothing is switched off", () => {
    expect(canSend("lifecycle", base)).toBe(true);
    expect(canSend("product", base)).toBe(true);
  });

  it("blocks everything when unsubscribed_all is set, whatever the granular flags say", () => {
    // The global switch has to win. A stale true in lifecycle_emails must not
    // resurrect a stream somebody explicitly turned off.
    const p = { ...base, unsubscribed_all: true, lifecycle_emails: true, product_emails: true };
    expect(canSend("lifecycle", p)).toBe(false);
    expect(canSend("product", p)).toBe(false);
    expect(canSend("winback", p)).toBe(false);
  });

  it("blocks everything while a pause is live, including the win-back ask", () => {
    const p = { ...base, paused_until: new Date(Date.now() + 86_400_000).toISOString() };
    expect(canSend("lifecycle", p)).toBe(false);
    expect(canSend("product", p)).toBe(false);
    // Asking "we miss you" of someone who requested a month of silence is
    // exactly the wrong message at exactly the wrong time.
    expect(canSend("winback", p)).toBe(false);
  });

  it("resumes once the pause has expired", () => {
    const p = { ...base, paused_until: new Date(Date.now() - 1000).toISOString() };
    expect(canSend("lifecycle", p)).toBe(true);
    expect(canSend("product", p)).toBe(true);
  });

  it("honours the granular lifecycle opt-out without touching product mail", () => {
    const p = { ...base, lifecycle_emails: false };
    expect(canSend("lifecycle", p)).toBe(false);
    expect(canSend("product", p)).toBe(true);
  });

  it("honours the granular product opt-out without touching lifecycle mail", () => {
    const p = { ...base, product_emails: false };
    expect(canSend("product", p)).toBe(false);
    expect(canSend("lifecycle", p)).toBe(true);
  });

  it("suppresses the per-event stream on 'weekly' and 'none'", () => {
    // There is no weekly digest yet. Until there is, "fewer emails" has to mean
    // fewer emails - silently continuing the daily nudges would make the
    // setting a lie.
    expect(canSend("lifecycle", { ...base, frequency: "weekly" })).toBe(false);
    expect(canSend("lifecycle", { ...base, frequency: "none" })).toBe(false);
    // Frequency governs the lifecycle stream only.
    expect(canSend("product", { ...base, frequency: "weekly" })).toBe(true);
  });

  it("still asks the win-back question of someone who only muted lesson reminders", () => {
    // Turning off nudges is not the same as refusing to be asked a question,
    // and this is the one email that exists to listen rather than talk.
    expect(canSend("winback", { ...base, lifecycle_emails: false, frequency: "none" })).toBe(true);
  });

  it("treats a null flag as not-opted-out, so a partial row cannot mute someone", () => {
    const p = { ...base, lifecycle_emails: null, product_emails: null };
    expect(canSend("lifecycle", p)).toBe(true);
    expect(canSend("product", p)).toBe(true);
  });
});
