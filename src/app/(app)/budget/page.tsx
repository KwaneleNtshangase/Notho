"use client";

import { BudgetView } from "@/components/BudgetPlanner";
import { BudgetTransactionSearch } from "@/components/BudgetTransactionSearch";
import { BiometricGate } from "@/components/BiometricGate";

export default function BudgetPage() {
  return (
    <BiometricGate>
      <BudgetTransactionSearch />
      <BudgetView />
    </BiometricGate>
  );
}
