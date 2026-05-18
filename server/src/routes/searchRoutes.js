import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { searchAll } from '../controllers/searchController.js';

const router = Router();
router.use(protect);
router.get('/', searchAll);

export default router;
