import User from '../models/User.js';
import Class from '../models/Class.js';
import Attendance from '../models/Attendance.js';
import Submission from '../models/Submission.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/errorHandler.js';

export const getStudents = asyncHandler(async (req, res) => {
  const { search, classId } = req.query;

  const filter = { role: 'student' };

  if (search) {
    const regex = new RegExp(search.trim(), 'i');
    filter.$or = [{ name: regex }, { rollNumber: regex }, { email: regex }];
  }

  let studentIdsFromClass = null;
  if (classId) {
    const targetClass = await Class.findById(classId);
    if (targetClass) {
      studentIdsFromClass = targetClass.enrolledStudents;
      filter._id = { $in: studentIdsFromClass };
    }
  }

  const students = await User.find(filter)
    .select('-password')
    .sort({ name: 1 })
    .lean();

  const studentIds = students.map((s) => s._id);
  const allClasses = await Class.find({
    enrolledStudents: { $in: studentIds },
  })
    .select('_id name code teacherId')
    .lean();

  const studentsWithClasses = students.map((student) => {
    const enrolledClasses = allClasses.filter((c) =>
      c.enrolledStudents?.some((id) => id.toString() === student._id.toString())
    );
    return {
      ...student,
      initialPassword: student.initialPassword || 'password123',
      enrolledClasses: enrolledClasses.map((c) => ({
        _id: c._id,
        name: c.name,
        code: c.code,
      })),
    };
  });

  res.json({
    success: true,
    data: { students: studentsWithClasses },
  });
});

export const getStudentById = asyncHandler(async (req, res) => {
  const studentId = req.params.id;

  if (req.user.role === 'student' && !req.user._id.equals(studentId)) {
    throw new AppError('You are not authorized to view this profile', 403);
  }

  const student = await User.findById(studentId).select('-password');
  if (!student || student.role !== 'student') {
    throw new AppError('Student not found', 404);
  }

  const classes = await Class.find({ enrolledStudents: student._id })
    .populate('teacherId', 'name email')
    .lean();

  const attendanceRecords = await Attendance.find({ studentId: student._id });
  const totalClasses = attendanceRecords.length;
  const presentCount = attendanceRecords.filter((a) => a.status === 'present').length;
  const absentCount = attendanceRecords.filter((a) => a.status === 'absent').length;
  const attendancePercentage =
    totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 100;

  res.json({
    success: true,
    data: {
      student,
      classes,
      attendanceSummary: {
        totalClasses,
        presentCount,
        absentCount,
        percentage: attendancePercentage,
      },
    },
  });
});

export const createStudent = asyncHandler(async (req, res) => {
  let { name, email, rollNumber, course, phone, password, classIds } = req.body;

  if (!name || !name.trim()) {
    throw new AppError('Name is required', 400);
  }

  if (!rollNumber || !rollNumber.toString().trim()) {
    const students = await User.find({ role: 'student' }).select('rollNumber').lean();
    let highest = 2421216;
    students.forEach((s) => {
      if (s.rollNumber) {
        const parsed = parseInt(s.rollNumber.replace(/\D/g, ''), 10);
        if (!isNaN(parsed) && parsed > highest) {
          highest = parsed;
        }
      }
    });
    rollNumber = String(highest + 1);
  } else {
    rollNumber = rollNumber.toString().toUpperCase().trim();
  }

  const existingRoll = await User.findOne({
    role: 'student',
    rollNumber,
  });
  if (existingRoll) {
    throw new AppError('A student with this roll number already exists', 409);
  }

  if (!email || !email.trim()) {
    let clean = name
      .toLowerCase()
      .replace(/^(dr\.|prof\.|mr\.|ms\.|mrs\.|er\.)\s+/i, '')
      .trim()
      .replace(/[^a-z0-9]+/g, '.')
      .replace(/^\.+|\.+$/g, '');
    if (!clean) clean = 'student';
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
  const student = await User.create({
    name: name.trim(),
    email,
    password: activePassword,
    initialPassword: activePassword,
    role: 'student',
    rollNumber,
    course: course ? course.trim() : 'IT',
    phone: phone ? phone.trim() : '',
  });

  if (Array.isArray(classIds) && classIds.length > 0) {
    await Class.updateMany(
      { _id: { $in: classIds } },
      { $addToSet: { enrolledStudents: student._id } }
    );
  }

  const studentObj = student.toJSON();

  res.status(201).json({
    success: true,
    message: 'Student account created successfully',
    data: { student: studentObj },
  });
});

export const updateStudent = asyncHandler(async (req, res) => {
  const student = await User.findById(req.params.id);

  if (!student || student.role !== 'student') {
    throw new AppError('Student not found', 404);
  }

  const { name, email, rollNumber, phone, course, password, classIds } = req.body;

  if (email && email.toLowerCase().trim() !== student.email) {
    const existing = await User.findOne({
      email: email.toLowerCase().trim(),
      _id: { $ne: student._id },
    });
    if (existing) {
      throw new AppError('Email is already taken by another user', 409);
    }
    student.email = email.toLowerCase().trim();
  }

  if (rollNumber && rollNumber.toUpperCase().trim() !== student.rollNumber) {
    const existingRoll = await User.findOne({
      role: 'student',
      rollNumber: rollNumber.toUpperCase().trim(),
      _id: { $ne: student._id },
    });
    if (existingRoll) {
      throw new AppError('Roll number already taken', 409);
    }
    student.rollNumber = rollNumber.toUpperCase().trim();
  }

  if (name) student.name = name.trim();
  if (course) student.course = course.trim();
  if (phone !== undefined) student.phone = phone.trim();
  if (password && password.trim().length >= 6) {
    student.password = password.trim();
    student.initialPassword = password.trim();
  }

  await student.save();

  if (Array.isArray(classIds)) {
    const teacherClasses = await Class.find({ teacherId: req.user._id });
    for (const c of teacherClasses) {
      const shouldBeEnrolled = classIds.includes(c._id.toString());
      const isEnrolled = c.enrolledStudents.some((id) => id.equals(student._id));
      if (shouldBeEnrolled && !isEnrolled) {
        c.enrolledStudents.push(student._id);
        await c.save();
      } else if (!shouldBeEnrolled && isEnrolled) {
        c.enrolledStudents = c.enrolledStudents.filter((id) => !id.equals(student._id));
        await c.save();
      }
    }
  }

  res.json({
    success: true,
    message: 'Student information updated successfully',
    data: { student: student.toJSON() },
  });
});

export const deleteStudent = asyncHandler(async (req, res) => {
  const student = await User.findById(req.params.id);

  if (!student || student.role !== 'student') {
    throw new AppError('Student not found', 404);
  }

  await Class.updateMany(
    { enrolledStudents: student._id },
    { $pull: { enrolledStudents: student._id } }
  );

  await Attendance.deleteMany({ studentId: student._id });
  await Submission.deleteMany({ studentId: student._id });

  await User.findByIdAndDelete(student._id);

  res.json({
    success: true,
    message: 'Student account and related records deleted successfully',
    data: null,
  });
});
