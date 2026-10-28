/**
 * Did a lesson show up in the budget?
 *
 * This is association, not proof the lesson caused the change. A person who
 * imports a statement the week they finish Needs vs Wants will look "worse"
 * only because the before window was empty. Comparable windows are required
 * before a verdict is allowed.
 *
 * Category tags match BudgetPlanner BUDGET_EXPENSE_CATS. Custom categories and
 * "other" stay uncategorised so they cannot masquerade as wants.
 */

export const NEED_CATEGORIES = ["food", "transport", "housing", "airtime", "healthcare", "education"] as const;
export const WANT_CATEGORIES = ["entertainment", "shopping", "travel"] as const;
export const SAVINGS_CATEGORIES = ["savings"] as const;
export const DEBT_CATEGORIES = ["debt"] as const;

const NEED = new Set<string>(NEED_CATEGORIES);
const WANT = new Set<string>(WANT_CATEGORIES);
const SAVINGS = new Set<string>(SAVINGS_CATEGORIES);
const DEBT = new Set<string>(DEBT_CATEGORIES);

/** Minimum days in each window before a before/after call is allowed. */
export const MIN_WINDOW_DAYS = 14;
/** Classified spend (needs + wants) each side must clear, in rand. */
export const MIN_CLASSIFIED_RAND = 200;
/** Expense rows each side must have, so one grocery run cannot swing the share. */
export const MIN_EXPENSE_ROWS = 4;
/** Points of want-share or savings-rate movement that count as a real shift. */
export const MATERIAL_PP = 3;

export type SpendBucket = "need" | "want" | "savings" | "debt" | "uncategorised" | "transfer";

export type BudgetSpendRow = {
  userId: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  /** YYYY-MM-DD */
  entryDate: string;
  isTransfer?: boolean;
};

export type LessonDone = {
  userId: string;
  courseId: string;
  lessonId: string;
  completedAt: string;
};

export function spendBucket(row: Pick<BudgetSpendRow, "type" | "category" | "isTransfer">): SpendBucket {
  if (row.isTransfer || row.category === "transfers") return "transfer";
  if (row.type === "income") return "uncategorised";
  if (NEED.has(row.category)) return "need";
  if (WANT.has(row.category)) return "want";
  if (SAVINGS.has(row.category)) return "savings";
  if (DEBT.has(row.category)) return "debt";
  return "uncategorised";
}

export type WindowSpend = {
  days: number;
  income: number;
  need: number;
  want: number;
  savings: number;
  debt: number;
  uncategorised: number;
  expenseRows: number;
  /** Wants / (needs + wants). Null when classified spend is zero. */
  wantSharePct: number | null;
  /** Savings category / income. Null without income. */
  savingsRatePct: number | null;
  /** (needs + wants + debt + uncategorised) / income. Transfers excluded. */
  spendRatePct: number | null;
};

