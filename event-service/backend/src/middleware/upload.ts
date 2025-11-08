import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { Request } from 'express';
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from '../validators/uploadValidators';

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads', 'temp'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`));
  }
};

// Create multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

// Middleware for single image upload
export const uploadSingleImage = upload.single('image');

// Middleware for multiple images
export const uploadMultipleImages = upload.array('images', 10);

// Error handler for multer errors
export function handleUploadError(error: any, req: Request, res: any, next: any) {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: {
          code: 'FILE_TOO_LARGE',
          message: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
        },
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: {
          code: 'TOO_MANY_FILES',
          message: 'Too many files uploaded',
        },
      });
    }
  }

  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      error: {
        code: 'INVALID_FILE_TYPE',
        message: error.message,
      },
    });
  }

  next(error);
}