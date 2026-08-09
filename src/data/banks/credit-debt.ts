import type { LessonLayoutItem, QuestionSlot } from "@/data/content";
import type { LessonBank } from "./money-basics";

/**
 * Bank for the Credit & Debt course. Per docs/QUESTION-VOICE-GUIDE.md: every
 * lesson has 4 slots (>3 questions), each a pool of distinct SA scenarios,
 * all concept-tagged for spaced-repetition resurface.
 */

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 1 · "What is a Credit Score?"
// ═══════════════════════════════════════════════════════════════════════════

const lesson1Slots: QuestionSlot[] = [
  {
    slotId: "credit-debt/lesson-1/biggest-factor",
    conceptId: "credit-score",
    variants: [
      {
        variantId: "bf-payment-history",
        step: {
          type: "mcq",
          question: "What has the BIGGEST impact on your credit score?",
          options: ["Your payment history", "Your bank count", "How much you earn", "Your age"],
          correct: 0,
          feedback: {
            correct: "Right. Payment history is the single biggest factor. Pay on time, every time. One missed payment can drop your score sharply.",
            incorrect: "It's payment history. Your income and age barely matter; whether you pay on time is what lenders watch most.",
          },
        },
      },
      {
        variantId: "bf-missed-scenario",
        step: {
          type: "scenario",
          question: "Sipho earns well but has missed three loan payments this year. What will lenders likely conclude?",
          options: [
            "He's a repayment risk despite the salary",
            "He's low risk because he earns a lot",
            "His income cancels the missed payments",
            "Missed payments don't show on his record",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A high salary doesn't rescue a poor payment record. Lenders price the risk of missed payments into higher interest, or decline him.",
            incorrect: "Income doesn't offset missed payments. His history says 'risk', so he'll face higher rates or rejection despite earning well.",
          },
        },
      },
      {
        variantId: "bf-ontime-tf",
        step: {
          type: "true-false",
          statement: "Consistently paying every account on time is the most powerful thing you can do for your credit score.",
          correct: true,
          feedback: {
            correct: "True. Nothing moves your score more, in either direction, than your track record of paying on time.",
            incorrect: "It's true. On-time payments are the number-one driver of a healthy score. It's the habit that matters most.",
          },
        },
      },
    ],
  },
  {
    slotId: "credit-debt/lesson-1/check-own",
    conceptId: "credit-score",
    variants: [
      {
        variantId: "check-damage-tf",
        step: {
          type: "true-false",
          statement: "Checking your own credit score damages your credit rating.",
          correct: false,
          feedback: {
            correct: "Correct. Checking your own score is a 'soft inquiry' with zero impact. You're entitled to a free credit report each year. Use it.",
            incorrect: "It doesn't. Checking your own score is a soft inquiry that never affects your rating. Do it regularly.",
          },
        },
      },
      {
        variantId: "check-soft-vs-hard",
        step: {
          type: "mcq",
          question: "Which of these can lower your score slightly?",
          options: [
            "Lots of new credit applications",
            "Checking your own score",
            "Reading your credit report",
            "Budgeting your salary each month",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Many credit applications in a short window are 'hard inquiries' that ding your score. Checking your own does not.",
            incorrect: "It's the flurry of new applications (hard inquiries) that hurts. Checking your own score is harmless.",
          },
        },
      },
      {
        variantId: "check-habit-tf",
        step: {
          type: "true-false",
          statement: "It's a good habit to check your own credit report regularly for errors and fraud.",
          correct: true,
          feedback: {
            correct: "True. Errors and fraudulent accounts do happen. Catching them early, at no cost to your score, protects your borrowing power.",
            incorrect: "It's true, regular self-checks catch mistakes and fraud early, and they never harm your score.",
          },
        },
      },
    ],
  },
  {
    slotId: "credit-debt/lesson-1/what-it-is",
    conceptId: "credit-score",
    variants: [
      {
        variantId: "wii-what",
        step: {
          type: "mcq",
          question: "What does your credit score actually tell a lender?",
          options: [
            "How likely you are to repay",
            "How much you have in savings",
            "Whether you're a good person",
            "Your exact monthly salary",
          ],
          correct: 0,
          feedback: {
            correct: "Right. It's a risk estimate built from your borrowing history. A shorthand for 'how likely is this person to pay me back?'",
            incorrect: "It signals repayment risk, not your wealth or character. Lenders use it to judge how likely you are to repay.",
          },
        },
      },
      {
        variantId: "wii-bureaus",
        step: {
          type: "true-false",
          statement: "Credit bureaus like TransUnion and Experian build your score from your borrowing and repayment history.",
          correct: true,
          feedback: {
            correct: "True. Bureaus compile your accounts, payments, credit use and applications into the score lenders check.",
            incorrect: "It's true: bureaus (TransUnion, Experian and others) assemble your history into the score lenders rely on.",
          },
        },
      },
      {
        variantId: "wii-higher-better",
        step: {
          type: "mcq",
          question: "In general, a higher credit score means:",
          options: [
            "Lenders see you as lower risk",
            "You're forced to borrow more",
            "You pay higher interest rates",
            "Nothing changes at all",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Higher score, lower perceived risk, cheaper credit. A good score quietly saves you interest on every loan.",
            incorrect: "Higher is better: it signals lower risk, which earns you lower interest rates on loans and cards.",
          },
        },
      },
    ],
  },
  {
    slotId: "credit-debt/lesson-1/why-matters",
    conceptId: "credit-score",
    variants: [
      {
        variantId: "why-cost",
        step: {
          type: "mcq",
          question: "Why is a good credit score worth real money over a lifetime?",
          options: [
            "It earns you lower interest on loans",
            "The bureaus pay you for a high score",
            "It increases your salary",
            "It removes the need to budget",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A better rate on a home loan or car finance compounds into huge savings across a lifetime of borrowing.",
            incorrect: "The value is cheaper interest. Over a home loan and car finance, a good score saves tens of thousands of rands.",
          },
        },
      },
      {
        variantId: "why-homeloan-scenario",
        step: {
          type: "scenario",
          question: "Two people take the same home loan; one has a strong score and gets a lower rate. Over 20 years, the difference is:",
          options: [
            "Tens of thousands of rands in interest",
            "A few rands only",
            "Nothing, rates are the same for everyone",
            "Only relevant in the first month",
          ],
          correct: 0,
          feedback: {
            correct: "Right. On a multi-decade home loan, even a small rate gap from a better score compounds into a life-changing amount.",
            incorrect: "It's huge. A lower rate from a strong score, across 20 years of a bond, saves tens of thousands in interest.",
          },
        },
      },
      {
        variantId: "why-build-tf",
        step: {
          type: "true-false",
          statement: "Paying your accounts on time now helps you qualify for cheaper credit later.",
          correct: true,
          feedback: {
            correct: "True. Today's on-time payments build the track record that earns you lower rates on the big loans down the line.",
            incorrect: "It's true. A clean payment record now is what unlocks cheaper borrowing (like a home loan) in future.",
          },
        },
      },
    ],
  },
];

