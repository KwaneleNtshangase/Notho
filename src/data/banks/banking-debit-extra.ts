import type { LessonLayoutItem, QuestionSlot } from "@/data/content";
import type { LessonBank } from "./money-basics";

/**
 * Premium banks for the Banking & Debit Orders EXTRA lessons.
 * Figures per docs/SA-REGULATORY-FIGURES.md: interest exemption R23 800 (under 65),
 * CODI deposit insurance R100 000, National Financial Ombud 0860 800 900.
 * Single Discretionary Allowance R2 000 000/calendar year (doubled in Budget 2026,
 * no SARS clearance); Foreign Investment Allowance R10m with SARS approval.
 * variantId prefix: `bdx-`.
 */
const info = (title: string, content: string): LessonLayoutItem => ({ type: "info", title, content });
const L = (slots: QuestionSlot[], title: string, content: string): LessonLayoutItem[] => [
  info(title, content),
  ...slots.map((s) => ({ slot: s.slotId })),
];

// ── Comparing Savings Accounts ──────────────────────────────────────────────
const saveSlots: QuestionSlot[] = [
  {
    slotId: "banking-debit/savings/rate-shopping",
    conceptId: "savings-account-rates",
    variants: [
      { variantId: "bdx-sv-rs-fill", step: { type: "fill-blank", title: "The rate gap", prompt: "R100 000 sits in a savings account paying 10% a year. Interest earned over one year = R____.", correct: 10000, feedback: { correct: "R100 000 × 10% = R10 000. The same money at 6% earns R6 000: a R4 000 gap for one afternoon of comparing.", incorrect: "R100 000 × 10% = R10 000 a year. At 6% it would be R6 000." } } },
      { variantId: "bdx-sv-rs-mcq", step: { type: "mcq", question: "Why is it worth comparing savings rates across SA banks?", options: ["The spread between the best and worst rates is several percent, and it compounds", "All SA banks are legally required to pay the same rate", "Rates only matter above R1 million", "Only the big four banks pay interest"], correct: 0, feedback: { correct: "Right. Digital banks and dedicated savings products often beat a standard big-bank savings account by three or four percent.", incorrect: "Rates vary widely between banks and products. That gap compounds year after year on the same money." } } },
      { variantId: "bdx-sv-rs-tf", step: { type: "true-false", statement: "Moving R50 000 from a 6% account to a 10% account is worth about R2 000 a year.", correct: true, feedback: { correct: "Right. R50 000 × 4% = R2 000, for a form and a transfer.", incorrect: "It's true. The 4% difference on R50 000 is R2 000 a year. The easiest return you'll ever earn." } } },
    ],
  },
  {
    slotId: "banking-debit/savings/notice-vs-call",
    conceptId: "savings-account-rates",
    variants: [
      { variantId: "bdx-sv-nc-mcq", step: { type: "mcq", question: "What does a 32-day notice account trade for its higher interest rate?", options: ["Instant access. You must give 32 days' notice to withdraw", "Deposit insurance protection", "The ability to earn interest at all", "Access for anyone under 25"], correct: 0, feedback: { correct: "Right. It's a liquidity trade: less access, better rate. Suits money you're unlikely to need this month.", incorrect: "You give up instant access. Notice accounts pay more precisely because your money is less available." } } },
      { variantId: "bdx-sv-nc-tf", step: { type: "true-false", statement: "A call account usually pays more than a notice account because it's more convenient.", correct: false, feedback: { correct: "Right. It's the other way round. Convenience costs you interest.", incorrect: "Call accounts pay less. The bank rewards you for giving up instant access, not for keeping it." } } },
      { variantId: "bdx-sv-nc-sc", step: { type: "scenario", question: "Nomsa's emergency fund is R60 000. She wants a better rate but might need the money at short notice. Sensible split?", options: ["Keep one month's expenses instantly accessible and put the rest in a notice or money market account", "Lock all R60 000 into a 12-month fixed deposit", "Leave it all in a current account", "Put it into shares for a better return"], correct: 0, feedback: { correct: "Right. A small instant layer handles the first shock, and the rest earns more without being truly locked away.", incorrect: "Split it. Locking the whole emergency fund defeats its purpose; leaving it all in a current account wastes interest." } } },
    ],
  },
  {
    slotId: "banking-debit/savings/interest-tax",
    conceptId: "savings-account-rates",
    variants: [
      { variantId: "bdx-sv-it-tf", step: { type: "true-false", statement: "Interest earned in an ordinary bank savings account is completely tax-free.", correct: false, feedback: { correct: "Right. Local interest is exempt up to R23 800 a year under 65 (R34 500 from 65). Above that it's taxed at your marginal rate.", incorrect: "There's an annual exemption, R23 800 under 65, and interest above it is taxable." } } },
      { variantId: "bdx-sv-it-mcq", step: { type: "mcq", question: "Which account lets interest, dividends and growth accumulate with no SA tax at all?", options: ["A tax-free savings account", "A 32-day notice account", "A money market fund", "A fixed deposit"], correct: 0, feedback: { correct: "Right. The TFSA has no tax on interest, dividends or capital gains, but contributions are capped at R46 000 a year and R500 000 for life.", incorrect: "Only the TFSA. The others all fall under the ordinary interest exemption and then normal tax." } } },
      { variantId: "bdx-sv-it-sc", step: { type: "scenario", question: "Johan is 40 and earns R30 000 of local interest this year. What's the tax position?", options: ["R23 800 is exempt; the remaining R6 200 is taxed at his marginal rate", "All R30 000 is exempt", "All R30 000 is taxed", "Interest is taxed at a flat 15%"], correct: 0, feedback: { correct: "Right. Only the excess above the exemption is taxable, at whatever bracket he sits in.", incorrect: "The first R23 800 is exempt under 65. Only R6 200 is taxable, at his marginal rate." } } },
    ],
  },
  {
    slotId: "banking-debit/savings/where-emergency",
    conceptId: "emergency-fund",
    variants: [
      { variantId: "bdx-sv-we-sc", step: { type: "scenario", question: "You hold R80 000 in a call account at 6.5%. A money market fund pays 9.2% with access in one to two days. Extra interest a year?", options: ["About R2 160", "About R800", "About R5 000", "Nothing. Both are liquid"], correct: 0, feedback: { correct: "R80 000 × 2.7% = R2 160 for essentially the same accessibility. Worth the paperwork.", incorrect: "9.2% − 6.5% = 2.7%. R80 000 × 2.7% = R2 160 more a year." } } },
      { variantId: "bdx-sv-we-mcq", step: { type: "mcq", question: "What matters most when choosing where to park an emergency fund?", options: ["Access within a day or two, capital safety", "The highest possible return, whatever the risk", "Whether the bank has branches near you", "Whether it's the same bank as your salary account"], correct: 0, feedback: { correct: "Right. It has to be there when you need it. The rate is the tiebreaker, not the goal.", incorrect: "Accessibility and safety come first for emergency money. Chase the rate only among options that pass those tests." } } },
      { variantId: "bdx-sv-we-tf", step: { type: "true-false", statement: "Bank deposits in South Africa are covered up to R100 000 per depositor per bank by CODI.", correct: true, feedback: { correct: "Right. The Corporation for Deposit Insurance has covered qualifying deposits since 2024, which matters if you're using a smaller bank.", incorrect: "It's true, R100 000 per depositor per bank, through CODI." } } },
    ],
  },
];

