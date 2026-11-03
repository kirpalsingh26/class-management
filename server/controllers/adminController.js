import User from '../models/User.js';
import Class from '../models/Class.js';
import Attendance from '../models/Attendance.js';
import Work from '../models/Work.js';
import Announcement from '../models/Announcement.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/errorHandler.js';

export const getAdminStats = asyncHandler(async (req, res) => {
  const [
    totalTeachers,
    totalStudents,
    totalClasses,
    totalAttendance,
    totalWork,
    teachers,
    recentClasses,
  ] = await Promise.all([
    User.countDocuments({ role: 'teacher' }),
    User.countDocuments({ role: 'student' }),
    Class.countDocuments(),
    Attendance.countDocuments(),
    Work.countDocuments(),
    User.find({ role: 'teacher' }).select('-password').sort({ createdAt: -1 }).lean(),
    Class.find().populate('teacherId', 'name email department').sort({ createdAt: -1 }).limit(6).lean(),
  ]);

  const classes = await Class.find().select('teacherId enrolledStudents').lean();

  const teachersWithMetrics = teachers.map((t) => {
    const teacherClasses = classes.filter(
      (c) => c.teacherId && c.teacherId.toString() === t._id.toString()
    );
    const uniqueStudents = new Set();
    teacherClasses.forEach((c) => {
      (c.enrolledStudents || []).forEach((sId) => uniqueStudents.add(sId.toString()));
    });

    return {
      ...t,
      initialPassword: t.initialPassword || 'password123',
      classCount: teacherClasses.length,
      studentCount: uniqueStudents.size,
    };
  });

  res.json({
    success: true,
    data: {
      stats: {
        totalTeachers,
        totalStudents,
        totalClasses,
        totalAttendance,
        totalWork,
      },
      teachers: teachersWithMetrics,
      recentClasses,
    },
  });
});

export const getTeachers = asyncHandler(async (req, res) => {
  const teachers = await User.find({ role: 'teacher' })
    .select('-password')
    .sort({ createdAt: -1 })
    .lean();

  const classes = await Class.find().select('_id name code teacherId enrolledStudents').lean();

  const teachersWithClasses = teachers.map((t) => {
    const assignedClasses = classes.filter(
      (c) => c.teacherId && c.teacherId.toString() === t._id.toString()
    );
    const uniqueStudents = new Set();
    assignedClasses.forEach((c) => {
      (c.enrolledStudents || []).forEach((sId) => uniqueStudents.add(sId.toString()));
    });

    return {
      ...t,
      initialPassword: t.initialPassword || 'password123',
      classes: assignedClasses.map((c) => ({ _id: c._id, name: c.name, code: c.code })),
      classCount: assignedClasses.length,
      studentCount: uniqueStudents.size,
    };
  });

  res.json({
    success: true,
    data: { teachers: teachersWithClasses },
  });
});

export const createTeacher = asyncHandler(async (req, res) => {
  let { name, email, rollNumber, password, department, phone } = req.body;

  if (!name || !name.trim()) {
    throw new AppError('Name is required', 400);
  }

  if (!rollNumber || !rollNumber.toString().trim()) {
    const teachers = await User.find({ role: 'teacher' }).select('rollNumber').lean();
    let highest = 100;
    teachers.forEach((t) => {
      if (t.rollNumber) {
        const match = t.rollNumber.match(/\d+/);
        if (match) {
          const parsed = parseInt(match[0], 10);
          if (!isNaN(parsed) && parsed > highest) {
            highest = parsed;
          }
        }
      }
    });
    rollNumber = `FAC-${highest + 1}`;
  } else {
    rollNumber = rollNumber.toString().toUpperCase().trim();
  }

  const existingRoll = await User.findOne({
    role: 'teacher',
    rollNumber,
  });
  if (existingRoll) {
    throw new AppError('A teacher with this roll number or faculty code already exists', 409);
  }

  if (!email || !email.trim()) {
    let clean = name
      .toLowerCase()
      .replace(/^(dr\.|prof\.|mr\.|ms\.|mrs\.|er\.)\s+/i, '')
      .trim()
      .replace(/[^a-z0-9]+/g, '.')
      .replace(/^\.+|\.+$/g, '');
    if (!clean) clean = 'faculty';
    let candidateEmail = `${clean}@cms.dev`;
    let counter = 1;
    while (await User.findOne({ email: candidateEmail })) {
      candidateEmail = `${clean}${counter}@cms.dev`;
      counter++;
    }
    email = candidateEmail;
  } else {
    email = email.toLowerCase().trim();
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('An account with this email already exists', 409);
  }

  const activePassword = password || 'password123';
  const teacher = await User.create({
    name: name.trim(),
    email,
    rollNumber,
    password: activePassword,
    initialPassword: activePassword,
    role: 'teacher',
    department: department ? department.trim() : 'Information Technology',
    phone: phone ? phone.trim() : '',
  });

  const teacherObj = teacher.toJSON();

  res.status(201).json({
    success: true,
    message: 'Teacher account created successfully',
    data: { teacher: teacherObj },
  });
});

