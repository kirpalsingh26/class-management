import { Router } from 'express';
import {
  getAdminStats,
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getAdminClasses,
  assignClassTeacher,
  getAdminStudents,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);

router.route('/teachers')
  .get(getTeachers)
  .post(createTeacher);

router.route('/teachers/:id')
  .put(updateTeacher)
  .delete(deleteTeacher);

router.get('/classes', getAdminClasses);
router.put('/classes/:id/assign-teacher', assignClassTeacher);

router.get('/students', getAdminStudents);

export default router;
