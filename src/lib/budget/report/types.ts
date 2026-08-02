/** Cents-based report model - all monetary fields are integer cents. */

export type BudgetEntryInput = {
  id?: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  description?: string | null;
  entry_date: string;
  is_transfer?: boolean;
  account_label?: string | null;
};

export type BudgetTargetInput = {
  category: string;
  monthly_limit: number;
  month_year: string;
};

export type CategoryMeta = {
  id: string;
  name: string;
  color: string;
  type: "expense" | "income";
};

/**
 * Spending groups, loosely following the 50/30/20 guideline:
 *   needs        - essentials & obligations (rent, food, transport, family support)
 *   wants        - lifestyle & discretionary
 *   goals        - money set aside or paying down debt (savings, stokvel, debt)
 *   business     - side-hustle costs; labelled spend that isn't personal consumption
 *   unclassified - "Other" and anything we genuinely can't place
 */
export type CategoryGroup = "needs" | "wants" | "goals" | "business" | "unclassified";

export type ExpenseCategoryRow = {
  categoryId: string;
  categoryName: string;
  color: string;
  group: CategoryGroup;
  /** True when this category is a savings vehicle (Savings, Stokvel, Investments…). */
  isSavingsVehicle: boolean;
  /** True when a budget exists for this category in the period. */
  hasBudget: boolean;
  budgetedCents: number;
  actualCents: number;
  varianceCents: number;
  variancePct: number | null;
  sharePct: number;
  overBudget: boolean;
};

export type IncomeCategoryRow = {
  categoryId: string;
  categoryName: string;
  actualCents: number;
  sharePct: number;
};

export type MerchantInsight = {
  /** Cleaned, display-ready merchant name. */
  description: string;
  totalCents: number;
  /** Number of transactions grouped under this merchant. */
  count: number;
  /** Display name of the category this merchant most often falls under. A
   *  merchant can span categories, so this is the modal one, not the only one.
   *  Used by PDF redaction to label a hidden counterparty by what it was for. */
  categoryName: string;
};

/** A detected recurring payment: same counterparty, similar amount, 3+ months. */
export type RecurringCommitment = {
  description: string;
  categoryName: string;
  group: CategoryGroup;
  /** Typical (median) amount per occurrence. */
  typicalCents: number;
  count: number;
  totalCents: number;
  /** Number of distinct months the payment appeared in. */
  monthsSeen: number;
};

export type LargestTxn = {
  id?: string;
  description: string;
  category: string;
  categoryName: string;
  cents: number;
  date: string;
};

export type MonthlySpend = {
  monthYear: string;
  label: string;
  /** ALL expense outflows this month (day-to-day + set-aside). */
  expenseCents: number;
  /** Outflows into savings vehicles this month. */
  setAsideCents: number;
  /** expenseCents - setAsideCents: day-to-day spending, matches the headline. */
  consumptionCents: number;
  incomeCents: number;
  /** income - expense (all outflows) = surplus/shortfall for the month. */
  netCents: number;
  /** True when the report period covers only part of this calendar month. */
  isPartial: boolean;
  daysCovered: number;
  daysInMonth: number;
};

/** Comparison against the immediately preceding period of equal length. */
export type PeriodComparison = {
  prevStart: string;
  prevEnd: string;
  prevIncomeCents: number;
  prevExpenseCents: number;
  prevSetAsideCents: number;
  /** Percentage deltas (current vs previous); null when previous is zero. */
  incomeDeltaPct: number | null;
  expenseDeltaPct: number | null;
  setAsideDeltaPct: number | null;
};

export type DataQuality = {
  /** Share of expenses sitting in "Other"/unresolvable categories (0-100). */
  unclassifiedExpenseSharePct: number;
  /** Share of income sitting in "Other income" (0-100). */
  otherIncomeSharePct: number;
  /** Expense transactions with no usable description. */
  unlabelledCount: number;
};

export type SpendProjection = {
  /** Average monthly spend over COMPLETE months in the period; null if none. */
  avgMonthlyExpenseCents: number | null;
  /** avgMonthly x 12; null if no complete month. */
  annualisedExpenseCents: number | null;
  monthsUsed: number;
};

export type InsightTone = "good" | "warn" | "bad" | "info";

export type ReportHighlight = { tone: InsightTone; text: string };

export type HealthComponent = {
  label: string;
  score: number;
  max: number;
  tone: InsightTone;
  note: string;
};

export type ReportAction = {
  /** Stable machine id ("recategorise", "trim-food"…) so the NEXT report can
   *  check whether this action's metric actually moved. */
  id: string;
  title: string;
  detail: string;
  /** Estimated effect, e.g. "≈ +6% savings rate". */
  impact?: string;
  lesson?: { courseId: string; lessonId: string; title: string };
  /** The single action to do if the user does nothing else. */
  isTopPriority?: boolean;
};

export type ReportBenchmark = {
  label: string;
  /** The user's value, formatted for display (e.g. "12%"). */
  value: string;
  /** The guideline, e.g. "20% or more". */
  target: string;
  tone: InsightTone;
};

