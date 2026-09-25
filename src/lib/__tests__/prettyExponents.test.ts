import { describe, expect, it } from "vitest";
import { prettyExponents } from "../prettyExponents";

describe("prettyExponents", () => {
  it("turns caret powers into unicode superscripts", () => {
    expect(prettyExponents("R50 000 × (1.12)^15 = R273 500")).toBe(
      "R50 000 × (1.12)¹⁵ = R273 500"
    );
    expect(prettyExponents("(1.15)^12")).toBe("(1.15)¹²");
    expect(prettyExponents("1.0092^432")).toBe("1.0092⁴³²");
    expect(prettyExponents("no powers here")).toBe("no powers here");
  });
});
