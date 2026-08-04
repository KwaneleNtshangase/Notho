import type { LessonLayoutItem, QuestionSlot } from "@/data/content";
import type { LessonBank } from "./money-basics";

/**
 * Premium banks for the SA Investing EXTRA lessons (asset allocation, rebalancing).
 * Figures per docs/SA-REGULATORY-FIGURES.md: CGT 40% inclusion with a R50 000
 * annual exclusion; Regulation 28 offshore limit 45% for retirement funds;
 * TFSA R46 000/yr and R500 000 lifetime.
 * variantId prefix: `sax-`.
 */
const info = (title: string, content: string): LessonLayoutItem => ({ type: "info", title, content });
const L = (slots: QuestionSlot[], title: string, content: string): LessonLayoutItem[] => [
  info(title, content),
  ...slots.map((s) => ({ slot: s.slotId })),
];

// ── Asset Allocation ────────────────────────────────────────────────────────
const aaSlots: QuestionSlot[] = [
  {
    slotId: "sa-investing/allocation/what-it-is",
    conceptId: "asset-allocation",
    variants: [
      { variantId: "sax-aa-wi-mcq", step: { type: "mcq", question: "What does asset allocation mean?", options: ["How you split your money between equities, bonds, property and cash", "Which individual shares you pick", "When you buy and sell", "Which platform you use"], correct: 0, feedback: { correct: "Right, and it drives most of the variation in a portfolio's returns, far more than which particular shares you own.", incorrect: "It's the split across asset classes, not the choice of individual holdings within them." } } },
      { variantId: "sax-aa-wi-tf", step: { type: "true-false", statement: "Which shares you pick matters more to long-run returns than how you split between asset classes.", correct: false, feedback: { correct: "Right. The equity-versus-bond decision does the heavy lifting; stock selection explains far less than most people assume.", incorrect: "Allocation dominates. Getting the asset-class split right matters more than picking winners inside it." } } },
      { variantId: "sax-aa-wi-sc", step: { type: "scenario", question: "Two investors both hold 'SA equities'. One is 100% equities, the other 40% equities and 60% bonds. In a 30% market fall, what happens?", options: ["The first falls roughly 30%, the second roughly 12%", "Both fall about the same", "The second falls more because bonds are risky", "Neither is affected"], correct: 0, feedback: { correct: "Right. Same asset class, completely different experience, because the mix, not the holdings, set the risk.", incorrect: "Allocation determined it: 100% equities takes the full fall, a 40/60 mix takes far less." } } },
    ],
  },
  {
    slotId: "sa-investing/allocation/time-horizon",
    conceptId: "time-horizon",
    variants: [
      { variantId: "sax-aa-th-mcq", step: { type: "mcq", question: "What should mainly drive how much equity you hold?", options: ["How long until you need the money, and how much volatility you can actually tolerate", "Last year's best-performing asset class", "What your colleagues are buying", "The size of your account"], correct: 0, feedback: { correct: "Right. A long horizon lets you ride out falls; a short one doesn't, whatever the long-run averages say.", incorrect: "Time horizon and genuine risk tolerance. Chasing last year's winner is the opposite of an allocation decision." } } },
      { variantId: "sax-aa-th-tf", step: { type: "true-false", statement: "Money you need within two years generally shouldn't sit in equities.", correct: true, feedback: { correct: "Right. Two years isn't enough time to recover from a serious fall, cash or short-dated income assets fit better.", incorrect: "It's true. Short horizons and equity volatility don't mix, however good the long-run case is." } } },
      { variantId: "sax-aa-th-sc", step: { type: "scenario", question: "Ayesha is 30 with a retirement fund she won't touch for 30 years, and a house deposit she needs in 18 months. How should the two be invested?", options: ["Retirement mostly equities; deposit in cash or income assets", "Both mostly equities for growth", "Both in cash for safety", "Both in property"], correct: 0, feedback: { correct: "Right. Two goals, two horizons, two allocations. The same person can hold very different risk in different pots.", incorrect: "Match each pot to its horizon. One allocation for both goals is wrong for at least one of them." } } },
    ],
  },
  {
    slotId: "sa-investing/allocation/local-vs-offshore",
    conceptId: "offshore-allocation",
    variants: [
      { variantId: "sax-aa-lo-mcq", step: { type: "mcq", question: "Why do most SA investors hold meaningful offshore exposure?", options: ["The JSE is a small share of global markets, and it diversifies rand and single-economy risk", "Offshore assets always return more", "SA investments are unregulated", "It avoids all tax"], correct: 0, feedback: { correct: "Right. Your job, your home and your currency are already South African, offshore assets spread that concentration.", incorrect: "It's diversification, not guaranteed higher returns. Your income and property are already fully exposed to SA." } } },
      { variantId: "sax-aa-lo-tf", step: { type: "true-false", statement: "Regulation 28 limits how much of a South African retirement fund may be invested offshore.", correct: true, feedback: { correct: "Right. The offshore limit is 45%. It applies to retirement funds, not to your discretionary investments.", incorrect: "It's true. Reg 28 caps retirement-fund offshore exposure at 45%; discretionary money is unrestricted." } } },
      { variantId: "sax-aa-lo-sc", step: { type: "scenario", question: "Johan holds 100% SA assets and earns a rand salary. What's the concern?", options: ["Everything he owns and earns depends on one economy and one currency", "SA assets are inherently poor investments", "He'll pay more tax", "He can't access his money"], correct: 0, feedback: { correct: "Right. It's concentration risk: a bad decade for SA hits his salary, his property and his portfolio at once.", incorrect: "The issue is concentration, not quality. Offshore exposure spreads the risk his income already carries." } } },
    ],
  },
  {
    slotId: "sa-investing/allocation/starter-portfolio",
    conceptId: "asset-allocation",
    variants: [
      { variantId: "sax-aa-sp-mcq", step: { type: "mcq", question: "What does a sensible starter portfolio usually look like?", options: ["A few low-cost index funds covering local and global equities, plus income assets sized to your horizon", "Fifteen funds for maximum diversification", "One high-conviction share", "Whatever a friend recommends"], correct: 0, feedback: { correct: "Right. Two or three well-chosen funds cover most of what diversification can do; more funds usually adds cost and overlap, not safety.", incorrect: "Simple and broad. Fifteen funds mostly duplicate each other while multiplying fees." } } },
      { variantId: "sax-aa-sp-tf", step: { type: "true-false", statement: "Holding more funds automatically means better diversification.", correct: false, feedback: { correct: "Right. Five global equity funds hold largely the same companies. That's duplication with extra fees, not diversification.", incorrect: "Overlapping funds don't diversify. What matters is exposure to different asset classes and regions." } } },
      { variantId: "sax-aa-sp-sc", step: { type: "scenario", question: "Nomsa has eight funds and can't explain what any of them do. Reasonable first step?", options: ["Map what each one holds", "Add a ninth for balance", "Sell everything into cash", "Keep them and hope for the best"], correct: 0, feedback: { correct: "Right. Understanding the overlap usually reveals she owns the same thing three times while paying three fees.", incorrect: "Map, then simplify. A portfolio you can't explain is one you can't manage or defend in a downturn." } } },
    ],
  },
];

