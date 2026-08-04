import type { LessonLayoutItem, QuestionSlot } from "@/data/content";
import type { LessonBank } from "./money-basics";

/**
 * Premium banks for the Money Basics EXTRA lessons (previously rotation-only).
 * Reuses existing concepts interest-rates and debt-payoff; adds the rest.
 * Figures are illustrative personal-finance examples, not regulated figures.
 */
const info = (title: string, content: string): LessonLayoutItem => ({ type: "info", title, content });
const L = (slots: QuestionSlot[], title: string, content: string): LessonLayoutItem[] => [
  info(title, content),
  ...slots.map((s) => ({ slot: s.slotId })),
];

// ── Zero-Based Budgeting ────────────────────────────────────────────────────
const zbbSlots: QuestionSlot[] = [
  {
    slotId: "money-basics/zbb/every-rand",
    conceptId: "zero-based-budget",
    variants: [
      { variantId: "mbx-zbb-er-mcq", step: { type: "mcq", question: "In zero-based budgeting, income minus all your allocations should equal:", options: ["Exactly R0. Every rand has a job", "Whatever's left as spending money", "At least R500 buffer", "A negative you cover with credit"], correct: 0, feedback: { correct: "Right. Every rand is assigned before the month starts, including savings.", incorrect: "It's R0: every rand is allocated, savings included. Nothing is 'left over'." } } },
      { variantId: "mbx-zbb-er-tf", step: { type: "true-false", statement: "Zero-based budgeting means you must spend every rand each month.", correct: false, feedback: { correct: "Correct. Allocating isn't spending. Money assigned to savings is still yours, just given a job.", incorrect: "It allocates, not spends. Savings and investments are categories, not spending." } } },
      { variantId: "mbx-zbb-er-sc", step: { type: "scenario", question: "In a zero-based budget, where do savings fit?", options: ["A category allocated up front", "Only whatever's left at month-end", "Ignored: savings aren't budgeted", "Funded by credit"], correct: 0, feedback: { correct: "Right. Savings get a designated allocation like any other category.", incorrect: "Savings are an up-front category in ZBB, not a leftover." } } },
    ],
  },
  {
    slotId: "money-basics/zbb/build",
    conceptId: "zero-based-budget",
    variants: [
      { variantId: "mbx-zbb-bd-mcq", step: { type: "mcq", question: "The first step in building a zero-based budget is to:", options: ["Write down your monthly take-home (net) pay", "Start spending and see what's left", "Open a credit line", "Guess your expenses"], correct: 0, feedback: { correct: "Right. Start from net income, then allocate down to R0.", incorrect: "Begin with your net take-home pay, then allocate every rand." } } },
      { variantId: "mbx-zbb-bd-tf", step: { type: "true-false", statement: "In a zero-based budget, fixed expenses (rent, insurance, debt) are listed before variable ones.", correct: true, feedback: { correct: "Right. Lock in the non-negotiables first, then variables, then savings.", incorrect: "It's true. Fixed costs come first, then variables, then savings." } } },
      { variantId: "mbx-zbb-bd-fill", step: { type: "fill-blank", title: "ZBB check", prompt: "Net income R21 000. Rent R7 000, food R3 000, transport R2 500, insurance R1 200, debt R2 300, entertainment R1 000. The savings allocation to reach R0 is R____.", correct: 4000, feedback: { correct: "Right: R21 000 − R17 000 in expenses = R4 000 to savings.", incorrect: "Expenses total R17 000; R21 000 − R17 000 = R4 000 allocated to savings." } } },
    ],
  },
  {
    slotId: "money-basics/zbb/surplus",
    conceptId: "zero-based-budget",
    variants: [
      { variantId: "mbx-zbb-su-mcq", step: { type: "mcq", question: "In ZBB, a surplus after your essentials should be:", options: ["Given a job, allocated to savings or debt payoff", "Left floating in the account", "Spent freely, it's extra", "Ignored"], correct: 0, feedback: { correct: "Right. Even the surplus gets a category, usually savings or extra debt payments.", incorrect: "Assign the surplus to savings or debt. Don't leave it floating." } } },
      { variantId: "mbx-zbb-su-tf", step: { type: "true-false", statement: "Money allocated to savings in a zero-based budget counts as 'spent'.", correct: false, feedback: { correct: "Correct. It's allocated, not spent. It's building your future.", incorrect: "Savings allocations aren't 'spent'. They're money kept, with a purpose." } } },
      { variantId: "mbx-zbb-su-sc", step: { type: "scenario", question: "Thabo finishes his ZBB with R900 unallocated. What should he do?", options: ["Assign it a job so the budget hits R0", "Leave it. It'll sort itself out", "Add it to 'fun' without deciding", "Withdraw it as cash and forget it"], correct: 0, feedback: { correct: "Right. Unallocated rands leak. Give the R900 a purpose.", incorrect: "Assign the R900 deliberately. Unallocated money tends to disappear." } } },
    ],
  },
  {
    slotId: "money-basics/zbb/why",
    conceptId: "zero-based-budget",
    variants: [
      { variantId: "mbx-zbb-wy-mcq", step: { type: "mcq", question: "The main advantage of ZBB over 'spend what's left, save the rest' is:", options: ["Every rand is intentional", "It requires no thinking", "It lets you overspend safely", "It avoids all bills"], correct: 0, feedback: { correct: "Right. Saving first, by design, beats hoping something is left over.", incorrect: "The edge is intentionality: savings are planned, not leftovers." } } },
      { variantId: "mbx-zbb-wy-tf", step: { type: "true-false", statement: "'Spending what's left' usually leaves less for savings than giving every rand a job first.", correct: true, feedback: { correct: "Right. Leftovers are usually nothing. Plan savings up front instead.", incorrect: "It's true. 'what's left' is often zero. ZBB puts savings first." } } },
      { variantId: "mbx-zbb-wy-sc", step: { type: "scenario", question: "Lerato keeps meaning to save 'whatever's left' but never does. ZBB fixes this by:", options: ["Making savings a fixed allocation before any discretionary spending", "Removing her savings entirely", "Letting her spend first", "Adding more subscriptions"], correct: 0, feedback: { correct: "Right. Savings become a non-negotiable line, not a hope.", incorrect: "ZBB makes savings an up-front allocation, so it actually happens." } } },
    ],
  },
];

