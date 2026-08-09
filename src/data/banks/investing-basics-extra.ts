import type { LessonLayoutItem, QuestionSlot } from "@/data/content";
import type { LessonBank } from "./money-basics";

/**
 * Premium banks for the Investing Basics EXTRA lessons.
 * Figures per docs/SA-REGULATORY-FIGURES.md: TFSA R46 000/yr and R500 000
 * lifetime (withdrawals do NOT restore room); interest exemption R23 800 under 65;
 * CGT 40% inclusion with a R50 000 annual exclusion. Yields and TERs inside
 * questions are stated as given assumptions, not pinned market figures.
 * variantId prefix: `ibx-`.
 */
const info = (title: string, content: string): LessonLayoutItem => ({ type: "info", title, content });
const L = (slots: QuestionSlot[], title: string, content: string): LessonLayoutItem[] => [
  info(title, content),
  ...slots.map((s) => ({ slot: s.slotId })),
];

// ── ETFs Deep Dive ──────────────────────────────────────────────────────────
const etfSlots: QuestionSlot[] = [
  {
    slotId: "investing-basics/etf-deep/instant-diversification",
    conceptId: "etf",
    variants: [
      { variantId: "ibx-et-id-mcq", step: { type: "mcq", question: "What does a single global-index ETF buy you in one transaction?", options: ["A slice of about 1 500 companies", "Shares in one carefully chosen company", "A guaranteed annual return", "A fixed-interest deposit at a bank"], correct: 0, feedback: { correct: "Right. One debit order spreads your money across thousands of businesses in dozens of countries. Diversification that used to need millions.", incorrect: "It's broad exposure: a global index ETF holds around 1 500 companies across developed markets in a single instrument." } } },
      { variantId: "ibx-et-id-tf", step: { type: "true-false", statement: "Buying one broad index ETF gives you more diversification than picking five JSE shares yourself.", correct: true, feedback: { correct: "Right. Five shares is concentration risk; an index fund holds hundreds or thousands and rebalances itself.", incorrect: "It's true. A handful of shares leaves you exposed to a few companies; an index ETF spreads that risk automatically." } } },
      { variantId: "ibx-et-id-sc", step: { type: "scenario", question: "Lerato has R1 000 a month and wants global exposure. What can she realistically build?", options: ["A monthly debit order into a global ETF through a local platform", "A portfolio of individual US shares she researches herself", "A hedge fund allocation", "Nothing. Global investing needs R100 000 minimum"], correct: 0, feedback: { correct: "Right. Local platforms let small monthly amounts buy fractional exposure to global indices. The entry barrier is essentially gone.", incorrect: "R1 000 a month into a global ETF is entirely doable. You don't need a large lump sum to start." } } },
    ],
  },
  {
    slotId: "investing-basics/etf-deep/ter",
    conceptId: "investment-fees",
    variants: [
      { variantId: "ibx-et-tr-tf", step: { type: "true-false", statement: "A higher Total Expense Ratio signals better management and usually better returns.", correct: false, feedback: { correct: "Right. The opposite holds on average. Fees are the one part of your return you can predict, and they only subtract.", incorrect: "Higher fees don't buy better outcomes. The TER is a certain cost against an uncertain return." } } },
      { variantId: "ibx-et-tr-fill", step: { type: "fill-blank", title: "The fee gap", prompt: "You invest R200 000. Fund A charges a 0.2% TER, Fund B charges 2%. The difference in fees in year one = R____.", correct: 3600, feedback: { correct: "R200 000 × 1.8% = R3 600 a year, and that gap compounds, because the money paid in fees never gets to grow.", incorrect: "The difference is 1.8% of R200 000 = R3 600 in the first year alone." } } },
      { variantId: "ibx-et-tr-mcq", step: { type: "mcq", question: "Why do small percentage differences in fees matter so much over decades?", options: ["The money paid in fees never compounds for you", "Fees are taxed twice", "High fees trigger capital gains tax", "Fees rise automatically each year"], correct: 0, feedback: { correct: "Right. Over 30 years a 1.8% gap can consume a third or more of the final value. It's the most predictable drag on your return.", incorrect: "It's the lost compounding. Every rand paid in fees is a rand that never grows for the rest of your investing life." } } },
    ],
  },
  {
    slotId: "investing-basics/etf-deep/tracking",
    conceptId: "etf",
    variants: [
      { variantId: "ibx-et-tk-mcq", step: { type: "mcq", question: "What is an index ETF actually trying to do?", options: ["Match the index, minus a small fee", "Beat the index every year without fail", "Guarantee your capital at all times", "Time the market perfectly on your behalf"], correct: 0, feedback: { correct: "Right, and matching is a higher bar than it sounds, most active funds fail to beat their index over long periods.", incorrect: "It tracks rather than beats. That's the design, and over decades it outperforms most attempts to do better." } } },
      { variantId: "ibx-et-tk-tf", step: { type: "true-false", statement: "An ETF can fall in value even though it's diversified.", correct: true, feedback: { correct: "Right. Diversification spreads company-specific risk; it doesn't remove market risk. Broad falls still hit you.", incorrect: "It's true. Diversification protects against one company failing, not against a market-wide decline." } } },
      { variantId: "ibx-et-tk-sc", step: { type: "scenario", question: "Thabo's global ETF drops 18% in a market correction. He has a 20-year horizon. What's the reasonable response?", options: ["Keep his debit order running", "Sell everything and wait for recovery", "Switch to a higher-fee active fund", "Stop investing until markets recover"], correct: 0, feedback: { correct: "Right. With two decades ahead, a correction is a discount, not a disaster. Selling converts a paper loss into a real one.", incorrect: "Keep going. Selling into a fall locks in the loss and means missing the recovery, which is usually sharp." } } },
    ],
  },
  {
    slotId: "investing-basics/etf-deep/choosing",
    conceptId: "etf",
    variants: [
      { variantId: "ibx-et-ch-mcq", step: { type: "mcq", question: "What should you check before choosing between two similar index ETFs?", options: ["The TER, the index and dividends", "Last year's return and nothing else", "Which has the shortest name", "Which one your bank promotes"], correct: 0, feedback: { correct: "Right. Two funds tracking the same index differ mainly on cost and structure. Last year's return tells you almost nothing about next year's.", incorrect: "Compare cost, the underlying index and dividend treatment. Recent performance is the weakest signal." } } },
      { variantId: "ibx-et-ch-tf", step: { type: "true-false", statement: "Choosing an ETF based on last year's return is a reliable strategy.", correct: false, feedback: { correct: "Right. Chasing recent winners usually means buying after the run and selling after the fall.", incorrect: "Past returns don't predict future ones. Cost and mandate are the durable differences." } } },
      { variantId: "ibx-et-ch-sc", step: { type: "scenario", question: "Ayesha wants one fund as the core of her portfolio. What's a sensible starting point?", options: ["A low-cost, broadly diversified index fund she'll hold for decades", "The best-performing sector fund of last year", "Three specialist funds for extra diversification", "A single-share position in a company she likes"], correct: 0, feedback: { correct: "Right. A broad, cheap core does most of the work; anything else is a satellite decision she can make later.", incorrect: "Start broad and cheap. Sector bets and single shares add risk without adding diversification." } } },
    ],
  },
];

