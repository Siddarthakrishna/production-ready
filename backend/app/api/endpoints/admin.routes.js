import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { authRequired } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validateBody, schemas } from '../middleware/validate.js';
import { strict as rateLimiterStrict } from '../middleware/rateLimiter.js';
import {
  getTredcodeUsers,
  insertReplaceUser,
  removeUser,
  getSignal,
  insertSignal,
  removeSignal,
  getSignalChat,
  unsetSignalSelf,
  checkSignal,
} from '../controllers/admin.controller.js';

const router = Router();

// Multer storage
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, '..', 'uploads'),
    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `${unique}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Dashboard Page (admin)
router.post('/get_tredcode_users', authRequired, requireRole('admin'), rateLimiterStrict, getTredcodeUsers);
router.post('/insert_replace_user', authRequired, requireRole('admin'), rateLimiterStrict, validateBody(schemas.adminUpsertUser), insertReplaceUser);
router.post('/delete_user', authRequired, requireRole('admin'), rateLimiterStrict, validateBody(schemas.adminDeleteUser), removeUser);

// Signal Page (admin)
router.post('/get_signal', authRequired, requireRole('admin'), rateLimiterStrict, getSignal);
router.post('/insert_signal', authRequired, requireRole('admin'), rateLimiterStrict, upload.single('file'), insertSignal);
router.post('/delete_signal', authRequired, requireRole('admin'), rateLimiterStrict, validateBody(schemas.adminDeleteSignal), removeSignal);

// Signal Page (client)
router.post('/get_signal_chat', authRequired, rateLimiterStrict, getSignalChat);
router.post('/unset_signal_self', authRequired, rateLimiterStrict, unsetSignalSelf);
router.post('/check_signal', authRequired, rateLimiterStrict, checkSignal);

export default router;
