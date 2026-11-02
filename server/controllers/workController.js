import fs from 'fs';
import Work from '../models/Work.js';
import Class from '../models/Class.js';
import Submission from '../models/Submission.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/errorHandler.js';

export const getWorks = asyncHandler(async (req, res) => {
  const { classId, type } = req.query;

  const filter = {};
  if (type) filter.type = type;

  if (req.user.role === 'teacher' || req.user.role === 'admin') {
    filter.teacherId = req.user._id;
    if (classId) {
      filter.classIds = classId;
    }

    const works = await Work.find(filter)
      .populate('classIds', 'name code subject')
      .sort({ createdAt: -1 })
      .lean();

    const workIds = works.map((w) => w._id);
    const submissions = await Submission.find({ workId: { $in: workIds } }).lean();

    const worksWithCounts = works.map((w) => {
      const relatedSubs = submissions.filter(
        (s) => s.workId.toString() === w._id.toString()
      );
      return {
        ...w,
        totalSubmissions: relatedSubs.length,
        gradedSubmissions: relatedSubs.filter((s) => s.status === 'graded').length,
      };
    });

    return res.json({
      success: true,
      data: { works: worksWithCounts },
    });
  }

  const enrolledClasses = await Class.find({ enrolledStudents: req.user._id }).select('_id');
  const enrolledClassIds = enrolledClasses.map((c) => c._id);

  if (classId) {
    const isEnrolled = enrolledClassIds.some((id) => id.toString() === classId);
    if (!isEnrolled) {
      throw new AppError('You are not enrolled in this class', 403);
    }
    filter.classIds = classId;
  } else {
    filter.classIds = { $in: enrolledClassIds };
  }

  const works = await Work.find(filter)
    .populate('classIds', 'name code subject')
    .populate('teacherId', 'name email')
    .sort({ dueDate: 1, createdAt: -1 })
    .lean();

  const workIds = works.map((w) => w._id);
  const mySubmissions = await Submission.find({
    workId: { $in: workIds },
    studentId: req.user._id,
  }).lean();

  const worksForStudent = works.map((w) => {
    const sub = mySubmissions.find((s) => s.workId.toString() === w._id.toString());
    return {
      ...w,
      submissionStatus: sub ? sub.status : 'pending',
      mySubmission: sub || null,
    };
  });

  res.json({
    success: true,
    data: { works: worksForStudent },
  });
});

export const getWorkById = asyncHandler(async (req, res) => {
  const work = await Work.findById(req.params.id)
    .populate('classIds', 'name code subject enrolledStudents')
    .populate('teacherId', 'name email');

  if (!work) {
    throw new AppError('Work item not found', 404);
  }

  const isTeacherOwner = work.teacherId._id.equals(req.user._id);
  const isEnrolledStudent = work.classIds.some((cls) =>
    cls.enrolledStudents.some((sId) => sId.equals(req.user._id))
  );

  if (!isTeacherOwner && !isEnrolledStudent && req.user.role !== 'admin') {
    throw new AppError('You do not have access to this work item', 403);
  }

  let mySubmission = null;
  let stats = null;

  if (req.user.role === 'student') {
    mySubmission = await Submission.findOne({
      workId: work._id,
      studentId: req.user._id,
    });
  } else {
    const totalSubmissions = await Submission.countDocuments({ workId: work._id });
    const gradedSubmissions = await Submission.countDocuments({
      workId: work._id,
      status: 'graded',
    });

    const uniqueStudentIds = new Set();
    work.classIds.forEach((cls) => {
      cls.enrolledStudents.forEach((sId) => uniqueStudentIds.add(sId.toString()));
    });

    stats = {
      totalSubmissions,
      gradedSubmissions,
      totalStudents: uniqueStudentIds.size,
    };
  }

  res.json({
    success: true,
    data: {
      work,
      mySubmission,
      stats,
    },
  });
});

export const createWork = asyncHandler(async (req, res) => {
  const { title, description, type, dueDate, requiresSubmission, maxMarks } = req.body;

  let classIds = req.body.classIds || req.body.classId || req.body['classIds[]'];
  if (!classIds) {
    classIds = [];
  } else if (typeof classIds === 'string') {
    try {
      const parsed = JSON.parse(classIds);
      classIds = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      classIds = classIds.split(',').map((id) => id.trim()).filter(Boolean);
    }
  } else if (!Array.isArray(classIds)) {
    classIds = [classIds];
  }

  const cleanTitle = (title || '').trim();
  const cleanDescription = (description || cleanTitle || 'Coursework material').trim();

  if (!cleanTitle) {
    throw new AppError('Title is required', 400);
  }

  if (classIds.length === 0) {
    throw new AppError('Please select at least one target class', 400);
  }

  const classes = await Class.find({
    _id: { $in: classIds },
    teacherId: req.user._id,
  });

  if (classes.length !== classIds.length && req.user.role !== 'admin') {
    throw new AppError('One or more selected classes do not belong to you', 403);
  }

  let attachment = undefined;
  if (req.file) {
    attachment = {
      originalName: req.file.originalname,
      fileName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
    };
  }

  const work = await Work.create({
    title: cleanTitle,
    description: cleanDescription,
    type: type || 'assignment',
    classIds,
    teacherId: req.user._id,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    requiresSubmission: requiresSubmission !== undefined ? requiresSubmission === 'true' || requiresSubmission === true : true,
    maxMarks: maxMarks ? Number(maxMarks) : 100,
    attachment,
  });

  const populated = await Work.findById(work._id).populate('classIds', 'name code');

  res.status(201).json({
    success: true,
    message: `${type || 'Work'} created successfully`,
    data: { work: populated },
  });
});

