import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { listWeightLogs, createWeightLog, deleteWeightLog } from '../controllers/weightLogController.js';

const router = Router();

router.use(protect);
router.route('/').get(listWeightLogs).post(createWeightLog);
router.delete('/:id', deleteWeightLog);

export default router;
