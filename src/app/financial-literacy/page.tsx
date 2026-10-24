import type { Metadata } from "next";
import { PublicGuide } from "@/components/PublicGuide";
import { canonical } from "@/lib/seo";

const title = "Learn money in five-minute lessons";
const description =
  "Learn financial literacy the South African way with Notho: short lessons, spaced review, and practice in the calculator and budget. Education only — not an FSP.";

export const metadata: Metadata = {
  title,
  description,
  keywords: ["financial literacy South Africa", "learn money South Africa", "financial education app", "Notho learn"],
  alternates: { canonical: canonical("/financial-literacy") },
  openGraph: { title, description, url: canonical("/financial-literacy") },
};

export default function FinancialLiteracyPage() {
  return (
    <PublicGuide
      badge="Learn"
      title={title}
      path="/financial-literacy"
      description={description}
      lede="Stop saving articles you never finish. Notho teaches one South African money idea, then brings it back until you can use it."
      ctaHref="/learn"
      ctaLabel="Start learning"
      points={[
        { title: "Local, not imported", body: "Rand, TFSA, retirement annuities, taxis, airtime, school fees. Not a US course with the currency swapped." },
        { title: "Review that actually returns", body: "A lesson does not graduate the idea. Review brings the card back so it sticks." },
        { title: "Then the numbers", body: "Calculate and Budget sit next to the lesson so compounding is not only a definition." },
      ]}
      steps={["Open Learn and pick a course.", "Finish a short lesson.", "Come back tomorrow when the card is due."]}
      faqs={[
        { q: "What is the best way to learn financial literacy in South Africa?", a: "Short lessons on local ideas, then review until you can explain them, then practise with a rand calculator and a real budget. That is the Notho loop." },
        { q: "Does Notho teach RE5?", a: "Yes. There is a dedicated RE5 prep path. Everyday review stays on literacy and does not nag you about the exam." },
        { q: "Is Cosmo a financial adviser?", a: "No. Cosmo is the in-app literacy assistant. It is a C mark, not a person, and it does not give personalised advice." },
      ]}
    />
  );
}
