"use client";
import { LocalizedText as I18nText, LocalizedElement as I18nElement } from "@/i18n/LocalizedText";

import React, { useEffect, useRef, useState, type ReactNode } from "react";
import { BodyPortal } from "@/components/BodyPortal";
import { Brain, CheckCircle2, X } from "@/components/icons/NothoIcons";
import { CONCEPTS } from "@/data/concepts";
import { promptForReview } from "@/lib/reviewCards";
import { applyReview, getReviewSessionQueue, saveMastery } from "@/lib/spaced-repetition";
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
    void getReviewSessionQueue().then(setQueue);
  }, []);

  const current = queue[currentIdx];
  const concept = current ? CONCEPTS.find((c) => c.id === current.concept_id) : null;
  const card = concept && current ? promptForReview(concept, current) : null;

  const shuffled = React.useMemo(() => {
    if (!concept || !card) return null;
    const perm = seededPermutation(
      card.options.length,
      hashSeed(`review:${concept.id}:${card.question}`)
    );
    return {
      options: perm.map((oldIdx) => card.options[oldIdx]),
      correct: perm.indexOf(card.correct),
    };
  }, [concept, card]);
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

  const portal = (node: ReactNode) => (
    <BodyPortal onEscape={onClose}>{node}</BodyPortal>
  );

  if (isDone) {
    return portal(
      <div className="review-session-sheet fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 p-6 text-center shadow-2xl">
          <Brain size={52} className="mx-auto mb-3" style={{ color: "#3B7DD8" }} />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1"><I18nText source={"Review complete!"} /></h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2"><I18nText source={"{value0} of {value1} correct"} values={[correctCount, queue.length]} /></p>
          {outcome.counted && outcome.xpAwarded > 0 && (
            <p className="text-sm font-bold text-green-600 dark:text-green-400 mb-4"><I18nText source={"+{value0} XP · Streak kept"} values={[outcome.xpAwarded]} /></p>
          )}
          {outcome.counted && outcome.alreadyCountedToday && (
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4"><I18nText source={"Streak kept · today's review was already counted"} /></p>
          )}
          {!outcome.counted && (
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4"><I18nText source={"Cards rescheduled. {value0} cards in a session keep your streak — this one was {value1}."} values={[outcome.cardsRequired, queue.length]} /></p>
          )}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
            <div
              className="h-2 rounded-full bg-green-500"
              style={{ width: `${Math.round((correctCount / Math.max(queue.length, 1)) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-6"><I18nText source={"Got it right? That card comes back later. Missed it? You will see it tomorrow."} /></p>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-green-600 py-3 text-sm font-bold text-white"
          ><I18nText source={"Done"} /></button>
        </div>
      </div>
    );
  }

  if (!concept || !card) {
    onClose();
    return null;
  }

  const displayOptions = shuffled ? shuffled.options : card.options;
  const optionLetters = ["A", "B", "C", "D"];

  return portal(
    <div className="review-session-screen fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-950">
      <div className="flex items-center justify-between px-4 pb-3 pt-4 border-b border-gray-100 dark:border-gray-800">
        <I18nElement as="button"
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Close review"
        >
          <X size={20} />
        </I18nElement>
        <div className="flex-1 mx-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full bg-purple-500 transition-all"
              style={{ width: `${Math.round((currentIdx / Math.max(queue.length, 1)) * 100)}%` }}
            />
          </div>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
          <I18nText>{currentIdx + 1}</I18nText> / <I18nText>{queue.length}</I18nText>
        </span>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-6">
        <div className="mb-1 flex items-center gap-1.5">
          <Brain size={13} className="text-purple-500" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-widest text-purple-500">
            <I18nText>{concept.category}</I18nText>
          </span>
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 leading-snug">
          <I18nText>{card.question}</I18nText>
        </h2>

        <div className="space-y-3">
          {displayOptions.map((opt, i) => {
            const isSelected = selected === i;
            const isCorrectOpt = i === correctIdx;
            let bg = "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white";
            if (selected !== null) {
              if (isCorrectOpt) bg = "bg-green-50 dark:bg-green-900/30 border-green-400 text-green-900 dark:text-green-200";
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
                  <I18nText>{optionLetters[i]}</I18nText>
                </span>
                <span className="text-sm font-medium"><I18nText>{opt}</I18nText></span>
                {selected !== null && isCorrectOpt && (
                  <CheckCircle2 size={16} className="ml-auto text-green-500 shrink-0" aria-hidden />
                )}
                {isSelected && !isCorrectOpt && (
                  <X size={16} className="ml-auto text-red-500 shrink-0" aria-hidden />
                )}
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <div className={`mt-5 rounded-xl p-4 ${selected === correctIdx ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" : "bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800"}`}>
            <p className={`text-xs font-bold mb-1 ${selected === correctIdx ? "text-green-700 dark:text-green-400" : "text-orange-700 dark:text-orange-400"}`}>
              <I18nText>{selected === correctIdx ? "✓ Correct!" : "Not quite"}</I18nText>
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              <I18nText>{card.explanation}</I18nText>
            </p>
          </div>
        )}
      </div>

      {selected !== null && (
        <div className="px-4 pb-6 pt-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
          <button
            type="button"
            onClick={handleNext}
            className="w-full rounded-xl bg-purple-600 py-3.5 text-sm font-bold text-white"
          >
            <I18nText>{currentIdx + 1 >= queue.length ? "See Results" : "Next →"}</I18nText>
          </button>
        </div>
      )}
    </div>
  );
}
