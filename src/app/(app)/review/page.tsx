"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { ReviewSession } from "@/components/ReviewSession";

export default function ReviewPage() {
  const router = useRouter();
  const close = useCallback(() => {
    router.push("/learn");
  }, [router]);

  return <ReviewSession onClose={close} />;
}
