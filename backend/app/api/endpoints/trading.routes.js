import { Router } from 'express';
import { placeOrder, getPositions, getPortfolio as getHoldings, handlePostback, getCdslAuthLink } from '../services/dhanTradingService.js';

const router = Router();

// POST /api/trading/place-order
router.post('/place-order', async (req, res) => {
  try {
    const result = await placeOrder(req.body);
    res.json(result);
  } catch (e) {
    res.status(e.response?.status || 500).json({ error: e.response?.data || 'order failed' });
  }
});

// GET /api/trading/positions
router.get('/positions', async (_req, res) => {
  try {
    const result = await getPositions();
    res.json(result);
  } catch (e) {
    res.status(e.response?.status || 500).json({ error: e.response?.data || 'failed' });
  }
});

// GET /api/trading/portfolio
router.get('/portfolio', async (_req, res) => {
  try {
    const result = await getHoldings();
    res.json(result);
  } catch (e) {
    res.status(e.response?.status || 500).json({ error: e.response?.data || 'failed' });
  }
});

// POST /api/trading/postback  (webhook)
router.post('/postback', async (req, res) => {
  try {
    const result = await handlePostback(req.body, req.headers);
    res.json(result);
  } catch (e) {
    // Always 200 to acknowledge as per webhook best-practices unless signature invalid
    res.json({ ok: true });
  }
});

// GET /api/trading/cdsl-auth
router.get('/cdsl-auth', async (req, res) => {
  try {
    const result = await getCdslAuthLink(req.query || {});
    res.json(result);
  } catch (e) {
    res.status(e.response?.status || 500).json({ error: e.response?.data || 'failed' });
  }
});

export default router;
