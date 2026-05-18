import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
  listReminders,
  createReminder,
  updateReminder,
  deleteReminder,
} from '../controllers/reminderController.js';

const router = Router();
router.use(protect);
router.route('/').get(listReminders).post(createReminder);
router.route('/:id').patch(updateReminder).delete(deleteReminder);

export default router;
