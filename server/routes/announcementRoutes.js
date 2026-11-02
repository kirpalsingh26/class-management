import { Router } from 'express';
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.route('/')
  .get(getAnnouncements)
  .post(authorize('teacher', 'admin'), createAnnouncement);

router.route('/:id')
  .put(authorize('teacher', 'admin'), updateAnnouncement)
  .delete(authorize('teacher', 'admin'), deleteAnnouncement);

export default router;

