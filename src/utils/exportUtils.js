/**
 * Export utilities for BurnDown — PDF and Excel generation.
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
  round2,
  weightedAvgRate,
  formatMonthsDuration,
  monthsToDate,
  lifetimeWealthImpact,
  formatCurrency as rawFormatCurrency,
  formatCurrencyExact as rawFormatCurrencyExact,
  getCurrencySymbol,
} from './calculations';

/* ─────────────────────────────────────────────
   Shared helpers
   ───────────────────────────────────────────── */

function buildScheduleRows(debts, schedule) {
  const rows = [];
  let cumInterest = 0;

  schedule.forEach((monthData) => {
    cumInterest = round2(cumInterest + monthData.totalInterestThisMonth);
    const row = { Month: monthData.month };

    debts.forEach((d) => {
      const p = monthData.payments.find((pay) => pay.debtId === d.id);
      row[`${d.name} Payment`] = p ? round2(p.payment) : 0;
      row[`${d.name} Interest`] = p ? round2(p.interest) : 0;
      row[`${d.name} Balance`] = p ? round2(p.remaining) : 0;
    });

    row['Monthly Interest'] = round2(monthData.totalInterestThisMonth);
    row['Cumulative Interest'] = round2(cumInterest);
    rows.push(row);
  });

  return rows;
}

function buildSummary(debts, payoffResult, minimumOnlyResult, extraPayment, strategy, fireInputs, fireComparison, currencyCode) {
  const fmt = (v) => rawFormatCurrency(v, currencyCode);
  const sym = getCurrencySymbol(currencyCode);
  const totalBalance = debts.reduce((s, d) => s + d.balance, 0);
  const totalMinPayments = debts.reduce((s, d) => s + d.minPayment, 0);
  const avgRate = weightedAvgRate(debts);
  const interestSaved = minimumOnlyResult.totalInterest - payoffResult.totalInterest;
  const monthsAccelerated = minimumOnlyResult.months - payoffResult.months;
  const freedMonthly = totalMinPayments + extraPayment;
  const wealth = lifetimeWealthImpact(freedMonthly, fireInputs.annualReturn, 20);

  return [
    ['BurnDown — Debt Payoff Report', ''],
    ['Generated', new Date().toLocaleDateString()],
    ['Currency', currencyCode],
    ['Strategy', strategy === 'snowball' ? 'Snowball (smallest balance first)' : 'Avalanche (highest interest first)'],
    ['', ''],
    ['DEBT SUMMARY', ''],
    ['Total Debt', fmt(totalBalance)],
    ['Weighted Avg APR', `${avgRate}%`],
    ['Total Minimum Payments', `${fmt(totalMinPayments)}/mo`],
    ['Extra Snowball Payment', `${fmt(extraPayment)}/mo`],
    ['', ''],
    ['PAYOFF RESULTS', ''],
    ['Debt-Free Date', monthsToDate(payoffResult.months)],
    ['Time to Debt-Free', formatMonthsDuration(payoffResult.months)],
    ['Total Interest Paid', fmt(payoffResult.totalInterest)],
    ['Interest Saved vs Minimums', fmt(Math.max(0, interestSaved))],
    ['Months Accelerated', `${Math.max(0, monthsAccelerated)} months`],
    ['', ''],
    ['FIRE PROJECTIONS', ''],
    ['FI Number (25x expenses)', fmt(fireComparison.fiNumber)],
    ['Current Invested Assets', fmt(fireInputs.currentAssets)],
    ['Monthly Investment', `${fmt(fireInputs.monthlyInvestment)}/mo`],
    ['Post-Debt Monthly Investment', `${fmt(fireComparison.postDebtMonthlyInvestment)}/mo`],
    ['FIRE Date (minimums path)', isFinite(fireComparison.fireA_months) ? formatMonthsDuration(fireComparison.fireA_months) : 'N/A'],
    ['FIRE Date (aggressive path)', isFinite(fireComparison.fireB_months) ? formatMonthsDuration(fireComparison.fireB_months) : 'N/A'],
    ['FIRE Acceleration', isFinite(fireComparison.fireAcceleration) && fireComparison.fireAcceleration > 0 ? `${Math.round(fireComparison.fireAcceleration)} months sooner` : 'N/A'],
    ['Lifetime Wealth Impact (20yr)', fmt(wealth)],
  ];
}

function buildDebtList(debts, currencyCode) {
  const fmt = (v) => rawFormatCurrency(v, currencyCode);
  return debts.map((d) => ({
    Name: d.name,
    Type: d.type.replace(/_/g, ' '),
    Balance: round2(d.balance),
    'APR (%)': d.apr,
    'Min Payment': round2(d.minPayment),
  }));
}

/* ─────────────────────────────────────────────
   PDF EXPORT
   ───────────────────────────────────────────── */

