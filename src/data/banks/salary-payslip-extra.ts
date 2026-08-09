import type { LessonLayoutItem, QuestionSlot } from "@/data/content";
import type { LessonBank } from "./money-basics";

/**
 * Premium banks for the Salary & Payslip EXTRA lessons (previously rotation-only).
 * Figures follow docs/SA-REGULATORY-FIGURES.md (2026/27): UIF ceiling R17 712
 * (max R177.12), MTC R376/R376/R254, RA deduction 27.5% capped at R430 000,
 * tax threshold R99 000, brackets 18% to R245 100 then 26% to R383 100.
 * variantId prefix: `spx-`.
 */
const info = (title: string, content: string): LessonLayoutItem => ({ type: "info", title, content });
const L = (slots: QuestionSlot[], title: string, content: string): LessonLayoutItem[] => [
  info(title, content),
  ...slots.map((s) => ({ slot: s.slotId })),
];

// ── 13th Cheque and Bonuses ─────────────────────────────────────────────────
const bonusSlots: QuestionSlot[] = [
  {
    slotId: "salary-payslip/bonus/taxed",
    conceptId: "bonus-planning",
    variants: [
      { variantId: "spx-bo-tx-tf", step: { type: "true-false", statement: "A 13th cheque is tax-free because it's a bonus and not part of your salary.", correct: false, feedback: { correct: "Right. Every rand of employment income is taxed, and your employer runs PAYE on the bonus like any other pay.", incorrect: "Bonuses are employment income. PAYE comes off the full amount at your marginal rate, often 31–41%." } } },
      { variantId: "spx-bo-tx-mcq", step: { type: "mcq", question: "Nomsa's December bonus of R25 000 lands and she's in the 31% bracket. What hits her account?", options: ["About R17 250 after PAYE", "The full R25 000: bonuses aren't taxed", "R25 000 now, with tax due to SARS in July", "R12 500, because bonuses are taxed at 50%"], correct: 0, feedback: { correct: "R25 000 × 31% = R7 750 PAYE, so roughly R17 250 nets out. Plan your allocation on that number, not the headline.", incorrect: "PAYE comes off at her marginal 31%: R7 750. She receives about R17 250, not R25 000." } } },
      { variantId: "spx-bo-tx-fill", step: { type: "fill-blank", title: "Bonus PAYE", prompt: "You get a R40 000 bonus and your marginal rate is 31%. PAYE on the bonus = R____.", correct: 12400, feedback: { correct: "R40 000 × 31% = R12 400, leaving about R27 600. Budget the bonus off the net figure.", incorrect: "R40 000 × 31% = R12 400 in PAYE. You net roughly R27 600." } } },
    ],
  },
  {
    slotId: "salary-payslip/bonus/pre-commit",
    conceptId: "bonus-planning",
    variants: [
      { variantId: "spx-bo-pc-mcq", step: { type: "mcq", question: "When should you decide how a year-end bonus gets used?", options: ["Before it lands, in writing", "The day it reflects in your account", "After the December holidays", "Whenever something you want goes on sale"], correct: 0, feedback: { correct: "Right. Pre-commitment beats willpower. Once the money is sitting there, it argues with you.", incorrect: "Decide before payday. Most SA year-end bonuses are gone within three months precisely because nobody planned them." } } },
      { variantId: "spx-bo-pc-tf", step: { type: "true-false", statement: "Deciding a bonus split in advance is mostly pointless. You'll just change your mind when the money arrives.", correct: false, feedback: { correct: "Right. A written plan made before payday is what stops the money leaking into ordinary spending.", incorrect: "Pre-committing works. Willpower fails after the money lands, which is why the plan has to come first." } } },
      { variantId: "spx-bo-pc-sc", step: { type: "scenario", question: "Sipho wants his R20 000 bonus to still exist in March. Best move on the day it's announced?", options: ["Write the split down before payday", "Keep it in his account and decide later", "Tell nobody and see what's left over", "Spend the fun part, save the rest"], correct: 0, feedback: { correct: "Right. Automating the transfers on payday means the money is gone before it can be casually spent.", incorrect: "Write the split down and automate it. Money left sitting in a current account gets absorbed by ordinary spending." } } },
    ],
  },
  {
    slotId: "salary-payslip/bonus/debt-first",
    conceptId: "bonus-planning",
    variants: [
      { variantId: "spx-bo-df-sc", step: { type: "scenario", question: "Lerato gets R30 000. She has R45 000 on a credit card at 20% and no emergency fund. Strongest use?", options: ["R20 000 to the card, R10 000 saved", "Split it evenly across all three goals", "Put all of the R30 000 into one ETF", "Keep all of it in her cheque account"], correct: 0, feedback: { correct: "Clearing 20% debt is a guaranteed 20% return. R20 000 off the card saves about R4 000 a year. The R10 000 buffer stops the next crisis going back on the card.", incorrect: "Kill the 20% debt first: no investment guarantees 20%. Then build a small buffer so the card doesn't get used again." } } },
      { variantId: "spx-bo-df-mcq", step: { type: "mcq", question: "Why does paying off a 20% credit card usually beat investing the same money?", options: ["The 20% saving is guaranteed", "Credit card debt can't be paid off any other way", "SARS gives a rebate for settling card debt", "Investments are taxed at 20% too"], correct: 0, feedback: { correct: "Right. Wiping a 20% debt is a risk-free 20% return, markets can't promise that.", incorrect: "It's the certainty. Clearing 20% interest is a guaranteed 20%, while investment returns are a hope, not a promise." } } },
      { variantId: "spx-bo-df-tf", step: { type: "true-false", statement: "With expensive short-term debt outstanding, a bonus is better used on that debt than on a new investment.", correct: true, feedback: { correct: "Right. High-rate debt is the highest-certainty 'return' available to you.", incorrect: "It's true. Clearing 20%+ debt beats a hoped-for 10% investment return every time." } } },
    ],
  },
  {
    slotId: "salary-payslip/bonus/plan-the-net",
    conceptId: "bonus-planning",
    variants: [
      { variantId: "spx-bo-pn-mcq", step: { type: "mcq", question: "Your bonus letter says R50 000. What number should your plan be built on?", options: ["The net amount after PAYE", "The R50 000 gross", "R50 000 plus your normal salary", "Whatever the HR system estimates in January"], correct: 0, feedback: { correct: "Right. At a 31% rate the R50 000 becomes about R34 500, planning on gross overcommits you by R15 500.", incorrect: "Plan on the net. Gross-based plans always come up short once PAYE has taken its cut." } } },
      { variantId: "spx-bo-pn-fill", step: { type: "fill-blank", title: "Net bonus", prompt: "Bonus R50 000, marginal rate 31%. Amount actually available to allocate = R____.", correct: 34500, feedback: { correct: "R50 000 − (R50 000 × 31% = R15 500) = R34 500. That's the number your plan should use.", incorrect: "PAYE takes R15 500, leaving R34 500. Always allocate from the after-tax figure." } } },
      { variantId: "spx-bo-pn-tf", step: { type: "true-false", statement: "Committing a bonus to purchases based on the gross figure usually leaves you short.", correct: true, feedback: { correct: "Right. The shortfall is exactly the PAYE: often a third of the bonus.", incorrect: "It's true. PAYE takes 31–41% for most earners, so gross-based plans overspend." } } },
    ],
  },
];

