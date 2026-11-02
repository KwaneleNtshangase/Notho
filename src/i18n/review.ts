import { isLocale } from './locales';
import { translationIssues, type ReviewedEntry, type ReviewedPacks } from './validation';

export type ReviewRow = {
  locale: string; key: string; source: string; translation: string;
  status: string; reviewer?: string; reviewedAt?: string;
};

/** Pure, all-or-nothing merge. Existing approvals require explicit replacement. */
export function mergeReviews(current: ReviewedPacks, rows: ReviewRow[], sources: Record<string, string>, replace = false): ReviewedPacks {
  if (!Array.isArray(rows) || rows.length === 0) throw new Error('Expected a non-empty review array.');
  const merged: ReviewedPacks = structuredClone(current);
  const seen = new Set<string>();
  for (const row of rows) {
    if (!row || !isLocale(row.locale) || row.locale === 'en') throw new Error('Invalid review locale.');
    if (!Object.hasOwn(sources, row.key) || sources[row.key] !== row.source) throw new Error(`Unknown or changed English source: ${row.key}`);
    if (row.status !== 'approved' || !row.reviewer?.trim() || !row.reviewedAt || !/^\d{4}-\d{2}-\d{2}$/.test(row.reviewedAt) || !Number.isFinite(Date.parse(row.reviewedAt))) {
      throw new Error(`Explicit approval, reviewer and YYYY-MM-DD review date required: ${row.key}`);
    }
    const issues = translationIssues(row.source, row.translation);
    if (issues.length) throw new Error(`${row.key}: ${issues.join(', ')}`);
    const identity = `${row.locale}:${row.key}`;
    if (seen.has(identity)) throw new Error(`Duplicate review: ${identity}`);
    seen.add(identity);
    merged[row.locale] ??= {};
    const entry: ReviewedEntry = { source: row.source, translation: row.translation, status: 'approved', reviewer: row.reviewer, reviewedAt: row.reviewedAt };
    const existing = merged[row.locale][row.key];
    if (existing && JSON.stringify(existing) !== JSON.stringify(entry) && !replace) throw new Error(`Existing approval protected: ${identity}. Use --replace only after reviewing the change.`);
    merged[row.locale][row.key] = entry;
  }
  return merged;
}
