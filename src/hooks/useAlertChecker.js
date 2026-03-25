import { useEffect, useRef } from 'react';
import { checkAlerts } from '../utils/portfolioCalculations';

/**
 * Custom hook that checks price alerts every 60 seconds.
 * Sends email via /api/send-alert when a threshold is crossed.
 */
export function useAlertChecker(alerts, priceCache, alertEmail, setAlerts) {
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!alerts || alerts.length === 0 || !alertEmail) return;

    const check = async () => {
      const results = checkAlerts(alerts, priceCache);
      const toFire = results.filter(a => a.shouldFire);

      for (const alert of toFire) {
        try {
          await fetch('/api/send-alert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: alertEmail,
              ticker: alert.ticker,
              price: alert.price,
              condition: alert.condition,
              currentPrice: alert.currentPrice,
            }),
          });
        } catch (err) {
          console.error('Failed to send alert email:', err);
        }

        // Mark as triggered
        setAlerts(prev =>
          prev.map(a => a.id === alert.id ? { ...a, triggered: true } : a)
        );
      }
    };

    check();
    intervalRef.current = setInterval(check, 60000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [alerts, priceCache, alertEmail, setAlerts]);
}
