import type { LessonLayoutItem, QuestionSlot } from "@/data/content";
import type { LessonBank } from "./money-basics";

/**
 * Premium banks for the Business Finance EXTRA lessons.
 *
 * Verified positions used here:
 *  - SEFA, SEDA and the CBDA merged into SEDFA (Small Enterprise Development
 *    and Finance Agency) on 1 October 2024; the old entities were dissolved in
 *    December 2024. Use SEDFA, not "SEFA" or "SEDA".
 *  - The NEF (National Empowerment Fund) has a B-BBEE mandate; SEDFA's SMME
 *    mandate is broader. Don't conflate them.
 *  - VAT registration compulsory above R1 000 000 turnover; company tax 27%;
 *    provisional tax if non-salary income exceeds R30 000 (SA-REGULATORY-FIGURES.md).
 *  - CIPC company registration is online, inexpensive and takes days, not months.
 *  - SBC tax brackets are flagged unverified in the figures doc — describe SBC as
 *    "reduced graduated rates" and never quote the bracket values.
 * variantId prefix: `bfx-`.
 */
const info = (title: string, content: string): LessonLayoutItem => ({ type: "info", title, content });
const L = (slots: QuestionSlot[], title: string, content: string): LessonLayoutItem[] => [
  info(title, content),
  ...slots.map((s) => ({ slot: s.slotId })),
];

// ── Business Cash Flow Management ───────────────────────────────────────────
const cfSlots: QuestionSlot[] = [
  {
    slotId: "business-finance/cash-flow/profit-vs-cash",
    conceptId: "cash-flow-vs-profit",
    variants: [
      { variantId: "bfx-cf-pc-mcq", step: { type: "mcq", question: "A business shows a profit on its income statement but can't pay salaries this month. What is that?", options: ["A cash flow problem. Profit is recorded when invoiced, not when paid", "An accounting error", "Tax fraud", "Proof the business is failing"], correct: 0, feedback: { correct: "Right. Profit is an accounting measure; cash is what pays wages. Profitable businesses fail from cash shortages regularly.", incorrect: "It's a cash flow problem. Revenue is recognised on invoice, but the money arrives weeks later." } } },
      { variantId: "bfx-cf-pc-tf", step: { type: "true-false", statement: "A profitable business can run out of money and close.", correct: true, feedback: { correct: "Right, and it's one of the most common ways small businesses fail. Growth often makes it worse, not better.", incorrect: "It's true. Profit on paper doesn't pay suppliers; only cash in the account does." } } },
      { variantId: "bfx-cf-pc-sc", step: { type: "scenario", question: "Your consulting business invoices R180 000 in March but clients pay 45 days later. Salaries of R60 000 are due on 28 March. What's the situation?", options: ["A timing gap. The work is profitable but the cash arrives after the salaries are due", "The business is unprofitable", "The clients are defaulting", "The salaries should be delayed"], correct: 0, feedback: { correct: "Right. The fix is structural: deposits upfront, shorter terms, or a facility sized to bridge the gap.", incorrect: "It's a timing gap, not a profitability problem. Change the terms or bridge the gap deliberately." } } },
    ],
  },
  {
    slotId: "business-finance/cash-flow/deposits",
    conceptId: "cash-flow-vs-profit",
    variants: [
      { variantId: "bfx-cf-dp-tf", step: { type: "true-false", statement: "Asking clients for a 50% deposit before starting work is unprofessional.", correct: false, feedback: { correct: "Right. It's standard practice across most industries, and it's one of the cheapest ways to fund your own working capital.", incorrect: "It's entirely normal. Deposits protect you and reduce the financing you'd otherwise need." } } },
      { variantId: "bfx-cf-dp-mcq", step: { type: "mcq", question: "Why does an upfront deposit help a small business so much?", options: ["It funds the work without borrowing, and filters out clients who can't pay", "It increases the total price", "It avoids VAT", "It removes the need for a contract"], correct: 0, feedback: { correct: "Right, and the filtering matters as much as the cash. A client who won't pay a deposit often won't pay the invoice either.", incorrect: "It funds the work and screens clients. It doesn't change your price or your tax position." } } },
      { variantId: "bfx-cf-dp-sc", step: { type: "scenario", question: "Lerato's clients always pay late and she's constantly short of cash. What's the structural fix?", options: ["Change her terms", "Take a loan each month", "Work more hours", "Raise her prices only"], correct: 0, feedback: { correct: "Right. She's effectively lending her clients money interest-free every month: new terms fix the cause, not the symptom.", incorrect: "Fix the terms. Borrowing to cover a structural timing gap adds cost without solving anything." } } },
    ],
  },
  {
    slotId: "business-finance/cash-flow/forecast",
    conceptId: "cash-flow-vs-profit",
    variants: [
      { variantId: "bfx-cf-fc-mcq", step: { type: "mcq", question: "What does a rolling cash flow forecast actually tell you?", options: ["Which specific weeks you'll be short, far enough ahead to do something about it", "Your annual profit", "Your tax liability", "The value of your business"], correct: 0, feedback: { correct: "Right, and even a simple 13-week sheet gives you weeks of warning instead of a surprise on payday.", incorrect: "It shows when cash runs short. Profit, tax and valuation are separate questions." } } },
      { variantId: "bfx-cf-fc-tf", step: { type: "true-false", statement: "A simple weekly cash forecast is more useful to a small business than a detailed annual budget.", correct: true, feedback: { correct: "Right. Businesses die from a bad week, not a bad year. The weekly view is where the risk actually lives.", incorrect: "It's true for cash management. Annual budgets miss the timing that determines survival." } } },
      { variantId: "bfx-cf-fc-sc", step: { type: "scenario", question: "Thabo's forecast shows he'll be R40 000 short in six weeks. What are his options while he still has time?", options: ["Chase debtors, negotiate supplier terms, or arrange a facility before he needs it", "Wait and see", "Stop invoicing", "Take a personal loan on the day"], correct: 0, feedback: { correct: "Right, and arranging credit before you're desperate gets far better terms than arranging it the week you run out.", incorrect: "Act on all three fronts now. The whole value of the forecast is the time it buys." } } },
    ],
  },
  {
    slotId: "business-finance/cash-flow/growth-trap",
    conceptId: "cash-flow-vs-profit",
    variants: [
      { variantId: "bfx-cf-gt-mcq", step: { type: "mcq", question: "Why can rapid growth create a cash crisis?", options: ["You pay for stock, staff and materials before customers pay you", "Growth reduces profit margins", "Tax rises immediately", "Banks withdraw facilities"], correct: 0, feedback: { correct: "Right. Every new order consumes cash before it produces any, which is why fast-growing businesses fail.", incorrect: "It's the working capital cycle. Costs come first, revenue arrives later, and growth widens the gap." } } },
      { variantId: "bfx-cf-gt-tf", step: { type: "true-false", statement: "Taking on a very large order can be dangerous for a small business without the cash to fund it.", correct: true, feedback: { correct: "Right. Businesses have gone under fulfilling the biggest order they ever won.", incorrect: "It's true. A big order that needs funding up front can break a business that can't finance it." } } },
      { variantId: "bfx-cf-gt-sc", step: { type: "scenario", question: "Nomsa is offered an order triple her usual size, payable 60 days after delivery. What should she check first?", options: ["Whether she can fund the materials and labour for 60 days without running out", "Whether the client is friendly", "Whether it will impress other clients", "Whether she can raise her price"], correct: 0, feedback: { correct: "Right. If she can't fund the gap, the honest answers are a deposit, staged delivery, or declining it.", incorrect: "Funding the gap comes first. A profitable order she can't finance can still close the business." } } },
    ],
  },
];