// ── Unit Trusts ─────────────────────────────────────────────────────────────
const utSlots: QuestionSlot[] = [
  {
    slotId: "investing-basics/unit-trusts/what-they-are",
    conceptId: "unit-trusts",
    variants: [
      { variantId: "ibx-ut-wt-mcq", step: { type: "mcq", question: "What is a unit trust?", options: ["A pooled fund run under one mandate", "A loan made to a company", "A savings account with a fixed rate", "A property ownership scheme"], correct: 0, feedback: { correct: "Right. You buy units in the pool, and their value moves with the underlying holdings.", incorrect: "It's a pooled investment: many investors' money managed collectively against a stated mandate." } } },
      { variantId: "ibx-ut-wt-tf", step: { type: "true-false", statement: "Unit trusts in South Africa are unregulated and carry significant fraud risk.", correct: false, feedback: { correct: "Right. They're regulated collective investment schemes with a trustee and independent custody of assets.", incorrect: "They're well regulated in SA, with a trustee holding the assets separately from the manager." } } },
      { variantId: "ibx-ut-wt-sc", step: { type: "scenario", question: "Someone tells Sipho a unit trust manager could 'run off with the money'. What's the honest answer?", options: ["Assets are held by an independent trustee", "It happens regularly", "Only offshore funds are protected", "There's no protection at all"], correct: 0, feedback: { correct: "Right. The real risks are fees and underperformance, not the manager disappearing with the assets.", incorrect: "Independent custody addresses that risk. Worry about cost and mandate instead." } } },
    ],
  },
  {
    slotId: "investing-basics/unit-trusts/active-vs-passive",
    conceptId: "unit-trusts",
    variants: [
      { variantId: "ibx-ut-ap-mcq", step: { type: "mcq", question: "What's the stated case for an actively managed unit trust over an index fund?", options: ["A manager can avoid weak companies", "It is always cheaper than an index fund", "The returns on it are fully guaranteed", "It's the only option available in SA"], correct: 0, feedback: { correct: "Right. That's the promise. The evidence is that most active funds fail to beat their index after fees over long periods.", incorrect: "The claim is skill-based outperformance. Whether it happens after fees is the real question." } } },
      { variantId: "ibx-ut-ap-sc", step: { type: "scenario", question: "Fund A returns 12.4% gross with a 1.8% TER. Fund B returns 11.8% gross with a 0.3% TER. Which left investors better off?", options: ["Fund B, at 11.5% net against Fund A's 10.6%", "Fund A, because its gross return is higher", "They're identical", "Impossible to compare"], correct: 0, feedback: { correct: "Right. 12.4 − 1.8 = 10.6 against 11.8 − 0.3 = 11.5. The lower-cost fund wins despite the weaker headline.", incorrect: "Compare net: 10.6% versus 11.5%. Fund B's lower fee more than covers its smaller gross return." } } },
      { variantId: "ibx-ut-ap-tf", step: { type: "true-false", statement: "The number that matters when comparing funds is the return after fees.", correct: true, feedback: { correct: "Right. Gross returns are marketing; net returns are what reaches your account.", incorrect: "It's true. Always compare net of fees. A higher gross return can still leave you worse off." } } },
    ],
  },
  {
    slotId: "investing-basics/unit-trusts/selection",
    conceptId: "unit-trusts",
    variants: [
      { variantId: "ibx-ut-sl-mcq", step: { type: "mcq", question: "Which criteria actually help when selecting a unit trust?", options: ["Mandate, total cost, and consistency over long periods", "Last quarter's performance ranking", "The size of the advertising campaign", "Whether a celebrity endorses it"], correct: 0, feedback: { correct: "Right. Does it do what you need, what does it cost, and has it been consistent across cycles, not just in the last good year.", incorrect: "Mandate, cost and long-run consistency. Short-term rankings mostly reflect luck and market conditions." } } },
      { variantId: "ibx-ut-sl-tf", step: { type: "true-false", statement: "A fund that topped the performance tables last year is likely to do so again next year.", correct: false, feedback: { correct: "Right. Top-quartile funds rotate constantly, which is why chasing them tends to underperform.", incorrect: "Rankings rotate. Yesterday's winner is not a prediction, and buying after the run is a common mistake." } } },
      { variantId: "ibx-ut-sl-sc", step: { type: "scenario", question: "Priya's fund has lagged its index for three years while charging 1.9%. What's worth doing?", options: ["Compare a low-cost alternative", "Wait another five years and see", "Add more to average down", "Switch to last year's leader"], correct: 0, feedback: { correct: "Right. Three years of lagging while paying a premium fee justifies a review, but move to a considered alternative, not last year's winner.", incorrect: "Review it properly. Doing nothing and chasing the latest winner are both poor responses." } } },
    ],
  },
  {
    slotId: "investing-basics/unit-trusts/costs-stack",
    conceptId: "investment-fees",
    variants: [
      { variantId: "ibx-ut-cs-mcq", step: { type: "mcq", question: "Which layers of cost can sit on a unit trust investment?", options: ["TER, platform and advice fees", "Only the fund's TER", "A single fee set by the FSCA", "No fees if you invest directly"], correct: 0, feedback: { correct: "Right. Each layer looks small, but 1% + 0.5% + 1% is 2.5% a year before you've earned anything.", incorrect: "Costs stack: fund, platform and advice are usually three separate charges." } } },
      { variantId: "ibx-ut-cs-tf", step: { type: "true-false", statement: "You should ask for the total cost of an investment, not just the fund's TER.", correct: true, feedback: { correct: "Right. Ask for the effective annual cost in rands as well as percent. It makes the number concrete.", incorrect: "It's true. The TER is one layer; platform and advice fees sit on top of it." } } },
      { variantId: "ibx-ut-cs-sc", step: { type: "scenario", question: "Johan is quoted 1.2% fund, 0.5% platform and 1% advice. What's his real annual drag?", options: ["About 2.7% a year", "1.2%", "1%. Only the advice fee is real", "Nothing until he withdraws"], correct: 0, feedback: { correct: "Right. On a 10% gross return that's more than a quarter of his growth gone, every year, whatever markets do.", incorrect: "Add them: 1.2 + 0.5 + 1 = 2.7% a year, charged regardless of performance." } } },
    ],
  },
];

