import type { LessonLayoutItem, QuestionSlot } from "@/data/content";
import type { LessonBank } from "./money-basics";

/**
 * Premium banks for the Money Psychology EXTRA lessons.
 * Behavioural findings are described in general terms (direction and rough
 * magnitude) rather than pinned to specific study figures, so the content
 * doesn't go stale or overstate the evidence.
 * variantId prefix: `mpx-`.
 */
const info = (title: string, content: string): LessonLayoutItem => ({ type: "info", title, content });
const L = (slots: QuestionSlot[], title: string, content: string): LessonLayoutItem[] => [
  info(title, content),
  ...slots.map((s) => ({ slot: s.slotId })),
];

// ── Hedonic Adaptation ──────────────────────────────────────────────────────
const hedSlots: QuestionSlot[] = [
  {
    slotId: "money-psychology/hedonic/what-it-is",
    conceptId: "hedonic-adaptation",
    variants: [
      { variantId: "mpx-hd-wi-mcq", step: { type: "mcq", question: "What is hedonic adaptation?", options: ["Returning to your usual happiness level", "The habit of spending more as you earn more", "The tendency to overvalue whatever you own", "A strong preference for immediate rewards"], correct: 0, feedback: { correct: "Right. The new car thrills you for weeks, then becomes the car, which is why upgrades so rarely deliver what they promised.", incorrect: "It's the return to baseline after a change. Spending more as you earn more is lifestyle inflation, a related but different thing." } } },
      { variantId: "mpx-hd-wi-tf", step: { type: "true-false", statement: "The happiness boost from a major purchase usually fades within months.", correct: true, feedback: { correct: "Right, and this is one of the most consistent findings in the field. The item stays, the feeling doesn't.", incorrect: "It's true. Adaptation is fast, which is why the next upgrade always feels necessary." } } },
      { variantId: "mpx-hd-wi-sc", step: { type: "scenario", question: "Thabo upgrades his phone every year and each one feels ordinary within two months. What's happening?", options: ["Hedonic adaptation, his baseline resets", "The phones are getting worse", "He's choosing the wrong brand", "He needs a more expensive model"], correct: 0, feedback: { correct: "Right. The fix isn't a better phone, it's noticing that the treadmill has no finish line.", incorrect: "It's adaptation resetting his baseline. A more expensive model buys a few more weeks, not a different outcome." } } },
    ],
  },
  {
    slotId: "money-psychology/hedonic/experiences",
    conceptId: "hedonic-adaptation",
    variants: [
      { variantId: "mpx-hd-ex-mcq", step: { type: "mcq", question: "Why do experiences tend to resist adaptation better than possessions?", options: ["They become memories, not objects", "They simply cost more", "They are shared with other people", "They can't easily be compared"], correct: 0, feedback: { correct: "Right. A possession sits there becoming ordinary; a trip gets retold and often improves in the telling.", incorrect: "Memory is the mechanism. Objects become background; experiences become stories." } } },
      { variantId: "mpx-hd-ex-tf", step: { type: "true-false", statement: "Anticipating a planned purchase or trip is itself a source of enjoyment.", correct: true, feedback: { correct: "Right, and it's free, which is an argument for saving toward something rather than financing it instantly.", incorrect: "It's true. Anticipation is a real part of the pleasure, and instant credit removes it entirely." } } },
      { variantId: "mpx-hd-ex-sc", step: { type: "scenario", question: "Lerato has R15 000 for something enjoyable. What's likely to give lasting satisfaction?", options: ["A trip or course she will remember", "One large object bought immediately", "Whatever her colleagues bought", "The most expensive thing R15 000 buys"], correct: 0, feedback: { correct: "Right. Spreading it out defeats adaptation better than a single purchase that becomes background within weeks.", incorrect: "Experiences and spread-out smaller pleasures resist adaptation. One big object adapts fastest." } } },
    ],
  },
  {
    slotId: "money-psychology/hedonic/lifestyle-creep",
    conceptId: "lifestyle-inflation",
    variants: [
      { variantId: "mpx-hd-lc-mcq", step: { type: "mcq", question: "How does hedonic adaptation drive lifestyle inflation?", options: ["Each upgrade becomes the new normal", "It makes people save more", "It reduces spending over time", "It has no effect on spending"], correct: 0, feedback: { correct: "Right. The ratchet only turns one way, which is why a raise often produces no felt improvement at all.", incorrect: "Adaptation resets the baseline upward, so the same level of satisfaction requires steadily more money." } } },
      { variantId: "mpx-hd-lc-tf", step: { type: "true-false", statement: "Banking part of every raise before adjusting your lifestyle is an effective counter to adaptation.", correct: true, feedback: { correct: "Right. You never adapt to money you never started spending, which makes it the cheapest saving you'll ever do.", incorrect: "It's true. Adaptation only applies to what you actually experience, so redirecting it first works." } } },
      { variantId: "mpx-hd-lc-sc", step: { type: "scenario", question: "Sipho's income has doubled in five years but he feels no better off. What's the likely explanation?", options: ["His lifestyle rose with each increase", "His income didn't really double", "Inflation consumed all of it", "He's saving too much"], correct: 0, feedback: { correct: "Right. Without a deliberate decision, spending expands to fill income and the felt improvement disappears.", incorrect: "Lifestyle creep. Each raise was absorbed, so the gap between income and expectation never widened." } } },
    ],
  },
  {
    slotId: "money-psychology/hedonic/practical-counters",
    conceptId: "hedonic-adaptation",
    variants: [
      { variantId: "mpx-hd-pc-mcq", step: { type: "mcq", question: "Which habit most directly counters adaptation?", options: ["Noticing what you already have", "Upgrading much more often", "Spending less on everything", "Avoiding all purchases entirely"], correct: 0, feedback: { correct: "Right. Attention is the mechanism. Adaptation works by making things invisible, and noticing reverses it.", incorrect: "Deliberate noticing. Blanket restriction doesn't address why the treadmill exists." } } },
      { variantId: "mpx-hd-pc-tf", step: { type: "true-false", statement: "Deliberately going without something for a while can restore your enjoyment of it.", correct: true, feedback: { correct: "Right. A break resets the baseline downward, which is why a simple meal after a lean week tastes better.", incorrect: "It's true. Temporary absence resets adaptation and restores the pleasure." } } },
      { variantId: "mpx-hd-pc-sc", step: { type: "scenario", question: "Ayesha wants to enjoy her spending more without spending more. What's a practical approach?", options: ["Space out treats so they stay treats", "Buy more often", "Buy more expensive versions", "Stop spending on enjoyment entirely"], correct: 0, feedback: { correct: "Right. Scarcity and attention are what create enjoyment, frequency destroys it.", incorrect: "Space them out and notice them. Buying more often is exactly what flattens the pleasure." } } },
    ],
  },
];

