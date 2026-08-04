import type { LessonLayoutItem, QuestionSlot } from "@/data/content";
import type { LessonBank } from "./money-basics";

/**
 * Premium banks for the "Money & the Bible" EXTRA lessons.
 *
 * Scripture is quoted from the New Living Translation (NLT), matching the rest
 * of the course. Verbatim quotes verified against BibleStudyTools / BibleHub /
 * YouVersion (NLT):
 *   Philippians 4:11, Proverbs 24:27, Colossians 3:23, Proverbs 11:1,
 *   Malachi 3:10, Proverbs 22:26-27, 2 Corinthians 9:7, Proverbs 11:24-25,
 *   Proverbs 19:17, Luke 16:10, 1 Timothy 6:10, Proverbs 21:5.
 * Passages referenced but not quoted verbatim are described, not put in quotes.
 *
 * Tone matches bible-money.ts: wisdom for stewardship, not prosperity-gospel
 * guilt. Money is a neutral tool; the heart behind it is the point.
 * variantId prefix: `bmx-`.
 */
const info = (title: string, content: string): LessonLayoutItem => ({ type: "info", title, content });
const L = (slots: QuestionSlot[], title: string, content: string): LessonLayoutItem[] => [
  info(title, content),
  ...slots.map((s) => ({ slot: s.slotId })),
];

// ── The Secret of Contentment ───────────────────────────────────────────────
const contSlots: QuestionSlot[] = [
  {
    slotId: "bible-money/contentment/learned",
    conceptId: "contentment-biblical",
    variants: [
      { variantId: "bmx-cn-lr-mcq", step: { type: "mcq", question: "In Philippians 4:11 Paul writes that he has 'learned how to be content with whatever I have'. What does 'learned' imply?", options: ["Contentment is a practised skill, not a personality trait you're born with", "Only apostles can be content", "Contentment arrives once you have enough money", "Contentment means you never want anything"], correct: 0, feedback: { correct: "Right. Paul says he learned it. Through plenty and through need. That makes it available to anyone willing to practise it.", incorrect: "The word 'learned' is the point: it's a practice, developed over time, not a temperament or a income level." } } },
      { variantId: "bmx-cn-lr-tf", step: { type: "true-false", statement: "Biblical contentment means you should never set financial goals or try to improve your situation.", correct: false, feedback: { correct: "Right. Proverbs is full of planning, saving and diligent work. Contentment governs your <em>peace</em>, not your ambition.", incorrect: "Contentment isn't passivity. Scripture commends planning and diligence. What it warns against is restlessness that never says 'enough'." } } },
      { variantId: "bmx-cn-lr-sc", step: { type: "scenario", question: "Thabo is saving hard for a deposit and feels guilty that this means he isn't 'content'. What would you say?", options: ["Saving toward a clear goal is stewardship; contentment is about peace in the meantime", "He's right to feel guilty. Christians shouldn't save", "He should give the savings away instead", "He should stop planning and trust God for a house"], correct: 0, feedback: { correct: "Right. The two sit together: work and plan diligently, and be at peace with where you are while you do it.", incorrect: "There's no conflict. Contentment is about peace with today, not the absence of a plan for tomorrow." } } },
    ],
  },
  {
    slotId: "bible-money/contentment/comparison",
    conceptId: "contentment-biblical",
    variants: [
      { variantId: "bmx-cn-cp-sc", step: { type: "scenario", question: "Your neighbour buys a new SUV and you feel pressure to replace your paid-off Toyota. What's a contentment-shaped response?", options: ["Name the feeling as comparison, and re-anchor on what your paid-off car already gives you", "Buy a better car to settle the feeling", "Avoid the neighbour", "Take on debt so you're not embarrassed"], correct: 0, feedback: { correct: "Right. A paid-off car is freedom: no instalment, no negative equity. Naming comparison is what stops it steering the decision.", incorrect: "Recognise the comparison for what it is. Financing a car to soothe a feeling trades real freedom for temporary relief." } } },
      { variantId: "bmx-cn-cp-mcq", step: { type: "mcq", question: "Why does comparison make contentment so hard?", options: ["The reference point keeps moving", "Other people always have more", "It's forbidden by Scripture to notice wealth", "Comparison is illegal"], correct: 0, feedback: { correct: "Right. Every upgrade resets the baseline, which is why the feeling returns a few months later regardless of what you bought.", incorrect: "It's the moving reference point. Whatever you reach, the comparison simply shifts upward." } } },
      { variantId: "bmx-cn-cp-tf", step: { type: "true-false", statement: "Social media makes biblical contentment harder because it constantly supplies new comparisons.", correct: true, feedback: { correct: "Right, and it shows edited highlights, so you're comparing your ordinary life to someone's best day.", incorrect: "It's true. A constant stream of curated comparisons is exactly the condition contentment has to work against." } } },
    ],
  },
  {
    slotId: "bible-money/contentment/enough",
    conceptId: "contentment-biblical",
    variants: [
      { variantId: "bmx-cn-en-mcq", step: { type: "mcq", question: "Ecclesiastes observes that whoever loves money never has enough. What's the practical implication?", options: ["More income alone won't produce satisfaction. That has to be decided, not earned", "Money is evil", "You should refuse raises", "Wealthy people are unhappy by definition"], correct: 0, feedback: { correct: "Right. It's an observation about appetite, not a prohibition on income. Deciding what 'enough' looks like is the work.", incorrect: "The point is that appetite grows with supply. Income isn't condemned; the endless chase is." } } },
      { variantId: "bmx-cn-en-tf", step: { type: "true-false", statement: "1 Timothy 6:10 says money itself is the root of all evil.", correct: false, feedback: { correct: "Right. It says the <em>love</em> of money is the root of all kinds of evil. Money is a tool; the heart's grip on it is the issue.", incorrect: "It's the love of money, not money. That distinction runs through the whole of Scripture's treatment of wealth." } } },
      { variantId: "bmx-cn-en-sc", step: { type: "scenario", question: "Lerato wants to define 'enough' for her family. What's a practical first step?", options: ["Write down a specific lifestyle number and a giving number", "Set no limit and see what happens", "Match whatever her colleagues spend", "Give away everything above the minimum"], correct: 0, feedback: { correct: "Right. Numbers make 'enough' real. Without one, every raise silently becomes the new baseline.", incorrect: "Define it concretely. An undefined 'enough' always gets redefined upward by whatever you next earn." } } },
    ],
  },
  {
    slotId: "bible-money/contentment/gratitude",
    conceptId: "contentment-biblical",
    variants: [
      { variantId: "bmx-cn-gr-mcq", step: { type: "mcq", question: "Which habit most reliably strengthens contentment?", options: ["Regularly naming specific things you already have", "Reading about other people's wealth", "Avoiding all spending", "Checking your investments daily"], correct: 0, feedback: { correct: "Right. Gratitude works because it moves attention from the gap to what's already there, and it's specific things, not vague thankfulness, that do it.", incorrect: "Naming specific things you already have. The other three feed comparison or anxiety." } } },
      { variantId: "bmx-cn-gr-tf", step: { type: "true-false", statement: "Contentment and financial discipline tend to reinforce each other.", correct: true, feedback: { correct: "Right. Someone at peace with what they have finds it far easier to stick to a budget and resist an upgrade.", incorrect: "It's true. Restlessness is what breaks budgets; contentment is what makes discipline sustainable." } } },
      { variantId: "bmx-cn-gr-sc", step: { type: "scenario", question: "Sipho notices he shops most when he's feeling behind. What's a useful response?", options: ["Treat the urge as information about the feeling, and delay the purchase 48 hours", "Set a bigger shopping budget", "Shop only online", "Ignore the pattern"], correct: 0, feedback: { correct: "Right. Most comparison-driven purchases don't survive two days of delay, and the pattern itself is worth paying attention to.", incorrect: "Notice the trigger and delay. Budgeting more for a feeling-driven habit just funds it." } } },
    ],
  },
];

