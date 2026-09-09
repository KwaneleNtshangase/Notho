import type { CategoryGroup, CategoryMeta } from "./types";

export const STATIC_EXPENSE_CATEGORIES: Record<
  string,
  { name: string; color: string; group: CategoryGroup }
> = {
  food: { name: "Food & Groceries", color: "#007A85", group: "needs" },
  transport: { name: "Transport", color: "#EFB343", group: "needs" },
  housing: { name: "Housing/Rent", color: "#3B7DD8", group: "needs" },
  debt: { name: "Debt Repayments", color: "#E03C31", group: "goals" },
  savings: { name: "Savings", color: "#00BFA5", group: "goals" },
  entertainment: { name: "Entertainment", color: "#7C4DFF", group: "wants" },
  airtime: { name: "Airtime & Data", color: "#F57C00", group: "needs" },
  healthcare: { name: "Healthcare", color: "#C2185B", group: "needs" },
  // Was #1976D2, which sat at CIE ΔE 3.8 from housing's #3B7DD8 - below the
  // ~2.3 just-noticeable-difference threshold, so the two were effectively the
  // same blue in the report chart. Now ΔE 39.6 from its nearest neighbour.
  education: { name: "Education", color: "#2E7D32", group: "needs" },
  other: { name: "Other", color: "#9E9E9E", group: "unclassified" },
  transfers: { name: "Transfers", color: "#6B7280", group: "unclassified" },
};

export const STATIC_INCOME_CATEGORIES: Record<string, { name: string }> = {
  salary: { name: "Salary / Wages" },
  freelance: { name: "Freelance" },
  business: { name: "Business Income" },
  "other-income": { name: "Other Income" },
};

/**
 * Savings-vehicle detection: money in these categories is "set aside", not
 * consumed. A stokvel contribution is a transfer into a communal savings
 * pool, not a sunk cost - counting it as plain spending both inflates
 * expenses and understates the user's real savings habit.
 */
const SAVINGS_VEHICLE_NAME = /\b(stokvel|umgalelo|umshayelwano|invest(ment)?s?|savings?|save|emergency fund|tfsa|unit trust)\b/i;

export function isSavingsVehicleCategory(categoryId: string, name: string): boolean {
  if (categoryId === "savings") return true;
  return SAVINGS_VEHICLE_NAME.test(`${categoryId} ${name}`);
}

/** Heuristic grouping for custom category names (SA-aware). */
const NEEDS_NAME =
  /\b(rent|bond|housing|electric|water|utilit|grocer|food|transport|taxi|bus|fuel|petrol|medical|health|clinic|school|tuition|educat|data|airtime|insurance|funeral cover|bank (charge|fee)s?|fees?|family|black tax|tithe|church|donation|childcare|creche)\b/i;
const WANTS_NAME =
  /\b(entertain|takeaway|take-away|eating out|restaurant|dstv|netflix|showmax|spotify|streaming|subscriptions?|clothing|clothes|apparel|fashion|shoes|retail|shopping|beauty|salon|hair|nails|cosmetic|hobby|gym|fitness|travel|holiday|vacation|gaming|games?|alcohol|liquor|bar|braai|gifts?|presents?|lobola|jewel|electronics|gadget)\b/i;
const GOALS_NAME = /\b(debt|loan|repay|credit card|account payment)\b/i;
// Side-hustle costs are labelled spend, NOT "unclassified" - lumping them in
// with unknown money would inflate the data-quality problem they don't have.
const BUSINESS_NAME = /\b(business|side ?hustle|stock|inventory|supplier|resale|trading|spaza)\b/i;

export function groupForCategory(
  categoryId: string,
  name: string,
  isVehicle: boolean
): CategoryGroup {
  const staticMeta = STATIC_EXPENSE_CATEGORIES[categoryId];
  if (staticMeta) return staticMeta.group;
  if (isVehicle) return "goals";
  const probe = `${categoryId} ${name}`;
  if (GOALS_NAME.test(probe)) return "goals";
  if (BUSINESS_NAME.test(probe)) return "business";
  if (NEEDS_NAME.test(probe)) return "needs";
  if (WANTS_NAME.test(probe)) return "wants";
  return "unclassified";
}

export type ResolvedCategoryMeta = {
  name: string;
  color: string;
  type: "expense" | "income";
  group: CategoryGroup;
  isSavingsVehicle: boolean;
};

export function resolveCategoryMeta(
  categoryId: string,
  customCategories: CategoryMeta[]
): ResolvedCategoryMeta {
  const custom = customCategories.find((c) => c.id === categoryId);
  if (custom) {
    const vehicle = isSavingsVehicleCategory(categoryId, custom.name);
    return {
      name: custom.name,
      color: custom.color,
      type: custom.type,
      group: groupForCategory(categoryId, custom.name, vehicle),
      isSavingsVehicle: vehicle,
    };
  }
  const exp = STATIC_EXPENSE_CATEGORIES[categoryId];
  if (exp) {
    return {
      name: exp.name,
      color: exp.color,
      type: "expense",
      group: exp.group,
      isSavingsVehicle: categoryId === "savings",
    };
  }
  const inc = STATIC_INCOME_CATEGORIES[categoryId];
  if (inc) {
    return { name: inc.name, color: "#007A85", type: "income", group: "unclassified", isSavingsVehicle: false };
  }
  const vehicle = isSavingsVehicleCategory(categoryId, categoryId);
  return {
    name: categoryId,
    color: "#9E9E9E",
    type: "expense",
    group: groupForCategory(categoryId, categoryId, vehicle),
    isSavingsVehicle: vehicle,
  };
}
