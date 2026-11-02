import Class from '../models/Class.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Work from '../models/Work.js';
import Announcement from '../models/Announcement.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/errorHandler.js';

export const getClasses = asyncHandler(async (req, res) => {
  let query = {};
  if (req.user.role === 'teacher' || req.user.role === 'admin') {
    query = { teacherId: req.user._id };
  } else {
    query = { enrolledStudents: req.user._id };
  }

  const classes = await Class.find(query)
    .populate('teacherId', 'name email')
    .populate('enrolledStudents', 'name email rollNumber')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: { classes },
  });
});

export const getClassById = asyncHandler(async (req, res) => {
  const classItem = await Class.findById(req.params.id)
    .populate('teacherId', 'name email')
    .populate('enrolledStudents', 'name email rollNumber phone');

  if (!classItem) {
    throw new AppError('Class not found', 404);
  }

  const isOwner = classItem.teacherId._id.equals(req.user._id);
  const isEnrolled = classItem.enrolledStudents.some((s) =>
    s._id.equals(req.user._id)
  );

  if (!isOwner && !isEnrolled && req.user.role !== 'admin') {
    throw new AppError('You do not have access to this class', 403);
  }

  res.json({
    success: true,
    data: { classItem },
  });
});

export const createClass = asyncHandler(async (req, res) => {
  const { name, code, subject, description } = req.body;

  if (!name || !code || !subject) {
    throw new AppError('Name, code, and subject are required', 400);
  }

  const existingCode = await Class.findOne({ code: code.toUpperCase().trim() });
  if (existingCode) {
    throw new AppError('Class code already exists. Please choose a unique code.', 400);
  }

  const newClass = await Class.create({
    name: name.trim(),
    code: code.toUpperCase().trim(),
    subject: subject.trim(),
    description: description ? description.trim() : '',
    teacherId: req.user._id,
    enrolledStudents: [],
  });

  const populated = await Class.findById(newClass._id).populate(
    'teacherId',
    'name email'
  );

  res.status(201).json({
    success: true,
    message: 'Class created successfully',
    data: { classItem: populated },
  });
});

export const updateClass = asyncHandler(async (req, res) => {
  const classItem = await Class.findById(req.params.id);

  if (!classItem) {
    throw new AppError('Class not found', 404);
  }

  if (!classItem.teacherId.equals(req.user._id) && req.user.role !== 'admin') {
    throw new AppError('You are not authorized to update this class', 403);
  }

  const { name, code, subject, description } = req.body;

  if (code && code.toUpperCase().trim() !== classItem.code) {
    const existingCode = await Class.findOne({
      code: code.toUpperCase().trim(),
      _id: { $ne: classItem._id },
    });
    if (existingCode) {
      throw new AppError('Class code already exists.', 400);
    }
    classItem.code = code.toUpperCase().trim();
  }

  if (name) classItem.name = name.trim();
  if (subject) classItem.subject = subject.trim();
  if (description !== undefined) classItem.description = description.trim();

  await classItem.save();

  const populated = await Class.findById(classItem._id)
    .populate('teacherId', 'name email')
    .populate('enrolledStudents', 'name email rollNumber');

  res.json({
    success: true,
    message: 'Class updated successfully',
    data: { classItem: populated },
  });
});

export const deleteClass = asyncHandler(async (req, res) => {
  const classItem = await Class.findById(req.params.id);

  if (!classItem) {
    throw new AppError('Class not found', 404);
  }

  if (!classItem.teacherId.equals(req.user._id) && req.user.role !== 'admin') {
    throw new AppError('You are not authorized to delete this class', 403);
  }

  await Class.findByIdAndDelete(req.params.id);

  await Attendance.deleteMany({ classId: req.params.id });
  await Work.updateMany(
    { classIds: req.params.id },
    { $pull: { classIds: req.params.id } }
  );
  await Announcement.updateMany(
    { classIds: req.params.id },
    { $pull: { classIds: req.params.id } }
  );

  res.json({
    success: true,
    message: 'Class and associated records removed successfully',
    data: null,
  });
});

export const enrollStudent = asyncHandler(async (req, res) => {
  const classItem = await Class.findById(req.params.id);

  if (!classItem) {
    throw new AppError('Class not found', 404);
  }

  if (!classItem.teacherId.equals(req.user._id) && req.user.role !== 'admin') {
    throw new AppError('You are not authorized to manage this class', 403);
  }

  const { studentId, email, rollNumber } = req.body;

  let student;
  if (studentId) {
    student = await User.findById(studentId);
  } else if (email) {
    student = await User.findOne({ email: email.toLowerCase().trim() });
  } else if (rollNumber) {
    student = await User.findOne({ rollNumber: rollNumber.toUpperCase().trim() });
  }

  if (!student || student.role !== 'student') {
    throw new AppError('Valid student account not found', 404);
  }

  const isAlreadyEnrolled = classItem.enrolledStudents.some((id) =>
    id.equals(student._id)
  );

  if (isAlreadyEnrolled) {
    throw new AppError('Student is already enrolled in this class', 400);
  }

  classItem.enrolledStudents.push(student._id);
  await classItem.save();

  const populated = await Class.findById(classItem._id)
    .populate('teacherId', 'name email')
    .populate('enrolledStudents', 'name email rollNumber phone');

  res.json({
    success: true,
    message: `${student.name} enrolled into ${classItem.name}`,
    data: { classItem: populated },
  });
});

export const removeStudentFromClass = asyncHandler(async (req, res) => {
  const classItem = await Class.findById(req.params.id);

  if (!classItem) {
    throw new AppError('Class not found', 404);
  }

  if (!classItem.teacherId.equals(req.user._id) && req.user.role !== 'admin') {
    throw new AppError('You are not authorized to manage this class', 403);
  }

  const { studentId } = req.params;
  classItem.enrolledStudents = classItem.enrolledStudents.filter(
    (id) => id.toString() !== studentId
  );
  await classItem.save();

  res.json({
    success: true,
    message: 'Student removed from class',
    data: { classItem },
  });
});

