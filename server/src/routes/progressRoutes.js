import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { listProgress, createProgress, deleteProgress } from '../controllers/progressController.js';

const router = Router();
router.use(protect);
router.route('/').get(listProgress).post(createProgress);
router.delete('/:id', deleteProgress);

export default router;