// ── Invoicing and Managing Debtors ──────────────────────────────────────────
const invSlots: QuestionSlot[] = [
  {
    slotId: "business-finance/invoicing/terms",
    conceptId: "invoicing-debtors",
    variants: [
      { variantId: "bfx-in-tm-mcq", step: { type: "mcq", question: "Which payment term is most cash-flow-friendly for a small SA business?", options: ["Payment due on invoice, or a deposit plus balance on completion", "30 days from statement", "60 days from invoice", "90 days end of month"], correct: 0, feedback: { correct: "Right. Every extra day is a day you're financing your client's business for free.", incorrect: "The shortest terms you can negotiate. Longer terms mean you fund their operations instead of your own." } } },
      { variantId: "bfx-in-tm-tf", step: { type: "true-false", statement: "'30 days from statement' can mean payment arrives nearly two months after the work.", correct: true, feedback: { correct: "Right. Work done on the 1st goes on the month-end statement, then 30 days more. That's 60 days of financing.", incorrect: "It's true, and it's why the phrasing of your terms matters as much as the number." } } },
      { variantId: "bfx-in-tm-sc", step: { type: "scenario", question: "Sipho's terms say 30 days but clients routinely pay at 60. What's the first thing to change?", options: ["Invoice immediately on completion and follow up before the due date, not after", "Accept it as normal", "Raise prices to compensate", "Stop working with all of them"], correct: 0, feedback: { correct: "Right. Late invoicing and passive follow-up are the two most common causes, a call two days before the due date changes behaviour.", incorrect: "Tighten the process first. Most late payment is caused by slow invoicing and no follow-up." } } },
    ],
  },
  {
    slotId: "business-finance/invoicing/interest",
    conceptId: "invoicing-debtors",
    variants: [
      { variantId: "bfx-in-it-tf", step: { type: "true-false", statement: "Charging interest on overdue invoices is illegal in South Africa.", correct: false, feedback: { correct: "Right. It's lawful when your agreed terms provide for it, which is why the terms need to be in the contract before the work starts.", incorrect: "It's legal if your terms provide for it. Get it into the agreement upfront." } } },
      { variantId: "bfx-in-it-fill", step: { type: "fill-blank", title: "Overdue interest", prompt: "A client owes R50 000 and is 30 days overdue. Your terms state 2% per month on overdue amounts. The interest charge = R____.", correct: 1000, feedback: { correct: "R50 000 × 2% = R1 000 for the month. Its main value is as a deterrent, not as income.", incorrect: "R50 000 × 2% = R1 000." } } },
      { variantId: "bfx-in-it-mcq", step: { type: "mcq", question: "What makes an interest clause enforceable?", options: ["It must be in the agreed terms before the work is done", "Adding it to the invoice afterwards", "Verbal agreement at handover", "Nothing. It's automatic"], correct: 0, feedback: { correct: "Right. A clause introduced after the fact isn't part of the contract the client agreed to.", incorrect: "It has to be agreed in advance. Adding it to an overdue invoice doesn't create the obligation." } } },
    ],
  },
  {
    slotId: "business-finance/invoicing/follow-up",
    conceptId: "invoicing-debtors",
    variants: [
      { variantId: "bfx-in-fu-mcq", step: { type: "mcq", question: "What's the most effective debtor management habit?", options: ["A consistent follow-up schedule starting before the due date", "Waiting until 90 days and then escalating", "Only chasing large invoices", "Assuming clients will pay eventually"], correct: 0, feedback: { correct: "Right. Businesses that chase consistently get paid first, and clients pay whoever is asking.", incorrect: "Consistent early follow-up. The longer you wait, the further down the client's payment queue you fall." } } },
      { variantId: "bfx-in-fu-tf", step: { type: "true-false", statement: "The older a debt gets, the less likely it is to be paid in full.", correct: true, feedback: { correct: "Right. Recovery rates fall sharply with age, which is why early follow-up beats late escalation.", incorrect: "It's true and well documented. Old debt is materially harder to collect." } } },
      { variantId: "bfx-in-fu-sc", step: { type: "scenario", question: "A good client is 45 days late and Ayesha doesn't want to damage the relationship. What's the professional approach?", options: ["A friendly, direct call referencing the agreed terms and asking for a payment date", "Say nothing and hope", "Send a legal letter immediately", "Stop all work without notice"], correct: 0, feedback: { correct: "Right. Asking for a specific date is both professional and effective, and good clients aren't offended by it.", incorrect: "A direct, friendly request for a date. Silence and legal letters are the two extremes, and both cost more." } } },
    ],
  },
  {
    slotId: "business-finance/invoicing/concentration",
    conceptId: "invoicing-debtors",
    variants: [
      { variantId: "bfx-in-cn-mcq", step: { type: "mcq", question: "What's the risk when one client makes up most of your revenue?", options: ["Losing them, or their late payment, threatens the whole business", "You pay more tax", "Your margins fall", "Nothing. Big clients are safer"], correct: 0, feedback: { correct: "Right, and it also weakens your negotiating position on terms and price, because you can't afford to push back.", incorrect: "It's concentration risk. One client's decision or cash flow becomes your business's fate." } } },
      { variantId: "bfx-in-cn-tf", step: { type: "true-false", statement: "Depending on one client for most of your income weakens your ability to negotiate terms.", correct: true, feedback: { correct: "Right. When you can't afford to lose them, you accept whatever terms they set.", incorrect: "It's true. Dependence removes your leverage on both price and payment terms." } } },
      { variantId: "bfx-in-cn-sc", step: { type: "scenario", question: "Johan earns 70% of revenue from one client who has started paying late. What's the priority?", options: ["Actively develop other clients while managing the relationship carefully", "Confront them and risk the relationship", "Accept the late payments indefinitely", "Take a loan to cover the gap"], correct: 0, feedback: { correct: "Right. Diversifying revenue is what eventually gives him the freedom to enforce his terms.", incorrect: "Build other revenue. Until he does, he has no real leverage and borrowing just delays the problem." } } },
    ],
  },
];

