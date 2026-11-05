import { beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { installCatalog, catalogString, catalogTemplate } from '@/i18n/catalog';
import { LocalizedElement, LocalizedText, LocalizedRichText } from '@/i18n/LocalizedText';
import { localizeString } from '@/i18n/stringZu';
import { localizeContent } from '@/i18n/contentZu';
import { translationIssues } from '@/i18n/validation';

vi.mock('@/i18n/LocaleProvider', () => ({ useLocale: () => ({ locale: 'af' }) }));
beforeEach(() => installCatalog('af', {}));

describe('bulk draft presentation', () => {
  it('translates a whole emphasized sentence and preserves its original link', () => {
    const source = 'We do <strong0>not</strong0> sell data. Read <a1>our policy</a1>.';
    installCatalog('af', { [source]: 'Ons verkoop <strong0>nie</strong0> data nie. Lees <a1>ons beleid</a1>.' });
    const result = renderToStaticMarkup(React.createElement(LocalizedRichText, { source, elements: [React.createElement('strong'), React.createElement('a', { href: '/privacy' })] }));
    expect(result).toBe('Ons verkoop <strong>nie</strong> data nie. Lees <a href="/privacy">ons beleid</a>.');
    installCatalog('af', { [source]: '<script>alert(1)</script>' });
    expect(renderToStaticMarkup(React.createElement(LocalizedRichText, { source, elements: [React.createElement('strong'), React.createElement('a', { href: '/privacy' })] }))).toContain('We do <strong>not</strong> sell data.');
  });
  it('rejects invalid placeholders, numbers and blanks without losing English fallback', () => {
    installCatalog('af', { 'Save {amount}': 'Spaar {cash}', 'Save 10%': 'Spaar 20%', 'Enter ___': 'Vul in', 'Try again': 'Probeer weer' });
    expect(catalogString('af', 'Save 10%')).toBeUndefined();
    expect(localizeString('af', 'Save {amount}')).toBe('Save {amount}');
    expect(localizeString('af', 'Enter ___')).toBe('Enter ___');
    expect(localizeString('af', 'Try again')).toBe('Probeer weer');
  });
  it('keeps existing wording and review holds ahead of bulk drafts', () => {
    installCatalog('zu', { 'Money is More Than Cash': 'Replacement draft' });
    expect(localizeString('zu', 'Money is More Than Cash')).toBe('Imali akuyona nje ukheshi');
    installCatalog('ts', { 'Credit & Debt': 'Replacement draft' });
    expect(localizeContent('ts', 'course.credit-debt', 'Credit & Debt')).toBe('Credit & Debt');
  });
  it('uses a full template and keeps numeric substitutions unchanged', () => {
    installCatalog('af', { 'Completed {value0} of {value1} lessons': '{value0} van {value1} lesse voltooi' });
    expect(catalogTemplate('af', 'Completed 2 of 10 lessons')).toBe('2 van 10 lesse voltooi');
    expect(catalogTemplate('af', 'An unrelated sentence')).toBeUndefined();
  });
  it('does not translate user supplied names in a template', () => {
    installCatalog('af', { 'Hello {value0}': 'Hallo {value0}', 'Hope': 'Hoop' });
    expect(renderToStaticMarkup(React.createElement(LocalizedText, { source: 'Hello {value0}', values: ['Hope'], preserveValues: [true] }))).toBe('Hallo Hope');
  });
  it('does not mistake a word inside untranslated prose for a complete translated phrase', () => {
    installCatalog('af', {
      '{value0} year{value1}': '{value0} jaar{value1}',
      '{value0} years': '{value0} jaar',
      'Completed {value0} of {value1} lessons': '{value0} van {value1} lesse voltooi',
    });
    expect(catalogTemplate('af', '<p>Invest for 10 years to reach your goal.</p>')).toBeUndefined();
    expect(catalogTemplate('af', '1 year ago')).toBeUndefined();
    expect(catalogTemplate('af', '7-15 year horizon: gradually reduce risk.')).toBeUndefined();
    expect(catalogTemplate('af', '10 years')).toBe('10 jaar');
    expect(catalogTemplate('af', 'Completed 2 of 10 lessons')).toBe('2 van 10 lesse voltooi');
  });
  it('allows reordered placeholder identifiers while still checking literal quantities', () => {
    expect(translationIssues('{value0} belongs to {value1}', '{value1} besit {value0}')).toEqual([]);
    expect(translationIssues('Between 3 and 20', 'Tussen 20 en 3')).toContain('numbers');
  });
  it('uses whole singular and plural phrases for zero, one and two', () => {
    installCatalog('af', { '{value0} day': '{value0} dag', '{value0} days': '{value0} dae' });
    for (const [count, expected] of [[0, '0 dae'], [1, '1 dag'], [2, '2 dae']] as const) {
      expect(renderToStaticMarkup(React.createElement(LocalizedText, { source: '{value0} days', one: '{value0} day', count, values: [count] }))).toBe(expected);
    }
  });
  it('translates mixed numeric option labels without changing submitted values', () => {
    installCatalog('af', { '{value0} XP / day': '{value0} XP / dag' });
    const result = renderToStaticMarkup(React.createElement(LocalizedElement, { as: 'option', value: 25 }, 25, ' XP / day'));
    expect(result).toBe('<option value="25">25 XP / dag</option>');
  });
  it('translates accessibility labels while preserving form values and option IDs', () => {
    installCatalog('af', { 'Monthly income': 'Maandelikse inkomste', 'Savings': 'Spaargeld' });
    const input = renderToStaticMarkup(React.createElement(LocalizedElement, { as: 'input', 'aria-label': 'Monthly income', defaultValue: 'Savings' }));
    expect(input).toContain('aria-label="Maandelikse inkomste"');
    expect(input).toContain('value="Savings"');
    expect(renderToStaticMarkup(React.createElement(LocalizedElement, { as: 'option' }, 'Savings'))).toBe('<option value="Savings">Spaargeld</option>');
  });
});
