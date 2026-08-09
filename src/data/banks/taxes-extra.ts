import type { LessonLayoutItem, QuestionSlot } from "@/data/content";
import type { LessonBank } from "./money-basics";

/**
 * Premium banks for the Taxes EXTRA lessons.
 * Figures per docs/SA-REGULATORY-FIGURES.md (2026/27): donations tax 20% to
 * R30m / 25% above, R100 000 annual exemption; estate duty 20% to R30m / 25%
 * above with a R3.5m abatement (portable to R7m); dividends withholding 20%;
 * CGT 40% inclusion, R50 000 annual exclusion, R3 000 000 primary-residence
 * exclusion; interest exemption R23 800 under 65; TFSA R46 000/yr.
 * IRP5 source codes verified against SARS: 4102 PAYE, 4001 retirement fund
 * contributions, 4005 medical scheme fees, 3601 income.
 * variantId prefix: `txx-`.
 */
const info = (title: string, content: string): LessonLayoutItem => ({ type: "info", title, content });
const L = (slots: QuestionSlot[], title: string, content: string): LessonLayoutItem[] => [
  info(title, content),
  ...slots.map((s) => ({ slot: s.slotId })),
];

// ── Tax Certificates: IRP5 and IT3 ──────────────────────────────────────────
const certSlots: QuestionSlot[] = [
  {
    slotId: "taxes/certificates/what-they-are",
    conceptId: "tax-certificates",
    variants: [
      { variantId: "txx-ct-wt-mcq", step: { type: "mcq", question: "What is an IRP5?", options: ["Your employer's annual pay summary", "A SARS assessment of what you owe", "A certificate from your bank", "Proof that you're registered for tax"], correct: 0, feedback: { correct: "Right. SARS receives it directly from your employer, which is why an auto-assessment can be generated without you doing anything.", incorrect: "It's the employer's annual certificate of income and deductions, submitted to SARS as well as to you." } } },
      { variantId: "txx-ct-wt-tf", step: { type: "true-false", statement: "An IT3(b) from your bank or broker reports interest and dividends you earned.", correct: true, feedback: { correct: "Right, and an IT3(c) reports capital gains and losses on investments you sold.", incorrect: "It's true. IT3(b) covers investment income; IT3(c) covers capital gains events." } } },
      { variantId: "txx-ct-wt-sc", step: { type: "scenario", question: "Ayesha changed jobs mid-year. How many IRP5s should she expect?", options: ["One from each employer", "One combined certificate from SARS", "Only one, from her current job", "None, SARS handles it for her"], correct: 0, feedback: { correct: "Right. Missing the first employer's certificate is a common cause of an under-declared return and a later SARS query.", incorrect: "One per employer. Both must be reflected, or her income is understated." } } },
    ],
  },
  {
    slotId: "taxes/certificates/source-codes",
    conceptId: "tax-certificates",
    variants: [
      { variantId: "txx-ct-sc-mcq", step: { type: "mcq", question: "Which IRP5 source code shows the PAYE your employer deducted?", options: ["4102", "4001", "3601", "4005"], correct: 0, feedback: { correct: "Right. 4102 is PAYE; 3601 is your income, 4001 retirement fund contributions and 4005 medical scheme fees.", incorrect: "4102 is PAYE. 4001 is retirement contributions, 4005 medical scheme fees, 3601 your income." } } },
      { variantId: "txx-ct-sc-tf", step: { type: "true-false", statement: "Source code 4001 on your IRP5 refers to your retirement fund contributions, not PAYE.", correct: true, feedback: { correct: "Right. Mixing up 4001 and 4102 is an easy way to think your tax is wrong when it isn't.", incorrect: "It's true. 4001 is retirement fund contributions; PAYE sits under 4102." } } },
      { variantId: "txx-ct-sc-sc", step: { type: "scenario", question: "Thabo wants to confirm his retirement contributions were captured for his deduction. Where does he look?", options: ["Source code 4001", "Source code 4102", "His bank statement", "The SARS assessment only"], correct: 0, feedback: { correct: "Right. If 4001 is blank or wrong, his deduction is wrong, and that's an employer correction, not a SARS one.", incorrect: "Code 4001 carries the retirement fund contributions that drive the deduction." } } },
    ],
  },
  {
    slotId: "taxes/certificates/check-against-payslips",
    conceptId: "tax-certificates",
    variants: [
      { variantId: "txx-ct-cp-sc", step: { type: "scenario", question: "Priya's IRP5 shows R68 000 of PAYE under code 4102, but her payslips add up to R60 000. What does that suggest?", options: ["An error somewhere", "SARS added interest", "Her employer paid extra tax as a benefit", "Nothing: the figures never match exactly"], correct: 0, feedback: { correct: "Right. SARS assesses against the IRP5, so an R8 000 discrepancy must be resolved with payroll first. A corrected IRP5 is the fix.", incorrect: "It's a discrepancy worth chasing. The IRP5 and your payslips should reconcile to the rand." } } },
      { variantId: "txx-ct-cp-mcq", step: { type: "mcq", question: "What should you do with your IRP5 when it arrives?", options: ["Check it against your payslips", "File it away unread", "Send it to SARS yourself", "Wait for SARS to fix any errors"], correct: 0, feedback: { correct: "Right. Errors are far easier to fix before assessment than after, and SARS won't spot them for you.", incorrect: "Reconcile it against your payslips. SARS already has the employer's copy and assesses on it." } } },
      { variantId: "txx-ct-cp-tf", step: { type: "true-false", statement: "If your employer deducts too much PAYE, the money is lost unless you object within 30 days.", correct: false, feedback: { correct: "Right. Over-deducted PAYE comes back as a refund when your return is assessed. That's exactly what the annual assessment settles.", incorrect: "It isn't lost. Excess PAYE is refunded on assessment; there's no 30-day forfeiture rule." } } },
    ],
  },
  {
    slotId: "taxes/certificates/keep-records",
    conceptId: "tax-certificates",
    variants: [
      { variantId: "txx-ct-kr-mcq", step: { type: "mcq", question: "How long should you keep tax certificates and supporting documents?", options: ["At least five years", "Until the refund arrives", "About one year", "No need to keep them at all"], correct: 0, feedback: { correct: "Right. SARS can request supporting documents well after assessment, and 'I threw it away' isn't a defence.", incorrect: "Five years from submission. Verification requests often arrive long after the refund." } } },
      { variantId: "txx-ct-kr-tf", step: { type: "true-false", statement: "SARS can ask you to prove a deduction you claimed years after the return was assessed.", correct: true, feedback: { correct: "Right, which is why the medical, RA and logbook records matter as much as the claim itself.", incorrect: "It's true. Verification can come later, and the burden of proof sits with you." } } },
      { variantId: "txx-ct-kr-sc", step: { type: "scenario", question: "SARS asks Johan for supporting documents for a deduction claimed two years ago. He can't find them. What follows?", options: ["The deduction is likely disallowed", "SARS accepts his word", "The claim stands anyway", "He can substitute an estimate"], correct: 0, feedback: { correct: "Right. Without proof the claim falls away, and the resulting shortfall attracts interest from the original due date.", incorrect: "Undocumented claims get disallowed. Keep the evidence with the return for five years." } } },
    ],
  },
];

