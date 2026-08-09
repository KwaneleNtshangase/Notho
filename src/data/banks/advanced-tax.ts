import type { LessonLayoutItem, QuestionSlot } from "@/data/content";
import type { LessonBank } from "./money-basics";

/**
 * Bank for "Advanced Tax Planning" (Level 3).
 *
 * Figures current for the 2027 tax year (from 1 March 2026), verified against
 * SARS/Budget 2026:
 *  - CGT individual inclusion 40%; top-bracket effective rate 18% (45%×40%).
 *  - Annual CGT exclusion R50 000 (up from R40 000); primary-residence
 *    exclusion R3 000 000 (up from R2 000 000) — both from Budget 2026.
 *  - Company income tax 27%; dividends withholding tax 20% (≈41.6% combined).
 *  - Trusts: flat 45%, 80% CGT inclusion (≈36% effective); conduit principle.
 *  - Foreign employment exemption (s10(1)(o)(ii)) R1.25m, 183/60-day rule;
 *    residence-based worldwide taxation; s6quat foreign tax credits.
 * (The legacy Level-3 steps still show the old R40 000 / R2 000 000 figures;
 *  this bank layout supersedes them at render time.)
 */

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 1 · CGT: The Full Picture  (advanced-tax::cgt-fundamentals)
// ═══════════════════════════════════════════════════════════════════════════

