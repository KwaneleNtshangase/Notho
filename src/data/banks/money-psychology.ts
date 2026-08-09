import type { LessonLayoutItem, QuestionSlot } from "@/data/content";
import type { LessonBank } from "./money-basics";

/**
 * Bank for the "Money Psychology" course (behavioural biases + lifestyle).
 *
 * Content is standard behavioural-economics (present bias / hyperbolic
 * discounting, anchoring, sunk cost, herd behaviour + FOMO, loss aversion per
 * Kahneman & Tversky ~2x, lifestyle inflation, social comparison). We do NOT
 * lean on the marshmallow-test "better life outcomes" claim — later replications
 * (Watts et al., 2018) found it largely attenuates once family background is
 * controlled for. Tone: these biases are universal, not character flaws.
 */

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 1 · "Present Bias & Delayed Gratification"  (money-psychology::lesson-1)
// ═══════════════════════════════════════════════════════════════════════════

const l1Slots: QuestionSlot[] = [
  {
    slotId: "money-psychology/lesson-1/define",
    conceptId: "present-bias",
    variants: [
      {
        variantId: "mp-pb-def-mcq",
        step: {
          type: "mcq",
          question: "Present bias explains why people:",
          options: [
            "Prefer smaller rewards now",
            "Always make rational decisions",
            "Save too much and spend too little",
            "Are afraid of all financial risk",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Present bias pulls us toward immediate satisfaction, even when waiting would give us more.",
            incorrect: "Present bias = preferring a smaller reward now over a larger one later. It's why saving feels hard.",
          },
        },
      },
      {
        variantId: "mp-pb-def-tf",
        step: {
          type: "true-false",
          statement: "Present bias makes future rewards feel more valuable than an immediate one.",
          correct: false,
          feedback: {
            correct: "Correct. It's the reverse. Present bias inflates the value of what you can have right now.",
            incorrect: "It's the other way round: present bias overweights the immediate reward and discounts the future one.",
          },
        },
      },
      {
        variantId: "mp-pb-def-sc",
        step: {
          type: "scenario",
          question: "You choose R100 today over R150 in a month, purely because it's available now. What's driving that?",
          options: ["Present bias", "Patience", "Anchoring", "Loss aversion"],
          correct: 0,
          feedback: {
            correct: "Right. Taking less now instead of more later, just for the immediacy, is present bias in action.",
            incorrect: "That's present bias. Overvaluing the reward you can get immediately over a bigger delayed one.",
          },
        },
      },
    ],
  },
  {
    slotId: "money-psychology/lesson-1/counter",
    conceptId: "present-bias",
    variants: [
      {
        variantId: "mp-pb-fix-tf",
        step: {
          type: "true-false",
          statement: "Automating savings with a debit order on payday is an effective way to beat present bias.",
          correct: true,
          feedback: {
            correct: "Right. Automation makes the decision once and moves the money before you can spend it.",
            incorrect: "It is. Automation removes the daily temptation. The money leaves before present bias can act.",
          },
        },
      },
      {
        variantId: "mp-pb-fix-mcq",
        step: {
          type: "mcq",
          question: "The most reliable way to beat present bias is to:",
          options: [
            "Automate it before you can spend",
            "Rely on sheer willpower every day",
            "Wait until you earn more",
            "Avoid budgeting altogether",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Systems beat willpower. Set the saving to happen automatically and it survives a weak moment.",
            incorrect: "Willpower fades; automation doesn't. Making the choice once, up front, is what defeats present bias.",
          },
        },
      },
      {
        variantId: "mp-pb-fix-sc",
        step: {
          type: "scenario",
          question: "Thandi keeps meaning to save 'whatever's left' but never does. Best fix?",
          options: [
            "Move savings automatically on payday",
            "Try harder to resist each month",
            "Only save in months she feels motivated",
            "Wait for a bigger salary",
          ],
          correct: 0,
          feedback: {
            correct: "Right. 'Whatever's left' is usually nothing. Pay savings first, automatically, and the rest flexes.",
            incorrect: "Saving what's left rarely works. Automating it on payday puts saving first, before present bias spends it.",
          },
        },
      },
    ],
  },
  {
    slotId: "money-psychology/lesson-1/payoff",
    conceptId: "present-bias",
    variants: [
      {
        variantId: "mp-pb-pay-sc",
        step: {
          type: "scenario",
          question: "Two colleagues earn the same. One buys a cheaper car and invests the difference each month. Over years, what's the likely result of that delayed gratification?",
          options: [
            "They build meaningfully more wealth",
            "The outcome is identical",
            "They fall behind the other colleague",
            "It makes no difference either way",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The invested difference compounds. Small delays, repeated for years, become a large gap.",
            incorrect: "The one who invests the difference tends to end up well ahead, because that money compounds over time.",
          },
        },
      },
      {
        variantId: "mp-pb-pay-mcq",
        step: {
          type: "mcq",
          question: "Delayed gratification tends to build wealth mainly because:",
          options: [
            "Money invested now compounds over time",
            "Cheaper things are always better",
            "It avoids all tax",
            "Spending is inherently bad",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The advantage is compounding. Money kept and invested grows on itself year after year.",
            incorrect: "It's compounding: delaying a purchase and investing that money lets it grow on itself over time.",
          },
        },
      },
      {
        variantId: "mp-pb-pay-tf",
        step: {
          type: "true-false",
          statement: "Present bias is a personal failing that disciplined people simply never experience.",
          correct: false,
          feedback: {
            correct: "Correct. It's a universal wiring quirk. Even disciplined people design systems to work around it, not through it.",
            incorrect: "Everyone has present bias. The difference is that some people build systems (like automation) to outsmart it.",
          },
        },
      },
    ],
  },
  {
    slotId: "money-psychology/lesson-1/in-the-wild",
    conceptId: "present-bias",
    variants: [
      {
        variantId: "mp-pb-wild-mcq",
        step: {
          type: "mcq",
          question: "Which is an example of present bias working against your long-term interest?",
          options: [
            "Skipping savings for takeaways",
            "Setting up a retirement annuity",
            "Building an emergency fund",
            "Comparing prices before buying",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A small immediate treat wins over your future self. That's present bias steering the wheel.",
            incorrect: "The others serve your future self. Trading a savings transfer for a forgettable treat is present bias at work.",
          },
        },
      },
      {
        variantId: "mp-pb-wild-tf",
        step: {
          type: "true-false",
          statement: "'Buy now, pay later' offers are designed partly to exploit present bias.",
          correct: true,
          feedback: {
            correct: "Right. They hand you the reward immediately and push the cost into a future that feels far away.",
            incorrect: "They do. The whole appeal is the reward now, pain later, which is exactly the lever present bias pulls.",
          },
        },
      },
      {
        variantId: "mp-pb-wild-sc",
        step: {
          type: "scenario",
          question: "A shop offers 'take it home today, first payment in 3 months'. Why is this tempting even when it costs more overall?",
          options: [
            "Reward now, pain pushed to later",
            "It is always the cheapest option available",
            "It builds your credit score for free",
            "It must legally be interest-free always",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Reward now, cost later is the exact shape present bias falls for, so read the total price before agreeing.",
            incorrect: "The draw is 'reward now, pay later', which present bias overvalues. It often costs more once you add it up.",
          },
        },
      },
    ],
  },
];

