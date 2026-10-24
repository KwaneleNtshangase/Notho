import type { Metadata } from "next";
import { PublicGuide } from "@/components/PublicGuide";
import { canonical } from "@/lib/seo";

const title = "A budget that uses your rand";
const description =
  "Budget in rand with Notho. Plan income and expenses, import a statement for lookback, and keep the budget next to lessons. Notho does not log into your bank.";

export const metadata: Metadata = {
  title,
  description,
  keywords: ["budget app South Africa", "budgeting in rand", "bank statement budget", "Notho budget"],
  alternates: { canonical: canonical("/budgeting") },
  openGraph: { title, description, url: canonical("/budgeting") },
};

export default function BudgetingPage() {
  return (
    <PublicGuide
      badge="Budget"
      title={title}
      path="/budgeting"
      description={description}
      lede="Templates from another country do not survive a South African month. Build the plan from your income, rent, taxis, airtime and school costs."
      ctaHref="/budget"
      ctaLabel="Open Budget"
      points={[
        { title: "Your categories", body: "Not a forced 50/30/20. Name the spend the way your month actually works." },
        { title: "Statement lookback", body: "Import a file to sort recent spend. The file is not kept, and it is not a live bank login." },
        { title: "Next to the lesson", body: "When a lesson says needs versus wants, the budget is one tap away." },
      ]}
      steps={["Add what comes in.", "Sort what leaves.", "See if the month is on plan."]}
      faqs={[
        { q: "Is Notho a budgeting app?", a: "Yes. The Budget tab plans income, expenses and categories in rand. You can import a statement for lookback. Notho does not connect to live banking logins." },
        { q: "Does Notho store my bank statement file?", a: "The file is read in memory and is not kept. Categorised transactions you confirm can be saved to your budget." },
        { q: "Is this only a 50/30/20 calculator?", a: "No. Rules of thumb are teaching devices. The budget is built around your categories." },
      ]}
    />
  );
}
