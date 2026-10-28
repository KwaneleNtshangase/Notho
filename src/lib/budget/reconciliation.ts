import type { NormalizedTxn, ReconciliationResult } from "./types";
import { amountToCents } from "./dedupe";

export type ReconciliationMeta = {
  expectedCount?: number;
  expectedSignedSum?: number;
  openingBalance?: number;
  closingBalance?: number;
};

export type BalanceChainRow = Pick<
  NormalizedTxn,
  "date" | "description" | "amountZAR" | "balanceAfter" | "lineIndex"
>;

/** Walk running balances in order - sole reconciliation signal for Capitec PDF imports. */
export function reconcileBalanceChain(
  rows: BalanceChainRow[],
  openingBalance: number,
  closingBalance: number
): ReconciliationResult {
  const parsedCount = rows.length;
  const parsedSignedSumCents = rows.reduce(
    (s, t) => s + amountToCents(t.amountZAR),
    0
  );
  const warnings: string[] = [];
  let ok = true;
  let prevCents = amountToCents(openingBalance);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row.balanceAfter === undefined) continue;
    const expectedCents = prevCents + amountToCents(row.amountZAR);
    const actualCents = amountToCents(row.balanceAfter);
    if (Math.abs(expectedCents - actualCents) > 1) {
      ok = false;
      const desc = row.description.slice(0, 48);
      warnings.push(
        `Balance chain breaks at row ${i + 1} (${row.date} ${desc}): expected R${(expectedCents / 100).toFixed(2)}, statement R${row.balanceAfter.toFixed(2)}. `
      );
      break;
    }
    prevCents = actualCents;
  }

  if (ok && rows.length > 0) {
    const last = rows[rows.length - 1];
    if (
      last.balanceAfter !== undefined &&
      Math.abs(amountToCents(last.balanceAfter) - amountToCents(closingBalance)) > 1
    ) {
      ok = false;
      warnings.push(
        `Final row balance R${last.balanceAfter.toFixed(2)} does not match closing balance R${closingBalance.toFixed(2)}. `
      );
    }
  } else if (ok && rows.length === 0) {
    ok = false;
    warnings.push("No transactions parsed in the statement transaction section.");
  }

  if (ok) {
    warnings.push("Balance reconciles \u2713");
  }

  return {
    ok,
    parsedCount,
    parsedSignedSumCents,
    expectedClosingBalanceCents: amountToCents(closingBalance),
    computedClosingBalanceCents: prevCents,
    warnings,
  };
}

/** Minimal shape needed to check a row against a running balance. */
type SignCheckRow = {
  amountZAR: number;
  balanceAfter?: number;
  needsReview?: boolean;
  uncertainAmount?: boolean;
};

function chainAgreement(rows: SignCheckRow[]): number {
  let agreed = 0;
  let prev: number | undefined;
  for (const row of rows) {
    if (row.balanceAfter === undefined) continue;
    if (prev !== undefined) {
      const delta = Math.round((row.balanceAfter - prev) * 100);
      if (Math.abs(Math.abs(delta) - Math.abs(amountToCents(row.amountZAR))) <= 1) agreed += 1;
    }
    prev = row.balanceAfter;
  }
  return agreed;
}

export function orientByBalanceChain<T extends SignCheckRow>(rows: T[]): {
  rows: T[];
  reversed: boolean;
} {
  const reversedRows = [...rows].reverse();
  const reversed = chainAgreement(reversedRows) > chainAgreement(rows);
  return { rows: reversed ? reversedRows : rows, reversed };
}

export function orderRowsFromOpening<T extends SignCheckRow>(
  rows: T[],
  openingBalance?: number
): { rows: T[]; reversed: boolean } {
  if (rows.length < 2) return { rows, reversed: false };
  if (openingBalance === undefined) {
    return orientByBalanceChain(rows);
  }

  const startError = (arr: T[]): number => {
    const first = arr[0];
    if (first.balanceAfter === undefined) return Number.POSITIVE_INFINITY;
    return Math.abs(
      amountToCents(openingBalance) +
        amountToCents(first.amountZAR) -
        amountToCents(first.balanceAfter)
    );
  };

  const reversedList = [...rows].reverse();
  const fwdErr = startError(rows);
  const revErr = startError(reversedList);
  if (fwdErr <= 1 && revErr > 1) return { rows, reversed: false };
  if (revErr <= 1 && fwdErr > 1) return { rows: reversedList, reversed: true };

  return orientByBalanceChain(rows);
}

