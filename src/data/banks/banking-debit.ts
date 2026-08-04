import type { LessonLayoutItem, QuestionSlot } from "@/data/content";
import type { LessonBank } from "./money-basics";

/**
 * Bank for the Banking & Debit Orders course. Per docs/QUESTION-VOICE-GUIDE.md:
 * every lesson has 4 slots (>3 questions), each a pool of distinct SA scenarios,
 * all concept-tagged for spaced-repetition resurface.
 */

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 1 · "Choosing a Bank Account"
// ═══════════════════════════════════════════════════════════════════════════

const lesson1Slots: QuestionSlot[] = [
  {
    slotId: "banking-debit/lesson-1/what-matters",
    conceptId: "bank-account-types",
    variants: [
      {
        variantId: "matters-fees",
        step: {
          type: "mcq",
          question: "Which factor matters most when choosing a bank account for everyday use?",
          options: [
            "Total monthly fees and transaction costs",
            "The colour of the card",
            "How many branches the bank has",
            "Whether your friends use the same bank",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. Over a year, the gap between a R0 and a R150/month account is R1 800: real money for something you barely notice.",
            incorrect:
              "Fees are what matter. R150/month in charges is R1 800 a year you could keep instead.",
          },
        },
      },
      {
        variantId: "matters-lerato-cash",
        step: {
          type: "scenario",
          question:
            "Lerato draws cash from an ATM three times a week. When comparing accounts, what should she look at hardest?",
          options: [
            "The cost per ATM withdrawal",
            "The card design",
            "The bank's TV adverts",
            "Whether the branch has nice chairs",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. Match the account to how you actually bank. At R10+ a withdrawal, three a week is R120+ a month, that fee dominates her choice.",
            incorrect:
              "Pick the fee that hits her most. Three ATM draws a week means the per-withdrawal cost is the number that matters.",
          },
        },
      },
      {
        variantId: "matters-total-cost-tf",
        step: {
          type: "true-false",
          statement:
            "A 'free' account with high transaction fees can end up costing more than a paid account with low ones.",
          correct: true,
          feedback: {
            correct:
              "True. 'No monthly fee' means little if every swipe and withdrawal is charged. Compare the total cost for how YOU bank.",
            incorrect:
              "It's true, a R0 monthly fee with pricey transactions can beat a cheap-per-transaction account only if you barely transact. Compare totals.",
          },
        },
      },
    ],
  },
  {
    slotId: "banking-debit/lesson-1/digital-vs-big4",
    conceptId: "bank-account-types",
    variants: [
      {
        variantId: "d4-lower-fees-tf",
        step: {
          type: "true-false",
          statement:
            "The big four banks typically charge lower monthly fees than digital-first banks like TymeBank.",
          correct: false,
          feedback: {
            correct:
              "Correct. It's the reverse. TymeBank and Capitec are known for undercutting the big four on fees.",
            incorrect:
              "It's the other way round: digital-first banks like TymeBank and Capitec usually charge far less than the big four.",
          },
        },
      },
      {
        variantId: "d4-why-cheaper",
        step: {
          type: "mcq",
          question: "Why can digital-first banks charge so much less than traditional banks?",
          options: [
            "They don't run expensive branch networks",
            "They aren't properly regulated",
            "They pay their staff nothing",
            "They secretly charge you elsewhere",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. No branches means far lower overheads. That's the saving that shows up as low or zero fees for you.",
            incorrect:
              "It's the branch overhead. Digital banks skip the physical network and pass those savings to customers as lower fees.",
          },
        },
      },
      {
        variantId: "d4-sipho-choice",
        step: {
          type: "scenario",
          question:
            "Sipho banks almost entirely on his phone and taps to pay. Which type of account likely suits him best?",
          options: [
            "A low-fee digital account",
            "A premium account with a big branch network",
            "Whichever has the most ATMs",
            "The one with the fanciest card",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. If he rarely needs a branch, he shouldn't pay for one. A low-fee digital account fits how he actually banks.",
            incorrect:
              "For an app-and-tap user, a low-fee digital account is the match. He's paying nothing for branches he never uses.",
          },
        },
      },
    ],
  },
  {
    slotId: "banking-debit/lesson-1/fee-impact",
    conceptId: "bank-fees",
    variants: [
      {
        variantId: "impact-fill-year",
        step: {
          type: "fill-blank",
          title: "Fees over a year",
          prompt: "You pay R150 a month in bank fees. Over 12 months that's R____.",
          correct: 1800,
          feedback: {
            correct: "Correct: R150 × 12 = R1 800 a year. Close to a full month's groceries for many households.",
            incorrect: "R150 × 12 = R1 800 a year.",
          },
        },
      },
      {
        variantId: "impact-mcq",
        step: {
          type: "mcq",
          question: "Switching from a R150/month account to a R0/month account saves you about:",
          options: ["R1 800 a year", "R150 a year", "R18 a year", "Nothing"],
          correct: 0,
          feedback: {
            correct: "Right. R150 × 12 = R1 800 a year: for the same everyday banking.",
            incorrect: "It's R150 × 12 = R1 800 a year, just from the monthly fee.",
          },
        },
      },
      {
        variantId: "impact-worth-tf",
        step: {
          type: "true-false",
          statement:
            "Bank fees are small enough that they're not worth comparing between accounts.",
          correct: false,
          feedback: {
            correct:
              "Correct. R100–R200 a month is R1 200–R2 400 a year. Over a working life, that's tens of thousands, very much worth comparing.",
            incorrect:
              "They add up. A couple of hundred rand a month becomes thousands a year and a fortune over a lifetime. Always compare.",
          },
        },
      },
    ],
  },
  {
    slotId: "banking-debit/lesson-1/match-usage",
    conceptId: "bank-account-types",
    variants: [
      {
        variantId: "usage-best-account",
        step: {
          type: "mcq",
          question: "What makes an account 'the best' one?",
          options: [
            "It's the cheapest for the way you actually bank",
            "It's the one with the most adverts",
            "It's the most expensive, so it must be premium",
            "It's whichever your parents use",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. There's no universal 'best', only the cheapest fit for your habits (cash vs card, app vs branch).",
            incorrect:
              "'Best' just means cheapest for how you bank. Map your habits, then pick the account that charges least for them.",
          },
        },
      },
      {
        variantId: "usage-nomsa",
        step: {
          type: "scenario",
          question:
            "Nomsa gets paid in cash and deposits it, then withdraws small amounts often. Which cost should she weigh most?",
          options: [
            "Cash deposit and ATM withdrawal fees",
            "International forex rates",
            "The overdraft interest rate",
            "The cost of a replacement card",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. Her pattern is cash-heavy, so deposit and withdrawal fees will dominate what she pays. That's where to compare.",
            incorrect:
              "Match the fee to the habit. Depositing cash and drawing it in bits means deposit and withdrawal fees matter most for Nomsa.",
          },
        },
      },
      {
        variantId: "usage-review-tf",
        step: {
          type: "true-false",
          statement:
            "It's worth re-checking whether your bank account still suits you every year or two.",
          correct: true,
          feedback: {
            correct:
              "True. Fees change and so do your habits. A quick review can catch an account that's quietly become the wrong fit.",
            incorrect:
              "It's true: banks change fees and your usage shifts, so a periodic check keeps you from overpaying out of habit.",
          },
        },
      },
    ],
  },
];

