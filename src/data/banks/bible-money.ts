import type { LessonLayoutItem, QuestionSlot } from "@/data/content";
import type { LessonBank } from "./money-basics";

/**
 * Bank for the "Money & the Bible" course.
 *
 * All Scripture is quoted from the New Living Translation (NLT), matching the
 * translation used in the rest of this course. Every verbatim quote was
 * checked against BibleHub / Bible Study Tools / YouVersion (NLT, ref. 116):
 *   Psalm 24:1, Luke 16:10, 1 Timothy 6:10, Proverbs 21:20, Proverbs 6:6-8,
 *   Proverbs 21:5, Proverbs 13:11, Proverbs 3:9, Proverbs 11:24-25,
 *   2 Corinthians 9:7, Proverbs 19:17, Proverbs 22:7, Romans 13:8,
 *   Proverbs 22:26-27, Psalm 37:21.
 *
 * Tone: this is wisdom for stewardship, not prosperity-gospel guilt. Money is
 * treated as a neutral tool; the heart behind it is the point (1 Tim 6:10).
 */

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 1 · "What Is Stewardship?"  (bible-money::what-is-stewardship)
// ═══════════════════════════════════════════════════════════════════════════

const stewardshipSlots: QuestionSlot[] = [
  {
    slotId: "bible-money/what-is-stewardship/ownership",
    conceptId: "stewardship-biblical",
    variants: [
      {
        variantId: "bm-own-mcq",
        step: {
          type: "mcq",
          question: "According to Psalm 24:1, who ultimately owns everything you have?",
          options: ["God", "You", "Your employer", "Your bank"],
          correct: 0,
          feedback: {
            correct: "Right. 'The earth is the Lord's, and everything in it.' That makes you a manager, not the owner.",
            incorrect: "Psalm 24:1 says 'The earth is the Lord's, and everything in it.' You manage it; God owns it.",
          },
        },
      },
      {
        variantId: "bm-own-tf",
        step: {
          type: "true-false",
          statement: "Biblical stewardship treats you as the outright owner of your money, answerable to no one for how you use it.",
          correct: false,
          feedback: {
            correct: "Correct. Psalm 24:1 flips that: God owns it all and you manage it on His behalf.",
            incorrect: "It's the opposite. Psalm 24:1 makes God the owner and you the steward: you manage what's His.",
          },
        },
      },
      {
        variantId: "bm-own-sc",
        step: {
          type: "scenario",
          question: "Thabo gets a bonus and asks, 'What does God want me to do with this?' instead of 'What do I feel like doing with it?' Is that a stewardship mindset?",
          options: [
            "Yes. A steward asks how to manage what they've been entrusted with",
            "No. A bonus is his own reward to spend freely",
            "No. Stewardship only applies to church offerings",
            "Only if he gives all of it away",
          ],
          correct: 0,
          feedback: {
            correct: "Exactly. Stewardship reframes every rand as something you manage for God, bonus included.",
            incorrect: "That's the steward's question. Ownership belongs to God (Psalm 24:1); Thabo is deciding how to manage it well.",
          },
        },
      },
    ],
  },
  {
    slotId: "bible-money/what-is-stewardship/faithful-little",
    conceptId: "stewardship-biblical",
    variants: [
      {
        variantId: "bm-fl-tf",
        step: {
          type: "true-false",
          statement: "Luke 16:10 teaches that how you handle small amounts reveals how you'd handle large ones.",
          correct: true,
          feedback: {
            correct: "Right. 'If you are faithful in little things, you will be faithful in large ones.' Habits with R500 shape what you'd do with R5 million.",
            incorrect: "It does. Luke 16:10 links faithfulness with little to faithfulness with much. The small decisions are the training ground.",
          },
        },
      },
      {
        variantId: "bm-fl-mcq",
        step: {
          type: "mcq",
          question: "Luke 16:10 says faithfulness with 'little things' matters because it:",
          options: [
            "Shapes whether you'll be trusted with larger responsibilities",
            "Guarantees you'll become wealthy",
            "Only counts once you're already rich",
            "Excuses carelessness while you're still poor",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Small-scale faithfulness is the proving ground for larger trust, it isn't about the amount.",
            incorrect: "Luke 16:10 ties small faithfulness to greater responsibility, not to a guaranteed payout or a pass while you're poor.",
          },
        },
      },
      {
        variantId: "bm-fl-sc",
        step: {
          type: "scenario",
          question: "Someone says, 'I'll start budgeting and giving once I earn more.' How does Luke 16:10 speak to that?",
          options: [
            "The habits you build with little are the ones you'll carry into much",
            "They're right. Money management only matters at high incomes",
            "They should wait until they're debt-free first",
            "Budgeting is unbiblical anyway",
          ],
          correct: 0,
          feedback: {
            correct: "Exactly. 'More money' rarely fixes a habit problem. Faithfulness starts now, with what's in hand.",
            incorrect: "Luke 16:10 says the opposite: faithfulness with little is what prepares you for more. Waiting to 'earn more' just delays the habit.",
          },
        },
      },
    ],
  },
  {
    slotId: "bible-money/what-is-stewardship/money-and-heart",
    conceptId: "contentment-biblical",
    variants: [
      {
        variantId: "bm-heart-tf",
        step: {
          type: "true-false",
          statement: "The Bible says that money itself is the root of all evil.",
          correct: false,
          feedback: {
            correct: "Correct. 1 Timothy 6:10 says the LOVE of money is a root of all kinds of evil. Money itself is a neutral tool.",
            incorrect: "It's the LOVE of money, per 1 Timothy 6:10, not money itself. The heart behind it is the issue.",
          },
        },
      },
      {
        variantId: "bm-heart-mcq",
        step: {
          type: "mcq",
          question: "1 Timothy 6:10 identifies the root of all kinds of evil as:",
          options: ["The love of money", "Money itself", "Wealth of any kind", "Earning a salary"],
          correct: 0,
          feedback: {
            correct: "Right. It's the love of money (craving it, trusting it) not the money itself.",
            incorrect: "The verse names the love of money, not money itself. Money is a tool; the craving is the danger.",
          },
        },
      },
      {
        variantId: "bm-heart-sc",
        step: {
          type: "scenario",
          question: "Is it unbiblical to earn a good salary or build wealth through honest work?",
          options: [
            "No, Scripture warns against loving money, not against having it",
            "Yes. All wealth is sinful",
            "Yes. You must give everything away to be faithful",
            "Only if you also tithe exactly 10%",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The warning is about the heart, loving or trusting money over God, not about honest provision.",
            incorrect: "The Bible warns against the love of money (1 Tim 6:10), not honest earning. Wealth handled as a steward isn't sinful.",
          },
        },
      },
    ],
  },
  {
    slotId: "bible-money/what-is-stewardship/accountability",
    conceptId: "stewardship-biblical",
    variants: [
      {
        variantId: "bm-acc-mcq",
        step: {
          type: "mcq",
          question: "In Jesus' parable of the talents (Matthew 25), the servants the master praised were the ones who:",
          options: [
            "Put what they were given to work and grew it",
            "Buried it to keep it perfectly safe",
            "Spent it all on themselves",
            "Returned it untouched with an apology",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The master praised the servants who invested and multiplied what they were entrusted with.",
            incorrect: "The praised servants invested and grew what they'd been given. The one who buried his was rebuked.",
          },
        },
      },
      {
        variantId: "bm-acc-tf",
        step: {
          type: "true-false",
          statement: "In the parable of the talents, the servant who buried his money to keep it 'safe' was commended for it.",
          correct: false,
          feedback: {
            correct: "Correct. He was rebuked, not praised. Stewardship means using what you're entrusted with, not freezing it out of fear.",
            incorrect: "He was actually rebuked. The master wanted the money put to work, not buried.",
          },
        },
      },
      {
        variantId: "bm-acc-sc",
        step: {
          type: "scenario",
          question: "The parable of the talents pictures a steward giving an account for how they managed what they were entrusted with. Does that principle apply to your money?",
          options: [
            "Yes. Stewardship means managing it wisely, not just holding it",
            "No. The parable has nothing to do with money",
            "Only for people who are already wealthy",
            "Only for church funds",
          ],
          correct: 0,
          feedback: {
            correct: "Exactly. The steward is accountable for how they used what they were given. A call to manage, invest, and give wisely.",
            incorrect: "The parable is precisely about being trusted with resources and using them well. That includes your money.",
          },
        },
      },
    ],
  },
];

