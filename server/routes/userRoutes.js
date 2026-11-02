import express from 'express';
import * as userController from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import {
  validate,
  updateProfileSchema,
  changePasswordSchema,
} from '../validators/schemas.js';

const router = express.Router();

router.use(protect);

router.get('/profile', userController.getProfile);
router.put('/profile', validate(updateProfileSchema), userController.updateProfile);
router.put(
  '/change-password',
  validate(changePasswordSchema),
  userController.changePassword
);

export default router;