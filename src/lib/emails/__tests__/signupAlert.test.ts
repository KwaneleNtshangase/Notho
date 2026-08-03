import { describe, it, expect } from "vitest";
import { buildSignupAlert } from "../signupAlert";

describe("buildSignupAlert", () => {
  it("puts the person's name in the subject so the inbox is scannable", () => {
    const a = buildSignupAlert({ email: "thato@example.com", name: "Thato Mokoena" });
    expect(a.subject).toBe("New Notho user: Thato Mokoena");
  });

  it("falls back to the email when no name was given", () => {
    const a = buildSignupAlert({ email: "thato@example.com" });
    expect(a.subject).toBe("New Notho user: thato@example.com");
    expect(a.html).toContain("not given");
  });

  it("translates the goal id into the label the user actually chose", () => {
    const a = buildSignupAlert({ email: "a@b.com", goal: "home" });
    expect(a.html).toContain("Save for a home");
    expect(a.html).not.toContain(">home<");
  });

  it("passes an unknown goal through rather than dropping it", () => {
    const a = buildSignupAlert({ email: "a@b.com", goal: "something-new" });
    expect(a.html).toContain("something-new");
  });

  it("includes the running total when it is known", () => {
    const a = buildSignupAlert({ email: "a@b.com", totalUsers: 33 });
    expect(a.html).toContain("33 confirmed users");
    expect(a.text).toContain("33 confirmed users");
  });

  it("omits the total cleanly when the count failed", () => {
    const a = buildSignupAlert({ email: "a@b.com", totalUsers: null });
    expect(a.html).not.toContain("confirmed users");
    expect(a.html).not.toContain("null");
  });

  it("builds a mailto that greets by first name only", () => {
    const a = buildSignupAlert({ email: "thato@example.com", name: "Thato Mokoena" });
    expect(a.html).toContain("mailto:thato%40example.com");

    // Decode only the body parameter. Decoding the whole document throws,
    // because the surrounding HTML contains percent signs that are not escapes.
    const body = a.html.match(/&body=([^"]+)"/)?.[1] ?? "";
    expect(body).not.toBe("");
    const decoded = decodeURIComponent(body);
    expect(decoded).toContain("Hi Thato,");
    expect(decoded).not.toContain("Hi Thato Mokoena,");
  });

  it("escapes HTML so a hostile display name cannot inject markup", () => {
    const a = buildSignupAlert({
      email: "x@y.com",
      name: '<script>alert(1)</script>',
    });
    expect(a.html).not.toContain("<script>");
    expect(a.html).toContain("&lt;script&gt;");
  });

  it("always reports the time in SAST", () => {
    const a = buildSignupAlert({ email: "a@b.com" });
    expect(a.html).toContain("(SAST)");
  });

  it("produces a plain-text alternative, not just HTML", () => {
    const a = buildSignupAlert({ email: "a@b.com", name: "Nomsa" });
    expect(a.text).toContain("Nomsa");
    expect(a.text).toContain("a@b.com");
    expect(a.text).not.toContain("<");
  });
});