// ── Business Bank Accounts in SA ────────────────────────────────────────────
const bankSlots: QuestionSlot[] = [
  {
    slotId: "business-finance/bank-accounts/separation",
    conceptId: "business-separation",
    variants: [
      { variantId: "bfx-bk-sp-tf", step: { type: "true-false", statement: "A sole proprietor is legally required to open a separate business bank account.", correct: false, feedback: { correct: "Right, not legally required, but strongly advisable: it makes tax, bookkeeping and any SARS query dramatically simpler.", incorrect: "Not a legal requirement for a sole proprietor, though it's close to essential in practice. A company <em>must</em> have its own account." } } },
      { variantId: "bfx-bk-sp-mcq", step: { type: "mcq", question: "Why does separating business and personal money matter even when it isn't compulsory?", options: ["It makes tax, bookkeeping and SARS verification straightforward, and shows real profitability", "Banks require it", "It reduces your tax rate", "It increases your credit limit"], correct: 0, feedback: { correct: "Right. Untangling mixed accounts at year-end costs far more in accounting fees than the account fee ever does.", incorrect: "Clarity for tax and records. It doesn't change your tax rate, but it changes how easily you can prove anything." } } },
      { variantId: "bfx-bk-sp-sc", step: { type: "scenario", question: "Priya runs everything through her personal account and SARS queries her return. What's the problem?", options: ["She must reconstruct which transactions were business", "Nothing, SARS accepts personal accounts", "She'll be fined immediately", "Her bank will close the account"], correct: 0, feedback: { correct: "Right. Without a clear separation, disallowed deductions become likely and the accounting bill grows.", incorrect: "The burden of proof is hers, and reconstructing mixed accounts is exactly where deductions get disallowed." } } },
    ],
  },
  {
    slotId: "business-finance/bank-accounts/choosing",
    conceptId: "business-separation",
    variants: [
      { variantId: "bfx-bk-ch-mcq", step: { type: "mcq", question: "What should drive your choice of business bank account?", options: ["Your actual transaction pattern measured against each bank's fee structure", "Whichever bank advertises most", "The bank your friend uses", "The one with the largest branch network"], correct: 0, feedback: { correct: "Right. A business doing many small deposits pays very differently from one doing a few large EFTs.", incorrect: "Match the fee structure to how you actually transact. Advertising and branch networks tell you nothing about cost." } } },
      { variantId: "bfx-bk-ch-tf", step: { type: "true-false", statement: "Business account fees vary enough between SA banks that comparing them is worth the effort.", correct: true, feedback: { correct: "Right. On a small business the difference easily runs to thousands of rands a year.", incorrect: "It's true. Fee structures differ substantially, and the gap compounds over years." } } },
      { variantId: "bfx-bk-ch-sc", step: { type: "scenario", question: "Sipho's business does around 200 small card transactions a month. What matters most in his account choice?", options: ["Per-transaction and card acquiring costs", "The monthly fee alone", "The overdraft limit", "The branch location"], correct: 0, feedback: { correct: "Right. At 200 transactions, a few rands each dwarfs any monthly fee difference.", incorrect: "Transaction and acquiring costs. On that volume they're the dominant expense." } } },
    ],
  },
  {
    slotId: "business-finance/bank-accounts/tax-admin",
    conceptId: "vat-threshold",
    variants: [
      { variantId: "bfx-bk-ta-mcq", step: { type: "mcq", question: "At what annual turnover does VAT registration become compulsory in SA?", options: ["R1 000 000", "R100 000", "R500 000", "R5 000 000"], correct: 0, feedback: { correct: "Right, and you can register voluntarily below that. Worth it if your clients are VAT-registered businesses.", incorrect: "R1 million in any 12-month period. Voluntary registration is available below that threshold." } } },
      { variantId: "bfx-bk-ta-tf", step: { type: "true-false", statement: "If you earn more than R30 000 a year in non-salary income, you're a provisional taxpayer.", correct: true, feedback: { correct: "Right. Two estimates a year, in August and February. Missing them attracts penalties and interest.", incorrect: "It's true. Above R30 000 of non-salary income you must register for provisional tax." } } },
      { variantId: "bfx-bk-ta-sc", step: { type: "scenario", question: "Nomsa's business turnover is approaching R1 million. What should she plan for?", options: ["VAT registration, including pricing, invoicing and filing changes", "Nothing until SARS contacts her", "Closing the business", "Splitting it into two entities"], correct: 0, feedback: { correct: "Right. Registration is compulsory once she crosses the threshold, and splitting the business to avoid it is a scheme SARS looks for.", incorrect: "Plan for VAT registration. It's compulsory above R1 million, and artificial splitting is treated as avoidance." } } },
    ],
  },
  {
    slotId: "business-finance/bank-accounts/records",
    conceptId: "financial-statements",
    variants: [
      { variantId: "bfx-bk-rc-mcq", step: { type: "mcq", question: "What's the minimum bookkeeping a small business needs?", options: ["Every transaction recorded and categorised", "An annual summary at tax time", "Bank statements only", "Nothing until you're audited"], correct: 0, feedback: { correct: "Right. It's also the only way to know whether you're actually making money before year-end tells you.", incorrect: "Contemporaneous, categorised records with documents. Reconstructing at year-end is expensive and error-prone." } } },
      { variantId: "bfx-bk-rc-tf", step: { type: "true-false", statement: "SARS can require supporting documents for business deductions years after the return was filed.", correct: true, feedback: { correct: "Right. Keep records for at least five years. Undocumented deductions get disallowed with interest.", incorrect: "It's true. Keep everything for five years; the burden of proof is on you." } } },
      { variantId: "bfx-bk-rc-sc", step: { type: "scenario", question: "Thabo does his books once a year, the week before filing. What's the cost of that approach?", options: ["He can't see problems in time to fix them, and rushed records mean missed deductions", "Nothing. It saves time", "Only a slightly higher accounting fee", "SARS will fine him automatically"], correct: 0, feedback: { correct: "Right. Monthly bookkeeping is management information; annual bookkeeping is just a compliance scramble.", incorrect: "He loses both visibility and deductions. Books are for running the business, not only for SARS." } } },
    ],
  },
];

