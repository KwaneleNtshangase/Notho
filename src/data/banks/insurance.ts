import type { LessonLayoutItem, QuestionSlot } from "@/data/content";
import type { LessonBank } from "./money-basics";

/**
 * Bank for the Insurance & Protection course. Per docs/QUESTION-VOICE-GUIDE.md:
 * every lesson has 4 slots (>3 questions), each a pool of distinct SA scenarios,
 * concept-tagged for spaced-repetition resurface. Illness/death content is kept
 * factual and focused on the financial mechanics.
 */

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 1 · "Why You Need Life Cover"
// ═══════════════════════════════════════════════════════════════════════════

const lesson1Slots: QuestionSlot[] = [
  {
    slotId: "insurance/lesson-1/who-needs",
    conceptId: "life-insurance",
    variants: [
      {
        variantId: "wn-parent",
        step: {
          type: "mcq",
          question: "Who most urgently needs life insurance?",
          options: [
            "A parent of three with a home loan",
            "A single 22-year-old with no dependants",
            "A retiree with R5 million saved",
            "A student with no income",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The greatest need is where people depend on your income and there's debt to cover. That family would be devastated without it.",
            incorrect: "Life cover matters most where dependants rely on your income and debt exists, the parent of three with a bond, not the single student or the retiree.",
          },
        },
      },
      {
        variantId: "wn-nodependants-tf",
        step: {
          type: "true-false",
          statement: "A single person with no dependants and no debt has little need for large life cover.",
          correct: true,
          feedback: {
            correct: "True. Life cover exists to protect the people who depend on your income. With no dependants and no debt, that need is small.",
            incorrect: "It's true: with nobody relying on your income and no debt to settle, there's little for life cover to protect.",
          },
        },
      },
      {
        variantId: "wn-change-scenario",
        step: {
          type: "scenario",
          question: "Sipho didn't need life cover at 23. At 33 he's married with a baby and a bond. What changed?",
          options: [
            "People now depend on his income and there's debt. His need for cover jumped",
            "Nothing. His cover needs are fixed for life",
            "He needs less cover now",
            "Only his age matters",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Dependants and a bond are exactly what life cover protects. Life events, not age alone, are what change the need.",
            incorrect: "His life changed: a family and a bond mean people now rely on his income. That's when life cover becomes important.",
          },
        },
      },
    ],
  },
  {
    slotId: "insurance/lesson-1/employer-not-enough",
    conceptId: "life-insurance",
    variants: [
      {
        variantId: "ene-tf",
        step: {
          type: "true-false",
          statement: "Life cover through your employer's group scheme is always enough on its own.",
          correct: false,
          feedback: {
            correct: "Correct. Group cover is a useful start, but it usually ends when you leave the job and rarely matches what your family would actually need.",
            incorrect: "It isn't enough alone. Employer cover typically stops when you change jobs and is often a fraction of your family's real need.",
          },
        },
      },
      {
        variantId: "ene-leave-scenario",
        step: {
          type: "scenario",
          question: "Lerato relies only on her employer's life cover. She's about to resign for a new role. What's the risk?",
          options: [
            "Her cover likely ends with the old job, possibly leaving a gap before new cover starts",
            "Group cover automatically follows her forever",
            "There's no risk at all",
            "Her cover doubles when she resigns",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Group cover is tied to the job. Between roles, or if a new employer offers less, she could be exposed. Personal cover fills that gap.",
            incorrect: "The risk is a gap: employer cover usually ends with the job. A personal policy she owns isn't affected by changing employers.",
          },
        },
      },
      {
        variantId: "ene-topup-mcq",
        step: {
          type: "mcq",
          question: "What's the sensible way to think about employer group life cover?",
          options: [
            "A helpful base to top up with your own personal policy",
            "All the cover you'll ever need",
            "A reason to skip life cover entirely",
            "Something that follows you between all jobs",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Treat it as a foundation, not the whole house. A personal policy you own covers the shortfall and survives job changes.",
            incorrect: "It's a base to build on, not the full answer. Top it up with your own policy so you're covered regardless of where you work.",
          },
        },
      },
    ],
  },
  {
    slotId: "insurance/lesson-1/what-it-does",
    conceptId: "life-insurance",
    variants: [
      {
        variantId: "wid-what",
        step: {
          type: "mcq",
          question: "What does life insurance actually do?",
          options: [
            "Pays a lump sum to your family if you die",
            "Pays you a monthly pension while you're alive",
            "Covers your car in an accident",
            "Pays your medical bills",
          ],
          correct: 0,
          feedback: {
            correct: "Right. It pays your dependants a lump sum if you die, so they can cover debts, living costs and the future you'd have provided.",
            incorrect: "Life cover pays a lump sum to your family on your death. It's not a pension, medical or car product.",
          },
        },
      },
      {
        variantId: "wid-purpose-tf",
        step: {
          type: "true-false",
          statement: "The purpose of life cover is to protect the people who depend on your income after you're gone.",
          correct: true,
          feedback: {
            correct: "True. It replaces the financial support you provided, keeping a family in their home and children in school.",
            incorrect: "It's true. Life cover exists to protect your dependants financially when your income stops, not to benefit you directly.",
          },
        },
      },
      {
        variantId: "wid-use-scenario",
        step: {
          type: "scenario",
          question: "A life policy pays out R2 million to a family after the breadwinner dies. What is it typically used for?",
          options: [
            "Settling the bond, covering living costs and the children's schooling",
            "A luxury holiday only",
            "Buying shares on a tip",
            "Nothing. It must be returned",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The payout replaces lost income: clearing debt like the bond, covering everyday costs, and funding the children's education.",
            incorrect: "It's there to keep the family afloat (settle the bond, cover living costs, fund schooling) replacing the income that was lost.",
          },
        },
      },
    ],
  },
  {
    slotId: "insurance/lesson-1/rule-of-thumb",
    conceptId: "life-insurance",
    variants: [
      {
        variantId: "rot-fill",
        step: {
          type: "fill-blank",
          title: "The 10x starting point",
          prompt: "A common rule of thumb is 10× your annual salary. Earning R300 000 a year suggests roughly R____ million in cover.",
          correct: 3,
          feedback: {
            correct: "Correct: R300 000 × 10 = R3 million. It's a starting benchmark, not a hard ceiling.",
            incorrect: "R300 000 × 10 = R3 000 000, so about R3 million.",
          },
        },
      },
      {
        variantId: "rot-mcq",
        step: {
          type: "mcq",
          question: "Using the 10× rule, someone earning R20 000/month should aim for roughly:",
          options: ["R2.4 million", "R240 000", "R20 million", "R200 000"],
          correct: 0,
          feedback: {
            correct: "Right: R20 000 × 12 = R240 000 a year, × 10 = R2.4 million. A benchmark to start from and refine.",
            incorrect: "R20 000 × 12 × 10 = R2.4 million. Annualise the salary, then multiply by ten.",
          },
        },
      },
      {
        variantId: "rot-benchmark-tf",
        step: {
          type: "true-false",
          statement: "The 10× rule is a rough starting point, not a precise answer for everyone.",
          correct: true,
          feedback: {
            correct: "True. It's a quick benchmark. Your real need depends on your debt, dependants and how many years of income they'd need replaced.",
            incorrect: "It's true. 10× is a handy starting estimate. A precise figure adds up your actual debts, dependants and income-replacement years.",
          },
        },
      },
    ],
  },
];

