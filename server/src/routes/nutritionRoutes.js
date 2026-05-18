import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
  listNutrition,
  createNutrition,
  updateNutrition,
  deleteNutrition,
  dailyTotals,
  suggestions,
} from '../controllers/nutritionController.js';

const router = Router();

router.use(protect);
router.get('/daily', dailyTotals);
router.get('/suggestions', suggestions);
router.route('/').get(listNutrition).post(createNutrition);
router.patch('/:id', updateNutrition);
router.delete('/:id', deleteNutrition);

export default router;
