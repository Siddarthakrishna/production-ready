import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { startRealtime, getRealtime, startOHLC, getOHLC, runHistoricalBackfill } from '../services/dhanMarketService.js';

const router = Router();

const rlRealtime = rateLimit({ windowMs: 1000, max: 1, standardHeaders: true, legacyHeaders: false });
const rlOHLC = rateLimit({ windowMs: 60_000, max: 1, standardHeaders: true, legacyHeaders: false });

// GET /api/market/realtime?symbol=SBIN
router.get('/realtime', rlRealtime, async (req, res) => {
  try {
    const symbol = (req.query.symbol || '').toString();
    if (!symbol) return res.status(400).json({ error: 'symbol required' });
    startRealtime(symbol);
    return res.json({ symbol, data: getRealtime(symbol) });
  } catch (e) {
    return res.status(500).json({ error: 'failed to fetch realtime' });
  }
});

// GET /api/market/ohlc?symbol=SBIN&tf=1m
router.get('/ohlc', rlOHLC, async (req, res) => {
  try {
    const symbol = (req.query.symbol || '').toString();
    const tf = (req.query.tf || '1m').toString();
    if (!symbol) return res.status(400).json({ error: 'symbol required' });
    startOHLC(symbol, tf);
    return res.json({ symbol, tf, data: getOHLC(symbol) });
  } catch (e) {
    return res.status(500).json({ error: 'failed to fetch ohlc' });
  }
});

// POST /api/market/historical { symbol, from, to }
router.post('/historical', async (req, res) => {
  try {
    const { symbol, from, to } = req.body || {};
    if (!symbol) return res.status(400).json({ error: 'symbol required' });
    const data = await runHistoricalBackfill(symbol, from, to);
    return res.json({ symbol, from, to, data });
  } catch (e) {
    return res.status(500).json({ error: 'failed to fetch historical' });
  }
});

export default router;
