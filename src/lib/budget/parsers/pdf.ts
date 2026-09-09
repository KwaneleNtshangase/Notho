import type { NormalizedTxn, ParsePdfResult } from "../types";
import {
  orderRowsFromOpening,
  orientByBalanceChain,
  reconcileBalanceChain,
  reconcileTransactions,
  verifySignsAgainstBalanceChain,
} from "../reconciliation";
import { extractPdfText } from "./pdfText";
import { groupItemsIntoLines } from "./pdfLayout";
import { extractContextYear } from "./pdfDates";
import {
  accountLabelFromBank,
  detectBankFromText,
  parseGenericPdfLayout,
  refineAccountLabel,
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

  if (bankId === "discovery") {
    const dbal = extractDiscoveryBalances(lines);
    if (dbal.openingBalance !== undefined) generic.balances.openingBalance = dbal.openingBalance;
    if (dbal.closingBalance !== undefined) generic.balances.closingBalance = dbal.closingBalance;
  }

  const accountLabel = refineAccountLabel(
    accountLabelFromBank(bankId ?? detectBankFromText(fullText), options?.fileName),
    fullText
  );

  const hasRunningBalance = rows.filter((r) => r.balanceAfter !== undefined).length >= 3;
  let signWarning: string | undefined;

  const isCreditCard = /credit\s*card|credit\s*limit|minimum\s*payment|available\s*credit|payment\s*due/i.test(fullText);

  if (hasRunningBalance) {
    const oriented =
      generic.balances.openingBalance !== undefined
        ? orderRowsFromOpening(rows, generic.balances.openingBalance)
        : orientByBalanceChain(rows);
    const checked = verifySignsAgainstBalanceChain(
      oriented.rows,
      generic.balances.openingBalance,
      { isCreditCard }
    );
    rows = checked.rows;
    if (checked.corrected > 0) {
      signWarning = `${checked.corrected} row${checked.corrected === 1 ? "" : "s"} had their in/out direction corrected against the statement's own running balance.`;
    } else if (checked.invertedMajority && isCreditCard) {
      signWarning =
        "This is a credit-card statement, where purchases increase the balance. Directions were read from the Debit/Credit columns.";
    } else if (checked.invertedMajority) {
      signWarning =
        "Every row's direction is inverted relative to the running balance, but we found no credit-card markers in this statement. Review the in/out direction on each row before importing.";
    } else if (checked.unverified > checked.verified) {
      signWarning =
        "Most rows could not be checked against the running balance - review the in/out direction on each before importing.";
    }
  }

  const accountNumbers = new Set(
    [...fullText.matchAll(/account\s+(?:number|no\.?)\s*:?\s*(\d[\d\s-]{5,})/gi)].map((m) =>
      m[1].replace(/[\s-]/g, "")
    )
  );
  const accountSections = accountNumbers.size;
  const multiAccount = accountSections > 1;

  const transactions: NormalizedTxn[] = rows.map((r) => ({
    date: r.date,
    description: r.description,
    amountZAR: r.amountZAR,
    rawMerchant: r.description,
    balanceAfter: r.balanceAfter,
    lineIndex: r.lineIndex,
    accountLabel,
  }));

  let closingBalance = generic.balances.closingBalance;
  if (closingBalance === undefined && bankId === "standard-bank") {
    const last = transactions[transactions.length - 1];
    if (last?.balanceAfter !== undefined) closingBalance = last.balanceAfter;
  }

  const hasBalanceMeta =
    generic.balances.openingBalance !== undefined && closingBalance !== undefined;
  const lowConfidence = !hasBalanceMeta || usedLastResort || multiAccount || !hasRunningBalance;

  const canChainBalances =
    (bankId === "capitec" ||
      bankId === "fnb" ||
      bankId === "standard-bank" ||
      (bankId === "discovery" && hasRunningBalance)) &&
    !multiAccount &&
    generic.balances.openingBalance !== undefined &&
    closingBalance !== undefined;

  let reconciliation = canChainBalances
    ? reconcileBalanceChain(
        transactions,
        generic.balances.openingBalance!,
        closingBalance!
      )
    : reconcileTransactions(transactions, {
        openingBalance: multiAccount ? undefined : generic.balances.openingBalance,
        closingBalance: multiAccount ? undefined : closingBalance,
      });

  if (
    bankId === "discovery" &&
    !hasRunningBalance &&
    !multiAccount &&
    generic.balances.openingBalance !== undefined &&
    closingBalance !== undefined
  ) {
    reconciliation = reconcileTransactions(transactions, {
      openingBalance: generic.balances.openingBalance,
      closingBalance,
    });
  }

  if (multiAccount) {
    reconciliation.warnings.push(
      `This statement covers ${accountSections} accounts, so there is no single balance to reconcile against. Check the totals per account before importing.`
    );
  }
  if (signWarning) reconciliation.warnings.push(signWarning);

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
    diagnostics: usedLastResort ? formatFingerprint(fingerprintLayout(lines)) : undefined,
  };
}

export { SCANNED_MESSAGE };
