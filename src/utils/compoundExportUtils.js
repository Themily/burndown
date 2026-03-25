/**
 * Export utilities for Compound Interest Calculator — PDF and Excel generation.
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { round2, formatCurrency as rawFormatCurrency, formatCurrencyExact as rawFormatCurrencyExact, getCurrencySymbol } from './calculations';
import { freqToPeriodsPerYear } from './compoundCalculations';

/* ─────────────────────────────────────────────
   PDF EXPORT
   ───────────────────────────────────────────── */

export function exportCompoundPDF({ inputs, result, resultB, currencyCode }) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const fmt = (v) => rawFormatCurrency(v, currencyCode);
  const fmtExact = (v) => rawFormatCurrencyExact(v, currencyCode);
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Colours
  const darkBg = [24, 24, 27];
  const cardBg = [39, 39, 42];
  const purple = [139, 124, 247];
  const teal = [45, 212, 191];
  const green = [34, 197, 94];
  const amber = [245, 158, 11];
  const white = [245, 245, 245];
  const muted = [161, 161, 170];

  // Auto-paint dark background on every NEW page (fires before content is drawn)
  doc.internal.events.subscribe('addPage', () => {
    doc.setFillColor(...darkBg);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
  });

  // ── Page 1 — Summary ──
  doc.setFillColor(...darkBg);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Header
  doc.setFontSize(28);
  doc.setTextColor(...purple);
  doc.text('Compound', 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(...muted);
  doc.text('Compound Interest & Investment Growth Calculator', 14, 27);
  doc.text(`Generated ${new Date().toLocaleDateString()}  |  Currency: ${currencyCode}  |  Mode: ${inputs.mode}`, 14, 33);

  // Summary metrics
  const metrics = [
    { label: 'Final Balance', value: fmt(result.finalBalance), color: green },
    { label: 'Total Contributed', value: fmt(result.totalContributions), color: purple },
    { label: 'Interest Earned', value: fmt(result.totalInterest), color: teal },
    { label: 'Effective Rate', value: `${result.effectiveAnnualRate}%`, color: amber },
  ];

  if (inputs.mode === 'advanced') {
    metrics.push({ label: 'After-Tax Balance', value: fmt(result.afterTaxBalance), color: green });
    metrics.push({ label: 'Inflation-Adjusted', value: fmt(result.inflationAdjusted), color: muted });
  }

  const boxW = (pageWidth - 28 - (metrics.length - 1) * 4) / metrics.length;
  metrics.forEach((m, i) => {
    const x = 14 + i * (boxW + 4);
    doc.setFillColor(...cardBg);
    doc.roundedRect(x, 40, boxW, 22, 2, 2, 'F');
    doc.setFontSize(7);
    doc.setTextColor(...muted);
    doc.text(m.label.toUpperCase(), x + boxW / 2, 47, { align: 'center' });
    doc.setFontSize(13);
    doc.setTextColor(...m.color);
    doc.text(m.value, x + boxW / 2, 56, { align: 'center' });
  });

  // Input parameters table
  doc.setFontSize(12);
  doc.setTextColor(...white);
  doc.text('Input Parameters', 14, 74);

  const freqLabel = (f) => f === 'monthly' ? 'Monthly' : f === 'quarterly' ? 'Quarterly' : 'Annually';
  const paramData = [
    ['Initial Investment (Principal)', fmtExact(inputs.principal)],
    ['Annual Interest Rate', `${inputs.annualRate}%`],
    ['Investment Period', `${inputs.years} years`],
  ];

  if (inputs.mode !== 'simple') {
    paramData.push(['Contribution Amount', `${fmtExact(inputs.contributionAmount)} / ${freqLabel(inputs.contributionFreq).toLowerCase()}`]);
    paramData.push(['Compounding Frequency', freqLabel(inputs.compoundingFreq)]);
  }

  if (inputs.mode === 'advanced') {
    paramData.push(['Inflation Rate', `${inputs.inflationRate}%`]);
    paramData.push(['Tax Rate on Gains', `${inputs.taxRate}%`]);
  }

  autoTable(doc, {
    startY: 78,
    body: paramData,
    theme: 'plain',
    styles: { fillColor: darkBg, textColor: white, fontSize: 9, font: 'courier', cellPadding: 3 },
    columnStyles: { 0: { textColor: muted, cellWidth: 80 }, 1: { fontStyle: 'bold' } },
    alternateRowStyles: { fillColor: [30, 30, 34] },
    margin: { left: 14, right: 14 },
  });

  // Scenario B comparison (if Advanced with resultB)
  if (resultB && inputs.mode === 'advanced') {
    const compY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setTextColor(...white);
    doc.text('Scenario Comparison', 14, compY);

    const compData = [
      ['', 'Scenario A', 'Scenario B'],
      ['Final Balance', fmt(result.finalBalance), fmt(resultB.finalBalance)],
      ['Total Contributions', fmt(result.totalContributions), fmt(resultB.totalContributions)],
      ['Interest Earned', fmt(result.totalInterest), fmt(resultB.totalInterest)],
      ['After-Tax Balance', fmt(result.afterTaxBalance), fmt(resultB.afterTaxBalance)],
      ['Inflation-Adjusted', fmt(result.inflationAdjusted), fmt(resultB.inflationAdjusted)],
    ];

    autoTable(doc, {
      startY: compY + 4,
      body: compData,
      theme: 'plain',
      styles: { fillColor: darkBg, textColor: white, fontSize: 9, font: 'courier', cellPadding: 3 },
      columnStyles: { 0: { textColor: muted, cellWidth: 60 } },
      alternateRowStyles: { fillColor: [30, 30, 34] },
      margin: { left: 14, right: 14 },
    });
  }

  // ── Page 2 — Year-by-Year Growth ──
  doc.addPage('landscape');

  const scheduleHeaders = ['Year', 'Starting Balance', 'Contributions', 'Interest', 'Ending Balance'];
  if (inputs.mode === 'advanced') scheduleHeaders.push('Inflation-Adj.');

  const scheduleBody = result.yearlyData.map((yd) => {
    const row = [
      yd.year,
      fmtExact(yd.startingBalance),
      fmtExact(yd.contributions),
      fmtExact(yd.interestEarned),
      fmtExact(yd.endingBalance),
    ];
    if (inputs.mode === 'advanced') row.push(fmtExact(yd.inflationAdjustedBalance));
    return row;
  });

  let isFirstSchedulePage = true;

  autoTable(doc, {
    startY: 22,
    head: [scheduleHeaders],
    body: scheduleBody,
    theme: 'plain',
    styles: { fillColor: darkBg, textColor: white, fontSize: 8, font: 'courier', cellPadding: 2.5, halign: 'right' },
    headStyles: { fillColor: cardBg, textColor: purple, fontSize: 7.5, fontStyle: 'bold', halign: 'right' },
    columnStyles: { 0: { halign: 'center', cellWidth: 14 } },
    alternateRowStyles: { fillColor: [30, 30, 34] },
    margin: { left: 14, right: 14 },
    willDrawPage: () => {
      // Draw title only on the first schedule page (bg handled by addPage event)
      if (isFirstSchedulePage) {
        doc.setFontSize(12);
        doc.setTextColor(...purple);
        doc.text('Year-by-Year Growth Schedule', 14, 16);
        isFirstSchedulePage = false;
      }
    },
  });

  // Footer on every page
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(...muted);
    doc.text(`Compound — Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 6, { align: 'center' });
  }

  doc.save('Compound_Growth_Report.pdf');
}

/* ─────────────────────────────────────────────
   EXCEL EXPORT
   ───────────────────────────────────────────── */

export function exportCompoundExcel({ inputs, result, resultB, currencyCode }) {
  const wb = XLSX.utils.book_new();
  const fmt = (v) => rawFormatCurrency(v, currencyCode);
  const freqLabel = (f) => f === 'monthly' ? 'Monthly' : f === 'quarterly' ? 'Quarterly' : 'Annually';

  // ── Sheet 1: Summary ──
  const summaryData = [
    ['Compound — Growth Report', ''],
    ['Generated', new Date().toLocaleDateString()],
    ['Currency', currencyCode],
    ['Mode', inputs.mode.charAt(0).toUpperCase() + inputs.mode.slice(1)],
    ['', ''],
    ['INPUT PARAMETERS', ''],
    ['Initial Investment', round2(inputs.principal)],
    ['Annual Interest Rate', `${inputs.annualRate}%`],
    ['Investment Period', `${inputs.years} years`],
  ];

  if (inputs.mode !== 'simple') {
    summaryData.push(['Contribution Amount', round2(inputs.contributionAmount)]);
    summaryData.push(['Contribution Frequency', freqLabel(inputs.contributionFreq)]);
    summaryData.push(['Compounding Frequency', freqLabel(inputs.compoundingFreq)]);
  }

  if (inputs.mode === 'advanced') {
    summaryData.push(['Inflation Rate', `${inputs.inflationRate}%`]);
    summaryData.push(['Tax Rate on Gains', `${inputs.taxRate}%`]);
  }

  summaryData.push(['', '']);
  summaryData.push(['RESULTS', '']);
  summaryData.push(['Final Balance', round2(result.finalBalance)]);
  summaryData.push(['Total Contributions', round2(result.totalContributions)]);
  summaryData.push(['Total Interest Earned', round2(result.totalInterest)]);
  summaryData.push(['Effective Annual Rate', `${result.effectiveAnnualRate}%`]);

  if (inputs.mode === 'advanced') {
    summaryData.push(['Tax on Gains', round2(result.taxOnGains)]);
    summaryData.push(['After-Tax Balance', round2(result.afterTaxBalance)]);
    summaryData.push(['Inflation-Adjusted Value', round2(result.inflationAdjusted)]);
  }

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 30 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // ── Sheet 2: Year-by-Year Growth ──
  const yearlyRows = result.yearlyData.map((yd) => {
    const row = {
      Year: yd.year,
      'Starting Balance': round2(yd.startingBalance),
      'Contributions': round2(yd.contributions),
      'Interest Earned': round2(yd.interestEarned),
      'Ending Balance': round2(yd.endingBalance),
      'Total Interest': round2(yd.totalInterest),
    };
    if (inputs.mode === 'advanced') {
      row['Inflation-Adjusted'] = round2(yd.inflationAdjustedBalance);
    }
    return row;
  });

  const wsYearly = XLSX.utils.json_to_sheet(yearlyRows);
  const yearlyKeys = Object.keys(yearlyRows[0] || {});
  wsYearly['!cols'] = yearlyKeys.map((k) => ({ wch: Math.max(k.length + 2, 16) }));
  XLSX.utils.book_append_sheet(wb, wsYearly, 'Year-by-Year');

  // ── Sheet 3: Monthly Growth ──
  const monthlyRows = result.monthlyData.map((md) => ({
    Month: md.month,
    Balance: round2(md.balance),
    'Total Contributions': round2(md.contributions),
    'Total Interest': round2(md.interest),
  }));

  const wsMonthly = XLSX.utils.json_to_sheet(monthlyRows);
  wsMonthly['!cols'] = [{ wch: 8 }, { wch: 18 }, { wch: 20 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, wsMonthly, 'Monthly Growth');

  // ── Sheet 4: Scenario Comparison (if Advanced with resultB) ──
  if (resultB && inputs.mode === 'advanced') {
    const maxYears = Math.max(result.yearlyData.length, resultB.yearlyData.length);
    const compRows = [];
    for (let i = 0; i < maxYears; i++) {
      compRows.push({
        Year: i + 1,
        'Scenario A Balance': i < result.yearlyData.length ? round2(result.yearlyData[i].endingBalance) : '',
        'Scenario B Balance': i < resultB.yearlyData.length ? round2(resultB.yearlyData[i].endingBalance) : '',
        'Difference': i < result.yearlyData.length && i < resultB.yearlyData.length
          ? round2(result.yearlyData[i].endingBalance - resultB.yearlyData[i].endingBalance)
          : '',
      });
    }

    const wsComp = XLSX.utils.json_to_sheet(compRows);
    wsComp['!cols'] = [{ wch: 8 }, { wch: 22 }, { wch: 22 }, { wch: 16 }];
    XLSX.utils.book_append_sheet(wb, wsComp, 'Scenario Comparison');
  }

  XLSX.writeFile(wb, 'Compound_Growth_Report.xlsx');
}
