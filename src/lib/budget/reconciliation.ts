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
          .trim()
          .replace(/ $/, ".")
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
    warnings.push("Balance reconciles ✓");
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
