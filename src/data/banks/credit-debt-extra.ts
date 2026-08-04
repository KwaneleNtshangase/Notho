import type { LessonLayoutItem, QuestionSlot } from "@/data/content";
import type { LessonBank } from "./money-basics";

/**
 * Premium banks for the Credit & Debt EXTRA lessons.
 * NCA reference points: unsecured/personal loan rate cap = repo + 21%; reckless
 * credit may be set aside or restructured by a court; debt counsellors are
 * registered by the NCR (ncr.org.za); credit bureaux must correct disputed
 * adverse information (20 business days). Rates quoted inside questions are
 * stated as given assumptions, not pinned market figures.
 * variantId prefix: `cdx-`.
 */
const info = (title: string, content: string): LessonLayoutItem => ({ type: "info", title, content });
const L = (slots: QuestionSlot[], title: string, content: string): LessonLayoutItem[] => [
  info(title, content),
  ...slots.map((s) => ({ slot: s.slotId })),
];

// ── The Debt Avalanche ──────────────────────────────────────────────────────
const avaSlots: QuestionSlot[] = [
  {
    slotId: "credit-debt/avalanche/order",
    conceptId: "debt-avalanche",
    variants: [
      { variantId: "cdx-av-or-mcq", step: { type: "mcq", question: "Under the debt avalanche method, which debt gets every spare rand first?", options: ["The one with the highest interest rate", "The one with the smallest balance", "The oldest account", "The one with the largest balance"], correct: 0, feedback: { correct: "Right. Highest rate first minimises the total interest you'll ever pay, because that's where each rand of debt costs the most.", incorrect: "Avalanche targets the highest interest rate. Smallest-balance-first is the snowball method." } } },
      { variantId: "cdx-av-or-sc", step: { type: "scenario", question: "Thandi has a credit card at 22% (R12 000), a personal loan at 17% (R25 000) and car finance at 12.75% (R80 000), plus R2 000 spare a month. Her avalanche order is:", options: ["Credit card, then personal loan, then car finance", "Car finance first, because it's the biggest", "Personal loan, then credit card, then car", "Split the R2 000 evenly across all three"], correct: 0, feedback: { correct: "Right: 22% → 17% → 12.75%. Minimums on everything else, and each cleared payment rolls onto the next debt.", incorrect: "Sort by rate, not size: 22% card, then the 17% loan, then 12.75% car finance." } } },
      { variantId: "cdx-av-or-tf", step: { type: "true-false", statement: "The debt avalanche means paying only minimums everywhere until the smallest debt disappears.", correct: false, feedback: { correct: "Right. Minimums go on everything else, but every extra rand attacks the highest-rate debt.", incorrect: "That's the snowball. Avalanche puts the extra money on the highest interest rate." } } },
    ],
  },
  {
    slotId: "credit-debt/avalanche/roll-the-payment",
    conceptId: "debt-avalanche",
    variants: [
      { variantId: "cdx-av-rp-mcq", step: { type: "mcq", question: "You clear the credit card that was costing you R900 a month. What should happen to that R900?", options: ["It moves onto the next debt on the list", "It goes back into everyday spending", "It stays in your current account as a buffer", "It gets split across all remaining debts"], correct: 0, feedback: { correct: "Right. Rolling the freed-up payment forward is what makes the avalanche accelerate. Each payoff gets faster than the last.", incorrect: "Roll it onto the next-highest rate. Reabsorbing it into spending is how debt plans stall." } } },
      { variantId: "cdx-av-rp-tf", step: { type: "true-false", statement: "Each debt you clear should make the next one faster to clear.", correct: true, feedback: { correct: "Right. That's the whole engine: the payment amount grows while the debt list shrinks.", incorrect: "It's true, provided you roll the freed payment forward rather than spending it." } } },
      { variantId: "cdx-av-rp-fill", step: { type: "fill-blank", title: "The rolling payment", prompt: "You pay R1 500 a month extra plus a R900 minimum on a card you've just cleared. The amount now attacking the next debt = R____.", correct: 2400, feedback: { correct: "R1 500 + R900 = R2 400 aimed at the next debt, the payoff pace almost doubles.", incorrect: "Add the freed-up R900 to the R1 500 you were already paying: R2 400." } } },
    ],
  },
  {
    slotId: "credit-debt/avalanche/vs-snowball",
    conceptId: "debt-avalanche",
    variants: [
      { variantId: "cdx-av-vs-mcq", step: { type: "mcq", question: "What does the debt snowball offer that the avalanche doesn't?", options: ["Faster visible wins", "Lower total interest paid", "A shorter overall payoff period", "Legal protection from creditors"], correct: 0, feedback: { correct: "Right. Snowball costs slightly more in interest but clears accounts sooner, and a method you actually finish beats a better one you abandon.", incorrect: "Snowball wins on motivation, not maths. Avalanche always pays less interest overall." } } },
      { variantId: "cdx-av-vs-tf", step: { type: "true-false", statement: "The best debt method is the one you'll actually stick to for the full journey.", correct: true, feedback: { correct: "Right. Both destroy debt far faster than minimums. The difference between them is small next to the difference between doing it and not.", incorrect: "It's true. A slightly costlier plan you complete beats an optimal one you quit in month three." } } },
      { variantId: "cdx-av-vs-sc", step: { type: "scenario", question: "Sipho has tried and abandoned two debt plans. He has five debts, and the smallest is R1 200. What's a reasonable suggestion?", options: ["Start with the snowball to bank an early win", "Stick strictly to avalanche regardless", "Consolidate everything and hope for the best", "Wait until he earns more"], correct: 0, feedback: { correct: "Right. Clearing R1 200 quickly builds the belief he needs; the extra interest is a small price for a plan that survives.", incorrect: "For someone who keeps quitting, momentum matters more than optimality. Get an early win, then optimise." } } },
    ],
  },
  {
    slotId: "credit-debt/avalanche/know-your-rates",
    conceptId: "debt-avalanche",
    variants: [
      { variantId: "cdx-av-kr-mcq", step: { type: "mcq", question: "Before you can build an avalanche plan you need:", options: ["The balance and the interest rate for every debt you hold", "Only the total amount you owe", "Your credit score", "Your employer's permission"], correct: 0, feedback: { correct: "Right. Without the rates you can't sort the list, and most people underestimate what their store cards actually charge.", incorrect: "You need both balance and rate per debt. A total figure tells you nothing about which one to attack." } } },
      { variantId: "cdx-av-kr-tf", step: { type: "true-false", statement: "Store accounts usually charge more than bank credit cards.", correct: true, feedback: { correct: "Right, which is why they often sit at the top of an avalanche list despite small balances.", incorrect: "It's true. Store and clothing accounts typically price above bank credit cards." } } },
      { variantId: "cdx-av-kr-sc", step: { type: "scenario", question: "Lerato doesn't know the rate on her clothing account. How does she find it?", options: ["Check the statement or the credit agreement, or phone the provider", "Assume it's the same as her bank card", "Estimate it from the monthly payment", "Ask a friend with the same account"], correct: 0, feedback: { correct: "Right. The rate must be disclosed in the agreement and on statements. An assumption could put the wrong debt at the top of her list.", incorrect: "Get the actual number from the statement or agreement. Guessing can misorder the whole plan." } } },
    ],
  },
];

