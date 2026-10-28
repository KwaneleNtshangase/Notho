/**
 * fuzzySearch.ts — Zero-dependency weighted fuzzy search engine for the course directory.
 *
 * Exports:
 *   levenshtein(a, b, maxDist?)   – optimised single-row DP
 *   simpleStem(word)              – lightweight English suffix stripper
 *   buildSearchIndex(courses, concepts) – one-time index builder
 *   fuzzySearch(query, index)     – weighted, ranked search
 *   getSuggestion(query, index)   – "Did you mean?" fallback
 */

import type { Course } from "@/data/content";
import type { Concept } from "@/data/concepts";
import { courseSearchText } from "@/lib/courseSearchText";

// ─── Types ───────────────────────────────────────────────────────────────────

export type IndexEntry = {
  courseId: string;
  title: string;
  description: string;
  titleTokens: string[];
  tagTokens: string[];
  descTokens: string[];
  /** Tokens from every locale pack: titles, lesson copy, and translations. */
  localeTokens: string[];
};

export type FuzzySearchResult = {
  courseId: string;
  score: number;
  matchedField: "title" | "tag" | "description";
};

// ─── Levenshtein Distance ────────────────────────────────────────────────────
// Single-row DP — O(min(m,n)) space, O(m·n) time.
// Early exit when the minimum possible distance exceeds maxDist.

export function levenshtein(a: string, b: string, maxDist = Infinity): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  // Ensure b is the shorter string for space efficiency
  if (a.length < b.length) [a, b] = [b, a];

  const bLen = b.length;
  const row = Array.from({ length: bLen + 1 }, (_, i) => i);

  for (let i = 1; i <= a.length; i++) {
    let prev = i;
    let rowMin = prev;

    for (let j = 1; j <= bLen; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const val = Math.min(
        row[j] + 1,      // deletion
        prev + 1,         // insertion
        row[j - 1] + cost // substitution
      );
      row[j - 1] = prev;
      prev = val;
      if (val < rowMin) rowMin = val;
    }
    row[bLen] = prev;

    // Early exit: if the minimum value in this row already exceeds maxDist,
    // the final distance will only be >= rowMin.
    if (rowMin > maxDist) return rowMin;
  }
  return row[bLen];
}

// ─── Lightweight Stemmer ─────────────────────────────────────────────────────
// Strips common English suffixes used in financial vocabulary.
// Not a full Porter stemmer — just enough for the domain.

const SUFFIX_RULES: [RegExp, string][] = [
  [/ies$/i, "y"],       // e.g. "strategies" → "strategy"
  [/ness$/i, ""],        // e.g. "awareness" → "aware"
  [/ment$/i, ""],        // e.g. "investment" → "invest"
  [/tion$/i, ""],        // e.g. "protection" → "protect"
  [/sion$/i, ""],        // e.g. "pension" → "pen" (acceptable)
  [/able$/i, ""],        // e.g. "insurable" → "insur"
  [/ible$/i, ""],        // e.g. "deductible" → "deduct"
  [/ous$/i, ""],         // e.g. "dangerous" → "danger"
  [/ive$/i, ""],         // e.g. "progressive" → "progress"
  [/ful$/i, ""],         // e.g. "careful" → "care"
  [/less$/i, ""],        // e.g. "careless" → "care"
  [/ing$/i, ""],         // e.g. "investing" → "invest"
  [/ting$/i, "t"],       // e.g. "budgeting" → "budget" (applied after -ing)
  [/ed$/i, ""],          // e.g. "insured" → "insur"
  [/(?<=[a-z])er$/i, ""],  // e.g. "lender" → "lend"  (requires preceding letter)
  [/([a-z])\1est$/i, ""],  // e.g. "biggest" → "bigg" (only doubled-consonant superlatives)
  [/ly$/i, ""],          // e.g. "monthly" → "month"
  [/s$/i, ""],           // e.g. "taxes" → "taxe" (further cleaning via min length)
];

export function simpleStem(word: string): string {
  let w = word.toLowerCase();
  if (w.length <= 3) return w; // Too short to stem

  for (const [pattern, replacement] of SUFFIX_RULES) {
    const result = w.replace(pattern, replacement);
    // Only accept the stem if it's at least 3 characters
    if (result !== w && result.length >= 3) {
      w = result;
      break; // Apply only the first matching rule
    }
  }
  return w;
}

// ─── Tokeniser ───────────────────────────────────────────────────────────────

function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 2)
    .map(simpleStem);
}

// ─── Index Builder ───────────────────────────────────────────────────────────

