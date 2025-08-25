import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { validateBody, schemas } from '../middleware/validate.js';
import { strict as rateLimiterStrict } from '../middleware/rateLimiter.js';
import { submitContact, getContactMessages } from '../controllers/contact.controller.js';

const router = Router();

// Contact form submission
router.post('/contact', rateLimiterStrict, validateBody(schemas.contact), submitContact);

// Get contact messages (admin only)
router.get('/contact/messages', authRequired, rateLimiterStrict, getContactMessages);

export default router;
