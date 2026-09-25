"use client";

import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Brain,
  Calculator,
  CheckCircle2,
  CreditCard,
  Flame,
  Lock,
  PiggyBank,
  Share2,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Wallet,
  Zap,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { analytics } from "@/lib/analytics";
import { sastToday } from "@/lib/dates";
import { DAILY_CHALLENGE_FLAG_EVENT } from "@/lib/dailyChallengeFlags";

const DAILY_CHALLENGE_POOL = [
  { id: "complete-lesson",    text: "Complete a lesson",                     icon: <BookOpen size={16} />,    xp: 15 },
  { id: "log-expense",        text: "Log an expense",                        icon: <CreditCard size={16} />,  xp: 10 },
  { id: "check-budget",       text: "Open the Budget Planner",               icon: <Wallet size={16} />,      xp: 10 },
  { id: "earn-50xp",          text: "Earn 50 XP today",                      icon: <Zap size={16} />,         xp: 20 },
  { id: "perfect-quiz",       text: "Get a perfect quiz score",              icon: <Trophy size={16} />,      xp: 25 },
  { id: "complete-2-lessons", text: "Finish 2 lessons today",                icon: <BookOpen size={16} />,    xp: 20 },
  { id: "use-calculator",     text: "Run a scenario in the Calculator",      icon: <Calculator size={16} />,  xp: 15 },
  { id: "visit-budget",       text: "Review your spending categories",       icon: <Target size={16} />,      xp: 10 },
  { id: "earn-100xp",         text: "Earn 100 XP in a single session",       icon: <Sparkles size={16} />,   xp: 30 },
  { id: "no-wrong-answers",   text: "Answer 5 questions without a mistake",  icon: <Flame size={16} />,       xp: 25 },
  { id: "complete-3-lessons", text: "Complete 3 lessons today",              icon: <TrendingUp size={16} />,  xp: 30 },
  { id: "log-2-expenses",     text: "Log 2 expenses today",                  icon: <PiggyBank size={16} />,   xp: 15 },
  { id: "concept-review",     text: "Review a flashcard concept",            icon: <Brain size={16} />,       xp: 10 },
  { id: "share-milestone",    text: "Share your progress with someone",      icon: <Share2 size={16} />,      xp: 15 },
  { id: "earn-75xp",          text: "Earn 75 XP today",                      icon: <Zap size={16} />,         xp: 25 },
];

export function getDailyChallenges(): typeof DAILY_CHALLENGE_POOL {
  const today = sastToday();
  let seed = 0;
  for (let i = 0; i < today.length; i++) seed = ((seed << 5) - seed + today.charCodeAt(i)) | 0;
  seed = Math.abs(seed);
  const shuffled = [...DAILY_CHALLENGE_POOL];
  for (let i = shuffled.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) & 0x7fffffff;
    const j = seed % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 3);
}

