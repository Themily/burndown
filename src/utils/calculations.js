/**
 * Core financial calculation engine for BurnDown.
 * All currency values are rounded to 2 decimal places for display.
 * Internal calculations use full precision.
 */

export const DEBT_TYPES = [
  { value: 'credit_card', label: 'Credit Card', icon: '💳' },
  { value: 'student_loan', label: 'Student Loan', icon: '🎓' },
  { value: 'auto_loan', label: 'Auto Loan', icon: '🚗' },
  { value: 'personal_loan', label: 'Personal Loan', icon: '🏦' },
  { value: 'medical', label: 'Medical Debt', icon: '🏥' },
  { value: 'heloc', label: 'HELOC', icon: '🏠' },
  { value: 'other', label: 'Other', icon: '📋' },
];

export const DEFAULT_DEBTS = [
  {
    id: 'default-1',
    name: 'Chase Sapphire',
    type: 'credit_card',
    balance: 8200,
    apr: 22.9,
    minPayment: 205,
  },
  {
    id: 'default-2',
    name: 'Federal Student Loan',
    type: 'student_loan',
    balance: 24500,
    apr: 5.8,
    minPayment: 280,
  },
  {
    id: 'default-3',
    name: 'Honda Civic Loan',
    type: 'auto_loan',
    balance: 12300,
    apr: 6.4,
    minPayment: 340,
  },
];

export const DEFAULT_FIRE_INPUTS = {
  currentAssets: 45000,
  annualReturn: 7,
  annualExpenses: 40000,
  monthlyInvestment: 800,
  monthlyIncome: 5500,
};

export const CURRENCIES = [
  { code: 'USD', locale: 'en-US', symbol: '$', label: 'USD – US Dollar ($)' },
  { code: 'EUR', locale: 'de-DE', symbol: '€', label: 'EUR – Euro (€)' },
  { code: 'GBP', locale: 'en-GB', symbol: '£', label: 'GBP – British Pound (£)' },
];

export function getCurrencySymbol(currencyCode = 'USD') {
  return CURRENCIES.find(c => c.code === currencyCode)?.symbol || '$';
}

export function getCurrencyLocale(currencyCode = 'USD') {
  return CURRENCIES.find(c => c.code === currencyCode)?.locale || 'en-US';
}

export function round2(val) {
  return Math.round(val * 100) / 100;
}

