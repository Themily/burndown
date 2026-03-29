import React, { useState } from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import { exportCompoundPDF, exportCompoundExcel } from '../../utils/compoundExportUtils';

export default function CompoundExportButtons({ inputs, result, resultB }) {
  const { currency } = useCurrency();
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingXLSX, setExportingXLSX] = useState(false);

  const handlePDF = () => {
    setExportingPDF(true);
    const exportData = { inputs, result, resultB, currencyCode: currency };
    setTimeout(() => {
      try { exportCompoundPDF(exportData); }
      catch (e) { console.error('PDF export failed:', e); }
      setExportingPDF(false);
    }, 50);
  };

  const handleExcel = () => {
    setExportingXLSX(true);
    const exportData = { inputs, result, resultB, currencyCode: currency };
    setTimeout(() => {
      try { exportCompoundExcel(exportData); }
      catch (e) { console.error('Excel export failed:', e); }
      setExportingXLSX(false);
    }, 50);
  };

  return (
    <div className="card mx-4 mb-10 print:hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg font-semibold">Export Report</h2>
          <p className="text-text-muted text-xs mt-1">
            Download your compound growth projections with summary, yearly schedule, and scenario comparison.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handlePDF}
            disabled={exportingPDF}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl bg-gradient-to-r from-purple to-[#a78bfa] text-white hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-purple/10"
            aria-label="Export as PDF"
          >
            {exportingPDF ? (
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            )}
            {exportingPDF ? 'Generating...' : 'Export PDF'}
          </button>

          <button
            onClick={handleExcel}
            disabled={exportingXLSX}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl bg-gradient-to-r from-green-700 to-green-600 text-white hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-green-500/10"
            aria-label="Export as Excel"
          >
            {exportingXLSX ? (
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="3" y1="15" x2="21" y2="15"/>
                <line x1="9" y1="3" x2="9" y2="21"/>
                <line x1="15" y1="3" x2="15" y2="21"/>
              </svg>
            )}
            {exportingXLSX ? 'Generating...' : 'Export Excel'}
          </button>
        </div>
      </div>
    </div>
  );
}
