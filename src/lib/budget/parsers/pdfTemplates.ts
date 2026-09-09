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

const SB_HEADER_RE = /\bdate\b.*\bdescription\b.*\bpayments\b.*\bdeposits\b.*\bbalance\b/i;
const SB_OPENING_RE = /statement\s+opening\s+balance/i;
const SB_SECTION_END =
  /statement\s+summary|today'?s\s+debits\s+have\s+not|please\s+verify\s+all\s+transactions/i;
const SB_FOOTER =
  /customer\s+care|standardbank\.co\.za|pg\s*\d+\s*of\s*\d+|page\s*\d+\s+of\s+\d+|the\s+standard\s+bank\s+of\s+south|authorised\s+financial\s+services|we\s+subscribe\s+to\s+the\s+code\s+of\s+banking/i;
const SB_PAGE_CHROME =
  /available\s+balance|account\s+number|account\s+holder|product\s+name|transaction\s+details|3\s+month\s+statement|6\s+month\s+statement|website\s*:|single\s+ibt\s+sbsa/i;

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
