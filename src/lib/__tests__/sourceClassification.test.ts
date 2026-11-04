import { describe, expect, it } from 'vitest';
import { preservedSourceReason } from '@/i18n/sourceClassification';
import { prepareGeneratedDraft } from '@/i18n/validation';

describe('source preservation without claiming translation', () => {
  it('keeps literal brands, formatted amounts and mathematical notation', () => {
    for (const source of ['Notho', 'RSA Retail Bonds', 'Satrix MSCI World ETF', 'IT3(b)', 'R1 000', ' (+{value0} XP)',
      '{value0} → {value1}', '27.5% × R400 000 = R110 000.', 'FV = P × (1 + r/n)^(n×t)', 'Aa']) {
      expect(preservedSourceReason(source), source).toBeDefined();
    }
  });
  it('does not excuse untranslated financial statements, count labels or months', () => {
    for (const source of ['Notho will read lessons to you.', 'Save R1 000', 'SARS requires a return',
      '2 lessons', '{count} lessons', 'Jan', 'Bank', 'Interest', 'R1 000 per month', 'Individual JSE shares via EasyEquities',
      '<span title="Annual interest">R1 000</span>',
      'Maturity is in {value0} years.', '{count, plural, one {lesson} other {lessons}}']) {
      expect(preservedSourceReason(source), source).toBeUndefined();
    }
  });
});

describe('generated draft preparation', () => {
  it('restores aligned decimal formatting without guessing grouping or changed values', () => {
    expect(prepareGeneratedDraft('Pay R177.12 for {value0}.', 'Betaal R177,12 vir {value0}.')).toEqual({ value: 'Betaal R177.12 vir {value0}.', issues: [] });
    expect(prepareGeneratedDraft('Pay R177.12.', 'Betaal R178,12.').issues).toContain('numbers');
    expect(prepareGeneratedDraft('Pay R1,000.', 'Betaal R1.000.').issues).toContain('numbers');
    expect(prepareGeneratedDraft('Rates: 3.5% then 8.25%.', 'Koerse: 8,25% dan 3,5%.').issues).toContain('numbers');
  });
  it('makes planning and compilation reject lost paragraph breaks and batch markers', () => {
    expect(prepareGeneratedDraft('Save\nContinue', 'Spaar Gaan voort').issues).toContain('line-breaks');
    expect(prepareGeneratedDraft('Continue', 'ZXQ0001ZXQ Gaan voort').issues).toContain('batch-marker');
    expect(prepareGeneratedDraft('  Save\nContinue  ', 'Spaar\nGaan voort\n')).toEqual({ value: '  Spaar\nGaan voort  ', issues: [] });
  });
});