// ── Donations Tax and Estate Duty ───────────────────────────────────────────
const donSlots: QuestionSlot[] = [
  {
    slotId: "taxes/donations/annual-exemption",
    conceptId: "donations-tax",
    variants: [
      { variantId: "txx-dn-ae-mcq", step: { type: "mcq", question: "You donate R200 000 to your adult son. How is it taxed?", options: ["The first R100 000 is exempt", "The full R200 000 is exempt", "The full R200 000 is taxed at 20%", "Your son pays income tax on it"], correct: 0, feedback: { correct: "R100 000 × 20% = R20 000, and the donor pays it, not the recipient.", incorrect: "Individuals get a R100 000 annual exemption. The excess is taxed at 20%, payable by the donor." } } },
      { variantId: "txx-dn-ae-fill", step: { type: "fill-blank", title: "Donations tax due", prompt: "You donate R250 000 to your daughter. The annual exemption is R100 000 and the rate is 20%. Donations tax payable = R____.", correct: 30000, feedback: { correct: "(R250 000 − R100 000) × 20% = R30 000, payable by you as the donor.", incorrect: "R150 000 above the exemption × 20% = R30 000." } } },
      { variantId: "txx-dn-ae-tf", step: { type: "true-false", statement: "Donations between spouses attract donations tax.", correct: false, feedback: { correct: "Right. Donations to a spouse are exempt without limit, which makes spousal transfers a common planning tool.", incorrect: "Spousal donations are exempt. The R100 000 limit applies to donations to everyone else." } } },
    ],
  },
  {
    slotId: "taxes/donations/who-pays",
    conceptId: "donations-tax",
    variants: [
      { variantId: "txx-dn-wp-mcq", step: { type: "mcq", question: "Who is liable for donations tax?", options: ["The donor, within a set period", "The recipient, on assessment", "Both, split equally", "Nobody, it's collected at death"], correct: 0, feedback: { correct: "Right, and SARS can hold the recipient jointly liable if the donor doesn't pay.", incorrect: "The donor pays, and there's a deadline, it isn't settled through the annual return." } } },
      { variantId: "txx-dn-wp-tf", step: { type: "true-false", statement: "Spreading large gifts across several tax years can legitimately reduce donations tax.", correct: true, feedback: { correct: "Right. The R100 000 exemption renews each year, so timing is ordinary planning rather than avoidance.", incorrect: "It's true. The exemption is annual, so staging gifts is a legitimate approach." } } },
      { variantId: "txx-dn-wp-sc", step: { type: "scenario", question: "Nomsa wants to help her son with a R300 000 deposit. What's a reasonable structure to discuss with an adviser?", options: ["Spread it over several years", "Give it all at once and hope", "Disguise it as a salary payment", "Route it through a friend"], correct: 0, feedback: { correct: "Right. Staged gifts and formal loans are both recognised structures, though interest-free loans have their own rules.", incorrect: "Structure it properly. Concealment is evasion, and SARS sees large property deposits." } } },
    ],
  },
  {
    slotId: "taxes/estate/abatement",
    conceptId: "estate-duty",
    variants: [
      { variantId: "txx-es-ab-sc", step: { type: "scenario", question: "An estate consists of a R5.5m home, R2.1m of investments and a R1.8m life policy payable to the estate. With a R3.5m abatement, what is the dutiable estate?", options: ["R5.9 million", "R9.4 million", "R3.5 million", "R2.4 million"], correct: 0, feedback: { correct: "R5.5m + R2.1m + R1.8m = R9.4m, less the R3.5m abatement = R5.9m dutiable, taxed at 20%.", incorrect: "Total R9.4m − R3.5m abatement = R5.9m dutiable." } } },
      { variantId: "txx-es-ab-mcq", step: { type: "mcq", question: "How much of an estate is exempt from estate duty through the abatement?", options: ["R3.5 million", "R1 million", "R500 000", "No abatement"], correct: 0, feedback: { correct: "Right. Portability means the first-dying spouse's unused abatement carries to the second estate.", incorrect: "R3.5 million, portable between spouses to a combined R7 million." } } },
      { variantId: "txx-es-ab-tf", step: { type: "true-false", statement: "Everything you leave to your spouse is deductible before estate duty is calculated.", correct: true, feedback: { correct: "Right. The section 4(q) deduction. Duty is effectively deferred to the second estate rather than avoided.", incorrect: "It's true. Bequests to a surviving spouse are deducted, which postpones duty to the second death." } } },
    ],
  },
  {
    slotId: "taxes/estate/life-policies",
    conceptId: "estate-duty",
    variants: [
      { variantId: "txx-es-lp-tf", step: { type: "true-false", statement: "A life policy paid directly to a nominated beneficiary is still included in your dutiable estate for estate duty.", correct: true, feedback: { correct: "Right. Domestic policies on your life are deemed property under the Estate Duty Act. Nominating a beneficiary avoids executor's fees and delays, not duty.", incorrect: "It's true. Nomination speeds payment and avoids executor's fees, but the proceeds are still deemed property for duty." } } },
      { variantId: "txx-es-lp-mcq", step: { type: "mcq", question: "What does nominating a beneficiary on a life policy actually achieve?", options: ["Fast payout, no executor's fees", "It removes it from estate duty", "It makes proceeds taxable income", "It has no effect at all"], correct: 0, feedback: { correct: "Right, and speed matters, a family waiting months for an estate to wind up still has to eat.", incorrect: "Speed and executor's fees, not duty. The proceeds remain deemed property of the estate." } } },
      { variantId: "txx-es-lp-sc", step: { type: "scenario", question: "Johan nominates his wife as beneficiary of his life policy. What's the estate duty outcome?", options: ["The spousal deduction applies", "Duty at 20% on the full amount", "It is taxed as income in her hands", "It must be paid into the estate first"], correct: 0, feedback: { correct: "Right. A spouse beneficiary combines both benefits: the section 4(q) deduction and direct, fast payment.", incorrect: "The spousal deduction applies, so the proceeds attract no duty and bypass the estate's fees." } } },
    ],
  },
];