// ── Credit vs Debit Cards ───────────────────────────────────────────────────
const cardSlots: QuestionSlot[] = [
  {
    slotId: "banking-debit/cards/pay-in-full",
    conceptId: "credit-vs-debit",
    variants: [
      { variantId: "bdx-cd-pf-mcq", step: { type: "mcq", question: "The only way to use a credit card without paying interest is to:", options: ["Settle the full outstanding balance by the due date every month", "Pay the minimum each month", "Keep your utilisation under 50%", "Use it only for small purchases"], correct: 0, feedback: { correct: "Right. Full settlement each month keeps you inside the interest-free period. Anything less and the whole balance starts earning interest for the bank.", incorrect: "Only full payment works. Minimums and low utilisation still leave you paying 20%+ on the balance." } } },
      { variantId: "bdx-cd-pf-tf", step: { type: "true-false", statement: "Paying the minimum on a credit card keeps you interest-free.", correct: false, feedback: { correct: "Right. The minimum mostly covers interest and fees, so the balance barely moves and the interest keeps running.", incorrect: "Minimum payments don't stop interest. The unpaid balance accrues at 20%+ from the statement date." } } },
      { variantId: "bdx-cd-pf-sc", step: { type: "scenario", question: "Lerato puts her R8 000 monthly groceries on a credit card and settles it in full on the due date. What does it cost her?", options: ["Nothing in interest, and she earns rewards on the spend", "20% interest on R8 000 each month", "A monthly penalty for high usage", "Damage to her credit score from frequent use"], correct: 0, feedback: { correct: "Right. Used this way a credit card is a free tool. Regular full settlement also builds a solid repayment record.", incorrect: "Settled in full, there's no interest. Regular on-time settlement helps her credit record rather than hurting it." } } },
    ],
  },
  {
    slotId: "banking-debit/cards/protection",
    conceptId: "credit-vs-debit",
    variants: [
      { variantId: "bdx-cd-pr-tf", step: { type: "true-false", statement: "Debit cards give you stronger protection than credit cards when a merchant fails to deliver.", correct: false, feedback: { correct: "Right. It's the reverse. Credit card chargeback rights are stronger, because the bank's money is at stake until you pay.", incorrect: "Credit cards win here. Chargeback rights on a credit card are stronger than a debit dispute." } } },
      { variantId: "bdx-cd-pr-mcq", step: { type: "mcq", question: "You pay a R12 000 deposit online and the supplier disappears. Which payment method gives you the best recourse?", options: ["Credit card, through a chargeback", "Debit card", "Instant EFT", "Cash deposit"], correct: 0, feedback: { correct: "Right. A chargeback reverses the transaction through the card scheme. EFT and cash have no equivalent protection.", incorrect: "Credit card chargebacks are the strongest recourse. EFT and cash are effectively irreversible." } } },
      { variantId: "bdx-cd-pr-sc", step: { type: "scenario", question: "Ayesha books flights from an unfamiliar travel site. Which card should she use and why?", options: ["The credit card", "The debit card, because the money leaves immediately", "Neither. She should use instant EFT", "Whichever has the higher balance"], correct: 0, feedback: { correct: "Right. For anything paid now and delivered later, the credit card's dispute rights are the safety net.", incorrect: "Use the credit card. Paying now for later delivery is exactly when chargeback protection matters." } } },
    ],
  },
  {
    slotId: "banking-debit/cards/interest-cost",
    conceptId: "credit-cards",
    variants: [
      { variantId: "bdx-cd-ic-fill", step: { type: "fill-blank", title: "Monthly interest", prompt: "You carry a R20 000 credit card balance at 20.5% a year. Interest for one month, to the nearest rand = R____.", correct: 342, feedback: { correct: "R20 000 × 20.5% ÷ 12 ≈ R342 a month, or R4 100 a year for the privilege of not settling.", incorrect: "R20 000 × 20.5% = R4 100 a year, ÷ 12 ≈ R342 a month." } } },
      { variantId: "bdx-cd-ic-mcq", step: { type: "mcq", question: "Why do minimum payments keep a card balance alive for years?", options: ["Most of the payment goes to interest", "Banks refuse larger payments", "The minimum is calculated after interest is waived", "Interest only starts after 12 months"], correct: 0, feedback: { correct: "Right. On a R20 000 balance the interest alone is around R342 a month, so a small minimum leaves almost nothing for capital.", incorrect: "The minimum is mostly interest. Very little touches the capital, which is why the balance persists." } } },
      { variantId: "bdx-cd-ic-tf", step: { type: "true-false", statement: "A credit card is either a free payment tool or expensive debt, there isn't much in between.", correct: true, feedback: { correct: "Right. Settled monthly it costs nothing; carried, it's one of the most expensive debts available to you.", incorrect: "It's true. The difference between settling in full and carrying a balance is the whole story." } } },
    ],
  },
  {
    slotId: "banking-debit/cards/rewards-trap",
    conceptId: "credit-vs-debit",
    variants: [
      { variantId: "bdx-cd-rt-sc", step: { type: "scenario", question: "Thabo chases rewards points and lets R15 000 revolve on the card at 20%. What's the net result?", options: ["About R3 000 a year in interest", "He comes out ahead because rewards compound", "Rewards and interest cancel out exactly", "The bank waives interest for high spenders"], correct: 0, feedback: { correct: "Right. Rewards are typically 1–2% of spend; interest is 20% of the balance. The maths isn't close.", incorrect: "R15 000 at 20% is about R3 000 a year. No rewards programme pays that back." } } },
      { variantId: "bdx-cd-rt-mcq", step: { type: "mcq", question: "Credit card rewards are worth having when:", options: ["You settle in full every month", "You carry a balance but spend a lot", "You only use the card for cash withdrawals", "Your limit is high"], correct: 0, feedback: { correct: "Right. Rewards only count once interest is zero. Otherwise you're paying 20% to earn 1%.", incorrect: "Only when the balance is settled monthly. Carrying debt wipes out any reward value." } } },
      { variantId: "bdx-cd-rt-tf", step: { type: "true-false", statement: "Withdrawing cash on a credit card is treated the same as a purchase.", correct: false, feedback: { correct: "Right. Cash advances usually attract a fee and start accruing interest immediately, with no interest-free period.", incorrect: "Cash advances are worse: an upfront fee and interest from day one, with no grace period." } } },
    ],
  },
];

