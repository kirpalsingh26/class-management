import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import AppError from '../utils/AppError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadBaseDir = path.join(__dirname, '../uploads');
const workDir = path.join(uploadBaseDir, 'work');
const submissionsDir = path.join(uploadBaseDir, 'submissions');

[uploadBaseDir, workDir, submissionsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = (subFolder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const dest = subFolder === 'submissions' ? submissionsDir : workDir;
      cb(null, dest);
    },
    filename: (req, file, cb) => {
      const safeName = file.originalname
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .toLowerCase();
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
      cb(null, `${uniqueSuffix}-${safeName}`);
    },
  });

const fileFilter = (req, file, cb) => {
  const allowedExtensions = [
    '.pdf',
    '.doc',
    '.docx',
    '.ppt',
    '.pptx',
    '.txt',
    '.png',
    '.jpg',
    '.jpeg',
    '.webp',
  ];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `File type ${ext} not allowed. Permitted: PDF, DOCX, PPTX, TXT, images.`,
        400
      ),
      false
    );
  }
};

export const uploadWorkAttachment = multer({
  storage: storage('work'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
}).single('file');

export const uploadSubmissionAttachment = multer({
  storage: storage('submissions'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
}).single('file');