// ── Building Your Credit Score ──────────────────────────────────────────────
const buildSlots: QuestionSlot[] = [
  {
    slotId: "credit-debt/build-score/no-history",
    conceptId: "credit-score",
    variants: [
      { variantId: "cdx-bs-nh-mcq", step: { type: "mcq", question: "Why can having no credit history be as much of a problem as having bad credit?", options: ["Lenders can't assess a risk they have no data on", "It automatically counts as a default", "The NCA prohibits lending to first-time borrowers", "Credit bureaux charge you a penalty"], correct: 0, feedback: { correct: "Right. A thin file is an unknown, and lenders price unknowns cautiously, which is why a small, perfectly repaid account matters.", incorrect: "It's an information gap, not a penalty. Without a track record, lenders have nothing to assess." } } },
      { variantId: "cdx-bs-nh-tf", step: { type: "true-false", statement: "Never borrowing anything guarantees a strong credit score.", correct: false, feedback: { correct: "Right. A score is built from repayment behaviour, so no borrowing means no evidence either way.", incorrect: "No history means no score to speak of. You need a small, well-managed account to build one." } } },
      { variantId: "cdx-bs-nh-sc", step: { type: "scenario", question: "Ayesha is 24, has never borrowed, and wants a home loan in three years. Sensible first step?", options: ["A small credit facility she settles in full every month", "A large personal loan to show she can handle it", "Three store accounts opened at once", "Nothing, apply for the bond when the time comes"], correct: 0, feedback: { correct: "Right. Borrow small, repay perfectly, repeat. Three years of that is a solid file by the time she applies.", incorrect: "Small and perfectly managed beats large or many. Multiple applications at once looks like distress." } } },
    ],
  },
  {
    slotId: "credit-debt/build-score/on-time-payments",
    conceptId: "credit-score",
    variants: [
      { variantId: "cdx-bs-op-mcq", step: { type: "mcq", question: "Which factor carries the most weight in a credit score?", options: ["Payment history. Whether you pay on time, every time", "How many different banks you use", "Your income", "Your age"], correct: 0, feedback: { correct: "Right, at roughly 35%. Income isn't even on your credit report. Behaviour is what's scored.", incorrect: "Payment history dominates at around 35%. Your income isn't recorded on the report at all." } } },
      { variantId: "cdx-bs-op-tf", step: { type: "true-false", statement: "Your salary is one of the factors used to calculate your credit score.", correct: false, feedback: { correct: "Right. Bureaux score how you handle credit, not what you earn. A high earner who pays late scores badly.", incorrect: "Income isn't on the credit report. Scores are built from repayment behaviour, utilisation, history length, mix and applications." } } },
      { variantId: "cdx-bs-op-sc", step: { type: "scenario", question: "Thabo pays his accounts a week late most months but always pays in full. What's the effect?", options: ["Late payments still damage his record, even though nothing is unpaid", "No effect. The balance is settled", "It improves his score because he pays in full", "Only payments over 30 days late count for anything"], correct: 0, feedback: { correct: "Right. A debit order timed just after payday is a cheap fix for a problem that quietly costs him rate concessions.", incorrect: "Paying in full doesn't erase lateness. The payment profile records when you paid, not just whether you did." } } },
    ],
  },
  {
    slotId: "credit-debt/build-score/utilisation",
    conceptId: "credit-utilisation",
    variants: [
      { variantId: "cdx-bs-ut-fill", step: { type: "fill-blank", title: "Utilisation target", prompt: "Your total credit limit across all accounts is R50 000. To stay under 30% utilisation, combined balances must stay below R____.", correct: 15000, feedback: { correct: "R50 000 × 30% = R15 000. Below 10% is better still if you're preparing for a bond application.", incorrect: "30% of R50 000 = R15 000 as the combined ceiling." } } },
      { variantId: "cdx-bs-ut-mcq", step: { type: "mcq", question: "You owe R16 000 on a card with a R20 000 limit. What does that tell a lender?", options: ["80% utilisation, which reads as financial stress", "80% utilisation, which is fine since you're under the limit", "20% utilisation, which is healthy", "Nothing: utilisation isn't scored"], correct: 0, feedback: { correct: "Right. Utilisation is about 30% of the score, and paying down to R6 000 would move it materially.", incorrect: "R16 000 ÷ R20 000 = 80%. Anything over 30% starts to drag; over 50% is a clear warning sign." } } },
      { variantId: "cdx-bs-ut-sc", step: { type: "scenario", question: "Nomsa's card sits at 70% utilisation. She can't pay it down this month. What else might help?", options: ["Ask for a limit increase she doesn't use", "Close another card to simplify things", "Apply for two more cards", "Stop using credit entirely for a year"], correct: 0, feedback: { correct: "Right. More available credit lowers the ratio, but only if she genuinely leaves it untouched.", incorrect: "A higher unused limit reduces utilisation. Closing a card does the opposite by shrinking available credit." } } },
    ],
  },
  {
    slotId: "credit-debt/build-score/keep-old-accounts",
    conceptId: "credit-score",
    variants: [
      { variantId: "cdx-bs-ko-tf", step: { type: "true-false", statement: "Closing an old, unused credit card always improves your score.", correct: false, feedback: { correct: "Right. It shortens your credit history and removes available credit, pushing utilisation up on what's left.", incorrect: "It usually hurts. Old, zero-balance accounts in good standing are generally worth keeping open." } } },
      { variantId: "cdx-bs-ko-mcq", step: { type: "mcq", question: "When is closing an old credit card the sensible choice?", options: ["When it carries an annual fee or you can't resist using it", "Whenever the balance reaches zero", "As soon as you get a newer card", "Every two years, to refresh your record"], correct: 0, feedback: { correct: "Right. A real cost or a real temptation beats a small scoring benefit. Otherwise leave it open.", incorrect: "Only close it for a concrete reason: a fee you're paying, or a habit you can't control." } } },
      { variantId: "cdx-bs-ko-sc", step: { type: "scenario", question: "Johan has a fee-free card he's held for nine years and never uses. What's the best move?", options: ["Keep it open and put one small recurring purchase on it", "Close it since he doesn't use it", "Max it out to show activity", "Cut the card up but leave the account dormant indefinitely"], correct: 0, feedback: { correct: "Right. Nine years of history is worth keeping, and light activity stops the issuer closing it for dormancy.", incorrect: "Keep it. That length of history is valuable, and a small recurring charge keeps the account alive." } } },
    ],
  },
];

// ── Debt Counselling ────────────────────────────────────────────────────────
const dcSlots: QuestionSlot[] = [
  {
    slotId: "credit-debt/counselling/who-regulates",
    conceptId: "debt-counselling",
    variants: [
      { variantId: "cdx-dc-wr-mcq", step: { type: "mcq", question: "Which body registers legitimate debt counsellors in South Africa?", options: ["The National Credit Regulator", "SARS", "The Reserve Bank", "The JSE"], correct: 0, feedback: { correct: "Right. Verify any counsellor's registration at ncr.org.za before you sign, fake 'debt rescue' outfits target desperate people.", incorrect: "The NCR registers and regulates debt counsellors. Check registration at ncr.org.za first." } } },
      { variantId: "cdx-dc-wr-tf", step: { type: "true-false", statement: "Anyone advertising debt counselling services is registered and regulated.", correct: false, feedback: { correct: "Right. Unregistered operators take upfront fees and leave your creditors unpaid. Check the NCR register yourself.", incorrect: "Registration is compulsory but not automatic. Verify at ncr.org.za before handing over money or documents." } } },
      { variantId: "cdx-dc-wr-sc", step: { type: "scenario", question: "A company promises to 'clear your blacklisting in 30 days' for an upfront fee of R3 500. This is:", options: ["A scam. Accurate adverse information can't simply be deleted on request", "A standard debt counselling service", "Legal but expensive", "Only available through the NCR"], correct: 0, feedback: { correct: "Right. Correct information stays for its prescribed period. Only errors can be removed, and disputing an error is free.", incorrect: "Nobody can delete accurate adverse listings. Disputing genuine errors costs you nothing." } } },
    ],
  },
  {
    slotId: "credit-debt/counselling/what-it-does",
    conceptId: "debt-counselling",
    variants: [
      { variantId: "cdx-dc-wd-mcq", step: { type: "mcq", question: "What does debt review actually do for an over-indebted person?", options: ["Restructures repayments into one affordable monthly amount", "Cancels the debt outright", "Removes your credit record", "Pays your creditors on your behalf from a government fund"], correct: 0, feedback: { correct: "Right. The debt doesn't vanish. It becomes affordable, and creditors can't take legal action while you comply.", incorrect: "It restructures rather than cancels. The protection lasts only while you keep up the restructured payments." } } },
      { variantId: "cdx-dc-wd-tf", step: { type: "true-false", statement: "While under debt review you can still take out new credit for genuine emergencies.", correct: false, feedback: { correct: "Right. You're flagged at the bureaux and blocked from new credit. That restriction is part of what makes the process work.", incorrect: "New credit is blocked during debt review. That's deliberate: it stops the hole getting deeper while you repay." } } },
      { variantId: "cdx-dc-wd-sc", step: { type: "scenario", question: "Nomsa completes her repayment plan in full. What should she insist on receiving?", options: ["A clearance certificate", "A refund of her counsellor's fees", "An automatic new credit card", "A written apology from her creditors"], correct: 0, feedback: { correct: "Right. Without the clearance certificate the flag stays and lenders keep declining her. Chase it until it's issued.", incorrect: "The clearance certificate is what lifts the flag. Nothing else restores her access to credit." } } },
    ],
  },
  {
    slotId: "credit-debt/counselling/when-to-apply",
    conceptId: "debt-counselling",
    variants: [
      { variantId: "cdx-dc-wa-sc", step: { type: "scenario", question: "Nomsa earns R18 000 a month and R13 500 goes to debt repayments. What does that tell her?", options: ["At 75% of income on debt she is clearly over-indebted and should seek help now", "It's tight but manageable", "She should take another loan to ease the pressure", "She should wait until she actually misses a payment"], correct: 0, feedback: { correct: "Right. The NCA test is whether you can meet all obligations on time with current income, at 75% she can't, and waiting only adds default listings.", incorrect: "75% of income on debt is severe over-indebtedness. Acting before the first default protects her record." } } },
      { variantId: "cdx-dc-wa-mcq", step: { type: "mcq", question: "What's the risk of waiting until you've already defaulted before seeking debt counselling?", options: ["Default listings and judgments attach to your record and outlast the review", "Debt counselling becomes unavailable", "Your interest rates are frozen automatically", "There's no downside to waiting"], correct: 0, feedback: { correct: "Right. Entering review early protects the record; entering after judgments means living with those listings for years.", incorrect: "Defaults and judgments stick to your credit record for years, long after the review ends. Early action limits the damage." } } },
      { variantId: "cdx-dc-wa-tf", step: { type: "true-false", statement: "Debt counselling is a last resort, but applying early causes less long-term damage than applying after defaults.", correct: true, feedback: { correct: "Right. The flag lifts when you finish; a judgment doesn't.", incorrect: "It's true. Both carry costs, but a completed review beats a record full of defaults and judgments." } } },
    ],
  },
  {
    slotId: "credit-debt/counselling/alternatives",
    conceptId: "debt-counselling",
    variants: [
      { variantId: "cdx-dc-al-mcq", step: { type: "mcq", question: "Before entering formal debt review, what's worth trying first?", options: ["Negotiating directly with creditors and cutting expenses hard", "Taking a consolidation loan at a higher rate", "Borrowing from a mashonisa to catch up", "Ignoring the letters until they stop"], correct: 0, feedback: { correct: "Right. Many creditors will restructure informally, and that leaves no bureau flag at all.", incorrect: "Talk to creditors first. More borrowing, especially informal borrowing, makes the position worse." } } },
      { variantId: "cdx-dc-al-tf", step: { type: "true-false", statement: "A consolidation loan helps only if the new rate and total cost are genuinely lower.", correct: true, feedback: { correct: "Right. Stretching the term at a similar rate lowers the monthly payment while raising what you pay in total.", incorrect: "It's true. Compare total cost, not just the monthly instalment. A longer term often costs more." } } },
      { variantId: "cdx-dc-al-sc", step: { type: "scenario", question: "Sipho is offered a consolidation loan that halves his monthly payment by doubling the term at a similar rate. Should he take it?", options: ["Only if the cash-flow relief is genuinely needed. He'll pay substantially more overall", "Yes, a lower payment is always better", "No, consolidation is never useful", "Yes, because a single payment improves his credit score"], correct: 0, feedback: { correct: "Right. It buys breathing room at a real cost. Worth it in a crisis, expensive as a default choice.", incorrect: "It's a trade, not a win: lower monthly, higher total. Take it only if the cash flow is genuinely the problem." } } },
    ],
  },
];

