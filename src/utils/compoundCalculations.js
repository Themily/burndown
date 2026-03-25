/**
 * Compound Interest calculation engine.
 * Month-by-month iteration to support different compounding/contribution frequencies.
 */

import { round2 } from './calculations';

/**
 * Convert frequency string to periods per year.
 */
export function freqToPeriodsPerYear(freq) {
  switch (freq) {
    case 'monthly': return 12;
    case 'quarterly': return 4;
    case 'annually': return 1;
    default: return 12;
  }
}

/**
 * Check if a given month (1-based) is a compounding/contribution period.
 */
function isPeriod(month, periodsPerYear) {
  if (periodsPerYear === 12) return true;
  if (periodsPerYear === 4) return month % 3 === 0;
  if (periodsPerYear === 1) return month % 12 === 0;
  return true;
}

/**
 * Core compound growth calculation.
 *
 * @param {Object} inputs
 * @param {number} inputs.principal - Starting amount
 * @param {number} inputs.annualRate - Annual interest rate (%)
 * @param {number} inputs.years - Investment duration
 * @param {number} [inputs.contributionAmount=0] - Periodic contribution
 * @param {string} [inputs.contributionFreq='monthly'] - 'monthly' | 'quarterly' | 'annually'
 * @param {string} [inputs.compoundingFreq='monthly'] - 'monthly' | 'quarterly' | 'annually'
 * @param {number} [inputs.inflationRate=0] - Annual inflation rate (%)
 * @param {number} [inputs.taxRate=0] - Tax rate on gains (%)
 * @returns {Object} Full result with yearly/monthly data
 */
export function calculateCompoundGrowth(inputs) {
  const {
    principal = 10000,
    annualRate = 7,
    years = 20,
    contributionAmount = 0,
    contributionFreq = 'monthly',
    compoundingFreq = 'monthly',
    inflationRate = 0,
    taxRate = 0,
  } = inputs;

  const totalMonths = years * 12;
  const compoundingPeriods = freqToPeriodsPerYear(compoundingFreq);
  const contributionPeriods = freqToPeriodsPerYear(contributionFreq);
  const ratePerCompoundPeriod = (annualRate / 100) / compoundingPeriods;

  let balance = principal;
  let totalContributions = principal;
  const monthlyData = [{ month: 0, balance: round2(principal), contributions: round2(principal), interest: 0 }];
  const yearlyData = [];

  let yearStartBalance = principal;

  for (let m = 1; m <= totalMonths; m++) {
    // Apply compounding interest if this month is a compounding period
    if (isPeriod(m, compoundingPeriods)) {
      balance = balance * (1 + ratePerCompoundPeriod);
    }

    // Add contribution if this month is a contribution period
    if (isPeriod(m, contributionPeriods)) {
      balance += contributionAmount;
      totalContributions += contributionAmount;
    }

    const interest = balance - totalContributions;

    monthlyData.push({
      month: m,
      balance: round2(balance),
      contributions: round2(totalContributions),
      interest: round2(interest),
    });

    // Year-end snapshot
    if (m % 12 === 0) {
      const year = m / 12;
      const yearInterest = balance - totalContributions;
      const yearContributions = totalContributions - (year > 1 ? yearlyData[year - 2]?.cumulativeContributions || principal : principal);
      const inflationFactor = inflationRate > 0 ? Math.pow(1 + inflationRate / 100, year) : 1;

      yearlyData.push({
        year,
        startingBalance: round2(yearStartBalance),
        contributions: round2(totalContributions - (yearlyData.length > 0 ? yearlyData[yearlyData.length - 1]?.cumulativeContributions || principal : principal)),
        cumulativeContributions: round2(totalContributions),
        interest: round2(balance - yearStartBalance - (totalContributions - (yearlyData.length > 0 ? yearlyData[yearlyData.length - 1]?.cumulativeContributions || principal : principal))),
        endingBalance: round2(balance),
        totalInterest: round2(yearInterest),
        inflationAdjustedBalance: round2(balance / inflationFactor),
      });

      yearStartBalance = balance;
    }
  }

  // Recalculate yearly data more cleanly
  const cleanYearlyData = [];
  let prevCumulativeContributions = principal;
  let prevBalance = principal;

  for (let y = 1; y <= years; y++) {
    const monthIndex = y * 12;
    const dataPoint = monthlyData[monthIndex];
    if (!dataPoint) break;

    const yearContributions = dataPoint.contributions - prevCumulativeContributions;
    const yearInterestEarned = dataPoint.balance - prevBalance - yearContributions;
    const inflationFactor = inflationRate > 0 ? Math.pow(1 + inflationRate / 100, y) : 1;

    cleanYearlyData.push({
      year: y,
      startingBalance: round2(prevBalance),
      contributions: round2(yearContributions),
      cumulativeContributions: round2(dataPoint.contributions),
      interestEarned: round2(yearInterestEarned),
      endingBalance: round2(dataPoint.balance),
      totalInterest: round2(dataPoint.interest),
      inflationAdjustedBalance: round2(dataPoint.balance / inflationFactor),
    });

    prevCumulativeContributions = dataPoint.contributions;
    prevBalance = dataPoint.balance;
  }

  const finalBalance = round2(balance);
  const totalInterest = round2(balance - totalContributions);
  const inflationFactor = inflationRate > 0 ? Math.pow(1 + inflationRate / 100, years) : 1;
  const inflationAdjusted = round2(finalBalance / inflationFactor);
  const taxOnGains = round2(totalInterest * (taxRate / 100));
  const afterTaxBalance = round2(finalBalance - taxOnGains);

  // Effective annual rate (accounting for compounding frequency)
  const effectiveAnnualRate = round2((Math.pow(1 + (annualRate / 100) / compoundingPeriods, compoundingPeriods) - 1) * 100);

  return {
    finalBalance,
    totalContributions: round2(totalContributions),
    totalInterest,
    inflationAdjusted,
    effectiveAnnualRate,
    taxOnGains,
    afterTaxBalance,
    yearlyData: cleanYearlyData,
    monthlyData,
  };
}

/**
 * Build chart data from yearly results for Recharts.
 * Returns array of { year, contributions, interest, balance, scenarioBBalance? }
 */
export function buildChartData(resultA, resultB = null) {
  const data = [{ year: 0, contributions: resultA.monthlyData[0].contributions, interest: 0, balance: resultA.monthlyData[0].balance }];

  resultA.yearlyData.forEach((yd) => {
    const point = {
      year: yd.year,
      contributions: yd.cumulativeContributions,
      interest: yd.totalInterest,
      balance: yd.endingBalance,
    };
    if (resultB && resultB.yearlyData[yd.year - 1]) {
      point.scenarioBBalance = resultB.yearlyData[yd.year - 1].endingBalance;
    }
    data.push(point);
  });

  return data;
}
