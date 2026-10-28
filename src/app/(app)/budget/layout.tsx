import type { Metadata } from "next";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Budget planner",
  description:
    "Notho Budget: plan rand income and expenses and import a statement for lookback. Notho does not log into your bank.",
  alternates: { canonical: canonical("/budget") },
};

export default function BudgetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