// ── Switching Banks ─────────────────────────────────────────────────────────
const switchSlots: QuestionSlot[] = [
  {
    slotId: "banking-debit/switch/fee-cost",
    conceptId: "bank-switching",
    variants: [
      { variantId: "bdx-sw-fc-sc", step: { type: "scenario", question: "Ayanda pays R185 a month in bank fees and moves to an account charging nothing. Over five years she saves:", options: ["R11 100", "R1 500", "R5 000", "R22 200"], correct: 0, feedback: { correct: "R185 × 60 months = R11 100. Invested at 10% along the way it's closer to R14 000.", incorrect: "R185 × 60 = R11 100 in fees avoided: before any investment growth on that money." } } },
      { variantId: "bdx-sw-fc-fill", step: { type: "fill-blank", title: "Annual fee saving", prompt: "You move from an account charging R185/month to one charging R35/month. Annual saving = R____.", correct: 1800, feedback: { correct: "R150 a month × 12 = R1 800 a year, for a switch you do once.", incorrect: "The difference is R150 a month, so R1 800 a year." } } },
      { variantId: "bdx-sw-fc-tf", step: { type: "true-false", statement: "Bank fees are small enough that switching accounts rarely makes a real difference.", correct: false, feedback: { correct: "Right. R185 a month is R2 220 a year, the same as a decent monthly grocery shop, gone to admin.", incorrect: "They add up. R185 a month is R2 220 a year, repeated for as long as you stay." } } },
    ],
  },
  {
    slotId: "banking-debit/switch/order-of-steps",
    conceptId: "bank-switching",
    variants: [
      { variantId: "bdx-sw-os-mcq", step: { type: "mcq", question: "What's the correct first step when switching banks?", options: ["Open the new account while the old one is still running", "Close the old account, then open the new one", "Cancel all debit orders first", "Tell your employer before you have new account details"], correct: 0, feedback: { correct: "Right. Overlap is what protects you. You need somewhere for stray payments to land while things migrate.", incorrect: "Open the new account first. Closing anything before the new one works invites missed payments." } } },
      { variantId: "bdx-sw-os-tf", step: { type: "true-false", statement: "You should cancel your old account the same day the new one opens.", correct: false, feedback: { correct: "Right. Debit orders and salary instructions take weeks to migrate. Keep both running for about two months.", incorrect: "Too fast. Keep the old account open around two months so nothing bounces mid-migration." } } },
      { variantId: "bdx-sw-os-sc", step: { type: "scenario", question: "Sipho closed his old account a week after opening the new one. What's the likely consequence?", options: ["Debit orders that hadn't migrated bounce, costing fees and possibly his credit record", "Nothing, banks transfer debit orders automatically", "His salary arrives twice", "His credit score improves"], correct: 0, feedback: { correct: "Right. Bounced debit orders attract fees from both the bank and the service provider, and missed payments can reach your credit record.", incorrect: "Debit orders don't move automatically. Anything still pointing at the closed account will bounce." } } },
    ],
  },
  {
    slotId: "banking-debit/switch/notify-employer",
    conceptId: "bank-switching",
    variants: [
      { variantId: "bdx-sw-ne-tf", step: { type: "true-false", statement: "You can switch banks without telling payroll, because salary payments follow you automatically.", correct: false, feedback: { correct: "Right. Payroll pays the account number on file. Update it in writing before the payroll cut-off date.", incorrect: "Salary doesn't follow you. Give payroll the new details before the monthly cut-off." } } },
      { variantId: "bdx-sw-ne-mcq", step: { type: "mcq", question: "When should you give payroll your new banking details?", options: ["Before the payroll cut-off for that month, in writing", "After the salary has bounced", "At the end of the tax year", "Only if the old account is closed"], correct: 0, feedback: { correct: "Right. Payroll cut-offs are usually mid-month, and a salary sent to a closed account can take weeks to recover.", incorrect: "Before the cut-off, in writing. Recovering a misdirected salary is slow and painful." } } },
      { variantId: "bdx-sw-ne-sc", step: { type: "scenario", question: "Besides payroll, which other payments most need updating when you switch?", options: ["Every debit order", "Only your gym membership", "Nothing else, debit orders follow the account holder", "Just your bond, since it's the largest"], correct: 0, feedback: { correct: "Right. Insurance and medical aid are the dangerous ones: a bounced premium can leave you uncovered exactly when you claim.", incorrect: "All of them, and insurance first. A lapsed policy is far worse than a bounced subscription." } } },
    ],
  },
  {
    slotId: "banking-debit/switch/overlap-period",
    conceptId: "bank-switching",
    variants: [
      { variantId: "bdx-sw-op-mcq", step: { type: "mcq", question: "How long should you keep the old account open after switching?", options: ["About two months, until every debit order has migrated", "One day", "One week", "At least a year"], correct: 0, feedback: { correct: "Right. Two months covers two full billing cycles, which is when stragglers show up.", incorrect: "Around two months. Debit orders take one to two billing cycles to fully migrate." } } },
      { variantId: "bdx-sw-op-tf", step: { type: "true-false", statement: "Keeping a small balance in the old account during the overlap prevents bounced payments.", correct: true, feedback: { correct: "Right. A modest buffer absorbs anything you forgot to move, and bounce fees cost more than the buffer.", incorrect: "It's true. A small float in the old account is cheap insurance against a missed migration." } } },
      { variantId: "bdx-sw-op-sc", step: { type: "scenario", question: "Two months in, one insurance premium is still hitting the old account. What now?", options: ["Update it with the insurer directly", "Close the account and let the insurer work it out", "Cancel the policy and start a new one", "Leave both accounts open indefinitely"], correct: 0, feedback: { correct: "Right. Update at the source, then verify it moved, closing the account first risks a lapsed policy.", incorrect: "Fix it with the insurer and confirm the switch landed. Never close the account while a premium still points at it." } } },
    ],
  },
];

