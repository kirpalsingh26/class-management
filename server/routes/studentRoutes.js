import { Router } from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../controllers/studentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.route('/')
  .get(authorize('teacher', 'admin'), getStudents)
  .post(authorize('teacher', 'admin'), createStudent);

router.route('/:id')
  .get(getStudentById)
  .put(authorize('teacher', 'admin'), updateStudent)
  .delete(authorize('teacher', 'admin'), deleteStudent);

export default router;