export function verifySignsAgainstBalanceChain<T extends SignCheckRow>(
  rows: T[],
  openingBalance?: number,
  options?: { isCreditCard?: boolean }
): {
  rows: (T & { needsReview?: boolean; uncertainAmount?: boolean })[];
  corrected: number;
  unverified: number;
  verified: number;
  invertedMajority: boolean;
} {
  const isCreditCard = options?.isCreditCard ?? false;
  type Classification = "verified" | "inverted" | "unverified" | "skip";
  const classes: Classification[] = [];
  let prev: number | undefined = openingBalance;

  for (const row of rows) {
    if (row.balanceAfter === undefined) {
      classes.push("skip");
      continue;
    }
    if (prev === undefined) {
      prev = row.balanceAfter;
      classes.push("skip");
      continue;
    }
    const deltaCents = Math.round((row.balanceAfter - prev) * 100);
    const amtCents = amountToCents(row.amountZAR);
    prev = row.balanceAfter;

    if (Math.abs(deltaCents - amtCents) <= 1) {
      classes.push("verified");
    } else if (Math.abs(deltaCents + amtCents) <= 1 && amtCents !== 0) {
      classes.push("inverted");
    } else {
      classes.push("unverified");
    }
  }

  const totalInverted = classes.filter((c) => c === "inverted").length;
  const totalVerified = classes.filter((c) => c === "verified").length;
  const totalChecked = totalInverted + totalVerified + classes.filter((c) => c === "unverified").length;
  const invertedMajority = totalChecked > 0 && totalInverted > totalVerified;

  let corrected = 0;
  let unverified = 0;
  let verified = 0;
  const out = rows.map((row, i) => {
    const cls = classes[i];
    if (cls === "skip") return row;
    if (cls === "verified") {
      verified += 1;
      return row;
    }
    if (cls === "inverted") {
      if (invertedMajority && isCreditCard) {
        verified += 1;
        return row;
      }
      if (invertedMajority) {
        unverified += 1;
        return { ...row, needsReview: true, uncertainAmount: true };
      }
      corrected += 1;
      return { ...row, amountZAR: -row.amountZAR };
    }
    unverified += 1;
    return { ...row, needsReview: true, uncertainAmount: true };
  });

  return { rows: out, corrected, unverified, verified, invertedMajority };
}

export function reconcileTransactions(
  transactions: NormalizedTxn[],
  meta: ReconciliationMeta = {}
): ReconciliationResult {
  const parsedCount = transactions.length;
  const parsedSignedSumCents = transactions.reduce(
    (s, t) => s + amountToCents(t.amountZAR),
    0
  );

  const warnings: string[] = [];
  let ok = true;

  if (meta.expectedCount !== undefined && meta.expectedCount !== parsedCount) {
    ok = false;
    warnings.push(
      `Transaction count mismatch: parsed ${parsedCount}, statement reports ${meta.expectedCount}.`
    );
  }

  if (meta.expectedSignedSum !== undefined) {
    const expectedCents = amountToCents(meta.expectedSignedSum);
    if (expectedCents !== parsedSignedSumCents) {
      ok = false;
      warnings.push(
        `Signed sum mismatch: parsed ${parsedSignedSumCents / 100} ZAR, statement reports ${meta.expectedSignedSum} ZAR.`
      );
    }
  }

  let computedClosingBalanceCents: number | undefined;
  if (meta.openingBalance !== undefined) {
    computedClosingBalanceCents =
      amountToCents(meta.openingBalance) + parsedSignedSumCents;
    if (
      meta.closingBalance !== undefined &&
      amountToCents(meta.closingBalance) !== computedClosingBalanceCents
    ) {
      ok = false;
      warnings.push(
        `Closing balance mismatch: computed R${(computedClosingBalanceCents / 100).toFixed(2)}, statement R${meta.closingBalance.toFixed(2)}.`
      );
    }
  }

  return {
    ok,
    parsedCount,
    parsedSignedSumCents,
    expectedCount: meta.expectedCount,
    expectedSignedSumCents:
      meta.expectedSignedSum !== undefined ? amountToCents(meta.expectedSignedSum) : undefined,
    expectedClosingBalanceCents:
      meta.closingBalance !== undefined ? amountToCents(meta.closingBalance) : undefined,
    computedClosingBalanceCents,
    warnings,
  };
}

type ImportRow = { amountZAR: number; skipReason?: "existing_import" | "user_removed" };

export function reconcileAfterImportSkips(
  allTransactions: NormalizedTxn[],
  rows: ImportRow[],
  statement: ReconciliationResult
): ReconciliationResult {
  const warnings = [...statement.warnings];
  let ok = statement.ok;

  const fullCount = allTransactions.length;
  const fullSumCents = allTransactions.reduce((s, t) => s + amountToCents(t.amountZAR), 0);

  const toImport = rows.filter((r) => !r.skipReason);
  const skippedExisting = rows.filter((r) => r.skipReason === "existing_import");

  const importSumCents = toImport.reduce((s, r) => s + amountToCents(r.amountZAR), 0);
  const skippedSumCents = skippedExisting.reduce((s, r) => s + amountToCents(r.amountZAR), 0);

  if (importSumCents + skippedSumCents !== fullSumCents) {
    ok = false;
    warnings.push(
      "Import split mismatch: skipped and new rows do not add up to the parsed statement total - a transaction may have been dropped incorrectly."
    );
  }

  if (rows.length !== fullCount) {
    ok = false;
    warnings.push(
      `Row count mismatch after dedupe: ${rows.length} preview rows vs ${fullCount} parsed from file.`
    );
  }

  if (skippedExisting.length === 0) {
    if (toImport.length !== fullCount) {
      ok = false;
      warnings.push(
        `Post-dedupe count mismatch: ${toImport.length} to import vs ${fullCount} parsed.`
      );
    }
    if (importSumCents !== fullSumCents) {
      ok = false;
      warnings.push("Post-dedupe signed sum does not match the parsed statement total.");
    }
  } else if (fullSumCents !== statement.parsedSignedSumCents) {
    ok = false;
    warnings.push("Parsed statement total changed after dedupe - review before importing.");
  }

  return {
    ...statement,
    ok,
    warnings,
    parsedCount: toImport.length,
    parsedSignedSumCents: importSumCents,
  };
}
