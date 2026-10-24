import { describe, it, expect } from "vitest";
import { buildUnsubscribeAlert, buildUnsubscribeReasonAlert } from "../unsubscribeAlert";

describe("buildUnsubscribeAlert", () => {
  it("puts the person's name in the subject so the inbox is scannable", () => {
    const a = buildUnsubscribeAlert({ choice: "all", firstName: "Thato" });
    expect(a.subject).toBe("Thato unsubscribed from all Notho emails");
  });

  it("falls back to 'Someone' when no name is known", () => {
    const a = buildUnsubscribeAlert({ choice: "weekly", firstName: null });
    expect(a.subject).toBe("Someone switched to weekly emails");
    expect(a.html).toContain("not given");
  });

  it("marks resubscribe as good news, distinct from the other choices", () => {
    const a = buildUnsubscribeAlert({ choice: "resubscribe", firstName: "Nomsa" });
    expect(a.subject).toBe("Good news: Nomsa resubscribed to Notho emails");
  });

  it("never includes an email address, by construction - there is no field for one", () => {
    const a = buildUnsubscribeAlert({ choice: "all", firstName: "Thato" });
    expect(a.html).not.toContain("@");
    expect(a.text).not.toContain("@");
  });

  it("formats tenure in human terms rather than a raw day count", () => {
    const short = buildUnsubscribeAlert({ choice: "all", daysSinceSignup: 3 });
    expect(short.html).toContain("3 days");

    const weeks = buildUnsubscribeAlert({ choice: "all", daysSinceSignup: 21 });
    expect(weeks.html).toContain("3 weeks");

    const months = buildUnsubscribeAlert({ choice: "all", daysSinceSignup: 90 });
    expect(months.html).toContain("3 months");
  });

  it("shows tenure as unknown rather than a false zero when it could not be read", () => {
    const a = buildUnsubscribeAlert({ choice: "all", daysSinceSignup: null });
    expect(a.html).toContain("unknown");
    expect(a.html).not.toContain(">0<");
  });

  it("summarises lesson/XP/streak activity when cheaply available", () => {
    const a = buildUnsubscribeAlert({ choice: "product_only", lessonsCompleted: 12, xp: 480, streak: 5 });
    expect(a.html).toContain("12 lessons done");
    expect(a.html).toContain("480 XP");
    expect(a.html).toContain("5-day streak");
  });

  it("omits a zero streak rather than reporting a misleading '0-day streak'", () => {
    const a = buildUnsubscribeAlert({ choice: "pause30", streak: 0 });
    expect(a.html).not.toContain("0-day streak");
  });

  it("says plainly when there is no activity on record", () => {
    const a = buildUnsubscribeAlert({ choice: "all" });
    expect(a.html).toContain("no activity on record");
  });

  it("escapes HTML so a hostile display name cannot inject markup", () => {
    const a = buildUnsubscribeAlert({ choice: "all", firstName: "<script>alert(1)</script>" });
    expect(a.html).not.toContain("<script>alert");
    expect(a.html).toContain("&lt;script&gt;");
  });

  it("always reports the time in SAST", () => {
    const a = buildUnsubscribeAlert({ choice: "all" });
    expect(a.html).toContain("(SAST)");
  });

  it("produces a plain-text alternative, not just HTML", () => {
    const a = buildUnsubscribeAlert({ choice: "weekly", firstName: "Nomsa" });
    expect(a.text).toContain("Nomsa");
    expect(a.text).not.toContain("<");
  });

  it("notes that no reason has been given yet, so a silent follow-up isn't mistaken for none coming", () => {
    const a = buildUnsubscribeAlert({ choice: "all" });
    expect(a.html).toContain("follow-up email will say why");
  });
});

describe("buildUnsubscribeReasonAlert", () => {
  it("puts the human-readable reason label in the subject, not the raw code", () => {
    const a = buildUnsubscribeReasonAlert({ firstName: "Thato", reason: "too_many_emails" });
    expect(a.subject).toBe("Why Thato unsubscribed: Too many emails from Notho");
    expect(a.subject).not.toContain("too_many_emails");
  });

  it("falls back to a nameless subject when no name is known", () => {
    const a = buildUnsubscribeReasonAlert({ firstName: null, reason: "no_time" });
    expect(a.subject).toBe("Why they unsubscribed: I don't have the time right now");
  });

  it("includes the free-text comment when one was given", () => {
    const a = buildUnsubscribeReasonAlert({ firstName: "Thato", reason: "other", detail: "Too pushy with notifications" });
    expect(a.html).toContain("Too pushy with notifications");
    expect(a.text).toContain("Too pushy with notifications");
  });

  it("omits the comment row entirely rather than showing an empty one", () => {
    const a = buildUnsubscribeReasonAlert({ firstName: "Thato", reason: "other", detail: "" });
    expect(a.html).not.toContain("Comment");
  });

  it("never includes an email address, by construction - there is no field for one", () => {
    const a = buildUnsubscribeReasonAlert({ firstName: "Thato", reason: "privacy", detail: "thato@example.com is my old email" });
    // The only "@" that can appear is one the person themselves typed into
    // their own free-text comment - never one this file added on its own.
    const withoutComment = a.html.replace("thato@example.com is my old email", "");
    expect(withoutComment).not.toContain("@");
  });

  it("escapes HTML in the free-text comment", () => {
    const a = buildUnsubscribeReasonAlert({ firstName: "Thato", reason: "other", detail: "<img src=x onerror=alert(1)>" });
    expect(a.html).not.toContain("<img src=x");
    expect(a.html).toContain("&lt;img");
  });

  it("produces a plain-text alternative, not just HTML", () => {
    const a = buildUnsubscribeReasonAlert({ firstName: "Nomsa", reason: "too_hard" });
    expect(a.text).toContain("Nomsa");
    expect(a.text).not.toContain("<");
  });
});