// ── Planning and Preparation in Proverbs ────────────────────────────────────
const planSlots: QuestionSlot[] = [
  {
    slotId: "bible-money/planning/field-before-house",
    conceptId: "biblical-planning",
    variants: [
      { variantId: "bmx-pl-fh-mcq", step: { type: "mcq", question: "Proverbs 24:27 says 'Do your planning and prepare your fields before building your house.' What does that principle apply to today?", options: ["Securing your income before committing to a large lifestyle expense", "Buying property before renting", "Building a house before starting a business", "Avoiding agriculture"], correct: 0, feedback: { correct: "Right. The field produced the income; the house was the comfort. Income capacity first, comfort second.", incorrect: "It's about sequence: establish what produces income before committing to what consumes it." } } },
      { variantId: "bmx-pl-fh-sc", step: { type: "scenario", question: "Nomsa wants to buy a house but her income is unstable and she has no emergency fund. What would the 'field before house' principle suggest?", options: ["Stabilise the income and build the buffer first", "Buy now. Property always rises", "Buy a bigger house so it appreciates more", "Rent forever"], correct: 0, feedback: { correct: "Right. A bond on unstable income with no buffer is how homes get lost. The order protects the house you eventually buy.", incorrect: "Field first. Buying before the income is secure is exactly the sequence Proverbs warns against." } } },
      { variantId: "bmx-pl-fh-tf", step: { type: "true-false", statement: "The Bible discourages long-term financial planning because we should trust God for tomorrow.", correct: false, feedback: { correct: "Right. Proverbs commends the ant storing in summer and the diligent making plans, trust and planning aren't opposites.", incorrect: "Scripture repeatedly commends planning. Trust doesn't replace preparation; it accompanies it." } } },
    ],
  },
  {
    slotId: "bible-money/planning/diligent-plans",
    conceptId: "biblical-planning",
    variants: [
      { variantId: "bmx-pl-dp-sc", step: { type: "scenario", question: "Sipho is offered a 'limited time opportunity' that will triple his money in six months. Proverbs 21:5 contrasts careful planning with hasty shortcuts. What does it counsel?", options: ["Steady, planned effort, and treat the urgency itself as a warning", "Move fast before the window closes", "Borrow to invest more", "Bring friends in to reduce his risk"], correct: 0, feedback: { correct: "Right. 'Good planning and hard work lead to prosperity, but hasty shortcuts lead to poverty.' The deadline is the tell.", incorrect: "Proverbs 21:5 favours planning over haste. A closing window is a pressure tactic, not an opportunity." } } },
      { variantId: "bmx-pl-dp-tf", step: { type: "true-false", statement: "Proverbs treats wealth built gradually as more durable than wealth acquired quickly.", correct: true, feedback: { correct: "Right. Proverbs 13:11 makes exactly that contrast: wealth from get-rich-quick schemes disappears, wealth gathered little by little grows.", incorrect: "It's true. Gradual accumulation is commended repeatedly; quick money is treated as unstable." } } },
      { variantId: "bmx-pl-dp-mcq", step: { type: "mcq", question: "What distinguishes planning from anxiety in the biblical picture?", options: ["Planning prepares and then rests; anxiety rehearses without preparing", "Planning is faithless; anxiety is realistic", "There's no difference", "Planning means predicting the future accurately"], correct: 0, feedback: { correct: "Right. Preparation is commended; the worry that never turns into action is what's addressed elsewhere.", incorrect: "Planning acts. Anxiety loops. Scripture commends the first and speaks against the second." } } },
    ],
  },
  {
    slotId: "bible-money/planning/know-your-flocks",
    conceptId: "biblical-planning",
    variants: [
      { variantId: "bmx-pl-kf-mcq", step: { type: "mcq", question: "Proverbs 27:23 urges knowing the condition of your flocks. What's the modern equivalent?", options: ["Knowing your actual numbers, income, expenses, debts and balances", "Owning livestock", "Keeping your finances private", "Trusting your bank to track things"], correct: 0, feedback: { correct: "Right. Flocks were the balance sheet. You can't steward what you haven't looked at.", incorrect: "It's about knowing your own position in detail: the ancient version of checking your accounts." } } },
      { variantId: "bmx-pl-kf-tf", step: { type: "true-false", statement: "Avoiding your bank statements because they're stressful is a form of poor stewardship.", correct: true, feedback: { correct: "Right, and it's common. The avoidance usually costs more than the discomfort it prevents.", incorrect: "It's true. Not knowing is a decision too, and it's the one that lets problems compound quietly." } } },
      { variantId: "bmx-pl-kf-sc", step: { type: "scenario", question: "Johan hasn't opened his banking app in three months. What's a reasonable first step?", options: ["Open it, list every debit order, and cancel what he no longer uses", "Wait until he feels ready", "Close the account and start fresh", "Ask someone else to check it"], correct: 0, feedback: { correct: "Right. Looking is the whole battle, and the debit order audit usually pays for itself immediately.", incorrect: "Start by looking. The unopened app is the problem, and it doesn't improve with time." } } },
    ],
  },
  {
    slotId: "bible-money/planning/wise-counsel",
    conceptId: "biblical-planning",
    variants: [
      { variantId: "bmx-pl-wc-mcq", step: { type: "mcq", question: "Proverbs repeatedly commends seeking advice before big decisions. What does that look like financially?", options: ["Getting a second opinion before large or irreversible commitments", "Asking whoever is selling the product", "Deciding alone to avoid influence", "Following whatever is most popular"], correct: 0, feedback: { correct: "Right, and independence matters, advice from someone earning commission on the decision isn't counsel.", incorrect: "An independent second opinion. The seller's view isn't counsel, and 'popular' isn't advice." } } },
      { variantId: "bmx-pl-wc-tf", step: { type: "true-false", statement: "A financial adviser earning commission on the product they recommend has a conflict worth naming.", correct: true, feedback: { correct: "Right, and under the FAIS Code they must disclose it. The advice can still be sound, but you should know.", incorrect: "It's true, and disclosure is legally required in SA. Knowing the incentive helps you weigh the advice." } } },
      { variantId: "bmx-pl-wc-sc", step: { type: "scenario", question: "Ayesha is about to sign a 20-year policy she doesn't fully understand. What's wise?", options: ["Ask for the full cost and terms in writing, and get an independent opinion before signing", "Sign now and read it later", "Trust the adviser's summary", "Ask a friend who has the same policy"], correct: 0, feedback: { correct: "Right. A 20-year commitment survives a week of scrutiny, and if it doesn't, that tells you something.", incorrect: "Get it in writing and seek independent input. Anything that can't wait a week deserves suspicion." } } },
    ],
  },
];