// ── Cash Flow ───────────────────────────────────────────────────────────────
const cashSlots: QuestionSlot[] = [
  {
    slotId: "money-basics/cash-flow/definition",
    conceptId: "personal-cash-flow",
    variants: [
      { variantId: "mbx-cf-df-mcq", step: { type: "mcq", question: "A doctor earning R180 000/month but spending R185 000/month has:", options: ["Negative cash flow despite a high income", "Strong cash flow from high income", "Rapidly growing net worth", "Nothing to worry about"], correct: 0, feedback: { correct: "Right. −R5 000/month destroys wealth at any income level.", incorrect: "Income minus spending is −R5 000: negative cash flow. High income isn't health." } } },
      { variantId: "mbx-cf-df-tf", step: { type: "true-false", statement: "You can earn a high income and still have negative cash flow.", correct: true, feedback: { correct: "Right. Spending, not income, decides cash flow.", incorrect: "It's true. Spend more than you earn at any income and cash flow is negative." } } },
      { variantId: "mbx-cf-df-fill", step: { type: "fill-blank", title: "Monthly cash flow", prompt: "Income R28 000. Fixed expenses R18 000. Variable expenses R7 000. Monthly surplus (cash flow) = R____.", correct: 3000, feedback: { correct: "Right: R28 000 − R25 000 = R3 000, your investable surplus.", incorrect: "R28 000 − (R18 000 + R7 000) = R3 000 positive cash flow." } } },
    ],
  },
  {
    slotId: "money-basics/cash-flow/improve",
    conceptId: "personal-cash-flow",
    variants: [
      { variantId: "mbx-cf-im-tf", step: { type: "true-false", statement: "The fastest way to improve cash flow is always to earn more money.", correct: false, feedback: { correct: "Correct. Cutting expenses works immediately and is in your control; raises often bring lifestyle inflation.", incorrect: "Cutting expenses is usually faster and more reliable than earning more." } } },
      { variantId: "mbx-cf-im-mcq", step: { type: "mcq", question: "Most people's cash-flow problems are really:", options: ["Spending problems, not income problems", "Always income problems", "Caused only by tax", "Impossible to fix"], correct: 0, feedback: { correct: "Right. That's why expense cuts fix cash flow fastest.", incorrect: "They're mostly spending problems, which is good news, because you control spending." } } },
      { variantId: "mbx-cf-im-sc", step: { type: "scenario", question: "Someone with tight cash flow wants more surplus this month. Quickest lever?", options: ["Cut recurring expenses now", "Wait months for a raise", "Take a loan", "Do nothing"], correct: 0, feedback: { correct: "Right. Trimming recurring costs improves cash flow immediately.", incorrect: "Cutting recurring costs is the immediate lever. A raise is slower and uncertain." } } },
    ],
  },
  {
    slotId: "money-basics/cash-flow/positive",
    conceptId: "personal-cash-flow",
    variants: [
      { variantId: "mbx-cf-po-mcq", step: { type: "mcq", question: "Why does positive cash flow matter so much?", options: ["The surplus is the engine that funds saving, investing and debt payoff", "It lets you ignore budgeting", "It guarantees a high income", "It removes all risk"], correct: 0, feedback: { correct: "Right. A R3 000/month surplus invested at 10% for 20 years ≈ R2.3m.", incorrect: "Surplus cash flow funds wealth, saving, investing, debt payoff." } } },
      { variantId: "mbx-cf-po-tf", step: { type: "true-false", statement: "Growing your monthly surplus by even R500 through small cuts makes a big long-term difference.", correct: true, feedback: { correct: "Right. Small, consistent surpluses compound into large sums.", incorrect: "It's true. Even R500/month more, invested for years, adds up substantially." } } },
      { variantId: "mbx-cf-po-sc", step: { type: "scenario", question: "Your monthly cash flow is negative. How urgent is it?", options: ["Very. You're going backwards every month; it's the top priority", "Not urgent, income will rise", "Only matters at retirement", "Ignore it below a high income"], correct: 0, feedback: { correct: "Right. Negative cash flow is the most pressing thing to fix.", incorrect: "It's urgent: negative cash flow erodes wealth every single month." } } },
    ],
  },
  {
    slotId: "money-basics/cash-flow/direct-it",
    conceptId: "personal-cash-flow",
    variants: [
      { variantId: "mbx-cf-di-mcq", step: { type: "mcq", question: "Once you have a monthly surplus, the best habit is to:", options: ["Direct it intentionally , automatically", "Let it sit and get spent", "Upgrade your lifestyle to match", "Withdraw it as cash"], correct: 0, feedback: { correct: "Right. Automate the surplus toward a goal before it evaporates.", incorrect: "Direct the surplus on purpose, ideally automatically, or it gets spent." } } },
      { variantId: "mbx-cf-di-tf", step: { type: "true-false", statement: "A known monthly surplus should be given a destination rather than left in your current account.", correct: true, feedback: { correct: "Right. Money left in the account tends to be absorbed by spending.", incorrect: "It's true, send the surplus somewhere on purpose, or it drifts into spending." } } },
      { variantId: "mbx-cf-di-sc", step: { type: "scenario", question: "Sipho finds he has R3 000 surplus each month sitting idle. Best move?", options: ["Set up an automatic transfer to savings/investing on payday", "Leave it and hope to save it", "Spend it since it's 'extra'", "Move it to a fee-heavy account"], correct: 0, feedback: { correct: "Right. Automating it on payday turns surplus into wealth.", incorrect: "Automate the R3 000 to savings/investing. Idle surplus gets spent." } } },
    ],
  },
];