// ── Dollar-Cost Averaging ───────────────────────────────────────────────────
const dcaSlots: QuestionSlot[] = [
  {
    slotId: "investing-basics/dca/what-it-is",
    conceptId: "dollar-cost-averaging",
    variants: [
      { variantId: "ibx-dc-wi-mcq", step: { type: "mcq", question: "What does investing a fixed amount every month actually achieve?", options: ["You average your entry price", "You always beat the market", "You avoid all losses entirely", "You lock in a fixed return"], correct: 0, feedback: { correct: "Right, and the bigger benefit is behavioural: the decision is made once, so you're not guessing about timing every month.", incorrect: "It averages your buy price and removes the timing decision. It doesn't guarantee gains." } } },
      { variantId: "ibx-dc-wi-tf", step: { type: "true-false", statement: "A monthly debit order into an ETF removes the need to decide when to invest.", correct: true, feedback: { correct: "Right, and that's most of its value. Timing decisions are where private investors lose the most money.", incorrect: "It's true. Automating the decision is the point, and it protects you from your own market timing." } } },
      { variantId: "ibx-dc-wi-sc", step: { type: "scenario", question: "Nomsa keeps waiting for 'a better entry point' and hasn't invested in eight months. What would help?", options: ["Set up a monthly debit order", "Wait for a 20% market crash first", "Invest only after a new low", "Keep the money in cash indefinitely"], correct: 0, feedback: { correct: "Right. Eight months out of the market has almost certainly cost her more than a poorly timed entry would have.", incorrect: "Automate it. Waiting for the perfect moment is itself a decision, and usually an expensive one." } } },
    ],
  },
  {
    slotId: "investing-basics/dca/vs-lump-sum",
    conceptId: "dollar-cost-averaging",
    variants: [
      { variantId: "ibx-dc-vl-tf", step: { type: "true-false", statement: "Investing a lump sum always beats spreading it out over months.", correct: false, feedback: { correct: "Right. On average lump sums do better because markets rise more often than they fall, but 'on average' isn't 'always', and phasing in reduces regret.", incorrect: "Not always. Lump sums win more often historically, but averaging in cuts the risk of a bad entry and is easier to stick to." } } },
      { variantId: "ibx-dc-vl-mcq", step: { type: "mcq", question: "Why might someone still phase a lump sum in over several months?", options: ["It softens a badly timed entry", "It guarantees you a higher return", "It avoids capital gains tax", "It's legally required over R100 000"], correct: 0, feedback: { correct: "Right. It's a behavioural trade: slightly lower expected return for a much lower chance of abandoning the plan.", incorrect: "It manages regret and timing risk. There's no tax or legal advantage." } } },
      { variantId: "ibx-dc-vl-sc", step: { type: "scenario", question: "Thabo inherits R300 000 and is nervous about markets. Reasonable approach?", options: ["Phase it in over six to twelve months so a bad month can't derail him", "Put it all in tomorrow regardless of how he feels", "Leave it in cash until he feels confident", "Wait for a crash before investing anything"], correct: 0, feedback: { correct: "Right. The plan he can actually follow beats the theoretically optimal one he abandons after a bad week.", incorrect: "Phase it in. Leaving it in cash indefinitely is the outcome most likely to cost him." } } },
    ],
  },
  {
    slotId: "investing-basics/dca/market-drop",
    conceptId: "dollar-cost-averaging",
    variants: [
      { variantId: "ibx-dc-md-sc", step: { type: "scenario", question: "The JSE drops 30% in month four of your R2 000-a-month ETF plan. What's the right move?", options: ["Keep the debit order running", "Stop the debit order until markets recover", "Sell everything to prevent further losses", "Switch to a fund that went up last month"], correct: 0, feedback: { correct: "Right. A fall early in a long plan is helpful: your R2 000 buys more units, and those units recover with the market.", incorrect: "Keep buying. Stopping during a fall means missing the cheapest purchases of your entire plan." } } },
      { variantId: "ibx-dc-md-mcq", step: { type: "mcq", question: "For someone still contributing monthly, a market fall is:", options: ["A chance to buy in cheaper", "A reason to stop investing", "A signal to switch to cash", "Proof the strategy has failed"], correct: 0, feedback: { correct: "Right. You only lose money in a fall if you sell. A contributor is buying, not selling.", incorrect: "It's a discount for a buyer. Falls only hurt people who are withdrawing or who panic-sell." } } },
      { variantId: "ibx-dc-md-tf", step: { type: "true-false", statement: "Stopping your monthly investment during a crash protects your long-term returns.", correct: false, feedback: { correct: "Right. It skips the cheapest units you'd ever buy, and most people restart only after prices have already recovered.", incorrect: "It damages them. Pausing during falls means buying only when things are expensive." } } },
    ],
  },
  {
    slotId: "investing-basics/dca/automation",
    conceptId: "dollar-cost-averaging",
    variants: [
      { variantId: "ibx-dc-au-mcq", step: { type: "mcq", question: "When should an investment debit order be dated?", options: ["Just after payday", "At month-end with whatever is left", "Whenever you remember", "Only in months markets look calm"], correct: 0, feedback: { correct: "Right. Paying yourself first is the difference between a plan that runs for ten years and one that runs for three months.", incorrect: "Just after payday. Month-end leftovers are usually nothing." } } },
      { variantId: "ibx-dc-au-tf", step: { type: "true-false", statement: "Increasing your monthly contribution when you get a raise is one of the easiest ways to build wealth.", correct: true, feedback: { correct: "Right. You never adjust to the higher take-home pay, so the increase costs you nothing in felt lifestyle.", incorrect: "It's true. Escalating contributions with raises avoids lifestyle inflation almost painlessly." } } },
      { variantId: "ibx-dc-au-sc", step: { type: "scenario", question: "Lerato's salary rises by R2 500. What's a high-value default?", options: ["Increase the debit order by half the raise and enjoy the rest", "Keep the contribution unchanged", "Cancel the contribution and save the cash", "Wait until next year to adjust anything"], correct: 0, feedback: { correct: "Right. She still feels better off, and R1 250 a month invested for decades is a large sum.", incorrect: "Split the raise. Banking half keeps the plan growing without a sense of sacrifice." } } },
    ],
  },
];

// ── Protecting Yourself from Investment Scams ───────────────────────────────
const scamSlots: QuestionSlot[] = [
  {
    slotId: "investing-basics/inv-scams/impossible-returns",
    conceptId: "investment-scams",
    variants: [
      { variantId: "ibx-sc-ir-mcq", step: { type: "mcq", question: "A WhatsApp contact promises 30% monthly returns from forex trading. Most likely explanation?", options: ["A Ponzi scheme paying old with new", "An unusually skilled trader", "A legitimate high-risk product", "A promotional rate for new clients"], correct: 0, feedback: { correct: "Right. 30% a month is 2 300% a year: no legitimate strategy produces that, and the pitch arriving on WhatsApp is the second red flag.", incorrect: "That return is impossible to sustain. It's the classic Ponzi signature: guaranteed high returns, delivered socially." } } },
      { variantId: "ibx-sc-ir-tf", step: { type: "true-false", statement: "A guaranteed high return with no risk is a legitimate product if the provider is well known locally.", correct: false, feedback: { correct: "Right. Return and risk are linked. 'guaranteed and high' is a contradiction, and SA has lost billions to schemes that felt familiar and trusted.", incorrect: "Guaranteed high returns don't exist. Local familiarity is how these schemes spread, not evidence they're real." } } },
      { variantId: "ibx-sc-ir-sc", step: { type: "scenario", question: "A scheme pays Sipho R40 000 on a R100 000 investment within two months and urges him to recruit friends and reinvest. What should he do?", options: ["Withdraw everything he can immediately and stop recruiting", "Reinvest to compound the returns", "Recruit friends to reduce his own risk", "Wait and see whether payments continue"], correct: 0, feedback: { correct: "Right. Early payouts plus recruitment pressure is the Ponzi pattern, and bringing friends in makes him part of their loss.", incorrect: "Get out and don't recruit. Those early 'returns' are other people's capital, and recruiting spreads the damage." } } },
    ],
  },
  {
    slotId: "investing-basics/inv-scams/fsca-check",
    conceptId: "investment-scams",
    variants: [
      { variantId: "ibx-sc-fc-tf", step: { type: "true-false", statement: "An FSCA licence guarantees an investment product is safe and will perform.", correct: false, feedback: { correct: "Right. A licence means the provider is authorised and accountable, it says nothing about whether the investment will do well.", incorrect: "It's a conduct requirement, not a performance guarantee. Licensed providers can still lose your money legitimately." } } },
      { variantId: "ibx-sc-fc-mcq", step: { type: "mcq", question: "What's the value of checking the FSCA register before investing?", options: ["It confirms they are authorised", "It confirms the returns are achievable", "It insures your capital", "It fixes the fees that they may charge"], correct: 0, feedback: { correct: "Right, and if they're not on the register that's the end of the conversation. No licence means no complaints route.", incorrect: "It establishes authorisation and recourse. It doesn't validate returns or protect capital." } } },
      { variantId: "ibx-sc-fc-sc", step: { type: "scenario", question: "A slick operator gives Ayesha an FSP number. What should she do with it?", options: ["Verify it on the FSCA register", "Accept it as proof of legitimacy", "Ignore it, numbers can't be checked", "Ask the operator to confirm in writing"], correct: 0, feedback: { correct: "Right. Cloned and borrowed FSP numbers are common, and the register also shows what advice they're actually licensed to give.", incorrect: "Verify it independently on the FSCA register. Quoting a number proves nothing on its own." } } },
    ],
  },
  {
    slotId: "investing-basics/inv-scams/red-flags",
    conceptId: "scam-red-flags",
    variants: [
      { variantId: "ibx-sc-rf-mcq", step: { type: "mcq", question: "Which combination is the strongest warning sign of an investment scam?", options: ["Guaranteed returns and urgency", "A long track record and audited books", "Clear disclosure of fees", "An FSP number that checks out properly"], correct: 0, feedback: { correct: "Right. Any one of those is concerning; together they're conclusive.", incorrect: "Guarantees, urgency and recruitment together are the classic signature." } } },
      { variantId: "ibx-sc-rf-tf", step: { type: "true-false", statement: "Pressure to decide immediately is a normal part of legitimate investment sales.", correct: false, feedback: { correct: "Right. A real opportunity survives you taking a week to think and asking someone independent.", incorrect: "Urgency exists to stop you checking. Legitimate investments don't expire this afternoon." } } },
      { variantId: "ibx-sc-rf-sc", step: { type: "scenario", question: "Johan is told the 'opportunity closes tonight' and he must not discuss it with anyone. What does that tell him?", options: ["Secrecy and urgency prevent scrutiny", "It's an exclusive offer worth taking", "He should invest a small test amount", "He should ask for it in writing"], correct: 0, feedback: { correct: "Right. Secrecy plus a deadline is the scam's core mechanic. Even a small 'test' amount funds the machine and builds trust for a bigger ask.", incorrect: "Walk away. Those two features exist only to stop you getting a second opinion." } } },
    ],
  },
  {
    slotId: "investing-basics/inv-scams/recovery",
    conceptId: "scam-recovery",
    variants: [
      { variantId: "ibx-sc-rc-mcq", step: { type: "mcq", question: "You realise you've been scammed. What's the first step?", options: ["Stop payments and report it", "Send more money to unlock it", "Wait quietly to see if funds arrive", "Delete the messages out of embarrassment"], correct: 0, feedback: { correct: "Right, and keep the evidence. Messages, statements and account details are what any investigation depends on.", incorrect: "Stop paying, preserve evidence, report. Never delete the record. It's the only chance of any recovery." } } },
      { variantId: "ibx-sc-rc-tf", step: { type: "true-false", statement: "A company that contacts you offering to recover your scammed money for an upfront fee is usually a second scam.", correct: true, feedback: { correct: "Right. Recovery scams specifically target known victims, because the lists get resold.", incorrect: "It's true. Upfront-fee 'recovery agents' are a well-documented follow-up scam." } } },
      { variantId: "ibx-sc-rc-sc", step: { type: "scenario", question: "A scheme tells Nomsa she must pay a R15 000 'release fee' before her R200 000 can be withdrawn. What's happening?", options: ["A standard advance-fee tactic", "A normal tax requirement", "A legitimate administrative charge", "A sign the platform is regulated"], correct: 0, feedback: { correct: "Right. Legitimate investments never require a payment to release your own money. Paying it just adds R15 000 to the loss.", incorrect: "It's an advance-fee demand. No real platform charges you to access your own funds." } } },
    ],
  },
];