// ── Cost to Company ─────────────────────────────────────────────────────────
const ctcSlots: QuestionSlot[] = [
  {
    slotId: "salary-payslip/ctc/not-take-home",
    conceptId: "ctc-structure",
    variants: [
      { variantId: "spx-ct-nt-mcq", step: { type: "mcq", question: "An offer states 'CTC R480 000 per year'. What does that actually mean?", options: ["The total annual cost to the employer", "R40 000 lands in your account monthly", "Your gross salary before PAYE only", "Your take-home after all deductions"], correct: 0, feedback: { correct: "Right. CTC includes employer-side pension, medical aid, UIF and SDL. Take-home from R480k CTC is typically R28 000–R36 000.", incorrect: "CTC is the employer's total cost, not your pay. R480k CTC usually nets R28k–R36k a month." } } },
      { variantId: "spx-ct-nt-tf", step: { type: "true-false", statement: "A R600 000 CTC package means you take home R50 000 a month.", correct: false, feedback: { correct: "Right. Employer contributions and your own deductions come out of that figure first. Net is closer to R33 000–R40 000.", incorrect: "CTC covers employer contributions too, then PAYE and your deductions follow. Net is well below R50 000." } } },
      { variantId: "spx-ct-nt-sc", step: { type: "scenario", question: "Ayesha is offered R42 000 'CTC per month' and budgets R42 000 of spending. What goes wrong?", options: ["Her actual take-home is thousands less", "Nothing. CTC and net pay are the same thing", "She'll be over-taxed and get a refund in July", "Her employer must top up the difference"], correct: 0, feedback: { correct: "Right. After employer contributions, PAYE, UIF and medical aid she might see R28 000–R32 000. Budget from the payslip, not the offer letter.", incorrect: "CTC isn't take-home. Ask for a net-pay breakdown before you commit to any budget or bond." } } },
    ],
  },
  {
    slotId: "salary-payslip/ctc/components",
    conceptId: "ctc-structure",
    variants: [
      { variantId: "spx-ct-cp-mcq", step: { type: "mcq", question: "Which of these sits inside a typical CTC figure but never appears as a deduction on your payslip?", options: ["The employer's SDL contribution", "Your PAYE deduction", "Your own monthly UIF contribution", "Your monthly medical aid contribution"], correct: 0, feedback: { correct: "Right. SDL is 1% of payroll paid by the employer to SARS, it funds SETA training and is never deducted from you.", incorrect: "SDL is employer-only. PAYE, UIF and medical aid all come off your side of the payslip." } } },
      { variantId: "spx-ct-cp-tf", step: { type: "true-false", statement: "Employer pension contributions form part of your CTC even though you never see that cash.", correct: true, feedback: { correct: "Right. It's real money spent on you, count it when comparing offers, even though it doesn't hit your account.", incorrect: "It's true. Employer pension is part of the package cost and part of your retirement savings." } } },
      { variantId: "spx-ct-cp-fill", step: { type: "fill-blank", title: "Employer pension", prompt: "Gross salary R40 000/month. The employer contributes 7.5% to the pension fund. That is R____ per month from the employer.", correct: 3000, feedback: { correct: "R40 000 × 7.5% = R3 000 a month, or R36 000 a year of real value in your package.", incorrect: "R40 000 × 7.5% = R3 000/month. R36 000 a year you should count when comparing offers." } } },
    ],
  },
  {
    slotId: "salary-payslip/ctc/same-ctc-differs",
    conceptId: "ctc-structure",
    variants: [
      { variantId: "spx-ct-sd-tf", step: { type: "true-false", statement: "Two offers with identical CTC always give you the same take-home pay.", correct: false, feedback: { correct: "Right. How the package is split between basic, medical aid and pension changes both your net pay and your tax position.", incorrect: "Structure matters. Same CTC, different splits, different net pay. Always compare the breakdowns." } } },
      { variantId: "spx-ct-sd-sc", step: { type: "scenario", question: "Johan compares two R480 000 CTC offers. Job A is mostly basic salary; Job B has a lower basic with generous employer medical aid and pension. What should he do?", options: ["Compare net pay plus benefit value", "Take Job A, since more cash is better", "Take Job B, benefits beat cash", "Flip a coin, since the CTC is identical"], correct: 0, feedback: { correct: "Right. Group medical rates and pre-tax retirement contributions often make Job B worth more, but only the breakdown tells you.", incorrect: "Neither wins automatically. Get both breakdowns. Net pay and benefit value together decide it." } } },
      { variantId: "spx-ct-sd-mcq", step: { type: "mcq", question: "The single most useful question to ask a recruiter about a CTC offer is:", options: ["What is the monthly net pay?", "How many people applied for it?", "When is the annual increase cycle?", "Does the company have a gym?"], correct: 0, feedback: { correct: "Right. The breakdown turns an abstract CTC number into something you can actually budget against.", incorrect: "Ask for the net-pay estimate and the breakdown. That's the only way to compare offers honestly." } } },
    ],
  },
  {
    slotId: "salary-payslip/ctc/sdl",
    conceptId: "sdl",
    variants: [
      { variantId: "spx-ct-sl-mcq", step: { type: "mcq", question: "The Skills Development Levy is:", options: ["1% of payroll, paid by the employer", "1% of your salary, deducted from your pay", "A voluntary training contribution scheme", "A SARS penalty on late payroll"], correct: 0, feedback: { correct: "Right. It's an employer cost funding SETA learnerships and bursaries: you benefit through employer-funded training.", incorrect: "SDL is 1% of payroll and employer-paid. If it ever appears as a deduction on your payslip, query it." } } },
      { variantId: "spx-ct-sl-tf", step: { type: "true-false", statement: "If SDL appears as a deduction on your payslip, that's a payroll error worth querying.", correct: true, feedback: { correct: "Right. SDL is employer-only, so a deduction line for it should never appear against your pay.", incorrect: "It's true. SDL is never deducted from an employee, raise it with payroll in writing." } } },
      { variantId: "spx-ct-sl-sc", step: { type: "scenario", question: "Thabo's payslip shows 'SDL R250' under deductions, reducing his net pay. What should he do?", options: ["Email payroll and ask for a refund", "Nothing, SDL is a normal deduction", "Report it to SARS as tax fraud", "Wait to see if it stops"], correct: 0, feedback: { correct: "Right. SDL is an employer levy, so R250 has been wrongly deducted. Written queries create the paper trail for a refund.", incorrect: "This is a payroll error. SDL is employer-only. Raise it in writing with payroll straight away." } } },
    ],
  },
];

