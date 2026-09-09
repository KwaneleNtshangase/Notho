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

/** The row itself is an inter-account move. */
const STRONG_TRANSFER =
  /\b(ib transfer|int acnt|inter.?acc(?:ount| trans)|fund transfers|own account|payshap|rtc(?:\s+pmt|\s+credit)?|live better|interest sweep|std transfer|transfers?)\b/i;

const WEAK_TRANSFER =
  /\b(transfer|trf|payment to|payment from|payment received|immediate payment|ib payment)\b/i;

const FEE_OR_INTEREST =
  /\b(fee|fees|charge|charges|interest|vat|service fee|admin fee|txn fee|transaction fee|cash finance|#international|#electronic|#inter acc|#fee)\b/i;

const THIRD_PARTY_PAYOUT =
  /\b(staff wages?|vb staff|village black|wages village|payroll)\b/i;

const AMOUNT_TOLERANCE_CENTS = 1;
const LOOSE_TOLERANCE_CENTS = 100;
const MAX_DATE_DAYS = 2;

function isFeeOrInterest(description: string): boolean {
  return FEE_OR_INTEREST.test(description);
}

function isStrong(description: string): boolean {
  return STRONG_TRANSFER.test(description);
}

function isWeak(description: string): boolean {
  return WEAK_TRANSFER.test(description);
}

function isThirdPartyPayout(description: string): boolean {
  return THIRD_PARTY_PAYOUT.test(description);
}

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
      const debitStrong = isStrong(debit.description);
      const creditStrong = isStrong(credit.description);
      const eitherStrong = debitStrong || creditStrong;
      const maxDiff = eitherStrong ? LOOSE_TOLERANCE_CENTS : AMOUNT_TOLERANCE_CENTS;
      if (diff > maxDiff) continue;
      if (isFeeOrInterest(debit.description) || isFeeOrInterest(credit.description)) continue;
      if (isThirdPartyPayout(debit.description) || isThirdPartyPayout(credit.description)) continue;

      const dayGap = daysBetween(debit.date, credit.date);
      if (dayGap > MAX_DATE_DAYS) continue;

      if (!eitherStrong) continue;

      let score = 40;
      score += debitStrong ? 30 : isWeak(debit.description) ? 10 : 0;
      score += creditStrong ? 30 : isWeak(credit.description) ? 10 : 0;
      score += Math.max(0, 20 - dayGap * 8);
      score += diff === 0 ? 20 : 5;

      if (!best || score > best.score) best = { credit, score };
    }

    if (best && best.score >= 70) {
      pairs.push({
        pairId: `xfer-${debit.id}-${best.credit.id}`,
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
