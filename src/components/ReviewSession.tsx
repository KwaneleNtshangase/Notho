"use client";
import { LocalizedText as I18nText, LocalizedElement as I18nElement } from "@/i18n/LocalizedText";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Brain, CheckCircle2, X } from "lucide-react";
import { playSound as defaultPlaySound } from "@/app/pageViews.types";
import { CONCEPTS, type Concept, type ReviewCard } from "@/data/concepts";
import { promptForReview, reviewPromptsFor } from "@/lib/reviewCards";
import { hashSeed, seededPermutation } from "@/lib/lessonShuffle";
import {
  applyReview,
  getReviewSessionQueue,
  saveMastery,
  type MasteryRecord,
} from "@/lib/spaced-repetition";
import { useReviewCompletion, NOT_COUNTED, type ReviewOutcome } from "@/hooks/useReviewCompletion";

const REVIEW_SESSION_KEY = "notho-review-session";
const OPTION_LETTERS = ["A", "B", "C", "D"];

type SavedReview = {
  queue: MasteryRecord[];
  currentIdx: number;
  selected: number | null;
  showExplanation: boolean;
  correctCount: number;
  /** True for a sitting saved before prompts were locked to a question. */
  legacy?: boolean;
  question?: string | null;
};

function isSavedReview(value: unknown): value is SavedReview {
  if (!value || typeof value !== "object") return false;
  const saved = value as SavedReview;
  if (!Array.isArray(saved.queue) || saved.queue.length === 0) return false;
  if (!saved.queue.every((row) => !!row && typeof row.concept_id === "string")) return false;
  if (typeof saved.currentIdx !== "number" || saved.currentIdx < 0 || saved.currentIdx >= saved.queue.length) {
    return false;
  }
  if (!(saved.selected === null || typeof saved.selected === "number")) return false;
  if (typeof saved.showExplanation !== "boolean") return false;
  if (typeof saved.correctCount !== "number") return false;
  return true;
}

