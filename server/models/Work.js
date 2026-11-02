import mongoose from 'mongoose';

const workSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    type: {
      type: String,
      enum: ['assignment', 'classwork', 'project', 'notes'],
      default: 'assignment',
    },
    classIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true,
        index: true,
      },
    ],
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    attachment: {
      originalName: { type: String },
      fileName: { type: String },
      mimeType: { type: String },
      size: { type: Number },
      path: { type: String },
    },
    dueDate: {
      type: Date,
    },
    requiresSubmission: {
      type: Boolean,
      default: true,
    },
    maxMarks: {
      type: Number,
      default: 100,
    },
  },
  { timestamps: true }
);

const Work = mongoose.model('Work', workSchema);
export default Work;

