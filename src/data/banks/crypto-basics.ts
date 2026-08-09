import type { LessonLayoutItem, QuestionSlot } from "@/data/content";
import type { LessonBank } from "./money-basics";

/**
 * Bank for "Crypto & Digital Assets" (core lesson: What Is Cryptocurrency?).
 *
 * Facts: Bitcoin (2009) was first; crypto is decentralised on a blockchain;
 * 70-85% drawdowns have happened repeatedly and recovered to new highs.
 * SARS treats crypto as a taxable asset — CGT on hold-and-sell (40% inclusion),
 * income tax on active trading; SA exchanges (Luno, VALR) share data with SARS.
 * Ponzi maths: 15%/month compounds to ~435%/year (1.15^12); MTI (~R9bn, 2020)
 * is SA's largest crypto Ponzi. Scam slot reuses the shared investment-scams concept.
 */

// ═══════════════════════════════════════════════════════════════════════════
// Lesson · "What Is Cryptocurrency?"  (crypto-basics::what-is-crypto)
// ═══════════════════════════════════════════════════════════════════════════

const whatIsCryptoSlots: QuestionSlot[] = [
  {
    slotId: "crypto-basics/what-is-crypto/what-it-is",
    conceptId: "crypto-basics",
    variants: [
      {
        variantId: "cry-def-mcq",
        step: {
          type: "mcq",
          question: "What makes cryptocurrency fundamentally different from the rand?",
          options: [
            "It's decentralised, no government or central bank controls it",
            "It earns guaranteed interest",
            "It's backed by gold",
            "It's only used in South Africa",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Crypto runs on decentralised networks with no central authority. Nobody can print more, but there's also no safety net.",
            incorrect: "Crypto is decentralised: no central bank or government controls it. That's the core difference from the rand.",
          },
        },
      },
      {
        variantId: "cry-def-tf",
        step: {
          type: "true-false",
          statement: "Cryptocurrency is controlled by a central bank, the same way the rand is managed by the SARB.",
          correct: false,
          feedback: {
            correct: "Correct. No central bank controls crypto. That's what 'decentralised' means. It's the opposite of the rand.",
            incorrect: "It isn't. Crypto is decentralised, with no central bank in charge, unlike the rand, which the SARB manages.",
          },
        },
      },
      {
        variantId: "cry-def-mcq2",
        step: {
          type: "mcq",
          question: "Cryptocurrency records transactions on a:",
          options: [
            "Blockchain, a shared public ledger maintained by many computers",
            "Private database owned by one bank",
            "Government registry",
            "Paper ledger held by the exchange",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A blockchain is a shared, public ledger kept by thousands of computers: no single owner.",
            incorrect: "It's a blockchain: a shared public ledger maintained across many computers, not any single institution's database.",
          },
        },
      },
    ],
  },
  {
    slotId: "crypto-basics/what-is-crypto/volatility",
    conceptId: "crypto-basics",
    variants: [
      {
        variantId: "cry-vol-mcq",
        step: {
          type: "mcq",
          question: "Bitcoin has dropped 70-85% several times and then recovered to new highs. This shows:",
          options: [
            "Extreme volatility is normal for this asset class, not proof of fraud",
            "Bitcoin is a Ponzi scheme",
            "The blockchain technology failed",
            "Governments manipulate every crash",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Huge drawdowns (2014, 2018, 2022) that later recovered are Bitcoin's history. Volatility is the defining trait, not fraud.",
            incorrect: "Repeated 70-85% crashes and recoveries show volatility is normal for the asset class, not evidence of a scam or failure.",
          },
        },
      },
      {
        variantId: "cry-vol-tf",
        step: {
          type: "true-false",
          statement: "Because crypto is decentralised, there's no safety net if the price crashes.",
          correct: true,
          feedback: {
            correct: "Right. No central authority means no bailout or guarantee. Only invest what you can genuinely afford to lose.",
            incorrect: "There isn't a safety net. Decentralisation means no institution backstops a crash. The risk sits entirely with you.",
          },
        },
      },
      {
        variantId: "cry-vol-sc",
        step: {
          type: "scenario",
          question: "A friend says, 'Crypto just crashed 50%, so it must be a scam.' What's the most accurate response?",
          options: [
            "Big drawdowns are normal",
            "Yes, sell everything now",
            "All cryptocurrencies are fake",
            "The blockchain must have broken",
          ],
          correct: 0,
          feedback: {
            correct: "Right. A 50% swing is within crypto's normal volatility. Fraud is a separate question, judged by the scheme, not the price move.",
            incorrect: "A crash isn't evidence of a scam. Crypto is simply volatile. Whether something is a fraud depends on the scheme, not the dip.",
          },
        },
      },
    ],
  },
  {
    slotId: "crypto-basics/what-is-crypto/sars-tax",
    conceptId: "crypto-tax",
    variants: [
      {
        variantId: "cry-tax-tf",
        step: {
          type: "true-false",
          statement: "Crypto transactions are anonymous, so SARS can't know about your gains.",
          correct: false,
          feedback: {
            correct: "Correct. Blockchain is pseudonymous, not anonymous, and SA exchanges share data with SARS. Hiding gains is tax evasion.",
            incorrect: "They're not anonymous. SA exchanges (Luno, VALR) report to SARS, and crypto is a taxable asset. Non-disclosure is evasion.",
          },
        },
      },
      {
        variantId: "cry-tax-mcq",
        step: {
          type: "mcq",
          question: "How does SARS treat a profit from holding and then selling crypto?",
          options: [
            "Capital gains tax applies, and exchanges share your data with SARS",
            "It's completely tax-free",
            "It's taxed only above R1 million",
            "Crypto gains are never taxed",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Hold-and-sell gains fall under CGT (40% of the gain is included in income); active trading is taxed as income.",
            incorrect: "It's taxable: CGT for hold-and-sell (40% inclusion), income tax for active trading. SARS gets exchange data either way.",
          },
        },
      },
      {
        variantId: "cry-tax-sc",
        step: {
          type: "scenario",
          question: "Thabo made a gain trading crypto on a SA exchange and assumes SARS will never find out. Is he right?",
          options: [
            "No, SA exchanges share data with SARS; not declaring it is tax evasion",
            "Yes, crypto is fully anonymous",
            "Yes, crypto is untaxed in SA",
            "Only if he leaves it in crypto",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Luno and VALR report to SARS. Keep records of every trade, date and rand value at buy and sell, and declare it.",
            incorrect: "He's wrong. SA exchanges report to SARS, so the gain is visible and taxable. Hiding it is tax evasion with real consequences.",
          },
        },
      },
    ],
  },
  {
    slotId: "crypto-basics/what-is-crypto/scam-flags",
    conceptId: "investment-scams",
    variants: [
      {
        variantId: "cry-scam-mcq",
        step: {
          type: "mcq",
          question: "An 'investment' promises 15% per MONTH in Bitcoin with no explained strategy. This is:",
          options: [
            "Almost certainly a Ponzi scheme",
            "A legitimate arbitrage desk",
            "High risk but probably real",
            "Fine if payments look real",
          ],
          correct: 0,
          feedback: {
            correct: "Right. 15% monthly compounds to ~435% a year. Impossible sustainably. This is the exact profile of MTI, SA's ~R9bn crypto Ponzi.",
            incorrect: "15%/month compounds to ~435% a year. No real strategy does that. It's the classic Ponzi promise (e.g. MTI, ~R9bn).",
          },
        },
      },
      {
        variantId: "cry-scam-tf",
        step: {
          type: "true-false",
          statement: "Guaranteed high monthly returns are a hallmark of crypto Ponzi schemes.",
          correct: true,
          feedback: {
            correct: "Right. 'Guaranteed' plus fixed high monthly payouts is the Ponzi signature. Real crypto returns are volatile, never guaranteed.",
            incorrect: "They are. Guaranteed, steady, high monthly returns can't come from a volatile asset. That's how Ponzis lure people in.",
          },
        },
      },
      {
        variantId: "cry-scam-sc",
        step: {
          type: "scenario",
          question: "A crypto 'club' pays guaranteed monthly returns, is recruited through a church group, and has no FSCA licence. What is it?",
          options: [
            "A stack of classic Ponzi red flags. Walk away",
            "A safe community investment",
            "Low risk, because people you know vouch for it",
            "Fine, since the first payouts arrived",
          ],
          correct: 0,
          feedback: {
            correct: "Right. Guaranteed returns, affinity recruiting and no FSCA licence are textbook red flags. Early payouts are just recycled deposits.",
            incorrect: "These are textbook Ponzi red flags: guaranteed returns, recruiting through a trusted group, and no FSCA licence. Early payouts prove nothing.",
          },
        },
      },
    ],
  },
];

