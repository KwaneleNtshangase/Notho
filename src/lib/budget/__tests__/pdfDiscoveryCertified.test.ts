/**
 * Regression tests for bug RF8BPO - Discovery Bank CERTIFIED statement import.
 *
 * The user-facing symptom was "we couldn't tell reliably which were money in and
 * which were money out". The cause was not sign detection at all: three separate
 * shared-layer bugs meant no row of the statement ever reached the sign logic.
 *
 *   1. parseAmountToken rejected the "R" the bank prints inside the amount cell,
 *      so the whole document contained zero recognisable amounts.
 *   2. isStatementDateToken did not accept ISO dates, so the header-anchored
 *      parser found no date in the date column.
 *   3. findAmountTokens treated only spaces as thousands separators, so the
 *      last-resort tier read "1,234.56" as 234.56 and its balance chain could
 *      never reconcile - which is what produced the refusal message.
 *
 * None of these are Discovery-specific, so they are tested at the unit level as
 * well as through the certified fixture.
 */
import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it, vi } from "vitest";
import {
  findAmountTokens,
  isStatementDateToken,
  parseAmountToken,
  estimateCharWidth,
  groupItemsIntoLines,
  type PositionedItem,
} from "../parsers/pdfLayout";
import { parseLayoutFixture } from "../parsers/pdfGeneric";
import { parseLastResortRows } from "../parsers/pdfLastResort";
import {
  orientByBalanceChain,
  verifySignsAgainstBalanceChain,
} from "../reconciliation";
import { parsePdfStatement } from "../parsers/pdf";
import * as pdfText from "../parsers/pdfText";

const fixtures = join(__dirname, "fixtures");
const FIXTURE = "pdf-discovery-certified.layout.json";

type FixtureLine = { y: number; page?: number; items: { x: number; text: string }[] };
type Fixture = {
  headerText?: string;
  openingBalance?: number;
  closingBalance?: number;
  expectedCount?: number;
  lines: FixtureLine[];
};

function loadLayout(name: string): Fixture {
  return JSON.parse(readFileSync(join(fixtures, name), "utf8"));
}

/** `flip` inverts the page coordinate direction, as different PDF producers do. */
function itemsFrom(fixture: Fixture, flip = false): PositionedItem[] {
  return fixture.lines.flatMap((l) =>
    l.items.map((i) => ({ text: i.text, x: i.x, y: flip ? -l.y : l.y, page: l.page ?? 1 }))
  );
}

function fullTextFrom(fixture: Fixture): string {
  return [fixture.headerText ?? "", ...fixture.lines.map((l) => l.items.map((i) => i.text).join(" "))].join(" ");
}

/** Signed amounts keyed by date, so assertions do not depend on row order. */
function byDate(rows: { date: string; amountZAR: number }[]): Record<string, number> {
  return Object.fromEntries(rows.map((r) => [r.date, r.amountZAR]));
}

const EXPECTED: Record<string, number> = {
  "2026-05-04": -1234.56,
  "2026-05-06": 18500,
  "2026-05-07": -9.99,
  "2026-05-11": -199,
  "2026-05-15": 349.99,
  "2026-05-31": 9.99,
};

describe("parseAmountToken - currency prefix (RF8BPO root cause)", () => {
  it("parses an R-prefixed amount with a comma thousands separator", () => {
    expect(parseAmountToken("R 1,234.56")).toBe(1234.56);
  });

  it("parses the no-space form banks also emit", () => {
    expect(parseAmountToken("R50.00")).toBe(50);
    expect(parseAmountToken("ZAR 1 234.56")).toBe(1234.56);
  });

  it("keeps the sign whichever side of the symbol it falls", () => {
    expect(parseAmountToken("- R14.50")).toBe(-14.5);
    expect(parseAmountToken("R-14.50")).toBe(-14.5);
    expect(parseAmountToken("(R9.67)")).toBe(-9.67);
  });

  it("still refuses things that are not amounts", () => {
    expect(parseAmountToken("-")).toBeNull();
    expect(parseAmountToken("Rand")).toBeNull();
    expect(parseAmountToken("")).toBeNull();
  });

  it("requires cents once a currency symbol is present, so 'R5' in prose is not money", () => {
    expect(parseAmountToken("R5")).toBeNull();
    // A bare number keeps its previous, laxer behaviour.
    expect(parseAmountToken("5")).toBe(5);
  });

  it("preserves the pre-existing plain-number behaviour", () => {
    expect(parseAmountToken("1 234.56")).toBe(1234.56);
    expect(parseAmountToken("1,077.04")).toBe(1077.04);
  });
});