export function exportPDF({ debts, payoffResult, minimumOnlyResult, extraPayment, strategy, fireInputs, fireComparison, currencyCode }) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const sym = getCurrencySymbol(currencyCode);
  const fmt = (v) => rawFormatCurrency(v, currencyCode);
  const fmtExact = (v) => rawFormatCurrencyExact(v, currencyCode);

  const pageWidth = doc.internal.pageSize.getWidth();

  // ── Colours ──
  const darkBg = [24, 24, 27];     // zinc-900
  const cardBg = [39, 39, 42];     // zinc-800
  const amber = [255, 107, 53];    // fire-start
  const teal = [45, 212, 191];
  const green = [34, 197, 94];
  const red = [239, 68, 68];
  const white = [245, 245, 245];
  const muted = [161, 161, 170];

  // Auto-paint dark background on every NEW page (fires before content is drawn)
  doc.internal.events.subscribe('addPage', () => {
    doc.setFillColor(...darkBg);
    doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');
  });

  // ── Page 1 — Summary ──
  doc.setFillColor(...darkBg);
  doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');

  // Header
  doc.setFontSize(28);
  doc.setTextColor(...amber);
  doc.text('BurnDown', 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(...muted);
  doc.text('Burn your debt. Fuel your FIRE.', 14, 27);
  doc.text(`Generated ${new Date().toLocaleDateString()}  |  Currency: ${currencyCode}  |  Strategy: ${strategy === 'snowball' ? 'Snowball' : 'Avalanche'}`, 14, 33);

  // Summary metrics
  const totalBalance = debts.reduce((s, d) => s + d.balance, 0);
  const totalMinPayments = debts.reduce((s, d) => s + d.minPayment, 0);
  const avgRate = weightedAvgRate(debts);
  const interestSaved = minimumOnlyResult.totalInterest - payoffResult.totalInterest;
  const freedMonthly = totalMinPayments + extraPayment;
  const wealth = lifetimeWealthImpact(freedMonthly, fireInputs.annualReturn, 20);

  const metrics = [
    { label: 'Total Debt', value: fmt(totalBalance), color: red },
    { label: 'Avg APR', value: `${avgRate}%`, color: amber },
    { label: 'Debt-Free In', value: formatMonthsDuration(payoffResult.months), color: green },
    { label: 'Interest Saved', value: fmt(Math.max(0, interestSaved)), color: teal },
    { label: 'Wealth Impact (20yr)', value: fmt(wealth), color: teal },
  ];

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

  // Debt list table
  doc.setFontSize(12);
  doc.setTextColor(...white);
  doc.text('Your Debts', 14, 74);

  const debtTableBody = debts.map((d) => [
    d.name,
    d.type.replace(/_/g, ' '),
    fmtExact(d.balance),
    `${d.apr}%`,
    `${fmtExact(d.minPayment)}/mo`,
  ]);

  autoTable(doc, {
    startY: 78,
    head: [['Name', 'Type', 'Balance', 'APR', 'Min Payment']],
    body: debtTableBody,
    theme: 'plain',
    styles: {
      fillColor: darkBg,
      textColor: white,
      fontSize: 9,
      font: 'courier',
      cellPadding: 3,
    },
    headStyles: {
      fillColor: cardBg,
      textColor: amber,
      fontSize: 8,
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: [30, 30, 34] },
    margin: { left: 14, right: 14 },
  });

  // FIRE summary
  const fireY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setTextColor(...white);
  doc.text('FIRE Projections', 14, fireY);

  const fireData = [
    ['FI Number (25x expenses)', fmt(fireComparison.fiNumber)],
    ['Current Invested Assets', fmt(fireInputs.currentAssets)],
    ['Post-Debt Monthly Investment', `${fmt(fireComparison.postDebtMonthlyInvestment)}/mo`],
    ['FIRE (minimums path)', isFinite(fireComparison.fireA_months) ? `${formatMonthsDuration(fireComparison.fireA_months)} — ${monthsToDate(fireComparison.fireA_months)}` : 'N/A'],
    ['FIRE (aggressive path)', isFinite(fireComparison.fireB_months) ? `${formatMonthsDuration(fireComparison.fireB_months)} — ${monthsToDate(fireComparison.fireB_months)}` : 'N/A'],
    ['FIRE Acceleration', isFinite(fireComparison.fireAcceleration) && fireComparison.fireAcceleration > 0 ? `${Math.round(fireComparison.fireAcceleration)} months sooner` : '—'],
    ['Lifetime Wealth Impact (20yr)', fmt(wealth)],
  ];

  autoTable(doc, {
    startY: fireY + 4,
    body: fireData,
    theme: 'plain',
    styles: {
      fillColor: darkBg,
      textColor: white,
      fontSize: 9,
      font: 'courier',
      cellPadding: 3,
    },
    columnStyles: {
      0: { textColor: muted, cellWidth: 80 },
      1: { fontStyle: 'bold' },
    },
    alternateRowStyles: { fillColor: [30, 30, 34] },
    margin: { left: 14, right: 14 },
  });

  // ── Page 2+ — Payoff Schedule ──
  doc.addPage('landscape');

  const pageHeight = doc.internal.pageSize.getHeight();

  const scheduleHeaders = ['Mo', ...debts.flatMap((d) => [`${d.name} Pmt`, `${d.name} Bal`]), 'Interest', 'Cum. Interest'];

  let cumInterest = 0;
  const scheduleBody = payoffResult.schedule.map((monthData) => {
    cumInterest = round2(cumInterest + monthData.totalInterestThisMonth);
    const row = [monthData.month];
    debts.forEach((d) => {
      const p = monthData.payments.find((pay) => pay.debtId === d.id);
      row.push(p ? fmtExact(p.payment) : '—');
      row.push(p ? fmtExact(p.remaining) : '—');
    });
    row.push(fmtExact(monthData.totalInterestThisMonth));
    row.push(fmtExact(cumInterest));
    return row;
  });

  let isFirstSchedulePage = true;

  autoTable(doc, {
    startY: 22,
    head: [scheduleHeaders],
    body: scheduleBody,
    theme: 'plain',
    styles: {
      fillColor: darkBg,
      textColor: white,
      fontSize: 7,
      font: 'courier',
      cellPadding: 2,
      halign: 'right',
    },
    headStyles: {
      fillColor: cardBg,
      textColor: amber,
      fontSize: 6.5,
      fontStyle: 'bold',
      halign: 'right',
    },
    columnStyles: { 0: { halign: 'center', cellWidth: 12 } },
    alternateRowStyles: { fillColor: [30, 30, 34] },
    margin: { left: 8, right: 8 },
    willDrawPage: () => {
      // Draw title only on the first schedule page (bg handled by addPage event)
      if (isFirstSchedulePage) {
        doc.setFontSize(12);
        doc.setTextColor(...amber);
        doc.text('Monthly Payoff Schedule', 14, 16);
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
    doc.text(
      `BurnDown — Page ${i} of ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 6,
      { align: 'center' }
    );
  }

  doc.save('BurnDown_Payoff_Report.pdf');
}

/* ─────────────────────────────────────────────
   EXCEL EXPORT
   ───────────────────────────────────────────── */

export function exportExcel({ debts, payoffResult, minimumOnlyResult, extraPayment, strategy, fireInputs, fireComparison, currencyCode }) {
  const wb = XLSX.utils.book_new();

  // ── Sheet 1: Summary ──
  const summaryData = buildSummary(debts, payoffResult, minimumOnlyResult, extraPayment, strategy, fireInputs, fireComparison, currencyCode);
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);

  // Column widths
  wsSummary['!cols'] = [{ wch: 35 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // ── Sheet 2: Debt List ──
  const debtRows = buildDebtList(debts, currencyCode);
  const wsDebts = XLSX.utils.json_to_sheet(debtRows);
  wsDebts['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, wsDebts, 'Debts');

  // ── Sheet 3: Payoff Schedule ──
  const scheduleRows = buildScheduleRows(debts, payoffResult.schedule);
  const wsSchedule = XLSX.utils.json_to_sheet(scheduleRows);

  // Auto-width columns
  const scheduleKeys = Object.keys(scheduleRows[0] || {});
  wsSchedule['!cols'] = scheduleKeys.map((k) => ({ wch: Math.max(k.length + 2, 14) }));
  XLSX.utils.book_append_sheet(wb, wsSchedule, 'Payoff Schedule');

  // ── Sheet 4: Milestones ──
  const milestoneRows = payoffResult.milestones.map((m) => ({
    Month: m.month,
    Date: monthsToDate(m.month),
    'Debt Eliminated': m.debtName,
    'Freed Payment': debts.find((d) => d.id === m.debtId)?.minPayment || 0,
  }));
  if (milestoneRows.length > 0) {
    const wsMilestones = XLSX.utils.json_to_sheet(milestoneRows);
    wsMilestones['!cols'] = [{ wch: 8 }, { wch: 18 }, { wch: 25 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsMilestones, 'Milestones');
  }

  // ── Sheet 5: FIRE Comparison ──
  const maxLen = Math.max(
    fireComparison.scenarioA.length,
    fireComparison.scenarioB.length
  );
  const fireRows = [];
  for (let i = 0; i < maxLen; i++) {
    fireRows.push({
      Month: i,
      'Net Worth (Minimums)': i < fireComparison.scenarioA.length ? fireComparison.scenarioA[i].netWorth : '',
      'Net Worth (Aggressive)': i < fireComparison.scenarioB.length ? fireComparison.scenarioB[i].netWorth : '',
    });
  }
  if (fireRows.length > 0) {
    const wsFire = XLSX.utils.json_to_sheet(fireRows);
    wsFire['!cols'] = [{ wch: 8 }, { wch: 25 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(wb, wsFire, 'FIRE Comparison');
  }

  XLSX.writeFile(wb, 'BurnDown_Payoff_Report.xlsx');
}