// ── Reckless Lending ────────────────────────────────────────────────────────
const rlSlots: QuestionSlot[] = [
  {
    slotId: "credit-debt/reckless/definition",
    conceptId: "reckless-lending",
    variants: [
      { variantId: "cdx-rl-df-mcq", step: { type: "mcq", question: "Under the NCA, credit is reckless when the provider:", options: ["Grants it without properly assessing whether you can afford it", "Charges a rate you find high", "Lends to someone with no credit history", "Approves the loan on the same day"], correct: 0, feedback: { correct: "Right. The affordability assessment is a legal obligation on the lender, and a court can set aside or restructure an agreement that skipped it.", incorrect: "It's about the missing affordability assessment, not the rate or the speed of approval." } } },
      { variantId: "cdx-rl-df-tf", step: { type: "true-false", statement: "If a lender granted you credit you clearly couldn't afford, the consequences can fall on the lender.", correct: true, feedback: { correct: "Right. A court may set the agreement aside or suspend obligations under it. The duty to assess sits with the provider.", incorrect: "It's true. The NCA places the affordability duty on the lender, and reckless credit has consequences for them." } } },
      { variantId: "cdx-rl-df-sc", step: { type: "scenario", question: "A lender approved Lerato's loan without asking for payslips, bank statements or expenses. What might that be?", options: ["Reckless credit", "Efficient service", "Her problem for accepting the loan", "Only an issue above R100 000"], correct: 0, feedback: { correct: "Right. Documented income and expenses are the minimum. Skipping them is exactly what the reckless-credit provisions target.", incorrect: "That's a failed affordability assessment. The size of the loan doesn't change the lender's duty." } } },
    ],
  },
  {
    slotId: "credit-debt/reckless/rate-cap",
    conceptId: "reckless-lending",
    variants: [
      { variantId: "cdx-rl-rc-mcq", step: { type: "mcq", question: "How is the maximum legal interest rate on a personal loan set under the NCA?", options: ["As a formula linked to the repo rate", "At a fixed 20% forever", "By each lender's own policy", "By agreement between you and the lender"], correct: 0, feedback: { correct: "Right. The personal-loan ceiling is repo plus a set margin, so it changes whenever the SARB moves rates.", incorrect: "It's a repo-linked formula, not a fixed number and not the lender's choice." } } },
      { variantId: "cdx-rl-rc-fill", step: { type: "fill-blank", title: "The legal ceiling", prompt: "The personal-loan cap is repo + 21%. If the repo rate is 7%, the maximum legal rate is ____% (enter the whole number).", correct: 28, feedback: { correct: "7% + 21% = 28%. A registered provider charging above the cap can be reported to the NCR.", incorrect: "Add the margin to the repo rate: 7% + 21% = 28%." } } },
      { variantId: "cdx-rl-rc-sc", step: { type: "scenario", question: "A registered lender charges you 45% a year when the legal cap is 28%. What should you do?", options: ["Report it to the National Credit Regulator and ask for the rate to be corrected", "Pay it: you signed the agreement", "Pay it off early and say nothing", "Take another loan elsewhere to settle it"], correct: 0, feedback: { correct: "Right. Exceeding the cap is an offence for a registered provider, and the NCR can act on it.", incorrect: "Signing doesn't make an illegal rate legal. Report it to the NCR." } } },
    ],
  },
  {
    slotId: "credit-debt/reckless/mashonisa",
    conceptId: "reckless-lending",
    variants: [
      { variantId: "cdx-rl-ma-tf", step: { type: "true-false", statement: "Mashonisas and other informal lenders fall under the protection of the National Credit Act.", correct: false, feedback: { correct: "Right. They're unregistered, so the rate caps, affordability rules and complaint routes simply don't apply to you.", incorrect: "Informal lenders operate outside the NCA. You get no rate cap and no recourse." } } },
      { variantId: "cdx-rl-ma-mcq", step: { type: "mcq", question: "What's the biggest practical risk of borrowing from an unregistered lender?", options: ["No rate cap, no affordability rules, and no regulator to complain to", "Slightly slower approval", "Having to provide a payslip", "A hard enquiry on your credit report"], correct: 0, feedback: { correct: "Right. Holding a borrower's bank card or ID as 'security' is also unlawful, but there's no easy route to enforce that.", incorrect: "The absence of every consumer protection is the risk, rates, conduct and recourse all disappear." } } },
      { variantId: "cdx-rl-ma-sc", step: { type: "scenario", question: "A lender asks to keep Thabo's bank card and PIN as security for a loan. This is:", options: ["Unlawful and a clear sign to walk away", "Standard practice for small loans", "Acceptable if the amount is small", "Required by the NCA"], correct: 0, feedback: { correct: "Right. Nobody may hold your card, PIN or SASSA card as security. Walk away and report it.", incorrect: "Holding a card or PIN as security is unlawful. That request alone is reason enough to refuse." } } },
    ],
  },
  {
    slotId: "credit-debt/reckless/your-record",
    conceptId: "reckless-lending",
    variants: [
      { variantId: "cdx-rl-yr-mcq", step: { type: "mcq", question: "What should you keep when taking any credit agreement?", options: ["A copy of the signed agreement showing the rate, fees and total cost", "Only the monthly payment amount", "Nothing. The lender keeps records", "Just the SMS confirming approval"], correct: 0, feedback: { correct: "Right. You're entitled to a copy, and it's the evidence you'd need for any reckless-credit or overcharging complaint.", incorrect: "Keep the full signed agreement. Without it, a later dispute is your word against theirs." } } },
      { variantId: "cdx-rl-yr-tf", step: { type: "true-false", statement: "You are entitled to a copy of every credit agreement you sign.", correct: true, feedback: { correct: "Right. Ask for it before you leave, and store it with your other financial documents.", incorrect: "It's true, the NCA entitles you to a copy of the agreement." } } },
      { variantId: "cdx-rl-yr-sc", step: { type: "scenario", question: "The total repayment on Ayesha's loan is far higher than she expected. Where does she look first?", options: ["The cost-of-credit section of her agreement, listing rate, initiation fee and monthly service fee", "Her bank statement", "Her credit report", "The lender's website"], correct: 0, feedback: { correct: "Right. Initiation and monthly service fees push the real cost well above the headline rate: the agreement itemises both.", incorrect: "The agreement's cost-of-credit disclosure is where the rate, initiation fee and service fees are set out." } } },
    ],
  },
];

