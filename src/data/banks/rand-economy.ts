import type { LessonLayoutItem, QuestionSlot } from "@/data/content";
import type { LessonBank } from "./money-basics";

/**
 * Bank for "The Rand & Your Money" (core lesson: Why the Rand Weakens).
 *
 * Exchange rates in examples are ILLUSTRATIVE (e.g. R18→R20/$), never claimed as
 * the current spot. Drivers taught are durable ones: US–SA rate differentials
 * and capital flight, load shedding / growth shocks, the current-account (trade)
 * deficit, and global risk-off sentiment. NOTE: SA exited the FATF greylist on
 * 24 Oct 2025, so greylisting is treated as a past episode, not a current driver.
 */

// ═══════════════════════════════════════════════════════════════════════════
// Lesson · "Why the Rand Weakens"  (rand-economy::why-rand-weakens)
// ═══════════════════════════════════════════════════════════════════════════

const whyWeakensSlots: QuestionSlot[] = [
  {
    slotId: "rand-economy/why-rand-weakens/drivers",
    conceptId: "rand-drivers",
    variants: [
      {
        variantId: "rnd-drv-mcq",
        step: {
          type: "mcq",
          question: "The US Federal Reserve raises interest rates sharply. What typically happens to the rand?",
          options: [
            "It weakens: capital flows to the US dollar for better yields",
            "It strengthens. US growth is good for SA trade",
            "No effect. Exchange rates are independent of rates",
            "It strengthens, investors seek diversification",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Higher US rates pull global money into dollar assets. Capital leaves SA, rand demand drops, the rand weakens.",
            incorrect: "Rising US rates make dollar assets more attractive. Money exits SA (capital flight), so the rand weakens.",
          },
        },
      },
      {
        variantId: "rnd-drv-tf",
        step: {
          type: "true-false",
          statement: "When global investors turn nervous ('risk-off'), they tend to sell emerging-market currencies like the rand.",
          correct: true,
          feedback: {
            correct: "Right. In risk-off moments investors flee to 'safe' assets like the dollar, the rand often weakens even if nothing changed in SA.",
            incorrect: "They do. Risk-off means selling 'risky' currencies like the rand and buying the dollar, which weakens the rand.",
          },
        },
      },
      {
        variantId: "rnd-drv-mcq2",
        step: {
          type: "mcq",
          question: "Which of these is a driver of rand WEAKNESS?",
          options: [
            "Severe load shedding denting SA's growth forecasts",
            "A large trade surplus",
            "Rising foreign investor confidence in SA",
            "Falling US interest rates on their own",
          ],
          correct: 0,
          feedback: {
            correct: "Right. When load shedding is severe it cuts growth and scares off investors. Capital leaves and the rand weakens.",
            incorrect: "Growth shocks like severe load shedding weaken the rand. The other three would tend to support it, not weaken it.",
          },
        },
      },
    ],
  },
  {
    slotId: "rand-economy/why-rand-weakens/budget-impact",
    conceptId: "exchange-rate",
    variants: [
      {
        variantId: "rnd-bud-mcq",
        step: {
          type: "mcq",
          question: "The rand weakens from R18/$ to R20/$. What happens to imported goods like petrol and electronics?",
          options: ["They get more expensive", "They get cheaper", "They stay the same", "Only luxury goods change"],
          correct: 0,
          feedback: {
            correct: "Right. You need more rands to buy the same dollar amount, so imports cost more, which pushes inflation up.",
            incorrect: "A weaker rand means imports cost more rands. Petrol (priced in dollars), electronics and imported food all get pricier.",
          },
        },
      },
      {
        variantId: "rnd-bud-tf",
        step: {
          type: "true-false",
          statement: "A weaker rand is always bad for every South African.",
          correct: false,
          feedback: {
            correct: "Correct. It hurts importers and consumers, but helps exporters. Miners earn dollars and pay costs in rand, so a weak rand lifts their rand income.",
            incorrect: "Not always. Exporters (mining, agriculture, tourism) earn foreign currency, so a weaker rand actually boosts their rand earnings.",
          },
        },
      },
      {
        variantId: "rnd-bud-sc",
        step: {
          type: "scenario",
          question: "The rand weakens sharply against the dollar. Who tends to BENEFIT?",
          options: [
            "Exporters like miners, who earn dollars but pay costs in rand",
            "Consumers filling up with petrol",
            "Importers of electronics",
            "Travellers heading overseas",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Earning in dollars and spending in rand means a weaker rand increases their rand revenue.",
            incorrect: "Exporters benefit. They earn dollars and pay costs in rand. Importers, consumers and overseas travellers all pay more.",
          },
        },
      },
    ],
  },
  {
    slotId: "rand-economy/why-rand-weakens/hedge-math",
    conceptId: "rand-hedge",
    variants: [
      {
        variantId: "rnd-hm-sc",
        step: {
          type: "scenario",
          question: "You put R100 000 in a global equity ETF when the rand is R18/$. The rand weakens to R20/$ and the shares themselves don't move. Your investment in rand is now about:",
          options: ["R111 000", "R100 000", "R90 000", "R80 000"],
          correct: 0,
          feedback: {
            correct: "Right: R100 000 ÷ R18 = $5 556; at R20/$ that's about R111 000: roughly an 11% gain from the currency move alone.",
            incorrect: "R100 000 ÷ R18 = $5 556. At R20/$, $5 556 × R20 ≈ R111 000. The weaker rand lifted the rand value ~11%.",
          },
        },
      },
      {
        variantId: "rnd-hm-tf",
        step: {
          type: "true-false",
          statement: "Offshore assets tend to rise in RAND terms when the rand weakens, even if their foreign price is unchanged.",
          correct: true,
          feedback: {
            correct: "Right. They're priced in foreign currency, which now buys more rands, so the rand value goes up on the currency move alone.",
            incorrect: "They do. Priced in dollars, an offshore asset is worth more rands when the rand weakens, even with a flat foreign price.",
          },
        },
      },
      {
        variantId: "rnd-hm-mcq",
        step: {
          type: "mcq",
          question: "Why does a global ETF gain in rand terms when the rand weakens?",
          options: [
            "It's priced in foreign currency",
            "It automatically pays a bigger dividend",
            "SA shares always rise at the same time",
            "Its returns are guaranteed by the ETF provider",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The foreign price can stay flat, but each unit of foreign currency converts to more rands, so the rand value rises.",
            incorrect: "It's the currency effect: the asset is in foreign currency, which converts to more rands when the rand weakens.",
          },
        },
      },
    ],
  },
  {
    slotId: "rand-economy/why-rand-weakens/best-hedge",
    conceptId: "rand-hedge",
    variants: [
      {
        variantId: "rnd-bh-mcq",
        step: {
          type: "mcq",
          question: "Which gives an ordinary investor the best protection against rand depreciation?",
          options: [
            "A global (offshore) equity ETF",
            "An SA bank fixed deposit",
            "RSA Retail Savings Bonds",
            "SA listed property",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A global ETF holds foreign-currency assets, so it gains in rand when the rand falls, the most accessible hedge.",
            incorrect: "A global ETF gives currency exposure. Fixed deposits, RSA bonds and SA property are all rand-denominated, no currency protection.",
          },
        },
      },
      {
        variantId: "rnd-bh-tf",
        step: {
          type: "true-false",
          statement: "An SA bank fixed deposit protects you from the rand losing value against the dollar.",
          correct: false,
          feedback: {
            correct: "Correct. A fixed deposit is fully rand-denominated. It earns interest but gives no protection if the rand weakens.",
            incorrect: "It doesn't. A rand fixed deposit has no currency exposure, so it can't hedge the rand weakening against the dollar.",
          },
        },
      },
      {
        variantId: "rnd-bh-sc",
        step: {
          type: "scenario",
          question: "Lerato worries the rand will keep weakening over the years. The most accessible way to hedge is to:",
          options: [
            "Hold some global equities via an offshore ETF",
            "Keep everything in a rand savings account",
            "Buy only SA government bonds",
            "Hold more cash at home",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Some offshore exposure means part of her wealth gains in rand when the rand falls: a practical long-term hedge.",
            incorrect: "A global ETF is the accessible hedge. Rand savings, SA bonds and cash are all rand-denominated and offer no protection.",
          },
        },
      },
    ],
  },
];

