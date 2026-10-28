import { contentZu } from "./contentZu";
import { stringZu } from "./stringZu";

/**
 * Every non-English pack the course search should honour.
 *
 * Add a language by appending a pack. Search reads these objects at index
 * time, so an edit to a title or a lesson string is picked up without a
 * separate word list. Content keys must stay `course.{id}`,
 * `unit.{courseId}.{unitId}`, `lesson.{courseId}.{lessonId}`. String maps
 * must stay English source → translation, same as localizeString.
 */
export type LocalePack = {
  locale: string;
  content: Record<string, string>;
  strings: Record<string, string>;
};

export const LOCALE_PACKS: LocalePack[] = [
  { locale: "zu", content: contentZu, strings: stringZu },
];
