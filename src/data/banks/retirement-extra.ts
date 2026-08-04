import type { LessonLayoutItem, QuestionSlot } from "@/data/content";
import type { LessonBank } from "./money-basics";

/**
 * Premium banks for the Retirement EXTRA lessons.
 * Figures per docs/SA-REGULATORY-FIGURES.md: retirement deduction 27.5% of the
 * greater of taxable income or remuneration, capped at R430 000 a year;
 * two-pot 1/3 Savings and 2/3 Retirement, R2 000 minimum withdrawal, once per
 * tax year, taxed as income; Regulation 28 offshore limit 45%.
 * Living annuity drawdown is regulated between 2.5% and 17.5% a year.
 * Retirement fund death benefits are distributed by trustees under section 37C
 * of the Pension Funds Act; a living annuity passes to nominated beneficiaries.
 * variantId prefix: `rtx-`.
 */
const info = (title: string, content: string): LessonLayoutItem => ({ type: "info", title, content });
const L = (slots: QuestionSlot[], title: string, content: string): LessonLayoutItem[] => [
  info(title, content),
  ...slots.map((s) => ({ slot: s.slotId })),
];

// ── RA vs Pension Fund ──────────────────────────────────────────────────────
const raSlots: QuestionSlot[] = [
  {
    slotId: "retirement/ra-vs-pension/control",
    conceptId: "ra-vs-pension",
    variants: [
      { variantId: "rtx-rp-ct-mcq", step: { type: "mcq", question: "What's the main advantage of a retirement annuity over a workplace pension fund?", options: ["You control the provider, the underlying funds and the fees", "It's exempt from Regulation 28", "It has no fees", "Withdrawals are allowed at any time"], correct: 0, feedback: { correct: "Right. An RA follows you between jobs and you choose what's inside it, but both are bound by Regulation 28 and the same access rules.", incorrect: "Control is the difference. Both sit under Reg 28 and neither allows early access outside the two-pot savings component." } } },
      { variantId: "rtx-rp-ct-tf", step: { type: "true-false", statement: "You must choose between an employer pension fund and an RA, contributing to both isn't allowed.", correct: false, feedback: { correct: "Right. You can hold both; the 27.5% deduction limit simply applies to your combined contributions.", incorrect: "Both is fine. The deduction limit is combined, not per fund." } } },
      { variantId: "rtx-rp-ct-sc", step: { type: "scenario", question: "Thabo's employer pension has high fees but the employer contributes 7.5%. Should he opt out and use an RA?", options: ["No. The employer contribution is free money that usually outweighs the fee difference", "Yes, fees always matter more", "Yes, RAs always outperform", "It makes no difference either way"], correct: 0, feedback: { correct: "Right. A 7.5% employer contribution dwarfs a 1% fee gap. He can run an RA <em>alongside</em> it for the extra he wants to save.", incorrect: "Keep the employer match. Adding an RA on top gets him the control without giving up free contributions." } } },
    ],
  },
  {
    slotId: "retirement/ra-vs-pension/deduction-limit",
    conceptId: "ra-tax-deduction",
    variants: [
      { variantId: "rtx-rp-dl-fill", step: { type: "fill-blank", title: "Your deduction ceiling", prompt: "You earn R720 000 a year. The retirement fund deduction is 27.5% of taxable income. Your percentage limit = R____.", correct: 198000, feedback: { correct: "R720 000 × 27.5% = R198 000, well below the R430 000 annual cap, so the percentage is what binds.", incorrect: "R720 000 × 27.5% = R198 000." } } },
      { variantId: "rtx-rp-dl-mcq", step: { type: "mcq", question: "How does the deduction limit apply when you contribute to both a pension fund and an RA?", options: ["Both count toward one combined 27.5% limit, capped at R430 000 a year", "Each fund gets its own 27.5%", "Only the RA is deductible", "Only the pension fund is deductible"], correct: 0, feedback: { correct: "Right. Employer and employee contributions across all funds are added together against one limit.", incorrect: "It's a single combined limit across all retirement funds, not one per fund." } } },
      { variantId: "rtx-rp-dl-tf", step: { type: "true-false", statement: "Contributions above the annual deduction limit are wasted.", correct: false, feedback: { correct: "Right. Excess contributions roll forward to future tax years and reduce the taxable portion of your eventual benefit.", incorrect: "They aren't lost. Excess contributions carry forward and count later." } } },
    ],
  },
  {
    slotId: "retirement/ra-vs-pension/job-change",
    conceptId: "ra-vs-pension",
    variants: [
      { variantId: "rtx-rp-jc-mcq", step: { type: "mcq", question: "You resign and your pension fund pays out. What's the costliest option?", options: ["Taking the cash. It's taxed and the compounding is gone permanently", "Transferring to a preservation fund", "Transferring to your new employer's fund", "Transferring to an RA"], correct: 0, feedback: { correct: "Right. Cashing out is the single most damaging retirement decision most South Africans make, and it can't be undone.", incorrect: "Cashing out. All three transfer options are tax-neutral and keep the money compounding." } } },
      { variantId: "rtx-rp-jc-tf", step: { type: "true-false", statement: "Transferring a retirement benefit to a preservation fund or RA on resignation is tax-neutral.", correct: true, feedback: { correct: "Right. No tax on transfer, and the money keeps growing, which is why it's almost always the right move.", incorrect: "It's true. Transfers between approved funds don't trigger tax; only cash withdrawals do." } } },
      { variantId: "rtx-rp-jc-sc", step: { type: "scenario", question: "Nomsa, 32, resigns with R400 000 in her pension fund and wants the cash for a car. What's the real cost?", options: ["Tax on the withdrawal plus decades of lost compounding on the full amount", "Only the withdrawal tax", "Nothing. It's her money", "A small administration fee"], correct: 0, feedback: { correct: "Right. At 32, R400 000 left to compound for 30 years is a very different number from what's left after tax and a car.", incorrect: "Both the tax and the lost growth. The compounding is the larger loss by far at her age." } } },
    ],
  },
  {
    slotId: "retirement/ra-vs-pension/two-pot",
    conceptId: "two-pot-system",
    variants: [
      { variantId: "rtx-rp-tp-mcq", step: { type: "mcq", question: "How does the two-pot system split new retirement contributions?", options: ["One third to an accessible Savings component, two thirds to a locked Retirement component", "Half and half", "All accessible", "All locked until 55"], correct: 0, feedback: { correct: "Right, and the Retirement component must be used for an annuity at retirement. That's the part designed to actually last.", incorrect: "One third savings, two thirds retirement. The larger portion stays locked deliberately." } } },
      { variantId: "rtx-rp-tp-tf", step: { type: "true-false", statement: "A savings-pot withdrawal is taxed at your marginal income tax rate.", correct: true, feedback: { correct: "Right, and it's limited to one withdrawal per tax year with a R2 000 minimum, so it's a genuine emergency mechanism, not a wallet.", incorrect: "It's true. Withdrawals are added to your income and taxed at your marginal rate, which surprises many people." } } },
      { variantId: "rtx-rp-tp-sc", step: { type: "scenario", question: "Sipho wants to withdraw from his savings pot to fund a holiday. What should he weigh?", options: ["The marginal-rate tax plus the retirement income that money would have produced", "Only the administration fee", "Nothing. It's accessible for a reason", "Whether his employer approves"], correct: 0, feedback: { correct: "Right. Accessible isn't the same as free: at a 31% rate, R20 000 withdrawn is about R13 800 in hand and a permanent hole in the fund.", incorrect: "Tax plus lost growth. Accessibility was designed for genuine emergencies, not discretionary spending." } } },
    ],
  },
];

