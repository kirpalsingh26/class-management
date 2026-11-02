import Announcement from '../models/Announcement.js';
import Class from '../models/Class.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/errorHandler.js';

export const getAnnouncements = asyncHandler(async (req, res) => {
  const { classId } = req.query;

  if (req.user.role === 'teacher' || req.user.role === 'admin') {
    const filter = { teacherId: req.user._id };
    if (classId) filter.classIds = classId;

    const announcements = await Announcement.find(filter)
      .populate('classIds', 'name code subject')
      .populate('teacherId', 'name email')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: { announcements },
    });
  }

  const enrolledClasses = await Class.find({ enrolledStudents: req.user._id }).select('_id');
  const enrolledClassIds = enrolledClasses.map((c) => c._id);

  const filter = { classIds: { $in: enrolledClassIds } };
  if (classId) {
    if (!enrolledClassIds.some((id) => id.toString() === classId)) {
      throw new AppError('You are not enrolled in this class', 403);
    }
    filter.classIds = classId;
  }

  const announcements = await Announcement.find(filter)
    .populate('classIds', 'name code subject')
    .populate('teacherId', 'name email')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: { announcements },
  });
});

export const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, message } = req.body;

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
  const cleanMessage = (message || '').trim();

  if (!cleanTitle) {
    throw new AppError('Title is required', 400);
  }

  if (!cleanMessage) {
    throw new AppError('Message is required', 400);
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

  const announcement = await Announcement.create({
    title: title.trim(),
    message: message.trim(),
    classIds,
    teacherId: req.user._id,
  });

  const populated = await Announcement.findById(announcement._id)
    .populate('classIds', 'name code')
    .populate('teacherId', 'name email');

  res.status(201).json({
    success: true,
    message: 'Announcement posted successfully',
    data: { announcement: populated },
  });
});

export const updateAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    throw new AppError('Announcement not found', 404);
  }

  if (!announcement.teacherId.equals(req.user._id) && req.user.role !== 'admin') {
    throw new AppError('You are not authorized to edit this announcement', 403);
  }

  const { title, message, classIds } = req.body;

  if (title) announcement.title = title.trim();
  if (message) announcement.message = message.trim();
  if (Array.isArray(classIds) && classIds.length > 0) {
    announcement.classIds = classIds;
  }

  await announcement.save();

  const populated = await Announcement.findById(announcement._id)
    .populate('classIds', 'name code')
    .populate('teacherId', 'name email');

  res.json({
    success: true,
    message: 'Announcement updated successfully',
    data: { announcement: populated },
  });
});

export const deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    throw new AppError('Announcement not found', 404);
  }

  if (!announcement.teacherId.equals(req.user._id) && req.user.role !== 'admin') {
    throw new AppError('You are not authorized to delete this announcement', 403);
  }

  await Announcement.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Announcement deleted successfully',
    data: null,
  });
});

