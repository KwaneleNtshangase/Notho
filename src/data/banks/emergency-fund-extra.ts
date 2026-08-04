import type { LessonLayoutItem, QuestionSlot } from "@/data/content";
import type { LessonBank } from "./money-basics";

/**
 * Premium bank for the Emergency Fund applied lesson.
 * variantId prefix: `efx-`.
 */
const info = (title: string, content: string): LessonLayoutItem => ({ type: "info", title, content });
const L = (slots: QuestionSlot[], title: string, content: string): LessonLayoutItem[] => [
  info(title, content),
  ...slots.map((s) => ({ slot: s.slotId })),
];

// ── Build Your Fund: Month by Month ─────────────────────────────────────────
const buildSlots: QuestionSlot[] = [
  {
    slotId: "emergency-fund/build/survival-number",
    conceptId: "emergency-fund",
    variants: [
      { variantId: "efx-bd-sn-fill", step: { type: "fill-blank", title: "Sipho's target", prompt: "Sipho's survival costs are rent R4 800, food R2 200, transport R1 100, utilities R600, medical aid R900 and school fees R1 400. R11 000 a month. He's on contract, so he targets four months. His target = R____.", correct: 44000, feedback: { correct: "R11 000 × 4 = R44 000. A specific number turns 'I should save' into something you can actually track.", incorrect: "R11 000 × 4 months = R44 000." } } },
      { variantId: "efx-bd-sn-mcq", step: { type: "mcq", question: "Which costs belong in your emergency fund calculation?", options: ["The things you'd still have to pay with no income", "Your full current lifestyle including restaurants and subscriptions", "Only your rent or bond", "Your gross salary multiplied by three"], correct: 0, feedback: { correct: "Right. It's a survival number, not a lifestyle number, which is why it's usually smaller and less daunting than people expect.", incorrect: "Use survival costs only. Netflix and restaurants stop in a crisis; rent and school fees don't." } } },
      { variantId: "efx-bd-sn-tf", step: { type: "true-false", statement: "Your emergency fund target should be based on your current spending, including discretionary items.", correct: false, feedback: { correct: "Right. Base it on what you'd genuinely have to pay with no income. The target gets smaller and more reachable.", incorrect: "Use the survival number. Including discretionary spending inflates the target and makes it feel impossible." } } },
    ],
  },
  {
    slotId: "emergency-fund/build/how-many-months",
    conceptId: "emergency-fund",
    variants: [
      { variantId: "efx-bd-hm-mcq", step: { type: "mcq", question: "Who should aim for six months or more rather than three?", options: ["Someone self-employed, on commission, or the sole earner for dependants", "Someone in a permanent government post", "Anyone under 30", "Anyone with a credit card"], correct: 0, feedback: { correct: "Right. Income volatility and the number of people depending on you both push the target up.", incorrect: "The less predictable your income and the more people depend on it, the bigger the buffer needs to be." } } },
      { variantId: "efx-bd-hm-tf", step: { type: "true-false", statement: "Three months of expenses is the right target for everyone.", correct: false, feedback: { correct: "Right. Three months suits stable, salaried, low-dependant situations; commission earners and the self-employed need six to nine.", incorrect: "It varies with income stability and dependants. Three months is a floor for the most secure situations." } } },
      { variantId: "efx-bd-hm-sc", step: { type: "scenario", question: "Lerato is a commission-only estate agent supporting two children. What's a realistic target?", options: ["Six to nine months of survival costs", "One month", "Three months", "No fund. She should invest instead"], correct: 0, feedback: { correct: "Right. Commission income can vanish for a quarter at a time, and two dependants remove the option of simply cutting deeper.", incorrect: "Six to nine months. Volatile income plus dependants is the highest-buffer case." } } },
    ],
  },
  {
    slotId: "emergency-fund/build/where-to-keep",
    conceptId: "emergency-fund",
    variants: [
      { variantId: "efx-bd-wk-sc", step: { type: "scenario", question: "Sipho has R44 000 saved. Where should it sit?", options: ["A money market or notice account, accessible in days, no market risk", "An equity ETF inside a TFSA for better growth", "Cash at home", "Paid into his home loan with no access facility"], correct: 0, feedback: { correct: "Right. Emergency money needs safety and access. Equities can fall 30% in exactly the month you get retrenched.", incorrect: "Money market or notice account. Equities carry market risk, cash at home carries theft risk, and a bond without access locks it away." } } },
      { variantId: "efx-bd-wk-mcq", step: { type: "mcq", question: "The two requirements for an emergency fund's home are:", options: ["Accessible within days, and safe from market falls", "The highest possible return and tax efficiency", "Long-term growth and diversification", "A branch near your home"], correct: 0, feedback: { correct: "Right. Interest rate is the tiebreaker between options that already pass both tests. Never the starting point.", incorrect: "Access and capital safety come first. Return only matters among options that satisfy both." } } },
      { variantId: "efx-bd-wk-tf", step: { type: "true-false", statement: "Keeping your emergency fund in an equity ETF is sensible because it grows faster.", correct: false, feedback: { correct: "Right. Markets tend to fall when the economy sheds jobs, so you'd be selling at the worst possible moment.", incorrect: "Growth is the wrong goal here. A 30% fall arriving with a retrenchment defeats the fund's entire purpose." } } },
    ],
  },
  {
    slotId: "emergency-fund/build/monthly-plan",
    conceptId: "emergency-fund",
    variants: [
      { variantId: "efx-bd-mp-fill", step: { type: "fill-blank", title: "Months to target", prompt: "Sipho's target is R44 000 and he can save R2 000 a month. Ignoring interest, it takes ____ months to get there.", correct: 22, feedback: { correct: "R44 000 ÷ R2 000 = 22 months. Interest and any windfalls will pull that in a little.", incorrect: "R44 000 ÷ R2 000 = 22 months." } } },
      { variantId: "efx-bd-mp-mcq", step: { type: "mcq", question: "Twenty-two months feels like a long time. What's the right response?", options: ["Start anyway. Partial protection beats none, and windfalls speed it up", "Wait until you can save more each month", "Abandon the goal as unrealistic", "Borrow to fund it immediately"], correct: 0, feedback: { correct: "Right. Even R10 000 saved converts a crisis into an inconvenience. The first month of cover is the most valuable one.", incorrect: "Start now. The fund protects you progressively. You don't need the full target for it to work." } } },
      { variantId: "efx-bd-mp-sc", step: { type: "scenario", question: "Sipho gets a R15 000 bonus while building his fund. Best use, given he has no expensive debt?", options: ["Put it straight into the fund. It removes seven months from the timeline", "Spend it, since the fund is a long-term project", "Split it across three new savings goals", "Invest it in shares for faster growth"], correct: 0, feedback: { correct: "Right. R15 000 is seven and a half months of his R2 000 contributions in one transfer.", incorrect: "Into the fund. A windfall is the fastest way to shorten a long savings timeline." } } },
    ],
  },
];

export const EMERGENCY_FUND_EXTRA_BANKS: Record<string, LessonBank> = {
  "emergency-fund::lesson-applied-emergency-fund-build": {
    layout: L(buildSlots, "Sipho Builds His Fund", "<p>Sipho's <strong>survival</strong> costs, rent R4 800, food R2 200, transport R1 100, utilities R600, medical aid R900, school fees R1 400: come to <strong>R11 000 a month</strong>. Netflix and restaurants aren't in there; they stop in a crisis. He's on contract, so he targets <strong>four months: R44 000</strong>, held somewhere accessible within days and safe from market falls.</p>"),
    slots: buildSlots,
  },
};
