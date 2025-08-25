import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { strict as rateLimiterStrict } from '../middleware/rateLimiter.js';
import { validateQuery, schemas } from '../middleware/validate.js';
import { marketScope } from '../middleware/keyScope.js';
import {
  serverTime,
  studyData,
  studySymbol,
  advDec
} from '../controllers/stocks.controller.js';

const router = Router();

// Studies and market breadth endpoints
router.get('/current', authRequired, marketScope, rateLimiterStrict, validateQuery(schemas.current), serverTime);
router.get('/study-data', authRequired, marketScope, rateLimiterStrict, validateQuery(schemas.studyData), studyData);
router.get('/study-symbol', authRequired, marketScope, rateLimiterStrict, validateQuery(schemas.studySymbol), studySymbol);
router.get('/adv-dec/:index', authRequired, marketScope, rateLimiterStrict, advDec);

export default router;
