import type { LessonLayoutItem, QuestionSlot } from "@/data/content";

/**
 * Bank for Money Basics · Lesson 1 · "What is Money?"
 *
 * Authored to docs/QUESTION-VOICE-GUIDE.md. Every slot below teaches ONE
 * concept through several genuinely different scenarios (not reworded twins),
 * so two learners — or one on a repeat — rarely meet the same phrasing.
 * Concepts are tagged for spaced-repetition resurface.
 */

export type LessonBank = { layout: LessonLayoutItem[]; slots: QuestionSlot[] };

const lesson1Slots: QuestionSlot[] = [
  // ── Slot: why money beats barter ────────────────────────────────────────
  {
    slotId: "money-basics/lesson-1/barter",
    conceptId: "money-functions",
    variants: [
      {
        variantId: "barter-double-coincidence",
        step: {
          type: "mcq",
          question:
            "Before money, people bartered. Swapping a goat for maize. What's the main problem money solves?",
          options: [
            "You have to find someone who wants what you have AND has what you want",
            "Goats are heavy to carry to the market",
            "Maize goes off before you can trade it",
            "Nothing. Barter actually works better than money",
          ],
          correct: 0,
          feedback: {
            correct:
              "Exactly. Barter needs a 'double coincidence of wants'. Money removes that. Anyone will take it, so trade gets easy.",
            incorrect:
              "The real snag with barter is the double coincidence of wants: both people must want what the other offers. Money fixes that.",
          },
        },
      },
      {
        variantId: "barter-hairdresser",
        step: {
          type: "scenario",
          question:
            "A hairdresser wants bread, but the baker doesn't want a haircut. How does money still let her eat?",
          options: [
            "She's paid money for haircuts, then buys bread from the baker",
            "She must first find a baker who needs a haircut",
            "She goes without bread until someone wants a haircut",
            "She swaps hair products for flour instead",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. Money is the middle step: earn it from anyone, spend it on anyone. No matching of wants required.",
            incorrect:
              "Money breaks the chain: she earns it cutting hair and spends it on bread. The baker never has to want a haircut.",
          },
        },
      },
      {
        variantId: "barter-medium-tf",
        step: {
          type: "true-false",
          statement:
            "Money works as a 'medium of exchange' because almost everyone accepts it, so you don't need a direct swap.",
          correct: true,
          feedback: {
            correct:
              "True. Because everyone takes money, it slots between any two trades. That's what 'medium of exchange' means.",
            incorrect:
              "That's exactly right, so the answer is true: money is accepted by everyone, so it stands in for a direct swap.",
          },
        },
      },
    ],
  },
  // ── Slot: the three functions of money ──────────────────────────────────
  {
    slotId: "money-basics/lesson-1/functions",
    conceptId: "money-functions",
    variants: [
      {
        variantId: "functions-not-a-function",
        step: {
          type: "mcq",
          question:
            "Money does three real jobs for you. Which of these is NOT one of them?",
          options: [
            "Medium of exchange",
            "Store of value",
            "Making you happy",
            "Unit of account",
          ],
          correct: 2,
          feedback: {
            correct:
              "Right. Money can buy things that make you happy, but that's not a function of money itself. Its three jobs are: swapping for goods, holding value over time, and measuring worth.",
            incorrect:
              "That one IS a real function. The odd one out is 'making you happy'. Money's actual jobs are medium of exchange, store of value, and unit of account.",
          },
        },
      },
      {
        variantId: "functions-unit-of-account",
        step: {
          type: "mcq",
          question:
            "At the shop a loaf of bread is R18 and a litre of milk is R22, so you can instantly tell the milk costs more. Which function of money are you using?",
          options: [
            "Unit of account",
            "Store of value",
            "Medium of exchange",
            "Earning interest",
          ],
          correct: 0,
          feedback: {
            correct:
              "Exactly. When money lets you measure and compare the worth of different things, it's acting as a unit of account.",
            incorrect:
              "You're comparing prices, not paying or saving. Money that lets you measure and compare worth is acting as a unit of account.",
          },
        },
      },
      {
        variantId: "functions-store-of-value",
        step: {
          type: "scenario",
          question:
            "Nomsa gets paid on the 25th but only does her big grocery shop on the 30th. The money is still worth roughly the same when she spends it. Which function made that possible?",
          options: [
            "Store of value",
            "Medium of exchange",
            "Unit of account",
            "Compound interest",
          ],
          correct: 0,
          feedback: {
            correct:
              "Yes. Money holding its worth from payday until she spends it is money acting as a store of value. (Inflation slowly chips at this, which is why cash isn't a great long-term store.)",
            incorrect:
              "She's holding money over time, not comparing or swapping it yet. Money keeping its worth between payday and spending is a store of value.",
          },
        },
      },
    ],
  },

  // ── Slot: inflation erodes cash ─────────────────────────────────────────
  {
    slotId: "money-basics/lesson-1/inflation",
    conceptId: "inflation",
    variants: [
      {
        variantId: "inflation-mattress",
        step: {
          type: "mcq",
          question:
            "Inflation in SA is running near 5%. You keep R1 000 as cash in a tin for a year. What's actually true a year later?",
          options: [
            "It grows to about R1 050",
            "It still says R1 000 but buys about R950 worth of goods",
            "It loses R50 in notes you can physically see missing",
            "Nothing changes. R1 000 is R1 000",
          ],
          correct: 1,
          feedback: {
            correct:
              "Spot on. The notes still read R1 000, but at 5% inflation they buy roughly R950 worth of the same goods. Cash that earns nothing quietly loses ground every year.",
            incorrect:
              "The rands don't grow or vanish. Their buying power shrinks. At 5% inflation, R1 000 buys about R950 worth of goods a year later.",
          },
        },
      },
      {
        variantId: "inflation-sarb-band",
        step: {
          type: "mcq",
          title: "The Reserve Bank's target",
          question:
            "What inflation rate does the South African Reserve Bank aim for?",
          options: [
            "3%, with a tolerance band of one percentage point either side",
            "Between 3% and 6%",
            "As close to 0% as possible",
            "Whatever the Minister of Finance sets each month",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. SA now runs a 3% point target with a ±1 percentage point band, it replaced the old 3–6% range. Run hotter than that and the SARB usually raises the repo rate to cool things down.",
            incorrect:
              "It's a 3% point target with a ±1 percentage point tolerance band. The old 3–6% range is out of date.",
          },
        },
      },
      {
        variantId: "inflation-real-wage",
        step: {
          type: "true-false",
          statement:
            "Your salary goes up 4% this year, but inflation was 6%. You can afford more than you could last year.",
          correct: false,
          feedback: {
            correct:
              "False, and this is the trap. A 4% raise against 6% inflation is a 2% cut in what you can actually buy. A 'raise' that's really a pay cut in real terms.",
            incorrect:
              "Compare the two: 4% more money, 6% higher prices. That's a 2% loss in buying power. You can afford slightly less, not more.",
          },
        },
      },
    ],
  },

  // ── Slot: spend / save / invest ─────────────────────────────────────────
  {
    slotId: "money-basics/lesson-1/spend-save-invest",
    conceptId: "saving-vs-investing",
    variants: [
      {
        variantId: "ssi-three-jobs",
        step: {
          type: "mcq",
          question:
            "Money has three jobs: spend (survive today), save (protect yourself), invest (grow your future). Most South Africans only ever do the first. What's the core risk of spend-only?",
          options: [
            "You pay too much tax",
            "You never build anything that grows or protects you. One emergency wipes you out",
            "Your bank closes your account",
            "You get better at budgeting automatically",
          ],
          correct: 1,
          feedback: {
            correct:
              "Yes. Spending everything leaves no buffer and nothing compounding, which is why 77% of South Africans can't replace even one month's income from savings.",
            incorrect:
              "Spend-only isn't mainly a tax or bank problem. It's that you build no cushion and nothing that grows. One emergency can undo you.",
          },
        },
      },
      {
        variantId: "ssi-save-vs-invest",
        step: {
          type: "mcq",
          question:
            "Lerato keeps 3 months' expenses in an easy-access account for emergencies, and puts separate money into an ETF for 15 years' time. Which is 'saving' and which is 'investing'?",
          options: [
            "Emergency account = saving; ETF = investing",
            "Both are saving",
            "Emergency account = investing; ETF = saving",
            "Both are investing",
          ],
          correct: 0,
          feedback: {
            correct:
              "Exactly. Saving is money you keep safe and reachable for the short term; investing is money you deliberately put at some risk to grow over years.",
            incorrect:
              "Saving = safe and reachable soon (her emergency account). Investing = growing over years with some risk (her ETF). They're different jobs.",
          },
        },
      },
      {
        variantId: "ssi-idle-account",
        step: {
          type: "scenario",
          question:
            "Sipho keeps all R60 000 of his savings in a cheque account paying 0% interest 'to be safe'. Inflation averages 5%. What's really happening to that money?",
          options: [
            "It's the safest possible choice with no downside",
            "It's slowly losing buying power every year, about R3 000 worth in year one",
            "It's growing tax-free",
            "It doubles roughly every 10 years",
          ],
          correct: 1,
          feedback: {
            correct:
              "Right. 'Safe' from theft, but not from inflation. At 5% he loses about R3 000 of buying power in the first year alone. Even a savings or money-market account earning interest would slow the bleed.",
            incorrect:
              "0% interest against 5% inflation means his R60 000 buys about R3 000 less each year. Cash sitting idle isn't safe from inflation.",
          },
        },
      },
    ],
  },
];

