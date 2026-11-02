import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class ID is required'],
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
      index: true,
    },
    date: {
      type: String,
      required: [true, 'Attendance date (YYYY-MM-DD) is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'],
    },
    status: {
      type: String,
      enum: ['present', 'absent'],
      required: [true, 'Status is required (present or absent)'],
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Teacher reference is required'],
    },
  },
  { timestamps: true }
);

attendanceSchema.index(
  { classId: 1, studentId: 1, date: 1 },
  { unique: true }
);

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;

