import { useEffect, useRef } from 'react';
import { checkAlerts } from '../utils/portfolioCalculations';

/**
 * Custom hook that checks price alerts every 60 seconds.
 * Sends email via /api/send-alert when a threshold is crossed.
 *
 * Fix PA-1: Alert is only marked as triggered AFTER the API confirms
 * a successful 2xx response. Network failures, 429 rate-limits, and
 * 5xx errors leave the alert in "Monitoring" so it can re-fire on the
 * next check cycle once the issue is resolved.
 *
 * Fix PA-2: The interval is started once on mount and never restarted.
 * Latest values of alerts/priceCache/alertEmail are kept in refs so the
 * interval callback always reads fresh data without being listed in the
 * useEffect dependency array — which previously caused the interval to
 * reset to 0 every time setAlerts() updated the alerts state.
 */
export function useAlertChecker(alerts, priceCache, alertEmail, setAlerts, currencySymbol = '$') {
  const intervalRef  = useRef(null);
  // Refs mirror the latest prop/state values for use inside the interval
  // without causing the effect to re-run.
  const alertsRef    = useRef(alerts);
  const cacheRef     = useRef(priceCache);
  const emailRef     = useRef(alertEmail);
  const setAlertsRef = useRef(setAlerts);
  // PA-6: ref for currency symbol so the email reflects the user's currency.
  const symbolRef    = useRef(currencySymbol);

  // Keep refs in sync on every render — no side-effects, no interval reset.
  alertsRef.current    = alerts;
  cacheRef.current     = priceCache;
  emailRef.current     = alertEmail;
  setAlertsRef.current = setAlerts;
  symbolRef.current    = currencySymbol;

  useEffect(() => {
    const check = async () => {
      // Read latest values through refs — no stale closures.
      const currentAlerts = alertsRef.current;
      const currentCache  = cacheRef.current;
      const currentEmail  = emailRef.current;

      if (!currentAlerts || currentAlerts.length === 0 || !currentEmail) return;

      const results = checkAlerts(currentAlerts, currentCache);
      const toFire  = results.filter(a => a.shouldFire);

      for (const alert of toFire) {
        try {
          const res = await fetch('/api/send-alert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to:             currentEmail,
              ticker:         alert.ticker,
              price:          alert.price,
              condition:      alert.condition,
              currentPrice:   alert.currentPrice,
              currencySymbol: symbolRef.current,
            }),
          });

          if (!res.ok) {
            // Non-2xx (429 rate-limit, 500 server error, etc.) — do NOT
            // mark as triggered; the alert stays in Monitoring and will
            // retry on the next 60-second cycle.
            console.warn(
              `Alert email not sent for ${alert.ticker} (HTTP ${res.status}). ` +
              `Alert remains in Monitoring state.`
            );
            continue;
          }

          // Email confirmed delivered — now safe to mark as triggered.
          setAlertsRef.current(prev =>
            prev.map(a => a.id === alert.id ? { ...a, triggered: true } : a)
          );
        } catch (err) {
          // Network failure — leave alert in Monitoring so it retries.
          console.error(
            `Failed to send alert email for ${alert.ticker}:`, err.message
          );
        }
      }
    };

    // Run immediately on mount, then every 60 s.
    // Empty dependency array guarantees the interval is created ONCE and
    // never torn down / restarted due to state changes inside the callback.
    check();
    intervalRef.current = setInterval(check, 60000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
