import type { LessonLayoutItem, QuestionSlot } from "@/data/content";
import type { LessonBank } from "./money-basics";

/**
 * Premium banks for the Rand & Economy EXTRA lessons.
 *
 * Current, web-verified positions used here:
 *  - SARB inflation target: a 3% POINT target with a ±1 percentage point
 *    tolerance band (replaced the old 3–6% range). Do not use "3% to 6%".
 *  - South Africa EXITED the FATF grey list on 24 October 2025 (listed Feb 2023).
 *  - Single Discretionary Allowance R2 000 000 per calendar year (no SARS
 *    clearance); Foreign Investment Allowance R10m with SARS approval.
 *  - Regulation 28 offshore limit 45% for retirement funds.
 * Prime = repo + 3.5%. Specific repo/prime levels are never pinned — questions
 * state the rate as a given assumption.
 * variantId prefix: `rex-`.
 */
const info = (title: string, content: string): LessonLayoutItem => ({ type: "info", title, content });
const L = (slots: QuestionSlot[], title: string, content: string): LessonLayoutItem[] => [
  info(title, content),
  ...slots.map((s) => ({ slot: s.slotId })),
];

// ── Offshore Investing Mechanics ────────────────────────────────────────────
const offSlots: QuestionSlot[] = [
  {
    slotId: "rand-economy/offshore/jse-feeder",
    conceptId: "offshore-mechanics",
    variants: [
      { variantId: "rex-of-jf-mcq", step: { type: "mcq", question: "You buy a JSE-listed global equity ETF in rands. What have you actually got?", options: ["Global shares plus rand movement", "A foreign bank account", "Exposure only to the JSE", "A pure currency trade with no shares"], correct: 0, feedback: { correct: "Right. Your return combines what the underlying shares do and what the rand does: bought in rands, on the JSE.", incorrect: "It's global share exposure plus currency exposure, purchased locally in rands." } } },
      { variantId: "rex-of-jf-tf", step: { type: "true-false", statement: "Investing offshore through a JSE-listed ETF requires SARS tax clearance.", correct: false, feedback: { correct: "Right. You're buying a rand-denominated JSE instrument, so no money leaves the country and no clearance is needed.", incorrect: "No clearance is needed. Clearance applies to externalising rands, not to buying a locally listed feeder fund." } } },
      { variantId: "rex-of-jf-sc", step: { type: "scenario", question: "Lerato has R1 000 a month and wants global exposure without paperwork. What fits?", options: ["A debit order into a global ETF", "Opening an offshore bank account", "Applying for SARS clearance first", "Buying foreign currency cash"], correct: 0, feedback: { correct: "Right. It's the simplest route: local platform, rand debit order, global exposure, no allowances used.", incorrect: "A JSE-listed global ETF. Offshore accounts and clearances are for externalising larger amounts." } } },
    ],
  },
  {
    slotId: "rand-economy/offshore/currency-effect",
    conceptId: "offshore-mechanics",
    variants: [
      { variantId: "rex-of-ce-sc", step: { type: "scenario", question: "You invest R100 000 in a global ETF when the rand is R17/$. The underlying shares don't move, but the rand weakens to R19/$. What's your investment worth?", options: ["About R111 800", "Still R100 000", "About R89 500", "About R119 000"], correct: 0, feedback: { correct: "19 ÷ 17 = 1.118, so roughly R111 800. The shares did nothing. The currency did all the work.", incorrect: "The dollar value is unchanged, but each dollar now converts to more rands: R100 000 × 19/17 ≈ R111 800." } } },
      { variantId: "rex-of-ce-tf", step: { type: "true-false", statement: "A stronger rand reduces the rand value of your offshore investments, all else equal.", correct: true, feedback: { correct: "Right. Currency cuts both ways. Offshore exposure protects against rand weakness and costs you when the rand recovers.", incorrect: "It's true. Rand strength reduces the rand value of foreign assets, which is the other side of the hedge." } } },
      { variantId: "rex-of-ce-mcq", step: { type: "mcq", question: "What are the two components of a rand investor's return on a global ETF?", options: ["The market and the currency", "Dividends and the fees", "Interest and inflation", "Only the share price itself"], correct: 0, feedback: { correct: "Right, and in some years the currency component is larger than the market one.", incorrect: "Market return plus currency movement. Both can be positive or negative independently." } } },
    ],
  },
  {
    slotId: "rand-economy/offshore/allowances",
    conceptId: "offshore-mechanics",
    variants: [
      { variantId: "rex-of-al-mcq", step: { type: "mcq", question: "How much can an adult South African externalise each calendar year without SARS clearance?", options: ["R2 million", "R100 000", "R10 million", "Nothing without clearance"], correct: 0, feedback: { correct: "Right, and the Foreign Investment Allowance adds up to R10 million on top, with SARS approval.", incorrect: "The SDA is R2 million a year, clearance-free. The FIA allows a further R10 million with SARS approval." } } },
      { variantId: "rex-of-al-tf", step: { type: "true-false", statement: "Buying a JSE-listed global ETF uses up your offshore allowance.", correct: false, feedback: { correct: "Right. It's a local rand transaction, so your R2 million SDA stays intact for actual transfers abroad.", incorrect: "It doesn't. Allowances apply to money physically leaving the country." } } },
      { variantId: "rex-of-al-sc", step: { type: "scenario", question: "Johan wants direct offshore exposure in dollars rather than a local feeder fund. What's involved?", options: ["Externalising funds under his allowance", "Nothing. It's identical to buying on the JSE", "SARB approval needed for the full amount", "It isn't permitted for individuals at all"], correct: 0, feedback: { correct: "Right, and for most investors the local feeder achieves the same exposure with far less friction and cost.", incorrect: "It means externalising funds under your allowance, with forex margins and paperwork. The feeder fund avoids both." } } },
    ],
  },
  {
    slotId: "rand-economy/offshore/reg-28",
    conceptId: "offshore-allocation",
    variants: [
      { variantId: "rex-of-r2-mcq", step: { type: "mcq", question: "What does Regulation 28 limit?", options: ["Retirement fund asset limits", "How much you may invest offshore", "How much you may save each year", "Tax on your offshore returns"], correct: 0, feedback: { correct: "Right. The offshore limit is 45%, and it applies only to retirement funds, not to your discretionary investments.", incorrect: "It governs retirement fund composition, including a 45% offshore limit. Discretionary money is unrestricted." } } },
      { variantId: "rex-of-r2-tf", step: { type: "true-false", statement: "Regulation 28 restricts how much of your discretionary (non-retirement) portfolio can be offshore.", correct: false, feedback: { correct: "Right. Reg 28 applies to retirement funds only. Your own investments are limited by your allowances, not by Reg 28.", incorrect: "It applies to retirement funds. Discretionary portfolios aren't governed by Reg 28." } } },
      { variantId: "rex-of-r2-sc", step: { type: "scenario", question: "Priya's RA is at the 45% offshore limit but she wants more global exposure. What's her option?", options: ["Use her discretionary money", "Ask her fund for an exemption", "Withdraw from her RA early", "Nothing at all can be done"], correct: 0, feedback: { correct: "Right. Look at total exposure across all accounts, the RA constraint doesn't limit the rest of her portfolio.", incorrect: "Use her discretionary portfolio. Reg 28 binds the RA, not everything she owns." } } },
    ],
  },
];