// ── CIPC Registration and Business Structures ───────────────────────────────
const cipcSlots: QuestionSlot[] = [
  {
    slotId: "business-finance/cipc/limited-liability",
    conceptId: "company-structures",
    variants: [
      { variantId: "bfx-cp-ll-mcq", step: { type: "mcq", question: "How does a private company (Pty Ltd) protect you?", options: ["It's a separate legal person", "It exempts you from tax", "It guarantees your income", "It removes the need for insurance"], correct: 0, feedback: { correct: "Right. Separate legal personality. The large exception is any debt you've personally signed surety for.", incorrect: "Separate legal personality limits your liability for company debts. It has no effect on tax exemption or insurance needs." } } },
      { variantId: "bfx-cp-ll-sc", step: { type: "scenario", question: "You register a Pty Ltd, take a R500 000 business loan and sign personal surety. The business fails. Is your house at risk?", options: ["Yes. The surety makes you personally liable despite the company structure", "No, the company protects you completely", "Only if the loan exceeds R1 million", "Only if you're the sole director"], correct: 0, feedback: { correct: "Right, and banks almost always require director surety for small business lending, which is why limited liability is thinner in practice than it sounds.", incorrect: "The surety overrides the company's protection. That's precisely what the bank asked for it to do." } } },
      { variantId: "bfx-cp-ll-tf", step: { type: "true-false", statement: "Personal surety on a business loan cancels out much of a company's limited liability protection.", correct: true, feedback: { correct: "Right. Read what you're signing. The surety is the whole point of the bank's request.", incorrect: "It's true. Surety makes you personally liable for that debt regardless of the company structure." } } },
    ],
  },
  {
    slotId: "business-finance/cipc/registration",
    conceptId: "company-structures",
    variants: [
      { variantId: "bfx-cp-rg-tf", step: { type: "true-false", statement: "Registering a company at CIPC takes months and requires a lawyer.", correct: false, feedback: { correct: "Right. It's an online process, inexpensive, and typically completed in days: no lawyer needed for a standard registration.", incorrect: "It's fast, cheap and online. Lawyers are only needed for non-standard structures or shareholder agreements." } } },
      { variantId: "bfx-cp-rg-mcq", step: { type: "mcq", question: "What ongoing obligation comes with a registered company?", options: ["Annual returns to CIPC and annual financial statements, plus company tax filings", "Nothing after registration", "Monthly CIPC reports", "A physical office inspection"], correct: 0, feedback: { correct: "Right, and failing to file annual returns can lead to deregistration, which is a genuine problem to unwind.", incorrect: "Annual CIPC returns, financial statements and tax filings. Ignoring them risks deregistration." } } },
      { variantId: "bfx-cp-rg-sc", step: { type: "scenario", question: "Ayesha is a freelancer earning R300 000 a year. Should she register a company?", options: ["Not necessarily. A sole proprietorship may be simpler and cheaper at that level", "Yes, always register a company", "Yes, to avoid all tax", "No, companies are only for large businesses"], correct: 0, feedback: { correct: "Right. Companies add compliance cost and only make sense when liability, tax structure or clients require it.", incorrect: "It depends. A company adds real compliance cost, and at her level a sole proprietorship is often the better fit." } } },
    ],
  },
  {
    slotId: "business-finance/cipc/structures",
    conceptId: "company-structures",
    variants: [
      { variantId: "bfx-cp-st-mcq", step: { type: "mcq", question: "How is a sole proprietor taxed compared with a company?", options: ["Business profit is added to the owner's personal income and taxed at their marginal rate", "At a flat 27%", "It isn't taxed", "At 15%"], correct: 0, feedback: { correct: "Right, whereas a company pays tax at 27% on its profits and the owner is taxed again on dividends or salary.", incorrect: "It's taxed in the owner's own hands at their marginal rate. Companies pay 27% at entity level." } } },
      { variantId: "bfx-cp-st-tf", step: { type: "true-false", statement: "Small Business Corporations qualify for reduced graduated tax rates rather than the flat company rate.", correct: true, feedback: { correct: "Right, subject to qualifying conditions including a turnover limit, worth checking the current brackets with an accountant.", incorrect: "It's true. Qualifying SBCs get reduced graduated rates instead of the standard 27%." } } },
      { variantId: "bfx-cp-st-sc", step: { type: "scenario", question: "Johan is deciding between a sole proprietorship and a Pty Ltd. What should drive the decision?", options: ["Liability exposure, client requirements, and the tax comparison at his profit level", "Which sounds more impressive", "The registration fee", "Whichever his friend chose"], correct: 0, feedback: { correct: "Right, and it's worth an accountant's hour, the answer genuinely changes with profit level and industry.", incorrect: "Liability, client requirements and the tax maths at his income. The registration fee is trivial in comparison." } } },
    ],
  },
  {
    slotId: "business-finance/cipc/compliance",
    conceptId: "provisional-tax",
    variants: [
      { variantId: "bfx-cp-cm-mcq", step: { type: "mcq", question: "What happens if a company doesn't file its CIPC annual returns?", options: ["It can be deregistered", "Nothing", "A small fine only", "The directors are arrested"], correct: 0, feedback: { correct: "Right. Deregistration can freeze bank accounts and invalidate contracts. Restoring the company is slow and expensive.", incorrect: "Deregistration is the real risk, and reinstating a deregistered company is a serious administrative burden." } } },
      { variantId: "bfx-cp-cm-tf", step: { type: "true-false", statement: "Company directors have legal duties under the Companies Act, including acting in the company's best interests.", correct: true, feedback: { correct: "Right, and directors can be held personally liable for reckless trading: being a director isn't just a title.", incorrect: "It's true. Directors carry statutory duties and can face personal liability in some circumstances." } } },
      { variantId: "bfx-cp-cm-sc", step: { type: "scenario", question: "Nomsa registered a company two years ago and has filed nothing since. What should she do?", options: ["Bring the CIPC returns and tax filings current immediately", "Register a new company instead", "Ignore it. Dormant companies don't need filings", "Wait for CIPC to contact her"], correct: 0, feedback: { correct: "Right. Dormant companies still need annual returns, and catching up now is far cheaper than reinstating later.", incorrect: "Catch up now. Dormancy doesn't remove the filing obligation, and deregistration is the eventual outcome." } } },
    ],
  },
];