// ── Filing Your Tax Return ──────────────────────────────────────────────────
const filingSlots: QuestionSlot[] = [
  {
    slotId: "salary-payslip/filing/who-files",
    conceptId: "tax-filing",
    variants: [
      { variantId: "spx-fi-wf-mcq", step: { type: "mcq", question: "Which of these makes filing a return compulsory for a salaried employee?", options: ["Freelance income of R45 000", "One employer for the full year", "A correct SARS auto-assessment", "Belonging to a medical aid"], correct: 0, feedback: { correct: "Right. Non-salary income above R30 000 also puts you into provisional tax territory, so it must be declared.", incorrect: "Extra income is the trigger. One salary with correct PAYE and an accurate auto-assessment usually needs no return." } } },
      { variantId: "spx-fi-wf-tf", step: { type: "true-false", statement: "If you have a single employer, correct PAYE and an accurate auto-assessment, you generally don't need to file a return.", correct: true, feedback: { correct: "Right. Accept the auto-assessment and you're done, but check it against your IRP5 first.", incorrect: "It's true in that narrow case. Extra income or unclaimed deductions change the answer." } } },
      { variantId: "spx-fi-wf-sc", step: { type: "scenario", question: "Priya earns a salary and R60 000 a year from weekend photography. What does she need to do?", options: ["File a return and register provisionally", "Nothing, PAYE already covers her", "Only declare it if a client issues an IRP5", "Wait for SARS to ask about it"], correct: 0, feedback: { correct: "Right. Non-salary income above R30 000 a year means provisional tax and a full return. She can also claim genuine business expenses.", incorrect: "R60 000 of non-salary income must be declared, and above R30 000 she's a provisional taxpayer." } } },
    ],
  },
  {
    slotId: "salary-payslip/filing/auto-assessment",
    conceptId: "tax-filing",
    variants: [
      { variantId: "spx-fi-aa-mcq", step: { type: "mcq", question: "SARS sends an auto-assessment showing a R2 400 refund and it matches your IRP5. Best action?", options: ["Check it, then accept it", "Ignore it and hope it arrives", "File manually for a bigger refund", "Phone SARS to dispute it"], correct: 0, feedback: { correct: "Right. Once accepted, refunds usually pay out within a few weeks. Provided your banking details on eFiling are current.", incorrect: "Check it against your IRP5 and accept it. Disputing an accurate assessment just delays your refund." } } },
      { variantId: "spx-fi-aa-tf", step: { type: "true-false", statement: "An auto-assessment should be accepted without checking, because SARS calculates it from official data.", correct: false, feedback: { correct: "Right. SARS only sees what was submitted. Missing RA contributions or medical claims can leave you out of pocket.", incorrect: "Always check first. Auto-assessments miss deductions SARS wasn't told about, like an RA outside your employer." } } },
      { variantId: "spx-fi-aa-sc", step: { type: "scenario", question: "Your auto-assessment ignores the R30 000 you paid into a private RA. What now?", options: ["Reject it and claim the RA", "Accept it, it can't be changed", "Claim it next year instead", "Ask your employer to fix the IRP5"], correct: 0, feedback: { correct: "Right. A private RA doesn't appear on your IRP5, so you file to claim it: at a 31% rate that R30 000 is worth about R9 300.", incorrect: "You can reject an auto-assessment and file. Claiming a private RA contribution is exactly why you'd do that." } } },
    ],
  },
  {
    slotId: "salary-payslip/filing/late-penalty",
    conceptId: "tax-filing",
    variants: [
      { variantId: "spx-fi-lp-tf", step: { type: "true-false", statement: "If you owe SARS and can't pay, it's better to delay filing until you have the money.", correct: false, feedback: { correct: "Right. Filing and paying are separate. File on time, then arrange a payment plan. Late filing adds its own penalty.", incorrect: "Never delay the filing. SARS penalises late returns separately, and payment arrangements are available for what you owe." } } },
      { variantId: "spx-fi-lp-fill", step: { type: "fill-blank", title: "Late filing penalty", prompt: "SARS charges an administrative penalty of R250 per month for a late return. Filing five months late costs R____.", correct: 1250, feedback: { correct: "R250 × 5 = R1 250, and it's completely avoidable. The penalty applies even when SARS owes you money.", incorrect: "R250 × 5 months = R1 250 in penalties, entirely avoidable by filing on time." } } },
      { variantId: "spx-fi-lp-mcq", step: { type: "mcq", question: "You've missed the filing deadline and owe R8 000. What limits the damage?", options: ["File now, then arrange terms", "Wait until you can pay in full", "Skip this year, file two next year", "Dispute it to pause the penalties"], correct: 0, feedback: { correct: "Right. The monthly admin penalty keeps running until the return is in, so filing stops the bleeding.", incorrect: "File first. The penalty clock is tied to the outstanding return, not the outstanding payment." } } },
    ],
  },
  {
    slotId: "salary-payslip/filing/travel-logbook",
    conceptId: "tax-deductions",
    variants: [
      { variantId: "spx-fi-tl-sc", step: { type: "scenario", question: "You receive a R3 000/month travel allowance but kept no logbook. At assessment, SARS:", options: ["Includes 80% in your taxable income", "Treats the whole allowance as tax-free", "Includes exactly half of it", "Ignores allowances under R5 000"], correct: 0, feedback: { correct: "Right. No logbook means no proof of business travel, so 80% is taxed. A compliant logbook can claw much of that back.", incorrect: "Without a logbook, 80% of the allowance is included in taxable income. The logbook is what proves business use." } } },
      { variantId: "spx-fi-tl-mcq", step: { type: "mcq", question: "A SARS-compliant travel logbook must record:", options: ["Date, kilometres and business purpose", "Only the total kilometres for the year", "Fuel slips and nothing else", "Just the trips over 50km"], correct: 0, feedback: { correct: "Right. Without those four elements SARS can reject the claim entirely, even if you really did travel.", incorrect: "Date, kilometres, destination and business reason, all four, per trip. Fuel slips alone prove nothing." } } },
      { variantId: "spx-fi-tl-tf", step: { type: "true-false", statement: "Keeping a travel logbook is only worth it if you drive for business more than half the time.", correct: false, feedback: { correct: "Right. Any real business travel reduces the taxable portion. Even modest mileage is worth recording.", incorrect: "There's no halfway threshold. Every properly recorded business kilometre reduces the taxable part of the allowance." } } },
    ],
  },
];

