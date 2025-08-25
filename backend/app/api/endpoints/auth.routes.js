import { Router } from 'express';
import { login, refresh, logout, me } from '../controllers/auth.controller.js';
import { jwtAuth } from '../middleware/jwtAuth.js';
import { auth as rateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/login', rateLimiter, login);
router.post('/refresh', rateLimiter, refresh);
router.post('/logout', logout);
router.get('/me', jwtAuth, me);

export default router;