// ── Mental Accounting ───────────────────────────────────────────────────────
const ma1Slots: QuestionSlot[] = [
  {
    slotId: "money-psychology/mental-acct/fungibility",
    conceptId: "mental-accounting",
    variants: [
      { variantId: "mpx-m1-fg-mcq", step: { type: "mcq", question: "What is mental accounting?", options: ["Treating money differently by source", "Doing all the arithmetic in your head", "Keeping a written budget", "Tracking spending in an app"], correct: 0, feedback: { correct: "Right. A rand is a rand, but we behave as though bonus rands and salary rands are different substances.", incorrect: "It's the mental labelling of money by source or purpose, which makes us treat identical rands differently." } } },
      { variantId: "mpx-m1-fg-tf", step: { type: "true-false", statement: "R1 000 from a tax refund is worth exactly as much as R1 000 of salary.", correct: true, feedback: { correct: "Right. Identical in value, but treated very differently. Refunds get spent far more readily than salary.", incorrect: "It's true. They're identical rands; only the mental label differs, and that label changes behaviour." } } },
      { variantId: "mpx-m1-fg-sc", step: { type: "scenario", question: "Nomsa carefully budgets her salary but spends her R8 000 bonus in a week. What's driving that?", options: ["Mental accounting, it feels like extra", "The bonus is genuinely different money", "She's bad with money generally", "Bonuses simply can't be budgeted"], correct: 0, feedback: { correct: "Right, and the fix is simple: run windfalls through the same budget as salary, deciding before they land.", incorrect: "It's the 'found money' label. Her budgeting skill is fine. The category is what's wrong." } } },
    ],
  },
  {
    slotId: "money-psychology/mental-acct/windfalls",
    conceptId: "mental-accounting",
    variants: [
      { variantId: "mpx-m1-wf-mcq", step: { type: "mcq", question: "Why does 'found money' get spent so much faster than earned money?", options: ["It's labelled as outside the budget", "It is usually a far smaller sum of money", "It arrives at a different time of month", "It is taxed in a completely different way"], correct: 0, feedback: { correct: "Right. The label does the work. A tax refund is money you already earned, but it doesn't feel that way.", incorrect: "It's the mental label. A refund is your own overpaid tax coming back, not a windfall." } } },
      { variantId: "mpx-m1-wf-tf", step: { type: "true-false", statement: "A SARS refund is money you overpaid during the year, not a gift.", correct: true, feedback: { correct: "Right. You lent SARS the money interest-free. Treating it as a bonus is the mental accounting error.", incorrect: "It's true. A refund returns your own overpayment, which is why treating it as free money costs you." } } },
      { variantId: "mpx-m1-wf-sc", step: { type: "scenario", question: "Johan gets a R12 000 refund. What's the highest-value approach?", options: ["Treat it like R12 000 of salary", "Spend it, it wasn't budgeted for", "Split it evenly between fun and savings", "Leave it and decide later on"], correct: 0, feedback: { correct: "Right. Applying the same rules removes the label's power, and leaving it in the account usually means spending it by default.", incorrect: "Treat it like salary. Undecided money in a current account gets absorbed within weeks." } } },
    ],
  },
  {
    slotId: "money-psychology/mental-acct/useful-side",
    conceptId: "mental-accounting",
    variants: [
      { variantId: "mpx-m1-us-mcq", step: { type: "mcq", question: "How can mental accounting be used deliberately in your favour?", options: ["Separate accounts per goal", "Keeping everything in one account", "Never labelling money", "Spending from whichever account is fullest"], correct: 0, feedback: { correct: "Right. The same labelling bias that makes bonuses disappear can protect a house deposit if you build it on purpose.", incorrect: "Separate, named goal accounts. The bias works for you when the labels are ones you chose." } } },
      { variantId: "mpx-m1-us-tf", step: { type: "true-false", statement: "Naming a savings account after its goal makes you less likely to raid it.", correct: true, feedback: { correct: "Right. 'Emergency fund' or 'Zinhle's school fees' resists withdrawal far better than 'Savings 2'.", incorrect: "It's true. A specific label creates a psychological cost to spending it elsewhere." } } },
      { variantId: "mpx-m1-us-sc", step: { type: "scenario", question: "Priya keeps dipping into her holiday savings for everyday costs. What structural change would help?", options: ["Move it to a separate, slower account", "Simply try harder to resist it", "Keep it in her current account to watch", "Stop saving for holidays"], correct: 0, feedback: { correct: "Right. Structure beats willpower: a separate, named, slightly less accessible account does most of the work.", incorrect: "Change the structure, not the effort. Money that's visible and instantly available gets spent." } } },
    ],
  },
  {
    slotId: "money-psychology/mental-acct/debt-blind-spot",
    conceptId: "mental-accounting",
    variants: [
      { variantId: "mpx-m1-db-sc", step: { type: "scenario", question: "Sipho keeps R20 000 in savings earning 6% while carrying R20 000 on a credit card at 20%. What's happening?", options: ["Mental accounting, not diversification", "Sensible diversification", "Correct, because savings are for emergencies", "Nothing unusual, that's entirely normal"], correct: 0, feedback: { correct: "Right. Net of everything he's losing 14% a year, roughly R2 800, for the comfort of seeing a savings balance.", incorrect: "It's mental accounting. Paying the card saves 20%; the savings earn 6%. The gap costs him R2 800 a year." } } },
      { variantId: "mpx-m1-db-mcq", step: { type: "mcq", question: "When is it still reasonable to hold savings while carrying debt?", options: ["A small emergency buffer", "Always. Savings should never be touched", "Never. All savings should clear debt first", "Only if the savings rate exceeds the debt rate"], correct: 0, feedback: { correct: "Right. A modest buffer is what stops the cycle restarting; beyond that, the maths favours the debt.", incorrect: "A small buffer is sensible. Beyond it, the rate difference makes holding both expensive." } } },
      { variantId: "mpx-m1-db-tf", step: { type: "true-false", statement: "Looking at your whole financial position rather than separate pots usually improves decisions.", correct: true, feedback: { correct: "Right. Netting everything off reveals costs that the individual accounts hide.", incorrect: "It's true. Pot-by-pot thinking is what lets a 20% debt sit next to a 6% saving." } } },
    ],
  },
];