// ── Car Finance ─────────────────────────────────────────────────────────────
const carSlots: QuestionSlot[] = [
  {
    slotId: "credit-debt/car/true-cost",
    conceptId: "car-finance",
    variants: [
      { variantId: "cdx-cr-tc-mcq", step: { type: "mcq", question: "Why does a financed car usually cost far more than its price tag?", options: ["Interest, initiation and service fees are added across the whole term", "Cars are taxed twice", "Insurance is included in the finance", "The dealer adds a mark-up at the end"], correct: 0, feedback: { correct: "Right. On a long term the finance charges alone can approach half the vehicle's value, while the car itself keeps depreciating.", incorrect: "It's the finance charges: interest plus initiation and monthly service fees over the full term." } } },
      { variantId: "cdx-cr-tc-fill", step: { type: "fill-blank", title: "Total repaid", prompt: "Your instalment is R6 200 a month for 72 months. Total repaid over the term = R____.", correct: 446400, feedback: { correct: "R6 200 × 72 = R446 400. For a car that's worth a fraction of that by the final payment.", incorrect: "R6 200 × 72 months = R446 400." } } },
      { variantId: "cdx-cr-tc-tf", step: { type: "true-false", statement: "Stretching car finance from 60 to 72 months lowers the instalment and lowers the total cost.", correct: false, feedback: { correct: "Right. The instalment drops, but you pay interest for an extra year. The total goes up.", incorrect: "A longer term lowers the monthly payment and raises the total interest paid." } } },
    ],
  },
  {
    slotId: "credit-debt/car/balloon",
    conceptId: "car-finance",
    variants: [
      { variantId: "cdx-cr-bl-mcq", step: { type: "mcq", question: "What does a balloon (residual) payment actually do?", options: ["Defers 20–30% of the debt to the end of the term, where it still has to be paid", "Reduces the total you owe", "Covers your final year's instalments", "Is written off if you return the car"], correct: 0, feedback: { correct: "Right. It makes the monthly figure look affordable while a large lump sum waits at the end, usually refinanced at more interest.", incorrect: "It defers debt rather than removing it. The lump sum is still due at the end." } } },
      { variantId: "cdx-cr-bl-tf", step: { type: "true-false", statement: "A balloon payment is a good idea if it's the only way to afford the car.", correct: false, feedback: { correct: "Right. If the honest instalment is unaffordable, the car is unaffordable, the balloon just delays that conclusion at a cost.", incorrect: "Needing a balloon to afford the car is the clearest signal to choose a cheaper car." } } },
      { variantId: "cdx-cr-bl-sc", step: { type: "scenario", question: "Mpho reaches the end of his term with a R90 000 balloon due. What are his real options?", options: ["Pay it in cash, refinance it at more interest, or give up the car", "Have it written off automatically", "Roll it into a new balloon at no cost", "Ignore it. The finance is complete"], correct: 0, feedback: { correct: "Right, and most people refinance, which is how buyers end up paying interest for years without ever owning a car.", incorrect: "Cash, refinance or hand back. There's no fourth option, and refinancing restarts the interest." } } },
    ],
  },
  {
    slotId: "credit-debt/car/deposit",
    conceptId: "car-finance",
    variants: [
      { variantId: "cdx-cr-dp-tf", step: { type: "true-false", statement: "A larger deposit reduces the total interest you pay on car finance.", correct: true, feedback: { correct: "Right. Less financed capital means less interest, and it also protects you from owing more than the car is worth.", incorrect: "It's true. A bigger deposit shrinks the financed amount, and interest is charged on that amount." } } },
      { variantId: "cdx-cr-dp-fill", step: { type: "fill-blank", title: "Deposit effect", prompt: "A car costs R300 000. You put down a 15% deposit. The amount you finance = R____.", correct: 255000, feedback: { correct: "R300 000 − R45 000 = R255 000 financed, and interest is charged only on that.", incorrect: "15% of R300 000 is R45 000, so R255 000 is financed." } } },
      { variantId: "cdx-cr-dp-mcq", step: { type: "mcq", question: "Financing a car with no deposit over a long term often leads to:", options: ["Owing more than the car is worth for much of the term", "A lower total cost", "Better insurance rates", "Faster ownership"], correct: 0, feedback: { correct: "Right. Cars depreciate faster than the loan amortises early on, so a write-off can leave you paying for a car you no longer have.", incorrect: "It creates negative equity: the debt outruns the car's value, which is dangerous if it's written off or stolen." } } },
    ],
  },
  {
    slotId: "credit-debt/car/affordability",
    conceptId: "car-finance",
    variants: [
      { variantId: "cdx-cr-af-sc", step: { type: "scenario", question: "Mpho earns R28 000 a month and is approved for an R8 400 car instalment. What's the problem?", options: ["Total transport should sit near 20% of income, R5 600, and the instalment alone is 30%", "Nothing, since the bank approved it", "He should extend the term to 84 months", "He needs a bigger balloon"], correct: 0, feedback: { correct: "Right. Insurance, fuel and maintenance still have to fit inside that 20%. Bank approval measures their risk, not his comfort.", incorrect: "20% of R28 000 is R5 600 for all transport costs. An R8 400 instalment breaks the rule before fuel or insurance." } } },
      { variantId: "cdx-cr-af-fill", step: { type: "fill-blank", title: "Transport budget", prompt: "Total transport costs should stay near 20% of income. On R28 000 a month that's R____.", correct: 5600, feedback: { correct: "R28 000 × 20% = R5 600, covering instalment, insurance, fuel and maintenance together.", incorrect: "R28 000 × 20% = R5 600 for everything transport-related." } } },
      { variantId: "cdx-cr-af-mcq", step: { type: "mcq", question: "What does bank approval for a car instalment actually tell you?", options: ["That they judge you likely to repay, not that the car fits your goals", "That the car is affordable for you", "That the interest rate is competitive", "That the car is good value"], correct: 0, feedback: { correct: "Right. Approval is a risk decision about their money. Affordability is a decision about the rest of your life.", incorrect: "It reflects their risk appetite, not your budget. Approval and affordability are different questions." } } },
    ],
  },
];

