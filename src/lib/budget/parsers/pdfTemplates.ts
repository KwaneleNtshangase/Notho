import { findDateToken, parseStatementDate } from "./pdfDates";
import {
  amountFromBucket,
  bucketItemsToColumns,
  dateTokenInColumn,
  fnbAmountFromBucket,
  fnbBalanceFromBucket,
  parseAmountToken,
  parseFnbAmountToken,
  textFromBucket,
  type ColumnLayout,
  type ColumnRange,
  type ParsedRow,
  type TextLine,
} from "./pdfLayout";

export type BankTemplate = {
  id: string;
  detect: RegExp;
  dateFormat: "dmy" | "ymd" | "dMon";
};

export const BANK_TEMPLATES: BankTemplate[] = [
  { id: "capitec", detect: /capitec/i, dateFormat: "dmy" },
  { id: "standard-bank", detect: /standard\s+bank|std\s+bank/i, dateFormat: "dMon" },
  { id: "fnb", detect: /\bfnb\b|first\s+national\s+bank|fnb\.co\.za|gold\s+business\s+account/i, dateFormat: "dMon" },
  { id: "discovery", detect: /discovery\s+bank|discovery\s+gold\s+transaction|fsp\s+number\s+48657/i, dateFormat: "dMon" },
];

const CAPITEC_HEADER_RE =
  /date.*description.*category.*money\s+in.*money\s+out.*fee.*balance/i;

const FNB_HEADER_RE = /\bdate\b.*\bdescription\b.*\bamount\b.*\bbalance\b/i;
const FNB_TRANSACTIONS_SECTION = /transactions\s+in\s+rand\s*\(zar\)/i;
const FNB_SECTION_END = /closing\s+balance|turnover\s+for\s+statement\s+period/i;
const FNB_FOOTER =
  /please\s+contact\s+us|first\s+national\s+bank|page\s+\d+\s+of\s+\d+/i;

// Standard Bank: Date | Description | Payments | Deposits | Balance
const SB_HEADER_RE = /\bdate\b.*\bdescription\b.*\bpayments\b.*\bdeposits\b.*\bbalance\b/i;
const SB_OPENING_RE = /statement\s+opening\s+balance/i;
const SB_SECTION_END =
  /statement\s+summary|today'?s\s+debits\s+have\s+not|please\s+verify\s+all\s+transactions/i;
const SB_FOOTER =
  /customer\s+care|standardbank\.co\.za|pg\s*\d+\s*of\s*\d+|page\s*\d+\s+of\s+\d+|the\s+standard\s+bank\s+of\s+south|authorised\s+financial\s+services|we\s+subscribe\s+to\s+the\s+code\s+of\s+banking/i;
const SB_PAGE_CHROME =
  /available\s+balance|account\s+number|account\s+holder|product\s+name|transaction\s+details|3\s+month\s+statement|6\s+month\s+statement|website\s*:|single\s+ibt\s+sbsa/i;

/**
 * Trim noise from a transaction description: card masks, long reference/account
 * numbers, phone numbers, branch codes - and cap the length.
 */
