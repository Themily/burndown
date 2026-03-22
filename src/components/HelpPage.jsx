import React from 'react';

export default function HelpPage({ onBack }) {
  return (
    <div className="max-w-[900px] mx-auto px-4 py-10">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-purple hover:text-fire-start transition-colors mb-8 group"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        <span className="text-sm font-medium group-hover:underline">Back to Dashboard</span>
      </button>

      <div className="card !p-8 md:!p-12 mb-8">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-3">
          How BurnDown Works
        </h1>
        <p className="text-text-secondary text-lg leading-relaxed mb-0">
          A plain-English guide to every feature, formula, and strategy used in this app.
          No finance degree needed.
        </p>
      </div>

      {/* Table of Contents */}
      <div className="card !p-6 md:!p-8 mb-8">
        <h2 className="text-lg font-bold text-text-primary mb-4">📑 Table of Contents</h2>
        <ol className="space-y-2 text-text-secondary text-sm list-decimal list-inside">
          <li><a href="#what-is-burndown" className="text-purple hover:underline">What is BurnDown?</a></li>
          <li><a href="#how-interest-works" className="text-purple hover:underline">How Interest Works</a></li>
          <li><a href="#minimum-payments" className="text-purple hover:underline">Why Minimum Payments Cost You More</a></li>
          <li><a href="#extra-payments" className="text-purple hover:underline">The Power of Extra Payments</a></li>
          <li><a href="#snowball-method" className="text-purple hover:underline">The Snowball Method</a></li>
          <li><a href="#avalanche-method" className="text-purple hover:underline">The Avalanche Method</a></li>
          <li><a href="#snowball-vs-avalanche" className="text-purple hover:underline">Snowball vs Avalanche — Which is Better?</a></li>
          <li><a href="#how-app-calculates" className="text-purple hover:underline">How the App Calculates Your Payoff</a></li>
          <li><a href="#freed-cash-flow" className="text-purple hover:underline">Freed Cash Flow (The "Snowball" Effect)</a></li>
          <li><a href="#fire-section" className="text-purple hover:underline">The FIRE Section Explained</a></li>
          <li><a href="#fi-number" className="text-purple hover:underline">What is Your FI Number?</a></li>
          <li><a href="#compound-interest" className="text-purple hover:underline">Compound Interest — Your Best Friend</a></li>
          <li><a href="#summary-bar" className="text-purple hover:underline">Reading the Summary Bar</a></li>
          <li><a href="#weighted-apr" className="text-purple hover:underline">How the Weighted Average APR is Calculated</a></li>
          <li><a href="#motivation-stats" className="text-purple hover:underline">Motivation Stats Explained</a></li>
          <li><a href="#glossary" className="text-purple hover:underline">Glossary of Terms</a></li>
        </ol>
      </div>

      {/* Section 1 */}
      <section id="what-is-burndown" className="card !p-6 md:!p-8 mb-6">
        <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
          <span className="text-2xl">🎯</span> 1. What is BurnDown?
        </h2>
        <p className="text-text-secondary leading-relaxed mb-3">
          BurnDown is a free tool that helps you make a plan to pay off your debts faster. You enter your debts
          (like credit cards, car loans, or student loans), and the app creates a step-by-step schedule showing
          exactly how much to pay each month and when each debt will be gone.
        </p>
        <p className="text-text-secondary leading-relaxed">
          It also shows you how paying off debt faster can help you build wealth sooner — a concept used by the
          <strong className="text-text-primary"> FIRE community</strong> (Financial Independence, Retire Early).
        </p>
      </section>

      {/* Section 2 */}
      <section id="how-interest-works" className="card !p-6 md:!p-8 mb-6">
        <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
          <span className="text-2xl">💰</span> 2. How Interest Works
        </h2>
        <p className="text-text-secondary leading-relaxed mb-3">
          When you borrow money, the lender charges you a fee for using their money. This fee is called <strong className="text-text-primary">interest</strong>.
          The interest rate is shown as a yearly percentage, called <strong className="text-text-primary">APR</strong> (Annual Percentage Rate).
        </p>
        <p className="text-text-secondary leading-relaxed mb-4">
          But here's the key: interest is calculated <strong className="text-text-primary">every month</strong>, not once a year.
          So the app divides your APR by 12 to get the monthly rate.
        </p>
        <div className="bg-bg-elevated rounded-xl p-5 border border-border-subtle mb-4">
          <p className="text-text-primary text-sm font-semibold mb-2">📐 The Formula:</p>
          <code className="text-purple text-sm block mb-3">
            Monthly Interest = Balance × (APR ÷ 12 ÷ 100)
          </code>
          <p className="text-text-primary text-sm font-semibold mb-2">📝 Example:</p>
          <p className="text-text-secondary text-sm leading-relaxed">
            You owe <strong className="text-text-primary">$5,000</strong> on a credit card with <strong className="text-text-primary">20% APR</strong>.
          </p>
          <ul className="text-text-secondary text-sm leading-relaxed mt-2 space-y-1 list-disc list-inside">
            <li>Monthly rate = 20% ÷ 12 = <strong className="text-text-primary">1.667%</strong></li>
            <li>Monthly interest = $5,000 × 0.01667 = <strong className="text-text-primary">$83.33</strong></li>
          </ul>
          <p className="text-text-muted text-xs mt-3 italic">
            That means $83.33 is added to your balance every month just for owing the money.
            If your minimum payment is $100, only $16.67 actually reduces your debt!
          </p>
        </div>
      </section>

      {/* Section 3 */}
      <section id="minimum-payments" className="card !p-6 md:!p-8 mb-6">
        <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
          <span className="text-2xl">🐢</span> 3. Why Minimum Payments Cost You More
        </h2>
        <p className="text-text-secondary leading-relaxed mb-3">
          Minimum payments are the smallest amount your lender says you must pay each month.
          They keep you out of trouble — but they barely scratch the surface of what you owe.
        </p>
        <p className="text-text-secondary leading-relaxed mb-4">
          Most of your minimum payment goes toward interest, not your actual debt.
          This is why it can take <strong className="text-text-primary">10, 20, or even 30 years</strong> to pay off a credit card with minimums only.
        </p>
        <div className="bg-bg-elevated rounded-xl p-5 border border-border-subtle">
          <p className="text-text-primary text-sm font-semibold mb-2">📝 Example:</p>
          <p className="text-text-secondary text-sm leading-relaxed">
            With the $5,000 balance from above at 20% APR, a $100/month minimum payment:
          </p>
          <ul className="text-text-secondary text-sm leading-relaxed mt-2 space-y-1 list-disc list-inside">
            <li>$83.33 goes to interest</li>
            <li>Only <strong className="text-text-primary">$16.67</strong> reduces your balance</li>
            <li>At this rate, it takes about <strong className="text-text-primary">9 years</strong> to pay off</li>
            <li>You'd pay roughly <strong className="text-text-primary">$4,300 in interest alone</strong> — almost double the original debt!</li>
          </ul>
        </div>
      </section>

      {/* Section 4 */}
      <section id="extra-payments" className="card !p-6 md:!p-8 mb-6">
        <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
          <span className="text-2xl">🚀</span> 4. The Power of Extra Payments
        </h2>
        <p className="text-text-secondary leading-relaxed mb-3">
          An extra payment is any money you pay <strong className="text-text-primary">above and beyond</strong> all your minimum payments.
          In the app, you enter this in the "Extra Monthly Payment" field.
        </p>
        <p className="text-text-secondary leading-relaxed mb-4">
          Every dollar of extra payment goes <strong className="text-text-primary">straight to reducing your balance</strong>.
          This means less interest next month, which means even more of your payment goes to the balance.
          It creates a powerful cycle.
        </p>
        <div className="bg-bg-elevated rounded-xl p-5 border border-border-subtle">
          <p className="text-text-primary text-sm font-semibold mb-2">📝 Same $5,000 example — now with $200 extra:</p>
          <ul className="text-text-secondary text-sm leading-relaxed mt-2 space-y-1 list-disc list-inside">
            <li>Total monthly payment: $100 (min) + $200 (extra) = <strong className="text-text-primary">$300</strong></li>
            <li>$83.33 goes to interest, <strong className="text-text-primary">$216.67</strong> reduces the balance</li>
            <li>Paid off in about <strong className="text-text-primary">20 months</strong> instead of 9 years</li>
            <li>Total interest: roughly <strong className="text-text-primary">$900</strong> instead of $4,300</li>
          </ul>
          <p className="text-teal text-xs mt-3 font-semibold">
            💡 That's $3,400 saved — just by adding $200/month!
          </p>
        </div>
      </section>

      {/* Section 5 */}
      <section id="snowball-method" className="card !p-6 md:!p-8 mb-6">
        <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
          <span className="text-2xl">⛄</span> 5. The Snowball Method
        </h2>
        <p className="text-text-secondary leading-relaxed mb-3">
          The Snowball method was made popular by Dave Ramsey. The idea is simple:
        </p>
        <ol className="text-text-secondary text-sm leading-relaxed space-y-2 list-decimal list-inside mb-4">
          <li>Pay the minimum on every debt.</li>
          <li>Put all your extra money toward the debt with the <strong className="text-text-primary">smallest balance</strong>.</li>
          <li>When that debt is gone, take its minimum payment and add it to your extra money.</li>
          <li>Attack the next smallest debt with this bigger payment.</li>
          <li>Repeat until all debts are paid off.</li>
        </ol>
        <div className="bg-bg-elevated rounded-xl p-5 border border-border-subtle">
          <p className="text-text-primary text-sm font-semibold mb-3">📝 Step-by-step example:</p>
          <p className="text-text-secondary text-sm mb-2">Say you have 3 debts and $200 extra per month:</p>
          <div className="space-y-2 text-sm text-text-secondary">
            <p>• <strong className="text-text-primary">Debt A:</strong> $1,000 balance, $50 min payment (smallest → attack first!)</p>
            <p>• <strong className="text-text-primary">Debt B:</strong> $5,000 balance, $100 min payment</p>
            <p>• <strong className="text-text-primary">Debt C:</strong> $15,000 balance, $250 min payment</p>
          </div>
          <div className="mt-4 space-y-3 text-sm text-text-secondary">
            <div className="border-l-2 border-purple pl-3">
              <p className="text-text-primary font-semibold">Step 1: Attack Debt A</p>
              <p>Pay $50 (min) + $200 (extra) = $250/month toward Debt A</p>
              <p>Pay minimums on B ($100) and C ($250)</p>
              <p>Debt A is gone in about <strong className="text-text-primary">4 months</strong>! 🎉</p>
            </div>
            <div className="border-l-2 border-teal pl-3">
              <p className="text-text-primary font-semibold">Step 2: Attack Debt B</p>
              <p>Freed cash: $50 (from Debt A) + $200 (extra) = $250 extra</p>
              <p>Pay $100 (min) + $250 (freed) = $350/month toward Debt B</p>
              <p>Debt B is gone in about <strong className="text-text-primary">15 months</strong>! 🎉</p>
            </div>
            <div className="border-l-2 border-fire-start pl-3">
              <p className="text-text-primary font-semibold">Step 3: Attack Debt C</p>
              <p>Freed cash: $50 + $100 + $200 = $350 extra</p>
              <p>Pay $250 (min) + $350 (freed) = $600/month toward Debt C</p>
              <p>Debt C is done in about <strong className="text-text-primary">26 months</strong>! 🎉</p>
            </div>
          </div>
          <p className="text-teal text-xs mt-4 font-semibold">
            💡 Notice how the payment gets bigger with each debt you clear — like a snowball rolling downhill!
          </p>
        </div>
        <p className="text-text-secondary leading-relaxed mt-4">
          <strong className="text-text-primary">Why people love it:</strong> You see quick wins early on.
          Paying off that first small debt gives you a huge confidence boost and motivation to keep going.
        </p>
      </section>

      {/* Section 6 */}
      <section id="avalanche-method" className="card !p-6 md:!p-8 mb-6">
        <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
          <span className="text-2xl">🏔️</span> 6. The Avalanche Method
        </h2>
        <p className="text-text-secondary leading-relaxed mb-3">
          The Avalanche method works the same way as the Snowball, but with one difference:
          instead of targeting the <em>smallest balance</em>, you target the debt with the
          <strong className="text-text-primary"> highest interest rate (APR)</strong>.
        </p>
        <ol className="text-text-secondary text-sm leading-relaxed space-y-2 list-decimal list-inside mb-4">
          <li>Pay the minimum on every debt.</li>
          <li>Put all your extra money toward the debt with the <strong className="text-text-primary">highest APR</strong>.</li>
          <li>When that debt is gone, roll its payment into the next highest-APR debt.</li>
          <li>Repeat until debt-free.</li>
        </ol>
        <div className="bg-bg-elevated rounded-xl p-5 border border-border-subtle">
          <p className="text-text-primary text-sm font-semibold mb-3">📝 Same debts, different order:</p>
          <div className="space-y-2 text-sm text-text-secondary">
            <p>• <strong className="text-text-primary">Debt B:</strong> $5,000 balance, <strong className="text-fire-start">22% APR</strong> (highest → attack first!)</p>
            <p>• <strong className="text-text-primary">Debt C:</strong> $15,000 balance, <strong className="text-amber">8% APR</strong></p>
            <p>• <strong className="text-text-primary">Debt A:</strong> $1,000 balance, <strong className="text-teal">5% APR</strong> (lowest → pay last)</p>
          </div>
          <p className="text-text-secondary text-sm mt-3">
            Even though Debt A has the smallest balance, it goes last because its interest rate is the lowest.
            By killing the 22% debt first, you stop the most expensive interest charges.
          </p>
        </div>
        <p className="text-text-secondary leading-relaxed mt-4">
          <strong className="text-text-primary">Why people love it:</strong> You pay less total interest over time.
          This is the mathematically cheapest way to pay off debt. But the first win can take longer,
          so you need more patience.
        </p>
      </section>

      {/* Section 7 */}
      <section id="snowball-vs-avalanche" className="card !p-6 md:!p-8 mb-6">
        <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
          <span className="text-2xl">⚖️</span> 7. Snowball vs Avalanche — Which is Better?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-bg-elevated rounded-xl p-5 border border-border-subtle">
            <p className="text-purple font-bold mb-2">⛄ Snowball</p>
            <ul className="text-text-secondary text-sm space-y-1 list-disc list-inside">
              <li>Sorts debts by <strong className="text-text-primary">smallest balance first</strong></li>
              <li>Quick wins boost motivation</li>
              <li>You may pay slightly more interest</li>
              <li>Best for: people who need momentum</li>
            </ul>
          </div>
          <div className="bg-bg-elevated rounded-xl p-5 border border-border-subtle">
            <p className="text-teal font-bold mb-2">🏔️ Avalanche</p>
            <ul className="text-text-secondary text-sm space-y-1 list-disc list-inside">
              <li>Sorts debts by <strong className="text-text-primary">highest interest rate first</strong></li>
              <li>Saves the most money on interest</li>
              <li>First win takes longer</li>
              <li>Best for: people who love numbers</li>
            </ul>
          </div>
        </div>
        <p className="text-text-secondary leading-relaxed">
          <strong className="text-text-primary">Bottom line:</strong> Both methods work.
          The best strategy is the one you'll actually stick with.
          BurnDown shows you the exact difference in time and interest saved so you can pick the one that fits you.
        </p>
      </section>

      {/* Section 8 */}
      <section id="how-app-calculates" className="card !p-6 md:!p-8 mb-6">
        <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
          <span className="text-2xl">🧮</span> 8. How the App Calculates Your Payoff
        </h2>
        <p className="text-text-secondary leading-relaxed mb-4">
          Each month, the app does these steps in order for every debt:
        </p>
        <div className="space-y-3 mb-4">
          <div className="bg-bg-elevated rounded-xl p-4 border border-border-subtle">
            <p className="text-text-primary text-sm font-semibold">Step 1: Add Interest</p>
            <code className="text-purple text-xs block mt-1">New Balance = Old Balance + (Old Balance × APR ÷ 12 ÷ 100)</code>
            <p className="text-text-muted text-xs mt-1">Interest gets added to what you owe.</p>
          </div>
          <div className="bg-bg-elevated rounded-xl p-4 border border-border-subtle">
            <p className="text-text-primary text-sm font-semibold">Step 2: Pay Minimums</p>
            <code className="text-purple text-xs block mt-1">Balance After Min = New Balance − Minimum Payment</code>
            <p className="text-text-muted text-xs mt-1">The app pays the minimum on every debt.</p>
          </div>
          <div className="bg-bg-elevated rounded-xl p-4 border border-border-subtle">
            <p className="text-text-primary text-sm font-semibold">Step 3: Apply Extra Payment to Target</p>
            <code className="text-purple text-xs block mt-1">Balance After Extra = Balance − Extra Payment</code>
            <p className="text-text-muted text-xs mt-1">All extra money goes to the target debt (smallest balance or highest APR).</p>
          </div>
          <div className="bg-bg-elevated rounded-xl p-4 border border-border-subtle">
            <p className="text-text-primary text-sm font-semibold">Step 4: Check if Target is Paid Off</p>
            <p className="text-text-muted text-xs mt-1">If the balance hits $0, that debt is done! Its minimum payment becomes extra freed cash.</p>
          </div>
          <div className="bg-bg-elevated rounded-xl p-4 border border-border-subtle">
            <p className="text-text-primary text-sm font-semibold">Step 5: Repeat Next Month</p>
            <p className="text-text-muted text-xs mt-1">Move to the next month with updated balances. If extra money is left over, apply it to the next debt in line.</p>
          </div>
        </div>
        <p className="text-text-secondary leading-relaxed">
          The app keeps repeating these steps month by month until every debt reaches $0.
          That's your payoff schedule!
        </p>
      </section>

      {/* Section 9 */}
      <section id="freed-cash-flow" className="card !p-6 md:!p-8 mb-6">
        <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
          <span className="text-2xl">💸</span> 9. Freed Cash Flow (The "Snowball" Effect)
        </h2>
        <p className="text-text-secondary leading-relaxed mb-3">
          This is the magic of both methods. Every time you finish paying off a debt, the minimum payment
          you <em>were</em> paying on it is now free. That freed money gets added to your extra payment.
        </p>
        <div className="bg-bg-elevated rounded-xl p-5 border border-border-subtle">
          <p className="text-text-primary text-sm font-semibold mb-2">📐 The Formula:</p>
          <code className="text-purple text-sm block mb-3">
            Available Extra = Your Extra Payment + Sum of All Freed Minimum Payments
          </code>
          <p className="text-text-primary text-sm font-semibold mb-2">📝 Example:</p>
          <ul className="text-text-secondary text-sm leading-relaxed space-y-1 list-disc list-inside">
            <li>You start with $200 extra</li>
            <li>Pay off Debt A → its $50 min payment is freed → extra becomes <strong className="text-text-primary">$250</strong></li>
            <li>Pay off Debt B → its $100 min payment is freed → extra becomes <strong className="text-text-primary">$350</strong></li>
            <li>By the last debt, you're throwing <strong className="text-text-primary">$350+ extra</strong> at it each month!</li>
          </ul>
        </div>
      </section>

      {/* Section 10 */}
      <section id="fire-section" className="card !p-6 md:!p-8 mb-6">
        <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
          <span className="text-2xl">🔥</span> 10. The FIRE Section Explained
        </h2>
        <p className="text-text-secondary leading-relaxed mb-3">
          FIRE stands for <strong className="text-text-primary">Financial Independence, Retire Early</strong>.
          The idea is simple: save and invest enough money so that you no longer <em>need</em> to work for a paycheck.
        </p>
        <p className="text-text-secondary leading-relaxed mb-4">
          The FIRE section in BurnDown shows you two scenarios:
        </p>
        <div className="space-y-3 mb-4">
          <div className="bg-bg-elevated rounded-xl p-4 border border-border-subtle">
            <p className="text-text-primary text-sm font-semibold">Scenario A: Minimum Payments Only</p>
            <p className="text-text-muted text-xs mt-1">You pay only minimums on debt and invest your regular monthly amount. Debt lingers for years while you invest slowly.</p>
          </div>
          <div className="bg-bg-elevated rounded-xl p-4 border border-border-subtle">
            <p className="text-text-primary text-sm font-semibold">Scenario B: Aggressive Payoff First</p>
            <p className="text-text-muted text-xs mt-1">
              You aggressively pay off debt (using extra payments). While paying debt, you still invest your regular amount.
              <strong className="text-text-primary"> After all debt is gone</strong>, you redirect everything — minimums + extra — into investments.
            </p>
          </div>
        </div>
        <p className="text-text-secondary leading-relaxed">
          Even though Scenario B starts investing less at first (because money goes to debt), the huge boost in
          investing <em>after</em> becoming debt-free usually gets you to financial independence
          <strong className="text-text-primary"> faster</strong>. The app calculates exactly how many months faster.
        </p>
      </section>

      {/* Section 11 */}
      <section id="fi-number" className="card !p-6 md:!p-8 mb-6">
        <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
          <span className="text-2xl">🏁</span> 11. What is Your FI Number?
        </h2>
        <p className="text-text-secondary leading-relaxed mb-4">
          Your FI Number (Financial Independence Number) is how much money you need invested so you can live off the returns
          and never run out. It's based on the widely-used <strong className="text-text-primary">"4% Rule"</strong>.
        </p>
        <div className="bg-bg-elevated rounded-xl p-5 border border-border-subtle mb-4">
          <p className="text-text-primary text-sm font-semibold mb-2">📐 The Formula:</p>
          <code className="text-purple text-sm block mb-3">
            FI Number = Annual Expenses × 25
          </code>
          <p className="text-text-primary text-sm font-semibold mb-2">📝 Example:</p>
          <p className="text-text-secondary text-sm leading-relaxed">
            You spend <strong className="text-text-primary">$40,000 per year</strong> on living expenses.
          </p>
          <ul className="text-text-secondary text-sm leading-relaxed mt-2 space-y-1 list-disc list-inside">
            <li>FI Number = $40,000 × 25 = <strong className="text-text-primary">$1,000,000</strong></li>
          </ul>
          <p className="text-text-muted text-xs mt-3 italic">
            Once you have $1,000,000 invested, you could withdraw 4% per year ($40,000) to cover your expenses —
            historically, this amount lasts 30+ years and often forever.
          </p>
        </div>
        <div className="bg-bg-elevated rounded-xl p-5 border border-border-subtle">
          <p className="text-text-primary text-sm font-semibold mb-2">Why 25?</p>
          <p className="text-text-secondary text-sm leading-relaxed">
            25 is simply the inverse of 4%. If you withdraw 4% of your investments each year,
            you need 100% ÷ 4% = 25 times your annual spending saved up.
            This comes from the <strong className="text-text-primary">Trinity Study</strong>, a famous research paper on retirement spending.
          </p>
        </div>
      </section>

      {/* Section 12 */}
      <section id="compound-interest" className="card !p-6 md:!p-8 mb-6">
        <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
          <span className="text-2xl">📈</span> 12. Compound Interest — Your Best Friend
        </h2>
        <p className="text-text-secondary leading-relaxed mb-4">
          When your investments earn returns, those returns start earning returns too.
          This is called <strong className="text-text-primary">compound interest</strong> — and it's what makes your money grow faster over time.
        </p>
        <div className="bg-bg-elevated rounded-xl p-5 border border-border-subtle mb-4">
          <p className="text-text-primary text-sm font-semibold mb-2">📐 How the App Projects Your Wealth:</p>
          <p className="text-text-secondary text-sm mb-2">Each month, it does this:</p>
          <code className="text-purple text-xs block mb-3">
            New Balance = Old Balance × (1 + Monthly Return) + Monthly Investment
          </code>
          <p className="text-text-secondary text-sm mb-1">Where:</p>
          <code className="text-purple text-xs block mb-3">
            Monthly Return = Annual Return ÷ 12 ÷ 100
          </code>
          <p className="text-text-primary text-sm font-semibold mb-2 mt-4">📝 Example:</p>
          <p className="text-text-secondary text-sm leading-relaxed">
            You have <strong className="text-text-primary">$10,000</strong> saved, invest <strong className="text-text-primary">$500/month</strong>,
            and earn <strong className="text-text-primary">7% per year</strong>.
          </p>
          <ul className="text-text-secondary text-sm leading-relaxed mt-2 space-y-1 list-disc list-inside">
            <li>Monthly return = 7% ÷ 12 = 0.583%</li>
            <li>Month 1: $10,000 × 1.00583 + $500 = <strong className="text-text-primary">$10,558</strong></li>
            <li>Month 2: $10,558 × 1.00583 + $500 = <strong className="text-text-primary">$11,120</strong></li>
            <li>After 10 years: roughly <strong className="text-text-primary">$100,000+</strong></li>
          </ul>
          <p className="text-teal text-xs mt-3 font-semibold">
            💡 You put in $70,000 ($10k + $500×120 months), but compound growth added $30,000+ in returns!
          </p>
        </div>
        <div className="bg-bg-elevated rounded-xl p-5 border border-border-subtle">
          <p className="text-text-primary text-sm font-semibold mb-2">📐 Future Value of Freed Cash (Lifetime Wealth Impact):</p>
          <p className="text-text-secondary text-sm mb-2">
            The Motivation Stats section uses this formula to show what your freed payments could become if invested:
          </p>
          <code className="text-purple text-xs block mb-3">
            Future Value = Monthly Amount × ((1 + r)ⁿ − 1) ÷ r
          </code>
          <p className="text-text-muted text-xs">
            Where r = monthly return rate, n = number of months. This is the "future value of an annuity" formula —
            it calculates what regular monthly investments grow to over time with compound interest.
          </p>
        </div>
      </section>

      {/* Section 13 */}
      <section id="summary-bar" className="card !p-6 md:!p-8 mb-6">
        <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
          <span className="text-2xl">📊</span> 13. Reading the Summary Bar
        </h2>
        <p className="text-text-secondary leading-relaxed mb-4">
          The five cards at the top of the dashboard show your key numbers at a glance:
        </p>
        <div className="space-y-3">
          <div className="bg-bg-elevated rounded-xl p-4 border border-border-subtle">
            <p className="text-text-primary text-sm font-semibold">Total Debt</p>
            <p className="text-text-muted text-xs">The sum of all your current balances. This is what you owe right now.</p>
          </div>
          <div className="bg-bg-elevated rounded-xl p-4 border border-border-subtle">
            <p className="text-text-primary text-sm font-semibold">Debt-Free Date</p>
            <p className="text-text-muted text-xs">The month and year when your last debt will be paid off using your chosen strategy.</p>
          </div>
          <div className="bg-bg-elevated rounded-xl p-4 border border-border-subtle">
            <p className="text-text-primary text-sm font-semibold">Total Interest</p>
            <p className="text-text-muted text-xs">How much interest you'll pay across all debts from today until they're paid off.</p>
          </div>
          <div className="bg-bg-elevated rounded-xl p-4 border border-border-subtle">
            <p className="text-text-primary text-sm font-semibold">Monthly Payment</p>
            <p className="text-text-muted text-xs">Your total monthly outflow: all minimum payments + your extra payment combined.</p>
          </div>
          <div className="bg-bg-elevated rounded-xl p-4 border border-border-subtle">
            <p className="text-text-primary text-sm font-semibold">Weighted APR</p>
            <p className="text-text-muted text-xs">
              The average interest rate across all your debts, weighted by balance size.
              See the detailed explanation below in Section 14.
            </p>
          </div>
        </div>
      </section>

      {/* Section 14 — Weighted APR */}
      <section id="weighted-apr" className="card !p-6 md:!p-8 mb-6">
        <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
          <span className="text-2xl">⚖️</span> 14. How the Weighted Average APR is Calculated
        </h2>
        <p className="text-text-secondary leading-relaxed mb-3">
          The <strong className="text-text-primary">AVG Interest Rate</strong> shown in the Summary Bar is not a simple average.
          It's a <strong className="text-text-primary">weighted average</strong>, which means bigger debts have more influence on the number.
        </p>
        <p className="text-text-secondary leading-relaxed mb-4">
          Why? Because a $24,500 loan at 5.8% costs you a lot more in real dollars than a $1,000 debt at 22.9%.
          The weighted average tells you the <em>true overall cost</em> of all your debts combined.
        </p>

        <div className="bg-bg-elevated rounded-xl p-5 border border-border-subtle mb-4">
          <p className="text-text-primary text-sm font-semibold mb-2">📐 The Formula:</p>
          <code className="text-purple text-sm block mb-4">
            Weighted APR = Sum of (each Balance × its APR) ÷ Total Balance
          </code>

          <p className="text-text-primary text-sm font-semibold mb-3">📝 Step-by-step example with 3 debts:</p>

          <p className="text-text-secondary text-sm font-semibold mb-2">Step 1 — Multiply each debt's balance by its APR:</p>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm text-text-secondary border-collapse">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="text-left py-2 pr-4 text-text-primary font-semibold">Debt</th>
                  <th className="text-right py-2 px-4 text-text-primary font-semibold">Balance</th>
                  <th className="text-right py-2 px-4 text-text-primary font-semibold">APR</th>
                  <th className="text-right py-2 pl-4 text-text-primary font-semibold">Balance × APR</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border-subtle/50">
                  <td className="py-2 pr-4">Chase Sapphire</td>
                  <td className="text-right py-2 px-4">$8,200</td>
                  <td className="text-right py-2 px-4 text-fire-start">22.9%</td>
                  <td className="text-right py-2 pl-4 font-mono">187,780</td>
                </tr>
                <tr className="border-b border-border-subtle/50">
                  <td className="py-2 pr-4">Federal Student Loan</td>
                  <td className="text-right py-2 px-4">$24,500</td>
                  <td className="text-right py-2 px-4 text-teal">5.8%</td>
                  <td className="text-right py-2 pl-4 font-mono">142,100</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Honda Civic Loan</td>
                  <td className="text-right py-2 px-4">$12,300</td>
                  <td className="text-right py-2 px-4 text-amber">6.4%</td>
                  <td className="text-right py-2 pl-4 font-mono">78,720</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-text-secondary text-sm font-semibold mb-1">Step 2 — Add up all those results:</p>
          <p className="text-text-secondary text-sm mb-3 ml-3">
            187,780 + 142,100 + 78,720 = <strong className="text-text-primary">408,600</strong>
          </p>

          <p className="text-text-secondary text-sm font-semibold mb-1">Step 3 — Divide by your total balance ($45,000):</p>
          <p className="text-text-secondary text-sm mb-3 ml-3">
            408,600 ÷ 45,000 = <strong className="text-text-primary">9.08%</strong> → rounds to <strong className="text-fire-start text-base">9.1%</strong>
          </p>
        </div>

        <div className="bg-bg-elevated rounded-xl p-5 border border-border-subtle">
          <p className="text-text-primary text-sm font-semibold mb-2">💡 Why not a simple average?</p>
          <p className="text-text-secondary text-sm leading-relaxed">
            A simple average of 22.9%, 5.8%, and 6.4% would give <strong className="text-text-primary">11.7%</strong> — but that's misleading.
            Your student loan ($24,500) is much bigger than your credit card ($8,200), so it has more influence on your overall interest burden.
            The weighted average reflects the <em>true cost</em> of your total debt by giving bigger balances more weight.
          </p>
        </div>
      </section>

      {/* Section 15 */}
      <section id="motivation-stats" className="card !p-6 md:!p-8 mb-6">
        <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
          <span className="text-2xl">🏆</span> 15. Motivation Stats Explained
        </h2>
        <p className="text-text-secondary leading-relaxed mb-4">
          These cards give you encouraging numbers to keep you going:
        </p>
        <div className="space-y-3">
          <div className="bg-bg-elevated rounded-xl p-4 border border-border-subtle">
            <p className="text-text-primary text-sm font-semibold">Months to Freedom</p>
            <p className="text-text-muted text-xs">How many months until every debt is paid off. Watch this number shrink as you add extra payments!</p>
          </div>
          <div className="bg-bg-elevated rounded-xl p-4 border border-border-subtle">
            <p className="text-text-primary text-sm font-semibold">Interest Saved</p>
            <p className="text-text-muted text-xs">
              How much interest you save compared to paying minimums only.
              Formula: (Interest with minimums only) − (Interest with your strategy) = Your savings.
            </p>
          </div>
          <div className="bg-bg-elevated rounded-xl p-4 border border-border-subtle">
            <p className="text-text-primary text-sm font-semibold">Time Saved</p>
            <p className="text-text-muted text-xs">
              How many months faster you'll be debt-free compared to minimum payments only.
            </p>
          </div>
          <div className="bg-bg-elevated rounded-xl p-4 border border-border-subtle">
            <p className="text-text-primary text-sm font-semibold">Lifetime Wealth Impact</p>
            <p className="text-text-muted text-xs">
              Once debt-free, if you invested your freed payments (minimums + extra) at your expected return rate for 30 years,
              this is how much wealth you'd build. Uses the future value of annuity formula.
            </p>
          </div>
        </div>
      </section>

      {/* Section 15 - Glossary */}
      <section id="glossary" className="card !p-6 md:!p-8 mb-6">
        <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
          <span className="text-2xl">📖</span> 16. Glossary of Terms
        </h2>
        <div className="space-y-3">
          {[
            { term: 'APR (Annual Percentage Rate)', def: 'The yearly interest rate on your debt. A 20% APR means you\'re charged 20% of your balance per year in interest fees.' },
            { term: 'Balance', def: 'The amount of money you currently owe on a debt.' },
            { term: 'Minimum Payment', def: 'The smallest amount your lender requires you to pay each month to avoid penalties.' },
            { term: 'Extra Payment', def: 'Any amount you pay above and beyond all your minimum payments. This is the accelerator.' },
            { term: 'Freed Cash Flow', def: 'When a debt is paid off, its minimum payment is "freed" and added to your extra payment for the next debt.' },
            { term: 'Snowball Method', def: 'A debt payoff strategy that targets the smallest balance first for quick motivational wins.' },
            { term: 'Avalanche Method', def: 'A debt payoff strategy that targets the highest interest rate first to save the most money.' },
            { term: 'FIRE', def: 'Financial Independence, Retire Early — a movement focused on saving and investing aggressively to stop depending on a paycheck.' },
            { term: 'FI Number', def: 'The amount of money you need invested to live off 4% withdrawals each year. Equals your annual expenses × 25.' },
            { term: '4% Rule', def: 'A guideline saying you can withdraw 4% of your investments per year in retirement without running out of money (based on historical data).' },
            { term: 'Compound Interest', def: 'When your investment earnings generate their own earnings. It makes your money grow faster the longer it\'s invested.' },
            { term: 'Net Worth', def: 'Your total assets (savings, investments) minus your total debts. The goal is to grow this number.' },
            { term: 'Weighted Average APR', def: 'An average interest rate that gives more importance to larger debts. A $10,000 debt at 20% matters more than a $500 debt at 5%.' },
          ].map(({ term, def }) => (
            <div key={term} className="bg-bg-elevated rounded-xl p-4 border border-border-subtle">
              <p className="text-text-primary text-sm font-semibold">{term}</p>
              <p className="text-text-muted text-xs mt-1">{def}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Back to top */}
      <div className="text-center mt-8 mb-4">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-full bg-purple/20 text-purple hover:bg-purple/30 transition-colors text-sm font-medium"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}
