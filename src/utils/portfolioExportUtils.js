/**
 * Export utilities for Portfolio — PDF and Excel generation.
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
  round2,
  formatCurrency as rawFormatCurrency,
  formatCurrencyExact as rawFormatCurrencyExact,
  getCurrencySymbol,
} from './calculations';

/* ─────────────────────────────────────────────
   PDF EXPORT
   ───────────────────────────────────────────── */

export function exportPortfolioPDF({ inputs, summary, allocation, currencyCode }) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const fmt = (v) => rawFormatCurrency(v, currencyCode);
  const fmtExact = (v) => rawFormatCurrencyExact(v, currencyCode);
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Colours
  const darkBg = [24, 24, 27];
  const cardBg = [39, 39, 42];
  const teal = [45, 212, 191];
  const green = [34, 197, 94];
  const red = [239, 68, 68];
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

  doc.setFontSize(28);
  doc.setTextColor(...teal);
  doc.text('Portfolio', 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(...muted);
  doc.text('Investment portfolio tracker — Atlas Wealth', 14, 27);
  doc.text(`Generated ${new Date().toLocaleDateString()}  |  Currency: ${currencyCode}  |  Holdings: ${inputs.holdings?.length || 0}`, 14, 33);

  // Summary metrics
  const metrics = [
    { label: 'Total Value', value: fmt(summary.totalValue), color: green },
    { label: 'Cost Basis', value: fmt(summary.totalCostBasis), color: teal },
    { label: 'Gain/Loss', value: `${summary.totalGainLoss >= 0 ? '+' : ''}${fmt(summary.totalGainLoss)}`, color: summary.totalGainLoss >= 0 ? green : red },
    { label: 'Return', value: `${summary.totalGainLossPercent}%`, color: summary.totalGainLossPercent >= 0 ? green : red },
    { label: 'Holdings', value: `${summary.holdingDetails?.length || 0}`, color: teal },
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

  // Holdings table
  doc.setFontSize(12);
  doc.setTextColor(...white);
  doc.text('Holdings', 14, 74);

  const holdingsBody = (summary.holdingDetails || []).map(h => [
    h.name || '—',
    h.ticker || '—',
    h.assetClass,
    h.quantity.toString(),
    fmtExact(h.costBasis),
    fmtExact(h.currentValue),
    `${h.gainLoss >= 0 ? '+' : ''}${fmtExact(h.gainLoss)}`,
    `${h.gainLossPercent}%`,
  ]);

  autoTable(doc, {
    startY: 78,
    head: [['Name', 'Ticker', 'Class', 'Qty', 'Cost Basis', 'Value', 'Gain/Loss', 'Return']],
    body: holdingsBody,
    theme: 'plain',
    styles: { fillColor: darkBg, textColor: white, fontSize: 8, font: 'courier', cellPadding: 3 },
    headStyles: { fillColor: cardBg, textColor: teal, fontSize: 7, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [30, 30, 34] },
    margin: { left: 14, right: 14 },

  });

  // Allocation section with pie chart
  if (allocation && allocation.length > 0) {
    let allocY = doc.lastAutoTable.finalY + 10;

    // Check if we need a new page for the pie chart (need ~80mm)
    if (allocY + 80 > pageHeight - 15) {
      doc.addPage(); // event listener auto-paints dark background
      allocY = 20;
    }

    doc.setFontSize(12);
    doc.setTextColor(...white);
    doc.text('Asset Allocation', 14, allocY);

    // ── Draw donut chart ──
    const chartCX = 55;                // center X of the donut
    const chartCY = allocY + 38;       // center Y
    const outerR = 28;                 // outer radius (mm)
    const innerR = 16;                 // inner radius (mm) → donut hole
    const total = allocation.reduce((s, a) => s + a.value, 0);

    // Helper: parse hex colour to [r,g,b]
    const hexToRgb = (hex) => {
      const h = hex || '#2DD4BF';
      return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    };

    if (total > 0) {
      let startAngle = -Math.PI / 2; // start at top (12 o'clock)

      allocation.forEach((a) => {
        const sliceAngle = (a.value / total) * 2 * Math.PI;
        if (sliceAngle <= 0) return;

        const [cr, cg, cb] = hexToRgb(a.color);
        doc.setFillColor(cr, cg, cb);
        doc.setDrawColor(cr, cg, cb);
        doc.setLineWidth(0.1);

        // Build polygon points: outer arc → inner arc (reversed) → close
        const steps = Math.max(Math.ceil((sliceAngle / (2 * Math.PI)) * 64), 4);
        const polyPoints = [];

        // Outer arc
        for (let s = 0; s <= steps; s++) {
          const angle = startAngle + (sliceAngle * s) / steps;
          polyPoints.push([
            chartCX + outerR * Math.cos(angle),
            chartCY + outerR * Math.sin(angle),
          ]);
        }
        // Inner arc (reversed for closed shape)
        for (let s = steps; s >= 0; s--) {
          const angle = startAngle + (sliceAngle * s) / steps;
          polyPoints.push([
            chartCX + innerR * Math.cos(angle),
            chartCY + innerR * Math.sin(angle),
          ]);
        }

        // Convert to relative deltas for doc.lines()
        const deltas = [];
        for (let p = 1; p < polyPoints.length; p++) {
          deltas.push([
            polyPoints[p][0] - polyPoints[p - 1][0],
            polyPoints[p][1] - polyPoints[p - 1][1],
          ]);
        }
        // Close back to first point
        deltas.push([
          polyPoints[0][0] - polyPoints[polyPoints.length - 1][0],
          polyPoints[0][1] - polyPoints[polyPoints.length - 1][1],
        ]);

        doc.lines(deltas, polyPoints[0][0], polyPoints[0][1], [1, 1], 'F', true);

        startAngle += sliceAngle;
      });

      // Draw centre hole (dark circle) to complete the donut
      doc.setFillColor(...darkBg);
      doc.setDrawColor(...darkBg);
      const holeSteps = 48;
      const holePoints = [];
      for (let s = 0; s <= holeSteps; s++) {
        const angle = (2 * Math.PI * s) / holeSteps;
        holePoints.push([
          chartCX + innerR * Math.cos(angle),
          chartCY + innerR * Math.sin(angle),
        ]);
      }
      const holeDeltas = [];
      for (let p = 1; p < holePoints.length; p++) {
        holeDeltas.push([
          holePoints[p][0] - holePoints[p - 1][0],
          holePoints[p][1] - holePoints[p - 1][1],
        ]);
      }
      doc.lines(holeDeltas, holePoints[0][0], holePoints[0][1], [1, 1], 'F', true);
    }

    // Legend next to the chart
    const legendX = 100;
    let legendY = allocY + 14;
    allocation.forEach((a) => {
      const [cr, cg, cb] = hexToRgb(a.color);

      // Color swatch
      doc.setFillColor(cr, cg, cb);
      doc.roundedRect(legendX, legendY - 3, 4, 4, 1, 1, 'F');

      // Label
      doc.setFontSize(9);
      doc.setTextColor(...white);
      doc.text(`${a.label}`, legendX + 7, legendY);

      // Percentage + value
      doc.setTextColor(...muted);
      doc.setFontSize(8);
      doc.text(`${a.percent}%  ·  ${fmtExact(a.value)}`, legendX + 7, legendY + 5);

      legendY += 13;
    });

    // Allocation table below the chart
    const tableStartY = Math.max(chartCY + outerR + 8, legendY + 6);
    const allocBody = allocation.map(a => [a.label, `${a.percent}%`, fmtExact(a.value)]);
    autoTable(doc, {
      startY: tableStartY,
      head: [['Asset Class', 'Allocation', 'Value']],
      body: allocBody,
      theme: 'plain',
      styles: { fillColor: darkBg, textColor: white, fontSize: 9, font: 'courier', cellPadding: 3 },
      headStyles: { fillColor: cardBg, textColor: teal, fontSize: 8, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [30, 30, 34] },
      margin: { left: 14, right: 14 },
  
    });
  }

  // Footer on every page
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(...muted);
    doc.text(`Portfolio — Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 6, { align: 'center' });
  }

  doc.save('Portfolio_Report.pdf');
}

/* ─────────────────────────────────────────────
   EXCEL EXPORT
   ───────────────────────────────────────────── */

export function exportPortfolioExcel({ inputs, summary, allocation, currencyCode }) {
  const wb = XLSX.utils.book_new();
  const fmt = (v) => rawFormatCurrency(v, currencyCode);

  // Sheet 1: Summary
  const summaryData = [
    ['Portfolio — Investment Report', ''],
    ['Generated', new Date().toLocaleDateString()],
    ['Currency', currencyCode],
    ['', ''],
    ['PORTFOLIO SUMMARY', ''],
    ['Total Value', fmt(summary.totalValue)],
    ['Cost Basis', fmt(summary.totalCostBasis)],
    ['Total Gain/Loss', fmt(summary.totalGainLoss)],
    ['Return %', `${summary.totalGainLossPercent}%`],
    ['Number of Holdings', summary.holdingDetails?.length || 0],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 25 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // Sheet 2: Holdings
  const holdingsRows = (summary.holdingDetails || []).map(h => ({
    Name: h.name,
    Ticker: h.ticker,
    'Asset Class': h.assetClass,
    Quantity: h.quantity,
    'Purchase Price': round2(h.purchasePrice),
    'Cost Basis': round2(h.costBasis),
    'Current Value': round2(h.currentValue),
    'Gain/Loss': round2(h.gainLoss),
    'Return %': h.gainLossPercent,
  }));
  if (holdingsRows.length > 0) {
    const wsHoldings = XLSX.utils.json_to_sheet(holdingsRows);
    wsHoldings['!cols'] = [{ wch: 25 }, { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, wsHoldings, 'Holdings');
  }

  // Sheet 3: Allocation
  if (allocation && allocation.length > 0) {
    const allocRows = allocation.map(a => ({
      'Asset Class': a.label,
      'Allocation %': a.percent,
      Value: round2(a.value),
    }));
    const wsAlloc = XLSX.utils.json_to_sheet(allocRows);
    wsAlloc['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsAlloc, 'Allocation');
  }

  XLSX.writeFile(wb, 'Portfolio_Report.xlsx');
}