export function formatCurrency(amount, currencyCode = 'USD') {
  const locale = getCurrencyLocale(currencyCode);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyExact(amount, currencyCode = 'USD') {
  const locale = getCurrencyLocale(currencyCode);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(val) {
  return `${val.toFixed(1)}%`;
}

/**
 * Calculate weighted average interest rate across all debts.
 */
export function weightedAvgRate(debts) {
  const totalBalance = debts.reduce((sum, d) => sum + d.balance, 0);
  if (totalBalance === 0) return 0;
  const weighted = debts.reduce((sum, d) => sum + d.balance * d.apr, 0);
  return round2(weighted / totalBalance);
}

/**
 * Generate a full payoff schedule using either snowball or avalanche method.
 * Returns { schedule, totalInterest, months, milestones, monthlyData }
 */
export function calculatePayoffSchedule(debts, extraPayment, method = 'snowball') {
  if (debts.length === 0) return { schedule: [], totalInterest: 0, months: 0, milestones: [], monthlyData: [] };

  // Deep copy debts and add tracking
  let activeDebts = debts.map(d => ({
    ...d,
    remaining: d.balance,
    totalInterestPaid: 0,
    paidOff: false,
    paidOffMonth: null,
  }));

  // Sort based on method
  if (method === 'snowball') {
    activeDebts.sort((a, b) => a.remaining - b.remaining);
  } else {
    activeDebts.sort((a, b) => b.apr - a.apr);
  }

  const schedule = [];
  const milestones = [];
  const monthlyData = [];
  let month = 0;
  let totalInterest = 0;
  let freedCashFlow = 0;
  const maxMonths = 600; // 50 year cap

  // Record initial state
  const initialSnapshot = {};
  activeDebts.forEach(d => { initialSnapshot[d.id] = d.remaining; });
  monthlyData.push({
    month: 0,
    ...activeDebts.reduce((acc, d) => { acc[d.id] = d.remaining; return acc; }, {}),
    totalRemaining: activeDebts.reduce((sum, d) => sum + d.remaining, 0),
    freedCashFlow: 0,
  });

  while (activeDebts.some(d => d.remaining > 0) && month < maxMonths) {
    month++;
    const monthSchedule = { month, payments: [], totalInterestThisMonth: 0, freedCashFlow };
    let availableExtra = extraPayment + freedCashFlow;

    // Step 1: Apply interest and minimum payments to all active debts
    for (const debt of activeDebts) {
      if (debt.remaining <= 0) continue;

      const monthlyInterest = round2(debt.remaining * (debt.apr / 12 / 100));
      debt.remaining = round2(debt.remaining + monthlyInterest);
      debt.totalInterestPaid = round2(debt.totalInterestPaid + monthlyInterest);
      totalInterest = round2(totalInterest + monthlyInterest);
      monthSchedule.totalInterestThisMonth = round2(monthSchedule.totalInterestThisMonth + monthlyInterest);

      const minPay = Math.min(debt.minPayment, debt.remaining);
      debt.remaining = round2(debt.remaining - minPay);

      monthSchedule.payments.push({
        debtId: debt.id,
        debtName: debt.name,
        interest: monthlyInterest,
        payment: minPay,
        isTarget: false,
        remaining: debt.remaining,
      });
    }

    // Step 2: Apply extra payment to target debt
    for (const debt of activeDebts) {
      if (debt.remaining <= 0 || availableExtra <= 0) continue;

      const extraPay = Math.min(availableExtra, debt.remaining);
      debt.remaining = round2(debt.remaining - extraPay);
      availableExtra = round2(availableExtra - extraPay);

      // Update the payment record
      const paymentRecord = monthSchedule.payments.find(p => p.debtId === debt.id);
      if (paymentRecord) {
        paymentRecord.payment = round2(paymentRecord.payment + extraPay);
        paymentRecord.isTarget = true;
        paymentRecord.remaining = debt.remaining;
      }

      // Check if debt is now paid off
      if (debt.remaining <= 0) {
        debt.remaining = 0;
        debt.paidOff = true;
        debt.paidOffMonth = month;
        freedCashFlow = round2(freedCashFlow + debt.minPayment);
        milestones.push({
          month,
          debtName: debt.name,
          debtId: debt.id,
          index: milestones.length + 1,
        });
      }
    }

    schedule.push(monthSchedule);

    // Build monthly data point for chart
    const dataPoint = {
      month,
      totalRemaining: 0,
      freedCashFlow,
      cumulativeInterest: totalInterest,
    };
    for (const debt of activeDebts) {
      dataPoint[debt.id] = Math.max(0, debt.remaining);
      dataPoint.totalRemaining += Math.max(0, debt.remaining);
    }
    dataPoint.totalRemaining = round2(dataPoint.totalRemaining);
    monthlyData.push(dataPoint);
  }

  return {
    schedule,
    totalInterest: round2(totalInterest),
    months: month,
    milestones,
    monthlyData,
    debtOrder: activeDebts.map(d => ({ id: d.id, name: d.name, paidOffMonth: d.paidOffMonth })),
  };
}

/**
 * Calculate minimum-payments-only payoff for comparison.
 */
export function calculateMinimumOnlyPayoff(debts) {
  return calculatePayoffSchedule(debts, 0, 'avalanche');
}

/**
 * Calculate FIRE number and years to FI.
 */
export function calculateFIRE(currentAssets, monthlyInvestment, annualReturn, annualExpenses) {
  const fiNumber = annualExpenses * 25;
  const monthlyReturn = annualReturn / 12 / 100;

  if (currentAssets >= fiNumber) {
    return { fiNumber, monthsToFI: 0, yearsToFI: 0 };
  }

  if (monthlyReturn === 0) {
    if (monthlyInvestment <= 0) return { fiNumber, monthsToFI: Infinity, yearsToFI: Infinity };
    const months = Math.ceil((fiNumber - currentAssets) / monthlyInvestment);
    return { fiNumber, monthsToFI: months, yearsToFI: round2(months / 12) };
  }

  if (monthlyInvestment <= 0 && currentAssets <= 0) {
    return { fiNumber, monthsToFI: Infinity, yearsToFI: Infinity };
  }

  // FV = PV * (1+r)^n + PMT * ((1+r)^n - 1) / r
  // Solve for n: n = ln((FI * r + PMT) / (PV * r + PMT)) / ln(1 + r)
  const numerator = fiNumber * monthlyReturn + monthlyInvestment;
  const denominator = currentAssets * monthlyReturn + monthlyInvestment;

  if (denominator <= 0 || numerator / denominator <= 0) {
    return { fiNumber, monthsToFI: Infinity, yearsToFI: Infinity };
  }

  const months = Math.ceil(Math.log(numerator / denominator) / Math.log(1 + monthlyReturn));

  if (!isFinite(months) || months < 0) {
    return { fiNumber, monthsToFI: Infinity, yearsToFI: Infinity };
  }

  return { fiNumber, monthsToFI: months, yearsToFI: round2(months / 12) };
}

/**
 * Build a net worth projection over time.
 * Returns monthly data points { month, netWorth }.
 */
export function buildNetWorthProjection(currentAssets, monthlyInvestment, annualReturn, months) {
  const monthlyReturn = annualReturn / 12 / 100;
  const data = [{ month: 0, netWorth: round2(currentAssets) }];
  let balance = currentAssets;

  for (let m = 1; m <= months; m++) {
    balance = balance * (1 + monthlyReturn) + monthlyInvestment;
    data.push({ month: m, netWorth: round2(balance) });
  }

  return data;
}

/**
 * Calculate the lifetime wealth impact of investing freed payments.
 * Projects freed cash flow invested at given return over given years.
 */
export function lifetimeWealthImpact(freedMonthlyAmount, annualReturn, years) {
  const monthlyReturn = annualReturn / 12 / 100;
  const months = years * 12;

  if (monthlyReturn === 0) {
    return round2(freedMonthlyAmount * months);
  }

  // Future value of annuity: PMT * ((1+r)^n - 1) / r
  const fv = freedMonthlyAmount * (Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn;
  return round2(fv);
}

/**
 * Build FIRE comparison data:
 * - Scenario A: Pay minimums only, invest everything else
 * - Scenario B: Aggressive payoff (snowball/avalanche), then redirect all freed cash to investments
 */
export function buildFIREComparison(debts, extraPayment, method, fireInputs) {
  const { currentAssets, annualReturn, annualExpenses, monthlyInvestment } = fireInputs;
  const totalMinPayments = debts.reduce((sum, d) => sum + d.minPayment, 0);
  const monthlyReturn = annualReturn / 12 / 100;
  const fiNumber = annualExpenses * 25;

  // Scenario A: Pay minimums, invest (monthlyInvestment) only
  // The user's monthlyInvestment already accounts for their budget
  const scenarioA = [];
  let balanceA = currentAssets;
  const maxProjectionMonths = 480; // 40 years

  for (let m = 0; m <= maxProjectionMonths; m++) {
    scenarioA.push({ month: m, netWorth: round2(balanceA) });
    if (balanceA >= fiNumber && m > 0) break;
    balanceA = balanceA * (1 + monthlyReturn) + monthlyInvestment;
  }

  // Scenario B: Aggressive payoff, then invest freed cash + extra payment + monthlyInvestment
  const payoff = calculatePayoffSchedule(debts, extraPayment, method);
  const scenarioB = [];
  let balanceB = currentAssets;
  const debtFreeMonth = payoff.months;

  // During debt payoff, user only invests monthlyInvestment (extra goes to debt)
  // After debt payoff, user invests monthlyInvestment + extraPayment + totalMinPayments
  for (let m = 0; m <= maxProjectionMonths; m++) {
    scenarioB.push({ month: m, netWorth: round2(balanceB) });
    if (balanceB >= fiNumber && m > 0) break;

    if (m < debtFreeMonth) {
      // During payoff: only invest the regular investment amount
      // (extra payment and min payments go to debt)
      balanceB = balanceB * (1 + monthlyReturn) + monthlyInvestment;
    } else {
      // After payoff: invest everything (regular + freed minimums + extra)
      const postDebtInvestment = monthlyInvestment + totalMinPayments + extraPayment;
      balanceB = balanceB * (1 + monthlyReturn) + postDebtInvestment;
    }
  }

  // Find crossover point
  let crossoverMonth = null;
  const maxLen = Math.min(scenarioA.length, scenarioB.length);
  for (let i = 1; i < maxLen; i++) {
    if (scenarioB[i].netWorth >= scenarioA[i].netWorth && scenarioB[i - 1].netWorth < scenarioA[i - 1].netWorth) {
      crossoverMonth = i;
      break;
    }
  }

  // Calculate FIRE dates for each scenario
  const fireA = calculateFIRE(currentAssets, monthlyInvestment, annualReturn, annualExpenses);
  const postDebtMonthlyInvestment = monthlyInvestment + totalMinPayments + extraPayment;

  // For scenario B, we need to account for the debt payoff period
  // During payoff: only monthlyInvestment grows
  // After payoff: postDebtMonthlyInvestment grows from that point
  let assetsAtDebtFree = currentAssets;
  for (let m = 0; m < debtFreeMonth; m++) {
    assetsAtDebtFree = assetsAtDebtFree * (1 + monthlyReturn) + monthlyInvestment;
  }
  const fireB_post = calculateFIRE(round2(assetsAtDebtFree), postDebtMonthlyInvestment, annualReturn, annualExpenses);

  return {
    scenarioA,
    scenarioB,
    crossoverMonth,
    fiNumber,
    fireA_months: fireA.monthsToFI,
    fireB_months: debtFreeMonth + fireB_post.monthsToFI,
    fireAcceleration: fireA.monthsToFI - (debtFreeMonth + fireB_post.monthsToFI),
    postDebtMonthlyInvestment,
  };
}

/**
 * Format a month count into a readable date string from today.
 */
export function monthsToDate(months) {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() + months, 1);
  return target.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Format months into "X years, Y months" string.
 */
export function formatMonthsDuration(months) {
  if (!isFinite(months)) return 'N/A';
  const years = Math.floor(months / 12);
  const remaining = months % 12;
  if (years === 0) return `${remaining} mo`;
  if (remaining === 0) return `${years} yr`;
  return `${years} yr ${remaining} mo`;
}

/**
 * Generate debt colors for charts.
 */
const DEBT_COLORS = [
  '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316',
];

export function getDebtColor(index) {
  return DEBT_COLORS[index % DEBT_COLORS.length];
}
