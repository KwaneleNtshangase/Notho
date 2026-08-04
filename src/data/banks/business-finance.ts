import type { LessonLayoutItem, QuestionSlot } from "@/data/content";
import type { LessonBank } from "./money-basics";

/**
 * Bank for "Business Finance" (core lesson: Separate Your Money, Always).
 *
 * Figures verified/stable: VAT compulsory registration above R1 000 000 annual
 * taxable turnover; VAT rate 15%; VAT owed = output VAT collected − input VAT
 * paid. Provisional tax: two payments a year (end Aug, end Feb) for non-salary
 * earners; rule of thumb, set aside 25-35% of each payment. Reuses existing
 * concepts vat-threshold and provisional-tax; adds business-separation.
 */

// ═══════════════════════════════════════════════════════════════════════════
// Lesson · "Separate Your Money, Always"  (business-finance::business-vs-personal)
// ═══════════════════════════════════════════════════════════════════════════

const separateSlots: QuestionSlot[] = [
  {
    slotId: "business-finance/business-vs-personal/separate-accounts",
    conceptId: "business-separation",
    variants: [
      {
        variantId: "biz-sep-mcq",
        step: {
          type: "mcq",
          question: "Why should you keep separate business and personal bank accounts from day one?",
          options: [
            "To see if the business is profitable and keep clean records for SARS and lenders",
            "Because banks pay higher interest on business accounts",
            "To avoid paying any tax",
            "Because it's legally required for every side hustle",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Clean separation is how you measure profit, satisfy SARS, and qualify for business finance later.",
            incorrect: "The reason is clarity and clean records. Profitability, SARS, and access to finance. It's not about interest or dodging tax.",
          },
        },
      },
      {
        variantId: "biz-sep-tf",
        step: {
          type: "true-false",
          statement: "Running personal and business money through one account makes it hard to tell whether the business is actually profitable.",
          correct: true,
          feedback: {
            correct: "Right. Mixed transactions hide the real picture: you can't separate business performance from personal spending.",
            incorrect: "It does. When everything is mixed, profit is impossible to read cleanly, separate accounts fix that.",
          },
        },
      },
      {
        variantId: "biz-sep-sc",
        step: {
          type: "scenario",
          question: "Lindi runs everything through her personal account and can't tell whether her business makes money. What's the fix?",
          options: [
            "Open a separate business account and pay herself a set salary from it",
            "Try harder to remember which spend was which",
            "Only ever use cash",
            "Stop tracking and hope for the best",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A dedicated business account plus a defined salary makes profit visible and keeps SARS records clean.",
            incorrect: "The fix is structural: a separate business account and a set salary, not relying on memory or going cash-only.",
          },
        },
      },
    ],
  },
  {
    slotId: "business-finance/business-vs-personal/profit-not-personal",
    conceptId: "business-separation",
    variants: [
      {
        variantId: "biz-prof-tf",
        step: {
          type: "true-false",
          statement: "If your business makes R50 000 profit, you can immediately spend all of it as personal money.",
          correct: false,
          feedback: {
            correct: "Correct. Profit belongs to the business until it's properly paid out as salary or dividend, random withdrawals cause tax and tracking problems.",
            incorrect: "You can't. Business profit isn't personal money until formally distributed as salary or dividend. Grabbing it creates SARS complications.",
          },
        },
      },
      {
        variantId: "biz-prof-mcq",
        step: {
          type: "mcq",
          question: "Business profit becomes yours to spend when:",
          options: [
            "It's properly paid out as a salary or dividend",
            "The moment it lands in the account",
            "Automatically at year-end",
            "Never. You can't take money out",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Pay yourself deliberately (salary or dividend) so the books stay clean and SARS is satisfied.",
            incorrect: "It's yours once formally distributed as salary or dividend, not the instant it arrives, and not automatically.",
          },
        },
      },
      {
        variantId: "biz-prof-sc",
        step: {
          type: "scenario",
          question: "Why is randomly 'dipping into' the business account a problem?",
          options: [
            "It creates tax complications and hides whether the business is actually profitable",
            "It's a criminal offence",
            "Banks automatically block it",
            "It increases the VAT rate you pay",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Ad-hoc withdrawals muddy the books and your tax position. Pay yourself a set salary instead.",
            incorrect: "The real issue is messy books and tax complications, not criminality or bank blocks. Pay yourself a defined salary.",
          },
        },
      },
    ],
  },
  {
    slotId: "business-finance/business-vs-personal/vat",
    conceptId: "vat-threshold",
    variants: [
      {
        variantId: "biz-vat-mcq",
        step: {
          type: "mcq",
          question: "At what annual taxable turnover must a South African business register for VAT?",
          options: ["R1 000 000", "R500 000", "R5 000 000", "Any business that makes a sale"],
          correct: 0,
          feedback: {
            correct: "Right. Registration is compulsory above R1 000 000 turnover in a 12-month period (voluntary registration is possible from R50 000).",
            incorrect: "It's R1 000 000 of taxable turnover. Below that it's voluntary (from R50 000); above it, registration is compulsory.",
          },
        },
      },
      {
        variantId: "biz-vat-fill",
        step: {
          type: "fill-blank",
          title: "VAT is a pass-through",
          prompt: "You collected R12 000 VAT on sales and paid R6 000 VAT on business expenses. You owe SARS R____.",
          correct: 6000,
          feedback: {
            correct: "Right: output VAT collected (R12 000) − input VAT paid (R6 000) = R6 000 owed to SARS.",
            incorrect: "VAT owed = VAT collected − VAT paid on expenses = R12 000 − R6 000 = R6 000.",
          },
        },
      },
      {
        variantId: "biz-vat-tf",
        step: {
          type: "true-false",
          statement: "A VAT-registered business can claim back the VAT it pays on legitimate business expenses.",
          correct: true,
          feedback: {
            correct: "Right. You offset input VAT (paid on expenses) against output VAT (charged on sales) and pay SARS the difference.",
            incorrect: "It can. Registered businesses claim input VAT on expenses and remit only the net. That's why VAT is a pass-through.",
          },
        },
      },
    ],
  },
  {
    slotId: "business-finance/business-vs-personal/provisional-tax",
    conceptId: "provisional-tax",
    variants: [
      {
        variantId: "biz-prov-mcq",
        step: {
          type: "mcq",
          question: "As a self-employed consultant, a sensible rule of thumb is to set aside how much of each payment for tax?",
          options: ["About 25-35%", "Nothing until year-end", "Exactly 5%", "The full 100%"],
          correct: 0,
          feedback: {
            correct: "Right. Parking ~25-35% of each payment means the provisional tax bill doesn't blindside you.",
            incorrect: "Set aside roughly 25-35% of each payment. Waiting until year-end is exactly how the big SARS surprise happens.",
          },
        },
      },
      {
        variantId: "biz-prov-tf",
        step: {
          type: "true-false",
          statement: "Self-employed people pay provisional tax twice a year (around the end of August and the end of February).",
          correct: true,
          feedback: {
            correct: "Right. Two estimates a year (Aug and Feb), with an optional top-up: it spreads the tax across the year instead of one lump.",
            incorrect: "They do. Two provisional payments a year, roughly end of August and end of February, plus an optional top-up.",
          },
        },
      },
      {
        variantId: "biz-prov-sc",
        step: {
          type: "scenario",
          question: "Thabo earns R80 000/month consulting, spends it all, and gets a R280 000 SARS bill at year-end. What should he have done?",
          options: [
            "Set aside ~30% monthly and paid provisional tax twice a year",
            "Nothing, SARS shouldn't tax the self-employed",
            "Registered a company purely to avoid tax",
            "Kept his earnings artificially low",
          ],
          correct: 0,
          feedback: {
            correct: "Right. ~30% of R960 000 ≈ R288 000, almost exactly the bill. Setting aside monthly and paying provisionally prevents the shock.",
            incorrect: "He should have set aside ~30% of each payment and paid provisional tax twice yearly. The tax is due regardless.",
          },
        },
      },
    ],
  },
];

