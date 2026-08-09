import type { LessonLayoutItem, QuestionSlot } from "@/data/content";
import type { LessonBank } from "./money-basics";

/**
 * Bank for "Advanced Investing" (Level 3).
 *
 * Concepts are stable investing theory (Markowitz/MPT, Fama-French factors,
 * sequence-of-returns risk). SA-specific figures verified current:
 *  - Regulation 28 offshore limit 45% (raised from 30% in 2022); no offshore
 *    cap on TFSAs or discretionary investments.
 *  - Individual exchange-control allowances: single discretionary allowance
 *    R2 million/year (doubled from R1m in Budget 2026) + foreign investment
 *    allowance R10 million/year with SARS tax clearance.
 *  - SA safe withdrawal guidance 3-3.5% (vs US 4%), higher with offshore.
 * (Legacy Level-3 steps still show the old R1m SDA; this bank supersedes them.)
 */

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 1 · Modern Portfolio Theory  (advanced-investing::modern-portfolio-theory)
// ═══════════════════════════════════════════════════════════════════════════

const mptSlots: QuestionSlot[] = [
  {
    slotId: "advanced-investing/modern-portfolio-theory/free-lunch",
    conceptId: "diversification",
    variants: [
      {
        variantId: "ainv-mpt-fl-mcq",
        step: {
          type: "mcq",
          question: "Markowitz's core insight (Modern Portfolio Theory) is that combining assets that don't move together:",
          options: [
            "Can cut risk with little cost to return",
            "Always raises the risk",
            "Guarantees a higher return every year",
            "Removes every possibility of a loss",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Low-correlation assets offset each other's swings, cutting volatility. Diversification is the closest thing to a free lunch.",
            incorrect: "It lowers risk for a given return by mixing assets that don't move in lockstep. It doesn't guarantee gains or remove loss.",
          },
        },
      },
      {
        variantId: "ainv-mpt-fl-tf",
        step: {
          type: "true-false",
          statement: "Diversification works because different assets don't always move in the same direction at the same time.",
          correct: true,
          feedback: {
            correct: "Right. When one asset falls, another may hold or rise. That low correlation is what smooths the overall ride.",
            incorrect: "It's true. The benefit comes from low correlation: assets that don't move together cushion each other.",
          },
        },
      },
      {
        variantId: "ainv-mpt-fl-mcq2",
        step: {
          type: "mcq",
          question: "A portfolio on the 'efficient frontier' is one that:",
          options: [
            "Gives the highest expected return for its level of risk",
            "Has zero risk",
            "Holds only one asset",
            "Guarantees a fixed return",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The frontier is the set of best-possible risk/return trade-offs; anything below it takes more risk than needed.",
            incorrect: "It's the best return available for a given risk level. Portfolios below the frontier are inefficient, too much risk for the return.",
          },
        },
      },
    ],
  },
  {
    slotId: "advanced-investing/modern-portfolio-theory/allocation",
    conceptId: "diversification",
    variants: [
      {
        variantId: "ainv-mpt-al-mcq",
        step: {
          type: "mcq",
          question: "Research (Brinson et al.) found that most of a portfolio's long-term variability is explained by:",
          options: [
            "Asset allocation, the split between equities, bonds, cash and offshore",
            "Which exact stock you pick",
            "Market timing",
            "The colour of the fund's logo",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Allocation drives over 90% of long-term variability; stock picking and timing together explain under 10%.",
            incorrect: "It's asset allocation (>90%). Individual stock picks and market timing matter far less than the broad split.",
          },
        },
      },
      {
        variantId: "ainv-mpt-al-tf",
        step: {
          type: "true-false",
          statement: "South Africa is a small share of the global economy, so a 100% SA portfolio is a concentrated bet.",
          correct: true,
          feedback: {
            correct: "Right. SA is under ~0.5% of global GDP/market cap: going all-in on it concentrates you in one volatile emerging market.",
            incorrect: "It's true. SA is a tiny slice of the global market, so an all-SA portfolio is a concentrated, single-country bet.",
          },
        },
      },
      {
        variantId: "ainv-mpt-al-sc",
        step: {
          type: "scenario",
          question: "Someone spends hours picking the 'perfect' SA share but holds 100% JSE. What does portfolio theory suggest is the bigger lever?",
          options: [
            "The overall allocation",
            "Finding one more perfect stock",
            "Timing the JSE's daily moves",
            "The brokerage they use",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The allocation decision dwarfs the stock pick. Spreading across SA, global and bonds matters far more.",
            incorrect: "Allocation is the bigger lever. Which stock you pick explains little; the SA/global/bond mix explains most of the outcome.",
          },
        },
      },
    ],
  },
  {
    slotId: "advanced-investing/modern-portfolio-theory/correlation",
    conceptId: "diversification",
    variants: [
      {
        variantId: "ainv-mpt-co-mcq",
        step: {
          type: "mcq",
          question: "Adding low-correlation global bonds to an all-SA-equity portfolio typically:",
          options: [
            "Lowers volatility more than return",
            "Raises both return and volatility",
            "Leaves volatility and return unchanged",
            "Raises return with no extra volatility",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The blend earns a bit less in raw terms but volatility falls further, so return-per-unit-of-risk improves.",
            incorrect: "Volatility falls more than return does, improving the Sharpe ratio, better return per unit of risk, not a guaranteed higher return.",
          },
        },
      },
      {
        variantId: "ainv-mpt-co-tf",
        step: {
          type: "true-false",
          statement: "A weakening rand tends to boost the rand value of your offshore holdings, helping cushion a JSE fall.",
          correct: true,
          feedback: {
            correct: "Right. Offshore assets are priced in foreign currency, so rand weakness lifts their rand value, a natural hedge.",
            incorrect: "It's true. When the rand weakens, offshore holdings rise in rand terms, softening a local market drop.",
          },
        },
      },
      {
        variantId: "ainv-mpt-co-mcq2",
        step: {
          type: "mcq",
          question: "The 'diversification benefit' is strongest when the assets you combine have:",
          options: ["Low correlation with each other", "Perfect correlation with each other", "Completely identical underlying holdings", "Exactly the same fund manager throughout"],
          correct: 0,
          feedback: {
            correct: "Right. The less two assets move together, the more they offset each other's swings. That's where the benefit lives.",
            incorrect: "It's low correlation. Assets that move together (high correlation) give little diversification benefit.",
          },
        },
      },
    ],
  },
  {
    slotId: "advanced-investing/modern-portfolio-theory/rebalancing",
    conceptId: "diversification",
    variants: [
      {
        variantId: "ainv-mpt-rb-mcq",
        step: {
          type: "mcq",
          question: "Rebalancing a 60/40 portfolio back to target after equities surge means you:",
          options: [
            "Sell some of what rose, buy what lagged",
            "Buy more of whatever has risen the fastest",
            "Sell everything and hold cash instead",
            "Leave the holdings untouched for good",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Rebalancing trims the winner and tops up the laggard, enforcing 'buy low, sell high' without emotion.",
            incorrect: "You trim the risen asset and buy the lagging one. That's the disciplined 'sell high, buy low' of rebalancing.",
          },
        },
      },
      {
        variantId: "ainv-mpt-rb-tf",
        step: {
          type: "true-false",
          statement: "Rebalancing inside a TFSA triggers no capital gains tax, unlike a taxable account.",
          correct: true,
          feedback: {
            correct: "Right. A TFSA has no CGT, so you can rebalance freely; in a taxable account, selling to rebalance can trigger CGT.",
            incorrect: "It's true. TFSA rebalancing is CGT-free; in taxable accounts, prefer rebalancing with new contributions to limit CGT.",
          },
        },
      },
      {
        variantId: "ainv-mpt-rb-sc",
        step: {
          type: "scenario",
          question: "Priya's 60/40 portfolio has drifted to 67/33 after a strong equity year. A disciplined investor would:",
          options: [
            "Sell equities back down to 60/40",
            "Let the winners keep running to 80/20",
            "Sell everything and wait in cash",
            "Move the whole portfolio into equities",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Rebalancing restores the intended risk level and banks some of the equity gains into the laggard.",
            incorrect: "Rebalance toward target. Letting winners run quietly raises your risk above what you chose and abandons the plan.",
          },
        },
      },
    ],
  },
];