// ── Insurance for Small Businesses ──────────────────────────────────────────
const insSlots: QuestionSlot[] = [
  {
    slotId: "business-finance/insurance/public-liability",
    conceptId: "business-insurance",
    variants: [
      { variantId: "bfx-is-pl-sc", step: { type: "scenario", question: "A client trips over a cable in your office and sues you for R600 000. Which cover responds?", options: ["Public liability insurance", "Professional indemnity", "Business interruption", "Key person cover"], correct: 0, feedback: { correct: "Right. Public liability covers injury or property damage to third parties on your premises or caused by your operations.", incorrect: "Public liability. Professional indemnity covers advice and services, not physical injury on your premises." } } },
      { variantId: "bfx-is-pl-mcq", step: { type: "mcq", question: "What does public liability insurance cover?", options: ["Injury to third parties or damage to their property arising from your business", "Your own equipment", "Your lost income", "Your employees' salaries"], correct: 0, feedback: { correct: "Right, and it's often required before you can work on a client's site at all.", incorrect: "Third-party injury and property damage. Your own assets and income need different cover." } } },
      { variantId: "bfx-is-pl-tf", step: { type: "true-false", statement: "Many corporate clients require proof of public liability cover before they'll contract with you.", correct: true, feedback: { correct: "Right, so it's often a commercial requirement as much as a risk decision.", incorrect: "It's true. Proof of cover is a standard procurement requirement for corporate and government work." } } },
    ],
  },
  {
    slotId: "business-finance/insurance/professional-indemnity",
    conceptId: "business-insurance",
    variants: [
      { variantId: "bfx-is-pi-tf", step: { type: "true-false", statement: "Professional indemnity insurance is only necessary for doctors and lawyers.", correct: false, feedback: { correct: "Right. Anyone giving advice or delivering professional services (consultants, accountants, architects, IT and marketing firms) carries the same exposure.", incorrect: "It applies to any advice-based or professional service. A consultant's error can be as costly as a lawyer's." } } },
      { variantId: "bfx-is-pi-mcq", step: { type: "mcq", question: "What does professional indemnity cover?", options: ["Claims that your advice, service or work caused a client financial loss", "Injury on your premises", "Your equipment being stolen", "Your own lost income"], correct: 0, feedback: { correct: "Right, and it typically covers the legal defence costs too, which can exceed the claim itself.", incorrect: "Financial loss to a client from your professional work. Physical injury and asset loss need other cover." } } },
      { variantId: "bfx-is-pi-sc", step: { type: "scenario", question: "Sipho's consulting recommendation costs a client R400 000 and they threaten to sue. What responds?", options: ["Professional indemnity, including his legal defence costs", "Public liability", "Business interruption", "Nothing, consultants aren't liable"], correct: 0, feedback: { correct: "Right. Legal costs alone can be substantial even if he ultimately wins, which is a large part of the cover's value.", incorrect: "Professional indemnity. Consultants absolutely can be held liable for negligent advice." } } },
    ],
  },
  {
    slotId: "business-finance/insurance/interruption",
    conceptId: "business-insurance",
    variants: [
      { variantId: "bfx-is-bi-sc", step: { type: "scenario", question: "A flood destroys your equipment and closes your two-person firm for six weeks. Revenue is R120 000 a month. Which claims are relevant?", options: ["Asset cover for the equipment, and business interruption for the lost income", "Only asset cover", "Only public liability", "Professional indemnity"], correct: 0, feedback: { correct: "Right. Replacing the equipment doesn't replace roughly R180 000 of lost revenue. That's what interruption cover is for.", incorrect: "Both: assets for the equipment, business interruption for the income lost while closed." } } },
      { variantId: "bfx-is-bi-mcq", step: { type: "mcq", question: "Why is business interruption cover often more important than asset cover?", options: ["Lost income during closure usually exceeds the value of the damaged assets", "It's cheaper", "It's legally required", "Assets are never damaged"], correct: 0, feedback: { correct: "Right. Equipment can be replaced in days; the revenue lost while you can't trade is what closes businesses.", incorrect: "The income loss is typically larger. That's the gap that actually kills small businesses after an incident." } } },
      { variantId: "bfx-is-bi-tf", step: { type: "true-false", statement: "Small businesses commonly insure their equipment but not their income.", correct: true, feedback: { correct: "Right, and it's the wrong way round. The income is usually the larger and more dangerous exposure.", incorrect: "It's true and it's a common gap. Assets feel tangible; income doesn't, until it stops." } } },
    ],
  },
  {
    slotId: "business-finance/insurance/key-person",
    conceptId: "business-insurance",
    variants: [
      { variantId: "bfx-is-kp-mcq", step: { type: "mcq", question: "What does key person insurance do?", options: ["Pays the business if someone essential to it dies or becomes disabled", "Pays that person's family", "Covers their salary permanently", "Replaces public liability"], correct: 0, feedback: { correct: "Right. The money goes to the business, to cover lost revenue and the cost of replacing them.", incorrect: "It pays the business, not the family. Personal life cover handles the family's needs separately." } } },
      { variantId: "bfx-is-kp-tf", step: { type: "true-false", statement: "A buy-and-sell agreement funded by insurance lets surviving partners buy out a deceased partner's share.", correct: true, feedback: { correct: "Right, and it prevents the worst outcome: inheriting a business partner's family as co-owners with no plan and no cash.", incorrect: "It's true. The policy funds the buyout so ownership and the family's payout are both settled cleanly." } } },
      { variantId: "bfx-is-kp-sc", step: { type: "scenario", question: "Priya and a partner each own half a business with no agreement in place. What's the risk if one dies?", options: ["The deceased's share passes to their heirs, who may have no interest or skill in the business", "The business closes automatically", "The survivor inherits everything", "The share reverts to CIPC"], correct: 0, feedback: { correct: "Right. A funded buy-and-sell agreement solves it in advance. Trying to solve it afterwards rarely goes well.", incorrect: "It passes to the estate and then the heirs. Without an agreement, the survivor has no right to buy it." } } },
    ],
  },
];