// ── Salary Structuring for Tax Efficiency ───────────────────────────────────
const structSlots: QuestionSlot[] = [
  {
    slotId: "salary-payslip/structure/ra-saving",
    conceptId: "ra-tax-deduction",
    variants: [
      { variantId: "spx-st-rs-mcq", step: { type: "mcq", question: "You're in the 36% bracket and add R5 000/month to your RA. What happens to your PAYE?", options: ["It drops by about R1 800 a month", "It stays the same until you retire", "It drops by the full R5 000", "It rises because RAs are taxed"], correct: 0, feedback: { correct: "R5 000 × 36% = R1 800 less PAYE, so R5 000 of investing costs you R3 200 of take-home.", incorrect: "The saving is your marginal rate on the contribution: R5 000 × 36% = R1 800 a month." } } },
      { variantId: "spx-st-rs-fill", step: { type: "fill-blank", title: "PAYE saving", prompt: "Marginal rate 31%. You increase your monthly RA contribution by R4 000. Monthly PAYE saving = R____.", correct: 1240, feedback: { correct: "R4 000 × 31% = R1 240, so the R4 000 contribution costs only R2 760 of take-home pay.", incorrect: "R4 000 × 31% = R1 240 less PAYE each month." } } },
      { variantId: "spx-st-rs-tf", step: { type: "true-false", statement: "An RA contribution reduces your take-home pay by less than the amount you contribute.", correct: true, feedback: { correct: "Right. The PAYE saving comes back to you, so a R5 000 contribution at 36% feels like R3 200.", incorrect: "It's true. Because the contribution is deducted before tax, your net pay falls by less than you invest." } } },
    ],
  },
  {
    slotId: "salary-payslip/structure/avoidance-evasion",
    conceptId: "tax-deductions",
    variants: [
      { variantId: "spx-st-ae-tf", step: { type: "true-false", statement: "Using RAs and TFSAs to lower your tax bill is tax evasion.", correct: false, feedback: { correct: "Right. That's tax avoidance, legal, and built into the Income Tax Act deliberately. Evasion is hiding income, which is criminal.", incorrect: "Those are legal allowances the Act provides. Evasion means concealing income or claiming false deductions." } } },
      { variantId: "spx-st-ae-mcq", step: { type: "mcq", question: "Which of these is tax evasion rather than legitimate planning?", options: ["Not declaring R80 000 of freelance income", "Claiming a valid RA deduction", "Contributing to a TFSA", "Claiming real home-office costs"], correct: 0, feedback: { correct: "Right. Concealing income is a criminal offence. The other three are allowances SARS explicitly provides.", incorrect: "Hiding income is evasion. RAs, TFSAs and genuine home-office claims are all lawful." } } },
      { variantId: "spx-st-ae-sc", step: { type: "scenario", question: "A colleague suggests invoicing part of your salary through a friend's company to 'save tax'. This is:", options: ["A scheme SARS treats as evasion", "Standard salary structuring", "Fine as long as amounts stay small", "Allowed if the company is VAT registered"], correct: 0, feedback: { correct: "Right. Disguising employment income is evasion. Penalties can reach 200% of the tax, plus interest.", incorrect: "That's evasion, not structuring. Real structuring changes what you're paid, not who pretends to pay it." } } },
    ],
  },
  {
    slotId: "salary-payslip/structure/ra-limit",
    conceptId: "ra-tax-deduction",
    variants: [
      { variantId: "spx-st-rl-mcq", step: { type: "mcq", question: "The retirement-fund deduction is capped at:", options: ["27.5%, up to R430 000 a year", "27.5% with no rand ceiling", "15% of taxable income", "R430 000 regardless of income"], correct: 0, feedback: { correct: "Right. Both tests apply, and the lower one binds. Contributions above the cap roll forward, they aren't lost.", incorrect: "It's 27.5% of income and a R430 000 annual cap, whichever is lower. Excess rolls over to future years." } } },
      { variantId: "spx-st-rl-fill", step: { type: "fill-blank", title: "Your deduction limit", prompt: "Your taxable income is R600 000. 27.5% of that is R____: your deductible retirement-fund limit for the year.", correct: 165000, feedback: { correct: "R600 000 × 27.5% = R165 000, comfortably below the R430 000 rand cap, so the percentage is what binds.", incorrect: "R600 000 × 27.5% = R165 000. The R430 000 cap only bites at much higher incomes." } } },
      { variantId: "spx-st-rl-sc", step: { type: "scenario", question: "Johan earns R960 000 a year and contributes R240 000 to his RA. Is that fully deductible?", options: ["Yes, under both the % and rand caps", "No, it exceeds the annual cap", "No, RAs are capped at R10 000 a month", "Only 15% of it is deductible"], correct: 0, feedback: { correct: "R960 000 × 27.5% = R264 000, and R240 000 sits under that and under R430 000. Full deduction, taxable income down to R720 000.", incorrect: "27.5% of R960 000 is R264 000, and the cap is R430 000. His R240 000 clears both tests." } } },
    ],
  },
  {
    slotId: "salary-payslip/structure/employer-benefits",
    conceptId: "ctc-structure",
    variants: [
      { variantId: "spx-st-eb-mcq", step: { type: "mcq", question: "Why can employer-paid medical aid beat the same value paid as cash?", options: ["Group rates beat individual rates", "Medical aid is completely untaxed", "Cash salary is taxed at 45% for all", "Employers refund it at year-end"], correct: 0, feedback: { correct: "Right. Group pricing plus the medical scheme fees tax credit usually beats buying the same cover yourself.", incorrect: "The advantage is group pricing and the tax credit. The benefit itself is still a taxable fringe benefit." } } },
      { variantId: "spx-st-eb-tf", step: { type: "true-false", statement: "Working from home always entitles you to a home-office tax deduction.", correct: false, feedback: { correct: "Right. SARS requires a dedicated, regularly and exclusively used room, and for most employees, that more than half of your work happens there.", incorrect: "It's conditional. A kitchen table doesn't qualify, SARS wants a dedicated space used exclusively for work." } } },
      { variantId: "spx-st-eb-sc", step: { type: "scenario", question: "You want a lower PAYE bill legally. Which lever is available to most salaried employees?", options: ["Raise your retirement contribution", "Asking to be paid in cash", "Registering as a company to invoice", "Declaring fewer months of income"], correct: 0, feedback: { correct: "Right. It's the cleanest legal lever: it lowers taxable income now and builds retirement savings at the same time.", incorrect: "The retirement-fund deduction is the reliable, legal option. The others range from useless to criminal." } } },
    ],
  },
];

