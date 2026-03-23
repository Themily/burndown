import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { CurrencyProvider } from './context/CurrencyContext';
import {
  DEFAULT_DEBTS,
  DEFAULT_FIRE_INPUTS,
  calculatePayoffSchedule,
  calculateMinimumOnlyPayoff,
  buildFIREComparison,
} from './utils/calculations';

// Hub
import AtlasHubPage from './components/hub/AtlasHubPage';

// BurnDown app
import BurnDownLayout from './components/burndown/BurnDownLayout';

// Shared
import ComingSoonPage from './components/shared/ComingSoonPage';

const STORAGE_KEY = 'burndown-state';

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        debts: parsed.debts || DEFAULT_DEBTS,
        extraPayment: parsed.extraPayment ?? 500,
        strategy: parsed.strategy || 'snowball',
        fireInputs: { ...DEFAULT_FIRE_INPUTS, ...parsed.fireInputs },
        currency: parsed.currency || 'USD',
      };
    }
  } catch (e) {
    // ignore
  }
  return {
    debts: DEFAULT_DEBTS,
    extraPayment: 500,
    strategy: 'snowball',
    fireInputs: DEFAULT_FIRE_INPUTS,
    currency: 'USD',
  };
}

function App() {
  const initial = useRef(loadState());

  // BurnDown data state
  const [debts, setDebts] = useState(initial.current.debts);
  const [extraPayment, setExtraPayment] = useState(initial.current.extraPayment);
  const [strategy, setStrategy] = useState(initial.current.strategy);
  const [fireInputs, setFireInputs] = useState(initial.current.fireInputs);
  const [currency, setCurrency] = useState(initial.current.currency);

  // Navigation state
  const [currentApp, setCurrentApp] = useState(null); // null = Atlas hub
  const [currentPage, setCurrentPage] = useState('hub');

  // Focus management ref
  const focusRef = useRef(null);

  // Debounced save to localStorage
  const saveTimerRef = useRef(null);
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        debts, extraPayment, strategy, fireInputs, currency,
      }));
    }, 300);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [debts, extraPayment, strategy, fireInputs, currency]);

  // Move focus to new page root on navigation
  useEffect(() => {
    const id = setTimeout(() => focusRef.current?.focus(), 80);
    return () => clearTimeout(id);
  }, [currentApp, currentPage]);

  // Escape key returns to hub from any app
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape' && currentApp !== null) {
        navigateToHub();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentApp]);

  // ── Navigation helpers ──────────────────────────────────────
  function navigateToApp(appId) {
    setCurrentApp(appId);
    setCurrentPage(appId === 'burndown' ? 'dashboard' : 'coming-soon');
    window.scrollTo(0, 0);
  }

  function navigateToHub() {
    setCurrentApp(null);
    setCurrentPage('hub');
    window.scrollTo(0, 0);
  }

  function navigateToBurnDownPage(page) {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  }

  // ── BurnDown calculations ───────────────────────────────────
  const snowballResult = useMemo(
    () => calculatePayoffSchedule(debts, extraPayment, 'snowball'),
    [debts, extraPayment]
  );

  const avalancheResult = useMemo(
    () => calculatePayoffSchedule(debts, extraPayment, 'avalanche'),
    [debts, extraPayment]
  );

  const minimumOnlyResult = useMemo(
    () => calculateMinimumOnlyPayoff(debts),
    [debts]
  );

  const activeResult = strategy === 'snowball' ? snowballResult : avalancheResult;

  const fireComparison = useMemo(
    () => buildFIREComparison(debts, extraPayment, strategy, fireInputs),
    [debts, extraPayment, strategy, fireInputs]
  );

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-bg-primary relative">
      {/* Ambient background orbs */}
      <div className="bg-scene" aria-hidden="true">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>

      <div className="max-w-[1600px] mx-auto relative z-10">

        {/* ── Atlas Hub ── */}
        {currentApp === null && (
          <AtlasHubPage
            onLaunchApp={navigateToApp}
            focusRef={focusRef}
          />
        )}

        {/* ── BurnDown App ── */}
        {currentApp === 'burndown' && (
          <CurrencyProvider currency={currency} setCurrency={setCurrency}>
            <BurnDownLayout
              debts={debts} setDebts={setDebts}
              extraPayment={extraPayment} setExtraPayment={setExtraPayment}
              strategy={strategy} setStrategy={setStrategy}
              fireInputs={fireInputs} setFireInputs={setFireInputs}
              snowballResult={snowballResult}
              avalancheResult={avalancheResult}
              minimumOnlyResult={minimumOnlyResult}
              activeResult={activeResult}
              fireComparison={fireComparison}
              currentPage={currentPage}
              onNavigatePage={navigateToBurnDownPage}
              onBackToHub={navigateToHub}
              focusRef={focusRef}
            />
          </CurrencyProvider>
        )}

        {/* ── Coming Soon (Portfolio & Compound) ── */}
        {(currentApp === 'portfolio' || currentApp === 'compound') && (
          <ComingSoonPage
            appId={currentApp}
            onBackToHub={navigateToHub}
            focusRef={focusRef}
          />
        )}

      </div>
    </div>
  );
}

export default App;
