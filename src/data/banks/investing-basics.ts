import type { LessonLayoutItem, QuestionSlot } from "@/data/content";
import type { LessonBank } from "./money-basics";

/**
 * Bank for the Investing Basics course. Per docs/QUESTION-VOICE-GUIDE.md:
 * every lesson has 4 slots (>3 questions), each a pool of distinct SA scenarios,
 * concept-tagged for spaced-repetition resurface.
 */

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 1 · "Risk vs Return"
// ═══════════════════════════════════════════════════════════════════════════

const lesson1Slots: QuestionSlot[] = [
  {
    slotId: "investing-basics/lesson-1/no-free-lunch",
    conceptId: "risk-vs-return",
    variants: [
      {
        variantId: "nfl-guaranteed",
        step: {
          type: "mcq",
          question: "An investment promises 40% guaranteed returns with zero risk. This is most likely:",
          options: ["A Ponzi scheme or scam", "A legitimate opportunity", "A government bond", "A normal unit trust"],
          correct: 0,
          feedback: {
            correct: "Right. Guaranteed high returns with no risk is the classic scam signal. If it sounds too good to be true, it is.",
            incorrect: "It's almost certainly a scam. No legitimate investment guarantees high returns with zero risk. That combination doesn't exist.",
          },
        },
      },
      {
        variantId: "nfl-tf",
        step: {
          type: "true-false",
          statement: "Higher potential return always comes with higher risk. There's no high return with zero risk.",
          correct: true,
          feedback: {
            correct: "True. Risk and reward travel together. Anyone promising big returns with no risk is selling a fantasy or a fraud.",
            incorrect: "It's true: reward tracks risk. 'High return, no risk' is the definition of a scam, not an opportunity.",
          },
        },
      },
      {
        variantId: "nfl-friend-scenario",
        step: {
          type: "scenario",
          question: "A friend says a scheme pays a 'guaranteed 8% every week'. What should you conclude?",
          options: [
            "It's a red flag",
            "It's a great deal, invest immediately",
            "It's a normal savings account",
            "The Reserve Bank backs it",
          ],
          correct: 0,
          feedback: {
            correct: "Right. 8% a week is impossible to sustain honestly. It's the signature of a scam that pays early joiners with later joiners' money.",
            incorrect: "Walk away. A 'guaranteed' weekly return that high is a Ponzi hallmark, not a legitimate investment.",
          },
        },
      },
    ],
  },
  {
    slotId: "investing-basics/lesson-1/spectrum",
    conceptId: "risk-vs-return",
    variants: [
      {
        variantId: "sp-low-mcq",
        step: {
          type: "mcq",
          question: "Which sits at the LOW-risk, low-return end of the spectrum?",
          options: ["A money market or savings account", "A single small-cap share", "Cryptocurrency", "A leveraged forex trade"],
          correct: 0,
          feedback: {
            correct: "Right. Savings and money market sit low: stable but modest. Single shares, crypto and leverage sit at the high-risk end.",
            incorrect: "Low-risk means a savings or money market account. Stable, modest returns. The others are high-risk, high-swing.",
          },
        },
      },
      {
        variantId: "sp-high-mcq",
        step: {
          type: "mcq",
          question: "Which generally sits at the HIGHER-risk, higher-return end?",
          options: ["Shares and equity ETFs", "A 32-day notice account", "A money market fund", "A fixed deposit"],
          correct: 0,
          feedback: {
            correct: "Right. Shares and equity ETFs can grow more over decades but swing more year to year. Notice accounts and deposits are the calm end.",
            incorrect: "Shares/equity ETFs are the higher-risk, higher-return end. Notice accounts, money market and fixed deposits are the stable end.",
          },
        },
      },
      {
        variantId: "sp-match-tf",
        step: {
          type: "true-false",
          statement: "There's no single 'best' risk level. The right choice depends on your goal and how long you can wait.",
          correct: true,
          feedback: {
            correct: "True. The stable end suits near-term money; the growth end suits long-term goals. Match the tool to the timeline.",
            incorrect: "It's true. 'best' depends on your goal and horizon. Short-term money wants stability; long-term money can take more risk.",
          },
        },
      },
    ],
  },
  {
    slotId: "investing-basics/lesson-1/cash-not-safe",
    conceptId: "risk-vs-return",
    variants: [
      {
        variantId: "cns-fill",
        step: {
          type: "fill-blank",
          title: "The cost of doing nothing",
          prompt: "You leave R100 000 in cash and inflation is 6%. In one year it loses about R____ in buying power.",
          correct: 6000,
          feedback: {
            correct: "Correct: 6% of R100 000 = R6 000 of purchasing power gone. 'Doing nothing' isn't safe. It's a slow loss.",
            incorrect: "6% of R100 000 = R6 000 of buying power lost in a year.",
          },
        },
      },
      {
        variantId: "cns-tf",
        step: {
          type: "true-false",
          statement: "Keeping all your long-term money in cash is completely risk-free.",
          correct: false,
          feedback: {
            correct: "Correct. Cash carries inflation risk. It slowly loses buying power. Over a decade, R100 000 in cash can buy roughly half as much.",
            incorrect: "It isn't risk-free. Cash steadily loses purchasing power to inflation, which is why long-term money usually needs growth assets.",
          },
        },
      },
      {
        variantId: "cns-scenario",
        step: {
          type: "scenario",
          question: "Sipho keeps his entire long-term savings in a 0%-interest account 'to be safe'. Over 10 years at 6% inflation, what happens?",
          options: [
            "Its buying power roughly halves",
            "It doubles automatically over time",
            "Nothing at all changes over time",
            "It's fully protected from inflation",
          ],
          correct: 0,
          feedback: {
            correct: "Right. At ~6% a year, prices roughly double over a decade, so idle cash buys about half as much. For long-term goals, that's a real loss.",
            incorrect: "It loses badly to inflation. After 10 years it buys about half as much. Cash is safe from crashes but not from rising prices.",
          },
        },
      },
    ],
  },
  {
    slotId: "investing-basics/lesson-1/horizon-risk",
    conceptId: "risk-vs-return",
    variants: [
      {
        variantId: "hr-tf",
        step: {
          type: "true-false",
          statement: "The longer your investment time horizon, the more risk you can generally afford to take.",
          correct: true,
          feedback: {
            correct: "True. Time smooths out volatility. A 20-year investor can ride out a crash that would devastate someone who needs the money next year.",
            incorrect: "It's true, a longer horizon lets you absorb short-term dips and benefit from long-term growth. Time is the great cushion.",
          },
        },
      },
      {
        variantId: "hr-why-mcq",
        step: {
          type: "mcq",
          question: "Why can a long horizon justify more market risk?",
          options: [
            "There's time for dips to recover and for growth to compound",
            "Because long-term investments can't fall",
            "Because the government guarantees them",
            "It doesn't. Horizon is irrelevant",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Over many years, temporary drops tend to recover and compounding does the heavy lifting, so short-term swings matter less.",
            incorrect: "It's about time to recover and compound. Long horizons absorb volatility; they don't remove it or come with guarantees.",
          },
        },
      },
      {
        variantId: "hr-scenario",
        step: {
          type: "scenario",
          question: "Nomsa (25) is investing for retirement 35 years away. How should her horizon shape her risk?",
          options: [
            "She can take more market risk now",
            "She should avoid all growth assets to be safe",
            "She should keep everything in cash forever",
            "Her horizon makes no difference",
          ],
          correct: 0,
          feedback: {
            correct: "Right. With 35 years, short-term crashes matter far less and growth assets can compound. Long horizon, more room for risk.",
            incorrect: "A 35-year horizon supports more growth risk. Dips have decades to recover. All-cash would likely cost her serious compounding.",
          },
        },
      },
    ],
  },
];

