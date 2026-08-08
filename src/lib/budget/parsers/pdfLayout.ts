/** Minus signs banks actually emit: hyphen, Unicode minus, en/em dash. */
const MINUS = /^[-−–—]\s*/;
/** Currency prefix, with or without a space: "R1 234.56", "R 1,234.56", "ZAR 50.00". */
const CURRENCY_PREFIX = /^(?:zar|r)\s*/i;

/**
 * Parse monetary amounts from SA bank statement text.
 *
 * The currency prefix is not decoration - several SA banks print it inside the
 * amount cell, so the PDF text layer emits "R 1,234.56" as a SINGLE item.
 * Rejecting the prefix here made every downstream geometry function blind: no
 * amounts found means no inferred columns, a null balance, and every row of the
 * statement silently dropped. Discovery certified statements are one such
 * layout (bug RF8BPO).
 *
 * A prefixed amount must carry exactly 2 decimals. That keeps "R5" inside a
 * description from being mistaken for money, while every real amount on a bank
 * statement - which is always printed to the cent - still parses.
 */
export function parseAmountToken(raw: string): number | null {
  let s = raw.trim();
  if (!s || /^[-−–—]$/.test(s)) return null;

  const paren = s.match(/^\((.+)\)$/);
  let negative = false;
  if (paren) {
    negative = true;
    s = paren[1].trim();
  }

  // The sign may sit either side of the symbol: "- R14.50" and "R-14.50" both occur.
  if (MINUS.test(s)) {
    negative = true;
    s = s.replace(MINUS, "");
  }
  const hadCurrency = CURRENCY_PREFIX.test(s);
  if (hadCurrency) s = s.replace(CURRENCY_PREFIX, "");
  if (MINUS.test(s)) {
    negative = true;
    s = s.replace(MINUS, "");
  }

  s = s.replace(/\s/g, "").replace(/,/g, "");
  // Trailing minus: some banks print "1234.56-" instead of "-1234.56".
  if (/^[\d.]+[-−–—]$/.test(s)) {
    negative = true;
    s = s.replace(/[-−–—]$/, "");
  }
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  // A bare number may be an integer; a currency-marked one must be to the cent,
  // so a stray "R5" in a description is not read as an amount.
  if (hadCurrency && !/\.\d{2}$/.test(s)) return null;

  const n = Math.round(parseFloat(s) * 100) / 100;
  if (!Number.isFinite(n)) return null;
  return negative ? -n : n;
}

// Thousands separators used on SA statements: space OR comma. Comma was missing,
// so "1,234.56" matched only its last group and was read as 234.56 - a silent
// 1000x under-read that also stopped the balance chain from ever reconciling.
const AMOUNT_BODY = String.raw`\d{1,3}(?:[\s,]\d{3})*\.\d{2}|\d+\.\d{2}`;
const AMOUNT_RE = new RegExp(
  [
    String.raw`\(\s*(?:ZAR|R)?\s*(?:${AMOUNT_BODY})\s*\)`,
    String.raw`[-−–—]?\s*(?:ZAR|R)\s*(?:${AMOUNT_BODY})`,
    String.raw`[-−–—]?(?:${AMOUNT_BODY})`,
  ].join("|"),
  "gi"
);

/**
 * Find all amount-like tokens in text (requires 2dp - avoids date fragments).
 * The currency prefix is captured as part of the token so that callers slicing
 * description text around `index` do not inherit a dangling "R".
 */
export function findAmountTokens(text: string): { value: number; index: number; raw: string }[] {
  const results: { value: number; index: number; raw: string }[] = [];
  const re = new RegExp(AMOUNT_RE.source, "gi");
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const val = parseAmountToken(m[0]);
    if (val !== null && Math.abs(val) >= 0.01) {
      results.push({ value: val, index: m.index, raw: m[0] });
    }
  }
  return results;
}

export type PositionedItem = {
  text: string;
  x: number;
  y: number;
  page: number;
};

export type TextLine = {
  y: number;
  page: number;
  items: PositionedItem[];
  text: string;
};

export function groupItemsIntoLines(items: PositionedItem[], yTolerance = 3): TextLine[] {
  const sorted = [...items].sort((a, b) => a.page - b.page || a.y - b.y || a.x - b.x);
  const lines: TextLine[] = [];

  for (const item of sorted) {
    const t = item.text.trim();
    if (!t) continue;
    let line = lines.find(
      (l) => l.page === item.page && Math.abs(l.y - item.y) <= yTolerance
    );
    if (!line) {
      line = { y: item.y, page: item.page, items: [], text: "" };
      lines.push(line);
    }
    line.items.push(item);
    line.items.sort((a, b) => a.x - b.x);
    line.text = line.items.map((i) => i.text).join(" ").replace(/\s+/g, " ").trim();
  }

  return lines.sort((a, b) => a.page - b.page || a.y - b.y);
}

export type ColumnKind = "date" | "description" | "debit" | "credit" | "amount" | "balance" | "unknown";