// ── Mental Accounting: Why R1 000 Isn't Always R1 000 ───────────────────────
const ma2Slots: QuestionSlot[] = [
  {
    slotId: "money-psychology/mental-acct-2/same-rand",
    conceptId: "mental-accounting",
    variants: [
      { variantId: "mpx-m2-sr-sc", step: { type: "scenario", question: "You'd drive 20 minutes to save R200 on a R500 kettle, but not to save R200 on a R25 000 fridge. What's inconsistent?", options: ["R200 is R200 in both cases", "The kettle trip is more convenient", "The fridge saving isn't real", "Nothing, bigger purchases differ"], correct: 0, feedback: { correct: "Right. Your time is worth the same either way, so the R200 should be worth the same trip in both cases.", incorrect: "It's the same R200 for the same 20 minutes. We judge it as a percentage, which isn't how money works." } } },
      { variantId: "mpx-m2-sr-mcq", step: { type: "mcq", question: "Why do we treat a discount on a large purchase as less significant?", options: ["We judge it as a proportion", "Large purchases have smaller discounts", "Retailers hide the large discounts", "We're more tired when buying big items"], correct: 0, feedback: { correct: "Right, and it costs real money. Proportional thinking makes us casual about the largest rand amounts.", incorrect: "It's proportional thinking. R200 feels big against R500 and trivial against R25 000, though it's the same R200." } } },
      { variantId: "mpx-m2-sr-tf", step: { type: "true-false", statement: "Negotiating R5 000 off a car matters more in rand terms than saving R50 on groceries, even though it feels less urgent.", correct: true, feedback: { correct: "Right. A hundred times more, for one conversation. Yet most people spend more energy on the groceries.", incorrect: "It's true. Effort should follow rand amounts, but proportional thinking sends it to the small purchases." } } },
    ],
  },
  {
    slotId: "money-psychology/mental-acct-2/budget-categories",
    conceptId: "mental-accounting",
    variants: [
      { variantId: "mpx-m2-bc-mcq", step: { type: "mcq", question: "Your 'entertainment' budget is spent but your 'groceries' budget has room. What does mental accounting predict?", options: ["You'll feel you can't go out", "You'll rebalance automatically", "You'll cancel both budgets", "You'll overspend on both"], correct: 0, feedback: { correct: "Right. The rigidity is mostly useful, it stops overspending, but it helps to know it's a rule you made, not a fact.", incorrect: "Category boundaries feel hard even when the total budget has room. That's the bias at work." } } },
      { variantId: "mpx-m2-bc-tf", step: { type: "true-false", statement: "Rigid budget categories are entirely a bad thing.", correct: false, feedback: { correct: "Right. The same bias that traps you also protects your savings. The trick is choosing which boundaries to enforce.", incorrect: "They're often helpful. Category discipline prevents overspending; just recognise when it's working against you." } } },
      { variantId: "mpx-m2-bc-sc", step: { type: "scenario", question: "Thabo's car repair fund is empty but his holiday fund is full, and his car needs urgent work. What's sensible?", options: ["Move the money", "Take a loan to preserve the holiday fund", "Delay the repair", "Use a credit card instead"], correct: 0, feedback: { correct: "Right. Labels you created can be changed when reality demands it. Borrowing to protect a label is expensive.", incorrect: "Move the money. Taking on 20% debt to keep a self-imposed category intact is the costliest option." } } },
    ],
  },
  {
    slotId: "money-psychology/mental-acct-2/payment-method",
    conceptId: "mental-accounting",
    variants: [
      { variantId: "mpx-m2-pm-mcq", step: { type: "mcq", question: "Why do people typically spend more when paying by card than by cash?", options: ["Card payment hurts less", "Cards have better prices", "Cash is harder to carry", "Retailers charge more for cash"], correct: 0, feedback: { correct: "Right. Handing over notes hurts in a way that tapping doesn't, and that pain is what moderates spending.", incorrect: "It's the reduced 'pain of paying'. The friction of cash is doing useful work." } } },
      { variantId: "mpx-m2-pm-tf", step: { type: "true-false", statement: "Adding friction to a spending method tends to reduce how much you spend through it.", correct: true, feedback: { correct: "Right. Removing saved cards from shopping sites is a small change with a measurable effect.", incorrect: "It's true. Friction creates a pause, and the pause is where the decision happens." } } },
      { variantId: "mpx-m2-pm-sc", step: { type: "scenario", question: "Ayesha overspends on impulse online purchases. What's a structural fix?", options: ["Remove saved card details", "Set yourself a mental limit", "Shop only during the weekends", "Use a card with better rewards"], correct: 0, feedback: { correct: "Right. Re-entering card details creates exactly the pause that impulse buying depends on not having.", incorrect: "Add friction. Mental limits fail precisely in the moments impulse buying happens." } } },
    ],
  },
  {
    slotId: "money-psychology/mental-acct-2/relative-thinking",
    conceptId: "anchoring-bias",
    variants: [
      { variantId: "mpx-m2-rt-sc", step: { type: "scenario", question: "A car salesperson offers R8 000 of extras on a R400 000 car as 'only 2%'. What's the framing doing?", options: ["Making a big amount feel trivial", "Offering a genuine discount", "Explaining the pricing structure", "Reducing the overall total cost"], correct: 0, feedback: { correct: "Right. R8 000 is R8 000. It doesn't shrink because it sits next to a larger number.", incorrect: "It's anchoring. The percentage framing is designed to make the absolute amount feel small." } } },
      { variantId: "mpx-m2-rt-mcq", step: { type: "mcq", question: "What's a reliable defence against percentage framing?", options: ["Convert it back to rands", "Trust the percentage given", "Compare to the largest number in the deal", "Decide quickly before overthinking"], correct: 0, feedback: { correct: "Right. 'R8 000 is four months of groceries' lands very differently from '2%'.", incorrect: "Convert to rands and compare to something concrete. Percentages are how small-sounding costs get through." } } },
      { variantId: "mpx-m2-rt-tf", step: { type: "true-false", statement: "Add-ons priced as a small percentage of a large purchase are a common way to increase the total.", correct: true, feedback: { correct: "Right, and it's most effective at the end of a long negotiation when decision fatigue has set in.", incorrect: "It's true. Percentage framing on top of a big anchor is a standard technique." } } },
    ],
  },
];

