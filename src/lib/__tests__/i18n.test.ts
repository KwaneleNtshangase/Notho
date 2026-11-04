import { describe, expect, it } from "vitest";
import { translate } from "@/i18n/messages";
import { localizeContent } from "@/i18n/contentZu";
import { localizeString } from "@/i18n/stringZu";

describe("isiZulu corrections", () => {
  it("uses preferred chrome", () => {
    expect(translate("zu", "common.next")).toBe("Okulandelayo");
    expect(translate("zu", "common.skip")).toBe("Yeqa okwamanje");
    expect(translate("zu", "lesson.backToCourse")).toBe("Buyela kwikhosi");
  });

  it("uses preferred shopping title and money lesson copy", () => {
    expect(localizeContent("zu", "unit.money-basics.unit-2", "Smart Shopping")).toBe(
      "Ukuthenga okuhlakaniphile"
    );
    expect(localizeString("zu", "Money is More Than Cash")).toBe("Imali akuyona nje ukheshi");
    expect(localizeString("zu", "Money Is More Than Cash")).toBe("Imali akuyona nje ukheshi");
    expect(localizeString("zu", "Not translated yet")).toBe("Not translated yet");
  });
});

import { LOCALES, LOCALE_NAMES, parseLocale } from '@/i18n/locales';
import english from '@/i18n/english.json';
import { draftMessages } from '@/i18n/drafts';
import { resolveTranslation, translationIssues, type ReviewedEntry } from '@/i18n/validation';
import { mergeReviews } from '@/i18n/review';
import { LOCALE_PACKS } from '@/i18n/localePacks';

const approval: ReviewedEntry = { source: 'Next', translation: 'Volgende stap', status: 'approved', reviewer: 'Test fixture only', reviewedAt: '2026-10-23' };

describe('South African beta locales', () => {
  it('keeps English default and excludes SASL from text packs', () => {
    expect(LOCALES).toHaveLength(11);
    expect(parseLocale(undefined)).toBe('en');
    expect(parseLocale('sasl')).toBe('en');
    expect(parseLocale('nd')).toBe('en'); // nr is Southern Ndebele, not Northern Ndebele.
    expect(LOCALE_NAMES.ts).toBe("Xitsonga");
    expect(translate('en', 'nav.learn')).toBe('Learn');
  });
  it.each(LOCALES.filter(locale => locale !== 'en'))('%s has structurally valid drafts for the full shared catalog', locale => {
    expect(Object.keys(draftMessages[locale]!).sort()).toEqual(Object.keys(english).sort());
    for (const [key, source] of Object.entries(english)) {
      expect(translationIssues(source, draftMessages[locale]![key]), key).toEqual([]);
    }
    expect(translate(locale, 'nav.learn')).not.toBe('Learn');
    expect(localizeContent(locale, 'course.money-basics', 'Money Basics')).not.toBe('Money Basics');
    expect(localizeString(locale, 'Untranslated sentence')).toBe('Untranslated sentence');
    expect(localizeContent(locale, 'missing', 'English title')).toBe('English title');
    expect(localizeString(locale, null)).toBe('');
  });
  it('gives approved corrections priority, preserves legacy, and ignores stale source approvals', () => {
    expect(resolveTranslation('Next', approval, 'Legacy', 'Draft')).toBe('Volgende stap');
    expect(resolveTranslation('Next', undefined, 'Legacy', 'Draft')).toBe('Legacy');
    expect(resolveTranslation('Changed source', approval, undefined, undefined)).toBe('Changed source');
    expect(resolveTranslation('Next', { ...approval, status: 'needs-review' } as unknown as ReviewedEntry, undefined, 'Draft')).toBe('Draft');
  });
  it('falls back for empty, invalid, broken placeholders, formatting and unsupported plurals', () => {
    for (const value of ['', ' ', null, 12, {}, 'Hallo', 'Hallo {other}']) {
      expect(resolveTranslation('Hello {name}', undefined, undefined, value)).toBe('Hello {name}');
    }
    expect(translationIssues('<strong>Notho {count}</strong>', '<b>Notho {count}</b>')).toContain('markup');
    expect(translationIssues('8 characters', '6 karakters')).toContain('numbers');
    expect(translationIssues('3–20 chars', '20–3 karakters')).toContain('numbers');
    expect(resolveTranslation('Next', { ...approval, reviewer: 3 } as unknown as ReviewedEntry, undefined, undefined)).toBe('Next');
    expect(translationIssues('Continue with Google', 'Gaan voort')).toContain('brand:Google');
    expect(translationIssues('{count, plural, one {day} other {days}}', '{count, plural, one {dag} other {dae}}')).toContain('unsupported-icu');
    expect(resolveTranslation('3–20 chars', undefined, undefined, '3–20 karakters')).toBe('3–20 karakters');
  });
  it('holds uncertain drafts in English pending approved correction', () => {
    expect(localizeContent('ts', 'course.credit-debt', 'Credit & Debt')).toBe('Credit & Debt');
  });
  it('makes every language searchable through the existing pack registry', () => {
    expect(LOCALE_PACKS.map(pack => pack.locale)).toEqual(LOCALES.filter(locale => locale !== 'en'));
    expect(LOCALE_PACKS.find(pack => pack.locale === 'af')?.content['course.money-basics']).toBe('Geldbeginsels');
  });
});

describe('review import protection', () => {
  const sources = { 'messages:common.next': 'Next' };
  const row = { ...approval, locale: 'af', key: 'messages:common.next' };
  it('merges without deleting or mutating existing approvals', () => {
    const current = { zu: { 'messages:common.next': { ...approval, translation: 'Okulandelayo' } } };
    const next = mergeReviews(current, [row], sources);
    expect(next.zu).toEqual(current.zu);
    expect(next.af['messages:common.next'].translation).toBe('Volgende stap');
    expect(current).not.toHaveProperty('af');
  });
  it('rejects unapproved, stale, unknown, duplicate and conflicting changes atomically', () => {
    expect(() => mergeReviews({}, [{ ...row, status: 'needs-review' }], sources)).toThrow('Explicit approval');
    expect(() => mergeReviews({}, [{ ...row, reviewer: '' }], sources)).toThrow('Explicit approval');
    expect(() => mergeReviews({}, [{ ...row, source: 'Old source' }], sources)).toThrow('changed English');
    expect(() => mergeReviews({}, [{ ...row, locale: 'sasl' }], sources)).toThrow('locale');
    expect(() => mergeReviews({}, [row, row], sources)).toThrow('Duplicate');
    const current = mergeReviews({}, [row], sources);
    expect(() => mergeReviews(current, [{ ...row, translation: 'Ander' }], sources)).toThrow('protected');
    expect(mergeReviews(current, [{ ...row, translation: 'Ander' }], sources, true).af[row.key].translation).toBe('Ander');
  });
});
