import type { LessonLayoutItem, QuestionSlot } from "@/data/content";
import type { LessonBank } from "./money-basics";

/**
 * Bank for "RE5 Exam Prep" (FAIS regulatory exam).
 *
 * Regulatory facts verified current:
 *  - FSCA is the conduct regulator (replaced the FSB under Twin Peaks);
 *    Prudential Authority handles soundness. FAIS regulates conduct, not returns.
 *  - Register update within 15 days; qualification generally within 6 years of
 *    DOFA; CPD cycle 1 June–31 May (commonly 6/12/18 hours).
 *  - General Code record retention 5 years; FICA records 5 years.
 *  - Complaints: FSP has 6 weeks; client then 6 months to the Ombud; 3-year
 *    prescription. FAIS Ombud award cap R3.5 million (raised from R800 000 on
 *    1 July 2024). FICA: CDD, RMCP, STR/CTR reporting, no tipping off.
 * The two 50-question mock exams (re5-mock-a/b) are intentionally left whole
 * (not banked) so they remain full-length practice papers.
 */

// ── helpers keep this large file readable ──────────────────────────────────
const info = (title: string, content: string): LessonLayoutItem => ({ type: "info", title, content });

// ═══════════════════════════════════════════════════════════════════════════
// UNIT 1
// ═══════════════════════════════════════════════════════════════════════════

const l1PurposeSlots: QuestionSlot[] = [
  {
    slotId: "re5/l1-purpose/what-fais-does",
    conceptId: "fais-purpose",
    variants: [
      { variantId: "re5-pur-wd-mcq", step: { type: "mcq", question: "What does the FAIS Act primarily regulate?", options: ["The conduct of those who render financial advice and intermediary services", "The performance of financial products", "Interest rates", "Only banks"], correct: 0, feedback: { correct: "Right. FAIS is market-conduct law, it governs how services are rendered, not product returns.", incorrect: "FAIS regulates conduct, how advice and intermediary services are given, not product performance or pricing." } } },
      { variantId: "re5-pur-wd-tf", step: { type: "true-false", statement: "FAIS guarantees that a product approved by the FSCA won't lose money.", correct: false, feedback: { correct: "Correct. FAIS regulates conduct: it never guarantees returns or vets a product's investment merits.", incorrect: "It doesn't. FAIS is about conduct; no regulator guarantees a product's performance." } } },
      { variantId: "re5-pur-wd-sc", step: { type: "scenario", question: "A client says 'FAIS means the FSCA guarantees my returns.' Why is this wrong?", options: ["FAIS regulates the conduct of advisers, not product performance", "Only Category I products are guaranteed", "The guarantee needs a written waiver", "It's correct"], correct: 0, feedback: { correct: "Right. FAIS is a conduct law, it governs how advice is given, not whether an investment succeeds.", incorrect: "FAIS regulates conduct, not performance. Nothing in it guarantees a client's returns." } } },
    ],
  },
  {
    slotId: "re5/l1-purpose/regulators",
    conceptId: "fais-purpose",
    variants: [
      { variantId: "re5-pur-reg-mcq", step: { type: "mcq", question: "Which body is the market-conduct regulator that licenses FSPs?", options: ["The Financial Sector Conduct Authority", "The Prudential Authority", "The SARB Monetary Policy Committee", "The FAIS Ombud"], correct: 0, feedback: { correct: "Right. The FSCA licenses and supervises FSPs' conduct.", incorrect: "It's the FSCA. The Prudential Authority handles soundness; the Ombud resolves complaints." } } },
      { variantId: "re5-pur-reg-tf", step: { type: "true-false", statement: "The FSCA replaced the Financial Services Board (FSB) under the Twin Peaks model.", correct: true, feedback: { correct: "Right. FSB → FSCA for conduct; the Prudential Authority was created for soundness.", incorrect: "It's true. Under Twin Peaks the FSB became the FSCA (conduct)." } } },
      { variantId: "re5-pur-reg-mcq2", step: { type: "mcq", question: "The Prudential Authority (in the Reserve Bank) is mainly concerned with:", options: ["The safety and soundness of institutions", "Licensing individual advisers", "Resolving client complaints", "Setting commission rates"], correct: 0, feedback: { correct: "Right. Prudential = soundness of institutions; the FSCA handles market conduct.", incorrect: "The Prudential Authority oversees institutional soundness. Conduct and licensing sit with the FSCA." } } },
    ],
  },
  {
    slotId: "re5/l1-purpose/conduct-focus",
    conceptId: "fais-purpose",
    variants: [
      { variantId: "re5-pur-cf-tf", step: { type: "true-false", statement: "FAIS regulates how business is done (conduct), not the design of the products themselves.", correct: true, feedback: { correct: "Right. It's conduct regulation, disclosure, suitability, fair dealing.", incorrect: "It's true. FAIS targets conduct, not product design." } } },
      { variantId: "re5-pur-cf-mcq", step: { type: "mcq", question: "Which best describes FAIS's focus?", options: ["The behaviour of advisers and intermediaries toward clients", "The returns products must achieve", "The tax on investments", "The rand exchange rate"], correct: 0, feedback: { correct: "Right. FAIS is about how advisers behave toward clients.", incorrect: "FAIS focuses on conduct toward clients, not returns, tax, or currencies." } } },
      { variantId: "re5-pur-cf-sc", step: { type: "scenario", question: "Where older material refers to 'the Registrar', how should you read it today?", options: ["As the FSCA / the Authority", "As the FAIS Ombud", "As the SARB", "As SARS"], correct: 0, feedback: { correct: "Right. 'Registrar' is legacy wording for the FSCA / the Authority.", incorrect: "Read 'Registrar' as the FSCA (the Authority) in current terms." } } },
    ],
  },
  {
    slotId: "re5/l1-purpose/aims",
    conceptId: "fais-purpose",
    variants: [
      { variantId: "re5-pur-aim-mcq", step: { type: "mcq", question: "Which is a core aim of FAIS?", options: ["Ensure clients get suitable advice and clear disclosure", "Guarantee investment growth", "Fix product prices", "Ban commission entirely"], correct: 0, feedback: { correct: "Right. Professionalise the industry, ensure suitability and disclosure, and provide the Ombud.", incorrect: "FAIS aims for suitable advice, disclosure and a complaints avenue, not guaranteed growth or fixed prices." } } },
      { variantId: "re5-pur-aim-tf", step: { type: "true-false", statement: "One aim of FAIS is to give clients an avenue to complain: the FAIS Ombud.", correct: true, feedback: { correct: "Right. The Ombud is part of the FAIS protection framework.", incorrect: "It's true. FAIS established the Ombud as a complaints avenue for clients." } } },
      { variantId: "re5-pur-aim-mcq2", step: { type: "mcq", question: "FAIS forces disclosure so that clients can:", options: ["Make informed decisions", "Avoid all tax", "Earn guaranteed returns", "Skip the needs analysis"], correct: 0, feedback: { correct: "Right. Disclosure exists to enable informed client decisions.", incorrect: "The point of disclosure is informed decisions, not tax, guarantees, or shortcuts." } } },
    ],
  },
];

