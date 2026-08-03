import type { NormalizedTxn, ParsePdfResult } from "../types";
import { reconcileBalanceChain, reconcileTransactions } from "../reconciliation";
import { extractPdfText } from "./pdfText";
import { groupItemsIntoLines } from "./pdfLayout";
import { extractContextYear } from "./pdfDates";
import {
  accountLabelFromBank,
  detectBankFromText,
  parseGenericPdfLayout,
} from "./pdfGeneric";
import {
  applyBankTemplate,
  BANK_TEMPLATES,
  extractDiscoveryBalances,
  mergeTemplateRows,
} from "./pdfTemplates";
import { parseLastResortRows } from "./pdfLastResort";
import { fingerprintLayout, formatFingerprint } from "./pdfFingerprint";

const SCANNED_MESSAGE =
  "This looks like a scanned image - please upload the downloadable/text PDF or a CSV/OFX export from your bank.";

export async function parsePdfStatement(
  buffer: Uint8Array,
  options?: { password?: string; fileName?: string }
): Promise<ParsePdfResult> {
  const extracted = await extractPdfText(buffer, options?.password);

  if (!extracted.ok) {
    if (extracted.kind === "needsPassword") {
      return { ok: false, kind: "needsPassword" };
    }
    if (extracted.kind === "scanned") {
      return { ok: false, kind: "scanned" };
    }
    return { ok: false, kind: "error", message: extracted.message };
  }

  const { items, fullText } = extracted;
  const generic = parseGenericPdfLayout(items, fullText);
  const lines = groupItemsIntoLines(items);
  const bankId = generic.bankHint;
  const contextYear = extractContextYear(fullText, bankId);

  let rows = generic.rows;
  if (bankId && BANK_TEMPLATES.some((t) => t.id === bankId)) {
    const templateRows = applyBankTemplate(bankId, lines, contextYear);
    rows = mergeTemplateRows(generic.rows, templateRows, bankId);
  }

  // Tier 3. Both tiers above need to RECOGNISE something - a known bank, or a
  // column header we have seen before. A certified statement, a redesigned
  // template or a bank we have never held an account at satisfies neither, and
  // used to fall straight through as zero rows with no explanation.
  //
  // The last-resort parser assumes only that a transaction row has a date and
  // an amount, which is what a statement is. It marks every row needsReview, so
  // nothing it infers reaches the budget without the user confirming it.
  let usedLastResort = false;
  let refusedReason: string | undefined;
  if (rows.length === 0) {
    const fallback = parseLastResortRows(lines, contextYear);
    refusedReason = fallback.refusedReason;
    if (fallback.rows.length > 0) {
      rows = fallback.rows;
      usedLastResort = true;
    }
  }

  // Still nothing. Fail loudly, and attach the layout fingerprint so this is
  // fixable from the bug report alone - see pdfFingerprint.ts for why we can
  // send this without ever handling the statement itself.
  if (rows.length === 0) {
    const refused = refusedReason === "unreadable-signs";
    return {
      ok: false,
      kind: "error",
      message: refused
        ? "We found transactions in this statement but couldn't tell reliably which were money in and which were money out, so we've stopped rather than import it wrong. We've logged the layout and we're adding support for it."
        : "We couldn't find a transaction table in this PDF. It may be a certified or summary statement rather than a standard one.",
      diagnostics: formatFingerprint(fingerprintLayout(lines)),
      bankHint: bankId ?? undefined,
    };
  }

  // Discovery has no per-row running balance - pull opening/closing from the
  // account summary so the signed-sum reconciliation can still run.
  if (bankId === "discovery") {
    const dbal = extractDiscoveryBalances(lines);
    if (dbal.openingBalance !== undefined) generic.balances.openingBalance = dbal.openingBalance;
    if (dbal.closingBalance !== undefined) generic.balances.closingBalance = dbal.closingBalance;
  }

  const accountLabel = accountLabelFromBank(bankId ?? detectBankFromText(fullText), options?.fileName);

  const transactions: NormalizedTxn[] = rows.map((r) => ({
    date: r.date,
    description: r.description,
    amountZAR: r.amountZAR,
    rawMerchant: r.description,
    balanceAfter: r.balanceAfter,
    lineIndex: r.lineIndex,
    accountLabel,
  }));

  // Standard Bank prints no closing-balance label - the last row's running
  // balance IS the closing balance.
  let closingBalance = generic.balances.closingBalance;
  if (closingBalance === undefined && bankId === "standard-bank") {
    const last = transactions[transactions.length - 1];
    if (last?.balanceAfter !== undefined) closingBalance = last.balanceAfter;
  }

  const hasBalanceMeta =
    generic.balances.openingBalance !== undefined && closingBalance !== undefined;
  // A last-resort parse is low confidence by definition: we recognised neither
  // the bank nor the column layout, so the user must eyeball every row.
  const lowConfidence = !hasBalanceMeta || usedLastResort;

  let reconciliation =
    (bankId === "capitec" || bankId === "fnb" || bankId === "standard-bank") &&
    generic.balances.openingBalance !== undefined &&
    closingBalance !== undefined
      ? reconcileBalanceChain(
          transactions,
          generic.balances.openingBalance,
          closingBalance
        )
      : reconcileTransactions(transactions, {
          openingBalance: generic.balances.openingBalance,
          closingBalance,
        });

  // Discovery reconciles on the signed sum (opening + sum = closing), since it
  // prints no per-row balance to chain.
  if (
    bankId === "discovery" &&
    generic.balances.openingBalance !== undefined &&
    closingBalance !== undefined
  ) {
    reconciliation = reconcileTransactions(transactions, {
      openingBalance: generic.balances.openingBalance,
      closingBalance,
    });
  }

  if (usedLastResort) {
    reconciliation.warnings.push(
      "We don't have a template for this statement layout yet, so these rows were read generically. Please check the dates and amounts before importing - we've logged it and will add proper support."
    );
  } else if (lowConfidence && reconciliation.ok) {
    reconciliation.warnings.push(
      "No opening/closing balance found - review each transaction carefully."
    );
  }

  return {
    ok: true,
    fileType: "pdf",
    bankHint: bankId ?? undefined,
    accountLabel,
    transactions,
    reconciliation,
    lowConfidence,
    // Ship the layout fingerprint on a LOW-CONFIDENCE success too, not only on
    // failure. This was the gap: a statement that parsed generically looked
    // fine to the pipeline, so no diagnostics were sent, and the only way to
    // support the layout properly was to ask the user for their statement.
    // A parse we do not trust is exactly when we most need to see the shape.
    diagnostics: usedLastResort ? formatFingerprint(fingerprintLayout(lines)) : undefined,
  };
}

export { SCANNED_MESSAGE };
