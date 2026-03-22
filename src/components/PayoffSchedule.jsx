import React, { useState, useMemo, useCallback } from 'react';
import { round2 } from '../utils/calculations';
import { useCurrency } from '../context/CurrencyContext';

export default function PayoffSchedule({ debts, payoffResult }) {
  const { formatCurrencyExact, symbol } = useCurrency();
  const [expanded, setExpanded] = useState(false);
  const [copiedCSV, setCopiedCSV] = useState(false);

  const { schedule, milestones } = payoffResult;

  if (debts.length === 0 || schedule.length === 0) return null;

  const milestoneMonths = new Set(milestones.map(m => m.month));
  const milestoneMap = {};
  milestones.forEach(m => { milestoneMap[m.month] = m; });

  const generateCSV = useCallback(() => {
    const headers = ['Month', ...debts.map(d => `${d.name} Payment`), ...debts.map(d => `${d.name} Interest`), ...debts.map(d => `${d.name} Balance`), 'Total Interest', 'Cumulative Interest'];
    const rows = [headers.join(',')];

    let cumInterest = 0;
    schedule.forEach(monthData => {
      cumInterest = round2(cumInterest + monthData.totalInterestThisMonth);
      const row = [monthData.month];
      debts.forEach(d => {
        const p = monthData.payments.find(p => p.debtId === d.id);
        row.push(p ? p.payment.toFixed(2) : '0.00');
      });
      debts.forEach(d => {
        const p = monthData.payments.find(p => p.debtId === d.id);
        row.push(p ? p.interest.toFixed(2) : '0.00');
      });
      debts.forEach(d => {
        const p = monthData.payments.find(p => p.debtId === d.id);
        row.push(p ? p.remaining.toFixed(2) : '0.00');
      });
      row.push(monthData.totalInterestThisMonth.toFixed(2));
      row.push(cumInterest.toFixed(2));
      rows.push(row.join(','));
    });

    return rows.join('\n');
  }, [schedule, debts]);

  const handleCopyCSV = useCallback(() => {
    const csv = generateCSV();
    navigator.clipboard.writeText(csv).then(() => {
      setCopiedCSV(true);
      setTimeout(() => setCopiedCSV(false), 2000);
    });
  }, [generateCSV]);

  const visibleSchedule = expanded ? schedule : schedule.slice(0, 12);
  let runningCumInterest = 0;

  return (
    <div className="card mx-4 mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-lg font-semibold">Payoff Schedule</h2>
        <div className="flex gap-2">
          <button
            onClick={handleCopyCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border-subtle hover:border-border-medium text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Copy schedule as CSV"
          >
            {copiedCSV ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green"><polyline points="20 6 9 17 4 12"/></svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Export CSV
              </>
            )}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs" role="table">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="text-left py-2 px-2 text-text-muted uppercase tracking-wider font-medium">Mo</th>
              {debts.map(d => (
                <th key={d.id} className="text-right py-2 px-2 text-text-muted uppercase tracking-wider font-medium" colSpan={1}>
                  {d.name}
                </th>
              ))}
              <th className="text-right py-2 px-2 text-text-muted uppercase tracking-wider font-medium">Interest</th>
              <th className="text-right py-2 px-2 text-text-muted uppercase tracking-wider font-medium">Cum. Interest</th>
            </tr>
          </thead>
          <tbody>
            {visibleSchedule.map((monthData) => {
              runningCumInterest = round2(runningCumInterest + monthData.totalInterestThisMonth);
              const isMilestone = milestoneMonths.has(monthData.month);

              return (
                <React.Fragment key={monthData.month}>
                  <tr className={`border-b border-border-subtle/50 ${isMilestone ? 'bg-green-dim' : 'hover:bg-bg-card-hover'}`}>
                    <td className="py-2 px-2 font-mono tabular-nums text-text-secondary">{monthData.month}</td>
                    {debts.map(d => {
                      const p = monthData.payments.find(p => p.debtId === d.id);
                      if (!p) return <td key={d.id} className="py-2 px-2 text-right font-mono tabular-nums text-text-muted">—</td>;
                      return (
                        <td key={d.id} className="py-2 px-2 text-right">
                          <div className={`font-mono tabular-nums ${p.isTarget ? 'text-fire-start font-semibold' : 'text-text-secondary'}`}>
                            {formatCurrencyExact(p.payment)}
                          </div>
                          <div className="font-mono tabular-nums text-text-muted" style={{ fontSize: '10px' }}>
                            bal: {formatCurrencyExact(p.remaining)}
                          </div>
                        </td>
                      );
                    })}
                    <td className="py-2 px-2 text-right font-mono tabular-nums text-debt-red">
                      {formatCurrencyExact(monthData.totalInterestThisMonth)}
                    </td>
                    <td className="py-2 px-2 text-right font-mono tabular-nums text-text-muted">
                      {formatCurrencyExact(runningCumInterest)}
                    </td>
                  </tr>
                  {isMilestone && (
                    <tr className="bg-green-dim/50">
                      <td colSpan={debts.length + 3} className="py-1.5 px-2 text-center">
                        <span className="text-green text-xs font-semibold">
                          🔥 {milestoneMap[monthData.month].debtName} eliminated! — +{symbol}{debts.find(d => d.id === milestoneMap[monthData.month].debtId)?.minPayment || 0}/mo freed
                        </span>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {schedule.length > 12 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-3 py-2.5 text-sm text-text-secondary hover:text-text-primary border border-border-subtle hover:border-border-medium rounded-2xl transition-all backdrop-blur-xl"
          aria-expanded={expanded}
        >
          {expanded ? `Collapse (showing all ${schedule.length} months)` : `Show all ${schedule.length} months`}
        </button>
      )}
    </div>
  );
}
