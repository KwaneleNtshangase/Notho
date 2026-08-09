import type { LessonLayoutItem, QuestionSlot } from "@/data/content";
import type { LessonBank } from "./money-basics";

/**
 * Bank for the Salary & Payslip course. Authored to docs/QUESTION-VOICE-GUIDE.md:
 * every lesson has 4 slots (>3 questions), each slot a pool of genuinely
 * different SA scenarios, all concept-tagged for spaced-repetition resurface.
 */

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 1 · "Gross vs Net Pay"
// ═══════════════════════════════════════════════════════════════════════════

const lesson1Slots: QuestionSlot[] = [
  {
    slotId: "salary-payslip/lesson-1/gross-net-meaning",
    conceptId: "gross-vs-net",
    variants: [
      {
        variantId: "gnm-what-is-25k",
        step: {
          type: "mcq",
          question:
            "Your offer letter says R25 000, but only R18 500 lands in your account. What is the R25 000 called?",
          options: [
            "Your gross salary",
            "Your net take-home salary",
            "Your annual bonus",
            "A payroll error to query",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. Gross is the headline number before PAYE, UIF and other deductions. The R18 500 that actually arrives is your net.",
            incorrect:
              "R25 000 is the gross. The figure before deductions. What lands in your account (R18 500) is the net.",
          },
        },
      },
      {
        variantId: "gnm-lerato-ask",
        step: {
          type: "scenario",
          question:
            "Lerato is offered 'R30 000 a month'. What's the smart thing to check before she celebrates?",
          options: [
            "Whether that's gross or net",
            "Nothing. R30 000 is R30 000",
            "Whether she'll be paid weekly",
            "If there's a 13th cheque",
          ],
          correct: 0,
          feedback: {
            correct:
              "Exactly. 'R30 000 gross' and 'R30 000 net' are very different lives once PAYE and UIF come off. Always ask which one.",
            incorrect:
              "The key question is gross vs net. R30 000 before deductions lands very differently to R30 000 take-home.",
          },
        },
      },
      {
        variantId: "gnm-net-lower-tf",
        step: {
          type: "true-false",
          statement: "Your net salary is always lower than your gross salary.",
          correct: true,
          feedback: {
            correct:
              "True. Deductions (PAYE, UIF, often pension and medical aid) come off gross, so net is always the smaller number.",
            incorrect:
              "It's true: deductions are subtracted from gross to give net, so net is always lower.",
          },
        },
      },
    ],
  },
  {
    slotId: "salary-payslip/lesson-1/progressive-tax",
    conceptId: "tax-brackets",
    variants: [
      {
        variantId: "prog-why",
        step: {
          type: "mcq",
          question: "Why does South Africa use a progressive tax system?",
          options: [
            "Higher earners contribute more",
            "To punish people for earning well",
            "To equalise everyone's income",
            "Because it's easiest to calculate",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. Progressive tax is about proportional contribution: higher earners fund more of the healthcare, schools and roads everyone uses.",
            incorrect:
              "It's about fairness of contribution: higher earners pay a larger share toward shared public services.",
          },
        },
      },
      {
        variantId: "prog-marginal-scenario",
        step: {
          type: "scenario",
          question:
            "Sipho gets a raise that pushes him into a higher tax bracket and panics that his whole salary is now taxed more. Is he right?",
          options: [
            "No, only the rands in the higher band",
            "Yes, his whole salary jumps",
            "Yes, he'll take home less than before",
            "No, raises are never taxed",
          ],
          correct: 0,
          feedback: {
            correct:
              "Exactly. SA tax is marginal: only the portion above the threshold is taxed higher. A raise always leaves you with more, never less.",
            incorrect:
              "Only the income above the bracket line is taxed at the higher rate. You never take home less because of a raise. That's the marginal-rate myth.",
          },
        },
      },
      {
        variantId: "prog-marginal-tf",
        step: {
          type: "true-false",
          statement:
            "Under progressive tax, only the portion of income above each bracket threshold is taxed at that bracket's higher rate.",
          correct: true,
          feedback: {
            correct:
              "True. Each slice of income is taxed at its own rate. This is why moving up a bracket never cuts your take-home pay.",
            incorrect:
              "It's true. Tax is charged slice by slice. Only the rands above a threshold get the higher rate, not your whole salary.",
          },
        },
      },
    ],
  },
  {
    slotId: "salary-payslip/lesson-1/uif-basics",
    conceptId: "uif",
    variants: [
      {
        variantId: "uifb-what-for",
        step: {
          type: "mcq",
          question: "What is the UIF deduction on your payslip actually for?",
          options: [
            "Income if you lose your job",
            "A second retirement savings pot",
            "A top-up for your medical aid",
            "A monthly bank service fee",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. UIF is a safety net you pay into. It pays out if you're retrenched, on maternity leave, or too ill to work.",
            incorrect:
              "UIF is unemployment insurance: it pays you a portion of your income if you lose your job or go on maternity/illness leave.",
          },
        },
      },
      {
        variantId: "uifb-fill",
        step: {
          type: "fill-blank",
          title: "Your UIF slice",
          prompt: "UIF is 1% of your gross salary. On R12 000, your UIF deduction is R____.",
          correct: 120,
          feedback: {
            correct: "Correct: 1% of R12 000 = R120. Your employer quietly adds another R120.",
            incorrect: "1% of R12 000 = R120.",
          },
        },
      },
      {
        variantId: "uifb-employer-tf",
        step: {
          type: "true-false",
          statement: "Your employer also pays into UIF on top of your 1%.",
          correct: true,
          feedback: {
            correct:
              "True. You pay 1% and your employer matches it, so on R12 000 that's R120 + R120 = R240 a month into the fund.",
            incorrect:
              "It's true: the employer matches your 1%. On R12 000 that's R240 a month total going into UIF.",
          },
        },
      },
    ],
  },
  {
    slotId: "salary-payslip/lesson-1/net-math",
    conceptId: "gross-vs-net",
    variants: [
      {
        variantId: "netm-full-payslip",
        step: {
          type: "scenario",
          question:
            "Payslip: Gross R30 000 | PAYE R4 500 | UIF R177 | Medical Aid R2 200 | Pension R3 000. What's the net pay?",
          options: ["R20 123", "R25 500", "R23 700", "R30 000"],
          correct: 0,
          feedback: {
            correct:
              "Right. Deductions total R4 500 + R177 + R2 200 + R3 000 = R9 877. R30 000 − R9 877 = R20 123.",
            incorrect:
              "Add the deductions (R9 877) and subtract from gross: R30 000 − R9 877 = R20 123.",
          },
        },
      },
      {
        variantId: "netm-fill",
        step: {
          type: "fill-blank",
          title: "Take-home",
          prompt: "Gross R18 000 with total deductions of R4 200. Your net take-home = R____.",
          correct: 13800,
          feedback: {
            correct: "Correct: R18 000 − R4 200 = R13 800.",
            incorrect: "Gross minus deductions: R18 000 − R4 200 = R13 800.",
          },
        },
      },
      {
        variantId: "netm-budget-on",
        step: {
          type: "mcq",
          question: "Which figure should your monthly budget be built on?",
          options: [
            "Your net (take-home) pay",
            "Your gross salary",
            "Your gross plus expected bonus",
            "The number in your offer letter",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. You can only spend what actually arrives, so the budget lives on net pay. Never gross.",
            incorrect:
              "Budget on net. Gross includes money that's already been deducted before you ever see it.",
          },
        },
      },
    ],
  },
];