// ── Salary Negotiation ──────────────────────────────────────────────────────
const negoSlots: QuestionSlot[] = [
  {
    slotId: "money-basics/salary-nego/why",
    conceptId: "salary-negotiation",
    variants: [
      { variantId: "mbx-neg-wy-mcq", step: { type: "mcq", question: "Why is your starting salary such a big financial lever?", options: ["Raises compound off it", "It's taxed less than other income", "It can't be changed later", "It affects only this year"], correct: 0, feedback: { correct: "Right. A higher base compounds through every future raise.", incorrect: "Your base compounds through raises for decades: it shapes lifetime earnings." } } },
      { variantId: "mbx-neg-wy-tf", step: { type: "true-false", statement: "Negotiating salary is considered rude and unprofessional in SA workplaces.", correct: false, feedback: { correct: "Correct. Most employers expect a respectful, data-backed negotiation.", incorrect: "It's expected, not rude. Offers usually have negotiation room built in." } } },
      { variantId: "mbx-neg-wy-mcq2", step: { type: "mcq", question: "Before negotiating, the most important preparation is to:", options: ["Research the market rate for your role and city", "Decide the highest number you can shout", "Threaten to quit", "Nothing, wing it"], correct: 0, feedback: { correct: "Right. Market data (LinkedIn, PayScale, recruiters) anchors a credible ask.", incorrect: "Research the market rate first. Data makes the ask credible." } } },
    ],
  },
  {
    slotId: "money-basics/salary-nego/counter",
    conceptId: "salary-negotiation",
    variants: [
      { variantId: "mbx-neg-co-mcq", step: { type: "mcq", question: "Offered R45 000 when market rate is R52 000–R58 000, the best approach is to:", options: ["Present your research and propose about R54 000", "Accept. You're lucky to be offered", "Counter with R70 000 to anchor high", "Wait until after you start"], correct: 0, feedback: { correct: "Right. A data-backed mid-market counter is professional and often lands at R52k+.", incorrect: "Counter with research at ≈R54k. Reasonable, credible, and likely to move the offer up." } } },
      { variantId: "mbx-neg-co-sc", step: { type: "scenario", question: "An offer is below market and you have solid market data. What's the professional move?", options: ["Share the data and propose a specific, mid-market number", "Say nothing and resent it later", "Demand double with no basis", "Accept and complain to colleagues"], correct: 0, feedback: { correct: "Right. Specific + evidence-based is how negotiation works.", incorrect: "Present the data and a specific number. That's professional negotiation." } } },
      { variantId: "mbx-neg-co-tf", step: { type: "true-false", statement: "Most initial job offers have some negotiation room built in.", correct: true, feedback: { correct: "Right. Employers usually expect a counter and leave headroom.", incorrect: "It's true. Most offers have room; not negotiating often leaves money on the table." } } },
    ],
  },
  {
    slotId: "money-basics/salary-nego/save-the-raise",
    conceptId: "salary-negotiation",
    variants: [
      { variantId: "mbx-neg-sr-sc", step: { type: "scenario", question: "You get a R10 000 raise and invest half (R5 000/month) at 10%. After 10 years that's about:", options: ["R1 020 000", "R600 000", "R350 000", "R200 000"], correct: 0, feedback: { correct: "Right: R5 000/month at 10% for 10 years ≈ R1.02m, without cutting your lifestyle.", incorrect: "R5 000/month at 10% for 10 years ≈ R1 million. Save half of every raise." } } },
      { variantId: "mbx-neg-sr-tf", step: { type: "true-false", statement: "Saving half of every raise builds wealth without reducing your current lifestyle.", correct: true, feedback: { correct: "Right. You still enjoy half the raise while the other half compounds.", incorrect: "It's true. Banking half a raise grows wealth and still lifts your lifestyle." } } },
      { variantId: "mbx-neg-sr-mcq", step: { type: "mcq", question: "A good rule when a raise arrives is to:", options: ["Bank at least half before upgrading anything", "Upgrade the car first", "Spend it all: you earned it", "Ignore it"], correct: 0, feedback: { correct: "Right. Capturing half turns rising income into rising wealth.", incorrect: "Bank at least half of the raise first. That's how income becomes wealth." } } },
    ],
  },
  {
    slotId: "money-basics/salary-nego/script",
    conceptId: "salary-negotiation",
    variants: [
      { variantId: "mbx-neg-sc-mcq", step: { type: "mcq", question: "A strong negotiation opener combines:", options: ["Market research + your specific value + a specific proposed number", "An ultimatum", "An apology for asking", "Vague hopes for 'more'"], correct: 0, feedback: { correct: "Right. Evidence, your contribution, and a clear number.", incorrect: "Lead with market data, your value, and a specific figure, not ultimatums or apologies." } } },
      { variantId: "mbx-neg-sc-tf", step: { type: "true-false", statement: "Naming a specific researched figure is more effective than asking vaguely for 'more'.", correct: true, feedback: { correct: "Right. Specific, evidence-based numbers anchor the conversation.", incorrect: "It's true. A specific researched number beats a vague 'more'." } } },
      { variantId: "mbx-neg-sc-sc", step: { type: "scenario", question: "You want a raise. The most persuasive case rests on:", options: ["Market data plus specific achievements you've delivered", "How long you've been there alone", "Personal expenses you can't cover", "A colleague's salary you overheard"], correct: 0, feedback: { correct: "Right. Value delivered + market rate is the persuasive combination.", incorrect: "Base it on your achievements and market rate, not tenure or personal costs." } } },
    ],
  },
];