// ── Home Loans: The Smart Approach ──────────────────────────────────────────
const hlSlots: QuestionSlot[] = [
  {
    slotId: "credit-debt/home-loan/extra-payments",
    conceptId: "home-loan-prepayment",
    variants: [
      { variantId: "cdx-hl-ep-mcq", step: { type: "mcq", question: "Why do small extra payments on a bond save so much?", options: ["Every extra rand goes to capital", "Banks give a bonus for early payment", "The interest rate drops when you overpay", "Extra payments are tax deductible"], correct: 0, feedback: { correct: "Right. Early in a 20-year bond most of your instalment is interest, so capital paid now removes years of compounding.", incorrect: "Extra payments go straight to capital, and interest is charged on the remaining capital every month thereafter." } } },
      { variantId: "cdx-hl-ep-tf", step: { type: "true-false", statement: "Paying extra into your bond earns you a guaranteed return equal to your bond interest rate.", correct: true, feedback: { correct: "Right, and it's tax-free, which is why it competes well with investments promising more.", incorrect: "It's true. Interest you avoid is a certain return; investment returns are not." } } },
      { variantId: "cdx-hl-ep-sc", step: { type: "scenario", question: "Zanele gets a R20 000 tax refund and has a bond at 11% and a savings account at 7%. Where should it go?", options: ["Into the bond, where it saves 11% tax-free", "Into savings for flexibility", "Split evenly between them", "Into a new store account"], correct: 0, feedback: { correct: "Right. Saving 11% beats earning 7% before tax, and with an access bond she can still redraw it if needed.", incorrect: "The bond saves 11% tax-free against 7% taxable interest. An access bond keeps the money reachable too." } } },
    ],
  },
  {
    slotId: "credit-debt/home-loan/access-bond",
    conceptId: "home-loan-prepayment",
    variants: [
      { variantId: "cdx-hl-ab-tf", step: { type: "true-false", statement: "An access bond locks every extra rand you pay in until the loan is settled.", correct: false, feedback: { correct: "Right. The opposite. Extra payments stay available to redraw, which is what makes an access bond a sensible home for spare cash.", incorrect: "Access bonds let you withdraw the extra payments again. That flexibility is the point." } } },
      { variantId: "cdx-hl-ab-mcq", step: { type: "mcq", question: "What's the main advantage of an access facility on your bond?", options: ["Extra payments reduce interest but remain available if you need them", "It reduces your interest rate", "It removes the need for an emergency fund entirely", "It shortens the term automatically"], correct: 0, feedback: { correct: "Right. You get the interest saving without permanently locking the money away, though redrawing does undo the saving.", incorrect: "It's about access. The money still lowers your interest while it sits there, but you can draw it back." } } },
      { variantId: "cdx-hl-ab-sc", step: { type: "scenario", question: "Johan wants his emergency fund working harder. His bond has an access facility at 11%. Reasonable approach?", options: ["Keep a small cash layer and park the rest in the access bond", "Put every cent into the bond and keep no cash", "Leave it all in a 1% current account", "Move it into shares"], correct: 0, feedback: { correct: "Right. Cash for the first shock, the rest saving 11% while staying reachable. Provided redrawing is quick with his bank.", incorrect: "Keep an instantly available layer. Access bond redraws can take days, and emergencies rarely wait." } } },
    ],
  },
  {
    slotId: "credit-debt/home-loan/snowflakes",
    conceptId: "home-loan-prepayment",
    variants: [
      { variantId: "cdx-hl-sf-mcq", step: { type: "mcq", question: "A 'snowflake payment' on a bond is:", options: ["Any irregular lump sum paid against the capital", "A fixed monthly overpayment", "A penalty for late payment", "The bank's annual fee"], correct: 0, feedback: { correct: "Right. A bonus, a tax refund, a side-job payment. Early in the term even modest lumps remove years of interest.", incorrect: "It's an ad-hoc lump sum against capital, not a scheduled payment." } } },
      { variantId: "cdx-hl-sf-tf", step: { type: "true-false", statement: "Lump sums paid in the first few years of a bond save far more than the same amount paid near the end.", correct: true, feedback: { correct: "Right. Interest compounds on the outstanding balance, so early capital reductions have the longest time to work.", incorrect: "It's true. Timing matters enormously: early payments avoid the most future interest." } } },
      { variantId: "cdx-hl-sf-sc", step: { type: "scenario", question: "Priya receives an unexpected R15 000 in year two of a 20-year bond. Best use, assuming no expensive debt elsewhere?", options: ["Pay it against the bond capital", "Keep it in a current account", "Upgrade the kitchen", "Wait until year fifteen to pay it in"], correct: 0, feedback: { correct: "Right. Paid in year two, that R15 000 removes far more interest than the same amount would in year fifteen.", incorrect: "Against the capital, now. Delaying wastes most of the benefit." } } },
    ],
  },
  {
    slotId: "credit-debt/home-loan/term-vs-instalment",
    conceptId: "home-loan-prepayment",
    variants: [
      { variantId: "cdx-hl-ti-mcq", step: { type: "mcq", question: "Extra bond payments shorten the term because:", options: ["The capital falls faster", "The bank reduces your interest rate", "The instalment automatically increases", "The term is fixed and cannot change"], correct: 0, feedback: { correct: "Right. Keeping the instalment the same while the balance drops faster is what cuts years off the loan.", incorrect: "It's the faster capital reduction. Your rate and instalment don't change. The finish line moves closer." } } },
      { variantId: "cdx-hl-ti-tf", step: { type: "true-false", statement: "When rates fall, keeping your instalment at the old level pays the bond off faster.", correct: true, feedback: { correct: "Right. The extra amount goes straight to capital, one of the easiest wins available, because you never miss the money.", incorrect: "It's true. Not reducing your payment after a rate cut turns the saving into capital repayment." } } },
      { variantId: "cdx-hl-ti-sc", step: { type: "scenario", question: "Rates drop and Zanele's instalment falls by R700. What's the highest-value move?", options: ["Keep paying the old amount so R700 a month attacks the capital", "Spend the R700. She's earned it", "Reduce her emergency fund contribution instead", "Extend the bond term to lower the payment further"], correct: 0, feedback: { correct: "Right. She was already living on the old amount, so it costs her nothing and shortens the bond meaningfully.", incorrect: "Keep the instalment where it was. The R700 becomes capital repayment without changing her lifestyle." } } },
    ],
  },
];

// ── Buy Now, Pay Later ──────────────────────────────────────────────────────
const bnplSlots: QuestionSlot[] = [
  {
    slotId: "credit-debt/bnpl/zero-percent",
    conceptId: "bnpl",
    variants: [
      { variantId: "cdx-bn-zp-mcq", step: { type: "mcq", question: "BNPL is advertised as 0% interest. When does that stop being true?", options: ["The moment you miss an instalment and late fees apply", "After the first instalment", "Only on purchases above R5 000", "It's always genuinely free"], correct: 0, feedback: { correct: "Right. Late fees can run to a meaningful share of the purchase, which turns a 'free' product into an expensive one overnight.", incorrect: "The 0% holds only while you pay on time. Miss one and the fees arrive." } } },
      { variantId: "cdx-bn-zp-tf", step: { type: "true-false", statement: "Because BNPL providers earn from merchants, using them carries no risk to you.", correct: false, feedback: { correct: "Right. The revenue model doesn't protect you from late fees or from over-committing your budget.", incorrect: "How they make money is beside the point. Late fees and stacked commitments are real risks to you." } } },
      { variantId: "cdx-bn-zp-sc", step: { type: "scenario", question: "You split a R900 purchase into three payments and miss the second by a day. What's the realistic outcome?", options: ["A late fee that can be a sizeable share of the instalment", "Nothing. One day is within the grace period", "Immediate blacklisting", "The purchase is cancelled and refunded"], correct: 0, feedback: { correct: "Right. Fees vary by provider but are steep relative to the amount, which is exactly how the '0%' economics work.", incorrect: "A day late still triggers the fee. That fee is the real price of the product." } } },
    ],
  },
  {
    slotId: "credit-debt/bnpl/stacking",
    conceptId: "bnpl",
    variants: [
      { variantId: "cdx-bn-st-sc", step: { type: "scenario", question: "Sipho has four BNPL commitments running: R300, R450, R250 and R600 a month. What has he added to his budget?", options: ["R1 600 a month that was never planned for", "R1 200 a month", "R800 a month", "Nothing, BNPL isn't debt"], correct: 0, feedback: { correct: "R300 + R450 + R250 + R600 = R1 600. Each felt small on its own, which is precisely the trap.", incorrect: "Add them up: R1 600 a month of commitments that never appeared in his budget." } } },
      { variantId: "cdx-bn-st-mcq", step: { type: "mcq", question: "Why does BNPL make expensive things feel affordable?", options: ["It reframes the price as a small instalment instead of the full amount", "It genuinely reduces the price", "It delays the purchase until you can afford it", "It links the purchase to your income"], correct: 0, feedback: { correct: "Right. 'R600 now' lands very differently from 'R1 800', even though you owe the same money.", incorrect: "It's a framing effect. The price is unchanged; only how you perceive it changes." } } },
      { variantId: "cdx-bn-st-tf", step: { type: "true-false", statement: "A BNPL instalment is a debt commitment and belongs in your monthly budget.", correct: true, feedback: { correct: "Right. Anything you're obliged to pay next month is a commitment, whatever the marketing calls it.", incorrect: "It's true. It's an obligation with a due date. That makes it a budget line." } } },
    ],
  },
  {
    slotId: "credit-debt/bnpl/credit-record",
    conceptId: "bnpl",
    variants: [
      { variantId: "cdx-bn-cr-tf", step: { type: "true-false", statement: "Missed BNPL payments can affect your credit record in South Africa.", correct: true, feedback: { correct: "Right. Many SA providers report to the bureaux, so a missed instalment can sit on your record like any other credit.", incorrect: "It's true. BNPL increasingly reports to credit bureaux, and missed payments show up." } } },
      { variantId: "cdx-bn-cr-mcq", step: { type: "mcq", question: "How can heavy BNPL use affect a future home loan application?", options: ["The commitments count against affordability, and any missed payments show on your record", "It has no effect: BNPL isn't credit", "It improves the application by showing payment discipline", "It only matters if the amounts exceed R10 000"], correct: 0, feedback: { correct: "Right. Lenders assess your existing commitments, and R1 600 a month of BNPL directly reduces what you can borrow.", incorrect: "Existing commitments reduce affordability, and reported misses damage the record. Both matter to a bond assessor." } } },
      { variantId: "cdx-bn-cr-sc", step: { type: "scenario", question: "Ayesha plans to apply for a bond in six months. What should she do about her BNPL habit?", options: ["Clear the commitments and stop opening new ones before applying", "Open more to build a credit history", "Keep them, since they're interest-free", "Switch them to a credit card"], correct: 0, feedback: { correct: "Right. A clean set of commitments in the months before an application directly improves what she'll qualify for.", incorrect: "Clear them. Live commitments reduce affordability at exactly the wrong moment." } } },
    ],
  },
  {
    slotId: "credit-debt/bnpl/when-ok",
    conceptId: "bnpl",
    variants: [
      { variantId: "cdx-bn-wo-mcq", step: { type: "mcq", question: "When is BNPL a defensible choice?", options: ["For something already in your budget", "Whenever the instalment looks affordable", "For anything you want but can't afford", "For groceries every month"], correct: 0, feedback: { correct: "Right. If the money is there and the item was planned, it's a payment method. Otherwise it's borrowing with a friendly name.", incorrect: "The test is whether you could pay cash today for something you'd planned anyway." } } },
      { variantId: "cdx-bn-wo-tf", step: { type: "true-false", statement: "Using BNPL for regular groceries is a warning sign about your cash flow.", correct: true, feedback: { correct: "Right. Financing consumables you'll have eaten before the last instalment means income isn't covering essentials.", incorrect: "It's true. Splitting basics into instalments points to a cash-flow gap that needs fixing, not financing." } } },
      { variantId: "cdx-bn-wo-sc", step: { type: "scenario", question: "Thabo wants a R2 400 jacket and has R2 400 saved, but BNPL lets him keep the cash. Reasonable?", options: ["Only if he sets the money aside for the instalments and doesn't spend it", "Yes. Free credit is always worth taking", "No. BNPL is never acceptable", "Yes, and he should invest the R2 400 instead"], correct: 0, feedback: { correct: "Right. The risk isn't the product, it's the cash quietly getting spent before instalment two arrives.", incorrect: "It works only if the money is genuinely ring-fenced. Otherwise he's created a debt he can't cover." } } },
    ],
  },
];

