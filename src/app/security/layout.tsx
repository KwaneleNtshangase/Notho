import { LocalizedText as I18nText } from "@/i18n/LocalizedText";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Data & Security | Notho",
  description:
    "How Notho protects your data — encryption, row-level security, and your POPIA rights.",
};

export default function SecurityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <><I18nText>{children}</I18nText></>;
}
