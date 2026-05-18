import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
  listWorkouts,
  getWorkout,
  createWorkout,
  updateWorkout,
  deleteWorkout,
} from '../controllers/workoutController.js';

const router = Router();

router.use(protect);
router.route('/').get(listWorkouts).post(createWorkout);
router.route('/:id').get(getWorkout).patch(updateWorkout).delete(deleteWorkout);

export default router;
