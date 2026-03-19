/**
 * Unit tests for calculateProjections.js
 *
 * Every expected value is derived by hand so the tests act as an independent
 * verification of the math — not just a round-trip through the same code.
 *
 * Manual calculation reference (DEFAULT_INPUTS):
 *   baseSalary = 125,000  oldRate = 4.5%  newRate = 3.0%  currentService = 4
 *
 * Year 1 (hand-computed):
 *   oldSalary  = 125,000 × 1.045       = 130,625.000
 *   newSalary  = 125,000 × 1.03        = 128,750.000
 *   annualDef  = 130,625 − 128,750     = 1,875.000
 *   cumDef     = 1,875.000
 *   oldBest3   = 130,625 / 1           = 130,625.000   (only 1 year available)
 *   newBest3   = 128,750 / 1           = 128,750.000
 *   totalSvc   = 4 + 1                 = 5
 *   oldPension = 0.018 × 5 × 130,625  = 11,756.250
 *   newPension = 0.018 × 5 × 128,750  = 11,587.500
 *   pensDef    = 11,756.25 − 11,587.5  = 168.750
 *   empSavings = 0.098 × 1,875        = 183.750
 *
 * Year 2 (hand-computed):
 *   oldSalary  = 125,000 × 1.045²     = 136,503.125
 *   newSalary  = 125,000 × 1.03²      = 132,612.500
 *   annualDef  = 136,503.125 − 132,612.5 = 3,890.625
 *   cumDef     = 1,875 + 3,890.625    = 5,765.625
 *   oldBest3   = (130,625 + 136,503.125) / 2 = 133,564.0625
 *   newBest3   = (128,750 + 132,612.5) / 2   = 130,681.250
 *   totalSvc   = 4 + 2                = 6
 *   oldPension = 0.018 × 6 × 133,564.0625 = 14,424.7187…
 *   newPension = 0.018 × 6 × 130,681.25   = 14,113.575
 *
 * Year 3 (hand-computed — first full 3-year window):
 *   oldSalary  = 125,000 × 1.045³     = 142,645.765625
 *   newSalary  = 125,000 × 1.03³      = 136,590.875
 *   oldBest3   = (130,625 + 136,503.125 + 142,645.765625) / 3
 *              = 409,773.890625 / 3   = 136,591.296875
 *   newBest3   = (128,750 + 132,612.5 + 136,590.875) / 3
 *              = 397,953.375 / 3      = 132,651.125
 *
 * Year 4 (hand-computed — window slides, drops Year 1):
 *   oldSalary  = 125,000 × 1.045⁴     ≈ 149,064.875...
 *   oldBest3 window = [yr2, yr3, yr4] = [136,503.125, 142,645.765625, oldSalary_yr4]
 *   (no longer includes Year 1's 130,625)
 */

import { describe, it, expect } from 'vitest';
import { calculateProjections } from './calculateProjections.js';

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Rounds to a given number of decimal places to avoid FP noise in assertions */
function round(val, decimals = 4) {
  return Math.round(val * 10 ** decimals) / 10 ** decimals;
}

const DEFAULT_INPUTS = {
  baseSalary: 125_000,
  oldRate: 4.5,
  newRate: 3.0,
  currentService: 4,
  maxHorizon: 30,
};

// ─── Salary compounding ───────────────────────────────────────────────────────

describe('Salary compounding', () => {
  it('Year 1: old salary = baseSalary × (1 + 0.045)^1', () => {
    const [yr1] = calculateProjections(DEFAULT_INPUTS);
    expect(round(yr1.oldSalary)).toBe(round(125_000 * 1.045));
  });

  it('Year 1: new salary = baseSalary × (1 + 0.030)^1', () => {
    const [yr1] = calculateProjections(DEFAULT_INPUTS);
    expect(round(yr1.newSalary)).toBe(round(125_000 * 1.03));
  });

  it('Year 2: old salary = baseSalary × 1.045^2', () => {
    const [, yr2] = calculateProjections(DEFAULT_INPUTS);
    expect(round(yr2.oldSalary)).toBe(round(125_000 * 1.045 ** 2));
  });

  it('Year 5: old salary = baseSalary × 1.045^5', () => {
    const data = calculateProjections(DEFAULT_INPUTS);
    const yr5 = data[4];
    expect(round(yr5.oldSalary)).toBe(round(125_000 * 1.045 ** 5));
  });

  it('Each year oldSalary > newSalary when oldRate > newRate', () => {
    const data = calculateProjections(DEFAULT_INPUTS);
    data.forEach((yr) => {
      expect(yr.oldSalary).toBeGreaterThan(yr.newSalary);
    });
  });

  it('Salaries are strictly increasing year-over-year', () => {
    const data = calculateProjections(DEFAULT_INPUTS);
    for (let i = 1; i < data.length; i++) {
      expect(data[i].oldSalary).toBeGreaterThan(data[i - 1].oldSalary);
      expect(data[i].newSalary).toBeGreaterThan(data[i - 1].newSalary);
    }
  });

  it('Salaries are equal when both rates are the same', () => {
    const data = calculateProjections({ ...DEFAULT_INPUTS, oldRate: 3.0, newRate: 3.0 });
    data.forEach((yr) => {
      expect(round(yr.oldSalary)).toBe(round(yr.newSalary));
    });
  });
});

