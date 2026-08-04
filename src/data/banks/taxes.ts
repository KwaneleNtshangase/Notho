import type { LessonLayoutItem, QuestionSlot } from "@/data/content";
import type { LessonBank } from "./money-basics";

/**
 * Bank for the Taxes for Individuals course.
 * ALL figures verified against SARS (sars.gov.za), 2027 tax year
 * (1 March 2026 – 28 Feb 2027) — see docs/SA-REGULATORY-FIGURES.md:
 *  - Tax threshold (under 65): R99 000; primary rebate R17 820; top rate 45%.
 *  - Medical scheme fees credit: R376 member, R376 first dependant, R254 each more.
 *  - Interest exemption (under 65): R23 800. Provisional tax: non-salary income > R30 000.
 *  - VAT 15%; compulsory registration above R1 000 000 turnover.
 *  - CGT: 40% inclusion, R50 000 annual exclusion, R3 000 000 primary-residence exclusion.
 *  - RA deduction 27.5% of income, annual cap hedged.
 */

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 1 · "Tax Brackets Explained"
// ═══════════════════════════════════════════════════════════════════════════

const lesson1Slots: QuestionSlot[] = [
  {
    slotId: "taxes/lesson-1/marginal-myth",
    conceptId: "tax-brackets",
    variants: [
      {
        variantId: "mm-tf",
        step: {
          type: "true-false",
          statement: "A raise that pushes you into a higher tax bracket can leave you taking home less money.",
          correct: false,
          feedback: {
            correct: "Correct. This is the great tax myth. The higher rate only applies to the income ABOVE the bracket line, so a raise always increases your take-home.",
            incorrect: "It can't. Only the portion above the threshold is taxed higher. You always keep more of a raise, never less.",
          },
        },
      },
      {
        variantId: "mm-why-mcq",
        step: {
          type: "mcq",
          question: "Under SA's marginal tax system, when you move into a higher bracket, the higher rate applies to:",
          options: [
            "Only the income above that bracket's threshold",
            "Your entire salary",
            "All income from the previous year too",
            "Nothing. Brackets don't exist",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Each slice of income is taxed at its own rate. Crossing a bracket line never re-taxes the income below it.",
            incorrect: "Only the income above the threshold gets the higher rate. Your lower income keeps its lower rates.",
          },
        },
      },
      {
        variantId: "mm-scenario",
        step: {
          type: "scenario",
          question: "Sipho turns down a raise, fearing it'll push him into a higher bracket and cut his take-home. Good idea?",
          options: [
            "No. A raise always increases take-home; only the extra rands are taxed higher",
            "Yes. Higher brackets reduce your whole salary",
            "Yes. Raises are usually a trap",
            "Only if he earns over R1 million",
          ],
          correct: 0,
          feedback: {
            correct: "Right. He's falling for the myth. The higher rate only touches the new income, so he'd keep more overall. Never refuse a raise over brackets.",
            incorrect: "He should take the raise. Marginal tax means only the extra income is taxed higher. His take-home still goes up.",
          },
        },
      },
    ],
  },
  {
    slotId: "taxes/lesson-1/threshold",
    conceptId: "tax-brackets",
    variants: [
      {
        variantId: "th-mcq",
        step: {
          type: "mcq",
          question: "If you earn R90 000 a year, how much income tax do you pay (2026/27, under 65)?",
          options: [
            "Zero. You're below the tax threshold",
            "About R16 000",
            "Exactly 18% of R90 000",
            "About R8 000",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The 2026/27 tax threshold for under-65s is R99 000. Earn below that and the primary rebate wipes out your tax, you owe nothing.",
            incorrect: "Below the R99 000 threshold (2026/27) you pay no income tax: the rebate cancels it out.",
          },
        },
      },
      {
        variantId: "th-fill",
        step: {
          type: "fill-blank",
          title: "The tax-free line",
          prompt: "In 2026/27, someone under 65 pays no income tax until their annual income passes about R____ (in rands).",
          correct: 99000,
          feedback: {
            correct: "Correct, R99 000 for 2026/27. Below it, the primary rebate (R17 820) cancels the tax.",
            incorrect: "The under-65 threshold is R99 000 for 2026/27.",
          },
        },
      },
      {
        variantId: "th-rebate-tf",
        step: {
          type: "true-false",
          statement: "The tax threshold exists because a 'rebate' cancels the tax on the first slice of your income.",
          correct: true,
          feedback: {
            correct: "True. The primary rebate (R17 820 in 2026/27) is subtracted from your tax, so income up to R99 000 ends up taxed at effectively zero.",
            incorrect: "It's true, the rebate offsets your tax, creating the tax-free threshold (R99 000 for under-65s in 2026/27).",
          },
        },
      },
    ],
  },
  {
    slotId: "taxes/lesson-1/top-rate",
    conceptId: "tax-brackets",
    variants: [
      {
        variantId: "tr-mcq",
        step: {
          type: "mcq",
          question: "What is South Africa's top marginal income-tax rate for individuals?",
          options: ["45%", "27.5%", "40%", "60%"],
          correct: 0,
          feedback: {
            correct: "Right. The top marginal rate is 45%, applied only to income in the highest bracket, not to a high earner's whole salary.",
            incorrect: "It's 45%, and only on the top slice of a high earner's income, thanks to the marginal system.",
          },
        },
      },
      {
        variantId: "tr-slices-tf",
        step: {
          type: "true-false",
          statement: "Even a top earner on the 45% rate doesn't pay 45% on their entire income.",
          correct: true,
          feedback: {
            correct: "True. Their income is taxed in slices (18%, then 26%, and so on) with 45% only on the portion in the top bracket. Their average rate is lower.",
            incorrect: "It's true. 45% applies only to the top slice. Lower slices are taxed at lower rates, so the average rate is well below 45%.",
          },
        },
      },
      {
        variantId: "tr-average-mcq",
        step: {
          type: "mcq",
          question: "Your 'effective' (average) tax rate compared with your top marginal rate is usually:",
          options: [
            "Lower, because your lower income slices are taxed at lower rates",
            "Higher",
            "Exactly the same",
            "Always zero",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Because earlier slices are taxed less, your average rate is always below your marginal rate. That's the marginal system working in your favour.",
            incorrect: "It's lower. The marginal system taxes early income at lower rates, so your average rate sits below your top (marginal) rate.",
          },
        },
      },
    ],
  },
  {
    slotId: "taxes/lesson-1/know-deductions",
    conceptId: "tax-brackets",
    variants: [
      {
        variantId: "kd-mcq",
        step: {
          type: "mcq",
          question: "Why do many South African employees overpay tax?",
          options: [
            "They don't claim legal deductions like RA contributions and medical credits",
            "SARS charges them extra for no reason",
            "PAYE is calculated wrong on purpose",
            "They earn too little",
          ],
          correct: 0,
          feedback: {
            correct: "Right. SARS takes what you owe but won't chase you to claim deductions. Knowing about RAs, medical credits and more can save you thousands a year.",
            incorrect: "It's usually unclaimed deductions: RAs, medical credits, home office. The rules exist; you have to use them.",
          },
        },
      },
      {
        variantId: "kd-tf",
        step: {
          type: "true-false",
          statement: "SARS will automatically apply every legal deduction you're entitled to, even if you don't claim it.",
          correct: false,
          feedback: {
            correct: "Correct. Some are built into PAYE, but many (like RA contributions or donations) you must claim yourself on your return. Unclaimed usually means unpaid-back.",
            incorrect: "It won't. Many deductions must be claimed by you at filing. Knowing them is how you avoid overpaying.",
          },
        },
      },
      {
        variantId: "kd-scenario",
        step: {
          type: "scenario",
          question: "Ayesha contributes to an RA all year but never mentions it on her tax return. What's likely?",
          options: [
            "She overpays tax by not claiming the deduction she's entitled to",
            "SARS adds it for her automatically",
            "Her RA is cancelled",
            "Nothing. RAs give no tax benefit",
          ],
          correct: 0,
          feedback: {
            correct: "Right. If the RA deduction isn't claimed on her return, she misses the tax saving. Possibly thousands of rands she could have had back.",
            incorrect: "She loses the tax saving. The RA deduction generally has to be claimed at filing to reduce her tax.",
          },
        },
      },
    ],
  },
];

