/**
 * Header-free last-resort parser: the tier that makes unknown banks work.
 *
 * WHY THIS EXISTS. The other two tiers both need to recognise something. The
 * bank templates need a known bank. The generic layout parser needs to find a
 * column header it recognises. A statement that satisfies neither - a certified
 * statement, a redesigned template, a bank we have never seen, a foreign bank -
 * produced zero rows and no explanation.
 *
 * That is an unwinnable position for a solo team: you cannot hold an account at
 * every bank in South Africa, let alone the world, and you cannot ask every
 * user to send you their statement. So the fallback must assume nothing about
 * the bank at all.
 *
 * WHAT IT ASSUMES. Only this: a transaction row contains a date, and at least
 * one money amount. That is true of every bank statement ever printed, because
 * it is what a statement IS. No header, no column geometry, no bank name.
 *
 * THE SIGN PROBLEM, AND THE TRICK THAT SOLVES IT. Without labelled Debit and
 * Credit columns, nothing on the row says whether R450 left or entered the
 * account. Guessing is worse than failing - a sign error silently corrupts
 * someone's budget.
 *
 * So when a row carries a running balance (most statements print one), we do
 * not guess: amount = balance(n) - balance(n-1). The document tells us the sign
 * itself. Better still, this is self-validating - if our extracted amounts do
 * not reproduce the bank's own balance chain, we know the parse is wrong and
 * can refuse it rather than importing nonsense.
 *
 * With no balance column we fall back to explicit signals only (a minus sign,
 * a Cr/Dr marker, bracketed negatives) and mark every row needsReview, so the
 * user confirms before anything is written.
 */

import type { ParsedRow, TextLine } from "./pdfLayout";
import { findAmountTokens } from "./pdfLayout";
import { findDateToken, parseStatementDate } from "./pdfDates";

/** Lines that are never transactions, however much they look like one. */
const NOISE =
  /\b(page\s+\d+\s+of\s+\d+|opening\s+balance|closing\s+balance|brought\s+forward|carried\s+forward|balance\s+b\/?f|balance\s+c\/?f|statement\s+period|total[s]?\b|vat\s+(reg|no)|subtotal|interest\s+rate|credit\s+limit|available\s+balance|minimum\s+payment)/i;

/** Explicit outflow / inflow markers, when there is no balance chain to trust. */
const DEBIT_MARK = /\b(dr|debit|withdrawal|payment|purchase|fee|charge|transfer\s+out|paid\s+out)\b/i;
const CREDIT_MARK = /\b(cr|credit|deposit|salary|refund|reversal|transfer\s+in|paid\s+in|received)\b/i;

type Candidate = {
  lineIndex: number;
  date: string;
  description: string;
  amounts: { value: number; index: number; raw: string }[];
  /** True when the raw token carried its own minus or bracket. */
  explicitNegative: boolean[];
};

function isBracketNegative(raw: string): boolean {
  return /^\s*\(.*\)\s*$/.test(raw);
}

function collectCandidates(lines: TextLine[], contextYear?: number): Candidate[] {
  const out: Candidate[] = [];

  lines.forEach((line, idx) => {
    const text = line.text.trim();
    if (!text || text.length > 300) return;
    if (NOISE.test(text)) return;

    const dateToken = findDateToken(text);
    if (!dateToken) return;

    const iso = parseStatementDate(dateToken, contextYear);
    if (!iso) return;

    const amounts = findAmountTokens(text);
    if (amounts.length === 0) return;

    // Description: everything between the date and the first amount. If the
    // date trails the description (some layouts do), this still yields the
    // text before the money, which is what we want.
    const dateEnd = text.indexOf(dateToken) + dateToken.length;
    const firstAmountAt = amounts[0].index;
    const raw = firstAmountAt > dateEnd ? text.slice(dateEnd, firstAmountAt) : text.slice(dateEnd);
    const description = raw.replace(/\s+/g, " ").replace(/^[\s\-–—:,|]+|[\s\-–—:,|]+$/g, "").trim();

    out.push({
      lineIndex: idx,
      date: iso,
      description: description || "(no description)",
      amounts,
      explicitNegative: amounts.map((a) => /^\s*-/.test(a.raw) || isBracketNegative(a.raw)),
    });
  });

  return out;
}

/**
 * Does the last amount on each row behave like a running balance?
 *
 * Tested by reconstruction, not by looking at the header: take the last amount
 * of consecutive rows, and check whether the difference between them equals one
 * of the other amounts on the later row. If that holds for most rows, the last
 * column is a balance and the differences ARE the signed amounts.
 */
/**
 * The opening balance, which seeds the chain.
 *
 * Without it the very first transaction has no previous balance to difference
 * against, so it gets no signed amount and would be dropped - losing a real
 * transaction silently, which is the worst outcome available. Statements print
 * this line; we filter it out of the transaction candidates, so read it here.
 */