export function buildSearchIndex(
  courses: Course[],
  concepts: readonly Concept[]
): IndexEntry[] {
  // Pre-compute concept → course mapping
  const courseConceptMap = new Map<string, string[]>();
  for (const concept of concepts) {
    for (const courseId of concept.courses) {
      const existing = courseConceptMap.get(courseId) ?? [];
      // Tokenise concept name + category
      const tokens = tokenise(`${concept.name} ${concept.category}`);
      existing.push(...tokens);
      courseConceptMap.set(courseId, existing);
    }
  }

  return courses.map((course) => ({
    courseId: course.id,
    title: course.title,
    description: course.description ?? "",
    titleTokens: tokenise(course.title),
    tagTokens: [...new Set(courseConceptMap.get(course.id) ?? [])],
    descTokens: tokenise(course.description ?? ""),
    localeTokens: [...new Set(tokenise(courseSearchText(course)))],
  }));
}

// ─── Fuzzy Search ────────────────────────────────────────────────────────────

const FIELD_WEIGHTS = { title: 3, tag: 2, description: 1 } as const;
const MIN_SCORE_THRESHOLD = 0.3;

function scoreToken(
  queryToken: string,
  targetTokens: string[]
): number {
  let best = 0;

  for (const target of targetTokens) {
    // Exact match
    if (queryToken === target) return 1.0;

    // Prefix match (either direction)
    if (target.startsWith(queryToken) || queryToken.startsWith(target)) {
      const overlap = Math.min(queryToken.length, target.length) / Math.max(queryToken.length, target.length);
      const score = 0.85 * overlap;
      if (score > best) best = score;
      continue;
    }

    // Fuzzy match — adaptive threshold
    const maxDist = queryToken.length > 5 ? 2 : 1;
    const dist = levenshtein(queryToken, target, maxDist);
    if (dist <= maxDist) {
      const score = dist === 1 ? 0.6 : 0.35;
      if (score > best) best = score;
    }
  }

  return best;
}

export function fuzzySearch(
  query: string,
  index: IndexEntry[]
): FuzzySearchResult[] {
  const queryTokens = tokenise(query);
  if (queryTokens.length === 0) return [];

  const results: FuzzySearchResult[] = [];

  for (const entry of index) {
    let totalScore = 0;
    let bestField: "title" | "tag" | "description" = "title";
    let bestFieldScore = 0;

    for (const qt of queryTokens) {
      const titleScore = scoreToken(qt, entry.titleTokens) * FIELD_WEIGHTS.title;
      const tagScore = scoreToken(qt, entry.tagTokens) * FIELD_WEIGHTS.tag;
      const localeScore = scoreToken(qt, entry.localeTokens) * FIELD_WEIGHTS.tag;
      const descScore = scoreToken(qt, entry.descTokens) * FIELD_WEIGHTS.description;

      const maxFieldScore = Math.max(titleScore, tagScore, localeScore, descScore);
      totalScore += maxFieldScore;

      if (titleScore === maxFieldScore && titleScore > bestFieldScore) {
        bestField = "title";
        bestFieldScore = titleScore;
      } else if (tagScore === maxFieldScore && tagScore > bestFieldScore) {
        bestField = "tag";
        bestFieldScore = tagScore;
      } else if (localeScore === maxFieldScore && localeScore > bestFieldScore) {
        bestField = "tag";
        bestFieldScore = localeScore;
      } else if (descScore > bestFieldScore) {
        bestField = "description";
        bestFieldScore = descScore;
      }
    }

    // Average across query tokens to normalise multi-word queries
    const avgScore = totalScore / queryTokens.length;

    if (avgScore >= MIN_SCORE_THRESHOLD) {
      results.push({
        courseId: entry.courseId,
        score: avgScore,
        matchedField: bestField,
      });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);
  return results;
}

// ─── "Did you mean?" Suggestion ──────────────────────────────────────────────

export function getSuggestion(
  query: string,
  index: IndexEntry[]
): string | null {
  const queryTokens = tokenise(query);
  if (queryTokens.length === 0) return null;

  // Build vocabulary from all index entries
  const vocab = new Set<string>();
  for (const entry of index) {
    for (const t of entry.titleTokens) vocab.add(t);
    for (const t of entry.tagTokens) vocab.add(t);
    for (const t of entry.descTokens) vocab.add(t);
    for (const t of entry.localeTokens) vocab.add(t);
  }
  const vocabArray = [...vocab];

  let corrected = false;
  const correctedTokens = queryTokens.map((qt) => {
    // If this token already exists in vocab, keep it
    if (vocab.has(qt)) return qt;

    // Find closest match within edit distance 3
    let bestWord = qt;
    let bestDist = 4; // anything > 3 means no match

    for (const word of vocabArray) {
      const dist = levenshtein(qt, word, 3);
      if (dist < bestDist) {
        bestDist = dist;
        bestWord = word;
      }
    }

    if (bestDist <= 3 && bestWord !== qt) {
      corrected = true;
      return bestWord;
    }
    return qt;
  });

  if (!corrected) return null;
  return correctedTokens.join(" ");
}
