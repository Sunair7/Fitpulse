import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { listGoals, createGoal, updateGoal, deleteGoal } from '../controllers/goalController.js';

const router = Router();

router.use(protect);
router.route('/').get(listGoals).post(createGoal);
router.route('/:id').patch(updateGoal).delete(deleteGoal);

export default router;