// ── Rebalancing ─────────────────────────────────────────────────────────────
const rbSlots: QuestionSlot[] = [
  {
    slotId: "sa-investing/rebalance/why-drift",
    conceptId: "rebalancing",
    variants: [
      { variantId: "sax-rb-wd-sc", step: { type: "scenario", question: "Your target is 70% equities and 30% bonds. After a strong equity year you're at 80/20. What should you do?", options: ["Sell some equities or direct new money to bonds until you're back at 70/30", "Leave it. The winners are working", "Sell all your bonds", "Move everything to cash"], correct: 0, feedback: { correct: "Right. Drift means you're now carrying more risk than you chose. Rebalancing is how you take some of that back off the table.", incorrect: "Rebalance back to target. Letting winners run quietly raises your risk beyond what you decided you could tolerate." } } },
      { variantId: "sax-rb-wd-mcq", step: { type: "mcq", question: "Why does a portfolio drift away from its target allocation?", options: ["Assets grow at different rates", "Fees change the weightings", "The platform rebalances randomly", "Inflation alters the percentages"], correct: 0, feedback: { correct: "Right. Uneven growth is the mechanism, which is why drift always runs toward whatever has recently done best.", incorrect: "It's differential growth. The best performer becomes an ever-larger share until you correct it." } } },
      { variantId: "sax-rb-wd-tf", step: { type: "true-false", statement: "A portfolio that has drifted to a higher equity weighting is riskier than the one you originally chose.", correct: true, feedback: { correct: "Right, and you'd discover exactly how much riskier in the next downturn.", incorrect: "It's true. More equity means bigger swings than the allocation you signed up for." } } },
    ],
  },
  {
    slotId: "sa-investing/rebalance/how-often",
    conceptId: "rebalancing",
    variants: [
      { variantId: "sax-rb-ho-mcq", step: { type: "mcq", question: "How often should most investors rebalance?", options: ["Annually, or when an asset class drifts more than about five percentage points from target", "Weekly", "Every time markets move", "Never"], correct: 0, feedback: { correct: "Right. Rebalancing too often adds cost and tax without improving outcomes; never rebalancing lets risk creep up unchecked.", incorrect: "Annually or on a drift threshold. More frequent trading costs money without adding value." } } },
      { variantId: "sax-rb-ho-tf", step: { type: "true-false", statement: "Rebalancing more frequently produces better returns.", correct: false, feedback: { correct: "Right. Beyond an annual or threshold-based approach, extra trading just adds costs and potential tax.", incorrect: "It doesn't. Frequent rebalancing raises costs and tax while adding little benefit." } } },
      { variantId: "sax-rb-ho-sc", step: { type: "scenario", question: "Sipho checks his portfolio daily and feels the urge to adjust it constantly. What would help?", options: ["A written rule", "Checking more often to stay informed", "Switching to whatever's performing best", "Selling whenever anything falls"], correct: 0, feedback: { correct: "Right. A written rule removes the emotion, which is what daily checking amplifies.", incorrect: "Set a rule and follow it. Frequent checking increases the urge to act, and acting is usually the expensive part." } } },
    ],
  },
  {
    slotId: "sa-investing/rebalance/tax-smart",
    conceptId: "rebalancing",
    variants: [
      { variantId: "sax-rb-ts-tf", step: { type: "true-false", statement: "Selling an ETF that has risen significantly to rebalance always triggers an immediate capital gains tax bill.", correct: false, feedback: { correct: "Right. Inside a TFSA or retirement fund there's no CGT at all, and in a taxable account the annual R50 000 exclusion often covers a modest gain.", incorrect: "Not always. TFSAs and retirement funds are CGT-free, and the R50 000 annual exclusion covers many small rebalances." } } },
      { variantId: "sax-rb-ts-mcq", step: { type: "mcq", question: "What's the most tax-efficient way to rebalance a taxable portfolio?", options: ["Direct new contributions to the underweight asset instead of selling the overweight one", "Sell everything and rebuild", "Rebalance monthly to keep gains small", "Never rebalance"], correct: 0, feedback: { correct: "Right. Buying your way back to target avoids realising gains entirely. The cheapest rebalancing there is.", incorrect: "Use new money first. Selling realises gains; contributing doesn't." } } },
      { variantId: "sax-rb-ts-sc", step: { type: "scenario", question: "Priya needs to rebalance and holds the same funds in both a TFSA and a taxable account. Where should she trade?", options: ["Inside the TFSA, where there's no capital gains tax", "In the taxable account, to use the exclusion", "Split the trades evenly", "Neither. She should stop contributing"], correct: 0, feedback: { correct: "Right. Do the selling where it's tax-free and leave the taxable holdings undisturbed.", incorrect: "Trade inside the tax-free wrapper. Selling in the taxable account realises gains unnecessarily." } } },
    ],
  },
  {
    slotId: "sa-investing/rebalance/discipline",
    conceptId: "rebalancing",
    variants: [
      { variantId: "sax-rb-di-mcq", step: { type: "mcq", question: "Why does rebalancing feel uncomfortable?", options: ["It means selling what's done well and buying what hasn't", "It always loses money", "It's expensive", "It requires daily attention"], correct: 0, feedback: { correct: "Right, and that discomfort is the point. It's a rule that makes you sell high and buy low when instinct says the opposite.", incorrect: "It runs against instinct: trimming winners to top up laggards. That's exactly why it works as a rule." } } },
      { variantId: "sax-rb-di-tf", step: { type: "true-false", statement: "Rebalancing is mainly a risk-control tool rather than a way to boost returns.", correct: true, feedback: { correct: "Right. It keeps your risk where you intended; any return benefit is a side effect.", incorrect: "It's true. The purpose is holding risk steady, not maximising performance." } } },
      { variantId: "sax-rb-di-sc", step: { type: "scenario", question: "Equities have fallen hard and Thabo's rule says buy more to return to target. He's nervous. What's the honest framing?", options: ["The rule exists precisely for moments like this, when instinct is least reliable", "He should abandon the rule and wait", "He should sell equities instead", "He should switch to cash until things settle"], correct: 0, feedback: { correct: "Right. Rules are written in calm moments to govern the frightening ones. That's their whole function.", incorrect: "Follow the rule. Abandoning it in a downturn means selling low, which is the mistake rebalancing prevents." } } },
    ],
  },
];

export const SA_INVESTING_EXTRA_BANKS: Record<string, LessonBank> = {
  "sa-investing::lesson-asset-allocation": {
    layout: L(aaSlots, "The Decision That Matters Most", "<p><strong>Asset allocation</strong> (how you split between equities, bonds, property and cash) drives most of the variation in your returns, far more than which shares you pick. Let your <strong>time horizon</strong> set it: long money can carry equity volatility, money needed within two years can't. Most SA investors hold meaningful offshore exposure because their salary, home and currency are already fully local. <strong>Regulation 28</strong> caps retirement-fund offshore exposure at 45%.</p>"),
    slots: aaSlots,
  },
  "sa-investing::lesson-rebalancing": {
    layout: L(rbSlots, "Why Portfolios Drift", "<p>Assets grow at different rates, so a 70/30 portfolio quietly becomes 80/20 after a strong equity year, carrying more risk than you chose. Rebalance <strong>annually, or when an asset class drifts about five percentage points</strong> from target. The cheapest method is directing <strong>new contributions</strong> to the underweight asset instead of selling. Where you must sell, do it inside a TFSA or retirement fund, where there's no CGT.</p>"),
    slots: rbSlots,
  },
};