// ── Choosing When to Retire ─────────────────────────────────────────────────
const ageSlots: QuestionSlot[] = [
  {
    slotId: "retirement/age/why-earlier-costs-more",
    conceptId: "retirement-age",
    variants: [
      { variantId: "rtx-ag-wc-mcq", step: { type: "mcq", question: "Why does retiring ten years earlier require substantially more capital?", options: ["Fewer years of contributions and growth, and more years of withdrawals", "Tax rates are higher for early retirees", "Annuities are more expensive before 60", "Medical aid costs double"], correct: 0, feedback: { correct: "Right. It's a double hit. The pot has less time to grow and has to stretch over a longer retirement.", incorrect: "The pot both accumulates for less time and must fund more years. Those two effects compound." } } },
      { variantId: "rtx-ag-wc-tf", step: { type: "true-false", statement: "The last ten years before retirement typically add more to your fund than the first ten years of contributions.", correct: true, feedback: { correct: "Right. Compounding works on the largest balance you'll ever have, so those final years are disproportionately valuable.", incorrect: "It's true. Growth on a large balance dwarfs contributions to a small one, which is why early retirement is expensive." } } },
      { variantId: "rtx-ag-wc-sc", step: { type: "scenario", question: "Johan wants to retire at 55 instead of 65. What are his realistic levers?", options: ["Save considerably more now, reduce his target income, or plan part-time work", "Choose riskier investments to close the gap", "Rely on the state old age grant", "Withdraw from his savings pot each year"], correct: 0, feedback: { correct: "Right. Contribution rate, spending target and semi-retirement are the three honest levers, extra risk isn't a plan.", incorrect: "Save more, spend less, or work part-time. Taking more risk to fund an earlier date increases the chance of failure." } } },
    ],
  },
  {
    slotId: "retirement/age/semi-retirement",
    conceptId: "retirement-age",
    variants: [
      { variantId: "rtx-ag-sr-tf", step: { type: "true-false", statement: "Part-time work in early retirement can meaningfully reduce the capital you need.", correct: true, feedback: { correct: "Right. Even modest income covers part of your expenses, so the portfolio does less work in the years it can least afford to.", incorrect: "It's true, and the effect is large. Earning even a third of your needs early on takes serious pressure off the pot." } } },
      { variantId: "rtx-ag-sr-mcq", step: { type: "mcq", question: "Why does income in the early years of retirement matter more than the same income later?", options: ["It avoids drawing down capital when a market fall would do the most lasting damage", "Tax is lower in early retirement", "Medical costs are lower", "Annuity rates improve"], correct: 0, feedback: { correct: "Right. That's sequence risk. Withdrawals during an early downturn permanently reduce what's left to recover.", incorrect: "It reduces sequence risk. Selling into an early fall is what does the permanent damage." } } },
      { variantId: "rtx-ag-sr-sc", step: { type: "scenario", question: "Priya retires at 58 and can consult two days a week for R15 000 a month. How should she think about it?", options: ["As a bridge that lets her portfolio keep growing through the riskiest years", "As failure to retire properly", "As irrelevant to her plan", "As a reason to spend more"], correct: 0, feedback: { correct: "Right. R15 000 a month for five years is both income earned and capital not withdrawn, the effect compounds twice.", incorrect: "It's a bridge. Reducing early withdrawals is one of the most effective things she can do." } } },
    ],
  },
  {
    slotId: "retirement/age/the-number",
    conceptId: "retirement-number",
    variants: [
      { variantId: "rtx-ag-tn-mcq", step: { type: "mcq", question: "What's the most useful starting point for a retirement target?", options: ["Your expected annual expenses in retirement, not your current salary", "Your current salary multiplied by ten", "A round number like R5 million", "Whatever your colleagues are aiming for"], correct: 0, feedback: { correct: "Right. Expenses drive the number, and they're usually lower than your salary once the bond and the children are done.", incorrect: "Start with expenses. Salary includes contributions and costs that stop at retirement." } } },
      { variantId: "rtx-ag-tn-fill", step: { type: "fill-blank", title: "A rough target", prompt: "You expect to need R25 000 a month in retirement, or R300 000 a year. Using a 4% withdrawal rate as a rough guide, the capital needed = R____.", correct: 7500000, feedback: { correct: "R300 000 ÷ 0.04 = R7 500 000. It's a rough rule, but it turns a vague worry into a number you can work toward.", incorrect: "R300 000 ÷ 0.04 = R7 500 000." } } },
      { variantId: "rtx-ag-tn-tf", step: { type: "true-false", statement: "Your expenses in retirement are usually lower than your working expenses.", correct: true, feedback: { correct: "Right. No commuting, no retirement contributions, often no bond and no dependants. Medical costs are the offset.", incorrect: "It's usually true, though medical costs rise. Commuting, contributions and often the bond all fall away." } } },
    ],
  },
  {
    slotId: "retirement/age/sequence-risk",
    conceptId: "sequence-risk",
    variants: [
      { variantId: "rtx-ag-sq-mcq", step: { type: "mcq", question: "What is sequence of returns risk?", options: ["The risk that poor returns early in retirement permanently damage your income", "The risk of outliving your money", "The risk of inflation", "The risk of choosing the wrong annuity"], correct: 0, feedback: { correct: "Right. The same average return in a different order can produce a very different outcome once you're withdrawing.", incorrect: "It's about the order of returns. Early losses combined with withdrawals do damage that later gains can't undo." } } },
      { variantId: "rtx-ag-sq-tf", step: { type: "true-false", statement: "Holding two to three years of income in stable assets at retirement helps manage sequence risk.", correct: true, feedback: { correct: "Right. It means you can ride out a downturn without selling equities into it.", incorrect: "It's true. A cash and income buffer removes the need to sell growth assets during a fall." } } },
      { variantId: "rtx-ag-sq-sc", step: { type: "scenario", question: "Markets fall 25% in Nomsa's first year of retirement. What protects her most?", options: ["Drawing income from her stable-asset buffer instead of selling equities", "Increasing her drawdown to make up the difference", "Selling equities to move to cash", "Stopping her income entirely"], correct: 0, feedback: { correct: "Right. The buffer exists precisely for this year: it lets the equities recover untouched.", incorrect: "Draw from the buffer. Selling equities into the fall is what makes an early downturn permanent." } } },
    ],
  },
];

