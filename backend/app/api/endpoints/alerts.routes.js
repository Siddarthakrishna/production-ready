import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { createAlert, getAlerts, updateAlert, deleteAlert } from '../controllers/alerts.controller.js';

const router = Router();

router.post('/', authRequired, createAlert);
router.get('/', authRequired, getAlerts);
router.put('/:id', authRequired, updateAlert);
router.delete('/:id', authRequired, deleteAlert);

export default router;
