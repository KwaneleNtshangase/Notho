/**
 * Pre-store honesty layer on top of the existing insight engine.
 *
 * Kept in its own file so the original decision rules stay reviewable, and so
 * this layer can be deleted once the product is past a few hundred real
 * accounts.
 */

import { fmt } from "./lib";
import {
  buildInsights,
  healthScore,
  type HealthPart,
  type Insight,
  type InsightInput,
} from "./insights";

export function deskInsights(input: InsightInput): Insight[] {
  const out = buildInsights(input);
  const o = input.overview ?? null;

  if (o && o.pwaShare < 15 && (o.sessions >= 10 || o.totalUsers >= 10)) {
    if (!out.some((i) => i.id === "pwa-low")) {
      out.push({
        id: "pwa-low",
        severity: o.pwaShare === 0 ? "critical" : "opportunity",
        weight: o.pwaShare === 0 ? 93 : 46,
        title:
          o.pwaShare === 0
            ? "Nobody has installed Notho to their home screen"
            : "Almost nobody has installed the app to their home screen",
        evidence: `${o.pwaShare}% of sessions came from an installed app. Store launch with a browser-tab habit will not compound.`,
        action:
          "Prompt for install after a completed lesson, when the app has just proved its worth — never on first load. Treat install share as a launch gate, not a footnote.",
        tab: "engagement",
      });
    }
  }

  if (o && o.answers >= 200 && o.lessonsInWindow < 20 && o.activeUsers <= 10) {
    out.push({
      id: "answers-vs-lessons",
      severity: "warning",
      weight: 84,
      title: "Answer volume does not match real lesson completions",
      evidence: `${fmt(o.answers)} answers in this window against ${fmt(o.lessonsInWindow)} finished lessons and ${fmt(o.activeUsers)} active people.`,
      action:
        "This is usually test traffic, retry storms, or a tracking leak. Check People for internal accounts before you read first-try accuracy as a content score.",
      tab: "content",
    });
  }

  const rank = { critical: 0, warning: 1, opportunity: 2, win: 3 } as const;
  return out.sort((a, b) => rank[a.severity] - rank[b.severity] || b.weight - a.weight);
}

/**
 * Same five bars as healthScore, but activation carries the composite while
 * the product is still small. A 25% stickiness built from 1 daily user against
 * 4 monthly users must not cancel a 13% activation rate.
 */
export function deskHealth(input: InsightInput): { score: number; parts: HealthPart[] } {
  const raw = healthScore(input);
  const o = input.overview;
  const early = !o || o.totalUsers < 200 || o.mau < 30;
  if (!early || !raw.parts.length) return raw;

  const parts = raw.parts.map((part) => {
    if (part.key !== "stickiness" || !o || o.mau >= 10) return part;
    return {
      ...part,
      score: Math.min(part.score, 40),
      detail: `${o.dau} today / ${o.mau} this month — too small to call a habit`,
    };
  });

  const weightFor = (key: string) => {
    if (key === "activation") return 4;
    if (key === "return" || key === "retention") return 2;
    if (key === "content") return 1.5;
    return 1;
  };
  const totalW = parts.reduce((a, part) => a + weightFor(part.key), 0);
  const score = Math.round(parts.reduce((a, part) => a + part.score * weightFor(part.key), 0) / totalW);
  return { score, parts };
}

export function storeReadiness(input: InsightInput): { score: number; parts: HealthPart[] } {
  const o = input.overview;
  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
  const parts: HealthPart[] = [];
  if (o) {
    parts.push({
      key: "install",
      label: "Installed sessions",
      score: clamp((o.pwaShare / 15) * 100),
      detail: `${o.pwaShare}% of sessions came from an installed app (15% is the launch floor)`,
    });
    parts.push({
      key: "first-session",
      label: "Activation",
      score: clamp((o.activationRate / 40) * 100),
      detail: `${o.activationRate}% finish a lesson (40% is the store-launch floor)`,
    });
    if (o.firstTryAccuracy != null && o.answers >= 20) {
      const band = o.firstTryAccuracy >= 55 && o.firstTryAccuracy <= 90;
      parts.push({
        key: "first-try",
        label: "First-try pitch",
        score: band ? 100 : clamp(o.firstTryAccuracy),
        detail: `${o.firstTryAccuracy}% first-try correct. Under 40% will meet a store reviewer as broken.`,
      });
    }
    parts.push({
      key: "habit",
      label: "7-day streaks",
      score: o.streak7Plus > 0 ? 100 : o.usersWithStreak > 0 ? 40 : 0,
      detail: `${o.streak7Plus} people on a 7-day streak, ${o.usersWithStreak} on 3 or more`,
    });
  }
  if (!parts.length) return { score: 0, parts };
  const score = Math.round(parts.reduce((a, part) => a + part.score, 0) / parts.length);
  return { score, parts };
}
