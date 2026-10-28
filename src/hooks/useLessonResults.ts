"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNotho } from "@/context/NothoContext";
import { fetchLessonResults } from "@/lib/results/store";
import { bestByLesson } from "@/lib/results/select";
import type { LessonResult } from "@/lib/results/types";

/**
 * Loads the signed-in learner's recorded results.
 *
 * Rows are scoped by RLS (`auth.uid() = user_id`), so there is no user filter
 * here and no way for this to surface another learner's scores. `userId` is
 * used only to know when to refetch after a sign-in or account switch.
 */
export function useLessonResults(courseId?: string) {
  const { userId } = useNotho();
  const [results, setResults] = useState<LessonResult[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const rows = await fetchLessonResults(courseId);
    setResults(rows);
    setLoading(false);
  }, [userId, courseId]);

  useEffect(() => {
    let alive = true;
    void (async () => {
      if (!userId) {
        if (alive) {
          setResults([]);
          setLoading(false);
        }
        return;
      }
      const rows = await fetchLessonResults(courseId);
      if (alive) {
        setResults(rows);
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [userId, courseId]);

  const best = useMemo(() => bestByLesson(results), [results]);

  return { results, best, loading, reload: load };
}