// ── Financial Goals ─────────────────────────────────────────────────────────
const goalsSlots: QuestionSlot[] = [
  {
    slotId: "money-basics/goals/specific",
    conceptId: "financial-goals",
    variants: [
      { variantId: "mbx-gl-sp-mcq", step: { type: "mcq", question: "Which is the best-written financial goal?", options: ["Invest R1 500/month into a JSE ETF for 5 years to fund my MBA by 2029", "Save more money this year", "Get rich by 40", "Stop wasting money"], correct: 0, feedback: { correct: "Right. Amount, vehicle, deadline and reason, a complete, actionable goal.", incorrect: "Only the first has amount, vehicle, deadline and reason. The rest are wishes." } } },
      { variantId: "mbx-gl-sp-tf", step: { type: "true-false", statement: "'I want to save more money' is a proper financial goal.", correct: false, feedback: { correct: "Correct. It's a wish. A goal needs a specific amount, deadline and reason.", incorrect: "It's a wish, not a goal. Add an amount, deadline and reason." } } },
      { variantId: "mbx-gl-sp-mcq2", step: { type: "mcq", question: "A complete financial goal includes:", options: ["A specific amount, a deadline, and a meaningful reason", "Only a vague intention", "Just a big dream", "Only a deadline"], correct: 0, feedback: { correct: "Right. Amount + deadline + reason (and ideally a vehicle).", incorrect: "It needs a specific amount, a deadline and a reason to stick." } } },
    ],
  },
  {
    slotId: "money-basics/goals/reverse-engineer",
    conceptId: "financial-goals",
    variants: [
      { variantId: "mbx-gl-re-fill", step: { type: "fill-blank", title: "Monthly saving for a goal", prompt: "You want to save R60 000 in 12 months. Your required monthly saving is R____.", correct: 5000, feedback: { correct: "Right: R60 000 ÷ 12 = R5 000/month.", incorrect: "R60 000 ÷ 12 = R5 000/month. Reverse-engineer goals into a monthly number." } } },
      { variantId: "mbx-gl-re-mcq", step: { type: "mcq", question: "The best way to make a big goal actionable is to:", options: ["Break it into a required monthly contribution", "Keep it as one scary lump sum", "Wait for a windfall", "Hope it happens"], correct: 0, feedback: { correct: "Right. A monthly number is something your budget can actually carry.", incorrect: "Convert it to a monthly contribution, then check it against your budget." } } },
      { variantId: "mbx-gl-re-tf", step: { type: "true-false", statement: "Breaking a goal into a monthly amount lets you check whether your budget can actually carry it.", correct: true, feedback: { correct: "Right. If the monthly number doesn't fit, adjust the amount or timeline.", incorrect: "It's true. The monthly figure is your reality check against the budget." } } },
    ],
  },
  {
    slotId: "money-basics/goals/multiple",
    conceptId: "financial-goals",
    variants: [
      { variantId: "mbx-gl-mu-tf", step: { type: "true-false", statement: "You should only work on one financial goal at a time to avoid confusion.", correct: false, feedback: { correct: "Correct. Short- and long-term goals (emergency fund AND retirement) run together.", incorrect: "You can run multiple goals at once: emergency fund and retirement shouldn't wait for each other." } } },
      { variantId: "mbx-gl-mu-mcq", step: { type: "mcq", question: "An emergency fund and retirement saving should be pursued:", options: ["At the same time. They're different time horizons", "One fully before the other starts", "Only after age 40", "Never together"], correct: 0, feedback: { correct: "Right. Different horizons run in parallel.", incorrect: "Run them together. Short-term and long-term goals are both essential now." } } },
      { variantId: "mbx-gl-mu-mcq2", step: { type: "mcq", question: "To avoid raiding one goal for another, you should:", options: ["Keep a separate savings account per goal", "Mix everything in one account", "Only use cash", "Track nothing"], correct: 0, feedback: { correct: "Right. Separate accounts stop the holiday fund funding an impulse buy.", incorrect: "Separate accounts per goal prevent mixing and raiding." } } },
    ],
  },
  {
    slotId: "money-basics/goals/horizons",
    conceptId: "financial-goals",
    variants: [
      { variantId: "mbx-gl-hz-mcq", step: { type: "mcq", question: "A house deposit in 5 years is best classed as a:", options: ["Medium-term goal (2–7 years)", "Short-term goal (0–2 years)", "Long-term goal (7+ years)", "Not a goal"], correct: 0, feedback: { correct: "Right. 2–7 years is medium-term. Informs where you save it.", incorrect: "Five years is medium-term (2–7 years)." } } },
      { variantId: "mbx-gl-hz-tf", step: { type: "true-false", statement: "Retirement and financial independence are long-term (7+ year) goals.", correct: true, feedback: { correct: "Right. Long horizons suit growth assets like equities.", incorrect: "It's true. Retirement is long-term (7+ years)." } } },
      { variantId: "mbx-gl-hz-sc", step: { type: "scenario", question: "Why does a goal's time horizon matter?", options: ["It guides where you keep the money", "It doesn't matter at all", "It sets your tax rate", "It changes your salary"], correct: 0, feedback: { correct: "Right. Short-term → safe/cash; long-term → growth assets.", incorrect: "Horizon drives the vehicle: near-term goals stay safe, long-term goals can hold growth assets." } } },
    ],
  },
];