// ─── Annual deficit ───────────────────────────────────────────────────────────

describe('Annual salary deficit', () => {
  it('Year 1: annualDeficit = 130,625 − 128,750 = 1,875', () => {
    const [yr1] = calculateProjections(DEFAULT_INPUTS);
    expect(round(yr1.annualDeficit)).toBe(round(1_875));
  });

  it('annualDeficit === oldSalary − newSalary every year', () => {
    const data = calculateProjections(DEFAULT_INPUTS);
    data.forEach((yr) => {
      expect(round(yr.annualDeficit)).toBe(round(yr.oldSalary - yr.newSalary));
    });
  });

  it('deficit is 0 when rates are equal', () => {
    const data = calculateProjections({ ...DEFAULT_INPUTS, oldRate: 3.5, newRate: 3.5 });
    data.forEach((yr) => {
      expect(round(yr.annualDeficit)).toBe(0);
    });
  });

  it('deficit grows year-over-year (compounding gap)', () => {
    const data = calculateProjections(DEFAULT_INPUTS);
    for (let i = 1; i < data.length; i++) {
      expect(data[i].annualDeficit).toBeGreaterThan(data[i - 1].annualDeficit);
    }
  });
});

// ─── Cumulative deficit ───────────────────────────────────────────────────────

describe('Cumulative salary deficit', () => {
  it('Year 1 cumulative = Year 1 annual deficit', () => {
    const [yr1] = calculateProjections(DEFAULT_INPUTS);
    expect(round(yr1.cumulativeSalaryDeficit)).toBe(round(yr1.annualDeficit));
  });

  it('Year 2 cumulative = Year 1 + Year 2 annual deficits', () => {
    const [yr1, yr2] = calculateProjections(DEFAULT_INPUTS);
    expect(round(yr2.cumulativeSalaryDeficit)).toBe(round(yr1.annualDeficit + yr2.annualDeficit));
  });

  it('cumulativeDeficit equals the running sum of all annual deficits', () => {
    const data = calculateProjections(DEFAULT_INPUTS);
    let runningSum = 0;
    data.forEach((yr) => {
      runningSum += yr.annualDeficit;
      expect(round(yr.cumulativeSalaryDeficit)).toBe(round(runningSum));
    });
  });

  it('cumulativeSalaryDeficit is always >= annualDeficit for any year', () => {
    const data = calculateProjections(DEFAULT_INPUTS);
    data.forEach((yr) => {
      expect(yr.cumulativeSalaryDeficit).toBeGreaterThanOrEqual(yr.annualDeficit);
    });
  });

  it('cumulative deficit is 0 every year when rates are equal', () => {
    const data = calculateProjections({ ...DEFAULT_INPUTS, oldRate: 2, newRate: 2 });
    data.forEach((yr) => {
      expect(round(yr.cumulativeSalaryDeficit)).toBe(0);
    });
  });
});

// ─── Best-3 average (the core pension input) ──────────────────────────────────

