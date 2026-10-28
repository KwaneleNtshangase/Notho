/**
 * The decision engine.
 *
 * Every other file in this folder answers "what is happening". This one answers
 * "so what do I do about it", which is the only reason to open a dashboard on a
 * Sunday night. It takes the loaded views and returns a ranked list of concrete
 * moves - each with the evidence that produced it, so nothing has to be taken
 * on trust.
 *
 * Two rules kept it honest while writing it:
 *   1. No insight without a number behind it. If a rule cannot cite the figure
 *      that triggered it, it does not belong here.
 *   2. No insight without an action. "Retention is low" is not an insight, it
 *      is an observation. "Day 7 is 6% - fix the first-week email sequence
 *      before spending anything on acquisition" is an insight.
 *
 * Thresholds are consumer-learning-app rules of thumb, not laws. They are
 * written as named constants so they are easy to argue with and easy to change.
 */

import type {
  AtRiskRow,
  ChurnRow,
  ClockRow,
  ContentRow,
  DropoffRow,
  FeatureLiftRow,
  FeatureRow,
  FunnelRow,
  Overview,
  QuestionRow,
  RetentionRow,
  SegmentRow,
} from "./lib";
import { DOW_LABELS, featureLabel, fmt } from "./lib";

export type Severity = "critical" | "warning" | "opportunity" | "win";

export type Insight = {
  id: string;
  severity: Severity;
  /** Sorts within a severity band. Higher is more urgent. */
  weight: number;
  title: string;
  /** What the data says. Always contains the number that triggered the rule. */
  evidence: string;
  /** What to actually do. Written as an instruction, not a suggestion. */
  action: string;
  /** Which tab proves it, so the card can jump straight there. */
  tab?: string;
};

export type InsightInput = {
  overview?: Overview | null;
  funnel?: FunnelRow[] | null;
  segments?: SegmentRow[] | null;
  retention?: RetentionRow[] | null;
  content?: ContentRow[] | null;
  questions?: QuestionRow[] | null;
  features?: FeatureRow[] | null;
  lift?: FeatureLiftRow[] | null;
  churn?: ChurnRow[] | null;
  atRisk?: AtRiskRow[] | null;
  clock?: ClockRow[] | null;
  dropoff?: DropoffRow[] | null;
};

// ── Thresholds ───────────────────────────────────────────────────────────────

const T = {
  activationPoor: 40,      // % of accounts that ever finish a lesson
  activationGood: 65,
  stickinessPoor: 10,      // DAU/MAU
  stickinessGood: 20,
  d1Poor: 25,
  d7Poor: 12,
  d7Good: 25,
  returnPoor: 35,          // % of window actives who came back a second day
  funnelDropBad: 40,       // % lost at a single funnel step
  reachDead: 12,           // % of actives who ever touch a feature
  liftStrong: 15,          // percentage points of return-rate difference
  tooHardFirstTry: 40,
  brokenFirstTry: 25,
  tooEasyFirstTry: 95,
  completionPoor: 55,      // lesson completion %
  skipRateHigh: 60,        // % of exit surveys skipped
};

const bySeverity: Record<Severity, number> = { critical: 0, warning: 1, opportunity: 2, win: 3 };