const lesson1Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "How SARS Taxes Your Income",
    content:
      "<p>SARS takes exactly what you owe, but won't tell you about the legal ways to pay less. Employees who don't know about RA deductions, medical credits and home-office deductions overpay by thousands every year.</p><p>SA uses marginal tax brackets: you only pay the higher rate on income above each threshold, never on your whole salary. For 2026/27, under-65s pay no tax below R99 000 (the primary rebate of R17 820 cancels it), and the top marginal rate is 45%. The myth that a raise can cut your take-home is impossible. You always keep more by earning more.</p>",
  },
  { slot: "taxes/lesson-1/marginal-myth" },
  { slot: "taxes/lesson-1/threshold" },
  { slot: "taxes/lesson-1/top-rate" },
  { slot: "taxes/lesson-1/know-deductions" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 2 · "When You Must File"
// ═══════════════════════════════════════════════════════════════════════════

const lesson2Slots: QuestionSlot[] = [
  {
    slotId: "taxes/lesson-2/who-files",
    conceptId: "tax-filing",
    variants: [
      {
        variantId: "wf-mcq",
        step: {
          type: "mcq",
          question: "Which of these means you almost certainly need to file a tax return?",
          options: [
            "You're self-employed, or want to claim deductions like an RA",
            "You have a single employer and no other income",
            "You earn below the tax threshold",
            "You have a bank account",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Self-employment, multiple income sources, or wanting to claim deductions all trigger filing. A simple single-salary case often doesn't.",
            incorrect: "Filing is triggered by self-employment, extra income sources, or claiming deductions, not by simply having a salary or an account.",
          },
        },
      },
      {
        variantId: "wf-auto-scenario",
        step: {
          type: "scenario",
          question: "Thabo earns R450 000 from one employer, has no other income and claims no deductions. Must he file?",
          options: [
            "Often not. SARS may auto-assess him; he files if SARS asks or his situation changes",
            "Yes, every South African must file every year",
            "Only if he earns over R1 million",
            "Yes, but only every second year",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A single-source salaried employee may be auto-assessed or exempt. Check the auto-assessment, and file if SARS requests it or you have deductions to claim.",
            incorrect: "Not necessarily. Simple single-salary cases are often auto-assessed. He should still check his auto-assessment on eFiling.",
          },
        },
      },
      {
        variantId: "wf-deductions-tf",
        step: {
          type: "true-false",
          statement: "If you want to claim deductions (like RA contributions or a home office), you generally need to file a return.",
          correct: true,
          feedback: {
            correct: "True. Deductions aren't applied automatically. Filing (or correcting your auto-assessment) is how you claim them and get money back.",
            incorrect: "It's true, to claim deductions you file. That's how the RA, medical and home-office savings actually reach you.",
          },
        },
      },
    ],
  },
  {
    slotId: "taxes/lesson-2/provisional",
    conceptId: "tax-filing",
    variants: [
      {
        variantId: "pv-tf",
        step: {
          type: "true-false",
          statement: "If you earn more than R30 000 a year from sources other than a salary (freelance, rental, side business), you should register as a provisional taxpayer.",
          correct: true,
          feedback: {
            correct: "True. Above R30 000 of non-salary income, you register for provisional tax and submit estimates twice a year (August and February).",
            incorrect: "It's true, over R30 000 of non-salary income triggers provisional tax, with two estimates a year.",
          },
        },
      },
      {
        variantId: "pv-when-mcq",
        step: {
          type: "mcq",
          question: "Provisional taxpayers submit their estimates:",
          options: [
            "Twice a year",
            "Every month",
            "Only once, at retirement",
            "Never: SARS handles it",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Two provisional returns a year spread the tax on non-salary income, so you don't face one huge bill at year-end.",
            incorrect: "It's twice a year (August and February). Paying in two goes avoids a nasty single lump sum.",
          },
        },
      },
      {
        variantId: "pv-scenario",
        step: {
          type: "scenario",
          question: "Nomsa has a salary AND earns R60 000 a year from freelance design. What does the freelance income mean for tax?",
          options: [
            "She should register for provisional tax on the freelance income",
            "It's tax-free because she already pays PAYE",
            "Nothing, side income isn't taxed",
            "She must stop freelancing",
          ],
          correct: 0,
          feedback: {
            correct: "Right. R60 000 of non-salary income is over the R30 000 line, so she registers as a provisional taxpayer and declares it. Set aside tax as she earns.",
            incorrect: "The freelance income is taxable and over R30 000, so she registers for provisional tax. PAYE only covers her salary.",
          },
        },
      },
    ],
  },
  {
    slotId: "taxes/lesson-2/penalties",
    conceptId: "tax-filing",
    variants: [
      {
        variantId: "pn-tf",
        step: {
          type: "true-false",
          statement: "Filing your tax return late can lead to monthly administrative penalties from SARS.",
          correct: true,
          feedback: {
            correct: "True. Late submission carries a monthly admin penalty (scaling with income). Filing correctly and on time, even a nil return, is always cheaper than ignoring it.",
            incorrect: "It's true. SARS charges monthly penalties for late returns. On-time filing avoids them entirely.",
          },
        },
      },
      {
        variantId: "pn-ignore-scenario",
        step: {
          type: "scenario",
          question: "Sipho is scared of his tax return so he ignores it for months. What's the risk?",
          options: [
            "Monthly penalties and interest pile up. Ignoring it is the most expensive option",
            "Nothing, SARS forgets about it",
            "He gets a discount for waiting",
            "His tax disappears",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Avoidance is the costly choice: penalties and interest accumulate. Filing (or asking for help) early is always cheaper than hiding.",
            incorrect: "Ignoring it triggers escalating penalties and interest. Facing it, even late, beats letting it grow.",
          },
        },
      },
      {
        variantId: "pn-ontime-mcq",
        step: {
          type: "mcq",
          question: "What's the cheapest way to handle your tax obligations?",
          options: [
            "File correctly and on time, even if it's a simple or nil return",
            "Ignore SARS until they chase you",
            "Only file if you're getting a refund",
            "Wait several years then file everything at once",
          ],
          correct: 0,
          feedback: {
            correct: "Right. On-time, correct filing avoids penalties and interest. If it's confusing, a registered tax practitioner is cheaper than accumulating fines.",
            incorrect: "On-time, correct filing is cheapest. Delay only adds penalties and interest.",
          },
        },
      },
    ],
  },
  {
    slotId: "taxes/lesson-2/efiling",
    conceptId: "tax-filing",
    variants: [
      {
        variantId: "ef-mcq",
        step: {
          type: "mcq",
          question: "Where do most individuals submit their tax returns in South Africa?",
          options: [
            "SARS eFiling (online) or the SARS MobiApp",
            "By posting a paper form to any bank",
            "Through their employer only",
            "You can't submit returns in SA",
          ],
          correct: 0,
          feedback: {
            correct: "Right. SARS eFiling (and the MobiApp) is the standard way to file, check auto-assessments and see what's been submitted on your behalf.",
            incorrect: "It's SARS eFiling or the MobiApp. That's where you file, view auto-assessments and manage your tax.",
          },
        },
      },
      {
        variantId: "ef-check-tf",
        step: {
          type: "true-false",
          statement: "Even if SARS auto-assesses you, it's worth checking it before accepting. In case a deduction is missing.",
          correct: true,
          feedback: {
            correct: "True. Auto-assessments use the data SARS has. If your RA or medical details are missing, accepting blindly could cost you a refund. Check first.",
            incorrect: "It's true. Always review an auto-assessment. Missing deductions mean you'd overpay unless you correct it.",
          },
        },
      },
      {
        variantId: "ef-help-scenario",
        step: {
          type: "scenario",
          question: "Lerato's tax situation is complex (freelance income, RA, some rental). What's sensible?",
          options: [
            "Use a registered tax practitioner to file correctly",
            "Guess and hope for the best",
            "Never file at all",
            "Copy a friend's return",
          ],
          correct: 0,
          feedback: {
            correct: "Right. For a complex situation, a registered practitioner usually saves more than they cost, and keeps her out of penalty trouble.",
            incorrect: "With multiple income types, a registered tax practitioner is worth it: accuracy avoids penalties and captures deductions.",
          },
        },
      },
    ],
  },
];

const lesson2Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "SARS eFiling: Who Has to Submit",
    content:
      "<p>Many salaried employees don't need to file. PAYE handles it and SARS may auto-assess. But you generally <strong>must</strong> file if you're self-employed, have more than one income source, have taxable benefits not fully taxed via PAYE, earn investment or rental income, want to claim deductions (RA, medical, home office), or SARS asks you to.</p><p><strong>Provisional tax:</strong> earn more than R30 000/year from non-salary sources and you register as a provisional taxpayer, submitting estimates twice a year (August and February). Late filing carries monthly penalties. Filing correctly and on time is always cheaper than ignoring it.</p>",
  },
  { slot: "taxes/lesson-2/who-files" },
  { slot: "taxes/lesson-2/provisional" },
  { slot: "taxes/lesson-2/penalties" },
  { slot: "taxes/lesson-2/efiling" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 3 · "Common Tax Deductions"
// ═══════════════════════════════════════════════════════════════════════════

const lesson3Slots: QuestionSlot[] = [
  {
    slotId: "taxes/lesson-3/ra-deduction",
    conceptId: "tax-deductions",
    variants: [
      {
        variantId: "ra-mcq",
        step: {
          type: "mcq",
          question: "What's the single biggest legal tax deduction available to most South Africans?",
          options: [
            "Retirement fund contributions",
            "Buying a new car",
            "Eating out",
            "A gym membership",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Contributions to retirement funds (pension, provident, RA) are deductible up to 27.5% of income (with an annual cap), the most powerful legal tax saver for most people.",
            incorrect: "It's retirement contributions, up to 27.5% of income (capped). Nothing else comes close for the average taxpayer.",
          },
        },
      },
      {
        variantId: "ra-save-fill",
        step: {
          type: "fill-blank",
          title: "The government's co-contribution",
          prompt: "You put R3 000/month into an RA and your marginal rate is 31%. Your monthly tax saving is R____.",
          correct: 930,
          feedback: {
            correct: "Correct: R3 000 × 31% = R930/month saved: about R11 160 a year that compounds in your RA instead of going to SARS.",
            incorrect: "Tax saving = contribution × marginal rate: R3 000 × 31% = R930/month.",
          },
        },
      },
      {
        variantId: "ra-cap-tf",
        step: {
          type: "true-false",
          statement: "Retirement contribution deductions are 27.5% of income, but also subject to an annual rand cap.",
          correct: true,
          feedback: {
            correct: "True. It's the lower of 27.5% of income or the annual rand cap set by SARS. Most people are limited by the 27.5%; high earners hit the rand cap.",
            incorrect: "It's true, 27.5% of income up to an annual cap. Whichever is lower applies.",
          },
        },
      },
    ],
  },
  {
    slotId: "taxes/lesson-3/medical-credit",
    conceptId: "tax-deductions",
    variants: [
      {
        variantId: "mc-credit-tf",
        step: {
          type: "true-false",
          statement: "Medical scheme (medical aid) credits reduce your taxable income by the credit amount.",
          correct: false,
          feedback: {
            correct: "Correct. They're a credit, not a deduction, subtracted directly from your tax owed, rand for rand. That makes them more valuable than a deduction.",
            incorrect: "They're a tax credit, not a deduction. They come off your tax bill directly (rand for rand), which is actually better than reducing taxable income.",
          },
        },
      },
      {
        variantId: "mc-amount-mcq",
        step: {
          type: "mcq",
          question: "The medical scheme fees tax credit for the main member is roughly what per month (2026/27)?",
          options: ["About R376", "About R1 500", "R0", "About R50"],
          correct: 0,
          feedback: {
            correct: "Right. It's R376/month for the main member and the first dependant, then R254 for each additional dependant: a direct reduction of your tax.",
            incorrect: "It's about R376/month for the main member (and first dependant), R254 for each additional, a credit off your tax.",
          },
        },
      },
      {
        variantId: "mc-family-fill",
        step: {
          type: "fill-blank",
          title: "A family's monthly credit",
          prompt: "Member R376 + first dependant R376 + one more dependant R254. Total monthly medical credit = R____.",
          correct: 1006,
          feedback: {
            correct: "Correct: R376 + R376 + R254 = R1 006 a month, taken straight off your tax bill.",
            incorrect: "R376 + R376 + R254 = R1 006 per month.",
          },
        },
      },
    ],
  },
  {
    slotId: "taxes/lesson-3/donations-home-office",
    conceptId: "tax-deductions",
    variants: [
      {
        variantId: "dh-donations-mcq",
        step: {
          type: "mcq",
          question: "Donations to a SARS-approved Public Benefit Organisation are deductible up to what share of taxable income?",
          options: ["10%", "100%", "1%", "50%"],
          correct: 0,
          feedback: {
            correct: "Right. Donations to approved PBOs are deductible up to 10% of taxable income, but you need a Section 18A certificate from the charity as proof.",
            incorrect: "It's up to 10% of taxable income, and only with a Section 18A certificate from the approved charity.",
          },
        },
      },
      {
        variantId: "dh-18a-tf",
        step: {
          type: "true-false",
          statement: "To claim a donation deduction, you need a Section 18A certificate from the charity.",
          correct: true,
          feedback: {
            correct: "True. Not every charity can issue one, only SARS-approved PBOs. No 18A certificate, no deduction, however generous the gift.",
            incorrect: "It's true. The Section 18A certificate is the proof SARS requires. Without it, the donation isn't deductible.",
          },
        },
      },
      {
        variantId: "dh-home-office-scenario",
        step: {
          type: "scenario",
          question: "Thabo works from home in a spare room used only for a corner of his desk, sometimes. Can he claim a home-office deduction?",
          options: [
            "Only if the room is used exclusively and regularly for work, and specifically equipped for it",
            "Yes, any home worker can claim it automatically",
            "No, home offices are never deductible",
            "Only if he owns the home",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The rules are strict: a dedicated space used exclusively and regularly for work. 'Sometimes at a desk corner' won't qualify.",
            incorrect: "It needs a dedicated room used exclusively and regularly for work. Occasional use of a shared space doesn't meet SARS's test.",
          },
        },
      },
    ],
  },
  {
    slotId: "taxes/lesson-3/legal-not-evasion",
    conceptId: "tax-deductions",
    variants: [
      {
        variantId: "le-tf",
        step: {
          type: "true-false",
          statement: "Claiming legal deductions (like RA contributions) to lower your tax is tax avoidance, which is legal: unlike tax evasion.",
          correct: true,
          feedback: {
            correct: "True. Using the rules to pay less (deductions, credits) is legal tax planning. Hiding income or faking expenses is evasion, illegal and heavily penalised.",
            incorrect: "It's true. Claiming real deductions is legal. Evasion (hiding income, fake claims) is the illegal version. Know the line.",
          },
        },
      },
      {
        variantId: "le-line-mcq",
        step: {
          type: "mcq",
          question: "Which of these is illegal tax EVASION, not legal planning?",
          options: [
            "Not declaring cash income to hide it from SARS",
            "Contributing to an RA for the deduction",
            "Claiming a valid medical credit",
            "Donating to a PBO with a Section 18A certificate",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Hiding income is evasion. A criminal offence. The others are legitimate ways the law lets you reduce tax.",
            incorrect: "Hiding income is evasion (illegal). RAs, medical credits and 18A donations are all legal, encouraged ways to pay less.",
          },
        },
      },
      {
        variantId: "le-records-tf",
        step: {
          type: "true-false",
          statement: "Keeping proof (certificates, receipts) for the deductions you claim protects you if SARS asks.",
          correct: true,
          feedback: {
            correct: "True. SARS can request supporting documents. Keep your RA certificate, 18A receipts and medical statements. No proof can mean a disallowed claim.",
            incorrect: "It's true. Keep your documents. If SARS reviews your return, unproven claims can be reversed with penalties.",
          },
        },
      },
    ],
  },
];

const lesson3Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Legal Ways to Pay Less Tax",
    content:
      "<p>South Africans who know the rules can cut their tax bill legally. Key ones: <strong>Retirement contributions</strong> (up to 27.5% of income, capped), the biggest for most people. <strong>Medical scheme credits</strong>, a rand-for-rand credit off your tax, not a deduction: R376/month for the main member and first dependant, R254 for each additional. <strong>Home-office</strong> costs, if you have a dedicated space used exclusively and regularly for work. <strong>Donations</strong> to SARS-approved PBOs, deductible up to 10% of taxable income with a Section 18A certificate.</p><p>Claiming real deductions is legal tax planning; hiding income is illegal evasion. Keep your certificates and receipts.</p>",
  },
  { slot: "taxes/lesson-3/ra-deduction" },
  { slot: "taxes/lesson-3/medical-credit" },
  { slot: "taxes/lesson-3/donations-home-office" },
  { slot: "taxes/lesson-3/legal-not-evasion" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 4 · "Tax Certificates & IRP5"
// ═══════════════════════════════════════════════════════════════════════════

const lesson4Slots: QuestionSlot[] = [
  {
    slotId: "taxes/lesson-4/irp5",
    conceptId: "tax-certificates",
    variants: [
      {
        variantId: "ir-what-mcq",
        step: {
          type: "mcq",
          question: "What does your IRP5 (IT3(a)) certificate show?",
          options: [
            "Your salary, deductions, and the PAYE your employer deducted",
            "Interest earned on your savings",
            "Capital gains from your shares",
            "Your medical history",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The IRP5 is your employment-income certificate (salary, deductions and PAYE) issued at tax year-end (end of February).",
            incorrect: "The IRP5 shows your employment income and the PAYE deducted. Interest and capital gains come on different certificates.",
          },
        },
      },
      {
        variantId: "ir-employer-tf",
        step: {
          type: "true-false",
          statement: "Your employer is legally required to give you an IRP5 certificate each tax year.",
          correct: true,
          feedback: {
            correct: "True. It's a legal obligation. If you don't receive yours by around April, follow up with HR, and escalate to SARS if needed.",
            incorrect: "It's true. Issuing your IRP5 is a legal duty. Chase HR if it's missing; you need it to file correctly.",
          },
        },
      },
      {
        variantId: "ir-missing-scenario",
        step: {
          type: "scenario",
          question: "Nomsa hasn't received her IRP5 by April. What should she do?",
          options: [
            "Follow up with her employer's HR/payroll, and escalate to SARS if it's still not provided",
            "Just guess her salary numbers",
            "Skip filing entirely",
            "Wait a year and hope it arrives",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Chase HR first. It's their legal duty. SARS can also show what was submitted for her. Never guess the figures.",
            incorrect: "She should follow up with HR (it's their obligation) and can check with SARS. Guessing risks an inaccurate return.",
          },
        },
      },
    ],
  },
  {
    slotId: "taxes/lesson-4/it3b",
    conceptId: "tax-certificates",
    variants: [
      {
        variantId: "ib-mcq",
        step: {
          type: "mcq",
          question: "Which certificate reports the interest you earned on your savings account?",
          options: ["IT3(b)", "IRP5", "IT3(c)", "IT3(a)"],
          correct: 0,
          feedback: {
            correct: "Right. The IT3(b) reports interest income, issued by your bank or investment account. IT3(c) is for capital gains; IRP5/IT3(a) is employment.",
            incorrect: "It's the IT3(b), interest income from banks and investments. (IT3(c) = capital gains; IRP5 = salary.)",
          },
        },
      },
      {
        variantId: "ib-exemption-tf",
        step: {
          type: "true-false",
          statement: "Under 65, the first R23 800 of local interest you earn each year is exempt from income tax.",
          correct: true,
          feedback: {
            correct: "True. Interest up to R23 800/year (under 65) is tax-free; only the amount above that is taxable. Over 65 the exemption is higher (R34 500).",
            incorrect: "It's true: R23 800 of local interest a year is exempt for under-65s. Only interest above that is taxed.",
          },
        },
      },
      {
        variantId: "ib-who-sends-mcq",
        step: {
          type: "mcq",
          question: "Who issues your IT3(b) interest certificate?",
          options: [
            "Your bank or investment provider",
            "Your employer",
            "You write it yourself",
            "The municipality",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Your bank or broker issues it, and sends the same data to SARS, so it usually pre-populates your return. Check it matches.",
            incorrect: "Your bank or investment provider issues it, and SARS gets a copy too. That's why it often auto-fills on eFiling.",
          },
        },
      },
    ],
  },
  {
    slotId: "taxes/lesson-4/it3c",
    conceptId: "tax-certificates",
    variants: [
      {
        variantId: "ic-mcq",
        step: {
          type: "mcq",
          question: "Which certificate shows capital gains from selling shares, ETFs or unit trusts?",
          options: ["IT3(c)", "IT3(b)", "IRP5", "IT3(a)"],
          correct: 0,
          feedback: {
            correct: "Right. The IT3(c), from your investment platform, reports capital gains. IT3(b) is interest; IRP5/IT3(a) is employment income.",
            incorrect: "It's the IT3(c), capital gains from investments. (IT3(b) = interest; IRP5 = salary.)",
          },
        },
      },
      {
        variantId: "ic-platform-tf",
        step: {
          type: "true-false",
          statement: "Your investment platform (like EasyEquities or Allan Gray) issues the IT3(c) for your capital gains.",
          correct: true,
          feedback: {
            correct: "True. Your broker or fund manager provides it. It feeds your capital-gains calculation at tax time, so keep it with your other certificates.",
            incorrect: "It's true. Your investment provider issues the IT3(c). You'll need it to work out any capital gains tax.",
          },
        },
      },
      {
        variantId: "ic-match-scenario",
        step: {
          type: "scenario",
          question: "On eFiling, Sipho imports his certificates and the system pre-fills his return. What should he still do?",
          options: [
            "Check that what imported matches the certificates he actually received",
            "Assume it's perfect and submit instantly",
            "Delete everything and start blank",
            "Ignore his certificates",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Auto-import is convenient but not infallible. Cross-check the imported figures against your IRP5, IT3(b) and IT3(c) before submitting.",
            incorrect: "He should verify the imported data against his own certificates. Convenient isn't the same as always correct.",
          },
        },
      },
    ],
  },
  {
    slotId: "taxes/lesson-4/keep-records",
    conceptId: "tax-certificates",
    variants: [
      {
        variantId: "kr-tf",
        step: {
          type: "true-false",
          statement: "It's worth keeping your tax certificates and supporting documents in one place each year.",
          correct: true,
          feedback: {
            correct: "True. SARS can ask for supporting documents after you file. A tidy folder of IRP5s, IT3s, RA and medical certificates makes filing, and any review, painless.",
            incorrect: "It's true. Keep them together. SARS can request them, and organised records make filing and any audit far easier.",
          },
        },
      },
      {
        variantId: "kr-how-long-mcq",
        step: {
          type: "mcq",
          question: "Roughly how long should you keep your tax records?",
          options: [
            "At least five years, in case SARS reviews a return",
            "Throw them away after filing",
            "One week",
            "Forever is legally required for everyone",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Keep supporting documents for at least five years. SARS can review a past return, and you'll want the proof of what you claimed.",
            incorrect: "Keep them at least five years. SARS can look back, so binning them after filing is risky.",
          },
        },
      },
      {
        variantId: "kr-digital-scenario",
        step: {
          type: "scenario",
          question: "How can Ayesha keep her tax documents safe and findable?",
          options: [
            "Save digital copies in a clearly-named folder, backed up, each tax year",
            "Keep the only copy on a random loose paper",
            "Rely on remembering the numbers",
            "Delete them to save space",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A named, backed-up digital folder per tax year means nothing's lost and everything's ready when she files or if SARS asks.",
            incorrect: "Organised, backed-up digital copies per year is the safe approach. Loose paper and memory both fail when you need them.",
          },
        },
      },
    ],
  },
];

const lesson4Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "The Documents That Prove Your Tax Story",
    content:
      "<p>SARS wants your certificates imported into your eFiling return. <strong>IRP5 / IT3(a):</strong> your employer's certificate of salary, deductions and PAYE, issued at year-end. <strong>IT3(b):</strong> interest income from your bank or investments (under 65, the first R23 800 of interest a year is exempt). <strong>IT3(c):</strong> capital gains from shares, ETFs and unit trusts, from your investment platform.</p><p>On eFiling, 'Import Certificate' auto-populates your return from what employers and institutions submitted, but always check the imported figures match what you actually received, and keep your documents for at least five years.</p>",
  },
  { slot: "taxes/lesson-4/irp5" },
  { slot: "taxes/lesson-4/it3b" },
  { slot: "taxes/lesson-4/it3c" },
  { slot: "taxes/lesson-4/keep-records" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 5 · "Understanding VAT"
// ═══════════════════════════════════════════════════════════════════════════

const lesson5Slots: QuestionSlot[] = [
  {
    slotId: "taxes/lesson-5/rate",
    conceptId: "vat-threshold",
    variants: [
      {
        variantId: "rt-mcq",
        step: {
          type: "mcq",
          question: "What is South Africa's standard VAT rate?",
          options: ["15%", "14%", "20%", "10%"],
          correct: 0,
          feedback: {
            correct: "Right. VAT is 15% on most goods and services. (A proposed increase in 2025 was reversed, so it remains 15%.)",
            incorrect: "It's 15%. A 2025 proposal to raise it was scrapped, so 15% still stands.",
          },
        },
      },
      {
        variantId: "rt-embedded-fill",
        step: {
          type: "fill-blank",
          title: "VAT inside the price",
          prompt: "You pay R100 for a VAT-inclusive item. The VAT portion is R100 − R100÷1.15 ≈ R____ (nearest rand).",
          correct: 13,
          feedback: {
            correct: "Correct: R100 ÷ 1.15 ≈ R86.96, so the VAT is about R13.04 (≈ R13). Most till slips show this line.",
            incorrect: "R100 ÷ 1.15 ≈ R86.96, so VAT ≈ R13.04 (about R13) of the R100.",
          },
        },
      },
      {
        variantId: "rt-consumption-tf",
        step: {
          type: "true-false",
          statement: "VAT is a consumption tax. It's built into the price of most things you buy.",
          correct: true,
          feedback: {
            correct: "True. You pay it on nearly every purchase, usually shown on your till slip. It's why the price you pay is more than the shelf 'ex-VAT' figure in trade.",
            incorrect: "It's true. VAT is a tax on spending, embedded in most prices. You pay it every time you buy standard-rated goods.",
          },
        },
      },
    ],
  },
  {
    slotId: "taxes/lesson-5/zero-rated",
    conceptId: "vat-threshold",
    variants: [
      {
        variantId: "zr-mcq",
        step: {
          type: "mcq",
          question: "Which of these is zero-rated (0% VAT) in South Africa?",
          options: ["Brown bread", "A chocolate bar", "A restaurant meal", "A fizzy drink"],
          correct: 0,
          feedback: {
            correct: "Right. Basic staples like brown bread are zero-rated to protect lower-income households. Chocolate, restaurant meals and cold drinks all carry 15% VAT.",
            incorrect: "Brown bread is zero-rated. Chocolate, restaurant meals and soft drinks are standard-rated at 15%.",
          },
        },
      },
      {
        variantId: "zr-why-tf",
        step: {
          type: "true-false",
          statement: "Certain basic foods are zero-rated for VAT to keep essentials affordable for poorer households.",
          correct: true,
          feedback: {
            correct: "True. Maize meal, brown bread, rice, dried beans, milk, eggs, fruit and veg and more are zero-rated. A deliberate way to ease the cost of basics.",
            incorrect: "It's true. Staples are zero-rated on purpose, to keep essential food affordable for low-income households.",
          },
        },
      },
      {
        variantId: "zr-which-scenario",
        step: {
          type: "scenario",
          question: "Nomsa buys maize meal, milk and eggs. How much VAT is on those staples?",
          options: [
            "R0. They're zero-rated basic foods",
            "15% on all of them",
            "15% on the milk only",
            "A special 5% rate",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Maize meal, milk and eggs are on the zero-rated list, so there's no VAT, one of the ways the system protects essential food.",
            incorrect: "Those are zero-rated staples, so no VAT. The zero-rating is designed to keep basic food affordable.",
          },
        },
      },
    ],
  },
  {
    slotId: "taxes/lesson-5/registration",
    conceptId: "vat-threshold",
    variants: [
      {
        variantId: "rg-tf",
        step: {
          type: "true-false",
          statement: "A small business must register for VAT once its annual taxable turnover exceeds R1 000 000.",
          correct: true,
          feedback: {
            correct: "True. Above R1 000 000 turnover, VAT registration is compulsory. You charge 15% and pay SARS the difference between VAT collected and VAT paid. Below that it's voluntary.",
            incorrect: "It's true. R1 000 000 turnover is the compulsory VAT-registration line. Under it, registering is optional.",
          },
        },
      },
      {
        variantId: "rg-below-mcq",
        step: {
          type: "mcq",
          question: "A business turning over R800 000 a year: must it register for VAT?",
          options: [
            "No. It's below the R1 000 000 compulsory threshold",
            "Yes. All businesses must register",
            "Yes. Over R500 000 you must register",
            "No. Businesses never register for VAT",
          ],
          correct: 0,
          feedback: {
            correct: "Right. R800 000 is under the R1 000 000 threshold, so registration is voluntary, not required.",
            incorrect: "Below R1 000 000 turnover, VAT registration is voluntary. At R800 000 it isn't compulsory.",
          },
        },
      },
      {
        variantId: "rg-collect-scenario",
        step: {
          type: "scenario",
          question: "Sipho's bakery turns over R1 200 000/year. What must he do about VAT?",
          options: [
            "Register, charge 15% on his products, and submit VAT returns to SARS",
            "Ignore VAT. Bakeries are exempt",
            "Charge 15% but keep it",
            "Only register if he wants to",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Over R1 000 000, registration is compulsory. He charges 15%, claims back VAT on his inputs, and pays SARS the net, on schedule.",
            incorrect: "He must register (turnover over R1m), charge 15%, and remit the net to SARS. It's a legal obligation, not optional.",
          },
        },
      },
    ],
  },
  {
    slotId: "taxes/lesson-5/exempt-vs-zero",
    conceptId: "vat-threshold",
    variants: [
      {
        variantId: "ez-mcq",
        step: {
          type: "mcq",
          question: "Which of these is VAT-exempt (not just zero-rated) in South Africa?",
          options: [
            "Residential rental",
            "Brown bread",
            "A cooldrink",
            "A laptop",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Residential rent, some financial services and public transport are VAT-exempt. Brown bread is zero-rated (a different category); cooldrinks and laptops are standard 15%.",
            incorrect: "Residential rental is VAT-exempt. Brown bread is zero-rated (not the same thing); most goods are standard-rated at 15%.",
          },
        },
      },
      {
        variantId: "ez-rent-tf",
        step: {
          type: "true-false",
          statement: "You don't pay VAT on your residential rent.",
          correct: true,
          feedback: {
            correct: "True. Residential rental is VAT-exempt, so there's no 15% added to your monthly rent. (Commercial property rental is different.)",
            incorrect: "It's true. Residential rent is exempt from VAT, so no 15% is charged on it.",
          },
        },
      },
      {
        variantId: "ez-consumer-mcq",
        step: {
          type: "mcq",
          question: "For an everyday consumer, why is it useful to know what's zero-rated or exempt?",
          options: [
            "It shows why some essentials cost less and helps you understand your till slip",
            "It lets you avoid all tax",
            "It has no practical use",
            "It doubles your VAT",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Knowing staples are zero-rated (and rent is exempt) helps you read your spending and see how the system protects essentials.",
            incorrect: "It helps you understand your costs. Why staples are cheaper and what the VAT line on your slip means.",
          },
        },
      },
    ],
  },
];

const lesson5Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "The Tax Embedded in Almost Everything",
    content:
      "<p>VAT is a consumption tax added to most goods and services. The standard rate is <strong>15%</strong>. On a R100 VAT-inclusive item, about R13.04 is VAT (R100 − R100÷1.15).</p><p><strong>Zero-rated (0%):</strong> basic foods, brown and white bread, maize meal, rice, dried beans, lentils, tinned pilchards, edible oils, milk, eggs, fruit and vegetables: kept affordable on purpose. <strong>Exempt:</strong> residential rental, some financial services, public transport. <strong>Businesses:</strong> turnover over R1 000 000/year means compulsory VAT registration. You charge 15% and remit the net to SARS.</p>",
  },
  { slot: "taxes/lesson-5/rate" },
  { slot: "taxes/lesson-5/zero-rated" },
  { slot: "taxes/lesson-5/registration" },
  { slot: "taxes/lesson-5/exempt-vs-zero" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 6 · "Capital Gains Tax Basics"
// ═══════════════════════════════════════════════════════════════════════════

const lesson6Slots: QuestionSlot[] = [
  {
    slotId: "taxes/lesson-6/inclusion",
    conceptId: "capital-gains-tax",
    variants: [
      {
        variantId: "in-mcq",
        step: {
          type: "mcq",
          question: "What portion of a net capital gain is included in an individual's taxable income?",
          options: ["40%", "100%", "18%", "66.6%"],
          correct: 0,
          feedback: {
            correct: "Right. Individuals include 40% of the net gain (after the annual exclusion) in taxable income, which is then taxed at their marginal rate.",
            incorrect: "For individuals it's 40% of the net gain that's included, then taxed at your marginal rate, not the full gain.",
          },
        },
      },
      {
        variantId: "in-effective-tf",
        step: {
          type: "true-false",
          statement: "Because only 40% of a gain is included, the effective CGT rate for a top earner is 18%, not 45%.",
          correct: true,
          feedback: {
            correct: "True. 45% (top rate) × 40% (inclusion) = 18% effective. So even the highest earners pay a maximum of 18% on their capital gains.",
            incorrect: "It's true, 45% × 40% = 18% effective. The inclusion rate is why CGT is much gentler than income tax.",
          },
        },
      },
      {
        variantId: "in-taxable-scenario",
        step: {
          type: "scenario",
          question: "After exclusions, Nomsa has a R20 000 net capital gain. How much is added to her taxable income?",
          options: [
            "R8 000 (40% of R20 000)",
            "R20 000 (the full gain)",
            "R0, gains aren't taxed",
            "R3 600",
          ],
          correct: 0,
          feedback: {
            correct: "Right: 40% × R20 000 = R8 000 added to her income, then taxed at her marginal rate. Only that R8 000 is taxed, not the whole gain.",
            incorrect: "It's 40% of R20 000 = R8 000 included in her income, then taxed at her marginal rate.",
          },
        },
      },
    ],
  },
  {
    slotId: "taxes/lesson-6/annual-exclusion",
    conceptId: "capital-gains-tax",
    variants: [
      {
        variantId: "ae-mcq",
        step: {
          type: "mcq",
          question: "How much of an individual's capital gain is excluded each year before CGT applies?",
          options: ["R50 000", "R5 000", "R500 000", "Nothing"],
          correct: 0,
          feedback: {
            correct: "Right. The annual exclusion is R50 000. You only include gains above that. Small gains often fall away entirely.",
            incorrect: "It's R50 000 a year. Only gains above the exclusion get taxed, so modest gains may be tax-free.",
          },
        },
      },
      {
        variantId: "ae-fill",
        step: {
          type: "fill-blank",
          title: "After the exclusion",
          prompt: "You make a R70 000 capital gain. After the R50 000 annual exclusion, the net gain that counts is R____.",
          correct: 20000,
          feedback: {
            correct: "Correct: R70 000 − R50 000 = R20 000 net. Then 40% of that (R8 000) is added to your taxable income.",
            incorrect: "R70 000 − R50 000 exclusion = R20 000 net gain to include (at 40%).",
          },
        },
      },
      {
        variantId: "ae-small-tf",
        step: {
          type: "true-false",
          statement: "If your total capital gain for the year is under R50 000, you generally owe no CGT.",
          correct: true,
          feedback: {
            correct: "True. The R50 000 annual exclusion means small gains fall away: handy for modest investors selling a little at a time.",
            incorrect: "It's true, a gain under the R50 000 exclusion generally isn't taxed. The exclusion shelters small gains.",
          },
        },
      },
    ],
  },
  {
    slotId: "taxes/lesson-6/primary-residence",
    conceptId: "capital-gains-tax",
    variants: [
      {
        variantId: "pr-tf",
        step: {
          type: "true-false",
          statement: "You must pay CGT on your primary residence only if the gain exceeds R3 000 000.",
          correct: true,
          feedback: {
            correct: "True. The primary-residence exclusion is R3 000 000 (2026/27). Only gain above that attracts CGT, which is why most people pay no CGT selling their home.",
            incorrect: "It's true, the first R3 000 000 of gain on your main home is excluded. Only the excess is taxed (and only 40% of it is included).",
          },
        },
      },
      {
        variantId: "pr-mcq",
        step: {
          type: "mcq",
          question: "How much of the capital gain on your primary residence is excluded from CGT (2026/27)?",
          options: ["R3 000 000", "R50 000", "R500 000", "Nothing. Homes are fully taxed"],
          correct: 0,
          feedback: {
            correct: "Right. The primary-residence exclusion is R3 000 000 (raised from R2 million). Most homeowners' gains fall under this, so they pay no CGT on their home.",
            incorrect: "It's R3 000 000 for a primary residence. Only gain above that is subject to CGT.",
          },
        },
      },
      {
        variantId: "pr-most-scenario",
        step: {
          type: "scenario",
          question: "Thabo sells the home he lived in for a R900 000 gain. Does he pay CGT?",
          options: [
            "No. R900 000 is well under the R3 000 000 primary-residence exclusion",
            "Yes, on the full R900 000",
            "Yes, at 45%",
            "Only if he's under 65",
          ],
          correct: 0,
          feedback: {
            correct: "Right. His R900 000 gain is under the R3 000 000 exclusion, so no CGT. This is why most homeowners pay nothing when selling their main home.",
            incorrect: "No CGT. His gain is under the R3 000 000 primary-residence exclusion. Only gains above R3m would be taxed.",
          },
        },
      },
    ],
  },
  {
    slotId: "taxes/lesson-6/what-triggers",
    conceptId: "capital-gains-tax",
    variants: [
      {
        variantId: "wt-mcq",
        step: {
          type: "mcq",
          question: "CGT is triggered when you:",
          options: [
            "Sell an asset for more than you paid",
            "Simply hold an investment that has risen in value",
            "Earn your monthly salary",
            "Open a savings account",
          ],
          correct: 0,
          feedback: {
            correct: "Right. CGT applies on disposal. When you actually sell for a gain. Paper gains on assets you still hold aren't taxed until you sell.",
            incorrect: "It's the sale that triggers CGT. An unrealised (paper) gain on something you still own isn't taxed yet.",
          },
        },
      },
      {
        variantId: "wt-unrealised-tf",
        step: {
          type: "true-false",
          statement: "A rise in the value of shares you still hold is taxed every year, even if you don't sell.",
          correct: false,
          feedback: {
            correct: "Correct. Gains are only taxed when you sell (dispose). While you hold, an increase is an unrealised 'paper' gain: no CGT until you cash it in.",
            incorrect: "It isn't taxed until you sell. Holding an asset that's risen creates a paper gain; CGT only applies on disposal.",
          },
        },
      },
      {
        variantId: "wt-tfsa-scenario",
        step: {
          type: "scenario",
          question: "Lerato holds her shares inside a TFSA and sells at a gain. Does she pay CGT?",
          options: [
            "No. Growth inside a TFSA, including capital gains, is tax-free",
            "Yes, 40% inclusion applies",
            "Yes, at her full marginal rate",
            "Only above R50 000",
          ],
          correct: 0,
          feedback: {
            correct: "Right. That's a big TFSA advantage, no CGT (or tax on interest/dividends) on qualifying growth inside the wrapper. Outside a TFSA, CGT would apply.",
            incorrect: "Inside a TFSA there's no CGT. Qualifying growth is tax-free. CGT would only apply to the same shares held outside a TFSA.",
          },
        },
      },
    ],
  },
];

const lesson6Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Profit on Investments Is Not Tax-Free",
    content:
      "<p>Sell an asset (shares, property, unit trusts, crypto) for more than you paid and the profit is a <strong>capital gain</strong>, taxed via CGT. For individuals: a <strong>R50 000 annual exclusion</strong> (you only count gains above it), then a <strong>40% inclusion rate</strong> (40% of the net gain is added to your taxable income). At the top 45% marginal rate that's an <strong>18% effective</strong> maximum.</p><p>Your <strong>primary residence</strong> gets a R3 000 000 exclusion (2026/27), which is why most people pay no CGT selling their home. Example: buy shares for R50 000, sell for R120 000 → R70 000 gain, less R50 000 exclusion = R20 000, of which 40% (R8 000) is added to income. And inside a TFSA, capital gains are tax-free entirely.</p>",
  },
  { slot: "taxes/lesson-6/inclusion" },
  { slot: "taxes/lesson-6/annual-exclusion" },
  { slot: "taxes/lesson-6/primary-residence" },
  { slot: "taxes/lesson-6/what-triggers" },
];

export const TAXES_BANKS: Record<string, LessonBank> = {
  "taxes::lesson-1": { layout: lesson1Layout, slots: lesson1Slots },
  "taxes::lesson-2": { layout: lesson2Layout, slots: lesson2Slots },
  "taxes::lesson-3": { layout: lesson3Layout, slots: lesson3Slots },
  "taxes::lesson-4": { layout: lesson4Layout, slots: lesson4Slots },
  "taxes::lesson-5": { layout: lesson5Layout, slots: lesson5Slots },
  "taxes::lesson-6": { layout: lesson6Layout, slots: lesson6Slots },
};