const whyWeakensLayout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "A Volatile Emerging-Market Currency",
    content:
      "<p>The rand is one of the most traded, and most volatile, emerging-market currencies. When global investors get nervous, they sell 'risky' assets (including rand) and buy 'safe' ones like the US dollar. This can happen even when nothing has changed inside South Africa.</p><p>Durable drivers of rand weakness include US–SA interest-rate differentials (capital flight to the dollar), load shedding and other growth shocks, a current-account (trade) deficit, and global risk-off sentiment.</p>",
  },
  { slot: "rand-economy/why-rand-weakens/drivers" },
  { slot: "rand-economy/why-rand-weakens/budget-impact" },
  {
    type: "info",
    title: "How Rand Weakness Hits Your Budget, and How to Hedge",
    content:
      "<p>Every R1 the rand weakens against the dollar adds roughly R0.20–R0.30 per litre of petrol (crude oil is dollar-priced). Electronics, imported food, flights and medicine all get pricier. A weaker rand helps exporters (mining, agriculture, tourism) but hurts consumers and importers.</p><p>The most accessible hedge for an ordinary investor is a <strong>global (offshore) equity ETF</strong>: because it's priced in foreign currency, it gains in rand terms when the rand weakens, even if the underlying shares don't move.</p>",
  },
  { slot: "rand-economy/why-rand-weakens/hedge-math" },
  { slot: "rand-economy/why-rand-weakens/best-hedge" },
];

// ═══════════════════════════════════════════════════════════════════════════

export const RAND_ECONOMY_BANKS: Record<string, LessonBank> = {
  "rand-economy::why-rand-weakens": { layout: whyWeakensLayout, slots: whyWeakensSlots },
};