const mptLayout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Why Diversification Pays",
    content:
      "<p>Markowitz's Nobel-winning insight: combining assets that don't move together can cut a portfolio's risk without sacrificing much return, the closest thing to a free lunch. The key is <strong>low correlation</strong>: when the JSE falls, global holdings (helped by a weaker rand) may cushion the blow.</p><p><strong>Asset allocation</strong> (the split between SA equities, global equities, bonds and cash) explains over 90% of long-term variability; stock picking and timing explain under 10%. And <strong>rebalancing</strong> back to target systematically sells what rose and buys what lagged.</p>",
  },
  { slot: "advanced-investing/modern-portfolio-theory/free-lunch" },
  { slot: "advanced-investing/modern-portfolio-theory/allocation" },
  { slot: "advanced-investing/modern-portfolio-theory/correlation" },
  { slot: "advanced-investing/modern-portfolio-theory/rebalancing" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 2 · Factor Investing  (advanced-investing::factor-investing-sa)
// ═══════════════════════════════════════════════════════════════════════════

const factorSlots: QuestionSlot[] = [
  {
    slotId: "advanced-investing/factor-investing-sa/what-factors",
    conceptId: "factor-investing",
    variants: [
      {
        variantId: "ainv-fac-wf-mcq",
        step: {
          type: "mcq",
          question: "Investment 'factors' are:",
          options: [
            "Characteristics that earn a premium",
            "Short-term stock tips from bank analysts",
            "Predictions of next week's prices",
            "Ratings that agencies give to companies",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Factors are systematic, evidence-based tilts, not tips. The big five: value, size, momentum, quality, low volatility.",
            incorrect: "They're durable characteristics with a historical return premium (value, size, momentum, quality, low-vol), not tips or forecasts.",
          },
        },
      },
      {
        variantId: "ainv-fac-wf-tf",
        step: {
          type: "true-false",
          statement: "Factor premiums are backed by decades of academic research (Fama-French and others).",
          correct: true,
          feedback: {
            correct: "Right. The evidence spans decades and many markets, including broadly on the JSE, though premiums vary over time.",
            incorrect: "It's true. Factor premiums come from long-run academic research across many markets, not from marketing.",
          },
        },
      },
      {
        variantId: "ainv-fac-wf-mcq2",
        step: {
          type: "mcq",
          question: "Which of these is the 'momentum' factor?",
          options: [
            "Recent winners over 6-12 months",
            "Cheap stocks on a low P/E",
            "Profitable, low-debt companies",
            "Smaller companies by market cap",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Momentum tilts toward recent winners. (Cheap = value, profitable/low-debt = quality, smaller = size.)",
            incorrect: "Momentum = recent winners continuing. Low P/E is value, profitable/low-debt is quality, smaller companies is size.",
          },
        },
      },
    ],
  },
  {
    slotId: "advanced-investing/factor-investing-sa/value",
    conceptId: "factor-investing",
    variants: [
      {
        variantId: "ainv-fac-val-mcq",
        step: {
          type: "mcq",
          question: "A 'value' tilt systematically overweights:",
          options: [
            "Stocks on a low price-to-earnings ratio",
            "Stocks that rose most in the last 12 months",
            "Stocks trading on the highest growth multiples",
            "Stocks that pay out the largest dividends",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Value means buying cheap relative to fundamentals (low P/E, P/B, P/CF) the opposite of growth.",
            incorrect: "Value = cheap on fundamentals (low P/E, P/B). Recent winners are momentum; expensive names are growth; high yield alone isn't value.",
          },
        },
      },
      {
        variantId: "ainv-fac-val-tf",
        step: {
          type: "true-false",
          statement: "Value and growth are essentially opposite ends of the same spectrum.",
          correct: true,
          feedback: {
            correct: "Right. Value buys cheap relative to fundamentals; growth pays up for high future expectations.",
            incorrect: "It's true. Value (cheap) and growth (expensive, high expectations) sit at opposite ends of the spectrum.",
          },
        },
      },
      {
        variantId: "ainv-fac-val-sc",
        step: {
          type: "scenario",
          question: "An investor wants a low-cost value tilt on the JSE. The most sensible tool is:",
          options: [
            "A rules-based value or smart-beta ETF",
            "An active fund claiming a value style",
            "A hand-picked basket of cheap-looking shares",
            "A five-year fixed deposit at a local bank",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Smart-beta ETFs deliver the factor systematically at ~0.2-0.5%, far cheaper than active funds claiming the same.",
            incorrect: "A low-cost rules-based (smart-beta) ETF captures the tilt cheaply: better than pricey active funds or guesswork.",
          },
        },
      },
    ],
  },
  {
    slotId: "advanced-investing/factor-investing-sa/patience",
    conceptId: "factor-investing",
    variants: [
      {
        variantId: "ainv-fac-pat-tf",
        step: {
          type: "true-false",
          statement: "A factor like value can underperform for several years without meaning it's 'broken'.",
          correct: true,
          feedback: {
            correct: "Right. Value lagged growth for most of 2010-2020, then rebounded. Factors are long-horizon tilts, not quick wins.",
            incorrect: "It's true. Factors can lag for 3-5+ years (value did in the 2010s) and still be intact. Patience is required.",
          },
        },
      },
      {
        variantId: "ainv-fac-pat-mcq",
        step: {
          type: "mcq",
          question: "A sensible discipline for factor investing is to:",
          options: [
            "Hold a blend of factors for the long term",
            "Switch factors every few months",
            "Abandon a factor the first year it lags",
            "Hold one single factor and nothing else",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A 10+ year horizon and a blend of uncorrelated factors smooths the inevitable lean patches.",
            incorrect: "Hold for the long term and combine uncorrelated factors. Chasing or abandoning factors after short slumps destroys the edge.",
          },
        },
      },
      {
        variantId: "ainv-fac-pat-sc",
        step: {
          type: "scenario",
          question: "Value has lagged growth for three years and an investor wants to dump their value ETF. What does the evidence suggest?",
          options: [
            "Hold, since multi-year factor lags are normal",
            "Sell now, since the factor is clearly dead",
            "Borrow to double down while the price is low",
            "Switch to whichever factor rose most recently",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Value's 2010s lag then a strong rebound is the cautionary tale, selling at the low locked in the underperformance.",
            incorrect: "Factors lag for years and recover; bailing at the bottom is exactly what caught investors who quit value before its rebound.",
          },
        },
      },
    ],
  },
  {
    slotId: "advanced-investing/factor-investing-sa/smart-beta",
    conceptId: "factor-investing",
    variants: [
      {
        variantId: "ainv-fac-sb-tf",
        step: {
          type: "true-false",
          statement: "Factor (smart-beta) investing is just active management where a human picks stocks each day.",
          correct: false,
          feedback: {
            correct: "Correct. It's rules-based: a set screen (e.g. cheapest decile) is applied systematically: sitting between passive and active, at low fees.",
            incorrect: "It isn't. Smart beta is systematic and rules-based, no daily human picking, which is why fees are far lower than active funds.",
          },
        },
      },
      {
        variantId: "ainv-fac-sb-mcq",
        step: {
          type: "mcq",
          question: "Compared with active funds claiming a factor style, smart-beta ETFs usually charge:",
          options: ["Much lower fees", "Much higher fees", "The same fees", "No fees but higher tax"],
          correct: 0,
          feedback: {
            correct: "Right. Because it's rules-based, smart beta costs ~0.2-0.5% versus 1.5-2.5% for active funds claiming factor tilts.",
            incorrect: "Smart beta is cheap (~0.2-0.5%), a big edge over active funds (1.5-2.5%) that claim the same tilts.",
          },
        },
      },
      {
        variantId: "ainv-fac-sb-sc",
        step: {
          type: "scenario",
          question: "Why does keeping factor exposure cheap matter so much?",
          options: [
            "High fees can eat most or all of a factor's modest long-run premium",
            "Fees don't affect returns",
            "Cheap funds are always riskier",
            "Expensive funds guarantee the premium",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Factor premiums are real but modest; a 2% fee can swallow them, which is why low-cost smart beta wins.",
            incorrect: "Fees matter enormously. A modest factor premium can be wiped out by a high fee. Cheap, rules-based exposure keeps the edge.",
          },
        },
      },
    ],
  },
];

const factorLayout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "The Evidence-Based Edge",
    content:
      "<p>Decades of research (Fama-French onward) identified <strong>factors</strong>. Characteristics that have earned a premium over the market: <strong>value</strong> (cheap), <strong>size</strong> (smaller), <strong>momentum</strong> (recent winners), <strong>quality</strong> (profitable, low-debt) and <strong>low volatility</strong>. These are systematic, rules-based tilts, not tips.</p><p>'Smart-beta' ETFs deliver factor exposure cheaply (~0.2-0.5% vs 1.5-2.5% for active). The discipline: hold factors as long-term tilts, combine uncorrelated ones, and accept that any factor can lag for years without being broken.</p>",
  },
  { slot: "advanced-investing/factor-investing-sa/what-factors" },
  { slot: "advanced-investing/factor-investing-sa/value" },
  { slot: "advanced-investing/factor-investing-sa/patience" },
  { slot: "advanced-investing/factor-investing-sa/smart-beta" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 3 · Offshore Allocation  (advanced-investing::offshore-allocation-sa)
// ═══════════════════════════════════════════════════════════════════════════

const offshoreSlots: QuestionSlot[] = [
  {
    slotId: "advanced-investing/offshore-allocation-sa/why",
    conceptId: "offshore-allocation",
    variants: [
      {
        variantId: "ainv-off-wy-mcq",
        step: {
          type: "mcq",
          question: "Why do most advisors recommend meaningful offshore exposure for SA investors?",
          options: [
            "It diversifies beyond a concentrated JSE",
            "It removes all tax on investment returns",
            "It avoids a JSE crash that is certain to come",
            "It is required by law for retirement money",
          ],
          correct: 0,
          feedback: {
            correct: "Right. SA is under ~0.5% of global markets; offshore spreads your risk and gains in rand terms when the rand weakens.",
            incorrect: "The reason is concentration and currency: SA is tiny globally, and offshore holdings diversify and hedge the rand.",
          },
        },
      },
      {
        variantId: "ainv-off-wy-tf",
        step: {
          type: "true-false",
          statement: "Holding only SA equities exposes you to load shedding, local policy risk and rand depreciation all at once.",
          correct: true,
          feedback: {
            correct: "Right. An all-SA portfolio stacks these local risks together, offshore exposure spreads them out.",
            incorrect: "It's true. All-SA means concentrated exposure to local growth, policy and currency risk: offshore diversifies it.",
          },
        },
      },
      {
        variantId: "ainv-off-wy-mcq2",
        step: {
          type: "mcq",
          question: "Beyond diversification, a key benefit of a global equity ETF for a SA investor is:",
          options: [
            "A rand hedge when the rand weakens",
            "A guaranteed return in rand terms",
            "Immunity from falls in global markets",
            "A permanent exemption from SA tax",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Priced in foreign currency, it rises in rand when the rand falls, protecting purchasing power.",
            incorrect: "The extra benefit is the rand hedge: foreign-currency assets rise in rand when the rand weakens.",
          },
        },
      },
    ],
  },
  {
    slotId: "advanced-investing/offshore-allocation-sa/reg28",
    conceptId: "offshore-allocation",
    variants: [
      {
        variantId: "ainv-off-r28-mcq",
        step: {
          type: "mcq",
          question: "Under Regulation 28, how much of a retirement fund (RA/pension) can be offshore?",
          options: ["Up to 45%", "Up to 100%", "0%", "Exactly 30%"],
          correct: 0,
          feedback: {
            correct: "Right. Reg 28 caps retirement funds at 45% offshore (raised from 30% in 2022), so at least 55% stays in SA assets.",
            incorrect: "It's up to 45% (raised from 30% in 2022). A Reg 28 fund must keep at least 55% in SA assets.",
          },
        },
      },
      {
        variantId: "ainv-off-r28-tf",
        step: {
          type: "true-false",
          statement: "Regulation 28's offshore limit means your RA cannot be invested 100% offshore.",
          correct: true,
          feedback: {
            correct: "Right. An RA is capped at 45% offshore, so it must hold at least 55% SA assets: a deliberate policy choice.",
            incorrect: "It's true. Reg 28 limits an RA to 45% offshore; it can't go fully global.",
          },
        },
      },
      {
        variantId: "ainv-off-r28-sc",
        step: {
          type: "scenario",
          question: "Bongani wants the most offshore exposure his RA legally allows. What's the maximum?",
          options: ["45% offshore", "100% offshore", "10% offshore", "0%. RAs must be all-SA"],
          correct: 0,
          feedback: {
            correct: "Right. 45% is the Reg 28 ceiling for a retirement fund. For more global exposure he'd use a TFSA or discretionary account.",
            incorrect: "The cap is 45% for an RA. To go higher he'd use his TFSA or a discretionary account, which have no offshore limit.",
          },
        },
      },
    ],
  },
  {
    slotId: "advanced-investing/offshore-allocation-sa/no-limit",
    conceptId: "offshore-allocation",
    variants: [
      {
        variantId: "ainv-off-nl-mcq",
        step: {
          type: "mcq",
          question: "Which accounts have NO offshore limit for a SA investor?",
          options: [
            "TFSAs and discretionary accounts",
            "RAs and preservation funds",
            "All funds governed by Reg 28",
            "None, everything is capped at 45%",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Reg 28 only binds retirement funds. A TFSA or discretionary account can hold 100% global equity if you choose.",
            incorrect: "TFSAs and discretionary accounts have no offshore cap. Only retirement funds (RA/pension) are limited to 45%.",
          },
        },
      },
      {
        variantId: "ainv-off-nl-tf",
        step: {
          type: "true-false",
          statement: "You can legally hold 100% global equity ETF inside a TFSA.",
          correct: true,
          feedback: {
            correct: "Right. Reg 28 doesn't apply to TFSAs, so a fully global TFSA is allowed, and growth stays tax-free.",
            incorrect: "You can. TFSAs aren't bound by Reg 28, so 100% global equity is legal (and the growth is tax-free).",
          },
        },
      },
      {
        variantId: "ainv-off-nl-sc",
        step: {
          type: "scenario",
          question: "Someone wants maximum rand-hedge in their R1m TFSA. The simplest compliant approach is:",
          options: [
            "A 100% global equity ETF",
            "A 100% SA market-cap index ETF",
            "A USD fixed deposit at a SA bank",
            "A 50/50 split to satisfy Reg 28",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A global equity ETF in a TFSA gives full rand-hedge and global diversification, tax-free. Reg 28 doesn't apply.",
            incorrect: "A 100% global equity ETF is fine in a TFSA, no Reg 28 limit, giving full rand-hedge with tax-free growth.",
          },
        },
      },
    ],
  },
  {
    slotId: "advanced-investing/offshore-allocation-sa/allowances",
    conceptId: "offshore-allocation",
    variants: [
      {
        variantId: "ainv-off-al-mcq",
        step: {
          type: "mcq",
          question: "To move money offshore personally, the single discretionary allowance (no tax clearance needed) is now:",
          options: [
            "R2 million per calendar year",
            "R100 000 per calendar year",
            "R10 million per calendar year",
            "Unlimited, with no annual cap",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The SDA doubled to R2 million/year in Budget 2026. On top, the foreign investment allowance is R10m/year with SARS clearance.",
            incorrect: "The SDA is now R2 million/year (up from R1m in Budget 2026). The separate R10m foreign investment allowance needs SARS clearance.",
          },
        },
      },
      {
        variantId: "ainv-off-al-tf",
        step: {
          type: "true-false",
          statement: "The R10 million foreign investment allowance requires a SARS tax clearance and applies per calendar year (not once in a lifetime).",
          correct: true,
          feedback: {
            correct: "Right. It's a yearly allowance needing tax clearance, often misread as a lifetime cap, which it isn't.",
            incorrect: "It's true. The R10m FIA is annual and needs SARS tax clearance. It's not a lifetime limit.",
          },
        },
      },
      {
        variantId: "ainv-off-al-mcq2",
        step: {
          type: "mcq",
          question: "Combining both personal allowances, roughly how much can an individual move offshore per year?",
          options: ["About R12 million", "About R1 million a year", "About R100 000 a year", "There is no annual cap"],
          correct: 0,
          feedback: {
            correct: "Right. R2m SDA + R10m FIA = up to R12 million a year (the FIA portion needing tax clearance).",
            incorrect: "It's about R12m: the R2m SDA plus the R10m foreign investment allowance (which needs SARS clearance).",
          },
        },
      },
    ],
  },
];

const offshoreLayout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Offshore Allocation for South Africans",
    content:
      "<p>SA is under ~0.5% of global markets, so an all-SA portfolio is a concentrated bet on one emerging market. Offshore exposure adds diversification and a <strong>rand hedge</strong>. Global holdings rise in rand terms when the rand weakens.</p><p><strong>Regulation 28</strong> caps retirement funds (RA/pension) at <strong>45% offshore</strong> (up from 30% in 2022), so at least 55% stays local. <strong>TFSAs and discretionary accounts have no offshore limit</strong>. You can go 100% global. To move money out personally: a <strong>R2 million</strong> single discretionary allowance a year (doubled in Budget 2026) plus a <strong>R10 million</strong> foreign investment allowance with SARS clearance.</p>",
  },
  { slot: "advanced-investing/offshore-allocation-sa/why" },
  { slot: "advanced-investing/offshore-allocation-sa/reg28" },
  { slot: "advanced-investing/offshore-allocation-sa/no-limit" },
  { slot: "advanced-investing/offshore-allocation-sa/allowances" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 4 · Sequence-of-Returns Risk  (advanced-investing::sequence-of-returns)
// ═══════════════════════════════════════════════════════════════════════════

const seqSlots: QuestionSlot[] = [
  {
    slotId: "advanced-investing/sequence-of-returns/what-it-is",
    conceptId: "sequence-risk",
    variants: [
      {
        variantId: "ainv-seq-wi-mcq",
        step: {
          type: "mcq",
          question: "Two retirees have the same 10% average return over 20 years, but one gets bad returns early. What happens?",
          options: [
            "The one with bad early returns can run out of money years sooner. Order matters",
            "They end up identical",
            "The one with bad early returns ends up richer",
            "It makes no difference in retirement",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Same average, different order: early losses while withdrawing can exhaust the portfolio far sooner.",
            incorrect: "The order matters. Bad returns early, combined with withdrawals, can run the money out years before the same average would suggest.",
          },
        },
      },
      {
        variantId: "ainv-seq-wi-tf",
        step: {
          type: "true-false",
          statement: "For someone drawing an income, the order of returns matters, not just the average.",
          correct: true,
          feedback: {
            correct: "Right. That's sequence-of-returns risk. A bad early stretch while withdrawing does lasting damage.",
            incorrect: "It's true. When you're withdrawing, sequence matters: early losses hurt far more than the same losses later.",
          },
        },
      },
      {
        variantId: "ainv-seq-wi-mcq2",
        step: {
          type: "mcq",
          question: "Sequence-of-returns risk is most dangerous:",
          options: [
            "In the first years of retirement",
            "In the decades before you retire",
            "In the years you make no withdrawals",
            "At no point at all, the risk is a myth",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Early-retirement losses combined with withdrawals permanently shrink the base that would have recovered.",
            incorrect: "It bites hardest early in retirement, while you're drawing income. That's when forced selling does permanent harm.",
          },
        },
      },
    ],
  },
  {
    slotId: "advanced-investing/sequence-of-returns/why-retirees",
    conceptId: "sequence-risk",
    variants: [
      {
        variantId: "ainv-seq-wr-mcq",
        step: {
          type: "mcq",
          question: "Why does an early crash hurt a retiree more than a still-working investor with the same loss?",
          options: [
            "The retiree sells units at low prices",
            "It doesn't, the loss is equal for both",
            "The retiree pays more tax on the loss",
            "The worker has a longer life expectancy",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Forced selling at the bottom locks in losses; a working investor can simply wait (or buy more) and recover.",
            incorrect: "The retiree is forced to sell low to fund income; those units miss the rebound. A worker can wait for recovery.",
          },
        },
      },
      {
        variantId: "ainv-seq-wr-tf",
        step: {
          type: "true-false",
          statement: "A working investor can usually ride out a crash without selling, while a retiree drawing income may be forced to sell at the low.",
          correct: true,
          feedback: {
            correct: "Right. That forced 'selling low' to fund living costs is the exact mechanism behind sequence risk.",
            incorrect: "It's true. The worker waits; the retiree must sell units at depressed prices for income, the heart of sequence risk.",
          },
        },
      },
      {
        variantId: "ainv-seq-wr-sc",
        step: {
          type: "scenario",
          question: "A retiree's portfolio drops 30% in year one and they keep withdrawing the same amount from equities. The main danger is:",
          options: [
            "They sell more units at low prices, permanently shrinking the base that would have recovered",
            "Nothing: the market always bounces immediately",
            "They pay a penalty to SARS",
            "Their withdrawals become tax-free",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Drawing from equities in the slump crystallises losses and leaves less capital to compound in the recovery.",
            incorrect: "The danger is selling depressed units for income. It permanently reduces the capital base and the portfolio's longevity.",
          },
        },
      },
    ],
  },
  {
    slotId: "advanced-investing/sequence-of-returns/sa-withdrawal",
    conceptId: "sequence-risk",
    variants: [
      {
        variantId: "ainv-seq-wd-mcq",
        step: {
          type: "mcq",
          question: "Compared with the US '4% rule', a safe initial withdrawal rate for SA retirees is often set:",
          options: [
            "Lower, around 3-3.5%",
            "Much higher, around 8%",
            "Exactly the same, 4%, always",
            "At 0%. You can never withdraw",
          ],
          correct: 0,
          feedback: {
            correct: "Right. SA's higher inflation argues for 3-3.5% initially, rising toward 4-4.5% with meaningful offshore exposure.",
            incorrect: "SA's higher inflation suggests a more cautious 3-3.5% start (up to 4-4.5% with offshore), not the US 4%.",
          },
        },
      },
      {
        variantId: "ainv-seq-wd-tf",
        step: {
          type: "true-false",
          statement: "The US 4% rule can be applied unchanged to South African retirees.",
          correct: false,
          feedback: {
            correct: "Correct. SA's higher inflation and volatility mean a lower starting rate (3-3.5%) is usually safer.",
            incorrect: "It shouldn't be copied unchanged. SA's higher inflation means a more cautious 3-3.5% initial rate is wiser.",
          },
        },
      },
      {
        variantId: "ainv-seq-wd-sc",
        step: {
          type: "scenario",
          question: "A SA retiree with a globally diversified portfolio asks what withdrawal rate is reasonable. A fair answer is:",
          options: [
            "Start near 3.5% and stay flexible",
            "Start at a flat 8% and never adjust",
            "Draw the full balance in year one",
            "Draw nothing and live on savings",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A cautious start with offshore exposure and flexible withdrawals gives the portfolio the best chance to last.",
            incorrect: "Around 3-3.5% rising to 4-4.5% with offshore exposure, kept flexible, is the sensible SA range, not 8%.",
          },
        },
      },
    ],
  },
  {
    slotId: "advanced-investing/sequence-of-returns/strategies",
    conceptId: "sequence-risk",
    variants: [
      {
        variantId: "ainv-seq-st-mcq",
        step: {
          type: "mcq",
          question: "Which strategy best manages sequence-of-returns risk in a downturn?",
          options: [
            "Draw living costs from a 1-2 year cash buffer instead of selling equities at the low",
            "Sell equities aggressively to 'stop the bleeding'",
            "Increase withdrawals to make up the loss",
            "Move 100% into equities to recover faster",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A cash buffer (and a bucket approach) lets equities recover without forced selling, the single biggest lever.",
            incorrect: "Spend from a cash buffer so you don't sell equities low. Selling into the fall, or raising withdrawals, does the damage.",
          },
        },
      },
      {
        variantId: "ainv-seq-st-tf",
        step: {
          type: "true-false",
          statement: "Reducing your withdrawals in a bad year can meaningfully extend how long a portfolio lasts.",
          correct: true,
          feedback: {
            correct: "Right. Even a 10% cut in a down year eases the forced-selling problem and stretches the portfolio's life.",
            incorrect: "It's true. Flexible withdrawals, spending a bit less in bad years, are a powerful defence against sequence risk.",
          },
        },
      },
      {
        variantId: "ainv-seq-st-sc",
        step: {
          type: "scenario",
          question: "Nomsa retires with a living annuity (70% equities). The JSE falls 28% in year one. The better move for portfolio longevity is to:",
          options: [
            "Trim withdrawals and draw from the cash portion",
            "Switch fully to equities and recover faster",
            "Move everything to cash",
            "Keep withdrawing the same amount from equities",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Cutting withdrawals and drawing from cash avoids selling equities low, the most effective sequence-risk lever.",
            incorrect: "Trim withdrawals and use the cash/money-market bucket. Selling equities low (or going all-cash) locks in the damage.",
          },
        },
      },
    ],
  },
];

const seqLayout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "The Retirement Killer: Why Average Returns Lie",
    content:
      "<p>Two retirees can have the <strong>same average return</strong> yet very different outcomes, because the <strong>order</strong> of returns matters once you're withdrawing income. A crash early in retirement forces you to sell units at low prices, and that capital never shares in the recovery. This is <strong>sequence-of-returns risk</strong>.</p><p>SA's higher inflation argues for a cautious starting withdrawal rate (3-3.5%, up to 4-4.5% with offshore exposure). Defences: a 1-2 year cash buffer, a bucket strategy, and cutting withdrawals in bad years so you never have to sell equities at the bottom.</p>",
  },
  { slot: "advanced-investing/sequence-of-returns/what-it-is" },
  { slot: "advanced-investing/sequence-of-returns/why-retirees" },
  { slot: "advanced-investing/sequence-of-returns/sa-withdrawal" },
  { slot: "advanced-investing/sequence-of-returns/strategies" },
];

// ═══════════════════════════════════════════════════════════════════════════

export const ADVANCED_INVESTING_BANKS: Record<string, LessonBank> = {
  "advanced-investing::modern-portfolio-theory": { layout: mptLayout, slots: mptSlots },
  "advanced-investing::factor-investing-sa": { layout: factorLayout, slots: factorSlots },
  "advanced-investing::offshore-allocation-sa": { layout: offshoreLayout, slots: offshoreSlots },
  "advanced-investing::sequence-of-returns": { layout: seqLayout, slots: seqSlots },
};