// ── Spotting and Fixing Payslip Errors ──────────────────────────────────────
const errorSlots: QuestionSlot[] = [
  {
    slotId: "salary-payslip/errors/report-fast",
    conceptId: "payslip-errors",
    variants: [
      { variantId: "spx-er-rf-mcq", step: { type: "mcq", question: "Your payslip deducts R1 500 for medical aid but HR confirmed R1 100. What now?", options: ["Email payroll with the evidence", "Accept it, payroll is right", "Wait a month for it to correct", "Ask your bank to reverse it"], correct: 0, feedback: { correct: "Right. Written queries create a record, and overdeductions are normally corrected in the next pay cycle.", incorrect: "Raise it in writing straight away. Silence makes the error look accepted and harder to reverse later." } } },
      { variantId: "spx-er-rf-tf", step: { type: "true-false", statement: "Payslip errors should be raised in writing rather than in a corridor conversation.", correct: true, feedback: { correct: "Right. Written evidence is what protects you if the correction doesn't happen or is disputed later.", incorrect: "It's true. A verbal query leaves no record. Email payroll and keep the reply." } } },
      { variantId: "spx-er-rf-sc", step: { type: "scenario", question: "Nomsa notices her pension deduction changed without explanation three months ago. Best first step?", options: ["Compare the three payslips", "Assume the fund changed its rates", "Stop contributing to the fund", "Report the employer to the CCMA immediately"], correct: 0, feedback: { correct: "Right. Compare the documents first. A clear query with dates and amounts gets fixed far faster than a vague complaint.", incorrect: "Gather the payslips and query payroll in writing. Escalation comes later, if they don't fix it." } } },
    ],
  },
  {
    slotId: "salary-payslip/errors/bcea-deductions",
    conceptId: "payslip-errors",
    variants: [
      { variantId: "spx-er-bd-tf", step: { type: "true-false", statement: "An employer may deduct the cost of damaged company equipment from your salary without your written consent.", correct: false, feedback: { correct: "Right. The Basic Conditions of Employment Act requires prior written consent or a court order for that kind of deduction.", incorrect: "The BCEA prohibits it. Deductions for loss or damage need written consent or a court order." } } },
      { variantId: "spx-er-bd-mcq", step: { type: "mcq", question: "Your employer deducts R2 000 for a broken company laptop without asking you. Where do you take it?", options: ["The CCMA or Employment and Labour", "The National Financial Ombud office", "SARS directly", "The National Credit Regulator"], correct: 0, feedback: { correct: "Right. Unauthorised salary deductions are an employment matter, the CCMA and Labour handle them, not financial ombuds.", incorrect: "This is an employment law issue. The CCMA or Department of Employment and Labour is the right forum." } } },
      { variantId: "spx-er-bd-sc", step: { type: "scenario", question: "Sipho is asked to sign a blanket consent allowing 'any deduction the company deems necessary'. Sensible response?", options: ["Ask for it to be specific first", "Sign it, refusing looks difficult", "Sign it and dispute later", "Resign from the job"], correct: 0, feedback: { correct: "Right. Consent should be specific. An open-ended authorisation hands over control of your pay.", incorrect: "Push for specifics. A blanket consent is exactly what the BCEA's protection is designed to prevent." } } },
    ],
  },
  {
    slotId: "salary-payslip/errors/payslip-rights",
    conceptId: "payslip-errors",
    variants: [
      { variantId: "spx-er-pr-mcq", step: { type: "mcq", question: "Under the BCEA, how often must your employer give you a payslip?", options: ["Every payday, in writing", "Once a year with your IRP5", "Only when you ask for one", "Whenever your salary changes"], correct: 0, feedback: { correct: "Right. Section 33 requires written details of pay and deductions on each payday. No payslip is itself a breach.", incorrect: "Every payday. If you're not getting one, that's a BCEA breach worth raising." } } },
      { variantId: "spx-er-pr-tf", step: { type: "true-false", statement: "An employer that deducts UIF from you but never pays it over to the Fund is acting lawfully.", correct: false, feedback: { correct: "Right. Deducted UIF must be paid over. Otherwise your claim for benefits can fail when you need it most.", incorrect: "That's unlawful. Check your UIF status with the Department of Employment and Labour if you suspect it." } } },
      { variantId: "spx-er-pr-sc", step: { type: "scenario", question: "Lerato has never received a payslip in eight months of employment. What should she do?", options: ["Request them in writing", "Nothing. Small employers are exempt", "Only act when she leaves the job", "Ask a colleague for theirs as a reference"], correct: 0, feedback: { correct: "Right. There's no small-employer exemption. Ask in writing first, then escalate to Labour or the CCMA.", incorrect: "Every employee is entitled to a payslip each payday. Request in writing, then escalate." } } },
    ],
  },
  {
    slotId: "salary-payslip/errors/uif-check",
    conceptId: "uif",
    variants: [
      { variantId: "spx-er-uc-fill", step: { type: "fill-blank", title: "UIF sanity check", prompt: "UIF is 1% of earnings, capped at monthly earnings of R17 712. You earn R30 000/month. Your UIF deduction, to the nearest rand, is R____.", correct: 177, feedback: { correct: "The cap bites: 1% of R17 712 = R177.12. Anything much higher on your payslip is an error worth querying.", incorrect: "Above the R17 712 ceiling the deduction freezes at R177.12: roughly R177, not 1% of R30 000." } } },
      { variantId: "spx-er-uc-mcq", step: { type: "mcq", question: "Your payslip shows a UIF deduction of R300 on a R30 000 salary. What does that tell you?", options: ["It's wrong, UIF caps at about R177.12 a month", "It's correct. UIF is 1% of gross with no ceiling", "It's correct if you have dependants", "UIF varies with your tax bracket"], correct: 0, feedback: { correct: "Right. The ceiling is R17 712 of monthly earnings, so R177.12 is the maximum either party pays.", incorrect: "UIF is capped. On any salary above R17 712 the deduction should be about R177.12." } } },
      { variantId: "spx-er-uc-tf", step: { type: "true-false", statement: "Your employer contributes the same UIF amount as you do.", correct: true, feedback: { correct: "Right. It's 1% from each side, so the Fund receives about R354.24 a month for a higher earner.", incorrect: "It's true, 1% employee plus 1% employer, both subject to the same R17 712 earnings ceiling." } } },
    ],
  },
];

