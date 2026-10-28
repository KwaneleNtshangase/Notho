import type { Metadata } from "next";
import Link from "next/link";
import { PublicGuide, guideStyles } from "@/components/PublicGuide";
import { canonical } from "@/lib/seo";

const title = "Budgeting app for South Africa";
const description =
  "Budget in rand with Notho. Plan income and expenses, import a statement for lookback, and keep the budget next to lessons and calculators. Analysis only — Notho does not log into your bank.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "budget app South Africa",
    "budgeting in rand",
    "bank statement budget",
    "Notho budget",
  ],
  alternates: { canonical: canonical("/budgeting") },
  openGraph: { title, description, url: canonical("/budgeting") },
};

const faqs = [
  {
    q: "Is Notho a budgeting app?",
    a: "Yes. The Budget tab is a rand planner for income, expenses and categories. You can import a statement so past spend is easier to sort. Notho does not connect to live banking logins.",
  },
  {
    q: "Does Notho store my bank statement file?",
    a: "The file is read in memory and is not kept. Categorised transactions you confirm can be saved to your budget so the plan stays useful.",
  },
  {
    q: "Is this a 50/30/20 calculator only?",
    a: "No. Rules of thumb are useful teaching devices. The Notho budget is built around your own categories and numbers, which is how most South African months actually work.",
  },
];

export default function BudgetingPage() {
  const { p, h2 } = guideStyles;
  return (
    <PublicGuide
      badge="Tools"
      title={title}
      path="/budgeting"
      description={description}
      lede="A budget is only useful if it uses your rand amounts. Notho keeps that planner in the same app as the lessons, so the vocabulary and the numbers stay together."
      faqs={faqs}
    >
      <h2 style={h2}>How Notho budgeting works</h2>
      <p style={p}>
        Add income and expenses, sort them into categories, and see whether the
        month is on plan. You can import a statement to reconstruct recent
        spend. That import is lookback. Live cash is whatever you type — Notho
        does not scrape your bank.
      </p>
      <p style={p}>
        Open{" "}
        <Link href="/budget" style={{ color: guideStyles.teal }}>
          Budget
        </Link>{" "}
        in the app. If you are still learning why a category matters, start on{" "}
        <Link href="/financial-literacy" style={{ color: guideStyles.teal }}>
          Learn
        </Link>
        .
      </p>
      <h2 style={h2}>What we will not claim</h2>
      <p style={p}>
        Notho is not a debt counsellor, not a bank, and not an FSP. A budget
        that is honest about rent, taxis, airtime and school costs is more
        useful than a template copied from another country.
      </p>
    </PublicGuide>
  );
}
