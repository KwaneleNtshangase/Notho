// ═══════════════════════════════════════════════════════════════════════════
// NOTHO - RE5 EXAM PREP COURSE
//
// A dedicated preparation course for the FSCA Regulatory Examination Level 1:
// Representatives (RE5), taken by financial advisors and representatives under
// the FAIS Act 37 of 2002.
//
// EXAM FORMAT this course is built to (verify against the latest FSCA
// "RE Preparation Guide" before every sitting - the FSCA occasionally amends
// board notices and criteria):
// • 50 multiple-choice questions
// • 2 hours (120 minutes)
// • Published pass mark: 65%; operational threshold: 33 of 50 correct
// • Based on the FAIS Act, the General Code of Conduct (BN 80 of 2003),
// the Determination of Fit & Proper Requirements (BN 194 of 2017),
// specific codes, the FAIS Ombud rules, and FICA (Act 38 of 2001)
// to the extent it applies to FSPs.
//
// DIFFICULTY: Questions are written at, or deliberately above, actual RE5
// difficulty - heavy on application/scenario framing, precise statutory time
// periods and thresholds, and "which is NOT / EXCEPT" distractors, mirroring
// how the real exam traps candidates who have only memorised headlines.
//
// Structure:
// Units 1-8 - teaching + practice across every RE5 knowledge area
// Unit 9 - topic practice quizzes (exam-style, no teaching)
// Unit 10 - Mock Exam A (50 questions, timed conditions)
// Unit 11 - Mock Exam B (50 questions, timed conditions)
// ═══════════════════════════════════════════════════════════════════════════

import type { Course } from "./content";

// Helper note: this file only uses step types already supported by the app
// (info, mcq, scenario, true-false, fill-blank). No schema changes required.

// ─────────────────────────────────────────────────────────────────────────────
// COURSE DEFINITION
// ─────────────────────────────────────────────────────────────────────────────