// ── Financing Business Growth in SA ─────────────────────────────────────────
const finSlots: QuestionSlot[] = [
  {
    slotId: "business-finance/growth/bank-reality",
    conceptId: "business-funding",
    variants: [
      { variantId: "bfx-gr-br-sc", step: { type: "scenario", question: "A six-month-old business approaches a commercial bank for an unsecured R500 000 loan. What's the likely outcome?", options: ["Decline, banks want trading history, security and usually director surety", "Approval within days", "Approval at a lower amount", "Approval with no conditions"], correct: 0, feedback: { correct: "Right. Banks lend against track record and security, which a six-month-old business doesn't have yet.", incorrect: "Almost certainly a decline. Commercial banks aren't set up to fund businesses without history or security." } } },
      { variantId: "bfx-gr-br-mcq", step: { type: "mcq", question: "What do commercial banks typically require for small business lending?", options: ["Trading history, financial statements, security and personal surety from directors", "Only a business plan", "A CIPC registration certificate", "Nothing for amounts under R1 million"], correct: 0, feedback: { correct: "Right, and the personal surety is the part people underestimate. It puts your own assets behind the loan.", incorrect: "History, statements, security and surety. A business plan alone rarely gets a bank loan." } } },
      { variantId: "bfx-gr-br-tf", step: { type: "true-false", statement: "A strong business plan alone is usually enough to secure commercial bank finance.", correct: false, feedback: { correct: "Right. Banks lend against evidence and security, not projections: the plan supports the application rather than carrying it.", incorrect: "Plans matter but don't substitute for trading history and security." } } },
    ],
  },
  {
    slotId: "business-finance/growth/development-finance",
    conceptId: "business-funding",
    variants: [
      { variantId: "bfx-gr-df-mcq", step: { type: "mcq", question: "Which state agency now provides SMME development finance and support in South Africa?", options: ["SEDFA, which merged SEFA, SEDA and the CBDA", "SEFA, operating independently", "SEDA, operating independently", "The Reserve Bank"], correct: 0, feedback: { correct: "Right. The three merged into the Small Enterprise Development and Finance Agency in October 2024, lending, incubation and co-operative support in one entity.", incorrect: "SEDFA. SEFA, SEDA and the CBDA were consolidated into it and no longer operate separately." } } },
      { variantId: "bfx-gr-df-tf", step: { type: "true-false", statement: "The National Empowerment Fund and SEDFA have identical mandates.", correct: false, feedback: { correct: "Right. The NEF has a B-BBEE mandate focused on black-empowered businesses; SEDFA's SMME mandate is broader.", incorrect: "They differ. The NEF is empowerment-focused; SEDFA supports small enterprises more generally." } } },
      { variantId: "bfx-gr-df-sc", step: { type: "scenario", question: "Thabo's business is too young for a bank loan. Where else can he realistically look?", options: ["Development finance institutions, sector funds, or customer deposits and revenue", "Only commercial banks", "Personal credit cards", "A mashonisa"], correct: 0, feedback: { correct: "Right, and funding growth from customer deposits and retained revenue is the cheapest capital there is.", incorrect: "Development finance, sector funds and self-funding. Card debt and informal lenders are the most expensive routes possible." } } },
    ],
  },
  {
    slotId: "business-finance/growth/debt-vs-equity",
    conceptId: "business-funding",
    variants: [
      { variantId: "bfx-gr-de-mcq", step: { type: "mcq", question: "What's the core trade-off between debt and equity funding?", options: ["Debt must be repaid but you keep ownership; equity needs no repayment but you give up a share", "Debt is always cheaper", "Equity is always faster", "They're effectively identical"], correct: 0, feedback: { correct: "Right, and equity is permanent. You're selling a share of every future rand the business ever earns.", incorrect: "Repayment versus ownership. Debt has a fixed claim; equity has a permanent one." } } },
      { variantId: "bfx-gr-de-tf", step: { type: "true-false", statement: "Equity funding is 'free' because there's nothing to repay.", correct: false, feedback: { correct: "Right. It's often the most expensive capital of all. 20% of a business that becomes valuable costs far more than a loan would have.", incorrect: "It's not free. You've sold a permanent share of all future profits." } } },
      { variantId: "bfx-gr-de-sc", step: { type: "scenario", question: "Nomsa needs R300 000 for equipment that will pay for itself in 18 months. Which route generally fits better?", options: ["Debt, the asset generates the cash to repay it and she keeps full ownership", "Equity, to avoid repayments", "Selling half the business", "Personal credit card"], correct: 0, feedback: { correct: "Right. Predictable, asset-backed needs suit debt; equity is for high-risk growth where repayment isn't realistic.", incorrect: "Debt fits a self-funding asset. Giving away ownership for predictable equipment finance is expensive." } } },
    ],
  },
  {
    slotId: "business-finance/growth/self-funding",
    conceptId: "business-funding",
    variants: [
      { variantId: "bfx-gr-sf-mcq", step: { type: "mcq", question: "What's the cheapest source of business growth capital?", options: ["Retained profits and customer deposits", "A bank overdraft", "A personal loan", "Credit card debt"], correct: 0, feedback: { correct: "Right. It's slower, but it costs nothing and dilutes nobody: most durable small businesses grow this way.", incorrect: "Your own retained profit and customer deposits. Every other option carries interest or dilution." } } },
      { variantId: "bfx-gr-sf-tf", step: { type: "true-false", statement: "Growing more slowly using your own cash is often lower risk than borrowing to grow faster.", correct: true, feedback: { correct: "Right. Debt-funded growth amplifies both outcomes, and a downturn with fixed repayments is what closes businesses.", incorrect: "It's true. Self-funded growth is slower but far more survivable when conditions turn." } } },
      { variantId: "bfx-gr-sf-sc", step: { type: "scenario", question: "Johan can grow at 20% a year self-funded, or 60% with debt he'd struggle to service in a bad quarter. What's the honest framing?", options: ["Faster growth he can't service is a bet on nothing going wrong", "Always take the faster option", "Growth rate is the only thing that matters", "Debt makes growth risk-free"], correct: 0, feedback: { correct: "Right. Fixed repayments don't pause for a bad quarter, and one bad quarter is not an unusual event.", incorrect: "It's a risk trade, not a free upgrade. Repayments continue whether revenue does or not." } } },
    ],
  },
];

