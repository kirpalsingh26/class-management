import { Router } from 'express';
import {
  getWorks,
  getWorkById,
  createWork,
  updateWork,
  deleteWork,
  downloadWorkAttachment,
  submitWork,
  getWorkSubmissions,
  gradeSubmission,
  downloadSubmissionAttachment,
} from '../controllers/workController.js';
import { protect, authorize } from '../middleware/auth.js';
import {
  uploadWorkAttachment,
  uploadSubmissionAttachment,
} from '../middleware/upload.js';

const router = Router();

router.use(protect);

router.route('/')
  .get(getWorks)
  .post(authorize('teacher', 'admin'), uploadWorkAttachment, createWork);

router.route('/:id')
  .get(getWorkById)
  .put(authorize('teacher', 'admin'), uploadWorkAttachment, updateWork)
  .delete(authorize('teacher', 'admin'), deleteWork);

router.get('/:id/download', downloadWorkAttachment);

router.post(
  '/:id/submit',
  authorize('student'),
  uploadSubmissionAttachment,
  submitWork
);
router.get(
  '/:id/submissions',
  authorize('teacher', 'admin'),
  getWorkSubmissions
);

router.put(
  '/submissions/:submissionId/grade',
  authorize('teacher', 'admin'),
  gradeSubmission
);
router.get(
  '/submissions/:submissionId/download',
  downloadSubmissionAttachment
);

export default router;

