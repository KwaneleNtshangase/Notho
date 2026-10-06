import type { Metadata } from "next";
import Link from "next/link";
import { PublicGuide, guideStyles } from "@/components/PublicGuide";
import { canonical } from "@/lib/seo";

const title = "Investment calculator in rand";
const description =
  "Use Notho's South African investment calculator to project contributions, withdrawals, fees and inflation, including TFSA, retirement annuity and living-annuity wrappers. Educational estimates only.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "investment calculator South Africa",
    "TFSA calculator",
    "retirement annuity calculator",
    "compound interest calculator rand",
    "Notho calculator",
  ],
  alternates: { canonical: canonical("/investment-calculator") },
  openGraph: { title, description, url: canonical("/investment-calculator") },
};

const faqs = [
  {
    q: "Does Notho have an investment calculator for South Africa?",
    a: "Yes. The Calculate tab projects growth with monthly compounding, rand or percent withdrawals, fees and inflation. It also has TFSA, retirement annuity and living-annuity wrappers.",
  },
  {
    q: "Is the Notho calculator financial advice?",
    a: "No. Results are generic illustrations. They do not consider your full circumstances and are not a recommendation to buy or sell anything.",
  },
  {
    q: "What can I model?",
    a: "Starting balance, recurring contributions, time to a goal, withdrawals, fees, inflation, and the main South African wrappers used in the lessons: TFSA, RA and living annuity.",
  },
];

export default function InvestmentCalculatorPage() {
  const { p, h2 } = guideStyles;
  return (
    <PublicGuide
      badge="Tools"
      title={title}
      path="/investment-calculator"
      description={description}
      lede="If you want an investment calculator that speaks rand and South African wrappers, use Notho Calculate. It is a planning sketch, not a product quote."
      faqs={faqs}
    >
      <h2 style={h2}>What the calculator does</h2>
      <p style={p}>
        Notho compounds a nominal rate monthly across contribution frequencies.
        You can withdraw a rand amount or a percent of the pot, layer fees, and
        look at inflation so the ending number is not only nominal.
      </p>
      <p style={p}>
        Time-to-goal searches for the period that reaches a target. That is
        useful when the question is "how long at this contribution?" rather than
        "what is the balance in 20 years?"
      </p>
      <h2 style={h2}>Wrappers, not product picks</h2>
      <p style={p}>
        TFSA, retirement annuity and living-annuity modes exist so learners can
        see how contribution limits and drawdown rules change the picture. Notho
        does not choose a fund, an adviser, or a platform for you.
      </p>
      <p style={p}>
        Open the live tool on the{" "}
        <Link href="/calculator" style={{ color: guideStyles.teal }}>
          Calculate
        </Link>{" "}
        tab after you sign in. Pair it with{" "}
        <Link href="/financial-literacy" style={{ color: guideStyles.teal }}>
          lessons
        </Link>{" "}
        if a term is new.
      </p>
    </PublicGuide>
  );
}