export type ColumnRange = { x: number; tolerance?: number };

export type ColumnLayout = {
  date?: ColumnRange;
  description?: ColumnRange;
  category?: ColumnRange;
  moneyIn?: ColumnRange;
  moneyOut?: ColumnRange;
  fee?: ColumnRange;
  debit?: ColumnRange;
  credit?: ColumnRange;
  amount?: ColumnRange;
  balance?: ColumnRange;
  /** FNB accrued bank charges - informational, not part of running balance */
  accruedCharges?: ColumnRange;
};

export type ParsedRow = {
  date: string;
  description: string;
  amountZAR: number;
  balanceAfter?: number;
  needsReview?: boolean;
  lineIndex: number;
  /** Row failed per-step balance-chain check */
  balanceStepFailed?: boolean;
  /** Amount inferred without a clear in/out column */
  uncertainAmount?: boolean;
};

const DEFAULT_COL_TOLERANCE = 40;

export function itemNearColumn(item: PositionedItem, col?: ColumnRange): boolean {
  if (!col) return false;
  const tol = col.tolerance ?? DEFAULT_COL_TOLERANCE;
  return Math.abs(item.x - col.x) <= tol;
}

/** Assign each item to at most one column (nearest x wins). */
export function bucketItemsToColumns(
  line: TextLine,
  cols: ColumnLayout
): Map<keyof ColumnLayout, PositionedItem[]> {
  const keys = Object.keys(cols) as (keyof ColumnLayout)[];
  const buckets = new Map<keyof ColumnLayout, PositionedItem[]>();
  for (const k of keys) buckets.set(k, []);

  for (const item of line.items) {
    let bestKey: keyof ColumnLayout | null = null;
    let bestDist = Infinity;
    for (const k of keys) {
      const col = cols[k];
      if (!col) continue;
      const dist = Math.abs(item.x - col.x);
      const tol = col.tolerance ?? DEFAULT_COL_TOLERANCE;
      if (dist <= tol && dist < bestDist) {
        bestDist = dist;
        bestKey = k;
      }
    }
    if (bestKey) buckets.get(bestKey)!.push(item);
  }
  return buckets;
}

export function amountFromBucket(
  buckets: Map<keyof ColumnLayout, PositionedItem[]>,
  key: keyof ColumnLayout
): number | null {
  const items = buckets.get(key) ?? [];
  for (const item of items) {
    const val = parseAmountToken(item.text);
    if (val !== null && Math.abs(val) >= 0.01) return val;
  }
  return null;
}

export function textFromBucket(
  buckets: Map<keyof ColumnLayout, PositionedItem[]>,
  key: keyof ColumnLayout
): string {
  return (buckets.get(key) ?? []).map((i) => i.text).join(" ").trim();
}

export function itemsInColumn(line: TextLine, col?: ColumnRange): PositionedItem[] {
  if (!col) return [];
  return line.items.filter((i) => itemNearColumn(i, col));
}

export function textInColumn(line: TextLine, col?: ColumnRange): string {
  return itemsInColumn(line, col)
    .map((i) => i.text)
    .join(" ")
    .trim();
}

export function amountInColumn(line: TextLine, col?: ColumnRange): number | null {
  const items = itemsInColumn(line, col);
  for (const item of items) {
    const val = parseAmountToken(item.text);
    if (val !== null && Math.abs(val) >= 0.01) return val;
  }
  return null;
}

export function isDateToken(text: string): boolean {
  const t = text.trim();
  // ISO first: findDateToken has always accepted YYYY-MM-DD, but this predicate
  // did not, so the header-anchored path (dateTokenInColumn) rejected every row
  // of an ISO-dated statement while the header itself matched fine.
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return true;
  return /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/.test(t);
}

/** DD Mon, DD Mon YY, or DD Mon YYYY (FNB, Standard Bank, and similar) */
export function isDMonDateToken(text: string): boolean {
  return /^\d{1,2}\s+[A-Za-z]{3,9}(?:\s+\d{2,4})?$/.test(text.trim());
}

export function isStatementDateToken(text: string): boolean {
  return isDateToken(text) || isDMonDateToken(text);
}

/**
 * FNB Amount/Balance token: comma thousands + optional Cr/Dr suffix.
 * Cr → positive (credit/in), no suffix or Dr → negative (debit/out).
 */
export function parseFnbAmountToken(raw: string): number | null {
  const t = raw.trim().replace(/\s+/g, "");
  if (!t) return null;
  const m = t.match(/^([\d,]+(?:\.\d{2})?)(Cr|Dr)?$/i);
  if (!m) return null;
  if (!m[2] && !/\.\d{2}$/.test(m[1])) return null;
  const num = parseAmountToken(m[1]);
  if (num === null) return null;
  const suffix = m[2]?.toLowerCase();
  if (suffix === "cr") return Math.abs(num);
  if (suffix === "dr") return -Math.abs(num);
  return -Math.abs(num);
}