const OPENING_LINE =
  /\b(opening\s+balance|balance\s+brought\s+forward|brought\s+forward|balance\s+b\/?f)\b/i;

function findOpeningBalance(lines: TextLine[]): number | null {
  for (const line of lines) {
    if (!OPENING_LINE.test(line.text)) continue;
    const amounts = findAmountTokens(line.text);
    if (amounts.length > 0) return amounts[amounts.length - 1].value;
  }
  return null;
}

function balanceChainSigns(
  cands: Candidate[],
  openingBalance: number | null
): Map<number, number> | null {
  const withTwo = cands.filter((c) => c.amounts.length >= 2);
  if (withTwo.length < 3) return null;

  const signed = new Map<number, number>();
  let agreed = 0;
  let tested = 0;

  // Seed from the opening balance when the statement printed one, so the first
  // transaction is signed like every other rather than being lost.
  let prevBal: number | null = openingBalance;

  for (const cur of withTwo) {
    const curBal = cur.amounts[cur.amounts.length - 1].value;
    if (prevBal === null) {
      prevBal = curBal;
      continue;
    }
    const delta = +(curBal - prevBal).toFixed(2);
    prevBal = curBal;
    tested += 1;

    // Does |delta| match one of this row's non-balance amounts? If so the last
    // column really is a running balance and the difference is the true signed
    // amount - the document has told us the sign itself.
    const match = cur.amounts
      .slice(0, -1)
      .some((a) => Math.abs(Math.abs(a.value) - Math.abs(delta)) < 0.02);

    if (match && Math.abs(delta) > 0) {
      signed.set(cur.lineIndex, delta);
      agreed += 1;
    }
  }

  // Require strong agreement. A coincidental match on a couple of rows must not
  // be enough to trust the whole document.
  if (tested === 0 || agreed / tested < 0.7) return null;
  return signed;
}

/** Sign from explicit markers only. Used when there is no balance chain. */
function signFromMarkers(c: Candidate, value: number): { amount: number; certain: boolean } {
  if (c.explicitNegative[0]) return { amount: -Math.abs(value), certain: true };
  const t = c.description;
  if (CREDIT_MARK.test(t) && !DEBIT_MARK.test(t)) return { amount: Math.abs(value), certain: true };
  if (DEBIT_MARK.test(t) && !CREDIT_MARK.test(t)) return { amount: -Math.abs(value), certain: true };
  // Unknown. Statements are mostly spending, so default to an outflow - but say
  // so loudly by marking the row uncertain, which forces user review.
  return { amount: -Math.abs(value), certain: false };
}

export type LastResortResult = {
  rows: ParsedRow[];
  /** True when signs came from the document's own balance chain. */
  usedBalanceChain: boolean;
};

/**
 * Parse without any knowledge of the bank. Returns an empty row set rather than
 * a bad one: fewer than 3 plausible rows means we have found noise, not a table.
 */
export function parseLastResortRows(
  lines: TextLine[],
  contextYear?: number
): LastResortResult {
  const cands = collectCandidates(lines, contextYear);
  if (cands.length < 3) return { rows: [], usedBalanceChain: false };

  const chain = balanceChainSigns(cands, findOpeningBalance(lines));

  const rows: ParsedRow[] = cands.map((c) => {
    const balanceAfter =
      c.amounts.length >= 2 ? c.amounts[c.amounts.length - 1].value : undefined;

    if (chain) {
      const delta = chain.get(c.lineIndex);
      if (delta !== undefined) {
        return {
          date: c.date,
          description: c.description,
          amountZAR: delta,
          balanceAfter,
          lineIndex: c.lineIndex,
          // Derived from the bank's own arithmetic, but still a fallback
          // parser - the user gets the final say before anything is written.
          needsReview: true,
          uncertainAmount: false,
        };
      }
    }

    const primary = c.amounts.length >= 2 ? c.amounts[c.amounts.length - 2] : c.amounts[0];
    const { amount, certain } = signFromMarkers(c, primary.value);
    return {
      date: c.date,
      description: c.description,
      amountZAR: amount,
      balanceAfter,
      lineIndex: c.lineIndex,
      needsReview: true,
      uncertainAmount: !certain,
    };
  });

  // A row that does not fit an otherwise-good chain was probably misread - but
  // it is NOT dropped. Silently discarding a real transaction is worse than
  // showing a doubtful one: the user is reviewing every row anyway, and a
  // missing row is invisible while a wrong row is obvious. It is already
  // flagged uncertain by signFromMarkers above.
  if (rows.length < 3) return { rows: [], usedBalanceChain: false };

  return { rows, usedBalanceChain: !!chain };
}