// ── How Your Credit Score Is Calculated ─────────────────────────────────────
const mechSlots: QuestionSlot[] = [
  {
    slotId: "credit-debt/mechanics/weightings",
    conceptId: "credit-score",
    variants: [
      { variantId: "cdx-mc-wt-mcq", step: { type: "mcq", question: "Which two factors together drive roughly two-thirds of a credit score?", options: ["Payment history and credit utilisation", "Income and age", "Credit mix and new applications", "Length of history and income"], correct: 0, feedback: { correct: "Right. Roughly 35% and 30%. Fix those two and the rest is detail.", incorrect: "Payment history (~35%) and utilisation (~30%) dominate. Income isn't scored at all." } } },
      { variantId: "cdx-mc-wt-tf", step: { type: "true-false", statement: "Credit mix and new applications matter less than payment history and utilisation.", correct: true, feedback: { correct: "Right. They're roughly 10% each, so don't open accounts just to improve your 'mix'.", incorrect: "It's true. Mix and applications are minor factors next to how you pay and how much you use." } } },
      { variantId: "cdx-mc-wt-sc", step: { type: "scenario", question: "Nomsa wants the fastest improvement in her score. Where should she focus?", options: ["Paying every account on time and cutting utilisation below 30%", "Opening a new type of credit for variety", "Applying to several lenders to compare offers", "Closing her oldest account"], correct: 0, feedback: { correct: "Right. Those are the two heaviest factors and the two she can move within a few months.", incorrect: "Target payment history and utilisation. New applications and closures work against her." } } },
    ],
  },
  {
    slotId: "credit-debt/mechanics/utilisation-maths",
    conceptId: "credit-utilisation",
    variants: [
      { variantId: "cdx-mc-um-fill", step: { type: "fill-blank", title: "Total utilisation", prompt: "You hold three cards with limits of R8 000, R12 000 and R15 000, and combined balances of R14 000. Your utilisation is ____%.", correct: 40, feedback: { correct: "R14 000 ÷ R35 000 = 40%, above the 30% comfort line. Paying down R3 500 would bring it to 30%.", incorrect: "Total limit R35 000, balances R14 000, so 14 000 ÷ 35 000 = 40%." } } },
      { variantId: "cdx-mc-um-mcq", step: { type: "mcq", question: "Utilisation is measured:", options: ["Across all your revolving accounts combined, and per account", "Only on your largest card", "Against your income", "Only when you apply for credit"], correct: 0, feedback: { correct: "Right. One maxed card can hurt even when your overall ratio looks fine, so watch both numbers.", incorrect: "Both the overall ratio and individual accounts matter. Income isn't part of the calculation." } } },
      { variantId: "cdx-mc-um-tf", step: { type: "true-false", statement: "Paying your card down just before the statement date can lower the utilisation that gets reported.", correct: true, feedback: { correct: "Right. Bureaux see the reported balance, usually at statement date, not your lowest balance during the month.", incorrect: "It's true. The reported figure is a snapshot, so timing your payment before it affects what's recorded." } } },
    ],
  },
  {
    slotId: "credit-debt/mechanics/enquiries",
    conceptId: "credit-score",
    variants: [
      { variantId: "cdx-mc-en-mcq", step: { type: "mcq", question: "What happens when you apply for credit at five lenders in one week?", options: ["Multiple hard enquiries appear, and lenders may read it as distress", "Nothing is recorded", "Your score improves from the activity", "Only the successful application is recorded"], correct: 0, feedback: { correct: "Right. Space applications out, or get pre-qualification quotes that don't leave a hard enquiry.", incorrect: "Each application leaves a hard enquiry. A cluster of them signals desperation to the next lender." } } },
      { variantId: "cdx-mc-en-tf", step: { type: "true-false", statement: "Checking your own credit score damages it.", correct: false, feedback: { correct: "Right. Your own check is a soft enquiry and has no effect. You're legally entitled to see your report.", incorrect: "Checking your own report is a soft enquiry. Only lender applications leave hard enquiries." } } },
      { variantId: "cdx-mc-en-sc", step: { type: "scenario", question: "Johan wants to compare car finance from three banks without hurting his score. Best approach?", options: ["Ask for pre-qualification quotes and submit full applications within a short window", "Apply formally to all three over several months", "Apply to one and accept whatever it offers", "Ask a friend to apply on his behalf"], correct: 0, feedback: { correct: "Right. Rate shopping in a tight window is treated far more kindly than applications scattered across months.", incorrect: "Pre-qualify first, then cluster any formal applications. Spreading them out looks worse, not better." } } },
    ],
  },
  {
    slotId: "credit-debt/mechanics/read-report",
    conceptId: "credit-report-disputes",
    variants: [
      { variantId: "cdx-mc-rr-mcq", step: { type: "mcq", question: "What are you entitled to under the National Credit Act regarding your credit report?", options: ["A free report from each registered credit bureau once a year", "One free report in your lifetime", "Free reports only after a rejected application", "Nothing. Reports are always paid for"], correct: 0, feedback: { correct: "Right. SA bureaux include TransUnion, Experian and XDS, and several services show your score free at any time.", incorrect: "One free report a year from each bureau, by law. Free score-tracking services exist on top of that." } } },
      { variantId: "cdx-mc-rr-tf", step: { type: "true-false", statement: "If your report shows an account you never opened, that could be identity fraud and must be disputed.", correct: true, feedback: { correct: "Right. Dispute it with the bureau in writing. They must investigate, and incorrect information has to be corrected.", incorrect: "It's true, and urgent. An unrecognised account is a fraud signal, not an administrative curiosity." } } },
      { variantId: "cdx-mc-rr-sc", step: { type: "scenario", question: "Lerato finds a default listed for an account she settled two years ago. What should she do?", options: ["Dispute it with the bureau in writing, attaching proof of settlement", "Ignore it. It'll drop off eventually", "Pay the amount again to be safe", "Open a new account to offset it"], correct: 0, feedback: { correct: "Right. Bureaux must investigate disputed information and correct what's wrong. One bad listing can suppress a score for years.", incorrect: "Dispute it with evidence. Waiting leaves an inaccurate listing suppressing her score." } } },
    ],
  },
];

