/** Shared types for statement import, categorisation, and reports. */

export type StatementFileType = "csv" | "ofx" | "pdf";

/** Parser output - signed ZAR: negative = money out, positive = money in. */
export type NormalizedTxn = {
  date: string; // YYYY-MM-DD (SAST calendar day from statement)
  description: string;
  amountZAR: number; // signed, 2dp
  rawMerchant: string;
  balanceAfter?: number;
  /** OFX FITID or CSV row id when present */
  externalId?: string;
  /** 0-based line in source file */
  lineIndex: number;
  /** Source bank/account label (multi-statement imports) */
  accountLabel?: string;
};

export type ReconciliationResult = {
  ok: boolean;
  parsedCount: number;
  parsedSignedSumCents: number;
  expectedCount?: number;
  expectedSignedSumCents?: number;
  expectedClosingBalanceCents?: number;
  computedClosingBalanceCents?: number;
  warnings: string[];
};

export type CategoriseSource = "rule" | "user" | "ai" | "uncategorised";

export type CategoriseResult = {
  category: string;
  type: "income" | "expense";
  confidence: number;
  source: CategoriseSource;
};

export type PreviewTxn = NormalizedTxn & {
  id: string; // client preview id
  categorisation: CategoriseResult;
  dedupeHash: string;
  /** Already in DB from a prior import */
  skipReason?: "existing_import" | "user_removed";
  /**
   * Same date + amount + type as an existing entry, but a different exact hash
   * (e.g. an overlapping month across two statements, or a row missed before).
   * Default-skipped so it can't silently re-import; user verifies and can keep.
   */
  possibleDuplicate?: boolean;
  /** Description of the existing entry this looks like a duplicate of. */
  duplicateOfDescription?: string;
  /** Same hash earlier in this file - user should confirm both */
  possibleDuplicateInFile?: boolean;
  /** Money-in line that may be a card refund - defaults to income unless re-categorised */
  refundLike?: boolean;
  /** Source file name for multi-import preview grouping */
  sourceFileName?: string;
  /** Low-confidence PDF row - user should verify */
  needsReview?: boolean;
  /** Inter-account transfer - excluded from income/expense when confirmed */
  isTransfer?: boolean;
  /** Links debit/credit legs of a transfer pair */
  transferPairId?: string;
  /** User confirmed this as a transfer */
  transferConfirmed?: boolean;
};

export type ParseStatementResult = {
  fileType: StatementFileType;
  bankHint?: string;
  accountLabel?: string;
  transactions: NormalizedTxn[];
  reconciliation: ReconciliationResult;
  /** PDF-only: lower confidence when no balances/totals to reconcile */
  lowConfidence?: boolean;
};

export type ParsePdfError =
  | { kind: "needsPassword" }
  | { kind: "scanned" }
  | { kind: "noText" }
  | {
      kind: "error";
      message: string;
      /** Masked layout signature, attached when we found no transaction table.
       *  Lets an unsupported layout be fixed from the bug report alone, without
       *  ever asking the user for their statement. See pdfFingerprint.ts. */
      diagnostics?: string;
      bankHint?: string;
    };

export type ParsePdfResult =
  | ({ ok: true; diagnostics?: string } & ParseStatementResult)
  | ({ ok: false } & ParsePdfError);

export type UserMerchantRule = {
  merchant_pattern: string;
  category: string;
  type: "income" | "expense";
};

/** Maps signed txn → budget_entries row shape (positive amount + type). */
export function txnToBudgetEntryFields(txn: Pick<NormalizedTxn, "amountZAR">) {
  const amountCents = Math.round(Math.abs(txn.amountZAR) * 100);
  const type: "income" | "expense" = txn.amountZAR < 0 ? "expense" : "income";
  return {
    type,
    amount: amountCents / 100,
    amountCents,
  };
}