// ── Side Income ─────────────────────────────────────────────────────────────
const sideSlots: QuestionSlot[] = [
  {
    slotId: "money-basics/side-income/why",
    conceptId: "side-income",
    variants: [
      { variantId: "mbx-si-wy-mcq", step: { type: "mcq", question: "Why is relying on a single income stream risky?", options: ["Losing that job means an immediate crisis with no backup", "It's taxed more", "It's illegal", "It always pays less"], correct: 0, feedback: { correct: "Right. A second stream, even R2 000/month, buys time and cuts anxiety.", incorrect: "One stream means one point of failure. A second income is a safety buffer." } } },
      { variantId: "mbx-si-wy-tf", step: { type: "true-false", statement: "The best side income usually uses skills you already have.", correct: true, feedback: { correct: "Right. Leverage existing credentials for near-zero startup cost.", incorrect: "It's true. Using existing skills keeps startup cost and risk low." } } },
      { variantId: "mbx-si-wy-mcq2", step: { type: "mcq", question: "For a qualified professional, the highest-margin, lowest-cost side income is usually:", options: ["Freelancing in their professional skill", "A physical retail store", "Flea-market reselling", "Renting out a vehicle"], correct: 0, feedback: { correct: "Right. Freelancing uses paid-for credentials at almost no cost.", incorrect: "Freelancing your existing skill has the highest margin and lowest startup cost." } } },
    ],
  },
  {
    slotId: "money-basics/side-income/tax",
    conceptId: "side-income",
    variants: [
      { variantId: "mbx-si-tx-tf", step: { type: "true-false", statement: "Side income below R1 000/month doesn't need to be declared to SARS.", correct: false, feedback: { correct: "Correct. All income is taxable and must be declared. There's no minimum.", incorrect: "All income must be declared, regardless of amount. Non-declaration is evasion." } } },
      { variantId: "mbx-si-tx-mcq", step: { type: "mcq", question: "Earning more than R30 000 from non-salary sources means you must:", options: ["Register for provisional tax", "Pay nothing extra", "Close the side business", "Only declare it at retirement"], correct: 0, feedback: { correct: "Right. Provisional tax spreads the bill across the year.", incorrect: "Non-salary income over R30 000 triggers provisional tax (Aug and Feb)." } } },
      { variantId: "mbx-si-tx-mcq2", step: { type: "mcq", question: "Your taxable side-business profit is:", options: ["Income received minus legitimate business expenses", "All income, no deductions", "Zero. Side income is exempt", "Only the cash portion"], correct: 0, feedback: { correct: "Right. Keep records of income and expenses; the difference is taxed.", incorrect: "It's income minus legitimate expenses. Keep records of both." } } },
    ],
  },
  {
    slotId: "money-basics/side-income/invest-it",
    conceptId: "side-income",
    variants: [
      { variantId: "mbx-si-in-sc", step: { type: "scenario", question: "Lungelo earns R30k salary, tutors for R4 000/month, and invests all of it in a TFSA at 10%. After 10 years that's about:", options: ["R820 000", "R250 000", "R480 000", "R1.1 million"], correct: 0, feedback: { correct: "Right: R4 000/month at 10% for 10 years ≈ R820k, tax-free in a TFSA.", incorrect: "R4 000/month at 10% for 10 years ≈ R820 000, tax-free inside a TFSA." } } },
      { variantId: "mbx-si-in-tf", step: { type: "true-false", statement: "Fully investing a side income (rather than spending it) is a powerful wealth combination.", correct: true, feedback: { correct: "Right. You don't rely on it to live, so it can all compound.", incorrect: "It's true, a side income you invest rather than spend compounds fast." } } },
      { variantId: "mbx-si-in-mcq", step: { type: "mcq", question: "The most powerful thing to do with side income (if your salary covers your life) is to:", options: ["Invest all of it, ideally in a tax-free wrapper", "Spend it on upgrades", "Leave it in a low-interest account", "Lend it to friends"], correct: 0, feedback: { correct: "Right. Invested (and tax-free) it becomes serious long-term money.", incorrect: "Invest it, ideally in a TFSA, rather than absorbing it into spending." } } },
    ],
  },
  {
    slotId: "money-basics/side-income/records",
    conceptId: "side-income",
    variants: [
      { variantId: "mbx-si-rc-mcq", step: { type: "mcq", question: "A side-hustler should keep records of:", options: ["All income received and legitimate business expenses", "Nothing. It's informal", "Only the best months", "Only cash income"], correct: 0, feedback: { correct: "Right. Records determine taxable profit and protect you in an audit.", incorrect: "Keep records of all income and expenses: they set your taxable profit." } } },
      { variantId: "mbx-si-rc-tf", step: { type: "true-false", statement: "Legitimate business expenses reduce the amount of side income you're taxed on.", correct: true, feedback: { correct: "Right. You're taxed on profit (income minus expenses), not turnover.", incorrect: "It's true. Deductible expenses lower your taxable profit." } } },
      { variantId: "mbx-si-rc-sc", step: { type: "scenario", question: "A freelancer never tracks income or expenses. Risk at tax time?", options: ["Can't prove profit, may overpay tax or face penalties in an audit", "No risk, SARS ignores small amounts", "Automatic refund", "Nothing at all"], correct: 0, feedback: { correct: "Right. No records means no defensible profit figure, costly at audit.", incorrect: "Without records you can't prove profit: risking overpayment or penalties." } } },
    ],
  },
];

