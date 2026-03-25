// Vercel Serverless Function — Finnhub quote proxy with 60s in-memory cache
const cache = new Map();
const CACHE_TTL = 60000; // 60 seconds

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { symbols } = req.query;

  if (!symbols) {
    return res.status(400).json({ error: 'Missing symbols parameter' });
  }

  const apiKey = process.env.FINNHUB_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'FINNHUB_API_KEY not configured' });
  }

  const symbolList = symbols.split(',').map(s => s.trim()).filter(Boolean);
  const prices = {};
  const now = Date.now();

  const fetchPromises = symbolList.map(async (symbol) => {
    // Check cache
    const cached = cache.get(symbol);
    if (cached && (now - cached.ts) < CACHE_TTL) {
      prices[symbol] = cached.data;
      return;
    }

    try {
      const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`;
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`Finnhub error for ${symbol}: HTTP ${response.status}`);
        return;
      }

      const data = await response.json();

      // Finnhub returns { c: currentPrice, d: change, dp: changePercent, h: high, l: low, o: open, pc: prevClose, t: timestamp }
      if (data && typeof data.c === 'number' && data.c > 0) {
        const priceData = {
          price: data.c,
          change: data.d || 0,
          changePercent: data.dp || 0,
          high: data.h,
          low: data.l,
          open: data.o,
          prevClose: data.pc,
          ts: now,
        };

        prices[symbol] = priceData;
        cache.set(symbol, { data: priceData, ts: now });
      }
    } catch (err) {
      console.error(`Failed to fetch ${symbol}:`, err.message);
    }
  });

  await Promise.all(fetchPromises);

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
  return res.status(200).json({ prices });
}
