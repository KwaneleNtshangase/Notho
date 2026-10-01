import type { Metadata } from "next";
import { PublicGuide } from "@/components/PublicGuide";
import { canonical } from "@/lib/seo";

const title = "RE5 prep that feels like practice";
const description =
  "Prepare for the South African RE5 regulatory exam with Notho lessons and mocks. Study support only — Notho is not an FSP and does not issue licences.";

export const metadata: Metadata = {
  title,
  description,
  keywords: ["RE5 exam", "RE5 prep", "RE5 South Africa", "Notho RE5"],
  alternates: { canonical: canonical("/re5") },
  openGraph: { title, description, url: canonical("/re5") },
};

export default function Re5Page() {
  return (
    <PublicGuide
      badge="RE5"
      title={title}
      path="/re5"
      description={description}
      lede="Sitting RE5? Practise the material in short sets and mocks. Notho does not sit the exam for you, and it does not make you a representative."
      ctaHref="/learn"
      ctaLabel="Open RE5 prep"
      points={[
        { title: "A path of its own", body: "RE5 stays out of everyday literacy review, so a budget lesson never turns into an exam prompt." },
        { title: "Mocks, not a licence", body: "Use them to find weak spots. The official result still sits with the exam body." },
        { title: "Study support only", body: "Notho is not an FSP and does not appoint or licence representatives." },
      ]}
      steps={["Open Learn and choose RE5.", "Work a lesson set.", "Run a mock before the real paper."]}
      faqs={[
        { q: "Can I study for RE5 on Notho?", a: "Yes. There is an RE5 exam-prep path and mocks. Passing a Notho lesson is not the same as passing the official exam." },
        { q: "Does Notho licence me as a representative?", a: "No. Licensing sits with the FSCA and your employer or FSP. Notho is study material." },
      ]}
    />
  );
}