function readSavedReview(): SavedReview | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(REVIEW_SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isSavedReview(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function cardFor(
  concept: Concept,
  record: MasteryRecord,
  legacyCard: boolean,
  lockedQuestion: string | null
): ReviewCard {
  if (legacyCard) return concept.reviewCard;
  if (lockedQuestion) {
    return (
      reviewPromptsFor(concept).find((item) => item.question === lockedQuestion) ??
      promptForReview(concept, record)
    );
  }
  return promptForReview(concept, record);
}

export function ReviewSession({
  onClose,
  onReviewComplete,
  playSound = defaultPlaySound,
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
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [legacyCard, setLegacyCard] = useState(false);
  const [lockedQuestion, setLockedQuestion] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<ReviewOutcome>(NOT_COUNTED);
  const completedRef = useRef(false);
  const advancingRef = useRef(false);

  useEffect(() => {
    advancingRef.current = false;
  }, [currentIdx]);
  const onCloseRef = useRef(onClose);
  const completeReview = useReviewCompletion();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onCloseRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const saved = readSavedReview();
      if (saved) {
        if (cancelled) return;
        setQueue(saved.queue);
        setCurrentIdx(saved.currentIdx);
        setSelected(saved.selected);
        setShowExplanation(saved.showExplanation);
        setCorrectCount(saved.correctCount);
        const legacy = saved.legacy === true || (saved.question === undefined && saved.legacy === undefined);
        setLegacyCard(legacy);
        setLockedQuestion(legacy ? null : saved.question ?? null);
        setHasLoaded(true);
        setLoading(false);
        return;
      }
      // Banner count is the full due list (getDueCards). One sitting uses the
      // capped queue so a large pile does not become a cram session.
      const dueCards = await getReviewSessionQueue();
      if (cancelled) return;
      setQueue(dueCards);
      setHasLoaded(true);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const current = queue[currentIdx];
  const concept = current ? CONCEPTS.find((item) => item.id === current.concept_id) ?? null : null;
  const card = concept && current ? cardFor(concept, current, legacyCard, lockedQuestion) : null;

  const shuffled = useMemo(() => {
    if (!concept || !card) return null;
    const seed = legacyCard
      ? hashSeed(`review:${concept.id}`)
      : hashSeed(`review:${concept.id}:${card.question}`);
    const perm = seededPermutation(card.options.length, seed);
    return {
      options: perm.map((oldIdx) => card.options[oldIdx]),
      correct: perm.indexOf(card.correct),
    };
  }, [concept, card, legacyCard]);
  const correctIdx = shuffled ? shuffled.correct : -1;

  const isDone = !loading && hasLoaded && queue.length > 0 && currentIdx >= queue.length;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hasLoaded || queue.length === 0 || currentIdx >= queue.length || !card) return;
    const snapshot: SavedReview = {
      queue,
      currentIdx,
      selected,
      showExplanation,
      correctCount,
      legacy: legacyCard,
      question: legacyCard ? null : card.question,
    };
    localStorage.setItem(REVIEW_SESSION_KEY, JSON.stringify(snapshot));
  }, [queue, currentIdx, selected, showExplanation, correctCount, hasLoaded, legacyCard, card]);

  useEffect(() => {
    if (!isDone || typeof window === "undefined") return;
    localStorage.removeItem(REVIEW_SESSION_KEY);
  }, [isDone]);

  useEffect(() => {
    if (loading || !hasLoaded || queue.length === 0 || currentIdx >= queue.length) return;
    if (concept) return;
    onCloseRef.current();
  }, [loading, hasLoaded, queue.length, currentIdx, concept]);

  const handleAnswer = (idx: number) => {
    if (selected !== null || correctIdx < 0) return;
    setSelected(idx);
    setShowExplanation(true);
    if (idx === correctIdx) {
      setCorrectCount((count) => count + 1);
      playSound("correct");
    } else {
      playSound("incorrect");
    }
  };

  const handleNext = () => {
    if (!current || !concept || advancingRef.current || selected === null) return;
    advancingRef.current = true;
    const updated = applyReview(current, selected === correctIdx ? 4 : 1);
    void saveMastery(updated);
    if (currentIdx + 1 >= queue.length) {
      if (!completedRef.current) {
        completedRef.current = true;
        setOutcome(completeReview({ cards: queue.length, correct: correctCount }));
        onReviewComplete?.(correctCount, queue.length);
      }
      setCurrentIdx(queue.length);
      return;
    }
    setLegacyCard(false);
    setLockedQuestion(null);
    setSelected(null);
    setShowExplanation(false);
    setCurrentIdx((idx) => idx + 1);
  };

  if (loading || !hasLoaded) {
    return (
      <main className="review-session-screen">
        <div className="review-session-result">
          <p><I18nText source={"Loading review..."} /></p>
        </div>
      </main>
    );
  }

  if (queue.length === 0) {
    return (
      <main className="review-session-screen">
        <div className="review-session-result">
          <Brain size={48} aria-hidden style={{ color: "var(--color-primary)" }} />
          <h2><I18nText source={"Review"} /></h2>
          <p><I18nText source={"Nothing due for review. Come back tomorrow to keep your streak strong."} /></p>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            <I18nText source={"Back to Learn"} />
          </button>
        </div>
      </main>
    );
  }

  if (isDone) {
    const score = Math.round((correctCount / queue.length) * 100);
    return (
      <main className="review-session-screen">
        <div className="review-session-result">
          <Brain size={52} aria-hidden style={{ color: "var(--color-primary)" }} />
          <h2><I18nText source={"Review complete!"} /></h2>
          <p><I18nText source={"{value0} of {value1} correct"} values={[correctCount, queue.length]} /></p>
          {outcome.counted && outcome.xpAwarded > 0 && (
            <p className="review-xp"><I18nText source={"+{value0} XP · Streak kept"} values={[outcome.xpAwarded]} /></p>
          )}
          {outcome.counted && outcome.alreadyCountedToday && (
            <p><I18nText source={"Streak kept · today's review was already counted"} /></p>
          )}
          <I18nElement
            as="div"
            className="lesson-progress-bar review-score-track"
            role="progressbar"
            aria-valuenow={score}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Review score"
          >
            <div className="lesson-progress-fill" style={{ width: `${score}%`, background: "var(--color-success)" }} />
          </I18nElement>
          <p>
            <I18nText>
              {outcome.counted
                ? "Cards are rescheduled. Keep it up daily to master your finances!"
                : `Cards are rescheduled. ${outcome.cardsRequired} cards in one session keep your streak going — this one was ${queue.length}.`}
            </I18nText>
          </p>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            <I18nText source={"Done"} />
          </button>
        </div>
      </main>
    );
  }

  if (!concept || !card || !shuffled) return null;

  const progress = Math.round((currentIdx / queue.length) * 100);

  return (
    <main className="review-session-screen">
      <div className="review-session-header">
        <I18nElement
          as="button"
          type="button"
          onClick={onClose}
          className="review-icon-btn"
          aria-label="Close review"
        >
          <X size={22} />
        </I18nElement>
        <I18nElement
          as="div"
          className="lesson-progress-bar"
          style={{ flex: 1, margin: 0 }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Review progress"
        >
          <div className="lesson-progress-fill" style={{ width: `${progress}%` }} />
        </I18nElement>
        <span className="review-count">
          <I18nText>{currentIdx + 1}</I18nText>
          {" / "}
          <I18nText>{queue.length}</I18nText>
        </span>
      </div>

      <div className="review-session-body">
        <div className="review-card">
          <div className="review-kicker">
            <Brain size={14} aria-hidden />
            <span><I18nText>{concept.category}</I18nText></span>
          </div>
          <h2 className="review-question"><I18nText>{card.question}</I18nText></h2>
          <div className="review-options">
            {shuffled.options.map((opt, index) => {
              const isSelected = selected === index;
              const isCorrect = index === correctIdx;
              let state = "";
              if (selected !== null) {
                if (isCorrect) state = "correct";
                else if (isSelected) state = "incorrect";
                else state = "not-chosen";
              }
              return (
                <button
                  key={`${card.question}:${index}`}
                  type="button"
                  disabled={selected !== null}
                  onClick={() => handleAnswer(index)}
                  className={state ? `option-button ${state}` : "option-button"}
                >
                  <span className="review-option-letter" aria-hidden>
                    <I18nText>{OPTION_LETTERS[index] ?? String(index + 1)}</I18nText>
                  </span>
                  <span style={{ flex: 1 }}><I18nText>{opt}</I18nText></span>
                  {selected !== null && isCorrect && (
                    <CheckCircle2 size={18} aria-hidden style={{ flexShrink: 0 }} />
                  )}
                  {isSelected && !isCorrect && (
                    <X size={18} aria-hidden style={{ flexShrink: 0 }} />
                  )}
                </button>
              );
            })}
          </div>
          {showExplanation && (
            <div className={`feedback ${selected === correctIdx ? "correct" : "incorrect"}`}>
              <p style={{ margin: "0 0 6px" }}>
                <I18nText>{selected === correctIdx ? "✓ Correct!" : "Not quite"}</I18nText>
              </p>
              <p style={{ margin: 0, fontWeight: 500 }}>
                <I18nText>{card.explanation}</I18nText>
              </p>
            </div>
          )}
        </div>
      </div>

      {selected !== null && (
        <div className="review-session-footer">
          <button type="button" className="btn btn-primary" onClick={handleNext}>
            <I18nText>{currentIdx + 1 >= queue.length ? "See Results" : "Next →"}</I18nText>
          </button>
        </div>
      )}
    </main>
  );
}