const lesson1Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Not All Bank Accounts Are Equal",
    content:
      "<p>In South Africa you have options: Capitec, FNB, Standard Bank, Absa, Nedbank, TymeBank, Discovery Bank. Compare the things that actually cost you money:</p><ul><li><strong>Monthly fee:</strong> some charge R0, others R150+</li><li><strong>Transaction fees:</strong> per swipe, withdrawal, EFT</li><li><strong>Interest</strong> on a positive balance</li><li><strong>App quality</strong></li></ul>",
  },
  { slot: "banking-debit/lesson-1/what-matters" },
  { slot: "banking-debit/lesson-1/digital-vs-big4" },
  { slot: "banking-debit/lesson-1/fee-impact" },
  { slot: "banking-debit/lesson-1/match-usage" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 2 · "Understanding Bank Fees"
// ═══════════════════════════════════════════════════════════════════════════

const lesson2Slots: QuestionSlot[] = [
  {
    slotId: "banking-debit/lesson-2/worst-habit",
    conceptId: "bank-fees",
    variants: [
      {
        variantId: "worst-atm",
        step: {
          type: "mcq",
          question: "Which habit tends to increase your bank fees the most?",
          options: [
            "Withdrawing small amounts frequently from ATMs",
            "Using tap-to-pay at the till",
            "Having your salary paid in",
            "Checking your balance in the app",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. Each ATM withdrawal costs R5–R15, so lots of small draws stack up fast. Withdraw once, in a bigger amount.",
            incorrect:
              "Frequent small ATM withdrawals are the drain, R5–R15 each time. Card taps and balance checks are usually free.",
          },
        },
      },
      {
        variantId: "worst-lungi-scenario",
        step: {
          type: "scenario",
          question:
            "Lungile draws R200 from an ATM five times a week at R10 a time instead of one weekly withdrawal. What's the fix?",
          options: [
            "Withdraw once a week in one larger amount to pay one fee, not five",
            "Stop using her account",
            "Switch to withdrawing R50 ten times",
            "Only bank at branches",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. Five draws is R50/week (~R2 600/year) in fees; one draw is R10/week. Same cash, a fraction of the cost.",
            incorrect:
              "Fewer, bigger withdrawals cut the fee count. One weekly draw beats five, same money, one fee instead of five.",
          },
        },
      },
      {
        variantId: "worst-tap-tf",
        step: {
          type: "true-false",
          statement: "Tapping your card to pay is usually cheaper than drawing cash to pay.",
          correct: true,
          feedback: {
            correct:
              "True. Card taps are often free, while withdrawing cash to spend adds an ATM fee on top. Tapping skips that.",
            incorrect:
              "It's true. A card tap is usually free, whereas cash means paying an ATM fee first. Tap to skip the fee.",
          },
        },
      },
    ],
  },
  {
    slotId: "banking-debit/lesson-2/fee-types",
    conceptId: "bank-fees",
    variants: [
      {
        variantId: "types-declined",
        step: {
          type: "true-false",
          statement:
            "You can be charged a fee even when a transaction is declined for insufficient funds.",
          correct: true,
          feedback: {
            correct:
              "True, and it stings: many banks charge a declined-transaction fee. Keeping a small buffer avoids paying to fail.",
            incorrect:
              "It's true. A declined transaction can still cost you R5–R15. Keep a buffer so you're not charged for a payment that didn't go through.",
          },
        },
      },
      {
        variantId: "types-which-free",
        step: {
          type: "mcq",
          question: "Which of these is usually the CHEAPEST way to pay?",
          options: [
            "Tap-to-pay with your card",
            "Drawing cash at an ATM first",
            "A declined transaction",
            "Withdrawing cash at a branch teller",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. Tap-to-pay is often free. Cash withdrawals and teller services carry fees; a decline can cost you too.",
            incorrect:
              "Tap-to-pay is usually free. ATM and teller cash both add fees, and even a decline can be charged.",
          },
        },
      },
      {
        variantId: "types-statement-tf",
        step: {
          type: "true-false",
          statement:
            "Reading your bank's fee schedule (in the app or on their site) can save you real money.",
          correct: true,
          feedback: {
            correct:
              "True. Five minutes with the fee list shows which of your habits are being charged, and which cheaper option to switch to.",
            incorrect:
              "It's true. The fee schedule is boring but worth it. It reveals exactly which habits cost you and how to avoid them.",
          },
        },
      },
    ],
  },
  {
    slotId: "banking-debit/lesson-2/reduce-fees",
    conceptId: "bank-fees",
    variants: [
      {
        variantId: "reduce-how",
        step: {
          type: "mcq",
          question: "What's a simple way to cut your monthly bank fees?",
          options: [
            "Tap to pay and withdraw cash less often, in bigger amounts",
            "Withdraw small amounts several times a day",
            "Use the teller for everything",
            "Ignore your fee schedule",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. Tapping is often free, and fewer, larger cash withdrawals mean fewer fees. Two easy habits, real savings.",
            incorrect:
              "Tap more, withdraw cash less (and bigger when you do). That combination quietly cuts your monthly charges.",
          },
        },
      },
      {
        variantId: "reduce-fill",
        step: {
          type: "fill-blank",
          title: "The cost of ATM habits",
          prompt: "You make 8 ATM withdrawals a month at R12 each. That's R____ in fees for the month.",
          correct: 96,
          feedback: {
            correct: "Correct: 8 × R12 = R96 a month: about R1 152 a year just in withdrawal fees.",
            incorrect: "8 × R12 = R96 a month (roughly R1 152 a year).",
          },
        },
      },
      {
        variantId: "reduce-free-swipes",
        step: {
          type: "scenario",
          question:
            "Priya's bank gives free card swipes but charges for ATM cash. To pay less in fees, she should:",
          options: [
            "Tap her card wherever she can and draw cash rarely",
            "Draw all her salary as cash on payday",
            "Pay everyone in cash",
            "Use the ATM for every purchase",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. She should lean on the free thing (swipes) and minimise the charged thing (ATM cash). Match behaviour to the fee list.",
            incorrect:
              "Use what's free and avoid what's charged: tap her card, draw cash sparingly. That's how she keeps fees down.",
          },
        },
      },
    ],
  },
  {
    slotId: "banking-debit/lesson-2/silent-drain",
    conceptId: "bank-fees",
    variants: [
      {
        variantId: "drain-check-tf",
        step: {
          type: "true-false",
          statement:
            "It's worth scanning your bank statement each month for fees you didn't expect.",
          correct: true,
          feedback: {
            correct:
              "True. Fees are 'silent' precisely because nobody checks. A monthly scan catches charges, and sneaky debit orders, early.",
            incorrect:
              "It's true, a quick monthly statement check catches unexpected fees and dodgy charges before they add up.",
          },
        },
      },
      {
        variantId: "drain-annual-mcq",
        step: {
          type: "mcq",
          question: "Roughly what could R120/month of avoidable fees cost you over 5 years?",
          options: ["About R7 200", "About R1 440", "About R600", "Nothing"],
          correct: 0,
          feedback: {
            correct: "Right. R120 × 12 × 5 = R7 200, a holiday or an emergency fund, lost to fees you could avoid.",
            incorrect: "R120 × 12 months × 5 years = R7 200. Small monthly fees become big over time.",
          },
        },
      },
      {
        variantId: "drain-notice-scenario",
        step: {
          type: "scenario",
          question:
            "Thabo spots a R59 'account feature' fee he never uses on his statement. Best move?",
          options: [
            "Query it with the bank and downgrade or remove the feature",
            "Ignore it. It's only R59",
            "Close his account immediately",
            "Assume he must be using it",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. R59/month is ~R708/year for nothing. A quick call to downgrade the plan stops the leak.",
            incorrect:
              "Don't shrug off R59. That's ~R708 a year. Query it and drop the feature you don't use.",
          },
        },
      },
    ],
  },
];

const lesson2Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Where Your Money Leaks",
    content:
      "<p>Bank fees are silent killers. Common ones:</p><ul><li><strong>Monthly admin fee:</strong> R0–R200</li><li><strong>ATM withdrawal:</strong> R5–R15 each</li><li><strong>Card swipe:</strong> free or R2–R5</li><li><strong>Declined transaction:</strong> R5–R15 (yes. You pay even when it fails)</li></ul><p>Leaning on tap-to-pay and fewer, larger cash withdrawals cuts most of it.</p>",
  },
  { slot: "banking-debit/lesson-2/worst-habit" },
  { slot: "banking-debit/lesson-2/fee-types" },
  { slot: "banking-debit/lesson-2/reduce-fees" },
  { slot: "banking-debit/lesson-2/silent-drain" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 3 · "Digital Banking"
// ═══════════════════════════════════════════════════════════════════════════

const lesson3Slots: QuestionSlot[] = [
  {
    slotId: "banking-debit/lesson-3/digital-advantage",
    conceptId: "bank-account-types",
    variants: [
      {
        variantId: "adv-key",
        step: {
          type: "mcq",
          question: "What's a key advantage of digital-first banks like TymeBank?",
          options: [
            "Zero or very low monthly fees",
            "More ATMs than any traditional bank",
            "Guaranteed better forex rates",
            "A government guarantee traditional banks don't have",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. No branch network means low overheads, which show up as zero or near-zero fees. They use retail partners like Pick n Pay instead of ATMs.",
            incorrect:
              "The advantage is low fees from having no branches. They have fewer ATMs, not more, and no special forex or guarantee.",
          },
        },
      },
      {
        variantId: "adv-lungile",
        step: {
          type: "scenario",
          question:
            "Lungile switches from a traditional bank (R160/month) to TymeBank (R0/month). Over 5 years, roughly what does she save in fees?",
          options: ["About R9 600", "About R1 920", "About R800", "Nothing. Fees are the same"],
          correct: 0,
          feedback: {
            correct:
              "Right. R160 × 12 × 5 = R9 600. Nearly a full month's salary for many, saved on fees alone.",
            incorrect:
              "R160 a month × 12 × 5 years = R9 600. That's the real prize of dropping unnecessary fees.",
          },
        },
      },
      {
        variantId: "adv-tradeoff-tf",
        step: {
          type: "true-false",
          statement:
            "The main trade-off of a digital bank is fewer branches and own-ATMs, not higher fees.",
          correct: true,
          feedback: {
            correct:
              "True. You give up the branch network (they lean on retail partners), and in return you pay far less. For most people that's a good swap.",
            incorrect:
              "It's true. The trade-off is convenience of branches/ATMs, not cost. Digital banks are cheaper, with fewer physical touchpoints.",
          },
        },
      },
    ],
  },
  {
    slotId: "banking-debit/lesson-3/deposit-insurance",
    conceptId: "bank-account-types",
    variants: [
      {
        variantId: "ins-codi-exists",
        step: {
          type: "mcq",
          question:
            "Since 2024, are your bank deposits protected by a formal insurance scheme in South Africa?",
          options: [
            "Yes. CODI covers qualifying deposits up to R100 000 per depositor per bank",
            "No, there's no deposit protection at all",
            "Only deposits above R1 million are covered",
            "Only accounts at the big four banks are covered",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. CODI launched in 2024 and guarantees qualifying deposits up to R100 000 per depositor per registered bank: digital banks included.",
            incorrect:
              "There is now: CODI (from 2024) covers qualifying deposits up to R100 000 per depositor per bank, at all registered banks.",
          },
        },
      },
      {
        variantId: "ins-codi-cap-tf",
        step: {
          type: "true-false",
          statement:
            "South Africa's deposit insurance (CODI) covers your money with no limit, however much you deposit.",
          correct: false,
          feedback: {
            correct:
              "Correct. CODI's guarantee is capped at R100 000 per depositor per bank. Balances above that aren't covered by the scheme.",
            incorrect:
              "It's capped. CODI covers up to R100 000 per depositor per bank. Amounts above that fall outside the guarantee.",
          },
        },
      },
      {
        variantId: "ins-spread-large",
        step: {
          type: "mcq",
          question:
            "Given CODI covers up to R100 000 per depositor per bank, what does that imply for very large savings?",
          options: [
            "Spreading large balances across more than one bank keeps more of it within the guarantee",
            "Keep everything in one account, always",
            "It means a bank can never fail",
            "Any amount is fully guaranteed anyway",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. The cap is per bank, so splitting a large balance across banks keeps more of it inside the R100 000-per-bank guarantee.",
            incorrect:
              "The cap is per depositor per bank, so for large sums, spreading across banks keeps more of it covered.",
          },
        },
      },
    ],
  },
  {
    slotId: "banking-debit/lesson-3/switch-savings",
    conceptId: "bank-fees",
    variants: [
      {
        variantId: "switch-fill",
        step: {
          type: "fill-blank",
          title: "Five years of fees",
          prompt: "You pay R160/month in bank fees. Over 5 years (60 months) that totals R____.",
          correct: 9600,
          feedback: {
            correct: "Correct: R160 × 60 = R9 600. The cost of staying on the wrong account for five years.",
            incorrect: "R160 × 60 months = R9 600.",
          },
        },
      },
      {
        variantId: "switch-worth-mcq",
        step: {
          type: "mcq",
          question: "You could save R100/month by switching banks, but it takes an afternoon to move your debit orders. Worth it?",
          options: [
            "Usually yes. R100/month is R1 200/year for a one-time afternoon",
            "Never. Switching is always a scam",
            "Only if you save R1 000+/month",
            "No. Banks all cost the same",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. A few hours once, R1 200 saved every year after. That's one of the best hourly rates you'll ever earn.",
            incorrect:
              "R100/month = R1 200/year, forever, for one afternoon of admin. That maths almost always favours switching.",
          },
        },
      },
      {
        variantId: "switch-debit-orders-tf",
        step: {
          type: "true-false",
          statement:
            "When you switch banks, remember to move your debit orders and salary deposit to the new account.",
          correct: true,
          feedback: {
            correct:
              "True. The saving is real, but so is the admin, redirect your salary and debit orders, or payments will bounce at the old account.",
            incorrect:
              "It's true. Switching means moving your salary deposit and debit orders across, or you'll get bounced-payment fees at the old bank.",
          },
        },
      },
    ],
  },
  {
    slotId: "banking-debit/lesson-3/app-basics",
    conceptId: "bank-account-types",
    variants: [
      {
        variantId: "app-what-look",
        step: {
          type: "mcq",
          question: "Beyond fees, what's genuinely worth checking before choosing a digital bank?",
          options: [
            "App reliability and how easy it is to get help when something goes wrong",
            "The brightness of the logo",
            "How many adverts they run",
            "Whether the CEO is famous",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. When there are no branches, the app and support ARE the bank. A cheap account with a broken app is a false saving.",
            incorrect:
              "With no branches, app quality and support matter most after fees. That's your only way in when there's a problem.",
          },
        },
      },
      {
        variantId: "app-security-tf",
        step: {
          type: "true-false",
          statement:
            "A licensed digital bank is regulated by the same authorities as a traditional bank.",
          correct: true,
          feedback: {
            correct:
              "True. TymeBank, Capitec and the like hold banking licences and answer to the same regulators. Digital doesn't mean unregulated.",
            incorrect:
              "It's true. Licensed digital banks fall under the same regulators as the big four. 'Digital' isn't 'unregulated'.",
          },
        },
      },
      {
        variantId: "app-fit-scenario",
        step: {
          type: "scenario",
          question:
            "Ayesha wants low fees but also needs to deposit cash from her side hustle weekly. What should she confirm?",
          options: [
            "Where and how she can deposit cash cheaply with that digital bank",
            "The colour options for the card",
            "Whether the app has a game",
            "How big the bank's head office is",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. Cash deposits are the weak spot for some digital banks. She should check the deposit points and their fees before switching.",
            incorrect:
              "For a cash-earning side hustle, the key question is cheap cash deposits. She should confirm that before choosing.",
          },
        },
      },
    ],
  },
];

const lesson3Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Banking With Near-Zero Fees",
    content:
      "<p>Millions of South Africans pay R100–R200/month in fees they don't need to. Digital-first banks changed the game: <strong>Capitec</strong> (low admin fee, interest on positive balance), <strong>TymeBank</strong> (R0 monthly, free swipes at Pick n Pay and Boxer), <strong>FNB Easy</strong>, <strong>Discovery Bank</strong>.</p><p>Lungile switched from a traditional bank (R160/month) to TymeBank (R0) and saved R9 600 over 5 years. Almost a full month's salary, in fees alone.</p>",
  },
  { slot: "banking-debit/lesson-3/digital-advantage" },
  { slot: "banking-debit/lesson-3/deposit-insurance" },
  { slot: "banking-debit/lesson-3/switch-savings" },
  { slot: "banking-debit/lesson-3/app-basics" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 4 · "How Debit Orders Work"
// ═══════════════════════════════════════════════════════════════════════════

const lesson4Slots: QuestionSlot[] = [
  {
    slotId: "banking-debit/lesson-4/what-is",
    conceptId: "debit-orders",
    variants: [
      {
        variantId: "what-def",
        step: {
          type: "mcq",
          question: "What is a debit order?",
          options: [
            "A pre-authorised instruction letting a company deduct money on a fixed date",
            "A once-off payment you make manually each month",
            "A type of savings account",
            "A fee the bank charges for using your card",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. You authorise it once, and the company pulls the agreed amount on schedule, insurance, gym, subscriptions, loan repayments.",
            incorrect:
              "A debit order is a standing, pre-authorised deduction: set up once, it collects automatically on a fixed date.",
          },
        },
      },
      {
        variantId: "what-common",
        step: {
          type: "mcq",
          question: "Which of these is typically paid by debit order?",
          options: [
            "Your monthly insurance premium",
            "A once-off cash tip",
            "Buying bread at the spaza",
            "A friend paying you back",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. Regular, fixed commitments (insurance, gym, subscriptions, loan instalments) are the classic debit orders.",
            incorrect:
              "Debit orders are for recurring fixed payments like insurance premiums, not once-off or cash transactions.",
          },
        },
      },
      {
        variantId: "what-authorise-tf",
        step: {
          type: "true-false",
          statement: "A company needs your authorisation before it can set up a debit order on your account.",
          correct: true,
          feedback: {
            correct:
              "True. A legitimate debit order needs a mandate from you. Deductions with no authorisation are exactly what you can dispute.",
            incorrect:
              "It's true. A valid debit order requires your mandate. Anything pulling money without it is unauthorised and disputable.",
          },
        },
      },
    ],
  },
  {
    slotId: "banking-debit/lesson-4/bounce-penalty",
    conceptId: "debit-orders",
    variants: [
      {
        variantId: "bounce-tf",
        step: {
          type: "true-false",
          statement:
            "Your bank can charge you a penalty if a debit order bounces because there's not enough money.",
          correct: true,
          feedback: {
            correct:
              "True, and it's a double hit: a bounce fee now, and possible harm to your credit record if it's a loan repayment.",
            incorrect:
              "It's true. A bounced debit order costs a penalty fee and, for credit agreements, can damage your credit score.",
          },
        },
      },
      {
        variantId: "bounce-avoid",
        step: {
          type: "mcq",
          question: "What's the best way to avoid bounced-debit-order fees?",
          options: [
            "Make sure enough money is in the account before the debit dates",
            "Cancel all your debit orders",
            "Keep the account empty on purpose",
            "Ignore the debit dates entirely",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. Line your debit dates up just after payday, and keep a small buffer, so nothing bounces.",
            incorrect:
              "The fix is timing and a buffer: ensure funds are there on the debit dates, ideally schedule them just after payday.",
          },
        },
      },
      {
        variantId: "bounce-timing-scenario",
        step: {
          type: "scenario",
          question:
            "Thabo is paid on the 25th but three debit orders run on the 1st, when he's low. What should he try?",
          options: [
            "Ask the companies to move the debit dates to just after the 25th",
            "Let them bounce every month",
            "Close his account each month-end",
            "Withdraw all his cash on the 24th",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. Most companies will shift debit dates on request. Aligning them to just after payday stops the monthly bounce fees.",
            incorrect:
              "He should move the debit dates to just after payday. Most originators allow it, and it ends the bounce cycle.",
          },
        },
      },
    ],
  },
  {
    slotId: "banking-debit/lesson-4/types",
    conceptId: "debit-orders",
    variants: [
      {
        variantId: "types-debicheck",
        step: {
          type: "mcq",
          question: "What makes a DebiCheck debit order different from an old-style one?",
          options: [
            "You must approve the mandate digitally upfront",
            "It can never be cancelled",
            "It's always cheaper",
            "It only works at ATMs",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. DebiCheck requires your explicit electronic approval before any collection, a big consumer-protection upgrade.",
            incorrect:
              "DebiCheck's difference is upfront digital approval of the mandate. That authentication is what protects you.",
          },
        },
      },
      {
        variantId: "types-early-tf",
        step: {
          type: "true-false",
          statement:
            "Early debit orders are processed first thing in the morning, before many other payments.",
          correct: true,
          feedback: {
            correct:
              "True. That early timing means they can catch your account before other transactions. Worth knowing when money is tight.",
            incorrect:
              "It's true. Early debit orders run at the start of the day, ahead of many other payments. Timing matters when funds are low.",
          },
        },
      },
      {
        variantId: "types-consent-mcq",
        step: {
          type: "mcq",
          question: "Which system gives you the most say before money leaves your account?",
          options: [
            "DebiCheck, because you approve the mandate first",
            "Old-style early debit orders",
            "Cash withdrawals",
            "A declined transaction",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. DebiCheck's upfront approval means nothing collects unless you authenticated it: more control for you.",
            incorrect:
              "DebiCheck gives the most control: you approve the mandate before any collection can happen.",
          },
        },
      },
    ],
  },
  {
    slotId: "banking-debit/lesson-4/track",
    conceptId: "debit-orders",
    variants: [
      {
        variantId: "track-review-tf",
        step: {
          type: "true-false",
          statement:
            "It's worth reviewing your active debit orders every few months to catch ones you no longer use.",
          correct: true,
          feedback: {
            correct:
              "True. Subscriptions and memberships pile up quietly. A periodic review catches the ones you've stopped using but keep paying for.",
            incorrect:
              "It's true, a periodic check of your debit orders catches 'zombie' subscriptions you're paying for but no longer use.",
          },
        },
      },
      {
        variantId: "track-zombie-scenario",
        step: {
          type: "scenario",
          question:
            "Nomsa reviews her debit orders and finds three streaming services she forgot she had, at R99 each. What has the review just done?",
          options: [
            "Surfaced ~R297/month she can stop wasting",
            "Cost her money",
            "Damaged her credit score",
            "Nothing useful",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. Three forgotten R99 subscriptions is R297/month, roughly R3 564 a year freed up just by looking.",
            incorrect:
              "The review just found R297/month (~R3 564/year) in forgotten subscriptions. That's the whole point of checking.",
          },
        },
      },
      {
        variantId: "track-where-mcq",
        step: {
          type: "mcq",
          question: "Where can you see and manage your debit orders?",
          options: [
            "In your banking app's Debit Orders / Mandates section",
            "Only by visiting a branch in person",
            "You can't. They're hidden",
            "Only by phoning each company",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. Most SA banking apps list your mandates and let you review, and often cancel, them yourself.",
            incorrect:
              "Your banking app has a Debit Orders/Mandates section where you can see and manage them: no branch visit needed.",
          },
        },
      },
    ],
  },
];

const lesson4Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "What Is a Debit Order?",
    content:
      "<p>A debit order is a pre-authorised instruction that lets a company deduct money from your account on a fixed date, insurance, gym memberships, subscriptions, loan repayments.</p><p><strong>Two types:</strong><br/>• <strong>DebiCheck:</strong> you confirm the mandate digitally upfront, more protection for you.<br/>• <strong>Early debit orders:</strong> run first thing in the morning, before other payments.</p>",
  },
  { slot: "banking-debit/lesson-4/what-is" },
  { slot: "banking-debit/lesson-4/bounce-penalty" },
  { slot: "banking-debit/lesson-4/types" },
  { slot: "banking-debit/lesson-4/track" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 5 · "Stopping Debit Orders"
// ═══════════════════════════════════════════════════════════════════════════

const lesson5Slots: QuestionSlot[] = [
  {
    slotId: "banking-debit/lesson-5/contract-vs-payment",
    conceptId: "debit-orders",
    variants: [
      {
        variantId: "cvp-before-stop",
        step: {
          type: "mcq",
          question: "What's the most important thing to do BEFORE stopping a legitimate debit order?",
          options: [
            "Cancel the underlying contract or debt with the company",
            "Get a lawyer to send a letter",
            "Close your bank account",
            "Wait 60 days for it to expire on its own",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. Stopping the debit order only stops the payment. The contract still exists. Cancel it too, or you'll still owe (and risk a credit listing).",
            incorrect:
              "Cancel the contract first. Blocking the payment without ending the agreement means you still legally owe the money.",
          },
        },
      },
      {
        variantId: "cvp-priya",
        step: {
          type: "scenario",
          question:
            "Priya's gym has been deducting R699/month for 6 months she hasn't attended. What does she need to do to fully stop it?",
          options: [
            "Stop the debit order in her app AND formally cancel the gym contract",
            "Just stop the debit order and forget about it",
            "Only cancel the contract, leave the debit order",
            "Nothing. It'll stop by itself",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. Both steps: block the payment so it stops now, and cancel the contract in writing so the debt itself ends. One without the other leaves her exposed.",
            incorrect:
              "She needs both. Stop the debit order to halt payments, and cancel the contract so she doesn't still owe and get listed.",
          },
        },
      },
      {
        variantId: "cvp-still-owe-tf",
        step: {
          type: "true-false",
          statement:
            "Cancelling a debit order at your bank also cancels the underlying contract or debt.",
          correct: false,
          feedback: {
            correct:
              "Correct. It only stops the payment mechanism. The debt or contract lives on. Cancel it separately or you can be listed with a credit bureau.",
            incorrect:
              "It doesn't. Stopping the debit order halts payment only; the contract remains, and unpaid valid debt can get you a credit listing.",
          },
        },
      },
    ],
  },
  {
    slotId: "banking-debit/lesson-5/you-can-stop",
    conceptId: "debit-orders",
    variants: [
      {
        variantId: "stop-who",
        step: {
          type: "true-false",
          statement:
            "Only the company collecting the money can cancel a debit order. You can't do it yourself.",
          correct: false,
          feedback: {
            correct:
              "Correct. You can stop debit orders yourself, usually free, in your banking app's Debit Orders section. You're not dependent on the company.",
            incorrect:
              "You're not powerless. You can stop a debit order yourself via your banking app, typically at no charge.",
          },
        },
      },
      {
        variantId: "stop-how-mcq",
        step: {
          type: "mcq",
          question: "How do you stop a debit order yourself in South Africa?",
          options: [
            "In your banking app's Debit Orders / Mandates section, following the prompts",
            "By ignoring your statements",
            "By emailing SARS",
            "You can't. Only a lawyer can",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. Most banks let you stop or block a mandate straight from the app, usually free of charge.",
            incorrect:
              "You do it in the app's Debit Orders/Mandates section. Most banks allow it directly and for free.",
          },
        },
      },
      {
        variantId: "stop-debicheck-cancel-scenario",
        step: {
          type: "scenario",
          question:
            "Sipho wants to cancel a DebiCheck mandate he approved earlier. What happens when he cancels it in the app?",
          options: [
            "The bank sends a cancellation to the company and blocks future collections",
            "Nothing. DebiCheck can never be cancelled",
            "His whole account is frozen",
            "He's charged R500",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. Cancelling the mandate in-app tells the bank to stop future DebiCheck collections and notify the originator.",
            incorrect:
              "DebiCheck mandates can be cancelled in-app: the bank then blocks future collections and notifies the company.",
          },
        },
      },
    ],
  },
  {
    slotId: "banking-debit/lesson-5/debicheck-consent",
    conceptId: "debit-orders",
    variants: [
      {
        variantId: "consent-tf",
        step: {
          type: "true-false",
          statement:
            "DebiCheck debit orders need your upfront digital approval before they can collect.",
          correct: true,
          feedback: {
            correct:
              "True. DebiCheck is SA's authentication system, you approve the mandate on your app before any deduction can start. Big protection upgrade.",
            incorrect:
              "It's true. DebiCheck requires your explicit digital consent before the first collection. That's the whole point of it.",
          },
        },
      },
      {
        variantId: "consent-why-mcq",
        step: {
          type: "mcq",
          question: "Why is DebiCheck's upfront approval good for consumers?",
          options: [
            "Nothing can be collected unless you authenticated it first",
            "It makes debit orders free",
            "It removes the need to budget",
            "It guarantees higher interest",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. Requiring your approval up front stops random, unauthorised mandates from ever starting.",
            incorrect:
              "The benefit is control: nothing collects unless you approved the mandate, which blocks unauthorised debit orders at the source.",
          },
        },
      },
      {
        variantId: "consent-unknown-scenario",
        step: {
          type: "scenario",
          question:
            "Lerato gets a DebiCheck approval request on her app for a loan she never took. What should she do?",
          options: [
            "Decline it. Approving would authorise a debit order she never agreed to",
            "Approve it to be safe",
            "Ignore the request and hope",
            "Approve it and dispute later",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. Only approve mandates you recognise. Declining an unknown request stops the fraudulent debit order before it starts.",
            incorrect:
              "Never approve a mandate you don't recognise. Decline it. Approving would authorise a debit order she never agreed to.",
          },
        },
      },
    ],
  },
  {
    slotId: "banking-debit/lesson-5/act-fast",
    conceptId: "debit-orders",
    variants: [
      {
        variantId: "fast-review-tf",
        step: {
          type: "true-false",
          statement:
            "Catching an unwanted debit order early saves you money compared with letting it run for months.",
          correct: true,
          feedback: {
            correct:
              "True. Every month you delay is another deduction. A gym at R699 for 6 unnoticed months is R4 194. Spotting it in month one saves most of that.",
            incorrect:
              "It's true. Each month it runs costs you. Six months of an unnoticed R699 gym is R4 194; catching it early saves the rest.",
          },
        },
      },
      {
        variantId: "fast-fill",
        step: {
          type: "fill-blank",
          title: "The cost of not noticing",
          prompt: "A R699/month debit order you forgot about runs for 6 months. Total wasted = R____.",
          correct: 4194,
          feedback: {
            correct: "Correct: R699 × 6 = R4 194. That's why the monthly statement scan pays for itself.",
            incorrect: "R699 × 6 = R4 194.",
          },
        },
      },
      {
        variantId: "fast-steps-mcq",
        step: {
          type: "mcq",
          question: "You decide to cancel a subscription you no longer use. The cleanest order of steps is:",
          options: [
            "Cancel the contract with the company",
            "Only stop the debit order and never contact the company",
            "Close your bank account",
            "Do nothing and hope it stops",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. End the agreement first so you don't owe, then stop the payment so nothing more is collected. Both, in that order.",
            incorrect:
              "Cancel the contract (so the debt ends), then stop the debit order (so payment stops). Doing only one leaves a gap.",
          },
        },
      },
    ],
  },
];

const lesson5Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "You Have the Power to Stop Debit Orders",
    content:
      "<p>Many people think only the company collecting the money can cancel a debit order. Not true. You can stop it yourself, usually free, in your banking app's Debit Orders section.</p><p><strong>Important:</strong> stopping the debit order does NOT cancel the underlying contract (gym, insurance). You still owe the money. Cancel the contract in writing too, or the company can list you with a credit bureau.</p>",
  },
  { slot: "banking-debit/lesson-5/contract-vs-payment" },
  { slot: "banking-debit/lesson-5/you-can-stop" },
  { slot: "banking-debit/lesson-5/debicheck-consent" },
  { slot: "banking-debit/lesson-5/act-fast" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 6 · "Disputing Unauthorized Debits"
// ═══════════════════════════════════════════════════════════════════════════

const lesson6Slots: QuestionSlot[] = [
  {
    slotId: "banking-debit/lesson-6/60-days",
    conceptId: "debit-disputes",
    variants: [
      {
        variantId: "days-how-many",
        step: {
          type: "mcq",
          question: "How many days do you have to dispute an unauthorised debit order with your bank?",
          options: ["60 days", "7 days", "14 days", "90 days"],
          correct: 0,
          feedback: {
            correct:
              "Right. You have 60 days from the debit date to report it as unauthorised and claim a reversal. After that, it's at the bank's discretion.",
            incorrect:
              "The window is 60 days from the transaction date. Report an unauthorised debit within it to claim a reversal.",
          },
        },
      },
      {
        variantId: "days-fill",
        step: {
          type: "fill-blank",
          title: "The dispute window",
          prompt: "You have ____ days from the debit date to dispute an unauthorised debit order.",
          correct: 60,
          feedback: {
            correct: "Correct, 60 days. Scan your statement monthly so you never miss the window.",
            incorrect: "It's 60 days from the debit date.",
          },
        },
      },
      {
        variantId: "days-act-tf",
        step: {
          type: "true-false",
          statement:
            "Reviewing your statement monthly helps you catch unauthorised debits inside the dispute window.",
          correct: true,
          feedback: {
            correct:
              "True. The 60-day clock is unforgiving. A quick monthly scan means you spot dodgy debits while you can still reverse them.",
            incorrect:
              "It's true. A monthly statement check keeps you inside the 60-day window so you can still get a reversal.",
          },
        },
      },
    ],
  },
  {
    slotId: "banking-debit/lesson-6/ombudsman",
    conceptId: "debit-disputes",
    variants: [
      {
        variantId: "omb-free-tf",
        step: {
          type: "true-false",
          statement: "The National Financial Ombud (NFO) charges a fee to investigate your complaint against a bank.",
          correct: false,
          feedback: {
            correct:
              "Correct. The National Financial Ombud (NFO), which absorbed the old Banking Ombudsman in 2024, is free for consumers: 0860 800 900, or nfosa.co.za.",
            incorrect:
              "It's completely free. The National Financial Ombud (NFO) helps consumers at no cost (0860 800 900).",
          },
        },
      },
      {
        variantId: "omb-when-mcq",
        step: {
          type: "mcq",
          question: "When should you escalate to the National Financial Ombud (NFO)?",
          options: [
            "When your bank won't resolve a dispute fairly and you've hit a dead end with them",
            "Immediately, before contacting your bank at all",
            "Never. It costs too much",
            "Only for amounts over R100 000",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. Try your bank first; if they won't resolve it fairly, the free Ombudsman is your next, no-cost step.",
            incorrect:
              "Go to your bank first. If they fail to resolve it, escalate to the Ombudsman. It's free and there's no minimum amount.",
          },
        },
      },
      {
        variantId: "omb-escalate-scenario",
        step: {
          type: "scenario",
          question:
            "A company keeps re-debiting Zanele even after her bank reversed the charge. What's her free next step?",
          options: [
            "Escalate to the National Financial Ombud at no cost",
            "Pay it to make it stop",
            "Hire an expensive attorney immediately",
            "Close her account and open a new one",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. Repeated collections after a reversal is exactly what the free Ombudsman is for. Keep your reference numbers and escalate.",
            incorrect:
              "The free route is the National Financial Ombud (NFO). Zanele should escalate there with her records rather than pay or lawyer up.",
          },
        },
      },
    ],
  },
  {
    slotId: "banking-debit/lesson-6/scam-signs",
    conceptId: "debit-disputes",
    variants: [
      {
        variantId: "scam-small-amounts",
        step: {
          type: "mcq",
          question: "Which is a classic warning sign of a subscription-scam debit?",
          options: [
            "Small recurring amounts like R19, R49 or R99 you don't recognise",
            "Your salary being paid in",
            "A large once-off purchase you made",
            "A free balance notification",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. Scammers keep amounts small (R19–R99) hoping you won't notice or bother. Check every line, however tiny.",
            incorrect:
              "Watch for small, unfamiliar recurring amounts (R19/R49/R99). They're small on purpose so you don't query them.",
          },
        },
      },
      {
        variantId: "scam-screenshot-tf",
        step: {
          type: "true-false",
          statement:
            "Taking a screenshot of an unauthorised debit and keeping the dispute reference number helps your case.",
          correct: true,
          feedback: {
            correct:
              "True. Evidence and reference numbers make reversals and escalations far smoother. Capture them the moment you spot the debit.",
            incorrect:
              "It's true. Screenshots and reference numbers are your proof. Keep them from the moment you notice the debit.",
          },
        },
      },
      {
        variantId: "scam-notice-scenario",
        step: {
          type: "scenario",
          question:
            "Thabo notices an unfamiliar R49 debit on his statement, small but monthly. What's the smart move?",
          options: [
            "Screenshot it, dispute it with the bank within 60 days, and watch for repeats",
            "Ignore it. R49 is nothing",
            "Assume he must have signed up",
            "Wait a year to see if it grows",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. R49/month is ~R588/year, and it's often a scam. Screenshot, dispute inside 60 days, and check it doesn't come back.",
            incorrect:
              "Don't wave off R49. That's ~R588/year and a common scam pattern. Screenshot and dispute it within the 60-day window.",
          },
        },
      },
    ],
  },
  {
    slotId: "banking-debit/lesson-6/reversal-process",
    conceptId: "debit-disputes",
    variants: [
      {
        variantId: "proc-how",
        step: {
          type: "mcq",
          question: "How do you start a dispute for an unauthorised debit?",
          options: [
            "Contact your bank and formally dispute it as unauthorised",
            "Contact SARS",
            "Post about it on social media and wait",
            "Do nothing. The bank will notice for you",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. Tell your bank and formally flag it as unauthorised. For DebiCheck mandates you never approved, reversal is straightforward.",
            incorrect:
              "You start with your bank: dispute it formally as unauthorised. That triggers the reversal process.",
          },
        },
      },
      {
        variantId: "proc-time-tf",
        step: {
          type: "true-false",
          statement:
            "A disputed but possibly-legitimate debit order may take the bank a few business days to investigate.",
          correct: true,
          feedback: {
            correct:
              "True. Clear-cut unauthorised debits reverse fast; genuinely disputed ones can take up to ~10 business days while the bank checks.",
            incorrect:
              "It's true, an obvious unauthorised debit reverses quickly, but a contested one can take up to about 10 business days.",
          },
        },
      },
      {
        variantId: "proc-records-mcq",
        step: {
          type: "mcq",
          question: "What makes disputing a debit far easier?",
          options: [
            "Screenshots and reference numbers kept from the start",
            "Deleting the transaction from your app",
            "Waiting past the 60-day window",
            "Never checking your statement",
          ],
          correct: 0,
          feedback: {
            correct:
              "Right. Good records (screenshots, dates, reference numbers) turn a 'he-said-she-said' into a clear, fast reversal.",
            incorrect:
              "Keep records: screenshots and reference numbers. They're what make a dispute quick and successful.",
          },
        },
      },
    ],
  },
];

const lesson6Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Unauthorised Debits Can Be Reversed",
    content:
      "<p>See a debit order you never authorised? SA banking rules entitle you to a <strong>reversal</strong>.</p><ul><li>You have <strong>60 days</strong> from the debit date to dispute it as unauthorised.</li><li>Contact your bank (app, call centre or branch) and formally dispute it.</li><li>DebiCheck mandates you never approved are reversed without fuss; contested ones can take up to ~10 business days.</li></ul><p>Keep screenshots and reference numbers. If a company keeps debiting after a reversal, escalate free to the <strong>National Financial Ombud (NFO)</strong> (0860 800 900). Watch for small recurring amounts (R19, R49, R99), the classic subscription scam.</p>",
  },
  { slot: "banking-debit/lesson-6/60-days" },
  { slot: "banking-debit/lesson-6/ombudsman" },
  { slot: "banking-debit/lesson-6/scam-signs" },
  { slot: "banking-debit/lesson-6/reversal-process" },
];

export const BANKING_DEBIT_BANKS: Record<string, LessonBank> = {
  "banking-debit::lesson-1": { layout: lesson1Layout, slots: lesson1Slots },
  "banking-debit::lesson-2": { layout: lesson2Layout, slots: lesson2Slots },
  "banking-debit::lesson-3": { layout: lesson3Layout, slots: lesson3Slots },
  "banking-debit::lesson-4": { layout: lesson4Layout, slots: lesson4Slots },
  "banking-debit::lesson-5": { layout: lesson5Layout, slots: lesson5Slots },
  "banking-debit::lesson-6": { layout: lesson6Layout, slots: lesson6Slots },
};
