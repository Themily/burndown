import React from 'react';

function Section({ title, children }) {
  return (
    <section className="card mx-4 mb-6">
      <h2 className="font-heading text-xl font-bold mb-4 compound-text">{title}</h2>
      <div className="text-text-secondary text-sm leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export default function CompoundHelpPage({ onBack }) {
  return (
    <div className="pb-16 pt-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mx-4 mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-purple hover:text-[#a78bfa] transition-colors group"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          <span className="text-sm font-medium group-hover:underline">Back to Calculator</span>
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-border-subtle bg-bg-card/60 text-text-secondary font-bold text-sm tracking-wide hover:bg-bg-card hover:text-text-primary transition-all backdrop-blur-xl"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"/>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
            <rect x="6" y="14" width="12" height="8"/>
          </svg>
          Print Help Guide
        </button>
      </div>

      <div className="card mx-4 !p-8 md:!p-12 mb-8">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-3">
          Compound Help Guide
        </h1>
        <p className="text-text-secondary text-lg leading-relaxed mb-0">
          A plain-English guide to every feature, formula, and setting in the Compound calculator.
        </p>
      </div>

      <Section title="What is Compound Interest?">
        <p>
          Compound interest is interest calculated on both the initial principal and the accumulated interest from previous periods.
          Unlike simple interest (calculated only on the principal), compound interest causes your money to grow exponentially over time.
        </p>
        <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4 font-mono text-xs">
          <p className="text-text-muted mb-2">The compound interest formula:</p>
          <p className="text-purple font-bold">FV = PV x (1 + r/n)^(n x t) + PMT x [((1 + r/n)^(n x t) - 1) / (r/n)]</p>
          <div className="mt-3 space-y-1 text-text-muted">
            <p><span className="text-text-secondary">FV</span> = Future Value (what you'll have)</p>
            <p><span className="text-text-secondary">PV</span> = Present Value (initial investment)</p>
            <p><span className="text-text-secondary">r</span> = Annual interest rate (as decimal)</p>
            <p><span className="text-text-secondary">n</span> = Compounding periods per year</p>
            <p><span className="text-text-secondary">t</span> = Time in years</p>
            <p><span className="text-text-secondary">PMT</span> = Periodic contribution amount</p>
          </div>
        </div>
        <p>
          For example, $10,000 at 7% compounded monthly for 20 years becomes <strong className="text-green">$40,387</strong> —
          that's over 4x your initial investment, with $30,387 earned purely from compound interest.
        </p>
      </Section>

      <Section title="Understanding the Modes">
        <div className="space-y-4">
          <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4">
            <h3 className="font-semibold text-text-primary mb-2">Simple Mode</h3>
            <p>Perfect for quick calculations. Enter your principal, interest rate, and time period.
            Assumes monthly compounding and no additional contributions.</p>
            <p className="text-text-muted mt-1">Best for: Quick "what if" calculations, understanding basic growth.</p>
          </div>
          <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4">
            <h3 className="font-semibold text-text-primary mb-2">Intermediate Mode</h3>
            <p>Adds regular contributions and frequency controls. Set how much you'll add periodically
            and choose your compounding frequency (monthly, quarterly, or annually).</p>
            <p className="text-text-muted mt-1">Best for: Planning regular savings and retirement contributions.</p>
          </div>
          <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4">
            <h3 className="font-semibold text-text-primary mb-2">Advanced Mode</h3>
            <p>Full-featured mode with inflation adjustment, tax impact on gains, and side-by-side
            scenario comparison. Compare two different investment strategies.</p>
            <p className="text-text-muted mt-1">Best for: Detailed financial planning, comparing investment options, real-return analysis.</p>
          </div>
        </div>
      </Section>

      <Section title="How Contributions Work">
        <p>
          Regular contributions dramatically accelerate wealth building. The calculator supports
          three contribution frequencies:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong className="text-text-primary">Monthly</strong> — 12 contributions per year (most common for salary-based savings)</li>
          <li><strong className="text-text-primary">Quarterly</strong> — 4 contributions per year (common for bonus-based investing)</li>
          <li><strong className="text-text-primary">Annually</strong> — 1 contribution per year (lump sum annual investment)</li>
        </ul>
        <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4">
          <p className="text-text-muted text-xs mb-2">Example: $500/month at 7% for 20 years</p>
          <p>Total contributed: <strong className="text-purple">$120,000</strong></p>
          <p>Interest earned: <strong className="text-teal">$140,475</strong></p>
          <p>Final balance: <strong className="text-green">$260,475</strong></p>
          <p className="text-text-muted mt-2">Your interest earned more than you contributed!</p>
        </div>
      </Section>

      <Section title="Compounding Frequency Explained">
        <p>
          Compounding frequency determines how often interest is added to your balance.
          More frequent compounding means slightly higher returns because interest starts
          earning interest sooner.
        </p>
        <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4">
          <p className="text-text-muted text-xs mb-2">$10,000 at 7% for 10 years (no contributions):</p>
          <table className="w-full text-xs mt-2">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="text-left py-2 text-text-muted">Frequency</th>
                <th className="text-right py-2 text-text-muted">Final Balance</th>
                <th className="text-right py-2 text-text-muted">Effective Rate</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border-subtle">
                <td className="py-2">Annually</td>
                <td className="py-2 text-right font-mono">$19,671.51</td>
                <td className="py-2 text-right font-mono">7.00%</td>
              </tr>
              <tr className="border-b border-border-subtle">
                <td className="py-2">Quarterly</td>
                <td className="py-2 text-right font-mono">$19,897.89</td>
                <td className="py-2 text-right font-mono">7.19%</td>
              </tr>
              <tr>
                <td className="py-2">Monthly</td>
                <td className="py-2 text-right font-mono text-green">$20,096.61</td>
                <td className="py-2 text-right font-mono text-green">7.23%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Inflation Adjustment (Real vs Nominal Returns)">
        <p>
          Inflation erodes purchasing power over time. A dollar today buys more than a dollar in 20 years.
          The inflation-adjusted value shows what your future balance would be worth in today's dollars.
        </p>
        <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4">
          <p className="text-text-muted text-xs mb-2">Example with 2.5% inflation:</p>
          <p>Nominal balance (what you'll see): <strong className="text-green">$260,475</strong></p>
          <p>Inflation-adjusted (today's purchasing power): <strong className="text-text-secondary">$160,052</strong></p>
          <p className="text-text-muted mt-2">Your real return is the nominal return minus inflation.</p>
        </div>
        <p>
          <strong className="text-text-primary">Rule of thumb:</strong> Subtract inflation from your expected return
          to estimate your "real" return. At 7% nominal and 2.5% inflation, your real return is approximately 4.5%.
        </p>
      </Section>

      <Section title="Tax Impact on Gains">
        <p>
          In Advanced mode, you can model the tax impact on your investment gains. The tax is applied
          to the total interest earned (not contributions, since those were already taxed).
        </p>
        <p>
          <strong className="text-text-primary">After-Tax Balance</strong> = Final Balance - (Total Interest x Tax Rate)
        </p>
        <p className="text-text-muted">
          Note: This is a simplified model. Actual tax treatment varies by account type (taxable, tax-deferred,
          tax-free), jurisdiction, and holding period. Consult a tax professional for your specific situation.
        </p>
      </Section>

      <Section title="Scenario Comparison Guide">
        <p>
          The Advanced mode lets you compare two investment scenarios side by side. Use this to answer questions like:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Higher rate vs. higher contributions — which matters more?</li>
          <li>Lump sum vs. dollar-cost averaging</li>
          <li>Conservative (5%) vs. aggressive (10%) portfolio allocation</li>
          <li>Starting early with less vs. starting later with more</li>
        </ul>
        <p>The chart overlays both scenarios so you can see when and how they diverge.</p>
      </Section>

      <Section title="Tips for Maximizing Growth">
        <div className="space-y-3">
          <div className="flex gap-3 items-start">
            <span className="text-purple font-bold text-lg">1</span>
            <div>
              <p className="font-semibold text-text-primary">Start early</p>
              <p>Time is the most powerful factor in compound growth. Starting 10 years earlier can double your final balance.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-purple font-bold text-lg">2</span>
            <div>
              <p className="font-semibold text-text-primary">Contribute consistently</p>
              <p>Regular contributions matter more than the initial lump sum for most people. Even small amounts add up significantly.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-purple font-bold text-lg">3</span>
            <div>
              <p className="font-semibold text-text-primary">Minimize fees</p>
              <p>A 1% difference in fees compounds dramatically over decades. Choose low-cost index funds when possible.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-purple font-bold text-lg">4</span>
            <div>
              <p className="font-semibold text-text-primary">Use tax-advantaged accounts</p>
              <p>Maximize contributions to tax-free or tax-deferred accounts before investing in taxable accounts.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-purple font-bold text-lg">5</span>
            <div>
              <p className="font-semibold text-text-primary">Don't interrupt compounding</p>
              <p>Avoid withdrawing from long-term investments. Every dollar removed loses years of future compound growth.</p>
            </div>
          </div>
        </div>
      </Section>

      {/* Disclaimer */}
      <div className="mx-4 mt-8 p-4 rounded-xl border border-border-subtle bg-bg-elevated/50">
        <div className="flex items-start gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber mt-0.5 flex-shrink-0">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <div className="text-text-muted text-xs leading-relaxed">
            <p className="font-semibold text-text-secondary mb-1">Disclaimer</p>
            <p>
              This calculator provides estimates for educational purposes only. Actual investment returns vary
              and past performance does not guarantee future results. This is not financial advice. Consult a
              qualified financial advisor before making investment decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
