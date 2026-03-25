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

// Compound app
import CompoundLayout from './components/compound/CompoundLayout';

// Portfolio app
import PortfolioLayout from './components/portfolio/PortfolioLayout';

// Shared
import ComingSoonPage from './components/shared/ComingSoonPage';

const STORAGE_KEY = 'burndown-state';
const COMPOUND_STORAGE_KEY = 'compound-state';
const PORTFOLIO_STORAGE_KEY = 'portfolio-state';

const DEFAULT_PORTFOLIO = {
  mode: 'simple',
  holdings: [
    {
      id: 'default-1',
      name: 'Vanguard S&P 500 ETF',
      ticker: 'VOO',
      assetClass: 'etf',
      quantity: 10,
      purchasePrice: 420.50,
      purchaseDate: '2024-01-15',
      targetAllocation: null,
    },
  ],
  watchlists: [],
  targetAllocations: { stock: 40, etf: 20, bond: 20, crypto: 10, commodity: 5, cash: 5 },
  goal: { targetValue: 100000, targetDate: '2030-01-01', monthlyContribution: 500 },
  simulator: { whatIfAssetClass: 'commodity', whatIfAmount: 5000, monteCarloYears: 10, monteCarloGoal: 200000 },
  alerts: [],
  alertEmail: '',
  priceCache: {},
  lastPriceFetch: null,
};

const DEFAULT_COMPOUND = {
  mode: 'intermediate',
  principal: 10000,
  annualRate: 7,
  years: 20,
  contributionAmount: 500,
  contributionFreq: 'monthly',
  compoundingFreq: 'monthly',
  inflationRate: 2.5,
  taxRate: 15,
  scenarioB: {
    principal: 5000,
    annualRate: 10,
    years: 20,
    contributionAmount: 300,
    contributionFreq: 'monthly',
    compoundingFreq: 'monthly',
    inflationRate: 2.5,
    taxRate: 15,
  },
};

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

function loadCompoundState() {
  try {
    const saved = localStorage.getItem(COMPOUND_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_COMPOUND,
        ...parsed,
        scenarioB: { ...DEFAULT_COMPOUND.scenarioB, ...parsed.scenarioB },
      };
    }
  } catch (e) {
    // ignore
  }
  return DEFAULT_COMPOUND;
}

function loadPortfolioState() {
  try {
    const saved = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_PORTFOLIO,
        ...parsed,
        goal: { ...DEFAULT_PORTFOLIO.goal, ...parsed.goal },
        simulator: { ...DEFAULT_PORTFOLIO.simulator, ...parsed.simulator },
        targetAllocations: { ...DEFAULT_PORTFOLIO.targetAllocations, ...parsed.targetAllocations },
      };
    }
  } catch (e) {
    // ignore
  }
  return DEFAULT_PORTFOLIO;
}

function App() {
  const initial = useRef(loadState());
  const initialCompound = useRef(loadCompoundState());
  const initialPortfolio = useRef(loadPortfolioState());

  // BurnDown data state
  const [debts, setDebts] = useState(initial.current.debts);
  const [extraPayment, setExtraPayment] = useState(initial.current.extraPayment);
  const [strategy, setStrategy] = useState(initial.current.strategy);
  const [fireInputs, setFireInputs] = useState(initial.current.fireInputs);
  const [currency, setCurrency] = useState(initial.current.currency);

  // Compound data state
  const [compoundInputs, setCompoundInputs] = useState(initialCompound.current);

  // Portfolio data state
  const [portfolioInputs, setPortfolioInputs] = useState(initialPortfolio.current);

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

  // Debounced save compound state to localStorage
  const compoundSaveRef = useRef(null);
  useEffect(() => {
    if (compoundSaveRef.current) clearTimeout(compoundSaveRef.current);
    compoundSaveRef.current = setTimeout(() => {
      localStorage.setItem(COMPOUND_STORAGE_KEY, JSON.stringify(compoundInputs));
    }, 300);
    return () => { if (compoundSaveRef.current) clearTimeout(compoundSaveRef.current); };
  }, [compoundInputs]);

  // Debounced save portfolio state to localStorage
  const portfolioSaveRef = useRef(null);
  useEffect(() => {
    if (portfolioSaveRef.current) clearTimeout(portfolioSaveRef.current);
    portfolioSaveRef.current = setTimeout(() => {
      localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(portfolioInputs));
    }, 300);
    return () => { if (portfolioSaveRef.current) clearTimeout(portfolioSaveRef.current); };
  }, [portfolioInputs]);

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
    if (appId === 'burndown') setCurrentPage('dashboard');
    else if (appId === 'compound') setCurrentPage('calculator');
    else if (appId === 'portfolio') setCurrentPage('dashboard');
    else setCurrentPage('coming-soon');
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

  function navigateToCompoundPage(page) {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  }

  function navigateToPortfolioPage(page) {
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

        {/* ── Compound App ── */}
        {currentApp === 'compound' && (
          <CurrencyProvider currency={currency} setCurrency={setCurrency}>
            <CompoundLayout
              compoundInputs={compoundInputs}
              setCompoundInputs={setCompoundInputs}
              currentPage={currentPage}
              onNavigatePage={navigateToCompoundPage}
              onBackToHub={navigateToHub}
              focusRef={focusRef}
            />
          </CurrencyProvider>
        )}

        {/* ── Portfolio App ── */}
        {currentApp === 'portfolio' && (
          <CurrencyProvider currency={currency} setCurrency={setCurrency}>
            <PortfolioLayout
              portfolioInputs={portfolioInputs}
              setPortfolioInputs={setPortfolioInputs}
              currentPage={currentPage}
              onNavigatePage={navigateToPortfolioPage}
              onBackToHub={navigateToHub}
              focusRef={focusRef}
            />
          </CurrencyProvider>
        )}

      </div>
    </div>
  );
}

export default App;
