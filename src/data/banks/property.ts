import type { LessonLayoutItem, QuestionSlot } from "@/data/content";
import type { LessonBank } from "./money-basics";

/**
 * Bank for the Property & Big Purchases course. Per docs/QUESTION-VOICE-GUIDE.md.
 * FIGURES verified against docs/SA-REGULATORY-FIGURES.md (2026/27):
 *  - Transfer duty: exempt up to R1 210 000; then 3% of the amount above it
 *    (so R1.5m → 3% × R290 000 = R8 700). Sliding scale beyond.
 *  - First Home Finance (formerly FLISP): first-time buyers, gross income
 *    R3 501–R22 000/month; sliding-scale subsidy (~R39k–R169k).
 *  - Prime rate is SARB-set and moves — kept illustrative/hedged, never pinned.
 */

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 1 · "How Much House Can You Afford?"
// ═══════════════════════════════════════════════════════════════════════════

const lesson1Slots: QuestionSlot[] = [
  {
    slotId: "property/lesson-1/thirty-pct",
    conceptId: "home-affordability",
    variants: [
      {
        variantId: "tp-rule-mcq",
        step: {
          type: "mcq",
          question: "A common affordability rule says your total housing costs shouldn't exceed what share of your gross income?",
          options: ["About 30%", "About 60%", "About 10%", "100%"],
          correct: 0,
          feedback: {
            correct: "Right. The 30% rule keeps housing (bond + rates + levy + insurance) affordable and leaves room for everything else in life.",
            incorrect: "The rule of thumb is about 30% of gross income for ALL housing costs combined.",
          },
        },
      },
      {
        variantId: "tp-calc-fill",
        step: {
          type: "fill-blank",
          title: "Your housing ceiling",
          prompt: "You earn R35 000 gross a month. Using the 30% rule, your maximum total housing cost is R____.",
          correct: 10500,
          feedback: {
            correct: "Correct: R35 000 × 30% = R10 500, covering bond, rates, levy and insurance combined.",
            incorrect: "30% of R35 000 = R10 500, for all housing costs together.",
          },
        },
      },
      {
        variantId: "tp-covers-mcq",
        step: {
          type: "mcq",
          question: "The 30% housing figure should cover:",
          options: [
            "Bond plus rates and levies",
            "Only the bond repayment",
            "Only the deposit amount",
            "Just the estate agent's fee",
          ],
          correct: 0,
          feedback: {
            correct: "Right. It's total housing cost, not just the bond. People who forget rates and levies end up over-stretched.",
            incorrect: "It's everything: bond plus rates, levies and insurance. Counting only the bond understates the real cost.",
          },
        },
      },
    ],
  },
  {
    slotId: "property/lesson-1/bank-approval",
    conceptId: "home-affordability",
    variants: [
      {
        variantId: "ba-tf",
        step: {
          type: "true-false",
          statement: "If a bank approves your home loan, the repayment is definitely affordable for you.",
          correct: false,
          feedback: {
            correct: "Correct. Banks approve based on their risk appetite, not your lifestyle. Plenty of people are approved for more than they can comfortably repay.",
            incorrect: "Not necessarily. The bank lends to its own criteria. You still have to check it fits YOUR budget and survives a rate rise.",
          },
        },
      },
      {
        variantId: "ba-stress-mcq",
        step: {
          type: "mcq",
          question: "Before committing to a bond, what should you stress-test the repayment against?",
          options: [
            "Rate rises and income drops",
            "Only today's best-case month",
            "The colour of the house",
            "What your friends think",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Rates rise and incomes change. A repayment that only works on a perfect month is a trap. Make sure it survives a shock.",
            incorrect: "Stress-test against higher rates and a lean month. If it only works on your best month, it's too much house.",
          },
        },
      },
      {
        variantId: "ba-scenario",
        step: {
          type: "scenario",
          question: "The bank approves Thabo for a R14 000/month bond, but that leaves almost nothing after his other costs. What's wise?",
          options: [
            "Buy something cheaper",
            "Take the full R14 000 bond",
            "Skip insurance to afford it",
            "Stop saving entirely for it",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Approval is the bank's limit, not his comfort zone. Buying below the max keeps room for emergencies and life.",
            incorrect: "He should buy below the approved max. A bond that leaves no buffer breaks the first time anything goes wrong.",
          },
        },
      },
    ],
  },
  {
    slotId: "property/lesson-1/total-cost",
    conceptId: "home-affordability",
    variants: [
      {
        variantId: "tc-mcq",
        step: {
          type: "mcq",
          question: "Which of these is part of your monthly housing cost beyond the bond repayment?",
          options: [
            "Rates, levies and insurance",
            "Your car's monthly petrol bill",
            "Your phone contract",
            "The weekly groceries",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Rates, levies and insurance are real, recurring housing costs. Budget them alongside the bond, not as afterthoughts.",
            incorrect: "Housing cost includes rates, levies and insurance on top of the bond. The others are separate budget lines.",
          },
        },
      },
      {
        variantId: "tc-underestimate-tf",
        step: {
          type: "true-false",
          statement: "People often underestimate the cost of a home by looking only at the bond repayment.",
          correct: true,
          feedback: {
            correct: "True. The bond is the headline, but rates, levies, insurance and maintenance can add thousands a month. Count them all before you buy.",
            incorrect: "It's true: focusing only on the bond hides rates, levies, insurance and upkeep. The true monthly cost is much higher.",
          },
        },
      },
      {
        variantId: "tc-levy-scenario",
        step: {
          type: "scenario",
          question: "Nomsa budgets only her R11 000 bond, forgetting R2 000 in rates and levies. What happens?",
          options: [
            "Her real housing cost is R13 000",
            "Nothing. Rates and levies are optional",
            "The bank pays her rates",
            "Her bond repayment automatically shrinks",
          ],
          correct: 0,
          feedback: {
            correct: "Right. R11 000 + R2 000 = R13 000 is the true cost. Ignoring rates and levies is how 'affordable' homes quietly break budgets.",
            incorrect: "Rates and levies are compulsory. Her real cost is R13 000, likely blowing past the 30% guideline.",
          },
        },
      },
    ],
  },
  {
    slotId: "property/lesson-1/affordability-first",
    conceptId: "home-affordability",
    variants: [
      {
        variantId: "af-buffer-tf",
        step: {
          type: "true-false",
          statement: "Leaving a buffer between the maximum bond you're approved for and what you commit to protects you.",
          correct: true,
          feedback: {
            correct: "True. Buying at your absolute limit leaves no room for a rate hike or a lean month. A gap is what keeps a setback from becoming a default.",
            incorrect: "It's true, a buffer below your max absorbs shocks. Buying to the limit is how small surprises turn into missed payments.",
          },
        },
      },
      {
        variantId: "af-emotion-mcq",
        step: {
          type: "mcq",
          question: "What's a common emotional trap when buying a first home?",
          options: [
            "Stretching to the maximum bond",
            "Leaving a comfortable buffer below it",
            "Getting bond pre-approval up front",
            "Budgeting for transfer costs",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Emotion pushes people to over-buy. The disciplined move is to let the budget, not the feelings, set the price.",
            incorrect: "The trap is over-stretching for a dream home. Let affordability, not emotion, cap what you spend.",
          },
        },
      },
      {
        variantId: "af-review-scenario",
        step: {
          type: "scenario",
          question: "Lerato can afford a R12 000 bond but is shown a beautiful R16 000 one she 'loves'. Best move?",
          options: [
            "Stay within her R12 000 budget",
            "Take the R16 000 and cut essentials",
            "Borrow more to cover the gap",
            "Skip the deposit in order to afford it",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A R16 000 bond she can't afford will sour fast. Sticking to R12 000 protects her for the two decades she'll be paying it.",
            incorrect: "She should stay at R12 000. Overpaying for a home she loves now becomes a 20-year strain she'll resent.",
          },
        },
      },
    ],
  },
];

