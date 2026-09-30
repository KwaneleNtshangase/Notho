import type { Metadata } from "next";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Learn personal finance",
  description:
    "Notho Learn: short South African financial-literacy lessons, review cards and RE5 prep. Education only — not financial advice.",
  alternates: { canonical: canonical("/learn") },
};

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
