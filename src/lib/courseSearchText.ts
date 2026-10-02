import type { Course, Lesson, LessonStep, QuestionSlot } from "@/data/content";
import { LOCALE_PACKS } from "@/i18n/localePacks";

function pushText(out: string[], value: unknown) {
  if (typeof value === "string" && value.trim()) out.push(value);
}

function collectStep(out: string[], step: LessonStep | undefined) {
  if (!step) return;
  if ("title" in step) pushText(out, step.title);
  if ("content" in step) pushText(out, step.content);
  if ("question" in step) pushText(out, step.question);
  if ("statement" in step) pushText(out, step.statement);
  if ("prompt" in step) pushText(out, step.prompt);
  if ("instruction" in step) pushText(out, step.instruction);
  if ("tip" in step) pushText(out, step.tip);
  if ("challenge" in step) pushText(out, step.challenge);
  if ("successMessage" in step) pushText(out, step.successMessage);
  if ("skipMessage" in step) pushText(out, step.skipMessage);
  if ("description" in step) pushText(out, step.description);
  if ("insight" in step) pushText(out, step.insight);
  if ("explanation" in step) pushText(out, step.explanation);
  if ("options" in step && Array.isArray(step.options)) {
    for (const option of step.options) pushText(out, option);
  }
  if ("feedback" in step && step.feedback) {
    pushText(out, step.feedback.correct);
    pushText(out, step.feedback.incorrect);
  }
}

function collectSlot(out: string[], slot: QuestionSlot) {
  for (const variant of slot.variants) collectStep(out, variant.step);
}

function collectLessonEnglish(lesson: Lesson): string[] {
  const out: string[] = [lesson.title];
  for (const step of lesson.steps ?? []) collectStep(out, step);
  for (const item of lesson.layout ?? []) {
    if ("slot" in item) continue;
    collectStep(out, item);
  }
  for (const slot of lesson.slots ?? []) collectSlot(out, slot);
  return out;
}

/**
 * English course copy plus every registered translation of that course.
 * Used by search so a query in any shipped language can hit the same course.
 */
export function courseSearchText(course: Course): string {
  const parts: string[] = [course.title, course.description ?? ""];

  for (const unit of course.units ?? []) {
    parts.push(unit.title, unit.description ?? "");
    for (const lesson of unit.lessons ?? []) {
      parts.push(...collectLessonEnglish(lesson));
    }
  }

  const english = parts.slice();
  for (const pack of LOCALE_PACKS) {
    parts.push(pack.content[`course.${course.id}`] ?? "");
    for (const unit of course.units ?? []) {
      parts.push(pack.content[`unit.${course.id}.${unit.id}`] ?? "");
      for (const lesson of unit.lessons ?? []) {
        parts.push(pack.content[`lesson.${course.id}.${lesson.id}`] ?? "");
      }
    }
    for (const source of english) {
      const translated = pack.strings[source];
      if (translated) parts.push(translated);
    }
  }

  return parts.filter(Boolean).join("\n");
}