// ── Understanding Annuity Types ─────────────────────────────────────────────
const annSlots: QuestionSlot[] = [
  {
    slotId: "retirement/annuities/longevity-risk",
    conceptId: "annuity-types",
    variants: [
      { variantId: "rtx-an-lr-mcq", step: { type: "mcq", question: "Which type of annuity removes the risk of outliving your money?", options: ["A guaranteed annuity", "A living annuity", "A unit trust", "A fixed deposit"], correct: 0, feedback: { correct: "Right. The insurer takes the longevity risk. The trade-off is that you give up the capital and the flexibility.", incorrect: "A guaranteed life annuity. A living annuity leaves the longevity risk with you." } } },
      { variantId: "rtx-an-lr-tf", step: { type: "true-false", statement: "A living annuity is guaranteed not to run out.", correct: false, feedback: { correct: "Right. You bear the investment and longevity risk, draw too much or hit poor returns and the income declines.", incorrect: "There's no guarantee. A living annuity can be depleted, which is exactly its main risk." } } },
      { variantId: "rtx-an-lr-sc", step: { type: "scenario", question: "Johan is worried about living to 95 with no income. Which structure directly addresses that fear?", options: ["A guaranteed annuity covering at least his essential expenses", "A living annuity drawing 17.5%", "Keeping everything in cash", "Investing entirely in equities"], correct: 0, feedback: { correct: "Right. Guaranteeing the essentials means the worst case is a smaller lifestyle, not no income at all.", incorrect: "A guaranteed annuity transfers longevity risk to the insurer. A high living-annuity drawdown makes the fear more likely to materialise." } } },
    ],
  },
  {
    slotId: "retirement/annuities/living-annuity",
    conceptId: "annuity-types",
    variants: [
      { variantId: "rtx-an-la-mcq", step: { type: "mcq", question: "What are the defining features of a living annuity?", options: ["You choose the investments and a drawdown between 2.5% and 17.5% a year, and keep the capital", "The insurer guarantees your income for life", "It pays a fixed amount forever", "It can't be inherited"], correct: 0, feedback: { correct: "Right. Flexibility and inheritability are the advantages; investment and longevity risk are the price.", incorrect: "It's investor-controlled with a regulated drawdown range, and the remaining capital passes to your beneficiaries." } } },
      { variantId: "rtx-an-la-tf", step: { type: "true-false", statement: "Drawing the maximum 17.5% from a living annuity is sustainable indefinitely.", correct: false, feedback: { correct: "Right. Drawing far above what the portfolio earns depletes capital quickly, and the income falls with it.", incorrect: "It isn't sustainable. High drawdowns erode the capital, which then produces less income each year." } } },
      { variantId: "rtx-an-la-sc", step: { type: "scenario", question: "Sipho retires with R4 million in a living annuity. What drawdown gives the income the best chance of lasting?", options: ["Something near the lower end, around 4–5%, adjusted as circumstances change", "The maximum 17.5%", "Whatever covers his current lifestyle", "0%, drawing nothing"], correct: 0, feedback: { correct: "Right. Around R160 000–R200 000 a year gives the capital a realistic chance of keeping pace with inflation.", incorrect: "A conservative rate near the bottom of the range. High early drawdowns are what deplete living annuities." } } },
    ],
  },
  {
    slotId: "retirement/annuities/hybrid",
    conceptId: "annuity-types",
    variants: [
      { variantId: "rtx-an-hy-sc", step: { type: "scenario", question: "Nomsa, 65, retires with R5 million. Essentials cost R18 000 a month, discretionary spending R8 000. What's a sensible hybrid?", options: ["A guaranteed annuity covering the R18 000 essentials", "Everything in a living annuity", "Everything in a guaranteed annuity", "Keep it all in cash"], correct: 0, feedback: { correct: "Right. Essentials are guaranteed for life; the discretionary portion stays flexible and inheritable.", incorrect: "Guarantee the essentials and keep the discretionary portion flexible. That's the standard hybrid approach." } } },
      { variantId: "rtx-an-hy-mcq", step: { type: "mcq", question: "What's the appeal of splitting between a guaranteed and a living annuity?", options: ["Certainty for essential expenses, flexibility and inheritance for the rest", "Higher total income guaranteed", "Avoiding tax entirely", "Removing all investment risk"], correct: 0, feedback: { correct: "Right. It's a deliberate allocation of risk rather than an all-or-nothing bet on one structure.", incorrect: "It combines certainty where you need it with flexibility where you can afford it. Income is still taxed." } } },
      { variantId: "rtx-an-hy-tf", step: { type: "true-false", statement: "Annuity income is taxed as income in South Africa.", correct: true, feedback: { correct: "Right, at your marginal rate, which is why the tax deduction you got going in is effectively deferred, not avoided.", incorrect: "It's true. Both guaranteed and living annuity income are taxed as income." } } },
    ],
  },
  {
    slotId: "retirement/annuities/irreversible",
    conceptId: "annuity-types",
    variants: [
      { variantId: "rtx-an-ir-mcq", step: { type: "mcq", question: "What makes the guaranteed annuity decision so serious?", options: ["It's generally irreversible. The capital is exchanged for the income stream", "It can be cancelled within 30 days", "It can be converted to a living annuity later", "It has no tax consequences"], correct: 0, feedback: { correct: "Right. You can usually move from a living annuity to a guaranteed one, but not back the other way.", incorrect: "It's largely permanent. The direction of travel runs one way, so it deserves proper advice." } } },
      { variantId: "rtx-an-ir-tf", step: { type: "true-false", statement: "Adding inflation protection to a guaranteed annuity lowers the starting income.", correct: true, feedback: { correct: "Right, and it's usually worth it. A level annuity loses roughly half its buying power over 20 years at moderate inflation.", incorrect: "It's true. Escalating annuities start lower but protect you against the erosion a level annuity suffers." } } },
      { variantId: "rtx-an-ir-sc", step: { type: "scenario", question: "Priya is offered a level annuity paying more now, or an escalating one paying less. What should she weigh?", options: ["How long she may live and what inflation does to a fixed income over that time", "Only the starting amount", "Which provider has the nicer branding", "Whether her friends chose the same"], correct: 0, feedback: { correct: "Right. The level annuity wins for the first several years and loses badly after that if she lives a long life.", incorrect: "Longevity and inflation. A higher starting income is worth less than it looks over a 25-year retirement." } } },
    ],
  },
];

