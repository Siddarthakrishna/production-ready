import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { startOptionChain, getOptionChain, startOptionAnalytics, getOptionAnalytics } from '../services/dhanMarketService.js';

const router = Router();

const rlChain = rateLimit({ windowMs: 3000, max: 1, standardHeaders: true, legacyHeaders: false });
const rlAnalytics = rateLimit({ windowMs: 5000, max: 1, standardHeaders: true, legacyHeaders: false });

// GET /api/options/option-chain?symbol=NIFTY50&exchange=NSE
router.get('/option-chain', rlChain, async (req, res) => {
  try {
    const symbol = (req.query.symbol || '').toString();
    const exchange = (req.query.exchange || 'NSE').toString();
    if (!symbol) return res.status(400).json({ error: 'symbol required' });
    // interval maintained internally after first call
    startOptionChain(symbol, exchange);
    return res.json({ symbol, exchange, data: getOptionChain(symbol) });
  } catch (e) {
    return res.status(500).json({ error: 'failed to fetch option chain' });
  }
});

// GET /api/options/option-analytics?symbol=NIFTY50&exchange=NSE
router.get('/option-analytics', rlAnalytics, async (req, res) => {
  try {
    const symbol = (req.query.symbol || '').toString();
    const exchange = (req.query.exchange || 'NSE').toString();
    if (!symbol) return res.status(400).json({ error: 'symbol required' });
    startOptionAnalytics(symbol, exchange);
    return res.json({ symbol, exchange, data: getOptionAnalytics(symbol) });
  } catch (e) {
    return res.status(500).json({ error: 'failed to fetch option analytics' });
  }
});

export default router;