/** Builds the ranked action list. Every argument is optional: panels stream in. */
export function buildInsights(input: InsightInput): Insight[] {
  const out: Insight[] = [];
  const push = (i: Insight) => out.push(i);

  const o = input.overview ?? null;

  // ── Data health comes first. Every other rule is reading the same tables, so
  // if the tracking is not writing, the whole list below is noise.
  if (o) {
    if (o.sessions === 0 && o.answers === 0 && o.totalUsers > 0) {
      push({
        id: "no-tracking",
        severity: "critical",
        weight: 100,
        title: "No activity is being recorded at all",
        evidence: `${fmt(o.totalUsers)} accounts exist, but this window has zero sessions and zero answers.`,
        action:
          "Check that the usage-tracking heartbeat is deployed and that the analytics migrations have been applied. Until this is fixed, treat every number on this page as unknown rather than as zero.",
        tab: "pulse",
      });
    } else if (o.sessions === 0 && o.answers > 0) {
      push({
        id: "no-sessions",
        severity: "warning",
        weight: 88,
        title: "Answers are logging but sessions are not",
        evidence: `${fmt(o.answers)} answers in this window, ${o.sessions} tracked sessions.`,
        action:
          "The session heartbeat is not firing, so every time-in-app number is understated. Check record_session_heartbeat is being called from the client.",
        tab: "engagement",
      });
    }

    // ── Activation: the single biggest lever for a young product.
    if (o.totalUsers >= 10) {
      if (o.activationRate < T.activationPoor) {
        push({
          id: "activation-low",
          severity: "critical",
          weight: 95,
          title: "Most sign-ups never finish a single lesson",
          evidence: `${o.activationRate}% of ${fmt(o.totalUsers)} accounts have completed at least one lesson. ${fmt(
            o.neverActivated
          )} have done nothing at all since signing up.`,
          action:
            "Fix the first five minutes before spending anything on acquisition. Put one short, obviously-useful lesson directly after sign-up, with no course picker in the way.",
          tab: "growth",
        });
      } else if (o.activationRate >= T.activationGood) {
        push({
          id: "activation-good",
          severity: "win",
          weight: 40,
          title: "Onboarding is doing its job",
          evidence: `${o.activationRate}% of accounts have finished a lesson.`,
          action: "This is above par for consumer learning apps. Protect this flow - do not redesign it casually.",
          tab: "growth",
        });
      }
    }

    // ── Stickiness.
    const stick = o.mau ? Math.round((o.dau / o.mau) * 100) : 0;
    if (o.mau >= 10 && stick < T.stickinessPoor) {
      push({
        id: "stickiness-low",
        severity: "warning",
        weight: 70,
        title: "People use Notho occasionally, not habitually",
        evidence: `Daily/monthly is ${stick}% (${o.dau} today against ${o.mau} this month). Above ${T.stickinessGood}% is where a learning app becomes a habit.`,
        action:
          "Give people a reason to open the app on a day they were not planning to: a two-minute daily review, a streak reminder at the hour they are actually awake, or a weekly challenge that expires.",
        tab: "engagement",
      });
    }

    if (o.activeUsers >= 8 && o.returningShare < T.returnPoor) {
      push({
        id: "second-visit",
        severity: "warning",
        weight: 74,
        title: "Most people who show up never come back a second day",
        evidence: `Only ${o.returningShare}% of this window's active users were active on two or more separate days.`,
        action:
          "The second visit is the one to engineer. End every lesson with a specific reason to return tomorrow - the next lesson named, not just 'keep going'.",
        tab: "retention",
      });
    }

    // ── At-risk value.
    if (o.atRiskUsers > 0) {
      push({
        id: "at-risk",
        severity: o.atRiskUsers >= Math.max(5, o.activeUsers * 0.4) ? "warning" : "opportunity",
        weight: 66,
        title: `${fmt(o.atRiskUsers)} activated users have gone quiet`,
        evidence: `They completed at least one lesson and have not been seen for 8-30 days. ${fmt(
          o.dormantUsers
        )} more are past 30 days.`,
        action:
          "Win-backs work best in the 8-21 day band. Open the Retention tab, export the ranked list, and send a short personal note - not a campaign - to the top names.",
        tab: "retention",
      });
    }

    if (o.neverActivated >= 5) {
      push({
        id: "ghosts",
        severity: "opportunity",
        weight: 58,
        title: `${fmt(o.neverActivated)} accounts have never done anything`,
        evidence: "Signed up, then no session, no answer, no event - ever.",
        action:
          "This is an onboarding problem, not a retention one. Send a single 'here is the two-minute version' email, then stop emailing them.",
        tab: "growth",
      });
    }

    // ── Content difficulty at the headline level.
    if (o.firstTryAccuracy != null && o.answers >= 40) {
      if (o.firstTryAccuracy < 45) {
        push({
          id: "hard-overall",
          severity: "warning",
          weight: 62,
          title: "The content is landing hard across the board",
          evidence: `First-try accuracy is ${o.firstTryAccuracy}% over ${fmt(o.answers)} answers. The comfortable band is 60-95%.`,
          action:
            "Before rewriting concepts, read the actual questions in the Content tab. Below 45% is usually ambiguous wording rather than genuinely difficult material.",
          tab: "content",
        });
      } else if (o.firstTryAccuracy > 92) {
        push({
          id: "easy-overall",
          severity: "opportunity",
          weight: 44,
          title: "The content may be too easy to feel worth it",
          evidence: `First-try accuracy is ${o.firstTryAccuracy}%.`,
          action:
            "Add a harder final question to your strongest lessons. Difficulty that a learner beats is what makes the app feel valuable.",
          tab: "content",
        });
      }
    }

    if (o.pwaShare > 0 && o.pwaShare < 15 && o.sessions >= 20) {
      push({
        id: "pwa-low",
        severity: "opportunity",
        weight: 46,
        title: "Almost nobody has installed the app to their home screen",
        evidence: `${o.pwaShare}% of sessions came from an installed app.`,
        action:
          "Home-screen users return far more often than browser-tab users. Prompt for install after a completed lesson, when the app has just proved its worth - never on first load.",
        tab: "engagement",
      });
    }
  }

  // ── Funnel: name the worst step explicitly.
  const funnel = input.funnel ?? [];
  if (funnel.length > 2) {
    const worst = funnel
      .filter((f) => f.step > 1 && f.drop_pct != null)
      .sort((a, b) => (b.drop_pct ?? 0) - (a.drop_pct ?? 0))[0];
    const prev = worst ? funnel.find((f) => f.step === worst.step - 1) : undefined;
    if (worst && (worst.drop_pct ?? 0) >= T.funnelDropBad && prev) {
      push({
        id: "funnel-drop",
        severity: (worst.drop_pct ?? 0) >= 60 ? "critical" : "warning",
        weight: 90,
        title: `The biggest leak is between "${prev.label.toLowerCase()}" and "${worst.label.toLowerCase()}"`,
        evidence: `${worst.drop_pct}% of the people who got to "${prev.label}" never reached "${worst.label}" (${fmt(
          prev.users
        )} → ${fmt(worst.users)}).`,
        action:
          "Fix this one step before touching anything else in the funnel. Every improvement above it just feeds more people into the same gap.",
        tab: "growth",
      });
    }
  }

  // ── Retention cohorts.
  const ret = (input.retention ?? []).filter((r) => r.cohort_size >= 3);
  const d7 = ret.map((r) => r.d7_pct).filter((n): n is number => n != null);
  const d1 = ret.map((r) => r.d1_pct).filter((n): n is number => n != null);
  if (d7.length >= 2) {
    const avg = Math.round(d7.reduce((a, b) => a + b, 0) / d7.length);
    if (avg < T.d7Poor) {
      push({
        id: "d7-low",
        severity: "critical",
        weight: 92,
        title: "Day-7 retention is below the level where growth compounds",
        evidence: `Cohorts average ${avg}% back on day 7. Consumer learning apps sit around ${T.d7Good}%.`,
        action:
          "Work the first week, not the funnel. A daily reminder at the right hour, a three-day starter streak, and a visible 'next lesson' beat any acquisition spend at this level.",
        tab: "retention",
      });
    } else if (avg >= T.d7Good) {
      push({
        id: "d7-good",
        severity: "win",
        weight: 38,
        title: "Week-one retention is genuinely strong",
        evidence: `Cohorts average ${avg}% back on day 7.`,
        action: "This is the number to lead with in funding conversations. Export the cohort table for a dated record.",
        tab: "retention",
      });
    }
  }
  if (d1.length >= 2) {
    const avg1 = Math.round(d1.reduce((a, b) => a + b, 0) / d1.length);
    if (avg1 < T.d1Poor) {
      push({
        id: "d1-low",
        severity: "warning",
        weight: 76,
        title: "Day-1 return is weak, so the first session is not landing",
        evidence: `Cohorts average ${avg1}% back the next day.`,
        action:
          "Whatever the first session ends on is the thing people are deciding against. End it on a cliffhanger: the next lesson titled, the streak at 1, and a reminder set.",
        tab: "retention",
      });
    }
  }

  // ── Content: lessons and individual questions.
  const content = input.content ?? [];
  const tooHard = content.filter((c) => (c.first_try_pct ?? 100) < T.tooHardFirstTry);
  const tooEasy = content.filter((c) => (c.first_try_pct ?? 0) > T.tooEasyFirstTry);
  if (tooHard.length > 0) {
    const names = tooHard.slice(0, 3).map((c) => `${c.course_id}/${c.lesson_id}`).join(", ");
    push({
      id: "lessons-hard",
      severity: tooHard.length >= 3 ? "warning" : "opportunity",
      weight: 68,
      title: `${tooHard.length} lesson${tooHard.length === 1 ? "" : "s"} to rewrite`,
      evidence: `Under ${T.tooHardFirstTry}% first-try correct: ${names}${tooHard.length > 3 ? ", and more" : ""}.`,
      action:
        "Rewrite the question wording first and re-measure. A lesson that reads as too hard is usually a question that reads as ambiguous.",
      tab: "content",
    });
  }
  if (tooEasy.length >= 2) {
    push({
      id: "lessons-easy",
      severity: "opportunity",
      weight: 42,
      title: `${tooEasy.length} lessons are free marks`,
      evidence: `Over ${T.tooEasyFirstTry}% first-try correct: ${tooEasy
        .slice(0, 3)
        .map((c) => `${c.course_id}/${c.lesson_id}`)
        .join(", ")}.`,
      action: "Add one harder question to each. Lessons nobody can fail teach nobody anything.",
      tab: "content",
    });
  }

  const broken = (input.questions ?? []).filter(
    (q) => (q.first_try_pct ?? 100) < T.brokenFirstTry && q.attempts >= 4
  );
  if (broken.length > 0) {
    push({
      id: "broken-questions",
      severity: "warning",
      weight: 80,
      title: `${broken.length} individual question${broken.length === 1 ? " looks" : "s look"} broken`,
      evidence: `Under ${T.brokenFirstTry}% first-try correct with real volume - e.g. ${broken[0].lesson_id} / ${broken[0].slot_id} at ${broken[0].first_try_pct}% over ${broken[0].attempts} attempts.`,
      action:
        "Check the marked-correct answer on each of these before assuming the concept is hard. A question this far below chance is usually mis-keyed.",
      tab: "content",
    });
  }

  const badDropoff = (input.dropoff ?? []).filter(
    (d) => (d.completion_pct ?? 100) < T.completionPoor && d.starts >= 5
  );
  if (badDropoff.length > 0) {
    const w = badDropoff[0];
    push({
      id: "dropoff",
      severity: "warning",
      weight: 64,
      title: `People abandon "${w.lesson_id}" part-way through`,
      evidence: `${w.completion_pct}% completion over ${fmt(w.starts)} starts${
        w.avg_quit_pct != null ? `, quitting around ${w.avg_quit_pct}% of the way in` : ""
      }.${badDropoff.length > 1 ? ` ${badDropoff.length - 1} other lessons are in the same state.` : ""}`,
      action:
        "Split it, shorten it, or move the hardest question later. A lesson people quit halfway through costs you the streak as well as the lesson.",
      tab: "content",
    });
  }

  // ── Features: what to cut, what to double down on.
  const features = input.features ?? [];
  const dead = features.filter((f) => f.adoption_pct < T.reachDead && f.users <= 2);
  if (dead.length > 0 && features.length > 2) {
    push({
      id: "dead-features",
      severity: "opportunity",
      weight: 50,
      title: `${dead.length} feature${dead.length === 1 ? " is" : "s are"} barely touched`,
      evidence: dead
        .slice(0, 3)
        .map((f) => `${featureLabel(f.feature)} (${f.adoption_pct}% reach, ${f.users} people)`)
        .join(", "),
      action:
        "Decide deliberately: promote it somewhere people will actually see it, or remove it. Half-alive features cost maintenance and clutter the navigation.",
      tab: "engagement",
    });
  }

  const lift = (input.lift ?? []).filter((l) => l.users_used >= 3 && l.users_not >= 3);
  const bestLift = lift.sort((a, b) => (b.lift_pts ?? 0) - (a.lift_pts ?? 0))[0];
  if (bestLift && (bestLift.lift_pts ?? 0) >= T.liftStrong) {
    push({
      id: "feature-lift",
      severity: "opportunity",
      weight: 72,
      title: `People who use ${featureLabel(bestLift.feature)} come back far more`,
      evidence: `${bestLift.return_used_pct}% of the ${bestLift.users_used} who touched it returned on a second day, against ${bestLift.return_not_pct}% of the ${bestLift.users_not} who did not - a ${bestLift.lift_pts} point gap.`,
      action:
        "Put it in front of new users earlier and measure whether the gap holds. This is correlation, so treat it as an experiment worth running, not a finding.",
      tab: "engagement",
    });
  }

  // ── Timing: when to send.
  const clock = input.clock ?? [];
  if (clock.length >= 12) {
    const best = [...clock].sort((a, b) => b.users - a.users || b.events - a.events)[0];
    if (best && best.users > 0) {
      push({
        id: "best-time",
        severity: "opportunity",
        weight: 48,
        title: `Your users are most active ${DOW_LABELS[Math.max(0, best.dow - 1)]} around ${String(
          best.hour
        ).padStart(2, "0")}:00`,
        evidence: `That hour has the most distinct users of any slot in the window (${best.users} people, ${fmt(
          best.events
        )} events), South African time.`,
        action:
          "Schedule the daily reminder about an hour before this, not at a round number someone picked. The Engagement tab has the full clock.",
        tab: "engagement",
      });
    }
  }

  // ── Segments.
  const segs = input.segments ?? [];
  const champions = segs.find((s) => s.segment === "champion");
  const slipping = segs.find((s) => s.segment === "slipping");
  if (champions && champions.users >= 3) {
    push({
      id: "champions",
      severity: "opportunity",
      weight: 52,
      title: `${champions.users} champions are carrying the app`,
      evidence: `${champions.pct}% of accounts, averaging ${champions.avg_lessons ?? 0} lessons each.`,
      action:
        "Ask these specific people for a store review and for what they want next. This is the cheapest research and the cheapest marketing you have.",
      tab: "people",
    });
  }
  if (slipping && slipping.users >= 3 && champions && slipping.users > champions.users * 2) {
    push({
      id: "slipping",
      severity: "warning",
      weight: 60,
      title: "Far more people are slipping away than are thriving",
      evidence: `${slipping.users} in the 8-21 day silent band against ${champions.users} champions.`,
      action:
        "Re-engagement beats acquisition this month. Work the win-back list before buying a single new install.",
      tab: "retention",
    });
  }

  // ── Churn, read with the skip rate attached.
  const churn = input.churn ?? [];
  if (churn.length > 0) {
    const responses = churn.reduce((a, r) => a + r.n, 0);
    const skipped = churn.filter((r) => r.reason === "skipped").reduce((a, r) => a + r.n, 0);
    const skipRate = responses ? Math.round((skipped / responses) * 100) : 0;
    const named = churn
      .filter((r) => r.reason !== "skipped")
      .reduce<Record<string, number>>((acc, r) => {
        acc[r.reason] = (acc[r.reason] ?? 0) + r.n;
        return acc;
      }, {});
    const top = Object.entries(named).sort((a, b) => b[1] - a[1])[0];
    if (top && top[1] >= 2) {
      push({
        id: "churn-reason",
        severity: "warning",
        weight: 56,
        title: `The most common reason for leaving is "${REASON_TEXT[top[0]] ?? top[0]}"`,
        evidence: `${top[1]} of ${responses - skipped} people who named a reason said this${
          skipRate >= T.skipRateHigh ? `, though ${skipRate}% skipped the question entirely` : ""
        }.`,
        action:
          skipRate >= T.skipRateHigh
            ? "Treat this as a hypothesis, not a fact - most people did not answer, and the ones who did are not a random sample."
            : "This one has enough answers behind it to act on. Fix the thing they named and watch whether the reason stops appearing.",
        tab: "churn",
      });
    }
  }

  // ── Win-back value, from the ranked list itself.
  const risk = input.atRisk ?? [];
  if (risk.length >= 3) {
    const top3 = risk.slice(0, 3);
    const lessons = top3.reduce((a, r) => a + r.lessons_done, 0);
    push({
      id: "winback-top",
      severity: "opportunity",
      weight: 54,
      title: "Three specific people are worth a message tonight",
      evidence: `${top3
        .map((r) => `${r.username || r.email.split("@")[0]} (${r.lessons_done} lessons, quiet ${r.days_since} days)`)
        .join("; ")} - ${lessons} lessons of investment between them.`,
      action: "Send a plain, personal email. At this size, personal beats automated by a wide margin.",
      tab: "retention",
    });
  }

  return out.sort(
    (a, b) => bySeverity[a.severity] - bySeverity[b.severity] || b.weight - a.weight
  );
}

