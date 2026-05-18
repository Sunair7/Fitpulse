import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { createSupportMessage, listMyTickets } from '../controllers/supportController.js';

const router = Router();
router.use(protect);
router.route('/').get(listMyTickets).post(createSupportMessage);

export default router;
