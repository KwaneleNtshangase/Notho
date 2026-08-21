"use client";

import { BudgetView } from "@/components/BudgetPlanner";
import { BiometricGate } from "@/components/BiometricGate";

export default function BudgetPage() {
  return (
    <BiometricGate>
      <BudgetView />
    </BiometricGate>
  );
}