// ── Healthcare Planning in Retirement ───────────────────────────────────────
const healthSlots: QuestionSlot[] = [
  {
    slotId: "retirement/healthcare/medical-inflation",
    conceptId: "retirement-healthcare",
    variants: [
      { variantId: "rtx-hc-mi-mcq", step: { type: "mcq", question: "How does medical inflation in SA typically compare with general inflation?", options: ["Consistently higher, often by several percentage points", "About the same", "Consistently lower", "It varies randomly"], correct: 0, feedback: { correct: "Right, and it compounds, which is why a retirement plan built on general inflation understates healthcare costs badly.", incorrect: "Medical inflation runs above CPI year after year, so healthcare takes a growing share of a retiree's budget." } } },
      { variantId: "rtx-hc-mi-tf", step: { type: "true-false", statement: "Planning retirement healthcare costs using general inflation is likely to understate them.", correct: true, feedback: { correct: "Right. Medical premiums typically rise faster than CPI, so the gap widens every year of a long retirement.", incorrect: "It's true. Using CPI for medical costs consistently underestimates them." } } },
      { variantId: "rtx-hc-mi-sc", step: { type: "scenario", question: "Johan budgets R6 000 a month for medical aid at 65. What should he assume by 80?", options: ["Substantially more in real terms", "The same amount", "Less, since he'll need less cover", "It's impossible to plan for"], correct: 0, feedback: { correct: "Right. Fifteen years of above-inflation increases makes healthcare one of the largest line items in late retirement.", incorrect: "Considerably more, even after inflation. Medical costs rise fastest exactly when you need more care." } } },
    ],
  },
  {
    slotId: "retirement/healthcare/keep-cover",
    conceptId: "retirement-healthcare",
    variants: [
      { variantId: "rtx-hc-kc-tf", step: { type: "true-false", statement: "Most retirees can safely drop medical aid to save money once they stop working.", correct: false, feedback: { correct: "Right. It's the worst time to drop it. Healthcare needs rise with age, and rejoining later can bring waiting periods and late-joiner penalties.", incorrect: "Dropping cover in retirement is high risk. Late-joiner penalties can add a significant permanent loading to premiums." } } },
      { variantId: "rtx-hc-kc-mcq", step: { type: "mcq", question: "What's the risk of cancelling medical scheme cover and rejoining years later?", options: ["Waiting periods and a late-joiner penalty that can permanently raise your premium", "Nothing. You can rejoin freely", "A one-month waiting period only", "You'd need a medical examination"], correct: 0, feedback: { correct: "Right. Late-joiner penalties are calculated on years without cover and stay on the premium indefinitely.", incorrect: "Waiting periods plus a permanent late-joiner penalty based on how long you were uncovered." } } },
      { variantId: "rtx-hc-kc-sc", step: { type: "scenario", question: "Nomsa's premium is squeezing her budget in retirement. What's the better move than cancelling?", options: ["Downgrade to a more affordable option on the same scheme, keeping continuous cover", "Cancel and self-fund", "Cancel and rejoin when she gets sick", "Keep the plan and cut food spending"], correct: 0, feedback: { correct: "Right. Continuous membership protects her from penalties, and every registered option must still cover PMBs.", incorrect: "Downgrade rather than cancel. Continuous cover is what preserves her position." } } },
    ],
  },
  {
    slotId: "retirement/healthcare/gap-and-pmb",
    conceptId: "retirement-healthcare",
    variants: [
      { variantId: "rtx-hc-gp-mcq", step: { type: "mcq", question: "Why does gap cover matter more in retirement?", options: ["Specialist procedures become more likely, and shortfalls above scheme tariff can be large", "Gap cover is cheaper for pensioners", "It replaces medical aid", "It covers medication"], correct: 0, feedback: { correct: "Right. A single procedure charged well above scheme rates can produce a shortfall a retiree can't absorb.", incorrect: "The frequency of specialist care rises with age, and so does the shortfall risk it creates." } } },
      { variantId: "rtx-hc-gp-tf", step: { type: "true-false", statement: "Prescribed Minimum Benefits must be covered on every registered medical scheme option, including hospital plans.", correct: true, feedback: { correct: "Right. That's a legal floor, which matters most for chronic conditions common in later life.", incorrect: "It's true. PMBs apply to all registered options at every price point." } } },
      { variantId: "rtx-hc-gp-sc", step: { type: "scenario", question: "Sipho is comparing retirement medical options on a fixed income. What matters most?", options: ["Chronic medication cover, hospital cover and the shortfall risk he'd have to fund himself", "The lowest possible premium", "Gym benefits and rewards points", "The scheme's advertising"], correct: 0, feedback: { correct: "Right. On a fixed income, an unfunded shortfall is far more dangerous than a slightly higher premium.", incorrect: "Chronic cover, hospital cover and shortfall exposure. The cheapest premium can be the most expensive choice." } } },
    ],
  },
  {
    slotId: "retirement/healthcare/frail-care",
    conceptId: "retirement-healthcare",
    variants: [
      { variantId: "rtx-hc-fc-mcq", step: { type: "mcq", question: "Which late-life cost is most often left out of retirement plans?", options: ["Frail care or assisted living", "Medical aid premiums", "Groceries", "Transport"], correct: 0, feedback: { correct: "Right. Frail care can cost more than a household's entire monthly budget, and schemes cover very little of it.", incorrect: "Frail care and assisted living. They're expensive, common in late life, and largely outside scheme cover." } } },
      { variantId: "rtx-hc-fc-tf", step: { type: "true-false", statement: "Medical schemes generally cover long-term frail care and assisted living costs.", correct: false, feedback: { correct: "Right. Cover is limited, so it usually falls to the retiree's own capital or their family.", incorrect: "They largely don't. It's one of the biggest uncovered risks in late retirement." } } },
      { variantId: "rtx-hc-fc-sc", step: { type: "scenario", question: "Priya wants to plan for possible frail care. What's a realistic approach?", options: ["Ring-fence part of her capital and discuss the plan openly with her family", "Assume her children will cover it", "Ignore it as unlikely", "Rely on her medical scheme"], correct: 0, feedback: { correct: "Right. An explicit reserve plus an honest family conversation prevents a crisis decision made under pressure.", incorrect: "Reserve capital and talk about it. Assuming family will absorb it is how these situations become crises." } } },
    ],
  },
];

