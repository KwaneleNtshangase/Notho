import type { LessonLayoutItem, QuestionSlot } from "@/data/content";
import type { LessonBank } from "./money-basics";

/**
 * Bank for "Estate Planning" (Level 3).
 *
 * Figures verified current (Feb 2026 Budget, unchanged):
 *  - Estate duty 20% up to R30m, 25% above R30m; s4A abatement R3.5m
 *    (portable to a surviving spouse, up to R7m); spousal bequests exempt.
 *  - Executor's fee statutory max 3.5% + VAT of gross estate.
 *  - Donations tax annual exemption R100 000; retirement funds paid to
 *    nominated beneficiaries bypass the estate; s37C trustee discretion.
 *  - Wills Act: two competent witnesses; a beneficiary-witness forfeits the bequest.
 */

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 1 · Dying Without a Will  (estate-planning::dying-intestate-disaster)
// ═══════════════════════════════════════════════════════════════════════════

const intestateSlots: QuestionSlot[] = [
  {
    slotId: "estate-planning/dying-intestate-disaster/what-it-means",
    conceptId: "intestate-succession",
    variants: [
      {
        variantId: "est-int-mean-mcq",
        step: {
          type: "mcq",
          question: "If you die without a valid will, who decides where your assets go?",
          options: [
            "The Intestate Succession Act, a fixed legal formula, not your wishes",
            "Your bank",
            "Your employer",
            "Whoever asks the Master first",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Dying intestate hands your estate to a set formula in the Act: your actual wishes carry no weight.",
            incorrect: "It's the Intestate Succession Act's formula that decides, not you, your bank, or your employer.",
          },
        },
      },
      {
        variantId: "est-int-mean-tf",
        step: {
          type: "true-false",
          statement: "A long-term cohabiting partner (unmarried) automatically inherits under intestate succession.",
          correct: false,
          feedback: {
            correct: "Correct. Cohabitants aren't automatically recognised. A court challenge is uncertain. Only a valid will guarantees they inherit.",
            incorrect: "They don't inherit automatically. The Act doesn't recognise cohabiting partners; a will is the only certain protection.",
          },
        },
      },
      {
        variantId: "est-int-mean-sc",
        step: {
          type: "scenario",
          question: "An unmarried couple together 15 years own a home jointly, with no wills. One dies. What does the survivor automatically inherit under intestate law?",
          options: [
            "Nothing automatically. Cohabitants aren't recognised; only a will protects them",
            "The whole estate",
            "Exactly half of everything",
            "Just the house",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Without a will, the survivor has no automatic intestate claim. A devastating, common outcome. A will fixes it.",
            incorrect: "The survivor inherits nothing automatically. The Act ignores cohabitation, so only a valid will secures their inheritance.",
          },
        },
      },
    ],
  },
  {
    slotId: "estate-planning/dying-intestate-disaster/cost",
    conceptId: "intestate-succession",
    variants: [
      {
        variantId: "est-int-cost-mcq",
        step: {
          type: "mcq",
          question: "A hidden cost of dying without a will is that:",
          options: [
            "The Master appoints an executor and winding up drags 12-24+ months",
            "Assets are distributed instantly and for free",
            "Your estate pays less tax",
            "There are no consequences at all",
          ],
          correct: 0,
          feedback: {
            correct: "Right. No nominated executor means the Master appoints one, usually a costly bank trust, and long delays follow.",
            incorrect: "Without a will the Master appoints an executor (often a bank at up to 3.5% + VAT), and the estate is delayed for a year or more.",
          },
        },
      },
      {
        variantId: "est-int-cost-tf",
        step: {
          type: "true-false",
          statement: "If minor children inherit and there's no will, their money can be paid into the state Guardian's Fund until they turn 18.",
          correct: true,
          feedback: {
            correct: "Right. The Guardian's Fund holds minors' inheritances at below-market interest, one more reason to have a will (and ideally a testamentary trust).",
            incorrect: "It can. Minors' inheritances often go to the state Guardian's Fund until age 18. Avoidable with a will and a trust.",
          },
        },
      },
      {
        variantId: "est-int-cost-sc",
        step: {
          type: "scenario",
          question: "Why does dying intestate so often cause family conflict?",
          options: [
            "The rigid formula ignores relationships, promises and practical needs",
            "Because the estate is always tax-free",
            "Because everyone inherits equally and fairly",
            "Because the process is instant",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A one-size formula can't reflect your intentions or your family's real situation. Friction is common.",
            incorrect: "The formula is rigid and impersonal, it ignores relationships and promises, which is exactly what breeds conflict.",
          },
        },
      },
    ],
  },
  {
    slotId: "estate-planning/dying-intestate-disaster/valid-will",
    conceptId: "intestate-succession",
    variants: [
      {
        variantId: "est-int-wl-mcq",
        step: {
          type: "mcq",
          question: "For a South African will to be valid, it must be signed:",
          options: [
            "In front of two competent witnesses, both present at the same time",
            "In front of one witness",
            "Before a judge",
            "With no witnesses needed",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Two competent witnesses, present together, must witness and sign. You don't need a lawyer, but you do need this.",
            incorrect: "You need two competent witnesses present at the same time. One witness, or none, doesn't make a valid will.",
          },
        },
      },
      {
        variantId: "est-int-wl-tf",
        step: {
          type: "true-false",
          statement: "Someone who witnesses your will can also inherit under it without any problem.",
          correct: false,
          feedback: {
            correct: "Correct. A beneficiary who witnesses the will forfeits their bequest (the rest of the will stands). Never use beneficiaries as witnesses.",
            incorrect: "They can't. A witness who is also a beneficiary loses that bequest, so keep witnesses and beneficiaries separate.",
          },
        },
      },
      {
        variantId: "est-int-wl-sc",
        step: {
          type: "scenario",
          question: "Thabo and Nomalanga both witness Siphamandla's will, and are also named to inherit from it. What's the legal result?",
          options: [
            "The will stays valid, but their bequests are void",
            "The entire will is void",
            "Everything is fine and enforceable",
            "Only the blood relative loses out",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The will remains valid; the witness-beneficiaries simply forfeit their gifts. That's why they should never witness.",
            incorrect: "The will stays valid, but a beneficiary who witnessed it loses that bequest. Both forfeit; the rest of the will stands.",
          },
        },
      },
    ],
  },
  {
    slotId: "estate-planning/dying-intestate-disaster/executor",
    conceptId: "intestate-succession",
    variants: [
      {
        variantId: "est-int-ex-mcq",
        step: {
          type: "mcq",
          question: "What is the statutory maximum executor's fee in South Africa?",
          options: ["3.5% + VAT of the gross estate", "10% of the estate", "A flat 1%", "R50 000 fixed"],
          correct: 0,
          feedback: {
            correct: "Right. 3.5% + VAT is the cap, but it's negotiable, especially on larger, simpler estates, if you appoint your own executor.",
            incorrect: "The maximum is 3.5% + VAT of the gross estate. It's negotiable if you name your own executor in your will.",
          },
        },
      },
      {
        variantId: "est-int-ex-tf",
        step: {
          type: "true-false",
          statement: "You can name your own executor in your will and negotiate their fee in advance.",
          correct: true,
          feedback: {
            correct: "Right. Naming your executor and agreeing the fee in writing can save your family a great deal versus the default 3.5%.",
            incorrect: "You can. Appointing your own executor and negotiating the fee upfront often beats the Master's default appointment.",
          },
        },
      },
      {
        variantId: "est-int-ex-sc",
        step: {
          type: "scenario",
          question: "On a R5 million estate, negotiating the executor's fee down from 3.5% to about 1% saves roughly:",
          options: ["About R145 000", "Nothing", "About R5 000", "About R500"],
          correct: 0,
          feedback: {
            correct: "Right. 3.5% + VAT on R5m is ~R201 000; 1% + VAT is ~R57 500, a saving of about R145 000 for your family.",
            incorrect: "It's roughly R145 000: ~R201 000 at 3.5% versus ~R57 500 at 1% (both incl. VAT) on a R5m estate.",
          },
        },
      },
    ],
  },
];