describe('Best-3 average salary (rolling recency window)', () => {
  it('Year 1: Best-3 average = this year\'s salary only (1-entry window)', () => {
    const [yr1] = calculateProjections(DEFAULT_INPUTS);
    // Only 1 year exists → average of 1
    expect(round(yr1.oldBest3Avg)).toBe(round(yr1.oldSalary));
    expect(round(yr1.newBest3Avg)).toBe(round(yr1.newSalary));
  });

  it('Year 2: Best-3 average = (yr1 + yr2) / 2 (2-entry window)', () => {
    const [yr1, yr2] = calculateProjections(DEFAULT_INPUTS);
    const expectedOld = (yr1.oldSalary + yr2.oldSalary) / 2;
    const expectedNew = (yr1.newSalary + yr2.newSalary) / 2;
    expect(round(yr2.oldBest3Avg)).toBe(round(expectedOld));
    expect(round(yr2.newBest3Avg)).toBe(round(expectedNew));
  });

  it('Year 3: Best-3 average = (yr1 + yr2 + yr3) / 3 (first full window)', () => {
    const [yr1, yr2, yr3] = calculateProjections(DEFAULT_INPUTS);
    const expectedOld = (yr1.oldSalary + yr2.oldSalary + yr3.oldSalary) / 3;
    const expectedNew = (yr1.newSalary + yr2.newSalary + yr3.newSalary) / 3;
    expect(round(yr3.oldBest3Avg)).toBe(round(expectedOld));
    expect(round(yr3.newBest3Avg)).toBe(round(expectedNew));
  });

  it('Year 4: window slides — uses yr2, yr3, yr4 (NOT yr1)', () => {
    const data = calculateProjections(DEFAULT_INPUTS);
    const [yr1, yr2, yr3, yr4] = data;
    // Should include yr2, yr3, yr4 only
    const expectedOld = (yr2.oldSalary + yr3.oldSalary + yr4.oldSalary) / 3;
    const expectedNew = (yr2.newSalary + yr3.newSalary + yr4.newSalary) / 3;
    expect(round(yr4.oldBest3Avg)).toBe(round(expectedOld));
    expect(round(yr4.newBest3Avg)).toBe(round(expectedNew));
    // Explicitly verify yr1 is NOT accidentally included
    const wrongOld = (yr1.oldSalary + yr2.oldSalary + yr3.oldSalary) / 3;
    expect(round(yr4.oldBest3Avg)).not.toBe(round(wrongOld));
  });

  it('Year 10: window is always exactly the 3 most recent years', () => {
    const data = calculateProjections(DEFAULT_INPUTS);
    const yr8  = data[7];
    const yr9  = data[8];
    const yr10 = data[9];
    const expectedOld = (yr8.oldSalary + yr9.oldSalary + yr10.oldSalary) / 3;
    expect(round(yr10.oldBest3Avg)).toBe(round(expectedOld));
  });

  it('Best-3 average is always between the oldest and newest salary in the window', () => {
    const data = calculateProjections(DEFAULT_INPUTS);
    // From year 3+ the window is [N-2, N-1, N]; since salaries grow,
    // oldSalary[N-2] < best3Avg < oldSalary[N]
    data.slice(2).forEach((yr, i) => {
      const prev2 = data[i];     // index i corresponds to year i+1
      expect(yr.oldBest3Avg).toBeGreaterThan(prev2.oldSalary);
      expect(yr.oldBest3Avg).toBeLessThan(yr.oldSalary);
    });
  });
});

// ─── DB pension formula ───────────────────────────────────────────────────────

describe('DB pension: 1.8% × totalService × best3Avg', () => {
  it('Year 1: totalService = currentService + 1 = 5', () => {
    const [yr1] = calculateProjections(DEFAULT_INPUTS);
    expect(yr1.totalService).toBe(5);
  });

  it('Year 1: oldPension = 0.018 × 5 × 130,625 = 11,756.25', () => {
    const [yr1] = calculateProjections(DEFAULT_INPUTS);
    expect(round(yr1.oldPension)).toBe(round(0.018 * 5 * 130_625));
  });

  it('Year 1: newPension = 0.018 × 5 × 128,750 = 11,587.5', () => {
    const [yr1] = calculateProjections(DEFAULT_INPUTS);
    expect(round(yr1.newPension)).toBe(round(0.018 * 5 * 128_750));
  });

  it('Year 1: pensionDeficit = oldPension − newPension', () => {
    const [yr1] = calculateProjections(DEFAULT_INPUTS);
    expect(round(yr1.pensionDeficit)).toBe(round(yr1.oldPension - yr1.newPension));
  });

  it('Pension formula holds for every year: p = 0.018 × totalService × best3Avg', () => {
    const data = calculateProjections(DEFAULT_INPUTS);
    data.forEach((yr) => {
      expect(round(yr.oldPension)).toBe(round(0.018 * yr.totalService * yr.oldBest3Avg));
      expect(round(yr.newPension)).toBe(round(0.018 * yr.totalService * yr.newBest3Avg));
    });
  });

  it('pensionDeficit is always positive when oldRate > newRate', () => {
    const data = calculateProjections(DEFAULT_INPUTS);
    data.forEach((yr) => {
      expect(yr.pensionDeficit).toBeGreaterThan(0);
    });
  });

  it('Pension grows every year (more service + higher salary)', () => {
    const data = calculateProjections(DEFAULT_INPUTS);
    for (let i = 1; i < data.length; i++) {
      expect(data[i].oldPension).toBeGreaterThan(data[i - 1].oldPension);
      expect(data[i].newPension).toBeGreaterThan(data[i - 1].newPension);
    }
  });

  it('totalService increases by 1 each year', () => {
    const data = calculateProjections(DEFAULT_INPUTS);
    data.forEach((yr, i) => {
      expect(yr.totalService).toBe(DEFAULT_INPUTS.currentService + (i + 1));
    });
  });

  it('0 years currentService: totalService starts at 1 in year 1', () => {
    const data = calculateProjections({ ...DEFAULT_INPUTS, currentService: 0 });
    expect(data[0].totalService).toBe(1);
  });
});

