import React from 'react';
import BurnDownHeader from './BurnDownHeader';
import SummaryBar from '../SummaryBar';
import DebtInputPanel from '../DebtInputPanel';
import MotivationStats from '../MotivationStats';
import StrategyToggle from '../StrategyToggle';
import PayoffTimeline from '../PayoffTimeline';
import FIREPanel from '../FIREPanel';
import CashFlowBreakdown from '../CashFlowBreakdown';
import PayoffSchedule from '../PayoffSchedule';
import ExportButtons from '../ExportButtons';
import ShareSection from '../ShareSection';
import Footer from '../Footer';
import HelpPage from '../HelpPage';

export default function BurnDownLayout({
  debts, setDebts,
  extraPayment, setExtraPayment,
  strategy, setStrategy,
  fireInputs, setFireInputs,
  snowballResult, avalancheResult,
  minimumOnlyResult, activeResult,
  fireComparison,
  currentPage,
  onNavigatePage,
  onBackToHub,
  focusRef,
}) {
  return (
    <div className="slide-in-right" data-print-root>
      <div tabIndex={-1} ref={focusRef} className="outline-none" />
      <BurnDownHeader
        currentPage={currentPage}
        onNavigatePage={onNavigatePage}
        onBackToHub={onBackToHub}
      />

      {currentPage === 'help' ? (
        <HelpPage onBack={() => { onNavigatePage('dashboard'); window.scrollTo(0, 0); }} />
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

          <PayoffTimeline debts={debts} payoffResult={activeResult} />

          <CashFlowBreakdown
            debts={debts}
            extraPayment={extraPayment}
            fireInputs={fireInputs}
            setFireInputs={setFireInputs}
          />

          <FIREPanel
            fireInputs={fireInputs}
            setFireInputs={setFireInputs}
            fireComparison={fireComparison}
            debts={debts}
            payoffResult={activeResult}
          />

          <PayoffSchedule debts={debts} payoffResult={activeResult} />

          <ExportButtons
            debts={debts}
            payoffResult={activeResult}
            minimumOnlyResult={minimumOnlyResult}
            extraPayment={extraPayment}
            strategy={strategy}
            fireInputs={fireInputs}
            fireComparison={fireComparison}
          />

          <ShareSection />
          <Footer />
        </>
      )}
    </div>
  );
}
