"use client";

import { useEffect, useState } from "react";
import { Trophy, Sparkles, Target, Flame, Wallet } from "lucide-react";
import { BUDGET_LESSON_BRIDGE, getLessonTitle } from "@/app/pageViews.types";
import { ShareResultButton } from "@/components/ShareCard";
import { isIosNative } from "@/lib/capacitorPlatform";

export function LessonSummaryView({
  lessonSummary,
  onClose,
  onBudgetBridge,
}: {
  lessonSummary: {
    xpEarned: number;
    timeSeconds: number;
    accuracy: number;
    streak: number;
    isPerfect: boolean;
    choice: "next" | "course";
    nextLessonId: string | null;
    courseId: string;
    lessonId: string | null;
  };
  onClose: () => void;
  onBudgetBridge: () => void;
}) {
  const [iosShare, setIosShare] = useState(false);
  const bridgeKey = `${lessonSummary.courseId}:${lessonSummary.lessonId}`;
  const bridge = BUDGET_LESSON_BRIDGE[bridgeKey];
  const lessonTitle = getLessonTitle(lessonSummary.courseId, lessonSummary.lessonId) ?? "Lesson";

  useEffect(() => {
    let cancelled = false;
    isIosNative().then((ios) => {
      if (!cancelled) setIosShare(ios);
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 600,
      background: "#ffffff",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "24px 20px",
    }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ marginBottom: 8, display: "flex", justifyContent: "center" }}>
          {lessonSummary.isPerfect
            ? <Trophy size={64} style={{ color: "#EFB343" }} />
            : <Sparkles size={64} style={{ color: "#7C3AED" }} />}
        </div>
        <div style={{ fontSize: 28, fontWeight: 900, color: "#0E7C85", marginBottom: 4 }}>
          {lessonSummary.isPerfect ? "Perfect Lesson!" : "Lesson Complete!"}
        </div>
        <div style={{ fontSize: 15, color: "#6b7280", fontWeight: 500 }}>
          {lessonSummary.isPerfect ? "You got every question right!" : "Keep up the great work!"}
        </div>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: 12, width: "100%", maxWidth: 360, marginBottom: 32,
      }}>
        <div style={{
          background: "#FFF8E7", border: "2px solid #EFB343",
          borderRadius: 16, padding: "18px 12px", textAlign: "center",
        }}>
          <div style={{ fontSize: 30, marginBottom: 4 }}>⭐</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#B8870F" }}>+{lessonSummary.xpEarned}</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#B8870F", textTransform: "uppercase", letterSpacing: 1 }}>XP Earned</div>
        </div>
        <div style={{
          background: "#E8F5FF", border: "2px solid #3B7DD8",
          borderRadius: 16, padding: "18px 12px", textAlign: "center",
        }}>
          <div style={{ fontSize: 30, marginBottom: 4 }}>⏱️</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#2563EB" }}>
            {String(Math.floor(lessonSummary.timeSeconds / 60)).padStart(2, "0")}:{String(lessonSummary.timeSeconds % 60).padStart(2, "0")}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#2563EB", textTransform: "uppercase", letterSpacing: 1 }}>Time</div>
        </div>
        <div style={{
          background: "#F0FDF4", border: "2px solid #0E7C85",
          borderRadius: 16, padding: "18px 12px", textAlign: "center",
        }}>
          <div style={{ marginBottom: 4, display: "flex", justifyContent: "center" }}><Target size={30} style={{ color: "#0E7C85" }} /></div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#0E7C85" }}>{lessonSummary.accuracy}%</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#0E7C85", textTransform: "uppercase", letterSpacing: 1 }}>Accuracy</div>
        </div>
        <div style={{
          background: "#FFF3EE", border: "2px solid #F97316",
          borderRadius: 16, padding: "18px 12px", textAlign: "center",
        }}>
          <div style={{ marginBottom: 4, display: "flex", justifyContent: "center" }}><Flame size={30} style={{ color: "#F97316" }} /></div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#EA580C" }}>{lessonSummary.streak}</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#EA580C", textTransform: "uppercase", letterSpacing: 1 }}>Day Streak</div>
        </div>
      </div>

      {bridge ? (
        <button
          type="button"
          onClick={onBudgetBridge}
          style={{
            width: "100%", maxWidth: 360, marginBottom: 12,
            padding: "14px 16px", borderRadius: 16,
            background: "linear-gradient(135deg, #E8F5EE 0%, #D6EDEF 100%)",
            border: "2px solid #0E7C85", cursor: "pointer",
            textAlign: "left", display: "flex", alignItems: "center", gap: 12,
          }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: "#0E7C85", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Wallet size={24} style={{ color: "white" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#0E7C85", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>Unlock Now</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#064B52" }}>{bridge.prompt}</div>
            <div style={{ fontSize: 13, color: "#064B52", opacity: 0.8, marginTop: 4 }}>
              {bridge.detail}
            </div>
          </div>
        </button>
      ) : null}

      {iosShare ? (
        <div style={{ width: "100%", maxWidth: 360, marginBottom: 12 }}>
          <ShareResultButton
            label="Share"
            data={{
              type: "lesson",
              lessonTitle,
              xpEarned: lessonSummary.xpEarned,
              isPerfect: lessonSummary.isPerfect,
              courseName: lessonSummary.courseId,
            }}
          />
        </div>
      ) : null}

      <button
        type="button"
        className="btn btn-primary"
        style={{ width: "100%", maxWidth: 360, padding: "16px", fontSize: 18, fontWeight: 800 }}
        onClick={onClose}
      >
        Continue
      </button>
    </div>
  );
}
