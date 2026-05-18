import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
  workoutFrequency,
  nutritionTrend,
  liftingSummary,
} from '../controllers/analyticsController.js';

const router = Router();
router.use(protect);
router.get('/workout-frequency', workoutFrequency);
router.get('/nutrition-trend', nutritionTrend);
router.get('/lifting-summary', liftingSummary);

export default router;
