import React, { useState, useCallback } from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import { exportPortfolioPDF, exportPortfolioExcel } from '../../utils/portfolioExportUtils';

export default function PortfolioExportButtons({ inputs, summary, allocation }) {
  const { currency } = useCurrency();
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingXLSX, setExportingXLSX] = useState(false);

  const handlePDF = useCallback(() => {
    setExportingPDF(true);
    setTimeout(() => {
      try {
        exportPortfolioPDF({ inputs, summary, allocation, currencyCode: currency });
      } catch (e) {
        console.error('PDF export error:', e);
      } finally {
        setExportingPDF(false);
      }
    }, 50);
  }, [inputs, summary, allocation, currency]);

  const handleExcel = useCallback(() => {
    setExportingXLSX(true);
    setTimeout(() => {
      try {
        exportPortfolioExcel({ inputs, summary, allocation, currencyCode: currency });
      } catch (e) {
        console.error('Excel export error:', e);
      } finally {
        setExportingXLSX(false);
      }
    }, 50);
  }, [inputs, summary, allocation, currency]);

  return (
    <div className="card mx-4 mb-10 print:hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg font-bold text-text-primary mb-1">Export Report</h2>
          <p className="text-text-muted text-sm">Download your portfolio analysis as PDF or Excel.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePDF}
            disabled={exportingPDF}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-red-500/20"
          >
            {exportingPDF ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            )}
            {exportingPDF ? 'Generating...' : 'Export PDF'}
          </button>
          <button
            onClick={handleExcel}
            disabled={exportingXLSX}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl bg-gradient-to-r from-green-700 to-green-600 text-white hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-green-500/10"
          >
            {exportingXLSX ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>
            )}
            {exportingXLSX ? 'Generating...' : 'Export Excel'}
          </button>
        </div>
      </div>
    </div>
  );
}
