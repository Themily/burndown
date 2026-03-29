import React, { useMemo } from 'react';
import CompoundHeader from './CompoundHeader';
import CompoundSummaryBar from './CompoundSummaryBar';
import CompoundInputPanel from './CompoundInputPanel';
import CompoundChart from './CompoundChart';
import CompoundScenarios from './CompoundScenarios';
import CompoundSchedule from './CompoundSchedule';
import CompoundExportButtons from './CompoundExportButtons';
import CompoundHelpPage from './CompoundHelpPage';
import ShareSection from '../ShareSection';
import Footer from '../Footer';
import { calculateCompoundGrowth } from '../../utils/compoundCalculations';

export default function CompoundLayout({
  compoundInputs,
  setCompoundInputs,
  currentPage,
  onNavigatePage,
  onBackToHub,
  focusRef,
}) {
  const mode = compoundInputs.mode;

  // Calculate results for Scenario A (main inputs)
  const resultA = useMemo(() => {
    const inputs = {
      principal: compoundInputs.principal,
      annualRate: compoundInputs.annualRate,
      years: compoundInputs.years,
      contributionAmount: mode === 'simple' ? 0 : compoundInputs.contributionAmount,
      contributionFreq: mode === 'simple' ? 'monthly' : compoundInputs.contributionFreq,
      compoundingFreq: mode === 'simple' ? 'monthly' : compoundInputs.compoundingFreq,
      inflationRate: mode === 'advanced' ? compoundInputs.inflationRate : 0,
      taxRate: mode === 'advanced' ? compoundInputs.taxRate : 0,
    };
    return calculateCompoundGrowth(inputs);
  }, [
    compoundInputs.principal, compoundInputs.annualRate, compoundInputs.years,
    compoundInputs.contributionAmount, compoundInputs.contributionFreq, compoundInputs.compoundingFreq,
    compoundInputs.inflationRate, compoundInputs.taxRate, mode,
  ]);

  // Calculate results for Scenario B (Advanced mode only)
  const resultB = useMemo(() => {
    if (mode !== 'advanced') return null;
    const sb = compoundInputs.scenarioB;
    return calculateCompoundGrowth({
      principal: sb.principal,
      annualRate: sb.annualRate,
      years: sb.years,
      contributionAmount: sb.contributionAmount,
      contributionFreq: sb.contributionFreq,
      compoundingFreq: sb.compoundingFreq,
      inflationRate: sb.inflationRate,
      taxRate: sb.taxRate,
    });
  }, [compoundInputs.scenarioB, mode]);

  const handleSetMode = (newMode) => {
    setCompoundInputs((prev) => ({ ...prev, mode: newMode }));
  };

  return (
    <div className="slide-in-right" data-print-root>
      <div tabIndex={-1} ref={focusRef} className="outline-none" />
      <CompoundHeader
        mode={mode}
        onSetMode={handleSetMode}
        currentPage={currentPage}
        onNavigatePage={onNavigatePage}
        onBackToHub={onBackToHub}
      />

      {currentPage === 'help' ? (
        <CompoundHelpPage onBack={() => { onNavigatePage('calculator'); window.scrollTo(0, 0); }} />
      ) : (
        <>
          <CompoundSummaryBar result={resultA} mode={mode} />

          {/* Main Grid: Input Panel */}
          <div className="mx-4 mb-10">
            <CompoundInputPanel
              inputs={compoundInputs}
              setInputs={setCompoundInputs}
              mode={mode}
            />
          </div>

          <CompoundChart result={resultA} resultB={resultB} mode={mode} />

          {/* Scenario Comparison (Advanced only) */}
          {mode === 'advanced' && resultB && (
            <CompoundScenarios
              resultA={resultA}
              resultB={resultB}
              scenarioBInputs={compoundInputs.scenarioB}
              setScenarioBInputs={setCompoundInputs}
            />
          )}

          <CompoundSchedule result={resultA} mode={mode} />

          <CompoundExportButtons
            inputs={{ ...compoundInputs, mode }}
            result={resultA}
            resultB={resultB}
          />

          <ShareSection />
          <Footer />
        </>
      )}
    </div>
  );
}