// ── Confirmation Bias in Investing ──────────────────────────────────────────
const confSlots: QuestionSlot[] = [
  {
    slotId: "money-psychology/confirmation/what-it-is",
    conceptId: "confirmation-bias",
    variants: [
      { variantId: "mpx-cf-wi-mcq", step: { type: "mcq", question: "What is confirmation bias?", options: ["Believing what supports your view", "Following the crowd blindly", "Overestimating your own trading ability", "Preferring immediate rewards always"], correct: 0, feedback: { correct: "Right, and it's mostly invisible. It feels like research, because you genuinely are reading things.", incorrect: "It's the tendency to favour supporting evidence. Following the crowd is herd behaviour; overestimating yourself is overconfidence." } } },
      { variantId: "mpx-cf-wi-tf", step: { type: "true-false", statement: "Reading only sources that agree with your investment view still counts as research.", correct: false, feedback: { correct: "Right. Research tests a view; selective reading decorates one you've already formed.", incorrect: "It isn't research. It's confirmation. Real research includes the strongest case against your position." } } },
      { variantId: "mpx-cf-wi-sc", step: { type: "scenario", question: "Johan buys a share, then follows five accounts that are bullish on it and mutes the critics. What's the effect?", options: ["He'll never see the warning signs", "He's filtering out useless noise", "He's diversifying his information", "He's reducing his overall risk"], correct: 0, feedback: { correct: "Right. The critics are the only source that could change his mind, which is exactly why they got muted.", incorrect: "He's engineered a feedback loop. The dissenting view is the useful one precisely because it's uncomfortable." } } },
    ],
  },
  {
    slotId: "money-psychology/confirmation/in-investing",
    conceptId: "confirmation-bias",
    variants: [
      { variantId: "mpx-cf-ii-mcq", step: { type: "mcq", question: "How does confirmation bias typically show up after buying an investment?", options: ["Good news counts, bad news is noise", "You end up selling far too early", "You stop checking prices", "You diversify a lot more"], correct: 0, feedback: { correct: "Right, and the asymmetry grows with the position size. The more you've committed, the louder the good news sounds.", incorrect: "It's the asymmetric weighting: supporting news is evidence, contradicting news gets explained away." } } },
      { variantId: "mpx-cf-ii-tf", step: { type: "true-false", statement: "Deliberately seeking out the strongest argument against your position is a useful discipline.", correct: true, feedback: { correct: "Right. If you can't state the bear case well, you don't understand the investment yet.", incorrect: "It's true, and it's the standard remedy. You should be able to argue the other side convincingly." } } },
      { variantId: "mpx-cf-ii-sc", step: { type: "scenario", question: "Priya's fund has lagged for three years and she keeps finding reasons it will recover. What would test her thinking?", options: ["Naming what would change her mind", "Reading yet more positive commentary", "Adding more to the position", "Waiting another three years"], correct: 0, feedback: { correct: "Right. A pre-committed exit condition is what stops reasons from being generated indefinitely after the fact.", incorrect: "Define the falsifying evidence in advance. Without it, there's always another reason to hold." } } },
    ],
  },
  {
    slotId: "money-psychology/confirmation/social-proof",
    conceptId: "herd-fomo",
    variants: [
      { variantId: "mpx-cf-sp-sc", step: { type: "scenario", question: "Everyone in your circle is buying a particular asset and you know nothing about it. What's herd-resistant behaviour?", options: ["Form your own view, or stay out", "Buy a small amount to avoid missing out", "Buy as much as everyone else has", "Wait until it rises further, then buy"], correct: 0, feedback: { correct: "Right. 'Everyone is buying' tells you about sentiment, not value, and by the time it's universal, the easy gains are behind.", incorrect: "Form your own view or stay out. A small position to relieve FOMO is still a decision made by other people." } } },
      { variantId: "mpx-cf-sp-tf", step: { type: "true-false", statement: "If an asset has risen for two years and everyone is talking about it, that's usually the safest time to buy.", correct: false, feedback: { correct: "Right. Often the opposite. Broad enthusiasm after a long run frequently marks a late stage, not a safe one.", incorrect: "Universal enthusiasm after a long rise is a warning, not reassurance. Late entrants take the most risk." } } },
      { variantId: "mpx-cf-sp-mcq", step: { type: "mcq", question: "Why is 'everyone I know made money on it' weak evidence?", options: ["You only hear from the winners", "Your friends are unreliable", "Past returns are always negative", "It's usually a scam"], correct: 0, feedback: { correct: "Right. Survivorship bias. The people who lost aren't posting about it, so the sample you see is systematically wrong.", incorrect: "It's survivorship bias. Losses go unreported, so the visible evidence overstates the success rate." } } },
    ],
  },
  {
    slotId: "money-psychology/confirmation/counters",
    conceptId: "confirmation-bias",
    variants: [
      { variantId: "mpx-cf-co-mcq", step: { type: "mcq", question: "Which practice most effectively counters confirmation bias?", options: ["Writing down what would prove you wrong", "Reading more of the same sources", "Deciding a lot faster", "Discussing it only with people who agree"], correct: 0, feedback: { correct: "Right. Written reasoning can be checked later against what actually happened: memory quietly rewrites itself otherwise.", incorrect: "Write it down in advance, including the disconfirming conditions. That's the only version you can audit later." } } },
      { variantId: "mpx-cf-co-tf", step: { type: "true-false", statement: "Keeping a written record of why you made each investment decision helps you learn from outcomes.", correct: true, feedback: { correct: "Right. Without it, hindsight convinces you that you predicted whatever happened.", incorrect: "It's true. A decision journal is the main defence against memory rewriting your reasoning." } } },
      { variantId: "mpx-cf-co-sc", step: { type: "scenario", question: "Sipho wants a genuine second opinion on a large investment. Who should he ask?", options: ["Someone with no stake in the decision", "The person who recommended it", "Someone who owns the same investment too", "The product provider itself"], correct: 0, feedback: { correct: "Right. A useful second opinion comes from someone with no incentive and no position to defend.", incorrect: "Ask someone independent. Anyone holding the same investment shares his bias." } } },
    ],
  },
];

