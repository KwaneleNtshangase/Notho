/**
 * The exit taxonomy: why people leave, and what we offer them instead.
 *
 * One list, shared by all three exit doors (the in-app delete flow, the public
 * unsubscribe page, the win-back email). If the reason codes ever drift apart
 * per surface, the dashboard stops being able to compare them and the whole
 * exercise collapses into three unrelated piles of text.
 *
 * The codes here must stay in sync with the CHECK constraint on
 * exit_feedback.reason. Adding one means a migration.
 */

export type ExitType = "account_deletion" | "email_unsubscribe" | "inactive_survey";

export type ReasonCode =
  | "too_many_emails"
  | "not_useful"
  | "too_hard"
  | "too_easy"
  | "no_time"
  | "technical"
  | "privacy"
  | "found_alternative"
  | "other";

/**
 * What a save offer can actually do. Every offer resolves to one of these, and
 * every action is something the product can genuinely deliver today — an offer
 * we cannot honour is worse than no offer.
 */
export type OfferAction =
  | "email_weekly"     // collapse lifecycle mail to one weekly summary
  | "email_pause_30"   // snooze all non-transactional mail for 30 days
  | "email_off_keep"   // stop all email, keep the account
  | "delete_budget"    // erase the bank/budget data only, keep learning progress
  | "report_bug"       // open the existing feedback modal / support address
  | "goto_basics"      // point at the beginner track
  | "goto_advanced";   // point at the harder material

export type SaveOffer = {
  action: OfferAction;
  /** Headline. Written as a concrete alternative, never as a plea to stay. */
  title: string;
  body: string;
  /** Label on the accept button. */
  cta: string;
};

export type ReasonDef = {
  code: ReasonCode;
  /** Shown in the picker. Plain, first-person, no product jargon. */
  label: string;
  /** Placeholder for the free-text box, tailored so the box gets used. */
  prompt: string;
  /**
   * Offers keyed by exit door. A reason means something different depending on
   * where it was given: "too many emails" from the unsubscribe page needs a
   * frequency choice, the same reason from the delete dialog needs to make
   * clear that turning email off does not require deleting the account.
   */
  offers: Partial<Record<ExitType, SaveOffer>>;
};

const OFFER_WEEKLY: SaveOffer = {
  action: "email_weekly",
  title: "One email a week instead?",
  body: "We can drop you to a single weekly summary. Same progress, a lot less inbox.",
  cta: "Switch to weekly",
};

const OFFER_PAUSE: SaveOffer = {
  action: "email_pause_30",
  title: "Take a month off?",
  body: "We can pause every email for 30 days. Your streak freeze holds and nothing else changes.",
  cta: "Pause for 30 days",
};

const OFFER_EMAIL_OFF_KEEP_ACCOUNT: SaveOffer = {
  action: "email_off_keep",
  title: "You can stop the emails without losing your progress",
  body: "We can switch off every email and leave your account, XP and streak exactly as they are.",
  cta: "Just stop the emails",
};

const OFFER_DELETE_BUDGET_ONLY: SaveOffer = {
  action: "delete_budget",
  title: "Delete the financial data only?",
  body:
    "We can erase your imported statements, transactions and budgets right now, " +
    "and keep your learning progress. Nothing from your bank stays behind.",
  cta: "Delete my financial data only",
};

const OFFER_REPORT_BUG: SaveOffer = {
  action: "report_bug",
  title: "Tell us what broke and we will fix it",
  body: "Most bugs people hit are known and already queued. Say what happened and we will come back to you.",
  cta: "Report it instead",
};

