import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

const uploadsDir = path.join(process.cwd(), 'uploads', 'clinic-faxes');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const clinicId = req.params.clinicId || 'unknown';
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(file.originalname);
    const filename = `clinic-${clinicId}-fax-${timestamp}-${randomString}${extension}`;
    cb(null, filename);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow PDF, Word, Excel, Images, and Text files for faxes
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
    'text/csv'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: PDF, Word, Excel, Images, Text files. Received: ${file.mimetype}`));
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 1 } // 10MB limit, single file
});

export const getFilePath = (filename: string): string => {
  return `/uploads/clinic-faxes/${filename}`;
};

export const getFullFilePath = (filename: string): string => {
  return path.join(uploadsDir, filename);
};

export const deleteFile = (filename: string): boolean => {
  try {
    const fullPath = getFullFilePath(filename);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting fax file:', error);
    return false;
  }
};

export const fileExists = (filename: string): boolean => {
  const fullPath = getFullFilePath(filename);
  return fs.existsSync(fullPath);
};

export const getFileSize = (filename: string): number => {
  try {
    const fullPath = getFullFilePath(filename);
    if (fs.existsSync(fullPath)) {
      return fs.statSync(fullPath).size;
    }
    return 0;
  } catch (error) {
    console.error('Error getting fax file size:', error);
    return 0;
  }
}; 