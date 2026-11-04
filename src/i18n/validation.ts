/** Structural checks are not linguistic or cultural validation. */
export function translationIssues(source: string, value: unknown): string[] {
  if (typeof value !== 'string' || !value.trim()) return ['empty-or-invalid'];
  const issues: string[] = [];
  const tokens = (s: string, re: RegExp, ordered = false) => {
    const found = s.match(re) ?? [];
    return (ordered ? found : found.sort()).join('|');
  };
  if (tokens(source, /\{[^{}]+\}/g) !== tokens(value, /\{[^{}]+\}/g)) issues.push('placeholders');
  if (tokens(source, /_{3,}/g) !== tokens(value, /_{3,}/g)) issues.push('answer-blanks');
  if (tokens(source, /<[^>]+>/g, true) !== tokens(value, /<[^>]+>/g, true)) issues.push('markup');
  // Placeholder indices are identifiers, not displayed quantities. Word order
  // may move {value1} before {value0} without changing either numeric value.
  const literalNumbers = (text: string) => tokens(text.replace(/\{[^{}]+\}/g, ''), /\d+(?:[.,/]\d+)*(?:%|\+)?/g, true);
  if (literalNumbers(source) !== literalNumbers(value)) issues.push('numbers');
  for (const brand of ['Notho', 'Cosmo', 'Google', 'Apple', 'Facebook', 'LinkedIn', 'WhatsApp', 'Chrome', 'Safari', 'SARS', 'TFSA', 'XP',
    'Capitec', 'FNB', 'Absa', 'ABSA', 'Standard Bank', 'Nedbank', 'TymeBank', 'Discovery', 'EasyEquities', 'Satrix', 'Sygnia', 'RSA Retail Bonds']) {
    if (source.includes(brand) && !value.includes(brand)) issues.push(`brand:${brand}`);
  }
  for (const language of ['Afrikaans', 'isiNdebele', 'isiXhosa', 'isiZulu', 'Sepedi', 'Sesotho', 'Setswana', 'siSwati', 'Tshivenda', 'Xitsonga']) {
    if (source.includes(language) && !value.includes(language)) issues.push(`language-name:${language}`);
  }
  // This app uses simple {name} interpolation, not ICU syntax. Reject unsupported
  // plural/select messages instead of showing partially substituted instructions.
  if (/\{[^{}]+,\s*(plural|select|selectordinal)\s*,/.test(value)) issues.push('unsupported-icu');
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u202a-\u202e\u2066-\u2069]/.test(value)) issues.push('control-characters');
  return issues;
}

export function usableTranslation(source: string, value: unknown): value is string {
  return translationIssues(source, value).length === 0;
}

/** Stricter preparation for generated checkpoints only. Existing human and
 * legacy stores are never normalised or rewritten by this function. */
export function prepareGeneratedDraft(source: string, translation: unknown) {
  let value = typeof translation === 'string'
    ? (source.match(/^\s*/)?.[0] ?? '') + translation.trim().replace(/—/g, ', ') + (source.match(/\s*$/)?.[0] ?? '')
    : translation;
  if (typeof value === 'string') {
    const numbers = (text: string) => text.replace(/\{[^{}]+\}/g, '').match(/\d+(?:[.,/]\d+)*(?:%|\+)?/g) ?? [];
    const original = numbers(source), generated = numbers(value);
    // Restore the source's decimal separator only when every numeric token
    // aligns. Three-digit groups, reordered values and changed digits remain
    // rejects. This normalises generated drafts only, never reviewer wording.
    if (original.length === generated.length && original.every((token, i) => token === generated[i]
      || /^\d+\.\d{1,2}(?:%|\+)?$/.test(token) && generated[i] === token.replace('.', ','))) {
      let index = 0;
      value = value.replace(/\{[^{}]+\}|\d+(?:[.,/]\d+)*(?:%|\+)?/g, token => token.startsWith('{') ? token : original[index++]);
    }
  }
  const issues = translationIssues(source, value);
  if (typeof value === 'string' && (source.match(/\n/g) ?? []).length !== (value.match(/\n/g) ?? []).length) issues.push('line-breaks');
  if (typeof value === 'string' && /ZXQ\s*\d+\s*ZXQ|(?:^|\n)\[\d{5}\]/i.test(value)) issues.push('batch-marker');
  return { value, issues };
}

export type ReviewedEntry = {
  source: string;
  translation: string;
  status: 'approved';
  reviewer: string;
  reviewedAt: string;
};
export type ReviewedPacks = Record<string, Record<string, ReviewedEntry>>;

export function resolveTranslation(
  source: string,
  approved: ReviewedEntry | undefined,
  legacy: unknown,
  draft: unknown,
): string {
  if (approved?.status === 'approved' && approved.source === source
    && typeof approved.reviewer === 'string' && approved.reviewer.trim()
    && typeof approved.reviewedAt === 'string' && Number.isFinite(Date.parse(approved.reviewedAt))
    && usableTranslation(source, approved.translation)) return approved.translation;
  if (usableTranslation(source, legacy)) return legacy;
  if (usableTranslation(source, draft)) return draft;
  return source;
}
