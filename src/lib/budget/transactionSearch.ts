/** Whole-budget transaction search. Matches statement text, references, categories, and amounts. */

export const TXN_SEARCH_MIN = 2;
export const TXN_SEARCH_LIMIT = 100;

export function normaliseTxnQuery(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

/** Strip PostgREST or-filter metacharacters so a reference cannot break the filter. */
export function sanitiseTxnQuery(raw: string): string {
  return normaliseTxnQuery(raw)
    .replace(/[%_,.()"\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseAmountQuery(raw: string): number | null {
  const cleaned = raw.replace(/[rR\s]/g, "").replace(/,/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100) / 100;
}

function quotedIlike(token: string): string {
  return `"%${token}%"`;
}

/**
 * One PostgREST `or` clause per token. Callers AND the clauses together so
 * "acme salary" matches a line that contains both words, not necessarily adjacent.
 */
export function budgetEntrySearchOrs(raw: string): string[] | null {
  const q = sanitiseTxnQuery(raw);
  const tokens = q.split(" ").filter((t) => t.length >= TXN_SEARCH_MIN);
  const amount = parseAmountQuery(raw);
  if (tokens.length === 0 && amount == null) return null;
  if (tokens.length === 0 && amount != null) return [`amount.eq.${amount}`];
  return tokens.map((token) => {
    const like = quotedIlike(token);
    const parts = [
      `description.ilike.${like}`,
      `account_label.ilike.${like}`,
      `category.ilike.${like}`,
    ];
    if (amount != null && tokens.length === 1) parts.push(`amount.eq.${amount}`);
    return parts.join(",");
  });
}

export function entryMatchesQuery(
  entry: {
    description?: string | null;
    category?: string | null;
    account_label?: string | null;
    amount?: number | null;
    type?: string | null;
  },
  raw: string,
  categoryLabel?: string,
): boolean {
  const q = normaliseTxnQuery(raw).toLowerCase();
  if (q.length < TXN_SEARCH_MIN && parseAmountQuery(raw) == null) return false;
  const hay = [
    entry.description ?? "",
    entry.category ?? "",
    categoryLabel ?? "",
    entry.account_label ?? "",
    entry.type ?? "",
  ].join(" ").toLowerCase();
  const tokens = q.split(" ").filter((t) => t.length >= TXN_SEARCH_MIN);
  const textHit = tokens.length > 0 && tokens.every((t) => hay.includes(t));
  const amount = parseAmountQuery(raw);
  const amountHit = amount != null && entry.amount != null && Math.abs(entry.amount - amount) < 0.005;
  if (tokens.length === 0) return amountHit;
  if (amount != null && /^\d/.test(q.replace(/[rR,\s]/g, ""))) return textHit || amountHit;
  return textHit;
}