export function fnbAmountFromBucket(
  buckets: Map<keyof ColumnLayout, PositionedItem[]>,
  key: keyof ColumnLayout
): number | null {
  const items = buckets.get(key) ?? [];
  for (const item of items) {
    const val = parseFnbAmountToken(item.text);
    if (val !== null && Math.abs(val) >= 0.01) return val;
  }
  return null;
}

export function fnbBalanceFromBucket(
  buckets: Map<keyof ColumnLayout, PositionedItem[]>,
  key: keyof ColumnLayout
): number | null {
  const items = buckets.get(key) ?? [];
  for (const item of items) {
    const val = parseFnbAmountToken(item.text);
    if (val !== null) return val;
  }
  return null;
}

export function dateTokenInColumn(line: TextLine, dateCol?: ColumnRange): string | null {
  for (const item of itemsInColumn(line, dateCol)) {
    if (isStatementDateToken(item.text)) return item.text.trim();
  }
  return null;
}

/**
 * Estimate the average glyph advance for this document.
 *
 * PDF text items carry a start x but no width, and money columns are RIGHT
 * aligned - so an item's start x moves left as the number gets longer. On a
 * real Discovery certified statement "R 199.00" starts at x=380 and
 * "R 349.99" at x=442 despite sitting in adjacent columns whose right edges
 * are 62pt apart: on start-x alone they are 62 apart too, but "R 9.99" in the
 * SAME column as the 380 one starts at 389, only 53 from the 442 credit. That
 * is inside DEFAULT_COL_TOLERANCE, which is how a credit gets read as a debit.
 *
 * Estimating a character width lets us compare right edges instead, where each
 * column is a tight cluster regardless of digit count. The estimate is taken
 * from the tightest observed packing between adjacent items on a line (a low
 * percentile, since most adjacent items have real whitespace between them).
 */
export function estimateCharWidth(lines: TextLine[], fallback = 4.5): number {
  const ratios: number[] = [];
  for (const line of lines) {
    const items = [...line.items].sort((a, b) => a.x - b.x);
    for (let i = 0; i < items.length - 1; i++) {
      const len = items[i].text.trim().length;
      const gap = items[i + 1].x - items[i].x;
      if (len >= 4 && gap > 0) ratios.push(gap / len);
    }
  }
  if (ratios.length < 5) return fallback;
  ratios.sort((a, b) => a - b);
  const w = ratios[Math.floor(ratios.length * 0.1)];
  return w >= 2 && w <= 12 ? w : fallback;
}

/** Approximate right edge of an item, for comparing right-aligned columns. */
export function itemRightEdge(item: PositionedItem, charWidth: number): number {
  return item.x + item.text.trim().length * charWidth;
}

export type InferredAmountColumns = {
  debitX?: number;
  creditX?: number;
  amountX?: number;
  balanceX?: number;
  /**
   * Set when the X values above are RIGHT-edge coordinates. Callers must pass
   * this to nearestItem so both sides of the comparison use the same space.
   */
  charWidth?: number;
};

/** Infer column boundaries from amount clusters, in right-edge space. */
export function inferAmountColumns(lines: TextLine[]): InferredAmountColumns {
  const charWidth = estimateCharWidth(lines);
  const edges: number[] = [];
  for (const line of lines) {
    for (const item of line.items) {
      if (parseAmountToken(item.text) !== null) {
        edges.push(itemRightEdge(item, charWidth));
      }
    }
  }
  if (edges.length === 0) return {};

  edges.sort((a, b) => a - b);
  const clusters: number[][] = [];
  for (const x of edges) {
    const last = clusters[clusters.length - 1];
    if (last && x - last[last.length - 1] < 40) last.push(x);
    else clusters.push([x]);
  }
  const centroids = clusters.map((c) => c.reduce((s, v) => s + v, 0) / c.length);

  if (centroids.length >= 3) {
    return {
      debitX: centroids[centroids.length - 3],
      creditX: centroids[centroids.length - 2],
      balanceX: centroids[centroids.length - 1],
      charWidth,
    };
  }
  if (centroids.length === 2) {
    return { amountX: centroids[0], balanceX: centroids[1], charWidth };
  }
  return { amountX: centroids[0], charWidth };
}

/**
 * Nearest amount item to a target x. When `charWidth` is given the comparison
 * is made on right edges (see estimateCharWidth); otherwise on start x, which
 * is correct for anchors taken from a left-aligned header label.
 */
export function nearestItem(
  items: PositionedItem[],
  targetX: number,
  tolerance = 55,
  charWidth?: number
): PositionedItem | null {
  const withAmount = items.filter((i) => parseAmountToken(i.text) !== null);
  if (withAmount.length === 0) return null;
  const pos = (i: PositionedItem) =>
    charWidth === undefined ? i.x : itemRightEdge(i, charWidth);
  const best = withAmount.reduce((b, item) =>
    Math.abs(pos(item) - targetX) < Math.abs(pos(b) - targetX) ? item : b
  );
  if (Math.abs(pos(best) - targetX) > tolerance) return null;
  return best;
}