// ── Medical Aid on Your Payslip ─────────────────────────────────────────────
const medSlots: QuestionSlot[] = [
  {
    slotId: "salary-payslip/medical/mtc-amounts",
    conceptId: "medical-tax-credit",
    variants: [
      { variantId: "spx-md-ma-fill", step: { type: "fill-blank", title: "Medical tax credit", prompt: "The Medical Scheme Fees Tax Credit is R376 for the main member, R376 for the first dependant and R254 for each additional one. You cover yourself and one dependant. Monthly credit = R____.", correct: 752, feedback: { correct: "R376 + R376 = R752 a month, about R9 024 a year straight off your tax bill.", incorrect: "R376 (member) + R376 (first dependant) = R752 a month." } } },
      { variantId: "spx-md-ma-mcq", step: { type: "mcq", question: "Ayesha covers herself, her husband and two children. Her monthly medical tax credit is:", options: ["R1 260", "R752", "R1 504", "R376"], correct: 0, feedback: { correct: "R376 + R376 + (2 × R254) = R1 260 a month, roughly R15 120 a year off her tax.", incorrect: "Main member R376, first dependant R376, then R254 each for the two children: R1 260." } } },
      { variantId: "spx-md-ma-tf", step: { type: "true-false", statement: "The medical tax credit is the same rand amount for every dependant you add.", correct: false, feedback: { correct: "Right. The first dependant gets R376; each one after that gets R254.", incorrect: "The first dependant is worth R376, additional dependants R254 each." } } },
    ],
  },
  {
    slotId: "salary-payslip/medical/credit-not-deduction",
    conceptId: "medical-tax-credit",
    variants: [
      { variantId: "spx-md-cd-mcq", step: { type: "mcq", question: "What's the difference between a tax credit and a tax deduction?", options: ["A credit comes off the tax you owe", "They're two words for the same thing", "A credit only applies at retirement", "A deduction is worth more to low earners"], correct: 0, feedback: { correct: "Right. That's why a credit is worth the same rands to everyone, while a deduction is worth more at higher marginal rates.", incorrect: "A credit reduces tax owed directly. A deduction reduces the income the tax is calculated on." } } },
      { variantId: "spx-md-cd-tf", step: { type: "true-false", statement: "The medical scheme fees credit is worth more to a high earner than to a low earner.", correct: false, feedback: { correct: "Right. It's a flat rand credit against tax owed, so R752 is R752 whatever your bracket.", incorrect: "It's a flat credit, not a deduction. The rand value is identical across brackets." } } },
      { variantId: "spx-md-cd-sc", step: { type: "scenario", question: "Your payslip shows the medical tax credit already applied. What does that mean for your monthly PAYE?", options: ["Your PAYE is already reduced", "You get it as a refund in July", "You must claim it on eFiling", "It only counts if you file"], correct: 0, feedback: { correct: "Right. Employers apply it in the monthly PAYE calculation, so the benefit reaches you every payday.", incorrect: "It's applied monthly through payroll: you don't wait for assessment to get it." } } },
    ],
  },
  {
    slotId: "salary-payslip/medical/gap-cover",
    conceptId: "medical-tax-credit",
    variants: [
      { variantId: "spx-md-gc-mcq", step: { type: "mcq", question: "Gap cover exists to:", options: ["Pay shortfalls above tariff", "Replace medical aid for young people", "Cover premiums if you lose your job", "Pay for dentistry and glasses"], correct: 0, feedback: { correct: "Right. Specialists often charge two to four times scheme tariff, and that shortfall lands on you without gap cover.", incorrect: "It covers the shortfall above scheme rates. It isn't a substitute for medical aid. You need the scheme first." } } },
      { variantId: "spx-md-gc-tf", step: { type: "true-false", statement: "Gap cover on its own is enough. You don't need a medical scheme as well.", correct: false, feedback: { correct: "Right. Gap cover only tops up what a scheme pays, so without a scheme it pays nothing.", incorrect: "Gap cover is a supplement, not a replacement. No scheme means no shortfall to top up." } } },
      { variantId: "spx-md-gc-sc", step: { type: "scenario", question: "Thabo's surgeon charges 300% of scheme tariff for a R40 000 procedure covered at 100%. Without gap cover he pays:", options: ["R80 000 out of pocket", "Nothing at all", "R40 000", "R12 000"], correct: 0, feedback: { correct: "The scheme pays R40 000 of a R120 000 bill, leaving R80 000. That gap is exactly what gap cover is for.", incorrect: "300% of R40 000 is R120 000; the scheme pays R40 000, so R80 000 is his." } } },
    ],
  },
  {
    slotId: "salary-payslip/medical/plan-choice",
    conceptId: "medical-tax-credit",
    variants: [
      { variantId: "spx-md-pc-tf", step: { type: "true-false", statement: "Only comprehensive plans must cover Prescribed Minimum Benefits. Hospital plans are exempt.", correct: false, feedback: { correct: "Right. PMBs apply to every registered option, hospital plans included. That's a legal floor, not a plan feature.", incorrect: "PMBs are compulsory on all registered scheme options, at every price point." } } },
      { variantId: "spx-md-pc-sc", step: { type: "scenario", question: "Priya compares a R1 800 hospital plan with a R4 200 comprehensive plan. She sees a GP four times a year at R700 and spends R500/month on chronic medication. What's the honest comparison?", options: ["About R20 000 ahead on premiums", "The hospital plan costs her more", "The two options work out the same", "The comprehensive plan is always safer"], correct: 0, feedback: { correct: "GP R2 800 + medication R6 000 = R8 800 against a R28 800 premium saving. The catch is needing that R8 800 available when it's needed.", incorrect: "Premium saving R28 800, out-of-pocket R8 800, so about R20 000 ahead. Provided she can fund the day-to-day costs." } } },
      { variantId: "spx-md-pc-mcq", step: { type: "mcq", question: "The main risk of downgrading to a hospital plan is that:", options: ["Day-to-day costs come out of pocket", "Hospital plans exclude all emergencies", "You lose the medical tax credit", "You can never upgrade again"], correct: 0, feedback: { correct: "Right. The saving is real, but only if the day-to-day money is actually set aside rather than spent.", incorrect: "The credit continues and emergencies are covered. The risk is unfunded day-to-day costs." } } },
    ],
  },
];