// ── Interest Rates & Your Wallet (reuses interest-rates) ────────────────────
const rateSlots: QuestionSlot[] = [
  {
    slotId: "money-basics/rates/prime",
    conceptId: "interest-rates",
    variants: [
      { variantId: "mbx-rt-pr-fill", step: { type: "fill-blank", title: "Prime rate", prompt: "The SARB repo rate is 8.25%. The prime lending rate is ____% (repo + 3.5). Enter as e.g. 1175 for 11.75%.", correct: 1175, feedback: { correct: "Right: 8.25 + 3.5 = 11.75%.", incorrect: "Prime = repo + 3.5%: 8.25 + 3.5 = 11.75%." } } },
      { variantId: "mbx-rt-pr-mcq", step: { type: "mcq", question: "The prime lending rate is calculated as:", options: ["The repo rate + 3.5%", "The repo rate − 3.5%", "Double the repo rate", "A fixed 10%"], correct: 0, feedback: { correct: "Right. Prime = repo + 3.5%.", incorrect: "Prime is the repo rate plus 3.5%." } } },
      { variantId: "mbx-rt-pr-tf", step: { type: "true-false", statement: "When the SARB raises the repo rate, your home-loan and car-finance rates typically rise within weeks.", correct: true, feedback: { correct: "Right. Variable lending rates track the repo/prime rate.", incorrect: "It's true, repo hikes feed through to bond, car and credit rates quickly." } } },
    ],
  },
  {
    slotId: "money-basics/rates/impact",
    conceptId: "interest-rates",
    variants: [
      { variantId: "mbx-rt-im-mcq", step: { type: "mcq", question: "On a R1 million bond over 20 years, a 1% rate rise costs roughly:", options: ["About R500 more per month", "About R50 more per month", "Nothing", "About R5 000 more per month"], correct: 0, feedback: { correct: "Right. ~R500/month, ~R6 000/year per 1% on a R1m bond.", incorrect: "About R500 more per month, roughly R6 000/year per 1% on R1m." } } },
      { variantId: "mbx-rt-im-tf", step: { type: "true-false", statement: "Rate changes have no effect on a variable-rate home loan.", correct: false, feedback: { correct: "Correct. Variable-rate bonds move directly with the repo/prime rate.", incorrect: "They do affect it. A variable bond's repayment moves with rates." } } },
      { variantId: "mbx-rt-im-sc", step: { type: "scenario", question: "The SARB hikes 0.5%. A homeowner with a variable bond should:", options: ["Review the budget, absorb it, and consider paying extra capital", "Panic and sell the house", "Refinance to fixed immediately, no thought", "Do nothing: the bank sorts it out"], correct: 0, feedback: { correct: "Right. Extra capital lowers the balance future interest is charged on.", incorrect: "Review the budget and, if possible, pay extra capital to cushion future hikes." } } },
    ],
  },
  {
    slotId: "money-basics/rates/fixed-vs-variable",
    conceptId: "interest-rates",
    variants: [
      { variantId: "mbx-rt-fv-tf", step: { type: "true-false", statement: "A fixed interest rate on a home loan is always better than a variable rate.", correct: false, feedback: { correct: "Correct. Fixed buys certainty at a premium; variable wins when rates fall.", incorrect: "Neither is always better. Fixed is certainty at a cost; variable benefits when rates drop." } } },
      { variantId: "mbx-rt-fv-mcq", step: { type: "mcq", question: "A fixed rate mainly protects you when:", options: ["Rates are rising", "Rates are falling", "Rates never change", "You have no loan"], correct: 0, feedback: { correct: "Right. Fixed shields you from rising rates, at a premium.", incorrect: "Fixed protects against rising rates; variable is better when rates fall." } } },
      { variantId: "mbx-rt-fv-mcq2", step: { type: "mcq", question: "Choosing fixed vs variable should depend on:", options: ["Your view on rate direction and your tolerance for uncertainty", "Only the bank's preference", "Always picking the lower headline rate", "Nothing. They're identical"], correct: 0, feedback: { correct: "Right. It's a trade-off of certainty vs potential savings.", incorrect: "Decide on your rate view and risk tolerance, not just the headline number." } } },
    ],
  },
  {
    slotId: "money-basics/rates/extra-capital",
    conceptId: "interest-rates",
    variants: [
      { variantId: "mbx-rt-ec-mcq", step: { type: "mcq", question: "Paying extra capital into your bond:", options: ["Reduces the balance future interest is charged on", "Increases your interest rate", "Has no effect", "Is not allowed"], correct: 0, feedback: { correct: "Right. A lower balance means less interest and a shorter term.", incorrect: "Extra capital cuts the balance, so future interest is charged on less." } } },
      { variantId: "mbx-rt-ec-tf", step: { type: "true-false", statement: "Extra capital payments cushion you against future rate rises on a bond.", correct: true, feedback: { correct: "Right. A smaller balance means each rate hike costs you less.", incorrect: "It's true. A lower balance softens the rand impact of future hikes." } } },
      { variantId: "mbx-rt-ec-sc", step: { type: "scenario", question: "You have spare cash and a variable-rate bond in a rising-rate period. A sensible move is to:", options: ["Pay extra capital to shrink the balance", "Spend it before rates rise more", "Switch banks repeatedly", "Do nothing"], correct: 0, feedback: { correct: "Right. Extra capital now reduces both interest and exposure to hikes.", incorrect: "Pay down capital. It lowers interest and your sensitivity to further hikes." } } },
    ],
  },
];

// ── Talking About Money ─────────────────────────────────────────────────────
const talkSlots: QuestionSlot[] = [
  {
    slotId: "money-basics/money-talks/silence-costs",
    conceptId: "money-conversations",
    variants: [
      { variantId: "mbx-mt-sc-mcq", step: { type: "mcq", question: "Why does 'money silence' cost you?", options: ["It breeds financial ignorance, hides problems, and fuels conflict", "It saves on tax", "It improves credit scores", "It has no downside"], correct: 0, feedback: { correct: "Right. Not talking about money enables bad decisions and prevents learning.", incorrect: "Silence hides problems and blocks learning. That's the cost." } } },
      { variantId: "mbx-mt-sc-tf", step: { type: "true-false", statement: "Couples who never discuss money are more likely to have financial conflict.", correct: true, feedback: { correct: "Right. Money is a leading source of relationship conflict. Talking reduces it.", incorrect: "It's true. Money silence is strongly linked to relationship conflict." } } },
      { variantId: "mbx-mt-sc-sc", step: { type: "scenario", question: "You're getting married and find your partner has R80 000 of hidden credit-card debt. Best approach?", options: ["Full disclosure of income, debts and assets", "Deal with it after the wedding", "Quietly pay it off as a gift", "Leave it. Money is private"], correct: 0, feedback: { correct: "Right. Transparency before the commitment, then a shared plan.", incorrect: "Full disclosure and a joint plan beats discovering hidden debt later." } } },
    ],
  },
  {
    slotId: "money-basics/money-talks/parents",
    conceptId: "money-conversations",
    variants: [
      { variantId: "mbx-mt-pa-tf", step: { type: "true-false", statement: "It's wise to ask elderly parents about their financial affairs before an emergency arises.", correct: true, feedback: { correct: "Right. Not knowing where the will/policies are causes costly delays in a crisis.", incorrect: "It's true. Knowing where key documents are prevents chaos during an emergency." } } },
      { variantId: "mbx-mt-pa-mcq", step: { type: "mcq", question: "Why have this conversation before a crisis?", options: ["So you can find the will, policies and accounts quickly if needed", "To take control of their money now", "To reduce their tax", "There's no reason"], correct: 0, feedback: { correct: "Right. Knowing the locations avoids delays and lapsed claims later.", incorrect: "It's about knowing where critical documents are. Before you urgently need them." } } },
      { variantId: "mbx-mt-pa-sc", step: { type: "scenario", question: "A parent dies and nobody knows the insurer, will location, or bank. Likely result?", options: ["Delays, legal costs, and possibly lapsed time-sensitive claims", "SARS handles everything smoothly", "Assets distribute automatically", "No consequences"], correct: 0, feedback: { correct: "Right. Missing documents cause delays, costs and lost benefits.", incorrect: "It causes delays, legal cost and possibly lapsed claims, all avoidable." } } },
    ],
  },
  {
    slotId: "money-basics/money-talks/register",
    conceptId: "money-conversations",
    variants: [
      { variantId: "mbx-mt-rg-mcq", step: { type: "mcq", question: "A 'family financial document register' should list:", options: ["Accounts, policies, will location, beneficiaries and key contacts", "Only your salary", "Your shopping lists", "Nothing important"], correct: 0, feedback: { correct: "Right. The critical documents and where to find them, shared with someone trusted.", incorrect: "It lists accounts, policies, will location, beneficiaries and contacts." } } },
      { variantId: "mbx-mt-rg-tf", step: { type: "true-false", statement: "You should share the location of the register (not its contents) with a trusted family member.", correct: true, feedback: { correct: "Right. They can find it in an emergency without seeing everything now.", incorrect: "It's true. Share where it is, so it can be found when needed." } } },
      { variantId: "mbx-mt-rg-sc", step: { type: "scenario", question: "What's a simple, high-value action most families skip?", options: ["Creating a shared register of accounts, policies and the will's location", "Hiding all documents from everyone", "Memorising account numbers only", "Nothing is needed"], correct: 0, feedback: { correct: "Right. A 30-minute register prevents enormous stress later.", incorrect: "Create a shared document register. It's quick and prevents crisis-time chaos." } } },
    ],
  },
  {
    slotId: "money-basics/money-talks/transparency",
    conceptId: "money-conversations",
    variants: [
      { variantId: "mbx-mt-tr-mcq", step: { type: "mcq", question: "Before a major financial commitment with a partner, you should:", options: ["Share your full financial picture, income, debts and assets", "Reveal only the good parts", "Keep everything secret", "Only discuss it if asked"], correct: 0, feedback: { correct: "Right. Full transparency prevents hidden debt becoming a shared shock.", incorrect: "Share the complete picture. Hidden debt becomes a joint problem later." } } },
      { variantId: "mbx-mt-tr-tf", step: { type: "true-false", statement: "Hidden debt brought into a marriage can become a shared financial and emotional burden.", correct: true, feedback: { correct: "Right. It's far better handled openly, with a joint plan, up front.", incorrect: "It's true. Undisclosed debt becomes a shared burden; disclose it early." } } },
      { variantId: "mbx-mt-tr-sc", step: { type: "scenario", question: "A couple wants to avoid the top cause of marital conflict. They should:", options: ["Talk openly about money and plan finances together", "Never mention money", "Keep separate secrets", "Assume it'll work out"], correct: 0, feedback: { correct: "Right. Open money conversations pre-empt the most common conflict.", incorrect: "Talk about money openly and plan together. Silence is the danger." } } },
    ],
  },
];

