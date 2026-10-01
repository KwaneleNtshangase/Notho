import type { Metadata } from "next";
import { PublicGuide } from "@/components/PublicGuide";
import { SITE_DESCRIPTION, canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About Notho",
  description: SITE_DESCRIPTION,
  alternates: { canonical: canonical("/about") },
  openGraph: {
    title: "Notho — learn money the South African way",
    description: SITE_DESCRIPTION,
    url: canonical("/about"),
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <PublicGuide
      badge="The app"
      title="Learn money. Then use it."
      path="/about"
      description={SITE_DESCRIPTION}
      lede="Notho is the free South African app for short money lessons, rand calculators, and a budget that uses your numbers. Not a bank. Not an adviser."
      ctaHref="/learn"
      ctaLabel="Start a lesson"
      points={[
        { title: "Lessons that finish", body: "One idea, a few taps, then you are done. Review brings it back before it fades." },
        { title: "Calculators in rand", body: "TFSA, retirement annuity, living annuity, fees and inflation. A sketch, not a product quote." },
        { title: "A real budget", body: "Income, categories, and a statement lookback. Notho never logs into your bank." },
      ]}
      steps={[
        "Pick a lesson on Learn.",
        "Answer until the idea sticks.",
        "Open Calculate or Budget and try it on your own numbers.",
      ]}
      faqs={[
        { q: "Is Notho free?", a: "Yes. Start on the web or the stores without paying." },
        { q: "Is this financial advice?", a: "No. Lessons and calculators are education. For advice about your situation, use an FSCA-registered adviser." },
        { q: "Was this Fundi Finance?", a: "Yes. The app was renamed Notho in July 2026. Your progress stays with the same product." },
      ]}
    />
  );
}