// ── The Rand, Oil and Your Petrol Price ─────────────────────────────────────
const petrolSlots: QuestionSlot[] = [
  {
    slotId: "rand-economy/petrol/rand-effect",
    conceptId: "petrol-price",
    variants: [
      { variantId: "rex-pt-re-mcq", step: { type: "mcq", question: "The rand strengthens from R19/$ to R17/$. All else equal, what should happen to the petrol price?", options: ["It should fall", "It should rise", "It shouldn't change", "It depends only on the fuel levy"], correct: 0, feedback: { correct: "Right. Oil is priced in dollars, so a stronger rand buys the same barrel for less, that flows into the Basic Fuel Price.", incorrect: "A stronger rand lowers the rand cost of dollar-priced oil, which lowers the Basic Fuel Price." } } },
      { variantId: "rex-pt-re-tf", step: { type: "true-false", statement: "The petrol price depends on both the dollar oil price and the rand exchange rate.", correct: true, feedback: { correct: "Right, which is why petrol can rise even when oil falls, if the rand weakens by more.", incorrect: "It's true. Both inputs matter, and they can move in opposite directions." } } },
      { variantId: "rex-pt-re-fill", step: { type: "fill-blank", title: "Rand move at the pump", prompt: "The rand weakens by R1 against the dollar, adding roughly R0.30 a litre. On a 50-litre tank filled twice a month, your extra monthly cost = R____.", correct: 30, feedback: { correct: "R0.30 × 100 litres = R30 a month, or R360 a year. From a R1 move in the currency alone.", incorrect: "R0.30 × 50 litres × 2 fills = R30 extra a month." } } },
    ],
  },
  {
    slotId: "rand-economy/petrol/components",
    conceptId: "petrol-price",
    variants: [
      { variantId: "rex-pt-cp-tf", step: { type: "true-false", statement: "The Basic Fuel Price is the only cost component of South African petrol.", correct: false, feedback: { correct: "Right. Add the general fuel levy, the Road Accident Fund levy, wholesale and retail margins, and transport costs. Taxes and levies alone are a large share of the pump price.", incorrect: "The BFP is just the imported cost. Levies, margins and transport make up a substantial part of what you pay." } } },
      { variantId: "rex-pt-cp-mcq", step: { type: "mcq", question: "Which components of the petrol price are set by government rather than by markets?", options: ["The fuel levy and the RAF levy", "The Basic Fuel Price component", "The exchange rate", "The crude oil price"], correct: 0, feedback: { correct: "Right, and they're adjusted in the annual Budget, which is why petrol can rise in April with no move in oil or the rand.", incorrect: "The two levies are set by government. BFP, oil and the rand are market-determined." } } },
      { variantId: "rex-pt-cp-sc", step: { type: "scenario", question: "Oil falls but the pump price barely moves. What could explain it?", options: ["A weaker rand or a levy increase", "Petrol stations keeping the difference", "The pump price is fixed each year", "Oil doesn't affect petrol"], correct: 0, feedback: { correct: "Right. Retail margins are regulated, so the usual explanations are the currency or the levies rather than the forecourt.", incorrect: "Currency or levy changes. Retail margins are regulated, so stations can't simply absorb the difference." } } },
    ],
  },
  {
    slotId: "rand-economy/petrol/household-impact",
    conceptId: "petrol-price",
    variants: [
      { variantId: "rex-pt-hi-fill", step: { type: "fill-blank", title: "Your monthly fuel cost", prompt: "You fill 50 litres twice a month. Petrol rises by R1.50 a litre. Your extra monthly cost = R____.", correct: 150, feedback: { correct: "50 × 2 × R1.50 = R150 a month, or R1 800 a year: from one price adjustment.", incorrect: "100 litres a month × R1.50 = R150 extra." } } },
      { variantId: "rex-pt-hi-mcq", step: { type: "mcq", question: "Why do fuel price increases affect households that don't own cars?", options: ["It feeds into taxi fares", "They simply don't", "Only through electricity", "Only via the fuel levy"], correct: 0, feedback: { correct: "Right. Taxi fares and food prices both move with fuel, which is why fuel increases hit low-income households hardest.", incorrect: "Fuel costs flow into taxi fares and goods prices, so the effect is much wider than car owners." } } },
      { variantId: "rex-pt-hi-tf", step: { type: "true-false", statement: "Fuel price increases tend to hit lower-income households proportionally harder.", correct: true, feedback: { correct: "Right. Transport and food take a much larger share of a small budget, and both move with fuel.", incorrect: "It's true. The same rand increase is a bigger share of a smaller income, and it arrives through both transport and food." } } },
    ],
  },
  {
    slotId: "rand-economy/petrol/what-you-control",
    conceptId: "petrol-price",
    variants: [
      { variantId: "rex-pt-wc-mcq", step: { type: "mcq", question: "You can't control the petrol price. What can you control?", options: ["How often and how far you drive", "The general fuel levy government sets", "The level of the rand against the dollar", "The global oil price"], correct: 0, feedback: { correct: "Right. Consolidating trips and keeping tyres correctly inflated are unglamorous but they measurably cut consumption.", incorrect: "Only your own usage and efficiency. The other three are outside any individual's influence." } } },
      { variantId: "rex-pt-wc-tf", step: { type: "true-false", statement: "Budgeting a buffer for fuel price increases is more useful than trying to predict them.", correct: true, feedback: { correct: "Right. Nobody forecasts the rand reliably, so build the volatility into the budget instead.", incorrect: "It's true. A buffer handles what forecasting can't, because currency moves aren't predictable." } } },
      { variantId: "rex-pt-wc-sc", step: { type: "scenario", question: "Sipho's transport costs keep breaking his budget. What's the structural fix?", options: ["Budget an average plus a buffer", "Assume the prices will fall back soon", "Stop budgeting for fuel", "Buy a bigger car for the comfort"], correct: 0, feedback: { correct: "Right. A realistic average plus a buffer beats budgeting for the best case and being surprised every quarter.", incorrect: "Budget realistically with a buffer. Hoping for a reversal is what keeps breaking the budget." } } },
    ],
  },
];

