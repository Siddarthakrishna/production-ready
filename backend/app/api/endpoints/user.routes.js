import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { putApiKey } from '../controllers/user.controller.js';

const router = Router();

router.put('/api-key', authRequired, putApiKey);

export default router;