export const updateTeacher = asyncHandler(async (req, res) => {
  const teacher = await User.findById(req.params.id);

  if (!teacher || teacher.role !== 'teacher') {
    throw new AppError('Teacher not found', 404);
  }

  let { name, email, rollNumber, password, department, phone } = req.body;

  if (email && email.toLowerCase().trim() !== teacher.email) {
    const existing = await User.findOne({
      email: email.toLowerCase().trim(),
      _id: { $ne: teacher._id },
    });
    if (existing) {
      throw new AppError('Email is already taken by another account', 409);
    }
    teacher.email = email.toLowerCase().trim();
  }

  if (rollNumber !== undefined && rollNumber.toString().trim().toUpperCase() !== teacher.rollNumber) {
    const formattedRoll = rollNumber.toString().trim().toUpperCase();
    if (formattedRoll) {
      const existingRoll = await User.findOne({
        role: 'teacher',
        rollNumber: formattedRoll,
        _id: { $ne: teacher._id },
      });
      if (existingRoll) {
        throw new AppError('This roll number or faculty code is already taken', 409);
      }
      teacher.rollNumber = formattedRoll;
    }
  }

  if (name) teacher.name = name.trim();
  if (department !== undefined) teacher.department = department.trim();
  if (phone !== undefined) teacher.phone = phone.trim();
  if (password && password.trim().length >= 6) {
    teacher.password = password.trim();
    teacher.initialPassword = password.trim();
  }

  await teacher.save();

  res.json({
    success: true,
    message: 'Teacher details updated successfully',
    data: { teacher: teacher.toJSON() },
  });
});

export const deleteTeacher = asyncHandler(async (req, res) => {
  const teacher = await User.findById(req.params.id);

  if (!teacher || teacher.role !== 'teacher') {
    throw new AppError('Teacher not found', 404);
  }

  const classesCount = await Class.countDocuments({ teacherId: teacher._id });
  if (classesCount > 0) {
    await Class.updateMany(
      { teacherId: teacher._id },
      { $set: { description: `${teacher.name} (Archived Faculty)` } }
    );
  }

  await User.findByIdAndDelete(teacher._id);

  res.json({
    success: true,
    message: 'Teacher account deleted successfully',
    data: null,
  });
});

export const getAdminClasses = asyncHandler(async (req, res) => {
  const classes = await Class.find()
    .populate('teacherId', 'name email department')
    .populate('enrolledStudents', 'name email rollNumber')
    .sort({ createdAt: -1 })
    .lean();

  const formatted = classes.map((c) => ({
    _id: c._id,
    name: c.name,
    code: c.code,
    subject: c.subject,
    description: c.description,
    teacher: c.teacherId || null,
    studentCount: c.enrolledStudents ? c.enrolledStudents.length : 0,
    students: c.enrolledStudents || [],
  }));

  res.json({
    success: true,
    data: { classes: formatted },
  });
});

export const assignClassTeacher = asyncHandler(async (req, res) => {
  const { teacherId } = req.body;
  const classItem = await Class.findById(req.params.id);

  if (!classItem) {
    throw new AppError('Class not found', 404);
  }

  const teacher = await User.findById(teacherId);
  if (!teacher || teacher.role !== 'teacher') {
    throw new AppError('Selected teacher not found', 404);
  }

  classItem.teacherId = teacher._id;
  await classItem.save();

  const populated = await Class.findById(classItem._id).populate('teacherId', 'name email department');

  res.json({
    success: true,
    message: `Class reassigned to ${teacher.name} successfully`,
    data: { classItem: populated },
  });
});

export const getAdminStudents = asyncHandler(async (req, res) => {
  const students = await User.find({ role: 'student' })
    .select('-password')
    .sort({ name: 1 })
    .lean();

  const classes = await Class.find().select('_id name code enrolledStudents').lean();

  const studentsWithClasses = students.map((s) => {
    const enrolled = classes.filter((c) =>
      c.enrolledStudents?.some((id) => id.toString() === s._id.toString())
    );

    return {
      ...s,
      classes: enrolled.map((c) => ({ _id: c._id, name: c.name, code: c.code })),
    };
  });

  res.json({
    success: true,
    data: { students: studentsWithClasses },
  });
});