// ── Protecting Your Wealth Against Rand Weakness ────────────────────────────
const hedgeSlots: QuestionSlot[] = [
  {
    slotId: "rand-economy/hedge/accessible",
    conceptId: "rand-hedge",
    variants: [
      { variantId: "rex-hg-ac-mcq", step: { type: "mcq", question: "What's the most accessible rand hedge for a first-time investor with R1 000 a month?", options: ["A JSE-listed global equity ETF", "An offshore bank account abroad", "Physical foreign currency", "A forex trading account"], correct: 0, feedback: { correct: "Right. No minimums worth worrying about, no clearance, no paperwork, and real global exposure from the first debit order.", incorrect: "The JSE-listed global ETF. The alternatives need more money, more paperwork, or carry much higher risk." } } },
      { variantId: "rex-hg-ac-tf", step: { type: "true-false", statement: "You need a large lump sum to get meaningful offshore exposure as a South African.", correct: false, feedback: { correct: "Right. A monthly debit order into a local feeder fund gives the same exposure as a large offshore transfer.", incorrect: "You don't. Local feeder funds make offshore exposure available from small monthly amounts." } } },
      { variantId: "rex-hg-ac-sc", step: { type: "scenario", question: "Nomsa is told she needs an offshore account and R100 000 minimum to invest globally. Is that right?", options: ["No, a JSE-listed global ETF works", "Yes, that's the legal minimum", "Yes, unless she has SARS clearance", "Only for retirement funds"], correct: 0, feedback: { correct: "Right, and whoever told her that may be selling a more expensive route.", incorrect: "It's wrong. Local feeder ETFs need no minimum and no clearance." } } },
    ],
  },
  {
    slotId: "rand-economy/hedge/concentration",
    conceptId: "rand-hedge",
    variants: [
      { variantId: "rex-hg-cn-tf", step: { type: "true-false", statement: "Holding all your investments in SA assets is a concentration risk, because your income and property are already SA-exposed.", correct: true, feedback: { correct: "Right. Your salary, your home and your portfolio would all depend on the same economy and the same currency.", incorrect: "It's true. Adding SA investments to SA income and SA property concentrates every risk in one place." } } },
      { variantId: "rex-hg-cn-mcq", step: { type: "mcq", question: "Why does offshore exposure matter more for a South African than for a US investor?", options: ["The JSE is a small slice", "SA companies are badly run", "Offshore assets always return more", "SA investments are unregulated"], correct: 0, feedback: { correct: "Right. It's about the size of the local market and currency volatility, not the quality of local companies.", incorrect: "It's market size and currency volatility. SA companies include some excellent businesses; the issue is concentration." } } },
      { variantId: "rex-hg-cn-sc", step: { type: "scenario", question: "Thabo earns rands, owns a Johannesburg flat, and holds only JSE shares. What's the honest description?", options: ["Everything rides on one economy", "A well-diversified portfolio", "Appropriately patriotic investing", "Low risk, he understands SA"], correct: 0, feedback: { correct: "Right. Familiarity isn't diversification. A bad decade for SA would hit all three at once.", incorrect: "It's concentrated. Understanding a market doesn't reduce the risk of having everything in it." } } },
    ],
  },
  {
    slotId: "rand-economy/hedge/how-it-worked",
    conceptId: "rand-hedge",
    variants: [
      { variantId: "rex-hg-hw-sc", step: { type: "scenario", question: "The rand weakens from R14/$ to R19/$, about 36%. An investor with 40% of their portfolio in a global ETF experiences roughly what currency effect on the whole portfolio?", options: ["About a 14% gain", "A 36% gain", "A 36% loss", "No effect at all"], correct: 0, feedback: { correct: "40% × 36% ≈ 14% at the portfolio level, before anything the underlying markets did. That's the hedge working.", incorrect: "Only the offshore portion benefits: 40% × 36% ≈ 14% across the portfolio." } } },
      { variantId: "rex-hg-hw-mcq", step: { type: "mcq", question: "What does a rand hedge actually protect against?", options: ["A fall in the rand's buying power", "All of your investment losses everywhere", "Inflation in the most general terms", "Market crashes worldwide"], correct: 0, feedback: { correct: "Right, and it's specific. Global markets can still fall. The hedge is against currency, not against risk.", incorrect: "Currency risk specifically. Offshore assets can still lose value in their own currency." } } },
      { variantId: "rex-hg-hw-tf", step: { type: "true-false", statement: "Offshore exposure protects you from market falls as well as rand weakness.", correct: false, feedback: { correct: "Right. It addresses currency risk only, a global crash still hits a global ETF.", incorrect: "It hedges currency, not markets. Both can fall at the same time." } } },
    ],
  },
  {
    slotId: "rand-economy/hedge/how-much",
    conceptId: "offshore-allocation",
    variants: [
      { variantId: "rex-hg-hm-mcq", step: { type: "mcq", question: "What should determine your offshore allocation?", options: ["Your goals and existing exposure", "The rand's level this month", "Whatever performed best last year", "The maximum amount allowed"], correct: 0, feedback: { correct: "Right. Someone with a rand salary and a bond already carries heavy SA exposure before their portfolio starts.", incorrect: "Your total picture, not the current exchange rate. Timing the rand is not a strategy." } } },
      { variantId: "rex-hg-hm-tf", step: { type: "true-false", statement: "Moving money offshore only after the rand has already weakened sharply tends to lock in a poor exchange rate.", correct: true, feedback: { correct: "Right, and that's exactly when the urge is strongest. Regular contributions avoid the timing decision entirely.", incorrect: "It's true. Panic-driven transfers happen at the worst rates, which is why a steady allocation works better." } } },
      { variantId: "rex-hg-hm-sc", step: { type: "scenario", question: "Ayesha wants offshore exposure but is unsure about timing. What's a practical approach?", options: ["Contribute a fixed amount monthly", "Wait for the rand to strengthen", "Move everything at once", "Avoid offshore investing entirely"], correct: 0, feedback: { correct: "Right. Regular contributions average her exchange rate the same way they average her entry price.", incorrect: "Regular contributions. Waiting for the 'right' rate is a forecast nobody makes reliably." } } },
    ],
  },
];