// ── Work Ethic and Faithful Labour ──────────────────────────────────────────
const workSlots: QuestionSlot[] = [
  {
    slotId: "bible-money/work/whatever-you-do",
    conceptId: "biblical-work",
    variants: [
      { variantId: "bmx-wk-wd-mcq", step: { type: "mcq", question: "Colossians 3:23 says 'Work willingly at whatever you do, as though you were working for the Lord rather than for people.' What does it imply for ordinary jobs?", options: ["The quality of your work matters regardless of who's watching or what the job is", "Only ministry work counts spiritually", "You should work unpaid overtime indefinitely", "Career ambition is wrong"], correct: 0, feedback: { correct: "Right. It dignifies ordinary work. The cashier and the accountant are held to the same standard, and it isn't the manager's standard.", incorrect: "It elevates all honest work. The audience changes, not the job description." } } },
      { variantId: "bmx-wk-wd-tf", step: { type: "true-false", statement: "The Bible treats pursuing career advancement as spiritually problematic.", correct: false, feedback: { correct: "Right. Diligence and skill are commended throughout Proverbs. What's warned against is letting ambition displace everything else.", incorrect: "Advancement isn't condemned. Scripture commends skilled, diligent work. The caution is about what it costs you." } } },
      { variantId: "bmx-wk-wd-sc", step: { type: "scenario", question: "Thabo's manager rarely checks his work. How does Colossians 3:23 shape his approach?", options: ["He works to the same standard whether observed or not", "He can ease off when unobserved", "He should tell the manager to supervise more", "He should look for a job with more oversight"], correct: 0, feedback: { correct: "Right. That consistency is also, practically, what builds the reputation that gets promoted.", incorrect: "The standard doesn't move with the level of supervision. That's the point of the verse." } } },
    ],
  },
  {
    slotId: "bible-money/work/diligence-and-rest",
    conceptId: "biblical-work",
    variants: [
      { variantId: "bmx-wk-dr-sc", step: { type: "scenario", question: "A Christian employee is offered overtime that doubles her weekend income but costs her most of her rest and time with family. What's the balanced view?", options: ["Weigh it as a trade-off with a limit and an end date, not an automatic yes or no", "Always take extra income when offered", "Refuse all weekend work on principle", "Take it indefinitely, since providing comes first"], correct: 0, feedback: { correct: "Right. Scripture commends diligence <em>and</em> rest. A season of extra work for a specific goal is different from a permanent arrangement.", incorrect: "It isn't automatic either way. Both diligence and rest are commended, so the question is duration and purpose." } } },
      { variantId: "bmx-wk-dr-tf", step: { type: "true-false", statement: "Rest is treated in Scripture as a discipline rather than laziness.", correct: true, feedback: { correct: "Right. The Sabbath principle is built into the creation account. Rest is commanded, not merely permitted.", incorrect: "It's true. Rest is a rhythm Scripture builds in deliberately, distinct from the sluggard's avoidance of work." } } },
      { variantId: "bmx-wk-dr-mcq", step: { type: "mcq", question: "How does Proverbs describe the outcome of laziness compared with diligence?", options: ["The lazy person wants much and gets little; the diligent are satisfied", "Both end up the same", "Laziness leads to wealth through cleverness", "Diligence is condemned as self-reliance"], correct: 0, feedback: { correct: "Right, Proverbs 13:4 draws exactly that contrast between craving and achieving.", incorrect: "Proverbs consistently contrasts the sluggard's unmet wants with the diligent person's provision." } } },
    ],
  },
  {
    slotId: "bible-money/work/integrity-at-work",
    conceptId: "biblical-work",
    variants: [
      { variantId: "bmx-wk-iw-mcq", step: { type: "mcq", question: "Which everyday workplace behaviour most directly tests the 'as though for the Lord' standard?", options: ["Accurate timesheets and expense claims", "How much you earn", "Your job title", "The size of your team"], correct: 0, feedback: { correct: "Right. Small, unobserved accuracy is where the standard actually bites, and it's the same principle as Luke 16:10.", incorrect: "It's the small unobserved things: hours claimed, expenses submitted, work actually done." } } },
      { variantId: "bmx-wk-iw-tf", step: { type: "true-false", statement: "Luke 16:10 links faithfulness in small things to trustworthiness with much.", correct: true, feedback: { correct: "Right: 'If you are faithful in little things, you will be faithful in large ones.' Small habits scale.", incorrect: "It's true. Small-scale faithfulness is presented as the training ground for larger responsibility." } } },
      { variantId: "bmx-wk-iw-sc", step: { type: "scenario", question: "Priya's colleagues routinely inflate mileage claims by a few kilometres. What's the consistent response?", options: ["Claim accurately, even though it costs her a little and stands out", "Match the group so she isn't disadvantaged", "Report everyone immediately", "Claim nothing at all"], correct: 0, feedback: { correct: "Right. Accurate claims are the standard whether or not anyone else keeps it, and legitimate claims are still legitimate.", incorrect: "Claim what's true. The group's practice doesn't change the standard, and under-claiming isn't required either." } } },
    ],
  },
  {
    slotId: "bible-money/work/provision",
    conceptId: "biblical-work",
    variants: [
      { variantId: "bmx-wk-pv-mcq", step: { type: "mcq", question: "How does Scripture frame working to provide for your household?", options: ["As a serious responsibility, not an optional extra", "As spiritually inferior to full-time ministry", "As irrelevant to faith", "As something only men are called to"], correct: 0, feedback: { correct: "Right. 1 Timothy 5:8 speaks strongly about providing for one's own. Provision is treated as a genuine obligation.", incorrect: "It's treated as a real responsibility. Ordinary work that provides for a family is not a lesser calling." } } },
      { variantId: "bmx-wk-pv-tf", step: { type: "true-false", statement: "Building skills that increase your earning capacity is compatible with biblical stewardship.", correct: true, feedback: { correct: "Right. The parable of the talents commends increasing what you've been given rather than burying it.", incorrect: "It's true. Developing capacity is stewardship of what you've been given, not a lack of contentment." } } },
      { variantId: "bmx-wk-pv-sc", step: { type: "scenario", question: "Sipho can study part-time to qualify for better-paying work, but it will take two hard years. How might he think about it?", options: ["As stewardship of his capacity. A costly season with a clear purpose", "As greed he should resist", "As a distraction from faith", "As only worthwhile if it's easy"], correct: 0, feedback: { correct: "Right. A defined season with a defined purpose is different from an endless chase, and the increased capacity serves others too.", incorrect: "Developing his capacity is stewardship. The relevant question is the cost and the season, not whether it's permissible." } } },
    ],
  },
];