// ── Rebuilding a Damaged Credit Score ───────────────────────────────────────
const rebSlots: QuestionSlot[] = [
  {
    slotId: "credit-debt/rebuild/no-shortcuts",
    conceptId: "credit-report-disputes",
    variants: [
      { variantId: "cdx-rb-ns-mcq", step: { type: "mcq", question: "A company offers to 'remove your blacklisting' for R2 500. What's the reality?", options: ["Accurate adverse information can't be removed on request. Only errors can be disputed, free", "They have a legal channel consumers don't", "It works but takes six months", "It's legal but only for judgments"], correct: 0, feedback: { correct: "Right. Correct listings run their prescribed course, and disputing a genuine error costs you nothing.", incorrect: "Nobody can delete accurate listings. Disputing errors is free and you can do it yourself." } } },
      { variantId: "cdx-rb-ns-tf", step: { type: "true-false", statement: "Correct adverse information stays on your record for a set period and can't be paid away.", correct: true, feedback: { correct: "Right. Settling the debt updates the status, which helps, but the listing still runs its term.", incorrect: "It's true. Settling improves the record's accuracy; it doesn't erase the history." } } },
      { variantId: "cdx-rb-ns-sc", step: { type: "scenario", question: "Thabo has two defaults from three years ago and wants a bond. What actually helps?", options: ["A consistent record of on-time payments from now on, while the old listings age out", "Paying a credit repair company", "Opening several new accounts quickly", "Applying to many lenders until one says yes"], correct: 0, feedback: { correct: "Right. Recent behaviour carries the most weight, so a clean twelve to twenty-four months changes his position substantially.", incorrect: "Time plus consistent on-time payments. Repair companies and scattered applications make things worse." } } },
    ],
  },
  {
    slotId: "credit-debt/rebuild/settle-arrears",
    conceptId: "credit-report-disputes",
    variants: [
      { variantId: "cdx-rb-sa-mcq", step: { type: "mcq", question: "You have an account in arrears. What's the first priority?", options: ["Bring it current, then keep it current every month", "Open a new account to dilute it", "Dispute the listing regardless of accuracy", "Wait for the creditor to write it off"], correct: 0, feedback: { correct: "Right. An account moving from arrears to current changes what lenders see far more than any cosmetic tactic.", incorrect: "Get it current first. Everything else is noise until the arrears are cleared." } } },
      { variantId: "cdx-rb-sa-tf", step: { type: "true-false", statement: "Settling a defaulted account changes its status on your credit report even though the listing remains.", correct: true, feedback: { correct: "Right. A settled default reads far better to a lender than an outstanding one.", incorrect: "It's true. The listing stays for its term but the status updates to reflect settlement." } } },
      { variantId: "cdx-rb-sa-sc", step: { type: "scenario", question: "Nomsa can settle one of two defaults. Which should she choose, all else equal?", options: ["The more recent one", "The oldest one", "The smallest one, for the quick win", "Neither. She should save the money"], correct: 0, feedback: { correct: "Right. Recency dominates in scoring, and the older listing is closer to ageing off anyway.", incorrect: "Recent items weigh more. The older default will drop off sooner on its own." } } },
    ],
  },
  {
    slotId: "credit-debt/rebuild/small-credit",
    conceptId: "credit-score",
    variants: [
      { variantId: "cdx-rb-sc-mcq", step: { type: "mcq", question: "What's a sensible way to rebuild a payment record after damage?", options: ["One small facility used lightly and settled in full every month", "Several new accounts at once", "A large personal loan repaid over five years", "Avoiding all credit permanently"], correct: 0, feedback: { correct: "Right. You need new positive data, and the smallest safe amount of credit generates it without risk.", incorrect: "Small and perfectly managed. Multiple accounts or a large loan add risk without adding much evidence." } } },
      { variantId: "cdx-rb-sc-tf", step: { type: "true-false", statement: "Avoiding credit entirely is the fastest way to recover a damaged score.", correct: false, feedback: { correct: "Right. Without new activity there's no positive data. The old damage just sits there ageing slowly.", incorrect: "You need fresh positive history. Total avoidance leaves nothing good for the bureau to record." } } },
      { variantId: "cdx-rb-sc-sc", step: { type: "scenario", question: "Sipho is rebuilding and is offered a R30 000 credit limit. What's the sensible response?", options: ["Accept a modest limit if offered, and keep usage well under 30%", "Take the full limit and use most of it to show activity", "Decline all credit for five years", "Take it and withdraw cash to build history"], correct: 0, feedback: { correct: "Right. A high limit used lightly actually helps utilisation. The danger is using it, not having it.", incorrect: "Light usage is the whole point. Cash withdrawals are expensive and prove nothing." } } },
    ],
  },
  {
    slotId: "credit-debt/rebuild/patience",
    conceptId: "credit-score",
    variants: [
      { variantId: "cdx-rb-pt-mcq", step: { type: "mcq", question: "Realistically, how long does meaningful credit repair take?", options: ["Twelve to twenty-four months of consistent on-time payments", "A few weeks", "Three months", "Ten years, with no way to speed it up"], correct: 0, feedback: { correct: "Right. Improvement starts within months, but a lender-convincing record takes a year or two of clean behaviour.", incorrect: "Expect twelve to twenty-four months. Anyone promising weeks is selling something." } } },
      { variantId: "cdx-rb-pt-tf", step: { type: "true-false", statement: "Recent payment behaviour affects your score more than behaviour from three years ago.", correct: true, feedback: { correct: "Right, and that's the encouraging part. A clean recent record can outweigh older damage.", incorrect: "It's true. Scoring weights recent behaviour more heavily, which is why rebuilding works." } } },
      { variantId: "cdx-rb-pt-sc", step: { type: "scenario", question: "Ayesha's score has barely moved after two months of perfect payments. What's the right read?", options: ["Normal. The trend matters more than any single month; keep going", "The system is broken and she should stop", "She needs to open more accounts", "She should pay a repair service"], correct: 0, feedback: { correct: "Right. Two months is a rounding error in a scoring model. The curve bends around the six to twelve-month mark.", incorrect: "Two months is too short to judge. Consistency over a year is what moves the number." } } },
    ],
  },
];

