import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { strict as rateLimiterStrict } from '../middleware/rateLimiter.js';
import { marketScope } from '../middleware/keyScope.js';
import { get_intraday_ohlcv, get_available_intervals, get_available_symbols } from '../services/intraday_service';
import { validateQuery } from '../middleware/validate.js';

const router = Router();

// Get OHLCV data for a symbol
router.get(
  '/ohlcv/:symbol',
  authRequired,
  marketScope,
  rateLimiterStrict,
  validateQuery({
    interval: { type: 'string', default: '5m', enum: ['1m', '3m', '5m', '15m', '30m', '1h', '1d'] },
    start_time: { type: 'string', format: 'date-time', optional: true },
    end_time: { type: 'string', format: 'date-time', optional: true },
    limit: { type: 'number', default: 1000, min: 1, max: 5000 }
  }),
  async (req, res) => {
    try {
      const { symbol } = req.params;
      const { interval, start_time, end_time, limit } = req.query;

      const data = await get_intraday_ohlcv(
        symbol,
        interval,
        start_time ? new Date(start_time) : undefined,
        end_time ? new Date(end_time) : undefined,
        parseInt(limit)
      );

      res.json({
        success: true,
        data,
        meta: {
          symbol,
          interval,
          count: data.length,
          start_time: data.length > 0 ? data[data.length - 1].time : null,
          end_time: data.length > 0 ? data[0].time : null
        }
      });
    } catch (error) {
      console.error('Error fetching intraday OHLCV data:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to fetch intraday data'
      });
    }
  }
);

// Get available intervals for a symbol
router.get(
  '/intervals/:symbol',
  authRequired,
  marketScope,
  rateLimiterStrict,
  async (req, res) => {
    try {
      const { symbol } = req.params;
      const intervals = await get_available_intervals(symbol);
      
      res.json({
        success: true,
        data: intervals,
        meta: { symbol }
      });
    } catch (error) {
      console.error('Error fetching available intervals:', error);
      res.status(400).json({
        success: false,
        error: 'Failed to fetch available intervals'
      });
    }
  }
);

// Get list of available symbols
router.get(
  '/symbols',
  authRequired,
  marketScope,
  rateLimiterStrict,
  async (req, res) => {
    try {
      const symbols = await get_available_symbols();
      
      res.json({
        success: true,
        data: symbols
      });
    } catch (error) {
      console.error('Error fetching available symbols:', error);
      res.status(400).json({
        success: false,
        error: 'Failed to fetch available symbols'
      });
    }
  }
);

export default router;