const lesson1Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "The Salary Shock",
    content:
      "<p>Your first payslip can be a shock. You were promised R25 000 but only R18 500 arrives. Where did R6 500 go?</p><p><strong>Gross salary:</strong> the total before deductions.<br/><strong>Net salary:</strong> what actually reaches your account.</p>",
  },
  { slot: "salary-payslip/lesson-1/gross-net-meaning" },
  {
    type: "info",
    title: "The Big One: PAYE",
    content:
      "<p><strong>PAYE (Pay As You Earn)</strong> is income tax deducted monthly. South Africa uses progressive tax. The more you earn, the higher the rate on the top slice of your income. The first ~R99 000 a year is taxed at 0%. <em>Thresholds change annually; these are illustrative.</em></p>",
  },
  { slot: "salary-payslip/lesson-1/progressive-tax" },
  {
    type: "info",
    title: "UIF, Your Safety Net",
    content:
      "<p><strong>UIF (Unemployment Insurance Fund)</strong> is 1% of your salary, matched by your employer, that helps if you lose your job, go on maternity leave, or need illness benefits. It's capped at a monthly earnings ceiling of R17 712, so the most either side pays is R177.12. On R12 000: you pay R120, your employer pays R120, into a fund you can claim from later.</p>",
  },
  { slot: "salary-payslip/lesson-1/uif-basics" },
  { slot: "salary-payslip/lesson-1/net-math" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 2 · "Understanding PAYE"
// ═══════════════════════════════════════════════════════════════════════════

const lesson2Slots: QuestionSlot[] = [
  {
    slotId: "salary-payslip/lesson-2/what-is-paye",
    conceptId: "paye",
    variants: [
      {
        variantId: "paye-def",
        step: {
          type: "mcq",
          question: "What is PAYE?",
          options: [
            "Income tax off each payslip",
            "A retirement fund your employer runs",
            "A repayment on a staff loan",
            "A levy that funds your medical aid",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. PAYE = Pay As You Earn: your income tax, deducted monthly and paid over to SARS on your behalf.",
            incorrect:
              "PAYE is your income tax, deducted from each payslip by your employer and paid to SARS monthly.",
          },
        },
      },
      {
        variantId: "paye-monthly-tf",
        step: {
          type: "true-false",
          statement:
            "PAYE is deducted monthly so you don't owe SARS one big lump sum at year-end.",
          correct: true,
          feedback: {
            correct:
              "True. Spreading tax across 12 months is why most employees never face a scary February tax bill.",
            incorrect:
              "It's true, monthly PAYE spreads your tax over the year instead of a single lump sum at year-end.",
          },
        },
      },
      {
        variantId: "paye-thabo-monthly",
        step: {
          type: "scenario",
          question:
            "Thabo is annoyed that PAYE comes off every single month. Why is monthly deduction actually in his favour?",
          options: [
            "He pays in small monthly bites",
            "It reduces the total tax he owes",
            "It means he pays no tax at all",
            "SARS pays him interest on it",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. Same total tax, gentler on cash flow. Monthly PAYE means no R30 000 surprise in February.",
            incorrect:
              "It doesn't lower the total, it just spreads it. Paying monthly beats a single lump-sum shock at year-end.",
          },
        },
      },
    ],
  },
  {
    slotId: "salary-payslip/lesson-2/reduce-paye",
    conceptId: "ra-tax-deduction",
    variants: [
      {
        variantId: "reduce-ra",
        step: {
          type: "mcq",
          question: "How can you legally reduce the amount of PAYE you pay?",
          options: [
            "Contribute to an RA",
            "Work fewer hours each month",
            "Ask your employer nicely",
            "Move to a different province",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. RA contributions are tax-deductible: the single most powerful legal tax tool most South Africans have.",
            incorrect:
              "The legal lever is a Retirement Annuity: contributions are deductible, so they lower your taxable income and your PAYE.",
          },
        },
      },
      {
        variantId: "reduce-taxable-tf",
        step: {
          type: "true-false",
          statement:
            "Contributing to a retirement fund lowers your taxable income, so you pay less PAYE.",
          correct: true,
          feedback: {
            correct:
              "True. Retirement contributions come off before tax is calculated, shrinking the income SARS taxes.",
            incorrect:
              "It's true. Approved retirement contributions reduce taxable income, which directly reduces your PAYE.",
          },
        },
      },
      {
        variantId: "reduce-ayesha",
        step: {
          type: "scenario",
          question:
            "Ayesha earns R40 000/month and starts putting R3 000/month into an RA. What happens to her PAYE?",
          options: [
            "It drops",
            "It rises, she now earns extra",
            "Nothing changes at all",
            "She stops paying tax entirely",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. Her taxable income falls by R3 000 a month, so SARS taxes less. She often gets a few hundred rand back each month in reduced PAYE.",
            incorrect:
              "Her PAYE drops: the RA contribution lowers taxable income, so less tax is deducted.",
          },
        },
      },
    ],
  },
  {
    slotId: "salary-payslip/lesson-2/paye-mandatory",
    conceptId: "paye",
    variants: [
      {
        variantId: "mand-tf",
        step: {
          type: "true-false",
          statement:
            "An employer can skip deducting PAYE if the employee agrees to settle SARS directly.",
          correct: false,
          feedback: {
            correct:
              "Correct. PAYE is a statutory duty. The employer must deduct it and pay it over monthly. No side deals.",
            incorrect:
              "PAYE is mandatory by law. An employee 'agreement' can't replace the employer's legal duty to deduct and pay it.",
          },
        },
      },
      {
        variantId: "mand-whose-job",
        step: {
          type: "mcq",
          question: "Whose legal responsibility is it to deduct PAYE and pay it to SARS?",
          options: [
            "The employer's",
            "The employee's alone",
            "SARS deducts it straight from your bank",
            "Nobody's. It's optional",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. The employer must withhold PAYE and pay it over. If they don't, it's the employer in trouble with SARS.",
            incorrect:
              "It's the employer's duty to withhold PAYE and pay it to SARS every month.",
          },
        },
      },
      {
        variantId: "mand-nomsa-risk",
        step: {
          type: "scenario",
          question:
            "A small employer offers Nomsa 'the full amount, no PAYE, you sort out your own tax'. What's the risk?",
          options: [
            "It's illegal, she'd owe SARS",
            "A great deal with no downside",
            "SARS doesn't tax small-business staff",
            "She'll simply pay less tax overall",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. The employer is dodging a legal duty, and Nomsa is left exposed, an unpaid tax bill with interest and penalties waiting at year-end.",
            incorrect:
              "It's a trap. PAYE isn't optional, and 'sort it out yourself' usually ends in a nasty SARS bill with penalties for Nomsa.",
          },
        },
      },
    ],
  },
  {
    slotId: "salary-payslip/lesson-2/marginal-rate",
    conceptId: "tax-brackets",
    variants: [
      {
        variantId: "marg-what",
        step: {
          type: "mcq",
          question: "Your 'marginal rate' is:",
          options: [
            "The rate on your next rand",
            "The average across your income",
            "A flat 27.5% rate for everyone",
            "The same as your UIF contribution rate",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. Your marginal rate applies only to your top slice of income. Useful to know, because it's the rate an RA contribution saves you.",
            incorrect:
              "Marginal rate = the rate on your highest slice of income, not the average. It's what each extra (or deducted) rand is taxed at.",
          },
        },
      },
      {
        variantId: "marg-raise-tf",
        step: {
          type: "true-false",
          statement:
            "Earning R1 more that pushes you into a new tax bracket does NOT reduce your take-home pay.",
          correct: true,
          feedback: {
            correct:
              "True. Only that extra rand (and income above the line) is taxed higher. You always keep more of a raise, never less.",
            incorrect:
              "It's true. The higher rate only hits income above the threshold, so a raise can never leave you worse off.",
          },
        },
      },
      {
        variantId: "marg-threshold",
        step: {
          type: "mcq",
          question:
            "The first slice of annual income (around R99 000) that's taxed at 0% exists because of the:",
          options: [
            "Tax threshold and rebates",
            "VAT system",
            "UIF fund",
            "Two-pot retirement system",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. Rebates create a tax threshold, earn under it in a year and you owe no income tax at all.",
            incorrect:
              "It's the tax threshold, created by SARS rebates. Below it, you pay no income tax for the year.",
          },
        },
      },
    ],
  },
];

const lesson2Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "How PAYE Is Calculated",
    content:
      "<p>PAYE is worked out on your annual income using SARS tax brackets, then deducted monthly so you don't owe a lump sum at year-end.</p><p>You can reduce PAYE legally by contributing to a Retirement Annuity (RA). Contributions are tax-deductible up to 27.5% of income (subject to an annual cap).</p>",
  },
  { slot: "salary-payslip/lesson-2/what-is-paye" },
  { slot: "salary-payslip/lesson-2/marginal-rate" },
  { slot: "salary-payslip/lesson-2/reduce-paye" },
  { slot: "salary-payslip/lesson-2/paye-mandatory" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 3 · "UIF and SDL Explained"
// ═══════════════════════════════════════════════════════════════════════════

const lesson3Slots: QuestionSlot[] = [
  {
    slotId: "salary-payslip/lesson-3/uif-rate",
    conceptId: "uif",
    variants: [
      {
        variantId: "rate-20k",
        step: {
          type: "mcq",
          question: "An employee earns R20 000/month. UIF is 1%, but capped at earnings of R17 712. What's their monthly UIF?",
          options: ["R177.12", "About R200", "R100", "R400 exactly"],
          correct: 0,
          feedback: {
            correct: "Right. Above the R17 712 ceiling, UIF stops rising: 1% × R17 712 = R177.12. The most either side pays.",
            incorrect: "R20 000 is above the R17 712 cap, so UIF is 1% × R17 712 = R177.12, not 1% of the full salary.",
          },
        },
      },
      {
        variantId: "rate-fill-15k",
        step: {
          type: "fill-blank",
          title: "1% of gross",
          prompt: "UIF is 1% of your gross salary. On R15 000, your UIF deduction is R____.",
          correct: 150,
          feedback: {
            correct: "Correct: 1% of R15 000 = R150.",
            incorrect: "1% of R15 000 = R150.",
          },
        },
      },
      {
        variantId: "rate-both-tf",
        step: {
          type: "true-false",
          statement: "Both you and your employer each pay 1% of your salary to UIF.",
          correct: true,
          feedback: {
            correct: "True. You pay 1%, your employer pays 1%, a total of 2% of your salary goes into the fund each month.",
            incorrect: "It's true: you pay 1% and your employer matches it, so 2% of your salary flows into UIF monthly.",
          },
        },
      },
    ],
  },
  {
    slotId: "salary-payslip/lesson-3/uif-claim",
    conceptId: "uif",
    variants: [
      {
        variantId: "claim-resign-tf",
        step: {
          type: "true-false",
          statement: "You can claim UIF if you resign voluntarily from your job.",
          correct: false,
          feedback: {
            correct:
              "Correct. UIF is for retrenchment, dismissal, maternity, illness or adoption, not for choosing to leave.",
            incorrect:
              "Voluntary resignation doesn't qualify. UIF covers retrenchment, dismissal, maternity and illness, not quitting by choice.",
          },
        },
      },
      {
        variantId: "claim-which",
        step: {
          type: "mcq",
          question: "Which of these lets you claim from UIF?",
          options: [
            "Being retrenched",
            "Resigning to go travelling",
            "Quitting because you're bored",
            "Taking unpaid leave by choice",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. Retrenchment is exactly what UIF is for. Voluntary exits (travel, boredom, chosen unpaid leave) don't qualify.",
            incorrect:
              "Only involuntary loss of income qualifies. Retrenchment counts; choosing to leave does not.",
          },
        },
      },
      {
        variantId: "claim-zanele",
        step: {
          type: "scenario",
          question:
            "Zanele, earning R15 000/month, is retrenched. Roughly what can UIF pay her while she job-hunts?",
          options: [
            "Part of her salary for a while",
            "Her full salary, indefinitely",
            "Nothing, UIF is for pensioners",
            "A once-off payment of R500",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. UIF replaces part of your income (higher earners get a smaller percentage) for a capped number of days: a bridge, not a full salary.",
            incorrect:
              "UIF pays a portion of your income (up to ~60%, sliding scale) for a limited time. A bridge while you find work, not your full pay.",
          },
        },
      },
    ],
  },
  {
    slotId: "salary-payslip/lesson-3/sdl-who-pays",
    conceptId: "sdl",
    variants: [
      {
        variantId: "sdl-who",
        step: {
          type: "mcq",
          question: "Who pays the Skills Development Levy (SDL)?",
          options: [
            "The employer only",
            "The employee only",
            "Both, split equally",
            "SARS takes it from your account",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. SDL is a pure employer cost (1% of payroll). It never appears as a deduction on your payslip.",
            incorrect:
              "SDL is paid entirely by the employer (1% of total payroll). It doesn't come out of your take-home pay.",
          },
        },
      },
      {
        variantId: "sdl-not-deducted-tf",
        step: {
          type: "true-false",
          statement: "SDL comes out of your take-home pay, just like PAYE and UIF.",
          correct: false,
          feedback: {
            correct:
              "Correct. SDL is the employer's cost, not yours, it isn't deducted from your salary at all.",
            incorrect:
              "It's not deducted from you. SDL is an employer levy (1% of payroll); it never touches your take-home pay.",
          },
        },
      },
      {
        variantId: "sdl-funds",
        step: {
          type: "mcq",
          question: "What does SDL fund?",
          options: [
            "Workplace training",
            "Your retirement pension",
            "The UIF payout pool",
            "Municipal rates and taxes",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. SDL bankrolls skills development. Training programmes and learnerships run through the SETAs.",
            incorrect:
              "SDL funds workplace skills training and learnerships through the SETAs, not pensions, UIF or rates.",
          },
        },
      },
    ],
  },
  {
    slotId: "salary-payslip/lesson-3/uif-purpose",
    conceptId: "uif",
    variants: [
      {
        variantId: "purpose-why-care",
        step: {
          type: "mcq",
          question: "What's the honest reason to actually understand the UIF line on your payslip?",
          options: [
            "It's a safety net you can claim",
            "It's a scam you should dispute",
            "It secretly increases your salary",
            "It's completely voluntary",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. Most people ignore UIF until they need it. Knowing it exists, and how to claim, is the point of paying in.",
            incorrect:
              "UIF is a real benefit you've paid for: income support when you're retrenched or on maternity/illness leave. Worth understanding.",
          },
        },
      },
      {
        variantId: "purpose-thabo",
        step: {
          type: "scenario",
          question:
            "Thabo earns R15 000. His UIF is R150 and his employer adds R150. Why does this matter to him personally?",
          options: [
            "He can claim it if retrenched",
            "It doesn't matter, it's money gone",
            "It's a loan that he repays later",
            "It's actually his pension",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. That R300 a month is buying him a real safety net, income support if the job ever disappears.",
            incorrect:
              "It's not lost money or a loan. It's insurance: if Thabo is retrenched, he can claim UIF income while job-hunting.",
          },
        },
      },
      {
        variantId: "purpose-maternity-tf",
        step: {
          type: "true-false",
          statement: "UIF can also pay benefits during maternity leave, not only unemployment.",
          correct: true,
          feedback: {
            correct:
              "True. UIF covers maternity, adoption and illness benefits too, not just job loss. Many parents don't realise they can claim.",
            incorrect:
              "It's true: UIF pays maternity, adoption and illness benefits as well as unemployment. Worth claiming when eligible.",
          },
        },
      },
    ],
  },
];

const lesson3Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Two Deductions That Protect You",
    content:
      "<p>Two payslip lines most people ignore: <strong>UIF</strong> and <strong>SDL</strong>.</p><p><strong>UIF:</strong> you pay 1% of salary (up to a R17 712/month earnings cap, so at most R177.12), your employer pays another 1%. Lose your job, get retrenched, or go on maternity leave, and you can claim a portion of your income for a limited period.</p><p><strong>SDL (Skills Development Levy):</strong> your employer pays 1% of payroll to the SETAs to fund training. You do <em>not</em> pay this. It's an employer cost, so it never appears as a deduction on your payslip.</p>",
  },
  { slot: "salary-payslip/lesson-3/uif-rate" },
  { slot: "salary-payslip/lesson-3/uif-claim" },
  { slot: "salary-payslip/lesson-3/sdl-who-pays" },
  { slot: "salary-payslip/lesson-3/uif-purpose" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 4 · "Retirement Contributions"
// ═══════════════════════════════════════════════════════════════════════════

const lesson4Slots: QuestionSlot[] = [
  {
    slotId: "salary-payslip/lesson-4/deduction-limit",
    conceptId: "ra-tax-deduction",
    variants: [
      {
        variantId: "limit-275",
        step: {
          type: "mcq",
          question:
            "What is the maximum percentage of taxable income you can deduct for retirement contributions?",
          options: ["27.5%", "15%", "20%", "33.3%"],
          correct: 0,
          feedback: {
            correct:
              "Right. You can deduct up to 27.5% of taxable income (subject to an annual rand cap set by SARS): one of SA's best legal tax breaks.",
            incorrect:
              "It's 27.5% of taxable income (up to an annual cap). That's the ceiling on deductible retirement contributions.",
          },
        },
      },
      {
        variantId: "limit-beforetax-tf",
        step: {
          type: "true-false",
          statement:
            "Money you put into an approved retirement fund is deducted before tax, lowering your tax bill.",
          correct: true,
          feedback: {
            correct:
              "True. Approved contributions come off your taxable income, so you're effectively saving with money that would partly have gone to SARS.",
            incorrect:
              "It's true. Approved retirement contributions are pre-tax, so they cut your taxable income and your tax bill.",
          },
        },
      },
      {
        variantId: "limit-sipho-gain",
        step: {
          type: "scenario",
          question:
            "Sipho earns R30 000/month and puts R3 000/month into an RA. Roughly what does he gain at tax time?",
          options: [
            "A tax saving",
            "Nothing. RAs give no tax benefit",
            "He ends up paying more tax",
            "SARS blocks the contribution",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. At a ~31% marginal rate, R3 000 into an RA saves him roughly R930/month in tax, while also building his retirement.",
            incorrect:
              "He gains a tax saving: the R3 000 lowers taxable income, so his PAYE drops (often several hundred rand a month).",
          },
        },
      },
    ],
  },
  {
    slotId: "salary-payslip/lesson-4/vehicles",
    conceptId: "ra-basics",
    variants: [
      {
        variantId: "veh-which-private",
        step: {
          type: "mcq",
          question: "Which retirement vehicle do you open yourself, independent of any employer?",
          options: [
            "A retirement annuity",
            "A workplace pension fund",
            "The national UIF fund",
            "A private medical aid scheme",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. An RA is private, you choose the provider and amount, and it's not tied to any job.",
            incorrect:
              "It's the Retirement Annuity (RA): a private fund you open and control yourself, separate from any employer.",
          },
        },
      },
      {
        variantId: "veh-selfemployed-tf",
        step: {
          type: "true-false",
          statement:
            "A Retirement Annuity is ideal for self-employed people or anyone without an employer fund.",
          correct: true,
          feedback: {
            correct:
              "True. No employer pension? An RA lets you get the same tax break and build retirement savings on your own terms.",
            incorrect:
              "It's true. RAs are built for the self-employed and anyone whose employer offers no fund.",
          },
        },
      },
      {
        variantId: "veh-ra-advantage",
        step: {
          type: "mcq",
          question: "What's the main advantage of an RA over a workplace pension fund?",
          options: [
            "It's portable across jobs",
            "It guarantees higher returns",
            "You can withdraw anytime, tax-free",
            "It requires no paperwork at all",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. An RA isn't tied to an employer, so it moves with you through every job change and career break.",
            incorrect:
              "The advantage is portability: an RA belongs to you and keeps going regardless of where, or whether, you're employed.",
          },
        },
      },
    ],
  },
  {
    slotId: "salary-payslip/lesson-4/two-pot",
    conceptId: "two-pot-system",
    variants: [
      {
        variantId: "twopot-all-tf",
        step: {
          type: "true-false",
          statement:
            "Under the Two-Pot System, you can access ALL your retirement savings once a year for emergencies.",
          correct: false,
          feedback: {
            correct:
              "Correct. Only the Savings Pot, one third of new contributions, is reachable. The Retirement Pot (two thirds) stays locked until retirement.",
            incorrect:
              "Only the Savings Pot (1/3 of new contributions) is accessible. The other 2/3 is locked away until retirement.",
          },
        },
      },
      {
        variantId: "twopot-split",
        step: {
          type: "mcq",
          question: "Under the Two-Pot System, how are new contributions split?",
          options: [
            "One third savings, two thirds locked",
            "Half accessible and half locked away",
            "All accessible at any time",
            "All locked until age 65",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. One third goes to the Savings Pot (reachable in emergencies), two thirds to the Retirement Pot (locked for later).",
            incorrect:
              "It's a one third / two thirds split: a third to the accessible Savings Pot, two thirds to the locked Retirement Pot.",
          },
        },
      },
      {
        variantId: "twopot-nomsa",
        step: {
          type: "scenario",
          question:
            "Nomsa wants to cash in her whole retirement fund to buy a car. Under the two-pot rules, what can she actually touch?",
          options: [
            "Only her Savings Pot",
            "All of it, whenever she likes",
            "None of it, ever",
            "Only her employer's share",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. The system is designed to stop exactly this. She can dip into the Savings Pot only, once a year, and pays tax on what she takes.",
            incorrect:
              "She can only reach the Savings Pot (~1/3), once per tax year, and it's taxed. The rest stays locked for retirement.",
          },
        },
      },
    ],
  },
  {
    slotId: "salary-payslip/lesson-4/tax-saving",
    conceptId: "ra-tax-deduction",
    variants: [
      {
        variantId: "save-fill-720k",
        step: {
          type: "fill-blank",
          title: "The deductible ceiling",
          prompt:
            "You earn R720 000 a year. The maximum deductible retirement contribution is 27.5% of that = R____.",
          correct: 198000,
          feedback: {
            correct: "Correct: R720 000 × 27.5% = R198 000 a year across all your retirement funds combined.",
            incorrect: "R720 000 × 27.5% = R198 000, the combined annual deductible limit.",
          },
        },
      },
      {
        variantId: "save-immediate",
        step: {
          type: "mcq",
          question: "Beyond growing your retirement, the immediate benefit of RA contributions is:",
          options: [
            "Lower income tax now",
            "A higher gross salary",
            "Free medical aid",
            "A better credit score",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. The tax break is immediate. You pay less PAYE this year while also building your future.",
            incorrect:
              "The immediate win is lower income tax now, on top of the long-term retirement growth.",
          },
        },
      },
      {
        variantId: "save-legal-tf",
        step: {
          type: "true-false",
          statement:
            "Contributing to an RA is one of the few legal ways to reduce the income tax you pay.",
          correct: true,
          feedback: {
            correct:
              "True. It's rare to cut your tax and build wealth with the same rand. The retirement deduction lets you do both.",
            incorrect:
              "It's true. Retirement contributions are one of the cleanest legal ways to lower your income tax.",
          },
        },
      },
    ],
  },
];

const lesson4Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Build Wealth and Pay Less Tax",
    content:
      "<p>South Africa gives you a strong incentive to save for retirement: contributions to approved funds are tax-deductible up to <strong>27.5% of taxable income</strong> (subject to an annual cap).</p><p><strong>Three vehicles:</strong> a <strong>Pension Fund</strong> (employer-run, often matched), a <strong>Provident Fund</strong> (now aligned to pension rules), and a <strong>Retirement Annuity</strong> (private, ideal if you're self-employed or want to save more).</p><p><strong>Two-Pot System (from 1 Sept 2024):</strong> new contributions split into a Savings Pot (1/3, one withdrawal per tax year) and a Retirement Pot (2/3, locked until retirement): emergency access without gutting your retirement.</p>",
  },
  { slot: "salary-payslip/lesson-4/deduction-limit" },
  { slot: "salary-payslip/lesson-4/vehicles" },
  { slot: "salary-payslip/lesson-4/two-pot" },
  { slot: "salary-payslip/lesson-4/tax-saving" },
];

export const SALARY_PAYSLIP_BANKS: Record<string, LessonBank> = {
  "salary-payslip::lesson-1": { layout: lesson1Layout, slots: lesson1Slots },
  "salary-payslip::lesson-2": { layout: lesson2Layout, slots: lesson2Slots },
  "salary-payslip::lesson-3": { layout: lesson3Layout, slots: lesson3Slots },
  "salary-payslip::lesson-4": { layout: lesson4Layout, slots: lesson4Slots },
};