const cgtSlots: QuestionSlot[] = [
  {
    slotId: "advanced-tax/cgt-fundamentals/inclusion",
    conceptId: "capital-gains-tax",
    variants: [
      {
        variantId: "atx-cgt-inc-mcq",
        step: {
          type: "mcq",
          question: "An individual in the 45% tax bracket has an effective CGT rate of about:",
          options: ["18%", "45%", "40%", "27%"],
          correct: 0,
          feedback: {
            correct: "Right. Only 40% of the gain is included, then taxed at your marginal rate: 45% × 40% = 18% effective at the top.",
            incorrect: "It's 18%. Just 40% of the gain is included, and 45% × 40% = 18%. Never the full 45%.",
          },
        },
      },
      {
        variantId: "atx-cgt-inc-tf",
        step: {
          type: "true-false",
          statement: "CGT is a separate tax in South Africa, with its own dedicated rate.",
          correct: false,
          feedback: {
            correct: "Correct. It's not separate. A portion of the gain is added to your taxable income and taxed at your normal rates.",
            incorrect: "It isn't separate. CGT is a top-up to income tax: part of the gain is included and taxed at your marginal rate.",
          },
        },
      },
      {
        variantId: "atx-cgt-inc-mcq2",
        step: {
          type: "mcq",
          question: "For an individual, what portion of a capital gain is included in taxable income?",
          options: ["40%", "80%", "100%", "20%"],
          correct: 0,
          feedback: {
            correct: "Right. Individuals include 40% of the gain. (Companies and trusts include 80%.)",
            incorrect: "Individuals include 40% of the gain. The 80% inclusion applies to companies and trusts.",
          },
        },
      },
    ],
  },
  {
    slotId: "advanced-tax/cgt-fundamentals/exclusions",
    conceptId: "capital-gains-tax",
    variants: [
      {
        variantId: "atx-cgt-exc-mcq",
        step: {
          type: "mcq",
          question: "The annual CGT exclusion for individuals (from Budget 2026) is:",
          options: ["R50 000", "R40 000", "R30 000", "R23 800"],
          correct: 0,
          feedback: {
            correct: "Right. It rose to R50 000 (from R40 000) in Budget 2026. Don't confuse it with the R23 800 interest exemption.",
            incorrect: "It's R50 000 from Budget 2026 (was R40 000). R23 800 is the separate annual interest exemption.",
          },
        },
      },
      {
        variantId: "atx-cgt-exc-mcq2",
        step: {
          type: "mcq",
          question: "The primary-residence CGT exclusion is now:",
          options: ["R3 million", "R2 million", "R1 million", "R5 million"],
          correct: 0,
          feedback: {
            correct: "Right. Budget 2026 raised it to R3 million (from R2 million): the first increase since 2012.",
            incorrect: "It's R3 million now (raised from R2 million in Budget 2026). That's the gain on your main home that's excluded.",
          },
        },
      },
      {
        variantId: "atx-cgt-exc-fill",
        step: {
          type: "fill-blank",
          title: "After the annual exclusion",
          prompt: "You realise a R90 000 capital gain. After the R50 000 annual exclusion, the gain that goes forward (before the 40% inclusion) is R____.",
          correct: 40000,
          feedback: {
            correct: "Right: R90 000 − R50 000 = R40 000. Then 40% of that (R16 000) is added to your taxable income.",
            incorrect: "R90 000 − R50 000 exclusion = R40 000. Only then is the 40% inclusion applied.",
          },
        },
      },
    ],
  },
  {
    slotId: "advanced-tax/cgt-fundamentals/calculation",
    conceptId: "capital-gains-tax",
    variants: [
      {
        variantId: "atx-cgt-calc-mcq",
        step: {
          type: "mcq",
          question: "You buy shares for R200 000 and sell for R480 000 (gain R280 000), in the 45% bracket. After the R50 000 annual exclusion, your CGT is about:",
          options: [
            "R41 400 (R230 000 × 40% × 45%)",
            "R126 000 (45% of the full gain)",
            "R112 000 (40% of the full gain)",
            "R18 000",
          ],
          correct: 0,
          feedback: {
            correct: "Right: R280 000 − R50 000 = R230 000; × 40% = R92 000 included; × 45% = R41 400. Effective 18% of the taxable gain.",
            incorrect: "R280 000 − R50 000 = R230 000; × 40% inclusion = R92 000; × 45% = R41 400. Never 45% of the whole gain.",
          },
        },
      },
      {
        variantId: "atx-cgt-calc-sc",
        step: {
          type: "scenario",
          question: "Which of these triggers CGT?",
          options: [
            "Selling, gifting, or emigrating with an asset",
            "Earning your monthly salary",
            "Holding shares that have risen in value",
            "Opening a savings account",
          ],
          correct: 0,
          feedback: {
            correct: "Right. CGT is triggered by a disposal, including a gift or emigration, not just a sale for cash.",
            incorrect: "It's a disposal (sale, gift, emigration) that triggers CGT. A paper gain on something you still hold isn't taxed yet.",
          },
        },
      },
      {
        variantId: "atx-cgt-calc-tf",
        step: {
          type: "true-false",
          statement: "Gifting shares to a friend triggers no CGT because no money changes hands.",
          correct: false,
          feedback: {
            correct: "Correct. A gift is a deemed disposal at market value. The donor pays CGT on the gain as if they'd sold.",
            incorrect: "It does trigger CGT. SARS treats a gift as a disposal at market value, so the donor is taxed on the gain.",
          },
        },
      },
    ],
  },
  {
    slotId: "advanced-tax/cgt-fundamentals/minimisation",
    conceptId: "capital-gains-tax",
    variants: [
      {
        variantId: "atx-cgt-min-mcq",
        step: {
          type: "mcq",
          question: "Which is a legal way to reduce a CGT bill?",
          options: [
            "Realise losses in the same year to offset gains before the inclusion rate applies",
            "Simply not declaring the gain",
            "Paying the buyer in cash",
            "Backdating the sale",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Loss harvesting offsets gains rand-for-rand. Spreading sales across years to use each annual exclusion also helps.",
            incorrect: "The legal tool is harvesting losses to offset gains. The others are evasion or fraud, not planning.",
          },
        },
      },
      {
        variantId: "atx-cgt-min-tf",
        step: {
          type: "true-false",
          statement: "Assets held inside a Tax-Free Savings Account are exempt from CGT.",
          correct: true,
          feedback: {
            correct: "Right. Growth inside a TFSA, including capital gains, is entirely tax-free, which is why growth assets suit it.",
            incorrect: "They are exempt. A TFSA shelters qualifying growth from CGT (and from tax on interest and dividends) completely.",
          },
        },
      },
      {
        variantId: "atx-cgt-min-sc",
        step: {
          type: "scenario",
          question: "Zanele has R500 000 of unrealised gains and R180 000 of unrealised losses this tax year, and wants to unlock the gains. Most tax-efficient?",
          options: [
            "Realise both, net gain R320 000, less the exclusion, is taxed",
            "Sell only the winners and ignore the losers",
            "Gift the winners to her spouse to avoid CGT entirely",
            "Hold everything. CGT only applies when you need the cash",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The R180 000 loss offsets the gain → net R320 000; after the R50 000 exclusion, R270 000 is taxed. Harvesting the loss saves real tax.",
            incorrect: "Realise the loss too: it offsets the gain rand-for-rand. (A spousal transfer only defers CGT; it doesn't avoid it.)",
          },
        },
      },
    ],
  },
];

