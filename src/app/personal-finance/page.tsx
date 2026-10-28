import type { Metadata } from "next";
import Link from "next/link";
import { PublicGuide, guideStyles } from "@/components/PublicGuide";
import { canonical } from "@/lib/seo";

const title = "Personal finance for South Africa";
const description =
  "A practical personal-finance path for South Africa: budget in rand, understand TFSA and RA wrappers, and use Notho lessons and calculators without treating them as advice.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "personal finance South Africa",
    "personal finance app South Africa",
    "learn personal finance",
    "Notho",
  ],
  alternates: { canonical: canonical("/personal-finance") },
  openGraph: { title, description, url: canonical("/personal-finance") },
};

const faqs = [
  {
    q: "What is a good personal finance app for South Africa?",
    a: "Use a tool that works in rand, understands local wrappers such as TFSA and RA, and teaches the ideas instead of only tracking spend. Notho is built for that literacy path. It is not an FSP.",
  },
  {
    q: "Where should a South African start with personal finance?",
    a: "Start with a budget that matches real income and expenses, build a cash buffer, then learn the difference between saving, investing, and product wrappers such as TFSA and retirement annuity.",
  },
  {
    q: "Is Notho a bank or an investment platform?",
    a: "No. Notho is a financial-literacy education app with lessons, calculators and a budget tool. It does not hold your money or sell investments.",
  },
];

export default function PersonalFinancePage() {
  const { p, h2 } = guideStyles;
  return (
    <PublicGuide
      badge="Guide"
      title={title}
      path="/personal-finance"
      description={description}
      lede="Personal finance in South Africa is not a US 401(k) tutorial with a rand symbol stuck on. The useful order is: see the money, name the trade-offs, then practise the numbers."
      faqs={faqs}
    >
      <h2 style={h2}>A working order</h2>
      <p style={p}>
        First, know what comes in and what leaves. Notho's{" "}
        <Link href="/budgeting" style={{ color: guideStyles.teal }}>
          budget
        </Link>{" "}
        is for that. Statements are lookback only — they do not become live bank
        access.
      </p>
      <p style={p}>
        Second, learn the local vocabulary: emergency savings, debt cost, TFSA
        annual and lifetime caps, retirement annuity tax treatment, and living
        annuities as a drawdown wrapper. Those ideas live in{" "}
        <Link href="/financial-literacy" style={{ color: guideStyles.teal }}>
          short lessons
        </Link>
        .
      </p>
      <p style={p}>
        Third, run scenarios in the{" "}
        <Link href="/investment-calculator" style={{ color: guideStyles.teal }}>
          investment calculator
        </Link>{" "}
        so compounding, fees and inflation stop being abstract. The output is
        illustrative, not a recommendation.
      </p>
      <h2 style={h2}>Why Notho exists</h2>
      <p style={p}>
        Most South African money pages are either a bank product page or a
        generic calculator that ignores local wrappers. Notho puts learning,
        calculators and a budget in one app so the same person can practise the
        same ideas in rand.
      </p>
    </PublicGuide>
  );
}