const lesson1Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "What Happens When You're Gone?",
    content:
      "<p>In South Africa, families lose their homes and children leave school when a breadwinner dies without life cover. It's not a rare tragedy. It's the predictable outcome of skipping one product.</p><p>Life insurance pays a lump sum to your family if you die. If people depend on your income (a spouse, children, parents) you need it. A common rule of thumb: 10× your annual salary. Earning R300 000/year suggests about R3 million in cover.</p>",
  },
  { slot: "insurance/lesson-1/who-needs" },
  { slot: "insurance/lesson-1/employer-not-enough" },
  { slot: "insurance/lesson-1/what-it-does" },
  { slot: "insurance/lesson-1/rule-of-thumb" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 2 · "Disability Insurance Basics"
// ═══════════════════════════════════════════════════════════════════════════

const lesson2Slots: QuestionSlot[] = [
  {
    slotId: "insurance/lesson-2/replaces-income",
    conceptId: "disability-cover",
    variants: [
      {
        variantId: "ri-which",
        step: {
          type: "mcq",
          question: "Which type of cover replaces your monthly salary if illness or injury stops you working?",
          options: ["Income protection", "Life insurance", "Lump-sum disability", "Car insurance"],
          correct: 0,
          feedback: {
            correct: "Right. Income protection pays a percentage of your monthly income while you can't work, it steps in where your salary stops.",
            incorrect: "It's income protection: designed specifically to replace a portion of your monthly income during a disability.",
          },
        },
      },
      {
        variantId: "ri-scenario",
        step: {
          type: "scenario",
          question: "Thabo is booked off work for eight months after a serious injury. Which cover keeps money coming in monthly?",
          options: [
            "Income protection, it replaces a share of his salary while he recovers",
            "Life insurance. It pays out now",
            "His car insurance",
            "Nothing can help",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Income protection bridges the gap, paying monthly while he's unable to earn, protecting the bills that don't pause.",
            incorrect: "Income protection is the one that pays monthly during recovery. Life cover only pays on death; car insurance is unrelated.",
          },
        },
      },
      {
        variantId: "ri-monthly-tf",
        step: {
          type: "true-false",
          statement: "Income protection pays a regular monthly amount, not a single lump sum.",
          correct: true,
          feedback: {
            correct: "True. It mirrors a salary, a monthly benefit while you're disabled, which is why it's ideal for covering ongoing living costs.",
            incorrect: "It's true. Income protection pays monthly, like a salary, rather than one lump sum. That's what makes it fit everyday expenses.",
          },
        },
      },
    ],
  },
  {
    slotId: "insurance/lesson-2/more-likely",
    conceptId: "disability-cover",
    variants: [
      {
        variantId: "ml-tf",
        step: {
          type: "true-false",
          statement: "During your working years, you're more likely to be disabled and unable to work than to die young.",
          correct: true,
          feedback: {
            correct: "True. Injury and serious illness that stop you earning are more common than early death, yet disability cover is often overlooked.",
            incorrect: "It's true. Being unable to work through injury or illness is more likely than dying young, which is why disability cover matters so much.",
          },
        },
      },
      {
        variantId: "ml-asset-mcq",
        step: {
          type: "mcq",
          question: "For most working people, what is realistically their biggest financial asset?",
          options: [
            "Their ability to earn an income",
            "Their car",
            "Their phone",
            "Their furniture",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Your future earnings dwarf your possessions. Protecting your ability to earn is why disability cover is so valuable.",
            incorrect: "It's your ability to earn. Decades of income outweigh any single possession, which is exactly what disability cover protects.",
          },
        },
      },
      {
        variantId: "ml-overlook-scenario",
        step: {
          type: "scenario",
          question: "Ayesha has life cover but no disability cover. Which risk is she leaving unprotected?",
          options: [
            "An injury or illness that stops her earning while she's still alive",
            "Her death",
            "Her car being scratched",
            "None. Life cover handles everything",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Life cover only pays on death. If she's disabled and can't work, income protection is what keeps money coming in.",
            incorrect: "She's exposed to disability. Being alive but unable to earn. Life cover doesn't help there; income protection does.",
          },
        },
      },
    ],
  },
  {
    slotId: "insurance/lesson-2/two-types",
    conceptId: "disability-cover",
    variants: [
      {
        variantId: "tt-which-lump",
        step: {
          type: "mcq",
          question: "Which disability cover pays a single lump sum if you're permanently disabled?",
          options: [
            "Lump-sum disability cover",
            "Income protection",
            "Dread disease cover",
            "Third-party car insurance",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Lump-sum disability pays once, for permanent disability. Useful for big one-off costs like adapting your home or clearing debt.",
            incorrect: "It's lump-sum disability cover: a once-off payout for permanent disability, distinct from income protection's monthly benefit.",
          },
        },
      },
      {
        variantId: "tt-difference-tf",
        step: {
          type: "true-false",
          statement: "Income protection (monthly) and lump-sum disability (once-off) solve different problems and can work together.",
          correct: true,
          feedback: {
            correct: "True. Monthly income replaces your salary; the lump sum handles big one-off costs. Many people carry both for full protection.",
            incorrect: "It's true, they complement each other: monthly income for living costs, a lump sum for large one-off needs like home modifications.",
          },
        },
      },
      {
        variantId: "tt-match-scenario",
        step: {
          type: "scenario",
          question: "A permanent disability means Sipho needs a wheelchair-accessible home AND ongoing monthly income. Ideally he'd have:",
          options: [
            "Both a lump sum and income protection",
            "Only life cover",
            "Only car insurance",
            "Neither, savings alone always suffice",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The lump sum funds the big one-off adaptation; income protection covers the monthly bills. Together they cover both needs.",
            incorrect: "He needs both types: a lump sum for the home changes and income protection for ongoing living costs. One alone leaves a gap.",
          },
        },
      },
    ],
  },
  {
    slotId: "insurance/lesson-2/protect-earning",
    conceptId: "disability-cover",
    variants: [
      {
        variantId: "pe-why-mcq",
        step: {
          type: "mcq",
          question: "Why is protecting your income considered a foundation of financial planning?",
          options: [
            "Almost every other goal depends on your income continuing",
            "Because insurers say so",
            "It improves your credit score",
            "It's legally required",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Your savings, bond and family's lifestyle all rest on your earnings. Lose the income and everything built on it wobbles.",
            incorrect: "It's because your income underpins everything else. Savings, debt repayments, your family's lifestyle. Protect the foundation first.",
          },
        },
      },
      {
        variantId: "pe-young-tf",
        step: {
          type: "true-false",
          statement: "Younger workers with decades of earning ahead have a lot of future income worth protecting.",
          correct: true,
          feedback: {
            correct: "True. A 30-year-old has potentially 30+ years of earnings ahead. An enormous asset that disability cover exists to protect.",
            incorrect: "It's true. The younger you are, the more future income is at stake, and the more there is for disability cover to protect.",
          },
        },
      },
      {
        variantId: "pe-savings-scenario",
        step: {
          type: "scenario",
          question: "Nomsa thinks her savings alone would carry her through a long disability. What's the flaw?",
          options: [
            "Savings can run out fast against years of lost income and extra costs",
            "Savings are always more than enough",
            "Disability never lasts long",
            "Nothing: savings fully replace insurance",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A few months' savings can't replace years of income plus new medical or care costs. Income protection is built for exactly that gap.",
            incorrect: "The flaw is scale: savings drain quickly against years of lost earnings and added costs. That's what income protection is designed to cover.",
          },
        },
      },
    ],
  },
];

const lesson2Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Your Biggest Asset Is Your Ability to Earn",
    content:
      "<p>You're more likely to be disabled and unable to work than to die young. Disability cover replaces your income if illness or injury stops you working.</p><p><strong>Two types:</strong><br/>• <strong>Income protection:</strong> replaces a percentage of your monthly income<br/>• <strong>Lump-sum disability:</strong> pays once if you're permanently disabled</p><p>Without it, one accident can undo everything you've built.</p>",
  },
  { slot: "insurance/lesson-2/replaces-income" },
  { slot: "insurance/lesson-2/more-likely" },
  { slot: "insurance/lesson-2/two-types" },
  { slot: "insurance/lesson-2/protect-earning" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 3 · "Dread Disease Cover"
// ═══════════════════════════════════════════════════════════════════════════

const lesson3Slots: QuestionSlot[] = [
  {
    slotId: "insurance/lesson-3/when-pays",
    conceptId: "dread-disease",
    variants: [
      {
        variantId: "wp-diagnosis",
        step: {
          type: "mcq",
          question: "When does a dread disease (critical illness) policy pay out?",
          options: [
            "When you're diagnosed with a covered condition, whether you survive or not",
            "Only if you die from the illness",
            "Only if you're permanently disabled",
            "At retirement age regardless of illness",
          ],
          correct: 0,
          feedback: {
            correct: "Right. It pays on diagnosis, so the money is there to use while you're alive and dealing with the illness.",
            incorrect: "It pays on diagnosis of a covered condition, not on death. The payout is meant to support you through treatment and recovery.",
          },
        },
      },
      {
        variantId: "wp-survive-tf",
        step: {
          type: "true-false",
          statement: "You have to die for a dread disease policy to pay out.",
          correct: false,
          feedback: {
            correct: "Correct. It pays on diagnosis, whether or not you recover. That's the whole point, to help you through the illness itself.",
            incorrect: "You don't. Dread disease cover pays when you're diagnosed with a covered condition, so you can use the money while you're alive.",
          },
        },
      },
      {
        variantId: "wp-diff-mcq",
        step: {
          type: "mcq",
          question: "How is dread disease cover different from life insurance?",
          options: [
            "It pays on diagnosis of a serious illness, while you're alive; life cover pays on death",
            "They are exactly the same product",
            "It only covers car accidents",
            "It pays monthly like a salary",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Life cover helps your family after you die; dread disease helps you while you're living with and fighting a serious illness.",
            incorrect: "The difference is timing and beneficiary: dread disease pays you on diagnosis; life cover pays your family on death.",
          },
        },
      },
    ],
  },
  {
    slotId: "insurance/lesson-3/tax-free",
    conceptId: "dread-disease",
    variants: [
      {
        variantId: "tf-taxed-tf",
        step: {
          type: "true-false",
          statement: "The lump sum from a dread disease policy is subject to income tax in South Africa.",
          correct: false,
          feedback: {
            correct: "Correct. Proceeds from a life or dread disease policy are generally not taxed as income. They're capital in nature.",
            incorrect: "It's not taxed as income. Dread disease and life payouts are generally tax-free in SA, which adds to their value.",
          },
        },
      },
      {
        variantId: "tf-value-mcq",
        step: {
          type: "mcq",
          question: "Why is the tax-free nature of a dread disease payout an advantage?",
          options: [
            "You keep the full amount, unlike drawing down taxable savings or investments",
            "Because it earns interest automatically",
            "Because it's guaranteed to grow",
            "It isn't an advantage",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Every rand of the payout is yours to use, whereas cashing in some investments can trigger tax, leaving you less.",
            incorrect: "The advantage is you keep it all, no income tax, unlike some savings or investments that may be taxed when you access them.",
          },
        },
      },
      {
        variantId: "tf-vs-savings-scenario",
        step: {
          type: "scenario",
          question: "Facing big treatment costs, why might a tax-free R1 million payout beat withdrawing R1 million from investments?",
          options: [
            "The payout arrives whole, while selling investments can trigger tax and lock in losses",
            "Investments are always tax-free too",
            "The payout must be repaid",
            "There's no difference",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The insurance lump sum comes tax-free and on time; selling investments can mean capital gains tax and selling at a bad moment.",
            incorrect: "The payout lands whole and tax-free; cashing investments can trigger tax and force a sale at the wrong time. That's the edge.",
          },
        },
      },
    ],
  },
  {
    slotId: "insurance/lesson-3/lump-vs-income",
    conceptId: "dread-disease",
    variants: [
      {
        variantId: "lvi-flexible-mcq",
        step: {
          type: "mcq",
          question: "A dread disease payout is a lump sum. What does that let you do?",
          options: [
            "Decide how to use it, medical bills, debt, income replacement, or home changes",
            "Only pay the hospital directly",
            "Only replace your salary monthly",
            "Nothing, the insurer chooses",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The flexibility is the point: you direct the money wherever it's needed most, unlike a benefit tied to one purpose.",
            incorrect: "A lump sum is yours to allocate: bills, debt, replacing income, adapting your home. You decide, not the insurer.",
          },
        },
      },
      {
        variantId: "lvi-vs-ip-tf",
        step: {
          type: "true-false",
          statement: "Dread disease cover (a lump sum) is different from income protection (a monthly benefit).",
          correct: true,
          feedback: {
            correct: "True. Dread disease pays once, flexibly, on diagnosis; income protection pays monthly while you can't work. Many people hold both.",
            incorrect: "It's true. They're different tools: dread disease is a once-off flexible lump sum; income protection is an ongoing monthly benefit.",
          },
        },
      },
      {
        variantId: "lvi-nomsa-scenario",
        step: {
          type: "scenario",
          question: "Nomsa's dread disease policy pays R1.5 million tax-free after a serious diagnosis. A sensible way to use it is:",
          options: [
            "Cover treatment gaps, take needed time off, and reduce debt like her bond",
            "Spend it all on a new car immediately",
            "Invest it in a risky share tip",
            "Ignore it and take on debt instead",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The lump sum buys her breathing room. Covering medical shortfalls, unpaid leave, and lightening her debt while she focuses on recovery.",
            incorrect: "The point is stability: cover treatment gaps, afford time off, and cut debt. That's what the flexible lump sum is best used for.",
          },
        },
      },
    ],
  },
  {
    slotId: "insurance/lesson-3/why-sa",
    conceptId: "dread-disease",
    variants: [
      {
        variantId: "ws-cost-mcq",
        step: {
          type: "mcq",
          question: "Why does dread disease cover matter even for people who have medical aid?",
          options: [
            "Medical aid may not cover every cost, and there's still lost income during treatment",
            "Medical aid covers absolutely everything",
            "Dread disease replaces medical aid",
            "It doesn't matter if you have medical aid",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Even with medical aid, gaps, co-payments and months of reduced income can drain savings. The lump sum fills that hole.",
            incorrect: "Medical aid rarely covers 100%, and it doesn't replace the income you lose while unwell. Dread disease cover bridges both.",
          },
        },
      },
      {
        variantId: "ws-shortfall-tf",
        step: {
          type: "true-false",
          statement: "Even with medical aid, a serious illness can leave shortfalls and lost income that wipe out savings.",
          correct: true,
          feedback: {
            correct: "True. Co-payments, non-covered treatments and time off work add up fast. That combined hit is what dread disease cover softens.",
            incorrect: "It's true, gaps, co-payments and lost income during a serious illness can drain years of savings, even with medical aid.",
          },
        },
      },
      {
        variantId: "ws-medaid-diff-mcq",
        step: {
          type: "mcq",
          question: "How does dread disease cover differ from medical aid?",
          options: [
            "Medical aid pays healthcare providers; dread disease pays YOU a lump sum to use freely",
            "They are the same thing",
            "Dread disease pays the hospital directly only",
            "Medical aid gives you a lump sum",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Medical aid settles treatment bills; dread disease hands you cash for everything else. Income, debt, home, whatever you need.",
            incorrect: "They're different: medical aid pays providers for treatment; dread disease pays you a flexible lump sum for the wider costs.",
          },
        },
      },
    ],
  },
];

const lesson3Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "A Lump Sum When You Need It Most",
    content:
      "<p>Dread disease cover (also called critical illness cover) pays a tax-free lump sum if you're diagnosed with a serious illness, even if you survive and recover.</p><p>Conditions typically include cancer, heart attack, stroke and kidney failure. In SA, treatment for a serious illness can run to hundreds of thousands of rands, and even with medical aid the shortfalls and lost income can wipe out savings. The lump sum is yours to use as you choose: unlike income protection, which replaces your monthly salary.</p>",
  },
  { slot: "insurance/lesson-3/when-pays" },
  { slot: "insurance/lesson-3/tax-free" },
  { slot: "insurance/lesson-3/lump-vs-income" },
  { slot: "insurance/lesson-3/why-sa" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 4 · "How Much Cover Do You Need?"
// ═══════════════════════════════════════════════════════════════════════════

const lesson4Slots: QuestionSlot[] = [
  {
    slotId: "insurance/lesson-4/tenx-calc",
    conceptId: "life-insurance",
    variants: [
      {
        variantId: "tx-25k",
        step: {
          type: "mcq",
          question: "Using the 10× rule, how much life cover should someone earning R25 000/month aim for?",
          options: ["R3 000 000", "R250 000", "R1 500 000", "R5 000 000"],
          correct: 0,
          feedback: {
            correct: "Right: R25 000 × 12 = R300 000 a year, × 10 = R3 000 000. A benchmark to start from, not a ceiling.",
            incorrect: "R25 000 × 12 × 10 = R3 000 000. Annualise the salary, then multiply by ten.",
          },
        },
      },
      {
        variantId: "tx-fill-18k",
        step: {
          type: "fill-blank",
          title: "Apply the 10× rule",
          prompt: "Someone earns R18 000/month. Annual salary × 10 = R____ (in rands).",
          correct: 2160000,
          feedback: {
            correct: "Correct: R18 000 × 12 = R216 000, × 10 = R2 160 000.",
            incorrect: "R18 000 × 12 = R216 000, then × 10 = R2 160 000.",
          },
        },
      },
      {
        variantId: "tx-starting-tf",
        step: {
          type: "true-false",
          statement: "The 10× rule gives a starting benchmark, but your real cover need can be higher or lower.",
          correct: true,
          feedback: {
            correct: "True. Big debts or many dependants push it up; substantial savings or few dependants pull it down. Use 10× as a first estimate.",
            incorrect: "It's true. 10× is just a starting point. Your actual need depends on your debt, dependants and savings.",
          },
        },
      },
    ],
  },
  {
    slotId: "insurance/lesson-4/add-up-needs",
    conceptId: "life-insurance",
    variants: [
      {
        variantId: "aun-what",
        step: {
          type: "mcq",
          question: "A more precise way to size your life cover is to add up:",
          options: [
            "Outstanding debt, children's education, years of income to replace, and final costs",
            "Only your monthly grocery bill",
            "The value of your phone",
            "Your favourite number",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Total what your family would actually face: debts to clear, education to fund, income to replace, plus funeral and estate costs.",
            incorrect: "Add the real needs: debt, education, income replacement and final costs. That builds a figure tailored to your family, not a guess.",
          },
        },
      },
      {
        variantId: "aun-debt-tf",
        step: {
          type: "true-false",
          statement: "Your outstanding debts, like a home loan, should be included when working out how much life cover you need.",
          correct: true,
          feedback: {
            correct: "True. A payout that clears the bond keeps your family in their home, one of the most important jobs life cover does.",
            incorrect: "It's true, debts like the bond belong in the calculation, so the payout can clear them and keep the family housed.",
          },
        },
      },
      {
        variantId: "aun-education-scenario",
        step: {
          type: "scenario",
          question: "Lerato has two young children. Why does that raise her life cover need?",
          options: [
            "Years of living costs and education for the children would need funding if her income stopped",
            "Children reduce how much cover you need",
            "Children have no effect on cover",
            "Only her car matters",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Dependent children mean years of support and schooling to fund. A big reason her cover should be higher.",
            incorrect: "More dependants means more to protect: years of living costs and education. That pushes her cover need up, not down.",
          },
        },
      },
    ],
  },
  {
    slotId: "insurance/lesson-4/income-replacement",
    conceptId: "life-insurance",
    variants: [
      {
        variantId: "ir-ratio-mcq",
        step: {
          type: "mcq",
          question: "A common target is to replace roughly what share of your net income for your family?",
          options: ["Around 75%", "About 10%", "Exactly 100% forever", "None. They'll manage"],
          correct: 0,
          feedback: {
            correct: "Right. Aiming to replace about 75% of net income keeps your family's lifestyle roughly intact without over-insuring.",
            incorrect: "The usual target is around 75% of net income. Enough to keep the household running without paying for excessive cover.",
          },
        },
      },
      {
        variantId: "ir-fill",
        step: {
          type: "fill-blank",
          title: "Replacing income",
          prompt: "Take-home pay is R20 000/month. Replacing 75% means the family needs about R____ a month.",
          correct: 15000,
          feedback: {
            correct: "Correct: 75% of R20 000 = R15 000 a month.",
            incorrect: "75% of R20 000 = R15 000 per month.",
          },
        },
      },
      {
        variantId: "ir-why-tf",
        step: {
          type: "true-false",
          statement: "Life cover can be structured to provide ongoing income for a family, not just a single lump sum to spend at once.",
          correct: true,
          feedback: {
            correct: "True. A payout can be invested to draw a monthly income, so it replaces a salary over years rather than being spent all at once.",
            incorrect: "It's true. A lump sum can be invested to generate monthly income, replacing lost earnings over time instead of vanishing quickly.",
          },
        },
      },
    ],
  },
  {
    slotId: "insurance/lesson-4/review",
    conceptId: "life-insurance",
    variants: [
      {
        variantId: "rev-unchanged-tf",
        step: {
          type: "true-false",
          statement: "Once set up, you should leave your life cover amount unchanged for the life of the policy.",
          correct: false,
          feedback: {
            correct: "Correct. Your needs shift as salary, debt and family change. Review every couple of years, and after big life events.",
            incorrect: "You shouldn't. Cover taken out at 25 is usually too little at 35. Review it regularly and after major life changes.",
          },
        },
      },
      {
        variantId: "rev-when-mcq",
        step: {
          type: "mcq",
          question: "When is it most important to review your life cover?",
          options: [
            "After big life events",
            "Never, set it and forget it",
            "Only when you retire",
            "Only if the insurer calls you",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Life events change what your family would need. A quick review after each keeps your cover matched to reality.",
            incorrect: "Review after life events. A new child, a bond, a raise. Those are exactly when your cover need shifts.",
          },
        },
      },
      {
        variantId: "rev-grow-scenario",
        step: {
          type: "scenario",
          question: "Sipho set his cover at 25 when he was single. He's now 35, married with a bond and a child. What should he do?",
          options: [
            "Review and almost certainly increase his cover to match his new responsibilities",
            "Leave it. The old amount is fine",
            "Cancel it entirely",
            "Reduce it",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A single 25-year-old's cover rarely fits a 35-year-old with a family and a bond. He should review and top it up.",
            incorrect: "He should review and likely increase it. His responsibilities grew a lot; his cover needs to catch up.",
          },
        },
      },
    ],
  },
];

const lesson4Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Calculating Your Cover Gap",
    content:
      "<p>Most South Africans are underinsured. The question isn't whether to have life cover, but <strong>how much</strong>.</p><p><strong>The 10× rule:</strong> a common starting point is 10× your annual salary. Earn R30 000/month (R360 000/year) and that's about R3.6 million.</p><p><strong>More precise:</strong> add up outstanding debt, children's education, the years of income to replace, and final costs. A common target is to replace about 75% of your net income. Review it every couple of years. Cover taken out at 25 is usually too little at 35.</p>",
  },
  { slot: "insurance/lesson-4/tenx-calc" },
  { slot: "insurance/lesson-4/add-up-needs" },
  { slot: "insurance/lesson-4/income-replacement" },
  { slot: "insurance/lesson-4/review" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 5 · "Car Insurance Explained"
// ═══════════════════════════════════════════════════════════════════════════

const lesson5Slots: QuestionSlot[] = [
  {
    slotId: "insurance/lesson-5/third-party-covers",
    conceptId: "car-insurance",
    variants: [
      {
        variantId: "tpc-what",
        step: {
          type: "mcq",
          question: "What does 'third-party' car insurance cover?",
          options: [
            "Damage you cause to other people's property or vehicles",
            "Damage to your own car only",
            "Medical bills for your passengers",
            "Theft of items inside your car",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Third-party covers the damage YOU cause to OTHERS, their car, property or injury claims. Your own car isn't covered.",
            incorrect: "Third-party covers damage you cause to others, not your own vehicle. That's the key limitation to understand.",
          },
        },
      },
      {
        variantId: "tpc-ownwriteoff-scenario",
        step: {
          type: "scenario",
          question: "You have third-party-only cover and cause a crash that writes off your own car. Who pays to replace it?",
          options: [
            "You do. Third-party doesn't fix your own vehicle",
            "The insurer replaces it fully",
            "The other driver always pays",
            "SARS refunds you",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Third-party only pays for damage to others. Replacing your own written-off car needs comprehensive cover.",
            incorrect: "You'd pay out of pocket. Third-party doesn't touch your own car. Only comprehensive cover would replace it.",
          },
        },
      },
      {
        variantId: "tpc-uninsured-tf",
        step: {
          type: "true-false",
          statement: "Driving with no insurance means you personally pay for damage you cause to other people's property.",
          correct: true,
          feedback: {
            correct: "True. With no cover, a crash you cause can leave you owing for someone else's car or property out of your own pocket: potentially huge.",
            incorrect: "It's true. Uninsured, you're personally liable for the damage you cause to others. That can be financially ruinous.",
          },
        },
      },
    ],
  },
  {
    slotId: "insurance/lesson-5/three-tiers",
    conceptId: "car-insurance",
    variants: [
      {
        variantId: "tt-comprehensive-mcq",
        step: {
          type: "mcq",
          question: "Which level of car insurance covers both your own car and damage to others?",
          options: [
            "Comprehensive",
            "Third-party only",
            "Third-party, fire & theft",
            "No insurance",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Comprehensive is the widest (and priciest): your car plus third-party damage. The others cover less.",
            incorrect: "Comprehensive covers your own car AND others. Third-party (and fire & theft) cover progressively less.",
          },
        },
      },
      {
        variantId: "tt-order-mcq",
        step: {
          type: "mcq",
          question: "Which tier sits in the middle, covering others, plus fire and theft of your own car?",
          options: [
            "Third-party, fire & theft",
            "Comprehensive",
            "Third-party only",
            "Buildings insurance",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Third-party, fire & theft adds fire and theft of your car to basic third-party cover, a step below comprehensive.",
            incorrect: "It's third-party, fire & theft: third-party cover plus fire and theft of your own car, sitting between the cheapest and fullest options.",
          },
        },
      },
      {
        variantId: "tt-tradeoff-tf",
        step: {
          type: "true-false",
          statement: "More cover generally costs more, so the right tier depends on your car's value and what you can afford.",
          correct: true,
          feedback: {
            correct: "True. Comprehensive costs most but protects most. Match the tier to your car's value and your budget, not just the lowest price.",
            incorrect: "It's true. Wider cover costs more. Choose the tier that fits your car's value and budget, balancing price against protection.",
          },
        },
      },
    ],
  },
  {
    slotId: "insurance/lesson-5/which-tier",
    conceptId: "car-insurance",
    variants: [
      {
        variantId: "wt-newcar-scenario",
        step: {
          type: "scenario",
          question: "Nomsa just financed a brand-new car she still owes a lot on. Which cover usually fits best?",
          options: [
            "Comprehensive. A write-off shouldn't leave her owing on a car she can't drive",
            "Third-party only",
            "No insurance",
            "Only fire cover",
          ],
          correct: 0,
          feedback: {
            correct: "Right. On a financed car, comprehensive protects both the asset and the loan. Many lenders require it for exactly this reason.",
            incorrect: "A financed, high-value car usually needs comprehensive, so a write-off doesn't leave her repaying a loan on a wreck.",
          },
        },
      },
      {
        variantId: "wt-oldcar-scenario",
        step: {
          type: "scenario",
          question: "Thabo drives an old car worth about R15 000. He's weighing full comprehensive cover. What's reasonable to consider?",
          options: [
            "A cheaper tier may make sense",
            "He must always take the most expensive cover",
            "He needs no cover of any kind ever",
            "Insurance is pointless for any car",
          ],
          correct: 0,
          feedback: {
            correct: "Right. On a low-value car, comprehensive premiums can outweigh the benefit. Third-party cover for others' damage may be the sensible balance.",
            incorrect: "For a low-value car, comprehensive can cost more than it's worth. A lower tier (still covering others) is worth considering.",
          },
        },
      },
      {
        variantId: "wt-min-tf",
        step: {
          type: "true-false",
          statement: "Even on a cheap car, having at least third-party cover protects you from big claims for damage you cause to others.",
          correct: true,
          feedback: {
            correct: "True. The car may be cheap, but the Mercedes you might hit isn't. Third-party is the sensible minimum for exactly that risk.",
            incorrect: "It's true. Third-party is the smart minimum. Your car's value doesn't cap what you'd owe for damaging someone else's.",
          },
        },
      },
    ],
  },
  {
    slotId: "insurance/lesson-5/excess",
    conceptId: "car-insurance",
    variants: [
      {
        variantId: "ex-what-mcq",
        step: {
          type: "mcq",
          question: "The 'excess' on a car insurance policy is:",
          options: [
            "The amount you pay yourself towards a claim before the insurer covers the rest",
            "A bonus the insurer pays you",
            "The monthly premium",
            "The value of your car",
          ],
          correct: 0,
          feedback: {
            correct: "Right. On each claim you pay the excess first; the insurer covers the balance. A higher excess usually means a lower monthly premium.",
            incorrect: "The excess is your share of each claim, paid before the insurer pays the rest. It's not a bonus or your premium.",
          },
        },
      },
      {
        variantId: "ex-tradeoff-tf",
        step: {
          type: "true-false",
          statement: "Choosing a higher excess usually lowers your monthly premium but means paying more yourself when you claim.",
          correct: true,
          feedback: {
            correct: "True. It's a trade-off: cheaper each month, but a bigger bill at claim time. Pick an excess you could actually afford to pay.",
            incorrect: "It's true. Higher excess, lower premium, but more out of your pocket per claim. Set it to something you could genuinely cover.",
          },
        },
      },
      {
        variantId: "ex-afford-scenario",
        step: {
          type: "scenario",
          question: "Ayesha picks a very high excess to get a cheap premium, but has little savings. What's the risk?",
          options: [
            "If she claims, she may not afford the excess and can't get the repair done",
            "There's no risk. High excess is always best",
            "Her premium will rise instantly",
            "The insurer pays her excess for her",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A cheap premium is no help if she can't pay the excess to actually claim. Match the excess to what she could afford in a crisis.",
            incorrect: "The risk is being unable to pay the excess when she needs to claim. Set it to an amount she could realistically cover.",
          },
        },
      },
    ],
  },
];

const lesson5Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "The Tiers of Car Insurance",
    content:
      "<p><strong>Comprehensive:</strong> covers your car plus third-party damage. Most expensive.</p><p><strong>Third-party, fire & theft:</strong> covers others if you cause an accident, plus fire and theft of your own car.</p><p><strong>Third-party only:</strong> covers damage you cause to others. Cheapest, and the sensible minimum.</p><p>Drive with no insurance and YOU pay, out of pocket, for damage you cause to other people's property.</p>",
  },
  { slot: "insurance/lesson-5/third-party-covers" },
  { slot: "insurance/lesson-5/three-tiers" },
  { slot: "insurance/lesson-5/which-tier" },
  { slot: "insurance/lesson-5/excess" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 6 · "Home Insurance Basics"
// ═══════════════════════════════════════════════════════════════════════════

const lesson6Slots: QuestionSlot[] = [
  {
    slotId: "insurance/lesson-6/buildings-vs-contents",
    conceptId: "home-insurance",
    variants: [
      {
        variantId: "bvc-which",
        step: {
          type: "mcq",
          question: "Which insurance covers the physical structure of your home: walls, roof, fitted kitchen?",
          options: ["Buildings insurance", "Contents insurance", "Car insurance", "Life insurance"],
          correct: 0,
          feedback: {
            correct: "Right. Buildings insurance rebuilds or repairs the structure after events like fire, storm or a burst geyser. If you have a bond, your bank usually requires it.",
            incorrect: "It's buildings insurance. It covers the structure itself. Your movable belongings are covered by contents insurance instead.",
          },
        },
      },
      {
        variantId: "bvc-contents-mcq",
        step: {
          type: "mcq",
          question: "Your TV, fridge, furniture and clothing inside the home are covered by:",
          options: ["Contents insurance", "Buildings insurance", "Third-party car cover", "Dread disease cover"],
          correct: 0,
          feedback: {
            correct: "Right. Contents insurance covers your movable belongings against theft, fire and (depending on the policy) accidental damage.",
            incorrect: "Your belongings need contents insurance. Buildings cover is for the structure; contents is for what's inside it.",
          },
        },
      },
      {
        variantId: "bvc-both-tf",
        step: {
          type: "true-false",
          statement: "Buildings and contents insurance protect different things, and a homeowner often needs both.",
          correct: true,
          feedback: {
            correct: "True. Buildings covers the structure; contents covers your belongings. A fire can destroy both, so many homeowners carry each.",
            incorrect: "It's true. They cover different things (structure vs belongings), so a homeowner frequently needs both.",
          },
        },
      },
    ],
  },
  {
    slotId: "insurance/lesson-6/sectional-title",
    conceptId: "home-insurance",
    variants: [
      {
        variantId: "st-who-covers",
        step: {
          type: "mcq",
          question: "If you own a sectional-title flat, which insurance does the body corporate usually provide?",
          options: [
            "Buildings insurance for the structure",
            "Contents insurance for everyone",
            "Both buildings and contents for all owners",
            "No insurance at all",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The body corporate insures the building structure. You still need your own contents cover for your belongings inside.",
            incorrect: "The body corporate covers the building structure; your furniture, appliances and valuables need a separate contents policy in your name.",
          },
        },
      },
      {
        variantId: "st-still-need-tf",
        step: {
          type: "true-false",
          statement: "In a sectional-title flat, you still need your own contents insurance even though the body corporate insures the building.",
          correct: true,
          feedback: {
            correct: "True. The body corporate's cover stops at the structure. Your possessions inside are your responsibility to insure.",
            incorrect: "It's true. You need your own contents cover. The body corporate only insures the building, not your belongings.",
          },
        },
      },
      {
        variantId: "st-check-scenario",
        step: {
          type: "scenario",
          question: "Lerato buys a townhouse in a sectional-title complex. What should she check about insurance?",
          options: [
            "Exactly what the body corporate policy covers",
            "Nothing. She's fully covered automatically",
            "Only her car insurance",
            "That the complex has a nice garden",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Confirm what the body corporate covers, then arrange contents cover and top up any gaps so she's not caught short.",
            incorrect: "She should check the body corporate's cover and then insure her own contents and gaps, not assume everything's handled.",
          },
        },
      },
    ],
  },
  {
    slotId: "insurance/lesson-6/wear-tear",
    conceptId: "home-insurance",
    variants: [
      {
        variantId: "wt-covered-tf",
        step: {
          type: "true-false",
          statement: "Home insurance typically covers damage caused by gradual wear and tear over time.",
          correct: false,
          feedback: {
            correct: "Correct. Insurance covers sudden, unexpected events, not slow deterioration. A pipe that's been slowly rusting for years is usually excluded.",
            incorrect: "Wear and tear is almost always excluded. Insurance is for sudden, unexpected damage, not aging or lack of maintenance.",
          },
        },
      },
      {
        variantId: "wt-sudden-mcq",
        step: {
          type: "mcq",
          question: "Which of these is home insurance designed to cover?",
          options: [
            "A sudden burst pipe flooding a room",
            "A tap that's been dripping for two years",
            "Paint fading over a decade",
            "A roof slowly wearing out from age",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Insurance is for the sudden and unexpected. A burst pipe. Slow, foreseeable deterioration is a maintenance issue, not a claim.",
            incorrect: "It covers sudden events like a burst pipe. Slow drips, fading and aging are wear and tear, excluded as maintenance.",
          },
        },
      },
      {
        variantId: "wt-maintenance-scenario",
        step: {
          type: "scenario",
          question: "Thabo ignored a slow leak for months; now there's major damage. Why might his claim be rejected?",
          options: [
            "Insurers exclude gradual damage from neglected maintenance. It's not sudden or unexpected",
            "Because he has too much cover",
            "Insurers always pay everything",
            "Because leaks are never a problem",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A slow, known leak is a maintenance failure, not a sudden event, so it typically falls outside cover. Fixing small issues early avoids this.",
            incorrect: "Gradual damage from ignored maintenance is usually excluded. Insurance pays for sudden events, not slow, avoidable deterioration.",
          },
        },
      },
    ],
  },
  {
    slotId: "insurance/lesson-6/geyser",
    conceptId: "home-insurance",
    variants: [
      {
        variantId: "gz-covered-mcq",
        step: {
          type: "mcq",
          question: "Geysers are a major SA insurance claim. What's typically the case?",
          options: [
            "A sudden burst or leak is usually covered, but age-related rust may be excluded",
            "Geysers are never covered at all",
            "Only brand-new geysers are excluded",
            "Insurers cover geysers with no conditions",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Most buildings policies cover a sudden geyser burst, but damage from an old, rusted geyser can be excluded. Check the wording and your geyser's age.",
            incorrect: "A sudden burst is usually covered; rust from an aging geyser often isn't. Always check the policy wording and your geyser's age.",
          },
        },
      },
      {
        variantId: "gz-age-tf",
        step: {
          type: "true-false",
          statement: "The age and condition of your geyser can affect whether a claim is paid.",
          correct: true,
          feedback: {
            correct: "True. A very old geyser failing from rust may be treated as wear and tear. Knowing your policy's stance beats finding out at claim time.",
            incorrect: "It's true. An old, rusted geyser can be excluded as wear and tear. Check your policy so a burst-geyser claim isn't a nasty surprise.",
          },
        },
      },
      {
        variantId: "gz-check-scenario",
        step: {
          type: "scenario",
          question: "Nomsa's geyser is 12 years old. What's the smart insurance move?",
          options: [
            "Check her policy's geyser terms and consider replacing an old geyser before it fails",
            "Assume any burst is automatically covered",
            "Cancel her home insurance",
            "Wait for it to burst and hope",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Know the terms, and replacing an aging geyser proactively can avoid both the damage and a possibly-rejected claim.",
            incorrect: "She should check the wording and consider replacing an old geyser. Assuming automatic cover on a 12-year-old geyser is risky.",
          },
        },
      },
    ],
  },
];

const lesson6Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Protecting Your Biggest Asset",
    content:
      "<p>Two types of insurance protect a home. <strong>Buildings insurance</strong> covers the structure (walls, roof, fitted kitchen, plumbing) paying to rebuild after fire, storm or a burst geyser. If you have a bond, your bank usually requires it. <strong>Contents insurance</strong> covers your furniture, appliances, electronics and valuables inside.</p><p>In sectional-title, the body corporate usually insures the structure, so you still need contents cover. Watch the exclusions: gradual wear and tear is generally not covered, and an aging, rusted geyser may be excluded. Check the wording.</p>",
  },
  { slot: "insurance/lesson-6/buildings-vs-contents" },
  { slot: "insurance/lesson-6/sectional-title" },
  { slot: "insurance/lesson-6/wear-tear" },
  { slot: "insurance/lesson-6/geyser" },
];

export const INSURANCE_BANKS: Record<string, LessonBank> = {
  "insurance::lesson-1": { layout: lesson1Layout, slots: lesson1Slots },
  "insurance::lesson-2": { layout: lesson2Layout, slots: lesson2Slots },
  "insurance::lesson-3": { layout: lesson3Layout, slots: lesson3Slots },
  "insurance::lesson-4": { layout: lesson4Layout, slots: lesson4Slots },
  "insurance::lesson-5": { layout: lesson5Layout, slots: lesson5Slots },
  "insurance::lesson-6": { layout: lesson6Layout, slots: lesson6Slots },
};
