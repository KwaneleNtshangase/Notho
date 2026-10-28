import type { Metadata } from "next";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Money goals",
  description:
    "Set optional money goals in Notho after you start learning. Goals are yours to skip or add later.",
  alternates: { canonical: canonical("/quests") },
};

export default function QuestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