// ── Tax on Investment Returns ───────────────────────────────────────────────
const invTaxSlots: QuestionSlot[] = [
  {
    slotId: "taxes/investment/dividends",
    conceptId: "dividends-tax",
    variants: [
      { variantId: "txx-iv-dv-mcq", step: { type: "mcq", question: "You earn R50 000 in dividends from JSE shares held outside a TFSA. What reaches you?", options: ["R40 000", "R50 000", "R32 500", "R45 000"], correct: 0, feedback: { correct: "Right. DWT is withheld at source at 20%, so the R10 000 never reaches your account and there's nothing further to declare.", incorrect: "Dividends withholding tax is 20%: R50 000 × 80% = R40 000." } } },
      { variantId: "txx-iv-dv-fill", step: { type: "fill-blank", title: "After withholding", prompt: "You receive R30 000 of local dividends outside a tax-free account. Dividends withholding tax is 20%, so you actually receive R____.", correct: 24000, feedback: { correct: "R30 000 × 80% = R24 000. The 20% is withheld before the money reaches you.", incorrect: "R30 000 less 20% = R24 000." } } },
      { variantId: "txx-iv-dv-tf", step: { type: "true-false", statement: "Dividends withholding tax is deducted before the money reaches your account.", correct: true, feedback: { correct: "Right. It's a withholding tax, so the company or platform pays it over on your behalf.", incorrect: "It's true, withheld at source, not paid later on assessment." } } },
    ],
  },
  {
    slotId: "taxes/investment/interest",
    conceptId: "tax-deductions",
    variants: [
      { variantId: "txx-iv-in-mcq", step: { type: "mcq", question: "How is local interest taxed for someone under 65?", options: ["Exempt to R23 800 a year", "Always tax-free", "Taxed at a flat 20%", "Taxed only above R100 000"], correct: 0, feedback: { correct: "Right. It's the exemption plus marginal rates, which is why a high earner with lots of cash pays a lot of tax on interest.", incorrect: "R23 800 is exempt under 65 (R34 500 from 65); the balance is taxed at your marginal rate." } } },
      { variantId: "txx-iv-in-tf", step: { type: "true-false", statement: "Interest earned inside a TFSA still counts against the annual interest exemption.", correct: false, feedback: { correct: "Right. TFSA returns are entirely outside the tax system, so your R23 800 exemption stays available for interest earned elsewhere.", incorrect: "It doesn't. TFSA interest is fully tax-free and leaves your ordinary exemption untouched." } } },
      { variantId: "txx-iv-in-sc", step: { type: "scenario", question: "Priya is 40 and earns R35 000 of local interest. What's taxable?", options: ["R11 200", "All R35 000", "Nothing at all", "R23 800"], correct: 0, feedback: { correct: "R35 000 − R23 800 = R11 200 taxable. Shifting some of that cash into a TFSA would remove the tax entirely.", incorrect: "Only the excess over R23 800: R11 200, taxed at her marginal rate." } } },
    ],
  },
  {
    slotId: "taxes/investment/cgt",
    conceptId: "capital-gains-tax",
    variants: [
      { variantId: "txx-iv-cg-fill", step: { type: "fill-blank", title: "Taxable capital gain", prompt: "You realise a R100 000 capital gain. After the R50 000 annual exclusion, 40% of the remainder is included in taxable income. The amount added to your income = R____.", correct: 20000, feedback: { correct: "(R100 000 − R50 000) × 40% = R20 000 added to taxable income, then taxed at your marginal rate.", incorrect: "R50 000 remains after the exclusion; 40% of that is R20 000." } } },
      { variantId: "txx-iv-cg-mcq", step: { type: "mcq", question: "What is the maximum effective CGT rate for an individual?", options: ["About 18%", "45%", "40%", "About 20%"], correct: 0, feedback: { correct: "Right. 40% × 45% = 18%, which is why capital gains are taxed far more lightly than salary.", incorrect: "40% inclusion × 45% top marginal rate = 18% effective." } } },
      { variantId: "txx-iv-cg-tf", step: { type: "true-false", statement: "Selling investments inside a TFSA triggers capital gains tax.", correct: false, feedback: { correct: "Right. No CGT, no dividends tax and no tax on interest inside the wrapper, which is what makes it so useful over decades.", incorrect: "A TFSA is entirely free of CGT, dividends tax and interest tax." } } },
    ],
  },
  {
    slotId: "taxes/investment/wrapper-choice",
    conceptId: "tfsa",
    variants: [
      { variantId: "txx-iv-wc-mcq", step: { type: "mcq", question: "Why does holding the same fund inside a TFSA beat holding it in a taxable account?", options: ["Same fund, but no tax on growth", "The fund performs better inside", "Fees are waived inside a TFSA", "The TFSA guarantees your capital"], correct: 0, feedback: { correct: "Right. Same fund, same fees, same returns. The difference is entirely tax, and it compounds.", incorrect: "It's purely the tax treatment. Returns and fees are identical; the tax saving is what accumulates." } } },
      { variantId: "txx-iv-wc-tf", step: { type: "true-false", statement: "You should generally fill your TFSA before investing in a taxable account.", correct: true, feedback: { correct: "Right, for money you can leave alone: R46 000 a year of tax-free room is worth using first.", incorrect: "It's true for long-term money. Use the tax-free room before the taxable account." } } },
      { variantId: "txx-iv-wc-sc", step: { type: "scenario", question: "Sipho can invest R4 000 a month for the next twenty years. Where should it go first?", options: ["Into a TFSA up to the annual limit", "Straight into a taxable account", "Into a fixed deposit", "Split evenly regardless of the limits"], correct: 0, feedback: { correct: "R48 000 a year slightly exceeds the R46 000 limit, so almost all of it fits inside the wrapper. Twenty years of tax-free growth is a large saving.", incorrect: "Fill the TFSA first, R46 000 of his R48 000 fits, and only the balance needs a taxable account." } } },
    ],
  },
];

