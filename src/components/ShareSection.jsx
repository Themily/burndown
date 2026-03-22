import React, { useState, useCallback } from 'react';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

export default function ShareSection() {
  const [copiedLink, setCopiedLink] = useState(false);
  const [printing, setPrinting] = useState(false);

  const handleEmail = useCallback(() => {
    const subject = encodeURIComponent('BurnDown — Debt Snowball Planner');
    const body = encodeURIComponent(
      `Check out BurnDown, a debt payoff planner for the FIRE community:\n\n${window.location.href}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_self');
  }, []);

  const handlePrint = useCallback(async () => {
    setPrinting(true);

    // Small delay so the "Generating..." state renders
    await new Promise((r) => setTimeout(r, 100));

    try {
      const element = document.querySelector('[data-print-root]');
      if (!element) {
        setPrinting(false);
        return;
      }

      const canvas = await html2canvas(element, {
        backgroundColor: '#06070e',
        scale: 1.5,
        useCORS: true,
        logging: false,
        windowWidth: 1400,
        scrollX: 0,
        scrollY: -window.scrollY,
        onclone: (clonedDoc) => {
          // Hide Share section
          clonedDoc.querySelectorAll('.print-hidden-capture').forEach((el) => {
            el.style.display = 'none';
          });

          // Hide Export section
          clonedDoc.querySelectorAll('[aria-label="Export as PDF"], [aria-label="Export as Excel"]').forEach((btn) => {
            const card = btn.closest('.card');
            if (card) card.style.display = 'none';
          });

          // Hide background orbs (they don't render well)
          clonedDoc.querySelectorAll('.bg-scene').forEach((el) => {
            el.style.display = 'none';
          });

          // Hide "Add Debt" button, reorder arrows, edit/delete buttons
          clonedDoc.querySelectorAll('[aria-label="Add new debt"], [aria-label*="Move "], [aria-label*="Edit "], [aria-label*="Delete "]').forEach((btn) => {
            btn.style.display = 'none';
          });

          // Hide the "Show all X months" / collapse button
          clonedDoc.querySelectorAll('button[aria-expanded]').forEach((btn) => {
            btn.style.display = 'none';
          });

          // Replace inputs with static text showing their values
          clonedDoc.querySelectorAll('input, select').forEach((el) => {
            const val = el.tagName === 'SELECT'
              ? el.options[el.selectedIndex]?.text || el.value
              : el.value;
            const span = clonedDoc.createElement('span');
            span.textContent = val;
            span.style.cssText = `
              font-family: 'JetBrains Mono', monospace;
              font-size: 14px;
              color: #eeeef4;
              padding: 10px 14px;
              display: block;
            `;
            if (el.parentNode) el.parentNode.replaceChild(span, el);
          });

          // Hide currency selector arrow
          clonedDoc.querySelectorAll('[aria-label="Select display currency"]').forEach((el) => {
            // Already replaced by span above
          });
        },
      });

      // Build PDF
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Portrait for tall pages, landscape if very wide
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [imgWidth, imgHeight],
        hotfixes: ['px_scaling'],
      });

      // If content fits in one tall page, just add it
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, imgWidth, imgHeight);

      pdf.save('BurnDown_Full_Report.pdf');
    } catch (err) {
      console.error('Print PDF failed:', err);
    }

    setPrinting(false);
  }, []);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  }, []);

  return (
    <div className="card mx-4 mb-10 print:hidden print-hidden-capture">
      <h2 className="font-heading text-lg font-semibold mb-4">Like this? Please share</h2>
      <div className="flex items-center gap-3 flex-wrap">
        {/* Email */}
        <button
          onClick={handleEmail}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border-subtle hover:border-border-medium text-text-secondary hover:text-text-primary transition-all backdrop-blur-xl"
          aria-label="Share by email"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
          </svg>
          <span className="text-sm font-medium">Email</span>
        </button>

        {/* Print as PDF */}
        <button
          onClick={handlePrint}
          disabled={printing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border-subtle hover:border-border-medium text-text-secondary hover:text-text-primary transition-all backdrop-blur-xl disabled:opacity-50"
          aria-label="Print this page as PDF"
        >
          {printing ? (
            <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"/>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
          )}
          <span className="text-sm font-medium">{printing ? 'Generating...' : 'Print'}</span>
        </button>

        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all backdrop-blur-xl ${
            copiedLink
              ? 'border-green/40 text-green bg-green-dim'
              : 'border-border-subtle hover:border-border-medium text-text-secondary hover:text-text-primary'
          }`}
          aria-label="Copy link to this page"
        >
          {copiedLink ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          )}
          <span className="text-sm font-medium">{copiedLink ? 'Copied!' : 'Link'}</span>
        </button>
      </div>
    </div>
  );
}