// ── The SARB and Currency Markets ───────────────────────────────────────────
const sarbSlots: QuestionSlot[] = [
  {
    slotId: "rand-economy/sarb/rates-and-rand",
    conceptId: "sarb-intervention",
    variants: [
      { variantId: "rex-sb-rr-mcq", step: { type: "mcq", question: "When the SARB raises the repo rate, what's the typical effect on the rand?", options: ["Supportive, yields draw capital", "It weakens immediately and sharply", "No effect at all on it", "It always halves in value"], correct: 0, feedback: { correct: "Right, though it's a tendency rather than a rule. Global risk sentiment can overwhelm it entirely.", incorrect: "Higher rates tend to support the currency by attracting capital, though other forces can dominate." } } },
      { variantId: "rex-sb-rr-tf", step: { type: "true-false", statement: "The SARB manages the rand by setting an official exchange rate.", correct: false, feedback: { correct: "Right. The rand floats freely. The SARB targets inflation and doesn't defend a particular exchange rate.", incorrect: "The rand is a floating currency. The SARB's mandate is price stability, not an exchange rate level." } } },
      { variantId: "rex-sb-rr-sc", step: { type: "scenario", question: "The rand weakens sharply and commentators call for the SARB to 'defend' it. What's the reality?", options: ["The SARB doesn't target a level", "The SARB can fix the rate at will", "The rand is pegged to the dollar", "Only the Treasury can act"], correct: 0, feedback: { correct: "Right. Countries that have tried to defend a currency level have generally spent their reserves and lost anyway.", incorrect: "The SARB doesn't target a level, and defending one against global capital flows is rarely sustainable." } } },
    ],
  },
  {
    slotId: "rand-economy/sarb/risk-sentiment",
    conceptId: "sarb-intervention",
    variants: [
      { variantId: "rex-sb-rs-mcq", step: { type: "mcq", question: "Why does the rand often move sharply on global news that has nothing to do with SA?", options: ["It's a liquid emerging-market proxy", "SA's economy is unusually large globally", "The SARB actively trades it every day", "It is pegged directly to commodity prices"], correct: 0, feedback: { correct: "Right. Its liquidity makes it a convenient risk proxy, so global sentiment moves it before any local news does.", incorrect: "Liquidity and its role as an EM risk proxy. Global risk-off moves hit the rand regardless of local conditions." } } },
      { variantId: "rex-sb-rs-tf", step: { type: "true-false", statement: "South Africa's FATF grey listing in February 2023 put downward pressure on the rand, and SA exited the grey list in October 2025.", correct: true, feedback: { correct: "Right. Grey listing raised compliance friction and investor caution; the October 2025 exit removed that overhang.", incorrect: "It's true on both counts: listed in February 2023, removed on 24 October 2025 after completing the action plan." } } },
      { variantId: "rex-sb-rs-sc", step: { type: "scenario", question: "Load shedding worsens from Stage 2 to Stage 6 for three months. What's the likely rand effect?", options: ["Negative, growth expectations fall", "Positive, since exports would rise", "No effect at all", "It strengthens the rand"], correct: 0, feedback: { correct: "Right. Sustained power constraints cut output and confidence, and the currency prices that in.", incorrect: "It's negative. Severe load shedding reduces growth expectations, which weighs on the currency." } } },
    ],
  },
  {
    slotId: "rand-economy/sarb/what-it-means-for-you",
    conceptId: "repo-rate-effect",
    variants: [
      { variantId: "rex-sb-wm-mcq", step: { type: "mcq", question: "The SARB cuts the repo rate by 0.25% and your home loan is at prime minus 0.5%. What happens?", options: ["Your rate falls by 0.25%", "Nothing until you renegotiate", "Your rate falls by a full 0.5%", "Your rate rises rather than falls"], correct: 0, feedback: { correct: "Right. Prime moves point for point with the repo rate, and your discount to prime stays the same.", incorrect: "Prime tracks the repo rate, so a 0.25% cut lowers your rate by 0.25%. Your margin is unchanged." } } },
      { variantId: "rex-sb-wm-tf", step: { type: "true-false", statement: "When the SARB raises the repo rate, savings account rates typically fall.", correct: false, feedback: { correct: "Right. They typically rise. Higher rates hurt borrowers and help savers, which is the trade-off in every rate decision.", incorrect: "Savings rates typically rise with the repo rate. Borrowers lose, savers gain." } } },
      { variantId: "rex-sb-wm-sc", step: { type: "scenario", question: "Rates rise and Nomsa's bond instalment increases by R900. What's the constructive response?", options: ["Adjust the budget now", "Wait for rates to fall back", "Extend the bond term instead", "Stop all other savings entirely"], correct: 0, feedback: { correct: "Right. Keeping the higher payment after a cut turns a rate cycle into a shorter bond.", incorrect: "Adjust and plan ahead. Extending the term lowers the payment but raises total interest substantially." } } },
    ],
  },
  {
    slotId: "rand-economy/sarb/independence",
    conceptId: "sarb-intervention",
    variants: [
      { variantId: "rex-sb-id-mcq", step: { type: "mcq", question: "What is the SARB's primary mandate?", options: ["Price stability", "Maximising employment", "Funding government spending", "Setting the exchange rate"], correct: 0, feedback: { correct: "Right. Price stability in the interest of balanced and sustainable growth, which it pursues through inflation targeting.", incorrect: "Price stability. Employment and growth matter, but the constitutional mandate is the value of the currency." } } },
      { variantId: "rex-sb-id-tf", step: { type: "true-false", statement: "The MPC decides interest rates by committee at scheduled meetings rather than by a single official.", correct: true, feedback: { correct: "Right. The Monetary Policy Committee meets on a published schedule, and the vote split is disclosed.", incorrect: "It's true. Rate decisions are made by the MPC at scheduled meetings, with the vote breakdown published." } } },
      { variantId: "rex-sb-id-sc", step: { type: "scenario", question: "Why does central bank independence matter for ordinary savers?", options: ["It makes inflation more predictable", "It guarantees higher interest rates", "It fixes the exchange rate", "It has no practical effect"], correct: 0, feedback: { correct: "Right. Countries where politicians control rates tend to get higher, more volatile inflation, and savers pay for it.", incorrect: "Predictable inflation. Political control of rates historically produces higher inflation, which erodes savings." } } },
    ],
  },
];