// ── Using SARS eFiling ──────────────────────────────────────────────────────
const efSlots: QuestionSlot[] = [
  {
    slotId: "taxes/efiling/where-to-file",
    conceptId: "efiling",
    variants: [
      { variantId: "txx-ef-wf-tf", step: { type: "true-false", statement: "You can only file a SARS tax return at a SARS branch.", correct: false, feedback: { correct: "Right. eFiling and the SARS MobiApp handle everything online, and branch visits are by appointment anyway.", incorrect: "eFiling and the MobiApp let you file from anywhere. Branches are for exceptions, by appointment." } } },
      { variantId: "txx-ef-wf-mcq", step: { type: "mcq", question: "What do you need before you can file on eFiling?", options: ["A registered eFiling profile", "A visit to a SARS branch yearly", "An accountant's login", "A company registration"], correct: 0, feedback: { correct: "Right, and keeping your contact details and banking details current on the profile is what prevents refund delays.", incorrect: "Just a registered profile. Keep the security and banking details current so refunds aren't held up." } } },
      { variantId: "txx-ef-wf-sc", step: { type: "scenario", question: "Lerato's refund hasn't arrived weeks after assessment. What's the most common cause?", options: ["Unverified banking details", "SARS not paying refunds that year", "Her employer withholding it", "The refund has expired"], correct: 0, feedback: { correct: "Right. SARS won't pay into unverified details. Checking the profile is the first thing to do.", incorrect: "It's usually banking details. Verify them on eFiling before assuming something worse." } } },
    ],
  },
  {
    slotId: "taxes/efiling/before-accepting",
    conceptId: "efiling",
    variants: [
      { variantId: "txx-ef-ba-mcq", step: { type: "mcq", question: "What should you do before accepting a SARS auto-assessment?", options: ["Check it against your IRP5 and IT3s", "Accept it immediately for a faster refund", "Wait for the deadline to pass", "Phone SARS to confirm that it's genuine"], correct: 0, feedback: { correct: "Right. SARS only sees third-party data, a private RA or unclaimed medical expenses won't be in there.", incorrect: "Check it first. Accepting an incomplete assessment can cost you a legitimate refund." } } },
      { variantId: "txx-ef-ba-tf", step: { type: "true-false", statement: "An auto-assessment includes every deduction you're entitled to.", correct: false, feedback: { correct: "Right. It reflects what third parties reported. Anything SARS wasn't told about is missing.", incorrect: "It only reflects reported data. Private RAs, home office and out-of-pocket medical costs usually aren't there." } } },
      { variantId: "txx-ef-ba-sc", step: { type: "scenario", question: "Thabo's auto-assessment shows he owes R3 200, but he has R28 000 of unclaimed RA contributions. What should he do?", options: ["Reject it and claim the RA", "Accept and pay the R3 200", "Ignore it entirely", "Ask his employer"], correct: 0, feedback: { correct: "Right. At a 31% rate that R28 000 is worth about R8 680: likely turning what he owes into a refund.", incorrect: "File the return with the RA claim. Accepting means paying tax on income the deduction should have removed." } } },
    ],
  },
  {
    slotId: "taxes/efiling/supporting-docs",
    conceptId: "efiling",
    variants: [
      { variantId: "txx-ef-sd-mcq", step: { type: "mcq", question: "You submit your return and get a 'Supporting Documents Required' notice. What does it mean?", options: ["SARS is verifying your claims", "Your return was rejected", "You're being audited for fraud", "You must visit a branch"], correct: 0, feedback: { correct: "Right. Routine verification. Upload the documents on eFiling within the deadline and the assessment continues.", incorrect: "It's a verification request, not a rejection. Upload the proof on eFiling before the deadline." } } },
      { variantId: "txx-ef-sd-tf", step: { type: "true-false", statement: "Ignoring a supporting-documents request means SARS will simply assess your return as submitted.", correct: false, feedback: { correct: "Right. Unsupported claims get disallowed, which usually turns a refund into an amount owing.", incorrect: "Ignoring it gets your claims disallowed. Upload the documents within the stated period." } } },
      { variantId: "txx-ef-sd-sc", step: { type: "scenario", question: "SARS asks Nomsa for proof of her medical expenses. What should she upload?", options: ["Her medical tax certificate", "A written explanation only", "A photo of her bank card", "Nothing, the scheme reports it"], correct: 0, feedback: { correct: "Right. The scheme certificate covers contributions; the receipts cover what she paid herself and claimed on top.", incorrect: "The scheme certificate plus receipts for anything paid out of pocket. Explanations aren't evidence." } } },
    ],
  },
  {
    slotId: "taxes/efiling/deadlines",
    conceptId: "tax-filing",
    variants: [
      { variantId: "txx-ef-dl-mcq", step: { type: "mcq", question: "Why does filing on time matter even when you can't pay what you owe?", options: ["The late-filing penalty is separate", "SARS waives the debt if you file", "Filing late is immediately criminal", "The refund doubles in size"], correct: 0, feedback: { correct: "Right. Filing stops the admin penalty; the payment can then be handled through an arrangement.", incorrect: "The penalty runs on the outstanding return, independent of the outstanding payment." } } },
      { variantId: "txx-ef-dl-tf", step: { type: "true-false", statement: "SARS will consider a payment arrangement for tax you owe but can't pay immediately.", correct: true, feedback: { correct: "Right, and asking early is far better than waiting for collection steps to begin.", incorrect: "It's true. Deferred payment arrangements exist, but the return still has to be filed on time." } } },
      { variantId: "txx-ef-dl-sc", step: { type: "scenario", question: "Johan realises in November that he never filed. What's the best sequence?", options: ["File immediately", "Wait for next year's filing season", "File only once he has the money", "Ask his employer to fix it"], correct: 0, feedback: { correct: "Right. Every month the return stays outstanding adds another admin penalty on top of the tax.", incorrect: "File first, arrange payment second. Waiting only grows the penalty." } } },
    ],
  },
];

