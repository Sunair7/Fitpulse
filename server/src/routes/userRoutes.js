import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { updateProfile } from '../controllers/userController.js';

const router = Router();

router.use(protect);
router.patch(
  '/me',
  [
    body('name').optional().trim().notEmpty(),
    body('username')
      .optional()
      .trim()
      .isLength({ min: 3 })
      .matches(/^[a-zA-Z0-9_]+$/),
    body('profilePicture').optional().isString(),
    body('preferences.units').optional().isIn(['kg', 'lbs']),
    body('preferences.theme').optional().isIn(['dark', 'light', 'system']),
    body('preferences.emailNotifications').optional().isBoolean(),
    body('preferences.reminderAlerts').optional().isBoolean(),
    body('privacy.publicProfile').optional().isBoolean(),
    body('consent.termsAccepted').optional().isBoolean(),
    body('consent.analyticsOptIn').optional().isBoolean(),
  ],
  updateProfile
);

export default router;