export function cleanDescription(raw: string): string {
  let s = (raw || "").replace(/\s+/g, " ").trim();
  s = s.replace(/\b\d{3,4}\*\d{3,4}\b/g, " ");                 // card masks e.g. 4548*0367
  s = s.replace(/\bR\d{4,}\b/g, " ");                          // FNB refs e.g. R25853
  s = s.replace(/\b\d{6,}\b/g, " ");                           // long reference / account numbers
  s = s.replace(/\b0\d{2}[-\s]?\d{3}[-\s]?\d{4}\b/g, " ");     // phone numbers
  s = s.replace(/universal\s+branch\s+code\s*\d*/gi, " ");     // branch-code boilerplate
  s = s.replace(/www\.[a-z0-9.-]+\.[a-z]{2,}/gi, " ");
  s = s.replace(/https?:\/\/\S+/gi, " ");
  s = s.replace(/customer\s+care(?:\s*:)?\s*[\d\s]+/gi, " ");
  s = s.replace(/\bwebsite\s*:/gi, " ");
  s = s.replace(/\bsingle\s+ibt\s+sbsa\b/gi, " ");
  s = s.replace(/\bstandard\s+bank(?:\s+limited)?\b/gi, " ");
  s = s.replace(/\bthe\s+standard\s+bank\s+of\s+south\s+africa\b/gi, " ");
  s = s.replace(/\bavailable\s+balance\b/gi, " ");
  s = s.replace(/\bstatement\s+summary\b/gi, " ");
  s = s.replace(/\btoday'?s\s+debits\s+have\s+not\s+yet\s+been\s+paid\b/gi, " ");
  s = s.replace(/\s+/g, " ").trim();
  if (s.length > 90) s = `${s.slice(0, 89).trim()}…`;
  return s;
}

/** Bank-agnostic transaction-table header (Date + Balance + amount columns). */
export function detectTransactionTableHeader(
  line: TextLine,
  bankId?: string
): ColumnLayout | null {
  if (bankId === "capitec" || !bankId) {
    const capitec = detectCapitecColumns(line);
    if (capitec) return capitec;
  }
  if (bankId === "fnb" || !bankId) {
    const fnb = detectFnbColumns(line);
    if (fnb) return fnb;
  }
  if (bankId === "standard-bank" || !bankId) {
    const sb = detectStandardBankColumns(line);
    if (sb) return sb;
  }
  return null;
}

const FOOTER_LINE = /unique\s+document\s+no\.|page\s+\d+\s+of\s+\d+/i;
const TRANSACTION_HISTORY_TITLE = /transaction\s+history/i;
const SCHEDULED_PAYMENTS_SECTION = /scheduled\s+payments/i;
const SUMMARY_SECTION = /\bsummary\b/i;

function isCapitecExcludedLine(line: TextLine): boolean {
  if (FOOTER_LINE.test(line.text)) return true;
  if (SCHEDULED_PAYMENTS_SECTION.test(line.text)) return true;
  if (SUMMARY_SECTION.test(line.text) && !CAPITEC_HEADER_RE.test(line.text)) return true;
  return false;
}

function isScheduledPaymentsLine(line: TextLine): boolean {
  return SCHEDULED_PAYMENTS_SECTION.test(line.text);
}

function isSummaryLine(line: TextLine): boolean {
  return SUMMARY_SECTION.test(line.text) && !CAPITEC_HEADER_RE.test(line.text);
}

function colRange(x: number, tolerance = 55): ColumnRange {
  return { x, tolerance };
}

/** Detect Capitec column x-positions from the repeated table header row. */
export function detectCapitecColumns(line: TextLine): ColumnLayout | null {
  if (!CAPITEC_HEADER_RE.test(line.text.replace(/\*/g, ""))) return null;

  const findCol = (label: RegExp): ColumnRange | undefined => {
    const item = line.items.find((i) => label.test(i.text.replace(/\*/g, "")));
    return item ? colRange(item.x) : undefined;
  };

  const layout: ColumnLayout = {
    date: findCol(/^date$/i),
    description: findCol(/^description$/i),
    category: findCol(/^category$/i),
    moneyIn: findCol(/^money\s+in$/i),
    moneyOut: findCol(/^money\s+out$/i),
    fee: findCol(/^fee/i),
    balance: findCol(/^balance$/i),
  };

  if (!layout.date || !layout.balance) return null;
  return layout;
}

/** Detect FNB column x-positions from Date Description Amount Balance header. */
export function detectFnbColumns(line: TextLine): ColumnLayout | null {
  const normalized = line.text.replace(/\s+/g, " ");
  if (!FNB_HEADER_RE.test(normalized)) return null;
  if (/money\s+in|money\s+out|category/i.test(normalized)) return null;

  const findCol = (label: RegExp, fallbackX: number, tolerance = 35): ColumnRange => {
    const item = line.items.find((i) => label.test(i.text.replace(/\*/g, "")));
    return item ? colRange(item.x, tolerance) : colRange(fallbackX, tolerance);
  };

  return {
    date: findCol(/^date$/i, 25, 25),
    description: findCol(/^description$/i, 200, 150),
    amount: findCol(/^amount$/i, 462, 35),
    balance: findCol(/^balance$/i, 525, 35),
    accruedCharges: colRange(565, 30),
  };
}

function descriptionFromBuckets(
  buckets: ReturnType<typeof bucketItemsToColumns>,
  dateToken: string
): string {
  const desc = textFromBucket(buckets, "description");
  if (desc) return desc.replace(dateToken, "").trim();
  const category = textFromBucket(buckets, "category");
  const parts = [desc, category].filter(Boolean);
  return parts.join(" ").trim();
}

function continuationFromBuckets(buckets: ReturnType<typeof bucketItemsToColumns>): string {
  const desc = textFromBucket(buckets, "description");
  const cat = textFromBucket(buckets, "category");
  return [desc, cat].filter(Boolean).join(" ").trim();
}

export type CapitecParseResult = {
  rows: ParsedRow[];
  columns: ColumnLayout | null;
  balanceChainOk: boolean;
};

/** Capitec-specific parser using positional columns from the real statement layout. */
export function parseCapitecLayout(
  lines: TextLine[],
  contextYear?: number
): CapitecParseResult {
  let columns: ColumnLayout | null = null;
  const rows: ParsedRow[] = [];
  let previousDate: string | undefined;
  let seenTransactionHistory = false;
  let inTransactionTable = false;
  let prevBalance: number | undefined;
  let balanceChainOk = true;
  const hasLaterPages = lines.some((l) => l.page > 1);
  let lastMainRowIndex = -1;

  const pushRow = (
    row: Omit<ParsedRow, "lineIndex"> & { lineIndex: number },
    feeAmount?: number
  ) => {
    const finalBalance = row.balanceAfter!;
    const mainBalance =
      feeAmount !== undefined ? finalBalance - feeAmount : finalBalance;

    if (prevBalance !== undefined) {
      const expectedMain = amountToCents(prevBalance) + amountToCents(row.amountZAR);
      if (Math.abs(expectedMain - amountToCents(mainBalance)) > 1) {
        row.balanceStepFailed = true;
        row.needsReview = true;
        balanceChainOk = false;
      }
    }

    rows.push({ ...row, balanceAfter: mainBalance });
    lastMainRowIndex = rows.length - 1;

    if (feeAmount !== undefined && Math.abs(feeAmount) >= 0.01) {
      if (Math.abs(amountToCents(mainBalance) + amountToCents(feeAmount) - amountToCents(finalBalance)) > 1) {
        balanceChainOk = false;
      }
      rows.push({
        date: row.date,
        description: "Bank Charges",
        amountZAR: feeAmount,
        balanceAfter: finalBalance,
        lineIndex: row.lineIndex,
        needsReview: false,
      });
      prevBalance = finalBalance;
    } else {
      prevBalance = mainBalance;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.page === 1 && hasLaterPages) continue;

    if (TRANSACTION_HISTORY_TITLE.test(line.text)) {
      seenTransactionHistory = true;
      inTransactionTable = false;
      continue;
    }

    if (isScheduledPaymentsLine(line) || isSummaryLine(line)) {
      inTransactionTable = false;
      continue;
    }

    const headerCols = detectCapitecColumns(line);
    if (headerCols) {
      if (seenTransactionHistory) {
        columns = headerCols;
        inTransactionTable = true;
      }
      continue;
    }

    if (isCapitecExcludedLine(line)) continue;

    if (!inTransactionTable || !columns) continue;

    const dateToken = dateTokenInColumn(line, columns.date);
    const buckets = bucketItemsToColumns(line, columns);
    const balanceAfter = amountFromBucket(buckets, "balance");

    if (!dateToken) {
      if (lastMainRowIndex >= 0 && balanceAfter === null) {
        const extra = continuationFromBuckets(buckets);
        if (extra) {
          const last = rows[lastMainRowIndex];
          last.description = cleanDescription(`${last.description} ${extra}`) || last.description;
        }
      }
      continue;
    }

    if (balanceAfter === null) continue;

    const iso = parseStatementDate(dateToken, contextYear, previousDate);
    if (!iso) continue;

    const moneyIn = amountFromBucket(buckets, "moneyIn");
    const moneyOut = amountFromBucket(buckets, "moneyOut");
    const fee = amountFromBucket(buckets, "fee");

    let amountZAR: number | null = null;
    let uncertainAmount = false;

    if (moneyIn !== null && Math.abs(moneyIn) >= 0.01) {
      amountZAR = Math.abs(moneyIn);
    } else if (moneyOut !== null && Math.abs(moneyOut) !== 0) {
      amountZAR = moneyOut <= 0 ? moneyOut : -Math.abs(moneyOut);
    } else {
      uncertainAmount = true;
      continue;
    }

    const desc = cleanDescription(descriptionFromBuckets(buckets, dateToken)) || "Transaction";
    const feeAmount =
      fee !== null && Math.abs(fee) >= 0.01 ? (fee <= 0 ? fee : -Math.abs(fee)) : undefined;

    pushRow(
      {
        date: iso,
        description: desc,
        amountZAR,
        balanceAfter,
        uncertainAmount,
        needsReview: uncertainAmount || !desc,
        lineIndex: i,
      },
      feeAmount
    );
    previousDate = iso;
  }

  return { rows, columns, balanceChainOk };
}

export type FnbParseResult = {
  rows: ParsedRow[];
  columns: ColumnLayout | null;
  balanceChainOk: boolean;
};

function isFnbExcludedLine(line: TextLine): boolean {
  if (FNB_FOOTER.test(line.text)) return true;
  if (FNB_SECTION_END.test(line.text)) return true;
  if (/^opening\s+balance/i.test(line.text)) return true;
  return false;
}

function fnbDescriptionFromLine(
  line: TextLine,
  columns: ColumnLayout,
  dateToken: string
): string {
  const dateX = columns.date?.x ?? 25;
  const amountX = columns.amount?.x ?? 462;
  const descItems = line.items.filter(
    (item) =>
      item.text !== dateToken &&
      item.x > dateX + 10 &&
      item.x < amountX - 15 &&
      parseFnbAmountToken(item.text) === null
  );
  return descItems
    .map((i) => i.text)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

/** FNB-specific parser - single Amount column with Cr/Dr suffix. */
export function parseFnbLayout(
  lines: TextLine[],
  contextYear?: number
): FnbParseResult {
  let columns: ColumnLayout | null = null;
  const rows: ParsedRow[] = [];
  let previousDate: string | undefined;
  let seenTransactionsSection = false;
  let inTransactionTable = false;
  let prevBalance: number | undefined;
  let balanceChainOk = true;
  let lastMainRowIndex = -1;

  // pdfjs reports y bottom-origin (higher y = top of page). The shared line
  // grouping sorts y ascending (bottom-up), which reverses FNB statements and
  // makes the "Transactions in RAND" → header → rows section logic find nothing.
  // Re-sort into correct top-down reading order for this parser.
  const ordered = [...lines].sort((a, b) => a.page - b.page || b.y - a.y);

  for (let i = 0; i < ordered.length; i++) {
    const line = ordered[i];

    if (FNB_TRANSACTIONS_SECTION.test(line.text)) {
      seenTransactionsSection = true;
      inTransactionTable = false;
      continue;
    }

    const headerCols = detectFnbColumns(line);
    if (headerCols) {
      if (seenTransactionsSection) {
        columns = headerCols;
        inTransactionTable = true;
      }
      continue;
    }

    if (isFnbExcludedLine(line)) {
      inTransactionTable = false;
      continue;
    }

    if (!inTransactionTable || !columns) continue;

    const dateToken = dateTokenInColumn(line, columns.date);
    const buckets = bucketItemsToColumns(line, columns);
    const balanceAfter = fnbBalanceFromBucket(buckets, "balance");

    if (!dateToken) {
      if (lastMainRowIndex >= 0 && balanceAfter === null) {
        const extra = fnbDescriptionFromLine(line, columns, "");
        if (extra) {
          const last = rows[lastMainRowIndex];
          last.description = cleanDescription(`${last.description} ${extra}`) || last.description;
        }
      }
      continue;
    }

    if (balanceAfter === null) continue;

    const iso = parseStatementDate(dateToken, contextYear, previousDate);
    if (!iso) continue;

    const amountZAR = fnbAmountFromBucket(buckets, "amount");
    if (amountZAR === null || Math.abs(amountZAR) < 0.01) continue;

    const desc = cleanDescription(fnbDescriptionFromLine(line, columns, dateToken)) || "Transaction";

    if (prevBalance !== undefined) {
      const expected = amountToCents(prevBalance) + amountToCents(amountZAR);
      if (Math.abs(expected - amountToCents(balanceAfter)) > 1) {
        balanceChainOk = false;
      }
    }

    rows.push({
      date: iso,
      description: desc,
      amountZAR,
      balanceAfter,
      lineIndex: i,
      needsReview: !desc || desc === "Transaction",
    });
    lastMainRowIndex = rows.length - 1;
    prevBalance = balanceAfter;
    previousDate = iso;
  }

  return { rows, columns, balanceChainOk };
}

export type StandardBankParseResult = {
  rows: ParsedRow[];
  columns: ColumnLayout | null;
  balanceChainOk: boolean;
  closingBalance?: number;
};

/** Detect Standard Bank columns: Date | Description | Payments | Deposits | Balance. */
export function detectStandardBankColumns(line: TextLine): ColumnLayout | null {
  const normalized = line.text.replace(/\s+/g, " ");
  if (!SB_HEADER_RE.test(normalized)) return null;
  const findCol = (label: RegExp, fallbackX: number, tol: number): ColumnRange => {
    const item = line.items.find((i) => label.test(i.text.replace(/\*/g, "")));
    return item ? colRange(item.x, tol) : colRange(fallbackX, tol);
  };
  return {
    date: findCol(/^date$/i, 45, 50),
    // Description data spans well past the header label - wide tolerance so the
    // whole merchant/payee is captured (amounts still win by nearest-column).
    description: findCol(/^description$/i, 120, 170),
    moneyOut: findCol(/^payments$/i, 395, 48), // Payments column → money out
    moneyIn: findCol(/^deposits$/i, 470, 48), // Deposits column → money in
    balance: findCol(/^balance$/i, 560, 48),
  };
}

function orderStandardBankLines(lines: TextLine[]): TextLine[] {
  const byPage = new Map<number, TextLine[]>();
  for (const line of lines) {
    const arr = byPage.get(line.page) ?? [];
    arr.push(line);
    byPage.set(line.page, arr);
  }
  const out: TextLine[] = [];
  for (const page of [...byPage.keys()].sort((a, b) => a - b)) {
    const pageLines = byPage.get(page)!;
    const header = pageLines.find((l) => SB_HEADER_RE.test(l.text.replace(/\s+/g, " ")));
    if (!header) {
      out.push(...[...pageLines].sort((a, b) => b.y - a.y));
      continue;
    }
    const rest = pageLines.filter((l) => l !== header);
    const belowHeader = rest.filter((l) => l.y < header.y - 0.5);
    const aboveHeader = rest.filter((l) => l.y > header.y + 0.5);
    if (belowHeader.length >= aboveHeader.length) {
      out.push(header, ...belowHeader.sort((a, b) => b.y - a.y));
    } else {
      out.push(header, ...aboveHeader.sort((a, b) => a.y - b.y));
    }
  }
  return out;
}

function isStandardBankNoiseLine(line: TextLine): boolean {
  const t = line.text;
  if (SB_FOOTER.test(t)) return true;
  if (SB_PAGE_CHROME.test(t) && !SB_HEADER_RE.test(t.replace(/\s+/g, " ")) && !SB_OPENING_RE.test(t)) {
    return true;
  }
  return false;
}

/**
 * Standard Bank parser. Two-line rows (a date line + a transaction-type line),
 * separate Payments (out) / Deposits (in) columns, comma thousands, DD Mon YY
 * dates. No printed closing balance - the last row's balance is the closing.
 */
export function parseStandardBankLayout(
  lines: TextLine[],
  contextYear?: number
): StandardBankParseResult {
  let columns: ColumnLayout | null = null;
  const rows: ParsedRow[] = [];
  let previousDate: string | undefined;
  let inTable = false;
  let prevBalance: number | undefined;
  let balanceChainOk = true;
  let lastRowIndex = -1;

  const ordered = orderStandardBankLines(lines);

  for (let i = 0; i < ordered.length; i++) {
    const line = ordered[i];

    const headerCols = detectStandardBankColumns(line);
    if (headerCols) {
      columns = headerCols;
      inTable = true;
      continue;
    }

    if (!inTable || !columns) continue;

    if (SB_OPENING_RE.test(line.text)) {
      const amts = amountsOnLine(line);
      if (amts.length > 0) prevBalance = amts[amts.length - 1].val;
      continue;
    }
    if (SB_SECTION_END.test(line.text)) {
      inTable = false;
      continue;
    }
    if (isStandardBankNoiseLine(line)) {
      continue;
    }

    const buckets = bucketItemsToColumns(line, columns);
    const dateStr = textFromBucket(buckets, "date").replace(/\s+/g, " ").trim();
    const balanceAfter = amountFromBucket(buckets, "balance");
    const moneyIn = amountFromBucket(buckets, "moneyIn");
    const moneyOut = amountFromBucket(buckets, "moneyOut");
    const iso = dateStr ? parseStatementDate(dateStr, contextYear, previousDate) : null;

    // Continuation line (the transaction-type line): no date / amount / balance →
    // append its description text to the previous transaction.
    if (!iso || balanceAfter === null) {
      if (
        lastRowIndex >= 0 &&
        balanceAfter === null &&
        moneyIn === null &&
        moneyOut === null &&
        !isStandardBankNoiseLine(line)
      ) {
        const extra = textFromBucket(buckets, "description").replace(/\s+/g, " ").trim();
        if (extra && !SB_FOOTER.test(extra) && !SB_PAGE_CHROME.test(extra)) {
          const last = rows[lastRowIndex];
          last.description = cleanDescription(`${last.description} ${extra}`) || last.description;
        }
      }
      continue;
    }

    let amountZAR: number;
    if (moneyIn !== null && Math.abs(moneyIn) >= 0.01) {
      amountZAR = Math.abs(moneyIn);
    } else if (moneyOut !== null && Math.abs(moneyOut) >= 0.01) {
      amountZAR = -Math.abs(moneyOut);
    } else {
      continue;
    }

    const desc = cleanDescription(textFromBucket(buckets, "description")) || "Transaction";

    if (prevBalance !== undefined) {
      const expected = amountToCents(prevBalance) + amountToCents(amountZAR);
      if (Math.abs(expected - amountToCents(balanceAfter)) > 1) {
        balanceChainOk = false;
      }
    }

    rows.push({
      date: iso,
      description: desc,
      amountZAR,
      balanceAfter,
      lineIndex: i,
      needsReview: desc === "Transaction",
    });
    lastRowIndex = rows.length - 1;
    prevBalance = balanceAfter;
    previousDate = iso;
  }

  const closingBalance =
    lastRowIndex >= 0 ? rows[lastRowIndex].balanceAfter : undefined;
  return { rows, columns, balanceChainOk, closingBalance };
}

function amountToCents(n: number): number {
  return Math.round(n * 100);
}

// ── Discovery Bank ──────────────────────────────────────────────────────────
// Layout: Date | Card no. | Type | Details | Amount. No per-row running balance.
// Debits are marked with a leading "-" token before the R-amount; credits have
// no sign. Amounts carry an "R" prefix ("R50.00") that parseAmountToken rejects,
// so Discovery needs its own amount reader.
const DISCOVERY_HEADER_RE = /\bdate\b.*\btype\b.*\bdetails\b.*\bamount\b/i;
const DISCOVERY_SKIP_RE =
  /opening\s+balance|closing\s+balance|total\s+vat|brought\s+forward|carried\s+forward|your\s+interest\s+rate|account\s+balance\s+up\s+to/i;

/**
 * Parse a Discovery amount token. unpdf emits the whole amount as one token,
 * R-prefixed, with the debit sign attached: "R50.00", "R0.07", "- R14.50",
 * "-R9.67", "(R9.67)". Requiring the R prefix cleanly ignores non-amount
 * numbers on the row (e.g. the "1.00%" inside "Interest Earned at 1.00%").
 */
function parseDiscoveryAmount(raw: string): { value: number; isDebit: boolean } | null {
  const compact = raw.trim().replace(/\s/g, "").replace(/,/g, "");
  if (!/r\d/i.test(compact)) return null; // must be an R-amount
  const isDebit = /^[-(]/.test(compact);
  const s = compact.replace(/[()]/g, "").replace(/^-/, "").replace(/^r/i, "");
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  const n = Math.round(parseFloat(s) * 100) / 100;
  return Number.isFinite(n) ? { value: n, isDebit } : null;
}

/** Extract Discovery opening/closing balances (R-prefixed, dates in between). */
export function extractDiscoveryBalances(lines: TextLine[]): {
  openingBalance?: number;
  closingBalance?: number;
} {
  let openingBalance: number | undefined;
  let closingBalance: number | undefined;
  for (const line of lines) {
    const lower = line.text.toLowerCase();
    // The timeline rows "Opening balance R0.00" / "Closing balance R325.90" are
    // the cleanest source: the balance is the last R-amount on the line.
    const rAmounts = line.items
      .map((i) => parseDiscoveryAmount(i.text))
      .filter((v): v is { value: number; isDebit: boolean } => v !== null);
    if (/opening\s+balance/.test(lower) && rAmounts.length > 0 && openingBalance === undefined) {
      openingBalance = rAmounts[rAmounts.length - 1].value;
    }
    if (/closing\s+balance/.test(lower) && rAmounts.length > 0) {
      closingBalance = rAmounts[rAmounts.length - 1].value;
    }
  }
  return { openingBalance, closingBalance };
}

/** Discovery-specific row parser using the Date/Type/Details/Amount columns. */
export function parseDiscoveryLayout(
  lines: TextLine[],
  contextYear?: number
): ParsedRow[] {
  // Find the header first for column anchors. groupItemsIntoLines sorts lines
  // by ascending y (bottom-of-page first in PDF coordinates), so the header can
  // appear AFTER the rows - scan for it up front rather than gating on order.
  let typeX: number | undefined;
  let detailsX: number | undefined;
  const headerLine = lines.find((l) => DISCOVERY_HEADER_RE.test(l.text));
  if (headerLine) {
    typeX = headerLine.items.find((it) => /^type$/i.test(it.text))?.x;
    detailsX = headerLine.items.find((it) => /^details$/i.test(it.text))?.x;
  }
  if (!headerLine) return [];
  // Column boundary is the midpoint between Type and Details anchors, so the
  // parser adapts to whatever coordinate scale the PDF engine produces.
  const detailsStart =
    typeX !== undefined && detailsX !== undefined ? (typeX + detailsX) / 2 : -Infinity;

  const rows: ParsedRow[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line === headerLine) continue;
    if (DISCOVERY_SKIP_RE.test(line.text)) continue;

    // The date is a single token ("15 Jun 2024") left of the Type column.
    const dateToken = findDateToken(line.text);
    if (!dateToken) continue;
    const iso = parseStatementDate(dateToken, contextYear);
    if (!iso) continue;

    // Amount: the R-prefixed money token (carries its own debit sign). Requiring
    // the R prefix ignores stray numbers like the "1.00%" in an interest line.
    let amount: { value: number; isDebit: boolean } | null = null;
    let amountItemX = Infinity;
    for (const it of line.items) {
      const parsed = parseDiscoveryAmount(it.text);
      if (parsed) {
        amount = parsed;
        amountItemX = it.x;
      }
    }
    if (!amount || amount.value === 0) continue;
    const amountZAR = amount.isDebit ? -amount.value : amount.value;

    // Details column: tokens between the Type/Details midpoint and the amount.
    const descItems = line.items
      .filter((it) => it.x >= detailsStart && it.x < amountItemX && parseDiscoveryAmount(it.text) === null)
      .sort((a, b) => a.x - b.x);
    const desc = cleanDescription(descItems.map((it) => it.text).join(" "));

    rows.push({
      date: iso,
      description: desc || "Transaction",
      amountZAR,
      balanceAfter: undefined,
      lineIndex: i,
      needsReview: !desc,
    });
  }

  // Statement order (top-to-bottom = chronological here); rows were collected
  // bottom-up, so restore by date then line position.
  rows.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : b.lineIndex - a.lineIndex));
  return rows;
}

