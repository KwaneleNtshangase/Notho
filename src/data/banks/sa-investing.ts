import type { LessonLayoutItem, QuestionSlot } from "@/data/content";
import type { LessonBank } from "./money-basics";

/**
 * Bank for the SA Investment Vehicles course. Per docs/QUESTION-VOICE-GUIDE.md.
 * FIGURES: verified against docs/SA-REGULATORY-FIGURES.md (2026/27):
 * TFSA R46 000 annual / R500 000 lifetime / 40% over-contribution penalty;
 * RA 27.5% of income, annual cap R430 000 (2027). Hedge yearly-changing rands.
 */

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 1 · "TFSA Rules & Limits"
// ═══════════════════════════════════════════════════════════════════════════

const lesson1Slots: QuestionSlot[] = [
  {
    slotId: "sa-investing/lesson-1/annual-limit",
    conceptId: "tfsa",
    variants: [
      {
        variantId: "al-mcq",
        step: {
          type: "mcq",
          question: "What is the annual contribution limit for a South African TFSA (2026/27)?",
          options: ["R46 000", "R36 000", "R100 000", "R500 000"],
          correct: 0,
          feedback: {
            correct: "Right. The annual limit rose to R46 000 from 1 March 2026. The R500 000 lifetime limit stayed the same.",
            incorrect: "The annual limit is R46 000 (2026/27 tax year). R500 000 is the separate lifetime limit.",
          },
        },
      },
      {
        variantId: "al-fill",
        step: {
          type: "fill-blank",
          title: "This year's room",
          prompt: "The TFSA annual contribution limit for 2026/27 is R____ (in rands).",
          correct: 46000,
          feedback: {
            correct: "Correct, R46 000 a year, up from R36 000. Lifetime limit remains R500 000.",
            incorrect: "It's R46 000 for the 2026/27 tax year.",
          },
        },
      },
      {
        variantId: "al-monthly-scenario",
        step: {
          type: "scenario",
          question: "Lerato wants to max her TFSA over the 2026/27 year with a monthly debit order. Roughly how much per month?",
          options: [
            "About R3 833 (R46 000 ÷ 12)",
            "About R3 000 (R36 000 ÷ 12)",
            "R46 000 every month",
            "R500 every month",
          ],
          correct: 0,
          feedback: {
            correct: "Right: R46 000 ÷ 12 ≈ R3 833 a month fills the annual limit exactly over the tax year.",
            incorrect: "To use the full R46 000, she'd need about R46 000 ÷ 12 ≈ R3 833 a month.",
          },
        },
      },
    ],
  },
  {
    slotId: "sa-investing/lesson-1/no-rollover",
    conceptId: "tfsa",
    variants: [
      {
        variantId: "nr-tf-sa",
        step: {
          type: "true-false",
          statement: "If you don't use your full TFSA annual limit this year, the unused portion rolls over to next year.",
          correct: false,
          feedback: {
            correct: "Correct. TFSA annual limits don't carry over. Use this year's R46 000 or lose that year's allowance for good.",
            incorrect: "It doesn't roll over. Each tax year is use-it-or-lose-it, so it pays to contribute as early and consistently as you can.",
          },
        },
      },
      {
        variantId: "nr-mcq",
        step: {
          type: "mcq",
          question: "You contribute only R20 000 of your R46 000 TFSA limit this year. What happens to the unused R26 000?",
          options: [
            "It's forfeited. It doesn't get added to next year's limit",
            "It carries over, giving you R72 000 next year",
            "SARS refunds it to you",
            "It's added to your lifetime limit",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Unused annual room is simply lost. Next year you get a fresh R46 000, not R46 000 plus the leftover.",
            incorrect: "The unused R26 000 is forfeited. Annual limits never carry forward. Next year is a fresh R46 000.",
          },
        },
      },
      {
        variantId: "nr-early-tf",
        step: {
          type: "true-false",
          statement: "Because unused TFSA room is lost each year, contributing early and consistently matters.",
          correct: true,
          feedback: {
            correct: "True. Every year skipped is tax-free growth gone forever. Even small monthly amounts beat waiting for a lump sum you never get to.",
            incorrect: "It's true: the use-it-or-lose-it rule rewards starting early. Missed years can't be reclaimed.",
          },
        },
      },
    ],
  },
  {
    slotId: "sa-investing/lesson-1/lifetime",
    conceptId: "tfsa",
    variants: [
      {
        variantId: "lt-mcq",
        step: {
          type: "mcq",
          question: "What is the lifetime contribution limit for a South African TFSA?",
          options: ["R500 000", "R46 000", "R1 million", "There's no lifetime limit"],
          correct: 0,
          feedback: {
            correct: "Right. R500 000 is the total you can ever contribute across your lifetime, separate from the R46 000 annual cap.",
            incorrect: "The lifetime limit is R500 000. The R46 000 is the annual limit; R500 000 is the total-ever cap.",
          },
        },
      },
      {
        variantId: "lt-years-scenario",
        step: {
          type: "scenario",
          question: "Contributing the full R46 000 every year, roughly how long until you reach the R500 000 lifetime limit?",
          options: [
            "About 11 years",
            "About 5 years or so",
            "About 25 years or so",
            "You never reach it",
          ],
          correct: 0,
          feedback: {
            correct: "Right: R500 000 ÷ R46 000 ≈ 10.9, so you fill the lifetime limit partway through year 11.",
            incorrect: "R500 000 ÷ R46 000 ≈ 11 years of maxing the annual limit.",
          },
        },
      },
      {
        variantId: "lt-withdraw-tf",
        step: {
          type: "true-false",
          statement: "If you withdraw money from your TFSA, it restores room in your lifetime limit to re-contribute.",
          correct: false,
          feedback: {
            correct: "Correct. Withdrawals do NOT restore your limit. Money taken out still counts against your R500 000 lifetime cap. Only dip in for real emergencies.",
            incorrect: "Withdrawals don't give the room back. What you've contributed counts toward the R500 000 lifetime cap even after you take it out.",
          },
        },
      },
    ],
  },
  {
    slotId: "sa-investing/lesson-1/penalty",
    conceptId: "tfsa",
    variants: [
      {
        variantId: "pen-mcq",
        step: {
          type: "mcq",
          question: "What penalty does SARS charge on TFSA contributions above the annual or lifetime limit?",
          options: [
            "40% of the excess amount",
            "10% of the excess",
            "There's no penalty",
            "The account is closed",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Over-contributions are taxed at 40% of the excess. Track your deposits across all providers so you don't trip the limit.",
            incorrect: "It's a 40% penalty on the excess. That's why tracking contributions across every provider matters.",
          },
        },
      },
      {
        variantId: "pen-fill",
        step: {
          type: "fill-blank",
          title: "The cost of over-contributing",
          prompt: "You contribute R47 000 in a year (R1 000 over the R46 000 limit). The 40% penalty on the excess is R____.",
          correct: 400,
          feedback: {
            correct: "Correct: 40% × R1 000 = R400. Small excess, real penalty, stay inside R46 000.",
            incorrect: "40% of the R1 000 excess = R400.",
          },
        },
      },
      {
        variantId: "pen-track-scenario",
        step: {
          type: "scenario",
          question: "Sipho has TFSAs at two providers and isn't tracking the totals. What's the risk?",
          options: [
            "Combined deposits could exceed R46 000 and trigger the 40% penalty",
            "Nothing. Each provider has its own R46 000 limit",
            "He earns double the tax-free growth",
            "SARS ignores multiple accounts",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The R46 000 limit is per person, not per account. Deposits across all providers add up: track them so you don't over-contribute.",
            incorrect: "The limit is per person, not per provider. His combined deposits count together, so untracked accounts risk the 40% penalty.",
          },
        },
      },
    ],
  },
];