// ── Property as an Investment ───────────────────────────────────────────────
const propSlots: QuestionSlot[] = [
  {
    slotId: "investing-basics/property-inv/yield",
    conceptId: "reits",
    variants: [
      { variantId: "ibx-pr-yl-mcq", step: { type: "mcq", question: "A flat costs R1.2 million and rents for R8 000 a month. What's the gross rental yield?", options: ["8%", "6.7%", "12%", "0.67%"], correct: 0, feedback: { correct: "R8 000 × 12 = R96 000, ÷ R1 200 000 = 8% gross, before rates, levies, maintenance and vacancies.", incorrect: "Annual rent R96 000 ÷ purchase price R1 200 000 = 8% gross yield." } } },
      { variantId: "ibx-pr-yl-fill", step: { type: "fill-blank", title: "Gross yield", prompt: "A property costs R900 000 and rents for R6 000 a month. Annual rent is R72 000, so the gross yield is ____%.", correct: 8, feedback: { correct: "R72 000 ÷ R900 000 = 8%. Net yield will be meaningfully lower once costs come off.", incorrect: "R72 000 ÷ R900 000 = 8% gross." } } },
      { variantId: "ibx-pr-yl-tf", step: { type: "true-false", statement: "Gross rental yield is what you actually earn from a rental property.", correct: false, feedback: { correct: "Right. Rates, levies, insurance, maintenance, agent fees and vacant months can take a third or more of it.", incorrect: "Gross is before costs. Net yield, after all expenses and vacancies, is the number that matters." } } },
    ],
  },
  {
    slotId: "investing-basics/property-inv/not-passive",
    conceptId: "reits",
    variants: [
      { variantId: "ibx-pr-np-tf", step: { type: "true-false", statement: "Buy-to-let property is passive income requiring minimal ongoing effort.", correct: false, feedback: { correct: "Right. Tenant screening, maintenance, arrears, levies and the occasional eviction are all real work. It's a small business.", incorrect: "It's active. Between tenants, repairs and arrears, a rental property demands regular attention." } } },
      { variantId: "ibx-pr-np-mcq", step: { type: "mcq", question: "Which cost most often surprises first-time buy-to-let investors?", options: ["Vacancy months with a bond to pay", "The transfer duty payable upfront", "The deposit required", "The bond application fee"], correct: 0, feedback: { correct: "Right. Two vacant months a year wipes out a sixth of the rental income while every expense continues.", incorrect: "Vacancies. Everything else is a one-off; empty months recur and hit hardest." } } },
      { variantId: "ibx-pr-np-sc", step: { type: "scenario", question: "Zanele's tenant stops paying and won't leave. What's her realistic position?", options: ["A legal eviction process taking months", "Immediate removal by the police", "The bank pauses her bond", "Rental insurance covers everything automatically"], correct: 0, feedback: { correct: "Right. SA law protects occupiers, so eviction is a court process, which is why screening and rental protection cover matter.", incorrect: "Eviction is a court process taking months. Her bond, rates and levies continue the whole time." } } },
    ],
  },
  {
    slotId: "investing-basics/property-inv/reits",
    conceptId: "reits",
    variants: [
      { variantId: "ibx-pr-rt-sc", step: { type: "scenario", question: "Compare a R1.5m buy-to-let at an 8% yield with R1.5m in a JSE-listed REIT at an 8% distribution yield. What's the REIT's main advantage?", options: ["No tenants, no maintenance", "A guaranteed higher return", "No market exposure", "No tax at all"], correct: 0, feedback: { correct: "Right. Liquidity and zero management. The trade-off is no leverage and no control over the specific buildings.", incorrect: "It's liquidity and freedom from management. REITs still carry property market risk and are still taxed." } } },
      { variantId: "ibx-pr-rt-mcq", step: { type: "mcq", question: "What is a REIT?", options: ["A listed company owning income-producing property", "A government housing subsidy", "A type of home loan", "A property insurance product"], correct: 0, feedback: { correct: "Right. It gives you property exposure in whatever amount you choose, tradeable on the JSE.", incorrect: "It's a listed property company. Buying its shares gives you a share of the rental income." } } },
      { variantId: "ibx-pr-rt-tf", step: { type: "true-false", statement: "Direct property lets you use borrowed money in a way a REIT investment normally doesn't.", correct: true, feedback: { correct: "Right. Leverage magnifies gains and losses. It's the main structural advantage of direct property, and its main risk.", incorrect: "It's true. A bond lets you control a large asset with a small deposit; REIT investors typically don't borrow to buy units." } } },
    ],
  },
  {
    slotId: "investing-basics/property-inv/true-costs",
    conceptId: "reits",
    variants: [
      { variantId: "ibx-pr-tc-mcq", step: { type: "mcq", question: "Which costs must come off gross rent before you know what a property really earns?", options: ["Rates, levies and vacancy", "Only the bond repayment", "Only the maintenance costs", "Nothing, the rent is profit"], correct: 0, feedback: { correct: "Right. An 8% gross yield often becomes 4–5% net, which changes the comparison with other investments completely.", incorrect: "All of them. Gross yield flatters property because it ignores every running cost." } } },
      { variantId: "ibx-pr-tc-tf", step: { type: "true-false", statement: "Transfer duty, bond registration and conveyancing costs mean a property must rise several percent before you break even.", correct: true, feedback: { correct: "Right. Those upfront costs are why property is a poor short-term hold. You need years to work through them.", incorrect: "It's true. Entry costs run to several percent of the price, and you don't recover them until the value moves past them." } } },
      { variantId: "ibx-pr-tc-sc", step: { type: "scenario", question: "Priya's flat yields 8% gross. Costs run at 35% of rent. What's her rough net yield?", options: ["About 5.2%", "8%", "About 2%", "About 7%"], correct: 0, feedback: { correct: "8% × 65% ≈ 5.2% net, before any bond interest. That's the number to compare against other investments.", incorrect: "If 35% of rent goes to costs, 65% remains: 8% × 0.65 ≈ 5.2%." } } },
    ],
  },
];