const l1Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Why You Choose R100 Now Over R150 Later",
    content:
      "<p><strong>Present bias</strong> is the tendency to overvalue an immediate reward over a larger future one. It's why you know you should save but still spend. Economists call the underlying mechanism <em>hyperbolic discounting</em>. The future gets steeply 'discounted' the moment now is on the table.</p><p>The most powerful counter isn't more willpower. It's removing the in-the-moment decision. Automate the saving (a debit order on payday) so the money moves before you can spend it.</p>",
  },
  { slot: "money-psychology/lesson-1/define" },
  { slot: "money-psychology/lesson-1/counter" },
  { slot: "money-psychology/lesson-1/payoff" },
  { slot: "money-psychology/lesson-1/in-the-wild" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 2 · "Anchoring & Sunk Cost Fallacy"  (money-psychology::lesson-2)
// ═══════════════════════════════════════════════════════════════════════════

const l2Slots: QuestionSlot[] = [
  {
    slotId: "money-psychology/lesson-2/anchoring-define",
    conceptId: "anchoring-bias",
    variants: [
      {
        variantId: "mp-anc-def-mcq",
        step: {
          type: "mcq",
          question: "Anchoring bias is when:",
          options: [
            "The first number you see distorts your sense of value",
            "You follow whatever the crowd does",
            "You fear a loss more than you value a gain",
            "You finish things only because you paid for them",
          ],
          correct: 0,
          feedback: {
            correct: "Right. An initial 'anchor' number quietly reshapes how you judge every price after it.",
            incorrect: "Anchoring is about a first number setting your reference point: the others describe different biases.",
          },
        },
      },
      {
        variantId: "mp-anc-def-tf",
        step: {
          type: "true-false",
          statement: "A 'WAS R3 000, NOW R1 500' tag uses anchoring to make R1 500 feel cheap.",
          correct: true,
          feedback: {
            correct: "Right. The R3 000 anchor makes R1 500 feel like a steal. Even if the item's real value is far lower.",
            incorrect: "It does. The crossed-out R3 000 is the anchor; it's there to make R1 500 look like a bargain.",
          },
        },
      },
      {
        variantId: "mp-anc-def-sc",
        step: {
          type: "scenario",
          question: "You see a R5 000 jacket first, so a R2 000 one then feels 'reasonable'. What's happening?",
          options: ["Anchoring", "Sunk cost fallacy", "Loss aversion", "Herd mentality"],
          correct: 0,
          feedback: {
            correct: "Right. The R5 000 became your anchor, so R2 000 feels modest by comparison, regardless of true worth.",
            incorrect: "That's anchoring, the first (high) price sets the reference that makes the next one seem reasonable.",
          },
        },
      },
    ],
  },
  {
    slotId: "money-psychology/lesson-2/anchoring-counter",
    conceptId: "anchoring-bias",
    variants: [
      {
        variantId: "mp-anc-fix-mcq",
        step: {
          type: "mcq",
          question: "Your best defence against anchoring while shopping is to:",
          options: [
            "Judge value by what the item is worth to you",
            "Always buy when there's a discount",
            "Compare everything to the highest price you saw",
            "Trust that a bigger discount means a better deal",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Decide what it's worth to you first; then the crossed-out 'was' price loses its grip.",
            incorrect: "The anchor is the 'original' price. Beat it by valuing the item on its own merits, not the discount.",
          },
        },
      },
      {
        variantId: "mp-anc-fix-tf",
        step: {
          type: "true-false",
          statement: "The size of a discount reliably tells you whether something is genuinely worth buying.",
          correct: false,
          feedback: {
            correct: "Correct. A big discount off an inflated 'original' price can still be a bad deal. Value the item itself.",
            incorrect: "A discount is measured against an anchor that may be fake. It says little about the item's real worth.",
          },
        },
      },
      {
        variantId: "mp-anc-fix-sc",
        step: {
          type: "scenario",
          question: "A salary negotiation opens with a deliberately low first offer. Why does that first number matter so much?",
          options: [
            "It anchors the whole range",
            "It is legally binding once stated",
            "It sets the tax you'll pay",
            "It has no real effect on the outcome",
          ],
          correct: 0,
          feedback: {
            correct: "Right. First offers anchor negotiations, which is why coming in with your own researched number matters.",
            incorrect: "The opening number is an anchor that drags the whole negotiation toward it. Counter it with your own figure.",
          },
        },
      },
    ],
  },
  {
    slotId: "money-psychology/lesson-2/sunk-define",
    conceptId: "sunk-cost-fallacy",
    variants: [
      {
        variantId: "mp-sc-def-sc",
        step: {
          type: "scenario",
          question: "You paid R8 000 for concert tickets. The day before, you get sick and also get a better offer for that evening. What's the rational move?",
          options: [
            "The R8 000 is gone",
            "Attend anyway, since the money is already spent",
            "Attend briefly so the spend is partly justified",
            "Demand a refund on the basis of illness",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The R8 000 is spent either way. Only future costs and benefits should decide tonight.",
            incorrect: "The R8 000 is a sunk cost. Gone no matter what. Decide based on what's best for you now, not the past spend.",
          },
        },
      },
      {
        variantId: "mp-sc-def-mcq",
        step: {
          type: "mcq",
          question: "The sunk cost fallacy is:",
          options: [
            "Sticking with it for past spending",
            "Following what the crowd is buying",
            "Fearing losses more than valuing gains",
            "Anchoring to the first price you saw",
          ],
          correct: 0,
          feedback: {
            correct: "Right. It's letting unrecoverable past spending trap you into a decision that no longer makes sense.",
            incorrect: "Sunk cost is about past, unrecoverable spending driving present choices. The others are different biases.",
          },
        },
      },
      {
        variantId: "mp-sc-def-tf",
        step: {
          type: "true-false",
          statement: "Money already spent (a sunk cost) should be ignored when deciding what to do next.",
          correct: true,
          feedback: {
            correct: "Right. It's gone regardless of your next move, so only future costs and benefits should count.",
            incorrect: "It should be ignored. You can't get it back, so it shouldn't sway a forward-looking decision.",
          },
        },
      },
    ],
  },
  {
    slotId: "money-psychology/lesson-2/sunk-apply",
    conceptId: "sunk-cost-fallacy",
    variants: [
      {
        variantId: "mp-sc-app-sc",
        step: {
          type: "scenario",
          question: "You're 30% through a R15 000 course that turns out to be useless. What should decide whether you continue?",
          options: [
            "The future value of continuing",
            "Finishing it to 'get your money's worth'",
            "Continuing only to avoid admitting a mistake",
            "Whether stopping feels uncomfortable",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The R15 000 is spent regardless. Continue only if the remaining benefit beats the remaining cost.",
            incorrect: "The R15 000 is a sunk cost. Base the choice on future value. 'getting your money's worth' just adds to the loss.",
          },
        },
      },
      {
        variantId: "mp-sc-app-mcq",
        step: {
          type: "mcq",
          question: "Which is the sunk cost fallacy at work?",
          options: [
            "Continuing because of past spending",
            "Cancelling a subscription you never use",
            "Selling a share whose outlook has turned",
            "Comparing costs before committing",
          ],
          correct: 0,
          feedback: {
            correct: "Right. 'Too much invested to stop' is the classic trap. Past spend can't be recovered by spending more.",
            incorrect: "The fallacy is throwing good money after bad because of what you've already spent. The others are rational choices.",
          },
        },
      },
      {
        variantId: "mp-sc-app-tf",
        step: {
          type: "true-false",
          statement: "Cutting your losses early is often smarter than continuing just to justify past spending.",
          correct: true,
          feedback: {
            correct: "Right. Stopping a bad path frees your money and time for something with a better future return.",
            incorrect: "It usually is. Continuing only to honour a sunk cost tends to deepen the loss, not recover it.",
          },
        },
      },
    ],
  },
];

const l2Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Two Traps That Cost People Thousands",
    content:
      "<p><strong>Anchoring:</strong> the first price you see reshapes how you judge every price after it. A R5 000 jacket makes a R2 000 one feel 'cheap'. Even when R2 000 is still a lot.</p><p><strong>Sunk cost fallacy:</strong> continuing something because of money already spent, even when it no longer makes sense. 'I've paid for the gym, so I'll keep going even though I never do': versus cancelling and stopping the future waste. Money that's already gone should never drive your next decision.</p>",
  },
  { slot: "money-psychology/lesson-2/anchoring-define" },
  { slot: "money-psychology/lesson-2/anchoring-counter" },
  { slot: "money-psychology/lesson-2/sunk-define" },
  { slot: "money-psychology/lesson-2/sunk-apply" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 3 · "Herd Mentality & FOMO"  (money-psychology::lesson-3)
// ═══════════════════════════════════════════════════════════════════════════

const l3Slots: QuestionSlot[] = [
  {
    slotId: "money-psychology/lesson-3/define",
    conceptId: "herd-fomo",
    variants: [
      {
        variantId: "mp-hf-def-mcq",
        step: {
          type: "mcq",
          question: "Herd mentality in investing is:",
          options: [
            "Following the crowd because others are doing it",
            "Analysing an asset's fundamentals",
            "Spreading money across many investments",
            "Saving a fixed amount every month",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The brain reads 'lots of people are doing it' as proof it's correct, often wrongly.",
            incorrect: "Herding is moving with the crowd for its own sake. The others are deliberate, independent strategies.",
          },
        },
      },
      {
        variantId: "mp-hf-def-tf",
        step: {
          type: "true-false",
          statement: "When 'everyone' is buying an asset, that's reliable proof its price is low.",
          correct: false,
          feedback: {
            correct: "Correct. Mass buying usually comes after a big run-up. The crowd often arrives near the top, not the bottom.",
            incorrect: "It's not. By the time everyone's buying, the price has usually already risen a lot. Popularity isn't value.",
          },
        },
      },
      {
        variantId: "mp-hf-def-sc",
        step: {
          type: "scenario",
          question: "A coin is all over your feed and friends are buying; you feel you'll miss out if you don't. That feeling is:",
          options: ["FOMO driving herd behaviour", "Careful independent analysis", "Simple loss aversion", "Anchoring to a price"],
          correct: 0,
          feedback: {
            correct: "Right. Fear of missing out is the emotional engine that pushes people into the herd.",
            incorrect: "That's FOMO, the fear of missing out that fuels herd buying. It's an emotion, not an analysis.",
          },
        },
      },
    ],
  },
  {
    slotId: "money-psychology/lesson-3/independent",
    conceptId: "herd-fomo",
    variants: [
      {
        variantId: "mp-hf-ind-mcq",
        step: {
          type: "mcq",
          question: "Before investing in something everyone's hyping, you should first:",
          options: [
            "Understand how it actually makes money",
            "Count how many friends have bought in",
            "Buy a small amount quickly",
            "Check how much others have made",
          ],
          correct: 0,
          feedback: {
            correct: "Right. If you can't explain how it generates a return, you're guessing, not investing.",
            incorrect: "The only sound basis is understanding the asset. Buyer counts and others' gains tell you nothing about value.",
          },
        },
      },
      {
        variantId: "mp-hf-ind-tf",
        step: {
          type: "true-false",
          statement: "A useful rule is to wait a set time (say 48 hours) before acting on an investment tip.",
          correct: true,
          feedback: {
            correct: "Right. A cooling-off delay strips out the urgency that herd behaviour and scams depend on.",
            incorrect: "It's a good rule. A deliberate wait defuses FOMO and gives you time to check the thing out properly.",
          },
        },
      },
      {
        variantId: "mp-hf-ind-sc",
        step: {
          type: "scenario",
          question: "Which question best protects you from herd-driven losses?",
          options: [
            "Would I buy this unprompted?",
            "How many people have bought?",
            "How fast is the price rising?",
            "How much did my friends make?",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Stripping away the crowd forces you to judge the asset on its own merits.",
            incorrect: "The useful question removes the crowd from the picture. Buyer counts and momentum are what herding feeds on.",
          },
        },
      },
    ],
  },
  {
    slotId: "money-psychology/lesson-3/tops",
    conceptId: "herd-fomo",
    variants: [
      {
        variantId: "mp-hf-top-tf",
        step: {
          type: "true-false",
          statement: "Mass buying often happens after a price has already risen a lot, not at the bottom.",
          correct: true,
          feedback: {
            correct: "Right. Hype spreads once something has already run, which is exactly when early buyers tend to sell.",
            incorrect: "It does. The crowd usually piles in late, near the top, after the big move has already happened.",
          },
        },
      },
      {
        variantId: "mp-hf-top-mcq",
        step: {
          type: "mcq",
          question: "The danger of arriving with the herd is that:",
          options: [
            "You often buy near the top",
            "You always lose money, guaranteed",
            "You pay no transaction fees",
            "Prices are certain to keep rising",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Late-arriving demand is often what early buyers sell into. Leaving the herd holding the drop.",
            incorrect: "The specific risk is buying near the top as insiders exit, not a guaranteed loss, but a poor entry point.",
          },
        },
      },
      {
        variantId: "mp-hf-top-sc",
        step: {
          type: "scenario",
          question: "Friends made money early on a hyped asset and urge you to join now. Why is 'they already made money' a weak reason to buy?",
          options: [
            "Past gains don't justify today's price",
            "It guarantees that you'll make money too",
            "It lowers your risk",
            "It sets a fair price for you",
          ],
          correct: 0,
          feedback: {
            correct: "Right. You'd be buying later and higher. Their entry has nothing to do with whether yours makes sense.",
            incorrect: "Past gains for them say nothing about your entry now: often higher and later. Judge the asset, not their story.",
          },
        },
      },
    ],
  },
  {
    slotId: "money-psychology/lesson-3/fomo-scams",
    conceptId: "herd-fomo",
    variants: [
      {
        variantId: "mp-hf-scam-mcq",
        step: {
          type: "mcq",
          question: "How do scammers weaponise FOMO?",
          options: [
            "They manufacture urgency to stop you thinking",
            "They give you unlimited time to decide",
            "They carefully explain every risk",
            "They discourage you from recruiting others",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Urgency is the pressure lever. It exists to bypass the part of you that would check first.",
            incorrect: "The tell is manufactured urgency. Slowing you down is the last thing a scam wants, it wants you to rush.",
          },
        },
      },
      {
        variantId: "mp-hf-scam-tf",
        step: {
          type: "true-false",
          statement: "Urgency and 'don't miss out' pressure are red flags worth slowing down for.",
          correct: true,
          feedback: {
            correct: "Right. Real opportunities survive a 48-hour pause. Pressure to act now is a reason to check harder.",
            incorrect: "They are red flags. Legitimate opportunities don't evaporate if you take a day to verify them.",
          },
        },
      },
      {
        variantId: "mp-hf-scam-sc",
        step: {
          type: "scenario",
          question: "An 'investment group' says spots close tonight and friends are joining fast. Best response?",
          options: [
            "Slow down and verify it independently",
            "Join before it closes so you don't miss out",
            "Ask how much others put in and match it",
            "Recruit others to get in with you",
          ],
          correct: 0,
          feedback: {
            correct: "Right. 'Closes tonight' plus social pressure is the classic setup. Verify first, and let the deadline pass if needed.",
            incorrect: "The deadline and the crowd are the trap. Step back and verify, a real opportunity won't punish you for checking.",
          },
        },
      },
    ],
  },
];

const l3Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Why Everyone Else Buying Makes You Want to Buy",
    content:
      "<p><strong>Herd mentality</strong> is the pull to do what everyone else is doing. Our brains read a moving crowd as proof the direction is right. <strong>FOMO</strong> (fear of missing out) is its emotional engine.</p><p>The problem: the crowd usually arrives late, after prices have already run, and buys just as early holders sell. Protect yourself with three questions. Do I understand what I'm buying? Would I buy it if no one was talking about it? Can I explain how it makes a return?, and a rule to wait 48 hours before acting.</p>",
  },
  { slot: "money-psychology/lesson-3/define" },
  { slot: "money-psychology/lesson-3/independent" },
  { slot: "money-psychology/lesson-3/tops" },
  { slot: "money-psychology/lesson-3/fomo-scams" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 4 · "Loss Aversion"  (money-psychology::lesson-4)
// ═══════════════════════════════════════════════════════════════════════════

const l4Slots: QuestionSlot[] = [
  {
    slotId: "money-psychology/lesson-4/define",
    conceptId: "loss-aversion",
    variants: [
      {
        variantId: "mp-la-def-mcq",
        step: {
          type: "mcq",
          question: "Loss aversion means:",
          options: [
            "A loss hurts about twice as much",
            "Gains and losses feel equally intense",
            "Losing money actually feels quite good",
            "You actively enjoy taking big risks",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Kahneman and Tversky measured the pain of a loss at roughly double the pleasure of an equal gain.",
            incorrect: "Loss aversion is the asymmetry: losses hurt about twice as much as equal gains please. That's the whole point.",
          },
        },
      },
      {
        variantId: "mp-la-def-tf",
        step: {
          type: "true-false",
          statement: "Research by Kahneman and Tversky found people feel losses roughly twice as intensely as equal gains.",
          correct: true,
          feedback: {
            correct: "Right. That asymmetry is why a R1 000 loss stings far more than a R1 000 gain delights.",
            incorrect: "They did. The pain of a loss lands at roughly twice the intensity of an equivalent gain.",
          },
        },
      },
      {
        variantId: "mp-la-def-sc",
        step: {
          type: "scenario",
          question: "Losing R1 000 stings far more than finding R1 000 delights you. That asymmetry is:",
          options: ["Loss aversion", "Present bias", "Anchoring", "Herd mentality"],
          correct: 0,
          feedback: {
            correct: "Right. Equal amounts, unequal feelings. The loss hits harder. That's loss aversion.",
            incorrect: "That's loss aversion. The same rand amount hurts more as a loss than it pleases as a gain.",
          },
        },
      },
    ],
  },
  {
    slotId: "money-psychology/lesson-4/holding-losers",
    conceptId: "loss-aversion",
    variants: [
      {
        variantId: "mp-la-hold-sc",
        step: {
          type: "scenario",
          question: "Your R10 000 share is now worth R4 000 with a poor outlook, but selling feels awful. Loss aversion pushes you to:",
          options: [
            "Hold on, hoping it climbs back to break even",
            "Sell and redeploy the money rationally",
            "Buy more without any analysis",
            "Review it calmly on the merits",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The urge to avoid 'locking in' the loss keeps people holding broken investments far too long.",
            incorrect: "Loss aversion makes you hold, hoping to break even: even when the case for the investment is gone.",
          },
        },
      },
      {
        variantId: "mp-la-hold-mcq",
        step: {
          type: "mcq",
          question: "The rational way to decide whether to keep a fallen investment is to ask:",
          options: [
            "'Would I buy it today at this price?'",
            "'What did I originally pay?'",
            "'How long have I held it?'",
            "'How much have I already lost?'",
          ],
          correct: 0,
          feedback: {
            correct: "Right. If you wouldn't buy it now, holding it is just loss aversion. The past price is irrelevant.",
            incorrect: "The forward-looking question is whether you'd buy it today. What you paid and how much you've lost don't matter now.",
          },
        },
      },
      {
        variantId: "mp-la-hold-tf",
        step: {
          type: "true-false",
          statement: "The price you originally paid should be the main factor in deciding whether to sell.",
          correct: false,
          feedback: {
            correct: "Correct. Your purchase price is history. The decision should rest on future prospects, not what you paid.",
            incorrect: "It shouldn't. Anchoring to your purchase price is the bias. Decide on future prospects, not past cost.",
          },
        },
      },
    ],
  },
  {
    slotId: "money-psychology/lesson-4/panic",
    conceptId: "loss-aversion",
    variants: [
      {
        variantId: "mp-la-panic-mcq",
        step: {
          type: "mcq",
          question: "During a sharp market crash, loss aversion often causes people to:",
          options: [
            "Panic-sell at the bottom to stop the pain",
            "Calmly rebalance to their plan",
            "Buy steadily through the fall",
            "Do nothing and stay invested",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The pain gets so intense that people sell at the worst possible moment, locking in the loss.",
            incorrect: "Loss aversion drives panic-selling at the bottom, the emotional pain overrides the long-term plan.",
          },
        },
      },
      {
        variantId: "mp-la-panic-tf",
        step: {
          type: "true-false",
          statement: "Fear of losses can keep someone sitting in cash for years, quietly losing buying power to inflation.",
          correct: true,
          feedback: {
            correct: "Right. Avoiding all risk isn't safe, inflation erodes idle cash every year it isn't growing.",
            incorrect: "It can. Dodging every loss by staying in cash guarantees a slow, real loss to inflation over time.",
          },
        },
      },
      {
        variantId: "mp-la-panic-sc",
        step: {
          type: "scenario",
          question: "Markets fall 30% and the pain is intense. Historically, selling everything at that point tends to:",
          options: [
            "Lock in losses at the worst moment",
            "Reliably protect your total wealth",
            "Beat inflation over time",
            "Remove all of your risk safely",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Selling into the crash turns a paper dip into a real, permanent loss and misses the recovery.",
            incorrect: "Selling at the bottom locks in the loss and misses the rebound. It feels safe but usually destroys returns.",
          },
        },
      },
    ],
  },
  {
    slotId: "money-psychology/lesson-4/reframe",
    conceptId: "loss-aversion",
    variants: [
      {
        variantId: "mp-la-ref-mcq",
        step: {
          type: "mcq",
          question: "The healthiest reframe against loss aversion is to:",
          options: [
            "Judge investments on future prospects",
            "Never sell anything, ever",
            "Avoid investing altogether",
            "Follow your gut in the moment",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Forward-looking decisions beat ones anchored to a purchase price you can't change.",
            incorrect: "The reframe is forward-looking: what are the prospects from here? The price you paid is sunk and irrelevant.",
          },
        },
      },
      {
        variantId: "mp-la-ref-tf",
        step: {
          type: "true-false",
          statement: "Your purchase price is irrelevant to an investment's future performance.",
          correct: true,
          feedback: {
            correct: "Right. The market doesn't know or care what you paid: only future prospects drive future returns.",
            incorrect: "It is irrelevant. Future performance depends on the asset from here, not on the number you happened to pay.",
          },
        },
      },
      {
        variantId: "mp-la-ref-sc",
        step: {
          type: "scenario",
          question: "You'd never buy this share today, yet you hold it only because selling means admitting a loss. What does that reveal?",
          options: [
            "Loss aversion, not analysis",
            "A sound long-term strategy",
            "Strong investing discipline",
            "A well-diversified portfolio",
          ],
          correct: 0,
          feedback: {
            correct: "Right. 'I'd never buy it now but can't sell it' is loss aversion in a sentence. The analysis already says sell.",
            incorrect: "If you wouldn't buy it today, holding only to avoid the loss is loss aversion, not a strategy.",
          },
        },
      },
    ],
  },
];

const l4Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Why Losing Hurts Twice as Much as Winning Feels Good",
    content:
      "<p>Daniel Kahneman and Amos Tversky showed that humans feel the pain of a loss roughly <strong>twice as intensely</strong> as the pleasure of an equal gain. Losing R1 000 hurts about twice as much as gaining R1 000 feels good.</p><p>That asymmetry quietly wrecks returns: people hold losing investments too long hoping to break even, panic-sell at market bottoms, or avoid investing at all. The rational response is to evaluate an investment on its future prospects, if you wouldn't buy it today, the price you paid shouldn't keep you in it.</p>",
  },
  { slot: "money-psychology/lesson-4/define" },
  { slot: "money-psychology/lesson-4/holding-losers" },
  { slot: "money-psychology/lesson-4/panic" },
  { slot: "money-psychology/lesson-4/reframe" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 5 · "Lifestyle Inflation Deep Dive"  (money-psychology::lesson-5)
// ═══════════════════════════════════════════════════════════════════════════

const l5Slots: QuestionSlot[] = [
  {
    slotId: "money-psychology/lesson-5/define",
    conceptId: "lifestyle-inflation",
    variants: [
      {
        variantId: "mp-li-def-mcq",
        step: {
          type: "mcq",
          question: "Lifestyle inflation is when:",
          options: [
            "Your spending rises to match every income increase",
            "You save more as you earn more",
            "Prices rise across the whole economy",
            "You fear losses more than you value gains",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Earn more, spend more, save the same, so income goes up but wealth doesn't. (Note: that economy-wide version is price inflation, a different thing.)",
            incorrect: "Lifestyle inflation is personal: spending climbs with income so you never get ahead. Economy-wide price rises are separate.",
          },
        },
      },
      {
        variantId: "mp-li-def-tf",
        step: {
          type: "true-false",
          statement: "Lifestyle inflation only happens to people who are bad with money.",
          correct: false,
          feedback: {
            correct: "Correct. It's a near-universal human tendency. Even financially literate people have to actively resist it.",
            incorrect: "It affects almost everyone. It's not a character flaw; it's a default you have to consciously push against.",
          },
        },
      },
      {
        variantId: "mp-li-def-sc",
        step: {
          type: "scenario",
          question: "Sipho's salary rises from R20k to R30k. He upgrades his flat, car and subscriptions, and still saves only R1k a month. What happened?",
          options: ["Lifestyle inflation", "Disciplined saving", "Anchoring", "Loss aversion"],
          correct: 0,
          feedback: {
            correct: "Right. The whole R10k raise was absorbed by higher spending, so his savings didn't move.",
            incorrect: "That's lifestyle inflation. The raise vanished into upgraded spending, leaving his savings flat.",
          },
        },
      },
    ],
  },
  {
    slotId: "money-psychology/lesson-5/fix",
    conceptId: "lifestyle-inflation",
    variants: [
      {
        variantId: "mp-li-fix-fill",
        step: {
          type: "fill-blank",
          title: "Save half the raise",
          prompt: "You get a R4 000/month raise and commit to saving half before upgrading anything. That's R____ more saved each month.",
          correct: 2000,
          feedback: {
            correct: "Right: half of R4 000 is R2 000 saved every month. The rest you can enjoy guilt-free.",
            incorrect: "Half of a R4 000 raise is R2 000. Bank that first; the other R2 000 is yours to spend.",
          },
        },
      },
      {
        variantId: "mp-li-fix-mcq",
        step: {
          type: "mcq",
          question: "A practical rule for beating lifestyle inflation when you get a raise is to:",
          options: [
            "Save at least half the increase",
            "Upgrade your car first, then see",
            "Spend it all, you earned it",
            "Let the money sit in your account",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Locking in half the raise as savings turns rising income into rising wealth.",
            incorrect: "The rule is to bank at least half the raise first. Upgrading first is exactly how the increase disappears.",
          },
        },
      },
      {
        variantId: "mp-li-fix-tf",
        step: {
          type: "true-false",
          statement: "Saving a portion of every raise before adjusting your lifestyle helps turn income into wealth.",
          correct: true,
          feedback: {
            correct: "Right. Capturing part of each increase is how a rising salary actually becomes a growing net worth.",
            incorrect: "It does. Banking part of each raise first is the mechanism that converts higher income into real wealth.",
          },
        },
      },
    ],
  },
  {
    slotId: "money-psychology/lesson-5/recognise",
    conceptId: "lifestyle-inflation",
    variants: [
      {
        variantId: "mp-li-rec-mcq",
        step: {
          type: "mcq",
          question: "Which is a sign of lifestyle inflation?",
          options: [
            "Every raise brings bigger fixed costs",
            "Your savings rate rises as income grows",
            "You pay off debt faster each year",
            "You track your net worth monthly",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Rising commitments plus flat savings is the signature of a raise being quietly consumed.",
            incorrect: "The warning sign is bigger fixed costs with unchanged savings. The others are signs you're actually getting ahead.",
          },
        },
      },
      {
        variantId: "mp-li-rec-sc",
        step: {
          type: "scenario",
          question: "After each raise, Lerato's savings stay flat while her rent, car and subscriptions climb. Her main issue is:",
          options: ["Lifestyle inflation", "Too low an income", "Bad luck", "High taxes"],
          correct: 0,
          feedback: {
            correct: "Right. Her income is growing. It's the matching rise in spending that keeps her savings stuck.",
            incorrect: "It's lifestyle inflation. The income is there; the spending grows to match it, so nothing is left to save.",
          },
        },
      },
      {
        variantId: "mp-li-rec-tf",
        step: {
          type: "true-false",
          statement: "Earning more automatically means you'll build more wealth.",
          correct: false,
          feedback: {
            correct: "Correct. Wealth comes from the gap between income and spending, if spending rises too, the gap never widens.",
            incorrect: "Not automatically. If spending climbs with income, a bigger salary can still leave you saving nothing.",
          },
        },
      },
    ],
  },
  {
    slotId: "money-psychology/lesson-5/fixed-costs",
    conceptId: "lifestyle-inflation",
    variants: [
      {
        variantId: "mp-li-fc-mcq",
        step: {
          type: "mcq",
          question: "Why are upgraded FIXED costs (a bigger car repayment, a pricier flat) especially risky?",
          options: [
            "They lock in high spending monthly",
            "They are cheaper in the long run",
            "They automatically build your savings",
            "They reduce the tax you owe",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A one-off treat ends; a bigger monthly commitment follows you for years and is painful to unwind.",
            incorrect: "The risk is that fixed costs commit you every month and are hard to undo, unlike a single one-off purchase.",
          },
        },
      },
      {
        variantId: "mp-li-fc-tf",
        step: {
          type: "true-false",
          statement: "One-off treats usually do more long-term damage to wealth than permanently higher monthly commitments.",
          correct: false,
          feedback: {
            correct: "Correct. It's the reverse: a recurring commitment compounds month after month, while a one-off is done.",
            incorrect: "It's the other way round. Higher fixed monthly costs quietly drain wealth for years; a single treat doesn't.",
          },
        },
      },
      {
        variantId: "mp-li-fc-sc",
        step: {
          type: "scenario",
          question: "A raise arrives. Which choice best protects your future wealth?",
          options: [
            "Bank half the raise",
            "Finance a nicer car immediately",
            "Move to a much pricier flat",
            "Add several new subscriptions",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Capture the raise as savings first; then any small upgrade comes from the half you kept for yourself.",
            incorrect: "Banking half the raise first protects you. The other options lock in higher fixed costs and eat the increase.",
          },
        },
      },
    ],
  },
];

const l5Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "The Silent Wealth Destroyer",
    content:
      "<p><strong>Lifestyle inflation</strong> is when every income increase is matched by a spending increase. You earn more but never build wealth. Sipho earns R20k and spends R19k; promoted to R30k, he upgrades the flat, car and subscriptions and now spends R29k. Still saving just R1k.</p><p>The fix is a rule you set in advance: when a raise lands, save at least half of the increase before upgrading anything. Wealth lives in the gap between what you earn and what you spend, protect the gap.</p>",
  },
  { slot: "money-psychology/lesson-5/define" },
  { slot: "money-psychology/lesson-5/fix" },
  { slot: "money-psychology/lesson-5/recognise" },
  { slot: "money-psychology/lesson-5/fixed-costs" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 6 · "Social Media & Money Pressure"  (money-psychology::lesson-6)
// ═══════════════════════════════════════════════════════════════════════════

const l6Slots: QuestionSlot[] = [
  {
    slotId: "money-psychology/lesson-6/highlight-reel",
    conceptId: "social-comparison",
    variants: [
      {
        variantId: "mp-scmp-hr-tf",
        step: {
          type: "true-false",
          statement: "People who post luxury purchases and travel online are almost always in a strong financial position.",
          correct: false,
          feedback: {
            correct: "Correct. Visible wealth and real wealth are weakly correlated. A lot of it is funded by debt, not savings.",
            incorrect: "Not really. Displayed spending is often credit-funded. What people show reveals little about their actual finances.",
          },
        },
      },
      {
        variantId: "mp-scmp-hr-mcq",
        step: {
          type: "mcq",
          question: "Someone's visible spending on social media tells you:",
          options: [
            "Little about their real finances",
            "That they are definitely wealthy",
            "Their exact net worth",
            "A strategy you should copy",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A feed is a highlight reel, not a balance sheet. The car may be on 72-month finance.",
            incorrect: "It tells you very little. Displays are often debt-funded. You're seeing a highlight reel, not their bank balance.",
          },
        },
      },
      {
        variantId: "mp-scmp-hr-sc",
        step: {
          type: "scenario",
          question: "An influencer flaunts designer clothes and a new car every week. What's a realistic read?",
          options: [
            "It may be free product or credit",
            "They are clearly financially secure",
            "You should try to match their lifestyle",
            "They must have saved very carefully",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Gifted product, sponsorships and finance deals mean the display says nothing about real net worth.",
            incorrect: "Much of it is likely free product, credit, or finance. Visible flash isn't evidence of financial security.",
          },
        },
      },
    ],
  },
  {
    slotId: "money-psychology/lesson-6/comparison-trap",
    conceptId: "social-comparison",
    variants: [
      {
        variantId: "mp-scmp-ct-mcq",
        step: {
          type: "mcq",
          question: "The healthiest benchmark for your own finances is:",
          options: [
            "Your own goals and net-worth progress",
            "Your colleagues' cars and holidays",
            "What your social feed displays",
            "The richest person you follow",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The only comparison that's financially meaningful is you-now versus you-last-year.",
            incorrect: "Measure against your own goals and net worth. Other people's displays tell you nothing useful about your progress.",
          },
        },
      },
      {
        variantId: "mp-scmp-ct-tf",
        step: {
          type: "true-false",
          statement: "Comparing yourself to curated online lifestyles tends to drive spending you didn't plan.",
          correct: true,
          feedback: {
            correct: "Right. The consume–post–compare–consume loop is a real engine of overspending. Naming it helps you step out.",
            incorrect: "It does. Constant comparison to highlight reels nudges you toward purchases you never actually planned.",
          },
        },
      },
      {
        variantId: "mp-scmp-ct-sc",
        step: {
          type: "scenario",
          question: "A colleague posts a new car and you suddenly feel behind. What's the most financially sound response?",
          options: [
            "Refocus on your own goals",
            "Finance a similar car to keep up",
            "Assume they're broke and feel smug",
            "Copy their spending to match them",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Their car changes nothing about your plan. Your progress is measured against your goals, not their feed.",
            incorrect: "The sound move is to return to your own goals. Matching their spending, or just gloating, helps nothing.",
          },
        },
      },
    ],
  },
  {
    slotId: "money-psychology/lesson-6/boundaries",
    conceptId: "social-comparison",
    variants: [
      {
        variantId: "mp-scmp-b-mcq",
        step: {
          type: "mcq",
          question: "Which habit best reduces social-media-driven overspending?",
          options: [
            "Mute triggers and wait 72 hours",
            "Shop right when you feel the FOMO",
            "Follow more luxury accounts for ideas",
            "Buy things to match your feed",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Remove the trigger and add a delay, the urge usually fades once the 72 hours pass.",
            incorrect: "Muting triggers and adding a waiting period works. The other options feed the impulse rather than defusing it.",
          },
        },
      },
      {
        variantId: "mp-scmp-b-tf",
        step: {
          type: "true-false",
          statement: "A short waiting period before non-essential purchases helps separate a real want from an impulse.",
          correct: true,
          feedback: {
            correct: "Right. If you still want it in 72 hours, it's probably real; most impulses simply evaporate.",
            incorrect: "It helps a lot: a deliberate pause lets the impulse fade so only genuine wants survive.",
          },
        },
      },
      {
        variantId: "mp-scmp-b-sc",
        step: {
          type: "scenario",
          question: "You feel a strong urge to buy something you saw online ten minutes ago. A good rule is to:",
          options: [
            "Wait 72 hours before non-essentials",
            "Buy it right now before it all sells out",
            "Ask your feed whether you should buy it",
            "Put it on credit and decide later on",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The wait breaks the impulse loop, and 'it'll sell out' is usually manufactured urgency.",
            incorrect: "A 72-hour wait defuses the impulse. Buying now on urgency, or on credit, is how the loop keeps its grip.",
          },
        },
      },
    ],
  },
  {
    slotId: "money-psychology/lesson-6/debt-behind-display",
    conceptId: "social-comparison",
    variants: [
      {
        variantId: "mp-scmp-d-mcq",
        step: {
          type: "mcq",
          question: "Why is matching a friend's visible lifestyle on credit especially dangerous?",
          options: [
            "You take real debt to copy debt",
            "It always pays off well in the end",
            "It reliably builds your wealth",
            "Credit for lifestyle is free",
          ],
          correct: 0,
          feedback: {
            correct: "Right. You inherit real, interest-bearing debt to copy a picture that might be debt too, a double trap.",
            incorrect: "The danger is real debt taken on to mimic a display that may already be debt-funded. Nothing about that builds wealth.",
          },
        },
      },
      {
        variantId: "mp-scmp-d-tf",
        step: {
          type: "true-false",
          statement: "Financially secure people often live more modestly than their income would allow.",
          correct: true,
          feedback: {
            correct: "Right. Quiet, below-your-means spending is a common feature of real financial security, it just isn't posted online.",
            incorrect: "They often do. Real security tends to look modest, because the wealth is being kept and invested, not displayed.",
          },
        },
      },
      {
        variantId: "mp-scmp-d-sc",
        step: {
          type: "scenario",
          question: "To 'keep up', Andile finances a car matching his colleague's. Six months later he's stretched thin. The lesson?",
          options: [
            "Visible consumption is a poor guide",
            "He should have bought the car sooner",
            "Social proof is a reliable financial signal",
            "Taking on the debt was harmless",
          ],
          correct: 0,
          feedback: {
            correct: "Right. He bought real debt to match an image. Your plan, not someone's feed, should set your spending.",
            incorrect: "The lesson is that displays are a poor guide. Andile took on real strain to copy an image; spend against your own plan.",
          },
        },
      },
    ],
  },
];

const l6Layout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Instagram Shows the Highlight Reel, Not the Balance Sheet",
    content:
      "<p>Social media supercharges an old trap: comparing your lifestyle to everyone else's: now thousands of curated personas at once. What you don't see is the debt behind the display. The luxury holiday may sit on a personal loan; the designer clothes may be gifted or on credit; the car may be on a 72-month finance deal eating 30% of their income.</p><p>Practical boundaries: mute accounts that trigger spending, use a 72-hour wait on non-essentials, and measure yourself against your own goals and net worth. The only comparison that means anything.</p>",
  },
  { slot: "money-psychology/lesson-6/highlight-reel" },
  { slot: "money-psychology/lesson-6/comparison-trap" },
  { slot: "money-psychology/lesson-6/boundaries" },
  { slot: "money-psychology/lesson-6/debt-behind-display" },
];

// ═══════════════════════════════════════════════════════════════════════════

export const MONEY_PSYCHOLOGY_BANKS: Record<string, LessonBank> = {
  "money-psychology::lesson-1": { layout: l1Layout, slots: l1Slots },
  "money-psychology::lesson-2": { layout: l2Layout, slots: l2Slots },
  "money-psychology::lesson-3": { layout: l3Layout, slots: l3Slots },
  "money-psychology::lesson-4": { layout: l4Layout, slots: l4Slots },
  "money-psychology::lesson-5": { layout: l5Layout, slots: l5Slots },
  "money-psychology::lesson-6": { layout: l6Layout, slots: l6Slots },
};
