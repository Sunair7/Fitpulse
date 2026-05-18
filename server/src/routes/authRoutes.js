import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, logout, me } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post(
  '/register',
  [
    body('username')
      .trim()
      .isLength({ min: 3 })
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username: letters, numbers, underscore only'),
    body('name').trim().notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
  ],
  register
);
router.post(
  '/login',
  [body('identifier').trim().notEmpty(), body('password').notEmpty()],
  login
);
router.post('/logout', logout);
router.get('/me', protect, me);

export default router;
