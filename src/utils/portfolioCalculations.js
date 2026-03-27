/**
 * Portfolio calculation engine.
 * All currency values use full precision internally; round2 for display.
 */
import { round2 } from './calculations';

// ── Asset class definitions ──────────────────────────────────────

export const ASSET_CLASSES = [
  { value: 'stock',     label: 'Stock',     icon: '📈', color: '#8b7cf7' },
  { value: 'etf',       label: 'ETF',       icon: '📊', color: '#2DD4BF' },
  { value: 'bond',      label: 'Bond',      icon: '📃', color: '#60A5FA' },
  { value: 'crypto',    label: 'Crypto',    icon: '₿',  color: '#F59E0B' },
  { value: 'commodity', label: 'Commodity', icon: '🥇', color: '#F97316' },
  { value: 'cash',      label: 'Cash',      icon: '💵', color: '#22C55E' },
];

export const MARKET_TICKERS = [
  { symbol: 'SPY',   label: 'SPY',   sublabel: 'S&P 500 ETF',     type: 'index' },
  { symbol: 'QQQ',   label: 'QQQ',   sublabel: 'NASDAQ-100 ETF',  type: 'index' },
  { symbol: 'BTC',   label: 'Bitcoin', sublabel: 'BTC/USD',         type: 'crypto' },
  { symbol: 'GOLD',  label: 'Gold',  sublabel: 'XAU/USD Spot',    type: 'commodity' },
];

// Historical return assumptions (annual mean, annual std dev)
const RETURN_ASSUMPTIONS = {
  stock:     { mean: 0.10, std: 0.16 },
  etf:       { mean: 0.10, std: 0.16 },
  bond:      { mean: 0.05, std: 0.06 },
  crypto:    { mean: 0.40, std: 0.70 },
  commodity: { mean: 0.07, std: 0.15 },
  cash:      { mean: 0.02, std: 0.01 },
};

// ── Helpers ──────────────────────────────────────────────────────

export function getAssetClass(value) {
  return ASSET_CLASSES.find(a => a.value === value) || ASSET_CLASSES[0];
}