// ── Decode a Real Payslip (applied) ─────────────────────────────────────────
const decodeSlots: QuestionSlot[] = [
  {
    slotId: "salary-payslip/decode/net-pay",
    conceptId: "gross-vs-net",
    variants: [
      { variantId: "spx-dc-np-sc", step: { type: "scenario", question: "Sipho's gross is R25 000. His employee deductions are RA R1 250, medical aid R800, PAYE R3 381 and UIF R177. His employer also pays R250 SDL. What's his net pay?", options: ["R19 392", "R19 142", "R21 573", "R20 642"], correct: 0, feedback: { correct: "R25 000 − R5 608 in employee deductions = R19 392. The R250 SDL is employer-only and never comes off his pay.", incorrect: "Add only the employee deductions: R1 250 + R800 + R3 381 + R177 = R5 608. R25 000 − R5 608 = R19 392." } } },
      { variantId: "spx-dc-np-fill", step: { type: "fill-blank", title: "Net pay", prompt: "Gross R25 000. Employee deductions total R5 608. Net pay = R____.", correct: 19392, feedback: { correct: "R25 000 − R5 608 = R19 392. The number your budget should actually use.", incorrect: "R25 000 − R5 608 = R19 392." } } },
      { variantId: "spx-dc-np-mcq", step: { type: "mcq", question: "On a payslip, 'net pay' means:", options: ["Gross pay less all deductions", "Gross pay less PAYE only", "Your CTC divided by twelve", "Gross pay less employer costs"], correct: 0, feedback: { correct: "Right. PAYE, UIF, pension and medical aid all come off before the amount that reaches your bank.", incorrect: "Net is gross minus all employee deductions, not just PAYE." } } },
    ],
  },
  {
    slotId: "salary-payslip/decode/sdl-line",
    conceptId: "sdl",
    variants: [
      { variantId: "spx-dc-sd-mcq", step: { type: "mcq", question: "Sipho's payslip lists SDL R250 in the employer column. How does it affect his take-home?", options: ["Not at all, it's an employer cost", "It reduces his net pay by the R250", "It's added to his taxable income", "It's refunded to him in July"], correct: 0, feedback: { correct: "Right. SDL funds SETA training and is paid by the employer on top of your pay.", incorrect: "SDL never reduces employee pay. It sits in the employer column because the employer pays it." } } },
      { variantId: "spx-dc-sd-tf", step: { type: "true-false", statement: "Employer contributions listed on a payslip should be subtracted when working out your take-home pay.", correct: false, feedback: { correct: "Right. Only the employee column comes off your pay. Employer costs are part of the package, not a deduction.", incorrect: "Subtract only employee deductions. Employer contributions never reduce your net pay." } } },
      { variantId: "spx-dc-sd-sc", step: { type: "scenario", question: "A friend calculates his net pay by subtracting every line on the payslip, including the employer pension and SDL. What's wrong?", options: ["He's double-counting", "Nothing, that's the correct method", "He's forgotten to add UIF back", "He should also subtract his gross"], correct: 0, feedback: { correct: "Right. Employer contributions are the company's cost. Only the employee column reduces what reaches his account.", incorrect: "He's subtracting the employer's costs from his own pay. Only employee deductions count." } } },
    ],
  },
  {
    slotId: "salary-payslip/decode/uif-cap",
    conceptId: "uif",
    variants: [
      { variantId: "spx-dc-uc-mcq", step: { type: "mcq", question: "Sipho earns R25 000 and his UIF line shows R177.12. Why isn't it R250?", options: ["UIF is capped at R17 712 a month", "UIF is calculated on net pay", "His employer is underpaying his UIF", "UIF is 0.7% for salaried staff"], correct: 0, feedback: { correct: "Right. 1% of the R17 712 ceiling is R177.12, and that's the maximum either he or his employer pays.", incorrect: "There's an earnings ceiling of R17 712. Above it, the 1% stops growing at R177.12." } } },
      { variantId: "spx-dc-uc-tf", step: { type: "true-false", statement: "Someone earning R12 000 a month pays less UIF than someone earning R40 000.", correct: true, feedback: { correct: "Right. R12 000 is below the ceiling, so 1% is R120, while the higher earner sits at the R177.12 cap.", incorrect: "It's true. Below the R17 712 ceiling UIF is a straight 1%, so R12 000 gives R120." } } },
      { variantId: "spx-dc-uc-fill", step: { type: "fill-blank", title: "UIF below the cap", prompt: "You earn R12 000 a month, below the R17 712 UIF ceiling. Your UIF deduction = R____.", correct: 120, feedback: { correct: "R12 000 × 1% = R120. Only earnings above R17 712 are ignored for UIF.", incorrect: "Below the ceiling it's a straight 1%: R12 000 × 1% = R120." } } },
    ],
  },
  {
    slotId: "salary-payslip/decode/ra-double-benefit",
    conceptId: "ra-tax-deduction",
    variants: [
      { variantId: "spx-dc-rd-mcq", step: { type: "mcq", question: "Sipho contributes R1 250 a month to his RA. Besides building retirement savings, what else does it do?", options: ["Reduces his taxable income", "Increases his UIF contribution", "Raises his medical tax credit", "Nothing until he retires"], correct: 0, feedback: { correct: "Right. The contribution comes off before tax, so at an 18–26% rate it costs him noticeably less than R1 250 of take-home.", incorrect: "It lowers taxable income now. That's the double benefit, retirement savings plus a smaller PAYE bill." } } },
      { variantId: "spx-dc-rd-tf", step: { type: "true-false", statement: "An employee RA contribution reduces both your retirement shortfall and your current tax bill.", correct: true, feedback: { correct: "Right. It's one of the few moves that helps your future self and your current cash flow at once.", incorrect: "It's true. Deductible contributions cut taxable income today while the money compounds for retirement." } } },
      { variantId: "spx-dc-rd-sc", step: { type: "scenario", question: "Sipho's employer also puts R1 250 into the fund. How should he think about that?", options: ["As part of his real package", "As money he can withdraw anytime", "As irrelevant, it isn't his account", "As taxable income to declare"], correct: 0, feedback: { correct: "Right. It's R15 000 a year of genuine value, count it when comparing job offers.", incorrect: "It's real value in your package and your fund, even though it never touches your bank account." } } },
    ],
  },
];