// ── SA's Trade Balance and Your Finances ────────────────────────────────────
const tradeSlots: QuestionSlot[] = [
  {
    slotId: "rand-economy/trade/commodities",
    conceptId: "trade-balance",
    variants: [
      { variantId: "rex-tr-cm-sc", step: { type: "scenario", question: "A global recession pushes platinum prices down 30%. What's the likely effect on the rand?", options: ["It weakens", "It strengthens", "No effect", "It becomes fixed"], correct: 0, feedback: { correct: "Right. SA exports commodities, so falling commodity prices mean fewer dollars flowing in and a weaker rand.", incorrect: "The rand weakens. Commodity export earnings are a major source of the dollars SA receives." } } },
      { variantId: "rex-tr-cm-mcq", step: { type: "mcq", question: "Why is the rand often described as a commodity currency?", options: ["Export earnings depend on mining", "SA imports all of its commodities", "The rand is backed by gold", "Commodities are priced in rands"], correct: 0, feedback: { correct: "Right. Platinum, gold, coal and iron ore earnings feed directly into the currency's supply of dollars.", incorrect: "Export dependence on mined commodities. The rand isn't backed by gold and commodities are priced in dollars." } } },
      { variantId: "rex-tr-cm-tf", step: { type: "true-false", statement: "A commodity price boom tends to support the rand.", correct: true, feedback: { correct: "Right. More export dollars means more demand for rands to convert them. The mechanism runs both ways.", incorrect: "It's true. Higher commodity prices bring in more foreign currency, supporting the rand." } } },
    ],
  },
  {
    slotId: "rand-economy/trade/exports-imports",
    conceptId: "trade-balance",
    variants: [
      { variantId: "rex-tr-ei-tf", step: { type: "true-false", statement: "A stronger rand makes South African exports more competitive globally.", correct: false, feedback: { correct: "Right. The opposite. A stronger rand makes SA goods more expensive abroad, but imports cheaper at home.", incorrect: "A stronger rand makes exports <em>less</em> competitive. It helps importers and consumers instead." } } },
      { variantId: "rex-tr-ei-mcq", step: { type: "mcq", question: "Who benefits most from a weaker rand?", options: ["Exporters earning foreign currency", "Importers of consumer goods", "People travelling abroad", "Anyone buying imported electronics"], correct: 0, feedback: { correct: "Right. Exporters earn dollars and pay costs in rands, so a weaker rand widens their margins.", incorrect: "Exporters and tourism. The other three all become more expensive when the rand weakens." } } },
      { variantId: "rex-tr-ei-sc", step: { type: "scenario", question: "SA's trade surplus improves unexpectedly as commodity prices surge. What's the likely market reaction?", options: ["The rand tends to strengthen", "The rand weakens quite sharply", "The repo rate automatically rises", "Nothing at all changes in the market"], correct: 0, feedback: { correct: "Right. A larger surplus means more dollars converted into rands, which supports the currency.", incorrect: "The rand tends to strengthen. A trade surplus increases the supply of foreign currency." } } },
    ],
  },
  {
    slotId: "rand-economy/trade/personal-impact",
    conceptId: "trade-balance",
    variants: [
      { variantId: "rex-tr-pi-mcq", step: { type: "mcq", question: "How does a weaker rand reach an ordinary household budget?", options: ["Through fuel and imported goods", "Only through international travel", "Only through investments", "It doesn't affect households"], correct: 0, feedback: { correct: "Right. Fuel, electronics, medicines and imported food inputs all reprice, which is how currency becomes groceries.", incorrect: "Through imports and fuel, which feed into transport and food prices for everyone." } } },
      { variantId: "rex-tr-pi-tf", step: { type: "true-false", statement: "A weaker rand tends to push up inflation in South Africa.", correct: true, feedback: { correct: "Right, and that's often what triggers a SARB response. Imported inflation is a core part of the transmission.", incorrect: "It's true. Imported goods and fuel cost more in rands, which feeds through to consumer prices." } } },
      { variantId: "rex-tr-pi-sc", step: { type: "scenario", question: "Johan wants to reduce his household's exposure to rand weakness. What's realistic?", options: ["Hold offshore assets and plan ahead", "Convert his salary to dollars", "Stop buying anything imported", "Predict the rand and time purchases"], correct: 0, feedback: { correct: "Right. He can't change what he earns in, but he can own assets that rise when the rand falls.", incorrect: "Offshore assets and budget buffers. Salary conversion isn't available and forecasting isn't reliable." } } },
    ],
  },
  {
    slotId: "rand-economy/trade/dont-forecast",
    conceptId: "rand-drivers",
    variants: [
      { variantId: "rex-tr-df-mcq", step: { type: "mcq", question: "Why is forecasting the rand so unreliable?", options: ["Too many forces move it at once", "Nobody actually bothers to study it", "It is randomly assigned", "It only moves once a year"], correct: 0, feedback: { correct: "Right. Too many interacting drivers, which is why professional forecasts routinely miss by wide margins.", incorrect: "Too many simultaneous drivers. Even well-resourced forecasters get it wrong regularly." } } },
      { variantId: "rex-tr-df-tf", step: { type: "true-false", statement: "A steady offshore allocation is more practical than trying to time rand movements.", correct: true, feedback: { correct: "Right. It gets you the protection without needing a forecast that nobody can supply.", incorrect: "It's true. A consistent allocation works without requiring you to predict the currency." } } },
      { variantId: "rex-tr-df-sc", step: { type: "scenario", question: "A commentator confidently predicts the rand will hit a specific level by year-end. How should Priya treat that?", options: ["One view among many", "A reason to act immediately", "A firm guarantee", "Irrelevant to everything"], correct: 0, feedback: { correct: "Right. Confidence isn't accuracy, and acting decisively on a currency call is how people transfer at bad rates.", incorrect: "Treat it as opinion. Currency forecasts are frequently wrong, however confidently stated." } } },
    ],
  },
];