// ── Estate Planning at Retirement ───────────────────────────────────────────
const estSlots: QuestionSlot[] = [
  {
    slotId: "retirement/estate/fund-nomination",
    conceptId: "beneficiary-nominations",
    variants: [
      { variantId: "rtx-es-fn-mcq", step: { type: "mcq", question: "Who decides how a retirement fund death benefit is distributed?", options: ["The fund's trustees, who must consider your dependants under section 37C", "Your will, which overrides everything", "Your nominated beneficiary alone", "The executor of your estate"], correct: 0, feedback: { correct: "Right. Your nomination guides the trustees but doesn't bind them. Their legal duty is to identify and provide for dependants.", incorrect: "The trustees decide under section 37C of the Pension Funds Act. Your nomination form is guidance, not an instruction." } } },
      { variantId: "rtx-es-fn-tf", step: { type: "true-false", statement: "A retirement fund benefit generally falls outside your estate, so it avoids executor's fees and delays.", correct: true, feedback: { correct: "Right, and that's a real advantage. It can reach dependants far faster than an estate can be wound up.", incorrect: "It's true. Fund benefits are distributed by trustees rather than through the estate process." } } },
      { variantId: "rtx-es-fn-sc", step: { type: "scenario", question: "Johan's nomination form is fifteen years old and names an ex-spouse. What's the risk?", options: ["It misleads the trustees about his intentions and can cause disputes and delays", "It's automatically invalid", "The will overrides it", "Nothing, trustees ignore old forms"], correct: 0, feedback: { correct: "Right. Trustees weigh the nomination alongside actual dependency: an outdated form muddies exactly the evidence they rely on.", incorrect: "An outdated form creates confusion and delay. Update it whenever your circumstances change." } } },
    ],
  },
  {
    slotId: "retirement/estate/living-annuity-death",
    conceptId: "beneficiary-nominations",
    variants: [
      { variantId: "rtx-es-ld-tf", step: { type: "true-false", statement: "When you die, the remaining money in a living annuity is forfeited to the insurer.", correct: false, feedback: { correct: "Right. It passes to your nominated beneficiaries, who can take an income, a lump sum, or both. That inheritability is a key advantage.", incorrect: "It isn't forfeited. The remaining capital goes to your nominated beneficiaries." } } },
      { variantId: "rtx-es-ld-mcq", step: { type: "mcq", question: "What happens to a guaranteed life annuity when the annuitant dies?", options: ["Payments generally stop, unless a guarantee period or spouse's benefit was built in", "The capital passes to the estate", "Beneficiaries continue receiving it indefinitely", "The insurer refunds all premiums"], correct: 0, feedback: { correct: "Right, which is exactly the trade for lifetime certainty. A guarantee term or joint-life option changes it, at a cost.", incorrect: "Payments generally cease. That's the price of the lifetime guarantee, unless you paid for a guarantee period." } } },
      { variantId: "rtx-es-ld-sc", step: { type: "scenario", question: "Nomsa wants her children to inherit whatever remains of her retirement capital. Which structure supports that?", options: ["A living annuity with beneficiaries nominated", "A level guaranteed annuity", "A guaranteed annuity with no guarantee period", "Any annuity, they all pass on"], correct: 0, feedback: { correct: "Right. The living annuity's inheritability is its main advantage over a guaranteed annuity.", incorrect: "The living annuity. A plain guaranteed annuity ends on death unless a guarantee period was purchased." } } },
    ],
  },
  {
    slotId: "retirement/estate/liquidity",
    conceptId: "estate-duty",
    variants: [
      { variantId: "rtx-es-lq-mcq", step: { type: "mcq", question: "Why does an estate need liquidity?", options: ["Executor's fees, taxes and debts must be paid before assets can be distributed", "To pay the beneficiaries interest", "To cover funeral costs only", "Estates don't need cash"], correct: 0, feedback: { correct: "Right. Without cash, the executor may have to sell the family home to settle costs, which is rarely what anyone intended.", incorrect: "Costs must be settled before distribution. An illiquid estate forces asset sales at whatever price is available." } } },
      { variantId: "rtx-es-lq-tf", step: { type: "true-false", statement: "Executor's fees in SA are capped at a maximum percentage of the gross estate plus VAT.", correct: true, feedback: { correct: "Right. A maximum of 3.5% plus VAT, and it's negotiable in advance with many executors.", incorrect: "It's true: 3.5% plus VAT is the maximum, and it can often be negotiated down beforehand." } } },
      { variantId: "rtx-es-lq-sc", step: { type: "scenario", question: "Sipho's estate is mostly a paid-off house and a living annuity. What's the liquidity risk?", options: ["Estate costs may have to be funded by selling the house", "There is no risk", "The annuity automatically pays the costs", "SARS covers the shortfall"], correct: 0, feedback: { correct: "Right. The annuity passes outside the estate, so it isn't available for estate costs. A life policy is the usual fix.", incorrect: "The house may have to be sold. Assets that bypass the estate can't fund the estate's costs." } } },
    ],
  },
  {
    slotId: "retirement/estate/keep-it-current",
    conceptId: "beneficiary-nominations",
    variants: [
      { variantId: "rtx-es-kc-mcq", step: { type: "mcq", question: "Which documents should be reviewed after a major life change?", options: ["Your will, fund nomination forms, annuity beneficiaries and policy nominations", "Only your will", "Only your fund nomination", "None, they update automatically"], correct: 0, feedback: { correct: "Right, and they're separate documents. Updating a will does nothing to a nomination form held by a fund or insurer.", incorrect: "All of them. Each is held separately, and a will doesn't override a nomination on a fund or policy." } } },
      { variantId: "rtx-es-kc-tf", step: { type: "true-false", statement: "Updating your will automatically updates the beneficiaries on your retirement fund and policies.", correct: false, feedback: { correct: "Right. They're separate instruments held by separate institutions. Each has to be updated directly.", incorrect: "It doesn't. Nomination forms sit with the fund or insurer and must be changed there." } } },
      { variantId: "rtx-es-kc-sc", step: { type: "scenario", question: "Priya remarries at 62. What should she do?", options: ["Review and update her will, fund nominations and every policy beneficiary", "Only update her will", "Wait until retirement to review anything", "Assume the marriage overrides old nominations"], correct: 0, feedback: { correct: "Right, and a shared document register naming where everything is held makes this far easier for her family later.", incorrect: "Update everything. Marriage doesn't automatically revoke or amend existing nominations." } } },
    ],
  },
];

