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
const FNB_FOOTER = /please\s+contact\s+us|first\s+national\s+bank|page\s+\d+\s+of\s+\d+/i;
const SB_HEADER_RE = /\bdate\b.*\bdescription\b.*\bpayments\b.*\bdeposits\b.*\bbalance\b/i;
const SB_OPENING_RE = /statement\s+opening\s+balance/i;
const SB_SECTION_END = /statement\s+summary|today'?s\s+debits\s+have\s+not|please\s+verify\s+all\s+transactions/i;
const SB_FOOTER = /customer\s+care|standardbank\.co\.za|pg\s*\d+\s*of\s*\d+|page\s*\d+\s+of\s+\d+|the\s+standard\s+bank\s+of\s+south|authorised\s+financial\s+services|we\s+subscribe\s+to\s+the\s+code\s+of\s+banking/i;
const SB_PAGE_CHROME = /available\s+balance|account\s+number|account\s+holder|product\s+name|transaction\s+details|3\s+month\s+statement|6\s+month\s+statement|website\s*:|single\s+ibt\s+sbsa/i;

export function cleanDescription(raw: string): string {
  let s = (raw || "").replace(/\s+/g, " ").trim();
  s = s.replace(/\b\d{3,4}\*\d{3,4}\b/g, " ");
  s = s.replace(/\bR\d{4,}\b/g, " ");
  s = s.replace(/\b\d{6,}\b/g, " ");
  s = s.replace(/\b0\d{2}[-\s]?\d{3}[-\s]?\d{4}\b/g, " ");
  s = s.replace(/universal\s+branch\s+code\s*\d*/gi, " ");
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
  if (s.length > 90) s = `${s.slice(0, 89).trim()}\u2026`;
  return s;
}

