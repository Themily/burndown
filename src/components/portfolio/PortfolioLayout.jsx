import React, { useMemo, useCallback } from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import PortfolioHeader from './PortfolioHeader';
import PortfolioSummaryBar from './PortfolioSummaryBar';
import PortfolioInputPanel from './PortfolioInputPanel';
import PortfolioLivePrices from './PortfolioLivePrices';
import PortfolioAllocationChart from './PortfolioAllocationChart';
import PortfolioHoldingsTable from './PortfolioHoldingsTable';
import PortfolioRebalancing from './PortfolioRebalancing';
import PortfolioPerformanceChart from './PortfolioPerformanceChart';
import PortfolioWatchlists from './PortfolioWatchlists';
import PortfolioNews from './PortfolioNews';
import PortfolioGoalPlanner from './PortfolioGoalPlanner';
import PortfolioSimulator from './PortfolioSimulator';
import PortfolioAlerts from './PortfolioAlerts';
import PortfolioExportButtons from './PortfolioExportButtons';
import PortfolioHelpPage from './PortfolioHelpPage';
import ShareSection from '../ShareSection';
import Footer from '../Footer';
import {
  calculatePortfolioSummary,
  calculateAllocation,
  calculateRebalancing,
  calculateGoalProgress,
  buildPerformanceEstimate,
} from '../../utils/portfolioCalculations';
import { useMarketData } from '../../hooks/useMarketData';
import { useNews } from '../../hooks/useNews';
import { useAlertChecker } from '../../hooks/useAlertChecker';

