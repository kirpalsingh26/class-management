import Attendance from '../models/Attendance.js';
import Class from '../models/Class.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/errorHandler.js';

export const recordAttendance = asyncHandler(async (req, res) => {
  const { classId, date, records } = req.body;

  if (!classId || !date || !Array.isArray(records)) {
    throw new AppError('Class ID, date, and attendance records are required', 400);
  }

  const classItem = await Class.findById(classId);
  if (!classItem) {
    throw new AppError('Class not found', 404);
  }

  if (!classItem.teacherId.equals(req.user._id) && req.user.role !== 'admin') {
    throw new AppError('You are not authorized to mark attendance for this class', 403);
  }

  const cleanDate = date.trim();

  const operations = records.map((record) => {
    return Attendance.findOneAndUpdate(
      {
        classId,
        studentId: record.studentId,
        date: cleanDate,
      },
      {
        $set: {
          status: record.status,
          markedBy: req.user._id,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      }
    );
  });

  await Promise.all(operations);

  res.json({
    success: true,
    message: `Attendance for ${cleanDate} recorded successfully`,
    data: null,
  });
});

export const getClassAttendance = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const { date } = req.query;

  const classItem = await Class.findById(classId).populate(
    'enrolledStudents',
    'name email rollNumber'
  );

  if (!classItem) {
    throw new AppError('Class not found', 404);
  }

  if (!classItem.teacherId.equals(req.user._id) && req.user.role !== 'admin') {
    throw new AppError('You are not authorized to view attendance for this class', 403);
  }

  const allRecords = await Attendance.find({ classId }).sort({ date: -1 });
  const datesMap = new Map();

  allRecords.forEach((rec) => {
    if (!datesMap.has(rec.date)) {
      datesMap.set(rec.date, { date: rec.date, present: 0, absent: 0, total: 0 });
    }
    const item = datesMap.get(rec.date);
    item.total += 1;
    if (rec.status === 'present') item.present += 1;
    else if (rec.status === 'absent') item.absent += 1;
  });

  const history = Array.from(datesMap.values()).sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const targetDate = date ? date.trim() : new Date().toISOString().split('T')[0];
  const attendanceRecords = allRecords.filter((r) => r.date === targetDate);
  const statusMap = new Map();
  attendanceRecords.forEach((rec) => {
    statusMap.set(rec.studentId.toString(), rec.status);
  });

  const studentRoster = classItem.enrolledStudents.map((student) => ({
    _id: student._id,
    name: student.name,
    email: student.email,
    rollNumber: student.rollNumber,
    status: statusMap.get(student._id.toString()) || 'present',
    isRecorded: statusMap.has(student._id.toString()),
  }));

  res.json({
    success: true,
    data: {
      date: targetDate,
      classItem: {
        _id: classItem._id,
        name: classItem.name,
        code: classItem.code,
      },
      records: studentRoster,
      history,
    },
  });
});

export const getMyAttendance = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  const classes = await Class.find({ enrolledStudents: studentId }).populate(
    'teacherId',
    'name email'
  );

  const classBreakdown = [];
  let totalAllClasses = 0;
  let totalAllPresent = 0;
  let totalAllAbsent = 0;

  for (const c of classes) {
    const records = await Attendance.find({
      classId: c._id,
      studentId,
    }).sort({ date: -1 });

    const totalHeld = records.length;
    const present = records.filter((r) => r.status === 'present').length;
    const absent = records.filter((r) => r.status === 'absent').length;

    const percentage = totalHeld > 0 ? Math.round((present / totalHeld) * 100) : 100;

    totalAllClasses += totalHeld;
    totalAllPresent += present;
    totalAllAbsent += absent;

    classBreakdown.push({
      _id: c._id,
      classId: c._id,
      name: c.name,
      className: c.name,
      code: c.code,
      classCode: c.code,
      subject: c.subject,
      teacher: c.teacherId?.name || 'Instructor',
      teacherName: c.teacherId?.name || 'Instructor',
      totalHeld,
      present,
      absent,
      percentage,
      records,
    });
  }

  const overallPercentage =
    totalAllClasses > 0 ? Math.round((totalAllPresent / totalAllClasses) * 100) : 100;

  res.json({
    success: true,
    data: {
      overall: {
        totalHeld: totalAllClasses,
        present: totalAllPresent,
        absent: totalAllAbsent,
        percentage: overallPercentage,
      },
      classes: classBreakdown,
    },
  });
});