const intestateLayout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "What Happens When You Die Without a Will",
    content:
      "<p>Dying without a valid will is dying <strong>intestate</strong>: the Intestate Succession Act distributes your estate by a fixed formula, not your wishes. Cohabiting (unmarried) partners receive <strong>nothing</strong> automatically, minor children's inheritances can go to the state Guardian's Fund, and the Master appoints an executor (often a bank charging up to 3.5% + VAT).</p><p>A valid will needs only to be signed before <strong>two competent witnesses</strong> present together, but a witness who is also a beneficiary forfeits that bequest, so keep them separate. Name your own executor and negotiate the fee in advance.</p>",
  },
  { slot: "estate-planning/dying-intestate-disaster/what-it-means" },
  { slot: "estate-planning/dying-intestate-disaster/cost" },
  { slot: "estate-planning/dying-intestate-disaster/valid-will" },
  { slot: "estate-planning/dying-intestate-disaster/executor" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 2 · Estate Duty  (estate-planning::estate-duty-deep)
// ═══════════════════════════════════════════════════════════════════════════

const dutySlots: QuestionSlot[] = [
  {
    slotId: "estate-planning/estate-duty-deep/rates",
    conceptId: "estate-duty",
    variants: [
      {
        variantId: "est-du-rt-mcq",
        step: {
          type: "mcq",
          question: "South African estate duty is charged at:",
          options: [
            "20% up to R30 million, and 25% above R30 million",
            "A flat 40%",
            "A flat 15%",
            "45% on everything",
          ],
          correct: 0,
          feedback: {
            correct: "Right. 20% on the dutiable estate up to R30m, 25% on the portion above R30m.",
            incorrect: "It's 20% up to R30m and 25% above R30m, not a single flat rate.",
          },
        },
      },
      {
        variantId: "est-du-rt-mcq2",
        step: {
          type: "mcq",
          question: "Every individual gets an estate-duty abatement (tax-free amount) of:",
          options: ["R3.5 million", "R1 million", "R250 000", "R30 million"],
          correct: 0,
          feedback: {
            correct: "Right. The first R3.5 million passes estate-duty-free, and unused abatement rolls over to a surviving spouse (up to R7m).",
            incorrect: "It's R3.5 million per person. Unused abatement rolls over to a surviving spouse, up to R7 million combined.",
          },
        },
      },
      {
        variantId: "est-du-rt-tf",
        step: {
          type: "true-false",
          statement: "Assets left to your surviving spouse are exempt from estate duty (it's deferred until the second death).",
          correct: true,
          feedback: {
            correct: "Right. The spousal exemption defers all duty to the second death, and the first spouse's unused abatement can roll over.",
            incorrect: "They are exempt. Bequests to a spouse defer estate duty to the second death; unused abatement can also carry over.",
          },
        },
      },
    ],
  },
  {
    slotId: "estate-planning/estate-duty-deep/calculation",
    conceptId: "estate-duty",
    variants: [
      {
        variantId: "est-du-calc-fill",
        step: {
          type: "fill-blank",
          title: "What's actually dutiable",
          prompt: "Net estate R8m. R2m is left to the spouse (exempt) and the R3.5m abatement applies. Estate duty is charged on R____ million.",
          correct: 2.5,
          feedback: {
            correct: "Right: R8m − R2m spousal exemption − R3.5m abatement = R2.5m dutiable (× 20% = R500 000 duty).",
            incorrect: "R8m − R2m (spouse) − R3.5m (abatement) = R2.5m dutiable. At 20% that's R500 000.",
          },
        },
      },
      {
        variantId: "est-du-calc-mcq",
        step: {
          type: "mcq",
          question: "Net estate R8m, R2m left to the spouse, R3.5m abatement. How much estate duty is owed?",
          options: ["R500 000", "R1.6 million", "Exactly R0", "About R700 000"],
          correct: 0,
          feedback: {
            correct: "Right: dutiable amount R2.5m × 20% = R500 000.",
            incorrect: "Dutiable = R8m − R2m − R3.5m = R2.5m; × 20% = R500 000.",
          },
        },
      },
      {
        variantId: "est-du-calc-tf",
        step: {
          type: "true-false",
          statement: "Estate duty is charged on your whole estate, with no tax-free portion.",
          correct: false,
          feedback: {
            correct: "Correct. The R3.5m abatement (plus any spousal exemption) comes off first. Only the balance is dutiable.",
            incorrect: "There is a tax-free portion: the R3.5m abatement, on top of spousal exemptions, before any duty applies.",
          },
        },
      },
    ],
  },
  {
    slotId: "estate-planning/estate-duty-deep/in-or-out",
    conceptId: "estate-duty",
    variants: [
      {
        variantId: "est-du-io-mcq",
        step: {
          type: "mcq",
          question: "Which of these typically bypasses your dutiable estate?",
          options: [
            "A retirement fund paid to a nominated beneficiary",
            "A property registered in your name",
            "Your car",
            "Shares in your Pty Ltd",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Retirement funds paid to a nominated beneficiary go straight to the nominee, outside the estate.",
            incorrect: "Retirement funds paid to a nominated beneficiary bypass the estate. Property, cars and business shares fall inside it.",
          },
        },
      },
      {
        variantId: "est-du-io-tf",
        step: {
          type: "true-false",
          statement: "A R4 million pension paid directly to a nominated beneficiary generally attracts no estate duty.",
          correct: true,
          feedback: {
            correct: "Right. With a nominated beneficiary, the fund pays the nominee directly, it doesn't form part of the dutiable estate.",
            incorrect: "It generally attracts none. A nominated retirement-fund benefit is paid outside the estate, so no estate duty applies to it.",
          },
        },
      },
      {
        variantId: "est-du-io-sc",
        step: {
          type: "scenario",
          question: "Thabo nominates his wife as beneficiary on his R4 million pension. What estate duty is owed on that R4 million?",
          options: [
            "R0",
            "R800 000 (20%)",
            "R100 000",
            "R1 million",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The nominated pension is paid straight to his wife by the fund, it never enters the dutiable estate.",
            incorrect: "R0. A nominated retirement fund is paid directly to the nominee and falls outside the estate entirely.",
          },
        },
      },
    ],
  },
  {
    slotId: "estate-planning/estate-duty-deep/liquidity",
    conceptId: "estate-duty",
    variants: [
      {
        variantId: "est-du-liq-mcq",
        step: {
          type: "mcq",
          question: "Why do estates often face a 'liquidity problem'?",
          options: [
            "Duty, fees and debts fall due in cash but most wealth is illiquid",
            "SARS refuses to accept any payment",
            "Banks freeze all accounts permanently",
            "There is no such problem",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Cash is needed fast, but the value is locked in property and investments, forcing rushed, below-value sales.",
            incorrect: "The issue is timing: cash is due within about a year, yet most wealth is illiquid: hence forced sales.",
          },
        },
      },
      {
        variantId: "est-du-liq-tf",
        step: {
          type: "true-false",
          statement: "Lifetime donations of up to R100 000 per year are free of donations tax.",
          correct: true,
          feedback: {
            correct: "Right. Gifting up to R100 000 a year moves value out of your estate over time, free of donations tax.",
            incorrect: "They are. The annual donations-tax exemption is R100 000. A slow, legal way to shrink a future estate.",
          },
        },
      },
      {
        variantId: "est-du-liq-sc",
        step: {
          type: "scenario",
          question: "How can a Section 3(3)(a) life policy help solve an estate's liquidity problem?",
          options: [
            "It provides cash to pay estate duty and costs, avoiding a forced sale of property",
            "It eliminates all tax on the estate",
            "It is illegal in South Africa",
            "It delays the person's death",
          ],
          correct: 0,
          feedback: {
            correct: "Right. The policy pays out cash to cover duty and fees, so the family doesn't have to dump assets under pressure.",
            incorrect: "It supplies liquidity, cash to settle duty and costs, so property needn't be sold in a hurry. It doesn't remove the tax.",
          },
        },
      },
    ],
  },
];

const dutyLayout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Estate Duty: The Tax on Dying Rich",
    content:
      "<p>Estate duty is charged at <strong>20%</strong> on the dutiable estate up to R30 million and <strong>25%</strong> above R30 million, after a <strong>R3.5 million abatement</strong> (unused abatement rolls over to a surviving spouse, up to R7m). Bequests to a spouse are exempt, deferring duty to the second death.</p><p>Retirement funds and life policies paid to <strong>nominated beneficiaries</strong> bypass the estate entirely. The classic trap is <strong>liquidity</strong>: duty, fees and debts fall due in cash within about 12 months, while most wealth is illiquid, which is what an estate-pegged (s3(3)(a)) life policy is designed to solve.</p>",
  },
  { slot: "estate-planning/estate-duty-deep/rates" },
  { slot: "estate-planning/estate-duty-deep/calculation" },
  { slot: "estate-planning/estate-duty-deep/in-or-out" },
  { slot: "estate-planning/estate-duty-deep/liquidity" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Lesson 3 · Beneficiary Nominations  (estate-planning::beneficiary-strategy)
// ═══════════════════════════════════════════════════════════════════════════

const beneSlots: QuestionSlot[] = [
  {
    slotId: "estate-planning/beneficiary-strategy/override-will",
    conceptId: "beneficiary-nominations",
    variants: [
      {
        variantId: "est-bn-ow-mcq",
        step: {
          type: "mcq",
          question: "Your pension nomination says 'ex-spouse' but your will says 'my children'. Who is in line for the pension?",
          options: [
            "It's decided outside your will, the nomination/fund process controls it",
            "Your children, because the will always wins",
            "It's split equally by law",
            "The state takes it",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Retirement-fund benefits pass outside your will. Your will can't override the fund's process.",
            incorrect: "The will doesn't control it. Retirement funds pass outside the will, via the nomination and the fund's own rules.",
          },
        },
      },
      {
        variantId: "est-bn-ow-tf",
        step: {
          type: "true-false",
          statement: "Your will overrides the beneficiary nomination on your retirement fund.",
          correct: false,
          feedback: {
            correct: "Correct. It doesn't. Retirement funds and life policies pass outside the will: the nomination (and s37C) governs them.",
            incorrect: "It doesn't override it. Retirement funds and nominated life policies bypass the will entirely.",
          },
        },
      },
      {
        variantId: "est-bn-ow-sc",
        step: {
          type: "scenario",
          question: "After her divorce, Nomsa updates her will but forgets her pension nomination still names her ex-husband. If she dies, what's the risk?",
          options: [
            "Her pension could be steered toward the ex",
            "Nothing, the divorce cancels it",
            "Her will fixes it regardless",
            "The pension is frozen forever",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Divorce doesn't automatically fix a nomination. Update the fund form. The will alone won't redirect the pension.",
            incorrect: "The stale nomination is the risk. Divorce doesn't auto-cancel it, and the will can't override the fund nomination.",
          },
        },
      },
    ],
  },
  {
    slotId: "estate-planning/beneficiary-strategy/section-37c",
    conceptId: "beneficiary-nominations",
    variants: [
      {
        variantId: "est-bn-37c-mcq",
        step: {
          type: "mcq",
          question: "Who ultimately decides how a retirement-fund death benefit is split?",
          options: [
            "The fund trustees, who must consider all financial dependants",
            "Only the person you nominated",
            "Your executor",
            "SARS",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Under s37C the trustees have discretion, and must look after all financial dependants. The nomination is guidance.",
            incorrect: "It's the fund trustees under s37C. They must consider all financial dependants; your nomination guides but doesn't bind them.",
          },
        },
      },
      {
        variantId: "est-bn-37c-tf",
        step: {
          type: "true-false",
          statement: "Under s37C, fund trustees can allocate a death benefit to a financial dependant even if that person wasn't nominated.",
          correct: true,
          feedback: {
            correct: "Right. Their duty is to dependants, not just nominees. An un-nominated dependant child, say, can still receive a share.",
            incorrect: "They can. s37C obliges trustees to provide for financial dependants, nominated or not.",
          },
        },
      },
      {
        variantId: "est-bn-37c-sc",
        step: {
          type: "scenario",
          question: "Sipho nominated his mother 10 years ago; he has since married and has two young children. He dies. Who most likely receives the pension?",
          options: [
            "The trustees decide, likely favouring his wife and minor children as dependants",
            "His mother. The nomination is a binding contract",
            "His estate, split by his will",
            "It lapses because the form is old",
          ],
          correct: 0,
          feedback: {
            correct: "Right. s37C points the trustees to current financial dependants, the wife and young children, over the old nomination.",
            incorrect: "The trustees decide under s37C, prioritising his wife and minor children as dependants over a 10-year-old nomination.",
          },
        },
      },
    ],
  },
  {
    slotId: "estate-planning/beneficiary-strategy/life-policy",
    conceptId: "beneficiary-nominations",
    variants: [
      {
        variantId: "est-bn-lp-mcq",
        step: {
          type: "mcq",
          question: "A common, costly mistake with a life policy is:",
          options: [
            "Naming 'my estate' as beneficiary instead of a person, exposing the payout to creditors and delays",
            "Naming a specific person as beneficiary",
            "Paying the premiums on time",
            "Reviewing the nomination each year",
          ],
          correct: 0,
          feedback: {
            correct: "Right. 'To my estate' drags the payout through the estate: creditors first, family after 12-24 months. Name a person.",
            incorrect: "The mistake is naming your estate. That routes the money through the estate (creditors, delays). Name a person instead.",
          },
        },
      },
      {
        variantId: "est-bn-lp-tf",
        step: {
          type: "true-false",
          statement: "Naming a person (not 'my estate') as your life-policy beneficiary lets the insurer pay them directly, bypassing estate delays.",
          correct: true,
          feedback: {
            correct: "Right. A named person is paid straight by the insurer, fast, and outside the reach of estate creditors.",
            incorrect: "It's true. A named beneficiary is paid directly by the insurer, avoiding the estate's creditors and delays.",
          },
        },
      },
      {
        variantId: "est-bn-lp-sc",
        step: {
          type: "scenario",
          question: "Lindiwe wants her children to receive her life-policy payout quickly and safely. What should she do?",
          options: [
            "Name her chosen beneficiaries on the policy directly",
            "Name 'my estate' so the will controls it",
            "Leave the beneficiary blank",
            "Cancel the policy",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Named beneficiaries are paid directly and fast; 'my estate' invites creditors and long delays.",
            incorrect: "She should name the beneficiaries directly. Routing it via 'my estate' exposes it to creditors and delay.",
          },
        },
      },
    ],
  },
  {
    slotId: "estate-planning/beneficiary-strategy/review",
    conceptId: "beneficiary-nominations",
    variants: [
      {
        variantId: "est-bn-rv-tf",
        step: {
          type: "true-false",
          statement: "You should review your beneficiary nominations after any major life change. Marriage, divorce, a birth, or a nominee's death.",
          correct: true,
          feedback: {
            correct: "Right. Stale nominations are a top estate-planning failure. Treat a review as annual financial hygiene.",
            incorrect: "You should. Life changes can make a nomination dangerously wrong; review it at each one (and roughly yearly).",
          },
        },
      },
      {
        variantId: "est-bn-rv-mcq",
        step: {
          type: "mcq",
          question: "Stale (out-of-date) beneficiary nominations commonly cause:",
          options: [
            "Assets going to an ex-spouse or to a nominee who has already died",
            "Lower taxes",
            "Faster payouts to the right people",
            "No problems at all",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A forgotten form can send money to an ex, or to a deceased nominee (dragging it into intestacy). Keep them current.",
            incorrect: "They send money to the wrong people. An ex-spouse, or a nominee who has died. That's the whole risk of not reviewing.",
          },
        },
      },
      {
        variantId: "est-bn-rv-sc",
        step: {
          type: "scenario",
          question: "What's a simple habit that prevents most beneficiary-nomination disasters?",
          options: [
            "Review and update every nomination after each major life event",
            "Never fill in a nomination form",
            "Assume your will covers everything",
            "Only update after age 60",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A quick annual check, plus updates at each life event, keeps nominations pointing where you actually intend.",
            incorrect: "The habit is regular review, especially after life events. Your will doesn't cover nominated funds and policies.",
          },
        },
      },
    ],
  },
];

const beneLayout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "Your Most Powerful Estate-Planning Tool",
    content:
      "<p>Several major assets bypass your will entirely if you've named beneficiaries. Retirement funds, group life cover, and individual life policies. If your will says 'everything to my children' but your pension names an ex-spouse, the <strong>will does not control the pension</strong>.</p><p>Retirement funds follow <strong>s37C</strong>: the trustees must provide for all financial dependants, so a nomination is guidance, not a binding contract. Life-policy nominees are paid directly by the insurer, so name a <strong>person</strong>, never 'my estate'. Review every nomination after each major life event.</p>",
  },
  { slot: "estate-planning/beneficiary-strategy/override-will" },
  { slot: "estate-planning/beneficiary-strategy/section-37c" },
  { slot: "estate-planning/beneficiary-strategy/life-policy" },
  { slot: "estate-planning/beneficiary-strategy/review" },
];

// ═══════════════════════════════════════════════════════════════════════════

export const ESTATE_PLANNING_BANKS: Record<string, LessonBank> = {
  "estate-planning::dying-intestate-disaster": { layout: intestateLayout, slots: intestateSlots },
  "estate-planning::estate-duty-deep": { layout: dutyLayout, slots: dutySlots },
  "estate-planning::beneficiary-strategy": { layout: beneLayout, slots: beneSlots },
};
