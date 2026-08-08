import type { NormalizedTxn, ParsePdfResult } from "../types";
import {
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

  // The Discovery in-app layout has no per-row running balance - pull
  // opening/closing from the account summary so reconciliation can still run.
  if (bankId === "discovery") {
    const dbal = extractDiscoveryBalances(lines);
    if (dbal.openingBalance !== undefined) generic.balances.openingBalance = dbal.openingBalance;
    if (dbal.closingBalance !== undefined) generic.balances.closingBalance = dbal.closingBalance;
  }

  const accountLabel = accountLabelFromBank(bankId ?? detectBankFromText(fullText), options?.fileName);

  // Where the statement prints a running balance, let it audit our column
  // reading: put the rows in the direction the chain agrees with, then check
  // every sign against the bank's own arithmetic. Geometry proposes, the
  // document disposes.
  const hasRunningBalance = rows.filter((r) => r.balanceAfter !== undefined).length >= 3;
  let signWarning: string | undefined;
  if (hasRunningBalance) {
    const oriented = orientByBalanceChain(rows);
    const checked = verifySignsAgainstBalanceChain(
      oriented.rows,
      generic.balances.openingBalance
    );
    rows = checked.rows;
    if (checked.corrected > 0) {
      signWarning = `${checked.corrected} row${checked.corrected === 1 ? "" : "s"} had their in/out direction corrected against the statement's own running balance.`;
    } else if (checked.unverified > checked.verified) {
      signWarning =
        "Most rows could not be checked against the running balance - review the in/out direction on each before importing.";
    }
  }

  // Statements covering several accounts restart their balance chain at each
  // account, so a single opening/closing pair does not describe the document.
  //
  // Counted by DISTINCT account number rather than by how often the words
  // appear: "Account Number" is also a column heading in the summary table at
  // the top, so counting occurrences flags an ordinary single-account statement.
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
  // the bank nor the column layout, so the user must eyeball every row. A
  // multi-account statement is low confidence for a different reason: the rows
  // may be right, but nothing in the document verifies them end to end.
  // When fewer than 3 rows carry a running balance, the chain audit could not
  // run, so the sign assignment from column geometry is untested — low
  // confidence even if the opening/closing arithmetic checks out.
  const lowConfidence = !hasBalanceMeta || usedLastResort || multiAccount || !hasRunningBalance;

  // Chaining running balances is the strongest check available, but it only
  // describes ONE account - a statement covering several restarts the chain at
  // each, so asserting a single opening/closing pair over the whole document
  // would report a break that is not there (or, worse, a false "reconciles").
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

  // The Discovery in-app layout prints no per-row balance, so it reconciles on
  // the signed sum instead (opening + sum = closing). The certified layout does
  // print one and is chained above.
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
    // Ship the layout fingerprint on a LOW-CONFIDENCE success too, not only on
    // failure. This was the gap: a statement that parsed generically looked
    // fine to the pipeline, so no diagnostics were sent, and the only way to
    // support the layout properly was to ask the user for their statement.
    // A parse we do not trust is exactly when we most need to see the shape.
    diagnostics: usedLastResort ? formatFingerprint(fingerprintLayout(lines)) : undefined,
  };
}

export { SCANNED_MESSAGE };