const lesson1Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "The Best Legal Tax Break You're Probably Not Using",
    content:
      "<p>Every year you don't use your TFSA allowance is R46 000 of tax-free growth you lose permanently, it doesn't roll over. Over decades, the difference between using your TFSA and not can be over R1 million in tax saved.</p><p>A Tax-Free Savings Account lets you invest R46 000 per year (R500 000 lifetime limit) and pay zero tax on interest, dividends or capital gains, ever. Go over the limit and SARS charges 40% of the excess. Available at Sygnia, Satrix, EasyEquities, Capitec and most major platforms.</p>",
  },
  { slot: "sa-investing/lesson-1/annual-limit" },
  { slot: "sa-investing/lesson-1/no-rollover" },
  { slot: "sa-investing/lesson-1/lifetime" },
  { slot: "sa-investing/lesson-1/penalty" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 2 · "TFSA vs Regular Savings"
// ═══════════════════════════════════════════════════════════════════════════

const lesson2Slots: QuestionSlot[] = [
  {
    slotId: "sa-investing/lesson-2/main-advantage",
    conceptId: "tfsa",
    variants: [
      {
        variantId: "ma-mcq",
        step: {
          type: "mcq",
          question: "What is the main long-term advantage of a compliant TFSA over the same assets in a normal taxable account?",
          options: [
            "No tax on qualifying growth",
            "Guaranteed higher returns every year",
            "SARS pays you cash back monthly",
            "You never have to read statements",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The wrapper changes the tax treatment, not the returns. Qualifying growth inside a TFSA is 100% tax-free.",
            incorrect: "It's the tax shelter: growth inside a TFSA isn't taxed. It doesn't promise higher returns. It lets you keep more of them.",
          },
        },
      },
      {
        variantId: "ma-tf",
        step: {
          type: "true-false",
          statement: "Inside a TFSA, you pay no tax on interest, dividends or capital gains.",
          correct: true,
          feedback: {
            correct: "True. That's the whole point of the wrapper. Every rand of qualifying growth stays yours, which compounds powerfully over decades.",
            incorrect: "It's true: a TFSA shelters interest, dividends and capital gains from tax entirely, unlike a normal investment account.",
          },
        },
      },
      {
        variantId: "ma-twin-scenario",
        step: {
          type: "scenario",
          question: "Two people hold the same funds, one inside a TFSA, one in a normal taxable account. Over 20 years, who keeps more?",
          options: [
            "The TFSA holder",
            "The taxable-account holder",
            "They keep exactly the same",
            "It depends on the colour of the app",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Same funds, same returns, but the TFSA holder isn't handing a slice of the growth to SARS each year, so more compounds.",
            incorrect: "The TFSA holder wins. Sheltering the growth from tax means more stays invested and compounds over 20 years.",
          },
        },
      },
    ],
  },
  {
    slotId: "sa-investing/lesson-2/track-limits",
    conceptId: "tfsa",
    variants: [
      {
        variantId: "tl-tf",
        step: {
          type: "true-false",
          statement: "You should track your TFSA contributions yourself so you don't exceed the annual or lifetime limits.",
          correct: true,
          feedback: {
            correct: "True. Your platform helps, but you're responsible. A breach is a 40% penalty. Keep your own tally, especially across providers.",
            incorrect: "It's true. The limits are real and the penalty is steep. Keep your own running total across every account.",
          },
        },
      },
      {
        variantId: "tl-perperson-mcq",
        step: {
          type: "mcq",
          question: "The R46 000 annual TFSA limit applies:",
          options: [
            "Per person, across all their TFSA accounts combined",
            "Per account, so more accounts means more room",
            "Per bank brand",
            "Only to the first account you open",
          ],
          correct: 0,
          feedback: {
            correct: "Right. It's a per-person limit. Opening more TFSAs doesn't create more room. All your deposits add up against the one R46 000.",
            incorrect: "It's per person, not per account. Multiple TFSAs share the single R46 000 annual limit.",
          },
        },
      },
      {
        variantId: "tl-kids-tf",
        step: {
          type: "true-false",
          statement: "Contributing to a TFSA in your child's name uses their limit, not yours.",
          correct: true,
          feedback: {
            correct: "True. Each person (including a child) has their own R46 000 annual and R500 000 lifetime limits, but be aware you're using up the child's lifetime room early.",
            incorrect: "It's true. A child has their own limits. Just remember it consumes their lifetime allowance, which is a real trade-off.",
          },
        },
      },
    ],
  },
  {
    slotId: "sa-investing/lesson-2/bonus-timing",
    conceptId: "tfsa",
    variants: [
      {
        variantId: "bt-scenario",
        step: {
          type: "scenario",
          question: "You've already put in your full R46 000 this year, then get a bonus you want to invest. Cautious next step?",
          options: [
            "Park it in a high-interest account or taxable investment until the new tax year",
            "Deposit it into the same TFSA anyway",
            "Send it to the first WhatsApp investment group that replies",
            "Hide the cash at home",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Respect the annual limit. Over-contributing triggers a 40% penalty. Hold the extra elsewhere and feed it into next year's TFSA room.",
            incorrect: "Don't top up a maxed TFSA. That's a 40% penalty. Park the bonus elsewhere and use it in the new tax year.",
          },
        },
      },
      {
        variantId: "bt-newyear-tf",
        step: {
          type: "true-false",
          statement: "TFSA room resets at the start of each tax year (1 March), giving you a fresh annual limit.",
          correct: true,
          feedback: {
            correct: "True. On 1 March a new R46 000 of annual room opens (until your R500 000 lifetime cap is reached). Timing a maxed year's overflow into the new year avoids penalties.",
            incorrect: "It's true, the annual limit refreshes on 1 March each tax year, up to the R500 000 lifetime cap.",
          },
        },
      },
      {
        variantId: "bt-both-mcq",
        step: {
          type: "mcq",
          question: "Many people use a TFSA AND a normal taxable account. Why?",
          options: [
            "TFSA for long-term tax-free wealth",
            "Because TFSAs are a scam",
            "To confuse SARS",
            "There's never a reason to use both",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Fill the tax-free wrapper first for long-term money, then use a normal account for anything above the caps or that needs flexibility.",
            incorrect: "Use the TFSA for long-term tax-free growth and a taxable account for amounts beyond the limits or money you want flexible access to.",
          },
        },
      },
    ],
  },
  {
    slotId: "sa-investing/lesson-2/long-term",
    conceptId: "tfsa",
    variants: [
      {
        variantId: "ltm-best-use-mcq",
        step: {
          type: "mcq",
          question: "What kind of money is a TFSA best suited for?",
          options: [
            "Money left to grow",
            "Next month's rent money",
            "Day-to-day spending money",
            "Money you'll need next week",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The tax break rewards time: the longer growth compounds untaxed, the bigger the benefit. It's a long-game wrapper, not a spending account.",
            incorrect: "It shines for long-term money. Because the tax saving compounds over years, short-term cash doesn't get the real benefit.",
          },
        },
      },
      {
        variantId: "ltm-emergency-tf",
        step: {
          type: "true-false",
          statement: "Because TFSA withdrawals don't restore your lifetime room, it's not the ideal home for your emergency fund.",
          correct: true,
          feedback: {
            correct: "True. Dip into a TFSA for emergencies and you permanently burn lifetime room you can't get back. Keep your emergency fund in a separate accessible account.",
            incorrect: "It's true, raiding a TFSA wastes irreplaceable lifetime room. Emergency money belongs in a separate, accessible account.",
          },
        },
      },
      {
        variantId: "ltm-early-scenario",
        step: {
          type: "scenario",
          question: "Nomsa starts her TFSA at 25 instead of 35, contributing the same each year. Why does the 10-year head start matter so much?",
          options: [
            "Ten extra years of compounding",
            "It makes no difference at all",
            "Starting later is actually better",
            "Only the total contributed matters",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Those early years compound tax-free the whole way to retirement. Starting a decade sooner can roughly double the outcome.",
            incorrect: "The head start is huge: ten more years of untaxed compounding can nearly double the final value. Timing matters as much as the amount.",
          },
        },
      },
    ],
  },
];

const lesson2Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Tax-Sheltered Growth",
    content:
      "<p>Zandile puts R2 500 a month into a normal unit trust outside a TFSA. Over the years she owes tax on some interest, dividends and capital gains. Her twin uses the same funds inside a TFSA wrapper (within the limits) and keeps more of the compounding, because qualifying growth isn't taxed.</p><p>TFSAs still have annual (R46 000) and lifetime (R500 000) caps; over-contributing triggers a 40% SARS penalty. Regular taxable accounts have no caps but no shelter. Many people use both: the TFSA for long-term wealth, a plain account for flexibility beyond the limits.</p>",
  },
  { slot: "sa-investing/lesson-2/main-advantage" },
  { slot: "sa-investing/lesson-2/track-limits" },
  { slot: "sa-investing/lesson-2/bonus-timing" },
  { slot: "sa-investing/lesson-2/long-term" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 3 · "How to Open a TFSA"
// ═══════════════════════════════════════════════════════════════════════════

const lesson3Slots: QuestionSlot[] = [
  {
    slotId: "sa-investing/lesson-3/fica",
    conceptId: "tfsa",
    variants: [
      {
        variantId: "fica-tf",
        step: {
          type: "true-false",
          statement: "You normally need FICA documents (ID and proof of address) before a regulated institution activates a TFSA.",
          correct: true,
          feedback: {
            correct: "True. Anti-money-laundering rules mean legitimate providers verify who you are. Expect to submit ID and a recent proof of address.",
            incorrect: "It's true. FICA verification is standard. Be wary of anyone who offers to skip identity checks.",
          },
        },
      },
      {
        variantId: "fica-skip-mcq",
        step: {
          type: "mcq",
          question: "A 'provider' offers to open your TFSA with no ID or verification at all. What should you think?",
          options: [
            "Red flag. Legitimate, regulated providers always do FICA",
            "Fine if they seem professional and have a slick website",
            "A sign they're a newer, lower-cost platform",
            "Normal. TFSAs are exempt from FICA",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Skipping identity checks is a warning sign of a scam. Real providers are legally required to verify you.",
            incorrect: "No verification is a scam signal, not convenience. Regulated providers must do FICA. Use one that does.",
          },
        },
      },
      {
        variantId: "fica-quick-tf",
        step: {
          type: "true-false",
          statement: "Online TFSA onboarding can often be completed in under an hour if your documents are ready.",
          correct: true,
          feedback: {
            correct: "True. With your ID and proof of address on hand, most platforms let you open and fund a TFSA the same day.",
            incorrect: "It's true. It's usually quick. Having your FICA documents ready is what makes online onboarding fast.",
          },
        },
      },
    ],
  },
  {
    slotId: "sa-investing/lesson-3/compare",
    conceptId: "tfsa",
    variants: [
      {
        variantId: "cmp-mcq",
        step: {
          type: "mcq",
          question: "Before funding, which pair should you compare between two TFSA platforms?",
          options: [
            "Total yearly costs",
            "The colour of the app icon",
            "How many influencers mention them",
            "Whether they only trade crypto",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Fees and investment choice drive your long-term outcome far more than marketing does.",
            incorrect: "Compare cost and fund choice. That's what compounds over decades. Influencer buzz is noise.",
          },
        },
      },
      {
        variantId: "cmp-fees-tf",
        step: {
          type: "true-false",
          statement: "Low recurring fees and steady contributions matter more than a flashy advert.",
          correct: true,
          feedback: {
            correct: "True. Opening the account isn't the finish line. It's the low costs and consistent deposits over years that build the wealth.",
            incorrect: "It's true. Fees and consistency beat marketing. A cheaper platform you actually fund regularly wins over time.",
          },
        },
      },
      {
        variantId: "cmp-fee-scenario",
        step: {
          type: "scenario",
          question: "Two TFSA platforms are similar, but one charges clearly higher yearly fees. Over 20 years, what's the likely effect?",
          options: [
            "The higher fees quietly eat a meaningful chunk of your growth",
            "Fees make no real difference",
            "Higher fees guarantee higher returns",
            "The cheaper one must be a scam",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Even a small annual fee gap compounds into a lot over 20 years. When platforms are otherwise similar, cheaper usually wins.",
            incorrect: "Fees compound against you. Over two decades, the higher-fee platform can cost you a real slice of your growth.",
          },
        },
      },
    ],
  },
  {
    slotId: "sa-investing/lesson-3/automate",
    conceptId: "tfsa",
    variants: [
      {
        variantId: "auto-fill",
        step: {
          type: "fill-blank",
          title: "Automate to R46 000",
          prompt: "To fill the R46 000 annual TFSA limit with a monthly debit order, you'd set about R____ per month (nearest rand).",
          correct: 3833,
          feedback: {
            correct: "Correct: R46 000 ÷ 12 ≈ R3 833 a month. Automating it beats hoping you remember each payday.",
            incorrect: "R46 000 ÷ 12 ≈ R3 833 a month to fill the annual limit.",
          },
        },
      },
      {
        variantId: "auto-tf",
        step: {
          type: "true-false",
          statement: "Setting a monthly debit order into your TFSA helps you contribute consistently.",
          correct: true,
          feedback: {
            correct: "True. Automation removes willpower from the equation. The money moves before you can spend it. Any amount you can sustain works.",
            incorrect: "It's true. A debit order builds consistency. Even a small automated amount beats sporadic manual deposits.",
          },
        },
      },
      {
        variantId: "auto-amount-mcq",
        step: {
          type: "mcq",
          question: "What monthly TFSA amount is 'right' to start with?",
          options: [
            "Whatever you can sustain for months without touching essentials",
            "Always the full R3 833, no matter what",
            "Nothing until you can afford R3 833",
            "As much as you can borrow",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Consistency beats size. A smaller amount you keep up for years beats a big one you cancel after two months.",
            incorrect: "Start with a sustainable amount. Better a modest debit order you maintain than an ambitious one you abandon.",
          },
        },
      },
    ],
  },
  {
    slotId: "sa-investing/lesson-3/licensed",
    conceptId: "tfsa",
    variants: [
      {
        variantId: "lic-mcq",
        step: {
          type: "mcq",
          question: "Where should you open a TFSA?",
          options: [
            "A licensed bank, LISP or investment platform",
            "Whichever social-media account promises the most",
            "A stranger's WhatsApp 'investment club' group",
            "Anywhere at all that skips all of the paperwork",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Use regulated, licensed providers (Sygnia, Satrix, EasyEquities, Capitec, the big banks). They're accountable to regulators.",
            incorrect: "Stick to licensed, regulated providers. Chat-group 'clubs' and no-paperwork offers are how people lose money.",
          },
        },
      },
      {
        variantId: "lic-tf",
        step: {
          type: "true-false",
          statement: "A legitimate TFSA provider is a licensed, regulated financial institution.",
          correct: true,
          feedback: {
            correct: "True. Regulation is your protection. If a 'TFSA' offer isn't from a licensed institution, walk away.",
            incorrect: "It's true. Real TFSAs come from licensed, regulated providers. That oversight is exactly what keeps your money safe.",
          },
        },
      },
      {
        variantId: "lic-scenario",
        step: {
          type: "scenario",
          question: "Ayesha is choosing where to open her first TFSA. What's the safest approach?",
          options: [
            "Pick a well-known licensed platform and check its fees and fund choices",
            "Go with whoever a stranger DM'd her",
            "Choose the one with the most dramatic returns advert",
            "Avoid TFSAs entirely. They're too risky",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Start with a reputable licensed provider, then compare costs and investment options. Boring and regulated beats exciting and shady.",
            incorrect: "Safest is a known, licensed provider, then compare fees and funds. DMs and hype adverts are red flags, not shortlists.",
          },
        },
      },
    ],
  },
];

const lesson3Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Start With Licensed Players",
    content:
      "<p>Most major banks, LISPs and platforms offer TFSA wrappers. You'll complete FICA with ID and proof of address, sign risk disclosures, and choose underlying funds or ETFs that fit your timeline. Online onboarding often takes under an hour if your documents are ready.</p><p>Check platform fees, whether you want ad-hoc or debit-order contributions, and how you'll track deposits across apps. Opening the account isn't the finish line. Low recurring fees and steady contributions matter far more than a flashy advert.</p>",
  },
  { slot: "sa-investing/lesson-3/fica" },
  { slot: "sa-investing/lesson-3/compare" },
  { slot: "sa-investing/lesson-3/automate" },
  { slot: "sa-investing/lesson-3/licensed" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 4 · "RA Basics"
// ═══════════════════════════════════════════════════════════════════════════

const lesson4Slots: QuestionSlot[] = [
  {
    slotId: "sa-investing/lesson-4/what-is",
    conceptId: "ra-basics",
    variants: [
      {
        variantId: "wi-mcq",
        step: {
          type: "mcq",
          question: "What is a Retirement Annuity (RA)?",
          options: [
            "A long-term investment for retirement",
            "A short-term savings account",
            "A type of car insurance",
            "A government grant",
          ],
          correct: 0,
          feedback: {
            correct: "Right. An RA is a private retirement investment. Contributions reduce your taxable income now, and the money grows for retirement.",
            incorrect: "An RA is a long-term retirement investment with a tax deduction on contributions, not a flexible savings account.",
          },
        },
      },
      {
        variantId: "wi-private-tf",
        step: {
          type: "true-false",
          statement: "A Retirement Annuity is something you open yourself, independent of any employer.",
          correct: true,
          feedback: {
            correct: "True. Unlike a workplace pension, an RA is private: ideal for the self-employed or anyone wanting to save beyond their employer fund.",
            incorrect: "It's true. An RA is a private product you control yourself, separate from any employer pension.",
          },
        },
      },
      {
        variantId: "wi-selfemployed-scenario",
        step: {
          type: "scenario",
          question: "Thabo is self-employed with no workplace pension. How can he still save for retirement with a tax break?",
          options: [
            "Open a Retirement Annuity and contribute himself",
            "He can't. Retirement tax breaks are only for employees",
            "Only through UIF",
            "Only by buying investment property and renting it out",
          ],
          correct: 0,
          feedback: {
            correct: "Right. An RA gives the self-employed the same deduction employees get through a pension, he sets it up and funds it himself.",
            incorrect: "An RA is exactly for him: a private retirement fund with a tax deduction, no employer needed.",
          },
        },
      },
    ],
  },
  {
    slotId: "sa-investing/lesson-4/deduction-pct",
    conceptId: "ra-basics",
    variants: [
      {
        variantId: "dp-mcq",
        step: {
          type: "mcq",
          question: "What is the maximum tax-deductible retirement contribution, as a percentage of income?",
          options: ["27.5%", "10%", "15%", "50%"],
          correct: 0,
          feedback: {
            correct: "Right. You can deduct up to 27.5% of your taxable income, subject to an annual rand cap (R430 000 for 2027), one of SA's best legal tax breaks.",
            incorrect: "It's 27.5% of taxable income, up to an annual cap (R430 000 for 2027).",
          },
        },
      },
      {
        variantId: "dp-fill",
        step: {
          type: "fill-blank",
          title: "Your deductible ceiling",
          prompt: "You earn R400 000 taxable income a year. 27.5% of that, your deduction ceiling, is R____.",
          correct: 110000,
          feedback: {
            correct: "Correct: 27.5% × R400 000 = R110 000, well within the annual rand cap. Contribute up to that and it's deductible.",
            incorrect: "27.5% × R400 000 = R110 000.",
          },
        },
      },
      {
        variantId: "dp-cap-tf",
        step: {
          type: "true-false",
          statement: "The retirement-contribution deduction is 27.5% of income, but also subject to an annual rand cap set by SARS.",
          correct: true,
          feedback: {
            correct: "True. It's the lower of 27.5% of income or the annual rand cap (R430 000 for 2027). High earners hit the rand cap first.",
            incorrect: "It's true. The deduction is 27.5% of income up to an annual rand cap. Whichever is lower applies.",
          },
        },
      },
    ],
  },
  {
    slotId: "sa-investing/lesson-4/lock-in",
    conceptId: "ra-basics",
    variants: [
      {
        variantId: "li-tf",
        step: {
          type: "true-false",
          statement: "RA money is generally locked until at least age 55, unlike a normal savings account.",
          correct: true,
          feedback: {
            correct: "True. The trade-off for the tax break is a long lock-in: you generally can't access an RA before 55. Don't put money you'll need soon into one.",
            incorrect: "It's true. RAs are designed to stay locked until retirement (generally 55+). That discipline is the price of the tax deduction.",
          },
        },
      },
      {
        variantId: "li-tradeoff-mcq",
        step: {
          type: "mcq",
          question: "What's the main trade-off of an RA's tax benefit?",
          options: [
            "Your money is locked in until retirement",
            "You pay higher tax overall",
            "It has no investment growth",
            "You can withdraw it any time with no rules",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The deduction comes with a long lock-in. That's a feature for retirement discipline, but it means don't over-commit money you'll need sooner.",
            incorrect: "The trade-off is the lock-in until retirement. The tax break rewards leaving it untouched for the long haul.",
          },
        },
      },
      {
        variantId: "li-liquidity-scenario",
        step: {
          type: "scenario",
          question: "Lerato is tempted to put most of her savings into an RA for the tax deduction, but might need cash within a year. What's wise?",
          options: [
            "Keep an accessible buffer first",
            "Lock it all in for the deduction",
            "Borrow on a credit card to fund it",
            "Hide income from SARS instead",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A tax break is no good if she can't reach her money in an emergency. Liquidity first, then commit only long-term money to the RA.",
            incorrect: "Don't lock away money she may need soon. Secure an accessible buffer first, then put only truly long-term funds in the RA.",
          },
        },
      },
    ],
  },
  {
    slotId: "sa-investing/lesson-4/vehicles",
    conceptId: "ra-basics",
    variants: [
      {
        variantId: "veh-who-mcq",
        step: {
          type: "mcq",
          question: "Who benefits most from an RA (versus relying only on an employer pension)?",
          options: [
            "The self-employed, mainly",
            "Only people over the age of 60",
            "Only people earning under R5 000",
            "Nobody, RAs have no purpose",
          ],
          correct: 0,
          feedback: {
            correct: "Right. No employer fund, or want to save more than it allows? An RA lets you claim the deduction and build retirement savings on your own terms.",
            incorrect: "RAs suit the self-employed and anyone topping up beyond an employer fund. That's who gains the most.",
          },
        },
      },
      {
        variantId: "veh-portable-tf",
        step: {
          type: "true-false",
          statement: "An RA stays yours through job changes, because it isn't tied to an employer.",
          correct: true,
          feedback: {
            correct: "True. That portability is a key advantage, an RA follows you across jobs and career breaks, unlike an employer pension.",
            incorrect: "It's true. An RA is portable and independent of any job, so it keeps going through every career change.",
          },
        },
      },
      {
        variantId: "veh-topup-scenario",
        step: {
          type: "scenario",
          question: "Sipho has an employer pension but wants to save more for retirement with a tax break. What can he do?",
          options: [
            "Open an RA to top up, sharing the same 27.5% deduction limit",
            "Nothing. He's capped at the pension",
            "Only use a normal savings account",
            "Cancel his pension first",
          ],
          correct: 0,
          feedback: {
            correct: "Right. He can run an RA alongside his pension. Combined contributions share the 27.5% (capped) deduction, so he can save more, tax-efficiently.",
            incorrect: "He can add an RA on top of his pension. The two share the 27.5% deduction limit, letting him save more with the tax break.",
          },
        },
      },
    ],
  },
];

const lesson4Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Save for Retirement AND Pay Less Tax",
    content:
      "<p>A Retirement Annuity (RA) is a long-term investment specifically for retirement. Contributions are <strong>tax-deductible</strong> up to 27.5% of your income, subject to an annual rand cap (R430 000 for 2027).</p><p>Example: earn R50 000/month and contribute R5 000/month to an RA, and you reduce your taxable income by R60 000 a year, potentially saving thousands in tax. The trade-off is a long lock-in: RA money is generally inaccessible until at least age 55.</p>",
  },
  { slot: "sa-investing/lesson-4/what-is" },
  { slot: "sa-investing/lesson-4/deduction-pct" },
  { slot: "sa-investing/lesson-4/lock-in" },
  { slot: "sa-investing/lesson-4/vehicles" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 5 · "Tax Benefits of RAs"
// ═══════════════════════════════════════════════════════════════════════════

const lesson5Slots: QuestionSlot[] = [
  {
    slotId: "sa-investing/lesson-5/deduction-benefit",
    conceptId: "ra-tax-deduction",
    variants: [
      {
        variantId: "db-mcq",
        step: {
          type: "mcq",
          question: "What's the headline tax benefit of an RA for many working South Africans?",
          options: [
            "Contributions are tax-deductible",
            "No tax ever, anywhere, automatically",
            "You can withdraw the cash any week",
            "Full exemption from all FICA rules",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Contributions reduce your taxable income (within the 27.5%/capped limit), so you pay less income tax today.",
            incorrect: "It's the deduction: qualifying RA contributions lower your taxable income within limits. Beware myths of 'unlimited tax freedom'.",
          },
        },
      },
      {
        variantId: "db-lower-paye-tf",
        step: {
          type: "true-false",
          statement: "Contributing to an RA lowers your taxable income, which reduces the income tax you pay.",
          correct: true,
          feedback: {
            correct: "True. The contribution comes off before tax is calculated, so SARS taxes a smaller income: a real, immediate saving.",
            incorrect: "It's true. RA contributions cut taxable income, so your income tax drops. That's the core benefit.",
          },
        },
      },
      {
        variantId: "db-priya-scenario",
        step: {
          type: "scenario",
          question: "Priya earns R42 000 taxable a month and contributes R4 000 to an RA. What broadly happens at tax time?",
          options: [
            "Her taxable income drops",
            "She pays more tax as a penalty",
            "Nothing changes at all",
            "She's exempt from all tax forever",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The deductible contribution shrinks her taxable income, so she pays less tax now. How much depends on her marginal rate.",
            incorrect: "Her tax falls: the RA contribution reduces taxable income. The exact saving depends on her bracket, but it's a real reduction.",
          },
        },
      },
    ],
  },
  {
    slotId: "sa-investing/lesson-5/confirm-own",
    conceptId: "ra-tax-deduction",
    variants: [
      {
        variantId: "co-tf",
        step: {
          type: "true-false",
          statement: "You should confirm your own allowable RA deduction each year rather than copying a friend's story.",
          correct: true,
          feedback: {
            correct: "True. Your deduction depends on your income, the caps and current law. Use official SARS guidance or a registered practitioner for your case.",
            incorrect: "It's true. Tax is personal. Check your own numbers against current SARS rules, not a friend's anecdote.",
          },
        },
      },
      {
        variantId: "co-source-mcq",
        step: {
          type: "mcq",
          question: "Where should you get your RA tax-deduction details?",
          options: [
            "Official SARS guidance or a registered tax practitioner",
            "A stranger's WhatsApp message",
            "A social-media 'tax hack' video",
            "Whatever a colleague half-remembers",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Rules and caps change and depend on your income. Trust SARS or a registered practitioner, not second-hand tips.",
            incorrect: "Use SARS or a registered practitioner. Tax rules shift yearly and are personal. Anecdotes and 'hacks' get people penalised.",
          },
        },
      },
      {
        variantId: "co-changes-tf",
        step: {
          type: "true-false",
          statement: "Retirement tax rules and rand caps can change from year to year.",
          correct: true,
          feedback: {
            correct: "True. Budgets adjust the caps and thresholds. Check the current figures each tax year before increasing your contributions.",
            incorrect: "It's true. The caps and rules are updated in the annual budget, so verify the current year's numbers.",
          },
        },
      },
    ],
  },
  {
    slotId: "sa-investing/lesson-5/not-free",
    conceptId: "ra-tax-deduction",
    variants: [
      {
        variantId: "nf-mcq",
        step: {
          type: "mcq",
          question: "How should you treat the RA tax deduction?",
          options: [
            "As a nudge to save",
            "As free money to spend elsewhere",
            "As a reason to borrow to contribute more",
            "As a way to access cash any time",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The deduction rewards saving you'd want to do anyway. Make sure the contribution still leaves your monthly essentials covered.",
            incorrect: "It's a nudge to save, not free money. Contribute what fits your cash flow. Never borrow or starve essentials to chase the deduction.",
          },
        },
      },
      {
        variantId: "nf-borrow-tf",
        step: {
          type: "true-false",
          statement: "It's a good idea to borrow on a credit card to increase your RA contribution for the tax deduction.",
          correct: false,
          feedback: {
            correct: "Correct. Never do that. Credit-card interest (often 20%+) dwarfs the tax saving. You'd lose money chasing the deduction.",
            incorrect: "It's a bad idea. High credit-card interest wipes out the tax benefit. Only contribute money you actually have.",
          },
        },
      },
      {
        variantId: "nf-cashflow-scenario",
        step: {
          type: "scenario",
          question: "Adding a big RA debit order would leave Nomsa short on rent some months. What should she do?",
          options: [
            "Contribute a smaller amount that fits her budget comfortably",
            "Keep the big debit order and risk missing rent",
            "Stop paying rent to fund the RA",
            "Take a loan to cover the gap",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The tax break isn't worth risking her rent. A smaller, sustainable contribution she can always afford is the right size.",
            incorrect: "Scale the contribution to what her budget allows. A deduction that jeopardises rent is too big. Sustainable beats maximal.",
          },
        },
      },
    ],
  },
  {
    slotId: "sa-investing/lesson-5/rules",
    conceptId: "ra-tax-deduction",
    variants: [
      {
        variantId: "ru-early-tf",
        step: {
          type: "true-false",
          statement: "Cashing out an RA early, outside allowed events, generally triggers penalties.",
          correct: true,
          feedback: {
            correct: "True. RAs are built to stay locked. Early access outside the rules carries penalties and tax, another reason to only commit long-term money.",
            incorrect: "It's true. Early withdrawal outside the permitted events is penalised. The lock-in is central to how RAs work.",
          },
        },
      },
      {
        variantId: "ru-approved-mcq",
        step: {
          type: "mcq",
          question: "To get the RA tax benefit, your contributions must go into:",
          options: [
            "An approved retirement fund that follows the rules",
            "Any account you like",
            "A friend's business",
            "Cryptocurrency of your choice",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The deduction only applies to approved retirement funds. That's what ties the tax break to genuine retirement saving.",
            incorrect: "It must be an approved retirement fund. The deduction is specifically for qualifying products, not any investment.",
          },
        },
      },
      {
        variantId: "ru-longterm-scenario",
        step: {
          type: "scenario",
          question: "Given the lock-in and penalties, what money is right for an RA?",
          options: [
            "Money you won't touch",
            "Your emergency fund money",
            "Next year's holiday savings",
            "This month's grocery money",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Only commit money you can genuinely leave until retirement. Short-term or emergency cash belongs in accessible accounts.",
            incorrect: "RAs are for long-term, leave-it-alone money. Emergency and short-term funds need to stay accessible elsewhere.",
          },
        },
      },
    ],
  },
];

const lesson5Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Deductions Now, Discipline Later",
    content:
      "<p>Priya contributes R4 000 monthly to an RA while earning R42 000 taxable income. SARS lets her deduct those contributions up to the legal percentage and cap, lowering her income tax today while locking money for retirement. Exact savings depend on your bracket and current law.</p><p>You still follow product rules: penalties for cashing out early outside allowed events, and contributions must go to approved funds. Treat the deduction as a nudge to save, not 'free money', and plan your cash flow so living costs stay covered after the debit order.</p>",
  },
  { slot: "sa-investing/lesson-5/deduction-benefit" },
  { slot: "sa-investing/lesson-5/confirm-own" },
  { slot: "sa-investing/lesson-5/not-free" },
  { slot: "sa-investing/lesson-5/rules" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 6 · "Unit Trusts & ETFs"
// ═══════════════════════════════════════════════════════════════════════════

const lesson6Slots: QuestionSlot[] = [
  {
    slotId: "sa-investing/lesson-6/pooled",
    conceptId: "unit-trusts",
    variants: [
      {
        variantId: "pl-what-mcq",
        step: {
          type: "mcq",
          question: "What is a unit trust?",
          options: [
            "A manager-run basket of assets",
            "A single share in just one company",
            "A special type of savings account",
            "A bond issued by the government",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A unit trust pools money from many people into a managed basket of assets, so even a small investor gets instant diversification.",
            incorrect: "A unit trust pools many investors' money into a managed basket, not a single share or a bank account.",
          },
        },
      },
      {
        variantId: "pl-diversify-tf",
        step: {
          type: "true-false",
          statement: "Pooled investments like unit trusts and ETFs let a small investor hold many assets at once.",
          correct: true,
          feedback: {
            correct: "True. Instead of buying dozens of shares yourself, one pooled fund spreads your money across many holdings, cheap, instant diversification.",
            incorrect: "It's true. Pooling is how a small amount buys a slice of many assets, giving diversification you couldn't easily build alone.",
          },
        },
      },
      {
        variantId: "pl-wrapper-scenario",
        step: {
          type: "scenario",
          question: "Sipho wants his long-term fund to grow tax-free. Can he hold unit trusts or ETFs inside a TFSA?",
          options: [
            "Yes. Both can sit inside a TFSA wrapper when the rules allow",
            "No. TFSAs can only hold cash",
            "Only individual shares are allowed",
            "Only bonds are allowed",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Many unit trusts and ETFs can live inside a TFSA, combining diversification with tax-free growth: a powerful long-term combo.",
            incorrect: "They can. Eligible unit trusts and ETFs can be held in a TFSA, so you get diversification and tax-free growth together.",
          },
        },
      },
    ],
  },
  {
    slotId: "sa-investing/lesson-6/etf-vs-active",
    conceptId: "etf",
    variants: [
      {
        variantId: "eva-mcq",
        step: {
          type: "mcq",
          question: "Which statement is most accurate for a beginner comparing ETFs and active unit trusts?",
          options: [
            "ETFs often track an index passively",
            "ETFs always beat every unit trust, forever",
            "Unit trusts are not allowed to charge fees",
            "Neither needs a mandate document",
          ],
          correct: 0,
          feedback: {
            correct: "Right. It's a passive-vs-active, low-fee-vs-higher-fee trade-off. Neither structure is guaranteed to win every year.",
            incorrect: "ETFs usually track an index cheaply; active unit trusts try to beat a benchmark at higher cost. Neither is a guaranteed winner.",
          },
        },
      },
      {
        variantId: "eva-index-tf",
        step: {
          type: "true-false",
          statement: "An ETF typically tracks an index and trades like a share on the exchange.",
          correct: true,
          feedback: {
            correct: "True. Most ETFs passively follow an index (like the JSE Top 40 or a global index) and can be bought and sold like a share.",
            incorrect: "It's true, an ETF usually tracks an index and trades like a share, which is part of why it's often low-cost.",
          },
        },
      },
      {
        variantId: "eva-active-scenario",
        step: {
          type: "scenario",
          question: "An active unit trust charges much higher fees than a similar index ETF, promising to 'beat the market'. What should a beginner remember?",
          options: [
            "Higher fees are guaranteed",
            "Higher fees guarantee higher returns",
            "Active funds never charge fees",
            "The market can't be tracked",
          ],
          correct: 0,
          feedback: {
            correct: "Right. You pay the fee for sure; the outperformance is a hope, not a promise. Over time, many active funds trail a cheap index after costs.",
            incorrect: "The fee is certain; beating the market isn't. After higher costs, plenty of active funds underperform a simple index.",
          },
        },
      },
    ],
  },
  {
    slotId: "sa-investing/lesson-6/ter",
    conceptId: "etf",
    variants: [
      {
        variantId: "ter-fill",
        step: {
          type: "fill-blank",
          title: "Reading the fee",
          prompt: "One fund lists total yearly costs near 1.5% and a similar index fund near 0.35%. Enter the higher one as a number (not R): ____.",
          correct: 1.5,
          feedback: {
            correct: "Correct. 1.5%. When funds are similar, the lower-cost one usually leaves you more growth. Small fee gaps compound over decades.",
            incorrect: "The higher figure is 1.5(%). Comparing TERs like this is how you spot expensive duplicates.",
          },
        },
      },
      {
        variantId: "ter-what-mcq",
        step: {
          type: "mcq",
          question: "What does the Total Expense Ratio (TER) tell you?",
          options: [
            "Roughly the yearly cost of holding the fund",
            "The guaranteed return",
            "The fund manager's salary",
            "The share price",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The TER is the annual cost of the fund. Lower is better when funds are otherwise similar. It's money that stays invested.",
            incorrect: "The TER is the fund's yearly cost as a percentage. It's the number to compare when funds are similar. Lower keeps more growth yours.",
          },
        },
      },
      {
        variantId: "ter-compound-tf",
        step: {
          type: "true-false",
          statement: "A small difference in yearly fees can add up to a lot over decades of investing.",
          correct: true,
          feedback: {
            correct: "True. A 1% fee gap doesn't sound like much, but compounded over 20–30 years it can cost you a large slice of your final value.",
            incorrect: "It's true: fees compound against you. Even a 1% difference is significant over a long investing lifetime.",
          },
        },
      },
    ],
  },
  {
    slotId: "sa-investing/lesson-6/factsheet",
    conceptId: "unit-trusts",
    variants: [
      {
        variantId: "fs-tf",
        step: {
          type: "true-false",
          statement: "Reading the minimum disclosure document (fund fact sheet) is part of responsible investing.",
          correct: true,
          feedback: {
            correct: "True. The fact sheet shows what the fund holds, its fees, its benchmark and its risks. The basics you should know before you invest.",
            incorrect: "It's true. The fact sheet (minimum disclosure document) is essential reading: holdings, fees, benchmark and risk in one place.",
          },
        },
      },
      {
        variantId: "fs-what-mcq",
        step: {
          type: "mcq",
          question: "Before investing in a fund, what should you check on its fact sheet?",
          options: [
            "Its benchmark, its costs (TER)",
            "Only its name",
            "How many people follow it online",
            "The manager's photo",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Benchmark, cost and time horizon tell you what you're buying, what it costs, and whether it fits your timeline.",
            incorrect: "Check the benchmark, the TER and the suggested holding period. That's what tells you if the fund fits you.",
          },
        },
      },
      {
        variantId: "fs-confused-scenario",
        step: {
          type: "scenario",
          question: "Ayesha reads a fund fact sheet but doesn't understand what she'd be holding. What's the responsible move?",
          options: [
            "Pause and learn more before investing",
            "Invest anyway and hope",
            "Put in her whole savings to be safe",
            "Follow a stranger's tip instead",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Never invest in something you don't understand. Pausing to learn or asking a licensed adviser beats guessing with real money.",
            incorrect: "If it's unclear, don't invest yet. Understanding what you hold, or getting proper advice, comes before committing money.",
          },
        },
      },
    ],
  },
];

const lesson6Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Pooled Investing",
    content:
      "<p>A unit trust pools money from many investors into a basket chosen by a manager within set mandates. An ETF typically tracks an index and trades like a share. Both can sit inside a TFSA or other wrapper when the rules allow, but their fees and trading differ.</p><p>Read the Total Expense Ratio (TER), transaction costs, and how often you may switch. Flashy past-performance charts ignore the tax you'd pay outside a shelter and your own timing, focus on fit, fees, and whether you understand what you hold.</p>",
  },
  { slot: "sa-investing/lesson-6/pooled" },
  { slot: "sa-investing/lesson-6/etf-vs-active" },
  { slot: "sa-investing/lesson-6/ter" },
  { slot: "sa-investing/lesson-6/factsheet" },
];

export const SA_INVESTING_BANKS: Record<string, LessonBank> = {
  "sa-investing::lesson-1": { layout: lesson1Layout, slots: lesson1Slots },
  "sa-investing::lesson-2": { layout: lesson2Layout, slots: lesson2Slots },
  "sa-investing::lesson-3": { layout: lesson3Layout, slots: lesson3Slots },
  "sa-investing::lesson-4": { layout: lesson4Layout, slots: lesson4Slots },
  "sa-investing::lesson-5": { layout: lesson5Layout, slots: lesson5Slots },
  "sa-investing::lesson-6": { layout: lesson6Layout, slots: lesson6Slots },
};