// ── What Is the Repo Rate? ──────────────────────────────────────────────────
const repoSlots: QuestionSlot[] = [
  {
    slotId: "rand-economy/repo/what-it-is",
    conceptId: "repo-rate-effect",
    variants: [
      { variantId: "rex-rp-wi-mcq", step: { type: "mcq", question: "What is the repo rate?", options: ["What the SARB lends to banks at", "The rate banks charge best customers", "The rate paid on government bonds", "The current published inflation rate"], correct: 0, feedback: { correct: "Right, and it's the anchor for everything else. Prime sits at repo + 3.5%, and your loan prices off prime.", incorrect: "It's the SARB's lending rate to banks. Prime is repo + 3.5%, and retail rates key off prime." } } },
      { variantId: "rex-rp-wi-fill", step: { type: "fill-blank", title: "What a rate move costs", prompt: "A rule of thumb: every 1% rate move changes a R1 000 000 bond by about R650 a month. Two 0.5% hikes on a R1 000 000 bond add roughly R____ a month.", correct: 650, feedback: { correct: "Two 0.5% hikes is a full 1%, so about R650 a month, roughly R7 800 a year.", incorrect: "0.5% + 0.5% = 1%, which is about R650 a month on a R1 million bond." } } },
      { variantId: "rex-rp-wi-tf", step: { type: "true-false", statement: "Prime moves point for point with the repo rate.", correct: true, feedback: { correct: "Right, which is why a repo cut of 0.25% lowers your variable-rate bond by exactly 0.25%.", incorrect: "It's true. The 3.5% margin is fixed, so prime tracks the repo rate exactly." } } },
    ],
  },
  {
    slotId: "rand-economy/repo/who-wins",
    conceptId: "repo-rate-effect",
    variants: [
      { variantId: "rex-rp-ww-mcq", step: { type: "mcq", question: "A repo rate increase is bad for borrowers. Who benefits?", options: ["Savers, whose deposit rates rise", "Nobody at all", "Home loan holders", "People carrying credit card debt"], correct: 0, feedback: { correct: "Right. Every rate decision moves money between borrowers and savers, which is why the MPC is never universally popular.", incorrect: "Savers benefit. Deposit and money market rates rise with the repo rate." } } },
      { variantId: "rex-rp-ww-tf", step: { type: "true-false", statement: "Someone with no debt and significant savings benefits from rising interest rates.", correct: true, feedback: { correct: "Right. The same decision that squeezes a bond holder improves a retiree's interest income.", incorrect: "It's true. Rising rates increase interest income for savers with no debt to service." } } },
      { variantId: "rex-rp-ww-sc", step: { type: "scenario", question: "Rates rise 1%. Sipho has a R1 million bond and R200 000 in savings. What's his net position?", options: ["Worse off", "Better off", "Unaffected", "It depends on inflation only"], correct: 0, feedback: { correct: "Right. Roughly R10 000 a year more on the bond against about R2 000 more on savings, the debt dominates.", incorrect: "Worse off. The 1% applies to a much larger debt than savings balance." } } },
    ],
  },
  {
    slotId: "rand-economy/repo/transmission",
    conceptId: "repo-rate-effect",
    variants: [
      { variantId: "rex-rp-tr-mcq", step: { type: "mcq", question: "How does raising interest rates reduce inflation?", options: ["Higher costs cool spending", "It directly caps prices by law", "It strengthens the rand only", "It increases the money supply"], correct: 0, feedback: { correct: "Right, and it works with a lag. The effect on prices arrives months after the decision.", incorrect: "By cooling demand. Higher borrowing costs reduce spending, which eases price pressure over time." } } },
      { variantId: "rex-rp-tr-tf", step: { type: "true-false", statement: "Interest rate changes affect inflation immediately.", correct: false, feedback: { correct: "Right. The lag runs to many months, which is why the MPC acts on forecasts rather than on the latest print alone.", incorrect: "There's a substantial lag. That's why rate decisions are forward-looking." } } },
      { variantId: "rex-rp-tr-sc", step: { type: "scenario", question: "Why does the SARB sometimes raise rates when the economy is already weak?", options: ["Unchecked inflation hurts more", "To punish borrowers", "To strengthen the rand for exporters", "Because it must always follow the Fed"], correct: 0, feedback: { correct: "Right. High inflation erodes wages and savings hardest at the bottom, which is why price stability comes first.", incorrect: "Because inflation is the greater harm. It's a mandate decision, not a reaction to other central banks." } } },
    ],
  },
  {
    slotId: "rand-economy/repo/your-decisions",
    conceptId: "repo-rate-effect",
    variants: [
      { variantId: "rex-rp-yd-mcq", step: { type: "mcq", question: "What's the most useful way to handle interest rate uncertainty on a bond?", options: ["Budget as if rates were 2% higher", "Assume rates will fall", "Take the longest possible loan term", "Ignore it completely"], correct: 0, feedback: { correct: "Right. Affordability tested against a higher rate is what keeps a bond survivable through a full cycle.", incorrect: "Stress-test the budget. Bonds run for 20 years and rates move a long way in that time." } } },
      { variantId: "rex-rp-yd-tf", step: { type: "true-false", statement: "Keeping your instalment unchanged when rates fall shortens your bond significantly.", correct: true, feedback: { correct: "Right. The difference goes straight to capital, and you never notice the money because you were already living without it.", incorrect: "It's true. Maintaining the old payment after a cut sends the difference to capital." } } },
      { variantId: "rex-rp-yd-sc", step: { type: "scenario", question: "Ayesha qualifies for a bond at the maximum the bank allows, at current rates. What's the risk?", options: ["A rate rise could break the budget", "Nothing, the bank checked", "Her rate is fixed for the whole term", "Rates never rise anyway"], correct: 0, feedback: { correct: "Right. Bank approval reflects today's rate and their risk appetite, not her comfort three hikes from now.", incorrect: "Rate risk. Approval at today's rate says nothing about affordability at a higher one." } } },
    ],
  },
];

// ── Inflation, Interest Rates and Your Money ────────────────────────────────
const mpcSlots: QuestionSlot[] = [
  {
    slotId: "rand-economy/mpc/target",
    conceptId: "inflation-targeting",
    variants: [
      { variantId: "rex-mp-tg-mcq", step: { type: "mcq", question: "What is the SARB's inflation target?", options: ["3%, plus or minus one point", "Somewhere between 3% and 6% a year", "Below 10% at absolutely all times", "There is no formal target at all"], correct: 0, feedback: { correct: "Right. SA moved from the old 3–6% range to a 3% point target with a ±1 percentage point band.", incorrect: "It's a 3% point target with a ±1 percentage point tolerance band, replacing the previous 3–6% range." } } },
      { variantId: "rex-mp-tg-tf", step: { type: "true-false", statement: "A lower inflation target generally means lower interest rates over the long run.", correct: true, feedback: { correct: "Right. Once low inflation is credible, nominal rates can settle lower, which helps borrowers over time.", incorrect: "It's true over the long run. Credible low inflation allows lower nominal rates, though the transition can be painful." } } },
      { variantId: "rex-mp-tg-sc", step: { type: "scenario", question: "CPI prints at 7.2%, well above target. What's the most likely MPC response?", options: ["Raise or hold the repo rate", "Cut the repo rate immediately", "Fix the exchange rate", "Reduce the fuel levy"], correct: 0, feedback: { correct: "Right. The MPC's mandate is the inflation target, so an overshoot points toward tighter policy.", incorrect: "Tightening. Cutting rates into an inflation overshoot would work against the mandate." } } },
    ],
  },
  {
    slotId: "rand-economy/mpc/real-return",
    conceptId: "inflation",
    variants: [
      { variantId: "rex-mp-rr-fill", step: { type: "fill-blank", title: "Real return in rands", prompt: "R100 000 in a fixed deposit earns 10.5%. That's R10 500. Inflation of 4.8% means you need R4 800 just to stand still. Your real gain = R____.", correct: 5700, feedback: { correct: "R10 500 − R4 800 = R5 700 of genuine purchasing power, and that's before tax on the interest.", incorrect: "R10 500 earned less the R4 800 inflation costs you = R5 700 real gain." } } },
      { variantId: "rex-mp-rr-mcq", step: { type: "mcq", question: "Why does the real return matter more than the headline interest rate?", options: ["It shows real buying power", "It is always the higher number", "It excludes any tax", "Banks advertise it widely"], correct: 0, feedback: { correct: "Right. A 10% return with 12% inflation leaves you poorer, despite the number looking good.", incorrect: "It measures purchasing power. A high nominal rate can still be a real loss." } } },
      { variantId: "rex-mp-rr-tf", step: { type: "true-false", statement: "A 6% return with 8% inflation means you lost purchasing power that year.", correct: true, feedback: { correct: "Right. About 2% in real terms, and more after tax on the interest.", incorrect: "It's true. The nominal gain is smaller than inflation, so your money buys less." } } },
    ],
  },
  {
    slotId: "rand-economy/mpc/cash-risk",
    conceptId: "inflation",
    variants: [
      { variantId: "rex-mp-cr-tf", step: { type: "true-false", statement: "Keeping all your savings in a bank account is a 'safe' strategy that protects your wealth over 20 years.", correct: false, feedback: { correct: "Right. Cash is safe from volatility but not from inflation. Over 20 years it reliably loses purchasing power after tax.", incorrect: "It protects the number, not the value. Over long periods, cash after tax rarely beats inflation." } } },
      { variantId: "rex-mp-cr-mcq", step: { type: "mcq", question: "What's the real risk of holding long-term savings entirely in cash?", options: ["Inflation eroding buying power", "The bank itself failing entirely", "The account fees", "Nothing, cash is riskless"], correct: 0, feedback: { correct: "Right. It's the risk that feels like safety, which is precisely why it catches people.", incorrect: "Inflation erosion. It's gradual and invisible, which makes it easy to ignore for years." } } },
      { variantId: "rex-mp-cr-sc", step: { type: "scenario", question: "Nomsa keeps her entire retirement savings in a fixed deposit because 'shares are risky'. What's the honest assessment?", options: ["She's traded volatility for inflation", "She has made the safest choice", "She should move it all into shares now", "There's no meaningful difference"], correct: 0, feedback: { correct: "Right. Over decades, the risk of not growing ahead of inflation outweighs the risk of market swings she can wait out.", incorrect: "She's swapped one risk for another. Over a long horizon, inflation is the more certain threat." } } },
    ],
  },
  {
    slotId: "rand-economy/mpc/what-you-do",
    conceptId: "inflation-targeting",
    variants: [
      { variantId: "rex-mp-wd-mcq", step: { type: "mcq", question: "What should an ordinary saver actually do about MPC decisions?", options: ["Stress-test your debt affordability", "Trade around each announcement", "Move into cash before every meeting", "Ignore inflation entirely"], correct: 0, feedback: { correct: "Right. Rate decisions matter through your debt and your real returns, not as trading signals.", incorrect: "Focus on debt affordability and real returns. Trading around announcements is noise." } } },
      { variantId: "rex-mp-wd-tf", step: { type: "true-false", statement: "Rate cycles are worth planning for even though the timing can't be predicted.", correct: true, feedback: { correct: "Right. You don't need to forecast the cycle to budget for a higher rate and bank the benefit of a lower one.", incorrect: "It's true. Planning for both directions works without any forecast at all." } } },
      { variantId: "rex-mp-wd-sc", step: { type: "scenario", question: "Sipho hears rates may rise twice this year. What's a sensible response?", options: ["Check his payments at a higher rate", "Sell all of his investments", "Take on more debt before rates rise", "Do nothing at all about it"], correct: 0, feedback: { correct: "Right. Stress-testing his own position is useful whether or not the forecast turns out to be right.", incorrect: "Stress-test and build a buffer. Borrowing ahead of rises increases exposure to exactly the risk he's worried about." } } },
    ],
  },
];