// ── Avoiding Surety (Co-signing Debt) ───────────────────────────────────────
const suretySlots: QuestionSlot[] = [
  {
    slotId: "bible-money/surety/proverbs-warning",
    conceptId: "surety-biblical",
    variants: [
      { variantId: "bmx-sr-pw-sc", step: { type: "scenario", question: "A close friend asks you to co-sign their car loan because their credit is poor. What does Proverbs teach about surety?", options: ["It warns against it repeatedly", "It commends it as generosity", "It's neutral on the question", "It requires it of family members"], correct: 0, feedback: { correct: "Right: 'Don't agree to guarantee another person's debt... if you can't pay it, even your bed will be snatched from under you.'", incorrect: "Proverbs warns against surety in strong terms, precisely because the guarantor bears the whole risk." } } },
      { variantId: "bmx-sr-pw-tf", step: { type: "true-false", statement: "Proverbs treats guaranteeing someone else's debt as a form of generosity to be encouraged.", correct: false, feedback: { correct: "Right. It distinguishes them sharply: giving is commended, guaranteeing is warned against, because a gift ends, a guarantee doesn't.", incorrect: "It warns against surety while commending outright generosity. They're different acts with very different risks." } } },
      { variantId: "bmx-sr-pw-mcq", step: { type: "mcq", question: "Why does Scripture treat surety differently from giving?", options: ["A gift is finished; a guarantee leaves an open-ended liability you don't control", "Giving is easier", "Surety is always dishonest", "Gifts are tax deductible"], correct: 0, feedback: { correct: "Right. With surety you carry the risk of someone else's future decisions, with no ability to change them.", incorrect: "It's the open-ended exposure. You take on a liability whose outcome depends entirely on another person." } } },
    ],
  },
  {
    slotId: "bible-money/surety/sa-law",
    conceptId: "surety-biblical",
    variants: [
      { variantId: "bmx-sr-sl-tf", step: { type: "true-false", statement: "In South Africa, co-signing a loan makes you jointly and severally liable for the full debt.", correct: true, feedback: { correct: "Right. The lender can pursue you for the entire amount without first exhausting the other borrower. That's what 'severally' means.", incorrect: "It's true. Joint and several liability means the whole debt can be claimed from you alone." } } },
      { variantId: "bmx-sr-sl-mcq", step: { type: "mcq", question: "If the person you co-signed for stops paying, what can the lender do?", options: ["Come to you for the full outstanding balance and list the default against your credit record", "Only claim half from you", "Cancel the debt", "Pursue you only after suing the other borrower"], correct: 0, feedback: { correct: "Right, and the default lands on your record too, which can block your own bond application years later.", incorrect: "The full balance, from you, directly. Your credit record takes the damage as well." } } },
      { variantId: "bmx-sr-sl-sc", step: { type: "scenario", question: "Nomsa co-signed her cousin's loan two years ago. He's now three months in arrears. What's her position?", options: ["She's liable for the arrears and the balance, and her credit record is already affected", "It's entirely his problem", "She can withdraw her signature", "The lender must wait for a court order first"], correct: 0, feedback: { correct: "Right, and you generally can't withdraw a suretyship unilaterally. The time to decide was before signing.", incorrect: "She's fully exposed. A guarantee can't usually be withdrawn once the credit has been advanced." } } },
    ],
  },
  {
    slotId: "bible-money/surety/wiser-help",
    conceptId: "surety-biblical",
    variants: [
      { variantId: "bmx-sr-wh-sc", step: { type: "scenario", question: "Your sibling needs R80 000 and asks you to co-sign. You don't have R80 000 to give. What's the wisest response?", options: ["Decline the surety, and offer whatever help you can actually afford to lose", "Co-sign. Family comes first", "Co-sign but ask them to sign a private agreement", "Lend them R80 000 you'd have to borrow"], correct: 0, feedback: { correct: "Right. Only guarantee what you could absorb losing. A smaller real gift protects both the money and the relationship.", incorrect: "Don't guarantee what you couldn't afford to pay. A private side-agreement gives you no protection against the lender." } } },
      { variantId: "bmx-sr-wh-mcq", step: { type: "mcq", question: "What's the practical test before agreeing to any guarantee?", options: ["Could you pay the full amount yourself, today", "Do you trust the person?", "Is the amount under R50 000?", "Does the lender seem reputable?"], correct: 0, feedback: { correct: "Right. Trust doesn't cover retrenchment, illness or divorce. The risk is circumstances, not character.", incorrect: "It's the affordability test, not the trust test. Good people default when circumstances change." } } },
      { variantId: "bmx-sr-wh-tf", step: { type: "true-false", statement: "Declining to co-sign but offering a smaller outright gift is often the more loving option.", correct: true, feedback: { correct: "Right. It protects the relationship from the debt, which is usually where these arrangements do their real damage.", incorrect: "It's true. Guarantees turn family relationships into creditor relationships when things go wrong." } } },
    ],
  },
  {
    slotId: "bible-money/surety/lending-family",
    conceptId: "surety-biblical",
    variants: [
      { variantId: "bmx-sr-lf-mcq", step: { type: "mcq", question: "What's the safest mindset when lending money to family?", options: ["Treat it as a gift you may never see again", "Charge interest to keep it businesslike", "Set a strict repayment schedule with penalties", "Lend more than asked so they can repay comfortably"], correct: 0, feedback: { correct: "Right. If you can afford to give it, the relationship survives non-repayment. If you can't, don't lend it.", incorrect: "Treat it as a gift. Interest and penalties between family usually damage the relationship faster than the debt does." } } },
      { variantId: "bmx-sr-lf-tf", step: { type: "true-false", statement: "Money lent within families is a common source of long-term relational damage.", correct: true, feedback: { correct: "Right, and black tax dynamics can make it harder still. Clarity upfront about what's a gift and what's a loan helps.", incorrect: "It's true and well documented. Unclear expectations are usually what does the damage." } } },
      { variantId: "bmx-sr-lf-sc", step: { type: "scenario", question: "Johan wants to help his brother without risking the relationship. What's a workable approach?", options: ["Give what he can afford outright, and say clearly that it's a gift", "Lend it with a formal contract", "Co-sign a loan instead", "Give nothing and explain nothing"], correct: 0, feedback: { correct: "Right. Saying 'this is a gift' removes the unspoken ledger that quietly poisons these arrangements.", incorrect: "An affordable outright gift, clearly named. Contracts and guarantees add legal risk to a relational problem." } } },
    ],
  },
];

