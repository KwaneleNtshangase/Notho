import type { Metadata } from "next";
import { PublicGuide } from "@/components/PublicGuide";
import { canonical } from "@/lib/seo";

const title = "Personal finance, in this country";
const description =
  "A practical personal-finance path for South Africa: budget in rand, understand TFSA and RA wrappers, and use Notho lessons and calculators without treating them as advice.";

export const metadata: Metadata = {
  title,
  description,
  keywords: ["personal finance South Africa", "personal finance app South Africa", "learn personal finance", "Notho"],
  alternates: { canonical: canonical("/personal-finance") },
  openGraph: { title, description, url: canonical("/personal-finance") },
};

export default function PersonalFinancePage() {
  return (
    <PublicGuide
      badge="Start here"
      title={title}
      path="/personal-finance"
      description={description}
      lede="See the money. Name the trade-off. Practise the number. That is the useful order — not a US textbook with a rand sign stuck on."
      ctaHref="/learn"
      ctaLabel="Start free"
      points={[
        { title: "Budget first", body: "Know what comes in and what leaves before you chase a product." },
        { title: "Then the local words", body: "Emergency cash, debt cost, TFSA caps, retirement annuity, living annuity." },
        { title: "Then a scenario", body: "Run it in the calculator so fees and inflation stop being abstract." },
      ]}
      steps={["Open Budget and type this month.", "Take one lesson on the idea that confused you.", "Project it in Calculate."]}
      faqs={[
        { q: "What is a good personal finance app for South Africa?", a: "Use one that works in rand, understands TFSA and RA, and teaches the ideas. Notho is that literacy path. It is not an FSP." },
        { q: "Where should a South African start?", a: "A budget that matches real income and expenses, a cash buffer, then the difference between saving, investing, and wrappers." },
        { q: "Is Notho a bank or an investment platform?", a: "No. It does not hold your money or sell investments." },
      ]}
    />
  );
}