// ── The Real Cost of a Debt-Funded Lifestyle (reuses debt-payoff) ───────────
const debtLifeSlots: QuestionSlot[] = [
  {
    slotId: "money-basics/debt-lifestyle/true-cost",
    conceptId: "debt-payoff",
    variants: [
      { variantId: "mbx-dl-tc-fill", step: { type: "fill-blank", title: "True car cost", prompt: "A R150 000 car financed at 15% over 72 months repays ≈R210 000. Total interest paid = R____.", correct: 60000, feedback: { correct: "Right: R210 000 − R150 000 = R60 000 in interest. The car really cost R210 000.", incorrect: "R210 000 repaid − R150 000 price = R60 000 interest." } } },
      { variantId: "mbx-dl-tc-mcq", step: { type: "mcq", question: "The 'illusion of affordability' is when people:", options: ["Fund a lifestyle their income can't support, via monthly repayments", "Save too aggressively", "Pay cash for everything", "Avoid all spending"], correct: 0, feedback: { correct: "Right. 'I can afford the repayment' hides the true, interest-laden cost.", incorrect: "It's funding an unaffordable lifestyle on monthly repayments: interest enriches the lender." } } },
      { variantId: "mbx-dl-tc-tf", step: { type: "true-false", statement: "Interest paid on a debt-funded lifestyle enriches the lender, not you.", correct: true, feedback: { correct: "Right. Every rand of interest is wealth flowing away from you.", incorrect: "It's true. Interest on lifestyle debt is money transferred to the lender." } } },
    ],
  },
  {
    slotId: "money-basics/debt-lifestyle/car-strategy",
    conceptId: "debt-payoff",
    variants: [
      { variantId: "mbx-dl-cs-mcq", step: { type: "mcq", question: "Which vehicle strategy builds the most long-term wealth?", options: ["Buy a reliable used car cash and invest the 'monthly payment'", "Finance the newest model every 3 years", "Lease a premium car for 'tax reasons'", "Finance a luxury car for your 'brand'"], correct: 0, feedback: { correct: "Right. A R5 000/month payment invested for 10 years at 10% ≈ R1m.", incorrect: "Buy used with cash and invest the difference. A car depreciates while investments grow." } } },
      { variantId: "mbx-dl-cs-tf", step: { type: "true-false", statement: "A car is a depreciating asset, so minimising money tied up in it frees cash to build wealth.", correct: true, feedback: { correct: "Right. Less spent on the depreciating car, more invested in growing assets.", incorrect: "It's true. Cars lose value; keeping the spend low frees money to invest." } } },
      { variantId: "mbx-dl-cs-sc", step: { type: "scenario", question: "Two people, same budget: one finances a new car, the other buys used and invests R5 000/month. Over 10 years?", options: ["The investor is far ahead, the payment compounds instead of depreciating", "They're identical", "The financier wins", "Impossible to say"], correct: 0, feedback: { correct: "Right. The invested payment ≈R1m; the financed car is worth a fraction of its price.", incorrect: "The investor pulls far ahead, the same money compounds instead of depreciating." } } },
    ],
  },
  {
    slotId: "money-basics/debt-lifestyle/credit-card",
    conceptId: "debt-payoff",
    variants: [
      { variantId: "mbx-dl-cc-tf", step: { type: "true-false", statement: "Using a credit card for groceries is always irresponsible.", correct: false, feedback: { correct: "Correct. It's fine if you pay the full balance before interest. You can even earn rewards.", incorrect: "It's fine if paid in full monthly. The danger is carrying a balance at 20%+." } } },
      { variantId: "mbx-dl-cc-mcq", step: { type: "mcq", question: "A credit card becomes a wealth destroyer when you:", options: ["Carry a balance and pay 20%+ interest on it", "Pay it in full each month", "Use it only for planned purchases", "Earn rewards and settle it"], correct: 0, feedback: { correct: "Right. Revolving a balance at high interest is the trap.", incorrect: "The trap is carrying a balance at 20%+. Paying in full is fine." } } },
      { variantId: "mbx-dl-cc-sc", step: { type: "scenario", question: "You use a credit card for convenience and rewards. The safe rule is:", options: ["Pay the full statement balance before interest accrues", "Pay only the minimum", "Let it revolve for the rewards", "Max it out"], correct: 0, feedback: { correct: "Right. Full settlement each month = convenience and rewards at zero interest.", incorrect: "Pay the full balance monthly. Otherwise interest wipes out any rewards." } } },
    ],
  },
  {
    slotId: "money-basics/debt-lifestyle/priority",
    conceptId: "debt-payoff",
    variants: [
      { variantId: "mbx-dl-pr-sc", step: { type: "scenario", question: "Ntombi has R5 000 spare, a 24% clothing account (R8 000), a 10% student loan (R40 000), and no emergency fund. Best priority order?", options: ["Highest-rate debt → small emergency fund → 10% loan", "Student loan → clothing → emergency fund", "Emergency fund fully → then debt", "Split equally across all three"], correct: 0, feedback: { correct: "Right. Kill the 24% debt first, keep a small buffer, then the 10% loan.", incorrect: "Attack the 24% clothing account first, keep a mini buffer, then the 10% loan." } } },
      { variantId: "mbx-dl-pr-mcq", step: { type: "mcq", question: "When choosing which debt to attack first (avalanche method), you target:", options: ["The highest interest rate", "The largest balance", "The newest debt", "The smallest balance only"], correct: 0, feedback: { correct: "Right. Highest rate first minimises total interest paid.", incorrect: "The avalanche targets the highest interest rate first to save the most." } } },
      { variantId: "mbx-dl-pr-tf", step: { type: "true-false", statement: "Clearing a 24% store account usually beats overpaying a 10% loan, rand-for-rand.", correct: true, feedback: { correct: "Right. Every rand off 24% debt saves more than a rand off 10% debt.", incorrect: "It's true. Higher-rate debt costs you more, so clear it first." } } },
    ],
  },
];