// ── Investment Fees ─────────────────────────────────────────────────────────
const feeSlots: QuestionSlot[] = [
  {
    slotId: "investing-basics/fees/which-matters",
    conceptId: "investment-fees",
    variants: [
      { variantId: "ibx-fe-wm-mcq", step: { type: "mcq", question: "Which fee matters most on a 30-year investment?", options: ["The recurring annual percentage charged on your whole balance", "The once-off transaction fee on each purchase", "The account opening fee", "The withdrawal fee at the end"], correct: 0, feedback: { correct: "Right. A once-off cost is a rounding error; a percentage charged every year on a growing balance compounds against you.", incorrect: "Annual percentage fees. They're charged on everything you've accumulated, every year, forever." } } },
      { variantId: "ibx-fe-wm-tf", step: { type: "true-false", statement: "A 1% annual fee is small enough to ignore over an investing lifetime.", correct: false, feedback: { correct: "Right. Over 30 years, 1% a year can consume roughly a fifth of your final value.", incorrect: "It compounds. Small annual percentages become very large rand amounts over decades." } } },
      { variantId: "ibx-fe-wm-sc", step: { type: "scenario", question: "Thabo is choosing between a platform charging 0.35% a year and one charging 0.9%. He'll invest for 25 years. How much should this weigh?", options: ["Heavily. It's one of the few outcomes he can control in advance", "Barely. The difference is only 0.55%", "Not at all if the expensive one has better performance history", "Only if his balance exceeds R1 million"], correct: 0, feedback: { correct: "Right. Returns are uncertain; fees are certain. Controlling the certain part is the most reliable edge he has.", incorrect: "It matters a lot. 0.55% a year compounded over 25 years is a substantial share of the final value." } } },
    ],
  },
  {
    slotId: "investing-basics/fees/disclosure",
    conceptId: "investment-fees",
    variants: [
      { variantId: "ibx-fe-ds-tf", step: { type: "true-false", statement: "An adviser in SA may keep the fees they earn on your investment confidential unless you ask.", correct: false, feedback: { correct: "Right. The FAIS General Code requires disclosure of fees and any conflicts of interest, in writing, before you commit.", incorrect: "Disclosure is compulsory under the FAIS Code, not something you must extract by asking." } } },
      { variantId: "ibx-fe-ds-mcq", step: { type: "mcq", question: "What should you insist on before signing an investment agreement?", options: ["The total effective annual cost, in percent and in rands", "The adviser's assurance that fees are 'competitive'", "A verbal summary", "The fund's best-ever annual return"], correct: 0, feedback: { correct: "Right. Rands make it concrete: 'about R14 000 a year' lands very differently from '1.4%'.", incorrect: "Get the total cost in writing, expressed both ways. Reassurance isn't disclosure." } } },
      { variantId: "ibx-fe-ds-sc", step: { type: "scenario", question: "An adviser recommends a product that pays them a commission but is otherwise similar to a cheaper option. What's required?", options: ["Disclosure, and it must still suit you", "Nothing, commissions are their business", "Disclosure only if you ask directly", "FSCA approval for each recommendation"], correct: 0, feedback: { correct: "Right. The FAIS Code requires both the disclosure and a suitable recommendation. A conflict must never drive the advice.", incorrect: "Conflicts must be disclosed and advice must remain suitable. Neither is optional." } } },
    ],
  },
  {
    slotId: "investing-basics/fees/flat-vs-percent",
    conceptId: "investment-fees",
    variants: [
      { variantId: "ibx-fe-fp-sc", step: { type: "scenario", question: "Adviser A charges 1% a year; Adviser B charges R1 500 a month flat. On a R3 million portfolio, who costs less?", options: ["Adviser B, at R18 000 against R30 000 a year", "Adviser A, because percentages are always lower", "They're identical", "Adviser A, because flat fees rise with inflation"], correct: 0, feedback: { correct: "1% of R3m = R30 000; R1 500 × 12 = R18 000. The flat fee saves R12 000 a year, and the gap widens as the portfolio grows.", incorrect: "R30 000 versus R18 000. Percentage fees scale with your wealth even when the work doesn't." } } },
      { variantId: "ibx-fe-fp-mcq", step: { type: "mcq", question: "Why do percentage-based fees become expensive as your portfolio grows?", options: ["The fee grows as your balance grows", "The percentage rate rises automatically", "They attract quite a lot of additional tax", "They compound monthly, not annually"], correct: 0, feedback: { correct: "Right. Advising on R3 million isn't three times the work of advising on R1 million, but a percentage fee charges as if it is.", incorrect: "The rate stays the same; the base grows. That's why large portfolios often move to flat fees." } } },
      { variantId: "ibx-fe-fp-tf", step: { type: "true-false", statement: "For a small portfolio, a percentage fee can work out cheaper than a flat monthly fee.", correct: true, feedback: { correct: "Right. 1% of R200 000 is R2 000 a year, well below most flat fees. The crossover comes as the balance grows.", incorrect: "It's true. Percentage fees suit smaller balances; flat fees suit larger ones." } } },
    ],
  },
  {
    slotId: "investing-basics/fees/what-you-control",
    conceptId: "investment-fees",
    variants: [
      { variantId: "ibx-fe-wc-mcq", step: { type: "mcq", question: "Of return, risk and cost, which can you actually control in advance?", options: ["Cost. It's known before you invest", "Return", "The market's direction", "How other investors behave"], correct: 0, feedback: { correct: "Right. That's why cost deserves so much attention: it's the only variable with a guaranteed effect.", incorrect: "Cost is the knowable one. Returns are estimates; fees are contractual." } } },
      { variantId: "ibx-fe-wc-tf", step: { type: "true-false", statement: "Cutting your total annual cost by 1% has the same effect as earning 1% more return.", correct: true, feedback: { correct: "Right, except the fee saving is certain and the extra return isn't.", incorrect: "It's true, and better: the saving is guaranteed while the extra return is hypothetical." } } },
      { variantId: "ibx-fe-wc-sc", step: { type: "scenario", question: "Ayesha can't predict markets but wants to improve her expected outcome. What's the highest-confidence action?", options: ["Reduce her total annual costs and keep contributing", "Switch to whichever fund performed best last year", "Time her entries around market news", "Concentrate on a few high-conviction shares"], correct: 0, feedback: { correct: "Right. Lower costs and consistent contributions are the two levers with reliable effects.", incorrect: "Cut costs and keep contributing. The other three are attempts to predict what can't be predicted." } } },
    ],
  },
];

