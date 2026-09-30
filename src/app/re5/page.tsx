import type { Metadata } from "next";
import Link from "next/link";
import { PublicGuide, guideStyles } from "@/components/PublicGuide";
import { canonical } from "@/lib/seo";

const title = "RE5 exam prep";
const description =
  "Prepare for the South African RE5 regulatory exam with Notho lessons and mocks. Study support only — Notho is not an FSP and does not issue licences.";

export const metadata: Metadata = {
  title,
  description,
  keywords: ["RE5 exam", "RE5 prep", "RE5 South Africa", "Notho RE5"],
  alternates: { canonical: canonical("/re5") },
  openGraph: { title, description, url: canonical("/re5") },
};

const faqs = [
  {
    q: "Can I study for RE5 on Notho?",
    a: "Yes. Notho includes an RE5 exam-prep path and mock exams. Passing Notho lessons is not the same as passing the official exam.",
  },
  {
    q: "Does Notho licence me as a representative?",
    a: "No. Licensing sits with the FSCA and your employer or FSP. Notho is study material.",
  },
];

export default function Re5Page() {
  const { p, h2 } = guideStyles;
  return (
    <PublicGuide
      badge="RE5"
      title={title}
      path="/re5"
      description={description}
      lede="RE5 is a regulatory exam. Notho gives you a place to practise the material. It does not sit the exam for you and it does not make you an authorised representative."
      faqs={faqs}
    >
      <h2 style={h2}>How to use it</h2>
      <p style={p}>
        Open the RE5 course from{" "}
        <Link href="/learn" style={{ color: guideStyles.teal }}>
          Learn
        </Link>{" "}
        or the readiness screen in the app. Everyday literacy review stays
        separate so a money lesson does not turn into an RE5 prompt.
      </p>
    </PublicGuide>
  );
}