// ── Overdrafts ──────────────────────────────────────────────────────────────
const odSlots: QuestionSlot[] = [
  {
    slotId: "banking-debit/overdraft/what-it-signals",
    conceptId: "overdraft",
    variants: [
      { variantId: "bdx-od-ws-mcq", step: { type: "mcq", question: "You dip into your R5 000 overdraft from the 20th of every month until payday. What does that pattern mean?", options: ["Your expenses exceed your income for part of every month", "You're managing cash flow well", "Your overdraft limit is too low", "Nothing. Everyone does this"], correct: 0, feedback: { correct: "Right. A permanent overdraft is a structural budget gap wearing a credit costume. A bigger limit just makes it more expensive.", incorrect: "It's a budget deficit, not a cash-flow technique. The fix is in the budget, not the credit limit." } } },
      { variantId: "bdx-od-ws-tf", step: { type: "true-false", statement: "An overdraft you never fully clear has effectively become a permanent loan.", correct: true, feedback: { correct: "Right, and one at 18–22% with daily interest, quietly costing you every month.", incorrect: "It's true. A balance that never returns to zero is a long-term loan at short-term rates." } } },
      { variantId: "bdx-od-ws-sc", step: { type: "scenario", question: "Nomsa's overdraft is R8 000 deep every month and the bank offers to raise the limit to R15 000. Best response?", options: ["Decline and fix the budget gap that keeps her in overdraft", "Accept. More headroom means more safety", "Accept and use it for an emergency fund", "Accept and switch to a credit card instead"], correct: 0, feedback: { correct: "Right. A larger limit deepens the hole rather than closing it. Find the R8 000 gap in the budget instead.", incorrect: "A bigger limit doesn't fix a deficit, it funds it: at 18–22% interest." } } },
    ],
  },
  {
    slotId: "banking-debit/overdraft/cost",
    conceptId: "overdraft",
    variants: [
      { variantId: "bdx-od-co-fill", step: { type: "fill-blank", title: "Overdraft interest", prompt: "You sit R8 000 into your overdraft for 30 days at 19% a year. Interest ≈ R8 000 × 0.19 ÷ 365 × 30 = R____ (nearest rand).", correct: 125, feedback: { correct: "About R125 for the month. Repeat that monthly and it's roughly R1 500 a year for money you never really had.", incorrect: "R8 000 × 0.19 ÷ 365 × 30 ≈ R125 for the month." } } },
      { variantId: "bdx-od-co-mcq", step: { type: "mcq", question: "How does overdraft interest accrue?", options: ["Daily, on whatever balance is outstanding that day", "Monthly, on the opening balance", "Annually, at year-end", "Only if you stay overdrawn for a full month"], correct: 0, feedback: { correct: "Right. Daily accrual means even a few days in overdraft each month adds up quietly over a year.", incorrect: "It's daily. That's why short, repeated dips still cost real money." } } },
      { variantId: "bdx-od-co-tf", step: { type: "true-false", statement: "Overdraft interest rates are typically much lower than credit card rates.", correct: false, feedback: { correct: "Right. Overdrafts usually price at prime plus 5–8%, which lands in the same 18–22% range as cards.", incorrect: "They're broadly similar, often 18–22%, and the interest compounds daily." } } },
    ],
  },
  {
    slotId: "banking-debit/overdraft/facility-fees",
    conceptId: "overdraft",
    variants: [
      { variantId: "bdx-od-ff-mcq", step: { type: "mcq", question: "Besides interest, what else does an overdraft usually cost?", options: ["A monthly or annual facility fee, whether or not you use it", "Nothing. Interest is the only charge", "A charge only when you repay it", "A fee paid by the merchant"], correct: 0, feedback: { correct: "Right. Many facilities carry a service or availability fee even at a zero balance, so an unused overdraft still costs you.", incorrect: "Facility fees are common and often charged whether you draw on it or not." } } },
      { variantId: "bdx-od-ff-tf", step: { type: "true-false", statement: "An overdraft facility you never use is always free.", correct: false, feedback: { correct: "Right. Check your statement. Availability fees are easy to miss and run every month.", incorrect: "Not always. Many overdrafts carry a standing facility fee regardless of use." } } },
      { variantId: "bdx-od-ff-sc", step: { type: "scenario", question: "Johan hasn't used his overdraft in a year but sees a small monthly fee on the statement. Reasonable action?", options: ["Ask the bank to cancel the facility if he genuinely doesn't need it", "Ignore it. The fee is unavoidable", "Use the overdraft so the fee feels worthwhile", "Switch to a credit card with a higher limit"], correct: 0, feedback: { correct: "Right. If it isn't your emergency plan, cancel it, and if it is, know exactly what the standby costs.", incorrect: "Cancel the facility or accept it as the cost of standby credit. Using it to justify the fee is backwards." } } },
    ],
  },
  {
    slotId: "banking-debit/overdraft/legit-use",
    conceptId: "overdraft",
    variants: [
      { variantId: "bdx-od-lu-mcq", step: { type: "mcq", question: "Which is a defensible short-term use of an overdraft?", options: ["Covering a genuine one-off emergency for a few days before payday", "Funding your normal monthly shortfall", "Paying for a holiday", "Topping up a savings account"], correct: 0, feedback: { correct: "Right. Brief, one-off, and cleared immediately. Anything recurring is a budget problem wearing a different label.", incorrect: "One-off and short is defensible. Recurring use, holidays and 'saving' with borrowed money are not." } } },
      { variantId: "bdx-od-lu-tf", step: { type: "true-false", statement: "Business owners sometimes use an overdraft legitimately to bridge the gap between paying suppliers and being paid by customers.", correct: true, feedback: { correct: "Right. That's a genuine working-capital use. Provided the invoices really do get collected.", incorrect: "It's true. Bridging a known collection cycle is a legitimate business use, unlike funding a permanent deficit." } } },
      { variantId: "bdx-od-lu-sc", step: { type: "scenario", question: "You've used your overdraft for a real emergency. What's the right next move?", options: ["Clear it as the first priority next payday", "Pay the minimum and leave the rest", "Increase the limit for next time", "Move the balance to a credit card"], correct: 0, feedback: { correct: "Right. Daily interest means every extra week costs you. Treat it as the most urgent line in next month's budget.", incorrect: "Clear it first. Letting an emergency overdraft linger is how it turns into a permanent one." } } },
    ],
  },
];

