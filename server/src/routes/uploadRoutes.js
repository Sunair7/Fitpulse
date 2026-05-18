import { Router } from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth.js';
import { uploadAvatar } from '../controllers/uploadController.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const router = Router();
router.use(protect);
router.post('/avatar', upload.single('image'), uploadAvatar);

export default router;