// ── Profitable But Broke (applied) ──────────────────────────────────────────
const pbSlots: QuestionSlot[] = [
  {
    slotId: "business-finance/profitable-broke/diagnosis",
    conceptId: "cash-flow-vs-profit",
    variants: [
      { variantId: "bfx-pb-dg-mcq", step: { type: "mcq", question: "Lerato's business shows R240 000 profit for the year but her account is empty. What's the most likely explanation?", options: ["Cash is tied up in unpaid invoices, stock, or drawings that don't appear as expenses", "The profit figure is fraudulent", "Her accountant made an error", "The business isn't really profitable"], correct: 0, feedback: { correct: "Right. Profit and cash diverge through debtors, stock and owner drawings, all invisible on the income statement.", incorrect: "Cash gets absorbed by debtors, stock and drawings. Profit can be real while the bank account is empty." } } },
      { variantId: "bfx-pb-dg-tf", step: { type: "true-false", statement: "Owner drawings reduce cash but don't appear as an expense on the income statement.", correct: true, feedback: { correct: "Right, and it's a very common cause of the 'profitable but broke' feeling.", incorrect: "It's true. Drawings come off the balance sheet, not the income statement, so profit stays unchanged." } } },
      { variantId: "bfx-pb-dg-sc", step: { type: "scenario", question: "Where should Lerato look first to find her missing cash?", options: ["Debtors, stock levels and her own drawings", "Her marketing spend", "Her tax rate", "Her pricing"], correct: 0, feedback: { correct: "Right. Those three absorb cash without reducing profit, which is exactly why the gap appears.", incorrect: "Debtors, stock and drawings. Marketing and pricing affect profit, which isn't the thing that's missing." } } },
    ],
  },
  {
    slotId: "business-finance/profitable-broke/debtors",
    conceptId: "invoicing-debtors",
    variants: [
      { variantId: "bfx-pb-db-fill", step: { type: "fill-blank", title: "Money sitting with clients", prompt: "Lerato has R180 000 of invoices outstanding and R60 000 of them are more than 60 days overdue. The amount at serious risk = R____.", correct: 60000, feedback: { correct: "R60 000 past 60 days is where collection rates start falling sharply. That's the first call to make.", incorrect: "R60 000 is the portion beyond 60 days, and that's the most at-risk money." } } },
      { variantId: "bfx-pb-db-mcq", step: { type: "mcq", question: "What's the fastest way for a profitable but cash-short business to raise money?", options: ["Collect its own overdue invoices", "Take a loan", "Increase prices", "Cut marketing"], correct: 0, feedback: { correct: "Right. It's her money already, it costs nothing to collect, and it's usually available within days.", incorrect: "Collect the debtors. Borrowing against money you're already owed adds cost for no reason." } } },
      { variantId: "bfx-pb-db-tf", step: { type: "true-false", statement: "Unpaid invoices are effectively an interest-free loan you've made to your clients.", correct: true, feedback: { correct: "Right, and the longer the terms, the larger the loan you're providing free of charge.", incorrect: "It's true. Extended terms mean you're financing your clients' operations at your own expense." } } },
    ],
  },
  {
    slotId: "business-finance/profitable-broke/fix",
    conceptId: "cash-flow-vs-profit",
    variants: [
      { variantId: "bfx-pb-fx-mcq", step: { type: "mcq", question: "Which change most reliably prevents the profitable-but-broke pattern recurring?", options: ["Deposits upfront and shorter payment terms, consistently enforced", "Higher prices", "More clients", "A bigger overdraft"], correct: 0, feedback: { correct: "Right. It changes when cash arrives, which is the actual problem, a bigger overdraft just finances it at 20%.", incorrect: "Change the payment timing. More revenue on the same terms makes the cash gap larger, not smaller." } } },
      { variantId: "bfx-pb-fx-tf", step: { type: "true-false", statement: "Winning more clients on the same slow payment terms can worsen a cash flow problem.", correct: true, feedback: { correct: "Right. More work means more costs upfront and more money waiting in debtors: growth widens the gap.", incorrect: "It's true. Growth on slow terms consumes more cash than it delivers, at least initially." } } },
      { variantId: "bfx-pb-fx-sc", step: { type: "scenario", question: "Lerato wants to fix this permanently. What's the right sequence?", options: ["Collect what's owed, change her terms", "Grow first and fix cash flow later", "Take an overdraft and continue as before", "Raise prices and hope"], correct: 0, feedback: { correct: "Right. Collect, restructure, buffer, then grow. Growing before the buffer exists is what created the problem.", incorrect: "Collect, change terms, build a buffer, then grow. Growing on broken terms repeats the cycle at a larger scale." } } },
    ],
  },
  {
    slotId: "business-finance/profitable-broke/buffer",
    conceptId: "cash-flow-vs-profit",
    variants: [
      { variantId: "bfx-pb-bf-mcq", step: { type: "mcq", question: "How much operating cash should a small business aim to hold?", options: ["Enough to cover several months of fixed costs, including salaries", "One week", "Nothing, reinvest everything", "Exactly one month's revenue"], correct: 0, feedback: { correct: "Right. It's the business equivalent of an emergency fund, and it's what lets you say no to bad terms.", incorrect: "Several months of fixed costs. A thin buffer forces expensive decisions at the worst moments." } } },
      { variantId: "bfx-pb-bf-tf", step: { type: "true-false", statement: "A business cash buffer lets you decline unfavourable payment terms and bad clients.", correct: true, feedback: { correct: "Right. Cash buys negotiating power. Desperation is what makes businesses accept 90-day terms.", incorrect: "It's true. A buffer is what allows you to walk away from terms that would hurt you." } } },
      { variantId: "bfx-pb-bf-sc", step: { type: "scenario", question: "Lerato's business now has three months of costs in reserve. What does that change?", options: ["She can negotiate from strength, survive a slow quarter, and take on work selectively", "Nothing. It's idle money", "She should spend it on growth immediately", "She should distribute it all to herself"], correct: 0, feedback: { correct: "Right. That reserve is what converts her business from fragile to durable, and it isn't idle. It's optionality.", incorrect: "It changes her negotiating position and her resilience. Spending it immediately returns her to fragility." } } },
    ],
  },
];