export default function PortfolioLayout({
  portfolioInputs,
  setPortfolioInputs,
  currentPage,
  onNavigatePage,
  onBackToHub,
  focusRef,
}) {
  const mode = portfolioInputs.mode;
  const holdings = portfolioInputs.holdings;
  const priceCache = portfolioInputs.priceCache || {};

  // Fetch live prices (includes portfolio tickers + market tickers)
  const portfolioTickers = holdings.map(h => h.ticker?.toUpperCase()).filter(Boolean);
  const watchlistTickers = (portfolioInputs.watchlists || []).flatMap(w => w.tickers || []);
  // PA-3 fix: include alert tickers so prices are fetched even when the ticker
  // is not held in the portfolio — without this, priceCache[ticker] is always
  // undefined, currentPrice stays 0, and the alert condition never evaluates.
  const alertTickers = (portfolioInputs.alerts || []).map(a => a.ticker?.toUpperCase()).filter(Boolean);
  const allTickers = [...new Set([...portfolioTickers, ...watchlistTickers, ...alertTickers])];
  const { prices: livePrices, loading: pricesLoading, lastUpdated } = useMarketData(allTickers);

  // Merge live prices into priceCache
  const mergedPriceCache = useMemo(() => {
    return { ...priceCache, ...livePrices };
  }, [priceCache, livePrices]);

  // Save live prices back to inputs for persistence
  React.useEffect(() => {
    if (Object.keys(livePrices).length > 0) {
      setPortfolioInputs(prev => ({
        ...prev,
        priceCache: { ...prev.priceCache, ...livePrices },
        lastPriceFetch: Date.now(),
      }));
    }
  }, [livePrices, setPortfolioInputs]);

  // Fetch news (Intermediate+)
  const { articles, loading: newsLoading } = useNews();

  // PA-6: get user's active currency symbol to pass into the alert email.
  const { symbol: currencySymbol } = useCurrency();

  // Alert checker (Advanced)
  const setAlerts = useCallback((updater) => {
    setPortfolioInputs(prev => ({
      ...prev,
      alerts: typeof updater === 'function' ? updater(prev.alerts) : updater,
    }));
  }, [setPortfolioInputs]);

  useAlertChecker(
    mode === 'advanced' ? portfolioInputs.alerts : [],
    mergedPriceCache,
    portfolioInputs.alertEmail,
    setAlerts,
    currencySymbol
  );

  // ── Calculations (memoized) ──
  const summary = useMemo(
    () => calculatePortfolioSummary(holdings, mergedPriceCache),
    [holdings, mergedPriceCache]
  );

  const allocation = useMemo(
    () => calculateAllocation(holdings, mergedPriceCache),
    [holdings, mergedPriceCache]
  );

  const rebalancing = useMemo(
    () => mode !== 'simple'
      ? calculateRebalancing(holdings, mergedPriceCache, portfolioInputs.targetAllocations)
      : null,
    [holdings, mergedPriceCache, portfolioInputs.targetAllocations, mode]
  );

  const performanceData = useMemo(
    () => mode !== 'simple' ? buildPerformanceEstimate(holdings, mergedPriceCache) : [],
    [holdings, mergedPriceCache, mode]
  );

  const goalProgress = useMemo(
    () => mode === 'advanced'
      ? calculateGoalProgress(summary.totalValue, portfolioInputs.goal, allocation)
      : null,
    [summary.totalValue, portfolioInputs.goal, allocation, mode]
  );

  // ── State updaters ──
  const handleSetMode = (newMode) => {
    setPortfolioInputs(prev => ({ ...prev, mode: newMode }));
  };

  const setHoldings = useCallback((updater) => {
    setPortfolioInputs(prev => ({
      ...prev,
      holdings: typeof updater === 'function' ? updater(prev.holdings) : updater,
    }));
  }, [setPortfolioInputs]);

  const setTargetAllocations = useCallback((updater) => {
    setPortfolioInputs(prev => ({
      ...prev,
      targetAllocations: typeof updater === 'function' ? updater(prev.targetAllocations) : updater,
    }));
  }, [setPortfolioInputs]);

  const setWatchlists = useCallback((updater) => {
    setPortfolioInputs(prev => ({
      ...prev,
      watchlists: typeof updater === 'function' ? updater(prev.watchlists) : updater,
    }));
  }, [setPortfolioInputs]);

  const setGoal = useCallback((updater) => {
    setPortfolioInputs(prev => ({
      ...prev,
      goal: typeof updater === 'function' ? updater(prev.goal) : updater,
    }));
  }, [setPortfolioInputs]);

  const setSimulator = useCallback((updater) => {
    setPortfolioInputs(prev => ({
      ...prev,
      simulator: typeof updater === 'function' ? updater(prev.simulator) : updater,
    }));
  }, [setPortfolioInputs]);

  const setAlertEmail = useCallback((email) => {
    setPortfolioInputs(prev => ({ ...prev, alertEmail: email }));
  }, [setPortfolioInputs]);

  return (
    <div className="slide-in-right" data-print-root>
      <div tabIndex={-1} ref={focusRef} className="outline-none" />
      <PortfolioHeader
        mode={mode}
        onSetMode={handleSetMode}
        currentPage={currentPage}
        onNavigatePage={onNavigatePage}
        onBackToHub={onBackToHub}
      />

      {currentPage === 'help' ? (
        <PortfolioHelpPage onBack={() => { onNavigatePage('dashboard'); window.scrollTo(0, 0); }} />
      ) : (
        <>
          <PortfolioSummaryBar summary={summary} mode={mode} />

          <div className="mx-4 mb-10">
            <PortfolioInputPanel
              holdings={holdings}
              setHoldings={setHoldings}
              mode={mode}
            />
          </div>

          <PortfolioLivePrices
            prices={mergedPriceCache}
            loading={pricesLoading}
            lastUpdated={lastUpdated}
          />

          <PortfolioAllocationChart allocation={allocation} />

          <PortfolioHoldingsTable
            holdingDetails={summary.holdingDetails}
            mode={mode}
          />

          {/* Intermediate+ features */}
          {mode !== 'simple' && (
            <>
              <PortfolioRebalancing
                rebalancing={rebalancing}
                targetAllocations={portfolioInputs.targetAllocations}
                setTargetAllocations={setTargetAllocations}
              />
              <PortfolioPerformanceChart performanceData={performanceData} />
              <PortfolioWatchlists
                watchlists={portfolioInputs.watchlists}
                setWatchlists={setWatchlists}
                priceCache={mergedPriceCache}
              />
              <PortfolioNews
                articles={articles}
                loading={newsLoading}
              />
            </>
          )}

          {/* Advanced features */}
          {mode === 'advanced' && (
            <>
              <PortfolioGoalPlanner
                goal={portfolioInputs.goal}
                setGoal={setGoal}
                goalProgress={goalProgress}
              />
              <PortfolioSimulator
                simulator={portfolioInputs.simulator}
                setSimulator={setSimulator}
                holdings={holdings}
                priceCache={mergedPriceCache}
                totalValue={summary.totalValue}
                allocation={allocation}
                monthlyContribution={portfolioInputs.goal?.monthlyContribution || 0}
              />
              <PortfolioAlerts
                alerts={portfolioInputs.alerts}
                setAlerts={setAlerts}
                alertEmail={portfolioInputs.alertEmail}
                setAlertEmail={setAlertEmail}
                priceCache={mergedPriceCache}
              />
            </>
          )}

          <PortfolioExportButtons
            inputs={portfolioInputs}
            summary={summary}
            allocation={allocation}
          />

          <ShareSection />
          <Footer />
        </>
      )}
    </div>
  );
}