const REASON_TEXT: Record<string, string> = {
  too_many_emails: "too many emails",
  not_useful: "the content was not useful",
  too_hard: "too hard or confusing",
  too_easy: "already knew it",
  no_time: "no time",
  technical: "bugs or slowness",
  privacy: "data privacy worry",
  found_alternative: "using something else",
  other: "something else",
};

// ── Health score ─────────────────────────────────────────────────────────────

export type HealthPart = { key: string; label: string; score: number; detail: string };

/**
 * One 0-100 number, from five things that actually predict whether a learning
 * app survives. Deliberately transparent: the breakdown is always shown next to
 * the score, because a composite you cannot decompose is a number you cannot
 * act on.
 */
export function healthScore(input: InsightInput): { score: number; parts: HealthPart[] } {
  const o = input.overview;
  const parts: HealthPart[] = [];

  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

  if (o) {
    parts.push({
      key: "activation",
      label: "Activation",
      score: clamp((o.activationRate / 65) * 100),
      detail: `${o.activationRate}% of accounts finish a lesson (65% is full marks)`,
    });

    const stick = o.mau ? (o.dau / o.mau) * 100 : 0;
    parts.push({
      key: "stickiness",
      label: "Stickiness",
      score: clamp((stick / 20) * 100),
      detail: `${Math.round(stick)}% daily/monthly (20% is full marks)`,
    });

    parts.push({
      key: "return",
      label: "Second visit",
      score: clamp((o.returningShare / 60) * 100),
      detail: `${o.returningShare}% of actives came back another day (60% is full marks)`,
    });
  }

  const d7 = (input.retention ?? [])
    .filter((r) => r.cohort_size >= 3 && r.d7_pct != null)
    .map((r) => r.d7_pct as number);
  if (d7.length) {
    const avg = d7.reduce((a, b) => a + b, 0) / d7.length;
    parts.push({
      key: "retention",
      label: "Week-one retention",
      score: clamp((avg / 25) * 100),
      detail: `${Math.round(avg)}% back on day 7 (25% is full marks)`,
    });
  }

  const content = input.content ?? [];
  if (content.length) {
    const wellPitched = content.filter(
      (c) => (c.first_try_pct ?? 0) >= 55 && (c.first_try_pct ?? 0) <= 95
    ).length;
    parts.push({
      key: "content",
      label: "Content pitch",
      score: clamp((wellPitched / content.length) * 100),
      detail: `${wellPitched} of ${content.length} measured lessons sit in the 55-95% first-try band`,
    });
  }

  if (!parts.length) return { score: 0, parts };
  const score = Math.round(parts.reduce((a, p) => a + p.score, 0) / parts.length);
  return { score, parts };
}

export function scoreTone(score: number): Severity {
  if (score >= 70) return "win";
  if (score >= 45) return "opportunity";
  if (score >= 25) return "warning";
  return "critical";
}
