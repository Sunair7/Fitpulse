import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { listNotifications, markRead, markAllRead } from '../controllers/notificationController.js';

const router = Router();
router.use(protect);
router.get('/', listNotifications);
router.patch('/:id/read', markRead);
router.post('/read-all', markAllRead);

export default router;