// ── Loss Aversion ───────────────────────────────────────────────────────────
const lossSlots: QuestionSlot[] = [
  {
    slotId: "money-psychology/loss-aversion/asymmetry",
    conceptId: "loss-aversion",
    variants: [
      { variantId: "mpx-la-as-mcq", step: { type: "mcq", question: "What does loss aversion describe?", options: ["Losses hurt more than gains please", "A preference for safe investments", "Fear of investing at all", "The tendency to sell winners early"], correct: 0, feedback: { correct: "Right. Roughly twice as intense, on most estimates. It's why a 10% fall feels far worse than a 10% rise feels good.", incorrect: "It's the asymmetry between the pain of losing and the pleasure of gaining the same amount." } } },
      { variantId: "mpx-la-as-tf", step: { type: "true-false", statement: "Losing R1 000 typically feels more intense than gaining R1 000.", correct: true, feedback: { correct: "Right, and that asymmetry drives a lot of costly behaviour, panic selling, over-insuring, avoiding markets entirely.", incorrect: "It's true and well established. The pain of loss outweighs the pleasure of an equal gain." } } },
      { variantId: "mpx-la-as-sc", step: { type: "scenario", question: "Nomsa's portfolio falls 15% and she can't stop checking it, though she didn't check at all when it rose 15%. What's happening?", options: ["Loss aversion, falls grab attention", "Her portfolio is riskier now", "She is being appropriately vigilant", "The market is more volatile now"], correct: 0, feedback: { correct: "Right, and constant checking makes it worse: the more often you look, the more losses you see.", incorrect: "It's loss aversion. Frequent checking amplifies it, because short periods contain more losses than long ones." } } },
    ],
  },
  {
    slotId: "money-psychology/loss-aversion/holding-losers",
    conceptId: "loss-aversion",
    variants: [
      { variantId: "mpx-la-hl-sc", step: { type: "scenario", question: "Thabo holds a share down 40% because selling would 'make the loss real'. What's the flaw?", options: ["The loss already happened", "He's right to wait for recovery", "Selling would create a new loss", "The loss only counts if he sells"], correct: 0, feedback: { correct: "Right. The only question that matters is whether he'd buy it today at this price. If not, holding is just avoidance.", incorrect: "The loss occurred when the price fell. Holding is a new decision, and 'would I buy this today?' is the test." } } },
      { variantId: "mpx-la-hl-mcq", step: { type: "mcq", question: "What's the disposition effect?", options: ["Selling winners, holding losers", "Selling everything in a crash", "Buying only companies you know well", "Avoiding all risk entirely"], correct: 0, feedback: { correct: "Right, and it's expensive twice over. It cuts gains short and lets losses run.", incorrect: "It's the pattern of realising gains quickly while avoiding realising losses." } } },
      { variantId: "mpx-la-hl-tf", step: { type: "true-false", statement: "Whether to keep an investment should depend on its prospects, not on your purchase price.", correct: true, feedback: { correct: "Right. The market has no idea what you paid, and your entry price contains no information about the future.", incorrect: "It's true. Your purchase price is irrelevant to the investment's prospects from here." } } },
    ],
  },
  {
    slotId: "money-psychology/loss-aversion/panic-selling",
    conceptId: "loss-aversion",
    variants: [
      { variantId: "mpx-la-ps-mcq", step: { type: "mcq", question: "Why is panic selling in a crash so costly?", options: ["It makes a paper loss real", "Trading fees are high", "It triggers an immediate tax bill", "Markets never recover afterwards"], correct: 0, feedback: { correct: "Right. Recoveries tend to be concentrated in a handful of strong days, and people who sold are rarely back in time for them.", incorrect: "It realises the loss and misses the rebound, which is typically fast and easy to miss." } } },
      { variantId: "mpx-la-ps-tf", step: { type: "true-false", statement: "Checking your portfolio less often tends to improve long-term outcomes.", correct: true, feedback: { correct: "Right. Shorter windows contain more losses, so frequent checking supplies more chances to panic.", incorrect: "It's true. Less frequent checking reduces exposure to the noise that drives bad decisions." } } },
      { variantId: "mpx-la-ps-sc", step: { type: "scenario", question: "Markets fall sharply and Lerato wants to sell everything. What would help most in that moment?", options: ["A written plan made in calm times", "Watching more financial news", "Asking her most anxious friend", "Selling half of it to feel better"], correct: 0, feedback: { correct: "Right. The plan's whole purpose is to make the decision before the emotion arrives.", incorrect: "A pre-written plan. News and anxious friends amplify the feeling rather than resolving it." } } },
    ],
  },
  {
    slotId: "money-psychology/loss-aversion/framing",
    conceptId: "loss-aversion",
    variants: [
      { variantId: "mpx-la-fr-mcq", step: { type: "mcq", question: "How do marketers exploit loss aversion?", options: ["Framing it as a loss", "By offering bigger discounts", "By explaining product features", "By comparing rival products"], correct: 0, feedback: { correct: "Right. 'Save R500' and 'lose R500 if you don't act' describe the same thing, but the second one moves people more.", incorrect: "Loss framing. 'Don't miss out' outperforms 'gain this' because the pain of loss is stronger." } } },
      { variantId: "mpx-la-fr-tf", step: { type: "true-false", statement: "'Only 2 left in stock' and 'offer ends midnight' both work by triggering loss aversion.", correct: true, feedback: { correct: "Right. Both manufacture a potential loss to short-circuit deliberation.", incorrect: "It's true. Scarcity and deadlines create a loss to avoid, which is more motivating than a gain to pursue." } } },
      { variantId: "mpx-la-fr-sc", step: { type: "scenario", question: "Ayesha feels pressure from a 'last chance' insurance offer. What's a good check?", options: ["Ask if she'd want it anyway", "Buy it now and cancel it later", "Ask for a longer deadline", "Buy the cheapest version"], correct: 0, feedback: { correct: "Right. Strip the deadline and the question becomes 'do I need this?', which is the only question that matters.", incorrect: "Remove the deadline mentally and re-ask the question. The urgency is a sales device." } } },
    ],
  },
];

