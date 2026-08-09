import type { LessonLayoutItem, QuestionSlot } from "@/data/content";
import type { LessonBank } from "./money-basics";

/**
 * Bank for the Emergency Fund & Risk course. Per docs/QUESTION-VOICE-GUIDE.md:
 * every lesson has 4 slots (>3 questions), each a pool of distinct SA scenarios,
 * all concept-tagged for spaced-repetition resurface.
 */

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 1 · "How Much Do You Need?"
// ═══════════════════════════════════════════════════════════════════════════

const lesson1Slots: QuestionSlot[] = [
  {
    slotId: "emergency-fund/lesson-1/how-many-months",
    conceptId: "emergency-fund",
    variants: [
      {
        variantId: "hmm-3to6",
        step: {
          type: "mcq",
          question: "How many months of expenses should an emergency fund ideally cover?",
          options: ["3–6 months", "1 month", "10–12 months", "Just R1 000 is plenty"],
          correct: 0,
          feedback: {
            correct: "Right. 3–6 months of essential expenses is the standard. Lean toward 6 if your income is irregular or you have dependants.",
            incorrect: "The target is 3–6 months of essential expenses, enough to survive job loss or a major crisis.",
          },
        },
      },
      {
        variantId: "hmm-irregular-scenario",
        step: {
          type: "scenario",
          question: "Sipho is a freelancer with an unpredictable income and two kids. Where in the 3–6 month range should he aim?",
          options: [
            "Toward the higher end",
            "Below 3 months. Freelancers need less",
            "Exactly 1 month is fine",
            "He doesn't need one at all",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Irregular income and dependants mean bigger, less predictable gaps, a deeper buffer (nearer 6 months) fits his risk.",
            incorrect: "Less-certain income calls for MORE buffer, not less. Sipho should aim nearer 6 months, not below 3.",
          },
        },
      },
      {
        variantId: "hmm-essentials-tf",
        step: {
          type: "true-false",
          statement: "An emergency fund is measured against your essential expenses, not your total spending.",
          correct: true,
          feedback: {
            correct: "True. In a real crisis you cut the extras. Base the target on rent, food, transport and utilities: the non-negotiables.",
            incorrect: "It's true, size it on essentials (rent, food, transport, utilities), since that's what you'd actually need to cover in a crisis.",
          },
        },
      },
    ],
  },
  {
    slotId: "emergency-fund/lesson-1/not-stocks",
    conceptId: "emergency-fund",
    variants: [
      {
        variantId: "ns-tf",
        step: {
          type: "true-false",
          statement: "You should invest your emergency fund in shares for higher returns.",
          correct: false,
          feedback: {
            correct: "Correct. An emergency fund must be instantly accessible and stable. Shares can drop 30% exactly when you need the cash most.",
            incorrect: "Never put your emergency fund in shares. It has to be safe and instantly available. Markets can crash right when you need it.",
          },
        },
      },
      {
        variantId: "ns-why-mcq",
        step: {
          type: "mcq",
          question: "Why shouldn't your emergency fund sit in the stock market?",
          options: [
            "It could be down 25% that day",
            "Shares are illegal to sell fast",
            "The bank won't allow it",
            "Shares never actually grow",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Emergencies don't wait for a good market. Being forced to sell at a loss defeats the whole purpose of the fund.",
            incorrect: "The issue is timing risk: markets can be down when the emergency hits, forcing you to sell low. Keep it stable and liquid.",
          },
        },
      },
      {
        variantId: "ns-purpose-scenario",
        step: {
          type: "scenario",
          question: "Lerato's friend says she's 'wasting' her emergency fund in a savings account instead of an equity ETF. Is the friend right?",
          options: [
            "No, its job is safety and access",
            "Yes, always chase the highest return",
            "Yes, savings accounts are pointless",
            "No, but only because ETFs are bad",
          ],
          correct: 0,
          feedback: {
            correct: "Right. An emergency fund isn't an investment. It's insurance you can reach in a day. Growth money belongs elsewhere.",
            incorrect: "The friend's wrong. The emergency fund is for safety and instant access; the ETF is for long-term money she won't need soon.",
          },
        },
      },
    ],
  },
  {
    slotId: "emergency-fund/lesson-1/target-calc",
    conceptId: "emergency-fund",
    variants: [
      {
        variantId: "tc-fill-3mo",
        step: {
          type: "fill-blank",
          title: "Your 3-month target",
          prompt: "Your essential monthly expenses are R12 000. A 3-month emergency fund target is R____.",
          correct: 36000,
          feedback: {
            correct: "Correct: R12 000 × 3 = R36 000. Six months would be R72 000.",
            incorrect: "R12 000 × 3 = R36 000 for a 3-month buffer.",
          },
        },
      },
      {
        variantId: "tc-mcq-6mo",
        step: {
          type: "mcq",
          question: "If your essential expenses are R8 000/month, what's a 6-month emergency fund target?",
          options: ["R48 000", "R8 000", "R24 000", "R96 000"],
          correct: 0,
          feedback: {
            correct: "Right: R8 000 × 6 = R48 000 for a full 6-month cushion.",
            incorrect: "R8 000 × 6 = R48 000 for six months of essentials.",
          },
        },
      },
      {
        variantId: "tc-range-scenario",
        step: {
          type: "scenario",
          question: "Nomsa's essentials are R10 000/month. What's her sensible emergency-fund target range?",
          options: [
            "About R30 000 to R60 000",
            "About R10 000 (one month)",
            "Over R120 000 (a year)",
            "Whatever's left after shopping",
          ],
          correct: 0,
          feedback: {
            correct: "Right: R10 000 × 3 to × 6 = R30 000–R60 000. That's the band to aim for, starting from the lower end.",
            incorrect: "It's 3–6 months of R10 000 = R30 000–R60 000. Start at R30 000 and build toward R60 000.",
          },
        },
      },
    ],
  },
  {
    slotId: "emergency-fund/lesson-1/start-small",
    conceptId: "emergency-fund",
    variants: [
      {
        variantId: "ss-mini-goal",
        step: {
          type: "mcq",
          question: "R36 000 feels impossible right now. What's the smart way to begin?",
          options: [
            "Set a mini-goal like R5 000",
            "Give up, it's too big to start",
            "Wait for a lottery win",
            "Only start once you earn double",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A first R5 000 stops small shocks becoming debt. Momentum from a mini-goal beats being paralysed by the big number.",
            incorrect: "Start with a mini-goal (say R5 000). It handles the small emergencies immediately and builds the habit toward the bigger target.",
          },
        },
      },
      {
        variantId: "ss-automate-tf",
        step: {
          type: "true-false",
          statement: "Automating a small monthly transfer on payday makes you far more likely to build the fund.",
          correct: true,
          feedback: {
            correct: "True. Pay yourself first, automatically, before the money can be spent. Even R500/month quietly becomes R6 000 a year.",
            incorrect: "It's true. Automating a payday transfer removes willpower from the equation. Small and automatic beats big and occasional.",
          },
        },
      },
      {
        variantId: "ss-first-goal-scenario",
        step: {
          type: "scenario",
          question: "Thabo can only spare R400 a month. Is it worth starting an emergency fund?",
          options: [
            "Yes, R4 800 a year adds up",
            "No, R400 is too little to matter",
            "No, wait until he saves thousands",
            "Only if he saves R5 000 at once",
          ],
          correct: 0,
          feedback: {
            correct: "Right. R400/month is real progress, nearly R5 000 in a year, and a buffer that keeps a small crisis off a 22% store card.",
            incorrect: "It's absolutely worth it. R400/month is ~R4 800/year and starts protecting him from debt right away.",
          },
        },
      },
    ],
  },
];