function amountsOnLine(line: TextLine): { x: number; val: number }[] {
  return line.items
    .map((i) => ({ x: i.x, val: parseAmountToken(i.text) }))
    .filter((a): a is { x: number; val: number } => a.val !== null && Math.abs(a.val) >= 0.01)
    .sort((a, b) => a.x - b.x);
}

/** Template-aware row parser - uses x-positions for known bank column layouts. */
export function applyBankTemplate(
  bankId: string,
  lines: TextLine[],
  contextYear?: number
): ParsedRow[] {
  if (bankId === "capitec") {
    return parseCapitecLayout(lines, contextYear).rows;
  }
  if (bankId === "fnb") {
    return parseFnbLayout(lines, contextYear).rows;
  }
  if (bankId === "standard-bank") {
    return parseStandardBankLayout(lines, contextYear).rows;
  }
  if (bankId === "discovery") {
    return parseDiscoveryLayout(lines, contextYear);
  }

  const rows: ParsedRow[] = [];
  let previousDate: string | undefined;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const dateToken = findDateToken(line.text);
    if (!dateToken) continue;

    const iso = parseStatementDate(dateToken, contextYear, previousDate);
    if (!iso) continue;

    const positioned = amountsOnLine(line);
    if (positioned.length === 0) continue;

    let amountZAR: number;
    let balanceAfter: number | undefined;

    if (bankId === "standard-bank") {
      if (positioned.length >= 2) {
        balanceAfter = positioned[positioned.length - 1].val;
        const txn = positioned[positioned.length - 2];
        if (positioned.length >= 3) {
          const debit = positioned[positioned.length - 3];
          const credit = positioned[positioned.length - 2];
          if (Math.abs(debit.val) >= 0.01 && debit.x < 420) {
            amountZAR = -Math.abs(debit.val);
          } else if (Math.abs(credit.val) >= 0.01) {
            amountZAR = Math.abs(credit.val);
          } else {
            amountZAR = txn.x < 420 ? -Math.abs(txn.val) : Math.abs(txn.val);
          }
        } else {
          amountZAR = txn.x < 420 ? -Math.abs(txn.val) : Math.abs(txn.val);
        }
      } else {
        amountZAR = -Math.abs(positioned[0].val);
      }
    } else if (bankId === "fnb") {
      if (positioned.length >= 2) {
        amountZAR = positioned[positioned.length - 2].val;
        balanceAfter = positioned[positioned.length - 1].val;
      } else {
        amountZAR = positioned[0].val;
      }
    } else {
      amountZAR = positioned[positioned.length - 1].val;
    }

    if (amountZAR === 0) continue;

    const desc = line.text
      .replace(dateToken, "")
      .replace(/R?\s*-?\d{1,3}(?:[\s]\d{3})*\.\d{2}/g, " ")
      .replace(/R?\s*-?\d+\.\d{2}/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    rows.push({
      date: iso,
      description: desc || "Transaction",
      amountZAR,
      balanceAfter,
      lineIndex: i,
      needsReview: !desc,
    });
    previousDate = iso;
  }

  return rows;
}

export function mergeTemplateRows(
  genericRows: ParsedRow[],
  templateRows: ParsedRow[],
  bankId: string
): ParsedRow[] {
  if (
    (bankId === "capitec" || bankId === "fnb" || bankId === "standard-bank" || bankId === "discovery") &&
    templateRows.length > 0
  ) {
    return templateRows.map((r) => ({ ...r, needsReview: r.needsReview ?? false }));
  }
  if (templateRows.length >= genericRows.length * 0.7) {
    return templateRows.map((r) => ({ ...r, needsReview: r.needsReview ?? false }));
  }
  return genericRows.map((r) => ({
    ...r,
    description: r.description || `[${bankId}] Transaction`,
  }));
}