describe("findAmountTokens - comma thousands separator", () => {
  it("reads a comma-grouped amount whole rather than just its last group", () => {
    const [a, b] = findAmountTokens("2026-05-04 SHOP R 1,234.56 R 9,876.54");
    expect(a.value).toBe(1234.56);
    expect(b.value).toBe(9876.54);
  });

  it("captures the currency symbol as part of the token", () => {
    // The last-resort parser slices descriptions at `index`, so a prefix left
    // outside the token would strand an "R" on the end of every description.
    const [first] = findAmountTokens("SHOP R 1,234.56");
    expect(first.raw.trim().startsWith("R")).toBe(true);
    expect("SHOP R 1,234.56".slice(0, first.index).trim()).toBe("SHOP");
  });

  it("does not mistake a hyphenated word for a negative amount", () => {
    expect(findAmountTokens("PAYMENT - REF 100.00").map((a) => a.value)).toEqual([100]);
  });
});

describe("isStatementDateToken - ISO dates", () => {
  it("accepts YYYY-MM-DD, which findDateToken already accepted", () => {
    expect(isStatementDateToken("2026-05-04")).toBe(true);
  });

  it("still accepts the formats it always did", () => {
    expect(isStatementDateToken("01/05/2026")).toBe(true);
    expect(isStatementDateToken("12 Feb 26")).toBe(true);
    expect(isStatementDateToken("NOTADATE")).toBe(false);
  });
});

describe("Discovery certified statement layout", () => {
  it("parses every row instead of refusing the statement", () => {
    const fixture = loadLayout(FIXTURE);
    const parsed = parseLayoutFixture(fixture);
    expect(parsed.rows.length).toBe(fixture.expectedCount);
    expect(parsed.bankHint).toBe("discovery");
  });

  it("gets the in/out direction right on every row", () => {
    const parsed = parseLayoutFixture(loadLayout(FIXTURE));
    expect(byDate(parsed.rows)).toEqual(EXPECTED);
  });

  it("reads a debit as money out even when its column overlaps the credit anchor", () => {
    // "R 9.99" is short, so right-alignment pushes its start x to within
    // tolerance of the neighbouring column. It is still a fee, not income.
    const parsed = parseLayoutFixture(loadLayout(FIXTURE));
    const fee = parsed.rows.find((r) => r.description.includes("Monthly account fee"));
    expect(fee?.amountZAR).toBe(-9.99);
  });

  it("does not mistake the running balance for a credit", () => {
    // The Balance column sits 46pt from the Credit header anchor - inside
    // DEFAULT_COL_TOLERANCE. Read first-match rather than nearest, the
    // 2026-05-04 row became +3765.44 of income instead of a R1,234.56 debit.
    const parsed = parseLayoutFixture(loadLayout(FIXTURE));
    const purchase = parsed.rows.find((r) => r.date === "2026-05-04");
    expect(purchase?.amountZAR).toBe(-1234.56);
    expect(purchase?.balanceAfter).toBe(3765.44);
  });

  it("keeps the running balance on each row", () => {
    const parsed = parseLayoutFixture(loadLayout(FIXTURE));
    expect(parsed.rows.every((r) => r.balanceAfter !== undefined)).toBe(true);
  });

  it("reads opening and closing balances printed with a currency symbol", () => {
    const parsed = parseLayoutFixture(loadLayout(FIXTURE));
    expect(parsed.balances.openingBalance).toBe(5000);
    expect(parsed.balances.closingBalance).toBe(22416.43);
  });

  it("does not glue the account-section heading onto a transaction description", () => {
    const parsed = parseLayoutFixture(loadLayout(FIXTURE));
    expect(parsed.rows.every((r) => !/account\s+(type|number)/i.test(r.description))).toBe(true);
  });

  it("reconciles: opening + signed sum = closing", () => {
    const fixture = loadLayout(FIXTURE);
    const parsed = parseLayoutFixture(fixture);
    const sum = parsed.rows.reduce((s, r) => s + Math.round(r.amountZAR * 100), 0);
    expect(Math.round(fixture.openingBalance! * 100) + sum).toBe(
      Math.round(fixture.closingBalance! * 100)
    );
  });

  it("produces the same rows whichever way the page coordinates run", () => {
    const fixture = loadLayout(FIXTURE);
    const forward = parseLayoutFixture(fixture);
    const flipped = parseLayoutFixture({
      ...fixture,
      lines: fixture.lines.map((l) => ({ ...l, y: -l.y })),
    });
    expect(byDate(flipped.rows)).toEqual(byDate(forward.rows));
  });
});

