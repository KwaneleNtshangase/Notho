"use client";

import { useEffect } from "react";
import { BudgetView } from "@/components/BudgetPlanner";
import { BiometricGate } from "@/components/BiometricGate";
import { markBudgetVisitedToday } from "@/lib/dailyChallengeFlags";

export default function BudgetPage() {
  useEffect(() => {
    markBudgetVisitedToday();
  }, []);
  return (
    <BiometricGate>
      <BudgetView />
    </BiometricGate>
  );
}
