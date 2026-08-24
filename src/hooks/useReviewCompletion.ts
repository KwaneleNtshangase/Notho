"use client";

/**
 * useReviewCompletion
 *
 * One entry point for "the learner finished a spaced-repetition review",
 * shared by the two review surfaces (`components/ReviewSession` and the review
 * flow inside `views/LearnView`) so the streak rule lives in exactly one place.
 *
 * Reads the Notho context directly rather than through `useNotho()` so a review
 * screen rendered outside the provider degrades to a no-op instead of throwing
 * — a review that can't reach the provider should still let the learner finish
 * their cards, it just can't credit anything.
 */

import { useCallback, useContext } from "react";
import { NothoContext } from "@/context/NothoContext";
import { REVIEW_MIN_CARDS } from "@/lib/sync/mergeRules";

export type ReviewOutcome = {
  /** The session was long enough to count as a day's work. */
  counted: boolean;
  /** A qualifying session had already been credited today. */
  alreadyCountedToday: boolean;
  xpAwarded: number;
  /** Cards needed for a session to count — for an honest "not yet" message. */
  cardsRequired: number;
};

export const NOT_COUNTED: ReviewOutcome = {
  counted: false,
  alreadyCountedToday: false,
  xpAwarded: 0,
  cardsRequired: REVIEW_MIN_CARDS,
};

export function useReviewCompletion(): (input: {
  cards: number;
  correct: number;
}) => ReviewOutcome {
  const ctx = useContext(NothoContext);
  return useCallback(
    (input: { cards: number; correct: number }) => {
      if (!ctx?.completeReviewSession) return NOT_COUNTED;
      return ctx.completeReviewSession(input);
    },
    [ctx]
  );
}
