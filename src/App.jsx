import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Header from './components/Header';
import SummaryBar from './components/SummaryBar';
import DebtInputPanel from './components/DebtInputPanel';
import StrategyToggle from './components/StrategyToggle';
import MotivationStats from './components/MotivationStats';
import PayoffTimeline from './components/PayoffTimeline';
import FIREPanel from './components/FIREPanel';
import CashFlowBreakdown from './components/CashFlowBreakdown';
import PayoffSchedule from './components/PayoffSchedule';
import ExportButtons from './components/ExportButtons';
import ShareSection from './components/ShareSection';
import Footer from './components/Footer';
import HelpPage from './components/HelpPage';
import { CurrencyProvider } from './context/CurrencyContext';
import {
  DEFAULT_DEBTS,
  DEFAULT_FIRE_INPUTS,
  calculatePayoffSchedule,
  calculateMinimumOnlyPayoff,
  buildFIREComparison,
} from './utils/calculations';

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
  const [debts, setDebts] = useState(initial.current.debts);
  const [extraPayment, setExtraPayment] = useState(initial.current.extraPayment);
  const [strategy, setStrategy] = useState(initial.current.strategy);
  const [fireInputs, setFireInputs] = useState(initial.current.fireInputs);
  const [currency, setCurrency] = useState(initial.current.currency);
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Debounced save to localStorage
  const saveTimerRef = useRef(null);
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        debts,
        extraPayment,
        strategy,
        fireInputs,
        currency,
      }));
    }, 300);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [debts, extraPayment, strategy, fireInputs, currency]);

  // Calculate payoff schedules (debounced via useMemo is fine since inputs drive it)
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

  return (
    <CurrencyProvider currency={currency} setCurrency={setCurrency}>
    <div className="min-h-screen bg-bg-primary relative">
      {/* Ambient background glow */}
      <div className="bg-scene" aria-hidden="true">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>
      <div className="max-w-[1600px] mx-auto relative z-10" data-print-root>
        <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />

        {currentPage === 'help' ? (
          <HelpPage onBack={() => { setCurrentPage('dashboard'); window.scrollTo(0, 0); }} />
        ) : (
        <>

        <SummaryBar
          debts={debts}
          payoffResult={activeResult}
          minimumOnlyResult={minimumOnlyResult}
        />

        {/* Main Grid: Debt Input | Motivation Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mx-4 mb-10">
          <div className="md:col-span-3">
            <DebtInputPanel
              debts={debts}
              setDebts={setDebts}
              extraPayment={extraPayment}
              setExtraPayment={setExtraPayment}
            />
          </div>
          <div className="md:col-span-2">
            <MotivationStats
              debts={debts}
              payoffResult={activeResult}
              minimumOnlyResult={minimumOnlyResult}
              extraPayment={extraPayment}
              fireInputs={fireInputs}
              fireComparison={fireComparison}
            />
          </div>
        </div>

        {/* Strategy Toggle — full width */}
        <div className="mx-4 mb-10">
          <StrategyToggle
            strategy={strategy}
            setStrategy={setStrategy}
            snowballResult={snowballResult}
            avalancheResult={avalancheResult}
          />
        </div>

        {/* Hero Chart */}
        <PayoffTimeline debts={debts} payoffResult={activeResult} />

        {/* Cash Flow */}
        <CashFlowBreakdown
          debts={debts}
          extraPayment={extraPayment}
          fireInputs={fireInputs}
          setFireInputs={setFireInputs}
        />

        {/* FIRE Integration */}
        <FIREPanel
          fireInputs={fireInputs}
          setFireInputs={setFireInputs}
          fireComparison={fireComparison}
          debts={debts}
          payoffResult={activeResult}
        />

        {/* Payoff Schedule Table */}
        <PayoffSchedule debts={debts} payoffResult={activeResult} />

        {/* Export Report */}
        <ExportButtons
          debts={debts}
          payoffResult={activeResult}
          minimumOnlyResult={minimumOnlyResult}
          extraPayment={extraPayment}
          strategy={strategy}
          fireInputs={fireInputs}
          fireComparison={fireComparison}
        />

        {/* Share */}
        <ShareSection />

        <Footer />
        </>
        )}
      </div>
    </div>
    </CurrencyProvider>
  );
}

export default App;