const cgtLayout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "What CGT Is, and the Effective Rate",
    content:
      "<p>Capital Gains Tax isn't a separate tax in SA. It's a top-up to income tax. When you <strong>dispose</strong> of an asset (sell, gift, emigrate, or die), a portion of the profit is added to your taxable income.</p><p>Individuals include <strong>40%</strong> of the gain; at the top 45% bracket that's an <strong>18% effective</strong> rate (45% × 40%), not 45%. Two shields help: an <strong>annual exclusion of R50 000</strong> and a <strong>primary-residence exclusion of R3 000 000</strong> (both raised in Budget 2026).</p>",
  },
  { slot: "advanced-tax/cgt-fundamentals/inclusion" },
  { slot: "advanced-tax/cgt-fundamentals/exclusions" },
  { slot: "advanced-tax/cgt-fundamentals/calculation" },
  { slot: "advanced-tax/cgt-fundamentals/minimisation" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 2 · Dividend vs Salary  (advanced-tax::dividend-vs-salary)
// ═══════════════════════════════════════════════════════════════════════════

const divSlots: QuestionSlot[] = [
  {
    slotId: "advanced-tax/dividend-vs-salary/routes",
    conceptId: "dividend-vs-salary",
    variants: [
      {
        variantId: "atx-dv-rt-mcq",
        step: {
          type: "mcq",
          question: "A Pty Ltd owner can extract profit mainly three ways. Which list is right?",
          options: [
            "Salary, dividend, or loan account",
            "Salary, gift, or lottery",
            "Only a salary",
            "Only a dividend",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Salary (deductible, taxed in your hands), dividend (from after-tax profit), or a loan account (with s7C interest rules).",
            incorrect: "The three routes are salary, dividend, and loan account, each taxed differently.",
          },
        },
      },
      {
        variantId: "atx-dv-rt-tf",
        step: {
          type: "true-false",
          statement: "A salary paid by your company is tax-deductible for the company, while a dividend is paid from after-tax profit.",
          correct: true,
          feedback: {
            correct: "Right. That deductibility is the key difference. Salary reduces company tax; dividends come after the 27% has been paid.",
            incorrect: "It's true. Salary is a deductible expense; dividends are paid out of profit that has already been taxed at 27%.",
          },
        },
      },
      {
        variantId: "atx-dv-rt-mcq2",
        step: {
          type: "mcq",
          question: "Drawing money from your company as a 'loan account' to yourself:",
          options: [
            "Is allowed but must carry interest at the official rate (s7C)",
            "Is completely tax-free forever",
            "Is illegal in South Africa",
            "Avoids all company tax",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Loan accounts trigger s7C interest rules, useful short-term, but not a way to permanently take profit tax-free.",
            incorrect: "A loan account is allowed but attracts s7C interest requirements. It's not a tax-free long-term solution.",
          },
        },
      },
    ],
  },
  {
    slotId: "advanced-tax/dividend-vs-salary/salary",
    conceptId: "dividend-vs-salary",
    variants: [
      {
        variantId: "atx-dv-sal-mcq",
        step: {
          type: "mcq",
          question: "Your Pty Ltd pays you R200 000 as salary and you're in the 45% bracket. Roughly what do you keep?",
          options: [
            "About R110 000",
            "The full R200 000. Salary is untaxed",
            "About R146 000 (company saves 27%)",
            "About R58 000",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Salary is deductible for the company (no 27% there), but you pay income tax on it: ≈R110 000 net at 45%.",
            incorrect: "Salary avoids company tax but is taxed in your hands. At 45%, R200 000 leaves roughly R110 000 net.",
          },
        },
      },
      {
        variantId: "atx-dv-sal-tf",
        step: {
          type: "true-false",
          statement: "Because a salary is deductible for the company, it isn't subject to the 27% company tax.",
          correct: true,
          feedback: {
            correct: "Right. The salary is an expense that reduces company profit, so no company tax is paid on that amount, only your income tax.",
            incorrect: "It's true. A deductible salary escapes the 27% company tax; the tax happens in your hands at your marginal rate.",
          },
        },
      },
      {
        variantId: "atx-dv-sal-sc",
        step: {
          type: "scenario",
          question: "Why might a lower-earning owner prefer a salary over a dividend?",
          options: [
            "Salary uses the tax rebates and lower brackets",
            "Salary is always tax-free",
            "Dividends are illegal for small companies",
            "Salary avoids all tax at every income level",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Below the dividend's ~41.6% effective load, a salary taxed through low brackets and rebates often wins.",
            incorrect: "The reason is brackets and rebates: modest salary is taxed lightly, often beating the ~41.6% dividend load.",
          },
        },
      },
    ],
  },
  {
    slotId: "advanced-tax/dividend-vs-salary/dividend",
    conceptId: "dividend-vs-salary",
    variants: [
      {
        variantId: "atx-dv-div-mcq",
        step: {
          type: "mcq",
          question: "A dividend is paid from after-tax profit. What's the combined effective tax (company + dividends tax)?",
          options: [
            "About 41.6%",
            "Exactly 20%",
            "Exactly 27%",
            "Exactly 0%",
          ],
          correct: 0,
          feedback: {
            correct: "Right. R100 profit → R27 company tax → R73 → 20% dividends tax (R14.60) → R58.40 in hand. ≈41.6% total.",
            incorrect: "It's ≈41.6%: 27% company tax first, then 20% dividends tax on what remains. Not 20% or 27% alone.",
          },
        },
      },
      {
        variantId: "atx-dv-div-fill",
        step: {
          type: "fill-blank",
          title: "Dividends tax rate",
          prompt: "After a company pays 27% income tax, a dividend to an individual attracts dividends withholding tax at a rate of ____%.",
          correct: 20,
          feedback: {
            correct: "Right: 20% dividends withholding tax on the dividend, on top of the 27% already paid by the company.",
            incorrect: "It's 20%. The dividends withholding tax is 20%, applied after the company's 27% income tax.",
          },
        },
      },
      {
        variantId: "atx-dv-div-tf",
        step: {
          type: "true-false",
          statement: "A dividend avoids UIF and pension obligations that a salary would create.",
          correct: true,
          feedback: {
            correct: "Right. Dividends aren't remuneration, so no UIF or pension contributions attach, one reason owners use them.",
            incorrect: "It's true. A dividend isn't remuneration, so it carries no UIF or pension obligations, unlike a salary.",
          },
        },
      },
    ],
  },
  {
    slotId: "advanced-tax/dividend-vs-salary/which-wins",
    conceptId: "dividend-vs-salary",
    variants: [
      {
        variantId: "atx-dv-win-mcq",
        step: {
          type: "mcq",
          question: "At the very top bracket, per R100 of company profit, a dividend versus a salary:",
          options: [
            "Leaves slightly more in hand",
            "Leaves far less",
            "Is exactly the same",
            "Is tax-free either way",
          ],
          correct: 0,
          feedback: {
            correct: "Right. At 45%, the dividend's ≈41.6% load beats a 45% salary by a few rand per R100. The gap is small.",
            incorrect: "The dividend edges ahead at the top (≈R58.40 vs ≈R55 per R100). The margin is small, though.",
          },
        },
      },
      {
        variantId: "atx-dv-win-tf",
        step: {
          type: "true-false",
          statement: "There's a single 'best' extraction method that's right for every business owner.",
          correct: false,
          feedback: {
            correct: "Correct. It depends on your bracket and needs: most owners use a mix of salary and dividends, not one or the other.",
            incorrect: "There isn't. The right split depends on your income level and goals; a blend of salary and dividend usually wins.",
          },
        },
      },
      {
        variantId: "atx-dv-win-sc",
        step: {
          type: "scenario",
          question: "A top-bracket owner wants to extract R100 000 of profit as tax-efficiently as possible. A reasonable takeaway is:",
          options: [
            "A dividend is marginally better here, but a salary/dividend mix is usually best overall",
            "Always take the whole amount as salary",
            "Dividends are never worth it",
            "Take it as an untaxed loan permanently",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The dividend wins slightly at the top, but blending, a modest salary plus dividends, typically optimises the total.",
            incorrect: "At the top the dividend edges it, but the practical answer is a mix. A permanent untaxed loan isn't an option (s7C).",
          },
        },
      },
    ],
  },
];

const divLayout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "How Business Owners Extract Wealth",
    content:
      "<p>When your Pty Ltd makes a profit, there are three main ways to take money out. <strong>Salary:</strong> deductible for the company, taxed in your hands at up to 45%. <strong>Dividend:</strong> paid from after-tax profit, 27% company tax, then 20% dividends withholding tax, about <strong>41.6% combined</strong>. <strong>Loan account:</strong> allowed, but must carry interest at the official rate (s7C), so it's not a long-term plan.</p><p>At the very top bracket a dividend edges out a salary (≈R58.40 vs ≈R55 per R100 of profit), but lower down a salary using rebates and lower brackets often wins, so most owners use a mix.</p>",
  },
  { slot: "advanced-tax/dividend-vs-salary/routes" },
  { slot: "advanced-tax/dividend-vs-salary/salary" },
  { slot: "advanced-tax/dividend-vs-salary/dividend" },
  { slot: "advanced-tax/dividend-vs-salary/which-wins" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 3 · Trusts as a Tax Vehicle  (advanced-tax::trust-tax-vehicle)
// ═══════════════════════════════════════════════════════════════════════════

const trustSlots: QuestionSlot[] = [
  {
    slotId: "advanced-tax/trust-tax-vehicle/flat-rate",
    conceptId: "trust-tax",
    variants: [
      {
        variantId: "atx-tr-fr-mcq",
        step: {
          type: "mcq",
          question: "Income retained inside a South African trust is taxed at:",
          options: ["A flat 45%", "18% always", "0%. Trusts are exempt", "27%, the company rate"],
          correct: 0,
          feedback: {
            correct: "Right. A trust that keeps income is taxed at a flat 45%, the harshest rate, with no rebates or exclusions.",
            incorrect: "Retained trust income is taxed at a flat 45%, with none of the rebates individuals get.",
          },
        },
      },
      {
        variantId: "atx-tr-fr-tf",
        step: {
          type: "true-false",
          statement: "A trust gets the same annual rebates and CGT exclusion that an individual does.",
          correct: false,
          feedback: {
            correct: "Correct. Trusts get no rebates and no annual CGT exclusion: one reason retaining income in a trust is tax-expensive.",
            incorrect: "It doesn't. Trusts receive no rebates and no annual exclusions, unlike individuals. That's the trade-off.",
          },
        },
      },
      {
        variantId: "atx-tr-fr-mcq2",
        step: {
          type: "mcq",
          question: "A trust's CGT inclusion rate is 80%. At the 45% trust rate, the effective CGT on a gain retained in the trust is about:",
          options: ["36%", "18%", "45%", "20%"],
          correct: 0,
          feedback: {
            correct: "Right. 80% inclusion × 45% = 36% effective. Double the 18% an individual pays on the same gain.",
            incorrect: "It's 36%: 80% inclusion × 45% rate. That's twice an individual's 18% effective CGT.",
          },
        },
      },
    ],
  },
  {
    slotId: "advanced-tax/trust-tax-vehicle/conduit",
    conceptId: "trust-tax",
    variants: [
      {
        variantId: "atx-tr-cd-mcq",
        step: {
          type: "mcq",
          question: "The 'conduit principle' lets a trust reduce tax by:",
          options: [
            "Distributing income to beneficiaries in the same year",
            "Never paying any tax at all",
            "Converting income into a company dividend",
            "Ignoring SARS entirely",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Income that flows through to beneficiaries in the same tax year is taxed at their rates, not the flat 45%.",
            incorrect: "The conduit principle passes income to beneficiaries the same year, taxing it in their hands, usually below 45%.",
          },
        },
      },
      {
        variantId: "atx-tr-cd-tf",
        step: {
          type: "true-false",
          statement: "Income kept in the trust is taxed at 45%, but income distributed to beneficiaries the same year is taxed at their own rates.",
          correct: true,
          feedback: {
            correct: "Right. That's the core planning move, distribute rather than retain, to access beneficiaries' lower brackets.",
            incorrect: "It's true. Retain and it's 45%; distribute in the same year and the beneficiary is taxed at their (often lower) rate.",
          },
        },
      },
      {
        variantId: "atx-tr-cd-sc",
        step: {
          type: "scenario",
          question: "A trust earns R300 000. Its three adult beneficiaries have little other income. The tax-efficient move is usually to:",
          options: [
            "Distribute the income to the beneficiaries so it's taxed in their lower brackets",
            "Retain it in the trust at 45%",
            "Hide it from SARS",
            "Convert the trust into a company",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Spreading R300 000 across three low-income beneficiaries taxes it far below the flat 45% a retained amount attracts.",
            incorrect: "Distribute it. Taxing it in low-income beneficiaries' hands beats the flat 45% on income retained in the trust.",
          },
        },
      },
    ],
  },
  {
    slotId: "advanced-tax/trust-tax-vehicle/why-use",
    conceptId: "trust-tax",
    variants: [
      {
        variantId: "atx-tr-wy-mcq",
        step: {
          type: "mcq",
          question: "Despite the 45% rate, why do people still use trusts?",
          options: [
            "Estate planning and asset protection",
            "Trusts are always the lowest-tax option",
            "Trusts are exempt from all tax",
            "The law requires everyone to have one",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The draw is protection and estate planning. Trust assets sit outside your estate, reducing estate duty and shielding assets.",
            incorrect: "It's about estate planning and asset protection, not a lower tax rate. Trust assets fall outside your personal estate.",
          },
        },
      },
      {
        variantId: "atx-tr-wy-tf",
        step: {
          type: "true-false",
          statement: "Assets properly held in a trust generally fall outside your personal estate for estate-duty purposes.",
          correct: true,
          feedback: {
            correct: "Right. That's a central estate-planning benefit. Growth happens outside your estate, limiting future estate duty.",
            incorrect: "It's true. Assets in a trust aren't part of your personal estate, which is why trusts feature in estate planning.",
          },
        },
      },
      {
        variantId: "atx-tr-wy-sc",
        step: {
          type: "scenario",
          question: "Someone sets up a trust expecting it to slash their income tax. What's the reality?",
          options: [
            "Retained trust income is taxed at a harsh 45%. Trusts are for protection and estate planning, not a low tax rate",
            "Trusts always cut income tax to near zero",
            "Trusts are illegal tax shelters",
            "Trust income is never taxed",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The benefit is structural (protection, estate planning), not a low rate. Retained income is taxed at 45%.",
            incorrect: "Trusts don't slash income tax. Retained income is taxed at 45%. Their value is asset protection and estate planning.",
          },
        },
      },
    ],
  },
  {
    slotId: "advanced-tax/trust-tax-vehicle/loans-s7c",
    conceptId: "trust-tax",
    variants: [
      {
        variantId: "atx-tr-s7c-mcq",
        step: {
          type: "mcq",
          question: "You lend money interest-free to your family trust. What does s7C do?",
          options: [
            "Treats the forgone interest as an ongoing donation",
            "Makes the loan completely tax-free",
            "Bans loans to trusts",
            "Converts the loan into a salary",
          ],
          correct: 0,
          feedback: {
            correct: "Right. s7C targets interest-free (or low-interest) loans to trusts: the shortfall is treated as a donation each year.",
            incorrect: "s7C treats the missing interest on a low/interest-free loan to a trust as a deemed donation: potentially donations tax.",
          },
        },
      },
      {
        variantId: "atx-tr-s7c-tf",
        step: {
          type: "true-false",
          statement: "Interest-free loans to a trust are completely ignored by SARS.",
          correct: false,
          feedback: {
            correct: "Correct. s7C exists precisely to catch them. The forgone interest is treated as a donation.",
            incorrect: "They're not ignored. s7C treats the forgone interest on such loans as a deemed donation, which can be taxed.",
          },
        },
      },
      {
        variantId: "atx-tr-s7c-sc",
        step: {
          type: "scenario",
          question: "Why did SARS introduce s7C for loans to trusts?",
          options: [
            "To stop people shifting wealth into trusts interest-free without any tax consequence",
            "To ban all trusts",
            "To make trust income tax-free",
            "To force trusts to become companies",
          ],
          correct: 0,
          feedback: {
            correct: "Right. It closed a loophole where value was moved into trusts via interest-free loans with no tax cost.",
            incorrect: "s7C closed the interest-free-loan loophole for shifting wealth into trusts, it doesn't ban trusts or make them tax-free.",
          },
        },
      },
    ],
  },
];

const trustLayout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Trusts: Taxed Hard, Used for Protection",
    content:
      "<p>Income <strong>retained</strong> in a South African trust is taxed at a flat <strong>45%</strong>, with an 80% CGT inclusion (an effective 36% on gains) and no rebates or exclusions. So a trust is not an income-tax saver.</p><p>The planning tool is the <strong>conduit principle</strong>: income distributed to beneficiaries in the same tax year is taxed in their (often lower) hands instead. People use trusts mainly for <strong>estate planning and asset protection</strong>. Assets held in a trust fall outside your personal estate. Note s7C: interest-free loans to a trust are treated as ongoing donations.</p>",
  },
  { slot: "advanced-tax/trust-tax-vehicle/flat-rate" },
  { slot: "advanced-tax/trust-tax-vehicle/conduit" },
  { slot: "advanced-tax/trust-tax-vehicle/why-use" },
  { slot: "advanced-tax/trust-tax-vehicle/loans-s7c" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 4 · Foreign Income  (advanced-tax::foreign-income-tax)
// ═══════════════════════════════════════════════════════════════════════════

const foreignSlots: QuestionSlot[] = [
  {
    slotId: "advanced-tax/foreign-income-tax/worldwide",
    conceptId: "foreign-income",
    variants: [
      {
        variantId: "atx-fi-ww-mcq",
        step: {
          type: "mcq",
          question: "How does SA tax a person who is a South African tax resident?",
          options: [
            "On their worldwide income",
            "Only on income earned inside SA",
            "Only on income earned abroad",
            "Not at all if any income is foreign",
          ],
          correct: 0,
          feedback: {
            correct: "Right. SA uses residence-based taxation. Residents are taxed on income from anywhere in the world.",
            incorrect: "SA taxes residents on worldwide income. Where the money is earned doesn't remove it from SA's net.",
          },
        },
      },
      {
        variantId: "atx-fi-ww-tf",
        step: {
          type: "true-false",
          statement: "A South African tax resident's foreign income is automatically tax-free in SA.",
          correct: false,
          feedback: {
            correct: "Correct. Residents are taxed on worldwide income. Specific exemptions and foreign tax credits may apply, but it isn't automatically free.",
            incorrect: "It isn't automatic. SA taxes residents' worldwide income; relief comes only through specific exemptions and credits.",
          },
        },
      },
      {
        variantId: "atx-fi-ww-mcq2",
        step: {
          type: "mcq",
          question: "A NON-resident (for tax) is generally taxed by SA on:",
          options: ["Only SA-source income", "Their worldwide income", "Nothing, ever", "Only foreign income"],
          correct: 0,
          feedback: {
            correct: "Right. Non-residents are taxed only on income from an SA source. That's the key difference from residents.",
            incorrect: "Non-residents are taxed only on SA-source income. Worldwide taxation applies to residents, not non-residents.",
          },
        },
      },
    ],
  },
  {
    slotId: "advanced-tax/foreign-income-tax/exemption",
    conceptId: "foreign-income",
    variants: [
      {
        variantId: "atx-fi-ex-mcq",
        step: {
          type: "mcq",
          question: "The foreign employment income exemption (s10(1)(o)(ii)) exempts foreign salary up to:",
          options: ["R1.25 million a year", "R500 000 a year", "Unlimited", "R23 800 a year"],
          correct: 0,
          feedback: {
            correct: "Right. Up to R1.25 million of qualifying foreign employment income is exempt; anything above is taxed normally in SA.",
            incorrect: "The cap is R1.25 million a year. Foreign employment income above that is taxed in SA at normal rates.",
          },
        },
      },
      {
        variantId: "atx-fi-ex-mcq2",
        step: {
          type: "mcq",
          question: "To qualify for the foreign employment exemption, you must spend, in a 12-month period, more than:",
          options: [
            "183 days abroad, including a continuous stretch of at least 60 days",
            "30 days abroad",
            "365 days abroad",
            "90 days abroad, all continuous",
          ],
          correct: 0,
          feedback: {
            correct: "Right. More than 183 full days outside SA, with at least one unbroken 60-day period, working abroad.",
            incorrect: "It's more than 183 days abroad in 12 months, including a continuous 60-day stretch.",
          },
        },
      },
      {
        variantId: "atx-fi-ex-tf",
        step: {
          type: "true-false",
          statement: "Foreign employment income above R1.25 million is taxed in SA even if you already paid some tax abroad.",
          correct: true,
          feedback: {
            correct: "Right, but a foreign tax credit (s6quat) offsets the foreign tax paid, so the same income isn't taxed twice in full.",
            incorrect: "It is taxable above R1.25m, though s6quat gives a credit for foreign tax paid, preventing full double taxation.",
          },
        },
      },
    ],
  },
  {
    slotId: "advanced-tax/foreign-income-tax/credits",
    conceptId: "foreign-income",
    variants: [
      {
        variantId: "atx-fi-cr-mcq",
        step: {
          type: "mcq",
          question: "You pay tax on foreign income abroad AND it's taxable in SA. What stops it being taxed twice in full?",
          options: [
            "A foreign tax credit for the tax already paid overseas",
            "Nothing. You pay full tax twice",
            "SA simply ignores the income",
            "You must renounce SA residency",
          ],
          correct: 0,
          feedback: {
            correct: "Right. s6quat credits the foreign tax you've paid against your SA liability on that same income.",
            incorrect: "The relief is the s6quat foreign tax credit, it offsets overseas tax against your SA bill on the same income.",
          },
        },
      },
      {
        variantId: "atx-fi-cr-tf",
        step: {
          type: "true-false",
          statement: "Foreign tax credits (s6quat) can reduce your SA tax on income that was already taxed abroad.",
          correct: true,
          feedback: {
            correct: "Right. That's their purpose: to prevent double taxation by crediting the foreign tax already paid.",
            incorrect: "They can. s6quat credits foreign tax paid against your SA liability on the same income, avoiding double tax.",
          },
        },
      },
      {
        variantId: "atx-fi-cr-sc",
        step: {
          type: "scenario",
          question: "Sipho, an SA tax resident, earns R2 million abroad and pays some foreign tax. How is he taxed in SA?",
          options: [
            "R1.25m may be exempt",
            "The full R2m is tax-free in SA",
            "He pays full SA tax on R2m with no relief",
            "He owes nothing anywhere",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Up to R1.25m can be exempt; the balance is taxed in SA, with a foreign tax credit for what he paid overseas.",
            incorrect: "If he qualifies, R1.25m is exempt; the rest is taxed in SA, reduced by a s6quat credit for the foreign tax paid.",
          },
        },
      },
    ],
  },
  {
    slotId: "advanced-tax/foreign-income-tax/residency",
    conceptId: "foreign-income",
    variants: [
      {
        variantId: "atx-fi-res-mcq",
        step: {
          type: "mcq",
          question: "Why does tax residency matter so much for foreign income?",
          options: [
            "Residents are taxed on worldwide income; non-residents only on SA-source income",
            "Residents pay no tax at all",
            "Non-residents are taxed on worldwide income",
            "Residency has no tax effect",
          ],
          correct: 0,
          feedback: {
            correct: "Right. It's the dividing line, residence pulls your global income into the SA net; non-residence limits it to SA-source.",
            incorrect: "Residency is the key: residents are taxed worldwide, non-residents only on SA-source income.",
          },
        },
      },
      {
        variantId: "atx-fi-res-tf",
        step: {
          type: "true-false",
          statement: "Simply leaving South Africa for a while automatically ends your SA tax residency.",
          correct: false,
          feedback: {
            correct: "Correct. Ceasing residency is a formal test (and process with SARS), not something that happens just by travelling.",
            incorrect: "It doesn't happen automatically. Ending tax residency involves specific tests and a formal process with SARS.",
          },
        },
      },
      {
        variantId: "atx-fi-res-sc",
        step: {
          type: "scenario",
          question: "Lerato works abroad for a few months but stays an SA tax resident. Her foreign salary is:",
          options: [
            "Part of her worldwide income taxable in SA",
            "Completely outside SA's tax net",
            "Taxed only by the foreign country, never SA",
            "Automatically exempt with no conditions",
          ],
          correct: 0,
          feedback: {
            correct: "Right. As a resident, it's in the SA net, though the R1.25m exemption and s6quat credits may reduce the SA tax.",
            incorrect: "As an SA resident, her foreign salary is taxable in SA (worldwide income), subject to the exemption and foreign tax credits.",
          },
        },
      },
    ],
  },
];

const foreignLayout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "SA Residents Are Taxed on Worldwide Income",
    content:
      "<p>South Africa uses <strong>residence-based taxation</strong>: if you're an SA tax resident, your <strong>worldwide</strong> income is taxable here. Non-residents are taxed only on SA-source income.</p><p>Two big reliefs for residents working abroad: the <strong>foreign employment exemption</strong> (s10(1)(o)(ii)), up to <strong>R1.25 million</strong> of foreign salary is exempt if you spend more than 183 days abroad (including a continuous 60-day stretch) in a 12-month period, and <strong>foreign tax credits</strong> (s6quat), which offset tax already paid overseas so the same income isn't taxed twice.</p>",
  },
  { slot: "advanced-tax/foreign-income-tax/worldwide" },
  { slot: "advanced-tax/foreign-income-tax/exemption" },
  { slot: "advanced-tax/foreign-income-tax/credits" },
  { slot: "advanced-tax/foreign-income-tax/residency" },
];

// ═══════════════════════════════════════════════════════════════════════════

export const ADVANCED_TAX_BANKS: Record<string, LessonBank> = {
  "advanced-tax::cgt-fundamentals": { layout: cgtLayout, slots: cgtSlots },
  "advanced-tax::dividend-vs-salary": { layout: divLayout, slots: divSlots },
  "advanced-tax::trust-tax-vehicle": { layout: trustLayout, slots: trustSlots },
  "advanced-tax::foreign-income-tax": { layout: foreignLayout, slots: foreignSlots },
};
