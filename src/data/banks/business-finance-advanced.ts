import type { LessonLayoutItem, QuestionSlot } from "@/data/content";
import type { LessonBank } from "./money-basics";

/**
 * Bank for "Business Finance: Advanced" (Level 3).
 *
 * Durable figures used: company income tax 27%; SBC turnover ceiling R20m
 * (reduced graduated rates — exact brackets NOT quoted, as the 0% band tracks
 * annually and is best not hard-coded); PSP rule (80%+ from 1-2 clients → taxed
 * at individual rates). Ratios, EBITDA-multiple valuation (SA SMEs ~2-5×), and
 * funding concepts are structural, not rate-dependent.
 */

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 1 · Business Structures  (business-finance-advanced::company-structures-sa)
// ═══════════════════════════════════════════════════════════════════════════

const structSlots: QuestionSlot[] = [
  {
    slotId: "business-finance-advanced/company-structures-sa/sole-vs-pty",
    conceptId: "company-structures",
    variants: [
      {
        variantId: "bfa-cs-sp-mcq",
        step: {
          type: "mcq",
          question: "How is a sole proprietor's business profit taxed, and what's the liability?",
          options: [
            "Taxed in your hands at your marginal rate",
            "At a flat 27%, with limited liability",
            "It's tax-free",
            "At 20%, with no liability at all",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A sole prop is you. Profit is personal income (up to 45%) and your personal assets are on the line.",
            incorrect: "A sole prop's profit is taxed as your personal income (up to 45%), and liability is unlimited, no separation from you.",
          },
        },
      },
      {
        variantId: "bfa-cs-sp-tf",
        step: {
          type: "true-false",
          statement: "A Pty Ltd is a separate legal entity that offers limited liability and pays 27% company tax.",
          correct: true,
          feedback: {
            correct: "Right. Incorporating separates the business from you: limited liability, plus a 27% company rate (with SBC relief for small companies).",
            incorrect: "It's true. A Pty Ltd is a separate entity with limited liability and 27% company tax.",
          },
        },
      },
      {
        variantId: "bfa-cs-sp-sc",
        step: {
          type: "scenario",
          question: "Why might a growing business incorporate as a Pty Ltd rather than stay a sole proprietorship?",
          options: [
            "Limited liability protection, plus a 27% company rate versus up to 45% personally",
            "To avoid paying any tax at all",
            "Because it's legally required from your first sale",
            "There's no real reason to",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Protecting personal assets and (often) a lower rate on retained profit are the main drivers.",
            incorrect: "The reasons are limited liability and a 27% rate on profit (vs up to 45% personally), not avoiding tax entirely.",
          },
        },
      },
    ],
  },
  {
    slotId: "business-finance-advanced/company-structures-sa/psp-trap",
    conceptId: "company-structures",
    variants: [
      {
        variantId: "bfa-cs-psp-mcq",
        step: {
          type: "mcq",
          question: "A Pty Ltd earning 80%+ of its income from one or two clients (personal services) is a Personal Service Provider. How is it taxed?",
          options: [
            "At individual income tax rates",
            "At 0%",
            "At a flat 20%",
            "Fully exempt",
          ],
          correct: 0,
          feedback: {
            correct: "Right. PSP status strips away the 27% advantage, SARS taxes it at individual rates. Many contractors get caught by this.",
            incorrect: "A PSP is taxed at individual rates (up to 45%), losing the 27% company benefit. It's a common contractor trap.",
          },
        },
      },
      {
        variantId: "bfa-cs-psp-tf",
        step: {
          type: "true-false",
          statement: "A contractor can set up a Pty Ltd expecting 27% tax but be caught by the PSP rules and taxed at individual rates.",
          correct: true,
          feedback: {
            correct: "Right. If most income comes from one or two clients for personal services, the company is a PSP, taxed like an individual.",
            incorrect: "It's true. The PSP rules re-tax such companies at individual rates, removing the 27% benefit the contractor expected.",
          },
        },
      },
      {
        variantId: "bfa-cs-psp-sc",
        step: {
          type: "scenario",
          question: "Zanele earns R1.2 million through her Pty Ltd, almost all from just two clients for her own services. Likely SARS classification?",
          options: [
            "A Personal Service Provider",
            "A Small Business Corporation at reduced rates",
            "A standard Pty Ltd at 27%",
            "A non-profit company",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Personal services, most revenue from one or two clients. That's a PSP, taxed at individual rates, not 27%.",
            incorrect: "It's a PSP: personal services with 80%+ from one or two clients. SARS taxes it at individual rates.",
          },
        },
      },
    ],
  },
  {
    slotId: "business-finance-advanced/company-structures-sa/sbc",
    conceptId: "company-structures",
    variants: [
      {
        variantId: "bfa-cs-sbc-mcq",
        step: {
          type: "mcq",
          question: "A Small Business Corporation (SBC) is a qualifying Pty Ltd that gets:",
          options: [
            "Reduced, graduated tax rates instead of the flat 27%",
            "No tax at all, ever",
            "A higher rate than a normal company",
            "Exactly the same rate as an individual",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Qualifying SBCs pay lower graduated rates on modest profits, meaningful tax relief for small companies.",
            incorrect: "An SBC gets reduced, tiered rates instead of the flat 27%, a genuine saving on smaller profits.",
          },
        },
      },
      {
        variantId: "bfa-cs-sbc-tf",
        step: {
          type: "true-false",
          statement: "To qualify as an SBC, gross income must be under R20 million and no shareholder may hold shares in other companies.",
          correct: true,
          feedback: {
            correct: "Right. Those (plus not being a PSP or investment company) are the core SBC qualifying tests.",
            incorrect: "It's true: turnover under R20m and shareholders holding no other shares are key SBC conditions.",
          },
        },
      },
      {
        variantId: "bfa-cs-sbc-mcq2",
        step: {
          type: "mcq",
          question: "The main benefit of SBC status is:",
          options: [
            "Lower company tax on modest profits than the flat 27%",
            "Avoiding VAT registration",
            "Skipping CIPC registration",
            "Unlimited liability",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The benefit is purely the reduced tax rates on qualifying profit, not VAT or registration relief.",
            incorrect: "The benefit is a lower effective tax rate on modest profit. VAT and registration rules are unchanged.",
          },
        },
      },
    ],
  },
  {
    slotId: "business-finance-advanced/company-structures-sa/pty-vs-trust",
    conceptId: "company-structures",
    variants: [
      {
        variantId: "bfa-cs-pt-mcq",
        step: {
          type: "mcq",
          question: "For an operating, trading business, which structure is usually most suitable?",
          options: [
            "A Pty Ltd, operating simplicity, 27% rates, limited liability",
            "An inter vivos trust taxed at 45% on retained income",
            "A sole prop with unlimited liability, always",
            "No structure at all",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A company suits trading; a trust (taxed at 45% if it retains income) is better for holding assets and estate planning.",
            incorrect: "A Pty Ltd fits an operating business. A trust's 45% retained rate makes it better for holding assets, not trading.",
          },
        },
      },
      {
        variantId: "bfa-cs-pt-tf",
        step: {
          type: "true-false",
          statement: "Shares in your Pty Ltd form part of your estate, whereas assets in a trust generally fall outside it.",
          correct: true,
          feedback: {
            correct: "Right. That's why an advanced structure often pairs a trading company with a trust that holds the shares for estate planning.",
            incorrect: "It's true. Company shares are in your estate; trust assets sit outside it, the basis for combining the two.",
          },
        },
      },
      {
        variantId: "bfa-cs-pt-sc",
        step: {
          type: "scenario",
          question: "A common advanced structure has a Pty Ltd operating company owned by a family trust. Why?",
          options: [
            "The company trades efficiently while the trust holds the shares for estate planning and protection",
            "Purely to evade tax",
            "To avoid registering the business",
            "There's no real reason",
          ],
          correct: 0,
          feedback: {
            correct: "Right. You get the company's operating simplicity plus the trust's estate-planning and asset-protection benefits.",
            incorrect: "It combines a trading company with a trust that holds the shares: operating efficiency plus estate planning, legally.",
          },
        },
      },
    ],
  },
];