const stewardshipLayout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "You Are a Manager, Not an Owner",
    content:
      "<p>Psalm 24:1 (NLT), <em>The earth is the Lord's, and everything in it.</em> Biblical finance starts here: everything belongs to God, and we manage His resources rather than owning them.</p><p>This shifts the question from 'What do I want to do with my money?' to 'What does God want me to do with what He has entrusted to me?'</p>",
  },
  { slot: "bible-money/what-is-stewardship/ownership" },
  { slot: "bible-money/what-is-stewardship/faithful-little" },
  {
    type: "info",
    title: "The Love of Money, Not Money Itself",
    content:
      "<p>1 Timothy 6:10 (NLT), <em>For the love of money is the root of all kinds of evil.</em> Notice what it does <strong>not</strong> say. Money isn't the problem. Money is a neutral tool. The craving for it, and the trust we put in it, is what pulls hearts off course.</p><p>Luke 16:10 (NLT) adds, <em>If you are faithful in little things, you will be faithful in large ones.</em> Stewardship is proven in the small, everyday decisions.</p>",
  },
  { slot: "bible-money/what-is-stewardship/money-and-heart" },
  { slot: "bible-money/what-is-stewardship/accountability" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 2 · "Proverbs on Money"  (bible-money::proverbs-money)
// ═══════════════════════════════════════════════════════════════════════════

const proverbsSlots: QuestionSlot[] = [
  {
    slotId: "bible-money/proverbs-money/save-vs-consume",
    conceptId: "biblical-saving",
    variants: [
      {
        variantId: "bm-svc-mcq",
        step: {
          type: "mcq",
          question: "Proverbs 21:20 says the wise store up wealth, while fools:",
          options: ["Spend whatever they get", "Save too much to enjoy life", "Give everything away", "Refuse to work"],
          correct: 0,
          feedback: {
            correct: "Right. 'The wise have wealth and luxury, but fools spend whatever they get.' Save before you spend.",
            incorrect: "The proverb says fools 'spend whatever they get.' The contrast is saving and storing versus consuming everything.",
          },
        },
      },
      {
        variantId: "bm-svc-tf",
        step: {
          type: "true-false",
          statement: "Proverbs praises spending everything you earn as simply enjoying God's provision.",
          correct: false,
          feedback: {
            correct: "Correct. Proverbs 21:20 calls that the fool's pattern. Wisdom stores up reserves.",
            incorrect: "Proverbs 21:20 ties 'spend whatever they get' to folly, not faith. Wisdom keeps reserves.",
          },
        },
      },
      {
        variantId: "bm-svc-sc",
        step: {
          type: "scenario",
          question: "Two people earn the same. One saves 15% before spending; the other spends it all each month. Which reflects the 'wise' of Proverbs 21:20?",
          options: [
            "The one who saves first",
            "The one who spends it all",
            "Neither. Income is all that matters",
            "Whoever gives away the most",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Same income, different wisdom. Storing up reserves is the pattern Proverbs praises.",
            incorrect: "Proverbs 21:20 sides with the saver. It's not about how much you earn but whether you store up or consume it all.",
          },
        },
      },
    ],
  },
  {
    slotId: "bible-money/proverbs-money/the-ant",
    conceptId: "biblical-saving",
    variants: [
      {
        variantId: "bm-ant-tf",
        step: {
          type: "true-false",
          statement: "Proverbs points to the ant, which stores food in summer for the winter, as a model of financial wisdom.",
          correct: true,
          feedback: {
            correct: "Right. Proverbs 6:6-8 holds up the ant precisely because it prepares ahead without being told to.",
            incorrect: "It does. Proverbs 6:6-8 praises the ant for gathering in summer to prepare for winter: foresight in action.",
          },
        },
      },
      {
        variantId: "bm-ant-mcq",
        step: {
          type: "mcq",
          question: "The 'ant principle' of Proverbs 6:6-8 maps most directly to which modern habit?",
          options: [
            "Building an emergency fund and saving for the future",
            "Borrowing for things you want now",
            "Spending every bonus immediately",
            "Leaving the future to sort itself out",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The ant prepares for a season it can't yet see, exactly what an emergency fund and retirement savings do.",
            incorrect: "The ant stores ahead of need. That's the emergency fund / long-term saving habit, not borrowing or spending it all.",
          },
        },
      },
      {
        variantId: "bm-ant-sc",
        step: {
          type: "scenario",
          question: "No one orders the ant to prepare. It just does. Sipho sets up an automatic transfer to savings every payday. Same principle?",
          options: [
            "Yes. He's preparing ahead without needing to be forced",
            "No. Automation removes the virtue",
            "No. The ant is about hard work, not saving",
            "Only if he saves at least half his income",
          ],
          correct: 0,
          feedback: {
            correct: "Exactly. Automating the habit is a wise way to 'store in summer' before winter comes.",
            incorrect: "That's the ant principle in modern form. Quietly preparing ahead. Automating it just makes it more reliable.",
          },
        },
      },
    ],
  },
  {
    slotId: "bible-money/proverbs-money/planning",
    conceptId: "biblical-saving",
    variants: [
      {
        variantId: "bm-plan-mcq",
        step: {
          type: "mcq",
          question: "Proverbs 21:5 contrasts good planning and hard work (which lead to prosperity) with:",
          options: ["Hasty shortcuts", "Generous giving", "Honest labour", "Patient saving"],
          correct: 0,
          feedback: {
            correct: "Right. 'Good planning and hard work lead to prosperity, but hasty shortcuts lead to poverty.'",
            incorrect: "The verse pairs planning and hard work against hasty shortcuts that lead to poverty.",
          },
        },
      },
      {
        variantId: "bm-plan-tf",
        step: {
          type: "true-false",
          statement: "Proverbs 21:5 treats hasty shortcuts as a reliable path to prosperity.",
          correct: false,
          feedback: {
            correct: "Correct. It says the opposite, hasty shortcuts 'lead to poverty.' Planning and steady work build prosperity.",
            incorrect: "Proverbs 21:5 links hasty shortcuts to poverty, not prosperity. Planning and hard work are the wise path.",
          },
        },
      },
      {
        variantId: "bm-plan-sc",
        step: {
          type: "scenario",
          question: "Lerato wants fast money and is eyeing a 'double your cash in 30 days' scheme. What does Proverbs 21:5 suggest?",
          options: [
            "Hasty shortcuts tend to end in loss. Plan and work steadily instead",
            "Go for it. Speed is wisdom",
            "Borrow to put in even more",
            "Wealth is sinful, so avoid it entirely",
          ],
          correct: 0,
          feedback: {
            correct: "Right. 'Double in 30 days' is the hasty shortcut Proverbs warns leads to poverty. Steady beats fast.",
            incorrect: "Proverbs 21:5 warns that hasty shortcuts lead to poverty. A 'double in 30 days' pitch is exactly that.",
          },
        },
      },
    ],
  },
  {
    slotId: "bible-money/proverbs-money/slow-wealth",
    conceptId: "contentment-biblical",
    variants: [
      {
        variantId: "bm-slow-fill",
        step: {
          type: "fill-blank",
          title: "Storing up, step by step",
          prompt: "Proverbs praises steady saving. Put away R500 a month and after 12 months you've stored up R____ (before any growth).",
          correct: 6000,
          feedback: {
            correct: "Right: R500 × 12 = R6 000. Small, consistent amounts add up: the wisdom of storing in summer.",
            incorrect: "R500 × 12 months = R6 000. The point isn't the size of each amount; it's the consistency.",
          },
        },
      },
      {
        variantId: "bm-slow-mcq",
        step: {
          type: "mcq",
          question: "Proverbs 13:11 says wealth from get-rich-quick schemes ____, while wealth from hard work ____.",
          options: [
            "quickly disappears; grows over time",
            "grows over time; quickly disappears",
            "is always sinful; is always holy",
            "is guaranteed; is uncertain",
          ],
          correct: 0,
          feedback: {
            correct: "Right. 'Wealth from get-rich-quick schemes quickly disappears; wealth from hard work grows over time.'",
            incorrect: "The verse says get-rich-quick wealth quickly disappears, while wealth from hard work grows over time.",
          },
        },
      },
      {
        variantId: "bm-slow-tf",
        step: {
          type: "true-false",
          statement: "Proverbs 13:11 promises that get-rich-quick wealth lasts and multiplies.",
          correct: false,
          feedback: {
            correct: "Correct. It says get-rich-quick wealth 'quickly disappears.' It's the wealth from hard work that grows over time.",
            incorrect: "Proverbs 13:11 says get-rich-quick wealth quickly disappears. The opposite of lasting. Hard-earned wealth is what grows.",
          },
        },
      },
    ],
  },
];

const proverbsLayout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Ancient Wisdom, Modern Application",
    content:
      "<p>Proverbs 21:20 (NLT), <em>The wise have wealth and luxury, but fools spend whatever they get.</em></p><p>In modern terms: save before you spend, and build reserves. The fool consumes everything immediately; the wise person plans ahead. Proverbs 6:6-8 sends us to the ant, which stores food in summer for the winter. Foresight nobody has to command.</p>",
  },
  { slot: "bible-money/proverbs-money/save-vs-consume" },
  { slot: "bible-money/proverbs-money/the-ant" },
  {
    type: "info",
    title: "Planning Beats Haste",
    content:
      "<p>Proverbs 21:5 (NLT), <em>Good planning and hard work lead to prosperity, but hasty shortcuts lead to poverty.</em> And Proverbs 13:11 (NLT), <em>Wealth from get-rich-quick schemes quickly disappears; wealth from hard work grows over time.</em></p><p>Scripture keeps steering us away from shortcuts and toward patient, consistent effort, the same logic behind steady saving and long-term investing.</p>",
  },
  { slot: "bible-money/proverbs-money/planning" },
  { slot: "bible-money/proverbs-money/slow-wealth" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 3 · "Give First"  (bible-money::give-first)
// ═══════════════════════════════════════════════════════════════════════════

const giveSlots: QuestionSlot[] = [
  {
    slotId: "bible-money/give-first/firstfruits",
    conceptId: "biblical-generosity",
    variants: [
      {
        variantId: "bm-ff-tf",
        step: {
          type: "true-false",
          statement: "'Firstfruits' giving means giving only after every other expense is covered.",
          correct: false,
          feedback: {
            correct: "Correct. Firstfruits means off the top, first, not from whatever is left over.",
            incorrect: "Firstfruits is the opposite of leftovers. Proverbs 3:9 says honour God with the 'best part'. Give first.",
          },
        },
      },
      {
        variantId: "bm-ff-mcq",
        step: {
          type: "mcq",
          question: "Honouring God with the 'best part of everything you produce' (Proverbs 3:9) means giving:",
          options: ["Off the top, first", "Only from leftovers", "Only loose change", "Only in a good year"],
          correct: 0,
          feedback: {
            correct: "Right. 'Firstfruits' is a priority, not an afterthought. It comes off the top.",
            incorrect: "Proverbs 3:9 points to the 'best part' given first, not the leftovers or spare change.",
          },
        },
      },
      {
        variantId: "bm-ff-sc",
        step: {
          type: "scenario",
          question: "Nomsa sets her giving aside first each payday, before other spending. Is that the 'firstfruits' pattern?",
          options: [
            "Yes. She's giving off the top, as a priority",
            "No. Giving must always come last",
            "Only if she gives exactly 10%",
            "No. Firstfruits only applies to farmers",
          ],
          correct: 0,
          feedback: {
            correct: "Exactly. Giving first is an act of faith and discipline, the essence of firstfruits.",
            incorrect: "Giving off the top, before other spending, is exactly what firstfruits means (Proverbs 3:9).",
          },
        },
      },
    ],
  },
  {
    slotId: "bible-money/give-first/generous-prospers",
    conceptId: "biblical-generosity",
    variants: [
      {
        variantId: "bm-gp-mcq",
        step: {
          type: "mcq",
          question: "What does Proverbs 11:24-25 say happens to the generous person?",
          options: ["They will prosper", "They go broke from giving", "They must give exactly 10%", "They should give only to family"],
          correct: 0,
          feedback: {
            correct: "Right. 'The generous will prosper; those who refresh others will themselves be refreshed.'",
            incorrect: "Proverbs 11:25 says the generous person will prosper. Generosity and flourishing aren't opposites here.",
          },
        },
      },
      {
        variantId: "bm-gp-tf",
        step: {
          type: "true-false",
          statement: "Proverbs presents generosity and financial ruin as basically the same thing.",
          correct: false,
          feedback: {
            correct: "Correct. Proverbs 11:24-25 links generosity to prospering, not to ruin.",
            incorrect: "Proverbs 11:24-25 says the generous prosper. It frames giving as a path to flourishing, not ruin.",
          },
        },
      },
      {
        variantId: "bm-gp-sc",
        step: {
          type: "scenario",
          question: "Someone assumes that giving regularly will inevitably leave them poorer. How does Proverbs 11:24-25 reframe that?",
          options: [
            "It links generosity to prospering and being 'refreshed', not to loss",
            "It agrees. Giving always makes you poorer",
            "It says never give unless you're wealthy",
            "It commands a fixed percentage",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Scripture treats a generous spirit as foundational to a healthy relationship with money, not a threat to it.",
            incorrect: "Proverbs 11:24-25 says the generous prosper and are refreshed. Wise generosity isn't the road to ruin.",
          },
        },
      },
    ],
  },
  {
    slotId: "bible-money/give-first/cheerful-giver",
    conceptId: "biblical-generosity",
    variants: [
      {
        variantId: "bm-cg-tf",
        step: {
          type: "true-false",
          statement: "2 Corinthians 9:7 says God is pleased by giving that's done reluctantly or under pressure, as long as you give.",
          correct: false,
          feedback: {
            correct: "Correct. It says don't give 'reluctantly or in response to pressure'. 'God loves a person who gives cheerfully.'",
            incorrect: "2 Corinthians 9:7 says the opposite: not under pressure or reluctantly. God loves a cheerful giver.",
          },
        },
      },
      {
        variantId: "bm-cg-mcq",
        step: {
          type: "mcq",
          question: "According to 2 Corinthians 9:7, how should you decide how much to give?",
          options: [
            "Decide in your heart, and give cheerfully",
            "Match whatever the person next to you gives",
            "Give only the legal minimum",
            "Give whenever you're guilted into it",
          ],
          correct: 0,
          feedback: {
            correct: "Right. 'You must each decide in your heart how much to give': freely and cheerfully, not under pressure.",
            incorrect: "The verse says to decide in your own heart and give cheerfully, not from comparison, guilt, or a minimum.",
          },
        },
      },
      {
        variantId: "bm-cg-sc",
        step: {
          type: "scenario",
          question: "A collector pressures Andile into pledging money he feels cornered into. How does 2 Corinthians 9:7 speak to this?",
          options: [
            "Giving should come from the heart, not from pressure or reluctance",
            "Pressure is fine as long as the cause is good",
            "He must give whatever he was pressured to pledge",
            "He should give double to make up for hesitating",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Cheerful, heart-decided giving is the model, coercion isn't.",
            incorrect: "2 Corinthians 9:7 rules out reluctant, pressured giving. It's meant to be a free, cheerful decision of the heart.",
          },
        },
      },
    ],
  },
  {
    slotId: "bible-money/give-first/lending-to-the-lord",
    conceptId: "biblical-generosity",
    variants: [
      {
        variantId: "bm-ltl-mcq",
        step: {
          type: "mcq",
          question: "Proverbs 19:17 compares helping the poor to:",
          options: ["Lending to the Lord, who will repay you", "Throwing money away", "A guaranteed tax refund", "A loan you'll come to regret"],
          correct: 0,
          feedback: {
            correct: "Right. 'If you help the poor, you are lending to the Lord, and he will repay you!'",
            incorrect: "Proverbs 19:17 frames helping the poor as lending to the Lord, who repays, not as a loss.",
          },
        },
      },
      {
        variantId: "bm-ltl-tf",
        step: {
          type: "true-false",
          statement: "Proverbs 19:17 frames kindness to the poor as lending to the Lord, who will repay.",
          correct: true,
          feedback: {
            correct: "Right. 'If you help the poor, you are lending to the Lord, and he will repay you!'",
            incorrect: "It does. Proverbs 19:17 says helping the poor is like lending to the Lord, who repays.",
          },
        },
      },
      {
        variantId: "bm-ltl-sc",
        step: {
          type: "scenario",
          question: "Zanele wonders whether money given to help someone in real need is 'wasted.' How does Proverbs 19:17 answer that?",
          options: [
            "It's treated as lending to the Lord Himself, who repays",
            "It's a total loss with no return",
            "It only counts if they pay her back",
            "It's unwise to help the poor at all",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Scripture reframes it entirely: God treats kindness to the poor as a loan to Himself.",
            incorrect: "Proverbs 19:17 calls it lending to the Lord, who repays, the opposite of wasted money.",
          },
        },
      },
    ],
  },
];

const giveLayout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Honour God With Your Wealth",
    content:
      "<p>Proverbs 3:9 (NLT), <em>Honor the Lord with your wealth and with the best part of everything you produce.</em></p><p>Giving first is an act of faith and financial discipline. 'Firstfruits' means off the top, not what's left over after everything else has been spent.</p>",
  },
  { slot: "bible-money/give-first/firstfruits" },
  { slot: "bible-money/give-first/generous-prospers" },
  {
    type: "info",
    title: "Give Cheerfully, Not Under Pressure",
    content:
      "<p>2 Corinthians 9:7 (NLT), <em>You must each decide in your heart how much to give. And don't give reluctantly or in response to pressure. For God loves a person who gives cheerfully.</em></p><p>And Proverbs 19:17 (NLT), <em>If you help the poor, you are lending to the Lord, and he will repay you!</em> Generosity, in Scripture, is a path to flourishing rather than a threat to it.</p>",
  },
  { slot: "bible-money/give-first/cheerful-giver" },
  { slot: "bible-money/give-first/lending-to-the-lord" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 4 · "The Bible on Debt"  (bible-money::debt-scripture)
// ═══════════════════════════════════════════════════════════════════════════

const debtSlots: QuestionSlot[] = [
  {
    slotId: "bible-money/debt-scripture/borrower-servant",
    conceptId: "debt-biblical-view",
    variants: [
      {
        variantId: "bm-bs-mcq",
        step: {
          type: "mcq",
          question: "Proverbs 22:7 describes the borrower as ____ to the lender.",
          options: ["servant", "equal", "master", "stranger"],
          correct: 0,
          feedback: {
            correct: "Right. 'The borrower is servant to the lender.' Debt hands someone a claim on your future.",
            incorrect: "Proverbs 22:7 says the borrower is servant to the lender: a warning about the power debt creates.",
          },
        },
      },
      {
        variantId: "bm-bs-tf",
        step: {
          type: "true-false",
          statement: "Proverbs 22:7 is best read as an absolute ban on all borrowing, including a home loan.",
          correct: false,
          feedback: {
            correct: "Correct. It's a warning about the power dynamic debt creates, not a blanket prohibition on every loan.",
            incorrect: "It's a caution, not an outright ban. Proverbs 22:7 warns about the servant-lender dynamic rather than forbidding all debt.",
          },
        },
      },
      {
        variantId: "bm-bs-sc",
        step: {
          type: "scenario",
          question: "Why does Proverbs 22:7 call the borrower a 'servant' to the lender?",
          options: [
            "Owing money gives someone else a claim on your future income and freedom",
            "Lenders are morally superior to borrowers",
            "Borrowing is always sinful",
            "It only applies to business loans",
          ],
          correct: 0,
          feedback: {
            correct: "Right. When you owe, part of your future earnings is already committed. That's the loss of freedom it warns about.",
            incorrect: "The 'servant' image is about the claim a lender has on your future income, not about anyone's moral worth.",
          },
        },
      },
    ],
  },
  {
    slotId: "bible-money/debt-scripture/owe-nothing",
    conceptId: "debt-biblical-view",
    variants: [
      {
        variantId: "bm-on-tf",
        step: {
          type: "true-false",
          statement: "Romans 13:8 ('Owe nothing to anyone') points toward working free of debt as a healthy goal.",
          correct: true,
          feedback: {
            correct: "Right. Scripture consistently points toward freedom from financial obligation.",
            incorrect: "It does. Romans 13:8's 'Owe nothing to anyone' frames debt-freedom as part of good stewardship.",
          },
        },
      },
      {
        variantId: "bm-on-mcq",
        step: {
          type: "mcq",
          question: "A biblical approach to debt is best summarised as:",
          options: [
            "Pay what you owe, avoid unnecessary debt, and work toward freedom",
            "Never repay anything you borrow",
            "Borrow as much as possible while you can",
            "Only loans from family are ever acceptable",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Not a total ban, but pay your debts, be cautious taking them on, and aim for freedom.",
            incorrect: "The biblical emphasis is paying what you owe, avoiding needless debt, and working toward freedom.",
          },
        },
      },
      {
        variantId: "bm-on-sc",
        step: {
          type: "scenario",
          question: "Kabelo is debt-free and debating whether to take a loan for something he merely wants. What does the biblical view of debt encourage?",
          options: [
            "Be cautious about unnecessary debt and protect the freedom he has",
            "Always avoid every loan, no exceptions",
            "Borrow freely. Debt is spiritually neutral",
            "Only worry about debt once it's overdue",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The principle isn't 'never borrow'. It's don't give up freedom lightly for a want.",
            incorrect: "Scripture doesn't ban every loan, but it does urge caution with unnecessary debt and values the freedom of owing nothing.",
          },
        },
      },
    ],
  },
  {
    slotId: "bible-money/debt-scripture/surety",
    conceptId: "debt-biblical-view",
    variants: [
      {
        variantId: "bm-sur-mcq",
        step: {
          type: "mcq",
          question: "Proverbs 22:26-27 warns specifically against:",
          options: [
            "Guaranteeing or co-signing someone else's debt",
            "Lending to family members",
            "Saving too aggressively",
            "Paying off debt early",
          ],
          correct: 0,
          feedback: {
            correct: "Right. 'Don't agree to guarantee another person's debt.' If they default, you're on the hook.",
            incorrect: "Proverbs 22:26-27 warns against standing surety. Guaranteeing another person's debt.",
          },
        },
      },
      {
        variantId: "bm-sur-tf",
        step: {
          type: "true-false",
          statement: "Proverbs 22:26-27 warns that if you guarantee a debt you can't cover, even your bed could be taken.",
          correct: true,
          feedback: {
            correct: "Right. 'If you can't pay it, even your bed will be snatched from under you.' Standing surety is risky.",
            incorrect: "It does. The verse literally warns your bed could be snatched away if you can't cover a debt you guaranteed.",
          },
        },
      },
      {
        variantId: "bm-sur-sc",
        step: {
          type: "scenario",
          question: "A friend asks Palesa to stand surety (co-sign) for his loan, promising she'll never actually have to pay. What does Proverbs 22:26-27 caution?",
          options: [
            "Be very careful, if he defaults, she's legally liable for the debt",
            "Co-signing is risk-free if she trusts him",
            "She must co-sign to be a good friend",
            "It only matters for large loans",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Surety means his debt becomes hers if he can't pay, exactly the risk Proverbs flags.",
            incorrect: "Proverbs 22:26-27 warns that guaranteeing a debt makes you liable. 'Never have to pay' is the promise that so often fails.",
          },
        },
      },
    ],
  },
  {
    slotId: "bible-money/debt-scripture/repay-faithfully",
    conceptId: "debt-biblical-view",
    variants: [
      {
        variantId: "bm-rf-tf",
        step: {
          type: "true-false",
          statement: "Psalm 37:21 contrasts the wicked, who 'borrow and never repay', with the godly, who give generously.",
          correct: true,
          feedback: {
            correct: "Right. 'The wicked borrow and never repay, but the godly are generous givers.' Repaying is part of righteousness.",
            incorrect: "It does. Psalm 37:21 sets not repaying against generous giving. Repaying what you owe is the godly path.",
          },
        },
      },
      {
        variantId: "bm-rf-mcq",
        step: {
          type: "mcq",
          question: "Psalm 37:21 associates never repaying what you borrow with:",
          options: ["the wicked", "the wise", "the generous", "the poor"],
          correct: 0,
          feedback: {
            correct: "Right. 'The wicked borrow and never repay.' Faithful repayment reflects godly character.",
            incorrect: "Psalm 37:21 ties never repaying to 'the wicked', and contrasts it with the godly, who give generously.",
          },
        },
      },
      {
        variantId: "bm-rf-sc",
        step: {
          type: "scenario",
          question: "Someone who can afford to repay a loan considers simply not bothering. How does Psalm 37:21 frame that choice?",
          options: [
            "Repaying what you owe is the godly path; refusing to repay is not",
            "Not repaying is shrewd if you can get away with it",
            "Repayment is optional either way",
            "It only matters for debts to banks",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Psalm 37:21 links not repaying to wickedness and generosity to godliness. Character shows up in how you handle debt.",
            incorrect: "Psalm 37:21 is clear: 'the wicked borrow and never repay.' Choosing not to repay when you can isn't shrewd, it's the pattern it warns against.",
          },
        },
      },
    ],
  },
];

const debtLayout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "The Borrower Is Servant to the Lender",
    content:
      "<p>Proverbs 22:7 (NLT), <em>Just as the rich rule the poor, so the borrower is servant to the lender.</em></p><p>This isn't a prohibition on all debt, but a warning about the power dynamic it creates. When you owe money, someone else has a claim on your future income, and your freedom.</p>",
  },
  { slot: "bible-money/debt-scripture/borrower-servant" },
  { slot: "bible-money/debt-scripture/owe-nothing" },
  {
    type: "info",
    title: "Be Careful Guaranteeing Others' Debts",
    content:
      "<p>Proverbs 22:26-27 (NLT), <em>Don't agree to guarantee another person's debt or put up security for someone else. If you can't pay it, even your bed will be snatched from under you.</em></p><p>And Psalm 37:21 (NLT), <em>The wicked borrow and never repay, but the godly are generous givers.</em> Handle debt with care, and repay faithfully what you owe.</p>",
  },
  { slot: "bible-money/debt-scripture/surety" },
  { slot: "bible-money/debt-scripture/repay-faithfully" },
];

// ═══════════════════════════════════════════════════════════════════════════

export const BIBLE_MONEY_BANKS: Record<string, LessonBank> = {
  "bible-money::what-is-stewardship": { layout: stewardshipLayout, slots: stewardshipSlots },
  "bible-money::proverbs-money": { layout: proverbsLayout, slots: proverbsSlots },
  "bible-money::give-first": { layout: giveLayout, slots: giveSlots },
  "bible-money::debt-scripture": { layout: debtLayout, slots: debtSlots },
};