function generateId() {
  return `h-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createBlankHolding() {
  return {
    id: generateId(),
    name: '',
    ticker: '',
    assetClass: 'stock',
    quantity: 0,
    purchasePrice: 0,
    purchaseDate: new Date().toISOString().slice(0, 10),
    targetAllocation: null,
  };
}

// ── Core calculations ────────────────────────────────────────────

/**
 * Calculate value and gain/loss for a single holding.
 */
export function calculateHoldingValue(holding, currentPrice) {
  const price = currentPrice || holding.purchasePrice;
  const currentValue = round2(holding.quantity * price);
  const costBasis = round2(holding.quantity * holding.purchasePrice);
  const gainLoss = round2(currentValue - costBasis);
  const gainLossPercent = costBasis > 0 ? round2((gainLoss / costBasis) * 100) : 0;

  return { currentValue, costBasis, gainLoss, gainLossPercent, currentPrice: price };
}

/**
 * Calculate portfolio-wide summary.
 */
export function calculatePortfolioSummary(holdings, priceCache = {}) {
  if (!holdings || holdings.length === 0) {
    return {
      totalValue: 0, totalCostBasis: 0, totalGainLoss: 0,
      totalGainLossPercent: 0, holdingDetails: [],
      bestPerformer: null, worstPerformer: null,
    };
  }

  const individualDetails = holdings.map(h => {
    const ticker = h.ticker?.toUpperCase();
    const cached = priceCache[ticker];
    const currentPrice = cached?.price || h.purchasePrice;
    const calc = calculateHoldingValue(h, currentPrice);
    return { ...h, ...calc };
  });

  // Group positions by ticker (case-insensitive) into aggregated rows
  const groupMap = new Map();
  individualDetails.forEach(h => {
    const key = (h.ticker || '').toUpperCase() || h.id; // ungrouped if no ticker
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        id: h.id,
        name: h.name || '',
        ticker: h.ticker || '',
        assetClass: h.assetClass || 'stock',
        quantity: 0,
        costBasis: 0,
        currentValue: 0,
        gainLoss: 0,
        currentPrice: h.currentPrice || 0,
        purchaseDate: h.purchaseDate,
      });
    }
    const g = groupMap.get(key);
    g.quantity = round2(g.quantity + (h.quantity || 0));
    g.costBasis = round2(g.costBasis + (h.costBasis || 0));
    g.currentValue = round2(g.currentValue + (h.currentValue || 0));
    g.gainLoss = round2(g.currentValue - g.costBasis);
    g.gainLossPercent = g.costBasis > 0 ? round2((g.gainLoss / g.costBasis) * 100) : 0;
    // Use the longest name among positions in the group
    if ((h.name || '').length > g.name.length) g.name = h.name;
  });
  const holdingDetails = Array.from(groupMap.values());

  const totalValue = round2(holdingDetails.reduce((s, d) => s + d.currentValue, 0));
  const totalCostBasis = round2(holdingDetails.reduce((s, d) => s + d.costBasis, 0));
  const totalGainLoss = round2(totalValue - totalCostBasis);
  const totalGainLossPercent = totalCostBasis > 0 ? round2((totalGainLoss / totalCostBasis) * 100) : 0;

  // Best and worst performers
  const sortedByPercent = [...holdingDetails].sort((a, b) => b.gainLossPercent - a.gainLossPercent);
  const bestPerformer = sortedByPercent[0] || null;
  const worstPerformer = sortedByPercent[sortedByPercent.length - 1] || null;

  return {
    totalValue, totalCostBasis, totalGainLoss, totalGainLossPercent,
    holdingDetails, bestPerformer, worstPerformer,
  };
}

/**
 * Calculate allocation breakdown by asset class.
 */
export function calculateAllocation(holdings, priceCache = {}) {
  const summary = calculatePortfolioSummary(holdings, priceCache);
  if (summary.totalValue === 0) return [];

  const groups = {};
  summary.holdingDetails.forEach(h => {
    const cls = h.assetClass || 'stock';
    if (!groups[cls]) groups[cls] = 0;
    groups[cls] += h.currentValue;
  });

  return Object.entries(groups).map(([cls, value]) => {
    const ac = getAssetClass(cls);
    return {
      assetClass: cls,
      label: ac.label,
      value: round2(value),
      percent: round2((value / summary.totalValue) * 100),
      color: ac.color,
      icon: ac.icon,
    };
  }).sort((a, b) => b.percent - a.percent);
}

/**
 * Calculate rebalancing recommendations.
 */
export function calculateRebalancing(holdings, priceCache, targetAllocations) {
  const allocation = calculateAllocation(holdings, priceCache);
  const summary = calculatePortfolioSummary(holdings, priceCache);
  if (summary.totalValue === 0) return [];

  return ASSET_CLASSES.map(ac => {
    const current = allocation.find(a => a.assetClass === ac.value);
    const currentPercent = current ? current.percent : 0;
    const targetPercent = targetAllocations[ac.value] || 0;
    const difference = round2(currentPercent - targetPercent);
    const tradeAmount = round2(Math.abs(difference / 100) * summary.totalValue);
    const suggestedTrade = difference > 0.5 ? 'Sell' : difference < -0.5 ? 'Buy' : 'Hold';

    return {
      assetClass: ac.value,
      label: ac.label,
      color: ac.color,
      icon: ac.icon,
      currentPercent,
      targetPercent,
      difference,
      suggestedTrade,
      tradeAmount: suggestedTrade === 'Hold' ? 0 : tradeAmount,
    };
  });
}

/**
 * What-If: add a hypothetical investment and see new allocation.
 */
export function calculateWhatIf(holdings, priceCache, whatIfAssetClass, whatIfAmount) {
  const currentAllocation = calculateAllocation(holdings, priceCache);
  const summary = calculatePortfolioSummary(holdings, priceCache);
  const currentTotal = summary.totalValue;
  const newTotal = currentTotal + whatIfAmount;

  if (newTotal === 0) return { currentAllocation, newAllocation: [], projectedValue: 0 };

  // Recalculate allocation with the additional amount
  const newAllocation = ASSET_CLASSES.map(ac => {
    const existing = currentAllocation.find(a => a.assetClass === ac.value);
    let value = existing ? existing.value : 0;
    if (ac.value === whatIfAssetClass) value += whatIfAmount;
    return {
      assetClass: ac.value,
      label: ac.label,
      value: round2(value),
      percent: round2((value / newTotal) * 100),
      color: ac.color,
    };
  }).filter(a => a.value > 0);

  return { currentAllocation, newAllocation, projectedValue: round2(newTotal) };
}

/**
 * Monte Carlo simulation for portfolio growth.
 * Uses Box-Muller transform for normal random numbers.
 */
export function runMonteCarloSimulation(
  totalValue,
  monthlyContribution,
  years,
  numSimulations = 1000,
  allocationWeights = null, // optional { stock: 0.4, bond: 0.2, ... }
  goalAmount = 0
) {
  const months = years * 12;
  if (months === 0 || totalValue <= 0) {
    return { median: 0, p10: 0, p25: 0, p75: 0, p90: 0, probabilityOfGoal: 0, yearlyPercentiles: [] };
  }

  // Calculate weighted return params
  let weightedMean = 0.08;  // default 8% annual
  let weightedStd = 0.15;   // default 15% annual

  if (allocationWeights) {
    weightedMean = 0;
    weightedStd = 0;
    let totalWeight = 0;
    Object.entries(allocationWeights).forEach(([cls, weight]) => {
      const w = weight / 100;
      const assumption = RETURN_ASSUMPTIONS[cls] || RETURN_ASSUMPTIONS.stock;
      weightedMean += assumption.mean * w;
      weightedStd += assumption.std * w;  // simplified — not variance-covariance
      totalWeight += w;
    });
    if (totalWeight > 0) {
      weightedMean /= totalWeight;
      weightedStd /= totalWeight;
    }
  }

  const monthlyMean = weightedMean / 12;
  const monthlyStd = weightedStd / Math.sqrt(12);

  // Box-Muller normal random
  function normalRandom() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  // Run simulations
  const finalValues = [];
  const yearlyResults = Array.from({ length: years + 1 }, () => []);

  for (let sim = 0; sim < numSimulations; sim++) {
    let balance = totalValue;
    yearlyResults[0].push(balance);

    for (let m = 1; m <= months; m++) {
      const monthlyReturn = monthlyMean + monthlyStd * normalRandom();
      balance = balance * (1 + monthlyReturn) + monthlyContribution;
      balance = Math.max(0, balance);  // can't go negative

      if (m % 12 === 0) {
        yearlyResults[m / 12].push(round2(balance));
      }
    }
    finalValues.push(round2(balance));
  }

  // Sort for percentiles
  finalValues.sort((a, b) => a - b);
  const percentile = (arr, p) => arr[Math.floor(arr.length * p / 100)] || 0;

  // Build yearly percentile bands for fan chart
  const yearlyPercentiles = yearlyResults.map((values, year) => {
    values.sort((a, b) => a - b);
    return {
      year,
      p10: round2(percentile(values, 10)),
      p25: round2(percentile(values, 25)),
      median: round2(percentile(values, 50)),
      p75: round2(percentile(values, 75)),
      p90: round2(percentile(values, 90)),
    };
  });

  // Probability of reaching goal
  const probabilityOfGoal = goalAmount > 0
    ? round2((finalValues.filter(v => v >= goalAmount).length / numSimulations) * 100)
    : 0;

  return {
    median: round2(percentile(finalValues, 50)),
    p10: round2(percentile(finalValues, 10)),
    p25: round2(percentile(finalValues, 25)),
    p75: round2(percentile(finalValues, 75)),
    p90: round2(percentile(finalValues, 90)),
    probabilityOfGoal,
    yearlyPercentiles,
  };
}

/**
 * Goal planner: check progress toward target.
 */
export function calculateGoalProgress(totalValue, goal) {
  if (!goal || !goal.targetValue) {
    return { currentProgress: 0, monthsRemaining: 0, monthlyNeeded: 0, onTrack: false };
  }

  const currentProgress = round2((totalValue / goal.targetValue) * 100);

  const targetDate = new Date(goal.targetDate);
  const now = new Date();
  const monthsRemaining = Math.max(0,
    (targetDate.getFullYear() - now.getFullYear()) * 12 + (targetDate.getMonth() - now.getMonth())
  );

  const gap = Math.max(0, goal.targetValue - totalValue);
  const monthlyNeeded = monthsRemaining > 0 ? round2(gap / monthsRemaining) : gap;

  const monthlyContribution = goal.monthlyContribution || 0;
  const onTrack = monthlyContribution >= monthlyNeeded || currentProgress >= 100;

  return { currentProgress: Math.min(100, currentProgress), monthsRemaining, monthlyNeeded, onTrack };
}

/**
 * Check price alerts against current prices.
 */
// PA-10: after a reset, the alert must wait for the price to first move
// OUTSIDE the threshold and then cross back in before it can re-fire.
// This prevents the immediate re-trigger that happened when the price
// was still past the threshold at the moment of reset.
const RESET_COOLDOWN_MS = 300000; // 5 minutes

export function checkAlerts(alerts, priceCache) {
  if (!alerts || alerts.length === 0) return [];

  const now = Date.now();

  return alerts.map(alert => {
    const ticker = alert.ticker?.toUpperCase();
    const cached = priceCache[ticker];
    const currentPrice = cached?.price || 0;

    // PA-7 fix: use strict inequality so "above" means strictly greater than
    // the threshold and "below" means strictly less than. Previously >= / <=
    // caused alerts to fire at the exact threshold, which is semantically wrong
    // for "Price Goes Above $X" (the price hasn't gone above if it equals X).
    let shouldFire = false;
    if (currentPrice > 0 && !alert.triggered) {
      // PA-10: enforce cooldown after reset so the alert doesn't re-fire
      // immediately while the price still meets the threshold.
      if (alert.resetAt && (now - alert.resetAt) < RESET_COOLDOWN_MS) {
        shouldFire = false;
      } else {
        if (alert.condition === 'above' && currentPrice > alert.price) shouldFire = true;
        if (alert.condition === 'below' && currentPrice < alert.price) shouldFire = true;
      }
    }

    return { ...alert, shouldFire, currentPrice };
  });
}

/**
 * Build simple performance estimate from holdings purchase dates.
 * Since we don't have historical price data, we estimate based on
 * asset class average returns from purchase date to now.
 */
export function buildPerformanceEstimate(holdings, priceCache) {
  if (!holdings || holdings.length === 0) return [];

  const now = new Date();
  const points = [];

  // Create monthly points from earliest purchase date to now
  let earliest = new Date();
  holdings.forEach(h => {
    const d = new Date(h.purchaseDate);
    if (d < earliest) earliest = d;
  });

  const startMonth = new Date(earliest.getFullYear(), earliest.getMonth(), 1);
  const endMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  for (let d = new Date(startMonth); d <= endMonth; d.setMonth(d.getMonth() + 1)) {
    const month = new Date(d);
    let totalValue = 0;

    holdings.forEach(h => {
      const purchaseDate = new Date(h.purchaseDate);
      if (purchaseDate <= month) {
        // Use current price if available, else estimate with avg return
        const ticker = h.ticker?.toUpperCase();
        const cached = priceCache[ticker];
        if (cached?.price && month.getTime() === endMonth.getTime()) {
          totalValue += h.quantity * cached.price;
        } else {
          const monthsHeld = (month.getFullYear() - purchaseDate.getFullYear()) * 12
            + (month.getMonth() - purchaseDate.getMonth());
          const assumption = RETURN_ASSUMPTIONS[h.assetClass] || RETURN_ASSUMPTIONS.stock;
          const monthlyReturn = assumption.mean / 12;
          const estimatedPrice = h.purchasePrice * Math.pow(1 + monthlyReturn, monthsHeld);
          totalValue += h.quantity * estimatedPrice;
        }
      }
    });

    points.push({
      date: month.toISOString().slice(0, 7),
      value: round2(totalValue),
    });
  }

  return points;
}