describe("balance chain as the auditor of column geometry", () => {
  function certifiedRows() {
    const fixture = loadLayout(FIXTURE);
    const parsed = parseLayoutFixture(fixture);
    return orientByBalanceChain(parsed.rows).rows;
  }

  it("orients rows into the direction the running balance agrees with", () => {
    const dates = certifiedRows().map((r) => r.date);
    expect(dates).toEqual([...dates].sort());
  });

  it("confirms correct signs without changing them", () => {
    const result = verifySignsAgainstBalanceChain(certifiedRows(), 5000);
    expect(result.corrected).toBe(0);
    expect(result.unverified).toBe(0);
    expect(byDate(result.rows)).toEqual(EXPECTED);
  });

  it("flags for review when ALL signs are inverted (credit-card protection)", () => {
    // When every sign disagrees with the balance chain, this is indistinguishable
    // from a credit-card statement. The audit now flags for review rather than
    // silently flipping everything — the user decides which convention applies.
    const flipped = certifiedRows().map((r) => ({ ...r, amountZAR: -r.amountZAR }));
    const result = verifySignsAgainstBalanceChain(flipped, 5000);
    expect(result.corrected).toBe(0);
    expect(result.unverified).toBe(6);
    // Amounts are NOT flipped — they are flagged for user review
    expect(result.rows[0].amountZAR).toBe(1234.56); // stays inverted
    expect(result.rows.every((r) => r.needsReview)).toBe(true);
  });

  it("flags all-inverted rows regardless of seed (credit-card protection)", () => {
    // Both seeded and unseeded: when ALL signs are inverted, the audit
    // now flags for review rather than flipping. The seed no longer matters
    // for the all-inverted case because the invertedMajority check fires first.
    const flipped = certifiedRows().map((r) => ({ ...r, amountZAR: -r.amountZAR }));
    const unseeded = verifySignsAgainstBalanceChain(flipped);
    expect(unseeded.corrected).toBe(0);
    expect(unseeded.rows[0].amountZAR).toBe(1234.56); // stays inverted, flagged
    const seeded = verifySignsAgainstBalanceChain(flipped, 5000);
    expect(seeded.corrected).toBe(0);
    expect(seeded.rows[0].amountZAR).toBe(1234.56); // also stays inverted, flagged
  });

  it("flags a row it cannot verify rather than guessing", () => {
    const rows = certifiedRows().map((r, i) =>
      i === 3 ? { ...r, amountZAR: 42 } : r
    );
    const result = verifySignsAgainstBalanceChain(rows, 5000);
    expect(result.unverified).toBe(1);
    expect(result.rows[3].uncertainAmount).toBe(true);
    expect(result.rows[3].needsReview).toBe(true);
    expect(result.rows[3].amountZAR).toBe(42);
  });
});

describe("last-resort tier on the certified layout", () => {
  it("reconciles on the balance chain now that thousands separators parse", () => {
    // This tier is what produced the "unreadable-signs" refusal the user saw.
    const fixture = loadLayout(FIXTURE);
    const lines = groupItemsIntoLines(itemsFrom(fixture, true));
    const result = parseLastResortRows(lines, 2026);
    expect(result.refusedReason).toBeUndefined();
    expect(result.usedBalanceChain).toBe(true);
    expect(byDate(result.rows)).toMatchObject({ "2026-05-06": 18500, "2026-05-11": -199 });
  });
});

describe("estimateCharWidth", () => {
  it("separates right-aligned columns that overlap on start x", () => {
    const fixture = loadLayout(FIXTURE);
    const lines = groupItemsIntoLines(itemsFrom(fixture));
    const w = estimateCharWidth(lines);
    expect(w).toBeGreaterThan(2);
    // The short debit "R 9.99" (x=389) and the credit "R 349.99" (x=442) are
    // only 53pt apart on start x - inside the 55pt column tolerance. Comparing
    // right edges must push them further apart, not closer together.
    const startGap = 442 - 389;
    const edgeGap = 442 + 8 * w - (389 + 6 * w);
    expect(edgeGap).toBeGreaterThan(startGap);
  });
});

describe("parsePdfStatement end to end (RF8BPO)", () => {
  async function parseFixture(fixture: Fixture, extraText = "") {
    vi.spyOn(pdfText, "extractPdfText").mockResolvedValueOnce({
      ok: true,
      items: itemsFrom(fixture, true),
      fullText: fullTextFrom(fixture) + extraText,
      pageCount: 1,
    });
    return parsePdfStatement(new Uint8Array([1]), { fileName: "CertifiedStatements.pdf" });
  }

  it("imports the statement that used to be refused", async () => {
    const result = await parseFixture(loadLayout(FIXTURE));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.bankHint).toBe("discovery");
    expect(result.accountLabel).toBe("Discovery");
    expect(result.transactions).toHaveLength(6);
    expect(byDate(result.transactions)).toEqual(EXPECTED);
    vi.restoreAllMocks();
  });

  it("reports a clean reconciliation for a single-account statement", async () => {
    const result = await parseFixture(loadLayout(FIXTURE));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.reconciliation.ok).toBe(true);
    expect(result.lowConfidence).toBe(false);
    vi.restoreAllMocks();
  });

  it("refuses to claim reconciliation across several accounts", async () => {
    // A second account restarts the running balance, so one opening/closing
    // pair no longer describes the document.
    const result = await parseFixture(
      loadLayout(FIXTURE),
      " Account number: 15675225483 Notice Plus Account"
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.lowConfidence).toBe(true);
    expect(result.reconciliation.warnings.some((w) => /covers 2 accounts/i.test(w))).toBe(true);
    vi.restoreAllMocks();
  });

  it("does not treat the summary table's column heading as a second account", async () => {
    const result = await parseFixture(loadLayout(FIXTURE));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.reconciliation.warnings.some((w) => /covers \d+ accounts/i.test(w))).toBe(false);
    vi.restoreAllMocks();
  });
});