const lesson1Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Your Financial Airbag",
    content:
      "<p>One unexpected expense (a R8 000 car repair, a R15 000 medical bill, two weeks without income) is all it takes to wreck a budget with no safety net. That's how debt spirals start.</p><p>An emergency fund is 3–6 months of essential living expenses in cash, reachable within 24 hours. If your essentials are R12 000/month, your target is R36 000–R72 000. Start with a mini-goal of R5 000. It protects you from small emergencies immediately.</p>",
  },
  { slot: "emergency-fund/lesson-1/how-many-months" },
  { slot: "emergency-fund/lesson-1/not-stocks" },
  { slot: "emergency-fund/lesson-1/target-calc" },
  { slot: "emergency-fund/lesson-1/start-small" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 2 · "Where to Keep Emergency Money"
// ═══════════════════════════════════════════════════════════════════════════

const lesson2Slots: QuestionSlot[] = [
  {
    slotId: "emergency-fund/lesson-2/best-place",
    conceptId: "emergency-fund",
    variants: [
      {
        variantId: "bp-mcq",
        step: {
          type: "mcq",
          question: "Which is the BEST place to keep your emergency fund?",
          options: [
            "A high-interest savings account",
            "Under your mattress",
            "A unit trust invested in shares",
            "With a friend for safekeeping",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A high-interest savings account is safe, accessible within a day or two, and still earns something against inflation.",
            incorrect: "A high-interest savings account wins: safe, accessible, and earning interest: unlike a mattress or a volatile fund.",
          },
        },
      },
      {
        variantId: "bp-mattress-tf",
        step: {
          type: "true-false",
          statement: "Cash under the mattress is a good place for an emergency fund because it's instantly available.",
          correct: false,
          feedback: {
            correct: "Correct. It's accessible but unsafe (theft, fire) and earns nothing, so inflation eats it. A high-interest savings account is better on every count.",
            incorrect: "It isn't. A mattress earns nothing (inflation erodes it) and can be lost or stolen. A savings account is accessible AND safe AND earning.",
          },
        },
      },
      {
        variantId: "bp-options-mcq",
        step: {
          type: "mcq",
          question: "Which of these is a suitable home for an emergency fund in SA?",
          options: [
            "A money market fund",
            "A single volatile share",
            "Cryptocurrency holdings",
            "A locked-in retirement annuity",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Money market funds and notice accounts are stable and quick to access. A good fit. An RA is locked away; crypto and single shares are too volatile.",
            incorrect: "Stable, accessible options like a money market fund or notice account fit. Volatile or locked products (crypto, RA) don't.",
          },
        },
      },
    ],
  },
  {
    slotId: "emergency-fund/lesson-2/three-criteria",
    conceptId: "emergency-fund",
    variants: [
      {
        variantId: "tc-what",
        step: {
          type: "mcq",
          question: "What three things does a good home for your emergency fund need?",
          options: [
            "Accessible, safe, earning",
            "Locked, risky and high-growth",
            "Hidden, cash-only and secret",
            "Complicated, costly, exclusive",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Reachable in a day or two, not exposed to market crashes, and ideally keeping pace with inflation.",
            incorrect: "The three tests are accessible, safe, and earning something. Locked or risky homes fail the first two.",
          },
        },
      },
      {
        variantId: "tc-accessible-tf",
        step: {
          type: "true-false",
          statement: "Being able to withdraw the money within a day or two is a key requirement for an emergency fund.",
          correct: true,
          feedback: {
            correct: "True. An emergency fund you can't reach quickly isn't doing its job. Fast access is non-negotiable.",
            incorrect: "It's true. Quick access (a day or two) is essential. Money you can't get to in a crisis isn't an emergency fund.",
          },
        },
      },
      {
        variantId: "tc-tradeoff-scenario",
        step: {
          type: "scenario",
          question: "A 32-day notice account pays a bit more but needs 32 days' notice to withdraw. Good for a full emergency fund?",
          options: [
            "Only for part of it",
            "Yes. Put all of it there for the higher rate",
            "No. Notice accounts are scams",
            "Yes. Emergencies always give 32 days' warning",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Emergencies don't wait 32 days. A common approach: keep some instantly accessible, and a portion in notice/money-market for a better rate.",
            incorrect: "Not for all of it, a burst geyser won't wait 32 days. Split it: instant-access for emergencies, notice account for a little extra yield.",
          },
        },
      },
    ],
  },
  {
    slotId: "emergency-fund/lesson-2/keep-separate",
    conceptId: "emergency-fund",
    variants: [
      {
        variantId: "sep-why-tf",
        step: {
          type: "true-false",
          statement: "Keeping your emergency fund in a separate account from your everyday spending helps you not dip into it.",
          correct: true,
          feedback: {
            correct: "True. Out of sight, out of temptation. A separate account means you won't accidentally spend the buffer on everyday things.",
            incorrect: "It's true, a separate account creates a helpful barrier, so the fund isn't quietly spent on daily living.",
          },
        },
      },
      {
        variantId: "sep-mix-scenario",
        step: {
          type: "scenario",
          question: "Ayesha keeps her emergency savings in her main cheque account. What's the risk?",
          options: [
            "She'll spend it unnoticed",
            "The bank will simply freeze it",
            "It will earn too much interest",
            "There's no risk at all",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Mixed in with everyday cash, the buffer just looks spendable, and slowly disappears. A separate account protects it.",
            incorrect: "The danger is silent spending: mixed with daily money, it feels available and erodes. Keep it separate.",
          },
        },
      },
      {
        variantId: "sep-label-mcq",
        step: {
          type: "mcq",
          question: "A simple trick to protect your emergency fund from everyday temptation is to:",
          options: [
            "A separate, labelled account",
            "Cash carried in your wallet",
            "Linked to your tap-to-pay card",
            "The card given to a friend",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A separate 'Emergency Fund' account, not linked to your card, adds just enough friction to keep it intact.",
            incorrect: "Keep it separate and labelled, off your spending card. Cash in a wallet or a linked card just invites spending it.",
          },
        },
      },
    ],
  },
  {
    slotId: "emergency-fund/lesson-2/beat-inflation",
    conceptId: "emergency-fund",
    variants: [
      {
        variantId: "bi-earn-tf",
        step: {
          type: "true-false",
          statement: "Ideally your emergency fund should at least earn interest close to inflation so it doesn't lose value sitting still.",
          correct: true,
          feedback: {
            correct: "True. Safety first, but a high-interest savings or money market account also helps the buffer keep its buying power over time.",
            incorrect: "It's true, while safety and access come first, earning near inflation stops the fund quietly losing value each year.",
          },
        },
      },
      {
        variantId: "bi-zero-scenario",
        step: {
          type: "scenario",
          question: "Sipho keeps R40 000 emergency savings in a 0%-interest account. Inflation is 5%. What's happening?",
          options: [
            "Safe, but losing buying power",
            "It's growing nicely",
            "Completely protected from inflation",
            "It doubles in value every few years",
          ],
          correct: 0,
          feedback: {
            correct: "Right. 0% against 5% inflation quietly costs ~R2 000/year in buying power. Moving it to a high-interest savings account slows the leak.",
            incorrect: "At 0% with 5% inflation, it loses ~R2 000/year in real terms. Keep it accessible, but in an account that actually pays interest.",
          },
        },
      },
      {
        variantId: "bi-choose-mcq",
        step: {
          type: "mcq",
          question: "Between two equally-accessible options, which is better for your emergency fund?",
          options: [
            "The one paying more interest",
            "The one paying no interest",
            "Whichever has the nicer app icon",
            "It never matters",
          ],
          correct: 0,
          feedback: {
            correct: "Right. If access and safety are equal, take the higher interest. It's free help keeping pace with inflation.",
            incorrect: "Pick the higher interest when access and safety match. Why leave free growth on the table against inflation?",
          },
        },
      },
    ],
  },
];

const lesson2Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "The Right Home for Your Safety Net",
    content:
      "<p>Your emergency fund needs to be:</p><ul><li><strong>Accessible:</strong> withdrawable within 1–2 business days</li><li><strong>Safe:</strong> not exposed to market crashes</li><li><strong>Earning something:</strong> at least keeping pace with inflation</li></ul><p>Good SA options: a high-interest savings account (Capitec, TymeBank), a money market fund (Sygnia, Satrix), or a 32-day notice account.</p>",
  },
  { slot: "emergency-fund/lesson-2/best-place" },
  { slot: "emergency-fund/lesson-2/three-criteria" },
  { slot: "emergency-fund/lesson-2/keep-separate" },
  { slot: "emergency-fund/lesson-2/beat-inflation" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 3 · "When to Use Your Emergency Fund"
// ═══════════════════════════════════════════════════════════════════════════

const lesson3Slots: QuestionSlot[] = [
  {
    slotId: "emergency-fund/lesson-3/real-emergency",
    conceptId: "emergency-fund",
    variants: [
      {
        variantId: "re-which",
        step: {
          type: "mcq",
          question: "Which expense is the best fit for an emergency fund?",
          options: [
            "The excess on a car claim",
            "A limited-time phone deal",
            "A year-end holiday special",
            "Upgrading DStv for the sport",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Keeping a work vehicle insured and back on the road protects your income: a textbook emergency use.",
            incorrect: "Choose costs that protect health, housing or income. The insurance excess on your work car qualifies; the deals don't.",
          },
        },
      },
      {
        variantId: "re-define-mcq",
        step: {
          type: "mcq",
          question: "What kinds of costs is an emergency fund really for?",
          options: [
            "Urgent, unchosen costs",
            "Anything that is on sale",
            "Gifts and holidays",
            "Whatever a relative asks for",
          ],
          correct: 0,
          feedback: {
            correct: "Right. It's for shocks that threaten your income, health or safety, not for wants, however tempting the timing.",
            incorrect: "It's for genuine shocks: lost income, urgent medical, essential repairs. Sales, gifts and holidays are wants, not emergencies.",
          },
        },
      },
      {
        variantId: "re-safe-earning-tf",
        step: {
          type: "true-false",
          statement: "An essential repair that keeps you safe or able to earn is a valid use of your emergency fund.",
          correct: true,
          feedback: {
            correct: "True. A burst geyser or a broken work vehicle threatens your home or income. Exactly what the fund exists to handle.",
            incorrect: "It's true. Repairs that protect your safety or your ability to earn are precisely what the emergency fund is for.",
          },
        },
      },
    ],
  },
  {
    slotId: "emergency-fund/lesson-3/job-loss",
    conceptId: "emergency-fund",
    variants: [
      {
        variantId: "jl-tf",
        step: {
          type: "true-false",
          statement: "If you lose your job, using the emergency fund for rent and food while you search is an appropriate use.",
          correct: true,
          feedback: {
            correct: "True. Covering essentials after involuntary income loss is the textbook emergency. This is the exact rainy day you saved for.",
            incorrect: "It's true, rent and food during an unplanned job loss is precisely what the buffer is for. Use it, then rebuild once you're earning.",
          },
        },
      },
      {
        variantId: "jl-scenario",
        step: {
          type: "scenario",
          question: "Zanele is retrenched. She has 4 months' expenses saved. What's the sensible move?",
          options: [
            "Cover essentials while job-hunting",
            "Refuse to touch it, take a payday loan",
            "Spend it on a holiday to de-stress",
            "Ignore the whole situation entirely",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Use the buffer for essentials and stretch it by cutting extras. That's exactly why she built it, far better than expensive debt.",
            incorrect: "She should use the fund for essentials (and trim extras to extend it). Taking a payday loan while sitting on savings is the wrong call.",
          },
        },
      },
      {
        variantId: "jl-uif-tf",
        step: {
          type: "true-false",
          statement: "After retrenchment, an emergency fund and a UIF claim can work together to cover you while you look for work.",
          correct: true,
          feedback: {
            correct: "True. UIF replaces part of your income for a while; your fund tops up the gap. Together they buy you time to find the right job.",
            incorrect: "It's true. UIF covers part of your income and the emergency fund fills the rest, giving you breathing room to job-hunt properly.",
          },
        },
      },
    ],
  },
  {
    slotId: "emergency-fund/lesson-3/genuine-vs-not",
    conceptId: "emergency-fund",
    variants: [
      {
        variantId: "gvn-geyser",
        step: {
          type: "scenario",
          question: "Your geyser bursts and damages a wall. The repair is R12 000; insurance will only pay later. You have R18 000 saved. Smartest first step?",
          options: [
            "Use emergency savings now",
            "Put the R12 000 on a clothing store card at 22%",
            "Ignore the leak for two months",
            "Borrow from a lender who WhatsApps you 'quick cash'",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Use the fund for the urgent repair, then top it back up when the claim pays. Avoid toxic debt when you already have cash.",
            incorrect: "Use your own savings for a genuine home emergency, then refill from the claim. A 22% card or a loan shark makes it far worse.",
          },
        },
      },
      {
        variantId: "gvn-not",
        step: {
          type: "mcq",
          question: "Which of these is NOT a real emergency?",
          options: [
            "A cousin's wedding outfit",
            "Losing your income unexpectedly",
            "An urgent medical co-payment",
            "A broken geyser flooding the house",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Helping with a wedding outfit is kind, but it's not YOUR household emergency. Draining the fund for it leaves you exposed.",
            incorrect: "The odd one out is the wedding-outfit request. The others threaten your income, health or home. The wedding buy doesn't.",
          },
        },
      },
      {
        variantId: "gvn-rules-tf",
        step: {
          type: "true-false",
          statement: "Deciding your emergency rules in advance makes it easier to say no to 'emergencies' that are really wants.",
          correct: true,
          feedback: {
            correct: "True. Clear rules (job loss, critical medical, essential repairs) written down beforehand stop excitement or guilt from draining the fund.",
            incorrect: "It's true. Agreeing your rules up front is what lets you refuse the pressure-buys and keep the fund for real emergencies.",
          },
        },
      },
    ],
  },
  {
    slotId: "emergency-fund/lesson-3/refill",
    conceptId: "emergency-fund",
    variants: [
      {
        variantId: "rf-after-tf",
        step: {
          type: "true-false",
          statement: "After you use part of your emergency fund, rebuilding it should become a top priority.",
          correct: true,
          feedback: {
            correct: "True. A half-used buffer is a half-open umbrella. Once the crisis passes, redirect spare money to refill it before anything optional.",
            incorrect: "It's true. Refilling comes first after a crisis. Until it's topped up, you're exposed to the next shock.",
          },
        },
      },
      {
        variantId: "rf-priority-scenario",
        step: {
          type: "scenario",
          question: "Thabo used R8 000 of his fund on a car repair. Next month he gets a small bonus. Best use?",
          options: [
            "Refill the emergency fund",
            "Spend it celebrating the repair",
            "Start a new subscription",
            "Leave the fund half-empty for now",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Refilling first restores his protection against the next surprise. The buffer only works if it's kept topped up.",
            incorrect: "Use the bonus to rebuild the fund. Leaving it half-empty means the next emergency lands on a credit card.",
          },
        },
      },
      {
        variantId: "rf-mindset-mcq",
        step: {
          type: "mcq",
          question: "Using your emergency fund for a genuine emergency should feel like:",
          options: [
            "The system working",
            "A personal failure",
            "A reason to never save again",
            "A sign to invest it in shares next time",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Spending it on a real emergency isn't failure. It's the plan succeeding. Then you calmly rebuild.",
            incorrect: "It's the system working, not a failure. You saved for exactly this; use it, then refill without guilt.",
          },
        },
      },
    ],
  },
];

const lesson3Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Real Emergencies Only",
    content:
      "<p>Nomsa saved R24 000 for three months of essentials. When her fridge broke (a R6 500 quote), she used the fund instead of a high-interest store loan. Two months later a cousin wanted R4 000 for a wedding outfit. That was not her household's emergency.</p><p>The fund is for income loss you didn't choose, medical co-payments you can't delay, or essential repairs that keep you safe or earning. Holidays, upgrades and every relative's ask are not the same thing. Clear rules now stop you draining it and starting from zero.</p>",
  },
  { slot: "emergency-fund/lesson-3/real-emergency" },
  { slot: "emergency-fund/lesson-3/job-loss" },
  { slot: "emergency-fund/lesson-3/genuine-vs-not" },
  { slot: "emergency-fund/lesson-3/refill" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 4 · "Types of Financial Risk"
// ═══════════════════════════════════════════════════════════════════════════

const lesson4Slots: QuestionSlot[] = [
  {
    slotId: "emergency-fund/lesson-4/income-risk",
    conceptId: "financial-risk",
    variants: [
      {
        variantId: "ir-which",
        step: {
          type: "mcq",
          question: "Which example is mainly 'income risk'?",
          options: [
            "Retrenchments in your division",
            "A unit trust price moving",
            "Picking the wrong paint colour",
            "Inflation rising over a decade",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Income risk is anything that threatens the money arriving each month. Retrenchment is the classic example.",
            incorrect: "Income risk is about losing or shrinking your monthly income. Retrenchment fits; a fund price wobbling is market risk.",
          },
        },
      },
      {
        variantId: "ir-define-tf",
        step: {
          type: "true-false",
          statement: "Income risk is the chance that the money you earn each month shrinks or stops.",
          correct: true,
          feedback: {
            correct: "True. Job loss, reduced hours, a failing side-business: all income risk. It's why a cash buffer matters so much.",
            incorrect: "It's true. Income risk is your earnings shrinking or stopping. An emergency fund is the first defence against it.",
          },
        },
      },
      {
        variantId: "ir-sidehustle-scenario",
        step: {
          type: "scenario",
          question: "Lerato relies entirely on one big client for her freelance income. What risk is she most exposed to?",
          options: [
            "Income risk",
            "No risk at all",
            "Only market risk",
            "Only inflation risk",
          ],
          correct: 0,
          feedback: {
            correct: "Right. One client is concentrated income risk. Diversifying to several clients or income streams softens the blow if one goes.",
            incorrect: "It's income risk, and a concentrated one. Losing her single client would gut her earnings. Spreading clients reduces it.",
          },
        },
      },
    ],
  },
  {
    slotId: "emergency-fund/lesson-4/beyond-market",
    conceptId: "financial-risk",
    variants: [
      {
        variantId: "bm-loadshedding",
        step: {
          type: "scenario",
          question: "Thabo thought 'risk' only meant the JSE dropping. Then load-shedding spoiled R2 000 of stock in his spaza in a week. What does this show?",
          options: [
            "Risk is broader than markets",
            "Load-shedding isn't financial risk",
            "Only listed shares carry any risk",
            "His spaza is risk-free",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Risk isn't just markets, spoiled stock, fraud, medical shocks, rate hikes and being underinsured all threaten your money.",
            incorrect: "It shows risk is much broader than the JSE. Operational shocks like load-shedding hit real cash just as hard.",
          },
        },
      },
      {
        variantId: "bm-types-mcq",
        step: {
          type: "mcq",
          question: "Which of these is also a real financial risk, beyond the stock market?",
          options: [
            "Fraud draining your account",
            "The weather being cloudy",
            "A friend changing their hair",
            "Your phone screen brightness",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Fraud, medical shocks, rate hikes and underinsurance are all financial risks. Markets are just one slice.",
            incorrect: "Fraud and scams are genuine financial risks. Financial risk covers far more than share prices.",
          },
        },
      },
      {
        variantId: "bm-name-tf",
        step: {
          type: "true-false",
          statement: "Naming the different risks you face helps stop one problem from wiping out everything you've built.",
          correct: true,
          feedback: {
            correct: "True. Once you can name a risk, you can plan for it. Insure it, save against it, or knowingly accept it. Unnamed risks catch you off guard.",
            incorrect: "It's true, listing your risks lets you decide how to handle each, so a single shock doesn't take down everything at once.",
          },
        },
      },
    ],
  },
  {
    slotId: "emergency-fund/lesson-4/third-party-cover",
    conceptId: "financial-risk",
    variants: [
      {
        variantId: "tpc-who-pays",
        step: {
          type: "mcq",
          question: "You have third-party-only car insurance and cause a crash that writes off YOUR car. Who pays to replace it?",
          options: [
            "You do, it covers others only",
            "The insurer replaces yours in full",
            "The other driver always pays for it",
            "SARS refunds you the loss",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Third-party cover protects others' property, not yours. Replacing your own car needs comprehensive cover you choose and pay for.",
            incorrect: "You pay. Third-party only covers damage you cause to others. Your own write-off isn't covered without comprehensive insurance.",
          },
        },
      },
      {
        variantId: "tpc-read-tf",
        step: {
          type: "true-false",
          statement: "It's worth checking exactly what your insurance does and doesn't cover before you need to claim.",
          correct: true,
          feedback: {
            correct: "True. People discover the gaps at the worst moment. Reading the wording (or asking your broker) beats a nasty surprise after a crash.",
            incorrect: "It's true. Know your cover before a claim. The gap between what you assumed and what's covered can be very expensive.",
          },
        },
      },
      {
        variantId: "tpc-gap-scenario",
        step: {
          type: "scenario",
          question: "Ayesha assumes her cheap car policy covers everything. What should she actually do?",
          options: [
            "Check exactly what's covered",
            "Assume it's fine and move on",
            "Cancel all of her insurance",
            "Only worry after an accident",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Cheap often means third-party-only or high excesses. Knowing the details now prevents a shock when she claims.",
            incorrect: "She should check the wording and excess. 'Cheap' can mean big gaps: better to know before an accident, not after.",
          },
        },
      },
    ],
  },
  {
    slotId: "emergency-fund/lesson-4/sort-risks",
    conceptId: "financial-risk",
    variants: [
      {
        variantId: "sr-three-ways",
        step: {
          type: "mcq",
          question: "What are the three main ways to handle a financial risk?",
          options: [
            "Insure, reduce, or accept",
            "Ignore it, panic, or hide from it",
            "Borrow, spend, and repeat",
            "Only ever insure everything",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Big, insurable shocks → insure. Manageable ones → save/diversify. Minor ones where cover costs too much → accept knowingly.",
            incorrect: "The three levers are insure, reduce (savings/diversification), or accept. Ignoring and panicking aren't strategies.",
          },
        },
      },
      {
        variantId: "sr-insure-mcq",
        step: {
          type: "mcq",
          question: "Which risk is best handled by INSURANCE rather than savings?",
          options: [
            "A rare but catastrophic event",
            "A R200 expense every single month",
            "Buying too much bread",
            "A small once-off cost you can afford",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Insure the rare-but-ruinous. You can't save enough for a total loss, but a monthly premium can cover it.",
            incorrect: "Insurance is for rare, catastrophic losses you couldn't self-fund. Like your home. Small, affordable costs you just absorb.",
          },
        },
      },
      {
        variantId: "sr-accept-tf",
        step: {
          type: "true-false",
          statement: "It can be reasonable to 'accept' a small risk when the cost of fully insuring against it is too high.",
          correct: true,
          feedback: {
            correct: "True. Not everything is worth insuring. For small, affordable risks, paying a premium can cost more than the risk itself, accept it knowingly.",
            incorrect: "It's true. Some small risks are cheaper to accept than to insure. The skill is choosing which, on purpose rather than by neglect.",
          },
        },
      },
    ],
  },
];

const lesson4Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "More Than Market Ups and Downs",
    content:
      "<p>Thabo thought 'risk' only meant the JSE going red on his app. Then load-shedding cost his spaza R2 000 in spoiled stock in a week. Financial risk also includes losing your income, fraud and scams, medical shocks, interest-rate jumps on a home loan, and being underinsured.</p><p>You can't remove all risk, but you can sort it: risks you insure, risks you soften with savings and diversified income, and risks you knowingly accept because full protection costs too much. Naming the risks stops one problem from wiping out everything else.</p>",
  },
  { slot: "emergency-fund/lesson-4/income-risk" },
  { slot: "emergency-fund/lesson-4/beyond-market" },
  { slot: "emergency-fund/lesson-4/third-party-cover" },
  { slot: "emergency-fund/lesson-4/sort-risks" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 5 · "Risk vs Reward"
// ═══════════════════════════════════════════════════════════════════════════

const lesson5Slots: QuestionSlot[] = [
  {
    slotId: "emergency-fund/lesson-5/timeline-match",
    conceptId: "risk-vs-return",
    variants: [
      {
        variantId: "tm-deposit",
        step: {
          type: "scenario",
          question: "You need the money in 14 months for a child's university deposit. Which choice best matches that timeline?",
          options: [
            "Stable, shorter-term savings",
            "One small-cap share tip online",
            "Daily forex signals from a group",
            "Spend half now, hope for a bonus",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A known deadline 14 months out needs stability. A crash just before you pay could gut a deposit you can't afford to lose.",
            incorrect: "Short horizon, fixed need → controlled risk. Betting a deposit on a share tip or forex signals could lose it right when it's due.",
          },
        },
      },
      {
        variantId: "tm-short-mcq",
        step: {
          type: "mcq",
          question: "For money you'll definitely need in under two years, the priority is:",
          options: [
            "Protecting the amount",
            "Maximum growth, whatever the risk",
            "Whatever a friend did with theirs",
            "The most exciting option",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Short timelines can't wait out a crash, so capital protection beats reaching for returns you might not keep.",
            incorrect: "With under two years, protect the capital. There's no time to recover from a big dip, so stability wins over growth.",
          },
        },
      },
      {
        variantId: "tm-mismatch-tf",
        step: {
          type: "true-false",
          statement: "Putting money you need next year into volatile shares is a timeline mismatch.",
          correct: true,
          feedback: {
            correct: "True. Volatile assets need years to ride out dips. Money with a near deadline belongs somewhere stable, not in shares.",
            incorrect: "It's true. That's a classic mismatch. Short-deadline money in volatile shares risks a loss right when you need it.",
          },
        },
      },
    ],
  },
  {
    slotId: "emergency-fund/lesson-5/time-horizon",
    conceptId: "risk-vs-return",
    variants: [
      {
        variantId: "th-recover-tf",
        step: {
          type: "true-false",
          statement: "A longer time horizon generally gives more room to recover from market dips than money you need next month.",
          correct: true,
          feedback: {
            correct: "True. Years in the market let compounding work and smooth out the wobbles. Next month's money has no time to recover.",
            incorrect: "It's true. Time is the great smoother. Long horizons can ride out dips; short-term money can't afford them.",
          },
        },
      },
      {
        variantId: "th-young-scenario",
        step: {
          type: "scenario",
          question: "Sipho is 25 and investing for retirement 35 years away. How should his long horizon shape his risk?",
          options: [
            "He can take more market risk now",
            "He should avoid all growth assets to be safe",
            "He should keep everything in cash forever",
            "Time horizon doesn't matter at all",
          ],
          correct: 0,
          feedback: {
            correct: "Right. With 35 years, short-term crashes matter far less, and growth assets have time to compound. Long horizon, more room for risk.",
            incorrect: "A 35-year horizon lets him take more growth risk. Dips have decades to recover. All-cash would likely cost him serious compounding.",
          },
        },
      },
      {
        variantId: "th-compound-mcq",
        step: {
          type: "mcq",
          question: "Why does a long time horizon change how much market risk you can sensibly take?",
          options: [
            "Dips have time to recover",
            "Long-term investments can't lose",
            "The government guarantees them",
            "It doesn't change anything",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Over decades, temporary drops tend to recover and compounding does the heavy lifting, so short-term volatility matters less.",
            incorrect: "It's about time to recover and compound. Long horizons absorb volatility; they don't remove it or come with guarantees.",
          },
        },
      },
    ],
  },
  {
    slotId: "emergency-fund/lesson-5/healthy-view",
    conceptId: "risk-vs-return",
    variants: [
      {
        variantId: "hv-which",
        step: {
          type: "mcq",
          question: "Which phrase best describes a healthy view of risk?",
          options: [
            "Know the downside and the horizon",
            "Avoid every investment out of fear",
            "Chase anyone promising 8% a week",
            "Copy every trade you see online",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Clarity on your downside, your upside and your timeline beats both blind fear and blind greed.",
            incorrect: "The healthy view weighs downside, upside and timeline. Blanket fear and hype-chasing are both ways to lose.",
          },
        },
      },
      {
        variantId: "hv-tradeoff-tf",
        step: {
          type: "true-false",
          statement: "Higher potential reward almost always comes with a higher chance of loss.",
          correct: true,
          feedback: {
            correct: "True. There's no free lunch. If something dangles a big return, assume it carries bigger risk, and ask where that risk is hiding.",
            incorrect: "It's true: reward and risk travel together. A promise of high returns with 'no risk' is the oldest warning sign there is.",
          },
        },
      },
      {
        variantId: "hv-match-scenario",
        step: {
          type: "scenario",
          question: "Two people are 'right' about risk in different ways. Who actually is?",
          options: [
            "Whoever matches goal to timeline",
            "Whoever avoids everything in fear",
            "Whoever bets big on a hot tip",
            "Whoever shouts loudest at the braai",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Good risk-taking isn't brave or timid. It's matched. The tool should fit the goal and the timeline, not the story.",
            incorrect: "It's the one who matches risk to goal and timeline. Blanket fear and big bets on tips are both mismatches.",
          },
        },
      },
    ],
  },
  {
    slotId: "emergency-fund/lesson-5/hype-warning",
    conceptId: "risk-vs-return",
    variants: [
      {
        variantId: "hw-guarantee",
        step: {
          type: "true-false",
          statement: "Anyone guaranteeing a fixed high return like '8% a week' should be treated as a serious warning sign.",
          correct: true,
          feedback: {
            correct: "True. Guaranteed, sky-high, fixed returns are the signature of scams (and Ponzi schemes). Real investments can't promise that.",
            incorrect: "It's true. 'guaranteed 8% a week' is a classic scam red flag. No legitimate investment offers fixed, high, risk-free returns.",
          },
        },
      },
      {
        variantId: "hw-survivorship-scenario",
        step: {
          type: "scenario",
          question: "A friend brags that 'crypto doubled' his money. What are you not hearing?",
          options: [
            "The people who lost quietly",
            "That crypto is guaranteed to double",
            "That he definitely has skill",
            "That it will happen to you too",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Winners talk, losers go quiet. One doubling story hides many losses. Don't mistake a loud win for a reliable strategy.",
            incorrect: "You're not hearing the losers. Big-win stories survive and spread; the quiet losses don't. Judge the odds, not the anecdote.",
          },
        },
      },
      {
        variantId: "hw-skills-mcq",
        step: {
          type: "mcq",
          question: "Reaching for higher returns without skills, time or diversification usually means:",
          options: [
            "A higher chance of loss",
            "Guaranteed riches ahead",
            "A genuinely safe bet",
            "Essentially free money",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Without a real edge, 'high reward' is mostly just 'high risk' dressed up. Match tools to your goal, not to the exciting story.",
            incorrect: "It usually means more risk of loss. Chasing returns without skill, time or diversification is a gamble, not a strategy.",
          },
        },
      },
    ],
  },
];

const lesson5Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "The Trade-Off in Plain Words",
    content:
      "<p>A 32-day notice account pays a modest rate but rarely loses value. A broad equity ETF can average much higher growth over decades but might drop 20% in a bad year. That trade-off isn't good or bad by itself. It depends on when you need the money and whether you can stay calm when markets wobble.</p><p>Many people hear 'crypto doubled' from one friend and never hear the friend who lost quietly. Higher possible reward without real skill, time or diversification is often just a higher chance of loss. Match the tool to the goal and the timeline, not the story that sounds exciting at a braai.</p>",
  },
  { slot: "emergency-fund/lesson-5/timeline-match" },
  { slot: "emergency-fund/lesson-5/time-horizon" },
  { slot: "emergency-fund/lesson-5/healthy-view" },
  { slot: "emergency-fund/lesson-5/hype-warning" },
];

export const EMERGENCY_FUND_BANKS: Record<string, LessonBank> = {
  "emergency-fund::lesson-1": { layout: lesson1Layout, slots: lesson1Slots },
  "emergency-fund::lesson-2": { layout: lesson2Layout, slots: lesson2Slots },
  "emergency-fund::lesson-3": { layout: lesson3Layout, slots: lesson3Slots },
  "emergency-fund::lesson-4": { layout: lesson4Layout, slots: lesson4Slots },
  "emergency-fund::lesson-5": { layout: lesson5Layout, slots: lesson5Slots },
};