export const MONEY_BASICS_EXTRA_BANKS: Record<string, LessonBank> = {
  "money-basics::lesson-zero-based-budget": { layout: L(zbbSlots, "Give Every Rand a Job", "<p><strong>Zero-based budgeting</strong> assigns every rand of income to a category (rent, food, debt, and savings) so income minus allocations equals <strong>R0</strong>. You don't 'spend what's left'; savings and investments are categories too. Build it from your net pay down, fixed costs first.</p>"), slots: zbbSlots },
  "money-basics::lesson-cash-flow": { layout: L(cashSlots, "Cash Flow: Your Financial Pulse", "<p><strong>Cash flow</strong> is income minus expenses. Positive means a surplus to build wealth; negative means going backwards. At any income. Most problems are spending problems, not income problems, so cutting expenses is the fastest, most controllable fix. Direct every surplus on purpose.</p>"), slots: cashSlots },
  "money-basics::lesson-salary-negotiation": { layout: L(negoSlots, "Negotiating Your Salary", "<p>Your salary is your biggest financial lever: raises compound off it for decades. Negotiation is expected, not rude: research the market rate, then present your value and a specific mid-market number. Bank at least half of every raise, and it becomes wealth without cutting your lifestyle.</p>"), slots: negoSlots },
  "money-basics::lesson-financial-goals": { layout: L(goalsSlots, "Setting Goals That Stick", "<p>A real goal has a specific <strong>amount</strong>, a <strong>deadline</strong>, a <strong>vehicle</strong> and a <strong>reason</strong>. 'save more' is a wish. Reverse-engineer big goals into a monthly number, run short/medium/long-term goals in parallel, and keep a separate account per goal so you don't raid one for another.</p>"), slots: goalsSlots },
  "money-basics::lesson-side-income": { layout: L(sideSlots, "Building Side Income", "<p>One income stream is a single point of failure; a second, even R2 000/month, buys security. The best side income uses skills you already have (freelancing beats retail or reselling on margin and startup cost). All side income is taxable; over R30 000 non-salary means provisional tax. Invested in a TFSA, it compounds tax-free.</p>"), slots: sideSlots },
  "money-basics::lesson-interest-rates-wallet": { layout: L(rateSlots, "Interest Rates & Your Wallet", "<p>The <strong>SARB repo rate</strong> drives your borrowing costs. <strong>Prime = repo + 3.5%</strong>, and most home loans price off prime. Every 1% move on a R1m bond is about R500/month (≈R6 000/year). Fixed rates buy certainty at a premium; variable wins when rates fall. Paying extra capital shrinks the balance future interest is charged on.</p>"), slots: rateSlots },
  "money-basics::lesson-money-talks": { layout: L(talkSlots, "Talking About Money", "<p>Money silence breeds ignorance, hides problems and fuels conflict. Before big commitments, share the full picture (income, debts, assets) and plan together. Create a <strong>family document register</strong> (accounts, policies, will location, beneficiaries) and share where it is, so a crisis doesn't become chaos.</p>"), slots: talkSlots },
  "money-basics::lesson-cost-of-debt-lifestyle": { layout: L(debtLifeSlots, "The Real Cost of a Debt-Funded Lifestyle", "<p>Funding an unaffordable lifestyle on monthly repayments enriches the lender, not you: a R150 000 car financed at 15% over 72 months really costs ≈R210 000. Buy a reliable used car cash and invest the 'payment' instead. Credit cards are fine paid in full. The danger is a revolving balance at 20%+. Attack the highest-rate debt first.</p>"), slots: debtLifeSlots },
};
