import type { Locale } from './locales';
import english from './english.json';
import legacyZu from './legacyZuMessages.json';
import draftSource from './drafts/source.json';
import { draftMessages } from './drafts';
import approved from './reviewed/overrides.json';
import holds from './drafts/holds.json';
import { resolveTranslation, type ReviewedPacks } from './validation';

// The original isiZulu wording is retained verbatim, independently of generated
// drafts. Its historical provenance is not relabelled as human-approved.
export const messages = { en: english, zu: legacyZu };
export type MessageKey = keyof typeof english;

export function translate(locale: Locale, key: MessageKey, vars?: Record<string, string | number>): string {
  const source: string = english[key] ?? key;
  const out = locale === 'en' ? source : resolveTranslation(
    source,
    (approved as ReviewedPacks)[locale]?.[`messages:${key}`],
    locale === 'zu' ? (legacyZu as Record<string, string>)[key] : undefined,
    !(holds as Record<string, Record<string, string>>)[locale]?.[`messages:${key}`] && draftSource[key] === source ? draftMessages[locale]?.[key] : undefined,
  );
  // Single pass: a user-supplied value containing another placeholder stays literal.
  return out.replace(/\{(\w+)\}/g, (token, name: string) =>
    vars && Object.hasOwn(vars, name) ? String(vars[name]) : token);
}
