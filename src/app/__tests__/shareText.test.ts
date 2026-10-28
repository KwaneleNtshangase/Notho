import { describe, expect, it } from "vitest";
import { generateShareText } from "../../lib/shareText";

describe("generateShareText", () => {
  it("uses the two-minute promise and points at the lesson link", () => {
    const text = generateShareText("lesson", { lessonTitle: "What is Money?" });
    expect(text).toContain("2 minutes a day");
    expect(text).toContain("👉 notho.co.za");
    expect(text).not.toContain("5 min a day");
    expect(text).not.toContain("👇 notho.co.za");
  });
});