// ── The Real Cost of a Personal Loan (applied) ──────────────────────────────
const trapSlots: QuestionSlot[] = [
  {
    slotId: "credit-debt/loan-trap/total-cost",
    conceptId: "cost-of-debt",
    variants: [
      { variantId: "cdx-lt-tc-fill", step: { type: "fill-blank", title: "What Nomsa really repays", prompt: "Nomsa borrows R10 000 over 24 months. Her bank quotes R509 a month. Total repaid = R____.", correct: 12216, feedback: { correct: "R509 × 24 = R12 216. The R2 216 above the loan is the true cost of borrowing for that repair.", incorrect: "R509 × 24 months = R12 216." } } },
      { variantId: "cdx-lt-tc-mcq", step: { type: "mcq", question: "Nomsa repays R509 a month for 24 months on a R10 000 loan. What did the credit cost her?", options: ["About R2 216", "Nothing, she repays what she borrowed", "About R500", "About R5 000"], correct: 0, feedback: { correct: "R12 216 repaid against R10 000 borrowed = R2 216. Always multiply the instalment by the term before signing.", incorrect: "Total repaid R12 216 minus the R10 000 borrowed = R2 216 of interest and fees." } } },
      { variantId: "cdx-lt-tc-tf", step: { type: "true-false", statement: "The monthly instalment tells you what a loan really costs.", correct: false, feedback: { correct: "Right. Instalment × term is the number that matters, a low monthly payment over a long term is usually the most expensive option.", incorrect: "It doesn't. Multiply by the term to see the true cost, then compare that against the amount borrowed." } } },
    ],
  },
  {
    slotId: "credit-debt/loan-trap/alternatives",
    conceptId: "cost-of-debt",
    variants: [
      { variantId: "cdx-lt-al-sc", step: { type: "scenario", question: "Nomsa needs a R10 000 car repair. She earns R14 000 take-home, has no other debt and a small emergency fund. What's the strongest option?", options: ["A cheaper temporary fix now, saving toward the full repair", "The 24-month loan at R509 a month", "Borrowing from a mashonisa for speed", "A BNPL split over three months she can't cover"], correct: 0, feedback: { correct: "Right. It costs a fraction of the R2 216 in interest and leaves her with the habit of saving for the next repair.", incorrect: "Interim fix plus saving avoids R2 216 in interest. The loan is the expensive default, not the only option." } } },
      { variantId: "cdx-lt-al-mcq", step: { type: "mcq", question: "Before taking a personal loan for an unexpected expense, what's worth checking?", options: ["Whether a partial or delayed solution buys enough time to save", "Whether the bank offers a longer term", "Whether a second loan could cover the first", "Whether the instalment fits, and nothing else"], correct: 0, feedback: { correct: "Right. Many 'emergencies' have a cheaper interim answer that removes the need to borrow at all.", incorrect: "Look for the interim solution first. A longer term or a second loan makes the position worse." } } },
      { variantId: "cdx-lt-al-tf", step: { type: "true-false", statement: "An emergency fund is what turns a borrowing decision into a spending decision.", correct: true, feedback: { correct: "Right. With cash available the same repair costs R10 000 instead of R12 216. The fund pays for itself on one event.", incorrect: "It's true. That's the practical value of a buffer: you pay the price, not the price plus interest." } } },
    ],
  },
  {
    slotId: "credit-debt/loan-trap/affordability-check",
    conceptId: "cost-of-debt",
    variants: [
      { variantId: "cdx-lt-ac-mcq", step: { type: "mcq", question: "Nomsa's R509 instalment is under 4% of her take-home pay. Does that make the loan a good idea?", options: ["It makes it affordable", "Yes. Anything under 10% is fine", "No. No loan is ever acceptable", "Yes, and she should borrow more while she qualifies"], correct: 0, feedback: { correct: "Right. Affordable and worthwhile are different tests. The R2 216 is still a real cost for a repair she could plan around.", incorrect: "Affordability is the floor, not the decision. The question is whether R2 216 of interest is worth it." } } },
      { variantId: "cdx-lt-ac-tf", step: { type: "true-false", statement: "A loan you can afford is automatically a loan worth taking.", correct: false, feedback: { correct: "Right. Affordability answers 'can I?', not 'should I?', and lenders only assess the first question.", incorrect: "They're separate questions. Affordability is necessary, not sufficient." } } },
      { variantId: "cdx-lt-ac-sc", step: { type: "scenario", question: "Nomsa takes the loan. What single step protects her from repeating this in a year?", options: ["Keep paying R509 a month into savings once the loan ends", "Increase her credit limit for next time", "Cancel her emergency fund contributions", "Take a second loan to build a buffer"], correct: 0, feedback: { correct: "Right. She's already proved she can live without that R509. Redirecting it turns a debt habit into a savings habit.", incorrect: "Redirect the instalment into savings when the loan ends. That's how the cycle breaks." } } },
    ],
  },
  {
    slotId: "credit-debt/loan-trap/read-the-agreement",
    conceptId: "cost-of-debt",
    variants: [
      { variantId: "cdx-lt-ra-mcq", step: { type: "mcq", question: "Beyond the interest rate, what else raises the real cost of a personal loan?", options: ["The initiation fee and the monthly service fee", "The lender's branch network", "Your credit score", "The day of the month you're paid"], correct: 0, feedback: { correct: "Right. Both are legal under the NCA and both are disclosed in the agreement. They're a real part of the price.", incorrect: "Initiation and monthly service fees. Read the cost-of-credit section, not just the headline rate." } } },
      { variantId: "cdx-lt-ra-tf", step: { type: "true-false", statement: "Credit life insurance is often added to a personal loan and forms part of the monthly cost.", correct: true, feedback: { correct: "Right, and you're generally entitled to substitute your own policy if it provides equivalent cover: often more cheaply.", incorrect: "It's true. It's commonly included, and you can usually cede an existing policy instead." } } },
      { variantId: "cdx-lt-ra-sc", step: { type: "scenario", question: "Nomsa's quote shows a rate she recognises but a total cost higher than she calculated. Where does she look?", options: ["The cost-of-credit disclosure listing initiation fee, service fees and credit life", "The interest rate alone", "Her bank statement", "Her credit report"], correct: 0, feedback: { correct: "Right. Those additions explain the gap, and they're required to be itemised before she signs.", incorrect: "The cost-of-credit section itemises the fees and insurance that sit on top of the rate." } } },
    ],
  },
];

export const CREDIT_DEBT_EXTRA_BANKS: Record<string, LessonBank> = {
  "credit-debt::lesson-debt-avalanche": {
    layout: L(avaSlots, "The Mathematically Optimal Strategy", "<p>The <strong>debt avalanche</strong>: list every debt by interest rate, pay minimums on all of them, and throw every spare rand at the highest rate. When one clears, roll its payment onto the next. It pays the least total interest of any method. The <strong>snowball</strong> (smallest balance first) costs a little more but delivers faster wins, and the best method is the one you'll finish.</p>"),
    slots: avaSlots,
  },
  "credit-debt::lesson-credit-score-building": {
    layout: L(buildSlots, "From No History to a Real Score", "<p>No credit history is nearly as awkward as bad history. Lenders can't price an unknown. Build one by borrowing small and repaying perfectly, on time, for a long time. <strong>Payment history is about 35%</strong> of your score and <strong>utilisation about 30%</strong>; keep balances under 30% of your limits. Your income isn't on your credit report at all.</p>"),
    slots: buildSlots,
  },
  "credit-debt::lesson-debt-counselling": {
    layout: L(dcSlots, "When Debt Becomes Unmanageable", "<p>Debt counselling (debt review) is an NCA process for over-indebted consumers: a counsellor registered with the <strong>National Credit Regulator</strong> restructures your debts into one affordable payment, and creditors can't take legal action while you comply. You're flagged and blocked from new credit until you finish, then insist on your <strong>clearance certificate</strong>. Verify any counsellor at ncr.org.za first.</p>"),
    slots: dcSlots,
  },
  "credit-debt::lesson-reckless-lending": {
    layout: L(rlSlots, "Reckless Credit and Your Rights", "<p>Under the NCA, credit is <strong>reckless</strong> if the provider didn't properly assess your affordability, and a court can set the agreement aside or restructure it. Personal loan rates are capped by a repo-linked formula (<strong>repo + 21%</strong>), and charging above it is an offence you can report to the NCR. Mashonisas sit outside the Act entirely: no cap, no rules, no recourse.</p>"),
    slots: rlSlots,
  },
  "credit-debt::lesson-car-finance": {
    layout: L(carSlots, "What a Financed Car Really Costs", "<p>Interest plus initiation and service fees mean a financed car costs far more than its price, and it depreciates the whole time. A <strong>balloon payment</strong> defers 20–30% of the debt to the end, where it's usually refinanced at more interest. A bigger deposit cuts interest and avoids negative equity. Keep <strong>total transport near 20% of income</strong>: instalment, insurance, fuel and maintenance together.</p>"),
    slots: carSlots,
  },
  "credit-debt::lesson-home-loan-debt": {
    layout: L(hlSlots, "Your Biggest Debt, Your Best Return", "<p>Extra payments into a bond earn a <strong>guaranteed, tax-free return equal to your interest rate</strong>. No investment promises that. Early payments matter most, because interest compounds on the outstanding balance for the remaining term. An <strong>access bond</strong> keeps that money available to redraw. When rates fall, keep paying the old instalment: the difference goes straight to capital.</p>"),
    slots: hlSlots,
  },
  "credit-debt::lesson-buy-now-pay-later": {
    layout: L(bnplSlots, "Buy Now, Pay Later", "<p>BNPL splits a purchase into instalments at 0%. <em>while you pay on time</em>. Miss one and late fees arrive. The real danger is stacking: four commitments of R300–R600 quietly add R1 600 a month you never budgeted. SA providers increasingly report to credit bureaux, so missed payments hit your record and live commitments reduce what a bond assessor says you can afford.</p>"),
    slots: bnplSlots,
  },
  "credit-debt::lesson-credit-score-mechanics": {
    layout: L(mechSlots, "The Five Pillars of Your Score", "<p>Payment history (~35%), utilisation (~30%), length of history (~15%), credit mix (~10%) and new applications (~10%). Your income isn't included. You're entitled to a <strong>free report from each bureau once a year</strong> (TransUnion, Experian, XDS). Checking your own score is a soft enquiry and harms nothing. Dispute anything incorrect in writing; bureaux must investigate.</p>"),
    slots: mechSlots,
  },
  "credit-debt::lesson-rebuild-credit-score": {
    layout: L(rebSlots, "Rebuilding After Damage", "<p>Nobody can delete accurate adverse information, and anyone charging to 'clear a blacklisting' is selling you nothing. What works: bring arrears current, settle what you can (recent listings first), keep one small facility running perfectly, and let time pass. Scoring weights <strong>recent behaviour most heavily</strong>, so twelve to twenty-four clean months genuinely changes your position.</p>"),
    slots: rebSlots,
  },
  "credit-debt::lesson-applied-loan-trap": {
    layout: L(trapSlots, "Nomsa Needs R10 000", "<p>Nomsa's car needs a R10 000 repair. Her bank offers 24 months at <strong>R509 a month</strong>. She earns R14 000 take-home and has no other debt. The instalment is comfortably affordable, but <strong>R509 × 24 = R12 216</strong>, so the credit costs R2 216. Affordable and worthwhile are two different tests.</p>"),
    slots: trapSlots,
  },
};