export const updateWork = asyncHandler(async (req, res) => {
  const work = await Work.findById(req.params.id);

  if (!work) {
    throw new AppError('Work item not found', 404);
  }

  if (!work.teacherId.equals(req.user._id) && req.user.role !== 'admin') {
    throw new AppError('You are not authorized to edit this work', 403);
  }

  const { title, description, type, dueDate, requiresSubmission, maxMarks } = req.body;

  let classIds = req.body.classIds || req.body.classId || req.body['classIds[]'];
  if (classIds) {
    if (typeof classIds === 'string') {
      try {
        const parsed = JSON.parse(classIds);
        classIds = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        classIds = classIds.split(',').map((id) => id.trim()).filter(Boolean);
      }
    } else if (!Array.isArray(classIds)) {
      classIds = [classIds];
    }
    work.classIds = classIds;
  }

  if (title) work.title = title.trim();
  if (description) work.description = description.trim();
  if (type) work.type = type;
  if (dueDate !== undefined) work.dueDate = dueDate ? new Date(dueDate) : undefined;
  if (requiresSubmission !== undefined) {
    work.requiresSubmission = requiresSubmission === 'true' || requiresSubmission === true;
  }
  if (maxMarks !== undefined) work.maxMarks = Number(maxMarks);

  if (req.file) {
    if (work.attachment?.path && fs.existsSync(work.attachment.path)) {
      try {
        fs.unlinkSync(work.attachment.path);
      } catch (err) {
        console.error('Failed to unlink old attachment:', err);
      }
    }
    work.attachment = {
      originalName: req.file.originalname,
      fileName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
    };
  }

  await work.save();

  const populated = await Work.findById(work._id).populate('classIds', 'name code');

  res.json({
    success: true,
    message: 'Work item updated successfully',
    data: { work: populated },
  });
});

export const deleteWork = asyncHandler(async (req, res) => {
  const work = await Work.findById(req.params.id);

  if (!work) {
    throw new AppError('Work item not found', 404);
  }

  if (!work.teacherId.equals(req.user._id) && req.user.role !== 'admin') {
    throw new AppError('You are not authorized to delete this work', 403);
  }

  if (work.attachment?.path && fs.existsSync(work.attachment.path)) {
    try {
      fs.unlinkSync(work.attachment.path);
    } catch (err) {
      console.error('Failed to unlink work attachment:', err);
    }
  }

  const submissions = await Submission.find({ workId: work._id });
  submissions.forEach((sub) => {
    if (sub.attachment?.path && fs.existsSync(sub.attachment.path)) {
      try {
        fs.unlinkSync(sub.attachment.path);
      } catch (err) {
        console.error('Failed to unlink submission file:', err);
      }
    }
  });

  await Submission.deleteMany({ workId: work._id });
  await Work.findByIdAndDelete(work._id);

  res.json({
    success: true,
    message: 'Work item and its submissions deleted successfully',
    data: null,
  });
});

export const downloadWorkAttachment = asyncHandler(async (req, res) => {
  const work = await Work.findById(req.params.id).populate('classIds', 'enrolledStudents');

  if (!work || !work.attachment || !work.attachment.path) {
    throw new AppError('Attachment not found', 404);
  }

  const isTeacher = work.teacherId.equals(req.user._id);
  const isEnrolled = work.classIds.some((cls) =>
    cls.enrolledStudents.some((id) => id.equals(req.user._id))
  );

  if (!isTeacher && !isEnrolled && req.user.role !== 'admin') {
    throw new AppError('You do not have permission to download this file', 403);
  }

  if (!fs.existsSync(work.attachment.path)) {
    throw new AppError('File missing on server storage', 404);
  }

  res.download(work.attachment.path, work.attachment.originalName);
});