// ── How Bonds Actually Work ─────────────────────────────────────────────────
const bondSlots: QuestionSlot[] = [
  {
    slotId: "investing-basics/bonds/what-is-a-bond",
    conceptId: "bonds",
    variants: [
      { variantId: "ibx-bd-wb-mcq", step: { type: "mcq", question: "When you buy a government bond, what have you actually done?", options: ["Lent money to the government", "Bought a share of state assets", "Made a tax-deductible donation", "Bought foreign currency"], correct: 0, feedback: { correct: "Right. A bondholder is a lender, not an owner, which is why bonds pay a set income rather than sharing in growth.", incorrect: "You've made a loan. Interest along the way, capital returned at maturity." } } },
      { variantId: "ibx-bd-wb-fill", step: { type: "fill-blank", title: "Bond income", prompt: "You hold R50 000 of an RSA Retail Bond paying 9.75% a year. Your annual interest income = R____ (nearest rand).", correct: 4875, feedback: { correct: "R50 000 × 9.75% = R4 875 a year. Predictable income, which is the point of a bond.", incorrect: "R50 000 × 9.75% = R4 875 per year." } } },
      { variantId: "ibx-bd-wb-tf", step: { type: "true-false", statement: "A bondholder shares in the profits of the issuer the way a shareholder does.", correct: false, feedback: { correct: "Right. You get the agreed interest and nothing more, but you also rank ahead of shareholders if things go wrong.", incorrect: "Bondholders are lenders. Fixed interest, no share of the upside, but a stronger claim than shareholders." } } },
    ],
  },
  {
    slotId: "investing-basics/bonds/types",
    conceptId: "bonds",
    variants: [
      { variantId: "ibx-bd-ty-mcq", step: { type: "mcq", question: "How does a corporate bond typically differ from a government bond?", options: ["Higher credit risk", "It's always safer", "It pays no interest", "It can't be sold before maturity"], correct: 0, feedback: { correct: "Right. The extra yield is compensation for the chance the company can't pay. Governments have more ways to raise money.", incorrect: "More credit risk, more yield. That spread is the market pricing the chance of default." } } },
      { variantId: "ibx-bd-ty-tf", step: { type: "true-false", statement: "RSA Retail Bonds are riskier than a South African bank fixed deposit.", correct: false, feedback: { correct: "Right. They're a direct obligation of the government, generally regarded as the lowest-risk rand investment available.", incorrect: "They're government-backed and generally considered safer than a bank deposit." } } },
      { variantId: "ibx-bd-ty-sc", step: { type: "scenario", question: "Johan wants predictable income with minimal capital risk and can lock money away for three years. What fits?", options: ["An RSA Retail Bond held to maturity", "A single JSE share with a high dividend", "A high-yield crypto lending platform", "A broad global equity index ETF fund"], correct: 0, feedback: { correct: "Right. Held to maturity he knows exactly what he'll receive and when. That certainty is precisely what he asked for.", incorrect: "The retail bond matches the requirement. Shares and equity funds can't promise capital back on a date." } } },
    ],
  },
  {
    slotId: "investing-basics/bonds/role-in-portfolio",
    conceptId: "bonds",
    variants: [
      { variantId: "ibx-bd-rp-mcq", step: { type: "mcq", question: "What job do bonds do in a portfolio?", options: ["Steadier income, smaller swings", "The highest long-run growth available", "Guaranteed inflation-beating returns", "Elimination of all risk"], correct: 0, feedback: { correct: "Right. They're the ballast. You give up some growth for a smoother ride and reliable income.", incorrect: "Stability and income, not maximum growth. Equities do the heavy lifting on returns over long periods." } } },
      { variantId: "ibx-bd-rp-tf", step: { type: "true-false", statement: "A 25-year-old saving for retirement should hold mostly bonds.", correct: false, feedback: { correct: "Right. With decades ahead, equity growth matters more than short-term smoothness. The volatility is survivable.", incorrect: "A long horizon favours equities. Bonds become more useful as the money gets closer to being needed." } } },
      { variantId: "ibx-bd-rp-sc", step: { type: "scenario", question: "Nomsa retires in three years and holds 90% equities. What's the concern?", options: ["A fall now could damage her income", "Nothing, equities always recover", "She should move to 100% equities", "Bonds would guarantee a better return"], correct: 0, feedback: { correct: "Right. Recovery takes time she no longer has, and drawing income from a fallen portfolio locks the loss in.", incorrect: "It's sequence risk. A fall close to retirement is far more damaging than the same fall twenty years earlier." } } },
    ],
  },
  {
    slotId: "investing-basics/bonds/credit-risk",
    conceptId: "bonds",
    variants: [
      { variantId: "ibx-bd-cr-mcq", step: { type: "mcq", question: "What does an unusually high yield on a bond usually signal?", options: ["The market sees a higher chance the issuer won't pay", "A bargain the market has missed", "Government backing", "A shorter maturity"], correct: 0, feedback: { correct: "Right. Yield compensates for risk. A very high yield is the market pricing a very real possibility of default.", incorrect: "High yield means high perceived risk. It's a warning label, not a discount." } } },
      { variantId: "ibx-bd-cr-tf", step: { type: "true-false", statement: "Bonds are risk-free investments.", correct: false, feedback: { correct: "Right. Even government bonds carry interest-rate risk and inflation risk, and corporate bonds add credit risk on top.", incorrect: "They're lower-risk, not risk-free. Rates, inflation and default all affect them." } } },
      { variantId: "ibx-bd-cr-sc", step: { type: "scenario", question: "A platform offers Sipho 22% a year on 'corporate bonds' from a company he's never heard of. What's his read?", options: ["That yield signals real risk", "It's an attractive opportunity", "It's safe because bonds are safe", "It's normal for private companies"], correct: 0, feedback: { correct: "Right. When government paper pays a fraction of that, 22% is either desperation or fiction. Check the FSCA register first.", incorrect: "That yield is a red flag, not an opportunity. The word 'bond' doesn't make an investment safe." } } },
    ],
  },
];