export const BUSINESS_FINANCE_EXTRA_BANKS: Record<string, LessonBank> = {
  "business-finance::lesson-cash-flow-business": {
    layout: L(cfSlots, "Profit Is Not Cash", "<p>Profit is recorded when you invoice; cash arrives when clients pay. That gap is why <strong>profitable businesses run out of money and close</strong>, and growth makes it worse, because every new order consumes cash before it produces any. Deposits upfront are standard practice and the cheapest working capital there is. A simple <strong>rolling weekly cash forecast</strong> tells you which weeks you'll be short, early enough to do something about it.</p>"),
    slots: cfSlots,
  },
  "business-finance::lesson-invoicing-debtors": {
    layout: L(invSlots, "Getting Paid on Time", "<p>Every day of payment terms is a day you finance your client's business for free, and '30 days from statement' can mean 60 days after the work. <strong>Charging interest on overdue invoices is legal</strong> when your agreed terms provide for it, so get the clause into the contract before you start. Consistent follow-up <em>before</em> the due date is what gets you paid first, because recovery rates fall sharply with age.</p>"),
    slots: invSlots,
  },
  "business-finance::lesson-business-bank-accounts": {
    layout: L(bankSlots, "Separating the Money", "<p>A sole proprietor isn't <em>legally</em> required to have a separate business account, but mixing money makes tax, bookkeeping and any SARS verification far harder and more expensive. Choose an account by matching the <strong>fee structure to how you actually transact</strong>. Plan ahead for compulsory <strong>VAT registration above R1 000 000</strong> turnover, and remember that non-salary income above R30 000 makes you a provisional taxpayer.</p>"),
    slots: bankSlots,
  },
  "business-finance::lesson-cipc-registration": {
    layout: L(cipcSlots, "Structures and Registration", "<p>CIPC registration is <strong>online, inexpensive and takes days</strong>, no lawyer required for a standard company. A Pty Ltd is a separate legal person, so business debts are generally the company's. <em>except</em> where you've signed <strong>personal surety</strong>, which banks almost always require and which puts your own assets back on the line. A sole proprietor is taxed at their marginal rate; a company pays 27%, with reduced graduated rates for qualifying Small Business Corporations.</p>"),
    slots: cipcSlots,
  },
  "business-finance::lesson-business-insurance": {
    layout: L(insSlots, "What Can Actually Close You", "<p><strong>Public liability</strong> covers third-party injury or property damage. Often a procurement requirement before corporates will contract with you. <strong>Professional indemnity</strong> covers claims that your advice or work caused a client financial loss, and it applies to any professional service, not just doctors and lawyers. <strong>Business interruption</strong> replaces lost income while you can't trade, which usually exceeds the value of the damaged assets. A funded <strong>buy-and-sell agreement</strong> settles what happens to a partner's share.</p>"),
    slots: insSlots,
  },
  "business-finance::lesson-growth-financing": {
    layout: L(finSlots, "Funding Growth", "<p>Commercial banks lend against trading history, financial statements, security and <strong>director surety</strong>. A strong plan alone rarely does it. State support now runs through <strong>SEDFA</strong>, which merged SEFA, SEDA and the CBDA in October 2024; the <strong>NEF</strong> has a separate B-BBEE mandate. Debt must be repaid but preserves ownership; equity needs no repayment but sells a permanent share of every future rand. Retained profit and customer deposits remain the cheapest capital of all.</p>"),
    slots: finSlots,
  },
  "business-finance::lesson-applied-cashflow-profit": {
    layout: L(pbSlots, "Profitable But Broke", "<p>Lerato's business shows <strong>R240 000 profit</strong> for the year and her account is empty. The cash is in three places the income statement doesn't show: <strong>debtors</strong> (R180 000 outstanding, R60 000 of it past 60 days), <strong>stock</strong>, and her own <strong>drawings</strong>. The fastest money available is her own overdue invoices. Then change the terms, build a buffer of several months' fixed costs, and only then grow.</p>"),
    slots: pbSlots,
  },
};
