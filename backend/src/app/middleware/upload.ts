import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = 'uploads/avatars';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `avatar-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées'));
  }
};

export const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});

// ─── Upload logo école ──────────────────────────────────────────────────────
const ecoleLogoDir = 'uploads/ecoles';
if (!fs.existsSync(ecoleLogoDir)) {
  fs.mkdirSync(ecoleLogoDir, { recursive: true });
}

const ecoleLogoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, ecoleLogoDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `logo-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

export const uploadEcoleLogo = multer({
  storage: ecoleLogoStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});