import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { strict as rateLimiterStrict } from '../middleware/rateLimiter.js';
import { validateBody, schemas } from '../middleware/validate.js';
import { marketScope } from '../middleware/keyScope.js';
import {
  fnoGetRunningExpiry,
  fnoLiveOi,
  fnoIndexAnalysis,
  fnoHeatmap
} from '../controllers/stocks.controller.js';

const router = Router();

// F&O regrouped endpoints under /api/fno
router.post('/get_running_expiry', authRequired, marketScope, rateLimiterStrict, validateBody(schemas.fnoGetRunningExpiry), fnoGetRunningExpiry);
router.post('/live_oi', authRequired, marketScope, rateLimiterStrict, validateBody(schemas.fnoLiveOi), fnoLiveOi);
router.post('/index_analysis', authRequired, marketScope, rateLimiterStrict, validateBody(schemas.fnoIndexAnalysis), fnoIndexAnalysis);
router.get('/heatmap', authRequired, marketScope, rateLimiterStrict, fnoHeatmap);

export default router;
