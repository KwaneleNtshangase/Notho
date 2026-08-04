import type { LessonLayoutItem, QuestionSlot } from "@/data/content";
import type { LessonBank } from "./money-basics";

/**
 * Premium bank for the Property applied lesson (buy vs rent).
 * Figures per docs/SA-REGULATORY-FIGURES.md: transfer duty exempt to R1 210 000
 * (all buyers, not only first-time), then 3% of the amount above; CGT primary
 * residence exclusion R3 000 000; First Home Finance (formerly FLISP) is the
 * first-time-buyer subsidy, gross R3 501–R22 000/month.
 * variantId prefix: `ppx-`.
 */
const info = (title: string, content: string): LessonLayoutItem => ({ type: "info", title, content });
const L = (slots: QuestionSlot[], title: string, content: string): LessonLayoutItem[] => [
  info(title, content),
  ...slots.map((s) => ({ slot: s.slotId })),
];

// ── Should Zanele Buy or Rent? ──────────────────────────────────────────────
const brSlots: QuestionSlot[] = [
  {
    slotId: "property/buy-or-rent/monthly-gap",
    conceptId: "bond-vs-rent",
    variants: [
      { variantId: "ppx-br-mg-fill", step: { type: "fill-blank", title: "The monthly gap", prompt: "Zanele's cost to own is bond R13 800 + rates R900 + levies R1 200 + insurance R450 = R16 350. Renting the same flat costs R9 500. The extra monthly cost of owning = R____.", correct: 6850, feedback: { correct: "R16 350 − R9 500 = R6 850 a month. Invested instead, that difference is a serious sum over a few years.", incorrect: "R16 350 − R9 500 = R6 850 a month more to own." } } },
      { variantId: "ppx-br-mg-mcq", step: { type: "mcq", question: "Which costs do people most often leave out when comparing buying to renting?", options: ["Rates, levies, building insurance and maintenance", "The bond repayment", "The rent", "The deposit"], correct: 0, feedback: { correct: "Right. The bond is the visible number; the other four are what turn a 'similar' comparison into thousands of rands a month.", incorrect: "The running costs. Rates, levies, insurance and maintenance. They're invisible to a renter and unavoidable for an owner." } } },
      { variantId: "ppx-br-mg-tf", step: { type: "true-false", statement: "Comparing a bond repayment directly to rent gives you a fair picture of buying versus renting.", correct: false, feedback: { correct: "Right. Add rates, levies, insurance and maintenance to the bond before you compare. The gap is usually much wider than it looks.", incorrect: "It understates ownership. The bond is only part of the monthly cost." } } },
    ],
  },
  {
    slotId: "property/buy-or-rent/time-horizon",
    conceptId: "bond-vs-rent",
    variants: [
      { variantId: "ppx-br-th-mcq", step: { type: "mcq", question: "Why does how long you'll stay matter so much in a buy-or-rent decision?", options: ["Transfer duty, bond registration and conveyancing take years of growth to recover", "Bond rates change with tenure", "Rent is fixed for life", "Rates and levies fall over time"], correct: 0, feedback: { correct: "Right. Those upfront costs run to several percent of the price, and selling adds agent commission on top. A short stay rarely recovers them.", incorrect: "It's the entry and exit costs. They need years of price growth before buying comes out ahead." } } },
      { variantId: "ppx-br-th-tf", step: { type: "true-false", statement: "Buying is usually the better financial choice even if you'll move within three years.", correct: false, feedback: { correct: "Right. Under about five years the transaction costs and early-bond interest usually outweigh the benefit of owning.", incorrect: "Short stays favour renting. You'd need meaningful price growth just to break even on the costs of buying and selling." } } },
      { variantId: "ppx-br-th-sc", step: { type: "scenario", question: "Zanele's job may relocate her in two years. How should that affect the decision?", options: ["Strongly toward renting. She may have to sell before the costs are recovered", "It's irrelevant to the financial maths", "Toward buying, since she can rent it out", "Toward buying, because property always rises"], correct: 0, feedback: { correct: "Right. Being forced to sell into whatever market exists in two years is a real risk, and renting it out is its own business.", incorrect: "It matters a lot. A likely move within two years is one of the strongest arguments for renting." } } },
    ],
  },
  {
    slotId: "property/buy-or-rent/transfer-duty",
    conceptId: "transfer-duty",
    variants: [
      { variantId: "ppx-br-td-fill", step: { type: "fill-blank", title: "Transfer duty threshold", prompt: "Buyers pay no transfer duty on a property priced at or below R____ (enter the rand amount).", correct: 1210000, feedback: { correct: "R1 210 000. Above that, duty starts at 3% of the amount over the threshold, and it applies to every buyer, not only first-timers.", incorrect: "The exemption runs to R1 210 000, after which 3% applies to the excess." } } },
      { variantId: "ppx-br-td-mcq", step: { type: "mcq", question: "A flat sells for R1.5 million. Roughly how much transfer duty is payable?", options: ["About R8 700, 3% of the R290 000 above the threshold", "R45 000, 3% of the full price", "Nothing, because it's under R2 million", "R120 000"], correct: 0, feedback: { correct: "Right. Duty applies only to the portion above R1 210 000: 3% × R290 000 = R8 700.", incorrect: "Only the excess is taxed: R1 500 000 − R1 210 000 = R290 000, at 3% = R8 700." } } },
      { variantId: "ppx-br-td-tf", step: { type: "true-false", statement: "The transfer duty exemption applies only to first-time buyers.", correct: false, feedback: { correct: "Right. It applies to every buyer. The first-time-buyer benefit is <em>First Home Finance</em>, a means-tested subsidy for gross incomes of R3 501–R22 000 a month.", incorrect: "It applies to all buyers. First Home Finance (formerly FLISP) is the separate first-time-buyer subsidy." } } },
    ],
  },
  {
    slotId: "property/buy-or-rent/opportunity-cost",
    conceptId: "bond-vs-rent",
    variants: [
      { variantId: "ppx-br-oc-mcq", step: { type: "mcq", question: "What does a renter have to do for the comparison to work in their favour?", options: ["Actually invest the difference rather than spending it", "Rent for at least ten years", "Rent in a cheaper area", "Negotiate a longer lease"], correct: 0, feedback: { correct: "Right. 'Renting and investing the difference' beats buying often enough, but only if the investing part genuinely happens.", incorrect: "Invest the gap. Renting only wins if the saved money is put to work, not absorbed by lifestyle." } } },
      { variantId: "ppx-br-oc-sc", step: { type: "scenario", question: "Zanele rents and invests the R6 850 monthly difference for three years. Roughly what has she built, ignoring growth?", options: ["About R246 600 in contributions alone", "About R82 000", "About R500 000", "Nothing. Rent is dead money"], correct: 0, feedback: { correct: "R6 850 × 36 = R246 600 before any growth. That's the deposit she'd have if she buys later, with far more flexibility now.", incorrect: "R6 850 × 36 months = R246 600 contributed, before investment growth." } } },
      { variantId: "ppx-br-oc-tf", step: { type: "true-false", statement: "'Rent is dead money' is an accurate description of the trade-off.", correct: false, feedback: { correct: "Right. Rent buys shelter and flexibility, and bond interest, rates, levies and maintenance are equally unrecoverable for an owner.", incorrect: "It's a slogan, not analysis. Interest, rates, levies and maintenance are just as gone as rent. Only capital repayment builds equity." } } },
    ],
  },
];

export const PROPERTY_EXTRA_BANKS: Record<string, LessonBank> = {
  "property::lesson-applied-buy-or-rent": {
    layout: L(brSlots, "Zanele's Decision", "<p>Zanele can buy a flat for a bond of <strong>R13 800</strong> a month, plus rates R900, levies R1 200 and insurance R450: <strong>R16 350</strong> in total. The identical flat rents for <strong>R9 500</strong>. Her job may relocate her within two years. Transfer duty is zero up to <strong>R1 210 000</strong> and 3% of the amount above that, and selling costs agent commission on top.</p>"),
    slots: brSlots,
  },
};
