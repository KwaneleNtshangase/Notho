import type { Metadata } from "next";
import { PublicGuide } from "@/components/PublicGuide";
import { canonical } from "@/lib/seo";

const title = "See the number before you commit";
const description =
  "Use Notho's South African investment calculator for contributions, withdrawals, fees and inflation, including TFSA, retirement annuity and living-annuity wrappers. Educational estimates only.";

export const metadata: Metadata = {
  title,
  description,
  keywords: ["investment calculator South Africa", "TFSA calculator", "retirement annuity calculator", "compound interest calculator rand", "Notho calculator"],
  alternates: { canonical: canonical("/investment-calculator") },
  openGraph: { title, description, url: canonical("/investment-calculator") },
};

export default function InvestmentCalculatorPage() {
  return (
    <PublicGuide
      badge="Calculate"
      title={title}
      path="/investment-calculator"
      description={description}
      lede="A rand calculator for the question you actually have: how long at this contribution, after fees and inflation, inside a TFSA or retirement annuity."
      ctaHref="/calculator"
      ctaLabel="Open the calculator"
      points={[
        { title: "Monthly compounding", body: "Nominal rate compounds monthly across contribution frequencies, so the sketch matches the lesson." },
        { title: "Fees and inflation", body: "The ending number is not only nominal. Withdraw in rand or as a percent of the pot." },
        { title: "Wrappers, not products", body: "TFSA, RA and living annuity change the picture. Notho does not pick a fund or a platform." },
      ]}
      steps={["Set a start and a monthly amount.", "Add fees, inflation, or a wrapper.", "Read the sketch. It is not a quote."]}
      faqs={[
        { q: "Does Notho have an investment calculator for South Africa?", a: "Yes. Calculate projects growth with monthly compounding, rand or percent withdrawals, fees and inflation, plus TFSA, retirement annuity and living-annuity wrappers." },
        { q: "Is the calculator financial advice?", a: "No. Results are generic illustrations. They are not a recommendation to buy or sell anything." },
        { q: "What can I model?", a: "Starting balance, contributions, time to a goal, withdrawals, fees, inflation, and TFSA, RA and living-annuity wrappers." },
      ]}
    />
  );
}