// ── The Repo Rate Changed, What Happens to You? (applied) ───────────────────
const repoAppSlots: QuestionSlot[] = [
  {
    slotId: "rand-economy/repo-applied/mechanism",
    conceptId: "repo-rate-effect",
    variants: [
      { variantId: "rex-ra-mc-sc", step: { type: "scenario", question: "CPI has risen to 7.2%, well above the SARB's target, and the MPC raises the repo rate. What links higher rates to lower inflation?", options: ["Borrowing costs rise and demand eases", "Retailers must legally cut prices", "The rand is fixed at a stronger level", "Import duties are reduced"], correct: 0, feedback: { correct: "Right, and it works with a lag of many months, which is why the MPC acts on forecasts rather than the latest print.", incorrect: "It works through demand: dearer credit reduces spending, which eases pressure on prices." } } },
      { variantId: "rex-ra-mc-mcq", step: { type: "mcq", question: "Which channel transmits a repo rate change to households fastest?", options: ["Variable-rate debt", "Grocery shelf prices", "Wages and salaries", "Property market values"], correct: 0, feedback: { correct: "Right. Bonds, car finance and credit cards reprice almost immediately; everything else takes far longer.", incorrect: "Variable-rate debt. Bonds and credit repricing is the first thing households feel." } } },
      { variantId: "rex-ra-mc-tf", step: { type: "true-false", statement: "A repo rate increase reaches consumer prices with a lag of several months or more.", correct: true, feedback: { correct: "Right, which is why the MPC is often raising rates while inflation is still climbing.", incorrect: "It's true. The transmission to prices takes many months, so policy has to be forward-looking." } } },
    ],
  },
  {
    slotId: "rand-economy/repo-applied/your-bond",
    conceptId: "repo-rate-effect",
    variants: [
      { variantId: "rex-ra-yb-fill", step: { type: "fill-blank", title: "The instalment effect", prompt: "A rule of thumb: every 1% rate move changes a R1 000 000 bond by roughly R650 a month. On a R2 000 000 bond, a 1% rise adds roughly R____ a month.", correct: 1300, feedback: { correct: "Roughly R1 300 a month, or about R15 600 a year. From one 1% move.", incorrect: "Double the R1m figure: about R1 300 a month on R2 million." } } },
      { variantId: "rex-ra-yb-mcq", step: { type: "mcq", question: "Your bond is at prime minus 0.25% and the repo rate rises 0.5%. What happens to your rate?", options: ["It rises 0.5%", "It rises 0.25%", "It stays the same", "It rises 0.75%"], correct: 0, feedback: { correct: "Right. Prime moves with the repo rate and your negotiated margin is unchanged.", incorrect: "The full 0.5%. Your discount to prime is fixed; prime itself moves." } } },
      { variantId: "rex-ra-yb-tf", step: { type: "true-false", statement: "Fixing your bond rate removes uncertainty but usually costs more than a variable rate over the full term.", correct: true, feedback: { correct: "Right. You're buying certainty, and the bank prices that premium in. Worth it if the certainty is what you need.", incorrect: "It's true. Fixed rates carry a premium; you're paying for predictability rather than a better expected cost." } } },
    ],
  },
  {
    slotId: "rand-economy/repo-applied/who-benefits",
    conceptId: "repo-rate-effect",
    variants: [
      { variantId: "rex-ra-wb-mcq", step: { type: "mcq", question: "The repo rate rises. Which group benefits?", options: ["Savers living off interest", "Home loan holders", "People paying off car finance", "Anyone with a credit card balance"], correct: 0, feedback: { correct: "Right. A retiree with money in a money market fund sees their income rise as borrowers' costs go up.", incorrect: "Savers. Everyone else on that list holds variable-rate debt that becomes more expensive." } } },
      { variantId: "rex-ra-wb-sc", step: { type: "scenario", question: "Lerato has no debt and R500 000 in a money market fund. Rates rise 1%. What's the effect?", options: ["About R5 000 more", "About R500 more a year", "Nothing changes", "Her capital falls by 1%"], correct: 0, feedback: { correct: "R500 000 × 1% = R5 000 a year more, taxable above her R23 800 interest exemption.", incorrect: "R500 000 × 1% = R5 000 more a year in interest." } } },
      { variantId: "rex-ra-wb-tf", step: { type: "true-false", statement: "Whether a rate rise helps or hurts you depends on whether you're a net borrower or a net saver.", correct: true, feedback: { correct: "Right. That's the whole calculation. Compare your interest-bearing debt against your interest-earning savings.", incorrect: "It's true. Net borrowers lose, net savers gain, and the size of each balance decides by how much." } } },
    ],
  },
  {
    slotId: "rand-economy/repo-applied/action",
    conceptId: "repo-rate-effect",
    variants: [
      { variantId: "rex-ra-ac-mcq", step: { type: "mcq", question: "Rates have just risen. What's the most useful action for someone with a bond?", options: ["Recheck the budget and buffer", "Fix the rate immediately at any cost", "Extend the loan term", "Stop paying into retirement savings"], correct: 0, feedback: { correct: "Right. The emergency fund is what stops a rate cycle turning into a credit-card cycle.", incorrect: "Reassess the budget and protect the buffer. Extending the term or cutting retirement savings are expensive last resorts." } } },
      { variantId: "rex-ra-ac-tf", step: { type: "true-false", statement: "When rates eventually fall, keeping your instalment at the higher level shortens the bond considerably.", correct: true, feedback: { correct: "Right, and it's painless. You've already been living on the lower take-home for months.", incorrect: "It's true. Maintaining the higher payment sends the difference straight to capital." } } },
      { variantId: "rex-ra-ac-sc", step: { type: "scenario", question: "Thabo's instalment rises R1 400 and his budget no longer balances. What's the right order?", options: ["Cut discretionary spending first", "Miss a payment and explain later", "Take a personal loan to cover it", "Cancel his insurance"], correct: 0, feedback: { correct: "Right. A missed bond payment damages his record and his options; talking to the bank early keeps both intact.", incorrect: "Cut discretionary spending and speak to the bank early. Loans and cancelled insurance create bigger problems." } } },
    ],
  },
];

