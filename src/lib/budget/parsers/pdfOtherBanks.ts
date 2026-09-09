import { findDateToken, parseStatementDate } from "./pdfDates";
import {
  amountFromBucket,
  bucketItemsToColumns,
  dateTokenInColumn,
  fnbAmountFromBucket,
  fnbBalanceFromBucket,
  parseFnbAmountToken,
  textFromBucket,
  type ColumnLayout,
  type ColumnRange,
  type ParsedRow,
  type TextLine,
} from "./pdfLayout";

export type CapitecParseResult = {
  rows: ParsedRow[];
  columns: ColumnLayout | null;
  balanceChainOk: boolean;
};
export type FnbParseResult = {
  rows: ParsedRow[];
  columns: ColumnLayout | null;
  balanceChainOk: boolean;
};

const CAPITEC_HEADER_RE =
  /date.*description.*category.*money\\s+in.*money\\s+out.*fee.*balance/i;
