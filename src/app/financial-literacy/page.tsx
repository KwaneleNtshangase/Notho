import type { Metadata } from "next";
import Link from "next/link";
import { PublicGuide, guideStyles } from "@/components/PublicGuide";
import { canonical } from "@/lib/seo";

const title = "Financial literacy lessons";
const description =
  "Learn financial literacy the South African way with Notho: short lessons, spaced review, and practice in the calculator and budget. Education only — not an FSP.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "financial literacy South Africa",
    "learn money South Africa",
    "financial education app",
    "Notho learn",
  ],
  alternates: { canonical: canonical("/financial-literacy") },
  openGraph: { title, description, url: canonical("/financial-literacy") },
};

const faqs = [
  {
    q: "What is the best way to learn financial literacy in South Africa?",
    a: "Short lessons on local ideas, then review until you can explain them, then practise with a rand calculator and a real budget. That is the Notho loop.",
  },
  {
    q: "Does Notho teach RE5?",
    a: "Yes. There is a dedicated RE5 prep path for people sitting the regulatory exam. Everyday concept review stays on literacy topics and does not nag you about RE5.",
  },
  {
    q: "Is Cosmo a financial adviser?",
    a: "No. Cosmo is Notho's in-app literacy assistant. It is a C letter mark, not a person, and it does not give personalised advice.",
  },
];

export default function FinancialLiteracyPage() {
  const { p, h2 } = guideStyles;
  return (
    <PublicGuide
      badge="Learn"
      title={title}
      path="/financial-literacy"
      description={description}
      lede="Financial literacy sticks when you meet an idea, get it wrong safely, see it again, and then use it on a number that looks like your life."
      faqs={faqs}
    >
      <h2 style={h2}>The Notho loop</h2>
      <p style={p}>
        Lessons are short. After a lesson, cards can return in review so the
        idea does not vanish in a week. The calculator and budget sit one tap
        away so "compounding" or "needs versus wants" is not only a definition.
      </p>
      <p style={p}>
        Start on{" "}
        <Link href="/learn" style={{ color: guideStyles.teal }}>
          Learn
        </Link>
        . When you want the numbers, use{" "}
        <Link href="/investment-calculator" style={{ color: guideStyles.teal }}>
          Calculate
        </Link>{" "}
        or{" "}
        <Link href="/budgeting" style={{ color: guideStyles.teal }}>
          Budget
        </Link>
        .
      </p>
      <h2 style={h2}>Built for this country</h2>
      <p style={p}>
        Content is framed for South Africa: rand, local products, and the
        difference between education and advice under FAIS. Notho will not
        pretend a US article is a local curriculum.
      </p>
    </PublicGuide>
  );
}