// ── Overconfidence and Recency Bias ─────────────────────────────────────────
const overSlots: QuestionSlot[] = [
  {
    slotId: "money-psychology/overconfidence/above-average",
    conceptId: "overconfidence-bias",
    variants: [
      { variantId: "mpx-ov-aa-mcq", step: { type: "mcq", question: "What does overconfidence bias look like in investing?", options: ["Believing you can pick winners", "Refusing to invest at all, ever", "Following expert advice too closely", "Diversifying far too much"], correct: 0, feedback: { correct: "Right, and it's measurable: more confident investors trade more, and more trading reliably reduces net returns.", incorrect: "It's overestimating your own skill or judgement, typically expressed through more frequent trading." } } },
      { variantId: "mpx-ov-aa-tf", step: { type: "true-false", statement: "Investors who trade more frequently tend to earn lower net returns.", correct: true, feedback: { correct: "Right. Costs accumulate and the timing decisions rarely add enough to cover them.", incorrect: "It's true and consistently found. Activity correlates with worse net outcomes, not better." } } },
      { variantId: "mpx-ov-aa-sc", step: { type: "scenario", question: "Johan made money on three trades and now believes he has a knack for it. What's the risk?", options: ["Three trades cannot prove skill", "He should trade more to confirm it", "He has proven his ability", "He should start teaching others"], correct: 0, feedback: { correct: "Right, and the position sizes usually grow just before the run ends. That's the expensive part.", incorrect: "Three results are far too few to establish skill, but quite enough to build dangerous confidence." } } },
    ],
  },
  {
    slotId: "money-psychology/overconfidence/recency",
    conceptId: "overconfidence-bias",
    variants: [
      { variantId: "mpx-ov-rc-mcq", step: { type: "mcq", question: "What is recency bias?", options: ["Assuming recent trends continue", "Preferring newly listed companies", "Buying only recent IPOs", "Forgetting older information"], correct: 0, feedback: { correct: "Right. After three good years people expect a fourth; after a crash they expect permanent decline. Both are extrapolation.", incorrect: "It's over-weighting recent experience when forming expectations about the future." } } },
      { variantId: "mpx-ov-rc-tf", step: { type: "true-false", statement: "A fund's strong recent performance is a reliable predictor of its future performance.", correct: false, feedback: { correct: "Right. Top performers rotate, which is why chasing last year's winner tends to underperform.", incorrect: "Recent performance predicts very little. Rankings rotate constantly across market cycles." } } },
      { variantId: "mpx-ov-rc-sc", step: { type: "scenario", question: "After two strong years, Priya increases her equity allocation because 'markets are doing well'. What's the flaw?", options: ["She's raising risk after prices rose", "Nothing, momentum is real", "She should have increased it much sooner", "She should sell everything instead"], correct: 0, feedback: { correct: "Right. Allocation should follow her time horizon and tolerance, not the last two years of returns.", incorrect: "It's recency-driven. Buying more risk after a run is how people end up buying high." } } },
    ],
  },
  {
    slotId: "money-psychology/overconfidence/hindsight",
    conceptId: "overconfidence-bias",
    variants: [
      { variantId: "mpx-ov-hs-mcq", step: { type: "mcq", question: "What is hindsight bias?", options: ["Believing afterwards that you knew", "Regretting all of your past decisions", "Forgetting your past losses", "Refusing to review decisions"], correct: 0, feedback: { correct: "Right, and it's corrosive: it convinces you that unpredictable events were predictable, which feeds overconfidence.", incorrect: "It's the 'I knew it all along' effect, which quietly manufactures confidence you haven't earned." } } },
      { variantId: "mpx-ov-hs-tf", step: { type: "true-false", statement: "Writing down predictions in advance is the main defence against hindsight bias.", correct: true, feedback: { correct: "Right. Written predictions can't be edited by memory, which is what makes them uncomfortable and useful.", incorrect: "It's true. Only a contemporaneous record shows what you actually believed at the time." } } },
      { variantId: "mpx-ov-hs-sc", step: { type: "scenario", question: "After a crash, Sipho is certain the warning signs were obvious. How can he test that?", options: ["Check what he wrote down before", "Ask his friends if they agree now", "Read the post-crash analysis", "Trust his own memory of it"], correct: 0, feedback: { correct: "Right. If he saw it clearly, his portfolio would show it. Memory is not evidence.", incorrect: "Look for contemporaneous evidence, a record or an action. Post-hoc analysis and memory both confirm the bias." } } },
    ],
  },
  {
    slotId: "money-psychology/overconfidence/humility",
    conceptId: "overconfidence-bias",
    variants: [
      { variantId: "mpx-ov-hm-mcq", step: { type: "mcq", question: "What investment approach follows from taking overconfidence seriously?", options: ["Broad diversification and a plan", "Trading more to build skill", "Concentrating in your best ideas", "Avoiding markets entirely"], correct: 0, feedback: { correct: "Right. Diversification is an admission that you don't know which one will work, which is the accurate position.", incorrect: "Diversification and a rules-based plan. Concentration assumes a level of foresight the evidence doesn't support." } } },
      { variantId: "mpx-ov-hm-tf", step: { type: "true-false", statement: "Automating your investing removes many opportunities for overconfidence to cost you money.", correct: true, feedback: { correct: "Right. A debit order can't decide it has a hunch this month.", incorrect: "It's true. Automation removes the discretionary decisions where overconfidence does its damage." } } },
      { variantId: "mpx-ov-hm-sc", step: { type: "scenario", question: "Nomsa enjoys picking shares but knows the odds. What's a reasonable compromise?", options: ["Cap a small portion, index the rest", "Put absolutely everything into her picks", "Stop investing in any shares altogether", "Only pick the shares she has heard of"], correct: 0, feedback: { correct: "Right. A capped satellite scratches the itch without letting it endanger the core, and it teaches her something real.", incorrect: "Cap the discretionary portion and index the core. That way the interest costs her a known, limited amount." } } },
    ],
  },
];

