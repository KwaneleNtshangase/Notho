import { describe, expect, it } from "vitest";
import { groupItemsIntoLines } from "../parsers/pdfLayout";
import { parseStandardBankLayout, cleanDescription } from "../parsers/pdfTemplates";
import { orderRowsFromOpening } from "../reconciliation";
import { refineAccountLabel } from "../parsers/pdfGeneric";

describe("Standard Bank multi-page parse", () => {
  it("reads pages top-down and does not glue the next page header onto Apple", () => {
    const lines = groupItemsIntoLines([
      { text: "Date", x: 40, y: 700, page: 1 },
      { text: "Description", x: 120, y: 700, page: 1 },
      { text: "Payments", x: 395, y: 700, page: 1 },
      { text: "Deposits", x: 470, y: 700, page: 1 },
      { text: "Balance", x: 560, y: 700, page: 1 },
      { text: "STATEMENT OPENING BALANCE", x: 120, y: 680, page: 1 },
      { text: "8347.98", x: 560, y: 680, page: 1 },
      { text: "17 Mar 26", x: 40, y: 650, page: 1 },
      { text: "SUPERSPAR WES", x: 120, y: 650, page: 1 },
      { text: "3200.00", x: 395, y: 650, page: 1 },
      { text: "5147.98", x: 560, y: 650, page: 1 },
      { text: "CHEQUE CARD PURCHASE", x: 120, y: 638, page: 1 },
      { text: "The Standard Bank of South Africa Limited", x: 40, y: 40, page: 1 },
      { text: "Date", x: 40, y: 700, page: 2 },
      { text: "Description", x: 120, y: 700, page: 2 },
      { text: "Payments", x: 395, y: 700, page: 2 },
      { text: "Deposits", x: 470, y: 700, page: 2 },
      { text: "Balance", x: 560, y: 700, page: 2 },
      { text: "07 Sep 26", x: 40, y: 650, page: 2 },
      { text: "MTHEMBU PRUDENCE VAN", x: 120, y: 650, page: 2 },
      { text: "1010.00", x: 470, y: 650, page: 2 },
      { text: "16052.01", x: 560, y: 650, page: 2 },
      { text: "PAYSHAP PAYMENT FROM", x: 120, y: 638, page: 2 },
      { text: "29 Aug 26", x: 40, y: 610, page: 2 },
      { text: "APPLE.COM/US CUPER", x: 120, y: 610, page: 2 },
      { text: "1586.99", x: 395, y: 610, page: 2 },
      { text: "14465.02", x: 560, y: 610, page: 2 },
      { text: "09 Sep 2026", x: 200, y: 760, page: 2 },
      { text: "STANDARD BANK", x: 220, y: 750, page: 2 },
      { text: "Website:", x: 120, y: 50, page: 2 },
      { text: "www.standardbank.co.za", x: 180, y: 50, page: 2 },
      { text: "Customer Care: 0860 123 000", x: 300, y: 50, page: 2 },
      { text: "Statement Summary", x: 80, y: 120, page: 2 },
    ]);
    const parsed = parseStandardBankLayout(lines, 2026);
    expect(parsed.rows[0].description).toMatch(/SUPERSPAR/i);
    expect(parsed.rows[0].amountZAR).toBe(-3200);
    const apple = parsed.rows.find((r) => /APPLE/i.test(r.description));
    expect(apple).toBeTruthy();
    expect(apple!.description).not.toMatch(/standardbank|customer care|website/i);
    expect(parsed.rows.find((r) => /MTHEMBU/i.test(r.description))?.amountZAR).toBe(1010);
  });

  it("orients a reversed parse from the opening balance", () => {
    const newestFirst = [
      { amountZAR: 1010, balanceAfter: 16052.01 },
      { amountZAR: 1010, balanceAfter: 17062.01 },
    ];
    const ordered = orderRowsFromOpening([...newestFirst].reverse(), 15042.01);
    expect(ordered.rows[0].balanceAfter).toBe(16052.01);
  });

  it("strips Standard Bank page chrome from descriptions", () => {
    const cleaned = cleanDescription(
      "APPLE.COM/US CUPER 09 Sep 2026 SINGLE IBT SBSA STANDARD BANK Website: www.standardbank.co.za Customer Care: 0860 123 000"
    );
    expect(cleaned).not.toMatch(/standard bank|website|customer care|single ibt/i);
    expect(cleaned).toMatch(/APPLE/i);
  });

  it("labels Standard Bank current and credit card as different accounts", () => {
    expect(
      refineAccountLabel(
        "Standard Bank",
        "Account number: 10 24 984 739 4 Product name: PROFESSIONAL"
      )
    ).toMatch(/PROFESSIONAL/i);
    expect(
      refineAccountLabel(
        "Standard Bank",
        "Account number: 5520********0980 Product name: CREDIT CARD"
      )
    ).toMatch(/CREDIT CARD/i);
  });
});
