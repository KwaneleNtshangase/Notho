const assert = require("node:assert/strict");

function calculateCompoundInterest(principal, annualRatePercent, years, compoundsPerYear) {
  const r = annualRatePercent / 100;
  const n = compoundsPerYear;
  return principal * Math.pow(1 + r / n, n * years);
}

function calculateLoanMonthlyPayment(principal, annualRatePercent, months) {
  if (months <= 0) return 0;
  const monthlyRate = annualRatePercent / 100 / 12;
  if (monthlyRate === 0) return principal / months;
  return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
}

function closeTo(a, b, tolerance = 0.02) {
  return Math.abs(a - b) <= tolerance;
}

const ci1 = calculateCompoundInterest(1000, 12, 1, 12);
assert.equal(closeTo(ci1, 1126.83), true, `Expected ~1126.83, got ${ci1}`);

const ci2 = calculateCompoundInterest(5000, 8, 10, 4);
assert.equal(closeTo(ci2, 11040.20, 0.2), true, `Expected ~11040.20, got ${ci2}`);

const loan1 = calculateLoanMonthlyPayment(100000, 12, 12);
assert.equal(closeTo(loan1, 8884.88, 0.2), true, `Expected ~8884.88, got ${loan1}`);

const loan2 = calculateLoanMonthlyPayment(250000, 10.5, 60);
assert.equal(closeTo(loan2, 5373.48, 0.05), true, `Expected ~5373.48, got ${loan2}`);

const loan3 = calculateLoanMonthlyPayment(120000, 0, 24);
assert.equal(loan3, 5000, `Expected 5000, got ${loan3}`);

assert.equal(calculateLoanMonthlyPayment(1000, 10, 0), 0);

console.log("Calculator checks passed.");