const whatIsCryptoLayout: LessonLayoutItem[] = [
  {
    type: "info",
    title: "The Technology, and What Crypto Is and Isn't",
    content:
      "<p>Cryptocurrency is digital money secured by cryptography and recorded on a <strong>blockchain</strong>, a shared public ledger maintained by thousands of computers, with no single bank or government in control. Bitcoin (2009) was the first; there are now thousands, most of them worthless.</p><p><strong>It IS</strong> a volatile, speculative asset class with real historical returns, and it's taxable in SA. <strong>It ISN'T</strong> guaranteed, anonymous (the blockchain is traceable), or a day-to-day replacement for the rand.</p>",
  },
  { slot: "crypto-basics/what-is-crypto/what-it-is" },
  { slot: "crypto-basics/what-is-crypto/volatility" },
  {
    type: "info",
    title: "SARS, and the Scam Red Flags",
    content:
      "<p><strong>Tax:</strong> SARS treats crypto as a taxable asset. Capital gains tax if you hold and sell (40% of the gain is included in income), income tax if you trade actively. Keep records of every transaction, and remember SA exchanges (Luno, VALR) share data with SARS.</p><p><strong>Scams:</strong> South Africa has lost billions to crypto fraud (MTI alone, ~R9 billion). Red flags: guaranteed monthly returns, returns you can't withdraw as rand, no explained strategy, recruiting through church or family groups, and no FSCA licence.</p>",
  },
  { slot: "crypto-basics/what-is-crypto/sars-tax" },
  { slot: "crypto-basics/what-is-crypto/scam-flags" },
];

// ═══════════════════════════════════════════════════════════════════════════

export const CRYPTO_BASICS_BANKS: Record<string, LessonBank> = {
  "crypto-basics::what-is-crypto": { layout: whatIsCryptoLayout, slots: whatIsCryptoSlots },
};