// ── Is SARS Right? Check Your Assessment (applied) ──────────────────────────
const assessSlots: QuestionSlot[] = [
  {
    slotId: "taxes/assessment/check-first",
    conceptId: "tax-filing",
    variants: [
      { variantId: "txx-as-cf-mcq", step: { type: "mcq", question: "Lerato receives an assessment showing she owes SARS R6 400. What's her first step?", options: ["Compare it to her records", "Pay it immediately in full", "Object without checking it", "Ignore it until SARS follows up"], correct: 0, feedback: { correct: "Right. Assessments are generated from reported data, and the gap between that and reality is where most errors live.", incorrect: "Check the detail first. Paying or objecting blindly are both premature." } } },
      { variantId: "txx-as-cf-tf", step: { type: "true-false", statement: "A SARS assessment is final and cannot be challenged.", correct: false, feedback: { correct: "Right. There's a formal objection process with a deadline, and it's used successfully all the time.", incorrect: "You can object. There's a defined process and a time limit for doing so." } } },
      { variantId: "txx-as-cf-sc", step: { type: "scenario", question: "Lerato finds her medical scheme contributions were omitted from the assessment. What now?", options: ["Object with the certificate", "Accept it and claim next year", "Pay it and move on", "Phone and ask them to remember"], correct: 0, feedback: { correct: "Right. Objections are decided on documents, so the scheme certificate is what carries the argument.", incorrect: "Object formally with the certificate. Deductions can't simply be rolled into a later year." } } },
    ],
  },
  {
    slotId: "taxes/assessment/must-you-file",
    conceptId: "tax-filing",
    variants: [
      { variantId: "txx-as-mf-tf", step: { type: "true-false", statement: "If your only income is a salary and your employer deducts PAYE correctly, you're generally not required to submit a return.", correct: true, feedback: { correct: "Right, but you may still want to, because deductions SARS doesn't know about can produce a refund.", incorrect: "It's true for that narrow case. Filing is still worthwhile if you have unclaimed deductions." } } },
      { variantId: "txx-as-mf-mcq", step: { type: "mcq", question: "Which situation makes filing worthwhile even when it isn't compulsory?", options: ["You have a private RA to claim", "You changed banks during the year", "You moved house", "You received a salary increase"], correct: 0, feedback: { correct: "Right. A deduction SARS has no record of only reaches you if you file and claim it.", incorrect: "Unclaimed deductions (a private RA, out-of-pocket medical costs, a travel logbook) are the reason to file voluntarily." } } },
      { variantId: "txx-as-mf-sc", step: { type: "scenario", question: "Ayesha has one employer, correct PAYE and R18 000 of out-of-pocket medical expenses. Should she file?", options: ["Yes, only a return can claim them", "No, it isn't compulsory", "Only if she's above the threshold", "Only if SARS asks her to"], correct: 0, feedback: { correct: "Right. The additional medical expenses credit is claimed on assessment, and skipping the return means forfeiting it.", incorrect: "File. Out-of-pocket medical expenses aren't on the IRP5 and can only reach SARS through a return." } } },
    ],
  },
  {
    slotId: "taxes/assessment/common-errors",
    conceptId: "tax-deductions",
    variants: [
      { variantId: "txx-as-ce-mcq", step: { type: "mcq", question: "Which item is most commonly missing from an auto-assessment?", options: ["A private retirement annuity", "Your salary from your employer", "The PAYE that was deducted", "Your UIF contribution amount"], correct: 0, feedback: { correct: "Right. Employer-linked figures flow through automatically; a private RA has to be claimed by you.", incorrect: "The private RA. Salary, PAYE and UIF all come straight off the IRP5." } } },
      { variantId: "txx-as-ce-tf", step: { type: "true-false", statement: "SARS automatically includes deductions it hasn't been told about.", correct: false, feedback: { correct: "Right. If no third party reported it, SARS doesn't know it exists, and won't ask.", incorrect: "It can't. Only reported data appears; anything else is your responsibility to claim." } } },
      { variantId: "txx-as-ce-sc", step: { type: "scenario", question: "Sipho's assessment omits his travel logbook claim. What does he need to succeed on objection?", options: ["A SARS-compliant travel logbook", "A signed letter from his employer", "Only his fuel slips", "His vehicle finance agreement"], correct: 0, feedback: { correct: "Right. Without those four elements per trip, the claim fails regardless of how much he genuinely drove.", incorrect: "The compliant logbook. Fuel slips and letters don't establish business kilometres." } } },
    ],
  },
  {
    slotId: "taxes/assessment/objection-process",
    conceptId: "tax-filing",
    variants: [
      { variantId: "txx-as-op-mcq", step: { type: "mcq", question: "How do you formally dispute a SARS assessment?", options: ["Lodge an objection on eFiling", "Email any SARS address", "Post a complaint on social media", "Refuse to pay until they contact you"], correct: 0, feedback: { correct: "Right, and the deadline matters. A late objection needs SARS to condone it, which isn't guaranteed.", incorrect: "It's a formal objection on eFiling, within the prescribed period, with evidence attached." } } },
      { variantId: "txx-as-op-tf", step: { type: "true-false", statement: "Objecting to an assessment automatically suspends the obligation to pay.", correct: false, feedback: { correct: "Right. You must separately request a suspension of payment, otherwise interest continues to run.", incorrect: "It doesn't. Request suspension of payment separately, or the debt keeps accruing interest." } } },
      { variantId: "txx-as-op-sc", step: { type: "scenario", question: "Lerato objects but SARS disallows it. What's her next step?", options: ["Appeal, then the Tax Ombud", "Accept the outcome as final", "Re-submit the same objection", "Stop filing returns entirely"], correct: 0, feedback: { correct: "Right. There's a defined escalation path, and the Tax Ombud handles procedural complaints free of charge.", incorrect: "There's an appeal process beyond objection, plus the Tax Ombud for procedural issues." } } },
    ],
  },
];

