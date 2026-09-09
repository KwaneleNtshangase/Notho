import { amountToCents } from "./dedupe";
import type { PreviewTxn } from "./types";
import { daysBetween } from "./parsers/pdfDates";

export type TransferPair = {
  pairId: string;
  debitId: string;
  creditId: string;
  amountCents: number;
  confidence: number;
  debitAccount: string;
  creditAccount: string;
};

const TRANSFER_HINTS =
  /\b(transfer|payment to|payment from|inter.?account|own account|trf|internet trf|immediate trf|fund transfers?|ib payment|rtc pmt)\b/i;

const FEE_OR_INTEREST =
  /\b(fee|fees|charge|charges|interest|vat|service fee|admin fee|txn fee|transaction fee|cash finance)\b/i;

const AMOUNT_TOLERANCE_CENTS = 1;
const LOOSE_TOLERANCE_CENTS = 100;
const MAX_DATE_DAYS = 2;

function transferHintScore(description: string): number {
  return TRANSFER_HINTS.test(description) ? 30 : 0;
}

function isFeeOrInterest(description: string): boolean {
  return FEE_OR_INTEREST.test(description);
}

/**
 * Detect likely inter-account transfer pairs across 2+ parsed statements.
 * Only pairs from different account labels are considered.
 */
export function detectTransferPairs(rows: PreviewTxn[]): TransferPair[] {
  const active = rows.filter((r) => !r.skipReason && !r.isTransfer);
  if (active.length < 2) return [];

  const accounts = new Set(active.map((r) => r.accountLabel ?? "unknown"));
  if (accounts.size < 2) return [];

  const debits = active.filter((r) => r.amountZAR < 0);
  const credits = active.filter((r) => r.amountZAR > 0);
  const pairs: TransferPair[] = [];
  const usedDebit = new Set<string>();
  const usedCredit = new Set<string>();

  for (const debit of debits) {
    if (usedDebit.has(debit.id)) continue;
    const debitCents = amountToCents(debit.amountZAR);

    let best: { credit: PreviewTxn; score: number } | null = null;

    for (const credit of credits) {
      if (usedCredit.has(credit.id)) continue;
      if ((credit.accountLabel ?? "") === (debit.accountLabel ?? "")) continue;

      const creditCents = amountToCents(credit.amountZAR);
      const diff = Math.abs(debitCents + creditCents);
      const debitHint = transferHintScore(debit.description);
      const creditHint = transferHintScore(credit.description);
      const eitherLooksLikeTransfer = debitHint > 0 || creditHint > 0;
      const maxDiff = eitherLooksLikeTransfer ? LOOSE_TOLERANCE_CENTS : AMOUNT_TOLERANCE_CENTS;
      if (diff > maxDiff) continue;
      if (isFeeOrInterest(debit.description) || isFeeOrInterest(credit.description)) continue;

      const dayGap = daysBetween(debit.date, credit.date);
      if (dayGap > MAX_DATE_DAYS) continue;

      let score = 40;
      score += debitHint;
      score += creditHint;
      score += Math.max(0, 20 - dayGap * 8);
      score += diff === 0 ? 20 : 5;
      if (!eitherLooksLikeTransfer) {
        if (diff !== 0 || Math.abs(debitCents) < 50_000) continue;
        score -= 15;
      }

      if (!best || score > best.score) {
        best = { credit, score };
      }
    }

    if (best && best.score >= 60) {
      const pairId = `xfer-${debit.id}-${best.credit.id}`;
      pairs.push({
        pairId,
        debitId: debit.id,
        creditId: best.credit.id,
        amountCents: Math.abs(debitCents),
        confidence: Math.min(100, best.score),
        debitAccount: debit.accountLabel ?? "Account",
        creditAccount: best.credit.accountLabel ?? "Account",
      });
      usedDebit.add(debit.id);
      usedCredit.add(best.credit.id);
    }
  }

  return pairs;
}

export function applyTransferPairs(
  rows: PreviewTxn[],
  pairs: TransferPair[],
  confirmedPairIds: Set<string>
): PreviewTxn[] {
  const confirmed = new Set<string>();
  for (const p of pairs) {
    if (confirmedPairIds.has(p.pairId)) {
      confirmed.add(p.debitId);
      confirmed.add(p.creditId);
    }
  }

  return rows.map((r) => {
    const pair = pairs.find((p) => p.debitId === r.id || p.creditId === r.id);
    if (!pair) return r;
    const isConfirmed = confirmed.has(r.id);
    return {
      ...r,
      transferPairId: pair.pairId,
      transferConfirmed: isConfirmed,
      isTransfer: isConfirmed,
    };
  });
}
