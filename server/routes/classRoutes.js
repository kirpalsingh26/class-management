import { Router } from 'express';
import {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  enrollStudent,
  removeStudentFromClass,
} from '../controllers/classController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.route('/')
  .get(getClasses)
  .post(authorize('teacher', 'admin'), createClass);

router.route('/:id')
  .get(getClassById)
  .put(authorize('teacher', 'admin'), updateClass)
  .delete(authorize('teacher', 'admin'), deleteClass);

router.post('/:id/students', authorize('teacher', 'admin'), enrollStudent);
router.delete('/:id/students/:studentId', authorize('teacher', 'admin'), removeStudentFromClass);

export default router;