export const submitWork = asyncHandler(async (req, res) => {
  const work = await Work.findById(req.params.id);

  if (!work) {
    throw new AppError('Work item not found', 404);
  }

  if (!work.requiresSubmission) {
    throw new AppError('This work item does not require submission', 400);
  }

  const isEnrolled = await Class.exists({
    _id: { $in: work.classIds },
    enrolledStudents: req.user._id,
  });

  if (!isEnrolled) {
    throw new AppError('You are not enrolled in any class assigned to this work', 403);
  }

  const responseText = req.body.responseText ? req.body.responseText.trim() : '';
  let attachment = undefined;

  if (req.file) {
    attachment = {
      originalName: req.file.originalname,
      fileName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
    };
  }

  if (!responseText && !attachment) {
    throw new AppError('Please enter a response or upload a file', 400);
  }

  const existing = await Submission.findOne({
    workId: work._id,
    studentId: req.user._id,
  });

  if (existing) {
    if (attachment && existing.attachment?.path && fs.existsSync(existing.attachment.path)) {
      try {
        fs.unlinkSync(existing.attachment.path);
      } catch (err) {
        console.error('Failed to unlink old submission file:', err);
      }
    }

    existing.responseText = responseText || existing.responseText;
    if (attachment) existing.attachment = attachment;
    existing.submittedAt = new Date();
    if (existing.status !== 'graded') {
      existing.status = 'submitted';
    }
    await existing.save();

    return res.json({
      success: true,
      message: 'Submission updated successfully',
      data: { submission: existing },
    });
  }

  const submission = await Submission.create({
    workId: work._id,
    studentId: req.user._id,
    responseText,
    attachment,
    submittedAt: new Date(),
    status: 'submitted',
  });

  res.status(201).json({
    success: true,
    message: 'Work submitted successfully',
    data: { submission },
  });
});

export const getWorkSubmissions = asyncHandler(async (req, res) => {
  const work = await Work.findById(req.params.id).populate(
    'classIds',
    'name code enrolledStudents'
  );

  if (!work) {
    throw new AppError('Work item not found', 404);
  }

  if (!work.teacherId.equals(req.user._id) && req.user.role !== 'admin') {
    throw new AppError('You are not authorized to view submissions for this work', 403);
  }

  const submissions = await Submission.find({ workId: work._id })
    .populate('studentId', 'name email rollNumber')
    .sort({ submittedAt: -1 })
    .lean();

  const submittedStudentIds = new Set(
    submissions.map((s) => s.studentId?._id?.toString())
  );

  const enrolledStudentIds = new Set();
  work.classIds.forEach((cls) => {
    cls.enrolledStudents.forEach((id) => enrolledStudentIds.add(id.toString()));
  });

  const missingStudents = await User.find({
    _id: { $in: Array.from(enrolledStudentIds), $nin: Array.from(submittedStudentIds) },
  })
    .select('name email rollNumber')
    .lean();

  res.json({
    success: true,
    data: {
      work: {
        _id: work._id,
        title: work.title,
        type: work.type,
        dueDate: work.dueDate,
        maxMarks: work.maxMarks,
      },
      submissions,
      missingStudents,
      stats: {
        totalTarget: enrolledStudentIds.size,
        totalSubmitted: submissions.length,
        totalGraded: submissions.filter((s) => s.status === 'graded').length,
      },
    },
  });
});

export const gradeSubmission = asyncHandler(async (req, res) => {
  const { submissionId } = req.params;
  const { marks, feedback } = req.body;

  const submission = await Submission.findById(submissionId).populate('workId');
  if (!submission) {
    throw new AppError('Submission not found', 404);
  }

  if (
    !submission.workId.teacherId.equals(req.user._id) &&
    req.user.role !== 'admin'
  ) {
    throw new AppError('You are not authorized to grade this submission', 403);
  }

  if (marks !== undefined) {
    const numMarks = Number(marks);
    if (isNaN(numMarks) || numMarks < 0 || numMarks > (submission.workId.maxMarks || 100)) {
      throw new AppError(
        `Marks must be between 0 and ${submission.workId.maxMarks || 100}`,
        400
      );
    }
    submission.marks = numMarks;
  }

  if (feedback !== undefined) {
    submission.feedback = feedback.trim();
  }

  submission.status = 'graded';
  await submission.save();

  const populated = await Submission.findById(submission._id).populate(
    'studentId',
    'name email rollNumber'
  );

  res.json({
    success: true,
    message: 'Submission graded successfully',
    data: { submission: populated },
  });
});

export const downloadSubmissionAttachment = asyncHandler(async (req, res) => {
  const { submissionId } = req.params;

  const submission = await Submission.findById(submissionId).populate('workId');
  if (!submission || !submission.attachment || !submission.attachment.path) {
    throw new AppError('Attachment not found', 404);
  }

  const isTeacher = submission.workId.teacherId.equals(req.user._id);
  const isStudentOwner = submission.studentId.equals(req.user._id);

  if (!isTeacher && !isStudentOwner && req.user.role !== 'admin') {
    throw new AppError('You do not have permission to download this file', 403);
  }

  if (!fs.existsSync(submission.attachment.path)) {
    throw new AppError('File missing on server storage', 404);
  }

  res.download(submission.attachment.path, submission.attachment.originalName);
});