const l2DefinitionsSlots: QuestionSlot[] = [
  {
    slotId: "re5/l1-definitions/advice",
    conceptId: "fais-definitions",
    variants: [
      { variantId: "re5-def-adv-mcq", step: { type: "mcq", question: "What makes something 'advice' under FAIS?", options: ["A recommendation, guidance or proposal about a financial product", "Any mention of a product", "Only a completed sale", "Reading a brochure aloud"], correct: 0, feedback: { correct: "Right. The line is the recommendation/guidance/proposal.", incorrect: "Advice needs a recommendation, guidance or proposal, not just any product mention." } } },
      { variantId: "re5-def-adv-tf", step: { type: "true-false", statement: "Purely factual product information, with no recommendation, is 'advice' under FAIS.", correct: false, feedback: { correct: "Correct. Factual info with no recommendation is expressly excluded from advice.", incorrect: "It's not advice. Without a recommendation, factual information falls outside the definition." } } },
      { variantId: "re5-def-adv-sc", step: { type: "scenario", question: "A teller reads the fixed rate and term of a savings product from a brochure, making no recommendation. Is that 'advice'?", options: ["No. Factual information without a recommendation is not advice", "Yes. Any product discussion is advice", "Yes. It involves a product", "Only if the client buys"], correct: 0, feedback: { correct: "Right. No recommendation, no advice.", incorrect: "Advice needs a recommendation. Purely factual information is excluded." } } },
    ],
  },
  {
    slotId: "re5/l1-definitions/intermediary",
    conceptId: "fais-definitions",
    variants: [
      { variantId: "re5-def-int-mcq", step: { type: "mcq", question: "Which is an INTERMEDIARY SERVICE (not advice)?", options: ["Submitting the client's completed policy application to the insurer", "Recommending a switch from Fund A to Fund B", "Proposing the client increase cover", "Guiding the client on whether to cancel"], correct: 0, feedback: { correct: "Right. Submitting the application is an act done for the client, an intermediary service.", incorrect: "The others are recommendations (advice). Submitting the application is the intermediary service." } } },
      { variantId: "re5-def-int-tf", step: { type: "true-false", statement: "Collecting premiums or handling client money for a product is an intermediary service.", correct: true, feedback: { correct: "Right. Acts done with a view to buying/maintaining a product (short of advice) are intermediary services.", incorrect: "It's true. Handling premiums/applications on the client's behalf is an intermediary service." } } },
      { variantId: "re5-def-int-mcq2", step: { type: "mcq", question: "An 'intermediary service' is defined as any act, OTHER than advice, that is:", options: ["Performed for a client with a view to buying or maintaining a product", "A recommendation to buy", "A guarantee of returns", "A tax calculation"], correct: 0, feedback: { correct: "Right. It's a client-facing act (not advice) aimed at concluding or maintaining a product.", incorrect: "It's an act other than advice, done for the client to buy or maintain a product." } } },
    ],
  },
  {
    slotId: "re5/l1-definitions/roles",
    conceptId: "fais-definitions",
    variants: [
      { variantId: "re5-def-rol-mcq", step: { type: "mcq", question: "Who manages or oversees the financial services an FSP renders?", options: ["The Key Individual (KI)", "The representative", "The compliance officer", "The FAIS Ombud"], correct: 0, feedback: { correct: "Right. The KI carries the management/oversight responsibility.", incorrect: "It's the Key Individual. The representative renders services; the compliance officer monitors." } } },
      { variantId: "re5-def-rol-tf", step: { type: "true-false", statement: "A 'representative' is a person who renders advice or intermediary services for an FSP.", correct: true, feedback: { correct: "Right. Reps render services on behalf of the FSP; KIs oversee.", incorrect: "It's true. The representative renders the services for the FSP." } } },
      { variantId: "re5-def-rol-mcq2", step: { type: "mcq", question: "The 'FSP' in FAIS refers to:", options: ["The licensed business authorised to render financial services", "The client", "The regulator", "The Ombud"], correct: 0, feedback: { correct: "Right. The FSP is the licensed provider business.", incorrect: "The FSP is the licensed business. The FSCA is the regulator; the Ombud resolves complaints." } } },
    ],
  },
  {
    slotId: "re5/l1-definitions/advice-vs-not",
    conceptId: "fais-definitions",
    variants: [
      { variantId: "re5-def-avn-mcq", step: { type: "mcq", question: "Which of these IS advice (not excluded)?", options: ["A specific recommendation to buy a particular unit trust", "Factual product terms with no recommendation", "An objective display of product information", "General information on how a product type works"], correct: 0, feedback: { correct: "Right. A specific recommendation to buy is advice.", incorrect: "The specific recommendation is advice. The others are excluded factual/objective information." } } },
      { variantId: "re5-def-avn-tf", step: { type: "true-false", statement: "Recommending a client REPLACE an existing policy with a new one is advice.", correct: true, feedback: { correct: "Right. A recommendation to buy, replace or terminate is advice.", incorrect: "It's true. Recommending replacement is a recommendation of a financial nature, advice." } } },
      { variantId: "re5-def-avn-sc", step: { type: "scenario", question: "Which act is NOT advice?", options: ["Submitting a completed application form for the client", "Recommending switching funds", "Proposing more cover", "Advising to cancel a policy"], correct: 0, feedback: { correct: "Right. Submitting the form is an intermediary service, not advice.", incorrect: "The recommendations are advice; submitting the application is the intermediary service." } } },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// UNIT 2
// ═══════════════════════════════════════════════════════════════════════════

const l3CategoriesSlots: QuestionSlot[] = [
  {
    slotId: "re5/l2-categories/need-licence",
    conceptId: "fsp-categories",
    variants: [
      { variantId: "re5-cat-nl-tf", step: { type: "true-false", statement: "A person may render financial services without an FSP licence as long as they are honest.", correct: false, feedback: { correct: "Correct. Rendering financial services without a licence is an offence: honesty doesn't substitute for authorisation.", incorrect: "False. You may not act as an FSP without a licence; doing so is an offence." } } },
      { variantId: "re5-cat-nl-mcq", step: { type: "mcq", question: "Before granting a licence, the FSCA checks that the applicant and its KIs:", options: ["Meet the fit & proper requirements", "Guarantee client returns", "Have the most clients", "Charge the lowest fees"], correct: 0, feedback: { correct: "Right. Fit & proper must be met before a licence is granted (possibly with conditions).", incorrect: "The test is fit & proper, not returns, client numbers, or fees." } } },
      { variantId: "re5-cat-nl-sc", step: { type: "scenario", question: "Someone renders financial advice for reward without any FSP licence. This is:", options: ["An offence under FAIS", "Allowed if under R1m turnover", "Allowed with a client waiver", "Allowed for six months"], correct: 0, feedback: { correct: "Right. Unlicensed rendering of financial services is an offence.", incorrect: "It's an offence. There's no turnover threshold or waiver that makes it lawful." } } },
    ],
  },
  {
    slotId: "re5/l2-categories/category-2",
    conceptId: "fsp-categories",
    variants: [
      { variantId: "re5-cat-c2-mcq", step: { type: "mcq", question: "An FSP makes buy/sell decisions on a client's portfolio without approving each trade. Which category?", options: ["Category II", "Category I", "Category III", "Category IV"], correct: 0, feedback: { correct: "Right. Investment discretion on the client's behalf is Category II.", incorrect: "It's Category II (discretionary). Category I is advice/intermediary services only." } } },
      { variantId: "re5-cat-c2-tf", step: { type: "true-false", statement: "A Category I FSP may exercise investment discretion over a client's portfolio without per-transaction approval.", correct: false, feedback: { correct: "Correct. Discretion requires Category II. Category I covers advice/intermediary services.", incorrect: "False. Discretionary decision-making needs a Category II licence, not Category I." } } },
      { variantId: "re5-cat-c2-mcq2", step: { type: "mcq", question: "Category III FSPs are:", options: ["Administrative FSPs", "Hedge fund FSPs", "Assistance business FSPs", "Ordinary advisers"], correct: 0, feedback: { correct: "Right. Category III = administrative FSPs (LISPs). IIA = hedge funds; IV = assistance business; I = advisers.", incorrect: "Category III is administrative (LISPs). Hedge funds are IIA, assistance business IV, advisers I." } } },
    ],
  },
  {
    slotId: "re5/l2-categories/category-1",
    conceptId: "fsp-categories",
    variants: [
      { variantId: "re5-cat-c1-mcq", step: { type: "mcq", question: "The most common licence, for ordinary advisers giving advice and/or intermediary services, is:", options: ["Category I", "Category II", "Category IIA", "Category IV"], correct: 0, feedback: { correct: "Right. Category I is the ordinary advice/intermediary licence.", incorrect: "It's Category I. II is discretionary, IIA hedge funds, IV assistance business." } } },
      { variantId: "re5-cat-c1-tf", step: { type: "true-false", statement: "Category IV covers assistance business FSPs.", correct: true, feedback: { correct: "Right. Category IV = assistance business.", incorrect: "It's true. Category IV is assistance business." } } },
      { variantId: "re5-cat-c1-mcq2", step: { type: "mcq", question: "Hedge fund FSPs fall under which category?", options: ["Category IIA", "Category I", "Category III", "Category IV"], correct: 0, feedback: { correct: "Right. Hedge funds are Category IIA.", incorrect: "Hedge funds are Category IIA, a discretionary sub-category." } } },
    ],
  },
  {
    slotId: "re5/l2-categories/licence-scope",
    conceptId: "fsp-categories",
    variants: [
      { variantId: "re5-cat-ls-tf", step: { type: "true-false", statement: "An FSP may render services in any product subcategory it wishes, as long as it holds some valid licence.", correct: false, feedback: { correct: "Correct. A licence covers only the specific categories and subcategories approved.", incorrect: "False. The licence is limited to the approved categories and product subcategories." } } },
      { variantId: "re5-cat-ls-mcq", step: { type: "mcq", question: "An FSP licensed only for long-term insurance starts advising on shares. This is:", options: ["Acting outside its licensed subcategories, a breach", "Fine, since it has a licence", "Fine, with a client waiver", "Fine for six months"], correct: 0, feedback: { correct: "Right. It's authorised only for what it applied and was approved for.", incorrect: "Acting outside approved subcategories breaches the licence: a general licence isn't a free pass." } } },
      { variantId: "re5-cat-ls-sc", step: { type: "scenario", question: "A representative wants to advise on a product their FSP isn't licensed for. May they?", options: ["No. A rep can't render services the FSP itself isn't licensed for", "Yes, if the client agrees", "Yes, under supervision", "Yes, once qualified"], correct: 0, feedback: { correct: "Right. Reps are bound by the FSP's own authorisation.", incorrect: "No. A representative can't exceed the FSP's licensed categories, whatever the client says." } } },
    ],
  },
];

const l4SuspendSlots: QuestionSlot[] = [
  {
    slotId: "re5/l2-suspend/grounds",
    conceptId: "fsp-licence-action",
    variants: [
      { variantId: "re5-sus-gr-mcq", step: { type: "mcq", question: "Which is a ground for the FSCA to suspend or withdraw a licence?", options: ["The FSP no longer meets fit & proper, or got the licence by fraud", "The FSP earned high profits", "A client changed advisers", "The FSP hired new staff"], correct: 0, feedback: { correct: "Right. Losing fit & proper, fraud, non-rendering, or serious breaches are grounds.", incorrect: "Grounds include failing fit & proper, fraud, or serious contraventions, not profit or ordinary staffing." } } },
      { variantId: "re5-sus-gr-tf", step: { type: "true-false", statement: "Obtaining a licence through a materially false statement can lead to suspension or withdrawal.", correct: true, feedback: { correct: "Right. Fraud or material misstatement is a clear ground.", incorrect: "It's true. A licence obtained by material falsehood can be suspended or withdrawn." } } },
      { variantId: "re5-sus-gr-mcq2", step: { type: "mcq", question: "An FSP has rendered no financial services for a long set period. The FSCA may:", options: ["Suspend or withdraw the licence", "Do nothing, ever", "Increase its fees", "Guarantee its clients' returns"], correct: 0, feedback: { correct: "Right. Prolonged non-rendering is a ground for action.", incorrect: "Non-rendering for a set period is a ground to suspend or withdraw." } } },
    ],
  },
  {
    slotId: "re5/l2-suspend/notice-first",
    conceptId: "fsp-licence-action",
    variants: [
      { variantId: "re5-sus-nf-sc", step: { type: "scenario", question: "The FSCA finds an FSP misappropriating client premiums, an immediate risk to clients. It may:", options: ["Suspend or withdraw immediately", "Always wait the full notice period first", "Refer it to the FAIS Ombud instead", "Do nothing until a court rules"], correct: 0, feedback: { correct: "Right. Where delay would prejudice clients/public, it may act first and hear representations after.", incorrect: "With immediate client risk, the FSCA can act first and take representations afterward." } } },
      { variantId: "re5-sus-nf-tf", step: { type: "true-false", statement: "Normally the FSCA gives an FSP notice and a chance to make representations before suspending its licence.", correct: true, feedback: { correct: "Right. Fair process applies unless urgent client/public prejudice requires acting first.", incorrect: "It's true. Ordinarily notice and representations come first, save for urgent cases." } } },
      { variantId: "re5-sus-nf-mcq", step: { type: "mcq", question: "The FSCA may act BEFORE hearing representations when:", options: ["A delay would prejudice clients or the public", "The FSP asks it to", "It is a Friday", "The FSP is profitable"], correct: 0, feedback: { correct: "Right. Urgency (prejudice to clients/public) justifies acting first.", incorrect: "Only urgency, prejudice to clients or the public, justifies acting before representations." } } },
    ],
  },
  {
    slotId: "re5/l2-suspend/suspend-vs-withdraw",
    conceptId: "fsp-licence-action",
    variants: [
      { variantId: "re5-sus-sw-mcq", step: { type: "mcq", question: "How do suspension and withdrawal differ?", options: ["Suspension is temporary ; withdrawal ends the authorisation", "They are identical", "Withdrawal is temporary; suspension is permanent", "Neither affects the licence"], correct: 0, feedback: { correct: "Right. Suspend = temporary/conditional; withdraw = ends it.", incorrect: "Suspension is temporary (with conditions); withdrawal ends the authorisation." } } },
      { variantId: "re5-sus-sw-tf", step: { type: "true-false", statement: "A licence can also 'lapse'. For example if the FSP is liquidated or (a natural person) dies.", correct: true, feedback: { correct: "Right. Lapsing happens on certain events, separate from suspension/withdrawal.", incorrect: "It's true. A licence lapses on events like liquidation or the death of a natural-person FSP." } } },
      { variantId: "re5-sus-sw-mcq2", step: { type: "mcq", question: "A suspension may:", options: ["Carry conditions the FSP must meet to have it lifted", "Never be lifted", "Guarantee the FSP's income", "Apply only to clients"], correct: 0, feedback: { correct: "Right. Conditions can attach to a suspension; meeting them can lift it.", incorrect: "Suspensions are temporary and often conditional. Meeting the conditions can lift them." } } },
    ],
  },
  {
    slotId: "re5/l2-suspend/obligations-survive",
    conceptId: "fsp-licence-action",
    variants: [
      { variantId: "re5-sus-os-tf", step: { type: "true-false", statement: "Once a licence is withdrawn, all the FSP's earlier obligations to clients simply fall away.", correct: false, feedback: { correct: "Correct. Pre-existing obligations to clients and the FSCA survive, you can't escape liability by losing a licence.", incorrect: "False. Obligations that arose before withdrawal or lapsing continue." } } },
      { variantId: "re5-sus-os-mcq", step: { type: "mcq", question: "After a licence lapses, obligations to clients that arose before the lapse:", options: ["Continue and must still be met", "Disappear entirely", "Transfer to the FSCA", "Become the client's problem"], correct: 0, feedback: { correct: "Right. Prior obligations survive the lapse.", incorrect: "They continue, losing the licence doesn't erase existing duties." } } },
      { variantId: "re5-sus-os-sc", step: { type: "scenario", question: "An FSP surrenders its licence hoping to dodge liability for past poor advice. Does this work?", options: ["No. Pre-existing obligations and liability survive", "Yes, surrender wipes the slate clean", "Yes, after 30 days", "Yes, if clients don't object"], correct: 0, feedback: { correct: "Right. You can't escape prior liability by giving up the licence.", incorrect: "It doesn't work. Obligations from before the surrender remain." } } },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// UNIT 3
// ═══════════════════════════════════════════════════════════════════════════

const l5RolesSlots: QuestionSlot[] = [
  {
    slotId: "re5/l3-roles/register",
    conceptId: "fais-representatives",
    variants: [
      { variantId: "re5-rol-rg-mcq", step: { type: "mcq", question: "What must every FSP maintain about its representatives and KIs?", options: ["An up-to-date register with their authorised categories and supervision status", "Nothing in particular", "Only their salaries", "Only a phone list"], correct: 0, feedback: { correct: "Right. The register records categories/subcategories and whether they work under supervision.", incorrect: "An up-to-date register of reps and KIs (with categories and supervision status) is required." } } },
      { variantId: "re5-rol-rg-tf", step: { type: "true-false", statement: "The representatives register must be kept available for the FSCA.", correct: true, feedback: { correct: "Right. The FSCA can require access to it.", incorrect: "It's true. The register must be available to the FSCA." } } },
      { variantId: "re5-rol-rg-mcq2", step: { type: "mcq", question: "The register must record, for each representative:", options: ["The categories/subcategories they're authorised for and their supervision status", "Their home address only", "Their favourite products", "Their commission targets"], correct: 0, feedback: { correct: "Right. Authorised scope and supervision status are the key entries.", incorrect: "It records authorised categories/subcategories and supervision status." } } },
    ],
  },
  {
    slotId: "re5/l3-roles/fifteen-days",
    conceptId: "fais-representatives",
    variants: [
      { variantId: "re5-rol-fd-fill", step: { type: "fill-blank", title: "Updating the register", prompt: "An FSP must update its register of representatives within ___ days of an appointment or termination.", correct: 15, feedback: { correct: "Correct: 15 days.", incorrect: "The register must be updated within 15 days of the change." } } },
      { variantId: "re5-rol-fd-mcq", step: { type: "mcq", question: "How quickly must the representatives register be updated after a change?", options: ["Within 15 days", "Within 24 hours", "Within 3 months", "Within a year"], correct: 0, feedback: { correct: "Right. 15 days.", incorrect: "It's 15 days from the appointment or termination." } } },
      { variantId: "re5-rol-fd-tf", step: { type: "true-false", statement: "Register changes (appointments and terminations) can wait until the FSP's annual review.", correct: false, feedback: { correct: "Correct. They must be reflected within 15 days, not once a year.", incorrect: "False. Updates are due within 15 days of the change." } } },
    ],
  },
  {
    slotId: "re5/l3-roles/responsibility",
    conceptId: "fais-representatives",
    variants: [
      { variantId: "re5-rol-rs-mcq", step: { type: "mcq", question: "Who is ultimately accountable for representatives' conduct in rendering services?", options: ["The FSP", "The client", "The FAIS Ombud", "SARS"], correct: 0, feedback: { correct: "Right. The FSP is accountable; the KI manages/oversees.", incorrect: "The FSP is ultimately accountable for its reps' conduct." } } },
      { variantId: "re5-rol-rs-tf", step: { type: "true-false", statement: "A representative may render services the FSP itself is not licensed for.", correct: false, feedback: { correct: "Correct. Reps are bound by the FSP's authorisation.", incorrect: "False. A rep can't exceed the FSP's licensed categories." } } },
      { variantId: "re5-rol-rs-mcq2", step: { type: "mcq", question: "The Key Individual's core duty is to:", options: ["Manage and oversee the financial services rendered", "Render all advice personally", "Approve the FSCA's rules", "Audit the client"], correct: 0, feedback: { correct: "Right. The KI manages/oversees; reps render.", incorrect: "The KI manages and oversees the rendering of services." } } },
    ],
  },
  {
    slotId: "re5/l3-roles/supervision-dofa",
    conceptId: "fais-representatives",
    variants: [
      { variantId: "re5-rol-su-mcq", step: { type: "mcq", question: "A new representative hasn't yet passed the RE5 or completed the qualification. May they render advice?", options: ["Yes, under supervision and within the DOFA timelines", "No, never until fully competent", "Yes, without any restriction", "Only with a client waiver"], correct: 0, feedback: { correct: "Right. Under supervision while completing requirements within DOFA-based timelines.", incorrect: "They may work under supervision while completing requirements within the DOFA timelines." } } },
      { variantId: "re5-rol-su-tf", step: { type: "true-false", statement: "Competency timelines for a new representative are measured from their Date of First Appointment (DOFA).", correct: true, feedback: { correct: "Right. DOFA starts the clock for qualification and RE.", incorrect: "It's true. The timelines run from DOFA." } } },
      { variantId: "re5-rol-su-sc", step: { type: "scenario", question: "An FSP lets a brand-new rep advise clients alone, unsupervised, before they've passed any exam. Is this compliant?", options: ["No. A not-yet-competent rep must work under supervision", "Yes, the FSP is licensed", "Yes, if the client agrees", "Yes, for the first year"], correct: 0, feedback: { correct: "Right. Until competent, they must be supervised.", incorrect: "No. A not-yet-competent rep must be supervised, not left to advise alone." } } },
    ],
  },
];

const l6DebarmentSlots: QuestionSlot[] = [
  {
    slotId: "re5/l3-debarment/what",
    conceptId: "fais-debarment",
    variants: [
      { variantId: "re5-deb-wh-mcq", step: { type: "mcq", question: "What is 'debarment'?", options: ["Removal of a person's ability to render financial services", "A fine paid to the client", "A tax on advisers", "A type of licence"], correct: 0, feedback: { correct: "Right. It bars the person from rendering financial services.", incorrect: "Debarment removes the ability to render financial services." } } },
      { variantId: "re5-deb-wh-tf", step: { type: "true-false", statement: "An FSP must debar a representative who no longer meets fit & proper (e.g. loses honesty/integrity).", correct: true, feedback: { correct: "Right. Loss of fit & proper or serious contravention triggers debarment.", incorrect: "It's true. Failing fit & proper or seriously contravening the Act requires debarment." } } },
      { variantId: "re5-deb-wh-mcq2", step: { type: "mcq", question: "A debarred person, while debarred:", options: ["Cannot be appointed as a representative by any FSP", "Can work for any other FSP freely", "Keeps their licence", "Only loses one product category"], correct: 0, feedback: { correct: "Right. No FSP may appoint them while the debarment stands.", incorrect: "While debarred, no FSP may appoint them. That's the point of publishing it." } } },
    ],
  },
  {
    slotId: "re5/l3-debarment/fair-process",
    conceptId: "fais-debarment",
    variants: [
      { variantId: "re5-deb-fp-sc", step: { type: "scenario", question: "An FSP wants to debar a rep quietly, by removing them from the register without telling them. Allowed?", options: ["No. Debarment needs notice, reasons and a chance to respond", "Yes, the FSP owns its register", "Yes, if the FSCA is told after", "Yes, if the rep resigned"], correct: 0, feedback: { correct: "Right. A fair process is mandatory before debarment takes effect.", incorrect: "No. Notice, reasons and a chance to respond are required, no secret debarment." } } },
      { variantId: "re5-deb-fp-tf", step: { type: "true-false", statement: "Debarment must be procedurally fair. The representative gets notice, reasons and an opportunity to be heard.", correct: true, feedback: { correct: "Right. Then the FSP notifies the FSCA and updates the register.", incorrect: "It's true. A fair process (notice, reasons, response) is required." } } },
      { variantId: "re5-deb-fp-mcq", step: { type: "mcq", question: "After debarring a representative, the FSP must:", options: ["Notify the FSCA and update its register", "Keep it secret", "Refund the client", "Do nothing further"], correct: 0, feedback: { correct: "Right. Notification to the FSCA and a register update follow.", incorrect: "The FSP must notify the FSCA and update the register." } } },
    ],
  },
  {
    slotId: "re5/l3-debarment/published",
    conceptId: "fais-debarment",
    variants: [
      { variantId: "re5-deb-pb-tf", step: { type: "true-false", statement: "A person debarred by one FSP can immediately be appointed by another FSP.", correct: false, feedback: { correct: "Correct. While debarred, no FSP may appoint them, which is why debarments are published.", incorrect: "False. A debarred person can't be appointed by any FSP while the debarment stands." } } },
      { variantId: "re5-deb-pb-mcq", step: { type: "mcq", question: "Why does the FSCA publish a record of debarments?", options: ["So other FSPs can check before appointing someone", "To embarrass advisers", "To set commission rates", "To collect tax"], correct: 0, feedback: { correct: "Right. It lets FSPs screen out debarred people before hiring.", incorrect: "Publication lets FSPs check the register before appointing someone." } } },
      { variantId: "re5-deb-pb-sc", step: { type: "scenario", question: "An FSP is about to hire an adviser. A prudent first step is to:", options: ["Check the FSCA's published debarment record", "Skip all checks", "Ask only for references", "Assume they're fine"], correct: 0, feedback: { correct: "Right. Checking the published record avoids appointing a debarred person.", incorrect: "Check the FSCA's debarment record first. That's what it's published for." } } },
    ],
  },
  {
    slotId: "re5/l3-debarment/reconsideration",
    conceptId: "fais-debarment",
    variants: [
      { variantId: "re5-deb-rc-mcq", step: { type: "mcq", question: "A debarred representative who believes the process was unfair may:", options: ["Seek reconsideration/appeal of the debarment", "Do nothing. It's final", "Appoint themselves at another FSP", "Sue the client"], correct: 0, feedback: { correct: "Right. They must be told of their right to reconsideration/appeal.", incorrect: "They can pursue reconsideration or appeal. That right must be communicated." } } },
      { variantId: "re5-deb-rc-tf", step: { type: "true-false", statement: "Part of a fair debarment is informing the person of their right to have it reconsidered.", correct: true, feedback: { correct: "Right. Notice of the reconsideration/appeal right is part of the process.", incorrect: "It's true. The person must be told of their reconsideration/appeal right." } } },
      { variantId: "re5-deb-rc-sc", step: { type: "scenario", question: "After debarring someone, the FSP refuses to explain why or allow any challenge. What's wrong?", options: ["A fair process requires reasons and a right to reconsideration/appeal", "Nothing. Silence is fine", "The FSP must pay a fine", "The client decides"], correct: 0, feedback: { correct: "Right. Reasons and a route to challenge are essential to fairness.", incorrect: "Fairness requires reasons and a reconsideration/appeal right, silence isn't acceptable." } } },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// UNIT 4
// ═══════════════════════════════════════════════════════════════════════════

const l7PillarsSlots: QuestionSlot[] = [
  {
    slotId: "re5/l4-pillars/the-pillars",
    conceptId: "fit-and-proper",
    variants: [
      { variantId: "re5-pil-tp-mcq", step: { type: "mcq", question: "Which is NOT a fit & proper pillar?", options: ["Guaranteed investment returns for clients", "Honesty, integrity and good standing", "Competence", "Operational ability"], correct: 0, feedback: { correct: "Right. There's no 'guaranteed returns' pillar: FAIS regulates conduct.", incorrect: "The pillars are honesty/integrity, competence, CPD, operational ability, financial soundness, not guaranteed returns." } } },
      { variantId: "re5-pil-tp-tf", step: { type: "true-false", statement: "Financial soundness (where applicable) is one of the fit & proper pillars.", correct: true, feedback: { correct: "Right. Financial soundness is a pillar, alongside honesty, competence, CPD and operational ability.", incorrect: "It's true. Financial soundness is one of the pillars." } } },
      { variantId: "re5-pil-tp-mcq2", step: { type: "mcq", question: "The fit & proper requirements must be met:", options: ["Continuously, not just at appointment", "Only on the first day", "Only when the FSCA visits", "Never after passing RE5"], correct: 0, feedback: { correct: "Right. They're ongoing standards.", incorrect: "They apply continuously, not just at appointment." } } },
    ],
  },
  {
    slotId: "re5/l4-pillars/honesty",
    conceptId: "fit-and-proper",
    variants: [
      { variantId: "re5-pil-ho-mcq", step: { type: "mcq", question: "Which could cause someone to FAIL the honesty & integrity test?", options: ["A conviction for an offence involving dishonesty", "Passing the RE5", "Completing CPD", "Having many clients"], correct: 0, feedback: { correct: "Right. Dishonesty offences, prior debarment, or lying on an application can all fail this test.", incorrect: "A dishonesty conviction (among others) fails honesty & integrity. The others are positives." } } },
      { variantId: "re5-pil-ho-tf", step: { type: "true-false", statement: "A representative who becomes dishonest after appointment still meets fit & proper as long as they were honest at the start.", correct: false, feedback: { correct: "Correct. The standard is ongoing. Becoming dishonest fails it and must be dealt with.", incorrect: "False. Honesty & integrity is continuous; becoming dishonest fails the test." } } },
      { variantId: "re5-pil-ho-sc", step: { type: "scenario", question: "A rep is found to have lied on their FSP application. Which pillar is implicated?", options: ["Honesty, integrity and good standing", "Operational ability", "Financial soundness", "Guaranteed returns"], correct: 0, feedback: { correct: "Right. Dishonesty in the application goes to honesty & integrity.", incorrect: "Lying on the application fails honesty & integrity and good standing." } } },
    ],
  },
  {
    slotId: "re5/l4-pillars/competence-pillar",
    conceptId: "fit-and-proper",
    variants: [
      { variantId: "re5-pil-cp-mcq", step: { type: "mcq", question: "The 'competence' pillar covers:", options: ["Qualifications, regulatory exams, experience and training", "Only how many clients you have", "Your commission target", "Your office size"], correct: 0, feedback: { correct: "Right. Competence = qualifications, RE, experience, class-of-business/product training.", incorrect: "Competence covers qualifications, exams, experience and training, not client counts." } } },
      { variantId: "re5-pil-cp-tf", step: { type: "true-false", statement: "CPD is a fit & proper requirement that keeps competence current.", correct: true, feedback: { correct: "Right. CPD is its own pillar, maintaining ongoing competence.", incorrect: "It's true. CPD is a fit & proper requirement." } } },
      { variantId: "re5-pil-cp-mcq2", step: { type: "mcq", question: "'Operational ability' as a pillar refers to:", options: ["Having the resources, systems and governance to render services properly", "Guaranteeing returns", "Charging low fees", "Being the largest FSP"], correct: 0, feedback: { correct: "Right. It's about the capacity/systems to operate compliantly.", incorrect: "Operational ability is about resources and systems to render services properly." } } },
    ],
  },
  {
    slotId: "re5/l4-pillars/consequences",
    conceptId: "fit-and-proper",
    variants: [
      { variantId: "re5-pil-cq-mcq", step: { type: "mcq", question: "Failing a fit & proper requirement can trigger:", options: ["Debarment or licence action", "A bonus", "A guaranteed client", "Nothing"], correct: 0, feedback: { correct: "Right. It has real consequences, debarment or licence action.", incorrect: "Failing fit & proper can lead to debarment or licence action." } } },
      { variantId: "re5-pil-cq-tf", step: { type: "true-false", statement: "Fit & proper failings by a representative can lead to debarment.", correct: true, feedback: { correct: "Right. A rep who fails the standards can be debarred.", incorrect: "It's true. Debarment can follow a fit & proper failing." } } },
      { variantId: "re5-pil-cq-sc", step: { type: "scenario", question: "An FSP loses its operational ability and financial soundness. What's at risk?", options: ["Its licence. The FSCA can take action", "Only its logo", "Its clients' tax", "Nothing"], correct: 0, feedback: { correct: "Right. An FSP failing the pillars faces licence action.", incorrect: "Its licence is at risk. The FSCA can act when an FSP fails fit & proper." } } },
    ],
  },
];

const l8CompetenceSlots: QuestionSlot[] = [
  {
    slotId: "re5/l4-competence/qualifications",
    conceptId: "fais-competence-cpd",
    variants: [
      { variantId: "re5-com-ql-mcq", step: { type: "mcq", question: "A recognised qualification must generally be completed within how long of DOFA?", options: ["Six years", "Six weeks", "Six months", "Twenty years"], correct: 0, feedback: { correct: "Right. Generally within six years of the Date of First Appointment.", incorrect: "It's generally six years from DOFA for the qualification." } } },
      { variantId: "re5-com-ql-tf", step: { type: "true-false", statement: "Competence timelines are measured from the Date of First Appointment (DOFA).", correct: true, feedback: { correct: "Right. DOFA starts the clock for qualification and the regulatory exam.", incorrect: "It's true. DOFA is the reference point for competency timelines." } } },
      { variantId: "re5-com-ql-mcq2", step: { type: "mcq", question: "Before rendering advice on a product, a representative must also complete:", options: ["Class-of-business and product-specific training", "A marketing course", "A tax return", "An estate plan"], correct: 0, feedback: { correct: "Right. Class-of-business and product-specific training are required first.", incorrect: "Class-of-business and product-specific training must be done before advising on that product." } } },
    ],
  },
  {
    slotId: "re5/l4-competence/cpd-cycle",
    conceptId: "fais-competence-cpd",
    variants: [
      { variantId: "re5-com-cy-mcq", step: { type: "mcq", question: "The CPD cycle for representatives runs from:", options: ["1 June to 31 May", "1 January to 31 December", "1 March to 28/29 February", "1 July to 30 June"], correct: 0, feedback: { correct: "Right. 1 June to 31 May.", incorrect: "The CPD cycle runs 1 June to 31 May." } } },
      { variantId: "re5-com-cy-fill", step: { type: "fill-blank", title: "CPD hours", prompt: "A representative authorised for a single, low-complexity subclass typically must complete ___ CPD hours per cycle.", correct: 6, feedback: { correct: "Correct, 6 hours for the simplest case (rising with complexity, up to 18).", incorrect: "It's 6 hours for a single low-complexity subclass; more classes/complexity increases it." } } },
      { variantId: "re5-com-cy-tf", step: { type: "true-false", statement: "The number of CPD hours depends on how many classes of business and their complexity a person is authorised for.", correct: true, feedback: { correct: "Right. Commonly 6, 12 or up to 18 hours per cycle.", incorrect: "It's true: hours scale with the number and complexity of authorised classes." } } },
    ],
  },
  {
    slotId: "re5/l4-competence/product-not-cpd",
    conceptId: "fais-competence-cpd",
    variants: [
      { variantId: "re5-com-pc-sc", step: { type: "scenario", question: "A rep argues the insurer's product-specific training should count toward their CPD hours. Correct?", options: ["No. Product-specific training is separate and doesn't count as CPD", "Yes. All training counts", "Yes, but only half", "Only if the insurer is an FSP"], correct: 0, feedback: { correct: "Right. Product and class-of-business training are distinct from CPD.", incorrect: "No. Product-specific training is its own requirement; it doesn't count as CPD." } } },
      { variantId: "re5-com-pc-tf", step: { type: "true-false", statement: "CPD activities must be verifiable and relevant to the person's role.", correct: true, feedback: { correct: "Right. CPD must be genuine, verifiable professional development.", incorrect: "It's true. CPD must be verifiable and relevant." } } },
      { variantId: "re5-com-pc-mcq", step: { type: "mcq", question: "Which does NOT count toward CPD hours?", options: ["Product-specific training", "A verifiable relevant industry seminar", "A recognised professional course", "Structured, relevant CPD activity"], correct: 0, feedback: { correct: "Right. Product-specific training is a separate competency requirement.", incorrect: "Product-specific training doesn't count as CPD. The others can." } } },
    ],
  },
  {
    slotId: "re5/l4-competence/supervision",
    conceptId: "fais-competence-cpd",
    variants: [
      { variantId: "re5-com-sv-mcq", step: { type: "mcq", question: "Until a new representative meets the competency requirements, they must:", options: ["Work under supervision", "Stop all work entirely", "Advise only wealthy clients", "Get a client waiver"], correct: 0, feedback: { correct: "Right. Supervision bridges the gap until requirements are met.", incorrect: "They work under supervision until competent, not a full stop, nor a waiver." } } },
      { variantId: "re5-com-sv-tf", step: { type: "true-false", statement: "Passing the RE5 is part of the competence requirement, within the required period from DOFA.", correct: true, feedback: { correct: "Right. The regulatory exam is a competence component, on a DOFA timeline.", incorrect: "It's true. The RE is required within the period measured from DOFA." } } },
      { variantId: "re5-com-sv-sc", step: { type: "scenario", question: "A rep passed RE5 but hasn't done product-specific training for a new product. Can they advise on it?", options: ["No. Product-specific training is required before advising on that product", "Yes, RE5 covers everything", "Yes, under a waiver", "Yes, if the FSP is licensed"], correct: 0, feedback: { correct: "Right. RE5 alone isn't enough; product training is a separate requirement.", incorrect: "No. Product-specific training is needed before advising on that product, RE5 notwithstanding." } } },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// UNIT 5
// ═══════════════════════════════════════════════════════════════════════════

const l9GeneralDutySlots: QuestionSlot[] = [
  {
    slotId: "re5/l5-general-duty/standard",
    conceptId: "code-general-duty",
    variants: [
      { variantId: "re5-gd-st-mcq", step: { type: "mcq", question: "The General Code's overarching standard is to render services:", options: ["Honestly, fairly", "As profitably as possible", "Favouring the product supplier", "With minimal disclosure"], correct: 0, feedback: { correct: "Right. That's the lens for every specific Code rule.", incorrect: "The standard is honest, fair, skilled, careful, diligent service in clients' interests." } } },
      { variantId: "re5-gd-st-tf", step: { type: "true-false", statement: "The General Code requires providers to act in the interests of clients and the integrity of the industry.", correct: true, feedback: { correct: "Right. Client interests and industry integrity are central.", incorrect: "It's true, client interests and industry integrity underpin the Code." } } },
      { variantId: "re5-gd-st-mcq2", step: { type: "mcq", question: "Disclosure, suitability, record-keeping and conflict management all exist to serve:", options: ["The general duty to clients", "The FSP's commission", "The product supplier", "The FSCA's budget"], correct: 0, feedback: { correct: "Right. They're all expressions of the general duty to clients.", incorrect: "They serve the general duty to clients. That's the point of the Code." } } },
    ],
  },
  {
    slotId: "re5/l5-general-duty/clear",
    conceptId: "code-general-duty",
    variants: [
      { variantId: "re5-gd-cl-mcq", step: { type: "mcq", question: "Information to a client must be all of the following EXCEPT:", options: ["Framed to always show the product most favourably", "Factually correct", "Clear and not misleading", "Provided timeously"], correct: 0, feedback: { correct: "Right. It must be balanced. Spinning it favourably would be misleading.", incorrect: "Disclosure must be correct, clear, not misleading and timely. Never spun to only flatter the product." } } },
      { variantId: "re5-gd-cl-tf", step: { type: "true-false", statement: "Disclosure may omit material risks as long as the benefits are explained.", correct: false, feedback: { correct: "Correct. A balanced view including material risks is required.", incorrect: "False. Material risks must be disclosed. Omitting them is misleading." } } },
      { variantId: "re5-gd-cl-sc", step: { type: "scenario", question: "A provider explains only a product's upside and skips the risks. Which duty is breached?", options: ["Clear, balanced, not-misleading disclosure", "Record-keeping", "Financial soundness", "The 15-day rule"], correct: 0, feedback: { correct: "Right. One-sided disclosure is misleading, a breach of the Code.", incorrect: "It breaches the duty to give clear, balanced, non-misleading information." } } },
    ],
  },
  {
    slotId: "re5/l5-general-duty/timely",
    conceptId: "code-general-duty",
    variants: [
      { variantId: "re5-gd-ti-tf", step: { type: "true-false", statement: "Information must be provided timeously so the client can make an informed decision.", correct: true, feedback: { correct: "Right. Timing matters: disclosure after the decision defeats the purpose.", incorrect: "It's true. Disclosure must be timely enough to inform the decision." } } },
      { variantId: "re5-gd-ti-mcq", step: { type: "mcq", question: "Where a key disclosure is made orally, the Code requires:", options: ["Written confirmation within a reasonable time", "No follow-up at all", "A recording kept for 30 years", "The client to sign a waiver"], correct: 0, feedback: { correct: "Right. Oral disclosures of key facts must be confirmed in writing within a reasonable time.", incorrect: "Oral key disclosures must be confirmed in writing within a reasonable time." } } },
      { variantId: "re5-gd-ti-sc", step: { type: "scenario", question: "A client is pressured to sign immediately, with no time to consider disclosures. Which principle is offended?", options: ["Clients must not be pressured; disclosure must allow an informed decision", "Record retention", "Financial soundness", "Debarment"], correct: 0, feedback: { correct: "Right. The Code forbids pressure and requires time to decide.", incorrect: "Pressuring a client and denying time to consider breaches the disclosure/fair-dealing duty." } } },
    ],
  },
  {
    slotId: "re5/l5-general-duty/balanced",
    conceptId: "code-general-duty",
    variants: [
      { variantId: "re5-gd-ba-mcq", step: { type: "mcq", question: "A balanced disclosure means it:", options: ["Includes material risks, not only benefits", "Only lists benefits", "Hides the fees", "Guarantees performance"], correct: 0, feedback: { correct: "Right. Material risks must be presented alongside benefits.", incorrect: "Balanced means including material risks, not just the upside." } } },
      { variantId: "re5-gd-ba-tf", step: { type: "true-false", statement: "Rendering services 'with due skill, care and diligence' is part of the general duty.", correct: true, feedback: { correct: "Right. Skill, care and diligence are explicit in the standard.", incorrect: "It's true. Due skill, care and diligence are core to the duty." } } },
      { variantId: "re5-gd-ba-mcq2", step: { type: "mcq", question: "Which behaviour complies with the General Code?", options: ["Giving correct, clear, timely and balanced information", "Overstating benefits", "Concealing risks", "Pressuring the client"], correct: 0, feedback: { correct: "Right. Correct, clear, timely, balanced. That's the standard.", incorrect: "Only correct, clear, timely and balanced disclosure complies; the others breach the Code." } } },
    ],
  },
];

const l10DisclosuresSlots: QuestionSlot[] = [
  {
    slotId: "re5/l5-disclosures/three-buckets",
    conceptId: "code-disclosures",
    variants: [
      { variantId: "re5-dis-tb-mcq", step: { type: "mcq", question: "The Code requires disclosure about three things. Which set is correct?", options: ["The provider, the product supplier, and the product", "The client, the regulator, and SARS", "Only the product", "The competitor, the bank, and the Ombud"], correct: 0, feedback: { correct: "Right. Provider, product supplier, and product are the three buckets.", incorrect: "It's the provider, the product supplier, and the product." } } },
      { variantId: "re5-dis-tb-tf", step: { type: "true-false", statement: "Provider disclosure includes the licence category and whether the person acts under supervision.", correct: true, feedback: { correct: "Right. Provider disclosure covers identity, contact, licence, supervision, PI and complaints contacts.", incorrect: "It's true. Provider disclosure includes licence category and supervision status." } } },
      { variantId: "re5-dis-tb-mcq2", step: { type: "mcq", question: "Product disclosure must cover:", options: ["Nature, material terms, fees, charges, penalties and material risks", "Only the product name", "Only the benefits", "Nothing in writing"], correct: 0, feedback: { correct: "Right. Full material terms, costs and risks, plus the provider's remuneration.", incorrect: "Product disclosure covers terms, fees, penalties and material risks (and the provider's remuneration)." } } },
    ],
  },
  {
    slotId: "re5/l5-disclosures/remuneration",
    conceptId: "code-disclosures",
    variants: [
      { variantId: "re5-dis-rm-sc", step: { type: "scenario", question: "A rep recommends a policy but hides the 3% commission, saying 'the client only cares about the product'. What's breached?", options: ["The duty to disclose remuneration and manage the conflict", "Nothing. Commission is private", "Record-keeping", "Financial soundness"], correct: 0, feedback: { correct: "Right. Commission must be disclosed; hiding it is also a conflict issue.", incorrect: "Concealing commission breaches disclosure and conflict-of-interest duties." } } },
      { variantId: "re5-dis-rm-tf", step: { type: "true-false", statement: "Clients must be told what the provider earns (commission/fees) and the basis for it.", correct: true, feedback: { correct: "Right. Remuneration and its basis must be disclosed.", incorrect: "It's true. Remuneration and its basis must be disclosed to the client." } } },
      { variantId: "re5-dis-rm-mcq", step: { type: "mcq", question: "A fee negotiated with the client must be:", options: ["Agreed in writing, and the client able to stop it", "Kept secret", "Fixed by the FSCA", "Paid before advice"], correct: 0, feedback: { correct: "Right. Negotiated fees are agreed in writing and stoppable by the client.", incorrect: "A negotiated fee must be agreed in writing, and the client must be able to stop it." } } },
    ],
  },
  {
    slotId: "re5/l5-disclosures/oral-written",
    conceptId: "code-disclosures",
    variants: [
      { variantId: "re5-dis-ow-tf", step: { type: "true-false", statement: "If a required disclosure is made orally, it must be confirmed to the client in writing within a reasonable time.", correct: true, feedback: { correct: "Right. Oral key disclosures need written confirmation.", incorrect: "It's true. Oral disclosures must be confirmed in writing within a reasonable time." } } },
      { variantId: "re5-dis-ow-mcq", step: { type: "mcq", question: "Product-supplier disclosure includes:", options: ["The supplier's name, contact and the nature of the relationship/restrictions", "Only the supplier's logo", "The client's tax number", "The Ombud's budget"], correct: 0, feedback: { correct: "Right. Identity, contact, relationship and any conditions/restrictions.", incorrect: "It covers the supplier's identity, contact, relationship and any restrictions." } } },
      { variantId: "re5-dis-ow-sc", step: { type: "scenario", question: "A provider gives all disclosures verbally on a call and never follows up in writing. Compliant?", options: ["No. Key oral disclosures must be confirmed in writing", "Yes, verbal is enough", "Yes, if the client remembers", "Yes, after a year"], correct: 0, feedback: { correct: "Right. Written confirmation of key oral disclosures is required.", incorrect: "No. Key oral disclosures must be confirmed in writing within a reasonable time." } } },
    ],
  },
  {
    slotId: "re5/l5-disclosures/conceal-breach",
    conceptId: "code-disclosures",
    variants: [
      { variantId: "re5-dis-cb-mcq", step: { type: "mcq", question: "Concealing or misrepresenting remuneration is:", options: ["A serious breach of the Code", "Standard practice", "Required by FICA", "Allowed under Category II"], correct: 0, feedback: { correct: "Right. It's a serious breach.", incorrect: "Concealing remuneration is a serious breach of the Code." } } },
      { variantId: "re5-dis-cb-tf", step: { type: "true-false", statement: "Disclosure of the provider's identity and contact details is optional.", correct: false, feedback: { correct: "Correct. Provider details are a required disclosure, not optional.", incorrect: "False. The provider's identity and contact details must be disclosed." } } },
      { variantId: "re5-dis-cb-sc", step: { type: "scenario", question: "A client asks how the adviser is paid. The adviser must:", options: ["Disclose the commission/fees and the basis for them", "Refuse to say", "Change the subject", "Only answer in writing after the sale"], correct: 0, feedback: { correct: "Right. Remuneration must be disclosed, on request or otherwise.", incorrect: "The adviser must disclose remuneration and its basis, it isn't confidential." } } },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// UNIT 6
// ═══════════════════════════════════════════════════════════════════════════

const l11SuitabilitySlots: QuestionSlot[] = [
  {
    slotId: "re5/l6-suitability/needs-analysis",
    conceptId: "code-suitability",
    variants: [
      { variantId: "re5-sui-na-mcq", step: { type: "mcq", question: "Before giving advice, a provider must:", options: ["Do a needs analysis and suitability analysis of the client's situation", "Guarantee returns", "Pick the highest-commission product", "Skip straight to the sale"], correct: 0, feedback: { correct: "Right. Gather the client's situation, needs, objectives and risk profile first.", incorrect: "A needs and suitability analysis comes first. Advice must fit the client." } } },
      { variantId: "re5-sui-na-tf", step: { type: "true-false", statement: "If a client refuses to provide information, the provider should record that and warn of the resulting limitations.", correct: true, feedback: { correct: "Right. Record the refusal and warn of the risks of incomplete analysis.", incorrect: "It's true. Record the refusal and warn the client of the limitations." } } },
      { variantId: "re5-sui-na-mcq2", step: { type: "mcq", question: "The suitability analysis exists to ensure the advice is:", options: ["Appropriate to the client's circumstances", "The most profitable for the FSP", "The cheapest available", "The newest product"], correct: 0, feedback: { correct: "Right. Suitability is about fit to the client's circumstances.", incorrect: "It ensures the advice suits the client's circumstances, not the FSP's profit." } } },
    ],
  },
  {
    slotId: "re5/l6-suitability/record-of-advice",
    conceptId: "code-suitability",
    variants: [
      { variantId: "re5-sui-ra-mcq", step: { type: "mcq", question: "A record of advice must reflect:", options: ["The client's needs, the options considered, and why the recommendation suits them", "Only the product name", "The adviser's commission target", "Nothing specific"], correct: 0, feedback: { correct: "Right. Needs, options considered, and the basis for the recommendation.", incorrect: "It records needs/objectives, options considered, and why the product suits the client." } } },
      { variantId: "re5-sui-ra-tf", step: { type: "true-false", statement: "The record of advice must be given to the client and retained by the provider.", correct: true, feedback: { correct: "Right. The client gets a copy and the provider keeps one.", incorrect: "It's true, provide it to the client and retain it." } } },
      { variantId: "re5-sui-ra-sc", step: { type: "scenario", question: "An adviser recommends a fund but keeps no record of why it suits the client. What's the problem?", options: ["The Code requires a record of advice showing the basis for the recommendation", "Nothing. Records are optional", "Only the client must keep records", "It's fine if the client is happy"], correct: 0, feedback: { correct: "Right. A record of advice is mandatory.", incorrect: "A record of advice, showing why the product suits the client, is required." } } },
    ],
  },
  {
    slotId: "re5/l6-suitability/against-advice",
    conceptId: "code-suitability",
    variants: [
      { variantId: "re5-sui-aa-sc", step: { type: "scenario", question: "After warnings, a conservative client insists on a high-risk product. The provider must:", options: ["Proceed only if it records the instruction and the warnings given", "Falsify the risk profile to fit", "Refuse: the Code bans it", "Proceed silently"], correct: 0, feedback: { correct: "Right. Record the mismatch, the warning and the client's instruction.", incorrect: "Record the instruction and warnings. Never falsify the profile, and it's not outright banned." } } },
      { variantId: "re5-sui-aa-tf", step: { type: "true-false", statement: "A provider may change a client's stated risk profile so a product 'appears suitable'.", correct: false, feedback: { correct: "Correct. Never falsify the risk profile. Record the client's instruction against advice instead.", incorrect: "False. Falsifying the risk profile is prohibited." } } },
      { variantId: "re5-sui-aa-mcq", step: { type: "mcq", question: "When a client acts against advice, the key protection for everyone is to:", options: ["Document the instruction and that risks were disclosed", "Delete the file", "Say nothing", "Cancel the client"], correct: 0, feedback: { correct: "Right. A clear record of the warned-against instruction protects client and adviser.", incorrect: "Document the instruction and the disclosed risks. That's the safeguard." } } },
    ],
  },
  {
    slotId: "re5/l6-suitability/limited-scope",
    conceptId: "code-suitability",
    variants: [
      { variantId: "re5-sui-ls-tf", step: { type: "true-false", statement: "With limited-scope advice, the provider need not tell the client about the limitations.", correct: false, feedback: { correct: "Correct. The client must be informed of the limitations and resulting risks.", incorrect: "False. Limited-scope advice must be flagged with its limitations and risks." } } },
      { variantId: "re5-sui-ls-mcq", step: { type: "mcq", question: "Limited-scope advice requires the provider to:", options: ["Warn the client of the limitations and risks that may result", "Guarantee it's complete", "Skip the record of advice", "Charge extra"], correct: 0, feedback: { correct: "Right. Disclose the narrower basis and its risks.", incorrect: "The client must be warned of the limitations and risks of the narrower advice." } } },
      { variantId: "re5-sui-ls-sc", step: { type: "scenario", question: "A provider advises only on one product line at the client's request. What must they make clear?", options: ["That the advice is limited in scope", "That it's a full financial plan", "Nothing", "That returns are guaranteed"], correct: 0, feedback: { correct: "Right. Flag the limited scope and its risks.", incorrect: "They must disclose the limited scope and the risks it creates." } } },
    ],
  },
];

const l12RecordsSlots: QuestionSlot[] = [
  {
    slotId: "re5/l6-records/five-years",
    conceptId: "code-records-coi",
    variants: [
      { variantId: "re5-rec-fy-fill", step: { type: "fill-blank", title: "Retention period", prompt: "The General Code requires records (including advice and complaints) to be kept for a minimum of ___ years.", correct: 5, feedback: { correct: "Correct. Five years.", incorrect: "The minimum retention period is five years." } } },
      { variantId: "re5-rec-fy-mcq", step: { type: "mcq", question: "An FSP must retain records of advice and complaints for at least:", options: ["5 years", "1 year", "3 years", "10 years"], correct: 0, feedback: { correct: "Right. Five years.", incorrect: "It's five years under the Code." } } },
      { variantId: "re5-rec-fy-tf", step: { type: "true-false", statement: "Records may be destroyed before the retention period ends if the client agrees.", correct: false, feedback: { correct: "Correct. They must not be destroyed before the period ends.", incorrect: "False. Records must be kept for the full period, no early destruction." } } },
    ],
  },
  {
    slotId: "re5/l6-records/coi-policy",
    conceptId: "code-records-coi",
    variants: [
      { variantId: "re5-rec-co-mcq", step: { type: "mcq", question: "A conflict-of-interest management policy must, at minimum, address how the FSP will:", options: ["Identify, avoid or mitigate, and disclose conflicts", "Maximise commission", "Hide conflicts from clients", "Pay for sales volume"], correct: 0, feedback: { correct: "Right. Identify, avoid/mitigate, and disclose. That's the COI policy's job.", incorrect: "A COI policy identifies, avoids/mitigates and discloses conflicts." } } },
      { variantId: "re5-rec-co-tf", step: { type: "true-false", statement: "Every FSP must adopt and maintain a Conflict of Interest management policy.", correct: true, feedback: { correct: "Right. It's mandatory.", incorrect: "It's true. A COI management policy is required of every FSP." } } },
      { variantId: "re5-rec-co-mcq2", step: { type: "mcq", question: "A conflict of interest arises when:", options: ["The provider's interests could influence advice against the client's interests", "The client changes their mind", "The FSP hires staff", "A product performs well"], correct: 0, feedback: { correct: "Right. Commissions, ownership interests and incentives can all create conflicts.", incorrect: "It's when the provider's interests could sway advice away from the client's interests." } } },
    ],
  },
  {
    slotId: "re5/l6-records/volume-quality",
    conceptId: "code-records-coi",
    variants: [
      { variantId: "re5-rec-vq-mcq", step: { type: "mcq", question: "Which arrangement is expressly restricted by the conflict-of-interest rules?", options: ["Paying a representative for volume of business over quality", "Keeping a written COI policy", "Disclosing commission", "Doing a needs analysis"], correct: 0, feedback: { correct: "Right. Rewarding quantity over quality (or steering to a supplier) via a financial interest is restricted.", incorrect: "The restricted arrangement is a financial interest rewarding volume over quality." } } },
      { variantId: "re5-rec-vq-tf", step: { type: "true-false", statement: "An FSP may offer a financial interest that rewards a rep for giving preference to a particular product supplier.", correct: false, feedback: { correct: "Correct. That's exactly what the COI rules restrict.", incorrect: "False. Rewarding preference for a supplier via a financial interest is restricted." } } },
      { variantId: "re5-rec-vq-sc", step: { type: "scenario", question: "A dealer group pays advisers a bonus purely for selling the most of one insurer's product. Concern?", options: ["It rewards volume/supplier-preference, a restricted conflict arrangement", "It's fine, more sales is good", "It's required by the Code", "It's a FICA matter"], correct: 0, feedback: { correct: "Right. Volume/supplier-preference incentives are restricted under COI rules.", incorrect: "It's a restricted conflict arrangement: rewarding volume/supplier preference." } } },
    ],
  },
  {
    slotId: "re5/l6-records/advertising",
    conceptId: "code-records-coi",
    variants: [
      { variantId: "re5-rec-ad-mcq", step: { type: "mcq", question: "Under the Code, advertisements must:", options: ["Not be misleading and not create unrealistic expectations", "Only show benefits", "Guarantee returns", "Hide the provider's identity"], correct: 0, feedback: { correct: "Right. Adverts must be fair, not misleading, with required cautionary information.", incorrect: "Adverts must not mislead or create unrealistic expectations." } } },
      { variantId: "re5-rec-ad-tf", step: { type: "true-false", statement: "In direct marketing, the provider must disclose their identity and purpose at the start of the contact.", correct: true, feedback: { correct: "Right. Identity, purpose and the client's rights come up front.", incorrect: "It's true. Identity and purpose must be disclosed at the start." } } },
      { variantId: "re5-rec-ad-sc", step: { type: "scenario", question: "An advert promises 'guaranteed 30% returns, no risk'. Problem?", options: ["It's misleading and creates unrealistic expectations, prohibited", "It's fine if it gets clients", "It's required disclosure", "It's a FICA report"], correct: 0, feedback: { correct: "Right. Misleading, expectation-inflating adverts breach the Code.", incorrect: "It's misleading and creates unrealistic expectations, prohibited." } } },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// UNIT 7
// ═══════════════════════════════════════════════════════════════════════════

const l13TcfSlots: QuestionSlot[] = [
  {
    slotId: "re5/l7-tcf/outcomes",
    conceptId: "tcf-complaints",
    variants: [
      { variantId: "re5-tcf-oc-mcq", step: { type: "mcq", question: "Treating Customers Fairly (TCF) is best described as:", options: ["An outcomes-based approach with six defined outcomes", "A single tax rule", "A commission scheme", "A product guarantee"], correct: 0, feedback: { correct: "Right. TCF sets six fairness outcomes.", incorrect: "TCF is an outcomes-based framework with six outcomes." } } },
      { variantId: "re5-tcf-oc-tf", step: { type: "true-false", statement: "One TCF outcome is that products and services are designed to meet the needs of identified customer groups.", correct: true, feedback: { correct: "Right. Suitable product design is a TCF outcome.", incorrect: "It's true. Product design meeting identified customers' needs is a TCF outcome." } } },
      { variantId: "re5-tcf-oc-mcq2", step: { type: "mcq", question: "Which is a TCF outcome?", options: ["Customers are given clear information and kept informed", "Advisers earn maximum commission", "Products always beat the market", "Complaints are ignored"], correct: 0, feedback: { correct: "Right. Clear information/keeping customers informed is an outcome.", incorrect: "Clear information and keeping customers informed is the TCF outcome." } } },
    ],
  },
  {
    slotId: "re5/l7-tcf/outcome-6",
    conceptId: "tcf-complaints",
    variants: [
      { variantId: "re5-tcf-o6-tf", step: { type: "true-false", statement: "TCF Outcome 6 means customers face no unreasonable barriers to switch, claim or complain.", correct: true, feedback: { correct: "Right. Outcome 6 targets unreasonable post-sale barriers.", incorrect: "It's true. Outcome 6 is about removing unreasonable post-sale barriers." } } },
      { variantId: "re5-tcf-o6-mcq", step: { type: "mcq", question: "A firm makes it deliberately hard to cancel a policy or lodge a claim. Which TCF outcome does this offend?", options: ["Outcome 6", "Outcome 1 only", "None", "A FICA rule"], correct: 0, feedback: { correct: "Right. Post-sale obstruction offends Outcome 6.", incorrect: "It offends Outcome 6, no unreasonable barriers to switch, claim or complain." } } },
      { variantId: "re5-tcf-o6-sc", step: { type: "scenario", question: "Customers can buy a product online in minutes but must post a notarised letter to cancel. TCF concern?", options: ["Yes. An unreasonable post-sale barrier", "No, cancellation should be hard", "No, it's a FICA issue", "No concern at all"], correct: 0, feedback: { correct: "Right. Asymmetric friction to exit is an Outcome 6 problem.", incorrect: "It's an Outcome 6 concern, an unreasonable barrier to cancelling." } } },
    ],
  },
  {
    slotId: "re5/l7-tcf/internal-complaints",
    conceptId: "tcf-complaints",
    variants: [
      { variantId: "re5-tcf-ic-mcq", step: { type: "mcq", question: "An FSP's internal complaints procedure must be:", options: ["Documented, accessible, and resolve complaints fairly and promptly", "Verbal and informal", "Hidden from clients", "Optional"], correct: 0, feedback: { correct: "Right. Documented, accessible, fair and prompt: with records kept.", incorrect: "It must be documented, accessible and resolve complaints fairly and promptly." } } },
      { variantId: "re5-tcf-ic-tf", step: { type: "true-false", statement: "Records of complaints must be kept for five years.", correct: true, feedback: { correct: "Right. Complaint records follow the five-year rule.", incorrect: "It's true. Complaint records are kept for five years." } } },
      { variantId: "re5-tcf-ic-sc", step: { type: "scenario", question: "A client isn't satisfied after the FSP's internal process. The FSP must:", options: ["Tell the client of their right to refer the matter to the FAIS Ombud", "Close the file silently", "Refuse further contact", "Report the client to SARS"], correct: 0, feedback: { correct: "Right. Inform the client how to escalate to the Ombud.", incorrect: "The FSP must tell the client of their right to go to the FAIS Ombud." } } },
    ],
  },
  {
    slotId: "re5/l7-tcf/escalation",
    conceptId: "tcf-complaints",
    variants: [
      { variantId: "re5-tcf-es-mcq", step: { type: "mcq", question: "If an internal complaint isn't resolved to the client's satisfaction, the client may:", options: ["Refer the matter to the FAIS Ombud", "Do nothing", "Only sue in the High Court", "Report to the SARB"], correct: 0, feedback: { correct: "Right. The Ombud is the escalation route.", incorrect: "They may refer it to the FAIS Ombud." } } },
      { variantId: "re5-tcf-es-tf", step: { type: "true-false", statement: "Outcome 4 of TCF is that advice is suitable to the customer's circumstances.", correct: true, feedback: { correct: "Right. Suitable advice is a TCF outcome.", incorrect: "It's true. Suitable advice is Outcome 4." } } },
      { variantId: "re5-tcf-es-mcq2", step: { type: "mcq", question: "TCF Outcome 5 is that products:", options: ["Perform as customers were led to expect", "Are the cheapest available", "Never change", "Are commission-free"], correct: 0, feedback: { correct: "Right. Products performing as expected is Outcome 5.", incorrect: "Outcome 5 is products performing as customers were led to expect." } } },
    ],
  },
];

const l14OmbudSlots: QuestionSlot[] = [
  {
    slotId: "re5/l7-ombud/what",
    conceptId: "fais-ombud",
    variants: [
      { variantId: "re5-omb-wh-mcq", step: { type: "mcq", question: "What can the FAIS Ombud do?", options: ["Investigate, mediate and make a determination with the effect of a court order", "Set interest rates", "Issue FSP licences", "Collect tax"], correct: 0, feedback: { correct: "Right. The Ombud resolves complaints; determinations bind like a court order.", incorrect: "The Ombud investigates, mediates and makes binding determinations, it doesn't license or tax." } } },
      { variantId: "re5-omb-wh-tf", step: { type: "true-false", statement: "The FAIS Ombud resolves complaints by clients against FSPs and representatives.", correct: true, feedback: { correct: "Right. That's its mandate, fairly, economically and expeditiously.", incorrect: "It's true: the Ombud handles client complaints against FSPs/reps." } } },
      { variantId: "re5-omb-wh-mcq2", step: { type: "mcq", question: "A FAIS Ombud determination has the effect of:", options: ["A court order", "A polite suggestion", "A tax assessment", "A licence condition"], correct: 0, feedback: { correct: "Right. It's enforceable like a court order.", incorrect: "A determination has the force of a court order." } } },
    ],
  },
  {
    slotId: "re5/l7-ombud/jurisdiction",
    conceptId: "fais-ombud",
    variants: [
      { variantId: "re5-omb-ju-fill", step: { type: "fill-blank", title: "Ombud jurisdiction", prompt: "Since 1 July 2024, the FAIS Ombud may award, for a single complaint, up to a maximum of R___ .", correct: 3500000, feedback: { correct: "Correct, R3 500 000 (raised from R800 000 on 1 July 2024).", incorrect: "The cap is R3 500 000 since 1 July 2024." } } },
      { variantId: "re5-omb-ju-mcq", step: { type: "mcq", question: "The FAIS Ombud's maximum award for a single complaint is:", options: ["R3.5 million", "R800 000", "R1 million", "Unlimited"], correct: 0, feedback: { correct: "Right. R3.5m, raised from R800 000 on 1 July 2024.", incorrect: "It's R3.5 million now (R800 000 was the old limit)." } } },
      { variantId: "re5-omb-ju-tf", step: { type: "true-false", statement: "A complainant may abandon the amount above the Ombud's cap to stay within its jurisdiction.", correct: true, feedback: { correct: "Right. You can abandon the excess to keep the matter with the Ombud.", incorrect: "It's true. The excess above the cap can be abandoned to stay in jurisdiction." } } },
    ],
  },
  {
    slotId: "re5/l7-ombud/time-limits",
    conceptId: "fais-ombud",
    variants: [
      { variantId: "re5-omb-tl-mcq", step: { type: "mcq", question: "After lodging a written complaint, how long does the FSP have to resolve it before the client may go to the Ombud?", options: ["6 weeks", "48 hours", "2 weeks", "6 months"], correct: 0, feedback: { correct: "Right. The FSP has six weeks; then the client has six months to escalate.", incorrect: "The FSP has six weeks to resolve it." } } },
      { variantId: "re5-omb-tl-sc", step: { type: "scenario", question: "A client complained in writing 8 weeks ago with no resolution. Correct next step?", options: ["The six weeks has lapsed", "Wait a full year first", "Get a High Court ruling first", "The right lapses after six weeks"], correct: 0, feedback: { correct: "Right. After the six-week window lapses unresolved, escalate to the Ombud (within six months).", incorrect: "The FSP's six weeks has passed. The client may now go to the Ombud." } } },
      { variantId: "re5-omb-tl-tf", step: { type: "true-false", statement: "A client has six months after the FSP's window to refer the matter to the Ombud.", correct: true, feedback: { correct: "Right. Six weeks for the FSP, then six months to escalate.", incorrect: "It's true. Six months to refer after the FSP's six-week period." } } },
    ],
  },
  {
    slotId: "re5/l7-ombud/prescription",
    conceptId: "fais-ombud",
    variants: [
      { variantId: "re5-omb-pr-mcq", step: { type: "mcq", question: "Which complaint would the Ombud most likely DECLINE?", options: ["One about facts the client became aware of more than three years ago", "An unsuitable-advice complaint from 18 months ago", "A R50 000 loss from poor advice", "One the FSP failed to resolve in six weeks"], correct: 0, feedback: { correct: "Right. The three-year prescription lets the Ombud decline old matters.", incorrect: "The likely decline is the one older than three years (prescription)." } } },
      { variantId: "re5-omb-pr-tf", step: { type: "true-false", statement: "The Ombud may decline a matter already being heard by a court.", correct: true, feedback: { correct: "Right. Court-bound (or more appropriately handled elsewhere) matters can be declined.", incorrect: "It's true. The Ombud can decline matters already before a court." } } },
      { variantId: "re5-omb-pr-mcq2", step: { type: "mcq", question: "The three-year period runs from when the client:", options: ["Became aware, or ought to have become aware, of the facts", "First met the adviser", "Signed any document", "Paid the first premium"], correct: 0, feedback: { correct: "Right. Awareness (actual or constructive) of the facts starts the clock.", incorrect: "It runs from when the client became (or should have become) aware of the facts." } } },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// UNIT 8
// ═══════════════════════════════════════════════════════════════════════════

const l15FicaSlots: QuestionSlot[] = [
  {
    slotId: "re5/l8-fica/requires",
    conceptId: "fica",
    variants: [
      { variantId: "re5-fic-rq-mcq", step: { type: "mcq", question: "As an 'accountable institution' under FICA, an FSP must:", options: ["Do customer due diligence, keep an RMCP, report to the FIC and keep records", "Guarantee client returns", "Set interest rates", "Ignore suspicious transactions"], correct: 0, feedback: { correct: "Right. CDD/KYC, RMCP, reporting and record-keeping are core FICA duties.", incorrect: "FICA requires CDD, an RMCP, reporting to the FIC and record-keeping." } } },
      { variantId: "re5-fic-rq-tf", step: { type: "true-false", statement: "FICA combats money laundering and terrorist financing.", correct: true, feedback: { correct: "Right. That's FICA's purpose.", incorrect: "It's true: FICA targets money laundering and terrorist financing." } } },
      { variantId: "re5-fic-rq-mcq2", step: { type: "mcq", question: "'Customer due diligence' (CDD/KYC) means:", options: ["Identifying and verifying clients", "Guaranteeing their returns", "Setting their tax", "Choosing their products"], correct: 0, feedback: { correct: "Right. Identify and verify the client and beneficial owners.", incorrect: "CDD is identifying and verifying clients and their beneficial owners." } } },
    ],
  },
  {
    slotId: "re5/l8-fica/str",
    conceptId: "fica",
    variants: [
      { variantId: "re5-fic-str-sc", step: { type: "scenario", question: "A rep suspects a client's large cash deposits are proceeds of crime. Under FICA they must:", options: ["File a suspicious transaction report with the FIC", "Ask the client to explain first", "Report it to the FSCA as a conduct breach", "Terminate and destroy the records"], correct: 0, feedback: { correct: "Right. File an STR with the FIC; tipping off is an offence.", incorrect: "You must file an STR with the FIC and not tip off the client." } } },
      { variantId: "re5-fic-str-mcq", step: { type: "mcq", question: "Which must be reported to the FIC?", options: ["Suspicious/unusual transactions and large cash transactions above the threshold", "Every client's birthday", "All profitable trades", "Nothing at all"], correct: 0, feedback: { correct: "Right. STRs, CTRs and terrorist-property reports go to the FIC.", incorrect: "Suspicious/unusual and large cash transactions must be reported to the FIC." } } },
      { variantId: "re5-fic-str-tf", step: { type: "true-false", statement: "Reporting a suspicion to the FSCA or police satisfies the FICA duty to file an STR with the FIC.", correct: false, feedback: { correct: "Correct. The STR must go to the FIC. It's not interchangeable with other bodies.", incorrect: "False. The STR must be filed with the FIC specifically." } } },
    ],
  },
  {
    slotId: "re5/l8-fica/tipping-off",
    conceptId: "fica",
    variants: [
      { variantId: "re5-fic-to-tf", step: { type: "true-false", statement: "Under FICA it's fine to tell a client, as a courtesy, that you filed an STR about them.", correct: false, feedback: { correct: "Correct. 'Tipping off' is a criminal offence under FICA.", incorrect: "False. Tipping off a client about an STR is an offence." } } },
      { variantId: "re5-fic-to-mcq", step: { type: "mcq", question: "'Tipping off' means:", options: ["Telling a client a suspicious transaction report has been or will be made", "Giving a client a discount", "Reporting to the FIC", "Doing CDD"], correct: 0, feedback: { correct: "Right. Warning the client about a report is tipping off, prohibited.", incorrect: "Tipping off is alerting the client to an STR: a criminal offence." } } },
      { variantId: "re5-fic-to-sc", step: { type: "scenario", question: "A colleague wants to 'do the client a favour' and mention that an STR was filed. You should:", options: ["Stop them. Tipping off is a criminal offence", "Encourage it as good service", "Ask the client's permission", "Post it publicly"], correct: 0, feedback: { correct: "Right. Tipping off is illegal; the report stays confidential.", incorrect: "Stop them. Tipping off is a crime under FICA." } } },
    ],
  },
  {
    slotId: "re5/l8-fica/records",
    conceptId: "fica",
    variants: [
      { variantId: "re5-fic-rc-fill", step: { type: "fill-blank", title: "FICA record-keeping", prompt: "FICA generally requires accountable institutions to keep records for at least ___ years.", correct: 5, feedback: { correct: "Correct. Five years.", incorrect: "FICA records are generally kept for a minimum of five years." } } },
      { variantId: "re5-fic-rc-mcq", step: { type: "mcq", question: "FICA records are generally kept from:", options: ["The end of the relationship or the date of the transaction, for five years", "One week", "Forever, without exception", "Until the client asks"], correct: 0, feedback: { correct: "Right. Five years from the end of the relationship or the transaction date.", incorrect: "Generally five years from the end of the relationship or the transaction." } } },
      { variantId: "re5-fic-rc-tf", step: { type: "true-false", statement: "An FSP must keep a Risk Management and Compliance Programme (RMCP) under FICA.", correct: true, feedback: { correct: "Right. The RMCP is a core FICA requirement.", incorrect: "It's true. Accountable institutions must maintain an RMCP." } } },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// UNIT 9 · QUIZZES (mixed review — reuse existing concepts)
// ═══════════════════════════════════════════════════════════════════════════

const quizFrameworkSlots: QuestionSlot[] = [
  {
    slotId: "re5/quiz-framework/fais",
    conceptId: "fais-purpose",
    variants: [
      { variantId: "re5-qf-fa-mcq", step: { type: "mcq", question: "Which statement about the FAIS Act is correct?", options: ["It regulates the conduct of those who render financial services", "It guarantees approved products", "It sets product interest rates", "It only applies to long-term insurance"], correct: 0, feedback: { correct: "FAIS is conduct regulation for advice and intermediary services.", incorrect: "FAIS regulates conduct, not performance, pricing, or one product type." } } },
      { variantId: "re5-qf-fa-tf", step: { type: "true-false", statement: "The FSCA licenses and supervises FSPs.", correct: true, feedback: { correct: "Right. The FSCA is the conduct regulator and licensing authority.", incorrect: "It's true, the FSCA licenses and supervises FSPs." } } },
      { variantId: "re5-qf-fa-mcq2", step: { type: "mcq", question: "FAIS does NOT:", options: ["Guarantee product performance", "Regulate adviser conduct", "Require disclosure", "Provide a complaints Ombud"], correct: 0, feedback: { correct: "Right. It never guarantees performance.", incorrect: "FAIS regulates conduct, requires disclosure and provides the Ombud, it doesn't guarantee performance." } } },
    ],
  },
  {
    slotId: "re5/quiz-framework/advice",
    conceptId: "fais-definitions",
    variants: [
      { variantId: "re5-qf-ad-mcq", step: { type: "mcq", question: "A recommendation that a client REPLACE a policy is:", options: ["Advice", "An intermediary service only", "Excluded from FAIS", "Advice only if accepted"], correct: 0, feedback: { correct: "A recommendation to buy, replace or terminate is advice.", incorrect: "Recommending replacement is advice: a recommendation of a financial nature." } } },
      { variantId: "re5-qf-ad-mcq2", step: { type: "mcq", question: "Which is NOT excluded from 'advice'?", options: ["A specific recommendation to buy a particular unit trust", "Factual product terms with no recommendation", "An objective display of product info", "General info on how a product works"], correct: 0, feedback: { correct: "The specific recommendation IS advice.", incorrect: "The specific recommendation is advice; the others are excluded factual information." } } },
      { variantId: "re5-qf-ad-tf", step: { type: "true-false", statement: "Submitting a client's application to an insurer is an intermediary service, not advice.", correct: true, feedback: { correct: "Right. It's an act done for the client, short of advice.", incorrect: "It's true. Submitting the application is an intermediary service." } } },
    ],
  },
  {
    slotId: "re5/quiz-framework/regulator",
    conceptId: "fais-purpose",
    variants: [
      { variantId: "re5-qf-rg-mcq", step: { type: "mcq", question: "The market-conduct regulator that licenses FSPs is the:", options: ["Financial Sector Conduct Authority", "Prudential Authority", "SARB MPC", "FAIS Ombud"], correct: 0, feedback: { correct: "The FSCA is the conduct regulator.", incorrect: "It's the FSCA, the Prudential Authority handles soundness; the Ombud resolves complaints." } } },
      { variantId: "re5-qf-rg-tf", step: { type: "true-false", statement: "The Prudential Authority handles the soundness of institutions.", correct: true, feedback: { correct: "Right. Prudential = soundness; FSCA = conduct.", incorrect: "It's true, the Prudential Authority handles soundness." } } },
      { variantId: "re5-qf-rg-mcq2", step: { type: "mcq", question: "'The Registrar' in older FAIS material now means:", options: ["The FSCA / the Authority", "The Ombud", "SARS", "The SARB"], correct: 0, feedback: { correct: "Right. Read 'Registrar' as the FSCA.", incorrect: "It means the FSCA (the Authority)." } } },
    ],
  },
  {
    slotId: "re5/quiz-framework/category",
    conceptId: "fsp-categories",
    variants: [
      { variantId: "re5-qf-ct-mcq", step: { type: "mcq", question: "Discretionary FSPs (making decisions without per-trade approval) hold which category?", options: ["Category II", "Category I", "Category III", "Category IV"], correct: 0, feedback: { correct: "Right. Discretion = Category II.", incorrect: "It's Category II. Category I is advice/intermediary only." } } },
      { variantId: "re5-qf-ct-tf", step: { type: "true-false", statement: "A licence authorises only the categories and product subcategories approved for.", correct: true, feedback: { correct: "Right. You can't act outside the approved scope.", incorrect: "It's true. The licence is limited to approved categories/subcategories." } } },
      { variantId: "re5-qf-ct-mcq2", step: { type: "mcq", question: "Administrative FSPs (LISPs) are which category?", options: ["Category III", "Category I", "Category II", "Category IV"], correct: 0, feedback: { correct: "Right. LISPs = Category III.", incorrect: "Administrative FSPs (LISPs) are Category III." } } },
    ],
  },
];

const quizFitProperSlots: QuestionSlot[] = [
  {
    slotId: "re5/quiz-fitproper/pillar",
    conceptId: "fit-and-proper",
    variants: [
      { variantId: "re5-qfp-pl-mcq", step: { type: "mcq", question: "Which is NOT a fit & proper pillar?", options: ["Guaranteed investment performance", "Financial soundness", "Operational ability", "Honesty and integrity"], correct: 0, feedback: { correct: "There's no 'guaranteed performance' pillar.", incorrect: "Guaranteed performance isn't a pillar. The others are." } } },
      { variantId: "re5-qfp-pl-tf", step: { type: "true-false", statement: "Fit & proper requirements apply continuously, not just at appointment.", correct: true, feedback: { correct: "Right. They're ongoing standards.", incorrect: "It's true. They apply continuously." } } },
      { variantId: "re5-qfp-pl-mcq2", step: { type: "mcq", question: "Competence includes:", options: ["Qualifications, regulatory exams, experience and training", "Only sales targets", "Office location", "Client count"], correct: 0, feedback: { correct: "Right. Qualifications, RE, experience and training.", incorrect: "Competence is qualifications, exams, experience and training." } } },
    ],
  },
  {
    slotId: "re5/quiz-fitproper/cpd",
    conceptId: "fais-competence-cpd",
    variants: [
      { variantId: "re5-qfp-cp-mcq", step: { type: "mcq", question: "The CPD cycle runs from:", options: ["1 June to 31 May", "1 January to 31 December", "1 March to 28/29 February", "1 July to 30 June"], correct: 0, feedback: { correct: "1 June to 31 May.", incorrect: "It runs 1 June to 31 May." } } },
      { variantId: "re5-qfp-cp-tf", step: { type: "true-false", statement: "Product-specific training counts toward CPD hours.", correct: false, feedback: { correct: "Correct. It's a separate requirement, not CPD.", incorrect: "False. Product-specific training doesn't count as CPD." } } },
      { variantId: "re5-qfp-cp-mcq2", step: { type: "mcq", question: "A single low-complexity subclass typically requires how many CPD hours per cycle?", options: ["6", "0", "18", "40"], correct: 0, feedback: { correct: "Right. 6 hours (rising with complexity, up to 18).", incorrect: "It's 6 hours for the simplest case." } } },
    ],
  },
  {
    slotId: "re5/quiz-fitproper/disclosure",
    conceptId: "code-general-duty",
    variants: [
      { variantId: "re5-qfp-di-mcq", step: { type: "mcq", question: "Under the General Code, information to a client must be:", options: ["Factually correct, clear, not misleading and provided timeously", "In writing only, after the sale", "Focused on benefits, risks on request", "Whatever closes the sale"], correct: 0, feedback: { correct: "Right. Correct, clear, not misleading and timely.", incorrect: "It must be factually correct, clear, not misleading and timely." } } },
      { variantId: "re5-qfp-di-tf", step: { type: "true-false", statement: "Key oral disclosures must be confirmed in writing within a reasonable time.", correct: true, feedback: { correct: "Right.", incorrect: "It's true: confirm key oral disclosures in writing." } } },
      { variantId: "re5-qfp-di-mcq2", step: { type: "mcq", question: "The provider's commission/remuneration must be:", options: ["Disclosed to the client", "Kept confidential", "Set by the Ombud", "Ignored"], correct: 0, feedback: { correct: "Right. Remuneration must be disclosed.", incorrect: "It must be disclosed. Concealing it is a breach." } } },
    ],
  },
  {
    slotId: "re5/quiz-fitproper/records",
    conceptId: "code-records-coi",
    variants: [
      { variantId: "re5-qfp-rc-mcq", step: { type: "mcq", question: "Records of advice and complaints must be kept for at least:", options: ["5 years", "1 year", "3 years", "10 years"], correct: 0, feedback: { correct: "Five years.", incorrect: "It's five years." } } },
      { variantId: "re5-qfp-rc-mcq2", step: { type: "mcq", question: "A COI management policy must address how the FSP will:", options: ["Identify, avoid or mitigate, and disclose conflicts", "Maximise commission", "Hide conflicts", "Pay for volume"], correct: 0, feedback: { correct: "Identify, avoid/mitigate and disclose.", incorrect: "It must identify, avoid/mitigate and disclose conflicts." } } },
      { variantId: "re5-qfp-rc-tf", step: { type: "true-false", statement: "Rewarding a rep for volume of business over quality is restricted by the COI rules.", correct: true, feedback: { correct: "Right.", incorrect: "It's true. Volume-over-quality incentives are restricted." } } },
    ],
  },
];

const quizOmbudFicaSlots: QuestionSlot[] = [
  {
    slotId: "re5/quiz-ombud-fica/ombud-max",
    conceptId: "fais-ombud",
    variants: [
      { variantId: "re5-qof-om-mcq", step: { type: "mcq", question: "The FAIS Ombud's maximum award for a single complaint is:", options: ["R3.5 million", "R800 000", "R1 million", "Unlimited"], correct: 0, feedback: { correct: "R3.5 million, raised from R800 000 on 1 July 2024.", incorrect: "It's R3.5 million (R800 000 was the old limit)." } } },
      { variantId: "re5-qof-om-tf", step: { type: "true-false", statement: "A FAIS Ombud determination has the effect of a court order.", correct: true, feedback: { correct: "Right. It's enforceable like a court order.", incorrect: "It's true, a determination binds like a court order." } } },
      { variantId: "re5-qof-om-mcq2", step: { type: "mcq", question: "The Ombud may DECLINE a complaint that is:", options: ["Older than three years", "Worth R50 000", "18 months old", "Unresolved after six weeks"], correct: 0, feedback: { correct: "Right. Three-year prescription.", incorrect: "It may decline matters older than three years." } } },
    ],
  },
  {
    slotId: "re5/quiz-ombud-fica/six-weeks",
    conceptId: "fais-ombud",
    variants: [
      { variantId: "re5-qof-sw-mcq", step: { type: "mcq", question: "How long does the FSP have to resolve a written complaint before the client may go to the Ombud?", options: ["6 weeks", "48 hours", "2 weeks", "6 months"], correct: 0, feedback: { correct: "Six weeks.", incorrect: "The FSP has six weeks." } } },
      { variantId: "re5-qof-sw-tf", step: { type: "true-false", statement: "After the FSP's window, the client has six months to refer the matter to the Ombud.", correct: true, feedback: { correct: "Right. Six weeks, then six months.", incorrect: "It's true. Six months to escalate after the FSP's six weeks." } } },
      { variantId: "re5-qof-sw-sc", step: { type: "scenario", question: "The FSP hasn't resolved a written complaint after 8 weeks. The client may:", options: ["Refer it to the FAIS Ombud now", "Wait a year", "Go straight to the High Court only", "Do nothing. It's lapsed"], correct: 0, feedback: { correct: "Right. The six weeks has lapsed, so escalate to the Ombud.", incorrect: "They may now go to the Ombud. The FSP's six weeks has passed." } } },
    ],
  },
  {
    slotId: "re5/quiz-ombud-fica/str",
    conceptId: "fica",
    variants: [
      { variantId: "re5-qof-st-mcq", step: { type: "mcq", question: "Suspecting a client's funds are proceeds of crime, an FSP must:", options: ["File a suspicious transaction report with the FIC", "Warn the client first", "Report to the FSCA instead", "Delete the records"], correct: 0, feedback: { correct: "File an STR with the FIC; don't tip off.", incorrect: "You must file an STR with the FIC and not tip off the client." } } },
      { variantId: "re5-qof-st-tf", step: { type: "true-false", statement: "Tipping off a client about an STR is an offence under FICA.", correct: true, feedback: { correct: "Right.", incorrect: "It's true. Tipping off is an offence." } } },
      { variantId: "re5-qof-st-mcq2", step: { type: "mcq", question: "FICA records are generally kept for at least:", options: ["5 years", "6 months", "1 year", "20 years"], correct: 0, feedback: { correct: "Five years.", incorrect: "FICA records are kept for at least five years." } } },
    ],
  },
  {
    slotId: "re5/quiz-ombud-fica/tcf",
    conceptId: "tcf-complaints",
    variants: [
      { variantId: "re5-qof-tc-mcq", step: { type: "mcq", question: "TCF Outcome 6 concerns:", options: ["No unreasonable post-sale barriers to switch, claim or complain", "Guaranteed returns", "Maximum commission", "Fewer complaints on record"], correct: 0, feedback: { correct: "Right. Outcome 6 = no unreasonable post-sale barriers.", incorrect: "It's Outcome 6: removing unreasonable post-sale barriers." } } },
      { variantId: "re5-qof-tc-tf", step: { type: "true-false", statement: "An FSP must tell a dissatisfied complainant of their right to approach the FAIS Ombud.", correct: true, feedback: { correct: "Right.", incorrect: "It's true. The FSP must point the client to the Ombud." } } },
      { variantId: "re5-qof-tc-mcq2", step: { type: "mcq", question: "TCF is best described as:", options: ["An outcomes-based fairness framework", "A tax", "A commission rule", "A product guarantee"], correct: 0, feedback: { correct: "Right. Six fairness outcomes.", incorrect: "TCF is an outcomes-based framework with six outcomes." } } },
    ],
  },
];

// ── layouts (concise; teaching detail lives in the legacy steps + variants) ──
const L = (slotIds: string[], title: string, content: string): LessonLayoutItem[] => [
  info(title, content),
  ...slotIds.map((s) => ({ slot: s })),
];

export const RE5_BANKS: Record<string, LessonBank> = {
  "re5-exam-prep::re5-l1-purpose": {
    layout: L(l1PurposeSlots.map((s) => s.slotId), "Why FAIS Exists & Who Runs It",
      "<p>The <strong>FAIS Act (37 of 2002)</strong> protects clients by regulating the <strong>conduct</strong> of those who render financial advice and intermediary services, not the products' performance. The <strong>FSCA</strong> (which replaced the FSB under Twin Peaks) is the conduct regulator; the <strong>Prudential Authority</strong> handles institutional soundness.</p>"),
    slots: l1PurposeSlots,
  },
  "re5-exam-prep::re5-l1-definitions": {
    layout: L(l2DefinitionsSlots.map((s) => s.slotId), "The Definitions That Run the Exam",
      "<p><strong>Advice</strong> = a recommendation, guidance or proposal about a product (factual info alone is not advice). <strong>Intermediary service</strong> = any act, other than advice, done for the client to buy/maintain a product. The <strong>KI</strong> manages/oversees; the <strong>representative</strong> renders services; the <strong>FSP</strong> is the licensed business.</p>"),
    slots: l2DefinitionsSlots,
  },
  "re5-exam-prep::re5-l2-categories": {
    layout: L(l3CategoriesSlots.map((s) => s.slotId), "FSP Categories & Licensing",
      "<p>You may not act as an FSP without a licence. Categories: <strong>I</strong> advice/intermediary; <strong>II</strong> discretionary; <strong>IIA</strong> hedge funds; <strong>III</strong> administrative (LISPs); <strong>IV</strong> assistance business. A licence covers only the categories and subcategories approved.</p>"),
    slots: l3CategoriesSlots,
  },
  "re5-exam-prep::re5-l2-suspend-withdraw": {
    layout: L(l4SuspendSlots.map((s) => s.slotId), "Suspension & Withdrawal of a Licence",
      "<p>The FSCA may <strong>suspend</strong> (temporary, conditional) or <strong>withdraw</strong> (ends it) a licence for cause, normally after notice and representations, but immediately where delay would prejudice clients. A licence also <strong>lapses</strong> on liquidation/death. Pre-existing obligations to clients survive.</p>"),
    slots: l4SuspendSlots,
  },
  "re5-exam-prep::re5-l3-roles": {
    layout: L(l5RolesSlots.map((s) => s.slotId), "Representatives, KIs & the Register",
      "<p>Every FSP keeps an up-to-date <strong>register</strong> of reps and KIs (categories + supervision status), updated within <strong>15 days</strong> of a change. The FSP is accountable; the KI oversees; a rep works within the FSP's authorisation and under <strong>supervision</strong> until competent (timelines run from <strong>DOFA</strong>).</p>"),
    slots: l5RolesSlots,
  },
  "re5-exam-prep::re5-l3-debarment": {
    layout: L(l6DebarmentSlots.map((s) => s.slotId), "Debarment of Representatives",
      "<p><strong>Debarment</strong> removes a person's ability to render financial services. It must be <strong>procedurally fair</strong> (notice, reasons, a chance to respond, and a right to reconsideration) then the FSCA is notified and publishes it, so no FSP appoints a debarred person.</p>"),
    slots: l6DebarmentSlots,
  },
  "re5-exam-prep::re5-l4-pillars": {
    layout: L(l7PillarsSlots.map((s) => s.slotId), "The Fit & Proper Pillars",
      "<p>The pillars, to be met <strong>continuously</strong>: <strong>honesty, integrity & good standing</strong>; <strong>competence</strong>; <strong>CPD</strong>; <strong>operational ability</strong>; and <strong>financial soundness</strong>. There is no 'guaranteed returns' requirement, FAIS regulates conduct.</p>"),
    slots: l7PillarsSlots,
  },
  "re5-exam-prep::re5-l4-competence-cpd": {
    layout: L(l8CompetenceSlots.map((s) => s.slotId), "Competence, Exams & CPD",
      "<p>Competence runs from <strong>DOFA</strong>: recognised qualification (generally within six years), the regulatory exam, and class-of-business / product-specific training before advising. <strong>CPD</strong> runs <strong>1 June–31 May</strong> (commonly 6/12/18 hours). Product-specific training does <strong>not</strong> count as CPD.</p>"),
    slots: l8CompetenceSlots,
  },
  "re5-exam-prep::re5-l5-general-duty": {
    layout: L(l9GeneralDutySlots.map((s) => s.slotId), "The General Duty to Clients",
      "<p>The General Code requires services rendered <strong>honestly, fairly, with due skill, care and diligence, in clients' interests</strong>. Information must be <strong>factually correct, clear, not misleading and timely</strong>; key oral disclosures are confirmed in writing; and clients are never pressured.</p>"),
    slots: l9GeneralDutySlots,
  },
  "re5-exam-prep::re5-l5-three-disclosures": {
    layout: L(l10DisclosuresSlots.map((s) => s.slotId), "Provider, Supplier & Product Disclosure",
      "<p>Disclose three things: the <strong>provider</strong> (licence, contact, supervision), the <strong>product supplier</strong> (relationship, restrictions), and the <strong>product</strong> (terms, fees, penalties, risks). Including the provider's <strong>remuneration/commission</strong>. Concealing remuneration is a serious breach.</p>"),
    slots: l10DisclosuresSlots,
  },
  "re5-exam-prep::re5-l6-suitability": {
    layout: L(l11SuitabilitySlots.map((s) => s.slotId), "Suitable Advice & the Record of Advice",
      "<p>Before advising, do a <strong>needs analysis</strong> and suitability analysis; keep a <strong>record of advice</strong> showing why the recommendation suits the client. If the client acts <strong>against advice</strong>, record the instruction and the warning. Never falsify the risk profile. Flag <strong>limited-scope</strong> advice.</p>"),
    slots: l11SuitabilitySlots,
  },
  "re5-exam-prep::re5-l6-records-coi": {
    layout: L(l12RecordsSlots.map((s) => s.slotId), "Record-Keeping, Conflicts & Advertising",
      "<p>Keep records (advice, complaints) for <strong>five years</strong>. Maintain a <strong>Conflict of Interest policy</strong>. Identify, avoid/mitigate and disclose; never pay a financial interest that rewards <strong>volume over quality</strong> or supplier preference. Adverts must not be misleading.</p>"),
    slots: l12RecordsSlots,
  },
  "re5-exam-prep::re5-l7-tcf-complaints": {
    layout: L(l13TcfSlots.map((s) => s.slotId), "TCF & Internal Complaints",
      "<p><strong>Treating Customers Fairly</strong> sets six outcomes. Fair dealing, suitable design, clear information, suitable advice, products performing as expected, and (Outcome 6) no unreasonable post-sale barriers. FSPs run a documented <strong>internal complaints</strong> process and must tell clients how to escalate to the <strong>FAIS Ombud</strong>.</p>"),
    slots: l13TcfSlots,
  },
  "re5-exam-prep::re5-l7-ombud": {
    layout: L(l14OmbudSlots.map((s) => s.slotId), "The FAIS Ombud: Jurisdiction & Process",
      "<p>The <strong>FAIS Ombud</strong> resolves client complaints and makes determinations with the effect of a court order, up to <strong>R3.5 million</strong> (raised from R800 000 on 1 July 2024). Complain to the FSP first (<strong>six weeks</strong>), then <strong>six months</strong> to the Ombud; the Ombud may decline matters older than <strong>three years</strong>.</p>"),
    slots: l14OmbudSlots,
  },
  "re5-exam-prep::re5-l8-fica": {
    layout: L(l15FicaSlots.map((s) => s.slotId), "FICA Obligations for FSPs",
      "<p>Many FSPs are <strong>accountable institutions</strong> under FICA: do <strong>customer due diligence</strong>, keep an <strong>RMCP</strong>, report suspicious/unusual and large cash transactions to the <strong>FIC</strong>, and keep records for <strong>five years</strong>. <strong>Tipping off</strong> a client about a report is a criminal offence.</p>"),
    slots: l15FicaSlots,
  },
  "re5-exam-prep::re5-quiz-framework": {
    layout: L(quizFrameworkSlots.map((s) => s.slotId), "Quiz: Framework & Definitions",
      "<p>Exam-style drill on the FAIS framework, the regulators, the definition of advice vs intermediary service, and FSP categories. Do these once the teaching units feel solid.</p>"),
    slots: quizFrameworkSlots,
  },
  "re5-exam-prep::re5-quiz-fitproper-code": {
    layout: L(quizFitProperSlots.map((s) => s.slotId), "Quiz: Fit & Proper + Code of Conduct",
      "<p>Exam-style drill on the fit & proper pillars, competence and CPD, the disclosure standard, record retention and conflicts of interest.</p>"),
    slots: quizFitProperSlots,
  },
  "re5-exam-prep::re5-quiz-ombud-fica": {
    layout: L(quizOmbudFicaSlots.map((s) => s.slotId), "Quiz: Ombud, Complaints & FICA",
      "<p>Exam-style drill on the FAIS Ombud (jurisdiction and time limits), TCF, and FICA reporting obligations.</p>"),
    slots: quizOmbudFicaSlots,
  },
};