const structLayout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Tax, Liability, and Control",
    content:
      "<p><strong>Sole proprietor:</strong> no separation from you, profit taxed at your marginal rate (up to 45%), unlimited personal liability, zero setup cost. <strong>Pty Ltd:</strong> a separate legal entity with limited liability and 27% company tax (qualifying small companies, turnover under R20m, get reduced <strong>SBC</strong> rates).</p><p>Two traps to know: a <strong>Personal Service Provider</strong> (a Pty Ltd earning 80%+ from one or two clients for personal services) is taxed at individual rates, not 27%. And shares in your company sit inside your estate, while trust assets don't, which is why advanced structures often pair a trading company with a family trust that holds the shares.</p>",
  },
  { slot: "business-finance-advanced/company-structures-sa/sole-vs-pty" },
  { slot: "business-finance-advanced/company-structures-sa/psp-trap" },
  { slot: "business-finance-advanced/company-structures-sa/sbc" },
  { slot: "business-finance-advanced/company-structures-sa/pty-vs-trust" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 2 · Reading Financial Statements  (…::reading-financial-statements)
// ═══════════════════════════════════════════════════════════════════════════

const fsSlots: QuestionSlot[] = [
  {
    slotId: "business-finance-advanced/reading-financial-statements/three-statements",
    conceptId: "financial-statements",
    variants: [
      {
        variantId: "bfa-fs-3s-mcq",
        step: {
          type: "mcq",
          question: "Which financial statement answers 'does the business have cash to survive?'",
          options: ["The cash flow statement", "The income statement", "The balance sheet only", "None show cash"],
          correct: 0,
          feedback: {
            correct: "Right. The cash flow statement tracks actual cash in and out. Survival is about cash, not just profit.",
            incorrect: "It's the cash flow statement. The income statement shows profit; the balance sheet shows position; cash flow shows survival.",
          },
        },
      },
      {
        variantId: "bfa-fs-3s-mcq2",
        step: {
          type: "mcq",
          question: "The balance sheet shows:",
          options: [
            "What the business owns and owes at a point in time",
            "Profit over the year",
            "Cash movements over a period",
            "Staff headcount",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Assets, liabilities and equity. A snapshot of what's owned and owed on a given date.",
            incorrect: "The balance sheet is a point-in-time snapshot of assets, liabilities and equity, not a flow over time.",
          },
        },
      },
      {
        variantId: "bfa-fs-3s-tf",
        step: {
          type: "true-false",
          statement: "The income statement (P&L) shows revenue, costs and profit over a period.",
          correct: true,
          feedback: {
            correct: "Right. It answers 'is the business making money?' across a period, a month, quarter or year.",
            incorrect: "It's true. The income statement reports revenue, costs and resulting profit over a period of time.",
          },
        },
      },
    ],
  },
  {
    slotId: "business-finance-advanced/reading-financial-statements/ratios",
    conceptId: "financial-statements",
    variants: [
      {
        variantId: "bfa-fs-rt-mcq",
        step: {
          type: "mcq",
          question: "A current ratio (current assets ÷ current liabilities) below 1 signals:",
          options: [
            "A possible liquidity crisis. The business may not cover near-term bills",
            "Excellent financial health",
            "Very high profitability",
            "Low debt levels",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Below 1 means short-term obligations exceed short-term assets: a liquidity risk, even if the business is profitable.",
            incorrect: "Below 1 is a warning: current liabilities exceed current assets, so near-term bills may not be coverable.",
          },
        },
      },
      {
        variantId: "bfa-fs-rt-tf",
        step: {
          type: "true-false",
          statement: "Rising 'debtor days', customers taking longer to pay, is a cash-flow warning sign.",
          correct: true,
          feedback: {
            correct: "Right. Every extra debtor day is revenue sitting uncollected, it strains cash even when sales look healthy.",
            incorrect: "It's true. Longer debtor days mean cash is stuck with customers, a classic cash-flow red flag.",
          },
        },
      },
      {
        variantId: "bfa-fs-rt-mcq2",
        step: {
          type: "mcq",
          question: "EBITDA margin measures:",
          options: [
            "Operational profitability before interest, tax, depreciation and amortisation",
            "Total assets owned",
            "The company's tax rate",
            "Staff costs only",
          ],
          correct: 0,
          feedback: {
            correct: "Right. EBITDA strips out financing and accounting choices to show underlying operating profitability.",
            incorrect: "EBITDA margin is operating profitability before interest, tax, depreciation and amortisation, the 'clean' operating measure.",
          },
        },
      },
    ],
  },
  {
    slotId: "business-finance-advanced/reading-financial-statements/cash-vs-profit",
    conceptId: "cash-flow-vs-profit",
    variants: [
      {
        variantId: "bfa-fs-cp-tf",
        step: {
          type: "true-false",
          statement: "A profitable business can still run out of cash and fail.",
          correct: true,
          feedback: {
            correct: "Right. Profit is accounting; cash is your bank balance. Late-paying customers can sink a profitable business.",
            incorrect: "It's true, and common. A profitable business with poor cash timing can run dry and fail.",
          },
        },
      },
      {
        variantId: "bfa-fs-cp-sc",
        step: {
          type: "scenario",
          question: "Priya bills R500 000 in March but customers pay in 60 days, while she pays wages, food and rent now. She is:",
          options: [
            "Profitable on paper but cash-flow negative right now",
            "Making a loss",
            "Automatically insolvent",
            "Exempt from tax",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The income statement shows the R500k, but her bank is negative until customers pay: profit ≠ cash.",
            incorrect: "She's profitable but cash-flow negative: the sale is booked, but the cash hasn't arrived yet.",
          },
        },
      },
      {
        variantId: "bfa-fs-cp-mcq",
        step: {
          type: "mcq",
          question: "The most common cause of failure among profitable SMEs is:",
          options: [
            "Running out of cash",
            "Paying too little tax",
            "Having too many customers",
            "Charging prices that are too low only",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Cash timing kills profitable businesses, which is why a rolling cash-flow forecast matters more than the P&L alone.",
            incorrect: "It's cash flow. Profitable businesses fail when cash runs out before customers pay, track a 13-week cash forecast.",
          },
        },
      },
    ],
  },
  {
    slotId: "business-finance-advanced/reading-financial-statements/ebitda",
    conceptId: "financial-statements",
    variants: [
      {
        variantId: "bfa-fs-eb-fill",
        step: {
          type: "fill-blank",
          title: "Build up EBITDA",
          prompt: "Net profit R420k, interest R100k, tax R180k, depreciation R200k. EBITDA = R____ thousand.",
          correct: 900,
          feedback: {
            correct: "Right: R420k + R100k + R180k + R200k = R900k. EBITDA adds back interest, tax, depreciation and amortisation.",
            incorrect: "EBITDA = net profit + interest + tax + depreciation (+ amortisation) = 420 + 100 + 180 + 200 = R900k.",
          },
        },
      },
      {
        variantId: "bfa-fs-eb-mcq",
        step: {
          type: "mcq",
          question: "EBITDA is calculated as:",
          options: [
            "Net profit + interest + tax + depreciation + amortisation",
            "Revenue − tax",
            "Assets − liabilities",
            "Net profit on its own",
          ],
          correct: 0,
          feedback: {
            correct: "Right. You add back financing (interest), tax, and non-cash charges (depreciation, amortisation) to net profit.",
            incorrect: "EBITDA = net profit with interest, tax, depreciation and amortisation added back, isolating operating performance.",
          },
        },
      },
      {
        variantId: "bfa-fs-eb-tf",
        step: {
          type: "true-false",
          statement: "EBITDA strips out financing and accounting choices to show underlying operating profitability.",
          correct: true,
          feedback: {
            correct: "Right. That's why it's used to compare businesses and to value them. It removes capital-structure and accounting noise.",
            incorrect: "It's true. EBITDA removes interest, tax and non-cash charges to reveal the underlying operating profit.",
          },
        },
      },
    ],
  },
];

const fsLayout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Reading Financial Statements Like a CFO",
    content:
      "<p>Three core statements: the <strong>income statement</strong> (revenue, costs, profit over a period: 'are we making money?'), the <strong>balance sheet</strong> (assets, liabilities, equity at a point in time. 'what do we own and owe?'), and the <strong>cash flow statement</strong> ('do we have cash to survive?').</p><p>Key checks: the <strong>current ratio</strong> (below 1 is a liquidity risk), <strong>debtor days</strong> (rising = customers paying too slowly), and <strong>EBITDA margin</strong> (operating profit before interest, tax and non-cash charges). Above all. Profit is not cash. Profitable businesses fail by running out of cash.</p>",
  },
  { slot: "business-finance-advanced/reading-financial-statements/three-statements" },
  { slot: "business-finance-advanced/reading-financial-statements/ratios" },
  { slot: "business-finance-advanced/reading-financial-statements/cash-vs-profit" },
  { slot: "business-finance-advanced/reading-financial-statements/ebitda" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 3 · Business Valuation  (business-finance-advanced::business-valuation)
// ═══════════════════════════════════════════════════════════════════════════

const valSlots: QuestionSlot[] = [
  {
    slotId: "business-finance-advanced/business-valuation/why",
    conceptId: "business-valuation",
    variants: [
      {
        variantId: "bfa-val-wy-mcq",
        step: {
          type: "mcq",
          question: "Why does a business owner need to understand what their company is worth?",
          options: [
            "To sell fairly, buy out a partner, raise funding, and do estate planning",
            "Only for bragging rights",
            "There's never a reason to",
            "Only if the company is listed",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Valuation underpins selling, partner buyouts, raising equity without unfair dilution, and estate planning.",
            incorrect: "You need it for selling, buyouts, funding and estate planning, real decisions, not vanity.",
          },
        },
      },
      {
        variantId: "bfa-val-wy-tf",
        step: {
          type: "true-false",
          statement: "Owners often overvalue their business emotionally, while buyers use that information gap as a negotiating tool.",
          correct: true,
          feedback: {
            correct: "Right. Understanding valuation removes the asymmetry, you negotiate from evidence, not attachment.",
            incorrect: "It's true. Emotional overvaluation is common; knowing real valuation methods levels the negotiation.",
          },
        },
      },
      {
        variantId: "bfa-val-wy-sc",
        step: {
          type: "scenario",
          question: "A partner wants to exit a profitable business and asks to be 'bought out fairly'. What's the first thing needed?",
          options: [
            "A proper valuation of the business",
            "A coin toss",
            "Whatever the exiting partner demands",
            "Nothing: just guess a number",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A defensible valuation (e.g. EBITDA × multiple) sets a fair price and prevents a costly dispute.",
            incorrect: "You need a proper valuation first, a buyout without one invites conflict and an unfair price.",
          },
        },
      },
    ],
  },
  {
    slotId: "business-finance-advanced/business-valuation/ebitda-multiple",
    conceptId: "business-valuation",
    variants: [
      {
        variantId: "bfa-val-em-mcq",
        step: {
          type: "mcq",
          question: "The most common way to value a small operating business is:",
          options: [
            "EBITDA × an industry multiple",
            "Revenue × 100",
            "Total assets only",
            "The number of employees",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Earnings-based: value = EBITDA × an industry multiple (SA SMEs often 2-5×).",
            incorrect: "It's EBITDA × an industry multiple, the earnings-based method most common for operating businesses.",
          },
        },
      },
      {
        variantId: "bfa-val-em-fill",
        step: {
          type: "fill-blank",
          title: "EBITDA-multiple valuation",
          prompt: "Revenue R8m, EBITDA margin 15%, industry multiple 4×. Indicated valuation = R____ million.",
          correct: 4.8,
          feedback: {
            correct: "Right: EBITDA = R8m × 15% = R1.2m; × 4 = R4.8m. That's the starting point before adjusting for debt and risk.",
            incorrect: "EBITDA = R8m × 15% = R1.2m; × 4 = R4.8m.",
          },
        },
      },
      {
        variantId: "bfa-val-em-tf",
        step: {
          type: "true-false",
          statement: "SA SME EBITDA multiples (often 2-5×) are typically lower than listed-company multiples (8-15×).",
          correct: true,
          feedback: {
            correct: "Right. Smaller, less liquid, more owner-dependent businesses command lower multiples than large listed firms.",
            incorrect: "It's true. SME multiples (~2-5×) sit well below listed-company multiples (8-15×) for good reasons: risk and liquidity.",
          },
        },
      },
    ],
  },
  {
    slotId: "business-finance-advanced/business-valuation/methods",
    conceptId: "business-valuation",
    variants: [
      {
        variantId: "bfa-val-mth-mcq",
        step: {
          type: "mcq",
          question: "Which method suits an asset-heavy business (e.g. property) as a floor value?",
          options: [
            "Net Asset Value",
            "EBITDA multiple only",
            "Number of staff",
            "Revenue × 100",
          ],
          correct: 0,
          feedback: {
            correct: "Right. NAV values the assets less liabilities. A floor; a healthy going concern should be worth more than its parts.",
            incorrect: "Net Asset Value (assets − liabilities) is the asset-heavy floor. A trading business should exceed it as a going concern.",
          },
        },
      },
      {
        variantId: "bfa-val-mth-mcq2",
        step: {
          type: "mcq",
          question: "A discounted cash flow (DCF) values a business by:",
          options: [
            "Projecting future cash flows and discounting them back to today",
            "Counting employees",
            "Multiplying revenue by ten",
            "Adding up director salaries",
          ],
          correct: 0,
          feedback: {
            correct: "Right. DCF is theoretically sound but very sensitive to its growth and discount-rate assumptions.",
            incorrect: "DCF projects future free cash flows and discounts them to present value: rigorous, but assumption-sensitive.",
          },
        },
      },
      {
        variantId: "bfa-val-mth-tf",
        step: {
          type: "true-false",
          statement: "DCF is theoretically strong but highly sensitive to its assumptions.",
          correct: true,
          feedback: {
            correct: "Right. Small changes in growth or discount rate swing the answer a lot, which is why multiples are often used as a sanity check.",
            incorrect: "It's true. DCF's output depends heavily on assumptions, so it's usually cross-checked against market multiples.",
          },
        },
      },
    ],
  },
  {
    slotId: "business-finance-advanced/business-valuation/what-kills-it",
    conceptId: "business-valuation",
    variants: [
      {
        variantId: "bfa-val-wk-mcq",
        step: {
          type: "mcq",
          question: "Which red flag most lowers a business's sale value?",
          options: [
            "70% of revenue coming from a single customer",
            "Clean, audited books",
            "A capable management team",
            "A diversified customer base",
          ],
          correct: 0,
          feedback: {
            correct: "Right. If one client leaves, the value evaporates, buyers discount heavily for concentration. Diversify before selling.",
            incorrect: "Customer concentration is the killer here. The other three actually raise value and buyer confidence.",
          },
        },
      },
      {
        variantId: "bfa-val-wk-tf",
        step: {
          type: "true-false",
          statement: "If the owner IS the business (all the relationships and knowledge), buyers will pay less because it's risky without them.",
          correct: true,
          feedback: {
            correct: "Right. Key-person dependency is correctable, document processes and hand over client relationships before a sale.",
            incorrect: "It's true. Owner-dependence lowers value; buyers fear the business can't run without you. Fix it before selling.",
          },
        },
      },
      {
        variantId: "bfa-val-wk-sc",
        step: {
          type: "scenario",
          question: "Sipho's cleaning business (R800k EBITDA, market multiple 3.5× → R2.8m) gets a R1.6m offer because 70% of revenue is one hospital contract. Is the discount rational?",
          options: [
            "Yes. Heavy customer concentration justifies a lower multiple; he should diversify before selling",
            "No, buyers must always pay the full multiple",
            "The business should be valued on revenue instead",
            "It's a scam offer",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Lose that one client and most of the value goes with it, so ~2× (R1.6m) is defensible. Diversify to restore the full multiple.",
            incorrect: "The discount is rational. 70% from one client is severe risk. Diversifying the client base first would restore the ~3.5× multiple.",
          },
        },
      },
    ],
  },
];

const valLayout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "How to Value a Business",
    content:
      "<p>Your business may be your largest asset. You can't sell it, buy out a partner, raise equity, or plan your estate fairly without knowing its worth. The most common method for an operating business is <strong>EBITDA × an industry multiple</strong> (SA SMEs often 2-5×, versus 8-15× for listed companies). Other methods: <strong>discounted cash flow</strong> (rigorous but assumption-sensitive) and <strong>net asset value</strong> (a floor for asset-heavy businesses).</p><p>What kills a valuation: all fixable before a sale: <strong>customer concentration</strong>, <strong>owner-dependence</strong>, messy books, and no written contracts.</p>",
  },
  { slot: "business-finance-advanced/business-valuation/why" },
  { slot: "business-finance-advanced/business-valuation/ebitda-multiple" },
  { slot: "business-finance-advanced/business-valuation/methods" },
  { slot: "business-finance-advanced/business-valuation/what-kills-it" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 4 · Funding Your Business  (business-finance-advanced::business-funding)
// ═══════════════════════════════════════════════════════════════════════════

const fundSlots: QuestionSlot[] = [
  {
    slotId: "business-finance-advanced/business-funding/debt-vs-equity",
    conceptId: "business-funding",
    variants: [
      {
        variantId: "bfa-fund-de-mcq",
        step: {
          type: "mcq",
          question: "What's the core trade-off between debt and equity funding?",
          options: [
            "Debt costs interest but keeps your ownership; equity avoids repayments but gives up a share of the business",
            "They are identical",
            "Debt is always the better choice",
            "Equity funding is completely free",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Debt = interest, no dilution. Equity = no repayments, but you sell part of the company (and some control).",
            incorrect: "Debt charges interest but keeps your equity; equity avoids repayments but dilutes your ownership. That's the trade-off.",
          },
        },
      },
      {
        variantId: "bfa-fund-de-tf",
        step: {
          type: "true-false",
          statement: "Taking equity investment (e.g. venture capital) means giving up a share of ownership and often some control.",
          correct: true,
          feedback: {
            correct: "Right. Investors buy a stake and often board rights. Money comes with dilution and shared decision-making.",
            incorrect: "It's true. Equity funding dilutes your ownership and usually brings the investor some control.",
          },
        },
      },
      {
        variantId: "bfa-fund-de-mcq2",
        step: {
          type: "mcq",
          question: "'Bootstrapping' a business means:",
          options: [
            "Funding growth from your own revenue, no dilution, no interest, but slower",
            "Taking the biggest bank loan you can",
            "Selling most of your equity early",
            "Relying on a government grant",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Bootstrapping trades speed for control. You keep 100% but grow at the pace revenue allows.",
            incorrect: "Bootstrapping means self-funding from revenue: no dilution or interest, but slower growth.",
          },
        },
      },
    ],
  },
  {
    slotId: "business-finance-advanced/business-funding/government",
    conceptId: "business-funding",
    variants: [
      {
        variantId: "bfa-fund-gov-mcq",
        step: {
          type: "mcq",
          question: "SEDFA (the Small Enterprise Development and Finance Agency) provides:",
          options: [
            "Government-backed SME loans and support, often cheaper than banks",
            "Free equity with no strings",
            "Automatic tax refunds",
            "Venture capital for tech startups only",
          ],
          correct: 0,
          feedback: {
            correct: "Right. SEDFA merged SEFA, SEDA and the CBDA in October 2024, so lending, incubation and co-operative support now sit in one agency aimed at businesses banks won't fund.",
            incorrect: "SEDFA gives government-backed SME loans and support, cheaper, and aimed at businesses banks won't fund. Not free equity.",
          },
        },
      },
      {
        variantId: "bfa-fund-gov-tf",
        step: {
          type: "true-false",
          statement: "Government grants (e.g. via the DTIC) are non-dilutive, you don't give up equity, but the process is bureaucratic.",
          correct: true,
          feedback: {
            correct: "Right. Grants are 'free' money in equity terms, but slow and paperwork-heavy. Many entrepreneurs never even apply.",
            incorrect: "It's true. Grants don't dilute you, but they're bureaucratic: worth pursuing for capital-intensive businesses.",
          },
        },
      },
      {
        variantId: "bfa-fund-gov-sc",
        step: {
          type: "scenario",
          question: "A capital-intensive manufacturing business needs funding but doesn't want to give up equity. A sensible avenue to explore is:",
          options: [
            "Government/development finance , often cheaper or non-dilutive",
            "Only handing over 40% to a VC",
            "Doing nothing",
            "Only a personal credit card",
          ],
          correct: 0,
          feedback: {
            correct: "Right. For capital-heavy businesses, development finance and grants can beat both dilution and expensive short-term credit.",
            incorrect: "Development finance (SEDFA/IDC) and DTIC grants fit here, cheaper or non-dilutive, unlike VC equity or a credit card.",
          },
        },
      },
    ],
  },
  {
    slotId: "business-finance-advanced/business-funding/vc-valuation",
    conceptId: "business-funding",
    variants: [
      {
        variantId: "bfa-fund-vc-mcq",
        step: {
          type: "mcq",
          question: "A VC offers R10m for 35% equity. The implied post-money valuation is about:",
          options: ["R28.6 million", "R10 million", "R3.5 million", "R100 million"],
          correct: 0,
          feedback: {
            correct: "Right: R10m ÷ 0.35 ≈ R28.6m post-money (so ~R18.6m pre-money). Whether it's a good deal also depends on the VC's value-add.",
            incorrect: "R10m ÷ 35% ≈ R28.6m post-money. The percentage alone doesn't tell you if it's fair. The pre-money value and VC's help matter.",
          },
        },
      },
      {
        variantId: "bfa-fund-vc-tf",
        step: {
          type: "true-false",
          statement: "Beyond the price, the right investor adds networks and expertise, not just cash.",
          correct: true,
          feedback: {
            correct: "Right. A strong VC's connections and experience can matter as much as the money. The wrong one just takes equity.",
            incorrect: "It's true. The best investors bring networks, expertise and follow-on capital, not only a cheque.",
          },
        },
      },
      {
        variantId: "bfa-fund-vc-mcq2",
        step: {
          type: "mcq",
          question: "Why is bank debt usually unsuitable for a pre-profit startup with no assets?",
          options: [
            "Banks lend against assets or cash flow",
            "Banks never lend to anyone",
            "Debt is illegal for startups",
            "It dilutes equity too much",
          ],
          correct: 0,
          feedback: {
            correct: "Right. With no assets or steady cash flow to secure a loan, equity (which shares the risk) usually fits better.",
            incorrect: "Banks need assets or cash flow as security; a pre-profit startup lacks both, so equity is the more natural fit.",
          },
        },
      },
    ],
  },
  {
    slotId: "business-finance-advanced/business-funding/shareholders-agreement",
    conceptId: "business-funding",
    variants: [
      {
        variantId: "bfa-fund-sa-mcq",
        step: {
          type: "mcq",
          question: "Why is a shareholders agreement essential before taking on investment or a co-owner?",
          options: [
            "It governs exits, disputes, death and deadlock. The Companies Act defaults are rarely what you want",
            "It's legally optional and pointless",
            "It sets your company tax rate",
            "It replaces the need for a will",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Clauses like tag/drag-along, first refusal, deadlock resolution and buyout-on-death prevent expensive future fights.",
            incorrect: "It governs the hard scenarios: exits, disputes, deadlock, death. Without it, unhelpful Companies Act defaults apply.",
          },
        },
      },
      {
        variantId: "bfa-fund-sa-tf",
        step: {
          type: "true-false",
          statement: "A 50/50 company with no deadlock clause can be paralysed when the two owners fundamentally disagree.",
          correct: true,
          feedback: {
            correct: "Right. Neither can override the other. It can end in costly litigation or even liquidation of a profitable business.",
            incorrect: "It's true. 50/50 with no deadlock mechanism means paralysis; a 'shotgun clause' would resolve it cleanly.",
          },
        },
      },
      {
        variantId: "bfa-fund-sa-sc",
        step: {
          type: "scenario",
          question: "Thabo and Sipho own 50/50 with no deadlock clause and fundamentally disagree on a major decision. Most likely result?",
          options: [
            "Paralysis, potentially costly court action or forced liquidation",
            "The Companies Act automatically decides for them",
            "Whoever proposed the action wins by default",
            "SARS steps in to run the company",
          ],
          correct: 0,
          feedback: {
            correct: "Right. With no agreed mechanism, a 50/50 split stalls, and resolving it in court is slow and expensive.",
            incorrect: "It's paralysis. There's no automatic tiebreak in law; a deadlock clause (e.g. a shotgun clause) is what prevents this.",
          },
        },
      },
    ],
  },
];

const fundLayout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Debt, Equity, and Government",
    content:
      "<p>Funding runs from cheapest-in-control to most-dilutive: <strong>bootstrapping</strong> (self-funded, slow), <strong>government finance and grants</strong> (SEFA loans, IDC, DTIC grants, cheaper or non-dilutive but bureaucratic), <strong>debt</strong> (interest, but you keep your equity), and <strong>equity</strong> (angels, VC. Cash and expertise, but you give up ownership and some control).</p><p>The core trade-off: debt keeps ownership but must be repaid; equity shares the risk but dilutes you. And before any co-owner or investor comes in, a <strong>shareholders agreement</strong> (covering exits, disputes, deadlock and death) is non-negotiable.</p>",
  },
  { slot: "business-finance-advanced/business-funding/debt-vs-equity" },
  { slot: "business-finance-advanced/business-funding/government" },
  { slot: "business-finance-advanced/business-funding/vc-valuation" },
  { slot: "business-finance-advanced/business-funding/shareholders-agreement" },
];

// ═══════════════════════════════════════════════════════════════════════════

export const BUSINESS_FINANCE_ADVANCED_BANKS: Record<string, LessonBank> = {
  "business-finance-advanced::company-structures-sa": { layout: structLayout, slots: structSlots },
  "business-finance-advanced::reading-financial-statements": { layout: fsLayout, slots: fsSlots },
  "business-finance-advanced::business-valuation": { layout: valLayout, slots: valSlots },
  "business-finance-advanced::business-funding": { layout: fundLayout, slots: fundSlots },
};
