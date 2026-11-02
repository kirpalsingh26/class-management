import Class from '../models/Class.js';
import User from '../models/User.js';
import Work from '../models/Work.js';
import Submission from '../models/Submission.js';
import Attendance from '../models/Attendance.js';
import Announcement from '../models/Announcement.js';
import { asyncHandler } from '../utils/errorHandler.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  if (req.user.role === 'teacher' || req.user.role === 'admin') {
    const teacherId = req.user._id;

    const classes = await Class.find({ teacherId }).lean();
    const classIds = classes.map((c) => c._id);

    const uniqueStudentIds = new Set();
    classes.forEach((c) => {
      c.enrolledStudents?.forEach((id) => uniqueStudentIds.add(id.toString()));
    });

    const works = await Work.find({ teacherId }).populate('classIds', 'name code').lean();
    const workIds = works.map((w) => w._id);

    const submissions = await Submission.find({ workId: { $in: workIds } })
      .populate('studentId', 'name rollNumber email')
      .populate('workId', 'title type maxMarks')
      .sort({ submittedAt: -1 })
      .lean();

    const pendingGradingCount = submissions.filter((s) => s.status === 'submitted').length;

    const recentAnnouncements = await Announcement.find({ teacherId })
      .populate('classIds', 'name code')
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    return res.json({
      success: true,
      data: {
        role: 'teacher',
        summary: {
          totalClasses: classes.length,
          totalStudents: uniqueStudentIds.size,
          totalWorks: works.length,
          pendingGrading: pendingGradingCount,
        },
        classes: classes.map((c) => ({
          _id: c._id,
          name: c.name,
          code: c.code,
          subject: c.subject,
          studentCount: c.enrolledStudents?.length || 0,
        })),
        recentSubmissions: submissions.slice(0, 5),
        recentAnnouncements,
      },
    });
  }

  const studentId = req.user._id;

  const enrolledClasses = await Class.find({ enrolledStudents: studentId })
    .populate('teacherId', 'name email')
    .lean();

  const classIds = enrolledClasses.map((c) => c._id);

  const attendanceRecords = await Attendance.find({
    studentId,
    classId: { $in: classIds },
  }).lean();

  const classAttendanceMap = {};
  enrolledClasses.forEach((cls) => {
    classAttendanceMap[cls._id.toString()] = {
      _id: cls._id,
      name: cls.name,
      code: cls.code,
      subject: cls.subject,
      teacher: cls.teacherId?.name || 'Teacher',
      total: 0,
      present: 0,
      absent: 0,
      percentage: 100,
    };
  });

  attendanceRecords.forEach((rec) => {
    const cid = rec.classId.toString();
    if (classAttendanceMap[cid]) {
      classAttendanceMap[cid].total += 1;
      if (rec.status === 'present') classAttendanceMap[cid].present += 1;
      else if (rec.status === 'absent') classAttendanceMap[cid].absent += 1;
    }
  });

  let totalHeld = 0;
  let totalPresent = 0;
  let totalAbsent = 0;

  Object.values(classAttendanceMap).forEach((cls) => {
    totalHeld += cls.total;
    totalPresent += cls.present;
    totalAbsent += cls.absent;
    cls.percentage = cls.total > 0 ? Math.round((cls.present / cls.total) * 100) : 100;
  });

  const overallPercentage =
    totalHeld > 0 ? Math.round((totalPresent / totalHeld) * 100) : 100;

  const allWorks = await Work.find({ classIds: { $in: classIds } })
    .populate('classIds', 'name code subject')
    .populate('teacherId', 'name')
    .sort({ dueDate: 1, createdAt: -1 })
    .lean();

  const mySubmissions = await Submission.find({
    workId: { $in: allWorks.map((w) => w._id) },
    studentId,
  }).lean();

  const subMap = new Map();
  mySubmissions.forEach((sub) => {
    subMap.set(sub.workId.toString(), sub);
  });

  const worksWithSubStatus = allWorks.map((w) => {
    const sub = subMap.get(w._id.toString());
    return {
      ...w,
      submissionStatus: sub ? sub.status : 'pending',
      marks: sub?.marks,
      feedback: sub?.feedback,
    };
  });

  const upcomingAssignments = worksWithSubStatus
    .filter((w) => w.requiresSubmission && w.submissionStatus === 'pending')
    .slice(0, 5);

  const recentNotesAndWork = worksWithSubStatus
    .filter((w) => w.type === 'notes' || w.type === 'classwork')
    .slice(0, 5);

  const recentAnnouncements = await Announcement.find({ classIds: { $in: classIds } })
    .populate('classIds', 'name code')
    .populate('teacherId', 'name')
    .sort({ createdAt: -1 })
    .limit(4)
    .lean();

  res.json({
    success: true,
    data: {
      role: 'student',
      student: {
        name: req.user.name,
        rollNumber: req.user.rollNumber,
        email: req.user.email,
      },
      attendance: {
        overallPercentage,
        totalHeld,
        totalPresent,
        totalAbsent,
        classes: Object.values(classAttendanceMap),
      },
      enrolledClasses: enrolledClasses.map((c) => ({
        _id: c._id,
        name: c.name,
        code: c.code,
        subject: c.subject,
        teacher: c.teacherId?.name || 'Teacher',
        attendancePercentage: classAttendanceMap[c._id.toString()]?.percentage || 100,
      })),
      upcomingAssignments,
      recentNotesAndWork,
      recentAnnouncements,
      pendingCount: upcomingAssignments.length,
    },
  });
});