const separateLayout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "The Number One Entrepreneur Mistake",
    content:
      "<p>Using one bank account for personal and business money is the most common and costly mistake SA entrepreneurs make: you can't see if the business is profitable, SARS can pursue personal assets for business tax debt, and you can't access business finance without clean statements.</p><p>From day one: open a separate business account, pay yourself a defined salary rather than dipping in randomly, run every business expense through the business account, and keep every invoice and receipt. SARS can audit five years back.</p>",
  },
  { slot: "business-finance/business-vs-personal/separate-accounts" },
  { slot: "business-finance/business-vs-personal/profit-not-personal" },
  {
    type: "info",
    title: "VAT and Provisional Tax",
    content:
      "<p><strong>VAT:</strong> registration is compulsory once annual taxable turnover exceeds <strong>R1 000 000</strong>. You add 15% to invoices, claim back VAT on business expenses, and pay SARS the net (output VAT collected − input VAT paid).</p><p><strong>Provisional tax:</strong> the self-employed pay in two estimates a year (around end of August and end of February). Rule of thumb: set aside 25-35% of every payment received; that's your future tax bill, not spending money.</p>",
  },
  { slot: "business-finance/business-vs-personal/vat" },
  { slot: "business-finance/business-vs-personal/provisional-tax" },
];

// ═══════════════════════════════════════════════════════════════════════════

export const BUSINESS_FINANCE_BANKS: Record<string, LessonBank> = {
  "business-finance::business-vs-personal": { layout: separateLayout, slots: separateSlots },
};
