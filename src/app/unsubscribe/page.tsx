import type { Metadata } from "next";
import { Suspense } from "react";
import UnsubscribeClient from "./UnsubscribeClient";

export const metadata: Metadata = {
  title: "Email preferences | Notho",
  description: "Choose how often you hear from Notho, or stop emails altogether.",
  // Tokenised URLs must never end up in a search index.
  robots: { index: false, follow: false },
};

export default function UnsubscribePage() {
  // useSearchParams needs a Suspense boundary or the whole route opts out of
  // static rendering and the build warns.
  return (
    <Suspense fallback={null}>
      <UnsubscribeClient />
    </Suspense>
  );
}
