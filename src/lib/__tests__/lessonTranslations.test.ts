import { describe, it, expect, vi } from 'vitest';
import type { LessonStep } from '@/data/content';
vi.mock('@/i18n/stringZu', () => ({ localizeString: (locale: string, text: string) => `${locale}:${text}` }));
import { localizeLessonStep } from '@/i18n/lesson';
import { translationIssues } from '@/i18n/validation';

describe('complete lesson presentation translation', () => {
  const examples: LessonStep[] = [
    { type: 'info', title: 'Money', content: '<p>Save money.</p>' },
    { type: 'mcq', question: 'Which?', options: ['Save', 'Spend'], correct: 0, feedback: { correct: 'Yes', incorrect: 'Try again' }, conceptId: 'saving' },
    { type: 'scenario', title: 'A choice', question: 'Which?', content: '<p>Choose.</p>', options: ['Save', 'Spend'], correct: 1, explanation: 'Think ahead', feedback: { correct: 'Yes', incorrect: 'Try again' } },
    { type: 'true-false', statement: 'Save first', correct: true, feedback: { correct: 'Yes', incorrect: 'Try again' } },
    { type: 'fill-blank', title: 'Calculate', prompt: 'Save R___ per month', correct: 250, explanation: 'Divide by 4', feedback: { correct: 'Yes', incorrect: 'Try again' } },
    { type: 'action', title: 'Act', instruction: 'Check your balance', tip: 'Use your app' },
    { type: 'action-check', title: 'Act', challenge: 'Check your balance', successMessage: 'Done', skipMessage: 'Later' },
    { type: 'calculator-embed', title: 'Calculate', description: 'Explore growth', insight: 'Time matters', preset: { monthly: 500, rate: 8, frequency: 'monthly' } },
  ];
  it('covers every lesson type without mutating English or scoring fields', () => {
    const before = structuredClone(examples);
    for (const source of examples) {
      const result = localizeLessonStep(source, 'af');
      for (const [key, value] of Object.entries(source)) {
        if (key === 'type' || key === 'correct' || key === 'conceptId' || key === 'preset') expect(result[key as keyof LessonStep]).toEqual(value);
        else if (typeof value === 'string') expect((result as unknown as Record<string, unknown>)[key]).toBe(`af:${value}`);
      }
      if ('options' in result) expect(result.options).toEqual(['af:Save', 'af:Spend']);
      if ('feedback' in result && result.feedback) expect(result.feedback).toEqual({ correct: 'af:Yes', incorrect: 'af:Try again' });
    }
    expect(examples).toEqual(before);
  });
  it('keeps English unchanged and tolerates the completed-lesson boundary', () => {
    expect(localizeLessonStep(examples[0], 'en')).toBe(examples[0]);
    expect(localizeLessonStep(undefined, 'af')).toBeUndefined();
  });
  it('rejects translations that remove or duplicate an answer blank', () => {
    expect(translationIssues('Save R___ each month.', 'Spaar R elke maand.')).toContain('answer-blanks');
    expect(translationIssues('Save R___ each month.', 'Spaar R___ elke maand.')).toEqual([]);
  });
});
