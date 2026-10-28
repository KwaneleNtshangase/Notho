/**
 * Cosmo - Tier 1 deterministic rules engine.
 *
 * Turns a user's own budget data into educational nudges that link to
 * lessons. Design constraints (POPIA + FAIS):
 *   - Pure functions: all numbers are computed here in code. No AI, no
 *     network calls, no data leaves the user's session.
 *   - Educational only: nudges teach principles and point to lessons.
 *     They NEVER name financial products or providers, and never say
 *     "you should buy/invest/switch" (FAIS "advice" boundary).
 */

export type CoachEntry = {
  type: "income" | "expense";
  category: string;
  amount: number;
  entry_date: string; // YYYY-MM-DD
  is_transfer?: boolean;
};

export type CoachInput = {
  /** Current month, e.g. "2026-07" */
  monthKey: string;
  /** Previous month, e.g. "2026-06" */
  prevMonthKey: string;
  /** Entries covering BOTH months (other months are ignored). */
  entries: CoachEntry[];
  /** Resolved monthly budget limit per expense category for monthKey. */
  budgets: Record<string, number>;
  /** Display label per category id (falls back to the id). */
  categoryLabels: Record<string, string>;
  /** Today's day-of-month (1-31) and days in the current month. */
  dayOfMonth: number;
  daysInMonth: number;
};

export type CoachLessonLink = {
  courseId: string;
  lessonId: string;
  title: string;
};

export type CoachInsight = {
  /** Stable id: rule + category + month (dedupe / analytics). */
  id: string;
  severity: "praise" | "info" | "warn" | "alert";
  title: string;
  body: string;
  lesson?: CoachLessonLink;
  /** Lower = more important. */
  priority: number;
};

// ─── Lesson catalogue mapping ─────────────────────────────────────────────────

const LESSONS = {
  needsVsWants:    { courseId: "money-basics",  lessonId: "lesson-2", title: "Needs vs Wants" },
  buildingBudget:  { courseId: "money-basics",  lessonId: "lesson-3", title: "Building a Budget" },
  trackingSpend:   { courseId: "money-basics",  lessonId: "lesson-4", title: "Tracking Your Spending" },
  comparingPrices: { courseId: "money-basics",  lessonId: "lesson-5", title: "Comparing Prices" },
  impulseBuys:     { courseId: "money-basics",  lessonId: "lesson-6", title: "Avoiding Impulse Buys" },
  bankFees:        { courseId: "banking-debit", lessonId: "lesson-2", title: "Understanding Bank Fees" },
  debitOrders:     { courseId: "banking-debit", lessonId: "lesson-4", title: "How Debit Orders Work" },
  debtSnowball:    { courseId: "credit-debt",   lessonId: "lesson-5", title: "The Debt Snowball Method" },
  emergencyFund:   { courseId: "emergency-fund", lessonId: "lesson-1", title: "How Much Do You Need?" },
} as const;