// ── Tithing and Financial Blessing ──────────────────────────────────────────
const titheSlots: QuestionSlot[] = [
  {
    slotId: "bible-money/tithing/what-it-means",
    conceptId: "tithing",
    variants: [
      { variantId: "bmx-th-wm-mcq", step: { type: "mcq", question: "What does the word 'tithe' literally mean?", options: ["A tenth", "A gift", "An offering", "A sacrifice"], correct: 0, feedback: { correct: "Right. It appears before the Law, Abraham gives a tenth in Genesis 14, and is formalised later.", incorrect: "It means a tenth. The practice predates the Law and is formalised within it." } } },
      { variantId: "bmx-th-wm-tf", step: { type: "true-false", statement: "Tithing appears in Scripture before the Law was given to Moses.", correct: true, feedback: { correct: "Right. Abraham gives a tenth to Melchizedek in Genesis 14, and Jacob vows a tenth in Genesis 28.", incorrect: "It's true. The practice appears in Genesis, well before the Mosaic Law." } } },
      { variantId: "bmx-th-wm-sc", step: { type: "scenario", question: "Malachi 3:10 invites Israel to bring the whole tithe and test God's provision. How is that best read?", options: ["As an invitation to trust God's provision, not a formula for guaranteed wealth", "As a promise of financial return on every rand given", "As a rule only for farmers", "As irrelevant to modern believers"], correct: 0, feedback: { correct: "Right. The passage addresses withheld worship in a covenant community; reading it as an investment contract distorts it.", incorrect: "It's about trust and covenant faithfulness, not a guaranteed return. Prosperity readings overreach here." } } },
    ],
  },
  {
    slotId: "bible-money/tithing/gross-or-net",
    conceptId: "tithing",
    variants: [
      { variantId: "bmx-th-gn-tf", step: { type: "true-false", statement: "Tithing from your net (after-tax) salary is a valid approach.", correct: true, feedback: { correct: "Right. Scripture doesn't legislate gross versus net. Many give on what they actually receive, and the heart matters more than the base.", incorrect: "It's a valid approach. There's no biblical ruling on gross versus net; both are held in good conscience." } } },
      { variantId: "bmx-th-gn-mcq", step: { type: "mcq", question: "How should a believer decide between tithing on gross or net income?", options: ["Prayerfully and consistently", "Always gross, or it doesn't count", "Always net, since tax isn't yours", "Alternate each month"], correct: 0, feedback: { correct: "Right. Consistency and a settled conscience matter far more than the technical base.", incorrect: "Neither is prescribed. Decide, be consistent, and don't carry guilt about the arithmetic." } } },
      { variantId: "bmx-th-gn-sc", step: { type: "scenario", question: "Lerato feels persistent guilt that her giving isn't calculated 'correctly'. What's a helpful reframe?", options: ["2 Corinthians 9:7 emphasises a decided, cheerful heart over an exact formula", "She should give more until the guilt lifts", "She should stop giving until she's sure", "Guilt is the appropriate response"], correct: 0, feedback: { correct: "Right: 'You must each decide in your heart how much to give. And don't give reluctantly or in response to pressure.'", incorrect: "The emphasis is on a decided, willing heart. Guilt-driven giving is specifically what that passage addresses." } } },
    ],
  },
  {
    slotId: "bible-money/tithing/prosperity-caution",
    conceptId: "tithing",
    variants: [
      { variantId: "bmx-th-pc-tf", step: { type: "true-false", statement: "Scripture guarantees that everyone who tithes will become financially wealthy.", correct: false, feedback: { correct: "Right. Faithful people in Scripture experience both plenty and hardship, giving isn't presented as a mechanism for extracting wealth.", incorrect: "No such guarantee exists. Job, Paul and many others were faithful and not wealthy." } } },
      { variantId: "bmx-th-pc-mcq", step: { type: "mcq", question: "What's the concern with teaching that giving produces guaranteed financial return?", options: ["It turns giving into a transaction and burdens people who give and still struggle", "It encourages too much generosity", "It's unpopular", "It reduces church income"], correct: 0, feedback: { correct: "Right, and the harm lands hardest on the poorest, who are told their circumstances reflect insufficient faith.", incorrect: "It makes giving transactional and adds guilt for those whose circumstances don't improve." } } },
      { variantId: "bmx-th-pc-sc", step: { type: "scenario", question: "Sipho is told his finances would improve if he simply gave more, despite genuine hardship. How should he weigh that?", options: ["With caution. Scripture never conditions God's care on a payment", "By borrowing to give more", "By giving his emergency fund", "By giving and expecting a return within the month"], correct: 0, feedback: { correct: "Right. Generosity is commended; pressure to give beyond your means with a promised return is not the Bible's teaching.", incorrect: "Treat it cautiously. Borrowing or emptying a buffer to give isn't what generosity means in Scripture." } } },
    ],
  },
  {
    slotId: "bible-money/tithing/practical",
    conceptId: "tithing",
    variants: [
      { variantId: "bmx-th-pr-mcq", step: { type: "mcq", question: "What makes regular giving easiest to sustain?", options: ["Making it a planned, automated line in your budget", "Giving whatever is left at month-end", "Giving only when you feel moved", "Giving one large amount annually"], correct: 0, feedback: { correct: "Right. Planned giving happens; leftover giving mostly doesn't, because there's rarely anything left.", incorrect: "Plan and automate it. 'Whatever's left' is usually nothing, however sincere the intention." } } },
      { variantId: "bmx-th-pr-tf", step: { type: "true-false", statement: "Approved public benefit organisations can issue a section 18A certificate that makes a donation tax deductible in SA.", correct: true, feedback: { correct: "Right, subject to limits. It doesn't change the motive for giving, but it does mean more of your money reaches the cause.", incorrect: "It's true. Section 18A receipts from approved PBOs allow a deduction within prescribed limits." } } },
      { variantId: "bmx-th-pr-sc", step: { type: "scenario", question: "Ayesha wants to give 12% of a R40 000 income but feels stretched. What's a sensible first step?", options: ["Review the budget for what can be freed, and increase giving gradually toward the goal", "Give 12% immediately and hope it works", "Abandon the goal", "Borrow to make up the difference"], correct: 0, feedback: { correct: "Right. Stepping up as the budget allows is sustainable, and R4 800 a month has to come from somewhere real.", incorrect: "Free up the room first and increase gradually. Borrowing to give creates a debt problem, not generosity." } } },
    ],
  },
];