export function emptyWindow(days: number): WindowSpend {
  return {
    days,
    income: 0,
    need: 0,
    want: 0,
    savings: 0,
    debt: 0,
    uncategorised: 0,
    expenseRows: 0,
    wantSharePct: null,
    savingsRatePct: null,
    spendRatePct: null,
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Inclusive start, exclusive end. Dates are YYYY-MM-DD compared lexicographically. */
export function windowSpend(rows: BudgetSpendRow[], start: string, end: string): WindowSpend {
  const days = Math.max(0, Math.round((Date.parse(end) - Date.parse(start)) / 86_400_000));
  const w = emptyWindow(days);
  for (const row of rows) {
    if (row.entryDate < start || row.entryDate >= end) continue;
    const amount = Number(row.amount);
    if (!Number.isFinite(amount) || amount <= 0) continue;
    if (row.type === "income") {
      if (row.isTransfer || row.category === "transfers") continue;
      w.income += amount;
      continue;
    }
    const bucket = spendBucket(row);
    if (bucket === "transfer") continue;
    w.expenseRows += 1;
    if (bucket === "need") w.need += amount;
    else if (bucket === "want") w.want += amount;
    else if (bucket === "savings") w.savings += amount;
    else if (bucket === "debt") w.debt += amount;
    else w.uncategorised += amount;
  }
  const classified = w.need + w.want;
  w.wantSharePct = classified > 0 ? round1((w.want / classified) * 100) : null;
  w.savingsRatePct = w.income > 0 ? round1((w.savings / w.income) * 100) : null;
  const spent = w.need + w.want + w.debt + w.uncategorised;
  w.spendRatePct = w.income > 0 ? round1((spent / w.income) * 100) : null;
  w.income = round1(w.income);
  w.need = round1(w.need);
  w.want = round1(w.want);
  w.savings = round1(w.savings);
  w.debt = round1(w.debt);
  w.uncategorised = round1(w.uncategorised);
  return w;
}

export function addDays(isoDate: string, days: number): string {
  const t = Date.parse(`${isoDate.slice(0, 10)}T00:00:00Z`);
  return new Date(t + days * 86_400_000).toISOString().slice(0, 10);
}

export function isoDate(iso: string): string {
  return iso.slice(0, 10);
}

export type Verdict = "improved" | "flat" | "worsened" | "insufficient";

export type PairCall = {
  verdict: Verdict;
  reason: string;
  before: WindowSpend;
  after: WindowSpend;
  wantShareDeltaPp: number | null;
  savingsRateDeltaPp: number | null;
};

export function comparable(before: WindowSpend, after: WindowSpend): string | null {
  if (before.days < MIN_WINDOW_DAYS || after.days < MIN_WINDOW_DAYS) {
    return `Need ${MIN_WINDOW_DAYS} days on both sides.`;
  }
  if (before.days !== after.days) return "Windows must be the same length.";
  if (before.expenseRows < MIN_EXPENSE_ROWS || after.expenseRows < MIN_EXPENSE_ROWS) {
    return `Need at least ${MIN_EXPENSE_ROWS} expense rows on both sides.`;
  }
  const beforeClassified = before.need + before.want;
  const afterClassified = after.need + after.want;
  if (beforeClassified < MIN_CLASSIFIED_RAND || afterClassified < MIN_CLASSIFIED_RAND) {
    return `Need at least R${MIN_CLASSIFIED_RAND} of needs+wants on both sides.`;
  }
  if (before.wantSharePct == null || after.wantSharePct == null) return "Want share is not computable.";
  return null;
}

/**
 * Primary signal is want share (the Needs vs Wants lesson). Savings rate is a
 * tie-break when want share is flat and both sides have income.
 */
export function callPair(before: WindowSpend, after: WindowSpend): PairCall {
  const block = comparable(before, after);
  if (block) {
    return {
      verdict: "insufficient",
      reason: block,
      before,
      after,
      wantShareDeltaPp: null,
      savingsRateDeltaPp: null,
    };
  }
  const wantShareDeltaPp = round1((after.wantSharePct ?? 0) - (before.wantSharePct ?? 0));
  const savingsRateDeltaPp =
    before.savingsRatePct != null && after.savingsRatePct != null
      ? round1(after.savingsRatePct - before.savingsRatePct)
      : null;

  let verdict: Verdict = "flat";
  let reason = `Want share moved ${wantShareDeltaPp} points. Under ${MATERIAL_PP} points counts as flat.`;
  if (wantShareDeltaPp <= -MATERIAL_PP) {
    verdict = "improved";
    reason = `Wants fell from ${before.wantSharePct}% to ${after.wantSharePct}% of classified spend.`;
  } else if (wantShareDeltaPp >= MATERIAL_PP) {
    verdict = "worsened";
    reason = `Wants rose from ${before.wantSharePct}% to ${after.wantSharePct}% of classified spend.`;
  } else if (savingsRateDeltaPp != null && savingsRateDeltaPp >= MATERIAL_PP) {
    verdict = "improved";
    reason = `Want share was flat. Savings rate rose ${savingsRateDeltaPp} points.`;
  } else if (savingsRateDeltaPp != null && savingsRateDeltaPp <= -MATERIAL_PP) {
    verdict = "worsened";
    reason = `Want share was flat. Savings rate fell ${savingsRateDeltaPp} points.`;
  }
  return { verdict, reason, before, after, wantShareDeltaPp, savingsRateDeltaPp };
}

export type OutcomeCheck = {
  id: string;
  label: string;
  courseId: string;
  /** Null means the whole course must be finished. */
  lessonId: string | null;
  lessonIds?: string[];
};

export const OUTCOME_CHECKS: OutcomeCheck[] = [
  {
    id: "needs-vs-wants",
    label: "Needs vs Wants",
    courseId: "money-basics",
    lessonId: "lesson-2",
  },
  {
    id: "impulse-buys",
    label: "Avoiding Impulse Buys",
    courseId: "money-basics",
    lessonId: "lesson-6",
  },
  {
    id: "money-basics",
    label: "Money Basics course",
    courseId: "money-basics",
    lessonId: null,
    lessonIds: ["lesson-1", "lesson-2", "lesson-3", "lesson-4", "lesson-5", "lesson-6"],
  },
];

export type UserPair = {
  userId: string;
  username: string | null;
  completedAt: string;
  call: PairCall;
};

export type OutcomeSummary = {
  id: string;
  label: string;
  finished: number;
  comparable: number;
  improved: number;
  flat: number;
  worsened: number;
  insufficient: number;
  medianWantShareDeltaPp: number | null;
  note: string;
  pairs: UserPair[];
};

function median(values: number[]): number | null {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : round1((s[mid - 1] + s[mid]) / 2);
}

export function firstCompletion(
  done: LessonDone[],
  userId: string,
  check: OutcomeCheck
): string | null {
  const rows = done.filter((d) => d.userId === userId && d.courseId === check.courseId);
  if (check.lessonId) {
    const hits = rows.filter((d) => d.lessonId === check.lessonId).map((d) => d.completedAt);
    if (!hits.length) return null;
    return hits.sort()[0];
  }
  const need = check.lessonIds ?? [];
  if (!need.length) return null;
  const earliest = new Map<string, string>();
  for (const row of rows) {
    const prev = earliest.get(row.lessonId);
    if (!prev || row.completedAt < prev) earliest.set(row.lessonId, row.completedAt);
  }
  if (!need.every((id) => earliest.has(id))) return null;
  return need.map((id) => earliest.get(id)!).sort().at(-1) ?? null;
}

export function lessonWindow(
  rows: BudgetSpendRow[],
  completedAt: string,
  today: string
): { before: WindowSpend; after: WindowSpend } | null {
  const done = isoDate(completedAt);
  const endCap = isoDate(today);
  const afterAvailable = Math.round((Date.parse(endCap) - Date.parse(done)) / 86_400_000);
  const days = Math.min(30, afterAvailable);
  if (days < MIN_WINDOW_DAYS) return null;
  const beforeStart = addDays(done, -days);
  const afterEnd = addDays(done, days);
  return {
    before: windowSpend(rows, beforeStart, done),
    after: windowSpend(rows, done, afterEnd),
  };
}

export function summariseCheck(
  check: OutcomeCheck,
  done: LessonDone[],
  byUser: Map<string, BudgetSpendRow[]>,
  names: Map<string, string | null>,
  today: string
): OutcomeSummary {
  const userIds = new Set(done.filter((d) => d.courseId === check.courseId).map((d) => d.userId));
  const pairs: UserPair[] = [];
  let finished = 0;
  for (const userId of userIds) {
    const completedAt = firstCompletion(done, userId, check);
    if (!completedAt) continue;
    finished += 1;
    const windows = lessonWindow(byUser.get(userId) ?? [], completedAt, today);
    const call = windows
      ? callPair(windows.before, windows.after)
      : {
          verdict: "insufficient" as const,
          reason: `After window is under ${MIN_WINDOW_DAYS} days. Check again once the month has passed.`,
          before: emptyWindow(0),
          after: emptyWindow(0),
          wantShareDeltaPp: null,
          savingsRateDeltaPp: null,
        };
    pairs.push({ userId, username: names.get(userId) ?? null, completedAt, call });
  }
  const comparablePairs = pairs.filter((p) => p.call.verdict !== "insufficient");
  const deltas = comparablePairs
    .map((p) => p.call.wantShareDeltaPp)
    .filter((n): n is number => n != null);
  return {
    id: check.id,
    label: check.label,
    finished,
    comparable: comparablePairs.length,
    improved: pairs.filter((p) => p.call.verdict === "improved").length,
    flat: pairs.filter((p) => p.call.verdict === "flat").length,
    worsened: pairs.filter((p) => p.call.verdict === "worsened").length,
    insufficient: pairs.filter((p) => p.call.verdict === "insufficient").length,
    medianWantShareDeltaPp: median(deltas),
    note:
      "Before is the same number of days immediately before the first completion. After starts that day. Transfers are excluded. A shift under 3 points is flat.",
    pairs: pairs.sort((a, b) => (a.call.wantShareDeltaPp ?? 99) - (b.call.wantShareDeltaPp ?? 99)),
  };
}

export type JoinCall = UserPair & { joinedAt: string };

export function sinceJoining(
  userId: string,
  joinedAt: string,
  rows: BudgetSpendRow[],
  today: string,
  username: string | null
): JoinCall {
  const start = isoDate(joinedAt);
  const endCap = isoDate(today);
  const span = Math.round((Date.parse(endCap) - Date.parse(start)) / 86_400_000);
  if (span < MIN_WINDOW_DAYS * 2) {
    return {
      userId,
      username,
      joinedAt,
      completedAt: joinedAt,
      call: {
        verdict: "insufficient",
        reason: "Need at least 28 days since joining before the first and latest windows can be separate.",
        before: emptyWindow(0),
        after: emptyWindow(0),
        wantShareDeltaPp: null,
        savingsRateDeltaPp: null,
      },
    };
  }
  const days = 30;
  const firstEnd = addDays(start, days);
  const latestStart = addDays(endCap, -days);
  if (latestStart < firstEnd) {
    return {
      userId,
      username,
      joinedAt,
      completedAt: joinedAt,
      call: {
        verdict: "insufficient",
        reason: "First and latest 30-day windows still overlap.",
        before: emptyWindow(days),
        after: emptyWindow(days),
        wantShareDeltaPp: null,
        savingsRateDeltaPp: null,
      },
    };
  }
  const before = windowSpend(rows, start, firstEnd);
  const after = windowSpend(rows, latestStart, endCap);
  return {
    userId,
    username,
    joinedAt,
    completedAt: joinedAt,
    call: callPair(before, after),
  };
}

export function summariseJoining(calls: JoinCall[]): OutcomeSummary {
  const comparablePairs = calls.filter((p) => p.call.verdict !== "insufficient");
  const deltas = comparablePairs
    .map((p) => p.call.wantShareDeltaPp)
    .filter((n): n is number => n != null);
  return {
    id: "since-joining",
    label: "Since joining Notho",
    finished: calls.length,
    comparable: comparablePairs.length,
    improved: calls.filter((p) => p.call.verdict === "improved").length,
    flat: calls.filter((p) => p.call.verdict === "flat").length,
    worsened: calls.filter((p) => p.call.verdict === "worsened").length,
    insufficient: calls.filter((p) => p.call.verdict === "insufficient").length,
    medianWantShareDeltaPp: median(deltas),
    note:
      "First 30 days after the account was created, against the latest 30 days. Only counted when the two windows do not overlap and both have real classified spend. This is not a causal claim.",
    pairs: calls.sort((a, b) => (a.call.wantShareDeltaPp ?? 99) - (b.call.wantShareDeltaPp ?? 99)),
  };
}