// ── Bond Prices and Interest Rate Risk ──────────────────────────────────────
const irrSlots: QuestionSlot[] = [
  {
    slotId: "investing-basics/rate-risk/inverse",
    conceptId: "interest-rate-risk",
    variants: [
      { variantId: "ibx-ir-in-mcq", step: { type: "mcq", question: "The SARB cuts the repo rate unexpectedly. What typically happens to the price of existing bonds?", options: ["They rise", "They fall", "They're unaffected", "They're suspended from trading"], correct: 0, feedback: { correct: "Right. New bonds will pay less, so existing higher-paying bonds become more valuable. Prices and rates move in opposite directions.", incorrect: "Prices rise. Existing bonds lock in the old, higher rate, which is worth more once new issues pay less." } } },
      { variantId: "ibx-ir-in-tf", step: { type: "true-false", statement: "When interest rates rise, the market price of existing bonds falls.", correct: true, feedback: { correct: "Right. Your bond's fixed coupon looks worse next to new issues, so its price adjusts down to compensate a buyer.", incorrect: "It's true. Rising rates make existing lower-coupon bonds less attractive, so their prices drop." } } },
      { variantId: "ibx-ir-in-sc", step: { type: "scenario", question: "Priya holds a bond fund and rates rise sharply. Her statement shows a loss. Why?", options: ["Bond prices fell as rates rose", "The issuers have defaulted", "The fund charged an extra annual fee", "Her interest payments have stopped"], correct: 0, feedback: { correct: "Right. It's a mark-to-market effect, not a credit event, and the fund now reinvests at the higher rates.", incorrect: "It's price movement from the rate rise, not default. Bond funds show this as a capital loss even when every issuer pays." } } },
    ],
  },
  {
    slotId: "investing-basics/rate-risk/duration",
    conceptId: "interest-rate-risk",
    variants: [
      { variantId: "ibx-ir-du-mcq", step: { type: "mcq", question: "What does a bond's duration tell you?", options: ["Its price sensitivity to rate moves", "How long until the issuer might default", "The exact interest rate the bond pays", "Its currently published credit rating"], correct: 0, feedback: { correct: "Right. Longer duration means bigger price swings for the same rate move. That's the risk you're taking for a longer-dated bond.", incorrect: "It measures interest-rate sensitivity, not default risk or the coupon." } } },
      { variantId: "ibx-ir-du-tf", step: { type: "true-false", statement: "A 20-year bond's price moves more than a 2-year bond's for the same change in interest rates.", correct: true, feedback: { correct: "Right. The longer the cash flows stretch out, the more a rate change alters what they're worth today.", incorrect: "It's true. Longer maturity means greater price sensitivity to rate changes." } } },
      { variantId: "ibx-ir-du-sc", step: { type: "scenario", question: "Johan needs his capital intact in 18 months. Which bond exposure suits him?", options: ["Short-dated bonds, with small swings", "Long-dated bonds for the higher yield", "A leveraged bond fund", "Whichever fund led last year"], correct: 0, feedback: { correct: "Right. Match the duration to when you need the money. A long bond can be well down in value on the day he needs it.", incorrect: "Short duration. Long bonds swing too much for an 18-month horizon, whatever they yield." } } },
    ],
  },
  {
    slotId: "investing-basics/rate-risk/hold-to-maturity",
    conceptId: "interest-rate-risk",
    variants: [
      { variantId: "ibx-ir-hm-tf", step: { type: "true-false", statement: "An investor who holds an RSA Retail Bond to its maturity date is exposed to interest rate risk on their capital.", correct: false, feedback: { correct: "Right. Held to maturity you receive the agreed interest and your capital back. The risk is opportunity cost if rates rise, not a capital loss.", incorrect: "Held to maturity you get the stated interest and capital back. Price risk only bites if you sell early." } } },
      { variantId: "ibx-ir-hm-mcq", step: { type: "mcq", question: "If rates rise after you buy a fixed-rate bond you intend to hold to maturity, what have you actually lost?", options: ["The chance to earn the higher rate", "Part of your capital, and permanently", "All your interest payments", "Nothing at all has been lost"], correct: 0, feedback: { correct: "Right. You're locked into the old rate, which is a real cost, but you still receive everything you were promised.", incorrect: "It's opportunity cost. Your capital and coupons are intact; you've just missed the better rate." } } },
      { variantId: "ibx-ir-hm-sc", step: { type: "scenario", question: "Lerato is choosing between a fixed-rate and an inflation-linked retail bond. What's the trade-off?", options: ["Fixed gives a known rate", "Inflation-linked always pays more", "Fixed-rate bonds carry no risk", "There's no meaningful difference"], correct: 0, feedback: { correct: "Right. Fixed wins if inflation stays low; inflation-linked wins if it doesn't. It's a choice about which risk you'd rather carry.", incorrect: "It's certainty versus inflation protection. Neither is automatically better. It depends what inflation does." } } },
    ],
  },
  {
    slotId: "investing-basics/rate-risk/practical",
    conceptId: "interest-rate-risk",
    variants: [
      { variantId: "ibx-ir-pr-mcq", step: { type: "mcq", question: "What's the practical lesson of interest rate risk for an ordinary investor?", options: ["Match the maturity of your bonds to when you'll need the money", "Avoid bonds entirely", "Only buy bonds when rates are falling", "Always choose the longest maturity for the highest yield"], correct: 0, feedback: { correct: "Right. Matching maturity to your horizon converts price risk into a non-issue.", incorrect: "Match maturity to your need. Chasing yield with long bonds adds volatility you may not be able to wait out." } } },
      { variantId: "ibx-ir-pr-tf", step: { type: "true-false", statement: "Bond funds behave differently from individual bonds because a fund has no single maturity date.", correct: true, feedback: { correct: "Right. A fund continuously rolls its holdings, so there's no date on which you're guaranteed your capital back.", incorrect: "It's true. Individual bonds mature; funds don't, so their value keeps moving with rates." } } },
      { variantId: "ibx-ir-pr-sc", step: { type: "scenario", question: "Rates have risen and Thabo's bond fund is down 6%. He doesn't need the money for ten years. What's reasonable?", options: ["Hold, the fund now reinvests at higher rates", "Sell and move to cash", "Switch to a longer-duration fund", "Stop all investing"], correct: 0, feedback: { correct: "Right. Higher rates hurt today's price but improve tomorrow's income, and ten years is ample time for that to play out.", incorrect: "Holding makes sense. Selling locks in the price fall and gives up the higher income the fund is now earning." } } },
    ],
  },
];

// ── Thabo's R500 Decision (applied) ─────────────────────────────────────────
const thaboSlots: QuestionSlot[] = [
  {
    slotId: "investing-basics/thabo/which-vehicle",
    conceptId: "tfsa",
    variants: [
      { variantId: "ibx-th-wv-sc", step: { type: "scenario", question: "Thabo is 26, has an emergency fund, no expensive debt, and R500 a month to invest for the long term. What fits best?", options: ["A TFSA holding an index fund", "A five-year bank fixed deposit", "A single JSE share he likes", "Cash under the mattress"], correct: 0, feedback: { correct: "Right. Decades of growth with no tax on interest, dividends or capital gains, and R500 a month is far below the R46 000 annual limit.", incorrect: "A TFSA with a low-cost index fund. Long horizon plus tax-free growth is exactly what it's designed for." } } },
      { variantId: "ibx-th-wv-mcq", step: { type: "mcq", question: "What makes a TFSA especially powerful for a young investor?", options: ["Decades of compounding, untaxed", "A guaranteed annual return of 15%", "Employer matching payments", "Exemption from all fees"], correct: 0, feedback: { correct: "Right. The longer the money stays in, the larger the tax saving becomes. Time is the ingredient a 26-year-old has most of.", incorrect: "It's the tax-free compounding over a long horizon. Fees still apply and returns aren't guaranteed." } } },
      { variantId: "ibx-th-wv-tf", step: { type: "true-false", statement: "A TFSA must be held in cash.", correct: false, feedback: { correct: "Right. It's a wrapper. You can hold ETFs, unit trusts or cash inside it, and for a long horizon equities usually make more sense.", incorrect: "It's a tax wrapper, not a product. You choose what sits inside it." } } },
    ],
  },
  {
    slotId: "investing-basics/thabo/annual-limit",
    conceptId: "tfsa",
    variants: [
      { variantId: "ibx-th-al-sc", step: { type: "scenario", question: "Thabo invests R500 a month (R6 000 a year). Zanele invests R46 000 a year, about R3 833 a month. Who fills their annual TFSA allowance?", options: ["Zanele", "Thabo", "Both of them", "Neither of them"], correct: 0, feedback: { correct: "Right. Thabo uses R6 000 of his R46 000. Unused annual room doesn't carry forward, but he's building the habit early, which matters more.", incorrect: "The annual limit is R46 000, so Zanele fills hers exactly and Thabo uses R6 000 of his." } } },
      { variantId: "ibx-th-al-fill", step: { type: "fill-blank", title: "Annual room used", prompt: "The TFSA annual limit is R46 000. Thabo contributes R500 a month for a year. His unused annual room = R____.", correct: 40000, feedback: { correct: "R46 000 − R6 000 = R40 000 unused, and that room doesn't roll over to next year.", incorrect: "R46 000 − (R500 × 12 = R6 000) = R40 000 unused." } } },
      { variantId: "ibx-th-al-tf", step: { type: "true-false", statement: "Unused TFSA contribution room carries over to the following tax year.", correct: false, feedback: { correct: "Right. Annual room is use-it-or-lose-it, though the R500 000 lifetime limit stays available across your life.", incorrect: "Annual room doesn't roll over. Only the lifetime limit persists." } } },
    ],
  },
  {
    slotId: "investing-basics/thabo/withdrawal-rule",
    conceptId: "tfsa",
    variants: [
      { variantId: "ibx-th-wr-mcq", step: { type: "mcq", question: "You withdraw R36 000 from your TFSA. What happens to your lifetime limit?", options: ["It's unchanged", "R36 000 of room is returned to you", "Your lifetime limit increases", "The account closes"], correct: 0, feedback: { correct: "Right. That R36 000 of your R500 000 lifetime allowance is gone permanently, which is why a TFSA is a poor emergency fund.", incorrect: "Withdrawals don't restore room. The contribution counted against your lifetime limit when you made it." } } },
      { variantId: "ibx-th-wr-tf", step: { type: "true-false", statement: "A TFSA is a sensible place for your emergency fund.", correct: false, feedback: { correct: "Right. Withdrawing permanently burns lifetime room you can never rebuild. Keep emergency money in a money market or notice account.", incorrect: "It's a poor fit. The withdrawal rule means using it as a buffer permanently costs you tax-free room." } } },
      { variantId: "ibx-th-wr-sc", step: { type: "scenario", question: "Thabo is tempted to use his TFSA for a car deposit in two years. What's the cost?", options: ["He loses that contribution room", "Nothing, he can replace the money", "A small withdrawal penalty", "SARS taxes the withdrawal"], correct: 0, feedback: { correct: "Right. The withdrawal itself is tax-free, but the room never comes back, so a short-term goal deserves a different account.", incorrect: "The room is gone for good. Save for the car separately and leave the TFSA to compound." } } },
    ],
  },
  {
    slotId: "investing-basics/thabo/starting-small",
    conceptId: "tfsa",
    variants: [
      { variantId: "ibx-th-ss-mcq", step: { type: "mcq", question: "Is R500 a month worth investing at all?", options: ["Yes, the habit matters most", "No, under R2 000 is pointless", "Only for exactly 30 years", "Only inside a fixed deposit"], correct: 0, feedback: { correct: "Right. Starting at 26 with R500 and escalating with each raise beats starting at 36 with R2 000.", incorrect: "It's absolutely worth it. Starting early with a small amount usually beats starting later with more." } } },
      { variantId: "ibx-th-ss-tf", step: { type: "true-false", statement: "Increasing your contribution whenever your income rises is more important than picking the perfect fund.", correct: true, feedback: { correct: "Right. Contribution rate is the lever with the biggest effect, and it's entirely within your control.", incorrect: "It's true. Fund selection matters far less than how much you put in and how long you leave it." } } },
      { variantId: "ibx-th-ss-sc", step: { type: "scenario", question: "Thabo's income rises 8% next year. What's the highest-value adjustment?", options: ["Raise his monthly contribution before adjusting his spending", "Keep the contribution flat and enjoy the raise", "Switch to a more aggressive fund", "Open a second investment account"], correct: 0, feedback: { correct: "Right. Escalating before the money reaches his lifestyle is the cheapest increase he'll ever make.", incorrect: "Increase the contribution first. Once spending absorbs the raise, it's much harder to redirect." } } },
    ],
  },
];

