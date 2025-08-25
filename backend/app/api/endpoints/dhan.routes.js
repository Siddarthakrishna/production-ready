import express from 'express';
import cookieParser from 'cookie-parser';
import { getToken } from '../controllers/dhan.controller.js';

const router = express.Router();

// Ensure cookies are parsed for this router (if not globally applied already)
router.use(cookieParser());

// Return chart URL for Dhan based on selected symbol (in cookie or body)
router.post('/get_token', getToken);

export default router;