export const TAXES_EXTRA_BANKS: Record<string, LessonBank> = {
  "taxes::lesson-irp5-tax-certificates": {
    layout: L(certSlots, "Your Annual Tax Documents", "<p>Your <strong>IRP5</strong> is your employer's annual certificate of what they paid you and deducted. SARS gets a copy, which is how auto-assessments appear. <strong>IT3(b)</strong> reports interest and dividends; <strong>IT3(c)</strong> reports capital gains. Key source codes: <strong>3601</strong> income, <strong>4102</strong> PAYE, <strong>4001</strong> retirement fund contributions, <strong>4005</strong> medical scheme fees. Reconcile it against your payslips before filing, and keep everything for five years.</p>"),
    slots: certSlots,
  },
  "taxes::lesson-donations-estate-tax": {
    layout: L(donSlots, "Giving Isn't Always Free", "<p><strong>Donations tax</strong>: individuals get a <strong>R100 000 annual exemption</strong>, and the excess is taxed at 20% (25% above R30m cumulative), payable by the <em>donor</em>. Donations to a spouse are exempt without limit. <strong>Estate duty</strong> allows a <strong>R3.5m abatement</strong>, portable between spouses to R7m, with everything left to a spouse deductible under section 4(q). Life policies on your life are <strong>deemed property</strong> even when paid to a nominated beneficiary.</p>"),
    slots: donSlots,
  },
  "taxes::lesson-tax-on-investments": {
    layout: L(invTaxSlots, "Three Ways Returns Are Taxed", "<p><strong>Dividends</strong>: 20% withholding tax, deducted before the money reaches you. <strong>Interest</strong>: exempt to <strong>R23 800</strong> a year under 65 (R34 500 from 65), then taxed at your marginal rate. <strong>Capital gains</strong>: a <strong>R50 000</strong> annual exclusion, then 40% of the gain is added to taxable income: a maximum effective rate of about 18%. Inside a <strong>TFSA</strong>, all three are zero.</p>"),
    slots: invTaxSlots,
  },
  "taxes::lesson-efiling-walkthrough": {
    layout: L(efSlots, "Filing From Your Phone", "<p>eFiling and the SARS MobiApp handle everything online, no branch visit needed. Before accepting an <strong>auto-assessment</strong>, check it against your IRP5, IT3s and any deduction SARS wasn't told about (a private RA, out-of-pocket medical costs, a travel logbook). A <strong>'Supporting Documents Required'</strong> notice is routine verification: upload the proof by the deadline or the claims get disallowed. And keep your banking details verified, or the refund waits.</p>"),
    slots: efSlots,
  },
  "taxes::lesson-applied-sars-assessment": {
    layout: L(assessSlots, "Lerato Gets an Assessment", "<p>Lerato's assessment says she owes <strong>R6 400</strong>. Before paying or objecting, she compares it line by line against her IRP5, IT3s and deduction records. Assessments are built from reported data, and the gap between that and reality is where errors live. An assessment can be <strong>formally objected to</strong> on eFiling within the prescribed period, but objecting doesn't pause the debt unless you also request a suspension of payment.</p>"),
    slots: assessSlots,
  },
};
