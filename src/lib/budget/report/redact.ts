/**
 * Counterparty redaction for the shareable PDF report.
 *
 * THE PROBLEM. A bank statement names the people you pay. `cleanMerchantName`
 * strips the bank's plumbing ("FNB App Payment To Mama Coka Imizamo" becomes
 * "Mama Coka Imizamo") but it deliberately keeps the counterparty, because on
 * screen that is exactly what the user wants to see - it is their own data on
 * their own device.
 *
 * The PDF is different. It is built to be shared: with a partner, a coach, a
 * WhatsApp group. Every name in it belongs to a third party who never signed up
 * for Notho and never agreed to be in that file. Under POPIA that is personal
 * information of a data subject we have no relationship with, and Notho is the
 * thing that packaged it into a portable document.
 *
 * THE APPROACH. Fail closed. A name is shown only when we can positively
 * identify it as a business; everything else is replaced with its category and
 * a stable letter. That ordering matters - an allowlist that misses a merchant
 * produces a slightly less useful report, whereas a blocklist that misses a
 * person produces a privacy incident.
 *
 * Businesses are recognised by reusing `BUILT_IN_RULES` - the SA merchant
 * dictionary the categoriser already maintains and tests. One dictionary, one
 * place to add Checkers or Vodacom, and redaction improves for free every time
 * someone extends categorisation.
 *
 * The on-screen report is intentionally NOT redacted. Redacting it would cost
 * the user real utility while protecting nobody: the risk is specifically the
 * file leaving the device.
 */

import { BUILT_IN_RULES } from "@/lib/categorisation";
import type { ReportModel } from "./types";

/**
 * Markers of a registered entity. Deliberately conservative.
 *
 * "Group", "Trust", "Fund" and "Society" are NOT here, tempting as they are: a
 * stokvel is very often registered as exactly that, and a family savings club
 * named "Dalitso Group" is a group of private individuals, not a company. When
 * a marker is ambiguous the fail-closed rule decides it - leave it out.
 */
const ENTITY_SUFFIX =
  /\b(\(pty\)\s*ltd|pty\s*ltd|\(pty\)|ltd\.?|limited|\bcc\b|\binc\.?\b|incorporated|holdings|municipality|city\s+of|university|college|school|hospital|clinic|pharmacy|supermarket|stores?|superette|filling\s+station|service\s+station)\b/i;

/**
 * Strings `cleanMerchantName` produces that carry no identity at all and so
 * need no protection - redacting them would only make the report worse.
 */
const NON_IDENTIFYING = /^(unlabelled|unknown|cash|atm|transfer|payment|deposit|withdrawal)$/i;

/** Cross-list identity key. Tolerates the different truncation lengths each
 *  list uses (top merchants clip at 34 chars, largest transactions at 44), so
 *  the same counterparty gets the same letter everywhere it appears. */
export function redactionKey(description: string): string {
  return description
    .replace(/[…]+$/, "")
    .replace(/\.{3}$/, "")
    .trim()
    .toLowerCase();
}

/**
 * Can this name be shown in a shared document?
 *
 * True only for a positively identified business. Note this runs on the CLEANED
 * name, which has already had rail prefixes ("PayShap payment to", "FNB App
 * Payment To") stripped - so we cannot use those as person signals. We do not
 * need to: fail-closed means the absence of a business signal is enough.
 */
export function isKnownBusiness(description: string): boolean {
  const name = description.trim();
  if (!name) return false;
  if (NON_IDENTIFYING.test(name)) return true;
  if (ENTITY_SUFFIX.test(name)) return true;
  return BUILT_IN_RULES.some((rule) => rule.pattern.test(name));
}

/** A, B, ... Z, AA, AB, ... - spreadsheet-column style, so a report with more
 *  than 26 redacted counterparties still reads sensibly. */
function letterFor(index: number): string {
  let n = index;
  let out = "";
  do {
    out = String.fromCharCode(65 + (n % 26)) + out;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return out;
}

/**
 * The category shown next to a masked counterparty is ALWAYS one the user
 * assigned to that counterparty - never inferred, never guessed, never the
 * most-common-of-several. Aggregate passes an empty string when a merchant's
 * transactions span more than one category, and we say "Uncategorised" rather
 * than picking a winner. Relabelling someone's rent as groceries in a document
 * they are about to share would be worse than saying nothing.
 */
function labelFor(categoryName: string | undefined, letter: string): string {
  const cat = (categoryName ?? "").trim();
  const clean = !cat || /^other$/i.test(cat) ? "Uncategorised" : cat;
  return `${clean} · person ${letter}`;
}

/**
 * Replace every private counterparty in the model with a category + letter.
 *
 * Pure: returns a new model, mutates nothing. The caller renders the PDF from
 * the result while the on-screen report keeps using the original.
 *
 * Letters are assigned in a fixed traversal order (recurring, then merchants,
 * then largest transactions) so the same report always redacts identically -
 * two exports of the same period produce byte-comparable output, which matters
 * for the snapshot tests and for a user comparing two downloads.
 */
export function redactReportModel(model: ReportModel): ReportModel {
  const assigned = new Map<string, string>();

  const labelOf = (description: string, categoryName?: string): string => {
    if (isKnownBusiness(description)) return description;
    const key = redactionKey(description);
    const existing = assigned.get(key);
    if (existing) return existing;
    const label = labelFor(categoryName, letterFor(assigned.size));
    assigned.set(key, label);
    return label;
  };

  const recurringCommitments = model.recurringCommitments.map((r) => ({
    ...r,
    description: labelOf(r.description, r.categoryName),
  }));

  const topMerchants = model.topMerchants.map((m) => ({
    ...m,
    description: labelOf(m.description, m.categoryName),
  }));

  const largestTransactions = model.largestTransactions.map((t) => ({
    ...t,
    description: labelOf(t.description, t.categoryName),
  }));

  return { ...model, recurringCommitments, topMerchants, largestTransactions };
}

/** How many counterparties a redacted export would hide. Drives the one-line
 *  footnote in the PDF, so the reader knows the report is complete but masked
 *  rather than quietly missing rows. */
export function countRedacted(model: ReportModel): number {
  const keys = new Set<string>();
  const add = (d: string) => {
    if (!isKnownBusiness(d)) keys.add(redactionKey(d));
  };
  model.recurringCommitments.forEach((r) => add(r.description));
  model.topMerchants.forEach((m) => add(m.description));
  model.largestTransactions.forEach((t) => add(t.description));
  return keys.size;
}