export const RAND_ECONOMY_EXTRA_BANKS: Record<string, LessonBank> = {
  "rand-economy::lesson-offshore-investing-mechanics": {
    layout: L(offSlots, "How Offshore Investing Actually Works", "<p>A <strong>JSE-listed global ETF</strong> gives you global share exposure plus rand exposure, bought locally in rands, <strong>no SARS clearance, no allowance used</strong>. If the rand moves from R17/$ to R19/$ with markets flat, your R100 000 becomes about <strong>R111 800</strong>. To externalise actual rands you have the <strong>R2m Single Discretionary Allowance</strong> and the R10m FIA with SARS approval. <strong>Regulation 28</strong> caps retirement funds at 45% offshore. Discretionary money is unrestricted.</p>"),
    slots: offSlots,
  },
  "rand-economy::lesson-petrol-price-rand": {
    layout: L(petrolSlots, "Why the Rand Reaches the Pump", "<p>Oil is priced in dollars, so the petrol price depends on both the <strong>oil price and the exchange rate</strong>. Petrol can rise even when oil falls. The <strong>Basic Fuel Price</strong> is only one component: the general fuel levy, the RAF levy, wholesale and retail margins and transport all sit on top, and the levies are set in the Budget. Fuel reaches even non-drivers through taxi fares and food prices, which is why increases hit low-income households hardest.</p>"),
    slots: petrolSlots,
  },
  "rand-economy::lesson-how-to-hedge-rand": {
    layout: L(hedgeSlots, "Protecting Against Rand Weakness", "<p>The most accessible hedge is a <strong>JSE-listed global ETF</strong>, no minimum, no clearance, real global exposure from R1 000 a month. It matters because a South African earning rands and owning local property is already heavily SA-exposed before the portfolio starts. When the rand fell from R14/$ to R19/$, a 40% offshore allocation added roughly <strong>14% at portfolio level</strong> from currency alone. But it hedges currency, not markets, and it works best as a steady allocation, not a panic transfer.</p>"),
    slots: hedgeSlots,
  },
  "rand-economy::lesson-sarb-intervention": {
    layout: L(sarbSlots, "What the SARB Can and Can't Do", "<p>The rand <strong>floats freely</strong>: the SARB targets inflation, not an exchange rate, and defending a currency level against global capital flows rarely works. Higher rates tend to support the rand by attracting capital, but global risk sentiment often dominates: the rand is a liquid emerging-market currency used as a risk proxy. SA's <strong>FATF grey listing (Feb 2023)</strong> weighed on it; SA <strong>exited the grey list on 24 October 2025</strong>.</p>"),
    slots: sarbSlots,
  },
  "rand-economy::lesson-sa-trade-balance": {
    layout: L(tradeSlots, "Exports, Imports and the Rand", "<p>South Africa exports mined commodities, so the rand behaves like a <strong>commodity currency</strong>: a platinum price collapse means fewer export dollars and a weaker rand, while a boom supports it. A <strong>stronger rand makes exports less competitive</strong> but imports cheaper. Households feel it through fuel, electronics, medicine and imported food inputs, which is why a weaker rand pushes inflation up. Nobody forecasts currencies reliably; a steady allocation beats timing.</p>"),
    slots: tradeSlots,
  },
  "rand-economy::lesson-repo-rate-explained": {
    layout: L(repoSlots, "The Rate Behind Every Other Rate", "<p>The <strong>repo rate</strong> is what the SARB charges banks. <strong>Prime = repo + 3.5%</strong>, and prime moves point for point with it, so a 0.25% cut lowers a variable bond by exactly 0.25%. Every decision moves money between borrowers and savers: rate rises hurt anyone with a bond and help anyone with deposits. Rates affect inflation by cooling demand, and the effect arrives with a lag of many months.</p>"),
    slots: repoSlots,
  },
  "rand-economy::lesson-mpc-and-inflation": {
    layout: L(mpcSlots, "Inflation Targeting and Your Money", "<p>The SARB targets <strong>3% inflation, with a ±1 percentage point tolerance band</strong>, a point target that replaced the old 3–6% range. What matters to you is the <strong>real return</strong>: 10.5% interest with 4.8% inflation is 5.7% real, and 6% with 8% inflation is a loss. That's why holding long-term savings entirely in cash isn't safe. It's a slow, certain erosion of purchasing power dressed up as caution.</p>"),
    slots: mpcSlots,
  },
  "rand-economy::lesson-applied-repo-rate-impact": {
    layout: L(repoAppSlots, "The Repo Rate Just Changed", "<p>CPI has risen to <strong>7.2%</strong>, well above target, and the MPC raises the repo rate. Higher borrowing costs cool spending, which eases price pressure, with a lag of many months. The fastest channel to households is <strong>variable-rate debt</strong>: roughly <strong>R650 a month per 1% on a R1 000 000 bond</strong>. Savers gain what borrowers lose. Whether a hike helps or hurts you comes down to whether you're a net borrower or a net saver.</p>"),
    slots: repoAppSlots,
  },
};