export const INVESTING_BASICS_EXTRA_BANKS: Record<string, LessonBank> = {
  "investing-basics::lesson-etfs-deep-dive": {
    layout: L(etfSlots, "Why ETFs Changed Everything", "<p>One index ETF buys a slice of hundreds or thousands of companies in a single transaction. Diversification that used to require serious money. The fund tracks the index rather than trying to beat it, and the <strong>TER</strong> is the main thing separating two funds following the same index. A 1.8% fee gap on R200 000 is <strong>R3 600 in year one</strong>, and that gap compounds for as long as you invest.</p>"),
    slots: etfSlots,
  },
  "investing-basics::lesson-unit-trusts": {
    layout: L(utSlots, "Pooled, Professionally Managed", "<p>Unit trusts pool many investors' money under one mandate. They're properly regulated in SA, with an independent trustee holding the assets. The real risks are <strong>cost and underperformance</strong>, not fraud. Compare funds <strong>net of fees</strong>: 12.4% gross with a 1.8% TER (10.6% net) loses to 11.8% gross with a 0.3% TER (11.5% net). And remember costs stack: fund, platform and advice are three separate layers.</p>"),
    slots: utSlots,
  },
  "investing-basics::lesson-dollar-cost-averaging": {
    layout: L(dcaSlots, "Remove the Timing Pressure", "<p>Investing a fixed amount every month buys more units when prices fall and fewer when they rise, but the real benefit is that you stop guessing. Lump sums win more often historically; phasing in wins on regret and on sticking with it. When markets drop mid-plan, <strong>keep the debit order running</strong>: those are the cheapest units you'll ever buy. Date it just after payday, and raise it with every increase.</p>"),
    slots: dcaSlots,
  },
  "investing-basics::lesson-investment-scams": {
    layout: L(scamSlots, "SA's Expensive Lessons", "<p>South Africa has lost billions to schemes promising guaranteed high returns. The signature is consistent: <strong>impossible returns, urgency, secrecy, and rewards for recruiting</strong>. An FSCA licence proves authorisation and gives you recourse, it doesn't promise performance, and quoted FSP numbers must be verified on the register yourself. If you're caught: stop paying, keep every record, report it, and treat any 'recovery agent' wanting an upfront fee as the second scam.</p>"),
    slots: scamSlots,
  },
  "investing-basics::lesson-property-as-investment": {
    layout: L(propSlots, "The Appeal and the Reality", "<p>Gross rental yield is annual rent ÷ price. R96 000 on a R1.2m flat is <strong>8% gross</strong>. Net is what matters: rates, levies, insurance, maintenance, agent fees and vacant months routinely take a third of the rent. Buy-to-let is a small business, not passive income, and eviction is a months-long court process. A <strong>listed REIT</strong> gives property exposure with no tenants and same-day liquidity, but no leverage and no control.</p>"),
    slots: propSlots,
  },
  "investing-basics::lesson-investment-fees": {
    layout: L(feeSlots, "The Silent Wealth Killer", "<p>Returns are uncertain; fees are contractual. A recurring annual percentage is charged on your whole balance every year, so it compounds against you. Over 30 years, 1% a year can cost roughly a fifth of the final value. Under the <strong>FAIS General Code</strong>, fees and conflicts must be disclosed in writing before you commit. Ask for the <strong>total effective annual cost in both percent and rands</strong>.</p>"),
    slots: feeSlots,
  },
  "investing-basics::lesson-bonds-mechanics": {
    layout: L(bondSlots, "A Bond Is a Loan You Give", "<p>Buy a bond and you've lent money: fixed interest along the way, capital back at maturity. R50 000 of a retail bond at 9.75% pays <strong>R4 875 a year</strong>. Corporate bonds pay more than government bonds because they carry credit risk. An unusually high yield is a warning label, not a bargain. In a portfolio, bonds are ballast: steadier income, smaller swings, less long-run growth than equities.</p>"),
    slots: bondSlots,
  },
  "investing-basics::lesson-bond-interest-rate-risk": {
    layout: L(irrSlots, "The Bond Price Paradox", "<p>Bond prices and interest rates move in <strong>opposite directions</strong>. Rates fall, existing higher-coupon bonds become more valuable; rates rise and their prices drop. <strong>Duration</strong> measures that sensitivity, a 20-year bond swings far more than a 2-year one. Held to maturity, a retail bond returns your capital regardless, so the loss is opportunity cost, not capital. Bond <em>funds</em> have no maturity date, so their value keeps moving.</p>"),
    slots: irrSlots,
  },
  "investing-basics::lesson-applied-thabo-investment": {
    layout: L(thaboSlots, "Thabo's R500 Decision", "<p>Thabo is 26, has an emergency fund, no expensive debt, and R500 a month to invest for the long term. A <strong>TFSA holding a low-cost index fund</strong> fits: no tax on interest, dividends or growth, and decades for it to compound. His R6 000 a year uses a fraction of the <strong>R46 000</strong> annual limit, but unused annual room doesn't roll over, and <strong>withdrawals never restore</strong> lifetime room.</p>"),
    slots: thaboSlots,
  },
};