export const RETIREMENT_EXTRA_BANKS: Record<string, LessonBank> = {
  "retirement::lesson-ra-vs-pension-comparison": {
    layout: L(raSlots, "RA or Pension Fund?", "<p>An <strong>RA</strong> gives you control of provider, funds and fees, and follows you between jobs. A <strong>workplace pension</strong> often comes with an employer contribution that usually outweighs a fee difference, so run both if you can. The <strong>27.5% deduction (capped at R430 000)</strong> applies to your combined contributions, and excess rolls forward. Under <strong>two-pot</strong>, a third of new contributions is accessible and taxed at your marginal rate; two thirds stay locked.</p>"),
    slots: raSlots,
  },
  "retirement::lesson-retirement-age": {
    layout: L(ageSlots, "When Can You Actually Retire?", "<p>Retiring ten years earlier hits you twice: fewer years of contributions and growth, more years of withdrawals, and the last ten years before retirement usually add more than the first ten, because compounding works on the largest balance you'll ever have. The honest levers are <strong>saving more, needing less, or working part-time</strong>. Early income also reduces <strong>sequence risk</strong>: withdrawals during an early downturn do damage later gains can't undo.</p>"),
    slots: ageSlots,
  },
  "retirement::lesson-annuity-types": {
    layout: L(annSlots, "Guaranteed, Living, or Both", "<p>A <strong>guaranteed (life) annuity</strong> pays for as long as you live. The insurer takes the longevity risk, and you give up the capital. A <strong>living annuity</strong> lets you choose the investments and a drawdown between <strong>2.5% and 17.5%</strong>, keeps the capital inheritable, and leaves the risk with you. The common answer is a <strong>hybrid</strong>: guarantee your essential expenses, keep the discretionary portion flexible. Both incomes are taxed as income.</p>"),
    slots: annSlots,
  },
  "retirement::lesson-post-retirement-healthcare": {
    layout: L(healthSlots, "The Cost That Grows Fastest", "<p><strong>Medical inflation consistently outpaces general inflation</strong>, so planning healthcare on CPI understates it badly. Dropping cover in retirement is the worst time to do it: rejoining brings waiting periods and a <strong>permanent late-joiner penalty</strong>. Downgrade instead, and keep membership continuous. <strong>PMBs</strong> apply to every registered option. The most commonly ignored cost is <strong>frail care</strong>, which schemes largely don't cover.</p>"),
    slots: healthSlots,
  },
  "retirement::lesson-estate-planning-retirement": {
    layout: L(estSlots, "What Happens to What's Left", "<p>A retirement fund death benefit is distributed by the <strong>trustees under section 37C</strong>: your nomination guides them but doesn't bind them, and the benefit falls outside your estate. A <strong>living annuity</strong> passes to your nominated beneficiaries; a plain guaranteed annuity generally stops on death. Estates need <strong>liquidity</strong>, because executor's fees (max 3.5% + VAT), taxes and debts are settled before anything is distributed, and a will doesn't update nomination forms.</p>"),
    slots: estSlots,
  },
};
