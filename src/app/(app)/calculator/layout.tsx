import type { Metadata } from "next";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Investment calculator",
  description:
    "Notho Calculate: rand investment, TFSA, retirement annuity and living-annuity projections with fees, inflation and withdrawals. Illustrative only.",
  alternates: { canonical: canonical("/calculator") },
};

export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
