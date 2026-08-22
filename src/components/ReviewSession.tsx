"use client";

import React, { useEffect, useRef, useState } from "react";
import { Brain, CheckCircle2, X } from "@/components/icons/NothoIcons";
import { CONCEPTS } from "@/data/concepts";
import { applyReview, getDueCards, saveMastery } from "@/lib/spaced-repetition";
import type { MasteryRecord } from "@/lib/spaced-repetition";
import { hashSeed, seededPermutation } from "@/lib/lessonShuffle";
import { useReviewCompletion, NOT_COUNTED, type ReviewOutcome } from "@/hooks/useReviewCompletion";

export function ReviewSession({
  onClose,
  onReviewComplete,
  playSound = () => {},
}: {
  onClose: () => void;
  onReviewComplete?: (correctCount: number, total: number) => void;
  playSound?: (type: "correct" | "incorrect" | "complete") => void;
}) {
  const [queue, setQueue] = useState<MasteryRecord[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [outcome, setOutcome] = useState<ReviewOutcome>(NOT_COUNTED);
  const completedRef = useRef(false);
  const completeReview = useReviewCompletion();

  useEffect(() => {
    void getDueCards().then(setQueue);
  }, []);

  const current = queue[currentIdx];
  const concept = current ? CONCEPTS.find((c) => c.id === current.concept_id) : null;

  // Review cards aren't run through the lesson option-shuffle, so the authored
  // correct index would otherwise always show in the same position. Shuffle the
  // four options per concept (seeded, so it's stable within a card view) and
  // remap the correct index.
  const shuffled = React.useMemo(() => {
    if (!concept) return null;
    const perm = seededPermutation(
      concept.reviewCard.options.length,
      hashSeed(`review:${concept.id}`)
    );
    return {
      options: perm.map((oldIdx) => concept.reviewCard.options[oldIdx]),
      correct: perm.indexOf(concept.reviewCard.correct),
    };
  }, [concept]);
  const correctIdx = shuffled ? shuffled.correct : -1;

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setShowExplanation(true);
    const isCorrect = idx === correctIdx;
    if (isCorrect) {
      setCorrectCount((n) => n + 1);
      playSound("correct");
    } else {
      playSound("incorrect");
    }
  };

  const handleNext = () => {
    if (!current || !concept) return;
    const isCorrect = selected === correctIdx;
    const updated = applyReview(current, isCorrect ? 4 : 1);
    void saveMastery(updated);
    if (currentIdx + 1 >= queue.length) {
      // ── Review-complete handler ────────────────────────────────────────
      // Guarded by a ref: this is the only place credit is applied, and it
      // must happen exactly once per session even if React re-invokes the
      // handler. The XP used to be computed here and displayed next to the
      // words "Streak saved" while nothing was ever awarded and the streak
      // was never touched. Credit now goes through the same path a lesson
      // takes (sync-streak + the daily counters), and what the screen says
      // is whatever actually happened.
      if (!completedRef.current) {
        completedRef.current = true;
        const finalCorrect = correctCount;
        const total = queue.length;
        setOutcome(completeReview({ cards: total, correct: finalCorrect }));
        onReviewComplete?.(finalCorrect, total);
      }
      setCurrentIdx(queue.length);
    } else {
      setSelected(null);
      setShowExplanation(false);
      setCurrentIdx((i) => i + 1);
    }
  };

  const isDone = currentIdx >= queue.length;

  if (isDone) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 p-6 text-center shadow-2xl">
          <Brain size={52} className="mx-auto mb-3" style={{ color: "#3B7DD8" }} />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Review complete!</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {correctCount} of {queue.length} correct
          </p>
          {outcome.counted && outcome.xpAwarded > 0 && (
            <p className="text-sm font-bold text-green-600 dark:text-green-400 mb-4">
              +{outcome.xpAwarded} XP · Streak kept
            </p>
          )}
          {outcome.counted && outcome.alreadyCountedToday && (
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">
              Streak kept · today&apos;s review was already counted
            </p>
          )}
          {!outcome.counted && (
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">
              Cards rescheduled. {outcome.cardsRequired} cards in a session keep
              your streak — this one was {queue.length}.
            </p>
          )}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
            <div
              className="h-2 rounded-full bg-green-500"
              style={{ width: `${Math.round((correctCount / queue.length) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
            Cards are rescheduled. Keep it up daily to master your finances!
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-green-600 py-3 text-sm font-bold text-white"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  if (!concept) {
    onClose();
    return null;
  }

  const card = concept.reviewCard;
  const displayOptions = shuffled ? shuffled.options : card.options;
  const optionLetters = ["A", "B", "C", "D"];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-950">
      <div className="flex items-center justify-between px-4 pt-safe-top pb-3 pt-4 border-b border-gray-100 dark:border-gray-800">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Close review"
        >
          <X size={20} />
        </button>
        <div className="flex-1 mx-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full bg-purple-500 transition-all"
              style={{ width: `${Math.round(((currentIdx) / queue.length) * 100)}%` }}
            />
          </div>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
          {currentIdx + 1} / {queue.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mb-1 flex items-center gap-1.5">
          <Brain size={13} className="text-purple-500" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-widest text-purple-500">
            {concept.category}
          </span>
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 leading-snug">
          {card.question}
        </h2>

        <div className="space-y-3">
          {displayOptions.map((opt, i) => {
            const isSelected = selected === i;
            const isCorrect = i === correctIdx;
            let bg = "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white";
            if (selected !== null) {
              if (isCorrect) bg = "bg-green-50 dark:bg-green-900/30 border-green-400 text-green-900 dark:text-green-200";
              else if (isSelected) bg = "bg-red-50 dark:bg-red-900/30 border-red-400 text-red-900 dark:text-red-200";
              else bg = "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500";
            }
            return (
              <button
                key={i}
                type="button"
                disabled={selected !== null}
                onClick={() => handleAnswer(i)}
                className={`w-full flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all ${bg}`}
              >
                <span className="shrink-0 w-7 h-7 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-xs font-bold text-gray-500">
                  {optionLetters[i]}
                </span>
                <span className="text-sm font-medium">{opt}</span>
                {selected !== null && isCorrect && (
                  <CheckCircle2 size={16} className="ml-auto text-green-500 shrink-0" aria-hidden />
                )}
                {isSelected && !isCorrect && (
                  <X size={16} className="ml-auto text-red-500 shrink-0" aria-hidden />
                )}
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <div className={`mt-5 rounded-xl p-4 ${selected === correctIdx ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" : "bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800"}`}>
            <p className={`text-xs font-bold mb-1 ${selected === correctIdx ? "text-green-700 dark:text-green-400" : "text-orange-700 dark:text-orange-400"}`}>
              {selected === correctIdx ? "✓ Correct!" : "Not quite"}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {card.explanation}
            </p>
          </div>
        )}
      </div>

      {selected !== null && (
        <div
          className="px-4 pt-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 96px)" }}
        >
          <button
            type="button"
            onClick={handleNext}
            className="w-full rounded-xl bg-purple-600 py-3.5 text-sm font-bold text-white"
          >
            {currentIdx + 1 >= queue.length ? "See Results" : "Next →"}
          </button>
        </div>
      )}
    </div>
  );
}
