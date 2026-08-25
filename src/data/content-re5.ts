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
// • Pass mark: 33 of 50 correct (66%)
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

import type { Course, LessonStep } from "./content";

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
    // UNIT 10 - MOCK EXAM A (50 questions, timed conditions)
    // ═══════════════════════════════════════════════════════════════════════
    {
      id: "re5-unit-10",
      title: "Mock Exam A",
      description:
      "A full 50-question mock at real RE5 difficulty. Give yourself 2 hours, no notes. Pass mark: 33 of 50 (66%).",
      lessons: [
        {
          id: "re5-mock-a",
          title: "Mock Exam A - 50 Questions",
          steps: [
            { type: "info", title: "Exam Conditions", content: "<p><strong>50 questions · 2 hours · closed book · 33 of 50 to pass (66%).</strong></p><p>No notes, no breaks. Read every option - several questions use 'EXCEPT', 'NOT', and precise time periods and amounts, exactly like the real exam. Options are deliberately close together: expect to eliminate two quickly and then work to separate the last two. Mark your score at the end: 33+ is a pass.</p>" },
            { type: "mcq", question: "Q1. The primary purpose of the FAIS Act is to:", options: ["To guarantee the performance of regulated products", "To regulate the rendering of advice and intermediary services", "To set prudential capital requirements for product suppliers", "To approve the products that FSPs may distribute"], correct: 1, feedback: { correct: "FAIS regulates advice and intermediary services.", incorrect: "FAIS regulates the rendering of advice and intermediary services." } },
            { type: "mcq", question: "Q2. 'Advice' under FAIS includes all of the following EXCEPT:", options: ["A recommendation to buy a product", "A proposal to replace a policy", "Purely factual information with no recommendation", "Guidance on terminating a product"], correct: 2, feedback: { correct: "Factual information without a recommendation is excluded from 'advice'.", incorrect: "Factual information with no recommendation is not advice." } },
            { type: "mcq", question: "Q3. Submitting a client's application form to an insurer is best classified as:", options: ["Advice, because the form reflects a recommendation", "An intermediary service", "Neither, as administration falls outside FAIS", "Advice, unless the client completed the form unaided"], correct: 1, feedback: { correct: "It's an intermediary service.", incorrect: "Acting to conclude/maintain a product (not a recommendation) is an intermediary service." } },
            { type: "mcq", question: "Q4. The person who manages or oversees an FSP's financial services is the:", options: ["Representative", "Key Individual", "Compliance officer", "Ombud"], correct: 1, feedback: { correct: "The Key Individual.", incorrect: "The Key Individual manages/oversees the services." } },
            { type: "mcq", question: "Q5. Which category of FSP exercises investment discretion on a client's behalf?", options: ["Category I", "Category II", "Category III", "Category IV"], correct: 1, feedback: { correct: "Category II - discretionary.", incorrect: "Discretionary FSPs are Category II." } },
            { type: "mcq", question: "Q6. An FSP administers investments (e.g. a LISP). Which category?", options: ["Category I", "Category II", "Category III", "Category IV"], correct: 2, feedback: { correct: "Category III - administrative FSP.", incorrect: "Administrative FSPs are Category III." } },
            { type: "mcq", question: "Q7. The FSCA may withdraw a licence where the FSP:", options: ["Earns commission", "No longer meets fit & proper requirements", "Advertises its services", "Employs more than 10 representatives"], correct: 1, feedback: { correct: "Failing fit & proper is a ground for withdrawal.", incorrect: "Ceasing to meet fit & proper is a ground to suspend/withdraw." } },
            { type: "mcq", question: "Q8. Before suspending a licence, the FSCA must normally:", options: ["Suspend immediately and notify afterwards", "Give notice and an opportunity to make representations", "First obtain a High Court order authorising it", "Refer the matter to the FAIS Ombud for a ruling"], correct: 1, feedback: { correct: "Notice and representations, unless urgent client risk.", incorrect: "Normally notice + representations, unless a delay would prejudice clients/public." } },
            { type: "mcq", question: "Q9. An FSP must update its register of representatives within:", options: ["24 hours", "15 days", "6 weeks", "6 months"], correct: 1, feedback: { correct: "15 days.", incorrect: "The register must be updated within 15 days." } },
            { type: "mcq", question: "Q10. A new representative who has not yet passed RE5 may render advice:", options: ["Not at all, until the examination is passed", "Only under supervision within the DOFA timelines", "Without restriction, since the FSP holds the licence", "Only on products in a single subclass"], correct: 1, feedback: { correct: "Under supervision within the DOFA-based timelines.", incorrect: "They may act under supervision while completing competency within DOFA timelines." } },
            { type: "mcq", question: "Q11. Debarment of a representative requires:", options: ["Only the FSCA's prior written approval", "A fair process: notice, reasons and a chance to respond", "A determination by the FAIS Ombud confirming the conduct", "A criminal conviction on the underlying misconduct"], correct: 1, feedback: { correct: "A procedurally fair process is required.", incorrect: "Notice, reasons and an opportunity to be heard are required." } },
            { type: "mcq", question: "Q12. A debarred person may be appointed by another FSP:", options: ["Immediately, if the new FSP accepts the risk", "After 12 months have elapsed", "Not while the debarment stands", "Once the FSCA has been notified"], correct: 2, feedback: { correct: "Not while debarred.", incorrect: "No FSP may appoint them while the debarment stands." } },
            { type: "mcq", question: "Q13. Which is NOT a fit & proper pillar?", options: ["Honesty and integrity", "Competence", "Financial soundness", "Political affiliation"], correct: 3, feedback: { correct: "Political affiliation is irrelevant.", incorrect: "Political affiliation is not a pillar." } },
            { type: "mcq", question: "Q14. A recognised qualification must generally be completed within how long of DOFA?", options: ["2 years", "3 years", "6 years", "10 years"], correct: 2, feedback: { correct: "Generally six years.", incorrect: "The qualification is generally required within six years of DOFA." } },
            { type: "mcq", question: "Q15. Which does NOT count toward CPD hours?", options: ["Attending an accredited seminar", "Completing a relevant online course", "Product-specific training", "A relevant workshop"], correct: 2, feedback: { correct: "Product-specific training is a separate requirement, not CPD.", incorrect: "Product-specific training does not count as CPD." } },
            { type: "mcq", question: "Q16. The overarching duty in the General Code is to act:", options: ["In the interests of the FSP and the integrity of the industry", "Honestly, fairly, with due skill, care and diligence", "In strict accordance with the client's instructions at all times", "So as to secure the best available return for the client"], correct: 1, feedback: { correct: "Honestly, fairly, with due skill, care and diligence.", incorrect: "The duty is honesty, fairness, due skill/care/diligence, in clients' interests." } },
            { type: "mcq", question: "Q17. Disclosure to a client must be all of these EXCEPT:", options: ["Factually correct and capable of substantiation", "Clear and not misleading", "Provided timeously for an informed decision", "Presented so the recommended product compares most favourably"], correct: 3, feedback: { correct: "It must be balanced, not spun favourably.", incorrect: "Disclosure must be balanced - not framed to always flatter the product." } },
            { type: "mcq", question: "Q18. Which must be disclosed to the client about the provider?", options: ["The provider's professional indemnity cover amount", "Licence category and whether they act under supervision", "The provider's remuneration from all product suppliers", "The provider's most recent FSCA inspection findings"], correct: 1, feedback: { correct: "Licence category and supervision status.", incorrect: "The provider must disclose licence category and supervision status, among other details." } },
            { type: "mcq", question: "Q19. A representative earns 5% commission but does not tell the client. This breaches the duty to:", options: ["Keep proper records of the transaction", "Disclose remuneration and manage conflicts of interest", "Maintain financial soundness as an FSP", "Advertise products fairly and accurately"], correct: 1, feedback: { correct: "Remuneration must be disclosed; the conflict managed.", incorrect: "Commission/remuneration must be disclosed and the conflict managed." } },
            { type: "mcq", question: "Q20. An oral disclosure of key information must be confirmed in writing:", options: ["Only where the client requests it", "Within a reasonable time", "Within 24 hours of the disclosure", "On conclusion of the transaction"], correct: 1, feedback: { correct: "Within a reasonable time.", incorrect: "Oral disclosures of key info must be confirmed in writing within a reasonable time." } },
            { type: "mcq", question: "Q21. Before giving advice, a provider must conduct a:", options: ["Credit assessment under the National Credit Act", "Needs analysis and suitability analysis", "Verification of the client's identity under FICA only", "Risk profile confirmed by the product supplier"], correct: 1, feedback: { correct: "A needs and suitability analysis.", incorrect: "A needs analysis and suitability analysis are required before advice." } },
            { type: "mcq", question: "Q22. If a client acts against the provider's recommendation, the provider should:", options: ["Decline to proceed, as the Code prohibits the transaction", "Record the instruction, the mismatch and the warnings given", "Update the client's risk profile to reflect the choice", "Proceed and note it in the client file within 30 days"], correct: 1, feedback: { correct: "Record the against-advice instruction and warnings.", incorrect: "Record the client's instruction against advice and that risks were disclosed." } },
            { type: "mcq", question: "Q23. A record of advice must reflect:", options: ["The commission earned on the recommendation", "Needs and options considered, and the basis for advice", "The client's identity and contact details", "The product supplier's licence conditions"], correct: 1, feedback: { correct: "Needs, options and basis for the recommendation.", incorrect: "It must reflect needs, options considered and the basis for the recommendation." } },
            { type: "mcq", question: "Q24. General record retention under the Code is:", options: ["1 year", "3 years", "5 years", "7 years"], correct: 2, feedback: { correct: "Five years.", incorrect: "Five years is the standard." } },
            { type: "mcq", question: "Q25. A COI management policy must provide for the FSP to:", options: ["Disclose conflicts only where a client asks about them", "Identify, avoid or mitigate, and disclose conflicts", "Record conflicts internally without client disclosure", "Refer all conflicts to the compliance officer for approval"], correct: 1, feedback: { correct: "Identify, avoid/mitigate and disclose.", incorrect: "It must identify, avoid/mitigate and disclose conflicts." } },
            { type: "mcq", question: "Q26. Which is expressly restricted by COI rules?", options: ["Disclosing commission rates to clients", "Rewarding quantity of business over quality", "Conducting a client needs analysis first", "Keeping records of adviser remuneration"], correct: 1, feedback: { correct: "Rewarding quantity over quality is restricted.", incorrect: "Paying a financial interest for volume over quality is restricted." } },
            { type: "mcq", question: "Q27. Advertising by a provider must:", options: ["Include projected returns based on past performance", "Not be misleading and carry required cautionary information", "Be approved by the FSCA before publication", "Disclose the commission payable on the advertised product"], correct: 1, feedback: { correct: "Not misleading, with required cautions.", incorrect: "Advertising must not mislead and must carry required cautions." } },
            { type: "mcq", question: "Q28. Which is a TCF outcome?", options: ["Products are priced competitively against the market", "Products perform as customers were led to expect", "Advisers earn commission linked to client outcomes", "Complaints are resolved within a prescribed period"], correct: 0, feedback: { correct: "Outcome 5 - products perform as led to expect.", incorrect: "One TCF outcome is that products perform as customers were led to expect." } },
            { type: "mcq", question: "Q29. TCF Outcome 6 concerns:", options: ["Clear and comparable product fee schedules", "No unreasonable barriers to switch, claim or complain", "Faster processing of new business quotes", "Fair commission structures for advisers"], correct: 1, feedback: { correct: "Removing unreasonable post-sale barriers.", incorrect: "Outcome 6 targets unreasonable post-sale barriers." } },
            { type: "mcq", question: "Q30. An FSP's internal complaints records must be kept for:", options: ["6 months", "1 year", "3 years", "5 years"], correct: 3, feedback: { correct: "Five years.", incorrect: "Complaints records are kept for five years." } },
            { type: "mcq", question: "Q31. The FAIS Ombud's maximum award for a single complaint is:", options: ["R800 000", "R1.5 million", "R3.5 million", "Unlimited where loss is proven"], correct: 2, feedback: { correct: "R3.5 million, in force since 1 July 2024.", incorrect: "R3.5 million. R800 000 is the superseded figure still printed in older guides." } },
            { type: "mcq", question: "Q32. Before approaching the Ombud, a client normally complains to the FSP, which has:", options: ["48 hours", "2 weeks", "6 weeks", "12 months"], correct: 2, feedback: { correct: "Six weeks.", incorrect: "The FSP has six weeks to resolve it." } },
            { type: "mcq", question: "Q33. After the FSP's window lapses unresolved, the client must refer to the Ombud within:", options: ["1 week", "6 months", "3 years", "5 years"], correct: 1, feedback: { correct: "Six months.", incorrect: "The client has six months thereafter to refer to the Ombud." } },
            { type: "mcq", question: "Q34. The Ombud may decline a matter where the client became aware of the facts more than:", options: ["6 months ago", "1 year ago", "3 years ago", "7 years ago"], correct: 2, feedback: { correct: "Three years (prescription).", incorrect: "The prescription period is three years." } },
            { type: "mcq", question: "Q35. An Ombud determination has the effect of:", options: ["A recommendation the FSP may accept or decline", "A court order", "A finding referred to the FSCA for enforcement", "An interim ruling pending arbitration"], correct: 1, feedback: { correct: "It has the effect of a court order.", incorrect: "A determination has the effect of a court order." } },
            { type: "mcq", question: "Q36. Under FICA, on suspecting money laundering a representative must:", options: ["Obtain an explanation from the client before reporting", "File an STR with the FIC and not tip off the client", "Report the suspicion to the FSCA within 15 days", "Freeze the account and notify the client in writing"], correct: 1, feedback: { correct: "File an STR; don't tip off.", incorrect: "File an STR with the FIC and don't tip off the client." } },
            { type: "mcq", question: "Q37. 'Tipping off' a client about a suspicious transaction report is:", options: ["Permitted where the client is a long-standing one", "Required where the client asks about delays", "An offence under FICA", "Permitted once the report has been filed"], correct: 2, feedback: { correct: "It is an offence.", incorrect: "Tipping off is an offence under FICA." } },
            { type: "mcq", question: "Q38. FICA records are generally kept for:", options: ["1 year", "3 years", "5 years", "20 years"], correct: 2, feedback: { correct: "Five years.", incorrect: "FICA records: generally five years." } },
            { type: "mcq", question: "Q39. An accountable institution must maintain a:", options: ["Marketing plan only", "Risk Management and Compliance Programme (RMCP)", "Fixed commission schedule", "Public share register"], correct: 1, feedback: { correct: "An RMCP.", incorrect: "FICA requires an RMCP." } },
            { type: "mcq", question: "Q40. Customer due diligence (CDD) primarily involves:", options: ["Assessing whether the client can afford the product", "Identifying and verifying the client and beneficial owner", "Recording the advice given and the basis for it", "Screening the client against the FSP's risk appetite"], correct: 1, feedback: { correct: "Identify and verify the client/beneficial owner.", incorrect: "CDD is identifying and verifying the client and beneficial owner." } },
            { type: "scenario", question: "Q41. A client asks you to invest R2m offshore in a structure you're not licensed to advise on. You should:", options: ["Advise anyway to keep the client", "Decline/refer, since you may only render services within your authorised categories", "Change your licence yourself", "Tell the client it's illegal to invest offshore"], correct: 1, feedback: { correct: "Stay within your authorised categories; refer if needed.", incorrect: "You may only render services within your authorised categories - decline or refer." } },
            { type: "scenario", question: "Q42. A client's risk profile is conservative, but they insist on a speculative product after warnings. Correct action:", options: ["Decline the instruction, as the Code prohibits it", "Proceed and record the against-advice instruction", "Revise the risk profile to reflect the client's appetite", "Proceed only once a second adviser has signed off"], correct: 1, feedback: { correct: "Record the against-advice instruction and warnings.", incorrect: "Record the instruction against advice and that risks were disclosed." } },
            { type: "scenario", question: "Q43. You realise you gave incorrect information about a product's fees last week. You should:", options: ["Say nothing", "Promptly correct it in writing with the client and update records", "Wait for the client to notice", "Cancel the policy without telling the client"], correct: 1, feedback: { correct: "Correct it promptly in writing and update records.", incorrect: "Correct the error promptly and in writing; keep records." } },
            { type: "scenario", question: "Q44. A colleague suggests splitting a client's cash deposit to stay under the FICA cash-reporting threshold. This is:", options: ["Acceptable, as each deposit stays within the limit", "Structuring, an unlawful attempt to evade reporting", "Permitted where the client instructs it in writing", "A conflict of interest requiring disclosure only"], correct: 1, feedback: { correct: "It's unlawful structuring to evade reporting.", incorrect: "Deliberately splitting to avoid the threshold is structuring - unlawful." } },
            { type: "mcq", question: "Q45. A licence LAPSES when, for example, the FSP:", options: ["Fails to submit its annual compliance report", "Is finally liquidated, or for a natural person, dies", "Loses its only authorised key individual", "Ceases to render services for twelve months"], correct: 1, feedback: { correct: "Liquidation/death causes lapsing.", incorrect: "A licence lapses on final liquidation/deregistration or death." } },
            { type: "mcq", question: "Q46. Obligations to clients that arose before a licence was withdrawn:", options: ["Fall away automatically", "Continue despite withdrawal", "Transfer to the Ombud", "Are cancelled by the FSCA"], correct: 1, feedback: { correct: "Pre-existing obligations continue.", incorrect: "Obligations that arose before withdrawal continue." } },
            { type: "mcq", question: "Q47. Which best describes 'financial soundness' as a fit & proper requirement?", options: ["The client must meet a minimum wealth level", "The FSP must not be insolvent or under financial disability", "The FSP must guarantee returns on recommended products", "Commission must cover the FSP's operating costs"], correct: 1, feedback: { correct: "Not insolvent / free of certain financial disabilities.", incorrect: "Financial soundness concerns solvency and the absence of certain financial disabilities." } },
            { type: "mcq", question: "Q48. Rendering financial services without a licence is:", options: ["Permitted for small FSPs", "An offence under FAIS", "Allowed under supervision only", "A civil matter only"], correct: 1, feedback: { correct: "It's an offence.", incorrect: "Acting as an FSP without a licence is an offence." } },
            { type: "scenario", question: "Q49. A client complains in writing; you resolve it fully within 3 weeks to their satisfaction. Must you tell them about the Ombud?", options: ["Yes, the Ombud must be disclosed in every case", "No, that right arises when it is not resolved satisfactorily", "Only where the claimed loss exceeded R3.5 million", "Only once six weeks have passed, regardless of outcome"], correct: 1, feedback: { correct: "The Ombud referral is for unresolved/unsatisfactory outcomes.", incorrect: "You must inform them of the Ombud right when the complaint is not resolved to their satisfaction." } },
            { type: "mcq", question: "Q50. The best one-line summary of a representative's core FAIS duty is to act:", options: ["In the interest of the product supplier", "Honestly, fairly and in the client's best interest, with proper disclosure", "To maximise personal commission", "Only when supervised"], correct: 1, feedback: { correct: "Honestly, fairly, in the client's interest, with disclosure.", incorrect: "Act honestly, fairly and in the client's best interest, with full disclosure." } },
            // The "Score Yourself — count your correct answers" info step that
            // used to close this paper is gone. RE5 is a real FSCA exam and a
            // self-marked number is not one a learner can act on, so the app
            // now marks the paper: see ExamResultView + src/lib/results/.
            // The exam ends on Q50; finishing it opens the marked result.
          ],
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════════
    // UNIT 11 - MOCK EXAM B (50 questions, timed conditions)
    // ═══════════════════════════════════════════════════════════════════════
    {
      id: "re5-unit-11",
      title: "Mock Exam B",
      description:
      "A second full 50-question mock, pitched a step above the real exam: harder distractors, longer scenarios and finer distinctions. 2 hours, no notes. Pass mark: 33 of 50 (66%).",
      lessons: [
        {
          id: "re5-mock-b",
          title: "Mock Exam B - 50 Questions",
          steps: [
            { type: "info", title: "Exam Conditions", content: "<p><strong>50 questions · 2 hours · closed book · 33 of 50 to pass (66%).</strong></p><p>This paper is deliberately harder than the real RE5: longer scenarios, 'EXCEPT/NOT' framing, and distractors that are each defensible until you apply the exact rule. If you clear 33 here, the real paper should feel comfortable. Don't peek at feedback until you've committed to an answer.</p>" },
            { type: "scenario", question: "Q1. A friend asks you, over coffee and without any client relationship, whether Fund X is 'a good buy'. You say 'yes, definitely put your money there.' Does FAIS apply?", options: ["No, because the setting was social and informal", "Yes, a recommendation about a product is advice anywhere", "No, FAIS applies only to advice given in writing", "Only if your friend actually invests the money"], correct: 1, feedback: { correct: "A recommendation about a product is advice, setting aside.", incorrect: "A recommendation of a financial nature is advice regardless of the informal setting." } },
            { type: "mcq", question: "Q2. Which is an intermediary service, not advice?", options: ["Recommending the client switch to a cheaper policy", "Collecting premiums on the insurer's behalf", "Explaining which of two products better suits the client", "Advising the client that cancelling now is unwise"], correct: 1, feedback: { correct: "Collecting premiums is an intermediary service.", incorrect: "Handling premiums for the supplier is an intermediary service, not advice." } },
            { type: "mcq", question: "Q3. The FSCA is best described as the:", options: ["Prudential regulator", "Market-conduct regulator", "Central bank", "Tax authority"], correct: 1, feedback: { correct: "Market-conduct regulator.", incorrect: "The FSCA is the market-conduct regulator." } },
            { type: "mcq", question: "Q4. A Category IV FSP conducts:", options: ["Discretionary management of client portfolios", "Assistance business", "Advice on Category I products under supervision of investments on behalf of clients", "Advice on Category I products under supervision"], correct: 1, feedback: { correct: "Category IV is assistance business.", incorrect: "Category IV = assistance business FSP." } },
            { type: "mcq", question: "Q5. Which is NOT a ground to withdraw an FSP licence?", options: ["Licence obtained by fraud", "Persistent serious contravention of the Act", "The FSP became profitable", "No longer fit & proper"], correct: 2, feedback: { correct: "Profitability is not a ground.", incorrect: "Becoming profitable is not a ground for withdrawal." } },
            { type: "mcq", question: "Q6. A representative's honesty & integrity may be questioned by:", options: ["A dividend payment", "A conviction involving dishonesty", "Passing RE5", "Doing CPD"], correct: 1, feedback: { correct: "A dishonesty conviction is relevant.", incorrect: "A conviction involving dishonesty bears on honesty & integrity." } },
            { type: "mcq", question: "Q7. Competence is measured from the:", options: ["Date the FSP's licence was granted by the FSCA", "Date of First Appointment (DOFA)", "Date the representative passed the RE5 examination", "Date the representative's supervision agreement was signed"], correct: 1, feedback: { correct: "From DOFA.", incorrect: "Competence timelines run from DOFA." } },
            { type: "mcq", question: "Q8. A representative who renders financial services across multiple classes of business must complete CPD hours per cycle of:", options: ["6 hours", "12 hours", "18 hours", "24 hours"], correct: 2, feedback: { correct: "18 hours. The scale is 6 hours for a single subclass, 12 for more than one subclass within a single class, and 18 across multiple classes of business.", incorrect: "18 hours. Remember the scale: 6 (one subclass), 12 (multiple subclasses in one class), 18 (multiple classes of business). The cycle runs 1 June to 31 May and hours do not carry over." } },
            { type: "mcq", question: "Q9. Class-of-business training must be completed:", options: ["Within 12 months of first rendering advice in that class", "Before rendering advice in that class of business", "Before the first CPD cycle following appointment ends", "Only where the representative works without supervision"], correct: 1, feedback: { correct: "Before advising in that class of business.", incorrect: "It must be done before rendering advice in that class of business." } },
            { type: "scenario", question: "Q10. An FSP appoints a representative but forgets to add them to the register for 3 weeks. This breaches the requirement to update within:", options: ["24 hours", "15 days", "6 weeks", "6 months"], correct: 1, feedback: { correct: "15 days - 3 weeks is late.", incorrect: "The register must be updated within 15 days; three weeks is a breach." } },
            { type: "scenario", question: "Q11. A KI discovers a representative lied about their qualifications on appointment. The most appropriate response is to:", options: ["Overlook it while the representative performs well", "Investigate, as they may no longer be fit and proper", "Report the matter directly to the police for arrest", "Move them to an administrative, non-advice role"], correct: 1, feedback: { correct: "Investigate; consider debarment via a fair process.", incorrect: "Dishonesty undermines fit & proper - investigate and follow a fair debarment process if warranted." } },
            { type: "mcq", question: "Q12. In a debarment, the representative is entitled to:", options: ["A hearing before the Financial Services Tribunal first", "Notice, reasons and an opportunity to respond", "Reinstatement if no criminal charge follows within a year", "Written confirmation from the FSCA before it takes effect"], correct: 1, feedback: { correct: "Notice, reasons, opportunity to respond.", incorrect: "They're entitled to notice, reasons and a chance to respond." } },
            { type: "mcq", question: "Q13. After debarring a representative, the FSP must:", options: ["Keep it secret", "Notify the FSCA and update its register", "Refund the client automatically", "Cancel its own licence"], correct: 1, feedback: { correct: "Notify the FSCA and update the register.", incorrect: "The FSP must notify the FSCA and update the register." } },
            { type: "mcq", question: "Q14. Disclosure that is technically true but leaves a misleading overall impression is:", options: ["Permissible, as every statement made is accurate", "A breach, since disclosure must not be misleading", "A breach only where the client suffers actual loss", "Permissible if the full facts appear in the written record"], correct: 1, feedback: { correct: "Misleading-by-omission breaches the Code.", incorrect: "Even literally-true statements that mislead overall breach the Code." } },
            { type: "mcq", question: "Q15. Which must be disclosed about the PRODUCT?", options: ["The commission split between the FSP and the adviser", "Material terms, fees, charges, penalties and risks", "The product supplier's solvency and capital position", "Comparable products from at least two other suppliers"], correct: 1, feedback: { correct: "Material terms, fees, charges, penalties, risks.", incorrect: "Product disclosure covers material terms, fees, charges, penalties and risks." } },
            { type: "mcq", question: "Q16. A fee negotiated directly with a client must be:", options: ["Disclosed once the first payment has been collected", "Agreed in writing and capable of being stopped by the client", "Set within the maximum prescribed by the FSCA", "Fixed for the term and non-refundable once advice is given"], correct: 1, feedback: { correct: "Agreed in writing; the client can stop it.", incorrect: "A negotiated fee must be agreed in writing and the client must be able to stop it." } },
            { type: "scenario", question: "Q17. A client refuses to share income and expense details but wants a full financial plan. You should:", options: ["Decline to act, as advice without full information is prohibited", "Explain the limitation, record the refusal and warn of the risks", "Base the analysis on averages for the client's income band", "Proceed and obtain a signed waiver of the suitability duty"], correct: 1, feedback: { correct: "Record the refusal, give limited-scope advice with warnings.", incorrect: "Record the refusal and warn of the limitations/risks of limited-scope advice." } },
            { type: "mcq", question: "Q18. The record of advice must be:", options: ["Retained by the provider and supplied to the FSCA on request", "Provided to the client and retained by the provider", "Retained internally, with a summary given to the client", "Provided to the client only where advice was declined"], correct: 1, feedback: { correct: "Given to the client and retained.", incorrect: "It must be provided to the client and retained by the provider." } },
            { type: "mcq", question: "Q19. Replacement of one product with another triggers a duty to:", options: ["Settle the original product before disclosing", "Compare and disclose the costs and implications", "Decline the replacement in all circumstances", "Charge the client an early-termination penalty"], correct: 1, feedback: { correct: "Disclose the implications and costs of replacing.", incorrect: "Replacement requires disclosing the costs/implications so the client can decide informed." } },
            { type: "mcq", question: "Q20. Records may be kept electronically provided they are:", options: ["Encrypted from the client forever", "Retrievable and safe for the required period", "Printed and burned", "Stored offshore only"], correct: 1, feedback: { correct: "Retrievable and safe for the required period.", incorrect: "Electronic records are fine if retrievable and kept safe for the required period." } },
            { type: "scenario", question: "Q21. An insurer offers you a free overseas holiday if you sell 50 of its policies this quarter. Accepting this is:", options: ["Acceptable, since it rewards strong performance", "A prohibited interest rewarding volume over quality", "Required under TCF outcomes for adviser incentives", "Permitted as long as you disclose it to clients"], correct: 1, feedback: { correct: "It rewards volume over quality - restricted.", incorrect: "Such incentives reward quantity over quality and fall foul of the COI rules." } },
            { type: "mcq", question: "Q22. A conflict of interest is:", options: ["Any complaint a client lodges against a provider", "A situation where the provider's interest may influence advice", "A licensing category for financial services providers", "A product class defined in the FAIS General Code"], correct: 1, feedback: { correct: "Interest that may sway advice against the client.", incorrect: "It's where the provider's own interest may bias advice against the client." } },
            { type: "mcq", question: "Q23. Which TCF outcome deals with suitable advice?", options: ["Outcome 1", "Outcome 4", "Outcome 6", "Outcome 2"], correct: 1, feedback: { correct: "Outcome 4 - advice suitable to circumstances.", incorrect: "Outcome 4 addresses suitable advice." } },
            { type: "mcq", question: "Q24. An advertisement that promises 'guaranteed 30% returns' is:", options: ["Acceptable if bold", "Misleading and prohibited", "Fine for Category II", "Required disclosure"], correct: 1, feedback: { correct: "Misleading - prohibited.", incorrect: "Promising guaranteed high returns is misleading and prohibited." } },
            { type: "mcq", question: "Q25. In direct marketing, at the START of contact the provider must disclose:", options: ["The commission earned on the product sold", "Their identity, the purpose of the call and client rights", "The full terms and conditions of the product", "The client's ID number for verification"], correct: 1, feedback: { correct: "Identity, purpose and client's rights.", incorrect: "Disclose identity, purpose and the client's rights up front." } },
            { type: "mcq", question: "Q26. The FAIS Ombud resolves complaints:", options: ["Only through formal litigation", "Fairly, economically and expeditiously", "Through binding overseas arbitration", "Only once a court has declined the matter"], correct: 1, feedback: { correct: "Fairly, economically and expeditiously.", incorrect: "The Ombud acts fairly, economically and expeditiously." } },
            { type: "scenario", question: "Q27. A client's loss is R4.2m from poor advice. The Ombud can still determine it if the client:", options: ["First obtains condonation from the FSCA", "Abandons the portion above R3.5 million", "Files the claim against the FSCA instead", "Obtains the respondent's consent to a higher award"], correct: 1, feedback: { correct: "Abandoning the excess above R3.5 million brings it within jurisdiction. (The respondent agreeing in writing to exceed the limit is also possible, but it is the client's own abandonment that is the standard route.)", incorrect: "The client may abandon the amount above R3.5 million to stay within jurisdiction. Note the limit rose from R800 000 on 1 July 2024." } },
            { type: "mcq", question: "Q28. A complaint the Ombud will likely decline is one that:", options: ["Is 12 months old", "Is already before a court", "Involves R50 000", "Was unresolved after 6 weeks"], correct: 1, feedback: { correct: "Matters before a court are declined.", incorrect: "The Ombud declines matters already being heard by a court." } },
            { type: "mcq", question: "Q29. An Ombud determination can be taken on appeal to the:", options: ["FSP's board", "Financial Services Tribunal", "Client's bank", "Product supplier"], correct: 1, feedback: { correct: "The Financial Services Tribunal.", incorrect: "Reconsideration lies to the Financial Services Tribunal." } },
            { type: "mcq", question: "Q30. Complaints procedures must be:", options: ["Submitted to the FSCA for approval before adoption", "Documented and accessible to clients", "Applied only to complaints involving financial loss", "Maintained by the compliance officer for internal use"], correct: 1, feedback: { correct: "Documented and accessible.", incorrect: "They must be documented and accessible to clients." } },
            { type: "mcq", question: "Q31. Under FICA, an FSP that is an accountable institution must NOT:", options: ["Verify client identity before establishing a relationship", "Maintain a Risk Management and Compliance Programme", "Tip off a client that a suspicious transaction report was filed", "Train staff on their FICA obligations"], correct: 2, feedback: { correct: "Tipping off is prohibited.", incorrect: "Tipping off about an STR is prohibited." } },
            { type: "mcq", question: "Q32. Cash transactions above the prescribed threshold must be reported via a:", options: ["STR", "CTR", "COI", "RMCP"], correct: 1, feedback: { correct: "A cash threshold report (CTR).", incorrect: "Above-threshold cash is reported via a CTR." } },
            { type: "mcq", question: "Q33. Beneficial ownership must be established as part of:", options: ["The record of advice compiled after the recommendation", "Customer due diligence", "The FSP's conflict of interest management policy", "The suitability analysis required before advice"], correct: 1, feedback: { correct: "Part of CDD.", incorrect: "Identifying beneficial owners is part of CDD." } },
            { type: "mcq", question: "Q34. If a client refuses to provide FICA identification, the FSP should:", options: ["Proceed, but keep a file note of the refusal", "Not establish or continue the business relationship", "Refer the client to the FAIS Ombud first", "Charge a risk premium and continue as usual"], correct: 1, feedback: { correct: "CDD must be completed; otherwise don't proceed.", incorrect: "Without required CDD info, the relationship should not be established/continued." } },
            { type: "mcq", question: "Q35. To pass the RE5 a candidate must answer at least:", options: ["25 of 50 questions correctly", "30 of 50 questions correctly", "33 of 50 questions correctly", "40 of 50 questions correctly"], correct: 2, feedback: { correct: "33 of 50, which is 66%.", incorrect: "The RE5 requires 33 correct answers out of 50 (66%)." } },
            { type: "mcq", question: "Q36. The RE5 exam consists of:", options: ["25 questions", "50 questions", "80 questions", "100 questions"], correct: 1, feedback: { correct: "50 questions.", incorrect: "RE5 has 50 questions." } },
            { type: "scenario", question: "Q37. You are unsure whether a proposed transaction suits the client. Best practice is to:", options: ["Recommend the product and note your reservation in the file", "Gather more information; recommend only if suitable, else decline or refer", "Present all options and let the client choose without a recommendation", "Refer the client to the product supplier for a suitability decision"], correct: 1, feedback: { correct: "Only recommend if suitable; otherwise decline/refer.", incorrect: "Suitability first - recommend only if suitable, else decline or refer." } },
            { type: "scenario", question: "Q38. A client wants to complain but doesn't know how. You must:", options: ["Resolve it informally without a written record", "Explain the internal process and their Ombud rights", "Refer them to another provider to handle it", "Ask them to submit the complaint in person only"], correct: 1, feedback: { correct: "Explain the process and Ombud rights.", incorrect: "Inform them of the complaints process and Ombud rights." } },
            { type: "mcq", question: "Q39. A representative under supervision must:", options: ["Render services only to clients introduced by the supervisor", "Be supervised in line with the FSCA supervision requirements", "Have every recommendation countersigned by a key individual", "Be restricted to a single subclass until competent"], correct: 1, feedback: { correct: "Supervised per FSCA supervision requirements.", incorrect: "They must be supervised in line with the supervision requirements." } },
            { type: "mcq", question: "Q40. Which statement about commission is TRUE?", options: ["It is disclosed only where the client requests the detail", "It must be disclosed to the client", "It is disclosed to the FSCA rather than to the client", "Only fees agreed with the client require disclosure"], correct: 1, feedback: { correct: "Commission must be disclosed.", incorrect: "Commission must be disclosed to the client." } },
            { type: "scenario", question: "Q41. You notice your FSP has no conflict-of-interest policy. This means the FSP is:", options: ["Acceptable, provided conflicts are disclosed as they arise", "A breach, since a COI management policy is mandatory", "Acceptable for FSPs with a single key individual", "A breach only once a conflict has actually materialised"], correct: 1, feedback: { correct: "A COI policy is mandatory.", incorrect: "Every FSP must have a COI management policy - its absence is a breach." } },
            { type: "mcq", question: "Q42. 'Good standing' can be affected by:", options: ["A prior debarment", "Holding a CPD certificate", "Passing RE5", "Earning commission"], correct: 0, feedback: { correct: "A prior debarment affects good standing.", incorrect: "A previous debarment bears on good standing." } },
            { type: "mcq", question: "Q43. Which is the correct order a dissatisfied client generally follows?", options: ["FSP internal complaint, then the Financial Services Tribunal", "FSP internal complaint, then the FAIS Ombud", "FSCA complaint, then the FSP, then the FAIS Ombud", "FAIS Ombud, then the FSP's internal process if declined"], correct: 1, feedback: { correct: "FSP first, then the Ombud.", incorrect: "Complain to the FSP first, then the Ombud if unresolved." } },
            { type: "mcq", question: "Q44. The Prudential Authority is responsible for:", options: ["Market conduct", "Safety and soundness of institutions", "Resolving FAIS complaints", "Setting commission rates"], correct: 1, feedback: { correct: "Prudential soundness.", incorrect: "The PA handles safety and soundness." } },
            { type: "scenario", question: "Q45. A client signs a form you haven't completed, trusting you to 'fill it in later'. You should:", options: ["Complete it using the details you already hold", "Not accept blank signed forms, confirm details first", "Date it to when the client actually signed", "Sign the outstanding sections on their behalf"], correct: 1, feedback: { correct: "Don't use blank signed forms; complete and confirm with the client.", incorrect: "Blank signed forms are a serious conduct risk - complete and confirm with the client." } },
            { type: "mcq", question: "Q46. A determination amount unpaid by an FSP can be:", options: ["Recovered only by the FSCA through an enforcement action", "Enforced as if it were a court order", "Set off against the FSP's professional indemnity cover", "Referred to the Financial Services Tribunal for execution"], correct: 1, feedback: { correct: "Enforced like a court order.", incorrect: "A determination is enforceable as a court order." } },
            { type: "mcq", question: "Q47. The main aim of TCF is to:", options: ["To lift FSP profitability across the sector", "To embed fair customer treatment across the product life cycle", "To reduce the volume of disclosure documents", "To shorten the time it takes to conclude a sale"], correct: 1, feedback: { correct: "Fair treatment across the life cycle.", incorrect: "TCF embeds fair customer treatment throughout the product life cycle." } },
            { type: "mcq", question: "Q48. Which is required BEFORE a product-specific recommendation?", options: ["A signed client mandate on file", "Product-specific training on that product", "Five years of industry experience", "Written approval from the FSCA"], correct: 1, feedback: { correct: "Product-specific training is required first.", incorrect: "You need product-specific training before advising on that product." } },
            { type: "scenario", question: "Q49. A client asks you to guarantee, in writing, that a unit trust 'cannot lose money'. You should:", options: ["Sign the guarantee", "Explain you cannot guarantee market performance and disclose the material risks honestly", "Refer them to the Ombud", "Change the product to cash without telling them"], correct: 1, feedback: { correct: "No performance guarantees; disclose risks honestly.", incorrect: "You cannot guarantee market performance - disclose the risks honestly." } },
            { type: "mcq", question: "Q50. Overall, the RE5 tests a representative's knowledge of:", options: ["The technical features of each product class", "The FAIS framework and a representative's conduct obligations", "The commercial skills needed to build a client base", "The accounting treatment of financial products"], correct: 1, feedback: { correct: "The FAIS framework and conduct obligations.", incorrect: "RE5 tests the FAIS regulatory framework and your conduct obligations." } },
            // The "Score Yourself — count your correct answers" info step that
            // used to close this paper is gone. RE5 is a real FSCA exam and a
            // self-marked number is not one a learner can act on, so the app
            // now marks the paper: see ExamResultView + src/lib/results/.
            // The exam ends on Q50; finishing it opens the marked result.
          ],
        },
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT - merged into the app's course list in content.ts
// ─────────────────────────────────────────────────────────────────────────────
export const RE5_COURSES: Course[] = [RE5_COURSE];