// ── Foreign Currency and International Transfers ────────────────────────────
const fxSlots: QuestionSlot[] = [
  {
    slotId: "banking-debit/forex/hidden-margin",
    conceptId: "forex-transfers",
    variants: [
      { variantId: "bdx-fx-hm-mcq", step: { type: "mcq", question: "Where does most of the cost of a bank's foreign exchange service hide?", options: ["In the exchange rate margin, not the advertised fee", "In the transfer fee, which is always disclosed", "In SARS taxes on the transfer", "In the recipient bank's charges only"], correct: 0, feedback: { correct: "Right. A 3% margin on R10 000 is R300 you never see itemised, usually more than the visible fee.", incorrect: "The margin on the exchange rate is the real cost. The flat fee is often the smaller half." } } },
      { variantId: "bdx-fx-hm-tf", step: { type: "true-false", statement: "A transfer advertised as 'zero fees' can still be expensive.", correct: true, feedback: { correct: "Right. Zero fee plus a 4% rate margin costs more than a R150 fee at near mid-market rates.", incorrect: "It's true. Compare the rand amount that actually arrives, not the fee headline." } } },
      { variantId: "bdx-fx-hm-sc", step: { type: "scenario", question: "You want to compare two providers honestly. What should you compare?", options: ["How much foreign currency actually lands in the recipient's account", "The advertised transfer fee alone", "Which one has the nicer app", "The mid-market rate on the day"], correct: 0, feedback: { correct: "Right. The amount received is the only number that includes both the fee and the rate margin.", incorrect: "Compare the amount received. Fees and rate margins only matter through their effect on that number." } } },
    ],
  },
  {
    slotId: "banking-debit/forex/cheapest-abroad",
    conceptId: "forex-transfers",
    variants: [
      { variantId: "bdx-fx-ca-mcq", step: { type: "mcq", question: "Which is usually the most expensive way to get foreign currency for a trip?", options: ["An airport exchange bureau", "A travel-optimised card", "A specialist transfer service", "Drawing cash from an ATM at your destination with a low-margin card"], correct: 0, feedback: { correct: "Right. Airport bureaux charge some of the widest margins in the market, because they're selling convenience under time pressure.", incorrect: "Airport bureaux are the worst value. Their margins dwarf what cards and transfer services charge." } } },
      { variantId: "bdx-fx-ca-tf", step: { type: "true-false", statement: "Carrying large amounts of rand cash to change abroad is usually the cheapest option.", correct: false, feedback: { correct: "Right. You pay a wide margin at the counter and carry the theft risk on top.", incorrect: "It's usually the most expensive and the riskiest. A low-margin card beats cash almost everywhere." } } },
      { variantId: "bdx-fx-ca-sc", step: { type: "scenario", question: "Priya is going to Thailand for two weeks. What's the sensible setup?", options: ["A low-margin travel card, plus a small amount of local cash for arrival", "All her spending money in rand cash", "One high-fee bank card only", "Exchange everything at the airport before departure"], correct: 0, feedback: { correct: "Right. The card handles most spending near mid-market rates, and a little cash covers the taxi before she finds an ATM.", incorrect: "Card first, small cash buffer second. Airport exchange and rand cash are the expensive options." } } },
    ],
  },
  {
    slotId: "banking-debit/forex/sda-limit",
    conceptId: "forex-transfers",
    variants: [
      { variantId: "bdx-fx-sd-tf", step: { type: "true-false", statement: "South Africans need SARS tax clearance before sending any money offshore, even R10 000.", correct: false, feedback: { correct: "Right. The Single Discretionary Allowance covers up to R2 million per calendar year with no SARS clearance needed.", incorrect: "The SDA allows up to R2 million a year without clearance. Only larger transfers need SARS approval." } } },
      { variantId: "bdx-fx-sd-mcq", step: { type: "mcq", question: "An adult South African wants to move R6 million offshore this year. What's required?", options: ["The R2m Single Discretionary Allowance, plus SARS approval under the R10m Foreign Investment Allowance for the rest", "Nothing. Any amount is allowed", "SARB approval for the full amount", "It isn't permitted at all"], correct: 0, feedback: { correct: "Right. R2 million goes without clearance; the remaining R4 million needs a SARS approval under the R10 million FIA.", incorrect: "The SDA covers R2m clearance-free; anything beyond that runs through the FIA, which needs SARS approval." } } },
      { variantId: "bdx-fx-sd-sc", step: { type: "scenario", question: "Both allowances run on the calendar year rather than the tax year. Why does that matter?", options: ["Unused allowance doesn't roll over, it resets each January", "It changes the exchange rate you receive", "It affects your PAYE", "It means transfers are only allowed in December"], correct: 0, feedback: { correct: "Right. If offshore transfers are part of your plan, use-it-or-lose-it timing is worth diarising.", incorrect: "The point is the reset date: unused allowance expires at the end of December, not February." } } },
    ],
  },
  {
    slotId: "banking-debit/forex/compare-providers",
    conceptId: "forex-transfers",
    variants: [
      { variantId: "bdx-fx-cp-sc", step: { type: "scenario", question: "You send R50 000 to family in the UK. Your bank charges R150 plus a 3.5% margin; a specialist charges R120 plus 0.4%. What do you save by comparing?", options: ["About R1 580", "About R800", "About R2 500", "About R300"], correct: 0, feedback: { correct: "Bank: R150 + R1 750 = R1 900. Specialist: R120 + R200 = R320. The R1 580 difference is one comparison away.", incorrect: "Bank total R1 900 against R320. That's R1 580 saved for a few minutes of checking." } } },
      { variantId: "bdx-fx-cp-fill", step: { type: "fill-blank", title: "The margin cost", prompt: "You convert R40 000 at a 3.5% margin above the mid-market rate. The margin costs you R____.", correct: 1400, feedback: { correct: "R40 000 × 3.5% = R1 400, invisible unless you compare against the mid-market rate.", incorrect: "R40 000 × 3.5% = R1 400: the hidden part of the price." } } },
      { variantId: "bdx-fx-cp-mcq", step: { type: "mcq", question: "How often should you compare providers for international transfers?", options: ["Every time, margins and fees differ by provider and by corridor", "Once, then stay loyal", "Only for amounts over R1 million", "Never. They're all regulated to the same price"], correct: 0, feedback: { correct: "Right. Pricing varies by destination and by amount, so the best option for the UK may not be best for Kenya.", incorrect: "Every time. There's no fixed pricing, and the gap on a large transfer can be thousands of rands." } } },
    ],
  },
];

