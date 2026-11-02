import { Router } from 'express';
import {
  recordAttendance,
  getClassAttendance,
  getMyAttendance,
} from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.post('/', authorize('teacher', 'admin'), recordAttendance);
router.get('/class/:classId', authorize('teacher', 'admin'), getClassAttendance);
router.get('/my', getMyAttendance);

export default router;

