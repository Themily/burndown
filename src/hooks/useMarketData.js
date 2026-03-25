import { useState, useEffect, useRef, useCallback } from 'react';
import { MARKET_TICKERS } from '../utils/portfolioCalculations';

/**
 * Custom hook to fetch live market prices via /api/prices.
 * Polls every 60 seconds. Falls back gracefully if API unavailable.
 */
export function useMarketData(additionalTickers = []) {
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  const allSymbols = [
    ...MARKET_TICKERS.map(t => t.symbol),
    ...additionalTickers.filter(Boolean),
  ];

  const fetchPrices = useCallback(async () => {
    if (allSymbols.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const symbolsParam = allSymbols.join(',');
      const res = await fetch(`/api/prices?symbols=${encodeURIComponent(symbolsParam)}`);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (data.prices) {
        setPrices(prev => ({ ...prev, ...data.prices }));
        setLastUpdated(Date.now());
      }
    } catch (err) {
      setError(err.message);
      // Don't clear existing prices on error — show stale data
    } finally {
      setLoading(false);
    }
  }, [allSymbols.join(',')]);

  useEffect(() => {
    fetchPrices();

    // Poll every 60 seconds
    intervalRef.current = setInterval(fetchPrices, 60000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchPrices]);

  return { prices, loading, error, lastUpdated };
}