export type ReportInsights = {
  /** One-sentence "how did I do" verdict, adapting to the period's story. */
  verdict: string;
  /** 0-100 composite financial health score for the period (after any cap). */
  healthScore: number;
  /** Component sum before the data-quality cap; equals healthScore when uncapped. */
  healthScoreRaw: number;
  /** Set when poor data quality capped the score - shown next to the score. */
  healthCapNote: string | null;
  healthBand: "Strong" | "Steady" | "Fragile" | "Needs attention";
  healthComponents: HealthComponent[];
  /** Cover-page highlights (max 4). */
  highlights: ReportHighlight[];
  /** Cosmo narrative - plain sentences built from computed figures. */
  coachParagraphs: string[];
  wins: string[];
  risks: string[];
  /** 3-5 prioritised next steps with estimated impact. */
  actions: ReportAction[];
  benchmarks: ReportBenchmark[];
  /** Set when unclassified spend is high enough to distort the report. */
  dataQualityAlert: string | null;
};

/** One detected behavioural pattern (confidence-gated, never speculative). */
export type BehaviourPattern = {
  id: string;
  tone: InsightTone;
  title: string;
  detail: string;
};

/** Identity derived ONLY from stable signals across ≥3 complete months. */
export type MoneyPersonality = {
  id: "saver" | "builder" | "planner" | "maximiser" | "impulse";
  label: string;
  /** Plain-number facts that earned the label - always shown with it. */
  evidence: string[];
};

export type ReportBehaviour = {
  patterns: BehaviourPattern[];
  /** Null until enough history supports a stable read. */
  personality: MoneyPersonality | null;
  /** Complete months of history the analysis is based on. */
  monthsAnalysed: number;
};

/**
 * The metric snapshot persisted per (user, period) in `report_snapshots`.
 * Everything needed for trends, streaks and mission follow-through WITHOUT
 * rebuilding the report - plus a fingerprint so edited history invalidates
 * the snapshot instead of serving stale numbers.
 */
export type ReportSnapshotMetrics = {
  healthScore: number;
  healthBand: string;
  verdict: string;
  savingsRatePct: number;
  netCents: number;
  incomeCents: number;
  consumptionCents: number;
  setAsideCents: number;
  unclassifiedPct: number;
  debtSharePct: number;
  /** Share of day-to-day spend covered by budgets (0-100). */
  budgetCoveredPct: number;
  misalignedBudgetCount: number;
  /** Complete months the period spanned. */
  months: number;
  topActionId: string | null;
  topActionTitle: string | null;
  /** For trim-<category> missions: that category's per-month spend then. */
  trimCategoryMonthlyCents: number | null;
  /** Fingerprint of the entries+targets the snapshot was computed from. */
  fpCount: number;
  fpSumCents: number;
  /** Order-independent hash of category/type/amount/date - catches in-place
   *  recategorisation, which count+sum alone would miss. */
  fpMix: number;
};

export type ReportBuildOptions = {
  /** Categories to treat as savings vehicles, overriding auto-detection. */
  savingsCategoryIds?: string[];
  /** Entries for the preceding equal-length period (enables comparison). */
  prevEntries?: BudgetEntryInput[];
  prevStart?: string;
  prevEnd?: string;
  /**
   * Wider history (e.g. trailing 12 months) used ONLY for recurring-commitment
   * detection, so a monthly payment still hits the 3-month threshold even in a
   * single-month report. Falls back to the period's own entries when absent.
   */
  historyEntries?: BudgetEntryInput[];
  /**
   * First day the history window covers. Behaviour detection uses it to know
   * which months are truncated by the window (and must not be analysed).
   */
  historyStart?: string;
};

export type ReportModel = {
  periodStart: string;
  periodEnd: string;
  displayName: string;
  generatedAt: string;
  totalIncomeCents: number;
  /** ALL expense-side outflows, including money set aside. */
  totalExpenseCents: number;
  /** Outflows into savings vehicles (Savings, Stokvel, Investments…). */
  setAsideCents: number;
  /** totalExpenseCents - setAsideCents: money actually consumed. */
  consumptionCents: number;
  netCents: number;
  /** setAside / income - money deliberately put away, not the leftover. */
  savingsRatePct: number;
  /** Sum of ALL category budgets in the period (incl. savings vehicles). */
  totalBudgetedExpenseCents: number;
  /**
   * Day-to-day (non-vehicle) budget comparison. Savings vehicles are excluded
   * here - "over-contributing" to a stokvel is not overspending - and get
   * their own plan-vs-actual figures below.
   */
  dayToDayBudgetedCents: number;
  /** Actual day-to-day spend within budgeted non-vehicle categories. */
  budgetedActualCents: number;
  /** Day-to-day spend in categories that have no budget at all. */
  unbudgetedActualCents: number;
  /** budgetedActual - dayToDayBudgeted (like-for-like variance). */
  budgetVarianceCents: number;
  /** budgetedActual / dayToDayBudgeted, null when no day-to-day budgets. */
  budgetUsedPct: number | null;
  /** Planned contributions to savings vehicles (their budgets). */
  setAsidePlannedCents: number;
  budgetIsEstimate: boolean;
  /** Totals per spending group across ALL expense outflows. */
  groupTotals: Record<CategoryGroup, number>;
  expenseCategories: ExpenseCategoryRow[];
  incomeCategories: IncomeCategoryRow[];
  monthlySpend: MonthlySpend[];
  topMerchants: MerchantInsight[];
  recurringCommitments: RecurringCommitment[];
  /** Largest single transactions, with recurring merchants collapsed out. */
  largestTransactions: LargestTxn[];
  topOverBudget: ExpenseCategoryRow[];
  topUnderBudget: ExpenseCategoryRow[];
  comparison: PeriodComparison | null;
  dataQuality: DataQuality;
  projection: SpendProjection;
  /** Cross-month behavioural patterns + money personality (may be empty). */
  behaviour: ReportBehaviour;
  insights: ReportInsights;
};
