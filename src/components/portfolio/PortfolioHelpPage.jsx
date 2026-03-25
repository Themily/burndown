import React from 'react';

function Section({ title, children }) {
  return (
    <section className="card mx-4 mb-6">
      <h2 className="font-heading text-xl font-bold mb-4 portfolio-text">{title}</h2>
      <div className="text-text-secondary text-sm leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export default function PortfolioHelpPage({ onBack }) {
  return (
    <div className="pb-16 pt-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mx-4 mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-teal hover:text-green transition-colors group"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          <span className="text-sm font-medium group-hover:underline">Back to Portfolio</span>
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
          Portfolio Help Guide
        </h1>
        <p className="text-text-secondary text-lg leading-relaxed mb-0">
          A plain-English guide to every feature, formula, and setting in the Portfolio tracker.
        </p>
      </div>

      <Section title="Complexity Modes">
        <p>The Portfolio app has three modes to match your experience level. Switch between them using the <strong className="text-text-primary">Simple / Intermediate / Advanced</strong> pills at the top of the page.</p>
        <div className="space-y-3 mt-3">
          <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4">
            <p className="text-text-primary font-semibold mb-1">🟢 Simple</p>
            <p>Holdings input, allocation donut chart, holdings table, export (PDF &amp; Excel). Perfect for beginners who just want to track what they own.</p>
          </div>
          <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4">
            <p className="text-text-primary font-semibold mb-1">🔵 Intermediate</p>
            <p>Everything in Simple, plus: Best/Worst performer, Target Allocation field, Rebalancing recommendations, Performance chart, Watchlists, and Financial News.</p>
          </div>
          <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4">
            <p className="text-text-primary font-semibold mb-1">🟣 Advanced</p>
            <p>Everything in Intermediate, plus: Goal Planner, Portfolio Simulator (What-If &amp; Monte Carlo), and Price Alerts with email notifications.</p>
          </div>
        </div>
        <p className="mt-3">Your mode preference is saved automatically — the app remembers it between sessions.</p>
      </Section>

      <Section title="What is Portfolio Tracking?">
        <p>Portfolio tracking helps you monitor all your investments in one place. You can see your total value, gain/loss per holding, and how your money is allocated across different asset classes.</p>
        <p>The Portfolio app supports <strong className="text-text-primary">stocks, ETFs, bonds, cryptocurrencies, commodities</strong> (gold, silver, oil), and <strong className="text-text-primary">cash</strong>.</p>
      </Section>

      <Section title="Understanding Asset Classes">
        <ul className="list-disc list-inside space-y-1">
          <li><strong className="text-text-primary">Stocks</strong> — Individual company shares (AAPL, MSFT, GOOGL)</li>
          <li><strong className="text-text-primary">ETFs</strong> — Exchange-traded funds tracking indices (SPY, QQQ, VOO)</li>
          <li><strong className="text-text-primary">Bonds</strong> — Fixed-income securities (government, corporate)</li>
          <li><strong className="text-text-primary">Crypto</strong> — Cryptocurrencies (BTC, ETH)</li>
          <li><strong className="text-text-primary">Commodities</strong> — Physical goods (gold, silver, oil)</li>
          <li><strong className="text-text-primary">Cash</strong> — Cash reserves, money market, savings</li>
        </ul>
      </Section>

      <Section title="How Allocation Works">
        <p>Asset allocation shows what percentage of your total portfolio value is in each asset class. A well-diversified portfolio spreads risk across multiple classes.</p>
        <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4 mt-3">
          <p className="text-text-primary font-semibold mb-2">Common allocation strategies:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong className="text-teal">60/40</strong> — 60% stocks/ETFs, 40% bonds (conservative)</li>
            <li><strong className="text-teal">80/20</strong> — 80% stocks/ETFs, 20% bonds (moderate)</li>
            <li><strong className="text-teal">All-Weather</strong> — Stocks + bonds + gold + commodities (balanced)</li>
          </ul>
        </div>
      </Section>

      <Section title="Target Allocation (%)">
        <p>When adding a holding, you can optionally set a <strong className="text-text-primary">Target Allocation (%)</strong> — the percentage of your total portfolio you want that asset class to represent.</p>
        <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4 mt-3">
          <p className="text-text-primary font-semibold mb-2">Example target mix:</p>
          <ul className="space-y-1">
            <li className="flex justify-between"><span>Vanguard S&amp;P 500 (ETF)</span><strong className="text-teal">60%</strong></li>
            <li className="flex justify-between"><span>Apple Inc. (Stock)</span><strong className="text-teal">20%</strong></li>
            <li className="flex justify-between"><span>Bitcoin (Crypto)</span><strong className="text-teal">15%</strong></li>
            <li className="flex justify-between"><span>Gold (Commodity)</span><strong className="text-teal">5%</strong></li>
          </ul>
        </div>
        <p className="mt-3">This field is <strong className="text-text-primary">optional</strong> — if left empty, the Rebalancing section uses the default target allocations set directly in the Rebalancing card instead.</p>
        <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4 mt-3">
          <p className="text-amber text-sm"><strong>Available in:</strong> Intermediate and Advanced modes only.</p>
        </div>
      </Section>

      <Section title="Rebalancing Guide">
        <p>Rebalancing means adjusting your holdings back to your intended target allocation. Over time, market movements shift your mix — for example, if Bitcoin surges it might grow from 15% to 35% of your portfolio, exposing you to more crypto risk than intended.</p>
        <p>The Rebalancing section compares:</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong className="text-text-primary">Current %</strong> — what each asset class actually is today, based on live/entered prices</li>
          <li><strong className="text-text-primary">Target %</strong> — what you want it to be</li>
          <li><strong className="text-text-primary">Difference</strong> — the gap between the two</li>
        </ul>
        <p>The app then tells you exactly:</p>
        <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4 mt-3 space-y-2">
          <div className="flex items-center gap-3"><span className="text-green font-bold w-10">Buy</span><span>Increase underweighted asset classes</span></div>
          <div className="flex items-center gap-3"><span className="text-debt-red font-bold w-10">Sell</span><span>Reduce overweighted asset classes</span></div>
          <div className="flex items-center gap-3"><span className="text-text-muted font-bold w-10">Hold</span><span>Already at or near target — no action needed</span></div>
        </div>
        <p className="mt-3">Each recommendation includes the exact <strong className="text-text-primary">dollar amount ($)</strong> to buy or sell to bring your portfolio back in line.</p>
        <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4 mt-3">
          <p className="text-amber text-sm"><strong>Available in:</strong> Intermediate and Advanced modes only.</p>
        </div>
      </Section>

      <Section title="Understanding Gain/Loss">
        <p><strong className="text-text-primary">Cost Basis</strong> = Quantity x Purchase Price (what you paid)</p>
        <p><strong className="text-text-primary">Current Value</strong> = Quantity x Current Price</p>
        <p><strong className="text-green">Gain</strong> or <strong className="text-debt-red">Loss</strong> = Current Value - Cost Basis</p>
        <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4 mt-3 font-mono text-xs">
          <p><strong className="text-teal">Example:</strong></p>
          <p>Bought 10 shares of VOO at $420.50 = <strong>$4,205.00</strong> cost basis</p>
          <p>Current price: $510.20 = <strong>$5,102.00</strong> current value</p>
          <p className="text-green mt-1">Gain: +$897.00 (+21.3%)</p>
        </div>
      </Section>

      <Section title="Monte Carlo Simulation">
        <p>Monte Carlo simulation runs <strong className="text-text-primary">1,000 random scenarios</strong> to estimate the range of possible outcomes for your portfolio. Each simulation uses:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Historical average returns per asset class</li>
          <li>Historical volatility (standard deviation)</li>
          <li>Random monthly returns drawn from normal distribution</li>
        </ul>
        <p>The result shows <strong className="text-text-primary">percentile bands</strong>: the best 10%, median (50th percentile), and worst 10% outcomes, plus the probability of reaching your goal.</p>
      </Section>

      <Section title="Setting Price Alerts">
        <p>Price alerts notify you via email when an asset crosses your specified threshold. Set your email address once, then create alerts for any ticker symbol.</p>
        <p><strong className="text-text-primary">How it works:</strong> When the Portfolio app is open in your browser, it checks prices every 60 seconds. If a threshold is crossed, it sends an email via our Resend-powered backend.</p>
        <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4 mt-3">
          <p className="text-amber text-sm"><strong>Note:</strong> Alerts only fire while the app tab is open. Email notifications require the Resend API to be configured on deployment.</p>
        </div>
      </Section>

      <Section title="Tips for Portfolio Management">
        <div className="space-y-3">
          {[
            'Diversify across asset classes to reduce risk',
            'Rebalance quarterly or when allocations drift more than 5%',
            'Use the What-If simulator before making large investments',
            'Set price alerts for key support and resistance levels',
            'Review your goal planner monthly to stay on track',
            'Don\'t chase performance — stick to your allocation strategy',
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-teal font-bold text-lg">{i + 1}</span>
              <p className="text-text-secondary">{tip}</p>
            </div>
          ))}
        </div>
      </Section>

      <div className="mx-4 mt-8 p-4 rounded-xl border border-border-subtle bg-bg-elevated/50">
        <div className="flex items-start gap-3">
          <span className="text-amber text-lg flex-shrink-0">⚠️</span>
          <div>
            <p className="font-semibold text-text-secondary mb-1">Disclaimer</p>
            <p className="text-text-muted text-xs leading-relaxed">
              Portfolio is an educational tool and does not constitute financial advice.
              Past performance does not guarantee future results. Monte Carlo simulations
              are estimates based on historical averages. Always consult a qualified
              financial advisor before making investment decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
