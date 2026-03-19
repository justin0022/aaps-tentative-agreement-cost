/**
 * calculateProjections
 *
 * Pure function — no side effects.
 * Returns an array of yearly projection objects covering `maxHorizon` years,
 * enabling both the full chart and any target-year summary cards.
 *
 * @param {object} params
 * @param {number} params.baseSalary      - Current annual salary
 * @param {number} params.oldRate         - Historical growth rate (%)
 * @param {number} params.newRate         - Capped growth rate (%)
 * @param {number} params.currentService  - Years of pensionable service already accrued
 * @param {number} params.maxHorizon      - Total years to project (default 30)
 * @returns {Array<YearlyProjection>}
 */
export const ACCRUAL_RATE = 0.018; // 1.8%
export const EMPLOYER_RATE = 0.198; // 19.8%
export const BEST_N = 3;

export function calculateProjections({
  baseSalary,
  oldRate,
  newRate,
  currentService,
  maxHorizon = 30,
}) {
  const rOld = oldRate / 100;
  const rNew = newRate / 100;

  // Build running salary history arrays so we can compute the Best-3 average
  const oldSalaries = [];
  const newSalaries = [];

  /**
   * Best-N average using *chronological recency*, not magnitude:
   *   - Year >= N : average of [salary(year-N+1) … salary(year-1), salary(year)]
   *                 i.e. this year's salary + the (N-1) years immediately prior
   *   - Year < N  : average of all available years (avoids dividing by N when
   *                 fewer than N data points exist)
   *
   * Because salaries compound upward, recency and magnitude produce the same
   * window — but the intent is explicitly the most-recent consecutive years.
   */
  function bestNAvg(salaryHistory) {
    // slice(-BEST_N) returns the last BEST_N entries in chronological order,
    // which is exactly: [year-2 salary, year-1 salary, this-year salary]
    // (or fewer entries if salaryHistory has < BEST_N items).
    const recentWindow = salaryHistory.slice(-BEST_N);
    return recentWindow.reduce((sum, s) => sum + s, 0) / recentWindow.length;
  }

  const projections = [];
  let cumulativeSalaryDeficit = 0;
  let cumulativeEmployerSavings = 0;

  for (let year = 1; year <= maxHorizon; year++) {
    // Compounding salaries
    const oldSalary = baseSalary * Math.pow(1 + rOld, year);
    const newSalary = baseSalary * Math.pow(1 + rNew, year);

    oldSalaries.push(oldSalary);
    newSalaries.push(newSalary);

    // Annual and cumulative salary deficit
    const annualDeficit = oldSalary - newSalary;
    cumulativeSalaryDeficit += annualDeficit;

    // Best-3 average salary at this year
    const oldBest3Avg = bestNAvg(oldSalaries);
    const newBest3Avg = bestNAvg(newSalaries);

    // Total pensionable service at this point
    const totalService = currentService + year;

    // DB pension annual payout at this year
    const oldPension = ACCRUAL_RATE * totalService * oldBest3Avg;
    const newPension = ACCRUAL_RATE * totalService * newBest3Avg;
    const pensionDeficit = oldPension - newPension;

    // Total employer savings = salary they didn't pay (deficit) + benefits they didn't pay on that salary
    const annualEmployerSavings = annualDeficit * (1 + EMPLOYER_RATE);
    cumulativeEmployerSavings += annualEmployerSavings;

    projections.push({
      year,
      oldSalary,
      newSalary,
      annualDeficit,
      cumulativeSalaryDeficit,
      oldBest3Avg,
      newBest3Avg,
      totalService,
      oldPension,
      newPension,
      pensionDeficit,
      employerSavings: annualEmployerSavings,
      cumulativeEmployerSavings,
    });
  }

  return projections;
}