export const REASONS: ReasonDef[] = [
  {
    code: "no_time",
    label: "I don't have the time right now",
    prompt: "What would have made it easier to fit in?",
    offers: {
      account_deletion: OFFER_PAUSE,
      email_unsubscribe: OFFER_PAUSE,
      inactive_survey: OFFER_PAUSE,
    },
  },
  {
    code: "too_many_emails",
    label: "Too many emails from Notho",
    prompt: "How often would you have wanted to hear from us?",
    offers: {
      account_deletion: OFFER_EMAIL_OFF_KEEP_ACCOUNT,
      email_unsubscribe: OFFER_WEEKLY,
      inactive_survey: OFFER_WEEKLY,
    },
  },
  {
    code: "not_useful",
    label: "The content wasn't useful to me",
    prompt: "What were you hoping to learn that wasn't there?",
    // No offer. Somebody telling us the product missed is not going to be
    // talked round by a settings change, and pretending otherwise wastes the
    // one moment they are willing to be honest with us.
    offers: {},
  },
  {
    code: "too_hard",
    label: "The lessons were too hard or confusing",
    prompt: "Which lesson or topic lost you?",
    offers: {
      account_deletion: {
        action: "goto_basics",
        title: "Start from the basics instead?",
        body: "Money Basics assumes nothing and moves slowly. Most people who found the app hard started in the wrong place.",
        cta: "Take me there",
      },
      inactive_survey: {
        action: "goto_basics",
        title: "Start from the basics instead?",
        body: "Money Basics assumes nothing and moves slowly. It may be a better fit than where you were.",
        cta: "Take me there",
      },
    },
  },
  {
    code: "too_easy",
    label: "I already knew this stuff",
    prompt: "What level were you looking for?",
    offers: {
      account_deletion: {
        action: "goto_advanced",
        title: "There is harder material",
        body: "Investing, tax and credit go well past the basics. Worth a look before you go.",
        cta: "Show me",
      },
      inactive_survey: {
        action: "goto_advanced",
        title: "There is harder material",
        body: "Investing, tax and credit go well past the basics.",
        cta: "Show me",
      },
    },
  },
  {
    code: "technical",
    label: "The app was buggy or too slow",
    prompt: "What went wrong? Anything you remember helps.",
    offers: {
      account_deletion: OFFER_REPORT_BUG,
      inactive_survey: OFFER_REPORT_BUG,
    },
  },
  {
    code: "privacy",
    label: "I'm not comfortable with my financial data being here",
    prompt: "What would have made you feel safer?",
    offers: {
      // The honest offer, and the one a person with this concern actually
      // wants: the sensitive data gone immediately, without having to trust us
      // with a full-account delete first.
      account_deletion: OFFER_DELETE_BUDGET_ONLY,
    },
  },
  {
    code: "found_alternative",
    label: "I'm using something else now",
    prompt: "What are you using? No hard feelings, it genuinely helps to know.",
    offers: {},
  },
  {
    code: "other",
    label: "Something else",
    prompt: "Tell us what happened.",
    offers: {},
  },
];

export const REASON_BY_CODE: Record<string, ReasonDef> = Object.fromEntries(
  REASONS.map((r) => [r.code, r]),
);

export function isReasonCode(v: unknown): v is ReasonCode {
  return typeof v === "string" && v in REASON_BY_CODE;
}

/** The reasons worth showing at a given door, in the order they should appear. */
export function reasonsFor(exit: ExitType): ReasonDef[] {
  if (exit === "email_unsubscribe") {
    // Someone unsubscribing from email is answering a question about email.
    // Offering them "the lessons were too hard" invites a mis-click that then
    // pollutes the content data.
    return REASONS.filter((r) =>
      ["too_many_emails", "no_time", "not_useful", "found_alternative", "privacy", "other"].includes(r.code),
    );
  }
  return REASONS;
}

export function offerFor(exit: ExitType, code: ReasonCode | null): SaveOffer | null {
  if (!code) return null;
  return REASON_BY_CODE[code]?.offers[exit] ?? null;
}

/** Max free-text length. Mirrored by the CHECK constraint on exit_feedback.detail. */
export const DETAIL_MAX = 1000;