// ── The Share That Won't Stop Falling (applied) ─────────────────────────────
const sunkSlots: QuestionSlot[] = [
  {
    slotId: "money-psychology/sunk-cost-inv/what-counts",
    conceptId: "sunk-cost-fallacy",
    variants: [
      { variantId: "mpx-sk-wc-mcq", step: { type: "mcq", question: "Lerato bought a share at R80; it's now R32. What should drive her decision?", options: ["Whether she'd buy it today at R32", "How much money she has already lost", "Getting back to R80 first", "How long she has held it"], correct: 0, feedback: { correct: "Right. The R48 is gone either way. The only live question is whether R32 is a good use of that money now.", incorrect: "The purchase price is a sunk cost. 'Would I buy it today?' is the only decision-relevant question." } } },
      { variantId: "mpx-sk-wc-tf", step: { type: "true-false", statement: "Money already lost on an investment should influence whether you keep holding it.", correct: false, feedback: { correct: "Right. It's unrecoverable regardless of what you do next, so it carries no information about the right choice.", incorrect: "Sunk costs shouldn't influence forward-looking decisions. Only future prospects matter." } } },
      { variantId: "mpx-sk-wc-sc", step: { type: "scenario", question: "Thabo says he'll sell 'once it gets back to what I paid'. What's wrong with that rule?", options: ["The market doesn't know his purchase price", "It's too conservative", "He should wait for a profit instead", "Nothing. It's disciplined"], correct: 0, feedback: { correct: "Right. His entry price is a fact about his history, not about the company's future.", incorrect: "The break-even target is arbitrary. Nothing about the investment changes at the price he happened to pay." } } },
    ],
  },
  {
    slotId: "money-psychology/sunk-cost-inv/opportunity-cost",
    conceptId: "sunk-cost-fallacy",
    variants: [
      { variantId: "mpx-sk-oc-mcq", step: { type: "mcq", question: "What's the hidden cost of holding a failing investment 'until it recovers'?", options: ["The money can't work elsewhere", "The holding fees you keep paying", "The tax on the loss", "Nothing, holding it is free"], correct: 0, feedback: { correct: "Right. Years spent waiting for break-even are years that money isn't compounding somewhere better.", incorrect: "Opportunity cost. Capital tied to a recovery hope isn't available for anything productive." } } },
      { variantId: "mpx-sk-oc-tf", step: { type: "true-false", statement: "Realising a capital loss can have a tax benefit in a taxable account.", correct: true, feedback: { correct: "Right. Capital losses offset capital gains, so a considered sale can reduce the tax on gains elsewhere.", incorrect: "It's true. Losses can be set off against gains in the same year, which sometimes makes selling more attractive." } } },
      { variantId: "mpx-sk-oc-sc", step: { type: "scenario", question: "Lerato's R32 share needs to more than double just to break even. How should she frame that?", options: ["Ask if it's her best option now", "Focus on getting back to R80", "Buy more to lower her average", "Hold on indefinitely as a principle"], correct: 0, feedback: { correct: "Right. Averaging down is often sunk cost wearing a strategy's clothes. The test is still whether she'd buy today.", incorrect: "Compare it to her alternatives. Averaging down commits more money to justify the first decision." } } },
    ],
  },
  {
    slotId: "money-psychology/sunk-cost-inv/beyond-investing",
    conceptId: "sunk-cost-fallacy",
    variants: [
      { variantId: "mpx-sk-bi-mcq", step: { type: "mcq", question: "Where else does the sunk cost fallacy commonly cost people money?", options: ["Gyms, courses and old cars", "Only in share portfolios", "Only in property investments", "Only in business ventures"], correct: 0, feedback: { correct: "Right. 'I've already spent so much on this car' is the same reasoning that keeps a bad share in a portfolio.", incorrect: "It shows up everywhere: subscriptions, courses, vehicles, relationships with money attached." } } },
      { variantId: "mpx-sk-bi-tf", step: { type: "true-false", statement: "Continuing to repair a car because of what you've already spent on repairs is a sunk cost error.", correct: true, feedback: { correct: "Right. The question is whether the next R15 000 repair is worth it, not what the last three cost.", incorrect: "It's true. Past repairs are unrecoverable; only the next decision is live." } } },
      { variantId: "mpx-sk-bi-sc", step: { type: "scenario", question: "Sipho has paid R400 a month for a gym he hasn't visited in six months. What's the reasoning error if he keeps it?", options: ["Keeping it because of the R2 400 already spent", "Nothing. He may still go", "He should pay for a year upfront", "He should switch to a more expensive gym"], correct: 0, feedback: { correct: "Right. The R2 400 is gone. The only question is whether the next R400 buys anything.", incorrect: "The past payments are irrelevant. Decide about the next month on its own merits." } } },
    ],
  },
  {
    slotId: "money-psychology/sunk-cost-inv/decision-rules",
    conceptId: "sunk-cost-fallacy",
    variants: [
      { variantId: "mpx-sk-dr-mcq", step: { type: "mcq", question: "What's the most useful question when deciding whether to exit an investment?", options: ["Would I buy it at this price?", "How much have I already lost?", "How long have I held this?", "What did my friend decide to do?"], correct: 0, feedback: { correct: "Right. If the answer is no, holding is just a sale you haven't got round to making.", incorrect: "The 'would I buy it today' test. The other three are all backward-looking or irrelevant." } } },
      { variantId: "mpx-sk-dr-tf", step: { type: "true-false", statement: "Setting exit conditions before you invest makes it easier to act rationally later.", correct: true, feedback: { correct: "Right. Deciding in advance is how you get a rational decision made by a calm version of yourself.", incorrect: "It's true. Pre-commitment is the standard defence against emotional decisions in the moment." } } },
      { variantId: "mpx-sk-dr-sc", step: { type: "scenario", question: "Ayesha wants to avoid this trap in future. What's a concrete step?", options: ["Write down", "Set a target price to sell at a profit only", "Avoid investing in shares", "Check the price more often"], correct: 0, feedback: { correct: "Right. A written falsifying condition converts an emotional exit into a pre-agreed one.", incorrect: "Define the disconfirming evidence upfront. Profit-only targets leave the losing case undecided." } } },
    ],
  },
];

