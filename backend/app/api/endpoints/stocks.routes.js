import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validateQuery, validateBody, schemas } from '../middleware/validate.js';
import { strict as rateLimiterStrict } from '../middleware/rateLimiter.js';
import { 
    serverTime, studyData, studySymbol, advDec, 
    fnoGetRunningExpiry, fnoLiveOi, fnoIndexAnalysis, fnoHeatmap,
    // Scanner endpoints
    fetchHdDataFno, fetchHdDataN500, fetchDspDataFno, fetchDspDataN500, fetchHdHist,
    // Money flux endpoints
    moneyFluxGetExpiry, moneyFluxChart, moneyFluxCheckAccess,
    // Index analysis endpoints
    indexAnalysisGetExpiry, indexAnalysisLiveOi, indexAnalysisAnalysis
} from '../controllers/stocks.controller.js';

const router = Router();

// All routes require authentication; adjust RBAC per need
router.get('/current', authRequired, rateLimiterStrict, validateQuery(schemas.current), serverTime);
router.get('/study-data', authRequired, rateLimiterStrict, validateQuery(schemas.studyData), studyData);
router.get('/study-symbol', authRequired, rateLimiterStrict, validateQuery(schemas.studySymbol), studySymbol);
router.get('/adv-dec/:index', authRequired, rateLimiterStrict, advDec);

// ============================
// F&O live endpoints (POST to mirror index_analysis)
// ============================
router.post('/fno/get_running_expiry', authRequired, rateLimiterStrict, validateBody(schemas.fnoGetRunningExpiry), fnoGetRunningExpiry);
router.post('/fno/live_oi', authRequired, rateLimiterStrict, validateBody(schemas.fnoLiveOi), fnoLiveOi);
router.post('/fno/index_analysis', authRequired, rateLimiterStrict, validateBody(schemas.fnoIndexAnalysis), fnoIndexAnalysis);
router.get('/fno/heatmap', authRequired, rateLimiterStrict, fnoHeatmap);

// ============================
// Scanner endpoints
// ============================
router.post('/fetch_hd_data_fno', authRequired, rateLimiterStrict, fetchHdDataFno);
router.post('/fetch_hd_data_n500', authRequired, rateLimiterStrict, fetchHdDataN500);
router.post('/fetch_dsp_data_fno', authRequired, rateLimiterStrict, fetchDspDataFno);
router.post('/fetch_dsp_data_n500', authRequired, rateLimiterStrict, fetchDspDataN500);
router.post('/hd_hist', authRequired, rateLimiterStrict, validateBody(schemas.hdHist), fetchHdHist);

// ============================
// Money Flux endpoints
// ============================
router.post('/money_flux/get_running_expiry', authRequired, rateLimiterStrict, validateBody(schemas.moneyFluxExpiry), moneyFluxGetExpiry);
router.post('/money_flux/chart', authRequired, rateLimiterStrict, validateBody(schemas.moneyFluxChart), moneyFluxChart);
router.get('/money_flux/check_access', authRequired, rateLimiterStrict, moneyFluxCheckAccess);

// ============================
// Index Analysis endpoints
// ============================
router.post('/index_analysis/get_running_expiry', authRequired, rateLimiterStrict, validateBody(schemas.indexAnalysisExpiry), indexAnalysisGetExpiry);
router.post('/index_analysis/live_oi', authRequired, rateLimiterStrict, validateBody(schemas.indexAnalysisLiveOi), indexAnalysisLiveOi);
router.post('/index_analysis/index_analysis', authRequired, rateLimiterStrict, validateBody(schemas.indexAnalysisAnalysis), indexAnalysisAnalysis);

export default router;