// ── Wealth and Eternity ─────────────────────────────────────────────────────
const eternitySlots: QuestionSlot[] = [
  {
    slotId: "bible-money/eternity/treasures",
    conceptId: "treasures-eternity",
    variants: [
      { variantId: "bmx-et-tr-mcq", step: { type: "mcq", question: "Matthew 6:19-21 contrasts treasure on earth with treasure in heaven. What's the central claim?", options: ["Where your treasure is, your heart follows", "Saving money is sinful", "Wealth should be destroyed", "Only the poor please God"], correct: 0, feedback: { correct: "Right. It's a statement about the direction of the heart, not a prohibition on saving or planning.", incorrect: "The claim is about the heart following the treasure. It isn't a ban on saving, Proverbs commends that." } } },
      { variantId: "bmx-et-tr-tf", step: { type: "true-false", statement: "Wealthy people in the Bible are always portrayed negatively.", correct: false, feedback: { correct: "Right. Abraham, Job, Lydia and Joseph of Arimathea were all wealthy and faithful. The warnings target the heart's grip, not the balance.", incorrect: "Several wealthy figures are portrayed positively. The consistent warning is about what wealth does to the heart." } } },
      { variantId: "bmx-et-tr-sc", step: { type: "scenario", question: "Thabo is building significant wealth and wonders whether that's spiritually risky. What's a fair answer?", options: ["The risk is real but it's about grip and generosity", "Yes. He should stop accumulating", "No. Wealth carries no spiritual risk", "Only if he tells people about it"], correct: 0, feedback: { correct: "Right. 1 Timothy 6:17-19 tells the rich not to trust in wealth and to be generous. It doesn't tell them to become poor.", incorrect: "The risk is real, but it's about trust and openhandedness rather than a threshold amount." } } },
    ],
  },
  {
    slotId: "bible-money/eternity/temporary",
    conceptId: "treasures-eternity",
    variants: [
      { variantId: "bmx-et-tm-mcq", step: { type: "mcq", question: "Why does Jesus describe earthly treasure as vulnerable?", options: ["Moths, rust and thieves. It decays or is taken, whatever you do", "Because money is inherently evil", "Because banks are unreliable", "Because inflation is a modern problem"], correct: 0, feedback: { correct: "Right. The imagery is about impermanence, which is an argument for holding it lightly, not for refusing to manage it.", incorrect: "It's about impermanence: decay and loss. Not a claim that money is evil." } } },
      { variantId: "bmx-et-tm-tf", step: { type: "true-false", statement: "Holding possessions lightly is compatible with managing them carefully.", correct: true, feedback: { correct: "Right. Stewardship means managing well what you don't ultimately own: care without grip.", incorrect: "It's true. Careful management and a loose grip are the same posture, not opposites." } } },
      { variantId: "bmx-et-tm-sc", step: { type: "scenario", question: "Nomsa's business fails and she loses most of her savings. How might this teaching help?", options: ["It locates her worth outside her balance sheet", "It means she shouldn't grieve the loss", "It suggests she did something wrong", "It means she shouldn't rebuild"], correct: 0, feedback: { correct: "Right. Grief is appropriate; the teaching offers a foundation that the loss can't reach.", incorrect: "It doesn't minimise the loss or assign blame. It offers an identity that isn't tied to the balance." } } },
    ],
  },
  {
    slotId: "bible-money/eternity/generous-rich",
    conceptId: "treasures-eternity",
    variants: [
      { variantId: "bmx-et-gr-mcq", step: { type: "mcq", question: "What does 1 Timothy 6 instruct those who are rich to do?", options: ["Not to be proud or trust in wealth, but to be generous and rich in good works", "To give away everything immediately", "To hide their wealth", "To stop working"], correct: 0, feedback: { correct: "Right. It's an instruction about posture and generosity, addressed to the rich as they are.", incorrect: "It addresses posture: humility, trust in God rather than money, and generosity, not liquidation." } } },
      { variantId: "bmx-et-gr-tf", step: { type: "true-false", statement: "Scripture assumes some believers will have wealth and gives them specific instructions.", correct: true, feedback: { correct: "Right, which is more useful than a blanket prohibition. It tells people what faithful wealth looks like.", incorrect: "It's true. The instructions to the rich in 1 Timothy 6 assume the category exists." } } },
      { variantId: "bmx-et-gr-sc", step: { type: "scenario", question: "Johan has more than he needs. What does this teaching suggest he do with the surplus?", options: ["Deploy it generously and deliberately rather than simply accumulating", "Spend it on himself", "Bury it for safety", "Feel guilty about it"], correct: 0, feedback: { correct: "Right. Being 'rich in good works' is an active instruction. Surplus is meant to be put to use, not merely stored or regretted.", incorrect: "Deploy it deliberately. Guilt and hoarding are both responses the passage moves past." } } },
    ],
  },
  {
    slotId: "bible-money/eternity/legacy",
    conceptId: "treasures-eternity",
    variants: [
      { variantId: "bmx-et-lg-mcq", step: { type: "mcq", question: "How does Proverbs treat leaving an inheritance?", options: ["Positively. A good person leaves an inheritance to their grandchildren", "As selfish accumulation", "As forbidden", "As irrelevant"], correct: 0, feedback: { correct: "Right, Proverbs 13:22. Long-term provision for family is treated as a mark of good character.", incorrect: "Proverbs 13:22 speaks well of it. Multi-generational provision is commended, not criticised." } } },
      { variantId: "bmx-et-lg-tf", step: { type: "true-false", statement: "Having a valid will is a practical expression of stewardship.", correct: true, feedback: { correct: "Right. Dying intestate in SA means the Intestate Succession Act decides, and the process is slower and costlier for your family.", incorrect: "It's true. A will is how your stewardship extends past your lifetime, without one, the law decides." } } },
      { variantId: "bmx-et-lg-sc", step: { type: "scenario", question: "Priya wants her giving to outlast her. What's a concrete step?", options: ["Name causes in her will alongside her family provisions", "Give everything away now", "Assume her family will honour her intentions", "Leave no instructions at all"], correct: 0, feedback: { correct: "Right. A will is the only instrument that carries intentions past death, assumptions don't survive an estate process.", incorrect: "Put it in the will. Unwritten intentions have no standing when the estate is wound up." } } },
    ],
  },
];