export const BANKING_DEBIT_EXTRA_BANKS: Record<string, LessonBank> = {
  "banking-debit::lesson-savings-accounts-sa": {
    layout: L(saveSlots, "Rate Shopping Pays", "<p>SA savings rates vary widely between banks and products, and the gap compounds. Notice accounts pay more than call accounts because you give up instant access. Interest is <strong>tax-free only up to R23 800 a year</strong> (R34 500 from 65). A TFSA removes the tax entirely. Deposits are covered to <strong>R100 000 per bank</strong> by CODI.</p>"),
    slots: saveSlots,
  },
  "banking-debit::lesson-credit-vs-debit-cards": {
    layout: L(cardSlots, "Two Very Different Cards", "<p>A <strong>debit card</strong> spends money you have. A <strong>credit card</strong> spends the bank's, at 20%+ if you carry a balance, but gives stronger chargeback protection and rewards if you settle in full every month. Settled monthly it's a free tool; carried, it's one of the most expensive debts you can hold. Cash advances have no interest-free period at all.</p>"),
    slots: cardSlots,
  },
  "banking-debit::lesson-bank-switching": {
    layout: L(switchSlots, "Switching Without Breaking Anything", "<p>Staying loyal to an expensive account costs real money. R185 a month is R2 220 a year. Switch in this order: <strong>open the new account first</strong>, give payroll the new details before the cut-off, move every debit order (insurance first), keep the old account open about <strong>two months</strong> with a small buffer, then close it.</p>"),
    slots: switchSlots,
  },
  "banking-debit::lesson-overdraft": {
    layout: L(odSlots, "Tool or Trap?", "<p>An overdraft lets you spend past zero at roughly <strong>prime + 5–8%</strong>, with interest accruing <strong>daily</strong>, similar to or worse than a credit card. Many facilities also charge a fee whether you use them or not. Reaching for it every month is a budget deficit, not cash-flow management, and a bigger limit only makes it more expensive.</p>"),
    slots: odSlots,
  },
  "banking-debit::lesson-international-transfers": {
    layout: L(fxSlots, "The Cost You Can't See", "<p>The real cost of moving money abroad hides in the <strong>exchange rate margin</strong> (2–4% at most banks), not the advertised fee. Compare the amount that actually arrives. Your <strong>Single Discretionary Allowance is R2 million per calendar year</strong> with no SARS clearance; beyond that the Foreign Investment Allowance permits up to R10 million with SARS approval. Both reset in January.</p>"),
    slots: fxSlots,
  },
};
