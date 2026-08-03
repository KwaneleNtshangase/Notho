import { describe, it, expect } from "vitest";
import { sanitiseText, hasUnsafeChars } from "../sanitise";

// Escapes, never literal control bytes: a test file full of raw NULs gets
// treated as binary by git and silently mangled by editors.

describe("sanitiseText", () => {
  it("strips the NUL byte that made Postgres reject a whole import", () => {
    // The exact shape that failed: a merchant name carrying an embedded NUL
    // from the PDF text layer. Postgres answered "unsupported Unicode escape
    // sequence" and threw away all 314 rows.
    const raw = "Checkers \u0000 Sixty60";
    expect(sanitiseText(raw)).toBe("Checkers Sixty60");
    expect(sanitiseText(raw)).not.toContain("\u0000");
  });

  it("strips other C0 control characters", () => {
    expect(sanitiseText("Wool\u0001worths")).toBe("Wool worths");
    expect(sanitiseText("Pick n\u0007Pay")).toBe("Pick n Pay");
    expect(sanitiseText("Shop\u000BRite")).toBe("Shop Rite");
  });

  it("strips DEL and C1 controls", () => {
    expect(sanitiseText("Voda\u007Fcom")).toBe("Voda com");
    expect(sanitiseText("MTN\u009Fprepaid")).toBe("MTN prepaid");
  });

  it("keeps tab, newline and carriage return as whitespace", () => {
    expect(sanitiseText("Engen\tGarage")).toBe("Engen Garage");
    expect(sanitiseText("Rent\nPayment")).toBe("Rent Payment");
  });

  it("strips lone surrogates, which are valid JS but invalid UTF-8", () => {
    expect(sanitiseText("Engen\uD800")).toBe("Engen");
    expect(sanitiseText("\uDC00Shell")).toBe("Shell");
  });

  it("keeps valid surrogate PAIRS intact", () => {
    // A real emoji is a matched pair and must survive - people put them in
    // their own budget descriptions.
    expect(sanitiseText("Rent 🏠")).toBe("Rent 🏠");
  });

  it("keeps ordinary SA merchant text untouched", () => {
    expect(sanitiseText("Mama Coka Imizamo")).toBe("Mama Coka Imizamo");
    expect(sanitiseText("Kagiso Trading (Pty) Ltd")).toBe("Kagiso Trading (Pty) Ltd");
    expect(sanitiseText("Café Neo")).toBe("Café Neo");
    expect(sanitiseText("Umgalelo - R1 500.00")).toBe("Umgalelo - R1 500.00");
  });

  it("collapses the gap a stripped character leaves behind", () => {
    expect(sanitiseText("Shop \u0000   \u0000 Rite")).toBe("Shop Rite");
  });

  it("handles null and undefined without throwing", () => {
    expect(sanitiseText(null)).toBe("");
    expect(sanitiseText(undefined)).toBe("");
    expect(sanitiseText("")).toBe("");
  });

  it("trims, so a control character at the edge leaves no whitespace", () => {
    expect(sanitiseText("\u0000 Checkers \u0000")).toBe("Checkers");
  });
});

describe("hasUnsafeChars", () => {
  it("detects exactly what sanitiseText removes", () => {
    expect(hasUnsafeChars("Checkers\u0000")).toBe(true);
    expect(hasUnsafeChars("Engen\uD800")).toBe(true);
    expect(hasUnsafeChars("Woolworths")).toBe(false);
    expect(hasUnsafeChars("Rent 🏠")).toBe(false);
  });
});