// ── Financial Integrity ─────────────────────────────────────────────────────
const integSlots: QuestionSlot[] = [
  {
    slotId: "bible-money/integrity/honest-scales",
    conceptId: "biblical-integrity",
    variants: [
      { variantId: "bmx-in-hs-mcq", step: { type: "mcq", question: "Proverbs 11:1 says 'The Lord detests the use of dishonest scales, but he delights in accurate weights.' What does that apply to today?", options: ["Honest pricing, accurate invoices and truthful declarations", "Only literal weighing equipment", "Bank interest rates", "Currency exchange"], correct: 0, feedback: { correct: "Right. Scales were the point of sale. The modern equivalent is every place you state a number someone relies on.", incorrect: "It's about honest measurement wherever money changes hands: invoices, quotes, tax returns, claims." } } },
      { variantId: "bmx-in-hs-tf", step: { type: "true-false", statement: "A Christian who inflates business expenses for a bigger tax deduction is acting consistently with biblical principles.", correct: false, feedback: { correct: "Right. That's a dishonest weight, and legally it's tax evasion, not planning.", incorrect: "Inflating expenses is dishonest measurement, and it's evasion. Legitimate deductions are a different matter entirely." } } },
      { variantId: "bmx-in-hs-sc", step: { type: "scenario", question: "Sipho can claim a genuine home-office deduction or inflate it slightly 'since everyone does'. What's the distinction?", options: ["Claiming what's true is planning; overstating it is evasion", "Both are fine if the amounts are small", "Neither should be claimed", "It depends whether SARS notices"], correct: 0, feedback: { correct: "Right. The line is accuracy, not size, and SARS can ask for proof years later.", incorrect: "Accuracy is the line. A true claim is legitimate; an inflated one is evasion regardless of amount." } } },
    ],
  },
  {
    slotId: "bible-money/integrity/small-things",
    conceptId: "biblical-integrity",
    variants: [
      { variantId: "bmx-in-st-sc", step: { type: "scenario", question: "Your employer overpays your salary by R3 000 through a payroll error. What's the integrity response?", options: ["Report it and arrange to return it", "Keep it: their mistake", "Wait to see if they notice", "Spend it and apologise later"], correct: 0, feedback: { correct: "Right. It isn't yours, and payroll will eventually reconcile it. Usually by deducting it when you've already spent it.", incorrect: "Report it. The money belongs to the employer whether or not they've noticed." } } },
      { variantId: "bmx-in-st-tf", step: { type: "true-false", statement: "Luke 16:10 suggests that how you handle small amounts predicts how you'll handle large ones.", correct: true, feedback: { correct: "Right: 'If you are faithful in little things, you will be faithful in large ones.' Character doesn't switch on at a threshold.", incorrect: "It's true. Small-scale faithfulness is presented as the training ground for larger trust." } } },
      { variantId: "bmx-in-st-mcq", step: { type: "mcq", question: "Why does Scripture put such weight on small financial decisions?", options: ["Habits formed in small things carry into large ones", "Small amounts are worth more than they seem", "Large decisions don't matter", "Small decisions are easier to judge"], correct: 0, feedback: { correct: "Right. Nobody becomes dishonest at R100 000. They arrive there through a series of R100 decisions.", incorrect: "It's about habit formation. The pattern established in small things is the one that shows up under pressure." } } },
    ],
  },
  {
    slotId: "bible-money/integrity/debts-paid",
    conceptId: "biblical-integrity",
    variants: [
      { variantId: "bmx-in-dp-mcq", step: { type: "mcq", question: "Psalm 37:21 contrasts the wicked who borrow and don't repay with the godly who are generous. What's the principle?", options: ["Repaying what you owe is a matter of integrity, not just contract", "Borrowing is always wrong", "Generosity replaces the need to repay", "Debts expire after a set time"], correct: 0, feedback: { correct: "Right. Repayment is framed as a character issue, and it sits alongside generosity rather than against it.", incorrect: "It's about honouring obligations. Borrowing isn't condemned; failing to repay is." } } },
      { variantId: "bmx-in-dp-tf", step: { type: "true-false", statement: "If you genuinely cannot pay a debt, communicating honestly with the creditor is the integrity path.", correct: true, feedback: { correct: "Right. Silence and avoidance make it worse; most creditors will restructure when contacted early.", incorrect: "It's true. Honest early communication is both practically better and consistent with integrity." } } },
      { variantId: "bmx-in-dp-sc", step: { type: "scenario", question: "Nomsa can't meet this month's instalment. What's the right first move?", options: ["Contact the creditor before the due date and propose an arrangement", "Ignore the calls until she can pay", "Take a new loan to cover it", "Cancel her debit order without telling them"], correct: 0, feedback: { correct: "Right. Contact before default preserves options; contact after default just negotiates over a worse record.", incorrect: "Call before the due date. Avoidance and new borrowing both make the position worse." } } },
    ],
  },
  {
    slotId: "bible-money/integrity/reputation",
    conceptId: "biblical-integrity",
    variants: [
      { variantId: "bmx-in-rp-mcq", step: { type: "mcq", question: "How does Proverbs 22:1 rank a good reputation against wealth?", options: ["A good name is more desirable than great riches", "Wealth matters more", "They're equally valuable", "Reputation is irrelevant"], correct: 0, feedback: { correct: "Right, and it's practical as well as moral. In business, a reputation for honesty is what brings people back.", incorrect: "Proverbs 22:1 puts a good name above great riches, and the commercial logic supports it." } } },
      { variantId: "bmx-in-rp-tf", step: { type: "true-false", statement: "In business, a reputation for honesty tends to be commercially valuable as well as right.", correct: true, feedback: { correct: "Right. Repeat business and referrals run on trust, which is why integrity compounds like any other asset.", incorrect: "It's true. Trust is what generates referrals and repeat custom over time." } } },
      { variantId: "bmx-in-rp-sc", step: { type: "scenario", question: "Johan can win a contract by overstating his company's capacity. What's the likely cost?", options: ["Under-delivery damages the relationship and the reputation that would have brought future work", "Nothing, if he works hard enough", "A small penalty at worst", "Only a legal risk"], correct: 0, feedback: { correct: "Right. The contract he wins by overstating is usually the one that costs him the next three.", incorrect: "The cost lands on future work. Reputation is the asset being spent to win the deal." } } },
    ],
  },
];

// ── Generosity as Kingdom Strategy ──────────────────────────────────────────
const genSlots: QuestionSlot[] = [
  {
    slotId: "bible-money/generosity/cheerful",
    conceptId: "biblical-generosity",
    variants: [
      { variantId: "bmx-gn-ch-mcq", step: { type: "mcq", question: "2 Corinthians 9:7 says God loves a giver who gives how?", options: ["Cheerfully, having decided in their own heart", "As much as possible", "Publicly", "Only through a church"], correct: 0, feedback: { correct: "Right: 'You must each decide in your heart how much to give. And don't give reluctantly or in response to pressure, for God loves a person who gives cheerfully.'", incorrect: "Cheerfully, from a decided heart, the passage explicitly rules out reluctance and pressure." } } },
      { variantId: "bmx-gn-ch-tf", step: { type: "true-false", statement: "Giving under pressure or out of guilt is the kind of giving 2 Corinthians 9:7 commends.", correct: false, feedback: { correct: "Right. It names reluctance and pressure specifically as what giving shouldn't be.", incorrect: "The verse rules that out. Decided, willing giving is what's commended." } } },
      { variantId: "bmx-gn-ch-sc", step: { type: "scenario", question: "Lerato feels manipulated by an emotional appeal at an event. How should she respond?", options: ["Decline in the moment and decide later", "Give immediately to avoid embarrassment", "Give a token to be polite", "Never give to that cause"], correct: 0, feedback: { correct: "Right. A decided heart takes time, and a genuine cause will still be there tomorrow.", incorrect: "Step back and decide separately. Pressure-driven giving is exactly what the passage cautions against." } } },
    ],
  },
  {
    slotId: "bible-money/generosity/beyond-money",
    conceptId: "biblical-generosity",
    variants: [
      { variantId: "bmx-gn-bm-tf", step: { type: "true-false", statement: "Biblical generosity is only about money given to a church.", correct: false, feedback: { correct: "Right. Time, skills, hospitality and advocacy all count, and Proverbs 19:17 speaks of kindness to the poor as lending to the Lord.", incorrect: "It's much broader: time, skills, hospitality and practical help are all treated as generosity." } } },
      { variantId: "bmx-gn-bm-mcq", step: { type: "mcq", question: "For someone with little spare cash, what forms of generosity remain available?", options: ["Time, skills, hospitality and practical help", "None. Generosity requires money", "Only prayer", "Borrowing in order to give"], correct: 0, feedback: { correct: "Right, and skilled help is often worth more than a small cash gift. A free CV review can change someone's year.", incorrect: "Time and skill are real generosity. Borrowing to give isn't generosity, it's a debt problem." } } },
      { variantId: "bmx-gn-bm-sc", step: { type: "scenario", question: "Thabo is an accountant with a tight budget but useful skills. Where's his highest-value generosity?", options: ["Offering financial help to people who could never afford an accountant", "Giving small cash amounts", "Waiting until he earns more", "Nothing until his own finances are perfect"], correct: 0, feedback: { correct: "Right. His hour of expertise is worth far more to them than the rands he could spare.", incorrect: "His skill is the asset. Waiting for perfect finances usually means waiting indefinitely." } } },
    ],
  },
  {
    slotId: "bible-money/generosity/refreshed",
    conceptId: "biblical-generosity",
    variants: [
      { variantId: "bmx-gn-rf-mcq", step: { type: "mcq", question: "Proverbs 11:24-25 observes that giving freely can lead to gaining more, while withholding leads to poverty. How is that best understood?", options: ["As wisdom about the openhanded life, not a mechanical guarantee of returns", "As a promise of financial return on every gift", "As a prohibition on saving", "As a description of business strategy only"], correct: 0, feedback: { correct: "Right: 'The generous will prosper; those who refresh others will themselves be refreshed.' Proverbs describes how life generally runs, not a contract.", incorrect: "Proverbs speaks in general wisdom, not guarantees. Reading it as a formula for returns misuses the genre." } } },
      { variantId: "bmx-gn-rf-tf", step: { type: "true-false", statement: "Generosity tends to build relationships and community that have real long-term value.", correct: true, feedback: { correct: "Right. Generous people tend to be surrounded by people who show up when things go wrong, which is worth something real.", incorrect: "It's true, and it's part of what the Proverbs describe: openhandedness builds the community that sustains you." } } },
      { variantId: "bmx-gn-rf-sc", step: { type: "scenario", question: "Ayesha worries that giving will leave her short. What's a balanced approach?", options: ["Plan giving into the budget at a level she can sustain", "Give nothing until she's wealthy", "Give whatever is left over", "Give beyond her means and trust it works out"], correct: 0, feedback: { correct: "Right. A sustainable planned amount beats both extremes, and it can rise as her circumstances do.", incorrect: "Plan a sustainable amount. Leftovers rarely exist, and giving beyond your means creates a new problem." } } },
    ],
  },
  {
    slotId: "bible-money/generosity/where-to-give",
    conceptId: "biblical-generosity",
    variants: [
      { variantId: "bmx-gn-wg-mcq", step: { type: "mcq", question: "What's worth checking before giving significant amounts to an organisation?", options: ["That it's registered, financially accountable and doing what it claims", "Only that it feels worthy", "Whether it has a large social media following", "Whether friends give to it"], correct: 0, feedback: { correct: "Right. Stewardship applies to giving too. Money given carelessly can do less good than money not given at all.", incorrect: "Verify registration and accountability. Good intentions don't guarantee good use of funds." } } },
      { variantId: "bmx-gn-wg-tf", step: { type: "true-false", statement: "Applying diligence to where you give is consistent with generous giving.", correct: true, feedback: { correct: "Right. Checking that the money does what you intend is part of giving well, not a lack of trust.", incorrect: "It's true. Diligence and generosity go together, careless giving isn't more spiritual." } } },
      { variantId: "bmx-gn-wg-sc", step: { type: "scenario", question: "Sipho wants his giving to have real impact locally. What's a practical approach?", options: ["Give consistently to one or two causes he can see and verify", "Spread small amounts across dozens of appeals", "Give only to the largest organisations", "Give anonymously to strangers online"], correct: 0, feedback: { correct: "Right. Concentrated, sustained giving to something you can actually see usually achieves more than scattered once-off amounts.", incorrect: "Focus and consistency. Scattered small gifts are harder to verify and generally achieve less." } } },
    ],
  },
];

