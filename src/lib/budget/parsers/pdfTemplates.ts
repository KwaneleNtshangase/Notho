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
  { id: "standard-bank", detect: /standard\\s+bank|std\\s+bank/i, dateFormat: "dMon" },
  { id: "fnb", detect: /\\bfnb\\b|first\\s+national\\s+bank|fnb\\.co\\.za|gold\\s+business\\s+account/i, dateFormat: "dMon" },
  { id: "discovery", detect: /discovery\\s+bank|discovery\\s+gold\\s+transaction|fsp\\s+number\\s+48657/i, dateFormat: "dMon" },
];