const lesson1Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "The 30% Rule",
    content:
      "<p>A common rule: your total housing costs (bond repayment + rates + levy + insurance) shouldn't exceed <strong>30% of your gross income</strong>.</p><p>Gross salary R40 000/month → maximum housing costs about R12 000/month. Banks often lend up to roughly this level, but just because the bank approves it doesn't mean it's comfortable for YOU. Buy below your max and stress-test the repayment against a rate rise.</p>",
  },
  { slot: "property/lesson-1/thirty-pct" },
  { slot: "property/lesson-1/bank-approval" },
  { slot: "property/lesson-1/total-cost" },
  { slot: "property/lesson-1/affordability-first" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 2 · "Understanding Home Loans"
// ═══════════════════════════════════════════════════════════════════════════

const lesson2Slots: QuestionSlot[] = [
  {
    slotId: "property/lesson-2/ltv-what",
    conceptId: "ltv-ratio",
    variants: [
      {
        variantId: "lw-mcq",
        step: {
          type: "mcq",
          question: "What does LTV (Loan-to-Value) measure on a home loan?",
          options: [
            "Loan against value",
            "How long until the loan is paid",
            "Your monthly repayment",
            "The bank's interest rate",
          ],
          correct: 0,
          feedback: {
            correct: "Right. LTV = loan ÷ property value. A R900 000 loan on a R1 000 000 home is 90% LTV. Lower LTV means less risk to the bank.",
            incorrect: "LTV is the loan divided by the property value. R800 000 on a R1 000 000 home = 80% LTV.",
          },
        },
      },
      {
        variantId: "lw-fill",
        step: {
          type: "fill-blank",
          title: "Work out the LTV",
          prompt: "A R900 000 loan on a R1 000 000 property is an LTV of ____ percent.",
          correct: 90,
          feedback: {
            correct: "Correct: R900 000 ÷ R1 000 000 = 90%. A bigger deposit lowers this and usually earns a better rate.",
            incorrect: "R900 000 ÷ R1 000 000 = 90% LTV.",
          },
        },
      },
      {
        variantId: "lw-bond-tf",
        step: {
          type: "true-false",
          statement: "A home loan (a 'bond' in SA) is secured by the property, so the bank can repossess it if you stop paying.",
          correct: true,
          feedback: {
            correct: "True. The property is the collateral. That security is why bonds have far lower rates than unsecured loans, but also why default risks your home.",
            incorrect: "It's true. A bond is secured by the home. Miss enough payments and the bank can repossess and sell it to recover the debt.",
          },
        },
      },
    ],
  },
  {
    slotId: "property/lesson-2/ltv-deposit",
    conceptId: "ltv-ratio",
    variants: [
      {
        variantId: "ld-mcq",
        step: {
          type: "mcq",
          question: "How does a bigger deposit usually affect your home-loan interest rate?",
          options: [
            "It tends to improve it",
            "It makes the rate worse",
            "It has no effect on the rate",
            "It removes interest entirely",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A bigger deposit means a lower LTV, so the bank takes less risk, and often rewards you with a lower rate.",
            incorrect: "A bigger deposit lowers your LTV and risk to the bank, which typically earns a better rate.",
          },
        },
      },
      {
        variantId: "ld-tf",
        step: {
          type: "true-false",
          statement: "A lower loan-to-value (a bigger deposit) reduces the bank's risk on your bond.",
          correct: true,
          feedback: {
            correct: "True. Lend R700k on a R1m home and the bank is well-covered if it must repossess; lend R980k and it isn't. Lower LTV = lower risk = often a better rate.",
            incorrect: "It's true. More of your own money in means less of the bank's at risk. That lower risk often translates to a better rate.",
          },
        },
      },
      {
        variantId: "ld-scenario",
        step: {
          type: "scenario",
          question: "Sipho can put down 20% instead of 5%. Beyond a smaller loan, what's a likely benefit?",
          options: [
            "A better interest rate",
            "He is charged more",
            "No difference at all",
            "He loses his deposit",
          ],
          correct: 0,
          feedback: {
            correct: "Right. 20% down means an 80% LTV: much safer for the bank than 95%, so he's more likely to get a competitive rate.",
            incorrect: "A 20% deposit (80% LTV) is far less risky for the bank than 5% down, so it usually earns a better rate.",
          },
        },
      },
    ],
  },
  {
    slotId: "property/lesson-2/prime",
    conceptId: "ltv-ratio",
    variants: [
      {
        variantId: "pr-what-mcq",
        step: {
          type: "mcq",
          question: "The 'prime rate' your bond is priced off is set by:",
          options: [
            "The Reserve Bank",
            "Each estate agent",
            "SARS",
            "The seller of the house",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Prime moves with the SARB's repo rate. Your bond rate is prime plus or minus a 'spread' based on your credit profile.",
            incorrect: "Prime tracks the SARB's repo rate. Banks then price your bond at prime ± a spread for your risk.",
          },
        },
      },
      {
        variantId: "pr-spread-tf",
        step: {
          type: "true-false",
          statement: "A stronger credit profile can earn you a home-loan rate below prime, while a weaker one may be above prime.",
          correct: true,
          feedback: {
            correct: "True. The 'spread' is personal: a good profile might get prime minus 0.5%, a riskier one prime plus 1%. Your credit record directly affects the rate.",
            incorrect: "It's true. The spread depends on your risk. Good credit can mean below prime; poor credit means above it, costing more over 20 years.",
          },
        },
      },
      {
        variantId: "pr-variable-tf",
        step: {
          type: "true-false",
          statement: "Because most SA bonds track prime, your repayment can rise or fall when the Reserve Bank changes rates.",
          correct: true,
          feedback: {
            correct: "True. A variable bond moves with prime. Great when rates fall, painful when they rise. That's why you stress-test the repayment before buying.",
            incorrect: "It's true, a prime-linked bond changes with SARB rate moves. Budget for the repayment going up, not just today's rate.",
          },
        },
      },
    ],
  },
  {
    slotId: "property/lesson-2/first-home-finance",
    conceptId: "ltv-ratio",
    variants: [
      {
        variantId: "fhf-what-mcq",
        step: {
          type: "mcq",
          question: "First Home Finance (the government subsidy formerly called FLISP) is available to:",
          options: [
            "First-time buyers only",
            "Anyone buying at any income",
            "Only people over R50 000 a month",
            "Only cash buyers",
          ],
          correct: 0,
          feedback: {
            correct: "Right. It's income-tested: first-time buyers earning R3 501–R22 000/month can get a sliding-scale subsidy that reduces their bond.",
            incorrect: "It's for first-time buyers earning R3 501–R22 000/month. Means-tested, and not if you've owned property before.",
          },
        },
      },
      {
        variantId: "fhf-all-tf",
        step: {
          type: "true-false",
          statement: "First Home Finance (formerly FLISP) is available to all home buyers regardless of income.",
          correct: false,
          feedback: {
            correct: "Correct. It's means-tested, only first-time buyers earning R3 501–R22 000/month qualify, and not if you've owned property before.",
            incorrect: "It's income-tested, not universal. Only first-time buyers in the R3 501–R22 000/month band qualify.",
          },
        },
      },
      {
        variantId: "fhf-benefit-scenario",
        step: {
          type: "scenario",
          question: "Nomsa is a first-time buyer earning R12 000/month. How could First Home Finance help her?",
          options: [
            "A once-off subsidy",
            "It pays her whole bond forever",
            "It gives her a free second property",
            "It has no effect on her bond",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The subsidy (roughly R39k–R169k, more for lower incomes) is applied to shrink her bond. Real help for a qualifying first-time buyer.",
            incorrect: "It's a once-off, income-linked subsidy that reduces her bond. Lower earners get more; it's a leg-up, not a free house.",
          },
        },
      },
    ],
  },
];

const lesson2Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "How a Bond Really Works",
    content:
      "<p>A home loan (a <strong>bond</strong> in SA) is a secured loan. The property is collateral, so if you stop paying, the bank can repossess it.</p><p><strong>Key terms:</strong> <strong>LTV</strong> (loan ÷ value. Lower is safer for the bank, often a better rate); <strong>Prime rate</strong> (set by the SARB's repo rate; your bond is prime ± a spread for your credit risk); <strong>First Home Finance</strong> (formerly FLISP: a government subsidy for first-time buyers earning R3 501–R22 000/month that reduces your bond). Your actual rate depends on prime and your profile, so always stress-test against rate rises.</p>",
  },
  { slot: "property/lesson-2/ltv-what" },
  { slot: "property/lesson-2/ltv-deposit" },
  { slot: "property/lesson-2/prime" },
  { slot: "property/lesson-2/first-home-finance" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 3 · "Deposit Requirements"
// ═══════════════════════════════════════════════════════════════════════════

const lesson3Slots: QuestionSlot[] = [
  {
    slotId: "property/lesson-3/deposit-range",
    conceptId: "home-affordability",
    variants: [
      {
        variantId: "dr-mcq",
        step: {
          type: "mcq",
          question: "What deposit do most SA banks typically want on a home loan?",
          options: [
            "Around 10 to 20%",
            "Exactly 50% of it",
            "Nothing at all, ever",
            "The full price in cash",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Usually 10–20%, though 100% bonds exist for strong credit profiles. A bigger deposit means a smaller loan and often a better rate.",
            incorrect: "It's usually 10–20%. 100% bonds exist for strong profiles, but a deposit lowers your loan and improves your rate.",
          },
        },
      },
      {
        variantId: "dr-calc-fill",
        step: {
          type: "fill-blank",
          title: "The 10% deposit",
          prompt: "A property is listed at R1 200 000. A 10% deposit is R____.",
          correct: 120000,
          feedback: {
            correct: "Correct: 10% of R1 200 000 = R120 000, and remember you still need transfer and bond-registration costs on top.",
            incorrect: "10% of R1 200 000 = R120 000 (plus separate cash for transfer and registration costs).",
          },
        },
      },
      {
        variantId: "dr-plus-costs-tf",
        step: {
          type: "true-false",
          statement: "Your deposit is the only upfront cash you need to buy a home.",
          correct: false,
          feedback: {
            correct: "Correct. On top of the deposit you need transfer duty (above R1 210 000), bond registration and transfer attorney fees, often R80k–R150k more.",
            incorrect: "There's more than the deposit: transfer duty, bond registration and transfer fees can add tens of thousands upfront.",
          },
        },
      },
    ],
  },
  {
    slotId: "property/lesson-3/deposit-benefits",
    conceptId: "home-affordability",
    variants: [
      {
        variantId: "db-mcq-prop",
        step: {
          type: "mcq",
          question: "Which is a benefit of putting down a bigger deposit?",
          options: [
            "A smaller loan and better rate",
            "A larger loan, higher repayment",
            "You lose the deposit money",
            "The bank charges you extra",
          ],
          correct: 0,
          feedback: {
            correct: "Right. More deposit = less borrowed = lower repayment, plus a lower LTV that often earns a better rate. It also gives you instant equity.",
            incorrect: "A bigger deposit shrinks the loan and repayment and usually improves the rate, and builds immediate equity.",
          },
        },
      },
      {
        variantId: "db-save-scenario",
        step: {
          type: "scenario",
          question: "Where should Lerato save a house deposit she'll use in about two years?",
          options: [
            "A separate accessible account",
            "In volatile single company shares",
            "Hidden under her bedroom mattress",
            "Spent slowly, just to enjoy it",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A two-year deposit needs stability and access, not market risk. Automate a debit order into a separate savings account so it grows untouched.",
            incorrect: "Keep a short-horizon deposit stable and separate, a money-market or notice account, automated. Shares could dip right when she needs it.",
          },
        },
      },
      {
        variantId: "db-equity-tf",
        step: {
          type: "true-false",
          statement: "A deposit gives you immediate equity. A stake in the property you own from day one.",
          correct: true,
          feedback: {
            correct: "True. Put down R200 000 and you own that much of the home outright immediately, rather than owing the full price to the bank.",
            incorrect: "It's true. Your deposit is instant equity. It's the portion of the home that's yours, not the bank's, from the start.",
          },
        },
      },
    ],
  },
  {
    slotId: "property/lesson-3/aip",
    conceptId: "home-affordability",
    variants: [
      {
        variantId: "aip-tf",
        step: {
          type: "true-false",
          statement: "An Approval in Principle (AIP) guarantees your home loan will be approved.",
          correct: false,
          feedback: {
            correct: "Correct. An AIP is a preliminary indication based on your declared income and credit. Full approval still depends on the specific property's valuation and verified documents.",
            incorrect: "It's an indication, not a guarantee. The bank still does a full assessment once you make an offer on a specific property.",
          },
        },
      },
      {
        variantId: "aip-why-mcq",
        step: {
          type: "mcq",
          question: "Why is getting an AIP before house-hunting useful?",
          options: [
            "It shows what you can afford",
            "It removes the need for a deposit",
            "It locks in your rate for life",
            "It's a legal contract to buy",
          ],
          correct: 0,
          feedback: {
            correct: "Right. An AIP (from a bank or originator like ooba or BetterBond) tells you your budget and signals to sellers that you're a serious buyer.",
            incorrect: "It clarifies your budget and strengthens your offer. It's not a rate lock, a deposit waiver, or a purchase contract.",
          },
        },
      },
      {
        variantId: "aip-guarantor-tf",
        step: {
          type: "true-false",
          statement: "A guarantor who stands surety on your bond becomes liable if you default.",
          correct: true,
          feedback: {
            correct: "True. A guarantor can help a thin credit profile, but they take on real risk, if you can't pay, the bank can pursue them. Only ask someone who understands that.",
            incorrect: "It's true. A guarantor is on the hook if you default. It's a serious favour to ask, not a formality.",
          },
        },
      },
    ],
  },
  {
    slotId: "property/lesson-3/hundred-pct",
    conceptId: "home-affordability",
    variants: [
      {
        variantId: "hp-tf",
        step: {
          type: "true-false",
          statement: "A 100% bond (no deposit) usually comes with a higher interest rate than a bond with a deposit.",
          correct: true,
          feedback: {
            correct: "True. No deposit means a 100% LTV: maximum risk for the bank, so it prices the rate higher. A deposit almost always saves you money over time.",
            incorrect: "It's true. A 100% bond is the bank's riskiest, so it usually carries a higher rate. A deposit lowers both the loan and the rate.",
          },
        },
      },
      {
        variantId: "hp-scenario",
        step: {
          type: "scenario",
          question: "Thabo qualifies for a 100% bond but could save 10% first. Purely on cost, which is usually cheaper long-term?",
          options: [
            "Saving a deposit first",
            "The 100% bond, always",
            "They cost exactly the same",
            "Neither, renting forever",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A deposit shrinks the loan AND tends to lower the rate, so it usually costs far less over 20 years than a 100% bond.",
            incorrect: "A deposit is usually cheaper long-term: less borrowed and a better rate. The 100% bond's convenience has a real price.",
          },
        },
      },
      {
        variantId: "hp-when-mcq",
        step: {
          type: "mcq",
          question: "When might a 100% bond still make sense despite the higher rate?",
          options: [
            "When waiting costs more",
            "Always, deposits are pointless",
            "Never, under any circumstances",
            "Only for luxury homes",
          ],
          correct: 0,
          feedback: {
            correct: "Right. It's a trade-off. If saving a deposit would take years of rising prices and rent, a 100% bond can be reasonable. Just go in with eyes open.",
            incorrect: "It can make sense when the cost of waiting (rent + price rises) outweighs the rate premium. It's a judgement call, not never/always.",
          },
        },
      },
    ],
  },
];

const lesson3Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Why Your Deposit Changes Everything",
    content:
      "<p>Most SA banks want a deposit of <strong>10–20%</strong> of the purchase price, though 100% bonds exist for strong credit profiles. A bigger deposit means a lower monthly repayment, often a better rate (lower LTV), and immediate equity.</p><p>Save it in a separate accessible account (money-market or 32-day notice), automated on payday. Get an <strong>Approval in Principle</strong> from a bank or originator (ooba, BetterBond) before you make an offer. It tells you your budget and makes your offer credible. Remember: on top of the deposit you'll need transfer and bond-registration costs.</p>",
  },
  { slot: "property/lesson-3/deposit-range" },
  { slot: "property/lesson-3/deposit-benefits" },
  { slot: "property/lesson-3/aip" },
  { slot: "property/lesson-3/hundred-pct" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 4 · "Hidden Costs of Homeownership"
// ═══════════════════════════════════════════════════════════════════════════

const lesson4Slots: QuestionSlot[] = [
  {
    slotId: "property/lesson-4/transfer-duty-threshold",
    conceptId: "transfer-duty",
    variants: [
      {
        variantId: "tdt-tf",
        step: {
          type: "true-false",
          statement: "Transfer duty is payable on every property purchase, regardless of price.",
          correct: false,
          feedback: {
            correct: "Correct. Properties up to R1 210 000 are exempt. Above that, transfer duty applies on a sliding scale, only on the amount over the threshold.",
            incorrect: "There's a threshold: purchases up to R1 210 000 pay no transfer duty. The tax only applies above that, on a sliding scale.",
          },
        },
      },
      {
        variantId: "tdt-threshold-mcq",
        step: {
          type: "mcq",
          question: "Below what purchase price is a property exempt from transfer duty (2026/27)?",
          options: ["R1 210 000", "R500 000", "R2 000 000", "None"],
          correct: 0,
          feedback: {
            correct: "Right. Buy at R1 210 000 or less and you pay zero transfer duty. Only the amount above the threshold is taxed.",
            incorrect: "The exemption threshold is R1 210 000. At or below that, transfer duty is zero.",
          },
        },
      },
      {
        variantId: "tdt-who-mcq",
        step: {
          type: "mcq",
          question: "Who pays transfer duty when a property is sold?",
          options: [
            "The buyer",
            "The seller",
            "The estate agent",
            "The municipality",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The buyer pays transfer duty, calculated on the purchase price (or market value if higher). Budget for it as upfront cash.",
            incorrect: "The buyer pays it, on the purchase price or market value, whichever is higher. Plan for it as an upfront cost.",
          },
        },
      },
    ],
  },
  {
    slotId: "property/lesson-4/transfer-duty-calc",
    conceptId: "transfer-duty",
    variants: [
      {
        variantId: "tdc-fill",
        step: {
          type: "fill-blank",
          title: "Transfer duty on R1.5m",
          prompt: "On a R1 500 000 home, transfer duty is 3% of the amount above R1 210 000. That's 3% × R290 000 = R____.",
          correct: 8700,
          feedback: {
            correct: "Correct: 3% × (R1 500 000 − R1 210 000) = 3% × R290 000 = R8 700. Only the slice above the threshold is taxed.",
            incorrect: "Only the amount over R1 210 000 is taxed at 3%: 3% × R290 000 = R8 700.",
          },
        },
      },
      {
        variantId: "tdc-under-threshold-scenario",
        step: {
          type: "scenario",
          question: "Sipho buys a home for R1 100 000. How much transfer duty does he pay?",
          options: [
            "R0.",
            "R33 000",
            "3% of the full price",
            "R8 700",
          ],
          correct: 0,
          feedback: {
            correct: "Right. R1 100 000 is under the R1 210 000 threshold, so transfer duty is zero. He still has bond-registration and transfer attorney fees, though.",
            incorrect: "Below R1 210 000, transfer duty is R0. (He'll still pay registration and transfer fees separately.)",
          },
        },
      },
      {
        variantId: "tdc-only-above-tf",
        step: {
          type: "true-false",
          statement: "Transfer duty is charged only on the portion of the price above the exemption threshold, not the whole price.",
          correct: true,
          feedback: {
            correct: "True. It's a sliding scale: the first R1 210 000 is free, and only the amount above it is taxed (starting at 3%). That keeps the duty modest near the threshold.",
            incorrect: "It's true. Like income tax, it's marginal. Only the slice above R1 210 000 is taxed, not the entire purchase price.",
          },
        },
      },
    ],
  },
  {
    slotId: "property/lesson-4/once-vs-ongoing",
    conceptId: "transfer-duty",
    variants: [
      {
        variantId: "ovo-mcq",
        step: {
          type: "mcq",
          question: "Which of these is a ONCE-OFF cost when buying a property?",
          options: [
            "Transfer duty",
            "Monthly municipal rates",
            "Monthly levies",
            "Home insurance premiums",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Transfer duty is paid once, at purchase. Rates, levies and insurance are ongoing monthly costs for as long as you own.",
            incorrect: "Transfer duty is once-off at purchase. Rates, levies and insurance recur every month.",
          },
        },
      },
      {
        variantId: "ovo-registration-tf",
        step: {
          type: "true-false",
          statement: "Bond registration and transfer attorney fees are once-off costs paid when you buy.",
          correct: true,
          feedback: {
            correct: "True. These attorney fees (often tens of thousands, scaling with the price) are paid upfront at purchase: separate from, and on top of, your deposit.",
            incorrect: "It's true. Bond registration and transfer fees are once-off purchase costs, paid to attorneys on top of your deposit.",
          },
        },
      },
      {
        variantId: "ovo-budget-scenario",
        step: {
          type: "scenario",
          question: "Nomsa saved exactly a 10% deposit and nothing more. What has she likely forgotten?",
          options: [
            "The transfer and bond costs",
            "Nothing, the deposit covers it",
            "That she pays the seller's rates",
            "That deposits are refundable",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Buyers routinely forget the once-off costs. On top of the deposit, transfer and registration can add R80k–R150k. Cash she needs ready.",
            incorrect: "She's forgotten the upfront transfer and registration costs, often R80k–R150k more than the deposit alone.",
          },
        },
      },
    ],
  },
  {
    slotId: "property/lesson-4/maintenance",
    conceptId: "transfer-duty",
    variants: [
      {
        variantId: "mn-fill",
        step: {
          type: "fill-blank",
          title: "The maintenance reserve",
          prompt: "A common rule is to budget about 1% of your home's value per year for maintenance. On a R1 500 000 home that's R____ a year.",
          correct: 15000,
          feedback: {
            correct: "Correct: 1% × R1 500 000 = R15 000 a year (about R1 250/month) for repairs and upkeep. Renters don't pay this; owners do.",
            incorrect: "1% × R1 500 000 = R15 000 a year set aside for maintenance.",
          },
        },
      },
      {
        variantId: "mn-owner-tf",
        step: {
          type: "true-false",
          statement: "As a homeowner, repairs and maintenance are your cost. There's no landlord to call.",
          correct: true,
          feedback: {
            correct: "True. A burst geyser, a leaking roof, a failing gate motor, all yours to fund. Budgeting ~1% of value a year stops these becoming debt.",
            incorrect: "It's true: owners carry all maintenance. Setting aside ~1% of the home's value yearly keeps surprise repairs off a credit card.",
          },
        },
      },
      {
        variantId: "mn-forget-scenario",
        step: {
          type: "scenario",
          question: "Thabo budgets his bond, rates and insurance but nothing for maintenance. What's the risk?",
          options: [
            "A big repair lands on credit",
            "Nothing, homes never need repairs",
            "The bank pays for repairs",
            "Maintenance is always entirely free",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Without a maintenance reserve, the inevitable repair becomes expensive debt. A monthly set-aside turns a crisis into a planned cost.",
            incorrect: "The risk is funding repairs with debt. A maintenance reserve (~1% of value a year) is what keeps a big repair from hurting.",
          },
        },
      },
    ],
  },
];

const lesson4Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "The Costs Nobody Tells You About",
    content:
      "<p>The purchase price is just the start. <strong>Once-off:</strong> transfer duty (only above R1 210 000. E.g. on R1.5m it's 3% of the R290 000 above the threshold = R8 700), bond registration and transfer attorney fees (often tens of thousands), plus moving costs. <strong>Ongoing:</strong> municipal rates, levies (sectional title), home insurance, and a maintenance reserve of about 1% of the property's value per year (R15 000/year on a R1.5m home).</p><p>Together, upfront extras can add R80 000–R150 000, and ongoing costs R2 000–R6 000/month, on top of the bond.</p>",
  },
  { slot: "property/lesson-4/transfer-duty-threshold" },
  { slot: "property/lesson-4/transfer-duty-calc" },
  { slot: "property/lesson-4/once-vs-ongoing" },
  { slot: "property/lesson-4/maintenance" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 5 · "When Renting Makes Sense"
// ═══════════════════════════════════════════════════════════════════════════

const lesson5Slots: QuestionSlot[] = [
  {
    slotId: "property/lesson-5/not-wasted",
    conceptId: "bond-vs-rent",
    variants: [
      {
        variantId: "nw-tf",
        step: {
          type: "true-false",
          statement: "Paying rent every month means you have nothing to show for it financially.",
          correct: false,
          feedback: {
            correct: "Correct. Rent buys housing, flexibility, no maintenance costs, and the freedom to invest your deposit capital elsewhere, potentially out-earning property.",
            incorrect: "'Rent is dead money' is a myth. It buys housing and flexibility, and frees your capital to invest, sometimes for a better return than property.",
          },
        },
      },
      {
        variantId: "nw-value-mcq",
        step: {
          type: "mcq",
          question: "What real value does renting provide?",
          options: [
            "Flexibility",
            "Nothing at all of value",
            "Guaranteed wealth building",
            "Ownership of the property",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Renting isn't 'throwing money away'. It's paying for housing and flexibility while your would-be deposit works elsewhere.",
            incorrect: "Renting buys housing, flexibility and freedom from maintenance, and lets your capital invest elsewhere. That's real value.",
          },
        },
      },
      {
        variantId: "nw-myth-tf",
        step: {
          type: "true-false",
          statement: "Whether renting or buying is 'smarter' depends on your circumstances, not a one-size-fits-all rule.",
          correct: true,
          feedback: {
            correct: "True. Your timeframe, city, the price-to-rent ratio and your discipline to invest all matter. 'Always buy' is a myth, not a law.",
            incorrect: "It's true. The right answer depends on your situation. Neither renting nor buying is universally smarter.",
          },
        },
      },
    ],
  },
  {
    slotId: "property/lesson-5/short-stay",
    conceptId: "bond-vs-rent",
    variants: [
      {
        variantId: "ss-mcq",
        step: {
          type: "mcq",
          question: "What's the main financial risk of buying a home you plan to sell within about two years?",
          options: [
            "Costs may exceed growth",
            "Values always fall over two years",
            "You can never rent it out",
            "Bond rates are fixed, you overpay",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Buying and selling costs (transfer duty, registration, and 5–6% agent commission) can total R100k–R200k. The price must jump a lot just to break even.",
            incorrect: "It's the transaction costs. Duty, fees and agent commission can swallow a short-term gain and more, so a quick sale often loses money.",
          },
        },
      },
      {
        variantId: "ss-breakeven-tf",
        step: {
          type: "true-false",
          statement: "Because buying and selling a home is expensive, ownership usually needs several years to break even.",
          correct: true,
          feedback: {
            correct: "True. The upfront and exit costs are large, so it typically takes years of price growth to recover them. Short stays favour renting.",
            incorrect: "It's true. High transaction costs mean buying often takes several years to beat renting. A short horizon tilts toward renting.",
          },
        },
      },
      {
        variantId: "ss-mobile-scenario",
        step: {
          type: "scenario",
          question: "Ayesha expects to move cities for work within two years. Rent or buy?",
          options: [
            "Rent, costs won't be recovered",
            "Buy, always buy property",
            "Buy two properties instead",
            "Buy and leave it standing empty",
          ],
          correct: 0,
          feedback: {
            correct: "Right. With a two-year horizon, the costs of buying then selling would probably wipe out any gain. Renting keeps her flexible and better off.",
            incorrect: "For a two-year stay, renting wins. Buying-and-selling costs would likely exceed any price growth. Flexibility is worth more here.",
          },
        },
      },
    ],
  },
  {
    slotId: "property/lesson-5/opportunity-cost",
    conceptId: "bond-vs-rent",
    variants: [
      {
        variantId: "oc-mcq",
        step: {
          type: "mcq",
          question: "What is the 'opportunity cost' of tying up a big deposit in a home?",
          options: [
            "The forgone investment return",
            "The estate agent's fee",
            "The cost of moving boxes",
            "Nothing, deposits have no cost",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A deposit reduces your loan, but the same money invested in a diversified fund might have grown faster. Weigh both uses of the capital.",
            incorrect: "It's what the deposit could have earned invested elsewhere. That foregone growth is the real opportunity cost.",
          },
        },
      },
      {
        variantId: "oc-invest-scenario",
        step: {
          type: "scenario",
          question: "R200 000 could be a deposit, or invested in a diversified equity fund. What's the honest way to decide?",
          options: [
            "Compare the two uses",
            "Always use it as a deposit",
            "Always invest it, never buy",
            "Spend it now while you can",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Property gives leverage and a home; investing may give higher returns. The answer depends on your city, expected returns and timeline. Compare them.",
            incorrect: "There's no automatic answer. Compare the likely wealth from each path for your situation. Both a deposit and investing have merit.",
          },
        },
      },
      {
        variantId: "oc-yield-tf",
        step: {
          type: "true-false",
          statement: "Residential rental yields in SA are often below 6%, sometimes less than a money-market account pays.",
          correct: true,
          feedback: {
            correct: "True. R7 000/month rent on a R1.5m property is a 5.6% gross yield, and that's before costs. It's why buy-to-let isn't automatically a great investment.",
            incorrect: "It's true. Residential yields are frequently under 6%. Property's appeal is leverage and lifestyle, not always raw income return.",
          },
        },
      },
    ],
  },
  {
    slotId: "property/lesson-5/flexibility",
    conceptId: "bond-vs-rent",
    variants: [
      {
        variantId: "fx-mcq",
        step: {
          type: "mcq",
          question: "Which is a genuine advantage of renting over owning?",
          options: [
            "Flexibility to move easily",
            "Building equity in the property",
            "Freedom to renovate structurally",
            "Immunity to rent increases",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Renting lets you move on short notice without the cost and delay of selling. Valuable when your life or career might change.",
            incorrect: "Flexibility is renting's edge. Owning builds equity but ties you down; selling to move is slow and costly.",
          },
        },
      },
      {
        variantId: "fx-nomaint-tf",
        step: {
          type: "true-false",
          statement: "A renter generally isn't responsible for major maintenance costs like a burst geyser or roof repairs.",
          correct: true,
          feedback: {
            correct: "True. Structural and major repairs are typically the landlord's problem, not the tenant's. That's one less financial risk renters carry.",
            incorrect: "It's true. Big maintenance is usually the landlord's cost. Renters swap equity for freedom from those repair bills.",
          },
        },
      },
      {
        variantId: "fx-stretch-scenario",
        step: {
          type: "scenario",
          question: "Buying would leave Sipho dangerously stretched, with no emergency buffer. What's the sensible call for now?",
          options: [
            "Rent and keep building savings",
            "Buy anyway and hope for the best",
            "Buy with a 100% bond, no buffer",
            "Never consider buying again",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Buying while stretched thin is how people lose homes. Renting affordably now, while he builds a buffer, sets him up to buy safely later.",
            incorrect: "If buying would leave no buffer, renting for now is wiser. Build savings first, then buy from a position of strength.",
          },
        },
      },
    ],
  },
];

const lesson5Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Renting Is Not Wasted Money",
    content:
      "<p>The idea that renting is 'throwing money away' is one of the most damaging money myths. Renting is often the smarter choice. When you might move within a few years (transaction costs take years to recover), when your deposit could earn more invested elsewhere, in a high price-to-rent city, when you value flexibility, or when buying would stretch you dangerously thin.</p><p>Think about opportunity cost: R200 000 as a deposit lowers your loan, but the same R200 000 invested at ~10%/year could grow to about R520 000 in 10 years. And residential rental yields are often under 6%: sometimes less than a money-market account. The right answer depends on your circumstances.</p>",
  },
  { slot: "property/lesson-5/not-wasted" },
  { slot: "property/lesson-5/short-stay" },
  { slot: "property/lesson-5/opportunity-cost" },
  { slot: "property/lesson-5/flexibility" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 6 · "True Cost Comparison"
// ═══════════════════════════════════════════════════════════════════════════

const lesson6Slots: QuestionSlot[] = [
  {
    slotId: "property/lesson-6/key-assumption",
    conceptId: "bond-vs-rent",
    variants: [
      {
        variantId: "ka-mcq",
        step: {
          type: "mcq",
          question: "What key assumption makes the 'buying is always better' argument work?",
          options: [
            "That the renter spends it",
            "That interest rates always fall",
            "That property grows 10% a year",
            "That rent never increases",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The buying case wins only if the renter wastes the difference. A disciplined renter who invests the saving can build equal or greater wealth.",
            incorrect: "It hinges on the renter spending, not investing, the monthly saving. Invest that gap and renting can match or beat buying.",
          },
        },
      },
      {
        variantId: "ka-discipline-tf",
        step: {
          type: "true-false",
          statement: "The 'rent and invest the difference' strategy only works if you actually invest the difference.",
          correct: true,
          feedback: {
            correct: "True. On paper the renter-investor can come out ahead, but only with the discipline to invest the monthly saving every month, not spend it.",
            incorrect: "It's true. Discipline is the whole game. Rent-and-invest beats buying only if the savings are genuinely invested, consistently.",
          },
        },
      },
      {
        variantId: "ka-scenario",
        step: {
          type: "scenario",
          question: "Lerato rents for R9 500 instead of a R18 000 all-in bond, but spends the R8 500 difference each month. How does she end up?",
          options: [
            "Worse off, she built no wealth",
            "Automatically richer than a buyer",
            "Exactly the same as a buyer",
            "She owns the flat after a year",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Renting only beats buying if she invests the difference. Spending it means she gets flexibility but no offsetting wealth, the worst of both.",
            incorrect: "Spending the difference defeats the strategy. Renting-and-investing only works if the R8 500 is invested, not spent.",
          },
        },
      },
    ],
  },
  {
    slotId: "property/lesson-6/jse-vs-property",
    conceptId: "bond-vs-rent",
    variants: [
      {
        variantId: "jvp-tf",
        step: {
          type: "true-false",
          statement: "In South Africa, residential property has historically outperformed the JSE as a long-term investment.",
          correct: false,
          feedback: {
            correct: "Correct. The JSE All Share has historically returned around 12–14% a year over long periods, ahead of residential property's roughly 6–8% appreciation.",
            incorrect: "It's the other way round. The JSE has historically outperformed residential property; property's appeal is leverage, lifestyle and tangibility.",
          },
        },
      },
      {
        variantId: "jvp-why-mcq",
        step: {
          type: "mcq",
          question: "If shares have historically returned more than property, why do people still buy homes?",
          options: [
            "Leverage, security and a home",
            "Property always beats shares",
            "Because shares are illegal",
            "There's no reason to buy a home",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A home isn't only an investment. It's where you live, plus you buy it with leverage (a bond) and it forces a kind of saving. Return isn't the whole story.",
            incorrect: "It's about more than return: a home gives you somewhere to live, uses leverage, and enforces saving. Those are real, non-financial reasons.",
          },
        },
      },
      {
        variantId: "jvp-leverage-tf",
        step: {
          type: "true-false",
          statement: "One reason property can build wealth despite lower returns is leverage: you control a large asset with a smaller deposit.",
          correct: true,
          feedback: {
            correct: "True. Put down R150k on a R1.5m home and you gain (or lose) on the full R1.5m. Leverage amplifies returns, and risk, which is part of property's appeal.",
            incorrect: "It's true. Leverage is key. A small deposit controls a big asset, so even modest price growth works on the full value. It cuts both ways, though.",
          },
        },
      },
    ],
  },
  {
    slotId: "property/lesson-6/depends",
    conceptId: "bond-vs-rent",
    variants: [
      {
        variantId: "dp-mcq-prop",
        step: {
          type: "mcq",
          question: "What's the honest conclusion of a rent-vs-buy comparison?",
          options: [
            "It depends on the situation",
            "Buying always wins in the end",
            "Renting always wins",
            "It's impossible to compare fairly",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The maths swings on your assumptions. A disciplined investor in a pricey city may rent; a long-term settler in an affordable one may buy. Run YOUR numbers.",
            incorrect: "There's no universal winner. It depends on your circumstances. City, expected returns, how long you'll stay, and your discipline to invest.",
          },
        },
      },
      {
        variantId: "dp-longstay-scenario",
        step: {
          type: "scenario",
          question: "Thabo plans to settle in one town for 20+ years and isn't a disciplined investor. What likely suits him?",
          options: [
            "Buying, he'll stay long",
            "Renting forever, definitely",
            "Moving house every year",
            "Never having a home at all",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Over 20+ years the transaction costs are recovered, and a bond enforces saving he might not do otherwise. For him, buying fits.",
            incorrect: "For a long-term settler who won't invest diligently, buying often wins. Time recovers the costs and the bond forces saving.",
          },
        },
      },
      {
        variantId: "dp-run-numbers-tf",
        step: {
          type: "true-false",
          statement: "The best way to settle rent-vs-buy for yourself is to run the actual numbers for your situation.",
          correct: true,
          feedback: {
            correct: "True. General rules argue both ways. Plug in your rent, bond, costs, expected returns and how long you'll stay. The honest answer falls out of your own maths.",
            incorrect: "It's true. Don't rely on slogans. Run your own numbers (rent, costs, returns, timeline) to see which wins for you.",
          },
        },
      },
    ],
  },
  {
    slotId: "property/lesson-6/leverage-risk",
    conceptId: "bond-vs-rent",
    variants: [
      {
        variantId: "lr-tf",
        step: {
          type: "true-false",
          statement: "Leverage on a home magnifies gains when prices rise, but also magnifies losses when they fall.",
          correct: true,
          feedback: {
            correct: "True. Leverage cuts both ways: a small deposit on a big asset boosts your return if prices climb, but a price drop can wipe out your equity fast.",
            incorrect: "It's true, leverage amplifies both directions. The same force that boosts gains in a rising market deepens losses in a falling one.",
          },
        },
      },
      {
        variantId: "lr-negative-equity-mcq",
        step: {
          type: "mcq",
          question: "What is 'negative equity' on a home?",
          options: [
            "Owing more than it's worth",
            "When your home is fully paid off",
            "When interest rates fall",
            "When you have a big deposit",
          ],
          correct: 0,
          feedback: {
            correct: "Right. If prices drop below your outstanding loan, you're in negative equity. Selling wouldn't clear the bond. A deposit and not over-paying reduce this risk.",
            incorrect: "It's owing more than the home is worth. A price fall below your loan puts you there, a real risk of buying with little deposit at a stretched price.",
          },
        },
      },
      {
        variantId: "lr-buffer-scenario",
        step: {
          type: "scenario",
          question: "Given leverage cuts both ways, how does a buyer reduce the downside risk?",
          options: [
            "Put down a decent deposit",
            "Take the biggest 100% bond",
            "Buy at the top of their budget",
            "Skip insurance to save",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A solid deposit and a sensible price give you an equity cushion, so a market dip is less likely to trap you in negative equity.",
            incorrect: "A deposit and not over-paying build a cushion against price falls. Maxing out with a 100% bond does the opposite.",
          },
        },
      },
    ],
  },
];

const lesson6Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "The Numbers Tell the Real Story",
    content:
      "<p>Compare renting vs buying the same R1 500 000 home over 20 years. <strong>Buying</strong> (R150k deposit, a bond plus rates, insurance and maintenance, ~R120k upfront costs) leaves you with a paid-off asset, but you've paid far more out of pocket along the way. <strong>Renting and investing</strong> the monthly difference (and the upfront costs) at ~10%/year can build a comparable or larger portfolio.</p><p>In many SA markets, a disciplined renter-investor ends up with equal or greater wealth, but only if they actually invest the savings. Property's edge is leverage, lifestyle and forced saving. Neither answer is universally right; it depends on your city, returns, timeline and discipline.</p>",
  },
  { slot: "property/lesson-6/key-assumption" },
  { slot: "property/lesson-6/jse-vs-property" },
  { slot: "property/lesson-6/depends" },
  { slot: "property/lesson-6/leverage-risk" },
];

export const PROPERTY_BANKS: Record<string, LessonBank> = {
  "property::lesson-1": { layout: lesson1Layout, slots: lesson1Slots },
  "property::lesson-2": { layout: lesson2Layout, slots: lesson2Slots },
  "property::lesson-3": { layout: lesson3Layout, slots: lesson3Slots },
  "property::lesson-4": { layout: lesson4Layout, slots: lesson4Slots },
  "property::lesson-5": { layout: lesson5Layout, slots: lesson5Slots },
  "property::lesson-6": { layout: lesson6Layout, slots: lesson6Slots },
};
