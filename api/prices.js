// Vercel Serverless Function — Market price proxy with 60s in-memory cache
// Uses Finnhub for US stocks/ETFs and CoinGecko for Bitcoin (free, no key needed)
const cache = new Map();
const CACHE_TTL = 60000; // 60 seconds

// Symbols that should be fetched from CoinGecko instead of Finnhub
const CRYPTO_MAP = {
  BTC: { id: 'bitcoin', label: 'Bitcoin' },
  ETH: { id: 'ethereum', label: 'Ethereum' },
};

async function fetchCryptoPrice(symbol, now) {
  const crypto = CRYPTO_MAP[symbol];
  if (!crypto) return null;

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${crypto.id}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`;
  const response = await fetch(url);

  if (!response.ok) {
    console.error(`CoinGecko error for ${symbol}: HTTP ${response.status}`);
    return null;
  }

  const data = await response.json();
  const coinData = data[crypto.id];

  if (coinData && typeof coinData.usd === 'number') {
    const changePercent = coinData.usd_24h_change || 0;
    const price = coinData.usd;
    const change = price * (changePercent / 100);

    return {
      price,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      high: null,
      low: null,
      open: null,
      prevClose: price - change,
      ts: now,
    };
  }

  return null;
}

async function fetchStockPrice(symbol, apiKey, now) {
  const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`;
  const response = await fetch(url);

  if (!response.ok) {
    console.error(`Finnhub error for ${symbol}: HTTP ${response.status}`);
    return null;
  }

  const data = await response.json();

  // Finnhub returns { c: currentPrice, d: change, dp: changePercent, h: high, l: low, o: open, pc: prevClose, t: timestamp }
  if (data && typeof data.c === 'number' && data.c > 0) {
    return {
      price: data.c,
      change: data.d || 0,
      changePercent: data.dp || 0,
      high: data.h,
      low: data.l,
      open: data.o,
      prevClose: data.pc,
      ts: now,
    };
  }

  return null;
}

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
      let priceData;

      if (CRYPTO_MAP[symbol]) {
        // Fetch from CoinGecko (free, no API key needed)
        priceData = await fetchCryptoPrice(symbol, now);
      } else {
        // Fetch from Finnhub (US stocks/ETFs)
        priceData = await fetchStockPrice(symbol, apiKey, now);
      }

      if (priceData) {
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