const lesson1Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Money Is More Than Cash",
    content:
      "<p>Most people work 40+ years and retire with almost nothing, not because they earned too little, but because they never understood the system their money lives in.</p><p>Money has three jobs: <strong>Spend</strong> (survive today), <strong>Save</strong> (protect yourself), <strong>Invest</strong> (build your future). Most South Africans only do the first, and that's why 77% can't replace a single month's income from savings.</p>",
  },
  {
    type: "info",
    title: "The Three Jobs of Money",
    content:
      "<p>Beyond spending, money does three technical jobs:</p><ul><li><strong>Medium of exchange:</strong> you swap it for what you need instead of bartering</li><li><strong>Store of value:</strong> you can hold it today and spend it later</li><li><strong>Unit of account:</strong> it lets you measure and compare what things are worth</li></ul>",
  },
  { slot: "money-basics/lesson-1/functions" },
  { slot: "money-basics/lesson-1/barter" },
  {
    type: "info",
    title: "Why Money Loses Value",
    content:
      "<p>Notice how R100 buys less than it did a few years ago? That's <strong>inflation</strong>. The general rise in prices over time. The Reserve Bank aims to keep it at <strong>3% a year, give or take one percentage point</strong>.</p><p>This is why cash under the mattress is a slow leak: it loses buying power every single year.</p>",
  },
  { slot: "money-basics/lesson-1/inflation" },
  { slot: "money-basics/lesson-1/spend-save-invest" },
  {
    type: "action",
    title: "Name your three jobs",
    instruction:
      "Open your banking app. Look at where your money went last month and roughly split it into spend, save, and invest. Most people find 100% in 'spend'. That's your starting line, not a failure.",
    tip: "You can't fix what you can't see. Even a rough split beats guessing.",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 2 · "Needs vs Wants"
// ═══════════════════════════════════════════════════════════════════════════

const lesson2Slots: QuestionSlot[] = [
  {
    slotId: "money-basics/lesson-2/want-in-disguise",
    conceptId: "needs-vs-wants",
    variants: [
      {
        variantId: "disguise-car",
        step: {
          type: "scenario",
          question:
            "Ayesha wants a R1 200/month car upgrade because her current car feels 'embarrassing', though it still runs fine and gets her to work. Need or want?",
          options: [
            "A want dressed up as a need. The current car already does the job",
            "A genuine need, because image matters at work",
            "A need if her colleagues drive nicer cars",
            "Impossible to tell",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. If the current car still gets her to work, the upgrade is a want. Feelings can make a want feel urgent. That's the trap.",
            incorrect:
              "The test is function: her car still works, so the upgrade is a want. 'Embarrassing' is a feeling, not a need.",
          },
        },
      },
      {
        variantId: "disguise-sign",
        step: {
          type: "mcq",
          question: "What's the clearest sign a 'need' is actually a want?",
          options: [
            "A cheaper option would do the same job",
            "It costs money",
            "You'd use it every day",
            "It shows up on your bank statement",
          ],
          correct: 0,
          feedback: {
            correct:
              "Exactly. If a cheaper version solves the same problem, the extra you're paying is buying a want, not a need.",
            incorrect:
              "The giveaway is a cheaper option that does the same job. Choosing the pricier one is where the want hides.",
          },
        },
      },
      {
        variantId: "disguise-phone-tf",
        step: {
          type: "true-false",
          statement:
            "A smartphone can be a need and a want at once: a R2 500 phone for work is the need, the R20 000 upgrade is the want.",
          correct: true,
          feedback: {
            correct:
              "True. The function (a working phone) is the need; the premium above 'good enough' is the want. Same item, two parts.",
            incorrect:
              "It's true. The basic working phone is the need, and everything you pay above that for the upgrade is the want.",
          },
        },
      },
    ],
  },
  {
    slotId: "money-basics/lesson-2/need-or-want",
    conceptId: "needs-vs-wants",
    variants: [
      {
        variantId: "now-groceries",
        step: {
          type: "mcq",
          question: "Which of these is a NEED, not a want?",
          options: [
            "Uncapped fibre for gaming",
            "Groceries for the month",
            "A weekend away in Ballito",
            "The latest iPhone on contract",
          ],
          correct: 1,
          feedback: {
            correct:
              "Right. Food is survival. A true need. The others are things you'd like, but you'd survive the month without them.",
            incorrect:
              "A need is something you can't survive or earn without. Only the month's groceries fits. The rest are wants.",
          },
        },
      },
      {
        variantId: "now-transport",
        step: {
          type: "scenario",
          question:
            "Sipho's car dies and he has to get to work on Monday. Which of these is the actual NEED?",
          options: [
            "Taxi fare to get to work",
            "A DStv Premium subscription",
            "New rims for the car",
            "AirPods for the commute",
          ],
          correct: 0,
          feedback: {
            correct:
              "Exactly. Transport to earn your income is a need. The rest are comforts he can skip until the car's sorted.",
            incorrect:
              "The need is whatever lets him keep earning. Taxi fare to work. Rims, AirPods and DStv are wants.",
          },
        },
      },
      {
        variantId: "now-gym-tf",
        step: {
          type: "true-false",
          statement:
            "A paid gym contract counts as a 'need' because staying healthy is important.",
          correct: false,
          feedback: {
            correct:
              "Correct. Health matters, but a paid gym is a want. You can walk, run or train for free. Needs are survival and earning essentials.",
            incorrect:
              "Being healthy is important, but the gym contract itself is a want. You can stay fit without paying, so it's not a need.",
          },
        },
      },
    ],
  },
  {
    slotId: "money-basics/lesson-2/fifty-thirty-twenty",
    conceptId: "budgeting-50-30-20",
    variants: [
      {
        variantId: "ftt-wants-left",
        step: {
          type: "scenario",
          question:
            "You take home R18 000. Needs cost R11 000 and you want to save R3 000. How much is left for wants?",
          options: ["R7 000", "R4 000", "R5 000", "R6 000"],
          correct: 1,
          feedback: {
            correct: "Spot on: R18 000 − R11 000 − R3 000 = R4 000 for wants.",
            incorrect:
              "Take income, subtract needs, then savings: R18 000 − R11 000 − R3 000 = R4 000.",
          },
        },
      },
      {
        variantId: "ftt-savings-fill",
        step: {
          type: "fill-blank",
          title: "The 20% share",
          prompt:
            "Under 50/30/20, someone taking home R20 000 a month should aim to save about R____ (the 20%).",
          correct: 4000,
          feedback: {
            correct: "Correct. 20% of R20 000 is R4 000 toward savings and debt.",
            incorrect: "20% of R20 000 = R4 000. That's the savings slice.",
          },
        },
      },
      {
        variantId: "ftt-which-need",
        step: {
          type: "mcq",
          question:
            "Under 50/30/20, which of these belongs in the 50% 'needs' bucket?",
          options: [
            "Taxi fare to work",
            "Friday-night takeaways",
            "A new PlayStation game",
            "A weekend of clubbing",
          ],
          correct: 0,
          feedback: {
            correct:
              "Yes. Getting to work is a need. It's how you earn. The other three are wants that live in the 30%.",
            incorrect:
              "Needs are the non-negotiables like transport to work. Takeaways, games and clubbing are wants.",
          },
        },
      },
    ],
  },
  {
    slotId: "money-basics/lesson-2/lifestyle-creep",
    conceptId: "saving-vs-investing",
    variants: [
      {
        variantId: "creep-raise-tf",
        step: {
          type: "true-false",
          statement:
            "It's fine to upgrade some wants when you earn more: as long as your savings go up too.",
          correct: true,
          feedback: {
            correct:
              "True. Enjoying a raise is fine if saving rises with it. A good habit: bank at least half of any increase before lifestyle catches up.",
            incorrect:
              "You're allowed to enjoy a raise. The rule is that savings must climb too. Try to save at least half of any increase.",
          },
        },
      },
      {
        variantId: "creep-lerato",
        step: {
          type: "scenario",
          question: "Lerato gets a R2 000 raise. What's the healthiest move?",
          options: [
            "Put at least R1 000 toward savings and enjoy the rest",
            "Spend the whole R2 000 on a nicer flat",
            "Take on a new R2 000 car instalment",
            "Ignore it. Keep everything exactly the same",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. Banking at least half the raise builds wealth while still letting her enjoy some of it.",
            incorrect:
              "Spending the entire raise is lifestyle creep. The healthiest move is to save at least half and enjoy the rest.",
          },
        },
      },
      {
        variantId: "creep-definition",
        step: {
          type: "mcq",
          question: "What does 'lifestyle creep' mean?",
          options: [
            "Your spending quietly rises to match every raise",
            "A monthly bank fee that increases each year",
            "Inflation that only affects luxury goods",
            "Saving so hard that you can't enjoy anything",
          ],
          correct: 0,
          feedback: {
            correct:
              "Exactly. When spending grows to swallow every raise, your income goes up but your savings don't. That's the trap.",
            incorrect:
              "Lifestyle creep is when spending rises to match each raise, so more income never turns into more savings.",
          },
        },
      },
    ],
  },
];

const lesson2Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "The Most Important Distinction",
    content:
      "<p>If you treat wants like needs, you'll feel broke no matter how much you earn. This isn't about income. It's about priority.</p><p><strong>Needs</strong> are non-negotiable survival: food, shelter, transport to earn income. <strong>Wants</strong> are everything else. The line between them is where most South African household budgets collapse.</p>",
  },
  { slot: "money-basics/lesson-2/need-or-want" },
  {
    type: "info",
    title: "The 50/30/20 Rule",
    content:
      "<p>A simple budgeting framework:</p><ul><li><strong>50% Needs:</strong> rent, transport, groceries</li><li><strong>30% Wants:</strong> entertainment, eating out</li><li><strong>20% Savings:</strong> emergency fund, investments, debt</li></ul><p>Take home R20 000? That's R10k needs, R6k wants, R4k savings.</p>",
  },
  { slot: "money-basics/lesson-2/fifty-thirty-twenty" },
  { slot: "money-basics/lesson-2/lifestyle-creep" },
  { slot: "money-basics/lesson-2/want-in-disguise" },
  {
    type: "action-check",
    title: "Real-World Action",
    challenge:
      "Open your bank app and look at your last 5 transactions. Label each one a NEED or a WANT.",
    successMessage:
      "Well done. That awareness is the whole game. Most people never look this honestly at their spending.",
    skipMessage:
      "Try it when you can. Most people are shocked how many 'needs' turn out to be wants.",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 3 · "Building a Budget"
// ═══════════════════════════════════════════════════════════════════════════

const lesson3Slots: QuestionSlot[] = [
  {
    slotId: "money-basics/lesson-3/review-adjust",
    conceptId: "budgeting-50-30-20",
    variants: [
      {
        variantId: "review-how-often",
        step: {
          type: "mcq",
          question: "How often should you check your budget against what actually happened?",
          options: [
            "At least monthly. Compare planned vs actual and adjust",
            "Once, when you first set it up",
            "Only when you've run out of money",
            "Never. A budget should never change",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. A budget is a living plan. A quick monthly 'planned vs actual' check is what keeps it real.",
            incorrect:
              "A budget isn't set-and-forget. Check it monthly against reality and adjust. That's how it stays useful.",
          },
        },
      },
      {
        variantId: "review-petrol",
        step: {
          type: "scenario",
          question:
            "Thabo budgeted R2 000 for petrol, but after fuel hikes it's now R2 600 every month. What should his budget do?",
          options: [
            "Adjust: raise petrol to R2 600 and trim another category to balance",
            "Ignore it and hope it evens out",
            "Delete the budget. It's clearly wrong",
            "Borrow R600 every month to cover the gap",
          ],
          correct: 0,
          feedback: {
            correct:
              "Exactly. Real costs changed, so the budget changes: fund the higher petrol and trim elsewhere to stay balanced.",
            incorrect:
              "When a real cost rises for good, update the budget. Raise petrol and cut another line so it still balances.",
          },
        },
      },
      {
        variantId: "review-tf",
        step: {
          type: "true-false",
          statement:
            "A budget should be reviewed and adjusted as your income and costs change.",
          correct: true,
          feedback: {
            correct:
              "True. Life changes (rent, fuel, income) so your budget has to move with it or it stops matching reality.",
            incorrect:
              "It's true: a budget has to flex with your real income and costs, or it quickly stops reflecting your life.",
          },
        },
      },
    ],
  },
  {
    slotId: "money-basics/lesson-3/budget-basis",
    conceptId: "gross-vs-net",
    variants: [
      {
        variantId: "basis-net-mcq",
        step: {
          type: "mcq",
          question: "What should you build your monthly budget on?",
          options: [
            "Your gross salary",
            "Your net (take-home) pay",
            "Your salary plus your expected bonus",
            "Last year's salary",
          ],
          correct: 1,
          feedback: {
            correct:
              "Always net. Take-home is the money that actually reaches your account. Everything else is a guess.",
            incorrect:
              "Budget on net (take-home) pay. Gross gets cut by PAYE and UIF before you ever see it; bonuses aren't guaranteed.",
          },
        },
      },
      {
        variantId: "basis-gross-tf",
        step: {
          type: "true-false",
          statement:
            "You should budget using your gross salary, the full figure before deductions.",
          correct: false,
          feedback: {
            correct:
              "Correct. Gross is never the money you can spend. PAYE and UIF come off first, so budget on net.",
            incorrect:
              "Gross overstates what you have. Deductions happen before payday, so always budget on your net take-home.",
          },
        },
      },
      {
        variantId: "basis-thabo-scenario",
        step: {
          type: "scenario",
          question:
            "Thabo's payslip shows R25 000 gross, but R19 500 lands in his account. Which figure should his budget use?",
          options: [
            "R19 500",
            "R25 000",
            "R22 250, the average of the two",
            "Whichever is higher",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. R19 500 is what he can actually spend and allocate. The R5 500 gap already went to PAYE and UIF.",
            incorrect:
              "He can only budget the R19 500 that reaches his account. The rest was deducted before payday.",
          },
        },
      },
    ],
  },
  {
    slotId: "money-basics/lesson-3/fixed-first",
    conceptId: "budgeting-50-30-20",
    variants: [
      {
        variantId: "fixed-wants-first-tf",
        step: {
          type: "true-false",
          statement:
            "You should fund your wants first and fit rent and insurance around whatever's left.",
          correct: false,
          feedback: {
            correct:
              "Correct. Non-negotiable fixed costs (rent, transport, insurance, debt) come first. Wants get what remains.",
            incorrect:
              "It's the other way round. Cover fixed essentials first, then fund wants from what's left.",
          },
        },
      },
      {
        variantId: "fixed-order-mcq",
        step: {
          type: "mcq",
          question: "When building a budget, what should you allocate money to FIRST?",
          options: [
            "Entertainment and eating out",
            "Non-negotiable fixed expenses, rent, transport, insurance",
            "A holiday fund",
            "The latest phone upgrade",
          ],
          correct: 1,
          feedback: {
            correct:
              "Yes. Lock in the essentials that keep the lights on and you earning, then budget the rest.",
            incorrect:
              "Fixed essentials come first. Rent, transport, insurance. Everything else is built around them.",
          },
        },
      },
      {
        variantId: "fixed-nomsa-scenario",
        step: {
          type: "scenario",
          question:
            "Nomsa writes her income, then budgets Netflix and eating-out, and adds rent 'if there's money left'. What's the mistake?",
          options: [
            "Fixed essentials like rent must be budgeted before wants",
            "She should close her bank account",
            "Nothing. Wants really do come first",
            "She simply earns too little to budget at all",
          ],
          correct: 0,
          feedback: {
            correct:
              "Exactly. Rent is non-negotiable, so it's funded before Netflix, not from the leftovers.",
            incorrect:
              "Rent can't be an afterthought. Fixed essentials are funded first; wants come out of what remains.",
          },
        },
      },
    ],
  },
  {
    slotId: "money-basics/lesson-3/leftover",
    conceptId: "budgeting-50-30-20",
    variants: [
      {
        variantId: "leftover-fill",
        step: {
          type: "fill-blank",
          title: "What's left to spend",
          prompt:
            "Net income R16 000. Fixed expenses R9 000. Savings R2 500. Money left for discretionary spending = R____.",
          correct: 4500,
          feedback: {
            correct:
              "Correct: R16 000 − R9 000 − R2 500 = R4 500 you can spend guilt-free.",
            incorrect:
              "Income minus fixed minus savings: R16 000 − R9 000 − R2 500 = R4 500.",
          },
        },
      },
      {
        variantId: "leftover-meaning",
        step: {
          type: "scenario",
          question:
            "Once income, fixed bills and savings are all assigned, the money that remains is:",
          options: [
            "Discretionary. Spend it guilt-free, the important things are covered",
            "A mistake you must fix in the budget",
            "Extra tax you owe SARS",
            "Money you're also required to save",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. That's the point of a budget: once essentials and savings are handled, the rest is genuinely yours to enjoy.",
            incorrect:
              "It's discretionary money. With essentials and savings already covered, you can spend it without worry.",
          },
        },
      },
      {
        variantId: "leftover-zero-based",
        step: {
          type: "mcq",
          question:
            "Giving every rand a job before the month begins is called:",
          options: [
            "Zero-based budgeting",
            "Gross budgeting",
            "Compound budgeting",
            "Bracket creep",
          ],
          correct: 0,
          feedback: {
            correct:
              "Yes. Zero-based budgeting means income minus every assigned rand equals zero. Nothing is left unplanned.",
            incorrect:
              "It's zero-based budgeting: you assign every rand a job until nothing is unplanned.",
          },
        },
      },
    ],
  },
];

const lesson3Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Why a Budget Changes Everything",
    content:
      "<p>Without a budget, money disappears and you never know where it went. With one, every rand has a job, and you stop wondering why you're short before month-end.</p><p>A budget isn't restriction, it's control. Step 1: write your monthly net income. Step 2: list fixed expenses. Step 3: list variable expenses. Step 4: whatever's left is discretionary. Spend it guilt-free, because everything important is already covered.</p>",
  },
  { slot: "money-basics/lesson-3/budget-basis" },
  { slot: "money-basics/lesson-3/fixed-first" },
  { slot: "money-basics/lesson-3/leftover" },
  { slot: "money-basics/lesson-3/review-adjust" },
  {
    type: "action-check",
    title: "Real-World Action",
    challenge:
      "Open the Budget section of this app, enter your monthly take-home income, and add your 3 biggest fixed expenses.",
    successMessage:
      "You've started a real budget, right here. Most people never take this step. You just did.",
    skipMessage:
      "Come back to this. Knowing your fixed costs is the foundation of every budget.",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 4 · "Tracking Your Spending"
// ═══════════════════════════════════════════════════════════════════════════

const lesson4Slots: QuestionSlot[] = [
  {
    slotId: "money-basics/lesson-4/redirect",
    conceptId: "tracking-spending",
    variants: [
      {
        variantId: "redirect-takeaways",
        step: {
          type: "scenario",
          question:
            "Tracking shows Nomsa spends R900 a month on takeaways she barely even enjoys. What's the best use of that discovery?",
          options: [
            "Set a lower takeaway budget and redirect the difference to savings or debt",
            "Feel bad about it and change nothing",
            "Stop tracking so she doesn't have to see it",
            "Spend even more so it feels worth it",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. Tracking only pays off when you act on it: cap the takeaways and send the freed-up money somewhere useful.",
            incorrect:
              "The whole point is to act: cap the low-joy spending and redirect it. Seeing the leak is step one; plugging it is step two.",
          },
        },
      },
      {
        variantId: "redirect-purpose",
        step: {
          type: "mcq",
          question: "What's the real purpose of tracking your spending?",
          options: [
            "To see where money leaks so you can redirect it on purpose",
            "To judge and punish yourself",
            "To impress your bank",
            "To collect a drawer full of receipts",
          ],
          correct: 0,
          feedback: {
            correct:
              "Exactly. Tracking is a spotlight, not a courtroom. It shows the leaks so you can choose where the money goes instead.",
            incorrect:
              "It's about redirection, not guilt. You track to find leaks and consciously send that money somewhere better.",
          },
        },
      },
      {
        variantId: "redirect-fill",
        step: {
          type: "fill-blank",
          title: "Freeing up money",
          prompt:
            "Tracking reveals R900 a month on takeaways. If you cut that to R400, you free up R____ a month for savings.",
          correct: 500,
          feedback: {
            correct: "Correct: R900 − R400 = R500 a month redirected, about R6 000 a year.",
            incorrect: "R900 − R400 = R500 freed up each month.",
          },
        },
      },
    ],
  },
  {
    slotId: "money-basics/lesson-4/why-track",
    conceptId: "tracking-spending",
    variants: [
      {
        variantId: "why-underestimate",
        step: {
          type: "mcq",
          question:
            "Why is tracking your spending for a few weeks more useful than guessing from memory?",
          options: [
            "Banks always report spending incorrectly",
            "People underestimate small, frequent purchases that quietly add up",
            "SARS requires proof of every expense",
            "Memory is more accurate than a bank statement",
          ],
          correct: 1,
          feedback: {
            correct:
              "Exactly. The R20 airtime and R15 cooldrink don't feel like much, but repeated daily they're the difference between saving and not.",
            incorrect:
              "It's about small, repeating buys. They're easy to forget but add up fast, tracking reveals the real total.",
          },
        },
      },
      {
        variantId: "why-lerato-gap",
        step: {
          type: "scenario",
          question:
            "Lerato guessed she spent R3 500 a month on food. Tracking for 30 days showed R5 800. Where did the extra R2 300 come from?",
          options: [
            "One big grocery haul she forgot",
            "Dozens of small buys",
            "A bank error on her statement",
            "Her rent being miscounted as food",
          ],
          correct: 1,
          feedback: {
            correct:
              "Right. It's never one big thing. It's the steady drip of small purchases that memory skips.",
            incorrect:
              "The gap wasn't one purchase. It was many small ones adding up, exactly what tracking exposes.",
          },
        },
      },
      {
        variantId: "why-small-tf",
        step: {
          type: "true-false",
          statement:
            "Small, repeated purchases like airtime, taxi fare and snacks are too tiny to matter to a budget.",
          correct: false,
          feedback: {
            correct:
              "Correct. Tiny but frequent is exactly what wrecks budgets. R50 a day is about R1 500 a month.",
            incorrect:
              "They matter most. R50 a day in small buys is roughly R1 500 a month. Enough to be a whole savings goal.",
          },
        },
      },
    ],
  },
  {
    slotId: "money-basics/lesson-4/track-source",
    conceptId: "tracking-spending",
    variants: [
      {
        variantId: "source-card-tf",
        step: {
          type: "true-false",
          statement:
            "If you mostly tap one bank card, your app's transaction list is a solid starting point for tracking.",
          correct: true,
          feedback: {
            correct:
              "Yes. Your card history does most of the work. Just add the cash you remember spending for the full picture.",
            incorrect:
              "It is a solid base. Card history captures most spend; you top it up with cash and any side accounts.",
          },
        },
      },
      {
        variantId: "source-cash-mcq",
        step: {
          type: "mcq",
          question:
            "You tap one card for most things but also draw cash. For a full picture you should:",
          options: [
            "Use only the card history",
            "Combine card history with the cash you remember spending",
            "Ignore cash entirely",
            "Wait for a paper statement once a year",
          ],
          correct: 1,
          feedback: {
            correct:
              "Right. Card history plus remembered cash gives you the true total. Cash is where tracking usually leaks.",
            incorrect:
              "Card alone misses cash spend. Combine the two so nothing slips through.",
          },
        },
      },
      {
        variantId: "source-method-mcq",
        step: {
          type: "mcq",
          question: "For most people, the tracking method they'll actually stick to is:",
          options: [
            "A weekly 5-minute review of their banking app categories",
            "A perfect spreadsheet updated every hour",
            "Memorising every single purchase",
            "Not tracking and hoping for the best",
          ],
          correct: 0,
          feedback: {
            correct:
              "Exactly. A quick weekly check you'll keep doing beats a perfect system you abandon in a week.",
            incorrect:
              "The one that sticks wins. A 5-minute weekly review beats a perfect spreadsheet you quit.",
          },
        },
      },
    ],
  },
  {
    slotId: "money-basics/lesson-4/track-focus",
    conceptId: "tracking-spending",
    variants: [
      {
        variantId: "focus-scenario",
        step: {
          type: "scenario",
          question:
            "You take home R18 000. Essentials (rent, lights, transport) are R12 500, and you want to save R1 500. What should you track most closely?",
          options: [
            "Only your rent",
            "The roughly R4 000 left after essentials and savings, especially food and discretionary spend",
            "Your employer's salary policy",
            "Only long-weekend trips",
          ],
          correct: 1,
          feedback: {
            correct:
              "Right. R18 000 − R12 500 − R1 500 = R4 000. That flexible slice is where small choices decide if saving actually happens.",
            incorrect:
              "Fixed bills are already set. The R4 000 of variable spend after essentials and savings is what to watch.",
          },
        },
      },
      {
        variantId: "focus-fill",
        step: {
          type: "fill-blank",
          title: "The slice that matters",
          prompt:
            "Take-home R18 000, essentials R12 500, savings R1 500. The flexible spend you should watch = R____.",
          correct: 4000,
          feedback: {
            correct: "Correct: R18 000 − R12 500 − R1 500 = R4 000 of discretionary spend.",
            incorrect: "R18 000 − R12 500 − R1 500 = R4 000. That's the flexible slice to track.",
          },
        },
      },
      {
        variantId: "focus-which-mcq",
        step: {
          type: "mcq",
          question: "Tracking changes your outcomes most when you focus on:",
          options: [
            "Variable spend after your fixed bills",
            "Your fixed rent amount",
            "Your gross salary",
            "What you spent last year",
          ],
          correct: 0,
          feedback: {
            correct:
              "Yes. Fixed bills barely move. It's the variable spend where your daily choices actually change the result.",
            incorrect:
              "Fixed costs are locked in. The variable spend after them is where tracking makes a real difference.",
          },
        },
      },
    ],
  },
];

const lesson4Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Every Rand Tells a Story",
    content:
      "<p>Lerato in Tembisa thought she spent about R3 500 a month on food. When she tracked every card swipe and cash slip for 30 days, the real number was closer to R5 800, not one big purchase, but dozens of small ones: R120 at a taxi rank, R80 at a spaza, R250 on takeaways after late shifts.</p><p>Tracking isn't about shame. It's about seeing where money really goes so you can redirect even R500 a month to debt or savings. Use your banking app, a notebook, or a free spreadsheet. A weekly five-minute check beats a perfect budget you never open.</p>",
  },
  { slot: "money-basics/lesson-4/why-track" },
  { slot: "money-basics/lesson-4/track-source" },
  { slot: "money-basics/lesson-4/track-focus" },
  { slot: "money-basics/lesson-4/redirect" },
  {
    type: "action",
    title: "Log this week's spending",
    instruction:
      "Pick one method for the next seven days: banking-app export, notes on your phone, or a paper list. Tonight, write down every rand you spent: including airtime and taxi cash.",
    tip: "Set a daily alarm for 20:00 so you don't forget the small buys.",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 5 · "Comparing Prices"
// ═══════════════════════════════════════════════════════════════════════════

const lesson5Slots: QuestionSlot[] = [
  {
    slotId: "money-basics/lesson-5/fake-discount",
    conceptId: "comparison-shopping",
    variants: [
      {
        variantId: "fake-was-now-tf",
        step: {
          type: "true-false",
          statement:
            "A 'was R2 000, now R1 200' sticker always means you're getting a genuine bargain.",
          correct: false,
          feedback: {
            correct:
              "Correct. Some shops inflate the 'was' price, and a discount on something you didn't need is still money spent.",
            incorrect:
              "Not always. The 'was' price can be inflated, and a great discount on something you didn't need is still a loss.",
          },
        },
      },
      {
        variantId: "fake-jacket",
        step: {
          type: "scenario",
          question:
            "A jacket is '40% off. Was R1 500, now R900'. When is buying it actually the smart move?",
          options: [
            "When you needed a jacket anyway and R900 beats other shops",
            "Whenever the discount percentage is big",
            "Because you might not see this deal again",
            "Any time there's a sale on",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. A discount only saves you money if you were going to buy the thing regardless, then compare the R900 to other shops.",
            incorrect:
              "The size of the discount is a distraction. It's only smart if you needed the jacket and R900 is genuinely competitive.",
          },
        },
      },
      {
        variantId: "fake-trap",
        step: {
          type: "mcq",
          question: "What's the real trap of a big 'sale' discount?",
          options: [
            "It nudges you to spend on things you didn't actually need",
            "Discounts are illegal in South Africa",
            "The shop secretly loses money on you",
            "It increases the VAT you pay",
          ],
          correct: 0,
          feedback: {
            correct:
              "Exactly. 'Saving 40%' on something you never planned to buy isn't saving. It's spending you were talked into.",
            incorrect:
              "The trap is behavioural: a discount gets you to buy things you didn't need. Money not spent beats any discount.",
          },
        },
      },
    ],
  },
  {
    slotId: "money-basics/lesson-5/compare-first",
    conceptId: "comparison-shopping",
    variants: [
      {
        variantId: "compare-2min-tf",
        step: {
          type: "true-false",
          statement:
            "Before a big purchase, it's worth spending 2 minutes checking whether it's cheaper elsewhere.",
          correct: true,
          feedback: {
            correct:
              "True. Two minutes on PriceCheck or Google Shopping regularly saves 10–20% on electronics and appliances. That's real money for almost no effort.",
            incorrect:
              "It nearly always pays off. A quick price check before big buys routinely saves 10–20%, worth two minutes.",
          },
        },
      },
      {
        variantId: "compare-microwave",
        step: {
          type: "scenario",
          question:
            "You're about to buy a R2 400 microwave at the first shop you walk into. What's the smart move?",
          options: [
            "Buy it now before it sells out",
            "Take 2 minutes to compare the price on PriceCheck or another store first",
            "Only check prices after you've paid",
            "Assume the first price you see is always fair",
          ],
          correct: 1,
          feedback: {
            correct:
              "Right. A quick compare on a R2 400 item could easily save R200–R400: the best-paid two minutes of your day.",
            incorrect:
              "The first price is rarely the best. A 2-minute compare on a R2 400 buy often saves a few hundred rand.",
          },
        },
      },
      {
        variantId: "compare-10pct",
        step: {
          type: "mcq",
          question:
            "You compare prices and save 10% on a R500 grocery shop. How much did you just keep?",
          options: ["R50", "R5", "R250", "R500"],
          correct: 0,
          feedback: {
            correct:
              "Yes. 10% of R500 is R50. Do that weekly and it's about R2 600 a year back in your pocket.",
            incorrect: "10% of R500 is R50. Small per shop, but roughly R2 600 over a year.",
          },
        },
      },
    ],
  },
  {
    slotId: "money-basics/lesson-5/bulk-unit-price",
    conceptId: "comparison-shopping",
    variants: [
      {
        variantId: "bulk-always-tf",
        step: {
          type: "true-false",
          statement: "Buying in bulk is always cheaper than buying single items.",
          correct: false,
          feedback: {
            correct:
              "Correct. Bulk is often cheaper per unit, but if you waste what you can't finish, you've lost money. Always check the per-unit price and whether you'll use it.",
            incorrect:
              "Not always. Bulk only wins if you actually use it before it spoils. Check the price per unit, not just the total.",
          },
        },
      },
      {
        variantId: "bulk-rice-scenario",
        step: {
          type: "scenario",
          question:
            "A 2kg bag of rice is R60; a 5kg bag is R135. Which is cheaper per kilogram?",
          options: [
            "The 5kg bag, at R27/kg",
            "The 2kg bag, at R30/kg",
            "They cost exactly the same per kg",
            "There's no way to tell",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right: R60÷2 = R30/kg versus R135÷5 = R27/kg. The 5kg wins. As long as you'll finish it before it goes off.",
            incorrect:
              "Work out each per kg: R60÷2 = R30 vs R135÷5 = R27. The 5kg bag is cheaper per kilogram.",
          },
        },
      },
      {
        variantId: "bulk-which-number",
        step: {
          type: "mcq",
          question: "What single number tells you whether bulk is actually cheaper?",
          options: [
            "The price per unit",
            "The total price on the shelf",
            "The size of the packaging",
            "The brand name",
          ],
          correct: 0,
          feedback: {
            correct:
              "Exactly. Per-unit price is the great equaliser, most SA shelf labels print it in small text under the main price.",
            incorrect:
              "It's the per-unit price (per kg/litre/100g). It's usually in small print on the shelf label. That's the number to compare.",
          },
        },
      },
    ],
  },
  {
    slotId: "money-basics/lesson-5/savings-add-up",
    conceptId: "comparison-shopping",
    variants: [
      {
        variantId: "addup-fill",
        step: {
          type: "fill-blank",
          title: "Small savings, big year",
          prompt:
            "You save R50 on each weekly grocery shop by comparing prices. Over 52 weeks that's about R____.",
          correct: 2600,
          feedback: {
            correct: "Correct: R50 × 52 ≈ R2 600 a year, a genuine emergency-fund contribution.",
            incorrect: "R50 a week × 52 weeks ≈ R2 600 a year.",
          },
        },
      },
      {
        variantId: "addup-nomsa",
        step: {
          type: "scenario",
          question:
            "Nomsa saves about R50 a week by checking prices before she shops. What's the honest way to think about that R50?",
          options: [
            "Too small to bother with",
            "Roughly R2 600 a year",
            "Only worth it if she can save R500+ at once",
            "Money she'll just waste anyway",
          ],
          correct: 1,
          feedback: {
            correct:
              "Right. Small and boring beats big and rare. R50 a week quietly becomes R2 600 a year.",
            incorrect:
              "R50 a week is about R2 600 a year. Small, regular savings are exactly how emergency funds get built.",
          },
        },
      },
      {
        variantId: "addup-tf",
        step: {
          type: "true-false",
          statement:
            "Small savings on regular purchases are too tiny to matter over a whole year.",
          correct: false,
          feedback: {
            correct:
              "Correct. R50 a week is ~R2 600 a year. The small, repeated stuff is where budgets are actually won.",
            incorrect:
              "They add up fast. R50 a week is about R2 600 a year, far from tiny.",
          },
        },
      },
    ],
  },
];

const lesson5Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "The R10 Rule",
    content:
      "<p>Before any purchase, ask: could I find this cheaper somewhere else in under 2 minutes? Apps like PriceCheck and Google Shopping make it easy.</p><p>On a R500 grocery shop, even 10% saved is R50. Over a year that's about R600, a real emergency-fund contribution.</p>",
  },
  { slot: "money-basics/lesson-5/compare-first" },
  { slot: "money-basics/lesson-5/bulk-unit-price" },
  { slot: "money-basics/lesson-5/savings-add-up" },
  { slot: "money-basics/lesson-5/fake-discount" },
  {
    type: "action-check",
    title: "Real-World Action",
    challenge:
      "Pick one thing you plan to buy this week and check its price at two shops or on PriceCheck before you pay.",
    successMessage:
      "That's the whole habit. Do it on big buys and it pays for itself many times over.",
    skipMessage:
      "Try it once. Comparing before a single big purchase is usually where the biggest saving hides.",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 6 · "Avoiding Impulse Buys"
// ═══════════════════════════════════════════════════════════════════════════

const lesson6Slots: QuestionSlot[] = [
  {
    slotId: "money-basics/lesson-6/triggers",
    conceptId: "impulse-buying",
    variants: [
      {
        variantId: "trigger-tactics",
        step: {
          type: "mcq",
          question: "Which of these is a deliberate tactic shops use to trigger impulse buys?",
          options: [
            "'Only 2 left in stock' and 'sale ends today' urgency",
            "A clear, no-questions return policy",
            "Honest per-unit pricing on the shelf",
            "A 24-hour hold-it-for-you option",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. Manufactured urgency (low stock, countdown timers) is designed to make you buy before you think. Spot it and slow down.",
            incorrect:
              "The trigger is manufactured urgency ('2 left', 'ends today'). The other options actually help you decide calmly.",
          },
        },
      },
      {
        variantId: "trigger-emotion",
        step: {
          type: "scenario",
          question:
            "You get a sudden urge to buy something online at 11pm after a stressful day. That urge is usually really about:",
          options: [
            "Your mood (stress, boredom), not the item itself",
            "A genuine need that happened to appear at 11pm",
            "The item being truly essential",
            "Nothing. Late-night buys are always fine",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. Impulse buys are often mood management. Naming the feeling ('I'm stressed') takes the power out of the urge.",
            incorrect:
              "It's usually emotional: stress or boredom looking for relief. The item is just what's nearby. Name the feeling and wait.",
          },
        },
      },
      {
        variantId: "trigger-state-tf",
        step: {
          type: "true-false",
          statement:
            "Shopping while stressed, bored or tired makes impulse buys more likely.",
          correct: true,
          feedback: {
            correct:
              "True. Low willpower states are prime impulse territory, which is why 'don't shop to feel better' is a real rule.",
            incorrect:
              "It's true: stress, boredom and tiredness all weaken self-control, so that's exactly when impulse buys spike.",
          },
        },
      },
    ],
  },
  {
    slotId: "money-basics/lesson-6/cooling-off",
    conceptId: "impulse-buying",
    variants: [
      {
        variantId: "cool-delay-tf",
        step: {
          type: "true-false",
          statement:
            "A 'cooling-off' delay before non-essential purchases usually leads to fewer regrets.",
          correct: true,
          feedback: {
            correct:
              "True. Impulse runs on urgency, sleep on it and a lot of 'must-haves' quietly lose their grip by morning.",
            incorrect:
              "Delay helps. Deciding with a clear head the next day, instead of in the moment, means fewer regrets.",
          },
        },
      },
      {
        variantId: "cool-sipho",
        step: {
          type: "scenario",
          question:
            "Sipho went in for socks and left with earphones on a store plan that cost about R1 800 over the ticket price. What rule would have saved him?",
          options: [
            "Wait 24 hours on anything over R200 that wasn't on your list",
            "Always buy on the first visit while it's in stock",
            "Never shop with a written list",
            "Take the store card for the loyalty points",
          ],
          correct: 0,
          feedback: {
            correct:
              "Exactly. A 24-hour pause breaks the 'buy now' spell, and dodges the fees and interest a store plan piles on top.",
            incorrect:
              "The fix is a pause: wait 24 hours on unplanned buys over R200. It also avoids the store plan's interest and fees.",
          },
        },
      },
      {
        variantId: "cool-why",
        step: {
          type: "mcq",
          question: "Why does a 24-hour wait rule work so well on impulse buys?",
          options: [
            "The urge usually fades once the 'buy now' pressure is gone",
            "Prices always drop overnight",
            "Shops refund impulse buys automatically",
            "Waiting earns you interest on the purchase",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. The wanting is strongest in the moment. Give it a night and most impulse urges simply pass.",
            incorrect:
              "It's about the urge, not the price. Impulse feelings fade with time, so a night's wait filters out most regrets.",
          },
        },
      },
    ],
  },
  {
    slotId: "money-basics/lesson-6/online-friction",
    conceptId: "impulse-buying",
    variants: [
      {
        variantId: "friction-best-habit",
        step: {
          type: "mcq",
          question: "Which habit best reduces impulse spending online?",
          options: [
            "Saving your card details on every shopping site",
            "Removing saved cards and shopping from a written list",
            "Checking the sales every lunch break",
            "Deleting your budget so you don't feel guilty",
          ],
          correct: 1,
          feedback: {
            correct:
              "Yes. Friction plus a list turns mindless scrolling into a conscious choice. The extra 30 seconds is the whole point.",
            incorrect:
              "The winner is less one-tap buying plus a list. Removing saved cards makes you pause; the list keeps you honest.",
          },
        },
      },
      {
        variantId: "friction-saved-card-tf",
        step: {
          type: "true-false",
          statement:
            "Saving your card details on shopping apps makes it easier to stick to your budget.",
          correct: false,
          feedback: {
            correct:
              "Correct. It does the opposite. One-tap checkout removes the pause where you'd normally think twice. Remove saved cards.",
            incorrect:
              "It actually hurts your budget. Saved cards make buying frictionless; removing them reinstates the pause that stops impulse buys.",
          },
        },
      },
      {
        variantId: "friction-lerato",
        step: {
          type: "scenario",
          question:
            "Lerato keeps overspending on late-night online shopping. What's the most effective fix?",
          options: [
            "Remove saved cards so each buy takes effort, and shop from a list",
            "Follow more sale and deal accounts",
            "Do her shopping later at night when she's tired",
            "Ask the bank to raise her credit limit",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. Add friction, remove the triggers. Having to fetch her card is often enough of a pause to stop the buy.",
            incorrect:
              "More deals and higher limits feed the habit. The fix is friction: remove saved cards and shop from a list.",
          },
        },
      },
    ],
  },
  {
    slotId: "money-basics/lesson-6/overrun-math",
    conceptId: "impulse-buying",
    variants: [
      {
        variantId: "overrun-clothes-fill",
        step: {
          type: "fill-blank",
          title: "Name the overrun",
          prompt: "You planned R600 for clothes but spent R900. The unplanned extra is R____.",
          correct: 300,
          feedback: {
            correct: "Right: R900 − R600 = R300. Naming the overrun is how you adjust next month.",
            incorrect: "Actual minus planned: R900 − R600 = R300 extra.",
          },
        },
      },
      {
        variantId: "overrun-takeaways",
        step: {
          type: "scenario",
          question:
            "You budgeted R800 for the month's takeaways but the app shows R1 250 spent. What's the useful next step?",
          options: [
            "Name the R450 overrun and plan for it next month",
            "Ignore it. The money's already gone",
            "Delete the budget so it stops nagging you",
            "Assume the banking app is wrong",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. R1 250 − R800 = R450. Facing the number (not hiding it) is exactly how next month improves.",
            incorrect:
              "The overrun is R450 (R1 250 − R800). Naming it beats ignoring it. That's how the next month gets better.",
          },
        },
      },
      {
        variantId: "overrun-blackfriday-fill",
        step: {
          type: "fill-blank",
          title: "Black Friday check",
          prompt: "You planned R1 000 for Black Friday but spent R1 700. The unplanned extra is R____.",
          correct: 700,
          feedback: {
            correct: "Correct: R1 700 − R1 000 = R700 over plan.",
            incorrect: "Actual minus planned: R1 700 − R1 000 = R700.",
          },
        },
      },
    ],
  },
];

const lesson6Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "When the Want Hits Now",
    content:
      "<p>Sipho walked into a mall for socks and left with bluetooth earphones on a three-month store plan, about R1 800 over the ticket price once fees and interest were counted. Impulse buys are designed to feel urgent: limited stock, sale ends today, one-click checkout.</p><p>In South Africa, high fuel prices and long commutes already squeeze households, so unplanned extras hurt more. A simple rule, wait 24 hours on anything over R200 that wasn't on your list, cuts many mistakes. If you still want it after a night's sleep and can pay by debit without touching your emergency fund, it may be a fair choice.</p>",
  },
  { slot: "money-basics/lesson-6/cooling-off" },
  { slot: "money-basics/lesson-6/online-friction" },
  { slot: "money-basics/lesson-6/overrun-math" },
  { slot: "money-basics/lesson-6/triggers" },
  {
    type: "action",
    title: "Try the 24-hour rule once",
    instruction:
      "Next time you want a non-essential over R250 that wasn't on your list, write it on paper with the price and wait until tomorrow. If you still need it, pay by debit you can afford.",
    tip: "Keep the note in your pocket so the urge doesn't just vanish without a decision.",
  },
];

export const MONEY_BASICS_BANKS: Record<string, LessonBank> = {
  "money-basics::lesson-1": { layout: lesson1Layout, slots: lesson1Slots },
  "money-basics::lesson-2": { layout: lesson2Layout, slots: lesson2Slots },
  "money-basics::lesson-3": { layout: lesson3Layout, slots: lesson3Slots },
  "money-basics::lesson-4": { layout: lesson4Layout, slots: lesson4Slots },
  "money-basics::lesson-5": { layout: lesson5Layout, slots: lesson5Slots },
  "money-basics::lesson-6": { layout: lesson6Layout, slots: lesson6Slots },
};
