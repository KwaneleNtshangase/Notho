import type { LessonStep } from '@/data/content';
import { localizeString } from './stringZu';

/** Translate only presentation fields. IDs, answer indexes, booleans and
 * calculator presets remain the original values used by scoring and storage. */
export function localizeLessonStep<T extends LessonStep | undefined>(step: T, locale: string): T {
  if (!step || locale === 'en') return step;
  const output: Record<string, unknown> = { ...step };
  for (const field of ['title', 'content', 'question', 'statement', 'prompt', 'instruction',
    'tip', 'challenge', 'successMessage', 'skipMessage', 'description', 'insight', 'explanation']) {
    if (typeof output[field] === 'string') output[field] = localizeString(locale, output[field] as string);
  }
  if ('options' in step) output.options = step.options.map(text => localizeString(locale, text));
  if ('feedback' in step && step.feedback) output.feedback = {
    correct: localizeString(locale, step.feedback.correct),
    incorrect: localizeString(locale, step.feedback.incorrect),
  };
  return output as T;
}
