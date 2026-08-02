/**
 * Layout fingerprinting: how to fix a statement we are not allowed to keep.
 *
 * THE PROBLEM. When a bank layout fails to parse, the only reliable fix is to
 * see the layout. But asking the user to email us their bank statement is the
 * worst possible ask: it is the single most sensitive document they own, the
 * import panel promises "processed in memory only", and most people simply
 * never reply. A bug you can only fix by asking is a bug that does not get
 * fixed.
 *
 * THE APPROACH. Send the SHAPE of the document, never its contents.
 *
 * A statement has two kinds of text, and they deserve opposite treatment:
 *
 *   1. Bank boilerplate - column headings like "Transaction Date | Description
 *      | Money In | Money Out | Balance". This is the bank's template, printed
 *      identically on every customer's statement. It contains nothing about the
 *      user, and it is precisely what we need to teach the parser. Sent as-is.
 *
 *   2. Transaction rows - dates, counterparties, amounts. Deeply personal, and
 *      we do not need a single real value to fix a layout. What matters is that
 *      a row looks like `dd/mm/yyyy  <text>  1 234.56  9 876.54`, not what the
 *      numbers are. Masked: letters become x, digits become 9, punctuation and
 *      spacing preserved exactly.
 *
 * A masked row keeps every property a parser cares about - column positions,
 * token order, separator characters, decimal format, how many amounts per row -
 * and discards every property a human could identify someone from.
 *
 * The result is a diagnostic that can be pasted into a fixture and fixed the
 * same day, with no follow-up email and no statement ever leaving the device.
 */

import type { TextLine } from "./pdfLayout";

/** Column words banks actually use. Matching 2+ marks a line as boilerplate. */
const HEADER_WORDS =
  /\b(date|description|details|reference|narrative|transaction|type|amount|debit|credit|money\s*(in|out)|balance|payment|deposit|withdrawal|fee|value|posting|effective)\b/gi;

const DATE_LIKE =
  /\b(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}|\d{4}-\d{2}-\d{2}|\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec))/i;

const AMOUNT_LIKE = /-?\s?R?\s?\d{1,3}([ ,]\d{3})*[.,]\d{2}\b/;

/**
 * Replace every letter with x/X and every digit with 9, keeping case pattern,
 * punctuation, spacing and length. "Checkers 1 234.56" -> "Xxxxxxxx 9 999.99".
 */
export function maskLine(text: string): string {
  return text
    .replace(/[A-Z]/g, "X")
    .replace(/[a-z]/g, "x")
    .replace(/[0-9]/g, "9");
}

/** A line of pure column headings carries no user data - keep it readable. */
export function isBoilerplateHeader(line: TextLine): boolean {
  const t = line.text.trim();
  if (!t || t.length > 200) return false;
  if (DATE_LIKE.test(t) || AMOUNT_LIKE.test(t)) return false;
  const matches = t.match(HEADER_WORDS);
  return (matches?.length ?? 0) >= 2;
}

export type LayoutFingerprint = {
  pageCount: number;
  lineCount: number;
  /** Column-heading lines, verbatim - bank boilerplate, no user data. */
  headerLines: string[];
  /** How many lines look like a transaction row. Zero here is the whole story. */
  linesWithDate: number;
  linesWithAmount: number;
  linesWithBoth: number;
  /** Masked samples of lines that look like rows, with x/y positions. */
  sampleRows: { page: number; masked: string; xs: number[] }[];
  /** Masked samples of ordinary lines, for when nothing looks like a row. */
  sampleLines: string[];
};

/**
 * Build the fingerprint. Called only on a parse FAILURE - there is no reason to
 * ship diagnostics for a statement that worked.
 */
export function fingerprintLayout(lines: TextLine[]): LayoutFingerprint {
  const headerLines: string[] = [];
  const sampleRows: { page: number; masked: string; xs: number[] }[] = [];
  const sampleLines: string[] = [];

  let linesWithDate = 0;
  let linesWithAmount = 0;
  let linesWithBoth = 0;
  let maxPage = 0;

  for (const line of lines) {
    const t = line.text.trim();
    if (line.page > maxPage) maxPage = line.page;
    if (!t) continue;

    const hasDate = DATE_LIKE.test(t);
    const hasAmount = AMOUNT_LIKE.test(t);
    if (hasDate) linesWithDate += 1;
    if (hasAmount) linesWithAmount += 1;
    if (hasDate && hasAmount) linesWithBoth += 1;

    if (isBoilerplateHeader(line) && headerLines.length < 8) {
      headerLines.push(t.slice(0, 200));
      continue;
    }

    // Column x-positions are the single most useful signal for a geometry
    // parser, and a coordinate identifies nobody.
    if ((hasDate || hasAmount) && sampleRows.length < 12) {
      sampleRows.push({
        page: line.page,
        masked: maskLine(t).slice(0, 200),
        xs: line.items.map((i) => Math.round(i.x)).slice(0, 12),
      });
    } else if (sampleLines.length < 8 && t.length > 8) {
      sampleLines.push(maskLine(t).slice(0, 120));
    }
  }

  return {
    pageCount: maxPage + 1,
    lineCount: lines.length,
    headerLines,
    linesWithDate,
    linesWithAmount,
    linesWithBoth,
    sampleRows,
    sampleLines,
  };
}

/** Compact, email-friendly rendering. */
export function formatFingerprint(fp: LayoutFingerprint): string {
  const out: string[] = [
    `pages=${fp.pageCount} lines=${fp.lineCount}`,
    `linesWithDate=${fp.linesWithDate} linesWithAmount=${fp.linesWithAmount} linesWithBoth=${fp.linesWithBoth}`,
  ];
  if (fp.headerLines.length) {
    out.push("", "HEADERS (verbatim - bank boilerplate):");
    fp.headerLines.forEach((h) => out.push(`  ${h}`));
  }
  if (fp.sampleRows.length) {
    out.push("", "ROW SHAPES (masked: letters=x, digits=9):");
    fp.sampleRows.forEach((r) => out.push(`  p${r.page} [${r.xs.join(",")}] ${r.masked}`));
  }
  if (fp.sampleLines.length) {
    out.push("", "OTHER LINES (masked):");
    fp.sampleLines.forEach((l) => out.push(`  ${l}`));
  }
  return out.join("\n");
}