// ─── Employer pension savings ─────────────────────────────────────────────────

describe('Employer pension savings: 9.8% of cumulative salary deficit', () => {
  it('Year 1: employerSavings = 0.098 × 1,875 = 183.75', () => {
    const [yr1] = calculateProjections(DEFAULT_INPUTS);
    expect(round(yr1.employerSavings)).toBe(round(0.098 * 1_875));
  });

  it('Year 2: employerSavings = cumulative (yr1 + yr2 annualDeficits) × 0.098', () => {
    const [yr1, yr2] = calculateProjections(DEFAULT_INPUTS);
    const expected = 0.098 * (yr1.annualDeficit + yr2.annualDeficit);
    expect(round(yr2.employerSavings)).toBe(round(expected));
  });

  it('employerSavings = 0.098 × cumulativeSalaryDeficit every year', () => {
    const data = calculateProjections(DEFAULT_INPUTS);
    data.forEach((yr) => {
      expect(round(yr.employerSavings)).toBe(round(0.098 * yr.cumulativeSalaryDeficit));
    });
  });

  it('Employer savings are always increasing', () => {
    const data = calculateProjections(DEFAULT_INPUTS);
    for (let i = 1; i < data.length; i++) {
      expect(data[i].employerSavings).toBeGreaterThan(data[i - 1].employerSavings);
    }
  });

  it('Employer savings are 0 when both rates are equal', () => {
    const data = calculateProjections({ ...DEFAULT_INPUTS, oldRate: 3, newRate: 3 });
    data.forEach((yr) => {
      expect(round(yr.employerSavings)).toBe(0);
    });
  });
});

// ─── Output structure ─────────────────────────────────────────────────────────

describe('Output structure and length', () => {
  it('Returns exactly maxHorizon entries', () => {
    const data = calculateProjections({ ...DEFAULT_INPUTS, maxHorizon: 15 });
    expect(data).toHaveLength(15);
  });

  it('Default maxHorizon produces 30 entries', () => {
    const data = calculateProjections(DEFAULT_INPUTS);
    expect(data).toHaveLength(30);
  });

  it('year field matches 1-based index', () => {
    const data = calculateProjections(DEFAULT_INPUTS);
    data.forEach((yr, i) => {
      expect(yr.year).toBe(i + 1);
    });
  });

  it('Every entry has all required fields', () => {
    const REQUIRED_FIELDS = [
      'year', 'oldSalary', 'newSalary', 'annualDeficit',
      'cumulativeSalaryDeficit', 'oldBest3Avg', 'newBest3Avg',
      'totalService', 'oldPension', 'newPension', 'pensionDeficit',
      'employerSavings',
    ];
    const data = calculateProjections(DEFAULT_INPUTS);
    data.forEach((yr) => {
      REQUIRED_FIELDS.forEach((field) => {
        expect(yr).toHaveProperty(field);
        expect(typeof yr[field]).toBe('number');
        expect(isFinite(yr[field])).toBe(true);
      });
    });
  });
});

// ─── Edge cases ───────────────────────────────────────────────────────────────

describe('Edge cases', () => {
  it('Very small rate difference still produces positive deficit', () => {
    const data = calculateProjections({ ...DEFAULT_INPUTS, oldRate: 3.01, newRate: 3.0 });
    data.forEach((yr) => {
      expect(yr.annualDeficit).toBeGreaterThan(0);
    });
  });

  it('maxHorizon = 1 returns exactly 1 entry', () => {
    const data = calculateProjections({ ...DEFAULT_INPUTS, maxHorizon: 1 });
    expect(data).toHaveLength(1);
  });

  it('High service years: totalService is correctly offset', () => {
    const data = calculateProjections({ ...DEFAULT_INPUTS, currentService: 30 });
    expect(data[0].totalService).toBe(31);
    expect(data[14].totalService).toBe(45);
  });

  it('Zero base salary produces all zeros', () => {
    const data = calculateProjections({ ...DEFAULT_INPUTS, baseSalary: 0 });
    data.forEach((yr) => {
      expect(yr.oldSalary).toBe(0);
      expect(yr.newSalary).toBe(0);
      expect(yr.annualDeficit).toBe(0);
      expect(yr.oldPension).toBe(0);
    });
  });
});
