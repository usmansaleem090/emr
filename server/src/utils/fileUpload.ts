import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads', 'clinic-documents');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Generate unique filename: clinic-{clinicId}-{timestamp}-{random}.{ext}
    const clinicId = req.params.clinicId || 'unknown';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const ext = path.extname(file.originalname);
    const filename = `clinic-${clinicId}-${timestamp}-${random}${ext}`;
    cb(null, filename);
  }
});

// File filter to allow only certain file types
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, Word, Excel, images, and text files are allowed.'));
  }
};

// Configure multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1 // Only one file at a time
  }
});

// Configure multer for task attachments (multiple files)
export const taskUpload = multer({
  storage: multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
      const taskUploadsDir = path.join(process.cwd(), 'uploads', 'task-attachments');
      if (!fs.existsSync(taskUploadsDir)) {
        fs.mkdirSync(taskUploadsDir, { recursive: true });
      }
      cb(null, taskUploadsDir);
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
      // Generate unique filename: task-{timestamp}-{random}.{ext}
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 15);
      const ext = path.extname(file.originalname);
      const filename = `task-${timestamp}-${random}${ext}`;
      cb(null, filename);
    }
  }),
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Allow up to 10 files
  }
});

// Function to get file path relative to uploads directory
export const getFilePath = (filename: string): string => {
  return path.join('uploads', 'clinic-documents', filename);
};

// Function to get task file path relative to uploads directory
export const getTaskFilePath = (filename: string): string => {
  return path.join('uploads', 'task-attachments', filename);
};

// Function to get full file path
export const getFullFilePath = (filename: string): string => {
  return path.join(uploadsDir, filename);
};

// Function to get full task file path
export const getFullTaskFilePath = (filename: string): string => {
  const taskUploadsDir = path.join(process.cwd(), 'uploads', 'task-attachments');
  return path.join(taskUploadsDir, filename);
};

// Function to delete file
export const deleteFile = (filename: string): boolean => {
  try {
    const fullPath = getFullFilePath(filename);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Function to check if file exists
export const fileExists = (filename: string): boolean => {
  const fullPath = getFullFilePath(filename);
  return fs.existsSync(fullPath);
};

// Function to get file size
export const getFileSize = (filename: string): number => {
  try {
    const fullPath = getFullFilePath(filename);
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      return stats.size;
    }
    return 0;
  } catch (error) {
    console.error('Error getting file size:', error);
    return 0;
  }
}; 