import type { LessonLayoutItem, QuestionSlot } from "@/data/content";
import type { LessonBank } from "./money-basics";

/**
 * Bank for the "Retirement Planning" course (core lessons).
 *
 * Two-pot figures verified current for 2026 (unchanged since launch, 1 Sep 2024):
 *  - Contributions split 1/3 Savings component, 2/3 Retirement component.
 *  - Savings component: one withdrawal per tax year, R2 000 minimum, taxed as
 *    income at your marginal rate (18-45%). Retirement component locked to
 *    retirement. Vested pot = pre-1 Sep 2024 savings, old rules.
 *  - 4% rule and 70-80% replacement ratio are standard planning heuristics.
 * (RA s11F deduction cap, not quoted here, is R430 000 for the 2027 tax year.)
 */

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 1 · "What Is the Two-Pot System?"  (retirement::two-pot-basics)
// ═══════════════════════════════════════════════════════════════════════════

const twoPotSlots: QuestionSlot[] = [
  {
    slotId: "retirement/two-pot-basics/the-split",
    conceptId: "two-pot-system",
    variants: [
      {
        variantId: "ret-tp-split-mcq",
        step: {
          type: "mcq",
          question: "You contribute R3 000/month to your RA. How much goes into the Savings Pot each month?",
          options: ["R1 000", "R3 000", "R2 000", "R1 500"],
          correct: 0,
          feedback: {
            correct: "Right. One third goes to the Savings Pot: R3 000 ÷ 3 = R1 000. The other R2 000 fills the Retirement Pot.",
            incorrect: "The Savings Pot gets one third. R3 000 ÷ 3 = R1 000 (and R2 000 goes to the Retirement Pot).",
          },
        },
      },
      {
        variantId: "ret-tp-split-fill",
        step: {
          type: "fill-blank",
          title: "Where the two-thirds goes",
          prompt: "You contribute R6 000/month to a pension fund. The Retirement Pot (2/3) receives R____ per month.",
          correct: 4000,
          feedback: {
            correct: "Right: R6 000 × 2/3 = R4 000 to the Retirement Pot. The remaining R2 000 goes to the Savings Pot.",
            incorrect: "Two-thirds of R6 000 is R4 000. The split is 1/3 Savings, 2/3 Retirement.",
          },
        },
      },
      {
        variantId: "ret-tp-split-mcq2",
        step: {
          type: "mcq",
          question: "Under the two-pot system, each contribution you make is split into:",
          options: [
            "1/3 to the Savings Pot, 2/3 to the Retirement Pot",
            "Half to each pot",
            "All to the Retirement Pot",
            "All to the Savings Pot",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A third is accessible (Savings Pot); two-thirds is locked away for retirement.",
            incorrect: "It's 1/3 Savings, 2/3 Retirement. A third you can reach in emergencies, two-thirds preserved for retirement.",
          },
        },
      },
    ],
  },
  {
    slotId: "retirement/two-pot-basics/savings-access",
    conceptId: "two-pot-system",
    variants: [
      {
        variantId: "ret-tp-acc-tf",
        step: {
          type: "true-false",
          statement: "You can withdraw from your Savings Pot every month if you need to.",
          correct: false,
          feedback: {
            correct: "Correct. It's once per tax year, with a R2 000 minimum. It was built as an emergency provision, not a monthly account.",
            incorrect: "It's once per tax year (minimum R2 000), not monthly. The Savings Pot is for genuine emergencies.",
          },
        },
      },
      {
        variantId: "ret-tp-acc-mcq",
        step: {
          type: "mcq",
          question: "How often can you access the Savings Pot before retirement?",
          options: [
            "Once per tax year",
            "Once a month",
            "Never. It's fully locked",
            "Whenever you like, unlimited",
          ],
          correct: 0,
          feedback: {
            correct: "Right. One withdrawal per tax year, R2 000 minimum. Frequent dipping isn't allowed by design.",
            incorrect: "It's one withdrawal per tax year, minimum R2 000. Deliberately limited so it stays an emergency buffer.",
          },
        },
      },
      {
        variantId: "ret-tp-acc-sc",
        step: {
          type: "scenario",
          question: "Lindi already took a Savings Pot withdrawal this tax year and wants another before the year ends. Can she?",
          options: [
            "No. Only one Savings Pot withdrawal per tax year is allowed",
            "Yes, she can withdraw monthly",
            "Yes, there's no limit",
            "Only if her employer signs off",
          ],
          correct: 0,
          feedback: {
            correct: "Right. One per tax year is the rule. She'd have to wait for the new tax year.",
            incorrect: "The Savings Pot allows just one withdrawal per tax year. Lindi has used hers; the next chance is next tax year.",
          },
        },
      },
    ],
  },
  {
    slotId: "retirement/two-pot-basics/taxed-as-income",
    conceptId: "two-pot-system",
    variants: [
      {
        variantId: "ret-tp-tax-tf",
        step: {
          type: "true-false",
          statement: "Money withdrawn from your Savings Pot before retirement is taxed as income at your marginal rate.",
          correct: true,
          feedback: {
            correct: "Right. It's added to your taxable income for the year and taxed at your marginal rate (18-45%).",
            incorrect: "It is taxed. The withdrawal is added to your income and taxed at your marginal rate, so early access costs you.",
          },
        },
      },
      {
        variantId: "ret-tp-tax-mcq",
        step: {
          type: "mcq",
          question: "You earn R420 000/year and withdraw R50 000 from your Savings Pot. For tax, SARS treats the R50 000 as:",
          options: [
            "Extra income, added on top and taxed at your marginal rate",
            "Tax-free emergency money",
            "Taxed at a flat 5%",
            "Never taxed, since it's your own money",
          ],
          correct: 0,
          feedback: {
            correct: "Right. It's added to your R420 000, so you're taxed as if you earned R470 000, often R15 000-R18 000 more tax.",
            incorrect: "It's added to your income and taxed at your marginal rate: pushing your taxable income to R470 000 that year.",
          },
        },
      },
      {
        variantId: "ret-tp-tax-sc",
        step: {
          type: "scenario",
          question: "Why is the Savings Pot described as 'a last resort, not a bonus account'?",
          options: [
            "Withdrawals are taxed as income and permanently shrink your retirement savings",
            "It earns no interest at all",
            "Withdrawals are actually tax-free bonuses",
            "There's no real downside to using it",
          ],
          correct: 0,
          feedback: {
            correct: "Right. You lose money to tax now and give up decades of compounding on what you take out.",
            incorrect: "It's a last resort because withdrawals are taxed as income and you sacrifice years of growth on the money removed.",
          },
        },
      },
    ],
  },
  {
    slotId: "retirement/two-pot-basics/why-and-locked",
    conceptId: "two-pot-system",
    variants: [
      {
        variantId: "ret-tp-why-mcq",
        step: {
          type: "mcq",
          question: "Why was the two-pot system introduced?",
          options: [
            "To stop people cashing out all their retirement savings when changing jobs",
            "To increase government tax revenue",
            "To force people to buy government bonds",
            "To simplify pension fund paperwork",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Most people used to cash out everything on resignation. Two-pot protects the bulk while allowing emergency access.",
            incorrect: "It exists to preserve retirement savings, previously 90%+ cashed out entirely when changing jobs, arriving at retirement with nothing.",
          },
        },
      },
      {
        variantId: "ret-tp-why-tf",
        step: {
          type: "true-false",
          statement: "You can access your Retirement Pot (the 2/3) any time before retirement if you resign.",
          correct: false,
          feedback: {
            correct: "Correct. The Retirement Pot is locked until retirement. That's the whole point. Only the Savings Pot is accessible early.",
            incorrect: "The Retirement Pot stays locked until retirement, even if you resign. Only the Savings Pot can be reached early.",
          },
        },
      },
      {
        variantId: "ret-tp-why-sc",
        step: {
          type: "scenario",
          question: "Before September 2024, most people cashed out their entire pension when switching jobs. How does the two-pot system change that?",
          options: [
            "The Retirement Pot stays locked",
            "Nothing changes. You can still cash out everything",
            "It lets you cash out even more, even faster",
            "It removes retirement saving altogether",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Locking the two-thirds is what protects your future self from a job-change cash-out.",
            incorrect: "Two-pot locks the Retirement Pot (2/3), so a resignation can no longer drain your whole pension. Only the Savings Pot is accessible.",
          },
        },
      },
    ],
  },
];