export const SALARY_PAYSLIP_EXTRA_BANKS: Record<string, LessonBank> = {
  "salary-payslip::lesson-13th-cheque": {
    layout: L(bonusSlots, "The Annual Windfall", "<p>A 13th cheque or performance bonus is a one-off income event, and most of them are gone within three months. Bonuses are <strong>fully taxed as employment income</strong> at your marginal rate, so plan off the net figure. Decide the split <em>before</em> the money lands: high-interest debt and an emergency fund first, then the celebration.</p>"),
    slots: bonusSlots,
  },
  "salary-payslip::lesson-ctc": {
    layout: L(ctcSlots, "Cost to Company Is Not Take-Home", "<p><strong>CTC</strong> is what the employer spends on you in total: salary plus employer pension, medical aid, UIF and SDL. R480 000 CTC usually means R28 000–R36 000 a month in your account. Two identical CTCs can pay differently depending on how they're structured, so always ask for the full breakdown and an estimated net figure.</p>"),
    slots: ctcSlots,
  },
  "salary-payslip::lesson-tax-return-employee": {
    layout: L(filingSlots, "Filing Your Return", "<p>One salary, correct PAYE and an accurate auto-assessment usually means nothing to file. Extra income, or deductions SARS doesn't know about, means you file. Always <strong>check the auto-assessment against your IRP5</strong> before accepting. File on time even if you can't pay. The R250-a-month late penalty is separate from what you owe.</p>"),
    slots: filingSlots,
  },
  "salary-payslip::lesson-salary-tax-efficiency": {
    layout: L(structSlots, "Legally Reducing Your PAYE", "<p>Retirement contributions are deductible up to <strong>27.5% of taxable income, capped at R430 000 a year</strong>, the single biggest legal lever most salaried people have. Employer medical aid benefits from group pricing. All of this is tax <em>avoidance</em>: legal and built into the Act. Hiding income is evasion, and that's criminal.</p>"),
    slots: structSlots,
  },
  "salary-payslip::lesson-payslip-errors": {
    layout: L(errorSlots, "Check Every Payslip", "<p>Payroll errors are common: wrong tax code, wrong UIF, wrong medical rate, overtime missed. The BCEA gives you a <strong>written payslip every payday</strong> and blocks deductions for damages without written consent or a court order. Query errors in writing, immediately. A quick check: UIF should never exceed <strong>R177.12</strong> (1% of the R17 712 ceiling).</p>"),
    slots: errorSlots,
  },
  "salary-payslip::lesson-medical-aid-payslip": {
    layout: L(medSlots, "Medical Aid and the Tax Credit", "<p>The Medical Scheme Fees Tax Credit is <strong>R376</strong> for the main member, <strong>R376</strong> for the first dependant and <strong>R254</strong> for each additional one. Applied monthly through payroll. It's a <em>credit</em> off tax owed, so it's worth the same rands in every bracket. Gap cover tops up the shortfall when specialists charge above scheme tariff; it isn't a replacement for a scheme.</p>"),
    slots: medSlots,
  },
  "salary-payslip::lesson-applied-read-payslip": {
    layout: L(decodeSlots, "Sipho's Payslip", "<p>Sipho earns <strong>R25 000</strong> gross. Employee side: RA R1 250, medical aid R800, PAYE R3 381, UIF R177.12. Employer side: RA R1 250 and SDL R250. Costs the company carries, which never reduce his pay. Net pay = gross minus the <em>employee</em> column only.</p>"),
    slots: decodeSlots,
  },
};
