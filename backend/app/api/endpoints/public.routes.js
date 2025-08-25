import { Router } from 'express';
import { general as rateLimiterGeneral } from '../middleware/rateLimiter.js';
import { nifty50 } from '../controllers/public.controller.js';

const router = Router();

// Public routes (no auth)
router.get('/nifty50', rateLimiterGeneral, nifty50);

export default router;
