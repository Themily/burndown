// Vercel Serverless Function — Resend email sender for price alerts
const recentAlerts = new Map();
const RATE_LIMIT_TTL = 300000; // 5 minutes

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const resendKey = process.env.RESEND_API_KEY;

  if (!resendKey) {
    return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
  }

  // PA-6 fix: accept currencySymbol from the client so the email reflects
  // the user's chosen currency instead of always hardcoding '$'.
  const { to, ticker, price, condition, currentPrice, currencySymbol = '$' } = req.body || {};

  if (!to || !ticker || price == null || !condition || currentPrice == null) {
    return res.status(400).json({ error: 'Missing required fields: to, ticker, price, condition, currentPrice' });
  }

  // Basic rate limit: reject duplicate ticker+email within 5 minutes
  const rateKey = `${to}:${ticker}`;
  const now = Date.now();
  const lastSent = recentAlerts.get(rateKey);

  if (lastSent && (now - lastSent) < RATE_LIMIT_TTL) {
    return res.status(429).json({ error: 'Rate limited — alert already sent recently for this ticker' });
  }

  const conditionText = condition === 'above' ? 'risen above' : 'fallen below';
  const subject = `🔔 Atlas Wealth Alert: ${ticker} has ${conditionText} ${currencySymbol}${price}`;

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; background: #0f1729; color: #e2e8f0; padding: 32px; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="font-size: 24px; margin: 0;">
          <span style="background: linear-gradient(135deg, #2DD4BF, #22C55E); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Atlas Wealth</span>
        </h1>
        <p style="color: #94a3b8; font-size: 13px; margin-top: 4px;">Portfolio Alert</p>
      </div>

      <div style="background: rgba(45, 212, 191, 0.08); border: 1px solid rgba(45, 212, 191, 0.2); border-radius: 12px; padding: 24px; text-align: center;">
        <p style="font-size: 18px; font-weight: 600; margin: 0 0 8px;">
          ${ticker} has ${conditionText}
        </p>
        <p style="font-size: 14px; color: #94a3b8; margin: 0 0 16px;">
          Your target: ${currencySymbol}${Number(price).toFixed(2)}
        </p>
        <p style="font-size: 32px; font-weight: 700; margin: 0; color: ${condition === 'above' ? '#22C55E' : '#EF4444'};">
          ${currencySymbol}${Number(currentPrice).toFixed(2)}
        </p>
        <p style="font-size: 12px; color: #64748b; margin-top: 4px;">Current Price</p>
      </div>

      <p style="text-align: center; color: #64748b; font-size: 12px; margin-top: 24px;">
        This alert was sent by Atlas Wealth Portfolio Tracker.<br/>
        <a href="https://atlas-wealth.vercel.app" style="color: #2DD4BF;">Open Atlas Wealth →</a>
      </p>
    </div>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Atlas Wealth <alerts@atlas-wealth.vercel.app>',
        to: [to],
        subject,
        html: htmlBody,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Resend error:', errorData);
      return res.status(response.status).json({ error: 'Failed to send email', details: errorData });
    }

    const result = await response.json();

    // Record for rate limiting
    recentAlerts.set(rateKey, now);

    // Clean up old rate limit entries
    for (const [key, ts] of recentAlerts) {
      if (now - ts > RATE_LIMIT_TTL) recentAlerts.delete(key);
    }

    return res.status(200).json({ success: true, id: result.id });
  } catch (err) {
    console.error('Send alert error:', err.message);
    return res.status(500).json({ error: 'Failed to send alert email', message: err.message });
  }
}
