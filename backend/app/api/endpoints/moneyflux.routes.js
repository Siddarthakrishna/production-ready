import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { strict as rateLimiterStrict } from '../middleware/rateLimiter.js';
import { validateBody, schemas } from '../middleware/validate.js';
import { marketScope } from '../middleware/keyScope.js';
import {
  moneyFluxGetExpiry,
  moneyFluxChart,
  moneyFluxCheckAccess
} from '../controllers/stocks.controller.js';

const router = Router();

// MoneyFlux endpoints regrouped
router.post('/get_running_expiry', authRequired, marketScope, rateLimiterStrict, validateBody(schemas.moneyFluxExpiry), moneyFluxGetExpiry);
router.post('/chart', authRequired, marketScope, rateLimiterStrict, validateBody(schemas.moneyFluxChart), moneyFluxChart);
router.get('/check_access', authRequired, marketScope, rateLimiterStrict, moneyFluxCheckAccess);

export default router;
