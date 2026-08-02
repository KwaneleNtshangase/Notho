import { describe, it, expect } from "vitest";
import { linesFromFixture } from "../parsers/pdfGeneric";
import { parseLastResortRows } from "../parsers/pdfLastResort";
import {
  fingerprintLayout,
  formatFingerprint,
  maskLine,
  isBoilerplateHeader,
} from "../parsers/pdfFingerprint";

/** Build lines from `[x, text]` tuples - one array per printed line. */
function lines(rows: [number, string][][]) {
  return linesFromFixture({
    lines: rows.map((items, i) => ({
      y: 100 + i * 12,
      page: 1,
      items: items.map(([x, text]) => ({ x, text })),
    })),
  });
}

/**
 * A bank we have never seen: headings the generic parser does not recognise,
 * no bank name anywhere, running balance in the last column. This is the case
 * that used to produce zero rows and no error.
 */
const UNKNOWN_BANK = lines([
  [[40, "Posting"], [130, "Narrative"], [400, "Value"], [480, "Running"]],
  [[40, "01/07/2026"], [130, "Opening balance"], [480, "10 000.00"]],
  [[40, "03/07/2026"], [130, "Woolworths Claremont"], [400, "450.00"], [480, "9 550.00"]],
  [[40, "05/07/2026"], [130, "Salary ACME"], [400, "12 000.00"], [480, "21 550.00"]],
  [[40, "09/07/2026"], [130, "Vodacom prepaid"], [400, "199.00"], [480, "21 351.00"]],
  [[40, "14/07/2026"], [130, "Rent payment"], [400, "4 500.00"], [480, "16 851.00"]],
  [[40, "Page 1 of 2"]],
]);

describe("parseLastResortRows", () => {
  it("parses a bank it has never seen, with no recognisable header", () => {
    const { rows } = parseLastResortRows(UNKNOWN_BANK, 2026);
    expect(rows.length).toBeGreaterThanOrEqual(4);
    expect(rows[0].date).toMatch(/^2026-07-\d{2}$/);
  });

  it("takes the sign from the bank's own balance chain, not a guess", () => {
    const { rows, usedBalanceChain } = parseLastResortRows(UNKNOWN_BANK, 2026);
    expect(usedBalanceChain).toBe(true);

    const woolies = rows.find((r) => /woolworths/i.test(r.description));
    const salary = rows.find((r) => /salary/i.test(r.description));
    // Spending is negative, income positive - derived purely from the balance
    // going down then up. No keyword matching involved.
    expect(woolies?.amountZAR).toBeCloseTo(-450, 2);
    expect(salary?.amountZAR).toBeCloseTo(12000, 2);
  });

  it("reproduces the balance chain exactly", () => {
    const { rows } = parseLastResortRows(UNKNOWN_BANK, 2026);
    for (let i = 1; i < rows.length; i++) {
      const prev = rows[i - 1].balanceAfter;
      const cur = rows[i].balanceAfter;
      if (prev === undefined || cur === undefined) continue;
      expect(cur - prev).toBeCloseTo(rows[i].amountZAR, 2);
    }
  });

  it("marks every row for review - a fallback parse is never silently trusted", () => {
    const { rows } = parseLastResortRows(UNKNOWN_BANK, 2026);
    expect(rows.every((r) => r.needsReview)).toBe(true);
  });

  it("skips summary and footer lines that look like transactions", () => {
    const { rows } = parseLastResortRows(UNKNOWN_BANK, 2026);
    expect(rows.some((r) => /opening balance/i.test(r.description))).toBe(false);
    expect(rows.some((r) => /page \d/i.test(r.description))).toBe(false);
  });

  it("returns nothing rather than guessing when there is no table", () => {
    const prose = lines([
      [[40, "Dear customer, thank you for banking with us."]],
      [[40, "Your statement is attached. Contact us on 0860 123 456."]],
      [[40, "Terms and conditions apply."]],
    ]);
    expect(parseLastResortRows(prose, 2026).rows).toHaveLength(0);
  });

  it("flags rows as uncertain when there is no balance column to trust", () => {
    const noBalance = lines([
      [[40, "02/07/2026"], [130, "Checkers Sixty60"], [400, "320.00"]],
      [[40, "04/07/2026"], [130, "Uber trip"], [400, "85.50"]],
      [[40, "06/07/2026"], [130, "Netflix"], [400, "199.00"]],
      [[40, "08/07/2026"], [130, "Engen garage"], [400, "600.00"]],
    ]);
    const { rows, usedBalanceChain } = parseLastResortRows(noBalance, 2026);
    expect(usedBalanceChain).toBe(false);
    expect(rows.length).toBeGreaterThanOrEqual(3);
    // Without a balance to check against, an inferred sign must say so.
    expect(rows.some((r) => r.uncertainAmount)).toBe(true);
  });
});

describe("fingerprintLayout - diagnostics that leak nothing", () => {
  const fp = fingerprintLayout(UNKNOWN_BANK);

  it("keeps column headings verbatim - they are bank boilerplate", () => {
    expect(fp.headerLines.join(" ")).toMatch(/Posting/);
    expect(fp.headerLines.join(" ")).toMatch(/Narrative/);
  });

  it("masks every letter and digit in transaction rows", () => {
    const blob = fp.sampleRows.map((r) => r.masked).join("\n");
    expect(blob.length).toBeGreaterThan(0);
    expect(blob).not.toMatch(/[a-wyz]/);   // x is the mask character
    expect(blob).not.toMatch(/[0-8]/);     // 9 is the mask character
  });

  it("never carries a real merchant, amount or date through", () => {
    const all = formatFingerprint(fp);
    expect(all).not.toMatch(/Woolworths/i);
    expect(all).not.toMatch(/Vodacom/i);
    expect(all).not.toMatch(/10 000\.00/);
    expect(all).not.toMatch(/01\/07\/2026/);
  });

  it("preserves the structure a parser actually needs", () => {
    // Column x-positions and row shape survive, which is the whole point.
    expect(fp.sampleRows[0].xs.length).toBeGreaterThan(1);
    expect(fp.sampleRows.some((r) => /99\/99\/9999/.test(r.masked))).toBe(true);
    expect(fp.linesWithBoth).toBeGreaterThan(0);
  });

  it("masks structure-preservingly", () => {
    expect(maskLine("Checkers 1 234.56")).toBe("Xxxxxxxx 9 999.99");
    expect(maskLine("03/07/2026")).toBe("99/99/9999");
  });

  it("does not mistake a transaction row for a heading", () => {
    const row = lines([[[40, "03/07/2026"], [130, "Woolworths"], [400, "450.00"]]])[0];
    expect(isBoilerplateHeader(row)).toBe(false);
  });
});