export function detectTransactionTableHeader(line: TextLine, bankId?: string): ColumnLayout | null {
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

function colRange(x: number, tolerance = 55): ColumnRange {
  return { x, tolerance };
}

export function detectCapitecColumns(line: TextLine): ColumnLayout | null {
  if (!/date.*description.*category.*money\s+in.*money\s+out.*fee.*balance/i.test(line.text.replace(/\*/g, ""))) return null;
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

export type CapitecParseResult = { rows: ParsedRow[]; columns: ColumnLayout | null; balanceChainOk: boolean };
export type FnbParseResult = { rows: ParsedRow[]; columns: ColumnLayout | null; balanceChainOk: boolean };
export type StandardBankParseResult = { rows: ParsedRow[]; columns: ColumnLayout | null; balanceChainOk: boolean; closingBalance?: number };

function amountToCents(n: number): number {
  return Math.round(n * 100);
}

function amountsOnLine(line: TextLine): { x: number; val: number }[] {
  return line.items
    .map((i) => ({ x: i.x, val: parseAmountToken(i.text) }))
    .filter((a): a is { x: number; val: number } => a.val !== null && Math.abs(a.val) >= 0.01)
    .sort((a, b) => a.x - b.x);
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
  if (SB_PAGE_CHROME.test(t) && !SB_HEADER_RE.test(t.replace(/\s+/g, " ")) && !SB_OPENING_RE.test(t)) return true;
  return false;
}

export function detectStandardBankColumns(line: TextLine): ColumnLayout | null {
  const normalized = line.text.replace(/\s+/g, " ");
  if (!SB_HEADER_RE.test(normalized)) return null;
  const findCol = (label: RegExp, fallbackX: number, tol: number): ColumnRange => {
    const item = line.items.find((i) => label.test(i.text.replace(/\*/g, "")));
    return item ? colRange(item.x, tol) : colRange(fallbackX, tol);
  };
  return {
    date: findCol(/^date$/i, 45, 50),
    description: findCol(/^description$/i, 120, 170),
    moneyOut: findCol(/^payments$/i, 395, 48),
    moneyIn: findCol(/^deposits$/i, 470, 48),
    balance: findCol(/^balance$/i, 560, 48),
  };
}

export function parseStandardBankLayout(lines: TextLine[], contextYear?: number): StandardBankParseResult {
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
    if (isStandardBankNoiseLine(line)) continue;
    const buckets = bucketItemsToColumns(line, columns);
    const dateStr = textFromBucket(buckets, "date").replace(/\s+/g, " ").trim();
    const balanceAfter = amountFromBucket(buckets, "balance");
    const moneyIn = amountFromBucket(buckets, "moneyIn");
    const moneyOut = amountFromBucket(buckets, "moneyOut");
    const iso = dateStr ? parseStatementDate(dateStr, contextYear, previousDate) : null;
    if (!iso || balanceAfter === null) {
      if (lastRowIndex >= 0 && balanceAfter === null && moneyIn === null && moneyOut === null && !isStandardBankNoiseLine(line)) {
        const extra = textFromBucket(buckets, "description").replace(/\s+/g, " ").trim();
        if (extra && !SB_FOOTER.test(extra) && !SB_PAGE_CHROME.test(extra)) {
          const last = rows[lastRowIndex];
          last.description = cleanDescription(`${last.description} ${extra}`) || last.description;
        }
      }
      continue;
    }
    let amountZAR: number;
    if (moneyIn !== null && Math.abs(moneyIn) >= 0.01) amountZAR = Math.abs(moneyIn);
    else if (moneyOut !== null && Math.abs(moneyOut) >= 0.01) amountZAR = -Math.abs(moneyOut);
    else continue;
    const desc = cleanDescription(textFromBucket(buckets, "description")) || "Transaction";
    if (prevBalance !== undefined) {
      const expected = amountToCents(prevBalance) + amountToCents(amountZAR);
      if (Math.abs(expected - amountToCents(balanceAfter)) > 1) balanceChainOk = false;
    }
    rows.push({ date: iso, description: desc, amountZAR, balanceAfter, lineIndex: i, needsReview: desc === "Transaction" });
    lastRowIndex = rows.length - 1;
    prevBalance = balanceAfter;
    previousDate = iso;
  }
  const closingBalance = lastRowIndex >= 0 ? rows[lastRowIndex].balanceAfter : undefined;
  return { rows, columns, balanceChainOk, closingBalance };
}

export function parseCapitecLayout(lines: TextLine[], contextYear?: number): CapitecParseResult {
  return { rows: [], columns: null, balanceChainOk: true };
}

export function parseFnbLayout(lines: TextLine[], contextYear?: number): FnbParseResult {
  return { rows: [], columns: null, balanceChainOk: true };
}

export function extractDiscoveryBalances(_lines: TextLine[]): { openingBalance?: number; closingBalance?: number } {
  return {};
}

export function parseDiscoveryLayout(_lines: TextLine[], _contextYear?: number): ParsedRow[] {
  return [];
}

export function applyBankTemplate(bankId: string, lines: TextLine[], contextYear?: number): ParsedRow[] {
  if (bankId === "standard-bank") return parseStandardBankLayout(lines, contextYear).rows;
  if (bankId === "capitec") return parseCapitecLayout(lines, contextYear).rows;
  if (bankId === "fnb") return parseFnbLayout(lines, contextYear).rows;
  if (bankId === "discovery") return parseDiscoveryLayout(lines, contextYear);
  return [];
}

export function mergeTemplateRows(genericRows: ParsedRow[], templateRows: ParsedRow[], bankId: string): ParsedRow[] {
  if ((bankId === "capitec" || bankId === "fnb" || bankId === "standard-bank" || bankId === "discovery") && templateRows.length > 0) {
    return templateRows.map((r) => ({ ...r, needsReview: r.needsReview ?? false }));
  }
  if (templateRows.length >= genericRows.length * 0.7) {
    return templateRows.map((r) => ({ ...r, needsReview: r.needsReview ?? false }));
  }
  return genericRows.map((r) => ({ ...r, description: r.description || `[${bankId}] Transaction` }));
}
