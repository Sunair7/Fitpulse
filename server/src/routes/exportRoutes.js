import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
  exportWorkoutsCsv,
  exportNutritionCsv,
  exportProgressCsv,
} from '../controllers/exportController.js';

const router = Router();
router.use(protect);
router.get('/workouts.csv', exportWorkoutsCsv);
router.get('/nutrition.csv', exportNutritionCsv);
router.get('/progress.csv', exportProgressCsv);

export default router;