export const RE5_COURSE: Course = {
  id: "re5-exam-prep",
  title: "RE5 Exam Prep",
  description:
  "Everything advisors and representatives need to pass the FSCA RE5 regulatory exam - full syllabus coverage, exam-difficulty practice quizzes, and two timed 50-question mock exams.",
  icon: "shield",
  units: [
    // ═══════════════════════════════════════════════════════════════════════
    // UNIT 1 - THE FAIS ACT & REGULATORY FRAMEWORK
    // ═══════════════════════════════════════════════════════════════════════
    {
      id: "re5-unit-1",
      title: "The FAIS Act & Regulatory Framework",
      description:
      "What FAIS is for, who enforces it, and the definitions the whole exam rests on",
      lessons: [
        {
          id: "re5-l1-purpose",
          title: "Why FAIS Exists & Who Runs It",
          steps: [
            {
              type: "info",
              title: "What the FAIS Act Is For",
              content:
              "<p>The <strong>Financial Advisory and Intermediary Services Act 37 of 2002 (FAIS)</strong> exists to protect clients when they receive financial advice or intermediary services. It does this by regulating the people and businesses who render those services.</p><p>Its core aims: professionalise the industry, make sure clients get suitable advice, force disclosure so clients can make informed decisions, and give clients somewhere to complain (the FAIS Ombud).</p><p>FAIS regulates <strong>conduct</strong> - how business is done - not the financial products themselves.</p>",
            },
            {
              type: "info",
              title: "Who Regulates the Industry",
              content:
              "<p>Since the Financial Sector Regulation Act (the 'Twin Peaks' reform), the regulator is the <strong>Financial Sector Conduct Authority (FSCA)</strong> - the market-conduct regulator. It replaced the former Financial Services Board (FSB).</p><p>The <strong>Prudential Authority</strong> (housed in the Reserve Bank) oversees the safety and soundness of institutions. For RE5, the FSCA is your main regulator - it licenses FSPs, sets fit & proper standards, and enforces the Act.</p><p>Where older material refers to the 'Registrar', read it as the FSCA / the Authority.</p>",
            },
            {
              type: "mcq",
              question:
              "A client says: 'FAIS guarantees my investment won't lose money because the FSCA approved the product.' Why is this wrong?",
              options: [
                "Only products approved by the Prudential Authority are guaranteed",
                "FAIS regulates the conduct of advisers, not product performance",
                "FAIS guarantees capital but not the growth on it",
                "The guarantee applies only to Category I products",
              ],
              correct: 1,
              feedback: {
                correct:
                "FAIS is a market-conduct law. It governs how advice and intermediary services are rendered - it never guarantees returns or vets a product's investment merits.",
                incorrect:
                "FAIS regulates conduct (how services are rendered). It does not guarantee product performance and neither the FSCA nor the PA underwrites returns.",
              },
            },
            {
              type: "true-false",
              statement:
              "The FSCA is the market-conduct regulator that replaced the Financial Services Board (FSB) under the Twin Peaks model.",
              correct: true,
              feedback: {
                correct:
                "Correct. The FSCA is the conduct regulator; the Prudential Authority handles prudential (soundness) regulation.",
                incorrect:
                "It is true. Under Twin Peaks the FSB became the FSCA (conduct), and the Prudential Authority was created for soundness.",
              },
            },
          ],
        },
        {
          id: "re5-l1-definitions",
          title: "The Definitions That Run the Exam",
          steps: [
            {
              type: "info",
              title: "'Advice' - The Most Tested Definition",
              content:
              "<p><strong>Advice</strong> means any recommendation, guidance or proposal of a financial nature given to a client about a financial product - including whether to buy, replace, or terminate a product.</p><p>Crucially, advice does <strong>not</strong> include: factual information given only to explain, information about a product's terms without a recommendation, or an analysis/report without a specific recommendation. The line is the <em>recommendation</em>.</p>",
            },
            {
              type: "info",
              title: "'Intermediary Service' & the Other Key Terms",
              content:
              "<p><strong>Intermediary service:</strong> any act (other than advice) performed for a client with a view to buying/maintaining a product, or dealing with a product supplier on the client's behalf - e.g. submitting an application, collecting premiums, receiving/handling client money.</p><p><strong>FSP:</strong> the licensed business. <strong>Key Individual (KI):</strong> the person who manages/oversees the FSP's financial services. <strong>Representative:</strong> a person who renders advice or intermediary services for/on behalf of an FSP.</p>",
            },
            {
              type: "scenario",
              question:
              "A bank teller reads a client the fixed interest rate and term of a savings product from a brochure, answering factual questions but making no recommendation. Is this 'advice' under FAIS?",
              options: [
                "Yes - any discussion of a product is advice",
                "No - factual information without a recommendation is not advice",
                "Yes - because it involves a financial product",
                "Only if the client later buys the product",
              ],
              correct: 1,
              feedback: {
                correct:
                "Right. Giving factual product information, with no recommendation or proposal, falls outside the definition of advice.",
                incorrect:
                "Advice requires a recommendation, guidance or proposal. Purely factual information with no recommendation is expressly excluded.",
              },
            },
            {
              type: "mcq",
              question:
              "Which of the following is an INTERMEDIARY SERVICE rather than advice?",
              options: [
                "Recommending the client switch from Fund A to Fund B",
                "Submitting the client's completed policy application to the insurer",
                "Proposing that the client increase their cover",
                "Guiding the client on whether to cancel a policy",
              ],
              correct: 1,
              feedback: {
                correct:
                "Submitting an application on the client's behalf is an act performed with a view to concluding/maintaining a product - an intermediary service, not advice.",
                incorrect:
                "The others are recommendations/guidance/proposals - i.e. advice. Submitting the application is the intermediary service.",
              },
            },
            {
              type: "mcq",
              question:
              "Which person is responsible for MANAGING OR OVERSEEING the financial services rendered by an FSP?",
              options: [
                "The representative",
                "The Key Individual (KI)",
                "The compliance officer",
                "The FAIS Ombud",
              ],
              correct: 1,
              feedback: {
                correct:
                "Correct - the Key Individual carries the management/oversight responsibility. A representative renders the services; the compliance officer monitors compliance.",
                incorrect:
                "It's the Key Individual (KI) who manages or oversees the rendering of financial services. The representative renders them.",
              },
            },
          ],
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════════
    // UNIT 2 - LICENSING & THE FSP
    // ═══════════════════════════════════════════════════════════════════════
    {
      id: "re5-unit-2",
      title: "Licensing & the FSP",
      description:
      "FSP categories, the licence application, conditions, and how a licence can be suspended or withdrawn",
      lessons: [
        {
          id: "re5-l2-categories",
          title: "FSP Categories & Licensing",
          steps: [
            {
              type: "info",
              title: "You May Not Act Without a Licence",
              content:
              "<p>No person may act as an FSP - render financial services - unless authorised under a licence issued by the FSCA. Rendering financial services without a licence is an offence.</p><p>The FSP applies to the FSCA, which considers whether the applicant (and its KIs) meet the fit & proper requirements before granting the licence, possibly with conditions.</p>",
            },
            {
              type: "info",
              title: "The Categories of FSP",
              content:
              "<p>Licences are granted by <strong>category</strong>, according to what the FSP does:</p><ul><li><strong>Category I</strong> - advice and/or intermediary services (the most common; ordinary advisors).</li><li><strong>Category II</strong> - discretionary FSPs (make investment decisions for clients without prior approval each time).</li><li><strong>Category IIA</strong> - hedge fund FSPs.</li><li><strong>Category III</strong> - administrative FSPs (e.g. LISPs / investment administration).</li><li><strong>Category IV</strong> - assistance business FSPs.</li></ul><p>An FSP is licensed only for the categories and product subcategories it applied for and was approved for.</p>",
            },
            {
              type: "mcq",
              question:
              "An FSP makes buy/sell decisions on a client's portfolio without seeking the client's approval for each transaction. Which licence category does it need?",
              options: [
                "Category I",
                "Category II (discretionary FSP)",
                "Category III (administrative FSP)",
                "Category IV (assistance business)",
              ],
              correct: 1,
              feedback: {
                correct:
                "Exercising investment discretion on the client's behalf requires a Category II (discretionary) licence.",
                incorrect:
                "Discretionary decision-making (no per-transaction approval) is Category II. Category I is advice/intermediary services only.",
              },
            },
            {
              type: "true-false",
              statement:
              "An FSP may render financial services in any product subcategory it wishes, as long as it holds a valid licence of some kind.",
              correct: false,
              feedback: {
                correct:
                "Correct - a licence authorises only the specific categories and product subcategories applied and approved for. Acting outside them breaches the licence.",
                incorrect:
                "False. The licence is limited to the approved categories and subcategories. An FSP may not simply render services in areas it was never authorised for.",
              },
            },
          ],
        },
        {
          id: "re5-l2-suspend-withdraw",
          title: "Suspension & Withdrawal of a Licence",
          steps: [
            {
              type: "info",
              title: "When the FSCA Can Act Against a Licence",
              content:
              "<p>The FSCA may <strong>suspend or withdraw</strong> an FSP's licence if, for example, the FSP no longer meets the fit & proper requirements, obtained the licence through fraud or a materially false statement, has not rendered services for a set period, or has seriously/persistently contravened the Act.</p><p>Before suspending/withdrawing, the FSCA must generally give the FSP notice and a reasonable opportunity to make representations - unless the delay would prejudice clients or the public, in which case it may act first and hear representations after.</p>",
            },
            {
              type: "info",
              title: "Suspension vs Withdrawal & Lapsing",
              content:
              "<p><strong>Suspension</strong> is temporary and may carry conditions the FSP must meet to have it lifted. <strong>Withdrawal</strong> ends the authorisation. A licence also <strong>lapses</strong> in certain events - for example, if the FSP is finally liquidated/deregistered or (for a natural person) dies.</p><p>Even after withdrawal or lapsing, obligations to clients (and to the FSCA) that arose before the event continue - you can't escape liability by surrendering a licence.</p>",
            },
            {
              type: "scenario",
              question:
              "The FSCA discovers an FSP is misappropriating client premiums, posing an immediate risk to clients. What may the FSCA do?",
              options: [
                "Wait the full notice period before acting, in all cases",
                "Suspend or withdraw immediately where delay would prejudice clients",
                "Refer the conduct to the FAIS Ombud for determination",
                "Debar the FSP's representatives before addressing the licence",
              ],
              correct: 1,
              feedback: {
                correct:
                "Where a delay would prejudice clients or the public, the FSCA may act first and afford the opportunity to make representations afterwards.",
                incorrect:
                "Normally representations come first, but where delay would prejudice clients/public the FSCA may suspend/withdraw immediately and hear representations after.",
              },
            },
          ],
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════════
    // UNIT 3 - KEY INDIVIDUALS & REPRESENTATIVES
    // ═══════════════════════════════════════════════════════════════════════
    {
      id: "re5-unit-3",
      title: "Key Individuals & Representatives",
      description:
      "Roles and responsibilities, the representatives register, supervision, and debarment",
      lessons: [
        {
          id: "re5-l3-roles",
          title: "Representatives, KIs & the Register",
          steps: [
            {
              type: "info",
              title: "The Register of Representatives",
              content:
              "<p>Every FSP must maintain an up-to-date <strong>register of its representatives and key individuals</strong>, including the categories/subcategories each is authorised for and whether they work under supervision.</p><p>The FSP must update the register whenever a representative is appointed or leaves, and must keep it available for the FSCA. Any changes (appointments/terminations) must be reflected promptly - the FSP must update within <strong>15 days</strong> of the change.</p>",
            },
            {
              type: "info",
              title: "Who Is Responsible for What",
              content:
              "<p>The <strong>FSP</strong> is ultimately accountable for its representatives' conduct in rendering services. The <strong>Key Individual</strong> must manage and oversee those services. A <strong>representative</strong> may only render services within the categories the FSP authorised, and must meet fit & proper requirements (or work under supervision until they do).</p><p>Representatives may not render services the FSP itself is not licensed for.</p>",
            },
            {
              type: "fill-blank",
              title: "Updating the Register",
              prompt:
              "An FSP must update its register of representatives within ___ days of a representative being appointed or ceasing to act.",
              correct: 15,
              explanation:
              "The register must be updated within 15 days of the relevant change.",
              feedback: {
                correct: "Correct - 15 days.",
                incorrect:
                "The FSP must update the representatives register within 15 days of the change.",
              },
            },
            {
              type: "mcq",
              question:
              "A newly appointed representative has not yet passed the RE5 or completed the required qualification. May they render advice?",
              options: [
                "No, they may render no services until fully competent",
                "Yes, under supervision and within the DOFA competency timelines",
                "Yes, without restriction, because the FSP itself is licensed",
                "Yes, provided the client signs a written waiver first",
              ],
              correct: 1,
              feedback: {
                correct:
                "New entrants may work under supervision while completing the RE and qualification within the timelines measured from their date of first appointment (DOFA).",
                incorrect:
                "New representatives may act under supervision while completing competency requirements within the DOFA-based timelines. It's not a permanent bar, nor a free pass.",
              },
            },
          ],
        },
        {
          id: "re5-l3-debarment",
          title: "Debarment of Representatives",
          steps: [
            {
              type: "info",
              title: "What Debarment Is",
              content:
              "<p><strong>Debarment</strong> is the removal of a person's ability to render financial services. An FSP must debar a representative who no longer meets the fit & proper requirements (e.g. honesty/integrity) or who has materially/seriously contravened the Act.</p><p>Debarment is a serious step: a debarred person cannot be appointed as a representative by any FSP while debarred, and the debarment is recorded and published by the FSCA.</p>",
            },
            {
              type: "info",
              title: "The Debarment Process - Fairness First",
              content:
              "<p>Debarment must follow a <strong>fair process</strong>. The FSP must: give the representative notice of the intention to debar and the reasons; give them a reasonable opportunity to respond/make representations; consider that response; and, if it proceeds, notify the person of the debarment and their right to reconsideration/appeal.</p><p>The FSP must then notify the FSCA and update its register. The FSCA maintains a public record so other FSPs can check before appointing someone.</p>",
            },
            {
              type: "scenario",
              question:
              "An FSP wants to debar a representative it believes committed fraud, but wants to do it quietly by simply removing them from the register without telling them. Is this permitted?",
              options: [
                "Yes, the FSP maintains its own register as it sees fit",
                "No, debarment requires notice, reasons and a chance to respond",
                "Yes, provided the FSCA is notified within 15 days after",
                "Yes, but only where the representative has already resigned",
              ],
              correct: 1,
              feedback: {
                correct:
                "Debarment must be procedurally fair - notice, reasons and an opportunity to be heard - before it takes effect, followed by notification to the FSCA.",
                incorrect:
                "A fair process is mandatory: the representative must get notice, reasons and a chance to respond. The FSP cannot debar secretly.",
              },
            },
            {
              type: "true-false",
              statement:
              "A person who has been debarred by one FSP can immediately be appointed as a representative by another FSP.",
              correct: false,
              feedback: {
                correct:
                "Correct - a debarred person cannot be appointed by any FSP while the debarment stands, which is why the FSCA publishes debarments.",
                incorrect:
                "False. While debarred, the person may not be appointed by any FSP. Debarments are published precisely so FSPs can check.",
              },
            },
          ],
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════════
    // UNIT 4 - FIT & PROPER REQUIREMENTS
    // ═══════════════════════════════════════════════════════════════════════
    {
      id: "re5-unit-4",
      title: "Fit & Proper Requirements",
      description:
      "Honesty & integrity, competence (qualifications, RE, experience, CPD), operational ability, and financial soundness",
      lessons: [
        {
          id: "re5-l4-pillars",
          title: "The Fit & Proper Pillars",
          steps: [
            {
              type: "info",
              title: "The Requirements Everyone Must Meet",
              content:
              "<p>The Determination of Fit & Proper Requirements sets the standards FSPs, KIs and representatives must meet continuously - not just at appointment. The pillars are:</p><ul><li><strong>Honesty, integrity & good standing</strong></li><li><strong>Competence</strong> - qualifications, regulatory exams, experience, and class-of-business / product-specific training</li><li><strong>Continuous Professional Development (CPD)</strong></li><li><strong>Operational ability</strong></li><li><strong>Financial soundness</strong> (where applicable)</li></ul><p>Failing any of these can trigger debarment (for a rep) or licence action (for an FSP).</p>",
            },
            {
              type: "info",
              title: "Honesty, Integrity & Good Standing",
              content:
              "<p>A person may fail this test through, e.g., a conviction for an offence involving dishonesty, being found to have contravened financial-services laws, a prior debarment, dishonesty in the application, or removal from a position of trust.</p><p>This standard is <strong>ongoing</strong> - a representative who becomes dishonest after appointment no longer meets fit & proper and must be dealt with.</p>",
            },
            {
              type: "mcq",
              question:
              "Which of the following is NOT one of the fit & proper requirement pillars?",
              options: [
                "Honesty, integrity and good standing",
                "Competence (qualifications, RE, experience)",
                "Guaranteed minimum investment returns for clients",
                "Operational ability",
              ],
              correct: 2,
              feedback: {
                correct:
                "Correct - there is no 'guaranteed returns' requirement. FAIS regulates conduct, not product performance.",
                incorrect:
                "The pillars are honesty/integrity, competence, CPD, operational ability and financial soundness. Guaranteed returns is not - and could never be - a requirement.",
              },
            },
          ],
        },
        {
          id: "re5-l4-competence-cpd",
          title: "Competence, Exams & CPD",
          steps: [
            {
              type: "info",
              title: "Qualifications, Regulatory Exams & DOFA",
              content:
              "<p>Competence is measured from the <strong>Date of First Appointment (DOFA)</strong>. A representative must: complete the required recognised qualification (generally within <strong>six years</strong> of DOFA), pass the relevant <strong>regulatory examination (RE5)</strong> (generally within the required period from DOFA), and complete <strong>class-of-business</strong> and <strong>product-specific training</strong> before rendering advice in that product.</p><p>Until these are met, the person works under <strong>supervision</strong>.</p>",
            },
            {
              type: "info",
              title: "Continuous Professional Development (CPD)",
              content:
              "<p>CPD keeps competence current. It is measured over a <strong>CPD cycle running 1 June to 31 May</strong>. The number of hours depends on how many classes of business/subclasses the person is authorised for and their complexity - commonly 6, 12 or up to 18 hours per cycle.</p><p>CPD activities must be verifiable and relevant. Product-specific training does <strong>not</strong> count as CPD.</p>",
            },
            {
              type: "fill-blank",
              title: "The CPD Cycle",
              prompt:
              "The CPD cycle runs annually from 1 June to 31 May. A representative authorised for a single, low-complexity subclass typically must complete ___ hours of CPD per cycle.",
              correct: 6,
              explanation:
              "A single/low-complexity authorisation typically requires 6 CPD hours; more classes/complexity increases this (up to 18).",
              feedback: {
                correct: "Correct - 6 hours for the simplest case.",
                incorrect:
                "The minimum for a single low-complexity subclass is typically 6 hours; it rises with more classes/complexity.",
              },
            },
            {
              type: "scenario",
              question:
              "A representative argues that the product-specific training their insurer ran should count toward their CPD hours. Are they correct?",
              options: [
                "Yes - all structured training counts as CPD",
                "No - those are separate competency requirements, not CPD",
                "Yes - but only half of the hours may count",
                "Only if the insurer is a licensed FSP itself",
              ],
              correct: 1,
              feedback: {
                correct:
                "Correct - product-specific and class-of-business training are distinct requirements; they are not CPD. CPD must be separate, verifiable professional development.",
                incorrect:
                "Product-specific training is its own requirement and does not count toward CPD hours. CPD is separate.",
              },
            },
          ],
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════════
    // UNIT 5 - GENERAL CODE OF CONDUCT (PART 1): DUTIES & DISCLOSURE
    // ═══════════════════════════════════════════════════════════════════════
    {
      id: "re5-unit-5",
      title: "General Code of Conduct - Duties & Disclosure",
      description:
      "The general duty to clients, and the disclosures required about the provider, the product supplier and the product",
      lessons: [
        {
          id: "re5-l5-general-duty",
          title: "The General Duty to Clients",
          steps: [
            {
              type: "info",
              title: "The Overarching Standard",
              content:
              "<p>The General Code of Conduct (Board Notice 80 of 2003, as amended) requires a provider to render services <strong>honestly, fairly, with due skill, care and diligence, and in the interests of clients and the integrity of the industry</strong>.</p><p>This is the lens for every specific rule that follows: disclosure, suitability, record-keeping and conflict management all serve this duty.</p>",
            },
            {
              type: "info",
              title: "Disclosure Must Be Clear & Timely",
              content:
              "<p>Information must be provided to the client in a way that is <strong>factually correct; clear and not misleading; provided timeously</strong> so the client can make an informed decision; and (for key facts) confirmable in writing. Where a disclosure is made orally, it must be confirmed in writing within a reasonable time.</p><p>The client must never be pressured; disclosures must give a balanced view including material risks.</p>",
            },
            {
              type: "mcq",
              question:
              "Under the General Code, information given to a client must be all of the following EXCEPT:",
              options: [
                "Factually correct",
                "Clear and not misleading",
                "Provided timeously so the client can make an informed decision",
                "Framed to always present the product in the most favourable light",
              ],
              correct: 3,
              feedback: {
                correct:
                "Correct - disclosure must be balanced and not misleading, including material risks. It must not be spun to always flatter the product.",
                incorrect:
                "Disclosure must be correct, clear/not misleading and timely - and balanced. Presenting the product only favourably would be misleading, which is prohibited.",
              },
            },
          ],
        },
        {
          id: "re5-l5-three-disclosures",
          title: "Provider, Supplier & Product Disclosure",
          steps: [
            {
              type: "info",
              title: "Three Buckets of Disclosure",
              content:
              "<p>The Code requires disclosure about three things:</p><ul><li><strong>The provider</strong> - name, physical/postal address, contact details, licence category, whether they act under supervision, professional indemnity position, and complaints/compliance contact details.</li><li><strong>The product supplier</strong> - name and contact details, the nature of the relationship, and any conditions or restrictions.</li><li><strong>The product</strong> - its nature, material terms, fees, charges, penalties, and material risks, plus any commission/remuneration the provider earns.</li></ul>",
            },
            {
              type: "info",
              title: "Remuneration & Commission Must Be Disclosed",
              content:
              "<p>Clients must be told what the provider earns - commission, fees, or other remuneration - and the basis for it. Concealing or misrepresenting remuneration is a serious breach.</p><p>Where a fee is negotiated with the client, it must be agreed in writing and the client must be able to stop it.</p>",
            },
            {
              type: "scenario",
              question:
              "A representative recommends a policy but does not mention the 3% commission they will earn, saying 'the client only cares about the product'. Which principle is breached?",
              options: [
                "None, commission arrangements stay confidential",
                "The duty to disclose remuneration and manage conflicts",
                "The record-keeping requirement under the Code",
                "The financial soundness fit and proper pillar",
              ],
              correct: 1,
              feedback: {
                correct:
                "Commission/remuneration must be disclosed. Hiding it also raises a conflict-of-interest issue that must be managed and disclosed.",
                incorrect:
                "The Code requires disclosure of remuneration/commission and management of the conflict of interest it creates. Concealing it is a breach.",
              },
            },
            {
              type: "true-false",
              statement:
              "If a required disclosure is made to the client orally, the provider must confirm the disclosure to the client in writing within a reasonable time.",
              correct: true,
              feedback: {
                correct:
                "Correct - oral disclosures of key information must be confirmed in writing within a reasonable time.",
                incorrect:
                "It is true. The Code requires oral disclosures to be confirmed in writing within a reasonable time.",
              },
            },
          ],
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════════
    // UNIT 6 - GENERAL CODE (PART 2): SUITABILITY, RECORDS, CONFLICTS
    // ═══════════════════════════════════════════════════════════════════════
    {
      id: "re5-unit-6",
      title: "General Code - Suitability, Records & Conflicts",
      description:
      "Needs analysis and suitable advice, the record of advice, record-keeping, conflict-of-interest management, advertising and replacement of products",
      lessons: [
        {
          id: "re5-l6-suitability",
          title: "Suitable Advice & the Record of Advice",
          steps: [
            {
              type: "info",
              title: "The Suitability Analysis",
              content:
              "<p>Before giving advice, a provider must take reasonable steps to do a <strong>needs analysis</strong>: gather information about the client's financial situation, needs, objectives and risk profile; and conduct a suitability analysis so the advice is appropriate to the client's circumstances.</p><p>If the client refuses to provide information, or the provider gives limited-scope advice, this must be recorded and the client warned of the limitations and risks.</p>",
            },
            {
              type: "info",
              title: "The Record of Advice",
              content:
              "<p>When advice is given, the provider must keep a <strong>record of advice</strong> that reflects: the client's needs/objectives considered, the products/options considered, and the basis on which the recommendation was made (why this product suits this client).</p><p>The record must be given to the client and retained by the provider.</p>",
            },
            {
              type: "scenario",
              question:
              "A client insists on buying a high-risk product that does not match their stated conservative risk profile, after being warned. What must the provider do?",
              options: [
                "Decline the instruction, as the Code prohibits the sale",
                "Proceed, recording the instruction and the warnings given",
                "Amend the risk profile so the product appears suitable",
                "Proceed without comment, since the client has chosen",
              ],
              correct: 1,
              feedback: {
                correct:
                "Where a client acts against advice, the provider must record the fact, the client's instruction and that the risks/mismatch were disclosed.",
                incorrect:
                "The provider records the mismatch, the warning given, and the client's instruction to proceed against advice - never falsify the risk profile.",
              },
            },
            {
              type: "true-false",
              statement:
              "If a provider gives advice on a narrower basis than a full needs analysis (limited-scope advice), it need not tell the client about any limitations.",
              correct: false,
              feedback: {
                correct:
                "Correct - the client must be informed of the limitations and any resulting risks of limited-scope advice.",
                incorrect:
                "False. Limited-scope advice requires the provider to warn the client of the limitations and the risks that may result.",
              },
            },
          ],
        },
        {
          id: "re5-l6-records-coi",
          title: "Record-Keeping, Conflicts & Advertising",
          steps: [
            {
              type: "info",
              title: "Record-Keeping: Five Years",
              content:
              "<p>Providers must keep records of transactions, advice, disclosures and communications. The general retention period is <strong>five years</strong>. Records must be kept in a manner that allows them to be retrieved and, where destroyed, must not be destroyed before the period ends.</p><p>Records of complaints must likewise be kept for five years.</p>",
            },
            {
              type: "info",
              title: "Conflict of Interest Management",
              content:
              "<p>Every FSP must adopt and maintain a <strong>Conflict of Interest (COI) Management Policy</strong>. A conflict is any situation where the provider's interests may influence advice against the client's interests - e.g. commission, ownership interests, or incentives.</p><p>The FSP must identify, avoid or mitigate, and <strong>disclose</strong> conflicts to clients. It may not offer or receive a <strong>financial interest</strong> to a rep for giving preference to a quantity of business over quality, or to a specific product supplier.</p>",
            },
            {
              type: "info",
              title: "Advertising & Direct Marketing",
              content:
              "<p>Advertisements must not be misleading; they must include required cautionary information and must not create unrealistic expectations. In direct marketing, the provider must disclose their identity, purpose, and the client's rights (including cooling-off where applicable) at the start of the contact.</p>",
            },
            {
              type: "fill-blank",
              title: "Retention Period",
              prompt:
              "The General Code requires a provider to keep records (including records of advice and of complaints) for a minimum of ___ years.",
              correct: 5,
              explanation: "The standard record-retention period is five years.",
              feedback: {
                correct: "Correct - five years.",
                incorrect:
                "The minimum record-retention period under the Code is five years.",
              },
            },
            {
              type: "mcq",
              question:
              "Which arrangement is expressly restricted by the conflict-of-interest rules?",
              options: [
                "Maintaining a written conflict-of-interest policy",
                "Disclosing commission earned to the client",
                "Paying a representative for volume over quality of business",
                "Conducting a documented client needs analysis",
              ],
              correct: 2,
              feedback: {
                correct:
                "Rewarding volume over quality (or steering to a particular supplier) via a financial interest is precisely what the COI rules restrict.",
                incorrect:
                "The restricted arrangement is paying a financial interest that rewards quantity of business over quality. The others are required good practice.",
              },
            },
          ],
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════════
    // UNIT 7 - COMPLAINTS, TCF & THE FAIS OMBUD
    // ═══════════════════════════════════════════════════════════════════════
    {
      id: "re5-unit-7",
      title: "Complaints, TCF & the FAIS Ombud",
      description:
      "Treating Customers Fairly, internal complaints handling, and the jurisdiction and process of the FAIS Ombud",
      lessons: [
        {
          id: "re5-l7-tcf-complaints",
          title: "TCF & Internal Complaints",
          steps: [
            {
              type: "info",
              title: "The Six TCF Outcomes",
              content:
              "<p><strong>Treating Customers Fairly (TCF)</strong> is an outcomes-based approach. The six outcomes: (1) customers are confident they are dealt with fairly; (2) products/services are designed to meet the needs of identified customer groups; (3) customers are given clear information and kept informed; (4) advice is suitable to circumstances; (5) products perform as customers were led to expect; (6) no unreasonable post-sale barriers to change product, switch provider, submit a claim or complain.</p>",
            },
            {
              type: "info",
              title: "Internal Complaints Handling",
              content:
              "<p>An FSP must maintain a documented <strong>internal complaints procedure</strong>: it must be accessible to clients, resolve complaints fairly and promptly, and keep records of complaints and their outcomes for five years.</p><p>If a complaint is not resolved to the client's satisfaction, the client must be told of their right to refer the matter to the <strong>FAIS Ombud</strong>, and how.</p>",
            },
            {
              type: "true-false",
              statement:
              "TCF Outcome 6 requires that customers do not face unreasonable barriers to switch product, change provider, submit a claim or make a complaint.",
              correct: true,
              feedback: {
                correct:
                "Correct - Outcome 6 targets unreasonable post-sale barriers.",
                incorrect:
                "It is true. Outcome 6 is specifically about removing unreasonable post-sale barriers.",
              },
            },
          ],
        },
        {
          id: "re5-l7-ombud",
          title: "The FAIS Ombud: Jurisdiction & Process",
          steps: [
            {
              type: "info",
              title: "What the Ombud Does",
              content:
              "<p>The <strong>FAIS Ombud</strong> (the Ombud for Financial Services Providers) resolves complaints by clients against FSPs/representatives fairly, economically and expeditiously. The Ombud can investigate, mediate and make a <strong>determination</strong> that has the effect of a court order.</p><p>The Ombud's monetary jurisdiction is limited: it may award compensation up to <strong>R3.5 million</strong> for a single complaint (a complainant may abandon the amount above this to stay within jurisdiction).</p><p><strong>Note:</strong> the Ombud Council Rules that took effect on <strong>1 July 2024</strong> raised this limit from R800 000 to R3 500 000. Older study material still quotes R800 000 - the current figure is R3.5 million.</p>",
            },
            {
              type: "info",
              title: "The Process & Time Limits",
              content:
              "<p>Ordinarily a client must first complain to the FSP, which has <strong>six weeks</strong> to resolve it. If unresolved (or the client is not satisfied), the client has <strong>six months</strong> thereafter to refer the matter to the Ombud.</p><p>The Ombud may decline matters that are older than <strong>three years</strong> (from when the client became aware, or ought to have become aware, of the facts), that are being/have been heard by a court, or that are more appropriately dealt with elsewhere.</p>",
            },
            {
              type: "fill-blank",
              title: "Ombud Jurisdiction",
              prompt:
              "Since 1 July 2024, the FAIS Ombud may award compensation for a single complaint up to a maximum of R___ .",
              correct: 3500000,
              explanation:
              "The Ombud's monetary jurisdiction cap for a single complaint is R3 500 000 (raised from R800 000 on 1 July 2024).",
              feedback: {
                correct: "Correct - R3 500 000.",
                incorrect:
                "The cap is R3 500 000 since 1 July 2024; amounts above may be abandoned to stay in jurisdiction.",
              },
            },
            {
              type: "scenario",
              question:
              "A client complained to their FSP in writing 8 weeks ago and received no resolution. What is the correct next step?",
              options: [
                "They must wait a full year before escalating",
                "The six weeks has passed, so they may go to the FAIS Ombud",
                "They must first obtain a High Court ruling",
                "The right to complain lapses after six weeks",
              ],
              correct: 1,
              feedback: {
                correct:
                "The FSP had six weeks; that has lapsed unresolved, so the client may now take it to the Ombud, within six months.",
                incorrect:
                "After the FSP's six-week window lapses unresolved, the client may refer to the Ombud (within six months). No court step is required first.",
              },
            },
            {
              type: "mcq",
              question:
              "Which complaint would the FAIS Ombud most likely DECLINE to entertain?",
              options: [
                "A complaint about unsuitable advice given 18 months ago",
                "A complaint where the client suffered R50 000 loss from poor advice",
                "A complaint about facts the client became aware of more than three years ago",
                "A complaint the FSP failed to resolve within six weeks",
              ],
              correct: 2,
              feedback: {
                correct:
                "The three-year prescription period means the Ombud may decline matters where the client knew (or should have known) the facts more than three years ago.",
                incorrect:
                "The likely decline is the one older than three years (prescription). The others are within the Ombud's normal scope.",
              },
            },
          ],
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════════
    // UNIT 8 - FICA & ANTI-MONEY-LAUNDERING
    // ═══════════════════════════════════════════════════════════════════════
    {
      id: "re5-unit-8",
      title: "FICA & Anti-Money-Laundering",
      description:
      "The Financial Intelligence Centre Act as it applies to FSPs: customer due diligence, reporting, the RMCP and record-keeping",
      lessons: [
        {
          id: "re5-l8-fica",
          title: "FICA Obligations for FSPs",
          steps: [
            {
              type: "info",
              title: "What FICA Requires",
              content:
              "<p>The <strong>Financial Intelligence Centre Act 38 of 2001 (FICA)</strong> combats money laundering and terrorist financing. Many FSPs are <strong>accountable institutions</strong> and must:</p><ul><li>Conduct <strong>customer due diligence (CDD/KYC)</strong> - identify and verify clients (and beneficial owners) before/while establishing a business relationship;</li><li>Keep a <strong>Risk Management and Compliance Programme (RMCP)</strong>;</li><li>Report certain transactions to the Financial Intelligence Centre (FIC);</li><li>Keep records; and train staff.</li></ul>",
            },
            {
              type: "info",
              title: "Reporting to the FIC",
              content:
              "<p>Accountable institutions must report to the FIC: <strong>suspicious and unusual transactions (STRs)</strong>, <strong>cash transactions above the prescribed threshold (CTRs)</strong>, and <strong>terrorist-property reports</strong>. A person may not 'tip off' a client that a suspicious transaction report has been or will be made.</p><p>Records under FICA are generally kept for <strong>five years</strong> (from the end of the relationship or the date of the transaction).</p>",
            },
            {
              type: "mcq",
              question:
              "A representative suspects a client's large cash deposits are the proceeds of crime. Under FICA they must:",
              options: [
                "Ask the client to explain the deposits before reporting",
                "File a suspicious transaction report with the FIC, without tipping off",
                "Report the matter to the FSCA as a conduct breach",
                "Terminate the relationship and destroy the client records",
              ],
              correct: 1,
              feedback: {
                correct:
                "The obligation is to report the suspicion to the FIC via an STR, and it is an offence to tip off the client.",
                incorrect:
                "You must file an STR with the FIC and must not tip off the client. Reporting to the FSCA or the police is not a substitute.",
              },
            },
            {
              type: "true-false",
              statement:
              "Under FICA it is permissible to inform a client that you have filed a suspicious transaction report about them, as a courtesy.",
              correct: false,
              feedback: {
                correct:
                "Correct - 'tipping off' is prohibited and is an offence under FICA.",
                incorrect:
                "False. Tipping off a client about an STR is an offence under FICA.",
              },
            },
            {
              type: "fill-blank",
              title: "FICA Record-Keeping",
              prompt:
              "FICA generally requires accountable institutions to keep records for at least ___ years.",
              correct: 5,
              explanation:
              "FICA record-keeping is generally a minimum of five years.",
              feedback: {
                correct: "Correct - five years.",
                incorrect:
                "FICA records are generally kept for a minimum of five years.",
              },
            },
          ],
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════════
    // UNIT 9 - TOPIC PRACTICE QUIZZES (exam-style, no teaching)
    // ═══════════════════════════════════════════════════════════════════════
    {
      id: "re5-unit-9",
      title: "Topic Practice Quizzes",
      description:
      "Fast, exam-difficulty drills on each knowledge area - do these once the teaching units feel solid",
      lessons: [
        {
          id: "re5-quiz-framework",
          title: "Quiz: Framework & Definitions",
          steps: [
            {
              type: "mcq",
              question:
              "Which statement about the FAIS Act is correct?",
              options: [
                "It guarantees the performance of approved financial products",
                "It regulates the conduct of those who render financial services",
                "It sets interest rates for financial products",
                "It only applies to long-term insurance",
              ],
              correct: 1,
              feedback: {
                correct: "FAIS is conduct regulation for advice and intermediary services.",
                incorrect: "FAIS regulates conduct - how services are rendered - not product performance or pricing.",
              },
            },
            {
              type: "mcq",
              question:
              "A recommendation that a client REPLACE an existing policy with a new one is:",
              options: ["An intermediary service, since no new product is designed", "Advice", "Neither, as replacements are excluded from the definition", "Advice only where the client accepts the recommendation"],
              correct: 1,
              feedback: {
                correct: "A recommendation to buy, replace or terminate a product is advice.",
                incorrect: "Recommending replacement is a recommendation of a financial nature - advice.",
              },
            },
            {
              type: "mcq",
              question:
              "Which of the following is NOT excluded from the definition of 'advice'?",
              options: [
                "Factual information about a product's terms with no recommendation",
                "An objective display of product information",
                "A specific recommendation to buy a particular unit trust",
                "General information explaining how a product type works",
              ],
              correct: 2,
              feedback: {
                correct: "A specific recommendation to buy IS advice - it is not excluded.",
                incorrect: "The specific recommendation to buy is advice. The others are excluded factual/objective information.",
              },
            },
            {
              type: "mcq",
              question:
              "The market-conduct regulator that licenses FSPs is the:",
              options: ["Prudential Authority", "SARB Monetary Policy Committee", "Financial Sector Conduct Authority (FSCA)", "FAIS Ombud"],
              correct: 2,
              feedback: {
                correct: "The FSCA is the conduct regulator that licenses and supervises FSPs.",
                incorrect: "It's the FSCA. The Prudential Authority handles soundness; the Ombud resolves complaints.",
              },
            },
          ],
        },
        {
          id: "re5-quiz-fitproper-code",
          title: "Quiz: Fit & Proper + Code of Conduct",
          steps: [
            {
              type: "mcq",
              question: "Which is NOT a fit & proper pillar?",
              options: ["Financial soundness", "Operational ability", "Guaranteed investment performance", "Honesty and integrity"],
              correct: 2,
              feedback: {
                correct: "There is no 'guaranteed performance' requirement.",
                incorrect: "Guaranteed performance is not a pillar. The pillars are honesty/integrity, competence, CPD, operational ability, financial soundness.",
              },
            },
            {
              type: "mcq",
              question: "The CPD cycle for representatives runs from:",
              options: ["1 January to 31 December", "1 March to 28/29 February", "1 June to 31 May", "1 July to 30 June"],
              correct: 2,
              feedback: {
                correct: "The CPD cycle runs 1 June to 31 May.",
                incorrect: "It runs 1 June to 31 May.",
              },
            },
            {
              type: "mcq",
              question:
              "Under the General Code, information provided to a client must be:",
              options: [
                "Factually correct, clear, not misleading and provided timeously",
                "Provided in writing only, to preserve an audit trail",
                "Confirmed to the client after the transaction is concluded",
                "Focused on the benefits, with risks supplied on request",
              ],
              correct: 0,
              feedback: {
                correct: "Correct - factually correct, clear, not misleading and timely.",
                incorrect: "Disclosure must be factually correct, clear, not misleading and provided timeously.",
              },
            },
            {
              type: "mcq",
              question:
              "An FSP must retain records of advice and complaints for at least:",
              options: ["1 year", "3 years", "5 years", "10 years"],
              correct: 2,
              feedback: {
                correct: "Five years is the standard retention period.",
                incorrect: "The standard retention period is five years.",
              },
            },
            {
              type: "mcq",
              question:
              "A conflict-of-interest management policy must, at minimum, address how the FSP will:",
              options: [
                "Maximise commission income",
                "Identify, avoid or mitigate, and disclose conflicts of interest",
                "Hide conflicts from clients to avoid alarming them",
                "Pay representatives for volume of sales",
              ],
              correct: 1,
              feedback: {
                correct: "Identify, avoid/mitigate, and disclose - that's the COI policy's job.",
                incorrect: "A COI policy identifies, avoids/mitigates and discloses conflicts. The others describe the very behaviour it exists to prevent.",
              },
            },
          ],
        },
        {
          id: "re5-quiz-ombud-fica",
          title: "Quiz: Ombud, Complaints & FICA",
          steps: [
            {
              type: "mcq",
              question: "The FAIS Ombud's maximum award for a single complaint is:",
              options: ["R800 000", "R1 million", "R3.5 million", "Unlimited"],
              correct: 2,
              feedback: {
                correct: "R3.5 million - raised from R800 000 on 1 July 2024.",
                incorrect: "The cap is R3.5 million. R800 000 was the old limit, replaced on 1 July 2024.",
              },
            },
            {
              type: "mcq",
              question:
              "After lodging a written complaint, how long does the FSP have to resolve it before the client may approach the Ombud?",
              options: ["48 hours", "2 weeks", "6 weeks", "6 months"],
              correct: 2,
              feedback: {
                correct: "The FSP has six weeks to resolve the complaint.",
                incorrect: "The FSP has six weeks; after that the client may go to the Ombud (within six months).",
              },
            },
            {
              type: "mcq",
              question:
              "The Ombud may generally decline a complaint if the client became aware of the facts more than:",
              options: ["6 months ago", "1 year ago", "3 years ago", "5 years ago"],
              correct: 2,
              feedback: {
                correct: "The three-year prescription period applies.",
                incorrect: "The prescription period is three years from awareness of the facts.",
              },
            },
            {
              type: "mcq",
              question:
              "Under FICA, on suspecting money laundering, a representative must:",
              options: [
                "Advise the client that a report is being filed",
                "File a suspicious transaction report with the FIC, without tipping off",
                "Refer the matter to the FSCA before reporting to the FIC",
                "End the relationship immediately and make no report",
              ],
              correct: 1,
              feedback: {
                correct: "File an STR with the FIC; tipping off is an offence.",
                incorrect: "File an STR with the FIC and don't tip off the client.",
              },
            },
            {
              type: "mcq",
              question: "A debarred representative may:",
              options: [
                "Be appointed by another FSP once 12 months have passed",
                "Not be appointed as a representative by any FSP while it stands",
                "Continue rendering services under supervision of a key individual",
                "Be appointed as a key individual, but not as a representative",
              ],
              correct: 1,
              feedback: {
                correct: "While debarred, no FSP may appoint them - hence public debarment records.",
                incorrect: "A debarred person cannot be appointed by any FSP while debarred.",
              },
            },
          ],
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════════
    // UNIT 10 - MOCK EXAM A (server-delivered)
    {
      id: "re5-unit-10",
      title: "Mock Exam A",
      description:
        "A full 50-question mock at real RE5 difficulty. Give yourself 2 hours, no notes. Published pass mark: 65%; you need 33 of 50 correct.",
      lessons: [
        {
          id: "re5-mock-a",
          title: "Mock Exam A - 50 Questions",
          secureQuestionCount: 50,
        },
      ],
    },

    // UNIT 11 - MOCK EXAM B (server-delivered)
    {
      id: "re5-unit-11",
      title: "Mock Exam B",
      description:
        "A second full 50-question mock with a different paper drawn and shuffled for each server-owned attempt.",
      lessons: [
        {
          id: "re5-mock-b",
          title: "Mock Exam B - 50 Questions",
          secureQuestionCount: 50,
        },
      ],
    },
  ],
};

// EXPORT - merged into the app's course list in content.ts
// ─────────────────────────────────────────────────────────────────────────────
export const RE5_COURSES: Course[] = [RE5_COURSE];