const twoPotLayout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "The Biggest Retirement Change in 30 Years",
    content:
      "<p>From 1 September 2024, every rand you contribute to a pension, provident, or retirement annuity fund is split into two pots, affecting roughly 7 million formal employees.</p><p><strong>Savings Pot (1/3):</strong> one withdrawal per tax year (minimum R2 000), taxed as income: an emergency provision only. <strong>Retirement Pot (2/3):</strong> locked until retirement, no exceptions. <strong>Vested Pot:</strong> everything saved before 1 Sep 2024, under the old rules.</p>",
  },
  { slot: "retirement/two-pot-basics/the-split" },
  { slot: "retirement/two-pot-basics/savings-access" },
  { slot: "retirement/two-pot-basics/taxed-as-income" },
  { slot: "retirement/two-pot-basics/why-and-locked" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 2 · "How Much Do You Need to Retire?"  (retirement::how-much-retire)
// ═══════════════════════════════════════════════════════════════════════════

const howMuchSlots: QuestionSlot[] = [
  {
    slotId: "retirement/how-much-retire/replacement-ratio",
    conceptId: "retirement-number",
    variants: [
      {
        variantId: "ret-rr-mcq",
        step: {
          type: "mcq",
          question: "Planners typically target retirement income of roughly what share of your final salary?",
          options: ["70", "100%", "40%", "120%"],
          correct: 0,
          feedback: {
            correct: "Right. The 'replacement ratio' is about 70-80%. You usually need less than your full salary in retirement.",
            incorrect: "It's about 70-80% of your final salary. You need less than 100% because saving stops and work costs drop.",
          },
        },
      },
      {
        variantId: "ret-rr-tf",
        step: {
          type: "true-false",
          statement: "You typically need less than your full working salary once you retire.",
          correct: true,
          feedback: {
            correct: "Right. No more retirement contributions, lower work costs, often less tax, hence the 70-80% target.",
            incorrect: "You usually need less. Around 70-80%. Saving stops, commuting and work costs fall, and tax is often lower.",
          },
        },
      },
      {
        variantId: "ret-rr-sc",
        step: {
          type: "scenario",
          question: "Earning R60 000/month now, roughly what monthly income do planners suggest targeting for retirement?",
          options: [
            "About R42 000-R48 000",
            "About R60 000 (your full salary)",
            "About R20 000",
            "About R72 000 (more than now)",
          ],
          correct: 0,
          feedback: {
            correct: "Right. 70-80% of R60 000 is R42 000-R48 000, the replacement-ratio target.",
            incorrect: "Aim for about 70-80% of your salary: R42 000-R48 000/month. You generally need less in retirement, not more.",
          },
        },
      },
    ],
  },
  {
    slotId: "retirement/how-much-retire/four-percent",
    conceptId: "retirement-number",
    variants: [
      {
        variantId: "ret-4p-fill",
        step: {
          type: "fill-blank",
          title: "The 4% rule",
          prompt: "You want R20 000/month in retirement. Using the 4% rule, you need about R____ million saved. (Enter the number of millions.)",
          correct: 6,
          feedback: {
            correct: "Right: R20 000 × 12 = R240 000/year; R240 000 ÷ 0.04 = R6 000 000.",
            incorrect: "R20 000/month = R240 000/year. R240 000 ÷ 4% = R6 million.",
          },
        },
      },
      {
        variantId: "ret-4p-mcq",
        step: {
          type: "mcq",
          question: "Under the 4% rule, how do you work out the capital you need?",
          options: [
            "Annual income needed ÷ 0.04",
            "Annual income needed × 4",
            "Monthly income needed ÷ 4",
            "Your salary × 10",
          ],
          correct: 0,
          feedback: {
            correct: "Right. If 4% a year is sustainable, capital = annual need ÷ 0.04 (the same as annual need × 25).",
            incorrect: "Divide the annual income you need by 0.04. That's the pot from which 4% a year covers your income.",
          },
        },
      },
      {
        variantId: "ret-4p-sc",
        step: {
          type: "scenario",
          question: "Thabo needs R30 000/month (R360 000/year) in retirement. Under the 4% rule, his target nest egg is:",
          options: ["R9 million", "R3.6 million", "R1.44 million", "R900 000"],
          correct: 0,
          feedback: {
            correct: "Right: R360 000 ÷ 0.04 = R9 million.",
            incorrect: "R360 000/year ÷ 4% = R9 million. Annual need divided by 0.04 gives the target capital.",
          },
        },
      },
    ],
  },
  {
    slotId: "retirement/how-much-retire/contribution-rate",
    conceptId: "retirement-number",
    variants: [
      {
        variantId: "ret-cr-mcq",
        step: {
          type: "mcq",
          question: "Starting at your first job, the rule-of-thumb minimum contribution rate to retire comfortably is about:",
          options: ["15% of income", "5% of income", "2% of income", "40% of income"],
          correct: 0,
          feedback: {
            correct: "Right. Around 15% total from the start: often 7.5% employee + 7.5% employer in a pension fund.",
            incorrect: "It's roughly 15% of income from your first job. Start after 35 and you'll need more like 20-25%.",
          },
        },
      },
      {
        variantId: "ret-cr-tf",
        step: {
          type: "true-false",
          statement: "The later you start saving for retirement, the higher your contribution rate needs to be to catch up.",
          correct: true,
          feedback: {
            correct: "Right. Less time to compound means a bigger slice of income. 15% at 25 can become 25%+ starting at 40.",
            incorrect: "It does rise. Starting later leaves less time to compound, so you must contribute a larger share to catch up.",
          },
        },
      },
      {
        variantId: "ret-cr-sc",
        step: {
          type: "scenario",
          question: "Many SA pension funds default to 7.5% from the employer plus 7.5% from you. What total contribution rate is that?",
          options: ["About 15%", "About 5%", "About 25%", "About 40%"],
          correct: 0,
          feedback: {
            correct: "Right. 7.5% + 7.5% = 15%, which hits the rule-of-thumb target if you start early.",
            incorrect: "7.5% + 7.5% = 15%, which is exactly the comfortable-retirement target when you begin at your first job.",
          },
        },
      },
    ],
  },
  {
    slotId: "retirement/how-much-retire/start-early",
    conceptId: "retirement-early-start",
    variants: [
      {
        variantId: "ret-se-tf",
        step: {
          type: "true-false",
          statement: "Saving 15% of your salary from age 25 generally beats saving 30% starting at age 40.",
          correct: true,
          feedback: {
            correct: "Right. Fifteen extra years of compounding usually outweighs doubling the contribution rate later. Time is the biggest lever.",
            incorrect: "Starting at 25 with 15% typically wins. The 15-year compounding head start beats a doubled rate that starts at 40.",
          },
        },
      },
      {
        variantId: "ret-se-mcq",
        step: {
          type: "mcq",
          question: "Why is starting early so powerful for retirement?",
          options: [
            "Extra years of compounding outweigh a higher contribution rate started later",
            "Money saved young is taxed less",
            "Markets only rise while you're young",
            "Early savers pay no fees",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Compounding rewards time in the market. Early contributions grow on themselves for decades.",
            incorrect: "It's compounding: early money has more years to grow on itself, which beats a bigger contribution started later.",
          },
        },
      },
      {
        variantId: "ret-se-sc",
        step: {
          type: "scenario",
          question: "Themba saves R1 000/month from age 25; Sipho saves the same R1 000/month but from age 35. At 65, who has more?",
          options: [
            "Themba, by a wide margin, ten more years of compounding",
            "Sipho, because he earns more later",
            "They end up the same",
            "It's impossible to say",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Same monthly amount, but Themba's ten extra years compounding can mean 2-3× more at retirement.",
            incorrect: "Themba wins by a lot. Ten more years of compounding on the same R1 000/month is worth far more than starting later.",
          },
        },
      },
    ],
  },
];

const howMuchLayout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "The Replacement Ratio and the 4% Rule",
    content:
      "<p><strong>Replacement ratio:</strong> planners target about 70-80% of your final salary as retirement income. You need less than your full salary once saving stops and work costs fall.</p><p><strong>The 4% rule:</strong> you can sustainably draw about 4% of your portfolio a year, so capital needed = annual income ÷ 0.04. Need R30 000/month (R360 000/year)? That's R9 million. The other lever is time: starting early lets compounding do the heavy lifting.</p>",
  },
  { slot: "retirement/how-much-retire/replacement-ratio" },
  { slot: "retirement/how-much-retire/four-percent" },
  { slot: "retirement/how-much-retire/contribution-rate" },
  { slot: "retirement/how-much-retire/start-early" },
];

// ═══════════════════════════════════════════════════════════════════════════

export const RETIREMENT_BANKS: Record<string, LessonBank> = {
  "retirement::two-pot-basics": { layout: twoPotLayout, slots: twoPotSlots },
  "retirement::how-much-retire": { layout: howMuchLayout, slots: howMuchSlots },
};