/** Best lesson for an overspent expense category. */
function lessonForCategory(categoryId: string, label: string): CoachLessonLink {
  const norm = `${categoryId} ${label}`.toLowerCase();
  if (categoryId === "food") return LESSONS.comparingPrices;
  if (categoryId === "entertainment") return LESSONS.impulseBuys;
  if (categoryId === "debt") return LESSONS.debtSnowball;
  if (/bank charge|fee/.test(norm)) return LESSONS.bankFees;
  if (/subscription/.test(norm)) return LESSONS.debitOrders;
  if (categoryId === "airtime" || categoryId === "transport") return LESSONS.needsVsWants;
  return LESSONS.trackingSpend;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatRand(n: number): string {
  const rounded = Math.round(n);
  return "R" + String(rounded).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function monthOf(date: string): string {
  return date.slice(0, 7);
}

type CategoryTotals = Record<string, number>;

function sumByCategory(
  entries: CoachEntry[],
  monthKey: string,
  type: "income" | "expense"
): CategoryTotals {
  const out: CategoryTotals = {};
  for (const e of entries) {
    if (e.is_transfer) continue;
    if (e.type !== type) continue;
    if (monthOf(e.entry_date) !== monthKey) continue;
    const amt = Math.abs(Number(e.amount) || 0);
    out[e.category] = (out[e.category] ?? 0) + amt;
  }
  return out;
}

function total(totals: CategoryTotals): number {
  return Object.values(totals).reduce((a, b) => a + b, 0);
}

// ─── Rules ────────────────────────────────────────────────────────────────────

/** Minimum rand amount before a category is worth nudging about. */
const MIN_MATERIAL_AMOUNT = 150;
/** Month-over-month spike threshold. */
const SPIKE_RATIO = 1.5;

export function computeCoachInsights(input: CoachInput): CoachInsight[] {
  const { monthKey, prevMonthKey, budgets, dayOfMonth, daysInMonth } = input;
  const label = (c: string) => input.categoryLabels[c] ?? c;

  const spend = sumByCategory(input.entries, monthKey, "expense");
  const prevSpend = sumByCategory(input.entries, prevMonthKey, "expense");
  const income = total(sumByCategory(input.entries, monthKey, "income"));

  const insights: CoachInsight[] = [];
  const monthProgress = Math.min(1, Math.max(0.01, dayOfMonth / daysInMonth));

  // 1 & 2 - budget exceeded / nearly exceeded
  for (const [cat, limit] of Object.entries(budgets)) {
    if (limit <= 0) continue;
    const spent = spend[cat] ?? 0;
    if (spent < MIN_MATERIAL_AMOUNT) continue;
    const pct = (spent / limit) * 100;

    if (pct >= 100) {
      insights.push({
        id: `over-budget:${cat}:${monthKey}`,
        severity: "alert",
        title: `${label(cat)} is over budget`,
        body: `Spent ${formatRand(spent)} of ${formatRand(limit)} on ${label(cat).toLowerCase()} (${Math.round(pct)}%).`,
        lesson: lessonForCategory(cat, label(cat)),
        priority: 10 + (100 - Math.min(pct, 300)) / 100,
      });
    } else if (pct >= 80) {
      insights.push({
        id: `near-budget:${cat}:${monthKey}`,
        severity: "warn",
        title: `${label(cat)} is at ${Math.round(pct)}% of budget`,
        body: `${formatRand(spent)} of ${formatRand(limit)} used with ${daysInMonth - dayOfMonth} day${daysInMonth - dayOfMonth === 1 ? "" : "s"} of the month left.`,
        lesson: lessonForCategory(cat, label(cat)),
        priority: 20,
      });
    } else if (monthProgress <= 0.6 && pct / 100 > monthProgress * 1.4 && spent >= MIN_MATERIAL_AMOUNT * 2) {
      // 3 - early pace warning: spending much faster than the month is passing
      insights.push({
        id: `pace:${cat}:${monthKey}`,
        severity: "info",
        title: `${label(cat)} spending is ahead of pace`,
        body: `You've used ${Math.round(pct)}% of the ${label(cat).toLowerCase()} budget but only ${Math.round(monthProgress * 100)}% of the month has passed.`,
        lesson: lessonForCategory(cat, label(cat)),
        priority: 30,
      });
    }
  }

  // 4 - month-over-month spike (works even without a budget set)
  for (const [cat, spent] of Object.entries(spend)) {
    const prev = prevSpend[cat] ?? 0;
    if (prev < MIN_MATERIAL_AMOUNT || spent < MIN_MATERIAL_AMOUNT) continue;
    // Compare against the same fraction of last month to avoid false alarms early on.
    const prevAtSamePace = prev * monthProgress;
    if (prevAtSamePace > 0 && spent / prevAtSamePace >= SPIKE_RATIO) {
      insights.push({
        id: `spike:${cat}:${monthKey}`,
        severity: "warn",
        title: `${label(cat)} is up sharply vs last month`,
        body: `${formatRand(spent)} so far this month, against ${formatRand(prev)} for all of last month.`,
        lesson: lessonForCategory(cat, label(cat)),
        priority: 25,
      });
    }
  }

  // 5 - savings rate (only when there's income this month)
  if (income >= 1000) {
    const saved = (spend["savings"] ?? 0) + (spend["Investments"] ?? 0);
    const rate = saved / income;
    if (rate < 0.05 && monthProgress >= 0.5) {
      insights.push({
        id: `savings-low:${monthKey}`,
        severity: "info",
        title: "Little set aside for savings so far",
        body: `${formatRand(saved)} of ${formatRand(income)} income is in savings so far this month.`,
        lesson: LESSONS.emergencyFund,
        priority: 40,
      });
    } else if (rate >= 0.2) {
      insights.push({
        id: `savings-praise:${monthKey}`,
        severity: "praise",
        title: `You're saving ${Math.round(rate * 100)}% of your income`,
        body: `${formatRand(saved)} set aside this month. That is at or above the 20% rule of thumb.`,
        priority: 50,
      });
    }
  }

  // 6 - no budgets set but spending is being tracked
  if (Object.keys(budgets).length === 0 && total(spend) >= MIN_MATERIAL_AMOUNT * 2) {
    insights.push({
      id: `no-budget:${monthKey}`,
      severity: "info",
      title: "You're tracking spending. Next step: set budgets",
      body: `${formatRand(total(spend))} logged this month. Set a limit per category if you want a plan, not only a list.`,
      lesson: LESSONS.buildingBudget,
      priority: 15,
    });
  }

  // 7 - debt repayments consuming a large share of income
  if (income >= 1000) {
    const debt = spend["debt"] ?? 0;
    if (debt / income >= 0.3) {
      insights.push({
        id: `debt-load:${monthKey}`,
        severity: "warn",
        title: `Debt repayments are ${Math.round((debt / income) * 100)}% of income`,
        body: `${formatRand(debt)} of ${formatRand(income)} income went to debt this month.`,
        lesson: LESSONS.debtSnowball,
        priority: 22,
      });
    }
  }

  // 8 - all budgeted categories comfortably under, late in the month
  if (monthProgress >= 0.8 && Object.keys(budgets).length >= 2) {
    const allUnder = Object.entries(budgets).every(
      ([cat, limit]) => limit <= 0 || (spend[cat] ?? 0) / limit < 0.85
    );
    if (allUnder && insights.every((i) => i.severity === "praise" || i.severity === "info")) {
      insights.push({
        id: `on-track:${monthKey}`,
        severity: "praise",
        title: "Every budget is on track this month",
        body: "Every category budget is still under 85% this late in the month.",
        priority: 45,
      });
    }
  }

  insights.sort((a, b) => a.priority - b.priority);
  return insights;
}