export function DailyChallenges({ streak = 0, onXpClaimed }: { streak?: number; onXpClaimed?: (amount: number) => void }) {
  const today = sastToday();
  const storageKey = `notho-daily-challenges-${today}`;
  const [claimed, setClaimed] = useState<Record<string, boolean>>({});
  const [conditions, setConditions] = useState<Record<string, boolean>>({});
  const challenges = React.useMemo(() => getDailyChallenges(), []);
  const claimedRef = React.useRef<Record<string, boolean>>({});

  const refreshConditions = React.useCallback(() => {
    if (typeof window === "undefined") return;
    const dailyLessons = parseInt(localStorage.getItem(`notho-daily-lessons-${today}`) ?? "0");
    const dailyXp      = parseInt(localStorage.getItem(`notho-daily-xp-${today}`) ?? "0");
    const dailyExpense = parseInt(localStorage.getItem(`notho-expense-today-${today}`) ?? "0");
    setConditions({
      "complete-lesson":    dailyLessons >= 1,
      "log-expense":        dailyExpense >= 1,
      "check-budget":       localStorage.getItem(`notho-budget-visited-${today}`) === "1",
      "earn-50xp":          dailyXp >= 50,
      "earn-75xp":          dailyXp >= 75,
      "earn-100xp":         dailyXp >= 100,
      "perfect-quiz":       parseInt(localStorage.getItem(`notho-perfect-today-${today}`) ?? "0") >= 1,
      "complete-2-lessons": dailyLessons >= 2,
      "complete-3-lessons": dailyLessons >= 3,
      "use-calculator":     localStorage.getItem(`notho-calc-visited-${today}`) === "1",
      "visit-budget":       localStorage.getItem(`notho-budget-visited-${today}`) === "1",
      "log-2-expenses":     dailyExpense >= 2,
      "concept-review":     localStorage.getItem(`notho-concept-reviewed-${today}`) === "1",
      "share-milestone":    localStorage.getItem(`notho-shared-today-${today}`) === "1",
      "no-wrong-answers":   parseInt(localStorage.getItem(`notho-correct-streak-today-${today}`) ?? "0") >= 5,
    });
  }, [today, streak]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
      setClaimed(saved);
      claimedRef.current = { ...claimedRef.current, ...saved };
    } catch { /* ignore */ }
    refreshConditions();
    void (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase.from("user_progress").select("daily_challenges_date, daily_challenges_claimed").eq("user_id", user.id).single();
        if (data && data.daily_challenges_date === today && data.daily_challenges_claimed) {
          try {
            const claimedFromDb = JSON.parse(typeof data.daily_challenges_claimed === "string" ? data.daily_challenges_claimed : JSON.stringify(data.daily_challenges_claimed));
            setClaimed((c) => {
              const next = { ...c, ...claimedFromDb };
              claimedRef.current = next;
              return next;
            });
            localStorage.setItem(storageKey, JSON.stringify({ ...JSON.parse(localStorage.getItem(storageKey) ?? "{}"), ...claimedFromDb }));
          } catch { /* ignore parse error */ }
        }
      } catch { /* ignore Supabase error */ }
    })();
  }, [storageKey, refreshConditions, today]);

  useEffect(() => {
    const onFlag = () => refreshConditions();
    window.addEventListener(DAILY_CHALLENGE_FLAG_EVENT, onFlag);
    window.addEventListener("storage", onFlag);
    const timer = window.setInterval(refreshConditions, 15000);
    return () => {
      window.removeEventListener(DAILY_CHALLENGE_FLAG_EVENT, onFlag);
      window.removeEventListener("storage", onFlag);
      window.clearInterval(timer);
    };
  }, [refreshConditions]);

  const claimChallenge = async (challengeId: string, xp: number) => {
    if (claimedRef.current[challengeId]) return;
    const next = { ...claimedRef.current, [challengeId]: true };
    claimedRef.current = next;
    setClaimed(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
    analytics.dailyChallengeClaimed(challengeId, xp);
    onXpClaimed?.(xp);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("user_progress").update({
        daily_challenges_date: today,
        daily_challenges_claimed: JSON.stringify(next),
      }).eq("user_id", user.id);
    }
  };

  useEffect(() => {
    for (const ch of challenges) {
      if (!conditions[ch.id] || claimedRef.current[ch.id]) continue;
      void claimChallenge(ch.id, ch.xp);
    }
  }, [conditions, challenges]);

  const allClaimed = challenges.every((c) => claimed[c.id]);

  return (
    <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, padding: 16, marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Sparkles size={18} style={{ color: "#EFB343" }} />
        <div style={{ fontWeight: 800, fontSize: 14 }}>Daily Challenges</div>
        {allClaimed && <span style={{ fontSize: 11, fontWeight: 700, color: "#007A85", marginLeft: "auto" }}>All done!</span>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {challenges.map((ch) => {
          const done = !!claimed[ch.id];
          const achieved = !!conditions[ch.id];
          return (
            <div key={ch.id} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
              borderRadius: 10,
              background: done ? "rgba(0,122,133,0.06)" : achieved ? "rgba(239,179,67,0.04)" : "var(--color-bg)",
              border: `1px solid ${done ? "rgba(0,122,133,0.2)" : achieved ? "rgba(239,179,67,0.3)" : "var(--color-border)"}`,
              opacity: done ? 1 : achieved ? 1 : 0.65,
            }}>
              <div style={{ color: done ? "#007A85" : achieved ? "#EFB343" : "var(--color-text-secondary)", display: "flex", flexShrink: 0 }}>
                {done ? <CheckCircle2 size={16} /> : ch.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: done ? "#007A85" : "var(--color-text-primary)", textDecoration: done ? "line-through" : "none" }}>
                  {ch.text}
                </div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: done ? "#007A85" : achieved ? "#EFB343" : "var(--color-text-secondary)", flexShrink: 0 }}>
                {done ? "Done" : `+${ch.xp} XP`}
              </div>
              {!done && !achieved && (
                <Lock size={13} style={{ color: "var(--color-text-secondary)", flexShrink: 0 }} />
              )}
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 10, textAlign: "center" }}>
        Resets at midnight · Completes the moment you do the task
      </div>
    </div>
  );
}
