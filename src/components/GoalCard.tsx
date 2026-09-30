"use client";

import React, { useEffect, useState } from "react";
import { Target } from "lucide-react";
import {
  GOAL_OPTIONS,
  persistUserGoalToStorageAndSupabase,
} from "@/app/pageViews.types";
import { useLocale } from "@/i18n/LocaleProvider";
import type { MessageKey } from "@/i18n/messages";

// Self-contained savings-goal card + picker.
// Originally lived only on the Learn page; now also the primary home for the
// goal inside the Goals tab (/quests), so that nav label actually contains a goal.
// Manages its own state (localStorage + cross-device storage sync) so it can be
// dropped in anywhere without prop plumbing.
export function GoalCard() {
  const { t } = useLocale();
  const [userGoal, setUserGoal] = useState<string | null>(null);
  const [goalDescription, setGoalDescription] = useState<string>("");
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [pickerGoalId, setPickerGoalId] = useState<string>("");
  const [pickerGoalDescription, setPickerGoalDescription] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setUserGoal(localStorage.getItem("notho-user-goal"));
    setGoalDescription(localStorage.getItem("notho-goal-description") ?? "");
    // Listen for cross-device goal sync updates (dispatched by syncFromSupabase)
    const onStorage = (e: StorageEvent) => {
      if (e.key === "notho-user-goal" && e.newValue) setUserGoal(e.newValue);
      if (e.key === "notho-goal-description") setGoalDescription(e.newValue ?? "");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Esc closes the picker - keyboard parity with the app's other modals.
  useEffect(() => {
    if (!showGoalPicker) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowGoalPicker(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showGoalPicker]);

  const openPicker = () => {
    setPickerGoalId(userGoal ?? "");
    setPickerGoalDescription(goalDescription);
    setShowGoalPicker(true);
  };

  return (
    <>
      {userGoal ? (
        <div className="mb-4 rounded-xl border-2 border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-900/20">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="shrink-0 w-9 h-9 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                <Target size={18} className="text-green-600 dark:text-green-400" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-500">{t("goals.yourGoal")}</p>
                <p className="text-sm font-bold text-green-900 dark:text-green-200 leading-tight">
                  {GOAL_OPTIONS.find((g) => g.id === userGoal)?.label ?? userGoal}
                </p>
                {goalDescription && (
                  <p className="mt-0.5 text-xs text-green-700 dark:text-green-400 opacity-80 break-words">
                    {goalDescription}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={openPicker}
              className="shrink-0 rounded-lg border border-green-300 bg-white px-3 py-1.5 text-xs font-bold text-green-700 hover:bg-green-100 dark:border-green-700 dark:bg-transparent dark:text-green-400 dark:hover:bg-green-900/40"
            >
              {t("common.edit")}
            </button>
          </div>
        </div>
      ) : (
        // No goal set yet - invite the user to pick one so the tab is never empty.
        <button
          type="button"
          onClick={openPicker}
          className="mb-4 flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-green-300 bg-green-50 px-4 py-3 text-left hover:bg-green-100 dark:border-green-700 dark:bg-green-900/20 dark:hover:bg-green-900/40"
        >
          <div className="shrink-0 w-9 h-9 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
            <Target size={18} className="text-green-600 dark:text-green-400" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-500">{t("goals.yourGoal")}</p>
            <p className="text-sm font-bold text-green-900 dark:text-green-200 leading-tight">
              {t("goals.setMoney")}
            </p>
            <p className="mt-0.5 text-xs text-green-700 dark:text-green-400 opacity-80">
              We&apos;ll prioritise courses that match it.
            </p>
          </div>
        </button>
      )}

      {showGoalPicker && (
        <div
          className="fixed inset-0 z-[400] flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="goalcard-picker-title"
          onClick={() => setShowGoalPicker(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="goalcard-picker-title" className="mb-1 text-lg font-bold text-gray-900 dark:text-white">
              {t("goals.pickerTitle")}
            </h2>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              We&apos;ll prioritise courses that match what you want to achieve.
            </p>
            <div className="mb-3 grid grid-cols-2 gap-2">
              {GOAL_OPTIONS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    setPickerGoalId(g.id);
                    if (g.id !== "other") setPickerGoalDescription("");
                  }}
                  className={`rounded-xl border-2 p-3 text-left text-sm font-semibold transition-colors ${
                    pickerGoalId === g.id
                      ? "border-green-600 bg-green-50 dark:border-green-500 dark:bg-green-900/20"
                      : "border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-900/40"
                  }`}
                >
                  <g.Icon size={16} className="mr-1 inline align-text-bottom text-green-600 dark:text-green-400" aria-hidden />
                  {t(("onboarding.goal." + g.id) as MessageKey)}
                </button>
              ))}
            </div>
            {pickerGoalId === "other" && (
              <textarea
                placeholder="Describe your goal - e.g. save for my child's education"
                value={pickerGoalDescription}
                onChange={(e) => setPickerGoalDescription(e.target.value)}
                rows={3}
                className="mb-3 w-full resize-y rounded-xl border-2 border-green-600 bg-gray-50 p-3 text-sm text-gray-900 focus:outline-none dark:bg-gray-900/40 dark:text-white"
              />
            )}
            {pickerGoalId && pickerGoalId !== "other" && (
              <textarea
                placeholder="Anything more to say about this goal? (optional)"
                value={pickerGoalDescription}
                onChange={(e) => setPickerGoalDescription(e.target.value)}
                rows={2}
                className="mb-3 w-full resize-y rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 focus:outline-none dark:border-gray-600 dark:bg-gray-900/40 dark:text-white"
              />
            )}
            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-semibold text-gray-700 dark:border-gray-600 dark:text-gray-200"
                onClick={() => setShowGoalPicker(false)}
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                className="flex-1 rounded-xl bg-green-600 py-3 text-sm font-semibold text-white disabled:opacity-40"
                disabled={!pickerGoalId || (pickerGoalId === "other" && !pickerGoalDescription.trim())}
                onClick={async () => {
                  if (!pickerGoalId) return;
                  const desc = pickerGoalDescription.trim() || undefined;
                  await persistUserGoalToStorageAndSupabase(pickerGoalId, desc);
                  setUserGoal(pickerGoalId);
                  setGoalDescription(desc ?? "");
                  setShowGoalPicker(false);
                }}
              >
                {t("common.save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