const lesson1Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Your Financial Report Card",
    content:
      "<p>A bad credit score costs you money every month, through higher interest on every loan you take. A good one is worth tens of thousands in interest saved over a lifetime.</p><p>Your credit score tells lenders how likely you are to repay. Bureaus like TransUnion, Experian and others build it from your payment history, how much credit you use, how long you've had credit, and how many recent applications you've made.</p>",
  },
  { slot: "credit-debt/lesson-1/biggest-factor" },
  { slot: "credit-debt/lesson-1/check-own" },
  { slot: "credit-debt/lesson-1/what-it-is" },
  { slot: "credit-debt/lesson-1/why-matters" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 2 · "How Interest Works"
// ═══════════════════════════════════════════════════════════════════════════

const lesson2Slots: QuestionSlot[] = [
  {
    slotId: "credit-debt/lesson-2/min-payment-trap",
    conceptId: "cost-of-debt",
    variants: [
      {
        variantId: "mpt-storecard",
        step: {
          type: "mcq",
          question: "You owe R5 000 on a store card at 24% interest and pay only the R150 minimum each month. What happens?",
          options: [
            "The balance barely moves",
            "You clear it in a few months",
            "The interest pauses while you pay",
            "The store writes it off after two years",
          ],
          correct: 0,
          feedback: {
            correct: "Right. 24% on R5 000 is ~R100/month in interest, so R150 only cuts ~R50 of principal. At that rate it drags on for years.",
            incorrect: "Interest is ~R100/month, so a R150 minimum only removes ~R50 of the debt. The balance crawls down over years.",
          },
        },
      },
      {
        variantId: "mpt-fill",
        step: {
          type: "fill-blank",
          title: "Where the minimum goes",
          prompt: "Your minimum is R450, but this month's interest is R380. Only about R____ actually comes off what you owe.",
          correct: 70,
          feedback: {
            correct: "Correct: R450 − R380 = R70 of principal. Tiny cuts like this are exactly why minimum payments trap people for years.",
            incorrect: "Subtract interest from the payment: R450 − R380 = R70 off the actual debt.",
          },
        },
      },
      {
        variantId: "mpt-tf",
        step: {
          type: "true-false",
          statement: "Paying only the minimum on a high-interest card means you pay back far more, over far longer, than you borrowed.",
          correct: true,
          feedback: {
            correct: "True. The minimum is designed to keep you paying interest for years. Anything extra you can throw at it shortens that dramatically.",
            incorrect: "It's true: minimums stretch repayment over years and pile on interest. Paying more than the minimum is how you escape.",
          },
        },
      },
    ],
  },
  {
    slotId: "credit-debt/lesson-2/interest-cost",
    conceptId: "cost-of-debt",
    variants: [
      {
        variantId: "cost-fill",
        step: {
          type: "fill-blank",
          title: "The yearly cost of a balance",
          prompt: "A R10 000 credit card balance at 20% a year that you never pay down costs you about R____ every year in interest.",
          correct: 2000,
          feedback: {
            correct: "Correct: 20% of R10 000 = R2 000 a year, paid for nothing, just for carrying the balance.",
            incorrect: "20% of R10 000 = R2 000 a year in interest, for as long as you carry it.",
          },
        },
      },
      {
        variantId: "cost-mcq",
        step: {
          type: "mcq",
          question: "What does interest really represent?",
          options: [
            "The price of spending money early",
            "A reward the bank gives back to you",
            "A once-off admin fee",
            "A tax that goes to SARS",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Interest is the rental cost of borrowed money, the higher the rate, the more you pay to use someone else's cash.",
            incorrect: "It's the cost of borrowing: the price of using money you don't have yet, charged as a yearly percentage.",
          },
        },
      },
      {
        variantId: "cost-compare-scenario",
        step: {
          type: "scenario",
          question: "Nomsa can put a R4 000 fridge on a 25% store card or save two months and pay cash. Purely on cost, which is cheaper?",
          options: [
            "Saving and paying cash",
            "The store card, she gets it now",
            "They cost exactly the same",
            "The store card, interest is free",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Cash avoids the 25% interest completely. The card's convenience has a real price tag she'd keep paying for months.",
            incorrect: "Cash is cheaper, it dodges the 25% interest. The card only feels cheaper because the cost is spread out and hidden.",
          },
        },
      },
    ],
  },
  {
    slotId: "credit-debt/lesson-2/apr-meaning",
    conceptId: "cost-of-debt",
    variants: [
      {
        variantId: "apr-what",
        step: {
          type: "mcq",
          question: "Interest on a loan or card is usually quoted as an APR. What does that mean?",
          options: [
            "The yearly cost of borrowing",
            "A monthly membership fee",
            "The amount you can borrow",
            "A discount on your purchases",
          ],
          correct: 0,
          feedback: {
            correct: "Right. APR is the yearly price of the debt. A 24% APR means roughly 2% of the balance charged each month.",
            incorrect: "APR = annual percentage rate, the yearly cost of borrowing. Divide by 12 for the rough monthly bite.",
          },
        },
      },
      {
        variantId: "apr-higher-tf",
        step: {
          type: "true-false",
          statement: "A higher APR means the same debt costs you more each month to carry.",
          correct: true,
          feedback: {
            correct: "True. The rate is the price. A R5 000 balance costs far more at 30% than at 12%. Always ask the rate before you sign.",
            incorrect: "It's true. A higher APR means more interest on the same balance. The rate is the single most important number.",
          },
        },
      },
      {
        variantId: "apr-ask-mcq",
        step: {
          type: "mcq",
          question: "Before taking any credit, the one number you should always get is:",
          options: [
            "The interest rate (APR)",
            "The colour of the card",
            "The salesperson's name",
            "The store's opening hours",
          ],
          correct: 0,
          feedback: {
            correct: "Right. If you can't quote the rate, you're not ready to sign: it decides the true cost of the whole deal.",
            incorrect: "Always get the rate (APR) first. Without it you can't know what the credit actually costs you.",
          },
        },
      },
    ],
  },
  {
    slotId: "credit-debt/lesson-2/pay-more",
    conceptId: "cost-of-debt",
    variants: [
      {
        variantId: "more-benefit-tf",
        step: {
          type: "true-false",
          statement: "Paying more than the minimum each month clears debt faster and cuts the total interest you pay.",
          correct: true,
          feedback: {
            correct: "True. Every extra rand goes straight at the principal, shrinking future interest. It's the fastest legal way out of a card.",
            incorrect: "It's true, extra payments attack the principal, so the debt clears sooner and costs far less interest overall.",
          },
        },
      },
      {
        variantId: "more-priya-scenario",
        step: {
          type: "scenario",
          question: "Priya has a small windfall of R2 000. Her card is at 22%. What gives the best guaranteed 'return'?",
          options: [
            "Paying off the 22% card",
            "Leaving it in a 5% savings account",
            "Buying a lottery ticket",
            "Spending it before it disappears",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Clearing 22% debt is a guaranteed 22% return: better than almost any investment, with zero risk.",
            incorrect: "Paying down the 22% card is a risk-free 22% return, far beating a 5% savings account. Debt first.",
          },
        },
      },
      {
        variantId: "more-which-mcq",
        step: {
          type: "mcq",
          question: "If you have spare cash and expensive debt, the smart move is usually to:",
          options: [
            "Put it toward the priciest debt",
            "Keep the debt and spend the cash",
            "Split it evenly across every account",
            "Ignore the debt entirely",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Killing the priciest debt saves the most interest. Nothing you can safely invest in beats clearing a 20%+ balance.",
            incorrect: "Target the highest-rate debt first. That's where your money saves the most interest.",
          },
        },
      },
    ],
  },
];

const lesson2Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "The Price of Borrowed Money",
    content:
      "<p>Interest is what you pay for spending money you don't have. At 20% a year, a R10 000 credit card balance you never clear costs you R2 000 every year. For nothing.</p><p>It's quoted as an annual percentage rate (APR). The minimum-payment trap: paying only the minimum means you repay far more than you borrowed, over far more years than you planned.</p>",
  },
  { slot: "credit-debt/lesson-2/min-payment-trap" },
  { slot: "credit-debt/lesson-2/interest-cost" },
  { slot: "credit-debt/lesson-2/apr-meaning" },
  { slot: "credit-debt/lesson-2/pay-more" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 3 · "Good Debt vs Bad Debt"
// ═══════════════════════════════════════════════════════════════════════════

const lesson3Slots: QuestionSlot[] = [
  {
    slotId: "credit-debt/lesson-3/which-bad",
    conceptId: "good-debt-vs-bad-debt",
    variants: [
      {
        variantId: "wb-clothing",
        step: {
          type: "mcq",
          question: "Which usually behaves most like 'bad debt' for a household?",
          options: [
            "A high-rate clothing account",
            "An affordable home loan under 30% of stable income",
            "A study loan for a scarce skill with a clear plan",
            "A modest car loan for getting to a night-shift job",
          ],
          correct: 0,
          feedback: {
            correct: "Right. High-rate revolving credit on things that lose value fast is the classic wealth-drainer, especially on minimum payments.",
            incorrect: "It's the high-rate clothing account. Debt on depreciating, non-essential stuff at a steep rate is the 'bad' kind.",
          },
        },
      },
      {
        variantId: "wb-definition",
        step: {
          type: "mcq",
          question: "What tends to make a debt 'bad'?",
          options: [
            "High interest on something that loses value",
            "Any debt at all, always",
            "A low interest rate",
            "Borrowing for an appreciating asset",
          ],
          correct: 0,
          feedback: {
            correct: "Right. High rate + depreciating or non-essential purchase = bad debt. Low rate on something that grows or earns is a different story.",
            incorrect: "'Bad' is about high rates on things that lose value and you don't need, not debt in general.",
          },
        },
      },
      {
        variantId: "wb-appreciate-tf",
        step: {
          type: "true-false",
          statement: "Debt used to buy something that may grow in value (like an affordable home) can be 'good' debt.",
          correct: true,
          feedback: {
            correct: "True. Affordable, low-rate debt on an appreciating asset can build wealth, the opposite of a high-rate clothing account.",
            incorrect: "It's true, affordable debt on an appreciating asset (a home you can afford) is the textbook 'good debt'.",
          },
        },
      },
    ],
  },
  {
    slotId: "credit-debt/lesson-3/stress-test",
    conceptId: "good-debt-vs-bad-debt",
    variants: [
      {
        variantId: "st-tf",
        step: {
          type: "true-false",
          statement: "If repayments fit your budget in a good month, you don't need to check what happens if rates rise or income drops.",
          correct: false,
          feedback: {
            correct: "Correct. Affordability must survive a shock, not just your best month. Rates climb and jobs change. Plan for it before you sign.",
            incorrect: "You do need to check. A repayment that only works in a great month is dangerous: stress-test for rate hikes and lost income.",
          },
        },
      },
      {
        variantId: "st-scenario",
        step: {
          type: "scenario",
          question: "Thabo can just afford a car repayment today. Before signing, what should he ask?",
          options: [
            "Could I still pay if rates rose?",
            "Does the colour match my curtains?",
            "Will my friends be impressed?",
            "Is the showroom a nice one?",
          ],
          correct: 0,
          feedback: {
            correct: "Right. 'Just affordable now' breaks at the first shock. If it can't survive a rate hike or a lean month, it's too much debt.",
            incorrect: "The real question is whether it survives a shock. A rate rise or a lean month. If not, the repayment is too tight.",
          },
        },
      },
      {
        variantId: "st-buffer-tf",
        step: {
          type: "true-false",
          statement: "Leaving a buffer between what you can afford and what you commit to protects you when things change.",
          correct: true,
          feedback: {
            correct: "True. Borrowing to your absolute limit leaves no room for surprises. A buffer is what keeps a setback from becoming a default.",
            incorrect: "It's true, a gap between your max and your commitment absorbs shocks. Borrowing to the limit is how small setbacks spiral.",
          },
        },
      },
    ],
  },
  {
    slotId: "credit-debt/lesson-3/prioritise",
    conceptId: "good-debt-vs-bad-debt",
    variants: [
      {
        variantId: "pri-ab",
        step: {
          type: "scenario",
          question: "You can do one thing this month: (A) take an 18% loan for a holiday, or (B) throw extra at a 24% store card until it's gone. Which improves your finances?",
          options: [
            "B, attack the higher-rate debt",
            "A, memories are priceless",
            "Neither, the maths is too scary",
            "Open a third card to balance things",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Clearing a 24% balance beats taking on new 18% debt for a want. Kill expensive debt before funding luxuries.",
            incorrect: "Option B. Wiping a 24% debt saves more than any holiday loan costs, expensive debt first, wants later.",
          },
        },
      },
      {
        variantId: "pri-highest-first",
        step: {
          type: "mcq",
          question: "When paying down several debts, a strong default is to target:",
          options: [
            "The highest interest rate first",
            "The one with the nicest logo",
            "Whichever is newest",
            "None. Pay only minimums forever",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The highest-rate debt bleeds you fastest, so clearing it first saves the most money (the 'avalanche' method).",
            incorrect: "Target the highest rate first. It's the most expensive, so removing it saves you the most in interest.",
          },
        },
      },
      {
        variantId: "pri-new-debt-tf",
        step: {
          type: "true-false",
          statement: "Taking on new debt for a 'want' while carrying expensive debt usually sets you back.",
          correct: true,
          feedback: {
            correct: "True. New borrowing for wants, on top of costly existing debt, deepens the hole. Clear the expensive stuff first.",
            incorrect: "It's true: adding want-debt while you owe on a high-rate card just digs deeper. Kill the costly debt first.",
          },
        },
      },
    ],
  },
  {
    slotId: "credit-debt/lesson-3/annualise",
    conceptId: "good-debt-vs-bad-debt",
    variants: [
      {
        variantId: "ann-lounge",
        step: {
          type: "scenario",
          question: "A R3 000 lounge suite on a store account can end up costing about R7 000 paid over years. What lesson does that teach?",
          options: [
            "Annualise the cost before signing",
            "Furniture is always a scam",
            "Never buy anything at all on credit",
            "Store accounts are interest-free",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Work out the total you'll actually repay, not the shelf price. Once you see R7 000 for a R3 000 couch, you decide differently.",
            incorrect: "The lesson is to total the real cost before signing. A R3 000 item that costs R7 000 over time is a very different deal.",
          },
        },
      },
      {
        variantId: "ann-before-tf",
        step: {
          type: "true-false",
          statement: "Working out the total you'll repay (not just the price tag) helps you judge whether a credit purchase is worth it.",
          correct: true,
          feedback: {
            correct: "True. The price tag hides the interest. Add it all up and many 'affordable' monthly deals suddenly look like bad value.",
            incorrect: "It's true. Total repayment tells the real story. The monthly figure and sticker price both hide the interest.",
          },
        },
      },
      {
        variantId: "ann-worth-mcq",
        step: {
          type: "mcq",
          question: "The honest question to ask before buying something on credit is:",
          options: [
            "Would I want it at the total price?",
            "Can I get approved for this today?",
            "Does the store have a sale on now?",
            "Will it arrive quickly enough for me?",
          ],
          correct: 0,
          feedback: {
            correct: "Right. If it's not worth the full repaid amount, it's not worth financing. Approval and speed are the wrong questions.",
            incorrect: "Ask if it's worth the total interest-included cost. 'Can I get approved?' isn't the same as 'is this worth it?'",
          },
        },
      },
    ],
  },
];

const lesson3Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Not All Debt Is the Same",
    content:
      "<p>Good debt can be an affordable home loan on a stable income. The asset may grow and the rate is competitive. Bad debt is high-interest revolving credit for things that lose value fast (clothes, nights out rolled month to month), especially on minimum payments.</p><p>In SA, store cards near 20%+ can turn a R3 000 lounge suite into R7 000 over years. Before you sign, total the real cost and ask if it still feels worth it.</p>",
  },
  { slot: "credit-debt/lesson-3/which-bad" },
  { slot: "credit-debt/lesson-3/stress-test" },
  { slot: "credit-debt/lesson-3/prioritise" },
  { slot: "credit-debt/lesson-3/annualise" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 4 · "Store Cards & Credit Cards"
// ═══════════════════════════════════════════════════════════════════════════

const lesson4Slots: QuestionSlot[] = [
  {
    slotId: "credit-debt/lesson-4/pay-full",
    conceptId: "credit-cards",
    variants: [
      {
        variantId: "pf-grace-tf",
        step: {
          type: "true-false",
          statement: "Paying your full credit card balance by the due date usually avoids interest on new purchases.",
          correct: true,
          feedback: {
            correct: "True. That's the grace period, clear the full balance monthly and new purchases cost you nothing extra. Carry a balance and you lose it.",
            incorrect: "It's true. Paying in full each month keeps the interest-free grace period. Once you carry a balance, that benefit disappears.",
          },
        },
      },
      {
        variantId: "pf-disciplined-mcq",
        step: {
          type: "mcq",
          question: "A credit card only helps your finances when you:",
          options: [
            "Clear the full balance monthly",
            "Pay just the minimum",
            "Max it out to earn rewards points",
            "Use it for cash withdrawals",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Paid in full monthly, a card is a free short-term tool. Carried as a balance at 20%+, it quietly drains you.",
            incorrect: "Only full monthly repayment makes a card work for you. Minimums and cash withdrawals are where the costs pile up.",
          },
        },
      },
      {
        variantId: "pf-revolve-scenario",
        step: {
          type: "scenario",
          question: "Lerato pays her card in full most months, then one month pays only the minimum. What changes?",
          options: [
            "She starts paying interest",
            "Nothing, one month doesn't matter",
            "Her rate drops as a reward",
            "The bank clears her balance",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Carrying a balance switches interest on, frequently on new spend as well, until she's back to paying in full.",
            incorrect: "That one month flips interest on. Carrying a balance usually kills the grace period on new purchases too.",
          },
        },
      },
    ],
  },
  {
    slotId: "credit-debt/lesson-4/before-sign",
    conceptId: "credit-cards",
    variants: [
      {
        variantId: "bs-verify",
        step: {
          type: "mcq",
          question: "Before signing a store card at the till, what should you check first?",
          options: [
            "The rate, fees and arrears penalties",
            "Only the free gift on the desk",
            "Whether the card matches your phone cover",
            "Nothing, the cashier has already decided",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Cost and consequences beat a once-off perk. If you can't quote the rate, you're not ready to sign.",
            incorrect: "Check the rate, fees and penalties, and your existing debt. The free gift is the cheapest, least important part.",
          },
        },
      },
      {
        variantId: "bs-gift-tf",
        step: {
          type: "true-false",
          statement: "A once-off signup discount is a good enough reason to open a new store card.",
          correct: false,
          feedback: {
            correct: "Correct. A 10% welcome discount is nothing next to a year of 20%+ interest if you carry a balance. Judge the card, not the gift.",
            incorrect: "It isn't. A small signup perk is dwarfed by the interest a carried balance costs. Decide on the rate and your habits, not the gift.",
          },
        },
      },
      {
        variantId: "bs-already-debt-scenario",
        step: {
          type: "scenario",
          question: "Sipho is offered a store card at checkout but already has two cards he's struggling to clear. Smart response?",
          options: [
            "Decline, it just adds temptation",
            "Take it for the discount",
            "Take it and worry later",
            "Take it to spread the existing debt",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A third card doesn't spread debt, it grows it. When you're already struggling, more available credit is the last thing you need.",
            incorrect: "Decline it. Opening more credit while struggling adds temptation and risk, it doesn't 'spread' anything.",
          },
        },
      },
    ],
  },
  {
    slotId: "credit-debt/lesson-4/min-trap-math",
    conceptId: "credit-cards",
    variants: [
      {
        variantId: "mtm-fill",
        step: {
          type: "fill-blank",
          title: "How little comes off",
          prompt: "Your statement minimum is R450 and this month's interest is R380. Only about R____ actually reduces your debt.",
          correct: 70,
          feedback: {
            correct: "Correct: R450 − R380 = R70. Tiny principal cuts are exactly why minimum payments stretch on for years.",
            incorrect: "Take the minimum minus the interest: R450 − R380 = R70 off the real balance.",
          },
        },
      },
      {
        variantId: "mtm-why-tf",
        step: {
          type: "true-false",
          statement: "The minimum payment is set low mainly to keep you paying interest for as long as possible.",
          correct: true,
          feedback: {
            correct: "True. A low minimum keeps the balance, and the interest, alive for years. Paying above it is how you break out.",
            incorrect: "It's true, a small minimum maximises how long you pay interest. Beating the minimum every month is the escape.",
          },
        },
      },
      {
        variantId: "mtm-double-mcq",
        step: {
          type: "mcq",
          question: "If interest is R380 and you pay R760 instead of the R450 minimum, roughly how much comes off your debt?",
          options: ["About R380", "About R70", "Nothing", "About R760"],
          correct: 0,
          feedback: {
            correct: "Right: R760 − R380 = R380 off the principal: over five times the R70 the minimum would've managed.",
            incorrect: "Pay R760, minus R380 interest, leaves R380 cutting the debt. Far more than the minimum's R70.",
          },
        },
      },
    ],
  },
  {
    slotId: "credit-debt/lesson-4/friction",
    conceptId: "credit-cards",
    variants: [
      {
        variantId: "fr-oneclick",
        step: {
          type: "mcq",
          question: "A simple way to stop a credit card fuelling impulse spend is to:",
          options: [
            "Remove it from saved cards on apps",
            "Save it on every site for convenience",
            "Raise the card limit",
            "Use it for all daily spending",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Friction beats willpower. Having to fetch the card is often the pause that stops the unplanned purchase.",
            incorrect: "Add friction: unsave the card so each purchase is deliberate. Saving it everywhere does the opposite.",
          },
        },
      },
      {
        variantId: "fr-track-tf",
        step: {
          type: "true-false",
          statement: "It's wise to keep tap-to-pay linked only to an account you actually check every week.",
          correct: true,
          feedback: {
            correct: "True. If you can't track it weekly, you can't catch overspending or fraud early. Link tap only to what you watch.",
            incorrect: "It's true, only tap from an account you monitor weekly, so you spot overspending and dodgy charges quickly.",
          },
        },
      },
      {
        variantId: "fr-reliance-scenario",
        step: {
          type: "scenario",
          question: "Ayesha finds the idea of removing her saved card 'scary' because she needs it for month-end. What might that signal?",
          options: [
            "She may rely on credit for lifestyle",
            "That saved cards are essential for all",
            "That her bank is at fault",
            "Nothing at all",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Needing the card to get through the month is a red flag that credit is topping up income, not just smoothing timing.",
            incorrect: "It's a warning sign: leaning on the card to reach payday suggests credit is funding lifestyle, not just bridging timing.",
          },
        },
      },
    ],
  },
];

const lesson4Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Swipe Now, Pay Far More",
    content:
      "<p>Retail cards tempt you with instant approval and birthday discounts. A credit card can help cash flow if you clear the full balance monthly and any rewards beat the fees. Trouble starts when a revolving balance meets a 20%+ rate, then a R2 500 splurge lingers for years.</p><p>Rule of thumb: never autopay only the minimum unless you're in a structured emergency plan, and unlink tap-to-pay from accounts you can't track weekly.</p>",
  },
  { slot: "credit-debt/lesson-4/pay-full" },
  { slot: "credit-debt/lesson-4/before-sign" },
  { slot: "credit-debt/lesson-4/min-trap-math" },
  { slot: "credit-debt/lesson-4/friction" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 5 · "The Debt Snowball Method"
// ═══════════════════════════════════════════════════════════════════════════

const lesson5Slots: QuestionSlot[] = [
  {
    slotId: "credit-debt/lesson-5/which-first",
    conceptId: "debt-payoff",
    variants: [
      {
        variantId: "wf-smallest",
        step: {
          type: "mcq",
          question: "In the debt snowball method, which debt do you attack first?",
          options: [
            "The one with the smallest balance",
            "The one with the highest interest rate",
            "The one you have had for the longest",
            "The one your employer knows about",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Snowball goes smallest balance first. It's about quick wins and momentum, not pure maths.",
            incorrect: "Snowball = smallest balance first. Clearing one fast gives you a win that keeps you going.",
          },
        },
      },
      {
        variantId: "wf-order-scenario",
        step: {
          type: "scenario",
          question: "Nomsa owes R800, R4 000 and R15 000. Using the snowball, which does she throw extra money at first?",
          options: ["The R800 one", "The R15 000 one", "The R4 000 one", "All equally"],
          correct: 0,
          feedback: {
            correct: "Right. Smallest first: she clears the R800 quickly, feels the win, then rolls that payment onto the R4 000.",
            incorrect: "Snowball starts with the R800, the smallest, so she gets a fast win and builds momentum.",
          },
        },
      },
      {
        variantId: "wf-minimums-tf",
        step: {
          type: "true-false",
          statement: "In the snowball method, you still pay the minimum on every debt while throwing extra at the smallest.",
          correct: true,
          feedback: {
            correct: "True. Minimums on all (to stay in good standing), plus every spare rand at the smallest balance until it's gone.",
            incorrect: "It's true. Keep paying minimums on everything, and pile any extra onto the smallest debt.",
          },
        },
      },
    ],
  },
  {
    slotId: "credit-debt/lesson-5/why-works",
    conceptId: "debt-payoff",
    variants: [
      {
        variantId: "ww-momentum",
        step: {
          type: "mcq",
          question: "Why does the debt snowball work for so many people?",
          options: [
            "Each cleared debt builds momentum",
            "It saves the most interest",
            "It's the only legal way to pay debt",
            "It makes debt disappear instantly",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Debt payoff is as much psychology as maths. Fast wins keep you in the game long enough to finish.",
            incorrect: "It's about momentum. Quick, visible wins keep you motivated. It's not the cheapest on interest, but it's the one people stick to.",
          },
        },
      },
      {
        variantId: "ww-psychology-tf",
        step: {
          type: "true-false",
          statement: "Sticking with a debt plan you'll actually finish can beat a 'perfect' plan you abandon.",
          correct: true,
          feedback: {
            correct: "True. The best method is the one you complete. Snowball trades a little interest for motivation, and finished beats optimal.",
            incorrect: "It's true. A plan you finish beats a mathematically perfect one you quit. That's the snowball's whole appeal.",
          },
        },
      },
      {
        variantId: "ww-rollover-scenario",
        step: {
          type: "scenario",
          question: "Sipho finishes paying off his smallest debt. Under the snowball, what does he do with that freed-up payment?",
          options: [
            "Roll it onto the next-smallest debt",
            "Spend it, because he's earned a break",
            "Split it across unrelated wants",
            "Stop paying extra entirely",
          ],
          correct: 0,
          feedback: {
            correct: "Right. That rolled-over payment is the 'snowball'. Each cleared debt makes the next one fall faster.",
            incorrect: "He rolls it onto the next debt. Reusing that freed payment is exactly what makes the snowball accelerate.",
          },
        },
      },
    ],
  },
  {
    slotId: "credit-debt/lesson-5/avalanche",
    conceptId: "debt-payoff",
    variants: [
      {
        variantId: "av-highest",
        step: {
          type: "mcq",
          question: "The 'avalanche' method differs from the snowball by attacking:",
          options: [
            "The highest interest rate first",
            "The oldest debt you hold first",
            "The largest balance you owe first",
            "A random debt each month",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Avalanche targets the highest rate first. It saves the most interest, though the first win can take longer.",
            incorrect: "Avalanche = highest interest rate first. It's the cheapest on interest; snowball (smallest first) is the most motivating.",
          },
        },
      },
      {
        variantId: "av-cheapest-tf",
        step: {
          type: "true-false",
          statement: "The avalanche method (highest rate first) usually saves more in total interest than the snowball.",
          correct: true,
          feedback: {
            correct: "True. Mathematically, clearing the priciest debt first saves the most. Snowball trades a little of that for faster wins.",
            incorrect: "It's true. Avalanche saves the most interest. Snowball costs a bit more but keeps more people motivated to the end.",
          },
        },
      },
      {
        variantId: "av-pick-scenario",
        step: {
          type: "scenario",
          question: "Lerato is disciplined and mostly cares about paying the least interest. Which method fits her best?",
          options: [
            "Avalanche, highest rate first",
            "Snowball, smallest balance first",
            "Neither, pay only minimums",
            "Open a new consolidation loan",
          ],
          correct: 0,
          feedback: {
            correct: "Right. If motivation isn't her problem, avalanche saves her the most money by killing the priciest debt first.",
            incorrect: "For a disciplined, cost-focused person, avalanche (highest rate first) is the cheaper route.",
          },
        },
      },
    ],
  },
  {
    slotId: "credit-debt/lesson-5/get-started",
    conceptId: "debt-payoff",
    variants: [
      {
        variantId: "gs-list-tf",
        step: {
          type: "true-false",
          statement: "The first step in any debt-payoff plan is to list every debt with its balance and interest rate.",
          correct: true,
          feedback: {
            correct: "True. You can't prioritise what you can't see. Listing balances and rates is step one for both snowball and avalanche.",
            incorrect: "It's true. Start by listing every debt, balance and rate. That's the map for whichever method you choose.",
          },
        },
      },
      {
        variantId: "gs-consistency-mcq",
        step: {
          type: "mcq",
          question: "What matters most for a debt-payoff plan to actually work?",
          options: [
            "Consistently paying one target debt",
            "Switching methods every week",
            "Only paying when you feel like it",
            "Waiting for a big windfall to fix it",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Steady, focused extra payments on one target at a time is what clears debt, not sporadic effort or waiting for luck.",
            incorrect: "Consistency on one target beats chopping and changing or waiting for a windfall. Steady pressure wins.",
          },
        },
      },
      {
        variantId: "gs-both-start-scenario",
        step: {
          type: "scenario",
          question: "Whether you pick snowball or avalanche, what's the shared first move against a pile of debts?",
          options: [
            "Stop adding new debt",
            "Take a holiday to de-stress first",
            "Spread tiny amounts across all of them",
            "Ignore the smallest debts",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Both methods start the same way: stop the bleeding (no new debt) and concentrate firepower on one target.",
            incorrect: "Both begin by stopping new debt and focusing extra on a single target. The order of targets is the only difference.",
          },
        },
      },
    ],
  },
];

const lesson5Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Small Wins First",
    content:
      "<p>The debt snowball: list all debts smallest to largest, pay the minimum on all, and throw every extra rand at the smallest. When it's gone, roll that payment onto the next.</p><p><strong>Why it works:</strong> each paid-off debt is a win that builds momentum. The 'avalanche' (highest rate first) saves more interest, but the best method is the one you'll actually finish.</p>",
  },
  { slot: "credit-debt/lesson-5/which-first" },
  { slot: "credit-debt/lesson-5/why-works" },
  { slot: "credit-debt/lesson-5/avalanche" },
  { slot: "credit-debt/lesson-5/get-started" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 6 · "Debt Consolidation"
// ═══════════════════════════════════════════════════════════════════════════

const lesson6Slots: QuestionSlot[] = [
  {
    slotId: "credit-debt/lesson-6/biggest-risk",
    conceptId: "debt-consolidation",
    variants: [
      {
        variantId: "br-respend",
        step: {
          type: "mcq",
          question: "What's the biggest risk of debt consolidation for most people?",
          options: [
            "Clearing the cards with the loan",
            "The new loan is always at a higher rate",
            "Consolidation is illegal in South Africa",
            "Banks always refuse consolidation",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The classic trap: consolidate, feel relief, then re-spend on the now-empty cards, ending with double the debt.",
            incorrect: "The real danger is re-spending. Consolidating clears the cards, and many people fill them again, doubling their debt.",
          },
        },
      },
      {
        variantId: "br-behaviour-tf",
        step: {
          type: "true-false",
          statement: "Consolidation only works if you also change the habits that created the debt.",
          correct: true,
          feedback: {
            correct: "True. It's a tool, not a cure. Without new habits (and often closing the cleared cards), the debt just comes back.",
            incorrect: "It's true: consolidation reorganises debt but doesn't fix behaviour. Without changed habits, the balances return.",
          },
        },
      },
      {
        variantId: "br-longer-scenario",
        step: {
          type: "scenario",
          question: "A consolidation offer has a lower rate but stretches repayment from 2 years to 6. What's the hidden catch?",
          options: [
            "Six years of interest costs more",
            "No catch, longer is always better",
            "It's guaranteed to be cheaper",
            "The interest rate doesn't matter",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A lower monthly payment over far more years can mean more total interest. Always compare the total repaid, not just the instalment.",
            incorrect: "The catch is the longer term: more years of interest can outweigh the lower rate. Compare total cost, not the monthly figure.",
          },
        },
      },
    ],
  },
  {
    slotId: "credit-debt/lesson-6/ncr-protection",
    conceptId: "debt-consolidation",
    variants: [
      {
        variantId: "ncr-shield-tf",
        step: {
          type: "true-false",
          statement: "An NCR-registered debt counsellor can protect you from legal action by creditors while your debts are restructured.",
          correct: true,
          feedback: {
            correct: "True. Under the National Credit Act, formal debt review is a legal shield. Creditors can't sue or repossess while you're under review and paying.",
            incorrect: "It's true. NCR debt counselling gives legal protection under the NCA: no legal action while you're under review and making payments.",
          },
        },
      },
      {
        variantId: "ncr-what-mcq",
        step: {
          type: "mcq",
          question: "What does a registered debt counsellor do for an over-indebted person?",
          options: [
            "Negotiates one court-approved plan",
            "Makes the debt vanish entirely for free",
            "Lends them even more money",
            "Improves their credit score overnight",
          ],
          correct: 0,
          feedback: {
            correct: "Right. They restructure your payments into one affordable plan the court grants, while a flag on your record signals you're under review.",
            incorrect: "They negotiate with creditors and set up one court-approved repayment plan, they don't erase debt or lend more.",
          },
        },
      },
      {
        variantId: "ncr-flag-tf",
        step: {
          type: "true-false",
          statement: "Going under debt review places a flag on your credit record while it's active.",
          correct: true,
          feedback: {
            correct: "True. The flag signals you're under protection and restructuring. It's removed once you complete the programme and get a clearance certificate.",
            incorrect: "It's true, debt review flags your record while active, and clears once you finish and receive your clearance certificate.",
          },
        },
      },
    ],
  },
  {
    slotId: "credit-debt/lesson-6/when-helps",
    conceptId: "debt-consolidation",
    variants: [
      {
        variantId: "wh-when",
        step: {
          type: "mcq",
          question: "Consolidation is most likely to genuinely help when:",
          options: [
            "The rate is lower AND you stop borrowing",
            "It just combines everything, whatever the rate",
            "You keep spending on the cleared cards",
            "It stretches repayment as long as possible",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A lower rate plus disciplined behaviour is where consolidation shines: one cheaper payment and no new balances.",
            incorrect: "It helps when the rate is genuinely lower and you stop adding debt. Combining at any rate, then re-spending, defeats the point.",
          },
        },
      },
      {
        variantId: "wh-onepayment-tf",
        step: {
          type: "true-false",
          statement: "One benefit of consolidation is replacing several payments with a single, simpler monthly one.",
          correct: true,
          feedback: {
            correct: "True. One payment is easier to manage and less likely to be missed, helpful, as long as the rate and total cost stack up.",
            incorrect: "It's true. A single monthly payment is simpler to track, provided the interest rate and total repaid are actually better.",
          },
        },
      },
      {
        variantId: "wh-compare-scenario",
        step: {
          type: "scenario",
          question: "Before accepting a consolidation loan, the key comparison to make is:",
          options: [
            "Total repaid versus your current debts",
            "Which lender has the nicest branch",
            "Whichever gives cash back today",
            "The size of the loan you're approved for",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Compare the total you'd repay under the new loan against your current path. Lower monthly but higher total is a trap.",
            incorrect: "Compare total repayment, not the monthly figure or perks. A lower instalment over more years can cost more overall.",
          },
        },
      },
    ],
  },
  {
    slotId: "credit-debt/lesson-6/warning-signs",
    conceptId: "debt-consolidation",
    variants: [
      {
        variantId: "ws-unregistered",
        step: {
          type: "mcq",
          question: "Which is a red flag when choosing a debt-help company?",
          options: [
            "Not NCR-registered, big upfront fees",
            "Registered with the National Credit Regulator",
            "Fees that are regulated and disclosed",
            "It explains the process clearly",
          ],
          correct: 0,
          feedback: {
            correct: "Right. No NCR registration or big upfront fees are classic warning signs. Check registration at ncr.org.za before you commit.",
            incorrect: "The red flag is no NCR registration or hefty upfront fees. Legitimate counsellors are registered and their fees are regulated.",
          },
        },
      },
      {
        variantId: "ws-check-tf",
        step: {
          type: "true-false",
          statement: "You can check whether a debt counsellor is registered with the National Credit Regulator before signing up.",
          correct: true,
          feedback: {
            correct: "True. Verify registration at ncr.org.za. A quick check protects you from scams charging for a service they can't legally provide.",
            incorrect: "It's true. You can and should verify NCR registration (ncr.org.za) before handing anyone money or your details.",
          },
        },
      },
      {
        variantId: "ws-upfront-scenario",
        step: {
          type: "scenario",
          question: "A company promises to 'wipe' Thabo's debt and asks for a big fee upfront before doing anything. What should he do?",
          options: [
            "Walk away and check NCR registration",
            "Pay quickly before the offer expires",
            "Give them his card details to be safe",
            "Assume it's fine because they called",
          ],
          correct: 0,
          feedback: {
            correct: "Right. 'Wipe your debt' plus a big upfront fee is a scam pattern. Real, NCR-registered help doesn't work that way.",
            incorrect: "He should walk away. Upfront fees and 'debt wiped' promises are scam signals. Verify NCR registration instead.",
          },
        },
      },
    ],
  },
];

const lesson6Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Combining Debts Can Save or Sink You",
    content:
      "<p>Debt consolidation means one new loan to pay off several smaller debts, so you make a single monthly payment.</p><p><strong>When it helps:</strong> a lower rate, a lower total payment, simpler management. <strong>When it hurts:</strong> stretching the term can mean more interest overall, and many people clear their cards then run them up again.</p><p><strong>Debt review (NCR-registered):</strong> if you're over-indebted, a registered debt counsellor negotiates with creditors and a court grants one repayment plan. Creditors can't take legal action while you're under review. Avoid anyone not NCR-registered or charging big upfront fees; check at ncr.org.za.</p>",
  },
  { slot: "credit-debt/lesson-6/biggest-risk" },
  { slot: "credit-debt/lesson-6/ncr-protection" },
  { slot: "credit-debt/lesson-6/when-helps" },
  { slot: "credit-debt/lesson-6/warning-signs" },
];

export const CREDIT_DEBT_BANKS: Record<string, LessonBank> = {
  "credit-debt::lesson-1": { layout: lesson1Layout, slots: lesson1Slots },
  "credit-debt::lesson-2": { layout: lesson2Layout, slots: lesson2Slots },
  "credit-debt::lesson-3": { layout: lesson3Layout, slots: lesson3Slots },
  "credit-debt::lesson-4": { layout: lesson4Layout, slots: lesson4Slots },
  "credit-debt::lesson-5": { layout: lesson5Layout, slots: lesson5Slots },
  "credit-debt::lesson-6": { layout: lesson6Layout, slots: lesson6Slots },
};
