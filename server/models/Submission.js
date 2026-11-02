import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    workId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Work',
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    responseText: {
      type: String,
      trim: true,
      default: '',
    },
    attachment: {
      originalName: { type: String },
      fileName: { type: String },
      mimeType: { type: String },
      size: { type: Number },
      path: { type: String },
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['submitted', 'graded'],
      default: 'submitted',
    },
    marks: {
      type: Number,
    },
    feedback: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

submissionSchema.index({ workId: 1, studentId: 1 }, { unique: true });

const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;