const lesson1Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "The Golden Rule of Investing",
    content:
      "<p>Leave R100 000 in cash instead of investing and you quietly lose about R6 000 a year in buying power to inflation. After 10 years, that R100 000 buys what R55 000 used to. Doing nothing isn't safe. It's slow financial erosion.</p><p>Higher potential return always comes with higher risk. There's no high return with zero risk. That's the definition of a scam. The spectrum runs from low risk/low return (savings, money market) → medium (bonds, balanced funds) → high (shares, ETFs, property).</p>",
  },
  { slot: "investing-basics/lesson-1/no-free-lunch" },
  { slot: "investing-basics/lesson-1/spectrum" },
  { slot: "investing-basics/lesson-1/cash-not-safe" },
  { slot: "investing-basics/lesson-1/horizon-risk" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 2 · "The Power of Compound Interest"
// ═══════════════════════════════════════════════════════════════════════════

const lesson2Slots: QuestionSlot[] = [
  {
    slotId: "investing-basics/lesson-2/main-ingredient",
    conceptId: "compound-interest",
    variants: [
      {
        variantId: "mi-time",
        step: {
          type: "mcq",
          question: "What is the main ingredient that makes compound interest powerful?",
          options: ["Time", "A high salary", "A financial advisor", "Luck"],
          correct: 0,
          feedback: {
            correct: "Right. Time is everything. Starting even 10 years earlier can double or triple your final amount.",
            incorrect: "It's time. The earlier you start, the longer compounding has to work. That matters more than the size of each contribution.",
          },
        },
      },
      {
        variantId: "mi-early-tf",
        step: {
          type: "true-false",
          statement: "Starting to invest 10 years earlier can dramatically increase your final amount, even with the same monthly contribution.",
          correct: true,
          feedback: {
            correct: "True. Those extra years compound on top of everything else, so an early starter often ends far ahead of a bigger-but-later saver.",
            incorrect: "It's true. Extra years are the most powerful lever in compounding. Early and small often beats late and large.",
          },
        },
      },
      {
        variantId: "mi-two-savers-scenario",
        step: {
          type: "scenario",
          question: "Two people each invest R500/month at the same return. One starts at 25, the other at 35. At 60, who likely has much more?",
          options: [
            "The one who started at 25",
            "They'll have exactly the same",
            "The one who started at 35",
            "Neither. Start age doesn't matter",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The early starter's first decade keeps compounding for 35 years. That head start is often worth hundreds of thousands more.",
            incorrect: "The 25-year-old wins big. Those ten extra years compound the whole way to 60, dwarfing the later starter.",
          },
        },
      },
    ],
  },
  {
    slotId: "investing-basics/lesson-2/interest-on-interest",
    conceptId: "compound-interest",
    variants: [
      {
        variantId: "ioi-what",
        step: {
          type: "mcq",
          question: "What does 'compound interest' actually mean?",
          options: [
            "You earn interest on your interest",
            "The bank charges you a fee each month",
            "Interest that never changes",
            "A once-off bonus payment",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Your returns start earning their own returns, which is what creates exponential (not just steady) growth over time.",
            incorrect: "It means earning interest on your interest. Each year's growth joins the pot and earns more. That snowball is the whole point.",
          },
        },
      },
      {
        variantId: "ioi-fill-yr2",
        step: {
          type: "fill-blank",
          title: "Interest on interest",
          prompt: "You invest R10 000 at 10% a year, compounded. Year 1 = R11 000. After year 2 you have R____.",
          correct: 12100,
          feedback: {
            correct: "Correct: year 2 earns 10% on R11 000 (not R10 000), giving R12 100. That extra R100 is interest on interest.",
            incorrect: "Year 2: R11 000 × 1.10 = R12 100. You earn 10% on last year's total, including the interest.",
          },
        },
      },
      {
        variantId: "ioi-exponential-tf",
        step: {
          type: "true-false",
          statement: "Compound growth speeds up over time, because the base it grows on keeps getting bigger.",
          correct: true,
          feedback: {
            correct: "True. Early on it feels slow, but as the pot grows, each year adds more than the last. That's why time matters so much.",
            incorrect: "It's true, compounding accelerates. The bigger the balance, the bigger each year's growth, so late years add the most.",
          },
        },
      },
    ],
  },
  {
    slotId: "investing-basics/lesson-2/long-run",
    conceptId: "compound-interest",
    variants: [
      {
        variantId: "lr-fill-500",
        step: {
          type: "fill-blank",
          title: "Small monthly, big result",
          prompt: "Investing R500/month for 20 years, you contribute about R____ of your own money (before any growth).",
          correct: 120000,
          feedback: {
            correct: "Correct: R500 × 12 × 20 = R120 000 contributed. With growth, the total can be well over R400 000. The rest is compounding.",
            incorrect: "R500 × 12 months × 20 years = R120 000 of your own contributions. Compounding adds the rest on top.",
          },
        },
      },
      {
        variantId: "lr-most-growth-mcq",
        step: {
          type: "mcq",
          question: "Over a long investment, most of the final value often comes from:",
          options: [
            "Compounding on your contributions",
            "Only the money that you put in",
            "A single lucky year",
            "The bank fees you managed to avoid",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Over decades, the growth-on-growth can exceed everything you contributed. That's compounding doing the heavy lifting.",
            incorrect: "It's the compounding growth. Given enough time, the returns-on-returns can outweigh the actual money you contributed.",
          },
        },
      },
      {
        variantId: "lr-patience-tf",
        step: {
          type: "true-false",
          statement: "Compounding rewards patience. The biggest gains usually come in the later years.",
          correct: true,
          feedback: {
            correct: "True. The curve is slow then steep. Staying invested through the slow early years is what unlocks the dramatic later growth.",
            incorrect: "It's true. The later years grow the most, because the base is largest then. Patience is the price of the big gains.",
          },
        },
      },
    ],
  },
  {
    slotId: "investing-basics/lesson-2/start-now",
    conceptId: "compound-interest",
    variants: [
      {
        variantId: "sn-best-time-mcq",
        step: {
          type: "mcq",
          question: "For compound growth, when is the best time to start investing?",
          options: [
            "As early as possible, even small amounts",
            "Only once you earn a big salary",
            "Only after age 40",
            "Never. It's not worth it",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Time beats amount. Starting small and early usually outperforms starting big and late, thanks to the extra years of compounding.",
            incorrect: "As early as you can. Small amounts started young beat larger amounts started late. The extra years do the work.",
          },
        },
      },
      {
        variantId: "sn-small-tf",
        step: {
          type: "true-false",
          statement: "Even R200 or R300 a month is worth starting with, because time does much of the work.",
          correct: true,
          feedback: {
            correct: "True. Waiting for a 'big enough' amount wastes your most valuable asset. Time. Start small now and increase later.",
            incorrect: "It's true: starting small still harnesses time, your biggest advantage. Begin now, add more as you earn more.",
          },
        },
      },
      {
        variantId: "sn-wait-scenario",
        step: {
          type: "scenario",
          question: "Thabo keeps waiting to invest until he can 'afford R2 000/month'. Meanwhile he could start R400/month now. What's the cost of waiting?",
          options: [
            "Lost years of compounding",
            "Nothing. Waiting is always better",
            "He saves on fees by waiting",
            "There's no difference",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Every year he waits is a year of compounding gone for good. R400 now, growing for longer, often beats R2 000 started years later.",
            incorrect: "The cost is time. Waiting for the 'perfect' amount throws away years of compounding he can't recover. Start with R400 now.",
          },
        },
      },
    ],
  },
];

const lesson2Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "The 8th Wonder of the World",
    content:
      "<p>Compound interest means you earn interest on your interest. Over time that creates exponential growth.</p><p>R10 000 at 10% a year: R11 000 after year 1, R16 105 after 5 years, R25 937 after 10, R67 275 after 20, R174 494 after 30, and you did nothing after year 1. Time did the work. R500/month for 20 years at ~10% becomes over R400 000, from about R120 000 of your own contributions.</p>",
  },
  { slot: "investing-basics/lesson-2/main-ingredient" },
  { slot: "investing-basics/lesson-2/interest-on-interest" },
  { slot: "investing-basics/lesson-2/long-run" },
  { slot: "investing-basics/lesson-2/start-now" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 3 · "Diversification 101"
// ═══════════════════════════════════════════════════════════════════════════

const lesson3Slots: QuestionSlot[] = [
  {
    slotId: "investing-basics/lesson-3/mining-not-diverse",
    conceptId: "diversification",
    variants: [
      {
        variantId: "mnd-tf",
        step: {
          type: "true-false",
          statement: "Buying shares in 10 different South African mining companies is good diversification.",
          correct: false,
          feedback: {
            correct: "Correct. Ten companies in one sector and one country isn't diversified, if mining crashes, all ten fall together.",
            incorrect: "That's concentration, not diversification. Real diversification spreads across different sectors, asset classes and geographies.",
          },
        },
      },
      {
        variantId: "mnd-sector-scenario",
        step: {
          type: "scenario",
          question: "Sipho owns five bank shares and thinks he's diversified. What's the flaw?",
          options: [
            "They're all in one sector",
            "Nothing. Five shares is always diversified",
            "He owns too few shares to matter",
            "Banks never lose value",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Owning many shares in the same sector still leaves you exposed to that sector's bad year. Spread across sectors and asset types.",
            incorrect: "The flaw is concentration in one sector. A banking slump would drag all five down together. That's not real diversification.",
          },
        },
      },
      {
        variantId: "mnd-count-tf",
        step: {
          type: "true-false",
          statement: "Owning many shares is only true diversification if they're spread across different sectors and regions.",
          correct: true,
          feedback: {
            correct: "True. The number of shares matters less than their variety. Twenty companies in one industry still rise and fall together.",
            incorrect: "It's true. Variety, not count, is what diversifies. Many shares in one sector share the same fate.",
          },
        },
      },
    ],
  },
  {
    slotId: "investing-basics/lesson-3/what-is",
    conceptId: "diversification",
    variants: [
      {
        variantId: "wi-def",
        step: {
          type: "mcq",
          question: "What does diversification mean?",
          options: [
            "Spreading money across different assets",
            "Putting everything into one great share",
            "Only investing in your own company",
            "Keeping all your money in cash",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Diversification is not putting all your eggs in one basket, if one part falls, the others cushion the blow.",
            incorrect: "It's spreading across different assets so a single bad investment can't sink you. Concentration is the opposite.",
          },
        },
      },
      {
        variantId: "wi-eggs-tf",
        step: {
          type: "true-false",
          statement: "Diversification is about making sure one bad investment doesn't destroy your whole portfolio.",
          correct: true,
          feedback: {
            correct: "True. It won't maximise your best-case return, but it protects you from any single failure being catastrophic.",
            incorrect: "It's true. The goal is protection: no single investment failing should be able to wipe you out.",
          },
        },
      },
      {
        variantId: "wi-etf-scenario",
        step: {
          type: "scenario",
          question: "Instead of picking three shares, Nomsa buys one broad ETF holding hundreds of companies. How does that help?",
          options: [
            "One company barely dents her",
            "It guarantees she'll make money",
            "It removes all risk entirely",
            "It's worse than owning three shares",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A broad ETF spreads company-specific risk across hundreds of firms, so no single failure dominates her outcome.",
            incorrect: "It spreads her risk across many companies, so one bad one barely matters. It doesn't remove risk or guarantee profit, but it cushions.",
          },
        },
      },
    ],
  },
  {
    slotId: "investing-basics/lesson-3/across-classes",
    conceptId: "diversification",
    variants: [
      {
        variantId: "ac-mcq",
        step: {
          type: "mcq",
          question: "Beyond owning many shares, a well-diversified portfolio also spreads across:",
          options: [
            "Shares, bonds, property and cash",
            "Only technology shares on the JSE",
            "Only one bank's products",
            "Only cryptocurrencies",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Mixing asset classes (and regions) means they don't all move together, smoothing the ride when one has a bad year.",
            incorrect: "True diversification spreads across asset classes (shares, bonds, property, cash) not just many shares in one place.",
          },
        },
      },
      {
        variantId: "ac-geography-tf",
        step: {
          type: "true-false",
          statement: "Holding both South African and global shares adds geographic diversification.",
          correct: true,
          feedback: {
            correct: "True. If the local economy struggles, global holdings may hold up (and vice versa). Spreading across regions reduces single-country risk.",
            incorrect: "It's true. Mixing SA and global exposure means one country's downturn doesn't sink your whole portfolio.",
          },
        },
      },
      {
        variantId: "ac-example-mcq",
        step: {
          type: "mcq",
          question: "Which looks most like a diversified portfolio?",
          options: [
            "ETFs, bonds, property and cash",
            "All of your money in one SA share",
            "Ten shares, all of them mining",
            "Only cash under the mattress",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Spreading across asset classes and regions is the essence of diversification. No single event can undo everything.",
            incorrect: "The diversified option mixes local and global shares, bonds, property and cash. The others are all concentrated in one thing.",
          },
        },
      },
    ],
  },
  {
    slotId: "investing-basics/lesson-3/limits",
    conceptId: "diversification",
    variants: [
      {
        variantId: "lm-not-guarantee-tf",
        step: {
          type: "true-false",
          statement: "Diversification reduces the risk of a single failure, but it doesn't guarantee you'll never lose money.",
          correct: true,
          feedback: {
            correct: "True. In a broad market crash, most things can fall together. Diversification cushions single-company disasters, not every downturn.",
            incorrect: "It's true. Diversification lowers single-investment risk, but a broad market drop can still pull most assets down. No guarantee.",
          },
        },
      },
      {
        variantId: "lm-benefit-mcq",
        step: {
          type: "mcq",
          question: "The main benefit of diversification is that it:",
          options: [
            "Stops any single investment from ruining you",
            "Guarantees a profit every year",
            "Removes all risk",
            "Always beats picking one winner",
          ],
          correct: 0,
          feedback: {
            correct: "Right. It's protection, not a profit guarantee. You give up the huge upside of one lucky pick in exchange for not being wiped out by one loser.",
            incorrect: "It protects against a single failure sinking you, it doesn't guarantee profit or remove risk. That trade-off is the point.",
          },
        },
      },
      {
        variantId: "lm-tradeoff-scenario",
        step: {
          type: "scenario",
          question: "Lerato is disappointed her diversified portfolio didn't match the one share her friend got lucky on. What's she missing?",
          options: [
            "It trades lottery upside for protection",
            "She should put everything in that share",
            "Diversification never works",
            "Her friend's luck is repeatable",
          ],
          correct: 0,
          feedback: {
            correct: "Right. For every lucky single-share winner there are many losers you don't hear about. Diversification is the sensible trade: less thrill, far less ruin.",
            incorrect: "She's comparing to survivorship luck. Diversification gives up the jackpot chance in return for not being destroyed by one bad pick.",
          },
        },
      },
    ],
  },
];

const lesson3Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Don't Put All Your Eggs in One Basket",
    content:
      "<p>Diversification means spreading your investments across different assets so one bad investment can't wipe you out.</p><p>A diversified portfolio might look like: 30% SA shares (a JSE ETF), 30% global shares (e.g. an S&P 500 ETF), 20% bonds, 10% property (a REIT), 10% cash. The point isn't to maximise your best case. It's to make sure no single failure can ruin you.</p>",
  },
  { slot: "investing-basics/lesson-3/mining-not-diverse" },
  { slot: "investing-basics/lesson-3/what-is" },
  { slot: "investing-basics/lesson-3/across-classes" },
  { slot: "investing-basics/lesson-3/limits" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 4 · "Time Horizon Matters"
// ═══════════════════════════════════════════════════════════════════════════

const lesson4Slots: QuestionSlot[] = [
  {
    slotId: "investing-basics/lesson-4/short-need",
    conceptId: "time-horizon",
    variants: [
      {
        variantId: "sn-schoolfees",
        step: {
          type: "mcq",
          question: "You need funds in 11 months for school fees. Which stance fits best?",
          options: [
            "Emphasise capital you can access without severe loss",
            "Put it all in speculative trades",
            "Borrow the full amount on a microloan",
            "Keep it all as cash under a mattress",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A fixed, near deadline needs stability. A crash just before the fees are due could leave you short with no time to recover.",
            incorrect: "Short needs deserve predictable access and controlled risk, not hype trades or a microloan. Match the tool to the months, not the story.",
          },
        },
      },
      {
        variantId: "sn-deposit-scenario",
        step: {
          type: "scenario",
          question: "Anele needs R40 000 in nine months for a car deposit. Where should it sit?",
          options: [
            "In a notice or money market account",
            "In one small-cap share for maximum growth",
            "In a friend's crypto scheme",
            "Spent now, while hoping for a bonus later",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Nine months is too short for volatility. If shares dipped 18% right before she buys, she couldn't get the car without delay.",
            incorrect: "Short deadline = stability. Volatile shares could drop right when she needs the money; a notice or money market account protects it.",
          },
        },
      },
      {
        variantId: "sn-under2-tf",
        step: {
          type: "true-false",
          statement: "Money you'll need in under two years usually belongs in stable, low-volatility options.",
          correct: true,
          feedback: {
            correct: "True. Under two years, there's little time to recover from a dip, so protecting the amount beats reaching for returns.",
            incorrect: "It's true. Short timelines favour stability. There's no time to ride out a crash, so capital protection comes first.",
          },
        },
      },
    ],
  },
  {
    slotId: "investing-basics/lesson-4/volatile-mismatch",
    conceptId: "time-horizon",
    variants: [
      {
        variantId: "vm-tf",
        step: {
          type: "true-false",
          statement: "If you might need every rand next year, investments that swing wildly month to month are usually a poor fit.",
          correct: true,
          feedback: {
            correct: "True. Volatility plus a fixed near deadline is a classic mismatch. You could be forced to sell low exactly when you need the cash.",
            incorrect: "It's true. Near-term money needs steadier choices. Wild swings and a fixed deadline can force you to sell at the worst moment.",
          },
        },
      },
      {
        variantId: "vm-sell-low-mcq",
        step: {
          type: "mcq",
          question: "What's the danger of putting short-term money in volatile investments?",
          options: [
            "You may be forced to sell low",
            "You'll definitely lose everything",
            "There's really no danger at all",
            "The bank will simply freeze it",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A dip at the wrong moment, with a deadline looming, means selling at a loss just before a rebound, the timeline mismatch trap.",
            incorrect: "The danger is being forced to sell during a dip because your deadline arrives, locking in a loss right before a recovery.",
          },
        },
      },
      {
        variantId: "vm-match-scenario",
        step: {
          type: "scenario",
          question: "Thabo puts his rent money for next month into shares 'to grow it a bit'. Why is that risky?",
          options: [
            "Shares can fall before rent is due",
            "Shares always rise in a month",
            "It's a perfectly safe plan",
            "Rent money grows fastest in shares",
          ],
          correct: 0,
          feedback: {
            correct: "Right. One-month money must be certain. Shares can fall in any given month, and he can't risk being short on rent to chase a small gain.",
            incorrect: "It's a timeline mismatch: essential money he needs in a month can't ride market swings. Keep it in cash or a savings account.",
          },
        },
      },
    ],
  },
  {
    slotId: "investing-basics/lesson-4/long-can-risk",
    conceptId: "time-horizon",
    variants: [
      {
        variantId: "lcr-two-friends",
        step: {
          type: "scenario",
          question: "Two friends invest R500/month. One needs it in 4 years for relocation; the other only after 20 years for retirement. Who can more reasonably accept bigger equity swings?",
          options: [
            "The 20-year friend",
            "The 4-year friend",
            "Neither of them",
            "Only high earners",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Longer timelines absorb dips far better. Provided behaviour stays steady. Time is the cushion that makes volatility tolerable.",
            incorrect: "The 20-year friend. A long horizon can ride out crashes; a 4-year goal has much less room to recover.",
          },
        },
      },
      {
        variantId: "lcr-tf",
        step: {
          type: "true-false",
          statement: "A longer horizon lets you tolerate more short-term ups and downs, as long as you don't panic-sell.",
          correct: true,
          feedback: {
            correct: "True. Time only helps if you stay invested. The mistake isn't the dip. It's selling into it and missing the recovery.",
            incorrect: "It's true, but the catch is behaviour. A long horizon absorbs volatility only if you hold through the dips instead of panic-selling.",
          },
        },
      },
      {
        variantId: "lcr-behaviour-mcq",
        step: {
          type: "mcq",
          question: "For a long-term investor, the biggest risk in a market crash is often:",
          options: [
            "Panic-selling and locking in the loss",
            "The market never recovering, guaranteed",
            "Being charged tax on the dip",
            "Nothing, crashes don't matter",
          ],
          correct: 0,
          feedback: {
            correct: "Right. History shows markets tend to recover; the permanent damage usually comes from selling in fear at the bottom.",
            incorrect: "The real danger is behavioural: selling in panic turns a temporary dip into a permanent loss. Staying invested is the hard part.",
          },
        },
      },
    ],
  },
  {
    slotId: "investing-basics/lesson-4/match-tool",
    conceptId: "time-horizon",
    variants: [
      {
        variantId: "mt-define-mcq",
        step: {
          type: "mcq",
          question: "What is your 'time horizon' for a goal?",
          options: [
            "How long until you need the money",
            "How risky you happen to feel today",
            "The current interest rate",
            "Your age exactly in years",
          ],
          correct: 0,
          feedback: {
            correct: "Right. It's simply when you need the money. Short horizons favour stability; long horizons can carry more growth assets.",
            incorrect: "Time horizon is the distance to when you'll spend the money. It, more than your mood, should drive how much risk you take.",
          },
        },
      },
      {
        variantId: "mt-buckets-tf",
        step: {
          type: "true-false",
          statement: "It helps to date-stamp each goal and match its investment to how far away it is.",
          correct: true,
          feedback: {
            correct: "True. A 1-year goal, a 5-year goal and a 30-year goal each deserve different risk. Labelling the date stops you mismatching them.",
            incorrect: "It's true: assigning a date to each goal lets you match the risk to the timeline, instead of treating all your money the same.",
          },
        },
      },
      {
        variantId: "mt-review-scenario",
        step: {
          type: "scenario",
          question: "Nomsa's goal that was 6 years away is now only 18 months away. What should she reconsider?",
          options: [
            "Dialling down risk",
            "Taking more risk to catch up",
            "Nothing, the plan never changes",
            "Moving it all into one hot share",
          ],
          correct: 0,
          feedback: {
            correct: "Right. As a goal gets closer, its horizon shortens, so it makes sense to move toward stability and protect what she's built.",
            incorrect: "As the date nears, she should reduce risk, not increase it. There's little time left to recover from a bad patch.",
          },
        },
      },
    ],
  },
];

const lesson4Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "When Do You Need the Money?",
    content:
      "<p>Anele saved R40 000 in a notice account for a car deposit nine months away. Her colleague put the same amount in volatile single shares for the same goal. When prices dipped 18%, only one of them could still buy the car without delay.</p><p>Time horizon is the gap between today and when you must spend the money. Under two years usually favours stability; five years or more can carry more growth assets, if you won't panic-sell. Mixing up timelines is how people sell low right before prices recover.</p>",
  },
  { slot: "investing-basics/lesson-4/short-need" },
  { slot: "investing-basics/lesson-4/volatile-mismatch" },
  { slot: "investing-basics/lesson-4/long-can-risk" },
  { slot: "investing-basics/lesson-4/match-tool" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 5 · "What Are Stocks?"
// ═══════════════════════════════════════════════════════════════════════════

const lesson5Slots: QuestionSlot[] = [
  {
    slotId: "investing-basics/lesson-5/own-slice",
    conceptId: "jse-basics",
    variants: [
      {
        variantId: "os-tf",
        step: {
          type: "true-false",
          statement: "Owning one share means you own a small part of that company.",
          correct: true,
          feedback: {
            correct: "True. A share is part-ownership (equity) in the business, usually with voting and dividend rights, not a loan to the company.",
            incorrect: "It's true. A share is a slice of ownership in the company, not a loan. That's the difference between shares (equity) and bonds (debt).",
          },
        },
      },
      {
        variantId: "os-what-mcq",
        step: {
          type: "mcq",
          question: "When you buy a share on the JSE, what are you buying?",
          options: [
            "Part-ownership of a listed company",
            "A loan you've made to the government",
            "A savings account",
            "An insurance policy",
          ],
          correct: 0,
          feedback: {
            correct: "Right. You own a slice of the company. If it grows and pays dividends, you can gain; if it struggles, your slice can lose value.",
            incorrect: "You're buying part-ownership of the company. That's equity, different from lending (bonds) or saving (a deposit).",
          },
        },
      },
      {
        variantId: "os-gain-scenario",
        step: {
          type: "scenario",
          question: "The company Sipho owns shares in grows profits for years and pays dividends. How might he benefit?",
          options: [
            "From a rising price and dividends",
            "Only if he sells them immediately",
            "He can't benefit from shares",
            "Only through his salary",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Shareholders can earn two ways: the price rising over time, and dividends paid from profits when the board declares them.",
            incorrect: "He can gain from both price growth and dividends. Owning a slice of a growing, dividend-paying company rewards you two ways.",
          },
        },
      },
    ],
  },
  {
    slotId: "investing-basics/lesson-5/dividend",
    conceptId: "jse-basics",
    variants: [
      {
        variantId: "dv-what",
        step: {
          type: "mcq",
          question: "Cash a listed company pays its shareholders from profits is called a:",
          options: ["Dividend", "PAYE refund", "Debit order", "UIF payout"],
          correct: 0,
          feedback: {
            correct: "Right. A dividend is a share of profits paid to owners when the board declares one: a reward for holding the shares.",
            incorrect: "It's a dividend. Profits shared with owners. It's not a tax refund, a bank charge or a UIF benefit.",
          },
        },
      },
      {
        variantId: "dv-not-guaranteed-tf",
        step: {
          type: "true-false",
          statement: "Dividends are only paid when a company's board decides to declare them.",
          correct: true,
          feedback: {
            correct: "True. Dividends aren't guaranteed. A company can cut or skip them, for example to reinvest or during hard times.",
            incorrect: "It's true. Dividends depend on the board's decision. They can be reduced or skipped, so they're not a fixed, guaranteed income.",
          },
        },
      },
      {
        variantId: "dv-source-mcq",
        step: {
          type: "mcq",
          question: "Where do dividends come from?",
          options: [
            "The company's profits",
            "A government grant",
            "Your own bank fees",
            "The JSE building fund",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Dividends are paid out of profits the company has made. No profit (or a decision to reinvest) can mean no dividend.",
            incorrect: "They come from company profits, distributed to shareholders. Not from the government, the JSE or your fees.",
          },
        },
      },
    ],
  },
  {
    slotId: "investing-basics/lesson-5/etf-beginner",
    conceptId: "etf",
    variants: [
      {
        variantId: "eb-why",
        step: {
          type: "mcq",
          question: "Why might a diversified equity ETF be easier for a beginner than picking three individual shares?",
          options: [
            "It spreads your money across many companies",
            "ETFs always pay higher returns every year",
            "ETFs never fall in price",
            "SARS forbids buying individual shares",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A broad ETF dilutes company-specific risk across dozens or hundreds of holdings, it doesn't guarantee profit, but one bad pick won't sink you.",
            incorrect: "The benefit is spreading risk across many companies. ETFs still rise and fall; they just don't hang on any single firm's fate.",
          },
        },
      },
      {
        variantId: "eb-what-tf",
        step: {
          type: "true-false",
          statement: "An equity ETF typically holds many companies at once, in a single investment.",
          correct: true,
          feedback: {
            correct: "True. One ETF can hold dozens or hundreds of companies, giving instant diversification without picking each share yourself.",
            incorrect: "It's true, a single ETF bundles many companies together, which is exactly why it's a simple way to diversify.",
          },
        },
      },
      {
        variantId: "eb-fees-scenario",
        step: {
          type: "scenario",
          question: "Before buying an ETF, Lerato checks its factsheet. Which detail matters most for her long-term returns?",
          options: [
            "The fee (total expense ratio)",
            "The colour of the logo",
            "Whether a friend mentioned it",
            "The provider's advert",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Over decades, even a small difference in fees compounds into a lot. Always find the total expense ratio before investing.",
            incorrect: "It's the fee (total expense ratio). Small fee differences compound hugely over time, so it's the detail that matters most long-term.",
          },
        },
      },
    ],
  },
  {
    slotId: "investing-basics/lesson-5/normal-risk",
    conceptId: "jse-basics",
    variants: [
      {
        variantId: "nr-tf",
        step: {
          type: "true-false",
          statement: "If a share you own loses value because the business struggled, that's normal market behaviour, not necessarily fraud.",
          correct: true,
          feedback: {
            correct: "True. Share prices rise and fall with a company's fortunes. A loss can be ordinary risk, different from a scam, which promises what markets can't.",
            incorrect: "It's true. Shares can fall when a business struggles. That's normal risk, not fraud. Scams are the ones promising guaranteed, risk-free returns.",
          },
        },
      },
      {
        variantId: "nr-expectation-mcq",
        step: {
          type: "mcq",
          question: "What's a realistic expectation when investing in shares?",
          options: [
            "Values go up AND down",
            "The price only ever goes up",
            "You'll double your money each year",
            "There's no risk if you buy good companies",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Shares are volatile in the short term but have historically grown over the long term. Expecting a smooth ride sets you up to panic.",
            incorrect: "Expect ups and downs. Shares grow over the long run, not smoothly, and no good company is immune to price falls.",
          },
        },
      },
      {
        variantId: "nr-panic-scenario",
        step: {
          type: "scenario",
          question: "Thabo's ETF drops 15% in a bad month and he wants to sell everything. For a long-term investor, what's usually wiser?",
          options: [
            "Hold through the dip",
            "Sell immediately to avoid more loss",
            "Buy a single hot share instead",
            "Never invest again",
          ],
          correct: 0,
          feedback: {
            correct: "Right. For a long horizon, a 15% dip is normal volatility. Selling turns a paper loss into a real one and misses the recovery.",
            incorrect: "For a long-term investor, holding through normal dips is usually wiser. Panic-selling locks in the loss and forfeits the rebound.",
          },
        },
      },
    ],
  },
];

const lesson5Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "A Small Slice of a Company",
    content:
      "<p>When you buy a share on the JSE, you buy part-ownership of a listed company. If it grows profits and pays dividends, you can earn from both a rising price and the payouts. If the business struggles, your slice can lose value. That's normal market behaviour, not necessarily fraud.</p><p>Many beginners start with broad ETFs holding dozens or hundreds of companies, so one bad decision at one firm doesn't dominate the outcome. Outside a TFSA you still pay tax, so wrapping long-term equity ETFs inside your annual TFSA limit can make sense when the rules allow.</p>",
  },
  { slot: "investing-basics/lesson-5/own-slice" },
  { slot: "investing-basics/lesson-5/dividend" },
  { slot: "investing-basics/lesson-5/etf-beginner" },
  { slot: "investing-basics/lesson-5/normal-risk" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 6 · "Understanding Bonds"
// ═══════════════════════════════════════════════════════════════════════════

const lesson6Slots: QuestionSlot[] = [
  {
    slotId: "investing-basics/lesson-6/lender",
    conceptId: "bonds",
    variants: [
      {
        variantId: "ld-what",
        step: {
          type: "mcq",
          question: "In simple terms, someone who holds a bond is mostly:",
          options: [
            "A lender expecting interest back",
            "A part-owner with voting rights",
            "Guaranteed to beat inflation yearly",
            "Insured against all losses by the SARB",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A bond is debt: you lend to a government or company, and they promise interest plus your principal back at maturity.",
            incorrect: "A bondholder is a lender, not an owner. Ownership is shares (equity); lending is bonds (debt).",
          },
        },
      },
      {
        variantId: "ld-vs-shares-tf",
        step: {
          type: "true-false",
          statement: "Buying a bond makes you a lender, while buying a share makes you a part-owner.",
          correct: true,
          feedback: {
            correct: "True. That's the core difference: bonds are loans that pay interest; shares are ownership that can pay dividends and grow.",
            incorrect: "It's true, bonds = lending (debt), shares = owning (equity). It's the fundamental distinction between the two.",
          },
        },
      },
      {
        variantId: "ld-maturity-mcq",
        step: {
          type: "mcq",
          question: "What does a bond issuer promise you?",
          options: [
            "Regular interest, and your principal back at maturity",
            "A share of company profits forever",
            "Guaranteed growth above inflation",
            "Free insurance on your other investments",
          ],
          correct: 0,
          feedback: {
            correct: "Right. You get scheduled interest and, at the end of the term, your original amount back. Assuming the issuer can pay.",
            incorrect: "A bond promises interest plus return of your principal at maturity. It's a loan contract, not profit-sharing or a guarantee to beat inflation.",
          },
        },
      },
    ],
  },
  {
    slotId: "investing-basics/lesson-6/rates-and-prices",
    conceptId: "bonds",
    variants: [
      {
        variantId: "rp-tf",
        step: {
          type: "true-false",
          statement: "When interest rates rise sharply, the prices of many existing bonds tend to fall.",
          correct: true,
          feedback: {
            correct: "True. New bonds pay the higher rate, so older bonds paying less become less attractive. Buyers will only take them at a lower price.",
            incorrect: "It's true. When rates rise, older lower-rate bonds look worse, so their prices drop. Rate moves and bond prices pull in opposite directions.",
          },
        },
      },
      {
        variantId: "rp-why-mcq",
        step: {
          type: "mcq",
          question: "Why do existing bond prices fall when interest rates rise?",
          options: [
            "New bonds pay more",
            "Because bonds are scams",
            "Because the Reserve Bank confiscates them",
            "They don't. Bond prices never move",
          ],
          correct: 0,
          feedback: {
            correct: "Right. If new bonds offer a better rate, nobody pays full price for your older, lower-paying one, so its market price drops.",
            incorrect: "It's supply and demand: higher new rates make older, lower-rate bonds less attractive, so their prices fall to compensate.",
          },
        },
      },
      {
        variantId: "rp-riskfree-tf",
        step: {
          type: "true-false",
          statement: "Bonds are completely risk-free investments.",
          correct: false,
          feedback: {
            correct: "Correct. Bonds are calmer than shares but not risk-free. The issuer can struggle to pay, and prices move when interest rates change.",
            incorrect: "They aren't risk-free. An issuer can default, and bond prices fall when rates rise. Calmer than shares, but not zero risk.",
          },
        },
      },
    ],
  },
  {
    slotId: "investing-basics/lesson-6/vs-equity",
    conceptId: "bonds",
    variants: [
      {
        variantId: "ve-role-mcq",
        step: {
          type: "mcq",
          question: "What role do bonds often play in a portfolio?",
          options: [
            "They steady the ride when shares fall",
            "They always outperform shares over time",
            "They remove all of the risk",
            "They replace the need to save",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Bonds tend to be calmer than shares, so they cushion a portfolio in downturns. The trade-off is usually lower growth over decades.",
            incorrect: "Bonds add stability, cushioning share falls, typically in exchange for lower long-term returns. They don't beat shares or remove risk.",
          },
        },
      },
      {
        variantId: "ve-calmer-tf",
        step: {
          type: "true-false",
          statement: "Over long periods, bonds usually deliver lower returns than shares but with a calmer ride.",
          correct: true,
          feedback: {
            correct: "True. That calmness is the point: bonds trade some growth for stability, which is why many portfolios blend both.",
            incorrect: "It's true. Bonds generally grow less than shares over decades, but move less violently. Many investors hold both for balance.",
          },
        },
      },
      {
        variantId: "ve-blend-scenario",
        step: {
          type: "scenario",
          question: "Nomsa wants less drama than pure shares but can still wait several years. A sensible option to research first is:",
          options: [
            "A balanced fund mixing bonds and shares",
            "A leveraged currency trade from WhatsApp",
            "Cash under the bed forever",
            "Borrowing to buy jewellery",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Balanced funds exist exactly for moderate timelines and temperaments, a professionally-set mix of shares and bonds.",
            incorrect: "A balanced/multi-asset fund fits her goal, a set mix of shares and bonds. Chat-app schemes and cash-under-the-bed don't.",
          },
        },
      },
    ],
  },
  {
    slotId: "investing-basics/lesson-6/access",
    conceptId: "bonds",
    variants: [
      {
        variantId: "ac-how-mcq",
        step: {
          type: "mcq",
          question: "How do most everyday South African investors usually access bonds?",
          options: [
            "Through unit trusts, bond ETFs, or bank fixed products",
            "By printing their own bond certificates",
            "Only by lending cash to friends",
            "You can't access bonds in SA",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Rather than buying individual bond certificates, most retail investors use bond funds, ETFs, or fixed products: simpler and diversified.",
            incorrect: "Most people use unit trusts, bond ETFs or bank fixed products, not individual certificates. It's the practical, diversified route.",
          },
        },
      },
      {
        variantId: "ac-rsa-tf",
        step: {
          type: "true-false",
          statement: "Comparing a bond fund's yield with a high-interest savings rate is a reasonable thing to do before choosing.",
          correct: true,
          feedback: {
            correct: "True. Compare the numbers, how long each is fixed for, and any early-withdrawal penalties. That's how you judge which suits your goal.",
            incorrect: "It's true, comparing yields, fixed terms and penalties across options is exactly how to choose sensibly between them.",
          },
        },
      },
      {
        variantId: "ac-source-scenario",
        step: {
          type: "scenario",
          question: "Sipho wants to compare bond and savings options. Where should he get the numbers?",
          options: [
            "Official provider sites or apps",
            "Whatever a WhatsApp group forwards",
            "A random social media tip",
            "He shouldn't compare at all",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Use licensed providers' own .co.za sites or apps for real rates and terms. Forwarded screenshots are how scams spread.",
            incorrect: "Get numbers from official, licensed sources, not forwarded screenshots or social tips, which are prime scam territory.",
          },
        },
      },
    ],
  },
];

const lesson6Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Lending, Not Owning",
    content:
      "<p>A government or company bond is a loan you give in return for interest and your principal back at maturity. Stable bonds can steady a portfolio when shares fall, but they're not risk-free if the issuer struggles or interest rates move sharply.</p><p>In SA, everyday investors usually access bonds through unit trusts, bond ETFs, or bank fixed products rather than buying individual certificates. Expected returns are usually lower than shares over decades, but the ride is calmer.</p>",
  },
  { slot: "investing-basics/lesson-6/lender" },
  { slot: "investing-basics/lesson-6/rates-and-prices" },
  { slot: "investing-basics/lesson-6/vs-equity" },
  { slot: "investing-basics/lesson-6/access" },
];

export const INVESTING_BASICS_BANKS: Record<string, LessonBank> = {
  "investing-basics::lesson-1": { layout: lesson1Layout, slots: lesson1Slots },
  "investing-basics::lesson-2": { layout: lesson2Layout, slots: lesson2Slots },
  "investing-basics::lesson-3": { layout: lesson3Layout, slots: lesson3Slots },
  "investing-basics::lesson-4": { layout: lesson4Layout, slots: lesson4Slots },
  "investing-basics::lesson-5": { layout: lesson5Layout, slots: lesson5Slots },
  "investing-basics::lesson-6": { layout: lesson6Layout, slots: lesson6Slots },
};