export const BIBLE_MONEY_EXTRA_BANKS: Record<string, LessonBank> = {
  "bible-money::lesson-contentment": {
    layout: L(contSlots, "The Most Counter-Cultural Principle", "<p>Paul writes in Philippians 4:11 that he has <em>'learned how to be content with whatever I have'</em>: learned, meaning practised, through plenty and through need. Contentment governs your peace, not your ambition: Proverbs commends planning, saving and diligent work. What Scripture warns against is the appetite that never says 'enough', and 1 Timothy 6:10 locates the problem in the <strong>love</strong> of money, not money itself.</p>"),
    slots: contSlots,
  },
  "bible-money::lesson-planning-proverbs": {
    layout: L(planSlots, "Wisdom for Preparation", "<p><em>'Do your planning and prepare your fields before building your house'</em> (Proverbs 24:27), secure what produces income before committing to what consumes it. Proverbs 21:5 favours careful planning over hasty shortcuts, and 13:11 contrasts quick money that disappears with wealth gathered little by little. Proverbs 27:23 urges knowing the condition of your flocks: the ancient version of actually looking at your accounts.</p>"),
    slots: planSlots,
  },
  "bible-money::lesson-work-ethic": {
    layout: L(workSlots, "Faithful Labour", "<p><em>'Work willingly at whatever you do, as though you were working for the Lord rather than for people'</em> (Colossians 3:23). That dignifies ordinary work and sets a standard that doesn't move with the level of supervision. Diligence and rest are both commended, and Luke 16:10 ties faithfulness in small things (accurate timesheets, honest expense claims) to trustworthiness with much.</p>"),
    slots: workSlots,
  },
  "bible-money::lesson-avoiding-surety": {
    layout: L(suretySlots, "Don't Guarantee Another's Debt", "<p><em>'Don't agree to guarantee another person's debt.. if you can't pay it, even your bed will be snatched from under you'</em> (Proverbs 22:26-27). In South African law, co-signing makes you <strong>jointly and severally liable</strong> for the whole debt. The lender can pursue you directly and the default lands on your credit record. The test before any guarantee: could you pay the full amount yourself today without harm?</p>"),
    slots: suretySlots,
  },
  "bible-money::lesson-tithing": {
    layout: L(titheSlots, "Tithing and Blessing", "<p><strong>Tithe</strong> means a tenth. The practice predates the Law, Abraham gives a tenth in Genesis 14, and Malachi 3:10 invites Israel to bring the whole tithe and test God's provision. Scripture doesn't legislate gross versus net, and 2 Corinthians 9:7 puts the weight on a decided, cheerful heart rather than a formula. It never promises that giving guarantees wealth, and teaching that it does burdens exactly the people least able to carry it.</p>"),
    slots: titheSlots,
  },
  "bible-money::lesson-wealth-eternity": {
    layout: L(eternitySlots, "Treasure and the Heart", "<p>Matthew 6:19-21 contrasts treasure that decays with treasure that lasts, and lands on the claim that <strong>your heart follows your treasure</strong>. It isn't a ban on saving, Proverbs commends that, and Proverbs 13:22 speaks well of leaving an inheritance. Abraham, Job and Lydia were wealthy and faithful. 1 Timothy 6:17-19 tells the rich not to trust in wealth and to be <em>rich in good works</em>: a posture, not a threshold.</p>"),
    slots: eternitySlots,
  },
  "bible-money::lesson-financial-integrity": {
    layout: L(integSlots, "Honest Scales", "<p><em>'The Lord detests the use of dishonest scales, but he delights in accurate weights'</em> (Proverbs 11:1). Scales were the point of sale, so the modern equivalent is every number someone relies on: invoices, quotes, tax returns, claims. Luke 16:10 ties small faithfulness to large. Psalm 37:21 frames repaying what you owe as character, and Proverbs 22:1 ranks a good name above great riches.</p>"),
    slots: integSlots,
  },
  "bible-money::lesson-generosity-kingdom": {
    layout: L(genSlots, "Generosity as Strategy", "<p><em>'You must each decide in your heart how much to give. And don't give reluctantly or in response to pressure, for God loves a person who gives cheerfully'</em> (2 Corinthians 9:7). Generosity reaches well beyond money. Time, skills and hospitality all count, and Proverbs 19:17 treats kindness to the poor as lending to the Lord. Proverbs 11:24-25 describes the openhanded life as one that ends up refreshed: wisdom, not a guaranteed return.</p>"),
    slots: genSlots,
  },
};