export const MONEY_PSYCHOLOGY_EXTRA_BANKS: Record<string, LessonBank> = {
  "money-psychology::lesson-hedonic-adaptation": {
    layout: L(hedSlots, "The Treadmill With No Finish Line", "<p><strong>Hedonic adaptation</strong> is the return to your usual level of happiness after a change. The new car thrills you for weeks, then becomes the car, which is why the next upgrade always feels necessary. Experiences resist it better than possessions, because they become memories rather than background. The strongest counters: <strong>bank part of every raise before adapting to it</strong>, space out treats so they stay treats, and deliberately notice what you already have.</p>"),
    slots: hedSlots,
  },
  "money-psychology::lesson-mental-accounting": {
    layout: L(ma1Slots, "Why Bonus Rands Feel Different", "<p><strong>Mental accounting</strong> is treating money differently depending on where it came from. A bonus gets spent in a week while the same amount of salary is carefully budgeted. Even though a SARS refund is just your own overpaid tax coming back. The bias also hides real costs: R20 000 in savings at 6% alongside R20 000 on a card at 20% costs about <strong>R2 800 a year</strong>. Used deliberately, though, named goal accounts make the same bias work for you.</p>"),
    slots: ma1Slots,
  },
  "money-psychology::lesson-mental-accounting-2": {
    layout: L(ma2Slots, "Why R1 000 Isn't Always R1 000", "<p>We'd drive across town to save R200 on a kettle but not on a fridge, though it's the same R200 for the same trip. Proportional thinking makes us casual about the largest rand amounts, which is why <strong>R8 000 of extras on a R400 000 car gets framed as 'only 2%'</strong>. Payment method matters too: cards reduce the pain of paying, so removing saved card details is a small change with a real effect.</p>"),
    slots: ma2Slots,
  },
  "money-psychology::lesson-confirmation-bias": {
    layout: L(confSlots, "Research or Reassurance?", "<p><strong>Confirmation bias</strong> is seeking information that supports what you already believe, and it feels exactly like research. After buying, good news becomes significant and bad news becomes noise. The remedies are uncomfortable by design: seek the strongest argument <em>against</em> your position, write your reasoning down before you decide including what would prove you wrong, and get second opinions from people with no stake in the outcome.</p>"),
    slots: confSlots,
  },
  "money-psychology::lesson-loss-aversion": {
    layout: L(lossSlots, "Why Losing Hurts Twice as Much", "<p>Losses feel roughly twice as intense as equivalent gains. That asymmetry drives the <strong>disposition effect</strong>, selling winners early and holding losers too long, and it drives panic selling, which converts a paper loss into a real one and usually misses the recovery. Marketers use it too: 'only 2 left' and 'offer ends midnight' both manufacture a loss to avoid. Checking your portfolio less often genuinely helps.</p>"),
    slots: lossSlots,
  },
  "money-psychology::lesson-overconfidence-recency": {
    layout: L(overSlots, "Two Biases That Travel Together", "<p><strong>Overconfidence</strong> makes people trade more, and more trading reliably lowers net returns. <strong>Recency bias</strong> makes us extrapolate the last few years indefinitely. Raising equity exposure after a run, or abandoning markets after a crash. <strong>Hindsight bias</strong> then convinces us we saw it coming, manufacturing confidence we never earned. The honest response: diversify, automate, and write predictions down before the outcome is known.</p>"),
    slots: overSlots,
  },
  "money-psychology::lesson-applied-sunk-cost-investing": {
    layout: L(sunkSlots, "Lerato's Falling Share", "<p>Lerato bought at <strong>R80</strong>. It's now <strong>R32</strong>, and she plans to sell 'once it gets back to what I paid'. But the market has no idea what she paid, and the R48 is unrecoverable whatever she does next. The only live question is: <strong>would she buy this today at R32?</strong> If not, holding is a sale she hasn't made yet, and the money can't work anywhere else while it waits.</p>"),
    slots: sunkSlots,
  },
};
